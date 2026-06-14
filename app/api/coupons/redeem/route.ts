import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { coupons, couponRedemptions, users, cashTransactions } from '@/src/db/schema';
import { getVerifiedUser, ensureSeeded } from '@/src/lib/auth-server';
import { eq, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await ensureSeeded();
    const user = await getVerifiedUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Usuário não autenticado. Faça login para resgatar.' }, { status: 401 });
    }

    const body = await req.json();
    const { code } = body;

    if (!code || !code.trim()) {
      return NextResponse.json({ success: false, error: 'Informe o código do cupom.' }, { status: 400 });
    }

    const normalizedCode = code.trim().toUpperCase();

    // 1. Fetch Coupon
    const matched = await db.select().from(coupons).where(eq(coupons.code, normalizedCode)).limit(1);
    if (matched.length === 0) {
      return NextResponse.json({ success: false, error: 'Código de cupom inválido.' }, { status: 404 });
    }

    const coupon = matched[0];

    // 2. Validate Active / Limits
    if (!coupon.isActive) {
      return NextResponse.json({ success: false, error: 'Este cupom não está mais ativo.' }, { status: 400 });
    }

    if (coupon.limitUse !== null && coupon.usedCount >= coupon.limitUse) {
      return NextResponse.json({ success: false, error: 'O limite total de utilizações deste cupom foi esgotado.' }, { status: 400 });
    }

    // 3. Double-claim Check (Check if user already redeemed this coupon)
    const alreadyRedeemed = await db.select()
      .from(couponRedemptions)
      .where(and(
        eq(couponRedemptions.userId, user.id),
        eq(couponRedemptions.couponId, coupon.id)
      ))
      .limit(1);

    if (alreadyRedeemed.length > 0) {
      return NextResponse.json({ success: false, error: 'Você já resgatou este cupom anteriormente nesta conta.' }, { status: 400 });
    }

    // 4. Record coupon usage and rewarding
    // Use transaction pattern to ensure reliability
    await db.transaction(async (tx) => {
      // Create user coupon claim row
      await tx.insert(couponRedemptions).values({
        userId: user.id,
        couponId: coupon.id
      });

      // Increment usedCount
      await tx.update(coupons)
        .set({ usedCount: coupon.usedCount + 1 })
        .where(eq(coupons.id, coupon.id));

      // Award CASH balance to user
      await tx.update(users)
        .set({ cashBalance: user.cashBalance + coupon.value })
        .where(eq(users.uid, user.uid));

      // Record Cash Transaction
      await tx.insert(cashTransactions).values({
        userId: user.id,
        amount: 0,
        status: 'Pago',
        provider: 'Voucher',
        externalId: `coupon_${coupon.code}_${Date.now()}`
      });
    });

    return NextResponse.json({
      success: true,
      message: `Cupom [${coupon.code}] ativado com sucesso! +${coupon.value.toLocaleString('pt-BR')} CASH adicionados.`,
      newCashBalance: user.cashBalance + coupon.value
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

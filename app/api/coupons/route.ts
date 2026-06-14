import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { coupons, adminLogs } from '@/src/db/schema';
import { getVerifiedUser, isStaff, ensureSeeded } from '@/src/lib/auth-server';
import { desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await ensureSeeded();
    const user = await getVerifiedUser(req);
    // Allow GMs/Admins to view coupon lists
    if (!user || !isStaff(user.role)) {
      return NextResponse.json({ success: false, error: 'Acesso negado.' }, { status: 403 });
    }

    const list = await db.select().from(coupons).orderBy(desc(coupons.createdAt));
    return NextResponse.json({ success: true, coupons: list });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureSeeded();
    const user = await getVerifiedUser(req);
    if (!user || !isStaff(user.role)) {
      return NextResponse.json({ success: false, error: 'Acesso não autorizado.' }, { status: 403 });
    }

    const body = await req.json();
    const { code, value, limitUse } = body;

    if (!code || !value) {
      return NextResponse.json({ success: false, error: 'Código e Valor são campos obrigatórios.' }, { status: 400 });
    }

    const normalizedCode = code.trim().toUpperCase();
    const cashValue = parseInt(value);
    const limit = parseInt(limitUse) || 100;

    if (isNaN(cashValue) || cashValue <= 0) {
      return NextResponse.json({ success: false, error: 'Valor do cupom deve ser maior que zero.' }, { status: 400 });
    }

    await db.insert(coupons).values({
      code: normalizedCode,
      value: cashValue,
      limitUse: limit,
      usedCount: 0,
      isActive: true
    });

    // Logging
    await db.insert(adminLogs).values({
      userUid: user.uid,
      action: 'CREATE_COUPON',
      details: `Criou o cupom: ${normalizedCode} de ${cashValue} CASH`
    });

    return NextResponse.json({ 
      success: true, 
      message: `Cupom [${normalizedCode}] de ${cashValue.toLocaleString('pt-BR')} CASH gerado com limite de ${limit} usos!` 
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

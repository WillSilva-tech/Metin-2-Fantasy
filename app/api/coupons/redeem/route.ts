import { NextRequest, NextResponse } from 'next/server';
import { redeemMysqlCoupon, verifyAccountSession } from '@/src/lib/metin2-mysql';
import { logApiError, publicError, rateLimit } from '@/src/lib/api-security';

export const dynamic = 'force-dynamic';

const vouchersList: Record<string, number> = {
  FANTASYNEW: 5000,
  MAGMABOSS: 15000,
  SORTE50: 50000,
  GMGIFT: 100000,
};

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, 'coupons.redeem', 8, 60_000);
  if (limited) return limited;

  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null;
    const session = verifyAccountSession(token);

    if (!session) {
      return NextResponse.json({ success: false, error: 'Sessao invalida. Faca login novamente.' }, { status: 401 });
    }

    const { code } = await req.json();
    const normalizedCode = String(code || '').trim().toUpperCase();

    if (!normalizedCode) {
      return NextResponse.json({ success: false, error: 'Informe o codigo do cupom.' }, { status: 400 });
    }

    const prize = vouchersList[normalizedCode];
    if (!prize) {
      return NextResponse.json({ success: false, error: 'Codigo de cupom invalido.' }, { status: 404 });
    }

    const newCashBalance = await redeemMysqlCoupon(session.login, normalizedCode, prize);

    return NextResponse.json({
      success: true,
      message: `Cupom [${normalizedCode}] ativado com sucesso! +${prize.toLocaleString('pt-BR')} CASH adicionados.`,
      addedCash: prize,
      newCashBalance,
    });
  } catch (err: any) {
    logApiError('coupons.redeem', err);
    const message = err?.code === 'ER_DUP_ENTRY'
      ? 'Voce ja resgatou este cupom nesta conta.'
      : 'Nao foi possivel resgatar este cupom agora.';
    return publicError(message, 400);
  }
}

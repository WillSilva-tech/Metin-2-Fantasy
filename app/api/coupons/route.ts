import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const vouchersList = [
  { code: 'FANTASYNEW', value: 5000, source: 'web-coupon' },
  { code: 'MAGMABOSS', value: 15000, source: 'web-coupon' },
  { code: 'SORTE50', value: 50000, source: 'web-coupon' },
  { code: 'GMGIFT', value: 100000, source: 'web-coupon' },
];

export async function GET() {
  return NextResponse.json({ success: true, coupons: vouchersList });
}

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: 'Criacao de cupons pelo painel esta temporariamente desativada.',
    },
    { status: 403 }
  );
}

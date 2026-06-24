import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { findCashPackage } from '@/src/lib/cash-packages';
import { verifyAccountSession } from '@/src/lib/metin2-mysql';
import { logApiError, publicError, rateLimit } from '@/src/lib/api-security';

export const dynamic = 'force-dynamic';

function getBaseUrl(req: NextRequest) {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.APP_URL ||
    `${req.nextUrl.protocol}//${req.headers.get('host')}`
  );
}

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;
  return new Stripe(secretKey);
}

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, 'payment.checkout', 10, 60_000);
  if (limited) return limited;

  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null;
    const session = verifyAccountSession(token);

    if (!session) {
      return NextResponse.json({ success: false, error: 'Sessao invalida. Faca login novamente.' }, { status: 401 });
    }

    const stripe = getStripe();
    if (!stripe) {
      return publicError('Checkout indisponivel no momento.', 503);
    }

    const body = await req.json();
    const selectedPackage = findCashPackage(String(body.packageId || ''));

    if (!selectedPackage) {
      return publicError('Pacote de CASH invalido.', 400);
    }

    const baseUrl = getBaseUrl(req);
    const checkout = await stripe.checkout.sessions.create({
      mode: 'payment',
      client_reference_id: session.login,
      customer_creation: 'if_required',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'brl',
            unit_amount: Math.round(selectedPackage.priceBRL * 100),
            product_data: {
              name: `${selectedPackage.cashAmount.toLocaleString('pt-BR')} CASH Fantasy`,
              description: 'Credito digital para a conta Fantasy.',
            },
          },
        },
      ],
      metadata: {
        accountLogin: session.login,
        packageId: selectedPackage.id,
        cashAmount: String(selectedPackage.cashAmount),
      },
      success_url: `${baseUrl}/?checkout=success&session_id={CHECKOUT_SESSION_ID}#loja`,
      cancel_url: `${baseUrl}/?checkout=cancel#loja`,
    });

    if (!checkout.url) {
      return publicError('Nao foi possivel iniciar o checkout.', 502);
    }

    return NextResponse.json({ success: true, url: checkout.url });
  } catch (err) {
    logApiError('payment.checkout', err);
    return publicError('Nao foi possivel iniciar o checkout agora.', 400);
  }
}

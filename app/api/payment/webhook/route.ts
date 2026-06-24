import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { metin2Pool, normalizeLogin } from '@/src/lib/metin2-mysql';
import { logApiError, publicError } from '@/src/lib/api-security';

export const dynamic = 'force-dynamic';

interface WebhookLog {
  timestamp: string;
  level: 'info' | 'warn' | 'success';
  message: string;
  event: string;
}

let tempWebhookLogs: WebhookLog[] = [
  {
    timestamp: new Date(Date.now() - 30000).toISOString(),
    level: 'info',
    message: 'Webhook de pagamentos inicializado.',
    event: 'system.ready',
  },
];

function addLog(level: WebhookLog['level'], message: string, event: string) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    event,
  };
  tempWebhookLogs = [entry, ...tempWebhookLogs].slice(0, 15);
  return entry;
}

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;
  return new Stripe(secretKey);
}

export async function GET() {
  return NextResponse.json({ logs: tempWebhookLogs });
}

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const signature = req.headers.get('stripe-signature');

    if (!stripe || !webhookSecret || !signature) {
      addLog('warn', 'Webhook recusado por configuracao incompleta.', 'system.config');
      return publicError('Webhook recusado.', 400);
    }

    const rawBody = await req.text();
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    if (event.type !== 'checkout.session.completed') {
      addLog('info', `Evento ignorado: ${event.type}.`, event.type);
      return NextResponse.json({ received: true });
    }

    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status !== 'paid') {
      addLog('warn', 'Checkout recebido sem pagamento confirmado.', event.type);
      return NextResponse.json({ received: true });
    }

    const metadata = session.metadata || {};
    const login = metadata.accountLogin ? normalizeLogin(String(metadata.accountLogin)) : '';
    const packageId = String(metadata.packageId || '');
    const cashAmount = Number.parseInt(String(metadata.cashAmount || ''), 10);
    const amountBRL = Number(session.amount_total || 0) / 100;
    const sessionId = String(session.id || '');

    if (!login || !packageId || !sessionId || !Number.isInteger(cashAmount) || cashAmount <= 0) {
      addLog('warn', 'Checkout confirmado com metadados invalidos.', event.type);
      return NextResponse.json({ received: true });
    }

    const connection = await metin2Pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.execute(
        `INSERT INTO web_payment_logs
          (event_id, session_id, login, package_id, amount_brl, cash_amount, date_paid)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [event.id, sessionId, login, packageId, amountBRL, cashAmount]
      );

      const [result]: any = await connection.execute(
        'UPDATE account SET coins = coins + ? WHERE login = ?',
        [cashAmount, login]
      );

      if (result.affectedRows !== 1) {
        throw new Error('Conta nao localizada para credito de pagamento.');
      }

      await connection.commit();
      addLog('success', `Pagamento confirmado para [${login}]. Creditado +${cashAmount.toLocaleString('pt-BR')} CASH.`, event.type);
    } catch (err: any) {
      await connection.rollback();
      if (err?.code === 'ER_DUP_ENTRY') {
        addLog('info', `Webhook duplicado ignorado: ${sessionId}.`, event.type);
        return NextResponse.json({ received: true, duplicate: true });
      }
      throw err;
    } finally {
      connection.release();
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    logApiError('payment.webhook', err);
    return publicError('Webhook recusado.', 400);
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { users, cashTransactions } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { ensureSeeded } from '@/src/lib/auth-server';

export const dynamic = 'force-dynamic';

interface WebhookLog {
  timestamp: string;
  level: 'info' | 'warn' | 'success';
  message: string;
  event: string;
}

// In-memory array for recent simulated webhook logs that persist during runtime
let tempWebhookLogs: WebhookLog[] = [
  {
    timestamp: new Date(Date.now() - 30000).toISOString(),
    level: 'info',
    message: 'Stripe webhook listener initialized. Ready to receive event notifications.',
    event: 'system.ready'
  },
  {
    timestamp: new Date(Date.now() - 15000).toISOString(),
    level: 'success',
    message: 'Simulated Stripe service connection established securely with TLS 1.3.',
    event: 'system.network'
  }
];

export async function GET() {
  return NextResponse.json({ logs: tempWebhookLogs });
}

export async function POST(req: NextRequest) {
  try {
    await ensureSeeded();
    const body = await req.json();
    const eventType = body.type || 'payment_intent.created';
    const amount = body.data?.object?.amount ? body.data.object.amount / 100 : 0;
    const metadata = body.data?.object?.metadata || {};
    
    let message = `Evento recebido: ${eventType}`;
    let level: 'info' | 'warn' | 'success' = 'info';
    
    if (eventType === 'payment_intent.created') {
      message = `Intenção de pagamento criada para ${metadata.accountLogin || 'usuário'}. Total: R$ ${amount.toFixed(2)} via ${metadata.paymentMethod || 'PIX'}.`;
      level = 'info';
    } else if (eventType === 'payment_intent.succeeded') {
      level = 'success';
      const login = metadata.accountLogin;
      const cashAmount = parseInt(metadata.cashAmount) || 0;
      
      if (login) {
        // Look up the active user by login
        const matched = await db.select().from(users).where(eq(users.login, login)).limit(1);
        if (matched.length > 0) {
          const matchedUser = matched[0];
          
          // Atomically update user balance and record transaction history in PostgreSQL
          await db.transaction(async (tx) => {
            await tx.update(users)
              .set({ cashBalance: matchedUser.cashBalance + cashAmount })
              .where(eq(users.id, matchedUser.id));

            await tx.insert(cashTransactions).values({
              userId: matchedUser.id,
              amount: Math.round(amount),
              status: 'Pago',
              provider: 'Stripe',
              externalId: body.data?.object?.id || `str_${Date.now()}`
            });
          });
          
          message = `Sucesso! Pagamento de R$ ${amount.toFixed(2)} confirmado para [${login}]. Creditado +${cashAmount.toLocaleString('pt-BR')} CASH via ${metadata.paymentMethod || 'PIX'} com persistência PostgreSQL!`;
        } else {
          message = `Erro: Usuário do login [${login}] informado pelo webhook não foi localizado no emulador.`;
          level = 'warn';
        }
      } else {
        message = `Aviso: Recebido evento bem-sucedido mas sem 'accountLogin' associado nos metadados.`;
        level = 'warn';
      }
    }

    const newLog: WebhookLog = {
      timestamp: new Date().toISOString(),
      level,
      message,
      event: eventType
    };

    // Add to logs trace
    tempWebhookLogs = [newLog, ...tempWebhookLogs].slice(0, 15);

    return NextResponse.json({ success: true, added: newLog });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { findAccountByLogin, getAccountCharacters, verifyAccountSession } from '@/src/lib/metin2-mysql';
import { logApiError, publicError, rateLimit } from '@/src/lib/api-security';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const limited = rateLimit(req, 'auth.characters', 30, 60_000);
  if (limited) return limited;

  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null;
    const session = verifyAccountSession(token);

    if (!session) {
      return NextResponse.json({ success: false, error: 'Sessao invalida. Faca login novamente.' }, { status: 401 });
    }

    const account = await findAccountByLogin(session.login);
    if (!account) {
      return NextResponse.json({ success: false, error: 'Conta nao encontrada.' }, { status: 404 });
    }

    const characters = await getAccountCharacters(account.id);
    return NextResponse.json({ success: true, characters });
  } catch (err) {
    logApiError('auth.characters', err);
    return publicError('Nao foi possivel carregar os personagens agora.', 400);
  }
}

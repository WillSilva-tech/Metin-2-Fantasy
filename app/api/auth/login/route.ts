import { NextRequest, NextResponse } from 'next/server';
import {
  assertValidLogin,
  assertValidPassword,
  normalizeLogin,
  signAccountSession,
  getAccountCharacters,
  verifyAccountPassword,
} from '@/src/lib/metin2-mysql';
import { logApiError, publicError, rateLimit } from '@/src/lib/api-security';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, 'auth.login', 8, 60_000);
  if (limited) return limited;

  try {
    const { login, password } = await req.json();

    if (!login || !password) {
      return NextResponse.json({ success: false, error: 'Login e senha sao obrigatorios.' }, { status: 400 });
    }

    const normalizedLogin = normalizeLogin(login);
    assertValidLogin(normalizedLogin);
    assertValidPassword(password);

    const account = await verifyAccountPassword(normalizedLogin, password);
    if (!account) {
      return NextResponse.json({ success: false, error: 'Login ou senha incorretos.' }, { status: 401 });
    }

    if (account.status && account.status !== 'OK') {
      return NextResponse.json({ success: false, error: 'Esta conta esta bloqueada ou suspensa.' }, { status: 403 });
    }

    const characters = await getAccountCharacters(account.id);

    return NextResponse.json({
      success: true,
      message: 'Login autenticado com sucesso.',
      user: {
        login: account.login,
        email: account.email,
        cashBalance: account.coins,
        role: 'PLAYER',
        isVip: account.coins > 100000,
        isGM: false,
        sessionToken: signAccountSession(account.login),
        characters,
      },
      isAdmin: false,
    });
  } catch (err) {
    logApiError('auth.login', err);
    return publicError('Nao foi possivel autenticar agora. Tente novamente em instantes.', 400);
  }
}

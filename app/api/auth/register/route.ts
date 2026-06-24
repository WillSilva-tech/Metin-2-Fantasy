import { NextRequest, NextResponse } from 'next/server';
import {
  assertValidLogin,
  assertValidPassword,
  createAccount,
  findAccountByLogin,
  getAccountCharacters,
  normalizeLogin,
  signAccountSession,
} from '@/src/lib/metin2-mysql';
import { logApiError, publicError, rateLimit } from '@/src/lib/api-security';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, 'auth.register', 5, 60_000);
  if (limited) return limited;

  try {
    const { login, name, email, password, confirmPassword, charDeleteCode } = await req.json();

    if (!login || !email || !password || !confirmPassword || !charDeleteCode) {
      return NextResponse.json({ success: false, error: 'Todos os campos obrigatorios devem ser preenchidos.' }, { status: 400 });
    }

    const normalizedLogin = normalizeLogin(login);
    assertValidLogin(normalizedLogin);
    assertValidPassword(password);

    if (password !== confirmPassword) {
      return NextResponse.json({ success: false, error: 'As senhas nao coincidem.' }, { status: 400 });
    }

    if (!/^[0-9]{7}$/.test(charDeleteCode)) {
      return NextResponse.json({ success: false, error: 'O Codigo de Exclusao de Personagem deve conter exatamente 7 numeros.' }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 64) {
      return NextResponse.json({ success: false, error: 'E-mail invalido.' }, { status: 400 });
    }

    const existing = await findAccountByLogin(normalizedLogin);
    if (existing) {
      return NextResponse.json({ success: false, error: 'Este login ja esta cadastrado.' }, { status: 409 });
    }

    const account = await createAccount({
      login: normalizedLogin,
      password,
      email: email.trim(),
      socialId: charDeleteCode,
    });

    if (!account) {
      throw new Error('Conta criada, mas nao foi possivel recarregar o perfil.');
    }

    const characters = await getAccountCharacters(account.id);

    return NextResponse.json({
      success: true,
      message: 'Conta criada com sucesso.',
      user: {
        login: account.login,
        name: name || account.login,
        email: account.email,
        cashBalance: account.coins,
        role: 'PLAYER',
        isVip: false,
        isGM: false,
        sessionToken: signAccountSession(account.login),
        characters,
      },
    });
  } catch (err) {
    logApiError('auth.register', err);
    return publicError('Nao foi possivel concluir o cadastro agora. Tente novamente em instantes.', 400);
  }
}

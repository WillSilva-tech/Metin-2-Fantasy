import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { users, characters } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { ensureSeeded } from '@/src/lib/auth-server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await ensureSeeded();
    const { login, name, email, password, confirmPassword, charDeleteCode } = await req.json();

    if (!login || !login.trim()) {
      return NextResponse.json({ success: false, error: 'O login do usuário é obrigatório.' }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ success: false, error: 'As senhas não coincidem.' }, { status: 400 });
    }

    if (!charDeleteCode || charDeleteCode.length !== 7) {
      return NextResponse.json({ success: false, error: 'O Código de Exclusão de Personagem deve conter exatamente 7 números.' }, { status: 400 });
    }

    const normalizedLogin = login.trim().toLowerCase();

    // Check pre-existing
    const matched = await db.select().from(users).where(eq(users.login, normalizedLogin)).limit(1);
    if (matched.length > 0) {
      return NextResponse.json({ success: false, error: 'Este nome de usuário já está sendo utilizado por outro herói.' }, { status: 400 });
    }

    // Insert user
    const [newUser] = await db.insert(users).values({
      uid: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: email?.trim() || `${normalizedLogin}@fantasy2.com.br`,
      login: normalizedLogin,
      role: 'PLAYER',
      cashBalance: 0
    }).returning();

    // Insert starting characters for new user in DB
    await db.insert(characters).values([
      { userId: newUser.id, nick: `${login}⚔️`, kingdom: 'Shinsoo', className: 'Guerreiro', level: 1, rank: 11 },
      { userId: newUser.id, nick: `${login}🔮`, kingdom: 'Chunjo', className: 'Shaman', level: 1, rank: 12 }
    ]);

    const mappedChars = [
      { name: `${login}⚔️`, kingdom: 'Shinsoo', classType: 'Guerreiro', level: 1 },
      { name: `${login}🔮`, kingdom: 'Chunjo', classType: 'Shaman', level: 1 }
    ];

    return NextResponse.json({
      success: true,
      message: 'Sua conta foi provisionada e autenticada com sucesso no PostgreSQL!',
      user: {
        id: newUser.id,
        uid: newUser.uid,
        login: newUser.login,
        name: name || `${login} Imperial`,
        email: newUser.email,
        cashBalance: 0,
        isVip: false,
        isGM: false,
        characters: mappedChars
      }
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

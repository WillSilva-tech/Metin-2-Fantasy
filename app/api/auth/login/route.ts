import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { users, characters } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { ensureSeeded } from '@/src/lib/auth-server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await ensureSeeded();
    const { login, password } = await req.json();

    if (!login || !login.trim()) {
      return NextResponse.json({ success: false, error: 'Digite seu nome de usuário (login).' }, { status: 400 });
    }

    const normalizedLogin = login.trim().toLowerCase();

    // 1. Check if user already exists in PostgreSQL
    let matchedUser = await db.select().from(users).where(eq(users.login, normalizedLogin)).limit(1);
    let userObj;

    if (matchedUser.length > 0) {
      userObj = matchedUser[0];
    } else {
      // 2. Auto-provision new user on first sign-in
      const isGM = false;
      const role = 'PLAYER';
      const initialCash = 5000;

      const [newUser] = await db.insert(users).values({
        uid: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        email: `${normalizedLogin}@fantasy2.com.br`,
        login: normalizedLogin,
        role: role,
        cashBalance: initialCash
      }).returning();

      userObj = newUser;

      // Create default characters in database for them
      if (isGM) {
        await db.insert(characters).values([
          { userId: newUser.id, nick: `★GM_${login}☠`, kingdom: 'Jinno', className: 'Shura', level: 120, rank: 1 },
          { userId: newUser.id, nick: `★GM_${login}🔮`, kingdom: 'Chunjo', className: 'Shaman', level: 120, rank: 2 },
          { userId: newUser.id, nick: `★GM_${login}⚡`, kingdom: 'Shinsoo', className: 'Guerreiro', level: 120, rank: 3 }
        ]);
      } else {
        await db.insert(characters).values([
          { userId: newUser.id, nick: `${login}⚔️`, kingdom: 'Shinsoo', className: 'Guerreiro', level: 95, rank: 11 },
          { userId: newUser.id, nick: `${login}💀`, kingdom: 'Jinno', className: 'Shura', level: 82, rank: 12 }
        ]);
      }
    }

    // 3. Query their real characters from PostgreSQL table
    const dbChars = await db.select().from(characters).where(eq(characters.userId, userObj.id));

    // Map DB characters to correct front-end properties
    const mappedChars = dbChars.map(c => ({
      name: c.nick,
      kingdom: c.kingdom,
      classType: c.className,
      level: c.level
    }));

    return NextResponse.json({
      success: true,
      message: 'Acesso autenticado no emulador via banco de dados!',
      user: {
        id: userObj.id,
        uid: userObj.uid,
        login: userObj.login,
        name: userObj.role === 'ADMIN' ? 'Imperador do Reino (GM/Dev)' : `${login} da Forja`,
        email: userObj.email,
        cashBalance: userObj.cashBalance,
        isVip: userObj.role === 'ADMIN' || userObj.cashBalance > 100000,
        isGM: userObj.role === 'ADMIN',
        role: userObj.role,
        characters: mappedChars.length > 0 ? mappedChars : [
          { name: `${login}⚔️`, kingdom: 'Shinsoo', classType: 'Guerreiro', level: 95 }
        ]
      },
      isAdmin: userObj.role === 'ADMIN'
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

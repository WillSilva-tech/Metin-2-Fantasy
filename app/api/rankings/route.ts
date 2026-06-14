import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { characters, guilds } from '@/src/db/schema';
import { ensureSeeded } from '@/src/lib/auth-server';
import { asc, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await ensureSeeded();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'all';

    if (type === 'players') {
      const dbPlayers = await db.select()
        .from(characters)
        .orderBy(asc(characters.rank))
        .limit(20);
      return NextResponse.json({ success: true, players: dbPlayers });
    }

    if (type === 'guilds') {
      const dbGuilds = await db.select()
        .from(guilds)
        .orderBy(asc(guilds.rank))
        .limit(20);
      return NextResponse.json({ success: true, guilds: dbGuilds });
    }

    // Default: Return both
    const dbPlayers = await db.select()
      .from(characters)
      .orderBy(asc(characters.rank))
      .limit(10);

    const dbGuilds = await db.select()
      .from(guilds)
      .orderBy(asc(guilds.rank))
      .limit(10);

    return NextResponse.json({ 
      success: true, 
      players: dbPlayers,
      guilds: dbGuilds
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

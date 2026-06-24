import { NextRequest, NextResponse } from 'next/server';
import { classNameFromJob, kingdomFromEmpire, metin2PlayerPool } from '@/src/lib/metin2-mysql';
import { logApiError, publicError, rateLimit } from '@/src/lib/api-security';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const limited = rateLimit(req, 'rankings', 60, 60_000);
  if (limited) return limited;

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'all';

    if (type === 'guilds') {
      const [guildRows] = await metin2PlayerPool.execute<any[]>(
        'SELECT name, master AS leaderNick, level, ladder_point AS points FROM guild ORDER BY level DESC, ladder_point DESC LIMIT 20'
      );

      return NextResponse.json({
        success: true,
        guilds: guildRows.map((guild, index) => ({
          id: index + 1,
          rank: index + 1,
          name: guild.name,
          leaderNick: guild.leaderNick || 'Desconhecido',
          level: Number(guild.level || 1),
          kingdom: 'N/A',
          points: Number(guild.points || 0),
        })),
      });
    }

    const [playerRows] = await metin2PlayerPool.execute<any[]>(
      `SELECT p.name AS nick, p.level, p.job, p.playtime AS playedTime, COALESCE(pi.empire, 1) AS empire
       FROM player p
       LEFT JOIN player_index pi ON pi.id = p.account_id
       WHERE p.name NOT LIKE "[%]%"
       ORDER BY p.level DESC, p.exp DESC
       LIMIT 20`
    );

    const players = playerRows.map((player, index) => ({
      id: index + 1,
      rank: index + 1,
      nick: player.nick,
      level: Number(player.level || 1),
      kingdom: kingdomFromEmpire(Number(player.empire || 1)),
      className: classNameFromJob(Number(player.job || 0)),
      playedTime: `${Math.floor(Number(player.playedTime || 0) / 60)}h`,
    }));

    if (type === 'players') {
      return NextResponse.json({ success: true, players });
    }

    return NextResponse.json({ success: true, players, guilds: [] });
  } catch (err) {
    logApiError('rankings', err);
    return publicError('Falha ao carregar o Hall da Fama.', 500);
  }
}

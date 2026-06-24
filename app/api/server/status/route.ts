import { NextRequest, NextResponse } from 'next/server';
import { metin2PlayerPool } from '@/src/lib/metin2-mysql';
import { logApiError, publicError, rateLimit } from '@/src/lib/api-security';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const limited = rateLimit(req, 'server.status', 120, 60_000);
  if (limited) return limited;

  try {
    const [rows] = await metin2PlayerPool.execute<any[]>(
      `SELECT
        (SELECT COUNT(*) FROM player WHERE name NOT LIKE "[%]%") AS totalPlayers,
        (
          SELECT COUNT(*)
          FROM (
            SELECT
              l.who,
              SUBSTRING_INDEX(GROUP_CONCAT(CAST(l.how AS CHAR) ORDER BY l.time DESC), ',', 1) AS lastAction,
              MAX(l.time) AS lastEventAt
            FROM log.log l
            INNER JOIN player p ON p.id = l.who
            WHERE CAST(l.type AS CHAR) = 'CHARACTER'
              AND CAST(l.how AS CHAR) IN ('LOGIN', 'GM_LOGIN', 'LOGOUT')
              AND p.name NOT LIKE "[%]%"
            GROUP BY l.who
          ) latest
          WHERE latest.lastAction IN ('LOGIN', 'GM_LOGIN')
            AND latest.lastEventAt >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        ) AS playersOnline`
    );

    const row = rows[0] || {};

    return NextResponse.json({
      success: true,
      status: 'online',
      playersOnline: Number(row.playersOnline || 0),
      totalPlayers: Number(row.totalPlayers || 0),
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    logApiError('server.status', err);
    return publicError('Nao foi possivel carregar o status do servidor.', 500);
  }
}

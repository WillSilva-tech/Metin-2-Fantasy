import { db } from './index';
import { news, characters, guilds, videos, coupons, events, serverStatus } from './schema';
import { 
  INITIAL_NEWS, 
  TOP_PLAYERS_RANKING, 
  TOP_GUILDS_RANKING, 
  GAME_EVENTS 
} from '../../lib/game-data';

export async function seedDatabase() {
  try {
    console.log('[SEED] Checking database status...');

    // 1. Seed Server Status if missing
    const statusCount = await db.select().from(serverStatus);
    if (statusCount.length === 0) {
      console.log('[SEED] Seeding Server Status...');
      await db.insert(serverStatus).values({
        status: 'online',
        playerCount: 1640
      });
    }

    // 2. Seed News if missing
    const newsCount = await db.select().from(news);
    if (newsCount.length === 0) {
      console.log('[SEED] Seeding CMS News...');
      for (const item of INITIAL_NEWS) {
        await db.insert(news).values({
          category: item.category,
          title: item.title,
          excerpt: item.excerpt,
          content: item.content,
          imageUrl: item.imageUrl,
          date: item.date,
          author: 'GM_Azkiel'
        });
      }
    }

    // 3. Seed Characters if missing
    const charCount = await db.select().from(characters);
    if (charCount.length === 0) {
      console.log('[SEED] Seeding Top Characters Ranking...');
      for (const player of TOP_PLAYERS_RANKING) {
        // Map kingdoms and check classes randomly or based on default naming
        const assumedClass = player.nick.toLowerCase().includes('shaman') ? 'Shaman' :
                             player.nick.toLowerCase().includes('shura') ? 'Shura' :
                             player.nick.toLowerCase().includes('assassin') ? 'Ninja' : 'Guerreiro';
        await db.insert(characters).values({
          nick: player.nick,
          level: player.level,
          kingdom: player.kingdom,
          className: assumedClass,
          playedTime: player.playedTime,
          league: player.level >= 118 ? 'Grand Master I' : player.level >= 115 ? 'Diamante I' : 'Ouro I',
          leagueIcon: player.level >= 118 ? '👑' : player.level >= 115 ? '💎' : '🥇',
          rank: player.rank
        });
      }
    }

    // 4. Seed Guilds if missing
    const guildsCount = await db.select().from(guilds);
    if (guildsCount.length === 0) {
      console.log('[SEED] Seeding Guilds Ranking...');
      for (const guild of TOP_GUILDS_RANKING) {
        await db.insert(guilds).values({
          name: guild.guild,
          leaderNick: guild.leader,
          level: guild.level,
          kingdom: guild.kingdom,
          rank: guild.rank
        });
      }
    }

    // 5. Seed Events if missing
    const eventsCount = await db.select().from(events);
    if (eventsCount.length === 0) {
      console.log('[SEED] Seeding Events Timetable...');
      for (const ev of GAME_EVENTS) {
        await db.insert(events).values({
          id: ev.id,
          title: ev.title,
          time: ev.time,
          days: ev.days.join(', '),
          status: ev.status,
          emoji: ev.emoji || '👉',
          description: ev.description,
          howItWorks: ev.howItWorks || null,
          dynamics: ev.dynamics || null,
          elimination: ev.elimination || null,
          victory: ev.victory || null,
          rewards: ev.rewards || null
        });
      }
    }

    // 6. Seed Videos if missing
    const videosCount = await db.select().from(videos);
    if (videosCount.length === 0) {
      console.log('[SEED] Seeding Trailer Playlist...');
      await db.insert(videos).values({
        id: '8YQubtW_8uA',
        title: 'Trajetória Épica de Abertura',
        subtitle: 'Official Cinematic Teaser',
        description: 'Assista ao trailer oficial de lançamento de FANTASY2. Sinta a fúria das chamas lendárias que moldam os reinos de Shinsoo, Chunjo e Jinno!',
        category: 'server',
        duration: '2:15',
        rarity: 'Lendário',
        author: 'Fantasy2 Studio',
        views: '124K'
      });
      await db.insert(videos).values({
        id: 'xR7bshf6E5M',
        title: 'Showcase de Trajes de Magma',
        subtitle: 'Gameplay Visual Armor Showcase',
        description: 'Confira as vestimentas rúnicas animadas exclusivas disponíveis no nosso grandioso guarda-roupas in-game.',
        category: 'costumes',
        duration: '1:45',
        rarity: 'Épico',
        author: 'Azkiel VFX',
        views: '54K'
      });
      await db.insert(videos).values({
        id: 'P_PSTTbyD8w',
        title: 'Guia Iniciante - Evolução Rápida',
        subtitle: 'Tutorial & Leveling Route',
        description: 'Tudo o que você precisa saber para progredir do nível 1 ao 50 em menos de 8 horas seguindo as missões imperiais corretas.',
        category: 'tutorial',
        duration: '8:30',
        rarity: 'Raro',
        author: 'Freya Mentorship',
        views: '89K'
      });
    }

    // 7. Seed Coupons if missing
    const couponsCount = await db.select().from(coupons);
    if (couponsCount.length === 0) {
      console.log('[SEED] Seeding Promotional Coupons...');
      const promoCodes = [
        { code: 'FANTASYNEW', value: 5000, limit: 1000 },
        { code: 'MAGMABOSS', value: 15000, limit: 500 },
        { code: 'SORTE50', value: 50000, limit: 100 },
        { code: 'GMGIFT', value: 100000, limit: 50 }
      ];
      for (const p of promoCodes) {
        await db.insert(coupons).values({
          code: p.code,
          value: p.value,
          limitUse: p.limit,
          usedCount: 0,
          isActive: true
        });
      }
    }

    console.log('[SEED] Database seeding process completed successfully!');
  } catch (error) {
    console.error('[SEED] Error during seeding:', error);
  }
}

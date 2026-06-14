import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { videos, adminLogs } from '@/src/db/schema';
import { getVerifiedUser, isStaff, ensureSeeded } from '@/src/lib/auth-server';
import { desc, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

function extractYoutubeId(urlOrId: string): string {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = urlOrId.match(regExp);
  return (match && match[2].length === 11) ? match[2] : urlOrId.trim();
}

// 1. GET /api/videos - Retrieve all video playlists from PostgreSQL
export async function GET() {
  try {
    await ensureSeeded();
    const list = await db.select().from(videos).orderBy(desc(videos.createdAt));
    return NextResponse.json({ success: true, videos: list });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// 2. POST /api/videos - Add a new video (GM/Admin Only)
export async function POST(req: NextRequest) {
  try {
    await ensureSeeded();
    const user = await getVerifiedUser(req);
    if (!user || !isStaff(user.role)) {
      return NextResponse.json({ success: false, error: 'Acesso não autorizado ou token inválido.' }, { status: 403 });
    }

    const body = await req.json();
    const { videoUrl, title, subtitle, description, category, duration, rarity } = body;

    if (!videoUrl || !title) {
      return NextResponse.json({ success: false, error: 'Link do vídeo e Título são campos obrigatórios.' }, { status: 400 });
    }

    const videoId = extractYoutubeId(videoUrl);
    if (!videoId || videoId.length < 5) {
      return NextResponse.json({ success: false, error: 'ID ou Link do YouTube inválido.' }, { status: 400 });
    }

    // Check if video already exists
    const existing = await db.select().from(videos).where(eq(videos.id, videoId)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ success: false, error: 'Este vídeo já está cadastrado na playlist.' }, { status: 400 });
    }

    // Insert into PostgreSQL
    await db.insert(videos).values({
      id: videoId,
      title: title.trim(),
      subtitle: subtitle?.trim() || 'Destaque Imperial',
      description: description?.trim() || 'Nenhuma descrição fornecida.',
      category: category || 'server',
      duration: duration || '3:00',
      rarity: rarity || 'Comum',
      author: user.login,
      views: '0'
    });

    // Logging
    await db.insert(adminLogs).values({
      userUid: user.uid,
      action: 'ADD_VIDEO',
      details: `Adicionou o vídeo ID: ${videoId}, Título: ${title}`
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Vídeo postado com sucesso no reino de FANTASY2!' 
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

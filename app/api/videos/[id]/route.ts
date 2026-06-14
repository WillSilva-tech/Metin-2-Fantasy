import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { videos, adminLogs } from '@/src/db/schema';
import { getVerifiedUser, isStaff, ensureSeeded } from '@/src/lib/auth-server';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

function extractYoutubeId(urlOrId: string): string {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = urlOrId.match(regExp);
  return (match && match[2].length === 11) ? match[2] : urlOrId.trim();
}

// 1. PUT /api/videos/[id] - Update video details (GM/Admin Only)
export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await ensureSeeded();
    const { id } = await props.params;
    const user = await getVerifiedUser(req);
    if (!user || !isStaff(user.role)) {
      return NextResponse.json({ success: false, error: 'Acesso não autorizado.' }, { status: 403 });
    }

    const body = await req.json();
    const { videoUrl, title, subtitle, description, category, duration, rarity } = body;

    const existing = await db.select().from(videos).where(eq(videos.id, id)).limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ success: false, error: 'Vídeo não encontrado para edição.' }, { status: 404 });
    }

    const newVideoId = videoUrl ? extractYoutubeId(videoUrl) : id;

    if (newVideoId !== id) {
      // If of a different ID, verify uniqueness
      const alreadyHasNew = await db.select().from(videos).where(eq(videos.id, newVideoId)).limit(1);
      if (alreadyHasNew.length > 0) {
        return NextResponse.json({ success: false, error: 'Novo link do YouTube já cadastrado em outro vídeo.' }, { status: 400 });
      }

      // Delete old and insert new since primary keys cannot be easily updated in some DB drivers
      const current = existing[0];
      await db.delete(videos).where(eq(videos.id, id));
      await db.insert(videos).values({
        id: newVideoId,
        title: title?.trim() || current.title,
        subtitle: subtitle?.trim() || current.subtitle,
        description: description?.trim() || current.description,
        category: category || current.category,
        duration: duration || current.duration,
        rarity: rarity || current.rarity,
        author: current.author,
        views: current.views
      });
    } else {
      // Simple update
      await db.update(videos).set({
        title: title?.trim(),
        subtitle: subtitle?.trim(),
        description: description?.trim(),
        category,
        duration,
        rarity
      }).where(eq(videos.id, id));
    }

    // Logging
    await db.insert(adminLogs).values({
      userUid: user.uid,
      action: 'UPDATE_VIDEO',
      details: `Editou o vídeo ID: ${id} -> Novo ID: ${newVideoId}`
    });

    return NextResponse.json({ success: true, message: 'Vídeo atualizado com sucesso!' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

// 2. DELETE /api/videos/[id] - Remove video from playlist (GM/Admin Only)
export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await ensureSeeded();
    const { id } = await props.params;
    const user = await getVerifiedUser(req);
    if (!user || !isStaff(user.role)) {
      return NextResponse.json({ success: false, error: 'Acesso não autorizado.' }, { status: 403 });
    }

    const existing = await db.select().from(videos).where(eq(videos.id, id)).limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ success: false, error: 'Vídeo não encontrado para exclusão.' }, { status: 404 });
    }

    await db.delete(videos).where(eq(videos.id, id));

    // Logging
    await db.insert(adminLogs).values({
      userUid: user.uid,
      action: 'DELETE_VIDEO',
      details: `Excluiu o vídeo ID: ${id}`
    });

    return NextResponse.json({ success: true, message: 'Vídeo removido da playlist com sucesso!' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

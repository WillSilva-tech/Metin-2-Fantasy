import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { news, adminLogs } from '@/src/db/schema';
import { getVerifiedUser, isStaff, ensureSeeded } from '@/src/lib/auth-server';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// 1. PUT /api/news/[id] - Update a news article (GM/Admin Only)
export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await ensureSeeded();
    const { id } = await props.params;
    const user = await getVerifiedUser(req);
    if (!user || !isStaff(user.role)) {
      return NextResponse.json({ success: false, error: 'Acesso negado.' }, { status: 403 });
    }

    const body = await req.json();
    const { title, excerpt, content, imageUrl, category } = body;

    const newsId = parseInt(id);
    if (isNaN(newsId)) {
      return NextResponse.json({ success: false, error: 'ID inválido.' }, { status: 400 });
    }

    const existing = await db.select().from(news).where(eq(news.id, newsId)).limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ success: false, error: 'Artigo não encontrado.' }, { status: 404 });
    }

    await db.update(news).set({
      title: title?.trim(),
      excerpt: excerpt?.trim(),
      content: content?.trim(),
      imageUrl: imageUrl?.trim(),
      category: category
    }).where(eq(news.id, newsId));

    // Audit Log
    await db.insert(adminLogs).values({
      userUid: user.uid,
      action: 'UPDATE_NEWS',
      details: `Atualizou a notícia ID: ${newsId}`
    });

    return NextResponse.json({ success: true, message: 'Notícia editada com sucesso!' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

// 2. DELETE /api/news/[id] - Delete news article (GM/Admin Only)
export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await ensureSeeded();
    const { id } = await props.params;
    const user = await getVerifiedUser(req);
    if (!user || !isStaff(user.role)) {
      return NextResponse.json({ success: false, error: 'Acesso negado.' }, { status: 403 });
    }

    const newsId = parseInt(id);
    if (isNaN(newsId)) {
      return NextResponse.json({ success: false, error: 'ID inválido.' }, { status: 400 });
    }

    const existing = await db.select().from(news).where(eq(news.id, newsId)).limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ success: false, error: 'Notícia não encontrada.' }, { status: 404 });
    }

    await db.delete(news).where(eq(news.id, newsId));

    // Audit Log
    await db.insert(adminLogs).values({
      userUid: user.uid,
      action: 'DELETE_NEWS',
      details: `Deletou notícia ID: ${newsId}`
    });

    return NextResponse.json({ success: true, message: 'Notícia excluída de forma definitiva.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

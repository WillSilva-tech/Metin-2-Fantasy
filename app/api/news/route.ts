import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { news, adminLogs } from '@/src/db/schema';
import { getVerifiedUser, isStaff, ensureSeeded } from '@/src/lib/auth-server';
import { desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// 1. GET /api/news - List all news articles
export async function GET() {
  try {
    await ensureSeeded();
    const list = await db.select().from(news).orderBy(desc(news.createdAt));
    return NextResponse.json({ success: true, news: list });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// 2. POST /api/news - Create a news article (Staff/GM/Admin Only)
export async function POST(req: NextRequest) {
  try {
    await ensureSeeded();
    const user = await getVerifiedUser(req);
    if (!user || !isStaff(user.role)) {
      return NextResponse.json({ success: false, error: 'Não autorizado.' }, { status: 403 });
    }

    const body = await req.json();
    const { title, excerpt, content, imageUrl, category } = body;

    if (!title || !content) {
      return NextResponse.json({ success: false, error: 'Título e conteúdo são campos obrigatórios.' }, { status: 400 });
    }

    const [newArticle] = await db.insert(news).values({
      title: title.trim(),
      excerpt: excerpt?.trim() || title.substring(0, 100),
      content: content.trim(),
      imageUrl: imageUrl?.trim() || 'https://picsum.photos/seed/fantasy/800/400',
      category: category || 'update',
      author: user.login,
      date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    }).returning();

    // Log the GM audit trail
    await db.insert(adminLogs).values({
      userUid: user.uid,
      action: 'CREATE_NEWS',
      details: `Criou a notícia ID: ${newArticle.id}, Título: ${title}`
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Notícia publicada com sucesso no reinos!',
      news: newArticle
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

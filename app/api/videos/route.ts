import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.POSTGRES_URL || '');

async function ensureTableExists() {
  // Removidos os parênteses: agora a crase encosta direto no sql
  await sql`
    CREATE TABLE IF NOT EXISTS videos (
      id VARCHAR(50) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      subtitle VARCHAR(255),
      description TEXT,
      category VARCHAR(50) NOT NULL,
      subcategory VARCHAR(50) DEFAULT 'todos',
      views INT DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
}

export async function POST(request: Request) {
  try {
    await ensureTableExists();
    const body = await request.json();
    const { videoUrl, title, subtitle, description, category, subcategory } = body;

    if (!videoUrl || !title) {
      return NextResponse.json({ success: false, error: 'Dados incompletos.' }, { status: 400 });
    }

    let videoId = videoUrl.trim();
    if (videoId.includes('v=')) {
      videoId = videoId.split('v=')[1]?.split('&')[0];
    } else if (videoId.includes('youtu.be/')) {
      videoId = videoId.split('youtu.be/')[1]?.split('?')[0];
    } else if (videoId.includes('embed/')) {
      videoId = videoId.split('embed/')[1]?.split('?')[0];
    }

    if (videoId && videoId.includes('?')) {
      videoId = videoId.split('?')[0];
    }

    if (!videoId || videoId.length !== 11) {
      return NextResponse.json({ success: false, error: 'URL do YouTube inválida.' }, { status: 400 });
    }

    // Removidos os parênteses da inserção também
    await sql`
      INSERT INTO videos (id, title, subtitle, description, category, subcategory, views)
      VALUES (${videoId}, ${title.trim()}, ${subtitle?.trim() || 'Traje'}, ${description?.trim() || ''}, ${category || 'trajes'}, ${subcategory || 'todos'}, 0)
      ON CONFLICT (id) DO UPDATE 
      SET title = ${title.trim()}, subtitle = ${subtitle?.trim() || 'Traje'}, description = ${description?.trim() || ''}, category = ${category || 'trajes'}, subcategory = ${subcategory || 'todos'};
    `;

    return NextResponse.json({ success: true, message: 'Vídeo salvo com sucesso no banco de dados!' });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await ensureTableExists();
    // Removidos os parênteses do SELECT
    const rows = await sql`SELECT * FROM videos ORDER BY category ASC, title ASC;`;
    return NextResponse.json({ success: true, videos: rows });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// Garante que esta rota não seja cacheada estaticamente
export const dynamic = 'force-dynamic';

function getClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL não configurada.');
  return neon(connectionString);
}

async function ensureTableExists(sql: any) {
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
    const sql = getClient();
    await ensureTableExists(sql);

    const body = await request.json();
    const { videoUrl, title, subtitle, description, category, subcategory } = body;

    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = videoUrl.trim().match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;

    if (!videoId) return NextResponse.json({ success: false, error: 'URL do YouTube inválida.' }, { status: 400 });

    await sql`
      INSERT INTO videos (id, title, subtitle, description, category, subcategory, views)
      VALUES (${videoId}, ${title.trim()}, ${subtitle || 'Mostruário'}, ${description || ''}, ${category}, ${subcategory || 'todos'}, 0)
      ON CONFLICT (id) DO UPDATE 
      SET title = ${title.trim()}, subtitle = ${subtitle || 'Mostruário'}, description = ${description || ''}, category = ${category}, subcategory = ${subcategory || 'todos'};
    `;

    return NextResponse.json({ success: true, message: 'Vídeo salvo com sucesso!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const sql = getClient();
    await ensureTableExists(sql);
    const rows = await sql`SELECT * FROM videos ORDER BY created_at DESC;`;
    return NextResponse.json({ success: true, videos: rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
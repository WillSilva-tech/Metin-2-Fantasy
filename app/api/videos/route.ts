import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// FORÇA A ROTA A SER SEMPRE DINÂMICA
export const dynamic = 'force-dynamic';

/**
 * FUNÇÃO AUXILIAR: Inicializa o cliente SQL dinamicamente.
 */
function getClient() {
  const connectionString = process.env.DATABASE_URL;
  
  // LOG de segurança para monitorar no painel da Vercel Logs
  console.log("Tentando conectar com DATABASE_URL de tamanho:", connectionString ? connectionString.length : 0);

  if (!connectionString || connectionString.trim() === '') {
    throw new Error('A variável DATABASE_URL está completamente vazia no painel da Vercel.');
  }

  if (!connectionString.startsWith('postgres://') && !connectionString.startsWith('postgresql://')) {
    throw new Error('A string de conexão em DATABASE_URL não começa com postgresql:// ou postgres://');
  }

  return neon(connectionString);
}

/**
 * FUNÇÃO AUXILIAR: Garante a existência da tabela de vídeos no PostgreSQL.
 */
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

/**
 * MÉTODO POST: Recebe os dados vindos do Painel do GM e salva/atualiza no banco.
 */
export async function POST(request: Request) {
  try {
    const sql = getClient();
    await ensureTableExists(sql);

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

    await sql`
      INSERT INTO videos (id, title, subtitle, description, category, subcategory, views)
      VALUES (${videoId}, ${title.trim()}, ${subtitle?.trim() || 'Traje'}, ${description?.trim() || ''}, ${category || 'trajes'}, ${subcategory || 'todos'}, 0)
      ON CONFLICT (id) DO UPDATE 
      SET title = ${title.trim()}, subtitle = ${subtitle?.trim() || 'Traje'}, description = ${description?.trim() || ''}, category = ${category || 'trajes'}, subcategory = ${subcategory || 'todos'};
    `;

    return NextResponse.json({ success: true, message: 'Vídeo salv com sucesso!' });
  } catch (error: any) {
    console.error("Erro interno na rota POST de vídeos:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * MÉTODO GET: Resgata a lista ordenada de todos os vídeos para alimentar o frontend.
 */
export async function GET() {
  try {
    const sql = getClient();
    await ensureTableExists(sql);

    const rows = await sql`SELECT * FROM videos ORDER BY category ASC, title ASC;`;
    
    return NextResponse.json({ success: true, videos: rows });
  } catch (error: any) {
    console.error("Erro interno na rota GET de vídeos:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
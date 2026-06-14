import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

/**
 * FUNÇÃO AUXILIAR: Inicializa o cliente SQL dinamicamente.
 * Isso evita falhas de validação de formato de string durante o build da Vercel.
 */
function getClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL não configurada no painel da Vercel.');
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
    // Inicialização dinâmica segura (só roda quando recebe o clique do botão)
    const sql = getClient();
    await ensureTableExists(sql);

    const body = await request.json();
    const { videoUrl, title, subtitle, description, category, subcategory } = body;

    if (!videoUrl || !title) {
      return NextResponse.json({ success: false, error: 'Dados incompletos.' }, { status: 400 });
    }

    // Lógica para extração limpa do ID do YouTube (11 caracteres)
    let videoId = videoUrl.trim();
    if (videoId.includes('v=')) {
      videoId = videoId.split('v=')[1]?.split('&')[0];
    } else if (videoId.includes('youtu.be/')) {
      videoId = videoId.split('youtu.be/')[1]?.split('?')[0];
    } else if (videoId.includes('embed/')) {
      videoId = videoId.split('embed/')[1]?.split('?')[0];
    }

    // Remove parâmetros extras de compartilhamento (ex: ?si=...)
    if (videoId && videoId.includes('?')) {
      videoId = videoId.split('?')[0];
    }

    if (!videoId || videoId.length !== 11) {
      return NextResponse.json({ success: false, error: 'URL do YouTube inválida.' }, { status: 400 });
    }

    // Executa o UPSERT usando Tagged Templates do Neon
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

/**
 * MÉTODO GET: Resgata a lista ordenada de todos os vídeos para alimentar o frontend.
 */
export async function GET() {
  try {
    // Inicialização dinâmica segura
    const sql = getClient();
    await ensureTableExists(sql);

    const rows = await sql`SELECT * FROM videos ORDER BY category ASC, title ASC;`;
    
    return NextResponse.json({ success: true, videos: rows });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
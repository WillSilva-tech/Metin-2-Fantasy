import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { videoUrl, title, subtitle, description, category, subcategory } = body;

    // Função interna para extrair o ID limpo do YouTube
    let videoId = videoUrl;
    if (videoUrl.includes('v=')) {
      videoId = videoUrl.split('v=')[1]?.split('&')[0];
    } else if (videoUrl.includes('youtu.be/')) {
      videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
    } else if (videoUrl.includes('embed/')) {
      videoId = videoUrl.split('embed/')[1]?.split('?')[0];
    }

    // Limpa possíveis parâmetros extras como ?si=...
    if (videoId && videoId.includes('?')) {
      videoId = videoId.split('?')[0];
    }

    if (!videoId || !title) {
      return NextResponse.json({ success: false, error: 'Dados incompletos (Título ou URL inválidos).' }, { status: 400 });
    }

    // Salva ou atualiza no banco PostgreSQL
    await sql`
      INSERT INTO videos (id, title, subtitle, description, category, subcategory, views)
      VALUES (${videoId}, ${title}, ${subtitle || 'Traje'}, ${description || ''}, ${category}, ${subcategory || 'todos'}, 0)
      ON CONFLICT (id) DO UPDATE 
      SET title = ${title}, description = ${description || ''}, category = ${category}, subcategory = ${subcategory || 'todos'};
    `;

    return NextResponse.json({ success: true, message: 'Vídeo salvo com sucesso no banco de dados!' });
  } catch (error: any) {
    console.error('Erro na API de vídeos:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { rows } = await sql`SELECT * FROM videos ORDER BY category ASC, title ASC;`;
    return NextResponse.json({ success: true, videos: rows });
  } catch (error: any) {
    console.error('Erro ao buscar vídeos:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

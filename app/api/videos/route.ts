import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// Inicializa a conexão de forma otimizada para ambientes Serverless da Vercel
const sql = neon(process.env.POSTGRES_URL || '');

/**
 * FUNÇÃO AUXILIAR: Garante a existência da tabela de vídeos no PostgreSQL.
 * Evita o erro "relation 'videos' does not exist" na primeira execução.
 */
async function ensureTableExists() {
  await sql(`
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
  `);
}

/**
 * MÉTODO POST: Recebe os dados vindos do Painel do GM e salva/atualiza no banco.
 */
export async function POST(request: Request) {
  try {
    // 1. Verifica e cria a tabela se necessário antes de interagir
    await ensureTableExists();

    // 2. Extrai e desestrutura o corpo da requisição JSON
    const body = await request.json();
    const { videoUrl, title, subtitle, description, category, subcategory } = body;

    // 3. Validação de campos obrigatórios do formulário
    if (!videoUrl || !title) {
      return NextResponse.json(
        { success: false, error: 'Dados incompletos. O título e o link do YouTube são obrigatórios.' },
        { status: 400 }
      );
    }

    // 4. Lógica refinada para extração limpa do ID do YouTube (11 caracteres)
    let videoId = videoUrl.trim();
    if (videoId.includes('v=')) {
      videoId = videoId.split('v=')[1]?.split('&')[0];
    } else if (videoId.includes('youtu.be/')) {
      videoId = videoId.split('youtu.be/')[1]?.split('?')[0];
    } else if (videoId.includes('embed/')) {
      videoId = videoId.split('embed/')[1]?.split('?')[0];
    }

    // Remove qualquer parâmetro extra residual de compartilhamento (ex: ?si=...)
    if (videoId && videoId.includes('?')) {
      videoId = videoId.split('?')[0];
    }

    // Validação de segurança sobre o formato do ID extraído
    if (!videoId || videoId.length !== 11) {
      return NextResponse.json(
        { success: false, error: 'URL do YouTube inválida. Não foi possível identificar o ID do vídeo.' },
        { status: 400 }
      );
    }

    // 5. Executa o UPSERT (Insere se for novo ou Atualiza se já existir) de forma parametrizada e segura
    await sql(`
      INSERT INTO videos (id, title, subtitle, description, category, subcategory, views)
      VALUES ($1, $2, $3, $4, $5, $6, 0)
      ON CONFLICT (id) DO UPDATE 
      SET title = $2, 
          subtitle = $3, 
          description = $4, 
          category = $5, 
          subcategory = $6;
    `, [
      videoId,
      title.trim(),
      subtitle?.trim() || 'Traje',
      description?.trim() || '',
      category || 'trajes',
      subcategory || 'todos'
    ]);

    return NextResponse.json({ 
      success: true, 
      message: 'Vídeo sincronizado e salvo com sucesso no banco de dados!' 
    });

  } catch (error: any) {
    console.error('Erro na API de vídeos (POST):', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor: ' + error.message },
      { status: 500 }
    );
  }
}

/**
 * MÉTODO GET: Resgata a lista ordenada de todos os vídeos para alimentar o frontend.
 */
export async function GET() {
  try {
    // Garante a existência da tabela para evitar falhas em bancos recém-criados
    await ensureTableExists();

    // Seleciona os registros ordenando-os por categoria e título alfabeticamente
    const rows = await sql('SELECT * FROM videos ORDER BY category ASC, title ASC;');
    
    return NextResponse.json({ 
      success: true, 
      videos: rows 
    });

  } catch (error: any) {
    console.error('Erro ao buscar vídeos (GET):', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao conectar ao repositório de dados: ' + error.message },
      { status: 500 }
    );
  }
}

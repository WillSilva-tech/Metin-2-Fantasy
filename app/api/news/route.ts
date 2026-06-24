import { NextResponse } from 'next/server';
import { INITIAL_NEWS } from '@/lib/game-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ success: true, news: INITIAL_NEWS });
}

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: 'Publicacao de noticias pelo painel esta temporariamente desativada.',
    },
    { status: 403 }
  );
}

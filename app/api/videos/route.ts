import { NextResponse } from 'next/server';
import videosData from '@/lib/videos-data.json';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    success: true,
    videos: [
      {
        id: videosData.serverVideoId,
        title: 'Trailer Oficial Fantasy2',
        subtitle: 'Official Cinematic Teaser',
        description: 'Video principal do servidor.',
        category: 'server',
        views: 0,
      },
      {
        id: videosData.costumesVideoId,
        title: 'Showcase de Trajes',
        subtitle: 'Visual Showcase',
        description: 'Video de costumes e visuais.',
        category: 'costumes',
        views: 0,
      },
      {
        id: videosData.tutorialVideoId,
        title: 'Guia Iniciante',
        subtitle: 'Tutorial',
        description: 'Video tutorial para novos jogadores.',
        category: 'tutorial',
        views: 0,
      },
    ],
  });
}

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: 'Cadastro de videos pelo painel esta temporariamente desativado.',
    },
    { status: 403 }
  );
}

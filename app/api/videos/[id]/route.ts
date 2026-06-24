import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function PUT() {
  return NextResponse.json(
    {
      success: false,
      error: 'Edicao de videos pelo painel esta temporariamente desativada.',
    },
    { status: 403 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    {
      success: false,
      error: 'Exclusao de videos pelo painel esta temporariamente desativada.',
    },
    { status: 403 }
  );
}

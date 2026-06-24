import { NextRequest, NextResponse } from 'next/server';
import { unstickAccountCharacter, verifyAccountSession } from '@/src/lib/metin2-mysql';
import { logApiError, publicError, rateLimit } from '@/src/lib/api-security';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, 'auth.characters.unstick', 5, 60_000);
  if (limited) return limited;

  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null;
    const session = verifyAccountSession(token);

    if (!session) {
      return NextResponse.json({ success: false, error: 'Sessao invalida. Faca login novamente.' }, { status: 401 });
    }

    const body = await req.json();
    const characterId = Number(body.characterId);

    if (!Number.isInteger(characterId) || characterId <= 0) {
      return publicError('Personagem invalido.', 400);
    }

    const character = await unstickAccountCharacter(session.login, characterId);

    return NextResponse.json({
      success: true,
      message: `Personagem ${character.name} enviado para a City 1.`,
      character,
    });
  } catch (err) {
    logApiError('auth.characters.unstick', err);
    return publicError('Nao foi possivel desbugar este personagem agora.', 400);
  }
}

import { NextRequest, NextResponse } from 'next/server';

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export function getClientIp(req: NextRequest) {
  return (
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-real-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  );
}

export function rateLimit(req: NextRequest, scope: string, limit = 10, windowMs = 60_000) {
  const key = `${scope}:${getClientIp(req)}`;
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  current.count += 1;
  if (current.count <= limit) return null;

  return NextResponse.json(
    { success: false, error: 'Muitas tentativas. Aguarde alguns instantes e tente novamente.' },
    { status: 429 }
  );
}

export function logApiError(scope: string, err: unknown) {
  const error = err as { name?: string; code?: string; errno?: number };
  console.error(`[${scope}]`, {
    name: error?.name || 'Error',
    code: error?.code || null,
    errno: error?.errno || null,
  });
}

export function publicError(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status });
}

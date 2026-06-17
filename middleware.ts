import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Inicializa a resposta
  const response = NextResponse.next();

  // Define as regras de segurança (CSP)
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://picsum.photos https://*.supabase.co https://img.youtube.com;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    frame-src 'self' https://www.youtube.com https://youtube.com;
    upgrade-insecure-requests;
  `;

  // Limpa espaços extras da string para evitar erros no navegador
  const contentSecurityPolicyHeaderValue = cspHeader
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Aplica o header de segurança na resposta
  response.headers.set(
    'Content-Security-Policy',
    contentSecurityPolicyHeaderValue
  );

  return response;
}

// Configura em quais rotas o middleware vai rodar (ignora arquivos estáticos do Next)
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

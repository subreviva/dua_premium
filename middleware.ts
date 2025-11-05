/**
 * Next.js Middleware
 * 
 * Protege todas as rotas do app, exceto /acesso e APIs públicas.
 * 
 * Fluxo:
 * 1. Verifica se user está autenticado (Supabase Auth)
 * 2. Verifica se user tem has_access = true
 * 3. Se não, redireciona para /acesso
 * 4. Se sim, permite acesso
 * 
 * Rotas protegidas: /chat, /dashboard, etc.
 * Rotas públicas: /acesso, /api/validate-code, /api/auth/*
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Rotas que NÃO precisam de proteção
  const publicPaths = [
    '/acesso',
    '/api/validate-code',
    '/api/auth',
    '/api/chat',
    '/_next',
    '/favicon.ico',
  ];

  // Verificar se a rota é pública
  const isPublicPath = publicPaths.some((publicPath) => 
    path.startsWith(publicPath)
  );

  // Se for rota pública, permitir acesso
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Obter token de autenticação dos cookies
  const token = req.cookies.get('sb-access-token')?.value;

  // Se não tem token, redirecionar para /acesso
  if (!token) {
    const redirectUrl = new URL('/acesso', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  try {
    // Criar cliente Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );

    // Obter sessão do user com o token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    // Se não conseguiu autenticar, redirecionar
    if (authError || !user) {
      const redirectUrl = new URL('/acesso', req.url);
      return NextResponse.redirect(redirectUrl);
    }

    // Verificar se user tem acesso (has_access = true)
    const { data: userData, error } = await supabase
      .from('users')
      .select('has_access')
      .eq('id', user.id)
      .single();

    // Se não conseguiu buscar dados ou não tem acesso, redirecionar
    if (error || !userData || !userData.has_access) {
      const redirectUrl = new URL('/acesso', req.url);
      return NextResponse.redirect(redirectUrl);
    }

    // User autenticado e com acesso, permitir
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    // Em caso de erro, redirecionar para segurança
    const redirectUrl = new URL('/acesso', req.url);
    return NextResponse.redirect(redirectUrl);
  }
}

/**
 * Config: Rotas onde o middleware será executado
 * 
 * Protege todas as rotas, exceto as especificadas no matcher
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};

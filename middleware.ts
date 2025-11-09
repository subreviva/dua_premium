/**
 * Next.js Middleware
 * 
 * Protege todas as rotas do app, exceto /acesso e APIs públicas.
 * Inclui rate limiting avançado para segurança.
 * 
 * Fluxo:
 * 1. Aplica rate limiting baseado em IP
 * 2. Verifica se user está autenticado (Supabase Auth)
 * 3. Verifica se user tem has_access = true
 * 4. Se não, redireciona para /acesso
 * 5. Se sim, permite acesso
 * 
 * Rotas protegidas: /chat, /dashboard, etc.
 * Rotas públicas: /acesso, /api/validate-code, /api/auth/*
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Rate Limiting Storage (em produção usar Redis)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

// Configurações de Rate Limiting
const RATE_LIMITS = {
  login: { requests: 5, window: 60 * 1000 }, // 5 tentativas por minuto
  general: { requests: 100, window: 60 * 1000 }, // 100 requests por minuto
  api: { requests: 50, window: 60 * 1000 }, // 50 API calls por minuto
};

function getRateLimitKey(ip: string, type: string): string {
  return `${ip}:${type}`;
}

function checkRateLimit(ip: string, type: 'login' | 'general' | 'api'): boolean {
  const key = getRateLimitKey(ip, type);
  const limit = RATE_LIMITS[type];
  const now = Date.now();
  
  const existing = rateLimitMap.get(key);
  
  if (!existing) {
    rateLimitMap.set(key, { count: 1, lastReset: now });
    return true;
  }
  
  // Reset window if expired
  if (now - existing.lastReset > limit.window) {
    rateLimitMap.set(key, { count: 1, lastReset: now });
    return true;
  }
  
  // Check if limit exceeded
  if (existing.count >= limit.requests) {
    return false;
  }
  
  // Increment count
  existing.count++;
  return true;
}

function getClientIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0] ||
    req.headers.get('x-real-ip') ||
    req.ip ||
    'unknown'
  );
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const clientIP = getClientIP(req);

  // Aplicar rate limiting
  const rateLimitType = path.startsWith('/api') 
    ? 'api' 
    : path.includes('login') || path.includes('acesso') 
      ? 'login' 
      : 'general';

  if (!checkRateLimit(clientIP, rateLimitType)) {
    console.log(`🚫 Rate limit exceeded for ${clientIP} on ${path}`);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.',
        retryAfter: 60 
      }),
      { 
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60',
        }
      }
    );
  }

  // Rotas que NÃO precisam de proteção
  const publicPaths = [
    '/',                      // Home page pública
    '/acesso',               // Página de código de acesso
    '/login',                // Login para users registados
    '/registo',              // Página de registo/waitlist
    '/sobre',                // Sobre
    '/termos',               // Termos de serviço
    '/privacidade',          // Política de privacidade
    '/esqueci-password',     // Reset de password
    '/reset-password',       // Reset de password
    '/auth/callback',        // OAuth callback
    '/api/validate-code',    // API de validação
    '/api/auth',             // APIs de autenticação
    '/api/early-access',     // API de waitlist
    '/_next',                // Next.js internals
    '/favicon.ico',          // Favicon
    '/images',               // Imagens públicas
  ];

  // Verificar se a rota é pública
  const isPublicPath = publicPaths.some((publicPath) => 
    path.startsWith(publicPath)
  );

  // Se for rota pública, permitir acesso (com rate limiting já aplicado)
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

    // 🔓 BYPASS PARA DESENVOLVEDORES - Acesso total sem verificações
    const DEV_EMAILS = ['dev@dua.com', 'admin@dua.com', 'developer@dua.com'];
    if (DEV_EMAILS.includes(user.email || '')) {
      console.log('🔓 Acesso de desenvolvedor detectado:', user.email);
      return NextResponse.next();
    }

    // Verificar se user tem acesso (has_access = true)
    const { data: userData, error } = await supabase
      .from('users')
      .select('has_access, duaia_enabled, duacoin_enabled')
      .eq('id', user.id)
      .single();

    // Se não conseguiu buscar dados ou não tem acesso, redirecionar
    if (error || !userData || !userData.has_access) {
      const redirectUrl = new URL('/acesso', req.url);
      return NextResponse.redirect(redirectUrl);
    }

    // 🎯 VERIFICAÇÃO UNIFIED ARCHITECTURE: Acesso por produto
    // 🔒 ROTAS PROTEGIDAS - Requerem autenticação + has_access = true
    const PROTECTED_ROUTES = [
      '/chat',              // Chat IA
      '/designstudio',      // Design Studio (imagens, designs)
      '/musicstudio',       // Music Studio (música)
      '/videostudio',       // Video Studio (cinema/vídeo)
      '/imagestudio',       // Image Studio (geração de imagens)
      '/community',         // Community (criações compartilhadas)
      '/dashboard',         // Dashboard
      '/perfil',            // Perfil do usuário
      '/admin',             // Painel admin
      '/mercado',           // Mercado
      '/api/chat',          // API de chat
      '/api/conversations', // API de conversas
      '/api/comprar-item',  // API de compra
      '/api/community',     // API de community
    ];
    
    // Verificar se rota é protegida
    const isProtectedRoute = PROTECTED_ROUTES.some(route => path.startsWith(route));
    
    // Se é rota protegida e não tem has_access, bloquear
    if (isProtectedRoute && !userData.has_access) {
      console.log(`🚫 ACESSO NEGADO: ${user.email} tentou acessar ${path} sem has_access`);
      const redirectUrl = new URL('/acesso?reason=no_access', req.url);
      return NextResponse.redirect(redirectUrl);
    }
    
    // DUA IA routes: /chat, /dashboard, /api/chat, /api/conversations
    const DUAIA_ROUTES = ['/chat', '/dashboard', '/api/chat', '/api/conversations'];
    const isDuaIARoute = DUAIA_ROUTES.some(route => path.startsWith(route));

    // DUA COIN routes: /wallet, /coin, /api/wallet, /api/transactions
    const DUACOIN_ROUTES = ['/wallet', '/coin', '/api/wallet', '/api/transactions', '/api/staking'];
    const isDuaCoinRoute = DUACOIN_ROUTES.some(route => path.startsWith(route));

    // Se rota do DUA IA e user não tem acesso, redirecionar
    if (isDuaIARoute && !userData.duaia_enabled) {
      console.log(`🚫 User ${user.email} tentou acessar DUA IA sem permissão`);
      const redirectUrl = new URL('/acesso?product=duaia&reason=disabled', req.url);
      return NextResponse.redirect(redirectUrl);
    }

    // Se rota do DUA COIN e user não tem acesso, redirecionar
    if (isDuaCoinRoute && !userData.duacoin_enabled) {
      console.log(`🚫 User ${user.email} tentou acessar DUA COIN sem permissão`);
      const redirectUrl = new URL('/acesso?product=duacoin&reason=disabled', req.url);
      return NextResponse.redirect(redirectUrl);
    }

    // ✅ User autenticado e com acesso, permitir
    console.log(`✅ ACESSO PERMITIDO: ${user.email} → ${path}`);
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

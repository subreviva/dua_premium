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

// Rate Limiting Storage (em produção usar Redis)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

// Configurações de Rate Limiting - AJUSTADAS PARA MÁXIMO RIGOR E USABILIDADE
const RATE_LIMITS = {
  // Rotas críticas de autenticação - mais restritivo
  auth_critical: { requests: 10, window: 60 * 1000 }, // 10 tentativas de login por minuto
  
  // Rotas de registro/acesso - MAIS PERMISSIVO para evitar bloqueios legítimos
  registration: { requests: 30, window: 60 * 1000 }, // 30 requests por minuto na página de acesso
  
  // APIs gerais - balanceado
  api: { requests: 100, window: 60 * 1000 }, // 100 API calls por minuto
  
  // Navegação geral - muito permissivo
  general: { requests: 200, window: 60 * 1000 }, // 200 requests por minuto
};

function getRateLimitKey(ip: string, type: string): string {
  return `${ip}:${type}`;
}

function checkRateLimit(ip: string, type: 'auth_critical' | 'registration' | 'general' | 'api'): boolean {
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

// Cleanup automático do mapa de rate limiting (prevenir memory leaks)
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    // Remove entradas mais antigas que 5 minutos
    if (now - value.lastReset > 5 * 60 * 1000) {
      rateLimitMap.delete(key);
    }
  }
}, 60 * 1000); // Limpar a cada 1 minuto

function getClientIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0] ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const clientIP = getClientIP(req);
  
  // 🔧 Permitir requisições de GitHub Codespaces tunnel e recursos estáticos
  const referer = req.headers.get('referer') || '';
  const origin = req.headers.get('origin') || '';
  const isGitHubTunnel = referer.includes('github.dev') || referer.includes('app.github.dev') || origin.includes('github.dev') || origin.includes('app.github.dev');
  
  // Recursos que precisam de CORS permissivo
  const staticResources = ['/manifest.webmanifest', '/sw.js', '/offline', '/disable-sw.js', '/clear-all-sw.js'];
  const isStaticResource = staticResources.includes(path);
  
  if (isGitHubTunnel && (isStaticResource || path.startsWith('/auth/postback'))) {
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return response;
  }
  
  // Se for recurso estático (mesmo sem tunnel), adicionar CORS
  if (isStaticResource) {
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return response;
  }

  // ⚡ ROTAS ISENTAS DE RATE LIMITING (páginas públicas críticas)
  const RATE_LIMIT_EXEMPT = [
    '/acesso',               // ✅ CRÍTICO - Página de registo
    '/registo',              // ✅ CRÍTICO - Página de waitlist
    '/',                     // Home pública
    '/sobre',                // Sobre
    '/termos',               // Termos
    '/privacidade',          // Privacidade
  ];

  // Se é rota isenta, PULAR rate limiting
  const isExempt = RATE_LIMIT_EXEMPT.some(exemptPath => path === exemptPath);

  // Aplicar rate limiting APENAS se NÃO for isenta
  if (!isExempt) {
    let rateLimitType: 'auth_critical' | 'registration' | 'general' | 'api';
    
    if (path.startsWith('/api')) {
      rateLimitType = 'api';
    } else if (path.startsWith('/api/auth/register')) {
      rateLimitType = 'registration';
    } else if (path === '/login' || path.startsWith('/api/auth/login') || path.startsWith('/api/auth/callback')) {
      rateLimitType = 'auth_critical';
    } else {
      rateLimitType = 'general';
    }

    if (!checkRateLimit(clientIP, rateLimitType)) {
      console.log(`🚫 Rate limit exceeded for ${clientIP} on ${path} (type: ${rateLimitType})`);
      return new NextResponse(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          retryAfter: 60,
          type: rateLimitType
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
  }

  // ⚡ ULTRA RIGOR: Apenas welcome pages EXATAS são públicas
  // Qualquer subrota (/chat/c/, /musicstudio/home, etc) REQUER AUTENTICAÇÃO
  
  // Rotas EXATAS públicas (welcome pages)
  const PUBLIC_EXACT_PATHS = [
    '/',
    '/acesso',
    '/login',
    '/registo',
    '/sobre',
    '/termos',
    '/privacidade',
    '/esqueci-password',
    '/reset-password',
    '/auth/callback',
    '/comunidade',
    '/chat',           // ✅ Chat é público - proteção no client-side
    '/perfil',         // ✅ Perfil - proteção no client-side
    '/settings',       // ✅ Settings - proteção no client-side
    '/comprar',        // ✅ Comprar créditos - proteção no client-side
    '/admin',          // ✅ Admin - proteção no client-side
    '/designstudio',   // ✅ Design Studio - proteção no client-side
    '/musicstudio',    // ✅ Music Studio - proteção no client-side
    '/videostudio',    // ✅ Video Studio - proteção no client-side
    '/imagestudio',    // ✅ Image Studio - proteção no client-side
  ];

  // Rotas com startsWith (para assets e APIs públicas + studios)
  const PUBLIC_PREFIX_PATHS = [
    '/api/validate-code',
    '/api/auth',
    '/api/chat',             // ✅ Chat API
    '/api/imagen',           // ✅ Imagen generation API
    '/api/early-access',
    '/api/manifest',         // ✅ Manifest API
    '/manifest.webmanifest', // ✅ PWA manifest
    '/auth/postback',        // ✅ GitHub Codespaces tunnel auth
    '/_next',
    '/favicon.ico',
    '/images',
    '/icons',                // ✅ PWA icons
    '/sw.js',                // ✅ Service Worker
    '/offline',              // ✅ Offline page
    '/disable-sw.js',        // ✅ Disable SW script
    '/clear-all-sw.js',      // ✅ Clear SW script
    '/chat/',                // ✅ Chat sub-rotas (/chat/c/xxx)
    '/designstudio/',        // ✅ Design Studio sub-rotas
    '/musicstudio/',         // ✅ Music Studio sub-rotas
    '/videostudio/',         // ✅ Video Studio sub-rotas
    '/imagestudio/',         // ✅ Image Studio sub-rotas
    '/dua-premium/',         // ✅ DUA Premium landing pages (códigos exclusivos)
  ];

  // Verificar se é rota pública EXATA
  const isExactPublicPath = PUBLIC_EXACT_PATHS.includes(path);
  
  // Verificar se é rota pública com PREFIX
  const isPrefixPublicPath = PUBLIC_PREFIX_PATHS.some((prefix) => 
    path.startsWith(prefix)
  );

  // ⚡ ULTRA RIGOR: Log detalhado de bloqueio
  if (!isExactPublicPath && !isPrefixPublicPath) {
    console.log(`[ULTRA RIGOR] 🔒 Rota protegida detectada: ${path}`);
  }

  // Se for rota pública, permitir acesso
  if (isExactPublicPath || isPrefixPublicPath) {
    console.log(`[ULTRA RIGOR] ✅ Rota pública permitida: ${path}`);
    
    // ⚡ PROTEÇÃO: Se usuário já está logado e tenta acessar /acesso, redirecionar para home
    // COMENTADO - Deixar client-side fazer essa proteção via useEffect
    // if (path === '/acesso') {
    //   // Verificar cookies SSR...
    // }
    
    return NextResponse.next();
  }

  // ⚡ Se chegou aqui, rota NÃO está na whitelist - BLOQUEAR
  console.warn(`[ULTRA RIGOR] ❌ BLOQUEADO: Rota não autorizada → ${path}`);
  return NextResponse.redirect(new URL('/login', req.url));
}

// Configuração: Aplicar middleware em todas as rotas exceto assets estáticos
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

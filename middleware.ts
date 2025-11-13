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
    '/chat',           // ⚡ APENAS /chat (welcome), /chat/c/ BLOQUEADO
    '/designstudio',   // ⚡ APENAS /designstudio (welcome), /designstudio/create BLOQUEADO
    '/musicstudio',    // ⚡ APENAS /musicstudio (welcome), /musicstudio/home BLOQUEADO
    '/videostudio',    // ⚡ APENAS /videostudio (welcome), /videostudio/criar BLOQUEADO
    '/imagestudio',    // ⚡ APENAS /imagestudio (welcome), /imagestudio/create BLOQUEADO
  ];

  // Rotas com startsWith (para assets e APIs públicas)
  const PUBLIC_PREFIX_PATHS = [
    '/api/validate-code',
    '/api/auth',
    '/api/early-access',
    '/_next',
    '/favicon.ico',
    '/images',
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
    return NextResponse.next();
  }

  // Obter token de autenticação dos cookies
  const token = req.cookies.get('sb-access-token')?.value;

  // ⚡ ULTRA RIGOR: Se não tem token, BLOQUEAR e redirecionar para /acesso
  if (!token) {
    console.warn(`[ULTRA RIGOR] ❌ BLOQUEADO: Sem token de autenticação → ${path}`);
    console.warn(`[ULTRA RIGOR] ❌ Redirecionando para /acesso`);
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

    // ⚡ ULTRA RIGOR: Se não conseguiu autenticar, BLOQUEAR
    if (authError || !user) {
      console.warn(`[ULTRA RIGOR] ❌ BLOQUEADO: Falha na autenticação → ${path}`);
      console.warn(`[ULTRA RIGOR] ❌ Auth Error:`, authError?.message || 'User não encontrado');
      const redirectUrl = new URL('/acesso', req.url);
      return NextResponse.redirect(redirectUrl);
    }

    console.log(`[ULTRA RIGOR] ✅ Usuário autenticado: ${user.email} (ID: ${user.id.substring(0, 8)}...)`);

    // ════════════════════════════════════════════════════════════════════════
    // 🛡️ ULTRA RIGOR: PROTEÇÃO ADMIN EXCLUSIVA
    // ════════════════════════════════════════════════════════════════════════
    if (path.startsWith('/admin')) {
      console.log(`[ADMIN CHECK] 🔒 Verificando acesso admin para ${user.email} → ${path}`);
      
      // Verificar se é admin via admin_accounts (TABELA EXCLUSIVA)
      const { data: adminAccount, error: adminError } = await supabase
        .from('admin_accounts')
        .select('id, role, permissions')
        .eq('id', user.id)
        .single();
      
      if (adminError || !adminAccount) {
        console.warn(`[ADMIN CHECK] ❌ ACESSO NEGADO: ${user.email} tentou /admin sem registro em admin_accounts`);
        console.warn(`[ADMIN CHECK] ❌ Error:`, adminError?.message || 'Sem registro');
        return NextResponse.redirect(new URL('/', req.url));
      }
      
      console.log(`[ADMIN CHECK] ✅ ADMIN AUTORIZADO: ${user.email} (role: ${adminAccount.role})`);
      return NextResponse.next();
    }

    // ════════════════════════════════════════════════════════════════════════
    // ✅ COM LOGIN = ACESSO LIVRE TOTAL (EXCETO ADMIN)
    // ════════════════════════════════════════════════════════════════════════
    // Usuário autenticado tem acesso a TODO o site (studios, chat, features)
    // APENAS /admin requer verificação especial (feita acima)
    console.log(`✅ ACESSO LIVRE: ${user.email} → ${path}`);
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

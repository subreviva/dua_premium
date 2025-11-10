/**
 * Proteção de Rotas - DUA IA
 * Sistema de controle de acesso exclusivo com código de convite
 */

// Rotas protegidas que requerem autenticação
export const PROTECTED_ROUTES = [
  '/chat',
  '/videostudio',
  '/designstudio',
  '/musicstudio',
  '/imagestudio',
  '/community',
  '/feed',
  '/profile',
  '/settings',
  '/comprar',
  '/admin',
] as const;

// Rotas públicas (não requerem autenticação)
export const PUBLIC_ROUTES = [
  '/',
  '/acesso',
  '/login',
  '/registo',
  '/sobre',
  '/privacy',
  '/terms',
  '/cookies',
] as const;

/**
 * Verifica se uma rota é protegida
 */
export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Verifica se uma rota é pública
 */
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route));
}

/**
 * Retorna a URL de redirecionamento para usuários não autenticados
 */
export function getLoginRedirect(currentPath?: string): string {
  const redirect = currentPath && currentPath !== '/' 
    ? `/acesso?redirect=${encodeURIComponent(currentPath)}`
    : '/acesso';
  return redirect;
}

/**
 * Mensagem padrão para acesso restrito
 */
export const ACCESS_DENIED_MESSAGE = {
  title: 'Acesso Exclusivo',
  description: 'Precisas de um código de convite para aceder a esta funcionalidade'
} as const;

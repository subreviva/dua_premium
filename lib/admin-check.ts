/**
 * Admin Check Utilities
 * Centraliza a verificação de permissões de administrador
 */

export const ADMIN_EMAILS = [
  'admin@dua.pt',
  'subreviva@gmail.com',
  'dev@dua.pt',
  'dev@dua.com'
]

/**
 * Verifica se o email é de um administrador
 */
export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

/**
 * Verifica se o usuário atual é administrador
 */
export async function checkIsAdmin(supabase: any): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user?.email) return false
    return isAdminEmail(session.user.email)
  } catch (error) {
    // PRODUCTION: Removed console.error
    return false
  }
}

/**
 * Retorna os dados da sessão se o usuário for admin
 */
export async function getAdminSession(supabase: any) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return null
    
    const isAdmin = isAdminEmail(session.user.email)
    if (!isAdmin) return null
    
    return session
  } catch (error) {
    // PRODUCTION: Removed console.error
    return null
  }
}

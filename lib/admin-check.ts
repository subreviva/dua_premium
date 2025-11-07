/**
 * Admin Check Utilities
 * Centraliza a verificação de permissões de administrador
 * ATUALIZADO: Agora verifica via role no banco de dados
 */

/**
 * Verifica se o usuário atual é administrador consultando o banco
 */
export async function checkIsAdmin(supabase: any): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    // Verificar role no banco de dados
    const { data: userData, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (error || !userData) return false
    
    return ['admin', 'super_admin'].includes(userData.role)
  } catch (error) {
    return false
  }
}

/**
 * Retorna os dados da sessão se o usuário for admin
 */
export async function getAdminSession(supabase: any) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    
    // Verificar role no banco
    const { data: userData, error } = await supabase
      .from('users')
      .select('id, email, role, name')
      .eq('id', user.id)
      .single()

    if (error || !userData) return null
    
    const isAdmin = ['admin', 'super_admin'].includes(userData.role)
    if (!isAdmin) return null
    
    return {
      user: userData,
      session: { user }
    }
  } catch (error) {
    return null
  }
}

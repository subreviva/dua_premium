
// Helper function para verificar se user é SUPER ADMIN
export function isSuperAdmin(email: string): boolean {
  return email === 'estraca@2lados.pt' || email === 'dev@dua.com';
}

// Middleware para rotas de admin
export async function checkAdminAccess(userId: string, supabase: any): Promise<boolean> {
  const { data, error } = await supabase
    .from('users')
    .select('email, has_access')
    .eq('id', userId)
    .single();
  
  if (error || !data) return false;
  
  // Super admins sempre têm acesso
  if (isSuperAdmin(data.email)) {
    return true;
  }
  
  // Outros users precisam has_access = true
  return data.has_access === true;
}

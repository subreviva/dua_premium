/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🔐 ADMIN AUTHENTICATION - VERIFICAÇÃO RIGOROSA
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Sistema unificado de verificação de admin que valida:
 * 1. Autenticação via Supabase Auth (auth.users)
 * 2. Registro em admin_accounts table
 * 3. Role em users table
 * 4. Permissões em admin_accounts.permissions
 * 
 * MÁXIMO RIGOR: Valida ambas as tabelas (users + admin_accounts)
 */

import { getAdminClient } from '@/lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface AdminPermissions {
  super_admin?: boolean;
  full_access?: boolean;
  manage_users?: boolean;
  manage_coins?: boolean;
  manage_content?: boolean;
  view_audit_logs?: boolean;
  [key: string]: any;
}

export interface AdminAuthResult {
  isAdmin: boolean;
  userId?: string;
  email?: string;
  role?: string;
  permissions?: AdminPermissions;
  error?: string;
}

/**
 * Verificação RIGOROSA de admin (server-side)
 * 
 * Valida que:
 * - User está autenticado
 * - Existe em admin_accounts
 * - users.role é 'admin' ou 'super_admin'
 * 
 * @param userId - ID do usuário a verificar
 * @returns AdminAuthResult com status e permissões
 */
export async function verifyAdminAccess(userId: string): Promise<AdminAuthResult> {
  try {
    const supabase = getAdminClient();
    
    // Buscar dados combinados de admin_accounts + users
    const { data: adminData, error } = await supabase
      .from('admin_accounts')
      .select(`
        id,
        role,
        permissions,
        users!inner(email, role)
      `)
      .eq('id', userId)
      .single();
      
    if (error || !adminData) {
      return { 
        isAdmin: false, 
        error: 'Usuário não está registado como administrador' 
      };
    }
    
    // Validar que users.role também é admin
    const userRole = (adminData.users as any).role;
    if (!['admin', 'super_admin'].includes(userRole)) {
      return { 
        isAdmin: false, 
        error: 'Role de usuário inválido' 
      };
    }
    
    return {
      isAdmin: true,
      userId: adminData.id,
      email: (adminData.users as any).email,
      role: adminData.role,
      permissions: adminData.permissions as AdminPermissions,
    };
    
  } catch (error: any) {
    console.error('[ADMIN-AUTH] Erro ao verificar admin:', error);
    return { 
      isAdmin: false, 
      error: error.message || 'Erro ao verificar permissões' 
    };
  }
}

/**
 * Verificação de admin via token de autenticação
 * Usado em API routes
 * 
 * @param authToken - Bearer token do header Authorization
 * @returns AdminAuthResult
 */
export async function verifyAdminToken(authToken: string): Promise<AdminAuthResult> {
  try {
    const supabase = getAdminClient();
    
    // Validar token e obter user
    const { data: { user }, error: authError } = await supabase.auth.getUser(authToken);
    
    if (authError || !user) {
      return { 
        isAdmin: false, 
        error: 'Token de autenticação inválido' 
      };
    }
    
    // Verificar se é admin
    return await verifyAdminAccess(user.id);
    
  } catch (error: any) {
    console.error('[ADMIN-AUTH] Erro ao verificar token:', error);
    return { 
      isAdmin: false, 
      error: error.message || 'Erro ao verificar autenticação' 
    };
  }
}

/**
 * Verificação de admin via Supabase client (client-side)
 * Usa sessão ativa do usuário
 * 
 * @param supabase - Cliente Supabase (com sessão ativa)
 * @returns AdminAuthResult
 */
export async function verifyAdminClient(supabase: SupabaseClient): Promise<AdminAuthResult> {
  try {
    // Obter usuário autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { 
        isAdmin: false, 
        error: 'Não autenticado' 
      };
    }
    
    // Buscar dados de admin (usando RLS - user só vê próprios dados ou é admin)
    const { data: adminData, error } = await supabase
      .from('admin_accounts')
      .select('id, role, permissions')
      .eq('id', user.id)
      .single();
      
    if (error || !adminData) {
      return { 
        isAdmin: false, 
        error: 'Não é administrador' 
      };
    }
    
    // Buscar role do users
    const { data: userData } = await supabase
      .from('users')
      .select('email, role')
      .eq('id', user.id)
      .single();
    
    if (!userData || !['admin', 'super_admin'].includes(userData.role)) {
      return { 
        isAdmin: false, 
        error: 'Permissões insuficientes' 
      };
    }
    
    return {
      isAdmin: true,
      userId: adminData.id,
      email: userData.email,
      role: adminData.role,
      permissions: adminData.permissions as AdminPermissions,
    };
    
  } catch (error: any) {
    console.error('[ADMIN-AUTH] Erro ao verificar admin (client):', error);
    return { 
      isAdmin: false, 
      error: error.message || 'Erro ao verificar permissões' 
    };
  }
}

/**
 * Verificar se admin tem permissão específica
 * 
 * @param permissions - Objeto de permissões
 * @param requiredPermission - Permissão necessária
 * @returns boolean
 */
export function hasPermission(
  permissions: AdminPermissions | null | undefined,
  requiredPermission: keyof AdminPermissions
): boolean {
  if (!permissions) return false;
  
  // Super admins têm todas as permissões
  if (permissions.super_admin === true) return true;
  
  // Verificar permissão específica
  return permissions[requiredPermission] === true;
}

/**
 * Helper: Extrair token do header Authorization
 */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

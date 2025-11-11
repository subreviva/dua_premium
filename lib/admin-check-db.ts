/**
 * ⚠️ DEPRECATED: Use lib/admin-auth.ts para verificações rigorosas
 * Mantido para compatibilidade com código existente
 */
import { supabaseClient } from '@/lib/supabase';
import { verifyAdminClient } from '@/lib/admin-auth';

export async function checkAdminAccess(supabaseUrl: string, supabaseKey: string, userEmail?: string) {
  const supabase = supabaseClient;
  
  try {
    // Usar nova verificação rigorosa
    const adminCheck = await verifyAdminClient(supabase);
    
    if (!adminCheck.isAdmin) {
      return { 
        isAdmin: false, 
        user: null, 
        error: adminCheck.error || 'Not admin' 
      };
    }

    // Buscar dados do user para compatibilidade
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('id, email, role, name, avatar_url')
      .eq('id', adminCheck.userId!)
      .single();

    if (dbError || !userData) {
      return { isAdmin: false, user: null, error: 'User not found' };
    }

    return {
      isAdmin: true,
      user: userData,
      role: adminCheck.role,
      permissions: adminCheck.permissions,
      error: null
    };

  } catch (error: any) {
    return { isAdmin: false, user: null, error: error.message };
  }
}

// For server components
export async function serverCheckAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  return checkAdminAccess(supabaseUrl, supabaseAnonKey);
}

// For client components
export async function clientCheckAdmin(supabase: any) {
  try {
    // ✅ Usar verificação rigorosa do admin-auth.ts
    const adminCheck = await verifyAdminClient(supabase);
    
    if (!adminCheck.isAdmin) {
      return { 
        isAdmin: false, 
        user: null, 
        error: adminCheck.error || 'Not admin' 
      };
    }

    // Buscar dados completos do user
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('id, email, role, name, avatar_url')
      .eq('id', adminCheck.userId!)
      .single();

    if (dbError || !userData) {
      return { isAdmin: false, user: null, error: 'User not found' };
    }

    return {
      isAdmin: true,
      user: userData,
      role: adminCheck.role,
      permissions: adminCheck.permissions,
      error: null
    };

  } catch (error: any) {
    return { isAdmin: false, user: null, error: error.message };
  }
}

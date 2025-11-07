// Admin Check - Via Database Role
import { createClient } from '@supabase/supabase-js';

export async function checkAdminAccess(supabaseUrl: string, supabaseKey: string, userEmail?: string) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { isAdmin: false, user: null, error: 'Not authenticated' };
    }

    // Check admin status from database
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('id, email, role, name, avatar_url')
      .eq('id', user.id)
      .single();

    if (dbError || !userData) {
      return { isAdmin: false, user, error: 'User not found in database' };
    }

    const isAdmin = ['admin', 'super_admin'].includes(userData.role);

    return {
      isAdmin,
      user: userData,
      role: userData.role,
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
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { isAdmin: false, user: null, error: 'Not authenticated' };
    }

    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('id, email, role, name, avatar_url')
      .eq('id', user.id)
      .single();

    if (dbError || !userData) {
      return { isAdmin: false, user, error: 'User not found in database' };
    }

    const isAdmin = ['admin', 'super_admin'].includes(userData.role);

    return {
      isAdmin,
      user: userData,
      role: userData.role,
      error: null
    };

  } catch (error: any) {
    return { isAdmin: false, user: null, error: error.message };
  }
}


/**
 * UNIFIED ARCHITECTURE HELPERS
 * 
 * Funções para trabalhar com arquitetura unificada
 */

import { createClient } from '@supabase/supabase-js';

export interface UnifiedUser {
  id: string;
  email: string;
  name?: string;
  has_access: boolean;
  
  // DUA IA
  duaia_enabled: boolean;
  duaia_profile?: {
    display_name?: string;
    conversations_count: number;
    tokens_used: number;
  };
  
  // DUA COIN
  duacoin_enabled: boolean;
  duacoin_profile?: {
    balance: number;
    kyc_status: string;
    wallet_address?: string;
  };
}

/**
 * Get unified user data (both DUA IA and DUA COIN)
 */
export async function getUnifiedUser(userId: string, supabase: any): Promise<UnifiedUser | null> {
  // Base user data
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, email, name, has_access, duaia_enabled, duacoin_enabled')
    .eq('id', userId)
    .single();
  
  if (userError || !user) return null;
  
  // DUA IA profile
  const { data: duaiaProfile } = await supabase
    .from('duaia_profiles')
    .select('display_name, conversations_count, tokens_used')
    .eq('user_id', userId)
    .single();
  
  // DUA COIN profile
  const { data: duacoinProfile } = await supabase
    .from('duacoin_profiles')
    .select('balance, kyc_status, wallet_address')
    .eq('user_id', userId)
    .single();
  
  return {
    ...user,
    duaia_profile: duaiaProfile || undefined,
    duacoin_profile: duacoinProfile || undefined
  };
}

/**
 * Check if user has access to specific product
 */
export function hasProductAccess(user: UnifiedUser, product: 'duaia' | 'duacoin'): boolean {
  if (!user.has_access) return false;
  
  if (product === 'duaia') return user.duaia_enabled;
  if (product === 'duacoin') return user.duacoin_enabled;
  
  return false;
}

/**
 * Check if user is super admin
 */
export function isSuperAdmin(email: string): boolean {
  return email === 'estraca@2lados.pt' || email === 'dev@dua.com';
}

/**
 * Enable/disable product for user
 */
export async function setProductAccess(
  userId: string,
  product: 'duaia' | 'duacoin',
  enabled: boolean,
  supabase: any
): Promise<boolean> {
  const column = product === 'duaia' ? 'duaia_enabled' : 'duacoin_enabled';
  
  const { error } = await supabase
    .from('users')
    .update({ [column]: enabled })
    .eq('id', userId);
  
  return !error;
}

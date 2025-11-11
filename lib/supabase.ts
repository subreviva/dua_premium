/**
 * Supabase Client Configuration
 * 
 * Este arquivo configura dois tipos de clientes Supabase:
 * 
 * 1. supabaseClient: Cliente padrão com acesso limitado (RLS ativo)
 *    - Usado no frontend e para operações normais de users
 *    - Respeita todas as policies de Row Level Security
 * 
 * 2. supabaseAdmin: Cliente com service_role key (ADMIN)
 *    - Usado APENAS em API routes do servidor
 *    - Bypassa RLS, tem acesso total ao banco
 *    - NUNCA expor no frontend!
 */

import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// URLs e Keys do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Validação no build time
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ SUPABASE ENV VARS MISSING!');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'SET' : 'MISSING');
  throw new Error('Missing Supabase environment variables!');
}

// Singleton instances
let _clientInstance: SupabaseClient | null = null;
let _adminInstance: SupabaseClient | null = null;

/**
 * Cliente Supabase padrão (com RLS)
 * Use este para operações normais de frontend
 */
function getSupabaseClient(): SupabaseClient {
  if (!_clientInstance) {
    _clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return _clientInstance;
}

/**
 * Cliente Supabase ADMIN (sem RLS)
 * ⚠️ USE APENAS EM API ROUTES NO SERVIDOR!
 * ⚠️ NUNCA exponha no frontend!
 */
function getSupabaseAdmin(): SupabaseClient {
  if (typeof window !== 'undefined') {
    throw new Error('supabaseAdmin só pode ser usado no servidor!');
  }
  
  if (!_adminInstance) {
    _adminInstance = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return _adminInstance;
}

// Export singleton instance (safe para import no browser)
export const supabaseClient = getSupabaseClient();

// Export getter function para admin (só usar no servidor)
export function getAdminClient() {
  return getSupabaseAdmin();
}

/**
 * Tipos TypeScript para as tabelas
 */
export interface InviteCode {
  id: string;
  code: string;
  active: boolean;
  used_by: string | null;
  credits: number;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  credits: number;
  has_access: boolean;
  invite_code_used: string | null;
  created_at: string;
  updated_at: string;
}

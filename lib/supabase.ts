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

// URLs e Keys do Supabase (com fallback vazio para evitar erro durante build)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Singleton instances
let clientInstance: SupabaseClient | null = null;
let adminInstance: SupabaseClient | null = null;

/**
 * Cliente Supabase padrão (com RLS)
 * Use este para operações normais de frontend
 * Lazy loading para evitar instanciar durante build
 */
export const supabaseClient = (() => {
  if (typeof window === 'undefined' && !supabaseUrl) {
    // Durante build SSR sem env vars, retorna mock
    return null as any;
  }
  
  if (!clientInstance) {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  
  return clientInstance;
})();

/**
 * Cliente Supabase ADMIN (sem RLS)
 * ⚠️ USE APENAS EM API ROUTES NO SERVIDOR!
 * ⚠️ NUNCA exponha no frontend!
 * Lazy loading para evitar instanciar durante build
 */
export const supabaseAdmin = (() => {
  if (typeof window !== 'undefined') {
    throw new Error('supabaseAdmin só pode ser usado no servidor!');
  }
  
  if (!supabaseUrl || !supabaseServiceKey) {
    // Durante build sem env vars, retorna mock
    return null as any;
  }
  
  if (!adminInstance) {
    adminInstance = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  
  return adminInstance;
})();

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

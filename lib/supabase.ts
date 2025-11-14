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
import { SupabaseStorageAdapter } from './supabase-storage';

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
 * 
 * ✅ Tratamento automático de erros de refresh token
 * ✅ Auto-logout em caso de sessão inválida
 */
function getSupabaseClient(): SupabaseClient {
  if (!_clientInstance) {
    // Criar custom storage adapter para desenvolvimento
    const customStorage = typeof window !== 'undefined' 
      ? new SupabaseStorageAdapter('supabase.auth.token')
      : undefined;

    _clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storage: customStorage as any,
        // Em desenvolvimento, forçar storage mesmo se cookies falharem
        storageKey: 'supabase.auth.token',
        debug: process.env.NODE_ENV === 'development',
      },
    });

    // Listener para erros de autenticação
    if (typeof window !== 'undefined') {
      _clientInstance.auth.onAuthStateChange((event, session) => {
        // Log apenas em desenvolvimento
        if (process.env.NODE_ENV === 'development') {
          console.log('🔐 Auth event:', event);
          if (session) {
            // expires_at está em segundos, não milissegundos
            const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
            const expiryDate = new Date(expiresAt);
            const now = new Date();
            const isExpired = expiryDate < now;
            
            console.log('📝 Session exists:', {
              userId: session.user?.id,
              email: session.user?.email,
              expiresAt: expiryDate.toLocaleString(),
              isExpired,
              timeUntilExpiry: isExpired ? 'EXPIRED' : `${Math.round((expiresAt - now.getTime()) / 1000 / 60)} minutes`
            });
          } else {
            console.log('❌ No session');
          }
        }

        // Após SIGNED_IN, verificar se cookies foram setados
        if (event === 'SIGNED_IN' && session) {
          console.log('✅ SIGNED_IN event - Session:', {
            user: session.user?.email,
            hasAccessToken: !!session.access_token,
            hasRefreshToken: !!session.refresh_token,
          });
        }

        // Se houve erro de refresh token, fazer logout automático
        if (event === 'TOKEN_REFRESHED' && !session) {
          console.warn('⚠️ Token refresh failed - clearing session');
          _clientInstance?.auth.signOut();
        }

        // Se sessão foi revogada/invalidada
        if (event === 'SIGNED_OUT') {
          // Limpar localStorage
          localStorage.removeItem('supabase.auth.token');
          if (process.env.NODE_ENV === 'development') {
            console.log('🚪 User signed out - session cleared');
          }
        }
      });
    }
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

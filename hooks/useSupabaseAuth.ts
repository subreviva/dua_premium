"use client"

import { useEffect, useState } from 'react'
import { supabaseClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

/**
 * Hook para gerenciar autenticação Supabase com tratamento robusto de erros
 * 
 * ✅ Auto-refresh de tokens
 * ✅ Detecção e limpeza de sessões inválidas
 * ✅ Logout automático em caso de erro
 */
export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Verificar sessão inicial
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabaseClient.auth.getSession()
        
        if (error) {
          console.error('❌ Session error:', error.message)
          
          // Se erro é de refresh token, limpar tudo
          if (error.message.includes('Refresh Token')) {
            console.warn('⚠️ Invalid refresh token detected - clearing session')
            await supabaseClient.auth.signOut()
            setUser(null)
            setError('Sessão expirada. Por favor, faça login novamente.')
          } else {
            setError(error.message)
          }
        } else if (session?.user) {
          setUser(session.user)
          setError(null)
        } else {
          setUser(null)
        }
      } catch (err) {
        console.error('❌ Error checking session:', err)
        setError('Erro ao verificar sessão')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state changed:', event)

        switch (event) {
          case 'SIGNED_IN':
            setUser(session?.user ?? null)
            setError(null)
            break

          case 'SIGNED_OUT':
            setUser(null)
            setError(null)
            // Limpar localStorage manualmente
            localStorage.removeItem('supabase.auth.token')
            break

          case 'TOKEN_REFRESHED':
            if (session?.user) {
              setUser(session.user)
              setError(null)
            } else {
              // Token refresh falhou
              console.warn('⚠️ Token refresh failed')
              await supabaseClient.auth.signOut()
              setUser(null)
              setError('Sessão expirada')
            }
            break

          case 'USER_UPDATED':
            setUser(session?.user ?? null)
            break

          default:
            break
        }

        setLoading(false)
      }
    )

    // Cleanup
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  /**
   * Fazer login com email/senha
   */
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      setUser(data.user)
      return { success: true, user: data.user }
    } catch (err: any) {
      const message = err.message || 'Erro ao fazer login'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Fazer logout
   */
  const signOut = async () => {
    try {
      setLoading(true)
      await supabaseClient.auth.signOut()
      setUser(null)
      setError(null)
      
      // Limpar localStorage
      localStorage.removeItem('supabase.auth.token')
      
      return { success: true }
    } catch (err: any) {
      const message = err.message || 'Erro ao fazer logout'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Verificar se sessão ainda é válida
   */
  const checkAuth = async () => {
    try {
      const { data: { session }, error } = await supabaseClient.auth.getSession()
      
      if (error || !session) {
        setUser(null)
        return false
      }
      
      setUser(session.user)
      return true
    } catch {
      setUser(null)
      return false
    }
  }

  return {
    user,
    loading,
    error,
    signIn,
    signOut,
    checkAuth,
    isAuthenticated: !!user,
  }
}

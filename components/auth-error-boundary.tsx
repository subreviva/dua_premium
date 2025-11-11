"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseClient } from '@/lib/supabase'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

/**
 * Componente para capturar erros de autenticação globalmente
 * Adicione no layout principal para tratamento automático
 */
export function AuthErrorBoundary({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    // Interceptar erros de autenticação
    const handleAuthError = async (event: AuthChangeEvent, session: Session | null) => {
      // Se token refresh falhou
      if (event === 'TOKEN_REFRESHED' && !session) {
        console.warn('⚠️ Token refresh failed - redirecting to login')
        
        // Limpar sessão
        await supabaseClient.auth.signOut()
        
        // Mostrar notificação (se tiver toast)
        if (typeof window !== 'undefined') {
          const message = 'Sua sessão expirou. Por favor, faça login novamente.'
          console.log('🔔', message)
          
          // Se tiver react-hot-toast instalado, usar:
          // toast.error(message)
        }
        
        // Redirecionar para login
        router.push('/login?reason=session-expired')
      }
    }

    // Listener
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(handleAuthError)

    // Cleanup
    return () => subscription.unsubscribe()
  }, [router])

  return <>{children}</>
}

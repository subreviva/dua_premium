"use client"

import { useState, useEffect } from 'react'
import { supabaseClient } from '@/lib/supabase'

const supabase = supabaseClient

export function useWelcomeScreen() {
  const [shouldShowWelcome, setShouldShowWelcome] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkWelcomeStatus()
  }, [])

  const checkWelcomeStatus = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        setLoading(false)
        return
      }

      // Buscar dados do usuário incluindo welcome_seen
      const { data: userData, error } = await supabase
        .from('users')
        .select('*, welcome_seen')
        .eq('id', authUser.id)
        .single()

      if (error) {
        console.error('[WELCOME] Erro ao buscar dados do usuário:', error)
        setLoading(false)
        return
      }

      setUser(userData)

      // Verificar se deve mostrar tela de boas-vindas
      // Mostrar apenas se:
      // 1. welcome_seen é false ou null
      // 2. Usuário acabou de se registrar (created_at recente - últimas 24h)
      const isNewUser = userData?.created_at && 
        (new Date().getTime() - new Date(userData.created_at).getTime()) < 24 * 60 * 60 * 1000

      if (!userData?.welcome_seen && isNewUser) {
        setShouldShowWelcome(true)
      }

      setLoading(false)
    } catch (error) {
      console.error('[WELCOME] Erro:', error)
      setLoading(false)
    }
  }

  const markWelcomeAsSeen = async () => {
    try {
      await supabase
        .from('users')
        .update({ welcome_seen: true })
        .eq('id', user?.id)

      setShouldShowWelcome(false)
    } catch (error) {
      console.error('[WELCOME] Erro ao marcar como visto:', error)
    }
  }

  return {
    shouldShowWelcome,
    user,
    loading,
    markWelcomeAsSeen
  }
}

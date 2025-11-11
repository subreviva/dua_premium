"use client"

import { useState, useEffect } from 'react'
import { supabaseClient } from '@/lib/supabase'

const supabase = supabaseClient

export function useCredits() {
  const [credits, setCredits] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    // Inicializar e carregar créditos
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        await loadCredits(user.id)
      } else {
        setLoading(false)
      }
    }

    init()

    // Atualizar a cada 3 segundos para capturar mudanças em tempo real
    const interval = setInterval(() => {
      if (userId) {
        loadCredits(userId)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [userId])

  // Listener em tempo real para mudanças na tabela
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel('credits-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'duaia_user_balances',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('[USE-CREDITS] Change detected:', payload)
          if (payload.new && 'servicos_creditos' in payload.new) {
            setCredits((payload.new as any).servicos_creditos)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const loadCredits = async (userIdParam?: string) => {
    try {
      const targetUserId = userIdParam || userId
      
      if (!targetUserId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setCredits(null)
          setLoading(false)
          return
        }
        setUserId(user.id)
      }

      const { data: balanceData, error } = await supabase
        .from('duaia_user_balances')
        .select('servicos_creditos')
        .eq('user_id', targetUserId || userId)
        .single()
      
      if (error) {
        console.error('[USE-CREDITS] Error loading credits:', error)
        setLoading(false)
        return
      }

      if (balanceData) {
        setCredits(balanceData.servicos_creditos || 0)
      }
      
      setLoading(false)
    } catch (error) {
      console.error('[USE-CREDITS] Error:', error)
      setLoading(false)
    }
  }

  const refreshCredits = () => {
    if (userId) {
      loadCredits(userId)
    }
  }

  return { credits, loading, refreshCredits }
}

"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { supabaseClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import confetti from "canvas-confetti"

const supabase = supabaseClient

// Som profissional de boas-vindas
const playWelcomeSound = () => {
  if (typeof window === 'undefined') return
  
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
    let startTime = audioContext.currentTime
    
    notes.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = frequency
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.05)
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3)
      
      oscillator.start(startTime)
      oscillator.stop(startTime + 0.3)
      
      startTime += 0.15
    })
  } catch (error) {
    console.log('Audio not supported')
  }
}

interface WelcomeScreenProps {
  user: any
  onComplete: () => void
}

export function WelcomeScreenPremium({ user, onComplete }: WelcomeScreenProps) {
  const [isClosing, setIsClosing] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [credits, setCredits] = useState(0)
  const router = useRouter()
  const hasPlayedSound = useRef(false)
  const hasTriggeredEmail = useRef(false)

  const firstName = user?.name?.split(' ')[0] || 'Criador'

  useEffect(() => {
    // Detectar mobile e iOS
    const userAgent = navigator.userAgent.toLowerCase()
    const mobile = /iphone|ipad|ipod|android/i.test(userAgent)
    setIsMobile(mobile)

    // Buscar créditos reais do banco
    fetchCredits()
    
    // Confetti elegante (menos partículas, mais sutil)
    setTimeout(() => {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#8b5cf6', '#ec4899'],
        ticks: 100,
        gravity: 0.8,
        scalar: 0.9
      })
    }, 300)

    // Som suave (apenas uma vez)
    if (!hasPlayedSound.current) {
      setTimeout(() => playWelcomeSound(), 400)
      hasPlayedSound.current = true
    }

    // Enviar email em background (apenas uma vez)
    if (!hasTriggeredEmail.current) {
      sendWelcomeEmail()
      hasTriggeredEmail.current = true
    }
  }, [])

  const fetchCredits = async () => {
    try {
      const { data, error } = await supabase
        .from('duaia_user_balances')
        .select('servicos_creditos')
        .eq('user_id', user.id)
        .single()
      
      if (!error && data) {
        // Animação de contagem dos créditos
        let count = 0
        const target = data.servicos_creditos
        const duration = 1500
        const steps = 30
        const increment = target / steps
        
        const interval = setInterval(() => {
          count += increment
          if (count >= target) {
            setCredits(target)
            clearInterval(interval)
          } else {
            setCredits(Math.floor(count))
          }
        }, duration / steps)
      }
    } catch (error) {
      console.error('Erro ao buscar créditos:', error)
      setCredits(150) // Fallback
    }
  }

  const sendWelcomeEmail = async () => {
    try {
      await fetch('/api/welcome/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: user.name,
          email: user.email
        })
      })
      console.log('✅ Email de boas-vindas enviado')
    } catch (error) {
      console.error('❌ Erro ao enviar email:', error)
    }
  }

  const handleClose = async () => {
    setIsClosing(true)
    
    try {
      await supabase
        .from('users')
        .update({ welcome_seen: true })
        .eq('id', user.id)
      
      setTimeout(() => {
        onComplete()
      }, 300)
    } catch (error) {
      console.error('Erro ao marcar welcome como visto:', error)
      onComplete()
    }
  }

  const handleStudioClick = (link: string) => {
    handleClose()
    setTimeout(() => router.push(link), 400)
  }

  const studios = [
    {
      name: "Music Studio",
      description: "Criação de música com IA",
      gradient: "from-orange-500/20 to-red-500/20",
      border: "border-orange-500/30",
      link: "/musicstudio"
    },
    {
      name: "Video Studio",
      description: "Produção de vídeo profissional",
      gradient: "from-green-500/20 to-emerald-500/20",
      border: "border-green-500/30",
      link: "/videostudio"
    },
    {
      name: "Image Studio",
      description: "Geração de imagens avançada",
      gradient: "from-blue-500/20 to-cyan-500/20",
      border: "border-blue-500/30",
      link: "/imagestudio"
    },
    {
      name: "Design Studio",
      description: "Design gráfico inteligente",
      gradient: "from-purple-500/20 to-pink-500/20",
      border: "border-purple-500/30",
      link: "/designstudio"
    }
  ]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isClosing ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center"
        onClick={handleClose}
        style={{
          paddingTop: isMobile ? 'max(1rem, env(safe-area-inset-top))' : '1rem',
          paddingBottom: isMobile ? 'max(1rem, env(safe-area-inset-bottom))' : '1rem',
          paddingLeft: isMobile ? 'max(1rem, env(safe-area-inset-left))' : '1rem',
          paddingRight: isMobile ? 'max(1rem, env(safe-area-inset-right))' : '1rem',
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ 
            scale: isClosing ? 0.9 : 1, 
            opacity: isClosing ? 0 : 1,
            y: isClosing ? 20 : 0
          }}
          transition={{ 
            type: "spring", 
            duration: 0.5,
            bounce: 0.25
          }}
          className={`relative w-full ${isMobile ? 'max-w-[calc(100%-2rem)]' : 'max-w-2xl'} bg-gradient-to-br from-neutral-900 via-black to-neutral-900 ${isMobile ? 'rounded-3xl' : 'rounded-[2rem]'} border border-white/10 shadow-2xl shadow-purple-500/10 overflow-hidden ${isMobile ? 'max-h-[85vh] overflow-y-auto' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button - Minimalista */}
          <button
            onClick={handleClose}
            className={`absolute ${isMobile ? 'top-4 right-4' : 'top-6 right-6'} z-10 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 flex items-center justify-center transition-all group active:scale-95 backdrop-blur-sm`}
            aria-label="Fechar"
          >
            <svg className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Gradient Background - Sutil */}
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 ${isMobile ? 'w-[300px] h-[300px]' : 'w-[500px] h-[500px]'} bg-gradient-to-br from-purple-600/10 via-pink-600/10 to-orange-600/10 rounded-full blur-3xl`} />

          <div className={`relative z-10 ${isMobile ? 'p-8' : 'p-12'}`}>
            
            {/* Logo e Header */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-10"
            >
              <div className="inline-block mb-6">
                <h1 className={`${isMobile ? 'text-5xl' : 'text-6xl'} font-bold tracking-tight`}>
                  <span className="bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent">
                    2 LADOS
                  </span>
                </h1>
                <div className="h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent mt-2" />
              </div>
              
              <h2 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-semibold text-white mb-3`}>
                Bem-vindo, <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{firstName}</span>
              </h2>
              
              <p className={`${isMobile ? 'text-sm' : 'text-base'} text-white/60 max-w-md mx-auto leading-relaxed`}>
                Tens agora acesso aos estúdios criativos e ao ecossistema completo da 2 LADOS
              </p>
            </motion.div>

            {/* Credits Display - Elegante */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-10"
            >
              <div className={`bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 ${isMobile ? 'rounded-2xl p-6' : 'rounded-3xl p-8'} text-center backdrop-blur-sm`}>
                <div className={`${isMobile ? 'text-6xl' : 'text-7xl'} font-bold text-white mb-2 tracking-tight`}>
                  {credits}
                </div>
                <div className={`${isMobile ? 'text-sm' : 'text-base'} text-white/70 font-medium mb-1`}>
                  Créditos DUA
                </div>
                <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-white/40`}>
                  Disponíveis para usar nos estúdios
                </div>
              </div>
            </motion.div>

            {/* Studios Grid - Profissional */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mb-10"
            >
              <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-white/90 mb-4`}>
                Estúdios Disponíveis
              </h3>
              
              <div className={`grid grid-cols-2 ${isMobile ? 'gap-3' : 'gap-4'}`}>
                {studios.map((studio, index) => (
                  <motion.button
                    key={studio.name}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.6 + index * 0.08 }}
                    onClick={() => handleStudioClick(studio.link)}
                    className={`group relative bg-gradient-to-br ${studio.gradient} hover:from-white/10 hover:to-white/5 border ${studio.border} ${isMobile ? 'rounded-xl p-4' : 'rounded-2xl p-5'} transition-all hover:scale-[1.02] active:scale-[0.98] text-left`}
                  >
                    <div className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-white mb-1 group-hover:text-white/90`}>
                      {studio.name}
                    </div>
                    <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-white/50 leading-tight`}>
                      {studio.description}
                    </div>
                    
                    {/* Arrow indicator */}
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Ecosystem Info - Minimalista */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
              className={`bg-white/[0.02] border border-white/10 ${isMobile ? 'rounded-2xl p-5' : 'rounded-3xl p-6'} mb-8`}
            >
              <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-2 gap-4'} ${isMobile ? 'text-xs' : 'text-sm'}`}>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                  <span className="text-white/60 leading-relaxed">
                    <strong className="text-white/90">DUA IA</strong> — Inteligência artificial para criação
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-pink-400 mt-1.5 flex-shrink-0" />
                  <span className="text-white/60 leading-relaxed">
                    <strong className="text-white/90">KYNTAL</strong> — Distribuição musical profissional
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 flex-shrink-0" />
                  <span className="text-white/60 leading-relaxed">
                    <strong className="text-white/90">DUA Coin</strong> — Moeda do ecossistema criativo
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                  <span className="text-white/60 leading-relaxed">
                    <strong className="text-white/90">Comunidade</strong> — Cultura lusófona independente
                  </span>
                </div>
              </div>
            </motion.div>

            {/* CTA Button - Premium */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="text-center"
            >
              <button
                onClick={handleClose}
                className={`${isMobile ? 'w-full px-8 py-4 text-base' : 'px-12 py-5 text-lg'} bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-500 hover:via-pink-500 hover:to-orange-500 active:from-purple-700 active:via-pink-700 active:to-orange-700 text-white font-semibold ${isMobile ? 'rounded-2xl' : 'rounded-full'} transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-500/25`}
              >
                Começar a Criar
              </button>
              <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-white/30 mt-4 font-light tracking-wide`}>
                Criar com intenção · Construir com verdade
              </p>
            </motion.div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

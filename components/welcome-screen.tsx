"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Sparkles, 
  Music, 
  Film, 
  Palette, 
  Image as ImageIcon,
  Coins,
  Rocket,
  Check,
  X,
  Award,
  Zap
} from "lucide-react"
import { supabaseClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import confetti from "canvas-confetti"

const supabase = supabaseClient

// Função para tocar som de celebração
const playWelcomeSound = () => {
  if (typeof window === 'undefined') return
  
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    
    // Tom de celebração ascendente
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
      gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.05)
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3)
      
      oscillator.start(startTime)
      oscillator.stop(startTime + 0.3)
      
      startTime += 0.15
    })
  } catch (error) {
    console.log('Audio not supported')
  }
}

const playClickSound = () => {
  if (typeof window === 'undefined') return
  
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.1)
  } catch (error) {
    console.log('Audio not supported')
  }
}

interface WelcomeScreenProps {
  user: any
  onComplete: () => void
}

export function WelcomeScreen({ user, onComplete }: WelcomeScreenProps) {
  const [step, setStep] = useState(0)
  const [isClosing, setIsClosing] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()
  const hasPlayedSound = useRef(false)

  const firstName = user?.name?.split(' ')[0] || 'Criador'

  useEffect(() => {
    // Detectar mobile
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
    
    // Confetti ao abrir
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b']
    })

    // Som de boas-vindas (apenas uma vez)
    if (!hasPlayedSound.current) {
      setTimeout(() => playWelcomeSound(), 300)
      hasPlayedSound.current = true
    }

    // Enviar email de boas-vindas
    sendWelcomeEmail()
  }, [])

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
    playClickSound()
    setIsClosing(true)
    
    try {
      // Marcar welcome_seen como true
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
    playClickSound()
    handleClose()
    setTimeout(() => router.push(link), 400)
  }

  const studios = [
    {
      icon: Music,
      name: "Music Studio",
      description: "Cria músicas profissionais com IA",
      gradient: "from-orange-500 to-red-500",
      link: "/musicstudio",
      badge: "Popular"
    },
    {
      icon: Film,
      name: "Video Studio",
      description: "Transforma ideias em vídeos cinematográficos",
      gradient: "from-green-500 to-emerald-500",
      link: "/videostudio",
      badge: "Novo"
    },
    {
      icon: ImageIcon,
      name: "Image Studio",
      description: "Gera imagens incríveis em segundos",
      gradient: "from-blue-500 to-cyan-500",
      link: "/imagestudio",
      badge: "Rápido"
    },
    {
      icon: Palette,
      name: "Design Studio",
      description: "Cria designs profissionais",
      gradient: "from-pink-500 to-purple-500",
      link: "/designstudio",
      badge: "Premium"
    }
  ]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isClosing ? 0 : 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 safe-area-insets"
        onClick={handleClose}
        style={{
          paddingTop: isMobile ? 'max(1rem, env(safe-area-inset-top))' : '1rem',
          paddingBottom: isMobile ? 'max(1rem, env(safe-area-inset-bottom))' : '1rem',
        }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ 
            scale: isClosing ? 0.8 : 1, 
            opacity: isClosing ? 0 : 1,
            y: isClosing ? 20 : 0
          }}
          transition={{ 
            type: "spring", 
            duration: 0.5,
            bounce: 0.3
          }}
          className={`relative w-full ${isMobile ? 'max-w-lg' : 'max-w-4xl'} bg-gradient-to-br from-gray-900 via-black to-gray-900 ${isMobile ? 'rounded-2xl' : 'rounded-3xl'} border border-white/10 shadow-2xl overflow-hidden ${isMobile ? 'max-h-[90vh] overflow-y-auto' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className={`absolute ${isMobile ? 'top-4 right-4' : 'top-6 right-6'} z-10 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 flex items-center justify-center transition-all group active:scale-95`}
          >
            <X className="w-5 h-5 text-white/60 group-hover:text-white group-active:text-white transition-colors" />
          </button>

          {/* Gradient Background Effect */}
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 ${isMobile ? 'w-[400px] h-[400px]' : 'w-[600px] h-[600px]'} bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 rounded-full blur-3xl opacity-50`} />

          <div className={`relative z-10 ${isMobile ? 'p-6' : 'p-8 md:p-12'}`}>
            
            {/* Header */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={`text-center ${isMobile ? 'mb-6' : 'mb-8'}`}
            >
              <div className="inline-flex items-center gap-2 mb-6">
                <Sparkles className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-yellow-400 animate-pulse`} />
                <h1 className={`${isMobile ? 'text-4xl' : 'text-5xl md:text-6xl'} font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent`}>
                  2 LADOS
                </h1>
                <Sparkles className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-yellow-400 animate-pulse`} />
              </div>
              
              <h2 className={`${isMobile ? 'text-2xl' : 'text-3xl md:text-4xl'} font-bold text-white mb-4`}>
                Bem-vindo, <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{firstName}</span>
              </h2>
              
              <p className={`${isMobile ? 'text-base' : 'text-lg'} text-white/70 max-w-2xl mx-auto px-2`}>
                Aqui a criatividade não fica presa em gavetas. Tens acesso a ferramentas reais e uma comunidade a construir o futuro da cultura lusófona.
              </p>
            </motion.div>

            {/* Credits Display */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${isMobile ? 'mb-6' : 'mb-8'} max-w-xl mx-auto`}
            >
              <div className={`bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 ${isMobile ? 'rounded-xl p-5' : 'rounded-2xl p-6'} text-center group hover:scale-105 transition-transform`}>
                <Coins className={`${isMobile ? 'w-7 h-7' : 'w-8 h-8'} text-yellow-400 mx-auto mb-3 group-hover:rotate-12 transition-transform`} />
                <div className={`${isMobile ? 'text-3xl' : 'text-4xl'} font-bold text-white mb-1`}>150</div>
                <div className="text-sm text-white/60 font-medium">Créditos DUA</div>
                <div className="text-xs text-white/40 mt-2">Para usar nos estúdios</div>
              </div>

              <div className={`bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 ${isMobile ? 'rounded-xl p-5' : 'rounded-2xl p-6'} text-center group hover:scale-105 transition-transform`}>
                <Zap className={`${isMobile ? 'w-7 h-7' : 'w-8 h-8'} text-blue-400 mx-auto mb-3 group-hover:scale-110 transition-transform`} />
                <div className={`${isMobile ? 'text-3xl' : 'text-4xl'} font-bold text-white mb-1`}>Ilimitado</div>
                <div className="text-sm text-white/60 font-medium">Potencial Criativo</div>
                <div className="text-xs text-white/40 mt-2">Sem limites para criar</div>
              </div>
            </motion.div>

            {/* Studios Grid */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className={isMobile ? 'mb-6' : 'mb-8'}
            >
              <h3 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-white text-center mb-6`}>
                Explora os Estúdios
              </h3>
              
              <div className={`grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-2 md:grid-cols-4 gap-4'}`}>
                {studios.map((studio, index) => (
                  <motion.button
                    key={studio.name}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    onClick={() => handleStudioClick(studio.link)}
                    className={`group relative bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 ${isMobile ? 'rounded-xl p-3' : 'rounded-2xl p-4'} transition-all hover:scale-105 active:scale-95 hover:border-white/20`}
                  >
                    {/* Badge */}
                    <div className="absolute -top-2 -right-2 z-10">
                      <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r ${studio.gradient} text-white shadow-lg`}>
                        {studio.badge}
                      </div>
                    </div>
                    
                    <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} mx-auto mb-3 rounded-xl bg-gradient-to-br ${studio.gradient} flex items-center justify-center group-hover:rotate-6 transition-transform`}>
                      <studio.icon className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-white`} />
                    </div>
                    <div className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-white mb-1`}>{studio.name}</div>
                    <div className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-white/50 leading-tight`}>{studio.description}</div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Ecosystem Info */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1 }}
              className={`bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10 ${isMobile ? 'rounded-xl p-4 mb-4' : 'rounded-2xl p-6 mb-6'}`}
            >
              <h4 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-white mb-3 flex items-center gap-2`}>
                <Award className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-yellow-400`} />
                O que tens acesso
              </h4>
              <div className={`grid ${isMobile ? 'grid-cols-1 gap-2' : 'md:grid-cols-2 gap-3'} text-sm`}>
                <div className="flex items-start gap-2 text-white/70">
                  <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className={isMobile ? 'text-xs' : ''}><strong className="text-white">DUA IA</strong> - Inteligência artificial para criar música, vídeo, imagens</span>
                </div>
                <div className="flex items-start gap-2 text-white/70">
                  <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className={isMobile ? 'text-xs' : ''}><strong className="text-white">KYNTAL</strong> - Distribui a tua música em Spotify, Apple Music</span>
                </div>
                <div className="flex items-start gap-2 text-white/70">
                  <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className={isMobile ? 'text-xs' : ''}><strong className="text-white">DUA Coin</strong> - Moeda do ecossistema para financiar projetos</span>
                </div>
                <div className="flex items-start gap-2 text-white/70">
                  <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className={isMobile ? 'text-xs' : ''}><strong className="text-white">Comunidade</strong> - Cultura lusófona independente</span>
                </div>
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-center"
            >
              <button
                onClick={handleClose}
                className={`${isMobile ? 'w-full px-6 py-3 text-base' : 'px-8 py-4 text-lg'} bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-500 hover:via-pink-500 hover:to-orange-500 active:from-purple-700 active:via-pink-700 active:to-orange-700 text-white font-semibold ${isMobile ? 'rounded-xl' : 'rounded-2xl'} transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/50 flex items-center justify-center gap-2 mx-auto`}
              >
                <Sparkles className="w-5 h-5" />
                Começar a Criar
              </button>
              <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-white/40 mt-4 italic font-light`}>
                Criar com intenção. Construir com verdade.
              </p>
            </motion.div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

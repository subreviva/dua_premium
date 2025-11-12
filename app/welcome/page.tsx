"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { supabaseClient } from "@/lib/supabase"
import { X, ChevronRight } from "lucide-react"

export default function WelcomePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [credits, setCredits] = useState(150)
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedStudio, setSelectedStudio] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabaseClient.auth.getUser()
      if (!user) {
        router.push('/acesso')
        return
      }
      setUser(user)

      // Buscar créditos
      const { data } = await supabaseClient
        .from('users')
        .select('creditos_servicos')
        .eq('id', user.id)
        .single()
      
      if (data) {
        setCredits(data.creditos_servicos || 150)
      }
    }
    getUser()
  }, [router])

  const studios = [
    {
      id: 'music',
      title: 'Music Studio',
      subtitle: 'Cria música original com IA',
      description: 'Transforma ideias em faixas completas. Descreve o estilo, mood e género musical que desejas.',
      features: [
        'Gera músicas de até 4 minutos',
        'Múltiplos géneros: Pop, Rock, Jazz, Electrónica',
        'Controlo de mood e intensidade',
        'Download em alta qualidade'
      ],
      cost: '10 créditos por faixa',
      gradient: 'from-purple-500/20 to-pink-500/20',
      borderGradient: 'from-purple-500 to-pink-500',
    },
    {
      id: 'video',
      title: 'Video Studio',
      subtitle: 'Gera vídeos a partir de texto',
      description: 'Cria vídeos profissionais descrevendo cenas, movimentos e estilos visuais.',
      features: [
        'Vídeos até 10 segundos',
        'Controlo de câmera e movimento',
        'Múltiplos estilos visuais',
        'Resolução Full HD'
      ],
      cost: '20 créditos por vídeo',
      gradient: 'from-blue-500/20 to-cyan-500/20',
      borderGradient: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'image',
      title: 'Image Studio',
      subtitle: 'Cria imagens únicas',
      description: 'Gera arte visual, ilustrações e designs através de prompts detalhados.',
      features: [
        'Alta resolução (1024x1024)',
        'Múltiplos estilos artísticos',
        'Edição e variações',
        'Download ilimitado'
      ],
      cost: '4 créditos por imagem',
      gradient: 'from-orange-500/20 to-red-500/20',
      borderGradient: 'from-orange-500 to-red-500',
    },
    {
      id: 'design',
      title: 'Design Studio',
      subtitle: 'Design profissional assistido por IA',
      description: 'Cria layouts, mockups e designs gráficos para projetos profissionais.',
      features: [
        'Templates personalizáveis',
        'Sugestões de composição',
        'Export em múltiplos formatos',
        'Paletas de cores automáticas'
      ],
      cost: '4 créditos por design',
      gradient: 'from-green-500/20 to-emerald-500/20',
      borderGradient: 'from-green-500 to-emerald-500',
    }
  ]

  const steps = [
    {
      title: 'Bem-vindo à DUA',
      subtitle: `Tens ${credits} créditos para começar`,
      content: (
        <div className="space-y-6">
          <p className="text-[15px] leading-relaxed text-white/60">
            A DUA é uma plataforma de criação assistida por inteligência artificial.
            Acesso a 4 estúdios profissionais para transformar ideias em conteúdo real.
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
              <div className="text-2xl font-light mb-1">{credits}</div>
              <div className="text-xs text-white/40">Créditos disponíveis</div>
            </div>
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
              <div className="text-2xl font-light mb-1">4</div>
              <div className="text-xs text-white/40">Estúdios</div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Escolhe o teu estúdio',
      subtitle: 'Cada um com capacidades únicas',
      content: (
        <div className="space-y-3">
          {studios.map((studio) => (
            <motion.button
              key={studio.id}
              onClick={() => setSelectedStudio(studio.id)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`
                w-full text-left p-4 rounded-xl border transition-all
                ${selectedStudio === studio.id 
                  ? 'border-white/20 bg-white/[0.03]' 
                  : 'border-white/[0.05] bg-white/[0.01] hover:border-white/10'
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium mb-0.5">{studio.title}</div>
                  <div className="text-xs text-white/40">{studio.subtitle}</div>
                </div>
                <ChevronRight className={`
                  w-4 h-4 transition-opacity
                  ${selectedStudio === studio.id ? 'opacity-100' : 'opacity-30'}
                `} />
              </div>
            </motion.button>
          ))}
        </div>
      )
    },
    {
      title: 'Como usar os créditos',
      subtitle: 'Sistema simples e transparente',
      content: (
        <div className="space-y-4">
          <p className="text-[15px] leading-relaxed text-white/60">
            Cada criação consome créditos baseado na complexidade.
            Visualiza sempre o custo antes de gerar.
          </p>
          
          <div className="space-y-2">
            {studios.map((studio) => (
              <div 
                key={studio.id}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-white/[0.01] border border-white/[0.03]"
              >
                <span className="text-sm text-white/70">{studio.title}</span>
                <span className="text-xs text-white/40">{studio.cost}</span>
              </div>
            ))}
          </div>
        </div>
      )
    }
  ]

  const handleComplete = async () => {
    // Marcar onboarding como completo
    if (user) {
      await supabaseClient
        .from('users')
        .update({ onboarding_completed: true, welcome_seen: true })
        .eq('id', user.id)
    }
    router.push('/')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Background gradient subtle */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5" />
      
      {/* Grid pattern ultra subtle */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px'
        }}
      />

      <div className="relative min-h-screen flex flex-col">
        {/* Header minimalista */}
        <header className="border-b border-white/[0.05] backdrop-blur-xl bg-black/20">
          <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="text-xl font-light tracking-tight">DUA</div>
            <button 
              onClick={handleComplete}
              className="text-xs text-white/40 hover:text-white/60 transition-colors"
            >
              Saltar
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Progress indicator */}
                <div className="flex gap-1.5">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`
                        h-0.5 flex-1 rounded-full transition-all duration-500
                        ${index <= currentStep ? 'bg-white/80' : 'bg-white/10'}
                      `}
                    />
                  ))}
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <h1 className="text-3xl sm:text-4xl font-light tracking-tight">
                    {steps[currentStep].title}
                  </h1>
                  <p className="text-base text-white/40">
                    {steps[currentStep].subtitle}
                  </p>
                </div>

                {/* Content */}
                <div className="min-h-[300px]">
                  {steps[currentStep].content}
                </div>

                {/* Navigation */}
                <div className="flex gap-3 pt-4">
                  {currentStep > 0 && (
                    <button
                      onClick={() => setCurrentStep(currentStep - 1)}
                      className="px-6 py-3 rounded-xl border border-white/10 text-sm hover:bg-white/[0.02] transition-colors"
                    >
                      Anterior
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      if (currentStep < steps.length - 1) {
                        setCurrentStep(currentStep + 1)
                      } else {
                        handleComplete()
                      }
                    }}
                    className="flex-1 px-6 py-3 rounded-xl bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors"
                  >
                    {currentStep < steps.length - 1 ? 'Continuar' : 'Começar a criar'}
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Modal de detalhes do estúdio */}
        <AnimatePresence>
          {selectedStudio && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStudio(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 sm:p-8"
              >
                {studios.filter(s => s.id === selectedStudio).map(studio => (
                  <div key={studio.id} className="space-y-6">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-2xl font-light mb-1">{studio.title}</h3>
                        <p className="text-sm text-white/40">{studio.subtitle}</p>
                      </div>
                      <button
                        onClick={() => setSelectedStudio(null)}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Description */}
                    <p className="text-[15px] leading-relaxed text-white/60">
                      {studio.description}
                    </p>

                    {/* Features */}
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-white/40 uppercase tracking-wider">
                        Características
                      </div>
                      <div className="space-y-2">
                        {studio.features.map((feature, index) => (
                          <div 
                            key={index}
                            className="flex items-start gap-2 text-sm text-white/70"
                          >
                            <div className="w-1 h-1 rounded-full bg-white/40 mt-2" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Cost */}
                    <div className="pt-4 border-t border-white/5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/40">Custo por criação</span>
                        <span className="text-sm font-medium">{studio.cost}</span>
                      </div>
                    </div>

                    {/* CTA */}
                    <button
                      onClick={() => {
                        setSelectedStudio(null)
                        handleComplete()
                        router.push(`/${studio.id}studio`)
                      }}
                      className="w-full py-3 rounded-xl bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors"
                    >
                      Experimentar agora
                    </button>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

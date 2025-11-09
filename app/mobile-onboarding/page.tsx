"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, Music, Film, Palette, Sparkles, ArrowRight, Check, Zap } from "lucide-react"
import { useRouter } from "next/navigation"

const onboardingSteps = [
  {
    icon: Zap,
    title: "Bem-vindo ao DUA AI",
    description: "Seu estúdio criativo completo com inteligência artificial",
    gradient: "from-blue-500 to-cyan-500",
    features: [
      "Crie conteúdo incrível",
      "IA de última geração",
      "100% em português"
    ]
  },
  {
    icon: MessageCircle,
    title: "Chat Inteligente",
    description: "Converse com assistentes de IA especializados",
    gradient: "from-purple-500 to-pink-500",
    features: [
      "Respostas instantâneas",
      "Múltiplos modelos",
      "Contexto avançado"
    ]
  },
  {
    icon: Music,
    title: "Estúdio de Música",
    description: "Crie músicas profissionais com IA",
    gradient: "from-orange-500 to-red-500",
    features: [
      "Vários estilos musicais",
      "Letras personalizadas",
      "Qualidade studio"
    ]
  },
  {
    icon: Film,
    title: "DUA Cinema",
    description: "Transforme ideias em vídeos cinematográficos",
    gradient: "from-green-500 to-emerald-500",
    features: [
      "Imagem para vídeo",
      "Editor criativo",
      "Qualidade 4K"
    ]
  },
  {
    icon: Palette,
    title: "Design Studio",
    description: "Crie designs profissionais em segundos",
    gradient: "from-pink-500 to-purple-500",
    features: [
      "Logos e branding",
      "UI/UX design",
      "Ilustrações únicas"
    ]
  },
]

export default function MobileOnboarding() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const step = onboardingSteps[currentStep]
  const Icon = step.icon

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Salvar que completou onboarding
      localStorage.setItem("dua-onboarding-completed", "true")
      router.push("/mobile-login")
    }
  }

  const handleSkip = () => {
    localStorage.setItem("dua-onboarding-completed", "true")
    router.push("/mobile-login")
  }

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden relative">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10" />
      
      {/* Animated Orb */}
      <motion.div
        key={currentStep}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1.5, opacity: 0.3 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ duration: 0.8 }}
        className={`absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-br ${step.gradient} rounded-full blur-3xl`}
      />

      {/* Skip Button */}
      {currentStep < onboardingSteps.length - 1 && (
        <div className="absolute top-safe right-6 z-50 pt-4">
          <button
            onClick={handleSkip}
            className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-sm hover:bg-white/10 transition-all"
          >
            Pular
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className={`inline-flex p-6 rounded-3xl bg-gradient-to-br ${step.gradient} mb-8 shadow-2xl`}
            >
              <Icon className="w-16 h-16 text-white" />
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-white mb-4"
            >
              {step.title}
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-white/60 mb-8 max-w-sm mx-auto"
            >
              {step.description}
            </motion.p>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-3 mb-12"
            >
              {step.features.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center gap-3 justify-center"
                >
                  <div className={`p-1 rounded-full bg-gradient-to-br ${step.gradient}`}>
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white/80">{feature}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Section */}
      <div className="relative z-10 px-8 pb-safe pb-8">
        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {onboardingSteps.map((_, index) => (
            <motion.div
              key={index}
              animate={{
                width: currentStep === index ? 32 : 8,
                backgroundColor: currentStep === index ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.2)"
              }}
              className="h-2 rounded-full transition-all"
            />
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          className={`w-full py-4 px-6 rounded-2xl bg-gradient-to-r ${step.gradient} text-white font-medium text-lg shadow-lg flex items-center justify-center gap-2 group active:scale-95 transition-transform`}
        >
          {currentStep < onboardingSteps.length - 1 ? (
            <>
              Próximo
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          ) : (
            <>
              Começar
              <Sparkles className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Film, ImagePlay, Wand2, ArrowUpCircle, Sparkles, ArrowRight } from "lucide-react"
import { CinemaSidebar } from "@/components/cinema-sidebar"
import { VideoStudioNavbar } from "@/components/video-studio-navbar"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

export default function VideoStudioHub() {
  const router = useRouter()
  const [hoveredTool, setHoveredTool] = useState<string | null>(null)

  const tools = [
    {
      id: "criar",
      name: "Imagem para Vídeo",
      description: "Transforme imagens estáticas em vídeos cinematográficos com movimento e vida",
      icon: ImagePlay,
      path: "/videostudio/criar",
      features: ["Duração 2-10s", "6 proporções", "Controle de câmera"],
      gradient: "from-blue-500/20 to-purple-500/20",
      examples: [
        "Câmera se movendo para frente",
        "Zoom revelando detalhes",
        "Movimento panorâmico"
      ]
    },
    {
      id: "editar",
      name: "Editor Criativo",
      description: "Edite e transforme vídeos com IA - ajuste câmera, objetos, iluminação e cenários",
      icon: Wand2,
      path: "/videostudio/editar",
      features: ["Vídeo para vídeo", "Transformação criativa", "8 proporções"],
      gradient: "from-purple-500/20 to-pink-500/20",
      examples: [
        "Transformar estilo",
        "Modificar cena",
        "Efeitos criativos"
      ]
    },
    {
      id: "qualidade",
      name: "Qualidade 4K",
      description: "Melhore a resolução do seu vídeo até 4K com processamento inteligente",
      icon: ArrowUpCircle,
      path: "/videostudio/qualidade",
      features: ["Resolução 4K", "Melhoria com IA", "Qualidade profissional"],
      gradient: "from-orange-500/20 to-red-500/20",
      examples: [
        "Upscale para 4K",
        "Melhorar detalhes",
        "Qualidade profissional"
      ]
    }
  ]

  return (
    <div className="flex h-screen overflow-hidden bg-black">
      <VideoStudioNavbar />
      <CinemaSidebar />

      <div className="flex-1 overflow-y-auto pt-14">
        {/* Header */}
        <div className="border-b border-white/5 bg-black/40 backdrop-blur-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center backdrop-blur-xl">
                <Film className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extralight text-white tracking-tight">
                  Video Studio
                </h1>
                <p className="text-sm sm:text-base text-white/40 font-light mt-1">
                  Crie Vídeos Profissionais com IA • 3 Ferramentas Poderosas
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          
          {/* Hero Section */}
          <div className="text-center mb-12 sm:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl sm:text-5xl lg:text-7xl font-extralight text-white mb-6 tracking-tight">
                Crie
                <br />
                <span className="bg-gradient-to-r from-white/90 to-white/50 bg-clip-text text-transparent">
                  Vídeos Profissionais
                </span>
              </h2>
              <p className="text-base sm:text-lg text-white/40 font-light max-w-2xl mx-auto">
                Suite completa de ferramentas de vídeo com inteligência artificial
              </p>
            </motion.div>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
            {tools.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onMouseEnter={() => setHoveredTool(tool.id)}
                onMouseLeave={() => setHoveredTool(null)}
                onClick={() => router.push(tool.path)}
                className="group relative cursor-pointer"
              >
                {/* Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500`} />
                
                {/* Card */}
                <div className="relative border border-white/10 rounded-3xl p-6 sm:p-8 hover:border-white/20 transition-all duration-500 bg-white/[0.02] backdrop-blur-xl">
                  
                  {/* Icon & Title */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-all duration-300">
                        <tool.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-light text-white">
                          {tool.name}
                        </h3>
                      </div>
                    </div>
                    
                    <ArrowRight className={`w-5 h-5 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all duration-300 ${hoveredTool === tool.id ? 'opacity-100' : 'opacity-0'}`} />
                  </div>

                  {/* Description */}
                  <p className="text-sm sm:text-base text-white/60 font-light mb-6">
                    {tool.description}
                  </p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {tool.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs font-light"
                      >
                        {feature}
                      </div>
                    ))}
                  </div>

                  {/* Examples */}
                  <div className="space-y-2">
                    <p className="text-xs text-white/40 font-light mb-3">Exemplos:</p>
                    {tool.examples.map((example, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-sm text-white/50 font-light"
                      >
                        <Sparkles className="w-3 h-3 text-white/30" />
                        {example}
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <div className="mt-6 pt-6 border-t border-white/5">
                    <button className="w-full px-6 py-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/[0.15] transition-all duration-300 text-white font-light text-sm group-hover:border-white/30">
                      Começar
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6 sm:p-8"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white/60" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-light text-white mb-2">
                  Tecnologia de IA Avançada
                </h3>
                <p className="text-sm sm:text-base text-white/60 font-light leading-relaxed">
                  Nosso estúdio utiliza modelos de inteligência artificial de última geração para criar, editar e melhorar vídeos com qualidade profissional. Transforme suas ideias em realidade com ferramentas poderosas e intuitivas.
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  )
}

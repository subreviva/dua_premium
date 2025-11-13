"use client"

import Image from "next/image"
import { Sparkles, Wand2, Music, Headphones } from "lucide-react"

const FEATURES = [
  {
    icon: Wand2,
    title: "Descreva sua Ideia",
    description: "Digite o que você imagina: 'música chill lo-fi para estudar' ou 'rock energético com guitarra'",
    image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&h=400&fit=crop",
    gradient: "from-purple-500/20 to-pink-500/20"
  },
  {
    icon: Sparkles,
    title: "DUA Cria em Segundos",
    description: "Nossa IA analisa seu prompt e gera uma música completa com vocal, instrumental e produção profissional",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&h=400&fit=crop",
    gradient: "from-blue-500/20 to-cyan-500/20"
  },
  {
    icon: Music,
    title: "Edite no Estúdio",
    description: "Ajuste volumes, adicione efeitos, separe stems e misture tudo do seu jeito com nosso editor profissional",
    image: "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=600&h=400&fit=crop",
    gradient: "from-orange-500/20 to-red-500/20"
  },
  {
    icon: Headphones,
    title: "Baixe e Compartilhe",
    description: "Sua música pronta em MP3 de alta qualidade. Compartilhe com o mundo ou use em seus projetos",
    image: "https://images.unsplash.com/photo-1619983081563-430f63602796?w=600&h=400&fit=crop",
    gradient: "from-green-500/20 to-emerald-500/20"
  }
]

export function HowItWorksSection() {
  return (
    <div className="w-full py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-light text-white mb-4">
            Como Funciona o{" "}
            <span className="font-normal bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              DUA Music Studio
            </span>
          </h2>
          <p className="text-zinc-400 font-light max-w-2xl mx-auto">
            Do texto à música profissional em minutos. Sem equipamento caro, sem conhecimento técnico necessário.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-500"
              >
                {/* Background Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient}`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  
                  {/* Step Number */}
                  <div className="absolute top-4 left-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                      <span className="text-white font-medium">{index + 1}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-medium text-white">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-zinc-400 font-light leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} blur-xl`} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

"use client"

import { FeatureCarousel, type ImageSet } from "@/components/ui/animated-feature-carousel"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { MessageSquare, Video, Palette, Music, ImageIcon, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface StudioCarouselProps {
  studioId: "chat" | "cinema" | "design" | "music" | "image"
}

const studioData = {
  chat: {
    icon: MessageSquare,
    name: "DUA Chat",
    subtitle: "O Centro de Comando Criativo",
    description: "Assistente multimodal que processa texto, imagem, áudio e vídeo em tempo real. É o teu ponto de partida para qualquer projeto criativo.",
    link: "/chat",
    images: {
      step1img1: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=1740&auto=format&fit=crop",
      step1img2: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1740&auto=format&fit=crop",
      step2img1: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1740&auto=format&fit=crop",
      step2img2: "https://images.unsplash.com/photo-1675271591609-03a1195c79a0?q=80&w=1740&auto=format&fit=crop",
      step3img: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1740&auto=format&fit=crop",
      step4img: "https://images.unsplash.com/photo-1711463248176-74e06ad9c1e1?q=80&w=1740&auto=format&fit=crop",
      alt: "DUA Chat Interface",
    },
  },
  cinema: {
    icon: Video,
    name: "DUA Cinema",
    subtitle: "Estúdio Audiovisual Inteligente",
    description: "Criação e edição de vídeo com as últimas tecnologias. Produz vídeos cinematográficos e transforma ideias em visual de alta qualidade.",
    link: "/videostudio",
    images: {
      step1img1: "https://images.unsplash.com/photo-1574267432553-4b4628081c31?q=80&w=1740&auto=format&fit=crop",
      step1img2: "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?q=80&w=1740&auto=format&fit=crop",
      step2img1: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=1740&auto=format&fit=crop",
      step2img2: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1740&auto=format&fit=crop",
      step3img: "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?q=80&w=1740&auto=format&fit=crop",
      step4img: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=1740&auto=format&fit=crop",
      alt: "DUA Cinema Studio",
    },
  },
  design: {
    icon: Palette,
    name: "DUA Design",
    subtitle: "Criação Visual Sem Limites",
    description: "Geração, edição e criação de identidade visual completa. Da conceção ao resultado final.",
    link: "/designstudio",
    images: {
      step1img1: "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1740&auto=format&fit=crop",
      step1img2: "https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=1740&auto=format&fit=crop",
      step2img1: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1740&auto=format&fit=crop",
      step2img2: "https://images.unsplash.com/photo-1558655146-364adaf1fcc9?q=80&w=1740&auto=format&fit=crop",
      step3img: "https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?q=80&w=1740&auto=format&fit=crop",
      step4img: "https://images.unsplash.com/photo-1609921212029-bb5a28e60960?q=80&w=1740&auto=format&fit=crop",
      alt: "DUA Design Studio",
    },
  },
  music: {
    icon: Music,
    name: "DUA Music",
    subtitle: "O Teu Estúdio Musical na Nuvem",
    description: "Mais de 27 ferramentas musicais profissionais num só lugar. Tudo o que precisas para criar, produzir e finalizar a tua música.",
    link: "/musicstudio",
    images: {
      step1img1: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1740&auto=format&fit=crop",
      step1img2: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1740&auto=format&fit=crop",
      step2img1: "https://images.unsplash.com/photo-1619983081563-430f63602796?q=80&w=1740&auto=format&fit=crop",
      step2img2: "https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?q=80&w=1740&auto=format&fit=crop",
      step3img: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?q=80&w=1740&auto=format&fit=crop",
      step4img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1740&auto=format&fit=crop",
      alt: "DUA Music Studio",
    },
  },
  image: {
    icon: ImageIcon,
    name: "DUA Imagem",
    subtitle: "Processamento Fotográfico Profissional",
    description: "Análise, transformação e criação de conteúdo visual de alta qualidade. Ferramentas de edição avançada.",
    link: "/imagestudio",
    images: {
      step1img1: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1740&auto=format&fit=crop",
      step1img2: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1740&auto=format&fit=crop",
      step2img1: "https://images.unsplash.com/photo-1611605698335-8b1569810432?q=80&w=1740&auto=format&fit=crop",
      step2img2: "https://images.unsplash.com/photo-1556139943-4bdca53adf1e?q=80&w=1740&auto=format&fit=crop",
      step3img: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?q=80&w=1740&auto=format&fit=crop",
      step4img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1740&auto=format&fit=crop",
      alt: "DUA Image Studio",
    },
  },
}

export function StudioCarousel({ studioId }: StudioCarouselProps) {
  const router = useRouter()
  const studio = studioData[studioId]
  const Icon = studio.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="group relative w-full"
    >
      <div className="space-y-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 px-4">
          <div className="flex items-start gap-6 flex-1">
            <motion.div 
              className="w-20 h-20 rounded-3xl bg-black/50 border border-white/[0.15] flex items-center justify-center flex-shrink-0 backdrop-blur-xl shadow-2xl"
              whileHover={{ scale: 1.05, borderColor: "rgba(255,255,255,0.25)" }}
              transition={{ duration: 0.3 }}
            >
              <Icon className="w-10 h-10 text-white" strokeWidth={1.5} />
            </motion.div>
            <div className="space-y-3">
              <h3 className="text-5xl md:text-6xl font-semibold text-white tracking-tight drop-shadow-2xl">{studio.name}</h3>
              <p className="text-xl text-white/50 font-light tracking-wide drop-shadow-lg">{studio.subtitle}</p>
              <p className="text-base text-white/60 leading-relaxed max-w-2xl font-light drop-shadow-md">{studio.description}</p>
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              size="lg"
              className="rounded-full px-10 py-7 bg-black/50 hover:bg-black/60 text-white border border-white/[0.18] hover:border-white/30 font-medium text-sm transition-all duration-300 backdrop-blur-xl shadow-xl flex-shrink-0"
              onClick={() => router.push(studio.link)}
            >
              Experimentar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>

        {/* Carousel */}
        <div className="w-full">
          <FeatureCarousel image={studio.images} />
        </div>
      </div>
    </motion.div>
  )
}

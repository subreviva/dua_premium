"use client"

import { Button } from "@/components/ui/button"
import Dock from "@/components/ui/dock"
import Navbar from "@/components/navbar"
import { motion, useScroll, useTransform } from "framer-motion"
import { Video, ImageIcon, Music, Palette, MessageSquare, ArrowRight, Home, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useRef } from "react"
import { FeatureSteps } from "@/components/ui/feature-steps"

export default function HomePage() {
  const router = useRouter()
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  const dockItems = [
    {
      icon: Home,
      label: "Início",
      onClick: () => router.push("/"),
    },
    {
      icon: MessageSquare,
      label: "Chat",
      onClick: () => router.push("/chat"),
    },
    {
      icon: Video,
      label: "Cinema",
      onClick: () => router.push("/videostudio"),
    },
    {
      icon: Palette,
      label: "Design",
      onClick: () => router.push("/designstudio"),
    },
    {
      icon: Music,
      label: "Music",
      onClick: () => router.push("/musicstudio"),
    },
    {
      icon: ImageIcon,
      label: "Imagem",
      onClick: () => router.push("/imagestudio"),
    },
    {
      icon: Users,
      label: "Comunidade",
      onClick: () => router.push("/community"),
    },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity }}
        className="relative min-h-screen w-full overflow-hidden pt-16 flex items-center justify-center"
      >
        <div className="absolute inset-0">
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-40">
            <source
              src="https://6yep4uifnoow71ty.public.blob.vercel-storage.com/transferir%20%2853%29.mp4"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/60 via-[#0a0a0a]/40 to-[#0a0a0a]" />
        </div>

        <div className="relative z-10 container mx-auto px-6 py-32">
          <div className="flex flex-col gap-16 items-center justify-center max-w-7xl w-full mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              className="text-[10rem] sm:text-[14rem] md:text-[18rem] lg:text-[24rem] font-bold leading-[0.8] tracking-[-0.06em] text-white/95"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              DUA
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
              className="text-xl sm:text-2xl md:text-3xl text-white/70 font-light max-w-3xl leading-relaxed tracking-wide"
            >
              Onde a próxima onda de criatividade lusófona acontece
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 1 }}
            >
              <Button
                size="lg"
                className="rounded-full px-10 py-6 bg-white hover:bg-white/90 text-black font-medium text-base shadow-xl transition-all duration-300 hover:scale-[1.02] border border-white/20"
                onClick={() => router.push("/registo")}
              >
                Começar com DUA
              </Button>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.4 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border border-white/30 flex items-start justify-center p-1.5">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              className="w-1.5 h-3 rounded-full bg-white/50"
            />
          </div>
        </motion.div>
      </motion.section>

      <section className="relative py-24 px-6 bg-[#0a0a0a] border-t border-white/5 overflow-hidden">
        <div className="absolute inset-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-10 blur-sm"
          >
            <source src="https://6yep4uifnoow71ty.public.blob.vercel-storage.comhttps://hebbkx1anhila5yf.public.blob.vercel-storage.com/jnjkn-32feaq56yGzOHRYywJLYjc5fy4gwy4.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[#0a0a0a]/80 backdrop-blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl text-white/90 text-center font-light leading-relaxed tracking-wide"
          >
            Cinco estúdios especializados. Uma plataforma integrada.{" "}
            <span className="text-white/60">Infinitas possibilidades para criadores lusófonos.</span>
          </motion.p>
        </div>
      </section>

      <section className="relative py-32 px-6 bg-[#0a0a0a] overflow-hidden">
        <div className="absolute inset-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-10 blur-sm"
          >
            <source src="https://6yep4uifnoow71ty.public.blob.vercel-storage.comhttps://hebbkx1anhila5yf.public.blob.vercel-storage.com/jnjkn-32feaq56yGzOHRYywJLYjc5fy4gwy4.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[#0a0a0a]/80 backdrop-blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto space-y-6 relative z-10">
          {/* DUA Chat */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="group relative bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-sm rounded-2xl p-10 md:p-12 border border-white/10 hover:border-white/20 transition-all duration-500 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex flex-col lg:flex-row items-start justify-between gap-8">
              <div className="space-y-5 flex-1">
                <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <MessageSquare className="w-7 h-7 text-white/80" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-4xl md:text-5xl font-semibold text-white/95 tracking-tight">DUA Chat</h3>
                  <p className="text-lg text-white/50 font-light">O Centro de Comando Criativo</p>
                </div>
                <p className="text-base text-white/60 leading-relaxed max-w-2xl font-light">
                  Assistente multimodal que processa texto, imagem, áudio e vídeo em tempo real. É o teu ponto de
                  partida para qualquer projeto criativo.
                </p>
              </div>
              <Button
                size="lg"
                className="rounded-full px-8 py-5 bg-white/10 hover:bg-white/15 text-white border border-white/20 font-medium text-sm transition-all duration-300 hover:scale-[1.02]"
                onClick={() => router.push("/chat")}
              >
                Experimentar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>

          {/* DUA Cinema */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="group relative bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-sm rounded-2xl p-10 md:p-12 border border-white/10 hover:border-white/20 transition-all duration-500 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex flex-col lg:flex-row items-start justify-between gap-8">
              <div className="space-y-5 flex-1">
                <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Video className="w-7 h-7 text-white/80" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-4xl md:text-5xl font-semibold text-white/95 tracking-tight">DUA Cinema</h3>
                  <p className="text-lg text-white/50 font-light">Estúdio Audiovisual Inteligente</p>
                </div>
                <p className="text-base text-white/60 leading-relaxed max-w-2xl font-light">
                  Criação e edição de vídeo com as últimas tecnologias. Produz vídeos cinematográficos e transforma
                  ideias em visual de alta qualidade.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {["Geração de vídeo", "Edição profissional", "Análise técnica", "Produção cinematográfica"].map(
                    (feature, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-white/40" />
                        <span className="text-white/50 text-sm font-light">{feature}</span>
                      </div>
                    ),
                  )}
                </div>
              </div>
              <Button
                size="lg"
                className="rounded-full px-8 py-5 bg-white/10 hover:bg-white/15 text-white border border-white/20 font-medium text-sm transition-all duration-300 hover:scale-[1.02]"
                onClick={() => router.push("/videostudio")}
              >
                Experimentar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>

          {/* DUA Design */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="group relative bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-sm rounded-2xl p-10 md:p-12 border border-white/10 hover:border-white/20 transition-all duration-500 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex flex-col lg:flex-row items-start justify-between gap-8">
              <div className="space-y-5 flex-1">
                <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Palette className="w-7 h-7 text-white/80" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-4xl md:text-5xl font-semibold text-white/95 tracking-tight">DUA Design</h3>
                  <p className="text-lg text-white/50 font-light">Criação Visual Sem Limites</p>
                </div>
                <p className="text-base text-white/60 leading-relaxed max-w-2xl font-light">
                  Geração, edição e criação de identidade visual completa. Da conceção ao resultado final.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {["Logotipos", "Capas de álbum", "Geração de imagens", "Adaptação de formatos"].map((feature, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-white/40" />
                      <span className="text-white/50 text-sm font-light">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Button
                size="lg"
                className="rounded-full px-8 py-5 bg-white/10 hover:bg-white/15 text-white border border-white/20 font-medium text-sm transition-all duration-300 hover:scale-[1.02]"
                onClick={() => router.push("/designstudio")}
              >
                Experimentar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>

          {/* DUA Music */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="group relative bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-sm rounded-2xl p-10 md:p-12 border border-white/10 hover:border-white/20 transition-all duration-500 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex flex-col lg:flex-row items-start justify-between gap-8">
              <div className="space-y-5 flex-1">
                <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Music className="w-7 h-7 text-white/80" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-4xl md:text-5xl font-semibold text-white/95 tracking-tight">DUA Music</h3>
                  <p className="text-lg text-white/50 font-light">O Teu Estúdio Musical na Nuvem</p>
                </div>
                <p className="text-base text-white/60 leading-relaxed max-w-2xl font-light">
                  Mais de 27 ferramentas musicais profissionais num só lugar. Tudo o que precisas para criar, produzir e
                  finalizar a tua música.
                </p>
                <div className="grid grid-cols-3 gap-3 pt-2">
                  {["Criação", "Produção", "Vocal", "Edição", "Masterização", "Análise"].map((feature, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-white/40" />
                      <span className="text-white/50 text-sm font-light">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Button
                size="lg"
                className="rounded-full px-8 py-5 bg-white/10 hover:bg-white/15 text-white border border-white/20 font-medium text-sm transition-all duration-300 hover:scale-[1.02]"
                onClick={() => router.push("/musicstudio")}
              >
                Experimentar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>

          {/* DUA Imagem */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="group relative bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-sm rounded-2xl p-10 md:p-12 border border-white/10 hover:border-white/20 transition-all duration-500 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex flex-col lg:flex-row items-start justify-between gap-8">
              <div className="space-y-5 flex-1">
                <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <ImageIcon className="w-7 h-7 text-white/80" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-4xl md:text-5xl font-semibold text-white/95 tracking-tight">DUA Imagem</h3>
                  <p className="text-lg text-white/50 font-light">Processamento Fotográfico Profissional</p>
                </div>
                <p className="text-base text-white/60 leading-relaxed max-w-2xl font-light">
                  Análise, transformação e criação de conteúdo visual de alta qualidade. Ferramentas de edição avançada.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {["Geração fotorrealista", "Edição avançada", "Análise técnica", "Otimização"].map((feature, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-white/40" />
                      <span className="text-white/50 text-sm font-light">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Button
                size="lg"
                className="rounded-full px-8 py-5 bg-white/10 hover:bg-white/15 text-white border border-white/20 font-medium text-sm transition-all duration-300 hover:scale-[1.02]"
                onClick={() => router.push("/imagestudio")}
              >
                Experimentar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative py-32 px-6 bg-[#0a0a0a] border-t border-white/5 overflow-hidden">
        <div className="absolute inset-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-10 blur-sm"
          >
            <source src="https://6yep4uifnoow71ty.public.blob.vercel-storage.comhttps://hebbkx1anhila5yf.public.blob.vercel-storage.com/jnjkn-32feaq56yGzOHRYywJLYjc5fy4gwy4.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[#0a0a0a]/80 backdrop-blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto space-y-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center space-y-6"
          >
            <h2 className="text-6xl sm:text-7xl md:text-8xl font-semibold text-white/95 tracking-tight leading-[0.9]">
              A DUA Tem Identidade
            </h2>
            <p className="text-xl sm:text-2xl text-white/50 max-w-3xl mx-auto font-light">
              Não é só código. É uma presença.
            </p>
          </motion.div>

          <FeatureSteps
            features={[
              {
                step: "Tem Rosto",
                content:
                  "A DUA não é um logo abstrato. Ela tem uma identidade visual, tem rosto, essência e propósito. Num setor onde os bastidores continuam ocupados por figuras masculinas, optámos por dar forma à DUA com uma imagem que representa força, ancestralidade e presença.",
                image: "/emotional-sunset-silhouette.jpg",
              },
              {
                step: "Tem Voz",
                content:
                  "Comunica em português de Portugal e crioulo cabo-verdiano. A voz não é robótica, é próxima e profissional. Podes falar com ela ou escrever. Ela responde por texto ou áudio, como uma parceira real.",
                image: "/dj-mixing-music-night.jpg",
              },
              {
                step: "Tem História",
                content:
                  "A DUA nasceu da necessidade. Foi criada por alguém que estava cansado de depender de sistemas que não serviam os criadores. Nasceu entre código e música, num quarto, de madrugadas passadas a programar.",
                image: "/global-music-charts-abstract.jpg",
              },
            ]}
            title=""
            autoPlayInterval={4000}
            imageHeight="h-[400px] md:h-[500px] lg:h-[600px]"
            className="bg-transparent"
          />
        </div>
      </section>

      <section className="relative py-40 px-6 bg-[#0a0a0a] border-t border-white/5 overflow-hidden">
        <div className="absolute inset-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-10 blur-sm"
          >
            <source src="https://6yep4uifnoow71ty.public.blob.vercel-storage.comhttps://hebbkx1anhila5yf.public.blob.vercel-storage.com/jnjkn-32feaq56yGzOHRYywJLYjc5fy4gwy4.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[#0a0a0a]/80 backdrop-blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto text-center space-y-12 relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold text-white/95 tracking-tight leading-[0.95] max-w-4xl mx-auto"
          >
            A DUA não é só uma ferramenta
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl md:text-4xl text-white/60 font-light max-w-3xl mx-auto leading-relaxed"
          >
            É a resposta de quem decidiu que já chega de esperar. Junta-te à revolução criativa lusófona.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
          >
            <Button
              size="lg"
              className="rounded-full px-12 py-7 bg-white hover:bg-white/90 text-black font-medium text-lg transition-all duration-300 hover:scale-[1.02]"
              onClick={() => router.push("/registo")}
            >
              Começar Agora
              <ArrowRight className="ml-3 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-12 py-7 border border-white/20 text-white hover:bg-white/5 font-medium text-lg transition-all duration-300 hover:scale-[1.02] bg-transparent"
              onClick={() => router.push("/chat")}
            >
              Explorar o Ecossistema
            </Button>
          </motion.div>
        </div>
      </section>

      <div className="fixed bottom-8 left-0 right-0 z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <Dock items={dockItems} />
        </div>
      </div>
    </div>
  )
}

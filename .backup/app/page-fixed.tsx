"use client"

import { Button } from "@/components/ui/button"
import Dock from "@/components/ui/dock"
import Navbar from "@/components/navbar"
import { motion, useScroll, useTransform } from "framer-motion"
import { Video, ImageIcon, Music, Palette, MessageSquare, ArrowRight, Home, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useRef } from "react"
import { FeatureSteps } from "@/components/ui/feature-steps"
import { StudioCarousel } from "@/components/studio-carousel"

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
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-100">
            <source
              src="https://6yep4uifnoow71ty.public.blob.vercel-storage.com/transferir%20%2853%29.mp4"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/40" />
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
              Onde a próxima onda de criatividade<br className="hidden sm:block" /> lusófona acontece
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

      <section className="relative py-24 px-6 bg-[#0a0a0a] overflow-hidden">
        <div className="absolute inset-0">
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-100">
            <source
              src="https://6yep4uifnoow71ty.public.blob.vercel-storage.com/transferir%20%2853%29.mp4"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black/60 backdrop-blur-[20px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/40 to-transparent" />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl text-white font-light leading-relaxed tracking-wide drop-shadow-2xl"
          >
            Cinco estúdios especializados. Uma plataforma integrada.{" "}
            <span className="text-white/70">Infinitas possibilidades para criadores lusófonos.</span>
          </motion.p>
        </div>
      </section>

      <section className="relative py-32 px-6 bg-[#0a0a0a] overflow-hidden">
        <div className="absolute inset-0">
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-100">
            <source
              src="https://6yep4uifnoow71ty.public.blob.vercel-storage.com/transferir%20%2853%29.mp4"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[20px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-transparent" />
        </div>
        <div className="max-w-7xl mx-auto space-y-32 relative z-10">
          <StudioCarousel studioId="chat" />
          <StudioCarousel studioId="cinema" />
          <StudioCarousel studioId="design" />
          <StudioCarousel studioId="music" />
          <StudioCarousel studioId="image" />
        </div>
      </section>

      <section className="relative py-32 px-6 bg-[#0a0a0a] overflow-hidden">
        <div className="absolute inset-0">
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-100">
            <source
              src="https://6yep4uifnoow71ty.public.blob.vercel-storage.com/transferir%20%2853%29.mp4"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[20px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-transparent" />
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

      <section className="relative py-40 px-6 bg-[#0a0a0a] overflow-hidden">
        <div className="absolute inset-0">
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-100">
            <source
              src="https://6yep4uifnoow71ty.public.blob.vercel-storage.com/transferir%20%2853%29.mp4"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[20px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/80" />
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

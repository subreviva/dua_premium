"use client"

import { Button } from "@/components/ui/button"
import Dock from "@/components/ui/dock"
import Navbar from "@/components/navbar"
import { motion, useScroll, useTransform } from "framer-motion"
import { Video, ImageIcon, Music, Palette, MessageSquare, ArrowRight, Home, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useRef } from "react"
import { FeatureSteps } from "@/components/ui/feature-steps"
import { Gallery6 } from "@/components/ui/gallery6"
import { Bento3Section } from "@/components/ui/bento-monochrome-1"

export default function HomePage() {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 1.05])
  const heroY = useTransform(scrollYProgress, [0, 0.15], [0, -50])

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
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
        <motion.div 
          style={{ scale: heroScale, y: heroY }}
          className="absolute inset-0 z-0"
        >
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-100">
            <source
              src="https://6yep4uifnoow71ty.public.blob.vercel-storage.com/transferir%20%2853%29.mp4"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
        </motion.div>

        <div className="relative z-10 container mx-auto px-6 py-32">
          <div className="flex flex-col gap-16 items-center justify-center max-w-7xl w-full mx-auto text-center">
            <h1
              className="text-[10rem] sm:text-[14rem] md:text-[18rem] lg:text-[24rem] font-light leading-[0.8] tracking-[-0.06em] text-white"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 200 }}
            >
              DUA
            </h1>

            <p className="text-xl sm:text-2xl md:text-3xl text-white/80 font-light max-w-3xl leading-relaxed tracking-wide">
              Onde a próxima onda de criatividade<br className="hidden sm:block" /> lusófona acontece
            </p>

            <Button
              size="lg"
              className="rounded-full px-12 py-7 bg-white hover:bg-white/95 text-black font-medium text-lg transition-all duration-500 hover:scale-105 shadow-2xl"
              onClick={() => router.push("/registo")}
            >
              Começar com DUA
            </Button>
          </div>
        </div>

        {/* Gradient de transição inferior */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-80 pointer-events-none z-20"
          style={{
            background: 'linear-gradient(to bottom, rgba(10,10,10,0) 0%, rgba(10,10,10,0.5) 40%, rgba(10,10,10,0.9) 80%, rgba(10,10,10,1) 100%)'
          }}
        />
      </section>

      {/* SEÇÃO 2: STUDIOS CAROUSEL */}
      <section className="relative py-40 px-6 bg-[#0a0a0a] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-100">
            <source
              src="https://6yep4uifnoow71ty.public.blob.vercel-storage.com/transferir%20%2853%29.mp4"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-[#0a0a0a]/88 backdrop-blur-[28px]" />
        </div>
        
        {/* Gradient de transição superior */}
        <div 
          className="absolute top-0 left-0 right-0 h-64 pointer-events-none z-20"
          style={{
            background: 'linear-gradient(to bottom, rgba(10,10,10,1) 0%, rgba(10,10,10,0.8) 40%, rgba(10,10,10,0) 100%)'
          }}
        />
        
        <div className="relative z-10">
          <Gallery6 heading="Estúdios Criativos" />
        </div>

        {/* Gradient de transição inferior */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none z-20"
          style={{
            background: 'linear-gradient(to bottom, rgba(10,10,10,0) 0%, rgba(10,10,10,0.8) 60%, rgba(10,10,10,1) 100%)'
          }}
        />
      </section>

      {/* SEÇÃO 3: IDENTIDADE */}
      <section className="relative py-40 px-6 bg-[#0a0a0a] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-100">
            <source
              src="https://6yep4uifnoow71ty.public.blob.vercel-storage.com/transferir%20%2853%29.mp4"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-[#0a0a0a]/88 backdrop-blur-[28px]" />
        </div>
        
        {/* Gradient de transição superior */}
        <div 
          className="absolute top-0 left-0 right-0 h-64 pointer-events-none z-20"
          style={{
            background: 'linear-gradient(to bottom, rgba(10,10,10,1) 0%, rgba(10,10,10,0.8) 40%, rgba(10,10,10,0) 100%)'
          }}
        />
        
        <div className="max-w-7xl mx-auto space-y-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true, amount: 0.2 }}
            className="text-center space-y-8"
          >
            <h2 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-light text-white tracking-tight leading-[0.95]">
              A DUA Tem Identidade
            </h2>
            <p className="text-2xl sm:text-3xl text-white/50 max-w-3xl mx-auto font-light leading-relaxed">
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

        {/* Gradient de transição inferior */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none z-20"
          style={{
            background: 'linear-gradient(to bottom, rgba(10,10,10,0) 0%, rgba(10,10,10,0.8) 70%, rgba(10,10,10,1) 100%)'
          }}
        />
      </section>

      {/* SEÇÃO 4: QUEM CRIOU A DUA */}
      <section className="relative py-48 px-6 bg-[#0a0a0a] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-100">
            <source
              src="https://6yep4uifnoow71ty.public.blob.vercel-storage.com/transferir%20%2853%29.mp4"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-[#0a0a0a]/88 backdrop-blur-[28px]" />
        </div>
        
        {/* Gradient de transição superior */}
        <div 
          className="absolute top-0 left-0 right-0 h-64 pointer-events-none z-20"
          style={{
            background: 'linear-gradient(to bottom, rgba(10,10,10,1) 0%, rgba(10,10,10,0.8) 40%, rgba(10,10,10,0) 100%)'
          }}
        />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true, amount: 0.2 }}
            className="space-y-12"
          >
            {/* Título Principal */}
            <div className="text-center space-y-6">
              <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-white tracking-tight leading-[1.1]">
                Quem Criou a DUA
              </h2>
              <p className="text-2xl sm:text-3xl md:text-4xl text-white/60 font-light max-w-4xl mx-auto leading-relaxed">
                Construída por um criador que viveu todos os lados.
              </p>
            </div>

            {/* Conteúdo Principal */}
            <div className="space-y-8 max-w-5xl mx-auto pt-8">
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                viewport={{ once: true, amount: 0.3 }}
                className="text-xl sm:text-2xl md:text-3xl text-white/70 font-light leading-relaxed text-center"
              >
                A DUA nasceu das mãos de alguém que conhece tanto palcos de festivais quanto bairros periféricos. 
                Alguém que viveu a exploração da indústria musical, a falta de acesso a ferramentas profissionais 
                e a solidão de tentar construir algo do zero.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
                viewport={{ once: true, amount: 0.3 }}
                className="pt-8 space-y-6"
              >
                <p className="text-xl sm:text-2xl text-white font-light leading-relaxed text-center">
                  A DUA é prova de que é possível reescrever as regras quando o sistema não te deixa jogar. 
                  Foi construída por quem precisava dela para sobreviver e decidiu partilhá-la com toda a 
                  comunidade lusófona.
                </p>
                
                <p className="text-lg sm:text-xl md:text-2xl text-white/50 font-light leading-relaxed text-center italic pt-4">
                  Sem equipa inicial. Sem investimento externo.
                  <span className="block mt-2">Apenas uma visão clara e uma teimosia inabalável.</span>
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Gradient de transição inferior */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none z-20"
          style={{
            background: 'linear-gradient(to bottom, rgba(10,10,10,0) 0%, rgba(10,10,10,0.8) 70%, rgba(10,10,10,1) 100%)'
          }}
        />
      </section>

      {/* SEÇÃO 5: O ECOSSISTEMA 2 LADOS */}
      <section className="relative py-24 bg-[#0a0a0a] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-100">
            <source
              src="https://6yep4uifnoow71ty.public.blob.vercel-storage.com/transferir%20%2853%29.mp4"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-[#0a0a0a]/92 backdrop-blur-[28px]" />
        </div>

        {/* Gradient de transição superior */}
        <div 
          className="absolute top-0 left-0 right-0 h-64 pointer-events-none z-20"
          style={{
            background: 'linear-gradient(to bottom, rgba(10,10,10,1) 0%, rgba(10,10,10,0.8) 40%, rgba(10,10,10,0) 100%)'
          }}
        />

        <div className="relative z-10">
          <Bento3Section />
        </div>

        {/* Gradient de transição inferior */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none z-20"
          style={{
            background: 'linear-gradient(to bottom, rgba(10,10,10,0) 0%, rgba(10,10,10,0.8) 70%, rgba(10,10,10,1) 100%)'
          }}
        />
      </section>

      {/* SEÇÃO 6: CALL TO ACTION */}
      <section className="relative py-48 px-6 bg-[#0a0a0a] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-100">
            <source
              src="https://6yep4uifnoow71ty.public.blob.vercel-storage.com/transferir%20%2853%29.mp4"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-[#0a0a0a]/90 backdrop-blur-[30px]" />
        </div>
        
        {/* Gradient de transição superior */}
        <div 
          className="absolute top-0 left-0 right-0 h-64 pointer-events-none z-20"
          style={{
            background: 'linear-gradient(to bottom, rgba(10,10,10,1) 0%, rgba(10,10,10,0.8) 40%, rgba(10,10,10,0) 100%)'
          }}
        />
        
        <div className="max-w-6xl mx-auto text-center space-y-16 relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true, amount: 0.3 }}
            className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-light text-white tracking-tight leading-[0.95] max-w-5xl mx-auto"
          >
            A DUA não é só uma ferramenta
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            viewport={{ once: true, amount: 0.3 }}
            className="text-3xl sm:text-4xl text-white/50 font-light max-w-4xl mx-auto leading-relaxed"
          >
            É a resposta de quem decidiu que já chega de esperar.{" "}
            <span className="block mt-4">Junta-te à revolução criativa lusófona.</span>
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
            viewport={{ once: true, amount: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4"
          >
            <Button
              size="lg"
              className="rounded-full px-14 py-8 bg-white hover:bg-white/95 text-black font-medium text-lg transition-all duration-500 hover:scale-105 shadow-2xl"
              onClick={() => router.push("/registo")}
            >
              Começar Agora
              <ArrowRight className="ml-3 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-14 py-8 border border-white/30 text-white hover:bg-white/10 font-medium text-lg transition-all duration-500 hover:scale-105 bg-transparent backdrop-blur-sm"
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

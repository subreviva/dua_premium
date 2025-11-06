"use client"

import { Button } from "@/components/ui/button"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { motion, useScroll, useTransform } from "framer-motion"
import { Video, ImageIcon, Music, Palette, MessageSquare, ArrowRight, Home, Users, Sparkles, Building2, Coins } from "lucide-react"
import { useRouter } from "next/navigation"
import { useRef } from "react"
import { FeatureSteps } from "@/components/ui/feature-steps"
import { Gallery6 } from "@/components/ui/gallery6"
import { FeatureShowcase, type TabMedia } from "@/components/ui/feature-showcase"
import { Bento3Section } from "@/components/ui/bento-monochrome-1"
import { CommunityPreview } from "@/components/community-preview"
import { EcosystemSimple } from "@/components/ui/ecosystem-simple"
import { HeroFounder } from "@/components/ui/hero-founder"

export default function HomePage() {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.08])
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -80])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0.8])

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] antialiased">
      <Navbar />

      {/* HERO SECTION - Ultra Premium */}
      <section className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
        <motion.div 
          style={{ scale: heroScale, y: heroY, opacity: heroOpacity }}
          className="absolute inset-0 z-0"
        >
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover opacity-100"
          >
            <source
              src="https://6yep4uifnoow71ty.public.blob.vercel-storage.com/transferir%20%2853%29.mp4"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/70" />
          {/* Vignette effect for premium look */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
        </motion.div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="flex flex-col gap-12 sm:gap-16 lg:gap-20 items-center justify-center max-w-7xl w-full mx-auto text-center">
            {/* Animated accent */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10"
            >
              <Sparkles className="w-4 h-4 text-white/90" />
              <span className="text-sm font-medium text-white/90 tracking-wide">Plataforma de Criação com IA</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-[8rem] sm:text-[12rem] md:text-[16rem] lg:text-[20rem] xl:text-[24rem] font-extralight leading-[0.85] tracking-[-0.08em] text-white drop-shadow-2xl"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 100 }}
            >
              DUA
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/90 font-light max-w-4xl leading-relaxed tracking-wide px-4"
            >
              Onde a próxima onda de criatividade
              <br className="hidden sm:block" /> 
              lusófona acontece
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <Button
                size="lg"
                className="group w-full sm:w-auto rounded-full px-10 sm:px-14 py-6 sm:py-8 bg-white hover:bg-white text-black font-semibold text-base sm:text-lg transition-all duration-700 hover:scale-[1.08] hover:shadow-[0_20px_80px_rgba(255,255,255,0.3)] active:scale-95 relative overflow-hidden"
                onClick={() => router.push("/acesso")}
              >
                <span className="relative z-10 flex items-center gap-3">
                  Obter Acesso Antecipado
                  <ArrowRight className="w-5 h-5 transition-transform duration-500 group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Enhanced gradient transition */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-96 pointer-events-none z-20"
          style={{
            background: 'linear-gradient(to bottom, rgba(10,10,10,0) 0%, rgba(10,10,10,0.3) 30%, rgba(10,10,10,0.7) 60%, rgba(10,10,10,0.95) 90%, rgba(10,10,10,1) 100%)'
          }}
        />
      </section>

      {/* SEÇÃO 2: STUDIOS CAROUSEL - Premium Edition */}
      <section className="relative py-32 sm:py-40 lg:py-48 px-4 sm:px-6 lg:px-8 bg-[#1a1a1a] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover opacity-100"
          >
            <source
              src="https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/dreamina-2025-10-27-6815-ultra%204k%20-%20elegante%2C%20simples%2C%20movimento%20....mp4"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-[#1a1a1a]/70 backdrop-blur-[20px]" />
        </div>
        
        {/* Enhanced gradient transition superior */}
        <div 
          className="absolute top-0 left-0 right-0 h-72 pointer-events-none z-20"
          style={{
            background: 'linear-gradient(to bottom, rgba(10,10,10,1) 0%, rgba(26,26,26,0.7) 30%, rgba(26,26,26,0) 100%)'
          }}
        />
        
        <div className="relative z-10">
          <Gallery6 heading="Estúdios Criativos" />
        </div>

        {/* Enhanced gradient transition inferior */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-72 pointer-events-none z-20"
          style={{
            background: 'linear-gradient(to bottom, rgba(26,26,26,0) 0%, rgba(26,26,26,0.7) 70%, rgba(26,26,26,1) 100%)'
          }}
        />
      </section>

      {/* SEÇÃO 3: IDENTIDADE - Refined Premium */}
      <section className="relative py-32 sm:py-40 lg:py-48 px-4 sm:px-6 lg:px-8 bg-[#1a1a1a] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover opacity-100"
          >
            <source
              src="https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/dreamina-2025-10-27-6815-ultra%204k%20-%20elegante%2C%20simples%2C%20movimento%20....mp4"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-[#1a1a1a]/70 backdrop-blur-[20px]" />
        </div>
        
        {/* Enhanced gradient transition superior */}
        <div 
          className="absolute top-0 left-0 right-0 h-72 pointer-events-none z-20"
          style={{
            background: 'linear-gradient(to bottom, rgba(26,26,26,1) 0%, rgba(26,26,26,0.7) 30%, rgba(26,26,26,0) 100%)'
          }}
        />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <FeatureShowcase
            eyebrow="Identidade"
            title="A Identidade Visual da DUA"
            description="Não é só código. É uma presença. A DUA tem rosto, voz e história."
            stats={["Identidade única", "Comunicação próxima", "Propósito claro"]}
            steps={[
              {
                id: "rosto",
                title: "Tem Rosto",
                text: "A DUA não é um logo abstrato. Ela tem uma identidade visual, tem rosto, essência e propósito. Num setor onde os bastidores continuam ocupados por figuras masculinas, optámos por dar forma à DUA com uma imagem que representa força, ancestralidade e presença."
              },
              {
                id: "voz",
                title: "Tem Voz",
                text: "Comunica em português de Portugal e crioulo cabo-verdiano. A voz não é robótica, é próxima e profissional. Podes falar com ela ou escrever. Ela responde por texto ou áudio, como uma parceira real."
              },
              {
                id: "historia",
                title: "Tem História",
                text: "A DUA nasceu da necessidade. Foi criada por alguém que estava cansado de depender de sistemas que não serviam os criadores. Nasceu entre código e música, num quarto, de madrugadas passadas a programar."
              }
            ]}
            tabs={[
              {
                value: "rosto",
                label: "Rosto",
                src: "https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/DUA%201.jpeg",
                alt: "Identidade visual da DUA"
              },
              {
                value: "voz",
                label: "Voz",
                src: "https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/DDDD.png",
                alt: "Comunicação da DUA"
              },
              {
                value: "historia",
                label: "História",
                src: "https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/DUA%203.jpeg",
                alt: "Origem da DUA"
              }
            ]}
            defaultTab="rosto"
            panelMinHeight={600}
            className="bg-transparent text-white"
          />
        </div>

        {/* Enhanced gradient transition inferior */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-72 pointer-events-none z-20"
          style={{
            background: 'linear-gradient(to bottom, rgba(26,26,26,0) 0%, rgba(26,26,26,0.7) 70%, rgba(26,26,26,1) 100%)'
          }}
        />
      </section>

      {/* SEÇÃO 4: O ECOSSISTEMA 2 LADOS - Simple & Elegant */}
      <section className="relative py-28 sm:py-32 lg:py-36 px-4 sm:px-6 lg:px-8 bg-[#1a1a1a] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover opacity-100"
          >
            <source
              src="https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/dreamina-2025-10-27-6815-ultra%204k%20-%20elegante%2C%20simples%2C%20movimento%20....mp4"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-[#1a1a1a]/70 backdrop-blur-[20px]" />
        </div>
        
        {/* Enhanced gradient transition superior */}
        <div 
          className="absolute top-0 left-0 right-0 h-72 pointer-events-none z-20"
          style={{
            background: 'linear-gradient(to bottom, rgba(26,26,26,1) 0%, rgba(26,26,26,0.7) 30%, rgba(26,26,26,0) 100%)'
          }}
        />
        
        <div className="relative z-10">
          <EcosystemSimple
            pillars={[
              {
                icon: Building2,
                title: "2 LADOS: A Casa-Mãe",
                subtitle: "O pilar físico e técnico do ecossistema",
                description: "O estúdio criativo que disponibiliza serviços visuais, sonoros e digitais (com ou sem IA), aluguer de material técnico e estúdios profissionais. Onde a experiência humana encontra a inovação tecnológica.",
                image: "https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/dreamina-2025-10-27-3815-estu%CC%81dio%20criativo%2C%20artistas%20a%20trabalhar%20e....jpeg"
              },
              {
                icon: Coins,
                title: "DUA Coin: Economia Criativa",
                subtitle: "A moeda do ecossistema 2 LADOS",
                description: "Um ativo real que apoia artistas e financia Bolsas Criativas. Crescimento transparente em 3 fases: €0.30 → €0.60 → €1.20. Cada DUA Coin movimenta talento, tecnologia e impacto social real.",
                image: "https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/DUA%20COIN1.jpeg",
                phase: "Fase 1: €0.30"
              }
            ]}
          />
        </div>

        {/* Enhanced gradient transition inferior */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-72 pointer-events-none z-20"
          style={{
            background: 'linear-gradient(to bottom, rgba(26,26,26,0) 0%, rgba(26,26,26,0.7) 70%, rgba(26,26,26,1) 100%)'
          }}
        />
      </section>

      {/* SEÇÃO 5: COMUNIDADE CRIATIVA - Premium Stories Carousel */}
      <section className="relative py-32 sm:py-40 lg:py-48 px-4 sm:px-6 lg:px-8 bg-[#1a1a1a] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover opacity-100"
          >
            <source
              src="https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/dreamina-2025-10-27-6815-ultra%204k%20-%20elegante%2C%20simples%2C%20movimento%20....mp4"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-[#1a1a1a]/70 backdrop-blur-[20px]" />
        </div>
        
        {/* Enhanced gradient transition superior */}
        <div 
          className="absolute top-0 left-0 right-0 h-72 pointer-events-none z-20"
          style={{
            background: 'linear-gradient(to bottom, rgba(26,26,26,1) 0%, rgba(26,26,26,0.7) 30%, rgba(26,26,26,0) 100%)'
          }}
        />
        
        {/* Header Section with constrained width */}
        <div className="max-w-7xl mx-auto relative z-10 mb-16 sm:mb-20 lg:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true, amount: 0.3 }}
            className="text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6"
            >
              <Users className="w-4 h-4 text-white/70" />
              <span className="text-sm text-white/70 font-light">Comunidade</span>
            </motion.div>
            
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extralight text-white tracking-tight leading-[1.1] mb-6 px-4">
              Criadores{" "}
              <span className="font-light text-white/90">Lusófonos</span>
            </h2>
            
            <p className="text-xl sm:text-2xl lg:text-3xl text-white/70 font-light max-w-3xl mx-auto leading-relaxed px-4">
              Descobre o que a comunidade está a criar com a DUA
            </p>
          </motion.div>
        </div>

        {/* Stories Carousel - Full width for horizontal scroll */}
        <div className="relative z-10 w-full">
          <CommunityPreview />
        </div>

        {/* Enhanced gradient transition inferior */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-72 pointer-events-none z-20"
          style={{
            background: 'linear-gradient(to bottom, rgba(26,26,26,0) 0%, rgba(26,26,26,0.7) 70%, rgba(26,26,26,1) 100%)'
          }}
        />
      </section>

      {/* SEÇÃO 5.5: HERO FUNDADOR - História da DUA */}
      <section className="relative bg-[#1a1a1a]">
        <HeroFounder />
      </section>

      {/* SEÇÃO 6: CALL TO ACTION - Ultimate Premium */}
      <section className="relative py-36 sm:py-48 lg:py-56 px-4 sm:px-6 lg:px-8 bg-[#1a1a1a] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover opacity-100"
          >
            <source
              src="https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/dreamina-2025-10-27-6815-ultra%204k%20-%20elegante%2C%20simples%2C%20movimento%20....mp4"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-[#1a1a1a]/70 backdrop-blur-[20px]" />
        </div>
        
        {/* Enhanced gradient transition superior */}
        <div 
          className="absolute top-0 left-0 right-0 h-72 pointer-events-none z-20"
          style={{
            background: 'linear-gradient(to bottom, rgba(26,26,26,1) 0%, rgba(26,26,26,0.7) 30%, rgba(26,26,26,0) 100%)'
          }}
        />
        
        <div className="max-w-6xl mx-auto text-center space-y-12 sm:space-y-16 lg:space-y-20 relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true, amount: 0.3 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-extralight text-white tracking-tight leading-[1.1] max-w-5xl mx-auto px-4"
          >
            A DUA não é só
            <br />
            <span className="font-light">uma ferramenta</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            viewport={{ once: true, amount: 0.3 }}
            className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl text-white/80 font-light max-w-4xl mx-auto leading-[1.4] px-4"
          >
            É a resposta de quem decidiu que
            <br className="hidden sm:block" />
            <span className="text-white font-normal">já chega de esperar</span>
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            viewport={{ once: true, amount: 0.3 }}
            className="text-xl sm:text-2xl lg:text-3xl text-white/70 font-light max-w-3xl mx-auto px-4"
          >
            Junta-te à revolução criativa lusófona.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
            viewport={{ once: true, amount: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-6 sm:pt-8 px-4"
          >
            <Button
              size="lg"
              className="group w-full sm:w-auto rounded-full px-12 sm:px-16 py-7 sm:py-9 bg-white hover:bg-white text-black font-semibold text-base sm:text-lg transition-all duration-700 hover:scale-[1.08] hover:shadow-[0_20px_80px_rgba(255,255,255,0.3)] active:scale-95 relative overflow-hidden"
              onClick={() => router.push("/registo")}
            >
              <span className="relative z-10 flex items-center gap-3">
                Começar Agora
                <ArrowRight className="w-5 h-5 transition-transform duration-500 group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="group w-full sm:w-auto rounded-full px-12 sm:px-16 py-7 sm:py-9 border-2 border-white/20 text-white hover:bg-white/5 hover:border-white/30 font-semibold text-base sm:text-lg transition-all duration-700 hover:scale-[1.05] bg-transparent backdrop-blur-xl hover:shadow-[0_10px_40px_rgba(255,255,255,0.1)] active:scale-95"
              onClick={() => router.push("/chat")}
            >
              <span className="flex items-center gap-3">
                Explorar o Ecossistema
                <ArrowRight className="w-5 h-5 transition-transform duration-500 group-hover:translate-x-1" />
              </span>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}

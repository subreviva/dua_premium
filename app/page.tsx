"use client"

import { Button } from "@/components/ui/button"
import Footer from "@/components/footer"
import { motion, useScroll, useTransform } from "framer-motion"
import { Video, ImageIcon, Music, Palette, MessageSquare, ArrowRight, Home, Users, Building2, Coins } from "lucide-react"
import { useRouter } from "next/navigation"
import { useRef } from "react"
import { FeatureSteps } from "@/components/ui/feature-steps"
import { Gallery6 } from "@/components/ui/gallery6"
import { FeatureShowcase, type TabMedia } from "@/components/ui/feature-showcase"
import SectionTitle from "@/components/ui/section-title"
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
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] antialiased overflow-x-hidden touch-pan-y">
      {/* HERO SECTION - Ultra Premium iOS-like Mobile First */}
      <section className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
        <motion.div 
          style={{ 
            scale: heroScale, 
            y: heroY, 
            opacity: heroOpacity 
          }}
          className="absolute inset-0 z-0"
        >
          {/* Video Background - ULTRA OPTIMIZADO Desktop + Mobile Loop Perfeito */}
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            preload="auto"
            controls={false}
            disablePictureInPicture
            disableRemotePlayback
            className="absolute inset-0 w-full h-full object-cover"
            style={{ 
              filter: 'brightness(1.35) contrast(1.12) saturate(1.15)',
              WebkitBackfaceVisibility: 'hidden',
              WebkitPerspective: 1000,
              WebkitTransform: 'translate3d(0,0,0)',
              transform: 'translate3d(0,0,0)'
            }}
            onLoadedData={(e) => {
              const video = e.currentTarget
              console.log('✅ Video loaded successfully')
              video.play().catch((err) => {
                console.log('Video autoplay blocked, trying again...', err)
                setTimeout(() => video.play(), 100)
              })
            }}
            onEnded={(e) => {
              // Garante loop contínuo sem frames
              const video = e.currentTarget
              video.currentTime = 0
              video.play()
            }}
            onPause={(e) => {
              // Previne pausas não intencionais
              const video = e.currentTarget
              if (!video.ended) {
                setTimeout(() => video.play(), 50)
              }
            }}
            onError={(e) => {
              console.error('❌ Video failed to load:', e)
            }}
          >
            <source
              src="https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/Rcio_de_aspeto_202511130721_a6fd6.mp4"
              type="video/mp4"
            />
          </video>
          
          {/* Fallback gradient harmonioso com o vídeo - tons roxo/rosa/verde */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-950/40 via-slate-950 to-pink-950/35" style={{ zIndex: -1 }} />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.15),transparent_50%)]" style={{ zIndex: -1 }} />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(236,72,153,0.12),transparent_50%)]" style={{ zIndex: -1 }} />
          
          {/* Gradient overlays ULTRA PREMIUM - iOS Style - Mais leve para melhor visibilidade */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/15 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Vignette lateral premium - mais leve */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 md:from-black/25 md:to-black/25" />
          
          {/* Vignette radial iOS-like - mais suave */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.25)_60%,rgba(0,0,0,0.5)_100%)]" />
        </motion.div>

        {/* Content Container - iOS Premium Spacing - Conteúdo ainda mais elevado mobile */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-24 md:py-32 lg:py-40">
          <div className="flex flex-col gap-1.5 sm:gap-6 md:gap-8 lg:gap-12 items-center justify-center max-w-7xl w-full mx-auto text-center">

            {/* Badge UPDATE - FIXO NO TOPO - NÃO MEXER */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="mb-0"
            >
              <p className="text-xs sm:text-sm md:text-base text-white/70 font-light tracking-wide">
                A criatividade lusófona tem uma nova casa
              </p>
            </motion.div>

            {/* ESPAÇADOR - Empurra DUA para baixo - ainda menor mobile */}
            <div className="h-6 sm:h-0" />

            {/* Logo "DUA" - Estilo Google Flow gigante */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="font-extralight text-white w-full text-center"
              style={{ 
                fontSize: 'clamp(10rem, 32vw, 42rem)',
                fontFamily: "var(--font-sans)", 
                fontWeight: 100,
                textShadow: '0 30px 150px rgba(0,0,0,0.99), 0 15px 75px rgba(0,0,0,0.95), 0 8px 40px rgba(0,0,0,0.9)',
                letterSpacing: '-0.08em',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                textRendering: 'optimizeLegibility',
                lineHeight: '0.8',
                margin: '0 auto',
              }}
            >
              DUA
            </motion.h1>

            {/* Tagline - Estilo Google Flow */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 font-light max-w-3xl leading-relaxed px-6 sm:px-8"
              style={{ 
                textShadow: '0 4px 30px rgba(0,0,0,0.9), 0 2px 15px rgba(0,0,0,0.7)',
                letterSpacing: '-0.01em'
              }}
            >
              Onde a próxima onda de criatividade lusófona acontece
            </motion.p>

            {/* Botões Google Flow Style - Ainda menores e mais elegantes mobile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="w-full sm:w-auto px-6 sm:px-0 mt-1.5 sm:mt-4 md:mt-8 flex flex-col sm:flex-row gap-2.5 items-center justify-center"
            >
              <Button
                size="lg"
                className="w-full sm:w-auto rounded-full px-7 sm:px-12 py-3 sm:py-5 bg-white/[0.12] hover:bg-white/[0.18] active:bg-white/[0.15] text-white font-light text-[13px] sm:text-lg transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] shadow-[0_8px_32px_rgba(0,0,0,0.6),0_1px_4px_rgba(255,255,255,0.1)_inset] hover:shadow-[0_12px_48px_rgba(0,0,0,0.4),0_2px_8px_rgba(255,255,255,0.15)_inset] border-0"
                onClick={() => router.push("/waitlist")}
                style={{
                  backdropFilter: 'blur(20px) saturate(160%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(160%)',
                }}
              >
                <span className="relative z-10 tracking-wide">
                  Obter Acesso
                </span>
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto rounded-full px-7 sm:px-12 py-3 sm:py-5 bg-transparent hover:bg-white/[0.08] active:bg-white/[0.05] text-white font-light text-[13px] sm:text-lg transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] border border-white/20 hover:border-white/30"
                onClick={() => router.push("/acesso")}
                style={{
                  backdropFilter: 'blur(20px) saturate(160%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(160%)',
                }}
              >
                <span className="relative z-10 tracking-wide">
                  Tenho o código
                </span>
              </Button>
            </motion.div>

            {/* Ícone Scroll Ultra Premium iOS - Animado */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-2 sm:mt-10 md:mt-14"
            >
              <motion.div
                animate={{ 
                  y: [0, 8, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="flex flex-col items-center gap-3 cursor-pointer group"
                onClick={() => {
                  window.scrollTo({ 
                    top: window.innerHeight, 
                    behavior: 'smooth' 
                  })
                }}
              >
                {/* Mouse/Scroll Indicator Premium */}
                <div className="relative w-7 h-11 rounded-full border-2 border-white/20 group-hover:border-white/40 transition-all duration-500 backdrop-blur-xl bg-white/[0.05]">
                  {/* Scroll Dot Animado */}
                  <motion.div
                    animate={{
                      y: [4, 16, 4],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white/80 rounded-full"
                  />
                </div>
                
                {/* Texto discreto */}
                <span className="text-[10px] sm:text-xs text-white/40 group-hover:text-white/60 transition-colors font-light tracking-widest uppercase">
                  Scroll
                </span>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Enhanced gradient transition - Premium Bottom Fade to Pure Black */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-80 pointer-events-none z-[5]"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.95) 85%, rgba(0,0,0,1) 100%)'
          }}
        />
      </section>

      {/* SEÇÃO 2: STUDIOS CAROUSEL - Premium Edition */}
      <section className="relative py-16 sm:py-32 lg:py-48 px-3 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* Pure black background with subtle accent - Revolut/Apple style */}
          <div className="absolute inset-0 bg-black" />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-950/[0.03] via-black to-purple-950/[0.02]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.03),transparent_50%)]" />
        </div>
        
        {/* Enhanced gradient transition superior */}
        <div 
          className="absolute top-0 left-0 right-0 h-48 sm:h-72 pointer-events-none z-20"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 30%, transparent 100%)'
          }}
        />        <div className="relative z-10">
          <SectionTitle eyebrow="Explore" title="Estúdios Criativos" kicker="Cinco estúdios especializados para a tua criatividade" />
          <Gallery6 heading="" />
        </div>

        {/* Enhanced gradient transition inferior */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-48 sm:h-72 pointer-events-none z-20"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,1) 100%)'
          }}
        />
      </section>

      {/* SEÇÃO 3: FEATURE SHOWCASE - Elegant Tabs */}
      <section className="relative py-16 sm:py-32 lg:py-48 px-3 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* Pure black with subtle purple gradient - Apple style */}
          <div className="absolute inset-0 bg-black" />
          <div className="absolute inset-0 bg-gradient-to-bl from-purple-950/[0.04] via-black to-blue-950/[0.02]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(147,51,234,0.04),transparent_60%)]" />
        </div>
        
        {/* Enhanced gradient transition superior */}
        <div 
          className="absolute top-0 left-0 right-0 h-48 sm:h-72 pointer-events-none z-20"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 30%, transparent 100%)'
          }}
        />
        
        <div className="max-w-7xl mx-auto relative z-10">
          {/* SectionTitle component */}
          <div className="mb-8 sm:mb-12 lg:mb-16 px-4 sm:px-6 md:px-0">
            <SectionTitle 
              eyebrow="Identidade" 
              title="A Identidade Visual da DUA" 
              kicker="Não é só código. É uma presença.
A DUA tem rosto, voz e história."
            />
          </div>
          
          <div className="px-4 sm:px-6 md:px-0">
            <FeatureShowcase
              eyebrow=""
              title=""
              description=""
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
                alt: "Identidade visual da DUA",
                objectPosition: "center 30%"
              },
              {
                value: "voz",
                label: "Voz",
                src: "https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/DDDD.png",
                alt: "Comunicação da DUA",
                objectPosition: "center 35%"
              },
              {
                value: "historia",
                label: "História",
                src: "https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/DUA%203.jpeg",
                alt: "Origem da DUA",
                objectPosition: "center 30%"
              }
            ]}
            defaultTab="rosto"
            panelMinHeight={600}
            className="bg-transparent text-white"
          />
          </div>
        </div>

        {/* Enhanced gradient transition inferior */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-72 pointer-events-none z-20"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,1) 100%)'
          }}
        />
      </section>

      {/* SEÇÃO 4: O ECOSSISTEMA 2 LADOS - Simple & Elegant */}
      <section className="relative py-16 sm:py-28 lg:py-36 px-3 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* Pure black - Awwwards minimalist style */}
          <div className="absolute inset-0 bg-black" />
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-950/[0.02] via-black to-black" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.02),transparent_70%)]" />
        </div>
        
        {/* Enhanced gradient transition superior */}
        <div 
          className="absolute top-0 left-0 right-0 h-48 sm:h-72 pointer-events-none z-20"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 30%, transparent 100%)'
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
              },
              {
                icon: Music,
                title: "Kyntal: Distribuição Digital",
                subtitle: "A primeira distribuidora portuguesa com IA",
                description: "A distribuidora digital de música do ecossistema 2 LADOS com inteligência artificial própria (a DUA). Autonomia total para artistas emergentes lançarem música nacional e internacionalmente. Artistas que usam a Kyntal geram DUA Coin ao atingir metas, reinvestindo em serviços 2 LADOS.",
                image: "https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/dreamina-2025-10-27-3815-estu%CC%81dio%20criativo%2C%20artistas%20a%20trabalhar%20e....jpeg"
              }
            ]}
          />
        </div>

        {/* Enhanced gradient transition inferior */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-72 pointer-events-none z-20"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,1) 100%)'
          }}
        />
      </section>

      {/* SEÇÃO 4: MONOCHROME BENTO - Premium Grid */}
      <section className="relative py-16 sm:py-28 lg:py-36 px-3 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* Pure black - Premium minimal */}
          <div className="absolute inset-0 bg-black" />
          <div className="absolute inset-0 bg-gradient-to-tl from-purple-950/[0.03] via-black to-black" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(147,51,234,0.03),transparent_70%)]" />
        </div>
        
        {/* Enhanced gradient transition superior */}
        <div 
          className="absolute top-0 left-0 right-0 h-48 sm:h-72 pointer-events-none z-20"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 30%, transparent 100%)'
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
              Descobre o que a comunidade<br />
              está a criar com a DUA
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
            background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,1) 100%)'
          }}
        />
      </section>

      {/* SEÇÃO 5.5: HERO FUNDADOR - História da DUA */}
      <section className="relative" style={{ background: 'linear-gradient(to br, rgba(0,0,0,1) 0%, rgba(10,10,10,1) 50%, rgba(0,0,0,1) 100%)' }}>
        <HeroFounder />
      </section>

      {/* SEÇÃO 6: CALL TO ACTION - Ultimate Premium */}
      <section className="relative py-20 sm:py-36 lg:py-56 px-3 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* Pure black - Revolut final CTA style */}
          <div className="absolute inset-0 bg-black" />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-950/[0.02] via-black to-black" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.03),transparent_70%)]" />
        </div>
        
        {/* Enhanced gradient transition superior */}
        <div 
          className="absolute top-0 left-0 right-0 h-72 pointer-events-none z-20"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 30%, transparent 100%)'
          }}
        />
        
        {/* MOBILE VERSION - Clean Centered Final CTA */}
        <div className="lg:hidden max-w-xl mx-auto text-center space-y-10 relative z-10">
          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-5xl font-extralight text-white tracking-tight leading-[1.1]">
              A DUA não é só<br />
              <span className="font-light">uma ferramenta</span>
            </h2>
            
            <p className="text-2xl text-white/90 font-light leading-relaxed">
              É a resposta de quem decidiu que<br />
              <span className="text-white font-normal">já chega de esperar</span>
            </p>
          </motion.div>

          {/* Separator Line */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            viewport={{ once: true }}
            className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />

          {/* Revolution Text */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            viewport={{ once: true }}
            className="text-xl text-white/80 font-light leading-relaxed"
          >
            Junta-te à revolução criativa lusófona
          </motion.p>

          {/* Action Buttons - Premium Style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
            viewport={{ once: true }}
            className="flex flex-col gap-4 pt-4"
          >
            <Button
              size="lg"
              className="w-full gap-3 bg-white text-black hover:bg-white/90 active:bg-white/80 font-medium text-base px-8 py-7 rounded-2xl transition-all duration-300 shadow-2xl shadow-white/20 touch-manipulation"
            >
              Começar Agora <ArrowRight className="w-5 h-5" />
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              className="w-full gap-3 border-2 border-white/30 bg-transparent hover:bg-white/10 active:bg-white/15 text-white font-light text-base px-8 py-7 rounded-2xl transition-all duration-300 touch-manipulation"
            >
              Explorar Estúdios
            </Button>
          </motion.div>
        </div>

        {/* DESKTOP VERSION - Original */}
        <div className="hidden lg:block max-w-6xl mx-auto text-center space-y-12 sm:space-y-16 lg:space-y-20 relative z-10">
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
            Junta-te à revolução criativa lusófona
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
            viewport={{ once: true, amount: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-6 sm:pt-8 px-4"
          >
            {/* Botão Premium Transparente - Começar Agora */}
            <div className="relative group">
              {/* Glow effect premium */}
              <div className="absolute -inset-1 bg-gradient-to-r from-white/20 via-white/30 to-white/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <Button
                size="lg"
                className="relative w-full sm:w-auto rounded-full px-8 sm:px-10 py-5 sm:py-6 bg-white/5 hover:bg-white/10 text-white font-light text-sm sm:text-base transition-all duration-700 hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_24px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_32px_rgba(255,255,255,0.15)] border border-white/20 hover:border-white/40 backdrop-blur-xl"
                onClick={() => router.push("/acesso")}
              >
                <span className="relative z-10 flex items-center gap-2 sm:gap-3 justify-center tracking-wide">
                  Começar Agora
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-700 group-hover:translate-x-2" />
                </span>
              </Button>
            </div>
            
            {/* Botão Premium Transparente - Explorar */}
            <div className="relative group">
              {/* Glow effect premium */}
              <div className="absolute -inset-1 bg-gradient-to-r from-white/15 via-white/25 to-white/15 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <Button
                size="lg"
                variant="outline"
                className="relative w-full sm:w-auto rounded-full px-8 sm:px-10 py-5 sm:py-6 border border-white/20 hover:border-white/40 text-white/90 hover:text-white hover:bg-white/5 font-light text-sm sm:text-base transition-all duration-700 hover:scale-[1.02] bg-transparent backdrop-blur-xl hover:shadow-[0_8px_32px_rgba(255,255,255,0.1)] active:scale-[0.98]"
                onClick={() => router.push("/acesso")}
              >
                <span className="flex items-center gap-2 sm:gap-3 tracking-wide">
                  Explorar o Ecossistema
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-700 group-hover:translate-x-2" />
                </span>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}

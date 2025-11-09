"use client"

import { Button } from "@/components/ui/button"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { Video, ImageIcon, Music, Palette, MessageSquare, ArrowRight, Home, Users, Building2, Coins, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useRef, useState, useEffect } from "react"
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
  const [showIOSBanner, setShowIOSBanner] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detectar mobile e verificar se já instalou
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      
      // Mostrar banner apenas em mobile e se não instalou antes
      if (mobile && !localStorage.getItem('dua-app-installed')) {
        setShowIOSBanner(true)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Função para instalar PWA automaticamente
  const handleInstallPWA = async () => {
    // Marcar como instalado
    localStorage.setItem('dua-app-installed', 'true')
    setShowIOSBanner(false)
    
    // Tentar instalar PWA automaticamente
    if ('serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window) {
      // PWA já deve estar registrado pelo Next.js
      // Mostrar prompt de instalação nativo se disponível
      const deferredPrompt = (window as any).deferredPrompt
      if (deferredPrompt) {
        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        console.log(`User response to install prompt: ${outcome}`)
        ;(window as any).deferredPrompt = null
      }
    }
    
    // iOS: usuário precisa adicionar manualmente via Safari
    // Mostrar instrução apenas se iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    if (isIOS) {
      alert('📱 Para instalar:\n1. Toque no botão compartilhar ⬆️\n2. Selecione "Adicionar à Tela de Início"')
    }
  }
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.08])
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -80])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0.8])

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] antialiased overflow-x-hidden touch-pan-y">
      <Navbar />

      {/* iOS APP BANNER - PILL DISCRETO */}
      <AnimatePresence>
        {showIOSBanner && isMobile && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="pointer-events-auto">
              {/* Pill ultra-discreto */}
              <div className="relative bg-black/70 backdrop-blur-xl border border-white/20 rounded-full px-3 py-1.5 shadow-lg">
                <div className="flex items-center gap-2">
                  {/* Ícone mini */}
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-[9px] font-bold text-white">D</span>
                  </div>

                  {/* Texto compacto */}
                  <span className="text-white/90 text-xs font-medium">
                    Instalar App
                  </span>

                  {/* Botão compacto */}
                  <button
                    onClick={handleInstallPWA}
                    className="px-3 py-1 bg-blue-500/90 hover:bg-blue-600 text-white text-[11px] font-semibold rounded-full transition-all"
                  >
                    OK
                  </button>

                  {/* Close mini */}
                  <button
                    onClick={() => setShowIOSBanner(false)}
                    className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                    aria-label="Fechar"
                  >
                    <X className="w-3 h-3 text-white/70" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO SECTION - Ultra Premium iOS-like */}
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
              filter: 'brightness(0.95) contrast(1.08) saturate(1.1)',
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
              src="https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/transferir (53).mp4"
              type="video/mp4"
            />
            {/* Fallback com URL encoded */}
            <source
              src="https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/transferir%20%2853%29.mp4"
              type="video/mp4"
            />
          </video>
          
          {/* Fallback gradient se vídeo não carregar */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black to-pink-900/30" style={{ zIndex: -1 }} />
          
          {/* Gradient overlays ULTRA PREMIUM - Estilo FLOW */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          
          {/* Vignette lateral para depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
          
          {/* Vignette radial premium */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.3)_60%,rgba(0,0,0,0.7)_100%)]" />
        </motion.div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 md:py-32 lg:py-40">
          <div className="flex flex-col gap-8 sm:gap-10 lg:gap-14 items-center justify-center max-w-7xl w-full mx-auto text-center">

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-[20rem] sm:text-[22rem] md:text-[24rem] lg:text-[26rem] xl:text-[30rem] font-extralight leading-[0.7] tracking-[-0.14em] text-white"
              style={{ 
                fontFamily: "var(--font-sans)", 
                fontWeight: 100,
                textShadow: '0 24px 140px rgba(0,0,0,0.99), 0 12px 70px rgba(0,0,0,0.95), 0 6px 35px rgba(0,0,0,0.8)',
                letterSpacing: '-0.14em',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                textRendering: 'optimizeLegibility'
              }}
            >
              DUA
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/95 font-light max-w-4xl leading-relaxed px-4"
              style={{ textShadow: '0 4px 30px rgba(0,0,0,0.9), 0 2px 15px rgba(0,0,0,0.7)' }}
            >
              Onde a próxima onda de criatividade
              <br className="hidden sm:block" /> 
              lusófona acontece
            </motion.p>

            {/* Botão Elegante Transparente - Ultra Premium */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="w-full sm:w-auto px-4 sm:px-0 mt-6 sm:mt-8"
            >
              <div className="relative group">
                {/* Glow effect sutil */}
                <div className="absolute -inset-1 bg-gradient-to-r from-white/10 via-white/20 to-white/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <Button
                  size="lg"
                  className="relative w-full sm:w-auto rounded-full px-8 sm:px-10 py-4 sm:py-5 bg-white/5 hover:bg-white/10 text-white font-light text-base sm:text-lg transition-all duration-700 hover:scale-[1.02] active:scale-[0.98] shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_48px_rgba(255,255,255,0.15)] border border-white/20 hover:border-white/40"
                  onClick={() => router.push("/acesso")}
                  style={{
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)'
                  }}
                >
                  <span className="relative z-10 flex items-center gap-2.5 sm:gap-3 justify-center tracking-wide">
                    Obter Acesso
                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-700 group-hover:translate-x-1" />
                  </span>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Enhanced gradient transition - NÃO afeta o botão */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-80 pointer-events-none z-[5]"
          style={{
            background: 'linear-gradient(to bottom, rgba(10,10,10,0) 0%, rgba(10,10,10,0.3) 30%, rgba(10,10,10,0.7) 60%, rgba(10,10,10,0.95) 90%, rgba(10,10,10,1) 100%)'
          }}
        />
      </section>

      {/* SEÇÃO 2: STUDIOS CAROUSEL - Premium Edition */}
      <section className="relative py-16 sm:py-32 lg:py-48 px-3 sm:px-6 lg:px-8 bg-[#1a1a1a] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            preload="auto"
            controls={false}
            disablePictureInPicture
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
          className="absolute top-0 left-0 right-0 h-48 sm:h-72 pointer-events-none z-20"
          style={{
            background: 'linear-gradient(to bottom, rgba(10,10,10,1) 0%, rgba(26,26,26,0.7) 30%, rgba(26,26,26,0) 100%)'
          }}
        />
        
        <div className="relative z-10">
          <SectionTitle eyebrow="Explore" title="Estúdios Criativos" kicker="Cinco estúdios especializados para a tua criatividade" />
          <Gallery6 heading="" />
        </div>

        {/* Enhanced gradient transition inferior */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-48 sm:h-72 pointer-events-none z-20"
          style={{
            background: 'linear-gradient(to bottom, rgba(26,26,26,0) 0%, rgba(26,26,26,0.7) 70%, rgba(26,26,26,1) 100%)'
          }}
        />
      </section>

      {/* SEÇÃO 3: FEATURE SHOWCASE - Elegant Tabs */}
      <section className="relative py-16 sm:py-32 lg:py-48 px-3 sm:px-6 lg:px-8 bg-[#1a1a1a] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            preload="auto"
            controls={false}
            disablePictureInPicture
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
          className="absolute top-0 left-0 right-0 h-48 sm:h-72 pointer-events-none z-20"
          style={{
            background: 'linear-gradient(to bottom, rgba(26,26,26,1) 0%, rgba(26,26,26,0.7) 30%, rgba(26,26,26,0) 100%)'
          }}
        />
        
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Destaque em Mobile - Linha decorativa */}
          <div className="mb-8 sm:mb-12 px-4 sm:px-0">
            <div className="h-1 w-12 sm:w-16 bg-gradient-to-r from-white/80 via-white/40 to-transparent rounded-full mb-6 sm:mb-8" />
            
            <div>
              <p className="text-sm sm:text-base text-white/50 font-light mb-2 uppercase tracking-widest">Identidade</p>
              <h3 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extralight text-white tracking-tighter leading-[0.9] bg-gradient-to-br from-white via-white/95 to-white/70 bg-clip-text text-transparent md:bg-none md:text-white mb-4">
                A Identidade Visual da DUA
              </h3>
              <p className="text-lg sm:text-xl text-white/60 font-light">
                Não é só código. É uma presença. A DUA tem rosto, voz e história.
              </p>
            </div>
          </div>
          
          <FeatureShowcase
            eyebrow="Identidade"
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
      <section className="relative py-16 sm:py-28 lg:py-36 px-3 sm:px-6 lg:px-8 bg-[#1a1a1a] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            preload="auto"
            controls={false}
            disablePictureInPicture
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
          className="absolute top-0 left-0 right-0 h-48 sm:h-72 pointer-events-none z-20"
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
            background: 'linear-gradient(to bottom, rgba(26,26,26,0) 0%, rgba(26,26,26,0.7) 70%, rgba(26,26,26,1) 100%)'
          }}
        />
      </section>

      {/* SEÇÃO 4: MONOCHROME BENTO - Premium Grid */}
      <section className="relative py-16 sm:py-28 lg:py-36 px-3 sm:px-6 lg:px-8 bg-[#1a1a1a] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            preload="auto"
            controls={false}
            disablePictureInPicture
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
          className="absolute top-0 left-0 right-0 h-48 sm:h-72 pointer-events-none z-20"
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
      <section className="relative py-20 sm:py-36 lg:py-56 px-3 sm:px-6 lg:px-8 bg-[#1a1a1a] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            preload="auto"
            controls={false}
            disablePictureInPicture
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

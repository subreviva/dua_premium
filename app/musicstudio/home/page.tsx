"use client"
import { Music, Library, Mic, ArrowRight, Home, Camera, Menu as MenuIcon, MoreHorizontal, Play, Pause, SkipBack, SkipForward, Heart, Share2, Download, Loader2, Clock, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { AppSidebar } from "@/components/app-sidebar"
import { FeaturedTracksCarousel } from "@/components/featured-tracks-carousel"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useUnifiedMusic } from "@/contexts/unified-music-context"
import { useGeneration } from "@/contexts/generation-context"
import { useState, useEffect } from "react"

type ActiveTab = 'inicio' | 'biblioteca'

export default function HomePage() {
  const router = useRouter()
  const { currentTrack, isPlaying, playGeneratedTrack, pause, resume } = useUnifiedMusic()
  const { tasks, completedTracks } = useGeneration()
  const [recentTracks, setRecentTracks] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<ActiveTab>('inicio')

  // Buscar músicas recentes do usuário
  useEffect(() => {
    const fetchRecentTracks = async () => {
      try {
        const response = await fetch('/api/music/list')
        if (response.ok) {
          const data = await response.json()
          setRecentTracks(data.tracks?.slice(0, 5) || [])
        }
      } catch (error) {
        console.error('Erro ao carregar músicas:', error)
      }
    }
    fetchRecentTracks()
  }, [])

  // 🎵 NAVEGAÇÃO AUTOMÁTICA: Muda para "Biblioteca" quando começa geração
  useEffect(() => {
    if (tasks.length > 0) {
      const hasActiveTasks = tasks.some(task => 
        task.status !== "SUCCESS" && 
        !task.error && 
        !task.status.includes("FAILED")
      )
      if (hasActiveTasks) {
        setActiveTab('biblioteca')
      }
    }
  }, [tasks])

  return (
    <div className="flex h-screen overflow-hidden bg-black">
      {/* Sidebar - apenas desktop */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* 🎵 MOBILE: Conteúdo ultra premium estilo Suno.com */}
        <div className="md:hidden flex-1 overflow-hidden pb-[calc(88px+env(safe-area-inset-bottom))] flex flex-col">
          
          {/* 🎨 TABS DE NAVEGAÇÃO - Ultra Premium iOS */}
          <div className="flex-shrink-0 px-6 pt-4 pb-3">
            <div className="flex gap-2.5">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveTab('inicio')}
                className={`
                  relative flex-1 px-5 py-3 rounded-2xl font-semibold text-[15px] tracking-tight transition-all duration-300
                  ${activeTab === 'inicio' 
                    ? 'text-white bg-white/15 shadow-lg shadow-white/5' 
                    : 'text-white/50 hover:text-white/70 hover:bg-white/5'
                  }
                `}
              >
                {activeTab === 'inicio' && (
                  <motion.div layoutId="activeTabBg" className="absolute inset-0 bg-white/15 rounded-2xl" />
                )}
                <span className="relative z-10">Início</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveTab('biblioteca')}
                className={`
                  relative flex-1 px-5 py-3 rounded-2xl font-semibold text-[15px] tracking-tight transition-all duration-300
                  ${activeTab === 'biblioteca' 
                    ? 'text-white bg-white/15 shadow-lg shadow-white/5' 
                    : 'text-white/50 hover:text-white/70 hover:bg-white/5'
                  }
                `}
              >
                {activeTab === 'biblioteca' && (
                  <motion.div layoutId="activeTabBg" className="absolute inset-0 bg-white/15 rounded-2xl" />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  Biblioteca
                  {tasks.length > 0 && (
                    <span className="px-2 py-0.5 bg-white text-black text-[10px] font-semibold rounded-full">
                      {tasks.length}
                    </span>
                  )}
                </span>
              </motion.button>
            </div>
          </div>

          {/* 🎨 CONTEÚDO DAS TABS */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {activeTab === 'inicio' && (
                <motion.div
                  key="inicio"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  {/* Hero Cover Banner - Estilo "Your Sound. Your Stage" do Suno */}
                  <div className="relative h-[460px] overflow-hidden">
                    {/* Background com imagem real de estúdio */}
                    <div className="absolute inset-0">
                      {/* Imagem de estúdio de música */}
                      <Image 
                        src="https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/eb97b50a-8e56-4c9f-a46b-e8b127ad3df5.png" 
                        alt="Estúdio de Música" 
                        fill
                        className="object-cover"
                        priority
                      />
                      
                      {/* Overlay gradiente para texto legível e estética premium */}
                      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black" />
                      
                      {/* Blur sutil no topo para integração com navbar */}
                      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm" />
                    </div>

                    {/* Conteúdo do Hero */}
                    <div className="relative z-10 h-full flex flex-col justify-end p-6 pb-10">
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      >
                        {/* Badge premium */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.6, delay: 0.2 }}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 mb-5 shadow-2xl"
                        >
                          <div className="relative">
                            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                            <div className="absolute inset-0 w-2 h-2 rounded-full bg-white animate-ping" />
                          </div>
                          <span className="text-[12px] font-medium text-white tracking-normal">
                            Ao Vivo
                          </span>
                        </motion.div>

                        {/* Título principal - PT-PT */}
                        <h1 className="text-[40px] leading-[1.1] font-display font-semibold tracking-tight text-white mb-4 drop-shadow-2xl">
                          O Teu Som.
                          <br />
                          O Teu Palco.
                        </h1>
                        
                        {/* Descrição - PT-PT */}
                        <p className="text-[15px] text-white/70 font-light leading-relaxed mb-7 drop-shadow-lg max-w-[320px]">
                          Dá vida à tua criatividade e transforma as tuas canções em produções profissionais com IA.
                        </p>

                        {/* CTA Button - Ultra Premium */}
                        <motion.button
                          onClick={() => router.push('/musicstudio/create')}
                          whileTap={{ scale: 0.96 }}
                          className="group relative inline-flex items-center justify-center px-7 py-3.5 bg-white hover:bg-white/95 text-black font-medium text-[15px] rounded-lg shadow-2xl shadow-black/50 transition-all"
                        >
                          Começar a Criar
                        </motion.button>
                      </motion.div>
                    </div>
                  </div>

          {/* 🎵 Featured Tracks Carousel - Ultra Elegante */}
          <div className="relative bg-gradient-to-b from-black via-zinc-950 to-black pb-10">
            {/* Header Premium */}
            <div className="px-6 pt-10 pb-7 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <h2 className="text-[26px] font-display font-semibold text-white tracking-tight">
                  Para Ti
                </h2>
                <p className="text-[13px] text-white/40 font-light">
                  Criações recentes da tua biblioteca
                </p>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => router.push('/musicstudio/library')}
                className="px-4 py-2 rounded-lg bg-white/5 backdrop-blur-xl border border-white/10 active:bg-white/10 transition-all"
              >
                <span className="text-[13px] font-medium text-white/80">Ver Tudo</span>
              </motion.button>
            </div>

            {/* Music Cards - Músicas Reais do Sistema */}
            <div className="px-6 space-y-4">
              {recentTracks.length > 0 ? (
                recentTracks.map((track, index) => {
                  const trackId = track.audioId || track.id
                  const isCurrentPlaying = currentTrack && (
                    ('audioId' in currentTrack && currentTrack.audioId === trackId) ||
                    ('id' in currentTrack && currentTrack.id === trackId)
                  ) && isPlaying
                  const isCurrentTrack = currentTrack && (
                    ('audioId' in currentTrack && currentTrack.audioId === trackId) ||
                    ('id' in currentTrack && currentTrack.id === trackId)
                  )
                  
                  return (
                    <motion.div
                      key={track.audioId || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileTap={{ scale: 0.98 }}
                      className="group cursor-pointer"
                      onClick={() => isCurrentPlaying ? pause() : playGeneratedTrack(track)}
                    >
                      <div className={`relative rounded-2xl overflow-hidden backdrop-blur-xl transition-all ${
                        isCurrentTrack 
                          ? 'bg-gradient-to-br from-purple-900/50 via-zinc-900/80 to-zinc-950/80 border border-purple-500/30 shadow-xl shadow-purple-500/20' 
                          : 'bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 border border-white/[0.06] hover:border-white/[0.12]'
                      }`}>
                        {/* Glow effect quando playing */}
                        {isCurrentPlaying && (
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 animate-pulse" />
                        )}
                        
                        <div className="relative p-4">
                          <div className="flex items-center gap-4">
                            {/* Album Art */}
                            <motion.div 
                              animate={isCurrentPlaying ? { scale: [1, 1.03, 1] } : {}}
                              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                              className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 shadow-xl"
                            >
                              {track.imageUrl ? (
                                <Image 
                                  src={track.imageUrl} 
                                  alt={track.title}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center">
                                  <Music className="w-10 h-10 text-white/90" strokeWidth={2} />
                                </div>
                              )}
                              
                              {/* Play indicator overlay */}
                              {isCurrentPlaying && (
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                                  <div className="flex gap-1">
                                    <motion.div 
                                      animate={{ scaleY: [1, 0.5, 1] }}
                                      transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
                                      className="w-1 h-5 bg-white rounded-full"
                                    />
                                    <motion.div 
                                      animate={{ scaleY: [1, 0.5, 1] }}
                                      transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                                      className="w-1 h-5 bg-white rounded-full"
                                    />
                                    <motion.div 
                                      animate={{ scaleY: [1, 0.5, 1] }}
                                      transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                                      className="w-1 h-5 bg-white rounded-full"
                                    />
                                  </div>
                                </div>
                              )}
                            </motion.div>

                            {/* Track Info */}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-[17px] font-medium text-white mb-1 truncate">
                                {track.title}
                              </h3>
                              <div className="flex items-center gap-2 text-[13px] text-white/50 mb-2">
                                <span className="truncate">{track.tags || 'Música IA'}</span>
                              </div>
                              <div className="flex items-center gap-3 text-[12px] text-white/50">
                                <span className="flex items-center gap-1">
                                  <Music className="w-3 h-3" />
                                  {track.duration ? `${Math.floor(track.duration / 60)}:${String(Math.floor(track.duration % 60)).padStart(2, '0')}` : '2:08'}
                                </span>
                                {track.modelName && (
                                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/70 text-[10px] font-semibold uppercase tracking-wider">
                                    {track.modelName}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Play/Pause Button */}
                            <motion.button 
                              whileTap={{ scale: 0.9 }}
                              className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-black shadow-xl shadow-black/30 flex-shrink-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                isCurrentPlaying ? pause() : playGeneratedTrack(track)
                              }}
                            >
                              {isCurrentPlaying ? (
                                <Pause className="w-5 h-5" fill="currentColor" strokeWidth={0} />
                              ) : (
                                <Play className="w-5 h-5 ml-0.5" fill="currentColor" strokeWidth={0} />
                              )}
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              ) : (
                // Placeholder quando não há músicas
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12"
                  >
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center mx-auto mb-4">
                      <Music className="w-10 h-10 text-white/40" strokeWidth={2} />
                    </div>
                    <h3 className="text-[17px] font-medium text-white mb-2">
                      Ainda sem músicas
                    </h3>
                    <p className="text-[14px] text-white/40 mb-6 max-w-[260px] mx-auto">
                      Cria a tua primeira faixa e vê-a aparecer aqui
                    </p>
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={() => router.push('/musicstudio/create')}
                      className="px-6 py-3 rounded-lg bg-white text-black font-medium text-sm shadow-xl"
                    >
                      Criar Agora
                    </motion.button>
                  </motion.div>
                </>
              )}
            </div>
          </div>

          {/* 🎨 Seção de Ferramentas - Carrossel Mobile */}
          <div className="relative bg-gradient-to-b from-black via-zinc-950/50 to-black py-12">
            {/* Header */}
            <div className="px-6 mb-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 mb-5"
              >
                <div className="w-2 h-2 rounded-full bg-white" />
                <span className="text-[11px] font-medium text-white/70 tracking-normal">
                  Ferramentas
                </span>
              </motion.div>
              <h2 className="text-[26px] font-display font-semibold text-white tracking-tight mb-3">
                Quatro Formas de Criar
              </h2>
              <p className="text-[14px] text-white/40 font-light leading-relaxed max-w-[300px] mx-auto">
                Escolhe a ferramenta perfeita para dar vida às tuas ideias musicais
              </p>
            </div>

            {/* Carrossel Horizontal */}
            <div className="relative">
              {/* Fade Gradients */}
              <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
              
              {/* Scroll Container */}
              <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory">
                <div className="flex gap-4 px-6 pb-2">
                  {[
                    {
                      href: "/musicstudio/create",
                      number: "01",
                      title: "Texto → Música",
                      description: "Descreve a tua visão e cria faixas completas instantaneamente",
                    },
                    {
                      href: "/melody",
                      number: "02",
                      title: "Melodia → Música",
                      description: "Transforma as tuas melodias em produções épicas",
                    },
                    {
                      href: "/studio",
                      number: "03",
                      title: "Estúdios de Edição",
                      description: "Edita, adiciona efeitos e finaliza as tuas criações",
                    },
                    {
                      href: "/musicstudio/library",
                      number: "04",
                      title: "Biblioteca Musical",
                      description: "Acede a todas as tuas criações e favoritos",
                    },
                  ].map((action, index) => (
                    <motion.div
                      key={action.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="flex-shrink-0 w-[300px] snap-center"
                    >
                      <Link href={action.href} className="group block">
                        <div className="relative h-[220px] overflow-hidden rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/10 p-6 transition-all">
                          {/* Number Badge */}
                          <div className="absolute top-4 right-4">
                            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                              <span className="text-sm font-medium text-white/40">{action.number}</span>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="relative h-full flex flex-col justify-between">
                            <div>
                              <h3 className="text-[19px] font-medium mb-2 text-white/90 tracking-tight">
                                {action.title}
                              </h3>
                              <p className="text-[14px] text-white/40 font-light leading-relaxed">
                                {action.description}
                              </p>
                            </div>

                            {/* Arrow */}
                            <div className="flex items-center gap-2 text-white/50 group-hover:text-white/80 transition-colors">
                              <span className="text-sm font-medium">Explorar</span>
                              <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Scroll Indicators */}
              <div className="flex items-center justify-center gap-2 mt-6">
                <div className="w-6 h-1 rounded-full bg-white/20" />
                <div className="w-6 h-1 rounded-full bg-white/10" />
                <div className="w-6 h-1 rounded-full bg-white/10" />
              </div>
            </div>
          </div>

          {/* 🎵 CARROSSEL PREMIUM - Músicas em Destaque da Comunidade */}
          <div className="relative bg-gradient-to-b from-black via-zinc-950 to-black pb-12">
            {/* Header elegante */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              className="px-6 pt-8 pb-6"
            >
              <h2 className="text-[32px] font-display font-semibold text-white tracking-tight mb-2 leading-tight">
                Em Destaque
              </h2>
              <p className="text-[15px] text-white/50 font-light">
                Criado com <span className="font-semibold text-white">DUA</span> por artistas de todo o mundo
              </p>
            </motion.div>

            {/* Carrossel Horizontal Ultra Premium */}
            <div className="relative">
              {/* Fade Gradients nas bordas */}
              <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
              
              {/* Scroll Container */}
              <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory">
                <div className="flex gap-4 px-6 pb-2">
                  {/* Track 1: Ainda Não Acabou */}
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-shrink-0 w-[280px] snap-center"
                  >
                    <div className="group relative rounded-3xl overflow-hidden bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] hover:border-white/20 transition-all duration-500 shadow-2xl hover:shadow-3xl hover:scale-[1.02]">
                      {/* Cover Image */}
                      <div className="relative w-full h-[280px] overflow-hidden">
                        <Image
                          src="https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=800&fit=crop&q=80"
                          alt="Ainda Não Acabou"
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Overlay gradiente */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                        
                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <motion.div
                            whileTap={{ scale: 0.9 }}
                            className="w-16 h-16 rounded-full bg-white/95 backdrop-blur-xl flex items-center justify-center shadow-2xl shadow-black/50 cursor-pointer"
                          >
                            <Play className="w-7 h-7 text-black ml-1" fill="currentColor" strokeWidth={0} />
                          </motion.div>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-5">
                        <h3 className="text-base font-semibold text-white mb-1.5 truncate tracking-tight">
                          Ainda Não Acabou
                        </h3>
                        <p className="text-sm text-white/50 font-light mb-3">
                          Riicky
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/70 tracking-wide">
                            Portuguese Pop
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.button>

                  {/* Track 2: Struggle Symphony */}
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-shrink-0 w-[280px] snap-center"
                  >
                    <div className="group relative rounded-3xl overflow-hidden bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] hover:border-white/20 transition-all duration-500 shadow-2xl hover:shadow-3xl hover:scale-[1.02]">
                      <div className="relative w-full h-[280px] overflow-hidden">
                        <Image
                          src="https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&h=800&fit=crop&q=80"
                          alt="Struggle Symphony"
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                        
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <motion.div
                            whileTap={{ scale: 0.9 }}
                            className="w-16 h-16 rounded-full bg-white/95 backdrop-blur-xl flex items-center justify-center shadow-2xl shadow-black/50 cursor-pointer"
                          >
                            <Play className="w-7 h-7 text-black ml-1" fill="currentColor" strokeWidth={0} />
                          </motion.div>
                        </div>
                      </div>

                      <div className="p-5">
                        <h3 className="text-base font-semibold text-white mb-1.5 truncate tracking-tight">
                          Struggle Symphony
                        </h3>
                        <p className="text-sm text-white/50 font-light mb-3">
                          FabyJunior
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/70 tracking-wide">
                            Orchestral Rock
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.button>

                  {/* Track 3: Bo Surrize */}
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-shrink-0 w-[280px] snap-center"
                  >
                    <div className="group relative rounded-3xl overflow-hidden bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] hover:border-white/20 transition-all duration-500 shadow-2xl hover:shadow-3xl hover:scale-[1.02]">
                      <div className="relative w-full h-[280px] overflow-hidden">
                        <Image
                          src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=800&fit=crop&q=80"
                          alt="Bo Surrize"
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                        
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <motion.div
                            whileTap={{ scale: 0.9 }}
                            className="w-16 h-16 rounded-full bg-white/95 backdrop-blur-xl flex items-center justify-center shadow-2xl shadow-black/50 cursor-pointer"
                          >
                            <Play className="w-7 h-7 text-black ml-1" fill="currentColor" strokeWidth={0} />
                          </motion.div>
                        </div>
                      </div>

                      <div className="p-5">
                        <h3 className="text-base font-semibold text-white mb-1.5 truncate tracking-tight">
                          Bo Surrize Ta Alegra-m
                        </h3>
                        <p className="text-sm text-white/50 font-light mb-3">
                          Joana Gonçalves
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/70 tracking-wide">
                            Cabo Verde
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.button>

                  {/* Track 4: Amor e Paz */}
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-shrink-0 w-[280px] snap-center"
                  >
                    <div className="group relative rounded-3xl overflow-hidden bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] hover:border-white/20 transition-all duration-500 shadow-2xl hover:shadow-3xl hover:scale-[1.02]">
                      <div className="relative w-full h-[280px] overflow-hidden">
                        <Image
                          src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=800&fit=crop&q=80"
                          alt="Amor e Paz"
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                        
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <motion.div
                            whileTap={{ scale: 0.9 }}
                            className="w-16 h-16 rounded-full bg-white/95 backdrop-blur-xl flex items-center justify-center shadow-2xl shadow-black/50 cursor-pointer"
                          >
                            <Play className="w-7 h-7 text-black ml-1" fill="currentColor" strokeWidth={0} />
                          </motion.div>
                        </div>
                      </div>

                      <div className="p-5">
                        <h3 className="text-base font-semibold text-white mb-1.5 truncate tracking-tight">
                          Amor e Paz
                        </h3>
                        <p className="text-sm text-white/50 font-light mb-3">
                          Riicky
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/70 tracking-wide">
                            Reggae
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.button>

                  {/* Track 5: Revolution in the Air */}
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-shrink-0 w-[280px] snap-center"
                  >
                    <div className="group relative rounded-3xl overflow-hidden bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] hover:border-white/20 transition-all duration-500 shadow-2xl hover:shadow-3xl hover:scale-[1.02]">
                      <div className="relative w-full h-[280px] overflow-hidden">
                        <Image
                          src="https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&h=800&fit=crop&q=80"
                          alt="Revolution in the Air"
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                        
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <motion.div
                            whileTap={{ scale: 0.9 }}
                            className="w-16 h-16 rounded-full bg-white/95 backdrop-blur-xl flex items-center justify-center shadow-2xl shadow-black/50 cursor-pointer"
                          >
                            <Play className="w-7 h-7 text-black ml-1" fill="currentColor" strokeWidth={0} />
                          </motion.div>
                        </div>
                      </div>

                      <div className="p-5">
                        <h3 className="text-base font-semibold text-white mb-1.5 truncate tracking-tight">
                          Revolution in the Air
                        </h3>
                        <p className="text-sm text-white/50 font-light mb-3">
                          Joana Gonçalves
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/70 tracking-wide">
                            Rock Anthem
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                </div>
              </div>

              {/* Scroll Indicator - Sutil */}
              <div className="flex items-center justify-center gap-1.5 mt-6">
                <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
              </div>
            </div>
          </div>

          {/* Info Footer */}
          <div className="relative bg-gradient-to-b from-black to-zinc-950 py-16 px-6">
            <div className="max-w-sm mx-auto text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center mx-auto mb-6">
                <Music className="w-8 h-8 text-white/40" strokeWidth={2} />
              </div>
              <h3 className="text-[18px] font-medium text-white mb-3">
                Pronto para Criar?
              </h3>
              <p className="text-[13px] text-white/40 font-light leading-relaxed mb-8">
                Explora todas as ferramentas criativas pelo menu inferior e começa a produzir música de nível profissional
              </p>
              <div className="flex items-center justify-center gap-2 text-[11px] text-white/30 font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span>Sistema Online</span>
              </div>
            </div>
          </div>
                </motion.div>
              )}

              {/* 🎵 TAB BIBLIOTECA - Músicas em Geração + Concluídas */}
              {activeTab === 'biblioteca' && (
                <motion.div
                  key="biblioteca"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="min-h-full bg-gradient-to-b from-black via-zinc-950 to-black px-6 py-6"
                >
                  {/* Header */}
                  <div className="mb-8">
                    <h2 className="text-[28px] font-semibold text-white tracking-tight mb-2">
                      A Tua Biblioteca
                    </h2>
                    <p className="text-[14px] text-white/40 font-light">
                      Acompanha as tuas criações em tempo real
                    </p>
                  </div>

                  {/* 🔥 MÚSICAS EM GERAÇÃO (AGUARDANDO) */}
                  {tasks.length > 0 && (
                    <div className="mb-10">
                      <div className="flex items-center gap-2 mb-5">
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                        <h3 className="text-[17px] font-medium text-white">
                          A Gerar ({tasks.length})
                        </h3>
                      </div>
                      
                      <div className="space-y-4">
                        {tasks.map((task, index) => {
                          const isCompleted = task.status === "SUCCESS"
                          const isFailed = task.error || task.status.includes("FAILED")
                          const isActive = !isCompleted && !isFailed
                          
                          return (
                            <motion.div
                              key={task.taskId}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.4, delay: index * 0.1 }}
                              className="group"
                            >
                              <div className="relative rounded-3xl overflow-hidden backdrop-blur-3xl bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 border border-white/[0.08] p-5 shadow-2xl">
                                {/* Glow animado para status ativo */}
                                {isActive && (
                                  <motion.div
                                    animate={{
                                      opacity: [0.3, 0.6, 0.3],
                                      scale: [1, 1.02, 1]
                                    }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute inset-0 bg-white/5"
                                  />
                                )}
                                
                                <div className="relative flex items-start gap-4">
                                  {/* Cover Placeholder com Loading */}
                                  <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                    {isActive && (
                                      <>
                                        {/* Shimmer effect */}
                                        <motion.div
                                          animate={{ x: ['-100%', '100%'] }}
                                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                                        />
                                        <Loader2 className="w-8 h-8 text-white animate-spin relative z-10" />
                                      </>
                                    )}
                                    {isCompleted && task.tracks.length > 0 && task.tracks[0].imageUrl && (
                                      <Image
                                        src={task.tracks[0].imageUrl}
                                        alt={task.tracks[0].title}
                                        fill
                                        className="object-cover"
                                      />
                                    )}
                                    {isCompleted && (
                                      <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                                        <CheckCircle2 className="w-8 h-8 text-green-400" />
                                      </div>
                                    )}
                                    {isFailed && (
                                      <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                                        <Clock className="w-8 h-8 text-red-400" />
                                      </div>
                                    )}
                                  </div>

                                  {/* Info */}
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-[15px] font-medium text-white mb-1 truncate">
                                      {task.tracks.length > 0 ? task.tracks[0].title : 'A Criar Música...'}
                                    </h4>
                                    <p className="text-[13px] text-white/60 mb-2 truncate">
                                      {task.prompt || 'A processar...'}
                                    </p>
                                    
                                    {/* Status & Progress */}
                                    <div className="flex items-center gap-2">
                                      {isActive && (
                                        <>
                                          <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                            <motion.div
                                              initial={{ width: 0 }}
                                              animate={{ width: `${task.progress}%` }}
                                              transition={{ duration: 0.5 }}
                                              className="h-full bg-white rounded-full"
                                            />
                                          </div>
                                          <span className="text-[11px] font-semibold text-white whitespace-nowrap">
                                            {task.progress}%
                                          </span>
                                        </>
                                      )}
                                      {isCompleted && (
                                        <span className="text-[11px] font-semibold text-green-400 flex items-center gap-1">
                                          <CheckCircle2 className="w-3 h-3" />
                                          Concluída
                                        </span>
                                      )}
                                      {isFailed && (
                                        <span className="text-[11px] font-semibold text-red-400">
                                          Erro
                                        </span>
                                      )}
                                    </div>
                                    
                                    {/* Status Message */}
                                    <p className="text-[11px] text-white/40 mt-1.5 truncate">
                                      {task.statusMessage}
                                    </p>
                                  </div>

                                  {/* Time Badge */}
                                  <div className="flex-shrink-0">
                                    <div className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                                      <span className="text-[10px] font-medium text-white/60">
                                        {Math.floor((Date.now() - task.startTime) / 1000)}s
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* 🎵 MÚSICAS CONCLUÍDAS */}
                  {completedTracks.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-5">
                        <Music className="w-5 h-5 text-white" />
                        <h3 className="text-[17px] font-medium text-white">
                          Concluídas ({completedTracks.length})
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        {completedTracks.slice(0, 6).map((track, index) => (
                          <motion.button
                            key={track.audioId || index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => playGeneratedTrack(track)}
                            className="group relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/10 hover:border-purple-500/30 transition-all"
                          >
                            {track.imageUrl && (
                              <Image
                                src={track.imageUrl}
                                alt={track.title}
                                fill
                                className="object-cover"
                              />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                            
                            {/* Play Button Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center">
                                <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                              </div>
                            </div>
                            
                            {/* Info */}
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                              <h4 className="text-[13px] font-medium text-white truncate mb-0.5">
                                {track.title}
                              </h4>
                              <p className="text-[10px] text-white/60 truncate">
                                {track.tags}
                              </p>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty State */}
                  {tasks.length === 0 && completedTracks.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/10 flex items-center justify-center mb-6">
                        <Library className="w-10 h-10 text-white/30" />
                      </div>
                      <h3 className="text-[19px] font-medium text-white mb-2">
                        Biblioteca Vazia
                      </h3>
                      <p className="text-[14px] text-white/40 mb-8 max-w-[280px]">
                        Começa a criar música para veres as tuas criações aqui
                      </p>
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => {
                          setActiveTab('inicio')
                          router.push('/musicstudio/create')
                        }}
                        className="px-6 py-3 bg-white text-black rounded-lg font-medium text-[14px] shadow-xl"
                      >
                        Criar Agora
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* DESKTOP: Layout ultra premium melhorado */}
        <div className="hidden md:flex md:flex-1 md:flex-col md:overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {/* Hero Section - Design Moderno */}
            <div className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 z-0">
                <Image 
                  src="https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/eb97b50a-8e56-4c9f-a46b-e8b127ad3df5.png" 
                  alt="Background" 
                  fill 
                  className="object-cover" 
                  priority 
                />
                <div className="absolute inset-0 bg-black/60" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black" />
              </div>

              <main className="relative z-10 w-full px-12 py-20">
                <div className="max-w-4xl mx-auto text-center">
                  <motion.div 
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <h1 className="text-6xl xl:text-7xl font-display font-semibold tracking-tight text-white mb-6 leading-[1.1]">
                      Crie Música
                      <br />
                      <span className="text-white/80">
                        Sem Limites
                      </span>
                    </h1>
                    
                    <p className="text-lg text-white/50 font-light leading-relaxed max-w-2xl mx-auto mb-10">
                      Transforme as tuas ideias em produções musicais profissionais com a tecnologia de IA mais avançada
                    </p>

                    {/* CTA Principal */}
                    <div className="flex items-center justify-center gap-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => router.push('/musicstudio/create')}
                        className="px-8 py-3.5 bg-white hover:bg-white/95 text-black font-medium text-base rounded-lg shadow-2xl shadow-black/40 transition-all"
                      >
                        Começar Agora
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => router.push('/musicstudio/library')}
                        className="px-8 py-3.5 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 text-white font-medium text-base rounded-lg transition-all"
                      >
                        Biblioteca
                      </motion.button>
                    </div>
                  </motion.div>
                </div>
              </main>
            </div>

            {/* Seção de Ferramentas - Carrossel Premium */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, margin: "-100px" }}
              className="relative overflow-hidden py-20"
            >
              {/* Gradiente de fundo completo */}
              <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950/50 to-zinc-950" />
              
              <div className="relative max-w-7xl mx-auto px-12">
                {/* Header */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  viewport={{ once: true }}
                  className="text-center mb-12"
                >
                  <h2 className="text-4xl font-display font-semibold text-white tracking-tight mb-4">
                    Quatro Formas de Criar
                  </h2>
                  <p className="text-base text-white/40 font-light max-w-2xl mx-auto">
                    Escolhe a ferramenta perfeita para dar vida às tuas ideias musicais
                  </p>
                </motion.div>

                {/* Carrossel de Cards */}
                <div className="relative">
                  {/* Fade Gradients mais suaves */}
                  <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent z-10 pointer-events-none" />
                  <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-zinc-950 via-zinc-950/80 to-transparent z-10 pointer-events-none" />
                  
                  {/* Scroll Container */}
                  <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4">
                    <div className="flex gap-6 px-12 min-w-max">
                      {[
                        {
                          href: "/musicstudio/create",
                          number: "01",
                          title: "Texto → Música",
                          description: "Descreve a tua visão e cria faixas completas instantaneamente",
                        },
                        {
                          href: "/melody",
                          number: "02",
                          title: "Melodia → Música",
                          description: "Transforma as tuas melodias em produções épicas",
                        },
                        {
                          href: "/studio",
                          number: "03",
                          title: "Estúdios de Edição",
                          description: "Edita, adiciona efeitos e finaliza as tuas criações",
                        },
                        {
                          href: "/musicstudio/library",
                          number: "04",
                          title: "Biblioteca Musical",
                          description: "Acede a todas as tuas criações e favoritos",
                        },
                      ].map((action, index) => (
                        <motion.div
                          key={action.href}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          viewport={{ once: true }}
                          className="snap-center"
                        >
                          <Link href={action.href} className="group block">
                            <div className="relative w-[380px] h-[280px] overflow-hidden rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/10 p-8 transition-all duration-500 hover:scale-[1.02]">
                              {/* Number Badge */}
                              <div className="absolute top-6 right-6">
                                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                  <span className="text-sm font-medium text-white/40">{action.number}</span>
                                </div>
                              </div>

                              {/* Content */}
                              <div className="relative h-full flex flex-col justify-between">
                                <div>
                                  <h3 className="text-2xl font-semibold mb-3 text-white/90 tracking-tight">
                                    {action.title}
                                  </h3>
                                  <p className="text-base text-white/40 font-light leading-relaxed">
                                    {action.description}
                                  </p>
                                </div>

                                {/* Arrow */}
                                <div className="flex items-center gap-2 text-white/60 group-hover:text-white/90 transition-colors">
                                  <span className="text-sm font-medium">Explorar</span>
                                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                  </svg>
                                </div>
                              </div>

                              {/* Hover Glow */}
                              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Scroll Indicators */}
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <div className="w-8 h-1 rounded-full bg-white/20" />
                    <div className="w-8 h-1 rounded-full bg-white/10" />
                    <div className="w-8 h-1 rounded-full bg-white/10" />
                    <div className="w-8 h-1 rounded-full bg-white/10" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Featured Tracks */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, margin: "-100px" }}
              className="relative bg-gradient-to-b from-zinc-950 via-black to-black py-28"
            >
              <div className="max-w-7xl mx-auto px-12">
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  viewport={{ once: true }}
                  className="mb-16 text-center"
                >
                  <h2 className="text-5xl xl:text-6xl font-display font-semibold text-white tracking-tight mb-6 leading-tight">
                    Em Destaque
                  </h2>
                  <p className="text-xl text-white/50 font-light tracking-wide">
                    Criado com <span className="font-semibold text-white">DUA</span> por artistas de todo o mundo
                  </p>
                </motion.div>
                <FeaturedTracksCarousel />
              </div>
            </motion.div>

            {/* Músicas Recentes - Seção Melhorada */}
            {recentTracks.length > 0 && (
              <div className="relative bg-gradient-to-b from-black via-zinc-950 to-black py-24">
                <div className="max-w-7xl mx-auto px-12">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-12">
                    <div>
                      <h2 className="text-4xl font-semibold text-white tracking-tight mb-3">
                        As Tuas Criações
                      </h2>
                      <p className="text-base text-white/40 font-light">
                        Músicas recentes da tua biblioteca
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => router.push('/musicstudio/library')}
                      className="px-5 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 text-white font-medium text-sm transition-all"
                    >
                      Ver Tudo
                    </motion.button>
                  </div>

                  {/* Grid de Músicas */}
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    {recentTracks.map((track, index) => {
                      const trackId = track.audioId || track.id
                      const isCurrentPlaying = currentTrack && (
                        ('audioId' in currentTrack && currentTrack.audioId === trackId) ||
                        ('id' in currentTrack && currentTrack.id === trackId)
                      ) && isPlaying
                      const isCurrentTrack = currentTrack && (
                        ('audioId' in currentTrack && currentTrack.audioId === trackId) ||
                        ('id' in currentTrack && currentTrack.id === trackId)
                      )
                      
                      return (
                        <motion.div
                          key={track.audioId || index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.05 }}
                          whileHover={{ y: -8 }}
                          whileTap={{ scale: 0.98 }}
                          className="group cursor-pointer"
                          onClick={() => isCurrentPlaying ? pause() : playGeneratedTrack(track)}
                        >
                          <div className={`relative rounded-3xl overflow-hidden backdrop-blur-xl transition-all ${
                            isCurrentTrack 
                              ? 'bg-gradient-to-br from-zinc-800/50 via-zinc-900/80 to-zinc-950/80 border border-white/30 shadow-2xl shadow-white/10' 
                              : 'bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 border border-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-white/5'
                          }`}>
                            {/* Cover */}
                            <div className="relative aspect-square overflow-hidden">
                              {track.imageUrl ? (
                                <Image 
                                  src={track.imageUrl} 
                                  alt={track.title}
                                  fill
                                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center">
                                  <Music className="w-16 h-16 text-white/90" strokeWidth={2} />
                                </div>
                              )}
                              
                              {/* Gradient Overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                              
                              {/* Play Button Overlay */}
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <motion.div
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="w-16 h-16 rounded-full bg-white/95 backdrop-blur-xl flex items-center justify-center shadow-2xl"
                                >
                                  {isCurrentPlaying ? (
                                    <Pause className="w-7 h-7 text-black" fill="currentColor" strokeWidth={0} />
                                  ) : (
                                    <Play className="w-7 h-7 text-black ml-1" fill="currentColor" strokeWidth={0} />
                                  )}
                                </motion.div>
                              </div>

                              {/* Playing Indicator */}
                              {isCurrentPlaying && (
                                <div className="absolute top-3 right-3">
                                  <div className="flex gap-1 bg-black/60 backdrop-blur-xl rounded-full px-3 py-2">
                                    <motion.div 
                                      animate={{ scaleY: [1, 0.5, 1] }}
                                      transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
                                      className="w-1 h-4 bg-white rounded-full"
                                    />
                                    <motion.div 
                                      animate={{ scaleY: [1, 0.5, 1] }}
                                      transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                                      className="w-1 h-4 bg-white rounded-full"
                                    />
                                    <motion.div 
                                      animate={{ scaleY: [1, 0.5, 1] }}
                                      transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                                      className="w-1 h-4 bg-white rounded-full"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Info */}
                            <div className="p-5">
                              <h3 className="text-base font-medium text-white mb-1 truncate">
                                {track.title}
                              </h3>
                              <p className="text-sm text-white/40 truncate mb-3">
                                {track.tags || 'Música IA'}
                              </p>
                              <div className="flex items-center justify-between text-xs text-white/40">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {track.duration ? `${Math.floor(track.duration / 60)}:${String(Math.floor(track.duration % 60)).padStart(2, '0')}` : '2:08'}
                                </span>
                                {track.modelName && (
                                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/60 text-[10px] font-semibold uppercase">
                                    {track.modelName}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* How It Works */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, margin: "-100px" }}
              className="relative bg-gradient-to-b from-black via-zinc-950 to-black"
            >
              <HowItWorksSection />
            </motion.div>

            {/* CTA Final - Design Premium */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, margin: "-100px" }}
              className="relative bg-black py-32 overflow-hidden"
            >
              <div className="relative max-w-5xl mx-auto px-12 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-5xl xl:text-6xl font-display font-semibold text-white mb-6 tracking-tight">
                    Cria a Tua Primeira Música
                  </h2>
                  
                  <p className="text-lg text-white/50 font-light mb-12 max-w-2xl mx-auto leading-relaxed">
                    Junta-te a milhares de artistas que já transformaram as suas ideias em música profissional
                  </p>
                  
                  <div className="flex items-center justify-center gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => router.push('/musicstudio/create')}
                      className="px-9 py-4 bg-white hover:bg-white/95 text-black font-medium text-lg rounded-lg shadow-2xl transition-all"
                    >
                      Criar Música Agora
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Footer Minimalista */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative bg-black border-t border-white/5 py-12"
            >
              <div className="max-w-7xl mx-auto px-12">
                <div className="flex items-center justify-between text-white/40 text-sm font-light">
                  <p>© 2025 DUA. Criando o futuro da música.</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span>Sistema Online</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
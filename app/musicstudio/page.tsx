"use client"
import { Music, Library, Mic, ArrowRight, Home, Camera, Menu as MenuIcon, MoreHorizontal, Play, Pause, SkipBack, SkipForward, Heart, Share2, Download, Loader2, Clock, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { AppSidebar } from "@/components/app-sidebar"
import { MusicStudioNavbar } from "@/components/music-studio-navbar"
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
        {/* 🎵 MOBILE: Navbar superior FIXA sem espaço (pt-safe) */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 pt-safe">
          <MusicStudioNavbar />
        </div>

        {/* DESKTOP: Navbar normal */}
        <div className="hidden md:block">
          <MusicStudioNavbar />
        </div>
        
        {/* 🎵 MOBILE: Conteúdo ultra premium estilo Suno.com */}
        <div className="md:hidden flex-1 overflow-hidden pt-[calc(56px+env(safe-area-inset-top))] pb-[calc(88px+env(safe-area-inset-bottom))] flex flex-col">
          
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
                    <span className="px-2 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-full">
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
                        src="/images/music-studio-abstract.jpg" 
                        alt="Estúdio de Música" 
                        fill
                        className="object-cover"
                        priority
                      />
                      
                      {/* Overlay gradiente para texto legível e estética premium */}
                      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black" />
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 via-transparent to-pink-600/20" />
                      
                      {/* Blur sutil no topo para integração com navbar */}
                      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm" />
                      
                      {/* Noise texture para depth */}
                      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuOSIgbnVtT2N0YXZlcz0iNCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZSkiLz48L3N2Zz4=')]" />
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
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 mb-5 shadow-2xl shadow-orange-500/10"
                        >
                          <Music className="w-3.5 h-3.5 text-orange-400" />
                          <span className="text-[12px] font-bold text-white tracking-wider uppercase">
                            Music Studio
                          </span>
                        </motion.div>

                        {/* Título principal - PT-PT */}
                        <h1 className="text-[44px] leading-[1.05] font-black tracking-tight text-white mb-4 drop-shadow-2xl">
                          O Teu Som.
                          <br />
                          O Teu Palco.
                        </h1>
                        
                        {/* Descrição - PT-PT */}
                        <p className="text-[16px] text-white/95 font-light leading-relaxed mb-7 drop-shadow-lg max-w-[320px]">
                          Dá vida à tua criatividade e transforma as tuas canções em produções profissionais com IA.
                        </p>

                        {/* CTA Button - Ultra Premium */}
                        <motion.button
                          onClick={() => router.push('/create')}
                          whileTap={{ scale: 0.96 }}
                          className="group relative inline-flex items-center gap-2.5 px-7 py-4 bg-white backdrop-blur-xl rounded-full shadow-2xl shadow-black/50 transition-all overflow-hidden"
                        >
                          {/* Glow animado */}
                          <motion.div
                            animate={{ 
                              opacity: [0.5, 1, 0.5],
                              scale: [1, 1.1, 1]
                            }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-0 bg-gradient-to-r from-orange-400 via-pink-400 to-orange-400 opacity-20 blur-xl"
                          />
                          
                          <span className="relative text-[16px] font-bold text-black tracking-tight">
                            Começar a Criar
                          </span>
                          <motion.div
                            animate={{ x: [0, 4, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            className="relative"
                          >
                            <ArrowRight className="w-5 h-5 text-black" strokeWidth={3} />
                          </motion.div>
                        </motion.button>
                      </motion.div>
                    </div>
                  </div>

          {/* 🎵 Featured Tracks Carousel - Ultra Elegante */}
          <div className="relative bg-gradient-to-b from-black via-zinc-950 to-black pb-10">
            {/* Header Premium */}
            <div className="px-6 pt-10 pb-7 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <h2 className="text-[30px] font-black text-white tracking-tight">
                  Para Ti
                </h2>
                <p className="text-[13px] text-white/50 font-light">
                  Criações recentes da tua biblioteca
                </p>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => router.push('/library')}
                className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 active:bg-white/15 transition-all"
              >
                <span className="text-[13px] font-semibold text-white">Ver Tudo</span>
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
                                <div className="w-full h-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center">
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
                              <h3 className="text-[18px] font-bold text-white mb-1 truncate">
                                {track.title}
                              </h3>
                              <div className="flex items-center gap-2 text-[13px] text-white/60 mb-2">
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
                    <h3 className="text-[18px] font-semibold text-white mb-2">
                      Ainda sem músicas
                    </h3>
                    <p className="text-[14px] text-white/50 mb-6 max-w-[260px] mx-auto">
                      Cria a tua primeira faixa e vê-a aparecer aqui
                    </p>
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={() => router.push('/musicstudio/create')}
                      className="px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-pink-600 text-white font-semibold shadow-xl shadow-orange-500/30"
                    >
                      Criar Agora
                    </motion.button>
                  </motion.div>
                </>
              )}
            </div>
          </div>

          {/* � CARROSSEL PREMIUM - Músicas em Destaque da Comunidade */}
          <div className="relative bg-gradient-to-b from-black via-zinc-950 to-black pb-12">
            {/* Header elegante */}
            <div className="px-6 pt-8 pb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-[28px] font-black text-white tracking-tight">
                  Em Destaque
                </h2>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500/10 to-pink-500/10 border border-orange-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                  <span className="text-[11px] font-bold text-orange-300 tracking-wider uppercase">
                    Comunidade
                  </span>
                </div>
              </div>
              <p className="text-[13px] text-white/50 font-light">
                Criado com DUA por artistas de todo o mundo
              </p>
            </div>

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
                    <div className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 border border-white/[0.06] hover:border-orange-400/30 transition-all shadow-xl hover:shadow-2xl hover:shadow-orange-500/10">
                      {/* Cover Image */}
                      <div className="relative w-full h-[280px] overflow-hidden">
                        <Image
                          src="https://cdn2.suno.ai/image_76f26d38-5ef4-4510-bcab-e4f50d4c7125.jpeg"
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
                      <div className="p-4">
                        <h3 className="text-[17px] font-bold text-white mb-1 truncate">
                          Ainda Não Acabou
                        </h3>
                        <p className="text-[13px] text-white/60 mb-2">
                          Riicky
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-[11px] font-semibold text-purple-300 uppercase tracking-wider">
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
                    <div className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 border border-white/[0.06] hover:border-red-400/30 transition-all shadow-xl hover:shadow-2xl hover:shadow-red-500/10">
                      <div className="relative w-full h-[280px] overflow-hidden">
                        <Image
                          src="https://cdn2.suno.ai/image_cb01ecb0-2e67-430c-bdae-d235fa14808a.jpeg"
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

                      <div className="p-4">
                        <h3 className="text-[17px] font-bold text-white mb-1 truncate">
                          Struggle Symphony
                        </h3>
                        <p className="text-[13px] text-white/60 mb-2">
                          FabyJunior
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full bg-red-500/20 border border-red-400/30 text-[11px] font-semibold text-red-300 uppercase tracking-wider">
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
                    <div className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 border border-white/[0.06] hover:border-cyan-400/30 transition-all shadow-xl hover:shadow-2xl hover:shadow-cyan-500/10">
                      <div className="relative w-full h-[280px] overflow-hidden">
                        <Image
                          src="https://cdn2.suno.ai/image_5de28091-36c4-4d33-8c15-af93d6c0a220.jpeg"
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

                      <div className="p-4">
                        <h3 className="text-[17px] font-bold text-white mb-1 truncate">
                          Bo Surrize Ta Alegra-m
                        </h3>
                        <p className="text-[13px] text-white/60 mb-2">
                          Joana Gonçalves
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-[11px] font-semibold text-cyan-300 uppercase tracking-wider">
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
                    <div className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 border border-white/[0.06] hover:border-green-400/30 transition-all shadow-xl hover:shadow-2xl hover:shadow-green-500/10">
                      <div className="relative w-full h-[280px] overflow-hidden">
                        <Image
                          src="https://cdn2.suno.ai/image_76f26d38-5ef4-4510-bcab-e4f50d4c7125.jpeg"
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

                      <div className="p-4">
                        <h3 className="text-[17px] font-bold text-white mb-1 truncate">
                          Amor e Paz
                        </h3>
                        <p className="text-[13px] text-white/60 mb-2">
                          Riicky
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full bg-green-500/20 border border-green-400/30 text-[11px] font-semibold text-green-300 uppercase tracking-wider">
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
                    <div className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 border border-white/[0.06] hover:border-orange-400/30 transition-all shadow-xl hover:shadow-2xl hover:shadow-orange-500/10">
                      <div className="relative w-full h-[280px] overflow-hidden">
                        <Image
                          src="https://cdn2.suno.ai/image_b132bd86-120b-45bd-af5d-54ec65b471aa.jpeg"
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

                      <div className="p-4">
                        <h3 className="text-[17px] font-bold text-white mb-1 truncate">
                          Revolution in the Air
                        </h3>
                        <p className="text-[13px] text-white/60 mb-2">
                          Joana Gonçalves
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full bg-orange-500/20 border border-orange-400/30 text-[11px] font-semibold text-orange-300 uppercase tracking-wider">
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
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
              </div>
            </div>
          </div>

          {/* �🎨 Ferramentas Criativas Premium - PT-PT */}
          <div className="relative bg-gradient-to-b from-black via-zinc-950 to-black py-14 px-6">
            {/* Header com glassmorphism */}
            <div className="mb-10 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 mb-5"
              >
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-400 to-pink-400" />
                <span className="text-[11px] font-bold text-white/80 tracking-widest uppercase">
                  Ferramentas Premium
                </span>
              </motion.div>
              <h2 className="text-[28px] font-black text-white tracking-tight mb-3">
                Cria Música Profissional
              </h2>
              <p className="text-[14px] text-white/50 font-light max-w-[300px] mx-auto leading-relaxed">
                Todas as ferramentas que precisas para transformar ideias em música
              </p>
            </div>

            <div className="space-y-5 max-w-lg mx-auto">
              {/* Feature 1: Texto → Música */}
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push('/musicstudio/create')}
                className="group w-full"
              >
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 border border-white/[0.08] backdrop-blur-2xl p-6 transition-all hover:border-orange-500/30 shadow-xl">
                  {/* Glow on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-orange-500/5 to-pink-500/5" />
                  
                  <div className="relative flex items-center gap-5">
                    {/* Icon Container */}
                    <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-500/30 via-orange-500/20 to-orange-500/10 border border-orange-400/30 flex items-center justify-center flex-shrink-0 shadow-2xl shadow-orange-500/20 group-hover:scale-105 transition-transform">
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-400/10 to-transparent" />
                      <Music className="w-11 h-11 text-orange-400 relative z-10" strokeWidth={2.5} />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 text-left">
                      <h3 className="text-[19px] font-bold text-white mb-1.5 tracking-tight">
                        Texto → Música
                      </h3>
                      <p className="text-[14px] text-white/60 font-light leading-relaxed">
                        Descreve a tua visão e cria faixas completas com IA
                      </p>
                    </div>
                    
                    {/* Arrow */}
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="flex-shrink-0"
                    >
                      <ArrowRight className="w-6 h-6 text-white/30 group-hover:text-orange-400 transition-colors" strokeWidth={2} />
                    </motion.div>
                  </div>
                </div>
              </motion.button>

              {/* Feature 2: Melodia → Música */}
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push('/melody')}
                className="group w-full"
              >
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 border border-white/[0.08] backdrop-blur-2xl p-6 transition-all hover:border-amber-500/30 shadow-xl">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-amber-500/5 to-yellow-500/5" />
                  
                  <div className="relative flex items-center gap-5">
                    <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-500/30 via-amber-500/20 to-amber-500/10 border border-amber-400/30 flex items-center justify-center flex-shrink-0 shadow-2xl shadow-amber-500/20 group-hover:scale-105 transition-transform">
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400/10 to-transparent" />
                      <Mic className="w-11 h-11 text-amber-400 relative z-10" strokeWidth={2.5} />
                    </div>
                    
                    <div className="flex-1 text-left">
                      <h3 className="text-[19px] font-bold text-white mb-1.5 tracking-tight">
                        Melodia → Música
                      </h3>
                      <p className="text-[14px] text-white/60 font-light leading-relaxed">
                        Transforma as tuas melodias em produções épicas
                      </p>
                    </div>
                    
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                      className="flex-shrink-0"
                    >
                      <ArrowRight className="w-6 h-6 text-white/30 group-hover:text-amber-400 transition-colors" strokeWidth={2} />
                    </motion.div>
                  </div>
                </div>
              </motion.button>

              {/* Feature 3: Biblioteca */}
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push('/library')}
                className="group w-full"
              >
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 border border-white/[0.08] backdrop-blur-2xl p-6 transition-all hover:border-pink-500/30 shadow-xl">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-pink-500/5 to-purple-500/5" />
                  
                  <div className="relative flex items-center gap-5">
                    <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-pink-500/30 via-pink-500/20 to-pink-500/10 border border-pink-400/30 flex items-center justify-center flex-shrink-0 shadow-2xl shadow-pink-500/20 group-hover:scale-105 transition-transform">
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-400/10 to-transparent" />
                      <Library className="w-11 h-11 text-pink-400 relative z-10" strokeWidth={2.5} />
                    </div>
                    
                    <div className="flex-1 text-left">
                      <h3 className="text-[19px] font-bold text-white mb-1.5 tracking-tight">
                        As Tuas Criações
                      </h3>
                      <p className="text-[14px] text-white/60 font-light leading-relaxed">
                        Acede a todas as tuas músicas geradas e favoritas
                      </p>
                    </div>
                    
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                      className="flex-shrink-0"
                    >
                      <ArrowRight className="w-6 h-6 text-white/30 group-hover:text-pink-400 transition-colors" strokeWidth={2} />
                    </motion.div>
                  </div>
                </div>
              </motion.button>
            </div>
          </div>

          {/* Info Footer */}
          <div className="relative bg-gradient-to-b from-black to-zinc-950 py-16 px-6">
            <div className="max-w-sm mx-auto text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center mx-auto mb-6">
                <Music className="w-8 h-8 text-white/40" strokeWidth={2} />
              </div>
              <h3 className="text-[20px] font-bold text-white mb-3">
                Pronto para Criar?
              </h3>
              <p className="text-[13px] text-white/40 font-light leading-relaxed mb-8">
                Explora todas as ferramentas criativas pelo menu inferior e começa a produzir música de nível profissional
              </p>
              <div className="flex items-center justify-center gap-2 text-[11px] text-white/30 font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
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
                    <h2 className="text-[32px] font-black text-white tracking-tight mb-2">
                      A Tua Biblioteca
                    </h2>
                    <p className="text-[14px] text-white/50 font-light">
                      Acompanha as tuas criações em tempo real
                    </p>
                  </div>

                  {/* 🔥 MÚSICAS EM GERAÇÃO (AGUARDANDO) */}
                  {tasks.length > 0 && (
                    <div className="mb-10">
                      <div className="flex items-center gap-2 mb-5">
                        <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
                        <h3 className="text-[18px] font-bold text-white">
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
                                    className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-pink-500/10 to-orange-500/10"
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
                                        <Loader2 className="w-8 h-8 text-orange-400 animate-spin relative z-10" />
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
                                    <h4 className="text-[16px] font-bold text-white mb-1 truncate">
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
                                              className="h-full bg-gradient-to-r from-orange-400 to-pink-400 rounded-full"
                                            />
                                          </div>
                                          <span className="text-[11px] font-bold text-orange-400 whitespace-nowrap">
                                            {task.progress}%
                                          </span>
                                        </>
                                      )}
                                      {isCompleted && (
                                        <span className="text-[11px] font-bold text-green-400 flex items-center gap-1">
                                          <CheckCircle2 className="w-3 h-3" />
                                          Concluída
                                        </span>
                                      )}
                                      {isFailed && (
                                        <span className="text-[11px] font-bold text-red-400">
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
                        <Music className="w-5 h-5 text-purple-400" />
                        <h3 className="text-[18px] font-bold text-white">
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
                              <h4 className="text-[13px] font-bold text-white truncate mb-0.5">
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
                      <h3 className="text-[20px] font-bold text-white mb-2">
                        Biblioteca Vazia
                      </h3>
                      <p className="text-[14px] text-white/50 mb-8 max-w-[280px]">
                        Começa a criar música para veres as tuas criações aqui
                      </p>
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => {
                          setActiveTab('inicio')
                          router.push('/musicstudio/create')
                        }}
                        className="px-6 py-3 bg-white text-black rounded-full font-bold text-[14px] shadow-xl"
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

        {/* DESKTOP: Layout original completo */}
        <div className="hidden md:flex md:flex-1 md:flex-col md:overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 z-0">
                <Image 
                  src="/images/hero-background.jpeg" 
                  alt="Background" 
                  fill 
                  className="object-cover" 
                  priority 
                />
                <div className="absolute inset-0 backdrop-blur-3xl bg-black/70" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
              </div>

              <main className="relative z-10 w-full">
                <div className="flex flex-col items-center justify-center px-8 py-16">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16 max-w-4xl"
                  >
                    <h1 className="text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6">
                      Crie Música
                      <br />
                      <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-300 bg-clip-text text-transparent">
                        Além da Imaginação
                      </span>
                    </h1>
                    <p className="text-lg text-white/70 font-light leading-relaxed max-w-2xl mx-auto">
                      Transforme ideias em música profissional com DUA
                    </p>
                  </motion.div>

                  <div className="w-full max-w-3xl">
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        {
                          href: "/create",
                          icon: Music,
                          title: "Texto → Música",
                          description: "Descreva sua visão",
                        },
                        {
                          href: "/melody",
                          icon: Mic,
                          title: "Melodia → Música",
                          description: "Transforme melodias",
                        },
                        {
                          href: "/library",
                          icon: Library,
                          title: "Biblioteca",
                          description: "Suas criações",
                        },
                      ].map((action) => (
                        <Link key={action.href} href={action.href} className="group block active:scale-[0.98] transition-transform">
                          <div className="relative overflow-hidden rounded-2xl bg-white/[0.06] border border-white/[0.08] p-5 transition-all active:bg-white/[0.12] h-full">
                            <div className="flex flex-col items-center text-center">
                              <div className="w-12 h-12 rounded-xl bg-white/[0.08] border border-white/[0.12] flex items-center justify-center mb-3 shrink-0">
                                <action.icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold mb-2 text-white">{action.title}</h3>
                                <p className="text-sm text-zinc-400 font-normal">
                                  {action.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </main>
            </div>

            <div className="relative bg-black py-24">
              <div className="max-w-7xl mx-auto px-8">
                <FeaturedTracksCarousel />
              </div>
            </div>

            <div className="relative bg-black">
              <HowItWorksSection />
            </div>

            <div className="relative bg-black py-24">
              <div className="max-w-4xl mx-auto px-8 text-center">
                <h2 className="text-5xl font-semibold text-white mb-6">
                  Pronto para Criar Sua{" "}
                  <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-300 bg-clip-text text-transparent">
                    Primeira Música?
                  </span>
                </h2>
                <p className="text-white/60 font-light text-lg mb-8 max-w-2xl mx-auto">
                  Transforme ideias em música profissional
                </p>
                <Button
                  size="lg"
                  className="w-auto bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 hover:from-orange-500/20 hover:via-amber-500/20 hover:to-orange-500/20 border border-orange-400/20 hover:border-orange-400/30 text-white font-medium text-lg px-8 py-7 rounded-xl active:scale-[0.98] transition-all backdrop-blur-xl shadow-lg shadow-orange-500/10"
                  onClick={() => router.push('/create')}
                >
                  Criar Música Agora
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="relative bg-black/50 border-t border-white/[0.05] py-8">
              <div className="max-w-7xl mx-auto px-8">
                <div className="text-center text-white/40 text-sm font-light">
                  <p>© 2025 DUA. Criando o futuro da música.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

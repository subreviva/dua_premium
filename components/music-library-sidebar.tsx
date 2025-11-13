"use client"

import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Music2, Play, Pause, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useGeneration } from "@/contexts/generation-context"
import Image from "next/image"

export function MusicLibrarySidebar() {
  // Estado inicial: FECHADA (false) - usuário precisa clicar para abrir
  const [showSidebar, setShowSidebar] = useState(false)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const { completedTracks } = useGeneration()

  useEffect(() => {
    const handleToggle = () => setShowSidebar(prev => !prev)
    window.addEventListener('toggle-music-library', handleToggle)
    return () => window.removeEventListener('toggle-music-library', handleToggle)
  }, [])

  // Sincronização dinâmica: quando abre/fecha, o conteúdo principal encolhe/estica
  // Comportamento sincronizado com outras páginas (Design Studio, Image Studio)
  useEffect(() => {
    // Selecionar container principal da página create
    const contentWrapper = document.querySelector('.content-wrapper') as HTMLElement
    // Selecionar outros possíveis containers
    const mainFlexOne = document.querySelector('main.flex-1') as HTMLElement
    const flexColDiv = document.querySelector('div.flex-1.flex.flex-col') as HTMLElement
    const overflowDiv = document.querySelector('div.flex-1.overflow-y-auto') as HTMLElement

    if (showSidebar) {
      // Sidebar aberta: conteúdo encolhe
      if (contentWrapper) {
        contentWrapper.style.marginRight = '400px'
        contentWrapper.style.transition = 'margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }
      if (mainFlexOne && !contentWrapper) {
        mainFlexOne.style.marginRight = '400px'
        mainFlexOne.style.transition = 'margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }
      if (flexColDiv && !contentWrapper && !mainFlexOne) {
        flexColDiv.style.marginRight = '400px'
        flexColDiv.style.transition = 'margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }
      if (overflowDiv && !contentWrapper && !mainFlexOne && !flexColDiv) {
        overflowDiv.style.marginRight = '400px'
        overflowDiv.style.transition = 'margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }
    } else {
      // Sidebar fechada: conteúdo estica
      if (contentWrapper) {
        contentWrapper.style.marginRight = '0px'
        contentWrapper.style.transition = 'margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }
      if (mainFlexOne) {
        mainFlexOne.style.marginRight = '0px'
        mainFlexOne.style.transition = 'margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }
      if (flexColDiv) {
        flexColDiv.style.marginRight = '0px'
        flexColDiv.style.transition = 'margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }
      if (overflowDiv) {
        overflowDiv.style.marginRight = '0px'
        overflowDiv.style.transition = 'margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }
    }

    // Cleanup: resetar quando o componente desmonta
    return () => {
      if (contentWrapper) contentWrapper.style.marginRight = '0px'
      if (mainFlexOne) mainFlexOne.style.marginRight = '0px'
      if (flexColDiv) flexColDiv.style.marginRight = '0px'
      if (overflowDiv) overflowDiv.style.marginRight = '0px'
    }
  }, [showSidebar])

  const recentTracks = useMemo(() => {
    return completedTracks.slice(-10).reverse()
  }, [completedTracks])

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const togglePlay = (trackId: string) => {
    setPlayingId(playingId === trackId ? null : trackId)
  }

  return (
    <>
      {/* Botão Toggle Ultra Elegante - Fixed Position */}
      <motion.button
        onClick={() => setShowSidebar(!showSidebar)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className={`hidden md:flex fixed top-20 z-40 items-center gap-2 rounded-l-2xl bg-gradient-to-br from-orange-500/90 via-red-500/90 to-pink-600/90 hover:from-orange-500 hover:via-red-500 hover:to-pink-600 px-4 py-3 text-xs font-bold text-white shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50 backdrop-blur-xl transition-all duration-500 hover:scale-105 border border-white/10 ${
          showSidebar ? 'right-[400px]' : 'right-0'
        }`}
        whileHover={{ x: -4 }}
        whileTap={{ scale: 0.95 }}
      >
        <Music2 className="h-4 w-4" />
        <span className="font-semibold tracking-wide">{showSidebar ? 'Fechar' : 'Biblioteca'}</span>
        {!showSidebar && recentTracks.length > 0 && (
          <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold">
            {recentTracks.length}
          </span>
        )}
      </motion.button>

      {/* Sidebar Ultra Elegante */}
      <AnimatePresence>
        {showSidebar && (
          <motion.aside
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="hidden md:block fixed top-0 right-0 h-screen w-[400px] z-40 border-l border-white/10 bg-gradient-to-b from-zinc-950 via-black to-zinc-950 backdrop-blur-3xl overflow-hidden shadow-2xl shadow-black/50 pt-16"
          >
          <div className="flex h-full flex-col">
            {/* Header Ultra Elegante */}
            <div className="border-b border-white/10 bg-gradient-to-r from-orange-500/5 via-red-500/5 to-pink-600/5 backdrop-blur-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-pink-600 p-3 shadow-lg shadow-orange-500/30">
                    <Music2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight">Biblioteca</h2>
                    <p className="text-xs text-zinc-400 font-medium mt-0.5 flex items-center gap-1.5">
                      {recentTracks.length > 0 && (
                        <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                      )}
                      {recentTracks.length} {recentTracks.length === 1 ? 'música' : 'músicas'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSidebar(false)}
                  className="h-9 w-9 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-white transition-all duration-300 hover:rotate-90"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {recentTracks.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center justify-center h-full text-center px-8 py-12"
                >
                  <div className="relative">
                    <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-orange-500/20 to-pink-600/20 blur-2xl" />
                    <div className="relative rounded-[2.5rem] bg-gradient-to-br from-orange-600/30 to-red-700/30 p-14 backdrop-blur-xl border border-white/5">
                      <Music2 className="h-24 w-24 text-orange-500" strokeWidth={1.5} />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 mt-8 tracking-tight">Biblioteca Vazia</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed max-w-[280px]">
                    Crie sua primeira música usando o formulário ao lado
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-xs text-zinc-500">
                    <div className="h-px w-8 bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
                    <span>Suas criações aparecerão aqui</span>
                    <div className="h-px w-8 bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
                  </div>
                </motion.div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {recentTracks.map((track, index) => (
                    <motion.div
                      key={track.id}
                      layout
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9, y: -10 }}
                      transition={{ 
                        delay: index * 0.05, 
                        duration: 0.4,
                        type: "spring",
                        stiffness: 300,
                        damping: 25
                      }}
                      className="group relative rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.02] backdrop-blur-xl border border-white/[0.08] p-3 hover:border-orange-500/40 hover:from-orange-500/5 hover:to-pink-600/5 transition-all duration-500 cursor-pointer overflow-hidden"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Glow effect on hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-pink-500/10 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="flex items-center gap-3">
                        <div className="relative h-16 w-16 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/5">
                          {track.imageUrl ? (
                            <Image
                              src={track.imageUrl}
                              alt={track.title || "Track"}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Music2 className="h-6 w-6 text-zinc-600" />
                            </div>
                          )}
                          {/* Play Overlay Ultra Elegante */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                            <button
                              onClick={() => togglePlay(track.id)}
                              className="relative rounded-full bg-gradient-to-br from-orange-500 to-pink-600 p-2.5 hover:scale-110 transition-transform duration-300 shadow-lg shadow-orange-500/50"
                            >
                              <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
                              {playingId === track.id ? (
                                <Pause className="relative h-4 w-4 text-white" fill="white" />
                              ) : (
                                <Play className="relative h-4 w-4 text-white ml-0.5" fill="white" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-white truncate mb-1 group-hover:text-orange-400 transition-colors">
                            {track.title || "Sem Título"}
                          </h4>
                          <p className="text-xs text-zinc-500 truncate mb-2 leading-relaxed">
                            {track.tags || "Sem tags"}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="secondary" 
                              className="text-[10px] px-2.5 py-1 bg-gradient-to-r from-orange-500/10 to-pink-600/10 text-orange-400 border border-orange-500/20 font-semibold rounded-full backdrop-blur-xl"
                            >
                              {formatDuration(track.duration)}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className="text-[10px] px-2.5 py-1 border-white/10 bg-white/5 text-zinc-300 font-medium rounded-full backdrop-blur-xl"
                            >
                              {track.modelName || "v3.5"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
    </>
  )
}

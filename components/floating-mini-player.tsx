"use client"

import { useGlobalPlayer } from "@/contexts/global-player-context"
import { Play, Pause, X, Maximize2 } from "lucide-react"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function FloatingMiniPlayer() {
  const { currentTrack, isPlaying, pause, resume, progress, duration } = useGlobalPlayer()
  const pathname = usePathname()
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(true)

  // Mostrar apenas se NÃO estiver no Music Studio
  const isMusicStudio = pathname?.startsWith('/musicstudio') || 
                        pathname?.startsWith('/create') || 
                        pathname?.startsWith('/melody') || 
                        pathname?.startsWith('/musicstudio/library')

  // Não mostrar se estiver no Music Studio OU se não tiver música OU se foi fechado
  if (isMusicStudio || !currentTrack || !isVisible) return null

  const handleClose = () => {
    setIsVisible(false)
    pause()
  }

  const handleExpand = () => {
    router.push('/musicstudio')
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 100 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 100 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[60] group"
      >
        {/* Mini Player Card */}
        <div className="relative backdrop-blur-2xl bg-gradient-to-br from-black/95 to-black/90 border border-white/10 rounded-2xl shadow-2xl overflow-hidden hover:border-white/20 transition-all duration-300 hover:shadow-purple-500/20 hover:shadow-2xl">
          {/* Hover: Expand Button */}
          <button
            onClick={handleExpand}
            className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-all duration-300 p-1.5 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg backdrop-blur-xl z-10"
            title="Expandir para Music Studio"
          >
            <Maximize2 className="w-3.5 h-3.5 text-purple-400" />
          </button>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 p-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg backdrop-blur-xl z-10"
            title="Fechar player"
          >
            <X className="w-3.5 h-3.5 text-red-400" />
          </button>

          {/* Content */}
          <div className="flex items-center gap-3 p-3 pr-4 w-64 md:w-72">
            {/* Album Cover */}
            <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 ring-1 ring-white/20 shadow-lg">
              <Image
                src={currentTrack.cover}
                alt={currentTrack.title}
                fill
                className="object-cover"
              />
              {/* Playing Indicator Overlay */}
              {isPlaying && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-1">
                  <div className="flex gap-0.5 items-end h-3">
                    <div className="w-0.5 bg-white/80 animate-music-bar-1" style={{ height: '40%' }} />
                    <div className="w-0.5 bg-white/80 animate-music-bar-2" style={{ height: '60%' }} />
                    <div className="w-0.5 bg-white/80 animate-music-bar-3" style={{ height: '80%' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white truncate leading-tight">
                {currentTrack.title}
              </h4>
              <p className="text-xs text-white/50 truncate mt-0.5">
                {currentTrack.artist}
              </p>
            </div>

            {/* Play/Pause Button */}
            <button
              onClick={isPlaying ? pause : resume}
              className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-white/10 hover:border-white/20 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-white" fill="currentColor" />
              ) : (
                <Play className="w-4 h-4 text-white ml-0.5" fill="currentColor" />
              )}
            </button>
          </div>

          {/* Progress Bar (minimal) */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
              style={{ 
                width: `${duration > 0 ? (progress / duration) * 100 : 0}%` 
              }}
            />
          </div>
        </div>

        {/* Floating Animation Indicator (playing dot) */}
        {isPlaying && (
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse ring-2 ring-black/50 shadow-lg shadow-green-400/50" />
        )}
      </motion.div>
    </AnimatePresence>
  )
}

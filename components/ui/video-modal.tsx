"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PremiumVideoPlayer } from "@/components/ui/premium-video-player"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/lib/hooks"
import {
  X,
  Download,
  Share2,
  Info,
  Sparkles,
  FileText,
  Film,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface VideoModalProps {
  isOpen: boolean
  onClose: () => void
  video: {
    url: string
    thumbnailUrl?: string
    prompt: string
    resolution: string
    aspectRatio: string
    duration: number
    model?: string
    settings?: {
      mode: string
      negativePrompt?: string
    }
  }
}

export function VideoModal({ isOpen, onClose, video }: VideoModalProps) {
  const isMobile = useIsMobile()
  const [showInfo, setShowInfo] = useState(false)

  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = video.url
    link.download = `dua-video-${Date.now()}.mp4`
    link.click()
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "DUA Video",
        text: video.prompt,
        url: video.url,
      })
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-2xl"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={cn(
              "relative flex flex-col",
              isMobile ? "w-full h-full" : "w-full h-full max-w-6xl max-h-[90vh]"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - iOS Premium */}
            <div className={cn(
              "flex items-center justify-between bg-black/90 backdrop-blur-3xl border-b border-white/10",
              isMobile ? "px-4 py-3" : "px-6 py-4"
            )}>
              {isMobile ? (
                /* Mobile: Simple & Clean */
                <>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 transition-all"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <span className="text-white font-medium text-sm">Vídeo Pronto</span>
                  </div>

                  <button
                    onClick={() => setShowInfo(!showInfo)}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 transition-all"
                  >
                    <Info className="w-5 h-5 text-white" />
                  </button>
                </>
              ) : (
                /* Desktop: Full Info */
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-white font-semibold text-lg">Vídeo Gerado com Sucesso</h2>
                      <p className="text-white/50 text-sm">
                        {video.resolution} • {video.aspectRatio} • {video.duration}s
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-white active:scale-90 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Video Player - Full Screen iOS Premium */}
            <div className={cn(
              "flex-1 relative bg-black flex items-center justify-center",
              isMobile ? "min-h-0" : "p-8"
            )}>
              <PremiumVideoPlayer
                src={video.url}
                poster={video.thumbnailUrl}
                title={video.prompt}
                isMobile={isMobile}
              />

              {/* Desktop Info Overlay */}
              {!isMobile && (
                <div className="absolute top-8 left-8 max-w-md">
                  <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-cyan-400" />
                      <span className="text-white/70 text-xs font-medium uppercase tracking-wider">Prompt</span>
                    </div>
                    <p className="text-white/90 text-sm leading-relaxed">{video.prompt}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions - iOS Premium */}
            {isMobile ? (
              /* Mobile: Compact Bottom Bar */
              <div className="flex items-center justify-around gap-2 px-4 py-4 bg-gradient-to-t from-black via-black/95 to-black/40 backdrop-blur-3xl border-t border-white/10"
                style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
              >
                <Button
                  onClick={handleDownload}
                  className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white rounded-xl h-12 gap-2 transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm font-medium">Download</span>
                </Button>

                {typeof navigator !== 'undefined' && 'share' in navigator && (
                  <Button
                    onClick={handleShare}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white rounded-xl h-12 px-4 transition-all active:scale-95"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ) : (
              /* Desktop: Full Actions */
              <div className="flex items-center justify-center gap-3 px-6 py-4 bg-black/90 backdrop-blur-3xl border-t border-white/10">
                <Button
                  onClick={handleDownload}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white rounded-lg h-10 px-6 gap-2 transition-all hover:scale-105"
                >
                  <Download className="w-4 h-4" />
                  Download MP4
                </Button>

                <Button
                  onClick={handleShare}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white rounded-lg h-10 px-6 gap-2 transition-all hover:scale-105"
                >
                  <Share2 className="w-4 h-4" />
                  Partilhar
                </Button>
              </div>
            )}

            {/* Mobile Bottom Sheet - Info */}
            {isMobile && showInfo && (
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/98 to-black/95 backdrop-blur-3xl border-t border-white/20 rounded-t-3xl shadow-[0_-15px_50px_rgba(0,0,0,0.95)] max-h-[70vh] overflow-y-auto"
                style={{ WebkitOverflowScrolling: 'touch', paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
              >
                {/* Drag Handle */}
                <div className="flex justify-center py-3">
                  <div className="w-10 h-1 bg-white/20 rounded-full" />
                </div>

                {/* Content */}
                <div className="px-5 pb-6 space-y-4">
                  {/* Prompt */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-cyan-400" />
                      <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Prompt</h3>
                    </div>
                    <p className="text-white/80 text-sm leading-relaxed bg-white/5 rounded-xl p-3 border border-white/10">
                      {video.prompt}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Film className="w-4 h-4 text-purple-400" />
                      <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Detalhes</h3>
                    </div>
                    <div className="space-y-2 bg-white/5 rounded-xl p-3 border border-white/10">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/50">Resolução:</span>
                        <span className="text-white font-medium">{video.resolution}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/50">Aspect Ratio:</span>
                        <span className="text-white font-medium">{video.aspectRatio}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/50">Duração:</span>
                        <span className="text-white font-medium">{video.duration}s</span>
                      </div>
                      {video.model && (
                        <div className="flex justify-between text-sm">
                          <span className="text-white/50">Modelo:</span>
                          <span className="text-white font-medium">{video.model}</span>
                        </div>
                      )}
                      {video.settings?.mode && (
                        <div className="flex justify-between text-sm">
                          <span className="text-white/50">Modo:</span>
                          <span className="text-white font-medium">{video.settings.mode}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {video.settings?.negativePrompt && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="w-4 h-4 text-orange-400" />
                        <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Negative Prompt</h3>
                      </div>
                      <p className="text-white/70 text-xs leading-relaxed bg-orange-500/5 rounded-xl p-3 border border-orange-500/20">
                        {video.settings.negativePrompt}
                      </p>
                    </div>
                  )}

                  {/* Close Button */}
                  <Button
                    onClick={() => setShowInfo(false)}
                    className="w-full bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 text-white rounded-xl h-12 transition-all active:scale-95"
                  >
                    Fechar
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

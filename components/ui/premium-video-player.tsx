"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Download,
  Copy,
  CheckCircle2,
  X,
  AlertCircle,
} from "lucide-react"
import { motion } from "framer-motion"

interface PremiumVideoPlayerProps {
  src: string
  poster?: string
  title?: string
  isMobile?: boolean
}

export function PremiumVideoPlayer({
  src,
  poster,
  title,
  isMobile = false,
}: PremiumVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [volume, setVolume] = useState(1)
  const [copied, setCopied] = useState(false)
  const [showQuality, setShowQuality] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Handle play/pause
  const handlePlayPause = async () => {
    if (videoRef.current) {
      try {
        if (isPlaying) {
          videoRef.current.pause()
        } else {
          // Validate video source before attempting to play
          if (videoRef.current.readyState >= 2 && !hasError) {
            await videoRef.current.play()
          } else {
            console.error("Video source not ready or supported")
            setHasError(true)
          }
        }
      } catch (error) {
        console.error("Error playing video:", error)
        // Reset playing state if play fails
        setIsPlaying(false)
      }
    }
  }  // Handle mute
  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
  }

  // Handle fullscreen
  const handleFullscreen = async () => {
    if (!containerRef.current) return

    try {
      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen()
        }
        setIsFullscreen(true)
      } else {
        if (document.fullscreenElement) {
          await document.exitFullscreen()
        }
        setIsFullscreen(false)
      }
    } catch (error) {
      console.error("Fullscreen error:", error)
    }
  }

  // Handle copy URL
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(src)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Handle download
  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = src
    link.download = `video-${Date.now()}.mp4`
    link.click()
  }

  // Show controls on mouse move
  const handleMouseMove = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    if (isPlaying && !isMobile) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
  }

  // Format time
  const formatTime = (seconds: number) => {
    if (!seconds) return "0:00"
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    return hrs > 0
      ? `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
      : `${mins}:${String(secs).padStart(2, "0")}`
  }

  // Calculate progress percentage
  const progressPercentage = duration ? (currentTime / duration) * 100 : 0

  const videoProps = {
    ref: videoRef,
    src,
    poster,
    onPlay: () => setIsPlaying(true),
    onPause: () => setIsPlaying(false),
    onTimeUpdate: () => setCurrentTime(videoRef.current?.currentTime || 0),
    onLoadedMetadata: () => {
      setDuration(videoRef.current?.duration || 0)
      setIsLoading(false)
      setHasError(false)
    },
    onError: (e: any) => {
      console.error("Video error:", e)
      setHasError(true)
      setIsLoading(false)
      setIsPlaying(false)
    },
    onLoadStart: () => setIsLoading(true),
    onCanPlay: () => setIsLoading(false),
    className: cn(
      "w-full h-full object-contain bg-black",
      isMobile && "rounded-none"
    ),
  }

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "relative w-full bg-black group cursor-pointer",
        isMobile ? "aspect-video" : "h-full"
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => !isMobile && setShowControls(false)}
    >
      {/* Video Element */}
      <video {...videoProps} playsInline />

      {/* Loading State */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-white text-sm">Carregando vídeo...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-3">
              <X className="w-6 h-6 text-red-400" />
            </div>
            <p className="text-white text-sm mb-2">Erro ao carregar vídeo</p>
            <p className="text-gray-400 text-xs">Fonte não suportada ou indisponível</p>
          </div>
        </div>
      )}

      {/* Play Button Overlay (quando parado) */}
      {!isPlaying && !isLoading && !hasError && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={handlePlayPause}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 transition-all flex items-center justify-center group-hover:scale-110">
            <Play className="w-8 h-8 text-white fill-white" />
          </div>
        </motion.button>
      )}

      {/* Controls Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: showControls ? 1 : 0, y: showControls ? 0 : 20 }}
        transition={{ duration: 0.2 }}
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-4 pointer-events-none"
      >
        {/* Progress Bar */}
        <div className="mb-3 cursor-pointer group pointer-events-auto">
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Time and Controls */}
        <div className="flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button
              onClick={handlePlayPause}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              title={isPlaying ? "Pausar" : "Reproduzir"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-white" />
              ) : (
                <Play className="w-4 h-4 text-white fill-white" />
              )}
            </button>

            {/* Volume Controls */}
            <div className="flex items-center gap-1.5 group">
              <button
                onClick={handleMute}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                title={isMuted ? "Desmutar" : "Mutar"}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-white" />
                ) : (
                  <Volume2 className="w-4 h-4 text-white" />
                )}
              </button>

              {/* Volume Slider */}
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                className="w-0 group-hover:w-20 transition-all rounded-full cursor-pointer"
                title="Volume"
              />
            </div>

            {/* Time Display */}
            <div className="text-white text-xs font-medium">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {/* Download */}
            {!isMobile && (
              <button
                onClick={handleDownload}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                title="Download"
              >
                <Download className="w-4 h-4 text-white" />
              </button>
            )}

            {/* Copy URL */}
            {!isMobile && (
              <button
                onClick={handleCopyUrl}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors relative"
                title="Copiar URL"
              >
                {copied ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4 text-white" />
                )}
              </button>
            )}

            {/* Quality Settings */}
            <button
              onClick={() => setShowQuality(!showQuality)}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              title="Qualidade"
            >
              <Settings className="w-4 h-4 text-white" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={handleFullscreen}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4 text-white" />
              ) : (
                <Maximize className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Quality Menu */}
      {showQuality && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute bottom-16 right-4 bg-black/90 backdrop-blur-md border border-white/20 rounded-lg overflow-hidden pointer-events-auto"
        >
          {[
            { label: "Auto", value: "auto" },
            { label: "720p", value: "720p" },
            { label: "1080p", value: "1080p" },
          ].map((quality) => (
            <button
              key={quality.value}
              onClick={() => setShowQuality(false)}
              className="w-full px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors text-left"
            >
              {quality.label}
            </button>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}

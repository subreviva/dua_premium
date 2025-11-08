"use client"

import { useUnifiedMusic } from "@/contexts/unified-music-context"
import { Play, Pause, SkipBack, SkipForward, Volume2, X, Info } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useState } from "react"

export function UnifiedMusicPlayer() {
  const { currentTrack, isPlaying, progress, duration, pause, resume, seek, stop, audioRef } = useUnifiedMusic()
  const [volume, setVolume] = useState(80)
  const [showInfo, setShowInfo] = useState(false)

  if (!currentTrack) return null

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const progressPercentage = duration > 0 ? (progress / duration) * 100 : 0

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100
    }
  }

  // Determina título, artista e imagem baseado no tipo
  const getTrackInfo = () => {
    if (currentTrack.source === 'carousel') {
      const track = currentTrack as any
      return {
        title: track.title,
        artist: track.artist,
        image: track.cover,
      }
    } else {
      const track = currentTrack as any
      return {
        title: track.title,
        artist: track.tags || 'DUA Music',
        image: track.imageUrl,
      }
    }
  }

  const trackInfo = getTrackInfo()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="backdrop-blur-2xl bg-black/80 border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Progress Bar */}
          <div 
            className="relative h-1 bg-white/10 cursor-pointer" 
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const x = e.clientX - rect.left
              const percentage = x / rect.width
              seek(percentage * duration)
            }}
          >
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Player Controls */}
          <div className="flex items-center gap-4 py-3 md:py-4">
            {/* Track Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 md:w-14 md:h-14">
                <Image
                  src={trackInfo.image}
                  alt={trackInfo.title}
                  fill
                  className="object-cover"
                  unoptimized={currentTrack.source === 'generated'}
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold text-white truncate md:text-base">
                  {trackInfo.title}
                </h4>
                <p className="text-xs text-zinc-400 truncate md:text-sm">
                  {trackInfo.artist}
                </p>
              </div>
            </div>

            {/* Controls - Mobile */}
            <div className="flex md:hidden items-center gap-2">
              <Button
                size="icon"
                className="w-10 h-10 rounded-full bg-white text-black hover:bg-white/90 hover:scale-105 transition-transform active:scale-95"
                onClick={isPlaying ? pause : resume}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" fill="currentColor" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
                )}
              </Button>

              <Button
                size="icon"
                variant="ghost"
                className="w-8 h-8 text-zinc-400 hover:text-white hover:bg-white/10"
                onClick={stop}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Controls - Desktop */}
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-8 h-8 text-zinc-400 hover:text-white hover:bg-white/10"
                  onClick={() => seek(Math.max(0, progress - 10))}
                >
                  <SkipBack className="w-4 h-4" />
                </Button>

                <Button
                  size="icon"
                  className="w-10 h-10 rounded-full bg-white text-black hover:bg-white/90 hover:scale-105 transition-transform"
                  onClick={isPlaying ? pause : resume}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" fill="currentColor" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
                  )}
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  className="w-8 h-8 text-zinc-400 hover:text-white hover:bg-white/10"
                  onClick={() => seek(Math.min(duration, progress + 10))}
                >
                  <SkipForward className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2 text-xs text-zinc-400 tabular-nums">
                <span>{formatTime(progress)}</span>
                <span>/</span>
                <span>{formatTime(duration)}</span>
              </div>

              {/* Volume Control - Desktop lg+ */}
              <div className="hidden lg:flex items-center gap-2 min-w-[120px]">
                <Volume2 className="w-4 h-4 text-zinc-400" />
                <Slider
                  value={[volume]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                  className="w-24"
                />
              </div>

              {/* Info Button - Shows track source */}
              {currentTrack.source === 'generated' && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-8 h-8 text-zinc-400 hover:text-white hover:bg-white/10"
                  onClick={() => setShowInfo(!showInfo)}
                >
                  <Info className="w-4 h-4" />
                </Button>
              )}

              <Button
                size="icon"
                variant="ghost"
                className="w-8 h-8 text-zinc-400 hover:text-white hover:bg-white/10"
                onClick={stop}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Info Panel - Only for Generated Tracks */}
          {showInfo && currentTrack.source === 'generated' && (
            <div className="pb-3 px-2 md:pb-4 md:px-0">
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-3 md:p-4">
                <div className="grid grid-cols-2 gap-3 text-xs md:text-sm">
                  <div>
                    <span className="text-zinc-500">Modelo:</span>
                    <span className="ml-2 text-white">{(currentTrack as any).modelName}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Duração:</span>
                    <span className="ml-2 text-white">{formatTime((currentTrack as any).duration)}</span>
                  </div>
                  {(currentTrack as any).prompt && (
                    <div className="col-span-2">
                      <span className="text-zinc-500">Prompt:</span>
                      <p className="mt-1 text-white/80 text-xs leading-relaxed">
                        {(currentTrack as any).prompt}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

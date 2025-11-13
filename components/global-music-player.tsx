"use client"

import { useGlobalPlayer } from "@/contexts/global-player-context"
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { usePathname } from "next/navigation"

export function GlobalMusicPlayer() {
  const { currentTrack, isPlaying, progress, duration, pause, resume, seek, audioRef } = useGlobalPlayer()
  const pathname = usePathname()

  // Mostrar apenas se estiver no Music Studio
  const isMusicStudio = pathname?.startsWith('/musicstudio') || 
                        pathname?.startsWith('/create') || 
                        pathname?.startsWith('/melody') || 
                        pathname?.startsWith('/musicstudio/library')

  if (!currentTrack || !isMusicStudio) return null

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const progressPercentage = duration > 0 ? (progress / duration) * 100 : 0

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[50]">
      {/* iOS-style backdrop blur container */}
      <div className="backdrop-blur-3xl bg-black/85 border-t border-white/[0.12] shadow-[0_-4px_24px_rgba(0,0,0,0.4)]">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Progress Bar - Touch-friendly */}
          <div 
            className="relative h-1.5 md:h-1 bg-white/[0.12] cursor-pointer group" 
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const x = e.clientX - rect.left
              const percentage = x / rect.width
              seek(percentage * duration)
            }}
          >
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-purple-400 to-pink-500 transition-all rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Player Controls */}
          <div className="flex items-center gap-4 py-3 md:py-4">
            {/* Track Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl overflow-hidden shrink-0 shadow-lg">
                <Image
                  src={currentTrack.cover}
                  alt={currentTrack.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm md:text-base font-semibold text-white truncate">
                  {currentTrack.title}
                </h4>
                <p className="text-xs md:text-sm text-zinc-400 truncate">
                  {currentTrack.artist}
                </p>
              </div>
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
            </div>

            {/* Controls - Mobile */}
            <div className="flex md:hidden items-center gap-3">
              <Button
                size="icon"
                className="w-12 h-12 rounded-full bg-white text-black hover:bg-white/90 active:scale-95 transition-all shadow-lg"
                onClick={isPlaying ? pause : resume}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" fill="currentColor" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
                )}
              </Button>
              <div className="text-[11px] text-zinc-400 tabular-nums font-medium">
                {formatTime(progress)}
              </div>
            </div>

            {/* Volume - Desktop Only */}
            <div className="hidden lg:flex items-center gap-2 w-32">
              <Volume2 className="w-4 h-4 text-zinc-400" />
              <Slider
                defaultValue={[100]}
                max={100}
                step={1}
                className="flex-1"
                onValueChange={(value) => {
                  if (audioRef.current) {
                    audioRef.current.volume = value[0] / 100
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Safe area padding for iOS/Android */}
      <div className="bg-black/85 pb-[env(safe-area-inset-bottom)]" />
    </div>
  )
}

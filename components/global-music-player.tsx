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
                        pathname?.startsWith('/library')

  if (!currentTrack || !isMusicStudio) return null

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const progressPercentage = duration > 0 ? (progress / duration) * 100 : 0

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="backdrop-blur-2xl bg-black/80 border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Progress Bar */}
          <div className="relative h-1 bg-white/10 cursor-pointer" onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const x = e.clientX - rect.left
            const percentage = x / rect.width
            seek(percentage * duration)
          }}>
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
                  src={currentTrack.cover}
                  alt={currentTrack.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold text-white truncate md:text-base">
                  {currentTrack.title}
                </h4>
                <p className="text-xs text-zinc-400 truncate md:text-sm">
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
                className="w-9 h-9 rounded-full bg-white text-black hover:bg-white/90 active:scale-95 transition-transform"
                onClick={isPlaying ? pause : resume}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" fill="currentColor" />
                ) : (
                  <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                )}
              </Button>
              <div className="text-[10px] text-zinc-400 tabular-nums">
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
    </div>
  )
}

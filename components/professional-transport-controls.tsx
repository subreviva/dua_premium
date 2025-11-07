"use client"

import { Play, Pause, SkipBack, SkipForward } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProfessionalTransportControlsProps {
  isPlaying: boolean
  onPlayPause: () => void
  onSkipBack: () => void
  onSkipForward: () => void
  currentTime: number
  duration: number
}

export function ProfessionalTransportControls({
  isPlaying,
  onPlayPause,
  onSkipBack,
  onSkipForward,
  currentTime,
  duration,
}: ProfessionalTransportControlsProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex items-center gap-4 px-6 py-4 bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800/50">
      {/* Transport Buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onSkipBack}
          className="h-10 w-10 rounded-full hover:bg-zinc-800/50 transition-all duration-200 hover:scale-110 active:scale-95"
        >
          <SkipBack className="h-5 w-5" />
        </Button>

        <Button
          variant="default"
          size="icon"
          onClick={onPlayPause}
          className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/20 transition-all duration-200 hover:scale-110 active:scale-95 hover:shadow-xl hover:shadow-blue-500/30"
        >
          {isPlaying ? (
            <Pause className="h-6 w-6" fill="currentColor" />
          ) : (
            <Play className="h-6 w-6 ml-0.5" fill="currentColor" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onSkipForward}
          className="h-10 w-10 rounded-full hover:bg-zinc-800/50 transition-all duration-200 hover:scale-110 active:scale-95"
        >
          <SkipForward className="h-5 w-5" />
        </Button>
      </div>

      {/* Time Display */}
      <div className="flex items-center gap-2 text-sm font-mono">
        <span className="text-zinc-400">{formatTime(currentTime)}</span>
        <span className="text-zinc-600">/</span>
        <span className="text-zinc-500">{formatTime(duration)}</span>
      </div>

      {/* Progress Bar */}
      <div className="flex-1 h-2 bg-zinc-800/50 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-100"
          style={{ width: `${(currentTime / duration) * 100}%` }}
        />
      </div>
    </div>
  )
}

"use client"

import { Music, Clock, Gauge, Hash } from "lucide-react"

interface SessionInfoPanelProps {
  bpm: number
  duration: number
  trackCount: number
  sampleRate?: number
}

export function SessionInfoPanel({ bpm, duration, trackCount, sampleRate = 44100 }: SessionInfoPanelProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex items-center gap-6 px-4 py-2 bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg">
      <div className="flex items-center gap-2">
        <Gauge className="w-4 h-4 text-blue-400" />
        <span className="text-sm font-mono text-white/70">{bpm} BPM</span>
      </div>

      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-green-400" />
        <span className="text-sm font-mono text-white/70">{formatDuration(duration)}</span>
      </div>

      <div className="flex items-center gap-2">
        <Music className="w-4 h-4 text-purple-400" />
        <span className="text-sm font-mono text-white/70">{trackCount} Tracks</span>
      </div>

      <div className="flex items-center gap-2">
        <Hash className="w-4 h-4 text-orange-400" />
        <span className="text-sm font-mono text-white/70">{(sampleRate / 1000).toFixed(1)}kHz</span>
      </div>
    </div>
  )
}

"use client"

interface TimelineRulerProps {
  duration: number
  zoom: number
}

export function TimelineRuler({ duration, zoom }: TimelineRulerProps) {
  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Calculate number of markers based on duration and zoom
  const markerInterval = duration > 300 ? 30 : duration > 120 ? 15 : duration > 60 ? 10 : 5
  const numMarkers = Math.ceil(duration / markerInterval)

  return (
    <div className="relative w-full h-full flex items-center px-4">
      <div className="relative w-full h-4 flex items-center">
        {Array.from({ length: numMarkers + 1 }).map((_, i) => {
          const time = i * markerInterval
          if (time > duration) return null

          const position = (time / duration) * 100

          return (
            <div
              key={i}
              className="absolute flex flex-col items-center transition-opacity duration-200 hover:opacity-100"
              style={{ left: `${position}%`, transform: "translateX(-50%)" }}
            >
              <div className="w-px h-3 bg-gradient-to-b from-zinc-600 to-zinc-800 shadow-sm" />
              <span className="text-[10px] text-zinc-400 font-mono mt-1 tracking-wide">{formatTime(time)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

"use client"

import React from "react"

export default function MarkersSystem({
  duration,
  currentTime,
  onSeek,
}: {
  duration: number
  currentTime: number
  onSeek: (time: number) => void
}) {
  const [markers, setMarkers] = React.useState<Array<{ id: string; time: number; label: string; color: string }>>([])
  const [showAddMarker, setShowAddMarker] = React.useState(false)
  const [newMarkerLabel, setNewMarkerLabel] = React.useState("")

  const addMarker = () => {
    if (!newMarkerLabel.trim()) return

    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]
    const newMarker = {
      id: Math.random().toString(36).substr(2, 9),
      time: currentTime,
      label: newMarkerLabel,
      color: colors[markers.length % colors.length],
    }

    setMarkers([...markers, newMarker].sort((a, b) => a.time - b.time))
    setNewMarkerLabel("")
    setShowAddMarker(false)
  }

  const deleteMarker = (id: string) => {
    setMarkers(markers.filter((m) => m.id !== id))
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-2">
      {/* Markers on timeline */}
      <div className="relative h-6">
        {markers.map((marker) => {
          const position = (marker.time / duration) * 100
          return (
            <div
              key={marker.id}
              className="absolute top-0 bottom-0 group cursor-pointer"
              style={{ left: `${position}%` }}
              onClick={() => onSeek(marker.time)}
            >
              <div className="w-0.5 h-full transition-all group-hover:w-1" style={{ backgroundColor: marker.color }} />
              <div
                className="absolute top-full mt-1 px-2 py-1 rounded text-xs font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{ backgroundColor: marker.color }}
              >
                {marker.label}
              </div>
            </div>
          )
        })}
      </div>

      {/* Markers list */}
      <div className="flex items-center gap-2 flex-wrap">
        {markers.map((marker) => (
          <div
            key={marker.id}
            className="flex items-center gap-2 px-2 py-1 rounded backdrop-blur-xl bg-zinc-950/80 border border-zinc-800/50 text-xs font-mono group cursor-pointer hover:scale-105 transition-all"
            onClick={() => onSeek(marker.time)}
          >
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: marker.color }} />
            <span className="text-zinc-400">{formatTime(marker.time)}</span>
            <span className="text-zinc-200">{marker.label}</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                deleteMarker(marker.id)
              }}
              className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 transition-all"
            >
              ×
            </button>
          </div>
        ))}

        {/* Add marker button */}
        {showAddMarker ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newMarkerLabel}
              onChange={(e) => setNewMarkerLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addMarker()}
              placeholder="Marker name..."
              className="px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-xs font-mono text-zinc-200 focus:outline-none focus:border-blue-500"
              autoFocus
            />
            <button
              onClick={addMarker}
              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs font-mono transition-all"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowAddMarker(false)
                setNewMarkerLabel("")
              }}
              className="px-2 py-1 bg-zinc-700 hover:bg-zinc-600 rounded text-xs font-mono transition-all"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAddMarker(true)}
            className="px-2 py-1 rounded backdrop-blur-xl bg-zinc-950/80 border border-zinc-800/50 text-xs font-mono text-zinc-400 hover:text-zinc-200 hover:border-blue-500 transition-all"
          >
            + Add Marker
          </button>
        )}
      </div>
    </div>
  )
}

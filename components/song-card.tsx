"use client"

import { useState } from "react"
import { Play, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SongContextMenu } from "@/components/song-context-menu"

interface Song {
  id: string
  title: string
  version: string
  genre: string
  duration: string
  thumbnail: string
  gradient: string
  uploaded?: boolean
  featured?: boolean
  taskId?: string
  musicIndex?: number
}

interface SongCardProps {
  song: Song
  onSelect: () => void
  isSelected: boolean
  onEdit?: () => void
}

export function SongCard({ song, onSelect, isSelected, onEdit }: SongCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [showContextMenu, setShowContextMenu] = useState(false)

  const handleGetStems = async () => {
    try {
      const response = await fetch("/api/suno/vocals/separate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioId: song.id }),
      })
      const result = await response.json()
      console.log("[v0] Stems separation started:", result)
    } catch (error) {
      console.error("[v0] Error getting stems:", error)
    }
  }

  const handleConvertToWav = async () => {
    try {
      const response = await fetch("/api/suno/wav/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioId: song.id }),
      })
      const result = await response.json()
      console.log("[v0] WAV conversion started:", result)
    } catch (error) {
      console.error("[v0] Error converting to WAV:", error)
    }
  }

  const handleCreateVideo = async () => {
    try {
      const response = await fetch("/api/suno/video/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioId: song.id }),
      })
      const result = await response.json()
      console.log("[v0] Video creation started:", result)
    } catch (error) {
      console.error("[v0] Error creating video:", error)
    }
  }

  const handleMakePersona = async () => {
    try {
      if (!song.taskId) {
        console.error("[v0] Cannot create persona: taskId is missing")
        alert("Cannot create persona: This song doesn't have task information")
        return
      }

      const response = await fetch("/api/suno/persona/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: song.taskId,
          musicIndex: song.musicIndex ?? 0,
          name: song.title || "Untitled Persona",
          description: song.genre || "A unique musical persona with distinctive style",
        }),
      })
      const result = await response.json()

      if (result.code === 200) {
        console.log("[v0] Persona generation successful:", result.data)
        alert(`Persona "${result.data.name}" created successfully!`)
      } else if (result.code === 409) {
        console.log("[v0] Persona already exists for this music")
        alert("A persona already exists for this music")
      } else {
        console.error("[v0] Error making persona:", result.msg)
        alert(`Error creating persona: ${result.msg}`)
      }
    } catch (error) {
      console.error("[v0] Error making persona:", error)
      alert("Failed to create persona. Please try again.")
    }
  }

  const handleBoostStyle = async () => {
    try {
      const response = await fetch("/api/suno/boost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: song.genre || song.title }),
      })
      const result = await response.json()
      console.log("[v0] Style boost started:", result)
    } catch (error) {
      console.error("[v0] Error boosting style:", error)
    }
  }

  return (
    <div
      className={`group flex items-center gap-3 lg:gap-4 p-3 rounded-lg hover:bg-neutral-900 transition-colors cursor-pointer ${
        isSelected ? "bg-neutral-900" : ""
      }`}
      onClick={onSelect}
      onDoubleClick={onEdit}
    >
      <div className="relative flex-shrink-0">
        <div
          className={`w-14 h-14 lg:w-16 lg:h-16 rounded-lg bg-gradient-to-br ${song.gradient} flex items-center justify-center`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsPlaying(!isPlaying)
            }}
            className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
          >
            <Play className="h-3 w-3 lg:h-4 lg:w-4 text-black ml-0.5" fill="black" />
          </button>
        </div>
        <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-xs font-medium">
          {song.duration}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold truncate text-sm lg:text-base">{song.title}</h3>
          {song.version && (
            <span className="px-2 py-0.5 bg-pink-600 text-xs rounded font-medium flex-shrink-0">{song.version}</span>
          )}
          {song.uploaded && <span className="text-xs text-neutral-400 flex-shrink-0">📤 Uploaded</span>}
        </div>
        <p className="text-xs lg:text-sm text-neutral-400 truncate">{song.genre}</p>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation()
              setShowContextMenu(!showContextMenu)
            }}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>

          {showContextMenu && (
            <SongContextMenu song={song} onClose={() => setShowContextMenu(false)} onEdit={onEdit} position="right" />
          )}
        </div>
      </div>

      {song.featured && <span className="text-yellow-500 flex-shrink-0">⭐</span>}
    </div>
  )
}

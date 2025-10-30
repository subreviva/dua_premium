"use client"

import { useState } from "react"
import { X, Play, ChevronDown, ChevronUp, Plus, Music } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface ExtendModalProps {
  onClose: () => void
  song: any
}

export function ExtendModal({ onClose, song }: ExtendModalProps) {
  const [lyricsExpanded, setLyricsExpanded] = useState(false)
  const [stylesExpanded, setStylesExpanded] = useState(true)
  const [extendFrom, setExtendFrom] = useState("03:14.0")
  const [lyrics, setLyrics] = useState("")
  const [styles, setStyles] = useState(
    "pop, featuring mournful guitar solos and orchestral undertones for a dramatic and emotional texture, slow, male vocals, metal, deep male vocals, melodic, heavy metal, deep",
  )
  const [isExtending, setIsExtending] = useState(false)
  const [showExtendPoint, setShowExtendPoint] = useState(true)

  const handleExtend = async () => {
    setIsExtending(true)
    try {
      const response = await fetch("/api/suno/extend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioId: song.id,
          prompt: styles,
          continueAt: extendFrom,
          model: "V3_5",
          lyrics: lyrics || undefined,
        }),
      })

      const data = await response.json()
      console.log("[v0] Extend response:", data)

      if (data.taskId) {
        const pollInterval = setInterval(async () => {
          const detailsResponse = await fetch(`/api/suno/details/${data.taskId}`)
          const details = await detailsResponse.json()

          if (details.status === "completed") {
            clearInterval(pollInterval)
            console.log("[v0] Extended audio ready:", details)
            onClose()
          }
        }, 3000)
      }
    } catch (error) {
      console.error("[v0] Extend error:", error)
    } finally {
      setIsExtending(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-[#0a0a0a] rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-amber-700 flex items-center justify-center">
              <Play className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">{song.title}</h3>
              <p className="text-sm text-neutral-400">00:00 / 04:38</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="bg-transparent border-neutral-700">
              Extend
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
            <button onClick={onClose} className="text-neutral-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Waveform */}
        <div className="p-6 border-b border-neutral-800">
          <div className="relative h-32 bg-neutral-900 rounded-lg overflow-hidden">
            {/* Waveform visualization */}
            <div className="absolute inset-0 flex items-center px-4">
              <div className="flex-1 flex items-center justify-center gap-0.5">
                {Array.from({ length: 100 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-neutral-700 rounded-full"
                    style={{
                      height: `${Math.random() * 60 + 20}%`,
                    }}
                  />
                ))}
              </div>
              {showExtendPoint && (
                <div className="absolute right-1/4 top-0 bottom-0 w-1 bg-pink-500">
                  <div className="absolute -top-1 -left-2 w-5 h-5 bg-pink-500 rounded-full" />
                  <div className="absolute -bottom-1 -left-2 w-5 h-5 bg-pink-500 rounded-full" />
                </div>
              )}
            </div>
          </div>
          <div className="text-center mt-2 text-sm text-neutral-400">
            Extend from <span className="text-white font-medium">{extendFrom}</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Lyrics Section */}
          <div className="space-y-3">
            <button
              onClick={() => setLyricsExpanded(!lyricsExpanded)}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="font-semibold">Lyrics</span>
              {lyricsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {lyricsExpanded && (
              <Textarea
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder="[Verse] / The sky once burned / Now it weeps grey / Fields of..."
                className="min-h-[100px] bg-neutral-900 border-neutral-800"
              />
            )}
          </div>

          {/* Styles Section */}
          <div className="space-y-3">
            <button
              onClick={() => setStylesExpanded(!stylesExpanded)}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="font-semibold">Styles</span>
              <div className="flex items-center gap-2">
                <button className="p-1 hover:bg-neutral-800 rounded">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M4 12h16M12 4v16" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
                <button className="p-1 hover:bg-neutral-800 rounded">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
                  </svg>
                </button>
                <button className="p-1 hover:bg-neutral-800 rounded">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 5v14M5 12h14" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
                <button className="p-1 hover:bg-neutral-800 rounded text-pink-500">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                </button>
                {stylesExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </button>

            {stylesExpanded && (
              <>
                <Textarea
                  value={styles}
                  onChange={(e) => setStyles(e.target.value)}
                  className="min-h-[80px] bg-pink-500/20 border-pink-500/50 text-pink-100"
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-transparent border-neutral-700 text-xs"
                    onClick={() => setStyles(styles + ", complex melody")}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    complex melody
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-transparent border-neutral-700 text-xs"
                    onClick={() => setStyles(styles + ", meditation music")}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    meditation music
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-neutral-800">
          <Button
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold"
            onClick={handleExtend}
            disabled={isExtending}
          >
            <Music className="mr-2 h-4 w-4" />
            {isExtending ? "Extending..." : "Create"}
          </Button>
        </div>
      </div>
    </div>
  )
}

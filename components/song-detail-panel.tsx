"use client"

import { useState } from "react"
import { X, Play, ThumbsUp, MessageSquare, Share2, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ExtendModal } from "@/components/extend-modal"
import { AudioEditor } from "@/components/audio-editor" // Import AudioEditor component
import { safeParse } from "@/lib/fetch-utils"

interface Song {
  id: string
  title: string
  version: string
  genre: string
  duration: string
  thumbnail: string
  gradient: string
}

interface SongDetailPanelProps {
  song: Song
  onClose: () => void
}

export function SongDetailPanel({ song, onClose }: SongDetailPanelProps) {
  const [showExtendModal, setShowExtendModal] = useState(false)
  const [showAudioEditor, setShowAudioEditor] = useState(false)

  const handleOpenInStudio = () => {
    // console.log("[v0] Opening in Studio:", song.id)
  }

  const handleOpenInEditor = () => {
    setShowAudioEditor(true)
  }

  const handleCover = async () => {
    try {
      const response = await fetch("/api/suno/cover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uploadUrl: song.id,
          prompt: "Create a cover version",
          title: `${song.title} (Cover)`,
        }),
      })
      const result = await safeParse(response)
      if (!result) {
        console.error("Failed to parse cover response")
        return
      }
      // console.log("[v0] Cover creation started:", result)
    } catch (error) {
      // console.error("[v0] Error creating cover:", error)
    }
  }

  const handleAdjustSpeed = () => {
    // console.log("[v0] Adjust speed feature - Coming soon")
  }

  const handleUseStylesAndLyrics = () => {
    // console.log("[v0] Use styles & lyrics feature - Coming soon")
  }

  const handleCrop = () => {
    // console.log("[v0] Crop feature - Pro feature")
  }

  const handleReplaceSection = () => {
    // console.log("[v0] Replace section feature - Pro feature")
  }

  const handleAddVocal = async () => {
    try {
      const response = await fetch("/api/suno/vocals/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uploadUrl: song.id,
          prompt: "Add vocals to this track",
          title: `${song.title} (With Vocals)`,
          style: song.genre,
          negativeTags: "",
        }),
      })
      const result = await safeParse(response)
      if (!result) {
        console.error("Failed to parse vocals response")
        return
      }
      // console.log("[v0] Add vocals started:", result)
    } catch (error) {
      // console.error("[v0] Error adding vocals:", error)
    }
  }

  const handlePublish = () => {
    // console.log("[v0] Publishing song:", song.id)
  }

  return (
    <>
      <div className="w-full lg:w-[400px] bg-[#0a0a0a] border-l border-neutral-800 flex flex-col h-full">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-neutral-800">
          <h3 className="font-semibold">Song Details</h3>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
          {/* Large Thumbnail */}
          <div
            className={`w-full aspect-square rounded-2xl bg-gradient-to-br ${song.gradient} relative overflow-hidden`}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Play className="h-8 w-8 lg:h-10 lg:w-10 text-white ml-1" fill="white" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="bg-neutral-900 border-neutral-800">
                <Play className="mr-2 h-4 w-4" />1
              </Button>
              <Button variant="outline" size="sm" className="bg-neutral-900 border-neutral-800">
                <ThumbsUp className="mr-2 h-4 w-4" />0
              </Button>
              <Button variant="outline" size="sm" className="bg-neutral-900 border-neutral-800">
                <MessageSquare className="mr-2 h-4 w-4" />0
              </Button>
              <Button variant="outline" size="sm" className="bg-neutral-900 border-neutral-800">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Menu Options */}
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-between bg-neutral-900 border-neutral-800 hover:bg-neutral-800"
              onClick={handleOpenInStudio}
            >
              <span className="flex items-center gap-2">
                <span>🎵</span>
                Open in Studio
              </span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-pink-600 text-xs rounded">New</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-between bg-neutral-900 border-neutral-800 hover:bg-neutral-800"
              onClick={handleOpenInEditor}
            >
              <span className="flex items-center gap-2">
                <span>✏️</span>
                Open in Editor
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">Pro</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-between bg-neutral-900 border-neutral-800 hover:bg-neutral-800"
              onClick={handleCover}
            >
              <span className="flex items-center gap-2">
                <span>🎨</span>
                Cover
              </span>
              <span className="ml-auto text-xs text-neutral-400 mr-2">Remix/Edit</span>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-between bg-neutral-900 border-neutral-800 hover:bg-neutral-800"
              onClick={() => setShowExtendModal(true)}
            >
              <span className="flex items-center gap-2">
                <span>↗️</span>
                Extend
              </span>
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start bg-neutral-900 border-neutral-800 hover:bg-neutral-800"
              onClick={handleAdjustSpeed}
            >
              <span className="mr-2">⚡</span>
              Adjust Speed
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start bg-neutral-900 border-neutral-800 hover:bg-neutral-800"
              onClick={handleUseStylesAndLyrics}
            >
              <span className="mr-2">🎼</span>
              Use Styles & Lyrics
            </Button>

            <Button
              variant="outline"
              className="w-full justify-between bg-neutral-900 border-neutral-800 hover:bg-neutral-800"
              onClick={handleCrop}
            >
              <span className="flex items-center gap-2">
                <span>✂️</span>
                Crop
              </span>
              <span className="text-xs text-neutral-400">Pro</span>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-between bg-neutral-900 border-neutral-800 hover:bg-neutral-800"
              onClick={handleReplaceSection}
            >
              <span className="flex items-center gap-2">
                <span>🔄</span>
                Replace Section
              </span>
              <span className="text-xs text-neutral-400">Pro</span>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-between bg-neutral-900 border-neutral-800 hover:bg-neutral-800"
              onClick={handleAddVocal}
            >
              <span className="flex items-center gap-2">
                <span>🎤</span>
                Add Vocal
              </span>
              <span className="text-xs text-neutral-400">Pro</span>
            </Button>
          </div>
        </div>

        {/* Publish Button */}
        <div className="p-6 border-t border-neutral-800">
          <Button className="w-full bg-white text-black hover:bg-neutral-200 font-semibold" onClick={handlePublish}>
            <span className="mr-2">🚀</span>
            Publish
          </Button>
        </div>
      </div>

      {/* Extend Modal */}
      {showExtendModal && <ExtendModal song={song} onClose={() => setShowExtendModal(false)} />}

      {showAudioEditor && (
        <div className="fixed inset-0 z-50">
          <AudioEditor song={song} onClose={() => setShowAudioEditor(false)} />
        </div>
      )}
    </>
  )
}

"use client"

import { useState } from "react"
import { X, Play, ThumbsUp, MessageSquare, Share2, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ExtendModal } from "@/components/extend-modal"
import { AudioEditor } from "@/components/audio-editor" // Import AudioEditor component

interface Song {
  id: string
  title: string
  version: string
  genre: string
  duration: string
  thumbnail: string
  gradient: string
  audioUrl?: string
  streamAudioUrl?: string
  videoUrl?: string
  imageUrl?: string
  prompt?: string
  lyrics?: string
  tags?: string
  modelName?: string
}

interface SongDetailPanelProps {
  song: Song
  onClose: () => void
}

export function SongDetailPanel({ song, onClose }: SongDetailPanelProps) {
  const [showExtendModal, setShowExtendModal] = useState(false)
  const [showAudioEditor, setShowAudioEditor] = useState(false)
  const [showConcatModal, setShowConcatModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleOpenInStudio = () => {
    console.log("[v0] Opening in Studio:", song.id)
  }

  const handleOpenInEditor = () => {
    setShowAudioEditor(true)
  }

  const handleCover = async () => {
    try {
      const response = await fetch("/api/suno/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_type: "cover_music",
          custom_mode: true,
          continue_clip_id: song.id,
          prompt: song.lyrics || `[Verse]\nCreate a cover version of this song\n[Chorus]\nWith a fresh new style`,
          title: song.title ? `${song.title} (Cover)` : "Cover Version",
          tags: song.genre || song.tags || "pop",
          mv: "chirp-v5",
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("[v0] Cover creation started:", result)

      if (result.code === 200 && result.data?.taskId) {
        alert("Cover creation started! Check your workspace in a few minutes.")
        
        // Poll for completion in background
        const pollInterval = setInterval(async () => {
          const detailsResponse = await fetch(`/api/suno/details/${result.data.taskId}`)
          const details = await detailsResponse.json()

          if (details.code === 200 && details.data?.status === "SUCCESS") {
            clearInterval(pollInterval)
            
            // Save to localStorage
            const coverSongs = details.data.response?.data || []
            coverSongs.forEach((coverSong: any) => {
              const songData = {
                id: coverSong.id || Math.random().toString(36).substr(2, 9),
                title: coverSong.title || `${song.title} (Cover)`,
                version: coverSong.model_name || "v5",
                genre: coverSong.tags || song.genre,
                duration: coverSong.duration ? `${Math.floor(coverSong.duration / 60)}:${String(coverSong.duration % 60).padStart(2, '0')}` : song.duration,
                thumbnail: coverSong.image_url || song.thumbnail,
                gradient: "from-blue-600 to-purple-600",
                audioUrl: coverSong.audio_url,
                videoUrl: coverSong.video_url,
                imageUrl: coverSong.image_url,
                prompt: coverSong.prompt,
                lyrics: coverSong.lyric,
                tags: coverSong.tags,
                modelName: coverSong.model_name,
                createdAt: new Date().toISOString(),
              }
              
              const stored = localStorage.getItem("suno-songs")
              const songs = stored ? JSON.parse(stored) : []
              songs.unshift(songData)
              localStorage.setItem("suno-songs", JSON.stringify(songs))
            })
            
            window.dispatchEvent(new Event('storage'))
          } else if (details.data?.status === "FAILED") {
            clearInterval(pollInterval)
          }
        }, 5000)
      } else {
        throw new Error(result.msg || "No taskId received")
      }
    } catch (error) {
      console.error("[v0] Error creating cover:", error)
      alert(`Cover creation failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const handleAdjustSpeed = () => {
    console.log("[v0] Adjust speed feature - Coming soon")
  }

  const handleUseStylesAndLyrics = () => {
    console.log("[v0] Use styles & lyrics feature - Coming soon")
  }

  const handleCrop = () => {
    console.log("[v0] Crop feature - Pro feature")
  }

  const handleReplaceSection = () => {
    console.log("[v0] Replace section feature - Pro feature")
  }

  const handleAddVocal = async () => {
    try {
      // For Add Vocals, we use cover_upload_music with uploaded instrumental
      // Since we already have the song, we use cover_music to add vocals
      const response = await fetch("/api/suno/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_type: "cover_music",
          custom_mode: true,
          continue_clip_id: song.id,
          prompt: `[Verse]\nAdd beautiful vocals to this instrumental track\n[Chorus]\nWith emotion and energy`,
          title: song.title ? `${song.title} (With Vocals)` : "Vocal Version",
          tags: song.genre || song.tags || "pop, vocals",
          mv: "chirp-v5",
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("[v0] Add vocals started:", result)

      if (result.code === 200 && result.data?.taskId) {
        alert("Adding vocals! Check your workspace in a few minutes.")
        
        // Poll for completion
        const pollInterval = setInterval(async () => {
          const detailsResponse = await fetch(`/api/suno/details/${result.data.taskId}`)
          const details = await detailsResponse.json()

          if (details.code === 200 && details.data?.status === "SUCCESS") {
            clearInterval(pollInterval)
            
            // Save to localStorage
            const vocalSongs = details.data.response?.data || []
            vocalSongs.forEach((vocalSong: any) => {
              const songData = {
                id: vocalSong.id || Math.random().toString(36).substr(2, 9),
                title: vocalSong.title || `${song.title} (With Vocals)`,
                version: vocalSong.model_name || "v5",
                genre: vocalSong.tags || song.genre,
                duration: vocalSong.duration ? `${Math.floor(vocalSong.duration / 60)}:${String(vocalSong.duration % 60).padStart(2, '0')}` : song.duration,
                thumbnail: vocalSong.image_url || song.thumbnail,
                gradient: "from-green-600 to-teal-600",
                audioUrl: vocalSong.audio_url,
                videoUrl: vocalSong.video_url,
                imageUrl: vocalSong.image_url,
                prompt: vocalSong.prompt,
                lyrics: vocalSong.lyric,
                tags: vocalSong.tags,
                modelName: vocalSong.model_name,
                createdAt: new Date().toISOString(),
              }
              
              const stored = localStorage.getItem("suno-songs")
              const songs = stored ? JSON.parse(stored) : []
              songs.unshift(songData)
              localStorage.setItem("suno-songs", JSON.stringify(songs))
            })
            
            window.dispatchEvent(new Event('storage'))
          } else if (details.data?.status === "FAILED") {
            clearInterval(pollInterval)
          }
        }, 5000)
      } else {
        throw new Error(result.msg || "No taskId received")
      }
    } catch (error) {
      console.error("[v0] Error adding vocals:", error)
      alert(`Add vocals failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const handlePublish = () => {
    console.log("[v0] Publishing song:", song.id)
  }

  const handleConcat = async (secondClipId: string) => {
    setIsProcessing(true)
    try {
      const response = await fetch("/api/suno/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_type: "concat_music",
          clip_id: song.id,
          concat_clip_id: secondClipId,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("[v0] Concat started:", result)

      if (result.code === 200 && result.data?.taskId) {
        alert("Concatenating songs! Check your workspace in a few minutes.")
        setShowConcatModal(false)
      } else {
        throw new Error(result.msg || "No taskId received")
      }
    } catch (error) {
      console.error("[v0] Concat error:", error)
      alert(`Concat failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBasicStems = async () => {
    setIsProcessing(true)
    try {
      const response = await fetch("/api/suno/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_type: "separate_stem",
          clip_id: song.id,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("[v0] Basic stems started:", result)

      if (result.code === 200 && result.data?.taskId) {
        alert("Separating stems! Check your workspace in a few minutes for vocals and instrumental tracks.")
      } else {
        throw new Error(result.msg || "No taskId received")
      }
    } catch (error) {
      console.error("[v0] Basic stems error:", error)
      alert(`Stems separation failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFullStems = async () => {
    setIsProcessing(true)
    try {
      const response = await fetch("/api/suno/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_type: "separate_stem_pro",
          clip_id: song.id,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("[v0] Full stems started:", result)

      if (result.code === 200 && result.data?.taskId) {
        alert("Separating full stems! Check your workspace in a few minutes for vocals, bass, drums, instruments, and other tracks.")
      } else {
        throw new Error(result.msg || "No taskId received")
      }
    } catch (error) {
      console.error("[v0] Full stems error:", error)
      alert(`Full stems separation failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRemoveVocals = async () => {
    setIsProcessing(true)
    try {
      const response = await fetch("/api/suno/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_type: "separate_stem",
          clip_id: song.id,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("[v0] Remove vocals started:", result)

      if (result.code === 200 && result.data?.taskId) {
        alert("Extracting instrumental! Check your workspace in a few minutes.")
      } else {
        throw new Error(result.msg || "No taskId received")
      }
    } catch (error) {
      console.error("[v0] Remove vocals error:", error)
      alert(`Remove vocals failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownloadWAV = async () => {
    setIsProcessing(true)
    try {
      const response = await fetch("/api/suno/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_type: "get_wav",
          clip_id: song.id,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("[v0] WAV download started:", result)

      if (result.code === 200 && result.data?.wav_url) {
        // Download WAV
        const link = document.createElement('a')
        link.href = result.data.wav_url
        link.download = `${song.title || 'song'}.wav`
        link.click()
        alert("WAV download started!")
      } else {
        throw new Error(result.msg || "No WAV URL received")
      }
    } catch (error) {
      console.error("[v0] WAV download error:", error)
      alert(`WAV download failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownloadMIDI = async () => {
    setIsProcessing(true)
    try {
      const response = await fetch("/api/suno/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_type: "get_midi",
          clip_id: song.id,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("[v0] MIDI download started:", result)

      if (result.code === 200 && result.data?.midi_data) {
        // Create MIDI file blob and download
        const midiBlob = new Blob([result.data.midi_data], { type: 'audio/midi' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(midiBlob)
        link.download = `${song.title || 'song'}.mid`
        link.click()
        alert("MIDI download started!")
      } else {
        throw new Error(result.msg || "No MIDI data received")
      }
    } catch (error) {
      console.error("[v0] MIDI download error:", error)
      alert(`MIDI download failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsProcessing(false)
    }
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
              disabled={isProcessing}
            >
              <span className="flex items-center gap-2">
                <span>🎤</span>
                Add Vocal
              </span>
              <span className="text-xs text-neutral-400">Pro</span>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-between bg-neutral-900 border-neutral-800 hover:bg-neutral-800"
              onClick={handleRemoveVocals}
              disabled={isProcessing}
            >
              <span className="flex items-center gap-2">
                <span>🎵</span>
                Remove Vocals
              </span>
              <span className="text-xs text-neutral-400">5 credits</span>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-between bg-neutral-900 border-neutral-800 hover:bg-neutral-800"
              onClick={() => setShowConcatModal(true)}
              disabled={isProcessing}
            >
              <span className="flex items-center gap-2">
                <span>🔗</span>
                Concat Songs
              </span>
              <span className="text-xs text-neutral-400">10 credits</span>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-between bg-neutral-900 border-neutral-800 hover:bg-neutral-800"
              onClick={handleBasicStems}
              disabled={isProcessing}
            >
              <span className="flex items-center gap-2">
                <span>🎛️</span>
                Basic Stems
              </span>
              <span className="text-xs text-neutral-400">10 credits</span>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-between bg-neutral-900 border-neutral-800 hover:bg-neutral-800"
              onClick={handleFullStems}
              disabled={isProcessing}
            >
              <span className="flex items-center gap-2">
                <span>🎚️</span>
                Full Stems (5 tracks)
              </span>
              <span className="text-xs text-neutral-400">15 credits · Pro</span>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-between bg-neutral-900 border-neutral-800 hover:bg-neutral-800"
              onClick={handleDownloadWAV}
              disabled={isProcessing}
            >
              <span className="flex items-center gap-2">
                <span>📥</span>
                Download WAV
              </span>
              <span className="text-xs text-neutral-400">2 credits</span>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-between bg-neutral-900 border-neutral-800 hover:bg-neutral-800"
              onClick={handleDownloadMIDI}
              disabled={isProcessing}
            >
              <span className="flex items-center gap-2">
                <span>🎹</span>
                Download MIDI
              </span>
              <span className="text-xs text-neutral-400">2 credits · Pro</span>
            </Button>
          </div>
        </div>

        {/* Publish Button */}
        <div className="p-6 border-t border-neutral-800">
          <Button 
            className="w-full bg-white text-black hover:bg-neutral-200 font-semibold" 
            onClick={handlePublish}
            disabled={isProcessing}
          >
            <span className="mr-2">🚀</span>
            {isProcessing ? "Processing..." : "Publish"}
          </Button>
        </div>
      </div>

      {/* Extend Modal */}
      {showExtendModal && <ExtendModal song={song} onClose={() => setShowExtendModal(false)} />}

      {/* Concat Modal */}
      {showConcatModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setShowConcatModal(false)}>
          <div className="bg-[#0a0a0a] rounded-lg w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Concatenate Songs</h3>
            <p className="text-sm text-neutral-400 mb-4">
              Enter the Clip ID of the second song to join with this one.
            </p>
            <input
              type="text"
              placeholder="Enter clip ID..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2 mb-4"
              id="concat-clip-id"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowConcatModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
                onClick={() => {
                  const input = document.getElementById('concat-clip-id') as HTMLInputElement
                  if (input?.value) {
                    handleConcat(input.value)
                  }
                }}
                disabled={isProcessing}
              >
                Concat
              </Button>
            </div>
          </div>
        </div>
      )}

      {showAudioEditor && (
        <div className="fixed inset-0 z-50">
          <AudioEditor song={song} onClose={() => setShowAudioEditor(false)} />
        </div>
      )}
    </>
  )
}

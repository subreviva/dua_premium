"use client"

import { useState } from "react"
import {
  Music,
  Edit,
  Upload,
  Download,
  Share2,
  Eye,
  Trash2,
  Flag,
  ChevronRight,
  Sparkles,
  Radio,
  Scissors,
  Wand2,
  Gauge,
  FileMusic,
  Crop,
  Replace,
  Copy,
  Video,
  FileAudio,
  Users,
  MessageSquare,
  Repeat,
  Pin,
  Link,
  Disc,
  Loader2,
} from "lucide-react"

interface SongContextMenuProps {
  song: {
    id: string
    title: string
    taskId?: string
    musicIndex?: number
    genre?: string
    audioUrl?: string
  }
  onClose: () => void
  onEdit?: () => void
  position?: "left" | "right"
}

export function SongContextMenu({ song, onClose, onEdit, position = "right" }: SongContextMenuProps) {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)
  const [processingAction, setProcessingAction] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string>("")

  // 🎵 Download WAV
  const handleDownloadWAV = async () => {
    setProcessingAction("wav")
    setStatusMessage("Getting WAV URL...")
    try {
      const response = await fetch("/api/music/wav", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clip_id: song.id }),
      })
      
      const result = await response.json()
      
      if (result.success && result.data?.wav_url) {
        setStatusMessage("✓ Opening WAV...")
        window.open(result.data.wav_url, "_blank")
        setTimeout(() => {
          setProcessingAction(null)
          setStatusMessage("")
          onClose()
        }, 1000)
      } else {
        throw new Error(result.error || "Failed to get WAV URL")
      }
    } catch (error) {
      console.error("[v0] WAV download error:", error)
      setStatusMessage("✗ Failed to get WAV")
      setTimeout(() => {
        setProcessingAction(null)
        setStatusMessage("")
      }, 2000)
    }
  }

  // 🎹 Download MIDI
  const handleDownloadMIDI = async () => {
    setProcessingAction("midi")
    setStatusMessage("Getting MIDI data...")
    try {
      const response = await fetch("/api/music/midi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clip_id: song.id }),
      })
      
      const result = await response.json()
      
      if (result.success && result.data?.midi_url) {
        setStatusMessage("✓ Opening MIDI...")
        window.open(result.data.midi_url, "_blank")
        console.log("[v0] MIDI instruments:", result.data.instruments?.length || 0)
        setTimeout(() => {
          setProcessingAction(null)
          setStatusMessage("")
          onClose()
        }, 1000)
      } else {
        throw new Error(result.error || "Failed to get MIDI URL")
      }
    } catch (error) {
      console.error("[v0] MIDI download error:", error)
      setStatusMessage("✗ Failed to get MIDI")
      setTimeout(() => {
        setProcessingAction(null)
        setStatusMessage("")
      }, 2000)
    }
  }

  // ✂️ Separate Stems (Basic - 2 tracks)
  const handleSeparateStems = async () => {
    setProcessingAction("stems")
    setStatusMessage("Separating stems...")
    try {
      const response = await fetch("/api/music/stems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clip_id: song.id }),
      })
      
      const result = await response.json()
      
      if (result.success && result.data?.task_id) {
        setStatusMessage(`✓ Task started: ${result.data.task_id.slice(0, 8)}...`)
        console.log("[v0] Stems separation task ID:", result.data.task_id)
        setTimeout(() => {
          setProcessingAction(null)
          setStatusMessage("")
          onClose()
        }, 2000)
      } else {
        throw new Error(result.error || "Failed to start stem separation")
      }
    } catch (error) {
      console.error("[v0] Stems separation error:", error)
      setStatusMessage("✗ Failed to separate stems")
      setTimeout(() => {
        setProcessingAction(null)
        setStatusMessage("")
      }, 2000)
    }
  }

  // ✂️ Separate Stems (Full - 4 tracks)
  const handleSeparateStemsFull = async () => {
    setProcessingAction("stems-full")
    setStatusMessage("Separating full stems (4-track)...")
    try {
      const response = await fetch("/api/music/stems/full", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clip_id: song.id }),
      })
      
      const result = await response.json()
      
      if (result.success && result.data?.task_id) {
        setStatusMessage(`✓ Task started: ${result.data.task_id.slice(0, 8)}...`)
        console.log("[v0] Full stems separation task ID:", result.data.task_id)
        setTimeout(() => {
          setProcessingAction(null)
          setStatusMessage("")
          onClose()
        }, 2000)
      } else {
        throw new Error(result.error || "Failed to start full stem separation")
      }
    } catch (error) {
      console.error("[v0] Full stems separation error:", error)
      setStatusMessage("✗ Failed to separate full stems")
      setTimeout(() => {
        setProcessingAction(null)
        setStatusMessage("")
      }, 2000)
    }
  }

  // 🎭 Create Persona
  const handleCreatePersona = async () => {
    if (!song.audioUrl) {
      alert("Audio URL not available for this song")
      return
    }

    setProcessingAction("persona")
    setStatusMessage("Creating voice persona...")
    try {
      const personaName = prompt("Enter persona name:", `${song.title} Voice`)
      if (!personaName) {
        setProcessingAction(null)
        return
      }

      const response = await fetch("/api/music/persona", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: song.audioUrl,
          persona_name: personaName,
        }),
      })
      
      const result = await response.json()
      
      if (result.success && result.data?.persona_id) {
        setStatusMessage(`✓ Persona created: ${result.data.persona_id.slice(0, 8)}...`)
        console.log("[v0] Persona ID:", result.data.persona_id)
        localStorage.setItem(`persona_${song.id}`, result.data.persona_id)
        setTimeout(() => {
          setProcessingAction(null)
          setStatusMessage("")
          onClose()
        }, 2000)
      } else {
        throw new Error(result.error || "Failed to create persona")
      }
    } catch (error) {
      console.error("[v0] Create persona error:", error)
      setStatusMessage("✗ Failed to create persona")
      setTimeout(() => {
        setProcessingAction(null)
        setStatusMessage("")
      }, 2000)
    }
  }

  // 🎤 Generate with Persona
  const handleGenerateWithPersona = async () => {
    const personaId = localStorage.getItem(`persona_${song.id}`)
    if (!personaId) {
      alert("Create a persona for this song first!")
      return
    }

    setProcessingAction("persona-music")
    setStatusMessage("Generating with persona...")
    try {
      const prompt = window.prompt("Enter lyrics or description:", "A beautiful song")
      if (!prompt) {
        setProcessingAction(null)
        return
      }

      const response = await fetch("/api/music/persona-music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persona_id: personaId,
          prompt: prompt,
          mv: "chirp-v5",
        }),
      })
      
      const result = await response.json()
      
      if (result.success && result.data?.task_id) {
        setStatusMessage(`✓ Task started: ${result.data.task_id.slice(0, 8)}...`)
        console.log("[v0] Persona music task ID:", result.data.task_id)
        setTimeout(() => {
          setProcessingAction(null)
          setStatusMessage("")
          onClose()
        }, 2000)
      } else {
        throw new Error(result.error || "Failed to generate with persona")
      }
    } catch (error) {
      console.error("[v0] Generate with persona error:", error)
      setStatusMessage("✗ Failed to generate with persona")
      setTimeout(() => {
        setProcessingAction(null)
        setStatusMessage("")
      }, 2000)
    }
  }

  // 🔗 Concat Songs (needs another song selection)
  const handleConcatSongs = async () => {
    alert("Concat feature: Select another song to concat with this one")
    // TODO: Implement song selection UI
    onClose()
  }

  const menuItems = [
    {
      id: "download",
      label: "Download",
      icon: Download,
      hasSubmenu: true,
      submenu: [
        {
          label: "MP3 Audio",
          icon: FileAudio,
          action: () => {
            if (song.audioUrl) {
              window.open(song.audioUrl, "_blank")
              onClose()
            } else {
              alert("Audio URL not available")
            }
          },
        },
        {
          label: "WAV Audio (High Quality)",
          icon: Disc,
          badge: "Pro",
          action: handleDownloadWAV,
          processing: processingAction === "wav",
        },
        {
          label: "MIDI Data",
          icon: FileMusic,
          badge: "Pro",
          action: handleDownloadMIDI,
          processing: processingAction === "midi",
        },
      ],
    },
    {
      id: "stems",
      label: "Separate Stems",
      icon: Scissors,
      badge: "Pro",
      hasSubmenu: true,
      submenu: [
        {
          label: "Basic (Vocals + Instrumental)",
          icon: Scissors,
          action: handleSeparateStems,
          processing: processingAction === "stems",
        },
        {
          label: "Full (4-Track Separation)",
          icon: Disc,
          badge: "Advanced",
          action: handleSeparateStemsFull,
          processing: processingAction === "stems-full",
        },
      ],
    },
    {
      id: "persona",
      label: "Voice Persona",
      icon: Users,
      badge: "Pro",
      hasSubmenu: true,
      submenu: [
        {
          label: "Create Persona from Song",
          icon: Sparkles,
          action: handleCreatePersona,
          processing: processingAction === "persona",
        },
        {
          label: "Generate with Persona",
          icon: Music,
          action: handleGenerateWithPersona,
          processing: processingAction === "persona-music",
        },
      ],
    },
    {
      id: "concat",
      label: "Concat with Another",
      icon: Link,
      badge: "Advanced",
      action: handleConcatSongs,
    },
    { id: "divider-1", divider: true },
    { id: "edit", label: "Open in Studio", icon: Edit, action: onEdit },
    {
      id: "share",
      label: "Share",
      icon: Share2,
      hasSubmenu: true,
      submenu: [
        {
          label: "Copy Link",
          icon: Copy,
          action: () => {
            navigator.clipboard.writeText(window.location.href + `/song/${song.id}`)
            alert("Link copied!")
            onClose()
          },
        },
      ],
    },
    { id: "divider-2", divider: true },
    {
      id: "trash",
      label: "Move to Trash",
      icon: Trash2,
      danger: true,
      action: () => {
        if (confirm(`Move "${song.title}" to trash?`)) {
          // Remove from localStorage
          try {
            const stored = localStorage.getItem("suno-songs")
            if (stored) {
              const songs = JSON.parse(stored)
              const filtered = songs.filter((s: any) => s.id !== song.id)
              localStorage.setItem("suno-songs", JSON.stringify(filtered))
              window.dispatchEvent(new Event("storage"))
              console.log("[v0] Song moved to trash:", song.id)
            }
          } catch (error) {
            console.error("[v0] Error removing song:", error)
          }
          onClose()
        }
      },
    },
  ]

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />

      <div
        className={`absolute ${position === "right" ? "right-0" : "left-0"} top-full mt-2 w-72 glass-effect border border-white/10 rounded-lg shadow-2xl z-50 py-2 max-h-[80vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {statusMessage && (
          <div className="px-4 py-2 mb-2 bg-purple-500/20 border-b border-purple-500/30 text-purple-300 text-xs font-medium flex items-center gap-2">
            {processingAction ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : statusMessage.startsWith("✓") ? (
              <Music className="h-3 w-3" />
            ) : (
              <Trash2 className="h-3 w-3" />
            )}
            <span>{statusMessage}</span>
          </div>
        )}

        {menuItems.map((item) => {
          if ("divider" in item && item.divider) {
            return <div key={item.id} className="h-px bg-white/10 my-2" />
          }

          const Icon = item.icon
          if (!Icon) return null

          return (
            <div key={item.id} className="relative">
              <button
                className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 transition-colors text-left ${
                  item.danger ? "text-red-400 hover:text-red-300" : "text-white"
                } ${processingAction ? "opacity-50 pointer-events-none" : ""}`}
                onMouseEnter={() => item.hasSubmenu && setActiveSubmenu(item.id)}
                onClick={() => {
                  if (!item.hasSubmenu) {
                    if ("action" in item && item.action) {
                      item.action()
                    }
                    if (!processingAction) {
                      onClose()
                    }
                  }
                }}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1 text-sm font-medium">{item.label}</span>
                {"badge" in item && item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold uppercase tracking-wide">
                    {item.badge}
                  </span>
                )}
                {item.hasSubmenu && <ChevronRight className="h-4 w-4 text-neutral-400" />}
              </button>

              {item.hasSubmenu && activeSubmenu === item.id && item.submenu && (
                <div
                  className="absolute left-full top-0 ml-2 w-64 glass-effect border border-white/10 rounded-lg shadow-2xl py-2 z-50"
                  onMouseLeave={() => setActiveSubmenu(null)}
                >
                  {item.submenu.map((subitem, idx) => {
                    const SubIcon = subitem.icon
                    return (
                      <button
                        key={idx}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 transition-colors text-left text-white ${
                          "processing" in subitem && subitem.processing ? "bg-purple-500/20" : ""
                        } ${processingAction && !("processing" in subitem && subitem.processing) ? "opacity-50 pointer-events-none" : ""}`}
                        onClick={() => {
                          console.log(`[v0] ${subitem.label} clicked for song:`, song.id)
                          if ("action" in subitem && subitem.action) {
                            subitem.action()
                          }
                        }}
                      >
                        <SubIcon className="h-4 w-4 flex-shrink-0" />
                        <span className="flex-1 text-sm font-medium">{subitem.label}</span>
                        {"processing" in subitem && subitem.processing && (
                          <Loader2 className="h-3 w-3 animate-spin text-purple-400" />
                        )}
                        {"badge" in subitem && subitem.badge && !("processing" in subitem && subitem.processing) && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold uppercase tracking-wide">
                            {subitem.badge}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}

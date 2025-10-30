"use client"

import { useState } from "react"
import { useMusicOperations } from "@/hooks/use-music-operations"
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
  const musicOps = useMusicOperations()

  // Handler functions for each action
  const handleCover = async () => {
    try {
      const result = await musicOps.generateCover(song.id, {
        title: song.title,
        style: song.genre || "",
      })
      alert(`Cover generation started! Task ID: ${result.data?.taskId}`)
    } catch (error) {
      alert("Failed to generate cover")
    }
    onClose()
  }

  const handleExtend = async () => {
    try {
      const result = await musicOps.extendMusic(song.id, {
        prompt: `Continue the song "${song.title}"`,
        model: "V5",
      })
      alert(`Music extension started! Task ID: ${result.data?.taskId}`)
    } catch (error) {
      alert("Failed to extend music")
    }
    onClose()
  }

  const handleReplaceSection = async () => {
    try {
      const result = await musicOps.replaceSection(song.id, {
        startTime: 10,
        endTime: 20,
        prompt: "New section",
      })
      alert(`Section replacement started! Task ID: ${result.data?.taskId}`)
    } catch (error) {
      alert("Failed to replace section")
    }
    onClose()
  }

  const handleMakePersona = async () => {
    try {
      const result = await musicOps.generatePersona(song)
      if (result.code === 200) {
        alert(`Persona "${result.data.name}" created successfully!`)
      } else if (result.code === 409) {
        alert("A persona already exists for this music")
      } else {
        alert(`Error: ${result.msg}`)
      }
    } catch (error) {
      alert("Failed to create persona")
    }
    onClose()
  }

  const handleGetStems = async () => {
    try {
      const result = await musicOps.separateVocals(song.id, "split_stem")
      alert(`Stem separation started! Task ID: ${result.data?.taskId}`)
    } catch (error) {
      alert("Failed to get stems")
    }
    onClose()
  }

  const handleDownloadWav = async () => {
    try {
      const result = await musicOps.convertToWav(song.id)
      alert(`WAV conversion started! Task ID: ${result.data?.taskId}`)
    } catch (error) {
      alert("Failed to convert to WAV")
    }
    onClose()
  }

  const handleCreateVideo = async () => {
    try {
      const result = await musicOps.createMusicVideo(song.id, {
        author: "My Music Studio",
      })
      alert(`Video creation started! Task ID: ${result.data?.taskId}`)
    } catch (error) {
      alert("Failed to create video")
    }
    onClose()
  }

  const handleBoostStyle = async () => {
    try {
      const result = await musicOps.boostStyle(song.genre || song.title)
      alert("Style boost applied!")
    } catch (error) {
      alert("Failed to boost style")
    }
    onClose()
  }

  const handleGetTimestampedLyrics = async () => {
    try {
      const result = await musicOps.getTimestampedLyrics(song.id)
      alert(`Timestamped lyrics requested! Task ID: ${result.data?.taskId}`)
    } catch (error) {
      alert("Failed to get timestamped lyrics")
    }
    onClose()
  }

  const menuItems = [
    {
      id: "remix",
      label: "Remix/Edit",
      icon: Edit,
      hasSubmenu: true,
      submenu: [
        { label: "Open in Studio", icon: Sparkles, badge: "New", action: onEdit },
        { label: "Open in Editor", icon: Edit, badge: "Pro", action: onEdit },
        { label: "Cover", icon: Music, action: handleCover },
        { label: "Extend", icon: Wand2, action: handleExtend },
        { label: "Adjust Speed", icon: Gauge, action: () => console.log("Adjust speed") },
        { label: "Use Styles & Lyrics", icon: FileMusic, action: handleGetTimestampedLyrics },
        { label: "Crop", icon: Crop, badge: "Pro", action: () => console.log("Crop") },
        { label: "Replace Section", icon: Replace, badge: "Pro", action: handleReplaceSection },
      ],
    },
    {
      id: "create",
      label: "Create",
      icon: Sparkles,
      hasSubmenu: true,
      submenu: [
        { label: "Make Persona", icon: Users, badge: "Pro", action: handleMakePersona },
        { label: "Remaster", icon: Wand2, badge: "Pro", action: handleBoostStyle },
        { label: "Song Radio", icon: Radio, action: () => console.log("Song radio") },
      ],
    },
    { id: "stems", label: "Get Stems", icon: Scissors, badge: "Pro", action: handleGetStems },
    { id: "queue", label: "Add to Queue", icon: Music, action: () => console.log("Add to queue") },
    { id: "playlist", label: "Add to Playlist", icon: Music, action: () => console.log("Add to playlist") },
    { id: "workspace", label: "Move to Workspace", icon: Upload, action: () => console.log("Move to workspace") },
    { id: "publish", label: "Publish", icon: Upload, action: () => console.log("Publish") },
    { id: "details", label: "Song Details", icon: FileMusic, action: () => console.log("Song details") },
    {
      id: "visibility",
      label: "Visibility & Permissions",
      icon: Eye,
      hasSubmenu: true,
      submenu: [
        { label: "Allow Comments", icon: MessageSquare, toggle: true },
        { label: "Allow Remixes", icon: Repeat, toggle: true },
        { label: "Pin to Profile", icon: Pin, toggle: true },
      ],
    },
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
          },
        },
        { label: "Share to...", icon: Share2, action: () => console.log("Share") },
      ],
    },
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
            } else {
              alert("Audio URL not available")
            }
          },
        },
        { label: "WAV Audio", icon: FileAudio, badge: "Pro", action: handleDownloadWav },
        { label: "Video", icon: Video, badge: "Pro", action: handleCreateVideo },
      ],
    },
    { id: "report", label: "Report", icon: Flag, action: () => console.log("Report") },
    {
      id: "trash",
      label: "Move to Trash",
      icon: Trash2,
      danger: true,
      action: () => {
        if (confirm(`Move "${song.title}" to trash?`)) {
          console.log("Move to trash")
        }
      },
    },
  ]

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />

      <div
        className={`absolute ${position === "right" ? "right-0" : "left-0"} top-full mt-2 w-64 glass-effect border border-white/10 rounded-lg shadow-xl z-50 py-2`}
        onClick={(e) => e.stopPropagation()}
      >
        {menuItems.map((item) => (
          <div key={item.id} className="relative">
            <button
              className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 transition-colors text-left ${
                item.danger ? "text-red-400 hover:text-red-300" : "text-white"
              }`}
              onMouseEnter={() => item.hasSubmenu && setActiveSubmenu(item.id)}
              onClick={() => {
                if (!item.hasSubmenu) {
                  if ("action" in item && item.action) {
                    item.action()
                  }
                  onClose()
                }
              }}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1 text-sm font-medium">{item.label}</span>
              {"badge" in item && item.badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold">
                  {item.badge}
                </span>
              )}
              {item.hasSubmenu && <ChevronRight className="h-4 w-4 text-neutral-400" />}
            </button>

            {item.hasSubmenu && activeSubmenu === item.id && item.submenu && (
              <div
                className="absolute left-full top-0 ml-2 w-56 glass-effect border border-white/10 rounded-lg shadow-xl py-2"
                onMouseLeave={() => setActiveSubmenu(null)}
              >
                {item.submenu.map((subitem, idx) => (
                  <button
                    key={idx}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 transition-colors text-left text-white"
                    onClick={() => {
                      console.log(`[v0] ${subitem.label} clicked for song:`, song.id)
                      if ("action" in subitem && subitem.action) {
                        subitem.action()
                      }
                      if (!("toggle" in subitem)) {
                        onClose()
                      }
                    }}
                  >
                    <subitem.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="flex-1 text-sm font-medium">{subitem.label}</span>
                    {"badge" in subitem && subitem.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold">
                        {subitem.badge}
                      </span>
                    )}
                    {"toggle" in subitem && subitem.toggle && (
                      <div className="w-8 h-4 rounded-full bg-neutral-700 relative">
                        <div className="absolute left-0.5 top-0.5 w-3 h-3 rounded-full bg-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}

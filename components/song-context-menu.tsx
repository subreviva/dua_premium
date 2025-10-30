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
} from "lucide-react"

interface SongContextMenuProps {
  song: {
    id: string
    title: string
  }
  onClose: () => void
  onEdit?: () => void
  position?: "left" | "right"
}

export function SongContextMenu({ song, onClose, onEdit, position = "right" }: SongContextMenuProps) {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)

  const menuItems = [
    {
      id: "remix",
      label: "Remix/Edit",
      icon: Edit,
      hasSubmenu: true,
      submenu: [
        { label: "Open in Studio", icon: Sparkles, badge: "New", action: onEdit },
        { label: "Open in Editor", icon: Edit, badge: "Pro", action: onEdit },
        { label: "Cover", icon: Music },
        { label: "Extend", icon: Wand2 },
        { label: "Adjust Speed", icon: Gauge },
        { label: "Use Styles & Lyrics", icon: FileMusic },
        { label: "Crop", icon: Crop, badge: "Pro" },
        { label: "Replace Section", icon: Replace, badge: "Pro" },
      ],
    },
    {
      id: "create",
      label: "Create",
      icon: Sparkles,
      hasSubmenu: true,
      submenu: [
        { label: "Make Persona", icon: Users, badge: "Pro" },
        { label: "Remaster", icon: Wand2, badge: "Pro" },
        { label: "Song Radio", icon: Radio },
      ],
    },
    { id: "stems", label: "Get Stems", icon: Scissors, badge: "Pro" },
    { id: "queue", label: "Add to Queue", icon: Music },
    { id: "playlist", label: "Add to Playlist", icon: Music },
    { id: "workspace", label: "Move to Workspace", icon: Upload },
    { id: "publish", label: "Publish", icon: Upload },
    { id: "details", label: "Song Details", icon: FileMusic },
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
        { label: "Copy Link", icon: Copy },
        { label: "Share to...", icon: Share2 },
      ],
    },
    {
      id: "download",
      label: "Download",
      icon: Download,
      hasSubmenu: true,
      submenu: [
        { label: "MP3 Audio", icon: FileAudio },
        { label: "WAV Audio", icon: FileAudio, badge: "Pro" },
        { label: "Video", icon: Video, badge: "Pro" },
      ],
    },
    { id: "report", label: "Report", icon: Flag },
    { id: "trash", label: "Move to Trash", icon: Trash2, danger: true },
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
                  console.log(`[v0] ${item.label} clicked for song:`, song.id)
                  onClose()
                }
              }}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1 text-sm font-medium">{item.label}</span>
              {item.badge && (
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
                      if (subitem.action) {
                        subitem.action()
                      }
                      onClose()
                    }}
                  >
                    <subitem.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="flex-1 text-sm font-medium">{subitem.label}</span>
                    {subitem.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold">
                        {subitem.badge}
                      </span>
                    )}
                    {subitem.toggle && (
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

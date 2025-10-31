"use client"

import { Home, Music, Sliders, Library, Search, Radio, Bell, MoreHorizontal, Plus, Gift, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface SidebarProps {
  currentView: "create" | "workspaces"
  onViewChange: (view: "create" | "workspaces") => void
  selectedWorkspace: string
}

export function Sidebar({ currentView, onViewChange, selectedWorkspace }: SidebarProps) {
  const handleUpgrade = () => {
    window.open("https://suno.com/pricing", "_blank")
  }

  const handleMoreFromDuaMusic = () => {
    window.open("https://duamusic.com", "_blank")
  }

  const handleEarnCredits = () => {
    window.open("https://suno.com/earn", "_blank")
  }

  const handleWhatsNew = () => {
    window.open("https://suno.com/updates", "_blank")
  }

  return (
    <div className="w-[180px] bg-[#0a0a0a] border-r border-neutral-800 flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-tight">DUA MUSIC</h1>
      </div>

      {/* User */}
      <div className="px-4 mb-6 flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Captura%20de%20ecra%CC%83%202025-10-28%2C%20a%CC%80s%2002.11.26-kNnG8cjV6nseVAdWybgpuxgvkP634a.png" />
          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500">JH</AvatarFallback>
        </Avatar>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-sm font-medium text-white truncate">JubilantHarmo</span>
          <span className="text-xs text-neutral-500 truncate">@jubilantharmo</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        <Button
          variant="ghost"
          className="w-full justify-start text-neutral-400 hover:text-white hover:bg-neutral-900"
          onClick={() => onViewChange("create")}
        >
          <Home className="mr-3 h-4 w-4" />
          Home
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-white bg-neutral-900"
          onClick={() => onViewChange("create")}
        >
          <Music className="mr-3 h-4 w-4" />
          Create
        </Button>
        <Button variant="ghost" className="w-full justify-start text-neutral-400 hover:text-white hover:bg-neutral-900">
          <Sliders className="mr-3 h-4 w-4" />
          Studio
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-neutral-400 hover:text-white hover:bg-neutral-900"
          onClick={() => onViewChange("workspaces")}
        >
          <Library className="mr-3 h-4 w-4" />
          Library
        </Button>
        <Button variant="ghost" className="w-full justify-start text-neutral-400 hover:text-white hover:bg-neutral-900">
          <Search className="mr-3 h-4 w-4" />
          Search
        </Button>

        <div className="pt-2">
          <Button
            variant="ghost"
            className="w-full justify-between text-neutral-400 hover:text-white hover:bg-neutral-900 group"
          >
            <div className="flex items-center">
              <Music className="mr-3 h-4 w-4" />
              Hooks
            </div>
            <Plus className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>
        </div>

        <Button variant="ghost" className="w-full justify-start text-neutral-400 hover:text-white hover:bg-neutral-900">
          <Search className="mr-3 h-4 w-4" />
          Explore
        </Button>
        <Button variant="ghost" className="w-full justify-start text-neutral-400 hover:text-white hover:bg-neutral-900">
          <Radio className="mr-3 h-4 w-4" />
          Radio
        </Button>
        <Button variant="ghost" className="w-full justify-start text-neutral-400 hover:text-white hover:bg-neutral-900">
          <Bell className="mr-3 h-4 w-4" />
          Notifications
        </Button>
      </nav>

      {/* Bottom section */}
      <div className="p-4 space-y-3 border-t border-neutral-800">
        <div className="text-sm">
          <div className="font-semibold mb-1">2500 Credits</div>
        </div>

        <Button className="w-full bg-white text-black hover:bg-neutral-200 font-semibold" onClick={handleUpgrade}>
          Upgrade
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start text-neutral-400 hover:text-white text-sm px-2"
          onClick={handleEarnCredits}
        >
          <Gift className="mr-2 h-4 w-4" />
          Earn Credits
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start text-neutral-400 hover:text-white text-sm px-2"
          onClick={handleWhatsNew}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          What's new?
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start text-neutral-400 hover:text-white text-sm px-2"
          onClick={handleMoreFromDuaMusic}
        >
          <MoreHorizontal className="mr-2 h-4 w-4" />
          Mais sobre DUA MUSIC
        </Button>
      </div>
    </div>
  )
}

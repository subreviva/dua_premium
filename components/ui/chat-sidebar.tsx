"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Search,
  MessageSquarePlus,
  Mic,
  History,
  ChevronLeft,
  ChevronRight,
  User,
  Music,
  Palette,
  ImageIcon,
  Video,
  Settings,
  Users,
} from "lucide-react"
import Link from "next/link"

interface SidebarItem {
  icon: React.ElementType
  label: string
  href?: string
  action?: () => void
  badge?: string
}

interface HistoryItem {
  id: string
  title: string
  date: string
}

interface ChatSidebarProps {
  isOpen?: boolean
  isCollapsed: boolean
  onToggleOpen?: (open: boolean) => void
  onToggleCollapsed?: (collapsed: boolean) => void
}

export function ChatSidebar({
  isOpen = true,
  isCollapsed: externalCollapsed = false,
  onToggleOpen,
  onToggleCollapsed,
}: ChatSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(externalCollapsed)
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false)

  useEffect(() => {
    setIsCollapsed(externalCollapsed)
  }, [externalCollapsed])

  const handleToggleCollapsed = () => {
    const newCollapsed = !isCollapsed
    setIsCollapsed(newCollapsed)
    onToggleCollapsed?.(newCollapsed)
  }

  const sidebarItems: SidebarItem[] = [
    { icon: Search, label: "Buscar", action: () => console.log("[v0] Search"), badge: "⌘K" },
    { icon: MessageSquarePlus, label: "Nova conversa", action: () => window.location.reload() },
    { icon: Mic, label: "Voz", action: () => console.log("[v0] Voice") },
  ]

  const studioItems: SidebarItem[] = [
    { icon: Music, label: "DUA MUSIC", href: "/musicstudio" },
    { icon: Palette, label: "DUA DESIGN", href: "/designstudio" },
    { icon: ImageIcon, label: "DUA IMAGEM", href: "/imagestudio" },
    { icon: Video, label: "DUA CINEMA", href: "/videostudio" },
  ]

  const communityItems: SidebarItem[] = [{ icon: Users, label: "Comunidade", href: "/community" }]

  const historyItems: HistoryItem[] = [
    { id: "1", title: "Hoje", date: "Today" },
    { id: "2", title: "Últimas notícias de 24 de outubro", date: "Yesterday" },
  ]

  if (!isOpen) return null

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-black/40 backdrop-blur-xl border-r border-white/5 transition-all duration-300 ease-in-out z-60 flex flex-col pt-20",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1 premium-scrollbar">
        {sidebarItems.map((item, index) => (
          <Button
            key={index}
            onClick={item.action}
            variant="ghost"
            className={cn(
              "w-full text-white/70 hover:text-white hover:bg-white/5 transition-colors",
              isCollapsed
                ? "h-10 px-0 flex items-center justify-center"
                : "h-10 px-3 flex items-center justify-start gap-3",
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="flex-1 text-left text-sm">{item.label}</span>}
            {!isCollapsed && item.badge && <span className="text-xs text-white/40">{item.badge}</span>}
          </Button>
        ))}

        {/* Studios Section */}
        {!isCollapsed && (
          <div className="pt-4 pb-2">
            <div className="px-3 mb-2">
              <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Studios</span>
            </div>
          </div>
        )}

        {studioItems.map((item, index) => (
          <Link key={index} href={item.href || "#"}>
            <Button
              variant="ghost"
              className={cn(
                "w-full text-white/70 hover:text-white hover:bg-white/5 transition-colors",
                isCollapsed
                  ? "h-10 px-0 flex items-center justify-center"
                  : "h-10 px-3 flex items-center justify-start gap-3",
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="flex-1 text-left text-sm">{item.label}</span>}
            </Button>
          </Link>
        ))}

        {/* Community Section */}
        {!isCollapsed && (
          <div className="pt-4 pb-2">
            <div className="px-3 mb-2">
              <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Comunidade</span>
            </div>
          </div>
        )}

        {communityItems.map((item, index) => (
          <Link key={index} href={item.href || "#"}>
            <Button
              variant="ghost"
              className={cn(
                "w-full text-white/70 hover:text-white hover:bg-white/5 transition-colors",
                isCollapsed
                  ? "h-10 px-0 flex items-center justify-center"
                  : "h-10 px-3 flex items-center justify-start gap-3",
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="flex-1 text-left text-sm">{item.label}</span>}
            </Button>
          </Link>
        ))}

        {/* History Section */}
        <div className="pt-2">
          <Button
            onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
            variant="ghost"
            className={cn(
              "w-full text-white/70 hover:text-white hover:bg-white/5 transition-colors",
              isCollapsed
                ? "h-10 px-0 flex items-center justify-center"
                : "h-10 px-3 flex items-center justify-start gap-3",
            )}
          >
            <History className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="flex-1 text-left text-sm">Histórico</span>}
          </Button>

          {!isCollapsed && isHistoryExpanded && (
            <div className="ml-8 mt-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
              {historyItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => console.log("[v0] History item:", item.id)}
                  className="w-full text-left px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  {item.title}
                </button>
              ))}
              <button
                onClick={() => console.log("[v0] View all history")}
                className="w-full text-left px-3 py-2 text-xs text-purple-400 hover:text-purple-300 hover:bg-white/5 rounded-lg transition-colors"
              >
                Ver todos
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Settings Button - Redireciona para página de configurações */}
      <div className="border-t border-white/5 p-2">
        <Link href="/settings">
          <Button
            variant="ghost"
            className={cn(
              "w-full text-white/70 hover:text-white hover:bg-white/5 transition-colors",
              isCollapsed
                ? "h-10 px-0 flex items-center justify-center"
                : "h-10 px-3 flex items-center justify-start gap-3",
            )}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="flex-1 text-left text-sm">Definições</span>}
          </Button>
        </Link>
      </div>

      {/* User Profile */}
      <div className="border-t border-white/5 p-2">
        <Link href="/profile/maria_silva">
          <Button
            variant="ghost"
            className={cn(
              "w-full text-white/70 hover:text-white hover:bg-white/5 transition-colors",
              isCollapsed
                ? "h-10 px-0 flex items-center justify-center"
                : "h-10 px-3 flex items-center justify-start gap-3",
            )}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
            {!isCollapsed && <span className="flex-1 text-left text-sm">Perfil</span>}
          </Button>
        </Link>
      </div>

      {/* Collapse Toggle */}
      <div className="border-t border-white/5 p-2">
        <Button
          onClick={handleToggleCollapsed}
          variant="ghost"
          size="icon"
          className="w-full text-white/70 hover:text-white hover:bg-white/5 transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>
    </aside>
  )
}

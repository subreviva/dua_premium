"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { Scissors, Home, MessageSquare, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: "Início", href: "/musicstudio", icon: null },
  { name: "Criar", href: "/create", icon: null },
  { name: "Melodia", href: "/melody", icon: null },
  { name: "Biblioteca", href: "/library", icon: null },
  { name: "Estúdio", href: "", icon: Scissors, isStudio: true }, // href vazio, será gerido dinamicamente
]

const exitNav = [
  { name: "Home", href: "/", icon: Home, description: "Página principal do site" },
  { name: "Chat", href: "/chat", icon: MessageSquare, description: "Conversar com DUA" },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [availableStems, setAvailableStems] = useState<string[]>([])

  useEffect(() => {
    const checkForStems = () => {
      try {
        const stemsData = localStorage.getItem("track-stems")
        console.log("[v0] Checking for any stems in localStorage")

        if (stemsData) {
          const allStems = JSON.parse(stemsData)
          console.log("[v0] All stems:", allStems)

          // Get all track IDs that have stems
          const trackIdsWithStems = Object.keys(allStems).filter(
            (trackId) => allStems[trackId]?.stems && allStems[trackId].stems.length > 0,
          )

          console.log("[v0] Track IDs with stems:", trackIdsWithStems)
          setAvailableStems(trackIdsWithStems)
        } else {
          setAvailableStems([])
        }
      } catch (error) {
        console.error("[v0] Error checking stems:", error)
        setAvailableStems([])
      }
    }

    checkForStems()

    const interval = setInterval(checkForStems, 2000)
    return () => clearInterval(interval)
  }, [])

  const stemsTrackId = availableStems.length > 0 ? availableStems[0] : null

  return (
    <div
      className={cn(
        "flex h-screen flex-col border-r border-border/30 bg-sidebar/50 backdrop-blur-xl transition-all duration-500 ease-out",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      <div className="flex h-20 items-center justify-between border-b border-border/30 px-6">
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="text-2xl font-light tracking-tight text-foreground">DUA</span>
            <span className="text-xs font-light tracking-widest text-muted-foreground/60">MUSIC STUDIO</span>
          </div>
        )}
        <button
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground/60 transition-all hover:bg-sidebar-accent/50 hover:text-foreground"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <svg
            className={cn("h-4 w-4 transition-transform duration-300", isCollapsed && "rotate-180")}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-8">
        {/* Exit Navigation - Sair do Music Studio */}
        <div className="mb-6 pb-6 border-b border-border/20">
          {!isCollapsed && (
            <div className="mb-3 px-4">
              <span className="text-xs font-light text-muted-foreground/40 tracking-widest">SAIR DO ESTÚDIO</span>
            </div>
          )}
          {exitNav.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-4 py-3 mb-2 text-sm font-light tracking-wide transition-all duration-300",
                "text-muted-foreground/70 hover:bg-sidebar-accent/30 hover:text-foreground",
                "border border-transparent hover:border-primary/20"
              )}
              title={isCollapsed ? item.description : undefined}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && (
                <div className="flex flex-col flex-1">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-xs text-muted-foreground/50">{item.description}</span>
                </div>
              )}
              {!isCollapsed && (
                <ArrowLeft className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </Link>
          ))}
        </div>

        {/* Music Studio Navigation */}
        {!isCollapsed && (
          <div className="mb-3 px-4">
            <span className="text-xs font-light text-muted-foreground/40 tracking-widest">MUSIC STUDIO</span>
          </div>
        )}
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.isStudio && pathname.startsWith("/stems"))
          
          // Para o botão Estúdio, usa o primeiro stem disponível ou vai para /stems/demo
          const href = item.isStudio 
            ? (stemsTrackId ? `/stems/${stemsTrackId}` : `/stems/demo`)
            : item.href

          return (
            <Link
              key={item.name}
              href={href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-light tracking-wide transition-all duration-300",
                isActive
                  ? "bg-gradient-to-r from-primary/10 to-accent/10 text-foreground shadow-lg shadow-primary/5"
                  : "text-muted-foreground/70 hover:bg-sidebar-accent/30 hover:text-foreground",
              )}
              title={isCollapsed ? item.name : undefined}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-primary to-accent" />
              )}
              {item.icon && <item.icon className="h-4 w-4 flex-shrink-0" />}
              {!isCollapsed && (
                <span className="relative">
                  {item.name}
                  {isActive && (
                    <div className="absolute -bottom-0.5 left-0 h-px w-full bg-gradient-to-r from-primary/50 to-transparent" />
                  )}
                </span>
              )}
              {isCollapsed && !item.icon && <span className="text-xs">{item.name.charAt(0)}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border/30 px-6 py-4">
        {!isCollapsed && (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-light text-muted-foreground/40">Version 1.0</span>
            <span className="text-xs font-light text-muted-foreground/40">© 2025 DUA Music</span>
          </div>
        )}
      </div>
    </div>
  )
}

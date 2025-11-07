"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { Scissors } from "lucide-react"

const navigation = [
  { name: "Início", href: "/" },
  { name: "Criar", href: "/create" },
  { name: "Melodia", href: "/melody" },
  { name: "Biblioteca", href: "/library" },
]

export function AppSidebar() {
  const pathname = usePathname()
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
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group relative flex items-center rounded-xl px-4 py-3.5 text-sm font-light tracking-wide transition-all duration-300",
                isActive
                  ? "bg-gradient-to-r from-primary/10 to-accent/10 text-foreground shadow-lg shadow-primary/5"
                  : "text-muted-foreground/70 hover:bg-sidebar-accent/30 hover:text-foreground",
              )}
              title={isCollapsed ? item.name : undefined}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-primary to-accent" />
              )}
              {!isCollapsed && (
                <span className="relative">
                  {item.name}
                  {isActive && (
                    <div className="absolute -bottom-0.5 left-0 h-px w-full bg-gradient-to-r from-primary/50 to-transparent" />
                  )}
                </span>
              )}
              {isCollapsed && <span className="text-xs">{item.name.charAt(0)}</span>}
            </Link>
          )
        })}

        {stemsTrackId && (
          <Link
            href={`/stems/${stemsTrackId}`}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-light tracking-wide transition-all duration-300",
              pathname.startsWith("/stems")
                ? "bg-gradient-to-r from-primary/10 to-accent/10 text-foreground shadow-lg shadow-primary/5"
                : "text-muted-foreground/70 hover:bg-sidebar-accent/30 hover:text-foreground",
            )}
            title={isCollapsed ? "Stems" : undefined}
          >
            {pathname.startsWith("/stems") && (
              <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-primary to-accent" />
            )}
            <Scissors className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && (
              <span className="relative">
                Stems
                {pathname.startsWith("/stems") && (
                  <div className="absolute -bottom-0.5 left-0 h-px w-full bg-gradient-to-r from-primary/50 to-transparent" />
                )}
              </span>
            )}
          </Link>
        )}
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

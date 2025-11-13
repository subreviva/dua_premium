"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Scissors, 
  Home, 
  MessageSquare, 
  ArrowLeft, 
  Music2, 
  Sparkles, 
  Wand2, 
  Library,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

const navigation = [
  { name: "Início", href: "/musicstudio", icon: Home, gradient: "from-blue-500 to-cyan-500" },
  { name: "Criar", href: "/musicstudio/create", icon: Sparkles, gradient: "from-orange-500 to-pink-600" },
  { name: "Melodia", href: "/melody", icon: Wand2, gradient: "from-purple-500 to-pink-500" },
  { name: "Biblioteca", href: "/musicstudio/library", icon: Library, gradient: "from-green-500 to-emerald-500" },
  { name: "Estúdio", href: "", icon: Scissors, gradient: "from-red-500 to-orange-500", isStudio: true },
]

const exitNav = [
  { name: "Home", href: "/", icon: Home, description: "Página principal" },
  { name: "Chat", href: "/chat", icon: MessageSquare, description: "Conversar com DUA" },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [availableStems, setAvailableStems] = useState<string[]>([])
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  useEffect(() => {
    const checkForStems = () => {
      try {
        const stemsData = localStorage.getItem("track-stems")

        if (stemsData) {
          const allStems = JSON.parse(stemsData)
          const trackIdsWithStems = Object.keys(allStems).filter(
            (trackId) => allStems[trackId]?.stems && allStems[trackId].stems.length > 0,
          )
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
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex h-screen flex-col border-r border-white/5 bg-gradient-to-b from-black via-zinc-950 to-black backdrop-blur-2xl z-20"
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-pink-500/5 pointer-events-none" />
      
      {/* Glass effect border */}
      <div className="absolute inset-0 border-r border-white/[0.02] pointer-events-none" />

      {/* Header */}
      <div className="relative flex h-24 items-center justify-between border-b border-white/5 px-6 mt-16">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-600 rounded-xl blur-lg opacity-50" />
                <Music2 className="relative h-8 w-8 text-orange-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 bg-clip-text text-transparent">
                  DUA
                </span>
                <span className="text-[10px] font-light tracking-[0.2em] text-white/40">MUSIC STUDIO</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="relative group flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl transition-all hover:bg-white/10"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-pink-600/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          {isCollapsed ? (
            <ChevronRight className="relative h-4 w-4 text-white/60 group-hover:text-white" />
          ) : (
            <ChevronLeft className="relative h-4 w-4 text-white/60 group-hover:text-white" />
          )}
        </motion.button>
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 px-3 py-4 overflow-y-auto custom-scrollbar">
        {/* Exit Navigation */}
        <div className="mb-4 pb-4 border-b border-white/5">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-2 px-3"
              >
                <span className="text-[10px] font-medium text-white/30 tracking-[0.2em]">SAIR</span>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="space-y-1">
            {exitNav.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onMouseEnter={() => setHoveredItem(item.name)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <motion.div
                  whileHover={{ x: 4 }}
                  className="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10 group-hover:border-white/20 transition-colors">
                    <item.icon className="h-4 w-4 text-white/40 group-hover:text-white/70 transition-colors" />
                  </div>
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="flex flex-col overflow-hidden"
                      >
                        <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-white/30">{item.description}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {!isCollapsed && (
                    <ArrowLeft className="ml-auto h-3 w-3 text-white/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

        {/* Music Studio Navigation */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-2 px-3"
            >
              <span className="text-[10px] font-medium text-white/30 tracking-[0.2em]">ESTÚDIO</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.isStudio && pathname.startsWith("/stems"))
            const href = item.isStudio 
              ? (stemsTrackId ? `/stems/${stemsTrackId}` : `/stems/demo`)
              : item.href

            return (
              <Link
                key={item.name}
                href={href}
                onMouseEnter={() => setHoveredItem(item.name)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-3 transition-all overflow-hidden",
                    isActive && "shadow-lg"
                  )}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-gradient-to-b from-orange-500 via-red-500 to-pink-600"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  
                  {/* Background effects */}
                  <div className={cn(
                    "absolute inset-0 rounded-xl opacity-0 transition-opacity",
                    isActive ? "opacity-100" : "group-hover:opacity-100"
                  )}>
                    <div className={cn(
                      "absolute inset-0 bg-gradient-to-r rounded-xl",
                      isActive ? `${item.gradient} opacity-10` : "from-white/5 to-transparent opacity-100"
                    )} />
                    {isActive && (
                      <div className={cn(
                        "absolute inset-0 bg-gradient-to-r rounded-xl blur-xl",
                        item.gradient,
                        "opacity-20"
                      )} />
                    )}
                  </div>

                  {/* Icon */}
                  <div className={cn(
                    "relative flex h-9 w-9 items-center justify-center rounded-lg transition-all",
                    isActive 
                      ? `bg-gradient-to-br ${item.gradient} shadow-lg` 
                      : "bg-white/5 border border-white/10 group-hover:border-white/20"
                  )}>
                    <item.icon className={cn(
                      "h-4 w-4 transition-colors",
                      isActive ? "text-white" : "text-white/40 group-hover:text-white/70"
                    )} />
                  </div>

                  {/* Label */}
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className={cn(
                          "relative text-sm font-medium transition-colors overflow-hidden whitespace-nowrap",
                          isActive 
                            ? "text-white" 
                            : "text-white/60 group-hover:text-white"
                        )}
                      >
                        {item.name}
                        {isActive && (
                          <motion.div
                            layoutId="activeUnderline"
                            className={cn(
                              "absolute -bottom-0.5 left-0 h-[2px] w-full bg-gradient-to-r rounded-full",
                              item.gradient
                            )}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="relative border-t border-white/5 px-6 py-4">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-0.5"
            >
              <span className="text-[10px] font-light text-white/20">Version 1.0</span>
              <span className="text-[10px] font-light text-white/20">© 2025 DUA Music</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

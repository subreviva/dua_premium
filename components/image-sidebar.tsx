"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Home, 
  MessageSquare, 
  Image as ImageIcon, 
  Sparkles, 
  Library,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

const navigation = [
  { name: "Criar", href: "/imagestudio/create", icon: Sparkles },
  { name: "Biblioteca", href: "/imagestudio/library", icon: Library },
]

const exitNav = [
  { name: "Home", href: "/", icon: Home, description: "Página principal" },
  { name: "Chat", href: "/chat", icon: MessageSquare, description: "Conversar com DUA" },
]

export function ImageSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex h-screen flex-col border-r border-white/5 bg-gradient-to-b from-black via-zinc-950 to-black backdrop-blur-2xl z-20"
    >
      {/* Subtle overlay */}
      <div className="absolute inset-0 bg-[#8B7355]/5 pointer-events-none" />
      
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
                <ImageIcon className="relative h-8 w-8 text-[#8B7355]" strokeWidth={0.75} />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-[#8B7355]">
                  DUA
                </span>
                <span className="text-[10px] font-light tracking-[0.2em] text-white/40">IMAGE STUDIO</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapse button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "relative flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 backdrop-blur-xl transition-all hover:bg-white/10",
            isCollapsed && "mx-auto"
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-white/60" strokeWidth={1.5} />
          ) : (
            <ChevronLeft className="h-4 w-4 text-white/60" strokeWidth={1.5} />
          )}
        </motion.button>
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 space-y-2 px-3 py-6 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link key={item.name} href={item.href}>
              <motion.div
                onHoverStart={() => setHoveredItem(item.name)}
                onHoverEnd={() => setHoveredItem(null)}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all duration-300",
                  isActive
                    ? "bg-[#8B7355]/10"
                    : "hover:bg-white/5"
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-[#8B7355]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}

                {/* Icon with gradient background */}
                <div className={cn(
                  "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all duration-300",
                  isActive 
                    ? "bg-[#8B7355]" 
                    : "bg-white/5 group-hover:bg-white/10"
                )}>
                  {/* Sem brilho */}
                  <Icon 
                    className={cn(
                      "relative h-5 w-5 transition-all duration-300",
                      isActive ? "text-white" : "text-white/60 group-hover:text-white/90"
                    )} 
                    strokeWidth={1}
                  />
                </div>

                {/* Label */}
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col"
                    >
                      <span className={cn(
                        "text-[15px] font-medium transition-colors duration-300",
                        isActive ? "text-white" : "text-white/70 group-hover:text-white"
                      )}>
                        {item.name}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Hover effect */}
                {hoveredItem === item.name && !isActive && (
                  <motion.div
                    layoutId="hoverBackground"
                    className="absolute inset-0 rounded-xl bg-[#8B7355]/5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Exit Navigation */}
      <div className="relative border-t border-white/5 px-3 py-4">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-3 px-4"
            >
              <span className="text-xs font-medium tracking-wider text-white/30">SAIR</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-1">
          {exitNav.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link key={item.name} href={item.href}>
                <motion.div
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-4 py-3 transition-all",
                    isActive ? "bg-white/10" : "hover:bg-white/5"
                  )}
                >
                  <Icon className="h-5 w-5 text-white/40 group-hover:text-[#8B7355] transition-colors" strokeWidth={0.75} />
                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="text-sm text-white/50 group-hover:text-white/70 transition-colors"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

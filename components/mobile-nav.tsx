"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Plus, Music, Library, MessageSquare, Sparkles, Mic } from "lucide-react"

export function MobileNav() {
  const pathname = usePathname()

  if (pathname === "/melody") {
    return null
  }

  const navItems = [
    {
      href: "/musicstudio",
      label: "Início",
      icon: Home,
    },
    {
      href: "/create",
      label: "Criar",
      icon: Plus,
      isHighlight: true,
    },
    {
      href: "/melody",
      label: "Melodia",
      icon: Mic,
    },
    {
      href: "/library",
      label: "Biblioteca",
      icon: Library,
    },
    {
      href: "/chat",
      label: "Chat",
      icon: Sparkles,
    },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 pointer-events-none pb-safe-mobile md:pb-0">
      <div className="relative mx-4 mb-4 pointer-events-auto">
        {/* Ultra Premium Navbar */}
        <div className="relative rounded-[20px] overflow-hidden backdrop-blur-3xl bg-black/60 border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          {/* Content */}
          <div className="relative grid grid-cols-5 h-[68px] items-center px-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1.5 rounded-2xl py-2 transition-all duration-300 active:scale-95 touch-manipulation relative",
                    isActive ? "text-white" : "text-white/50"
                  )}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute inset-0 bg-white/[0.08] rounded-2xl" />
                  )}
                  
                  {/* Icon container */}
                  <div className={cn(
                    "relative transition-all duration-300",
                    isActive && "scale-110"
                  )}>
                    {/* Glow effect for active */}
                    {isActive && (
                      <div className="absolute inset-0 bg-white/20 blur-xl rounded-full" />
                    )}
                    
                    {/* Icon */}
                    <div className={cn(
                      "relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                      item.isHighlight && !isActive && "bg-white/[0.08]",
                      item.isHighlight && isActive && "bg-white/[0.12]"
                    )}>
                      <Icon 
                        className={cn(
                          "transition-all duration-300",
                          isActive ? "w-5 h-5" : "w-[18px] h-[18px]"
                        )}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                    </div>
                  </div>
                  
                  {/* Label */}
                  <span className={cn(
                    "text-[10px] tracking-tight transition-all duration-300 relative",
                    isActive ? "font-medium" : "font-light"
                  )}>
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}

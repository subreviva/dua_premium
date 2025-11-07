"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function MobileNav() {
  const pathname = usePathname()

  if (pathname === "/melody") {
    return null
  }

  const navItems = [
    {
      href: "/",
      label: "Início",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      href: "/create",
      label: "Criar",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      href: "/melody",
      label: "Melodia",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
          />
        </svg>
      ),
    },
    {
      href: "/library",
      label: "Biblioteca",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
    },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 pb-safe pointer-events-none">
      <div className="relative mx-3 mb-3 rounded-[1.5rem] overflow-hidden h-[60px] pointer-events-auto">
        {/* Subtle gradient border */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-[1.5rem] p-[0.5px]">
          <div className="h-full w-full bg-slate-900/98 backdrop-blur-2xl rounded-[1.5rem]" />
        </div>

        {/* Content */}
        <div className="relative grid grid-cols-4 gap-0 h-full items-center px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-xl py-2 transition-all duration-200 active:scale-95 touch-manipulation",
                  isActive ? "text-primary" : "text-slate-400 active:text-slate-100",
                )}
              >
                <div className={cn("transition-all duration-200 relative", isActive && "scale-105")}>
                  {isActive && (
                    <div
                      className="absolute inset-0 bg-primary/20 blur-lg rounded-full animate-pulse"
                      style={{ animationDuration: "2s" }}
                    />
                  )}
                  <div className="relative">{item.icon}</div>
                </div>
                <span
                  className={cn(
                    "text-[9px] tracking-wide transition-all duration-200",
                    isActive ? "font-medium" : "font-light",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

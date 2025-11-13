"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { GenerationProvider } from "@/contexts/generation-context"
import { StemsProvider } from "@/contexts/stems-context"
import { GenerationSidebarWrapper } from "@/components/generation-sidebar-wrapper"
import { StemsIndicator } from "@/components/stems-indicator"
import { PersistentPlayer } from "@/components/persistent-player"
import { MobileNav } from "@/components/mobile-nav"
import { MusicLibrarySidebar } from "@/components/music-library-sidebar"

export default function MusicStudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isWelcomePage = pathname === "/musicstudio"

  // Na welcome page, apenas renderiza o children sem componentes extras
  if (isWelcomePage) {
    return <>{children}</>
  }

  return (
    <GenerationProvider>
      <StemsProvider>
        {children}
        <GenerationSidebarWrapper />
        <MusicLibrarySidebar />
        <PersistentPlayer />
        <MobileNav />
        <StemsIndicator />
      </StemsProvider>
    </GenerationProvider>
  )
}

"use client"

import type React from "react"
import { useEffect } from "react"
import { GenerationProvider } from "@/contexts/generation-context"
import { StemsProvider } from "@/contexts/stems-context"
import { GenerationSidebarWrapper } from "@/components/generation-sidebar-wrapper"
import { PersistentPlayer } from "@/components/persistent-player"
import { MobileNav } from "@/components/mobile-nav"
import { StemsIndicator } from "@/components/stems-indicator"
import { useMusicStudioKeyboardShortcuts } from "@/hooks/use-music-studio-shortcuts"

export default function MusicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Ativar atalhos de teclado globais
  useMusicStudioKeyboardShortcuts()

  return (
    <GenerationProvider>
      <StemsProvider>
        {children}
        <GenerationSidebarWrapper />
        <PersistentPlayer />
        <MobileNav />
        <StemsIndicator />
      </StemsProvider>
    </GenerationProvider>
  )
}

import type React from "react"
import { GenerationProvider } from "@/contexts/generation-context"
import { StemsProvider } from "@/contexts/stems-context"
import { GenerationSidebarWrapper } from "@/components/generation-sidebar-wrapper"
import { StemsIndicator } from "@/components/stems-indicator"
import { PersistentPlayer } from "@/components/persistent-player"
import { MobileNav } from "@/components/mobile-nav"

export default function MusicStudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
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

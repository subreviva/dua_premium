"use client"

import type React from "react"
import { GenerationProvider } from "@/contexts/generation-context"
import { StemsProvider } from "@/contexts/stems-context"
import { StemsIndicator } from "@/components/stems-indicator"
import { PersistentPlayer } from "@/components/persistent-player"
import { MobileNav } from "@/components/mobile-nav"

export default function StemsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <GenerationProvider>
      <StemsProvider>
        {children}
        <StemsIndicator />
        <PersistentPlayer />
        <MobileNav />
      </StemsProvider>
    </GenerationProvider>
  )
}

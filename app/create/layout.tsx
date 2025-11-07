"use client"

import type React from "react"
import { GenerationProvider } from "@/contexts/generation-context"
import { StemsProvider } from "@/contexts/stems-context"
import { GenerationSidebarWrapper } from "@/components/generation-sidebar-wrapper"
import { PersistentPlayer } from "@/components/persistent-player"
import { MobileNav } from "@/components/mobile-nav"

export default function CreateLayout({
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
      </StemsProvider>
    </GenerationProvider>
  )
}

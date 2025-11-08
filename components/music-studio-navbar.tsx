"use client"

import { ArrowLeft, Sparkles } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

interface MusicStudioNavbarProps {
  title?: string
  showBack?: boolean
  transparent?: boolean
}

export function MusicStudioNavbar({ 
  title, 
  showBack = false,
  transparent = false 
}: MusicStudioNavbarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const getTitle = () => {
    if (title) return title
    
    // Auto-detect title based on path
    if (pathname.includes('/create')) return 'Criar Música'
    if (pathname.includes('/library')) return 'Biblioteca'
    if (pathname.includes('/melody')) return 'Melodia'
    return 'Music Studio'
  }

  const shouldShowBack = showBack || pathname !== '/musicstudio'

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 ${
      transparent 
        ? 'backdrop-blur-md bg-black/40' 
        : 'backdrop-blur-xl bg-background/80'
    } border-b border-white/[0.08]`}>
      <div className="px-4 py-3.5 safe-area-inset-top">
        <div className="flex items-center justify-between max-w-screen-xl mx-auto">
          {/* Left side - Back button or Logo */}
          <div className="flex items-center gap-3">
            {shouldShowBack ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="w-9 h-9 rounded-full hover:bg-white/10 active:scale-95 transition-all"
              >
                <ArrowLeft className="w-5 h-5 text-white/90" strokeWidth={2} />
              </Button>
            ) : null}
            <h1 className="text-base font-medium text-white/95 tracking-tight">
              {getTitle()}
            </h1>
          </div>

          {/* Right side - Icon */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500/90 to-pink-500/90 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Sparkles className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </header>
  )
}

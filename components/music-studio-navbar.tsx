"use client"

import { ArrowLeft, Music2 } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

export function MusicStudioNavbar() {
  const router = useRouter()
  const pathname = usePathname()

  const getTitle = () => {
    if (pathname === "/musicstudio") return null
    if (pathname.includes("/create")) return "Criar Música"
    if (pathname.includes("/library")) return "Biblioteca"
    if (pathname.includes("/melody")) return "Melodia"
    return "Music Studio"
  }

  const title = getTitle()
  const showBackButton = pathname !== "/musicstudio"

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 pt-safe">
      <div className="backdrop-blur-2xl bg-black/60 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between">
          {/* Left Side */}
          <div className="flex items-center gap-3">
            {showBackButton ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="h-8 w-8 p-0 hover:bg-white/[0.08] text-white -ml-2 active:scale-95 transition-all rounded-lg"
              >
                <ArrowLeft className="w-4 h-4" strokeWidth={2} />
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-medium tracking-tight text-white/95">
                  DUA Music
                </span>
              </div>
            )}
            {title && (
              <span className="text-[15px] font-medium text-white/90">
                {title}
              </span>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Espaço para botões de ação futuros */}
          </div>
        </div>
      </div>
    </nav>
  )
}

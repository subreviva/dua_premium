"use client"

import { ArrowLeft, Music2 } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

export function MusicStudioNavbar() {
  const router = useRouter()
  const pathname = usePathname()

  // Determinar o título baseado na rota
  const getTitle = () => {
    if (pathname === "/musicstudio") return null // Homepage não mostra título
    if (pathname.includes("/create")) return "Criar Música"
    if (pathname.includes("/library")) return "Biblioteca"
    if (pathname.includes("/melody")) return "Melodia"
    return "Music Studio"
  }

  const title = getTitle()
  const showBackButton = pathname !== "/musicstudio"

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 pt-safe">
      <div className="backdrop-blur-2xl bg-black/40 border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between">
          {/* Left Side */}
          <div className="flex items-center gap-3">
            {showBackButton ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="h-8 px-2 hover:bg-white/10 text-white -ml-2 active:scale-95 transition-transform"
              >
                <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <Music2 className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-[15px] font-semibold tracking-tight text-white">
                  DUA
                </span>
              </div>
            )}
            {title && (
              <span className="text-[15px] font-semibold text-white">
                {title}
              </span>
            )}
          </div>

          {/* Right Side - pode adicionar ações aqui */}
          <div className="flex items-center gap-2">
            {/* Espaço para botões de ação futuros */}
          </div>
        </div>
      </div>
    </nav>
  )
}

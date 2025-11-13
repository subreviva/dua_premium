"use client"

import { Button } from "@/components/ui/button"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { MessageSquare, Music, Image as ImageIcon, Video, Palette, Plus, ShoppingCart } from "lucide-react"
import { supabaseClient } from "@/lib/supabase"
import { CreditsDisplay } from "@/components/ui/credits-display"
import { UserAvatar } from "@/components/user-avatar"

interface ContextualNavbarProps {
  title?: string
  subtitle?: string
  actions?: React.ReactNode
}

export function ContextualNavbar({ title, subtitle, actions }: ContextualNavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user: authUser },
      } = await supabaseClient.auth.getUser()
      setUser(authUser)
    }
    checkAuth()
  }, [])

  // Auto-detect context based on pathname
  const getContextInfo = () => {
    // Don't show contextual navbar on welcome pages
    if (pathname === "/musicstudio" || pathname === "/videostudio" || pathname === "/imagestudio" || pathname === "/designstudio") {
      return null
    }

    if (pathname?.startsWith("/chat")) {
      return {
        icon: <MessageSquare className="w-5 h-5" />,
        title: title || "Nova Conversa",
        subtitle: subtitle || "Chat com IA",
        logo: "DUA",
        showNewButton: true,
        newButtonLabel: "Nova Conversa",
        newButtonAction: () => router.push("/chat"),
      }
    }

    if (pathname?.startsWith("/musicstudio")) {
      return {
        icon: <Music className="w-5 h-5" />,
        title: title || "Music Studio",
        subtitle: subtitle || "Criação de música com IA",
        logo: "DUA",
        showNewButton: true,
        newButtonLabel: "Nova Música",
        newButtonAction: () => router.push("/musicstudio/create"),
      }
    }

    if (pathname?.startsWith("/imagestudio")) {
      return {
        icon: <ImageIcon className="w-5 h-5" />,
        title: title || "Image Studio",
        subtitle: subtitle || "Geração de imagens com IA",
        logo: "DUA",
        showNewButton: true,
        newButtonLabel: "Nova Imagem",
        newButtonAction: () => router.push("/imagestudio"),
      }
    }

    if (pathname?.startsWith("/videostudio")) {
      return {
        icon: <Video className="w-5 h-5" />,
        title: title || "Video Studio",
        subtitle: subtitle || "Criação de vídeos com IA",
        logo: "DUA",
        showNewButton: true,
        newButtonLabel: "Novo Vídeo",
        newButtonAction: () => router.push("/videostudio/criar"),
      }
    }

    if (pathname?.startsWith("/designstudio")) {
      return {
        icon: <Palette className="w-5 h-5" />,
        title: title || "Design Studio",
        subtitle: subtitle || "Design gráfico com IA",
        logo: "DUA",
        showNewButton: true,
        newButtonLabel: "Novo Design",
        newButtonAction: () => router.push("/designstudio"),
      }
    }

    return null
  }

  const context = getContextInfo()

  if (!context || !user) return null

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Left Side - Context Info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-white/60">
              {context.icon}
              <span className="hidden sm:inline text-sm font-medium">{context.logo}</span>
            </div>
            <div className="h-6 w-px bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4 text-white/40" />
              <div>
                <h2 className="text-sm font-medium text-white">{context.title}</h2>
                {context.subtitle && (
                  <p className="text-xs text-white/40 hidden lg:block">{context.subtitle}</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center gap-3">
            {actions || (
              <>
                <CreditsDisplay variant="compact" />
                <Button
                  onClick={() => router.push("/loja")}
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex items-center gap-2 bg-white/5 border-white/20 hover:bg-white/10 text-white"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Comprar
                </Button>
                {context.showNewButton && (
                  <Button
                    onClick={context.newButtonAction}
                    size="sm"
                    className="hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white border-0"
                  >
                    <Plus className="w-4 h-4" />
                    {context.newButtonLabel}
                  </Button>
                )}
                <UserAvatar />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

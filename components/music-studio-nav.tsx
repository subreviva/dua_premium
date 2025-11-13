"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Home, MessageSquare, Keyboard } from "lucide-react"
import { useEffect, useState } from "react"

export function MusicStudioNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [showShortcuts, setShowShortcuts] = useState(false)

  const handleBack = () => {
    router.back()
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Esc = Close shortcuts modal
      if (e.key === "Escape" && showShortcuts) {
        setShowShortcuts(false)
        return
      }

      // Alt + Arrow Left = Back
      if (e.altKey && e.key === "ArrowLeft") {
        e.preventDefault()
        router.back()
      }
      // Alt + H = Home
      if (e.altKey && e.key === "h") {
        e.preventDefault()
        router.push("/home")
      }
      // Alt + C = Chat
      if (e.altKey && e.key === "c") {
        e.preventDefault()
        router.push("/chat")
      }
      // Alt + 1-4 = Navigation items
      if (e.altKey && ["1", "2", "3", "4"].includes(e.key)) {
        e.preventDefault()
        const index = parseInt(e.key) - 1
        const routes = ["/musicstudio", "/create", "/melody", "/musicstudio/library"]
        router.push(routes[index])
      }
      // Alt + K = Show shortcuts
      if (e.altKey && e.key === "k") {
        e.preventDefault()
        setShowShortcuts(!showShortcuts)
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [router, showShortcuts])

  const navItems = [
    {
      href: "/musicstudio",
      label: "Início",
      description: "Página principal do Music Studio",
      shortcut: "Alt+1",
    },
    {
      href: "/create",
      label: "Criar",
      description: "Criar música a partir de texto",
      shortcut: "Alt+2",
    },
    {
      href: "/melody",
      label: "Melodia",
      description: "Transformar melodia em música",
      shortcut: "Alt+3",
    },
    {
      href: "/musicstudio/library",
      label: "Biblioteca",
      description: "Suas músicas salvas",
      shortcut: "Alt+4",
    },
  ]

  const exitButtons = [
    {
      href: "/home",
      label: "Home",
      icon: Home,
      description: "Voltar à página inicial do site",
      shortcut: "Alt+H",
    },
    {
      href: "/chat",
      label: "Chat",
      icon: MessageSquare,
      description: "Ir para o chat DUA",
      shortcut: "Alt+C",
    },
  ]

  return (
    <>
      <div className="hidden md:flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900/50 to-slate-800/50 backdrop-blur-xl border-b border-white/5">
        {/* Left: Back button + Navigation */}
        <div className="flex items-center gap-4">
          {/* Back Button */}
          <Button
            onClick={handleBack}
            variant="ghost"
            size="sm"
            className="gap-2 text-slate-400 hover:text-white hover:bg-white/5"
            aria-label="Voltar à página anterior (Alt+←)"
            title="Voltar (Alt+←)"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden lg:inline">Voltar</span>
          </Button>

          {/* Divider */}
          <div className="h-8 w-px bg-white/10" />

          {/* Main Navigation */}
          <nav className="flex items-center gap-2" role="navigation" aria-label="Navegação do Music Studio">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    "hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary/50",
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-slate-400 hover:text-white"
                  )}
                  title={`${item.description} (${item.shortcut})`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg blur-sm" />
                  )}
                  <span className="relative">{item.label}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-primary to-accent rounded-full" />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Right: Shortcuts toggle + Exit buttons */}
        <div className="flex items-center gap-2">
          {/* Shortcuts indicator */}
          <Button
            onClick={() => setShowShortcuts(!showShortcuts)}
            variant="ghost"
            size="sm"
            className="gap-2 text-slate-500 hover:text-slate-300 hover:bg-white/5"
            title="Mostrar atalhos de teclado (Alt+K)"
            aria-label="Mostrar atalhos de teclado"
          >
            <Keyboard className="h-4 w-4" />
          </Button>

          <div className="h-8 w-px bg-white/10" />

          {exitButtons.map((button) => {
            const Icon = button.icon
            return (
              <Link
                key={button.href}
                href={button.href}
                className="group"
                title={`${button.description} (${button.shortcut})`}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-orange-500/30 bg-orange-500/5 text-orange-400 hover:bg-orange-500/20 hover:text-orange-300 hover:border-orange-500/50 transition-all duration-200 focus:ring-2 focus:ring-orange-500/50"
                >
                  <Icon className="h-4 w-4" />
                  <span>{button.label}</span>
                </Button>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setShowShortcuts(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="shortcuts-title"
        >
          <div 
            className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 id="shortcuts-title" className="text-xl font-bold text-white flex items-center gap-2">
                <Keyboard className="h-5 w-5 text-primary" />
                Atalhos de Teclado
              </h2>
              <button
                onClick={() => setShowShortcuts(false)}
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-400 mb-2">Navegação</h3>
                <div className="space-y-2">
                  <ShortcutItem shortcut="Alt + ←" description="Voltar à página anterior" />
                  <ShortcutItem shortcut="Alt + 1" description="Ir para Início" />
                  <ShortcutItem shortcut="Alt + 2" description="Ir para Criar" />
                  <ShortcutItem shortcut="Alt + 3" description="Ir para Melodia" />
                  <ShortcutItem shortcut="Alt + 4" description="Ir para Biblioteca" />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-400 mb-2">Sair do Studio</h3>
                <div className="space-y-2">
                  <ShortcutItem shortcut="Alt + H" description="Ir para Home" />
                  <ShortcutItem shortcut="Alt + C" description="Ir para Chat" />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-400 mb-2">Outros</h3>
                <div className="space-y-2">
                  <ShortcutItem shortcut="Alt + K" description="Mostrar/Ocultar atalhos" />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
              <p className="text-xs text-slate-500 text-center">
                Pressione <kbd className="px-2 py-1 bg-white/5 rounded text-slate-300">Esc</kbd> para fechar
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function ShortcutItem({ shortcut, description }: { shortcut: string; description: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-300">{description}</span>
      <kbd className="px-3 py-1 bg-white/5 border border-white/10 rounded text-slate-400 font-mono text-xs">
        {shortcut}
      </kbd>
    </div>
  )
}

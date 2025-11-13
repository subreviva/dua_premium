"use client"

import { Button } from "@/components/ui/button"
import { motion, useScroll, useTransform } from "framer-motion"
import { Menu, X, Plus, ShoppingCart, MessageSquare, Music, Video, Image as ImageIcon, Palette } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { UserAvatar } from "@/components/user-avatar"
import { supabaseClient } from "@/lib/supabase"
import { CreditsDisplay } from "@/components/ui/credits-display"

export function SmartNavbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const { scrollY } = useScroll()

  const navBackground = useTransform(
    scrollY,
    [0, 50],
    ["rgba(0, 0, 0, 0.8)", "rgba(0, 0, 0, 0.95)"]
  )

  const navBorder = useTransform(
    scrollY,
    [0, 50],
    ["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0.2)"]
  )

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user: authUser },
      } = await supabaseClient.auth.getUser()
      setIsAuthenticated(!!authUser)
      setUser(authUser)
    }
    checkAuth()

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session)
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabaseClient.auth.signOut()
    router.push("/")
    router.refresh()
  }

  // 🧠 ULTRA INTELIGENTE - Detecta contexto automaticamente
  const getContext = () => {
    // Welcome pages - Navbar minimalista
    if (pathname === "/musicstudio" || pathname === "/videostudio" || pathname === "/imagestudio" || pathname === "/designstudio") {
      return { mode: "minimal" }
    }

    // Chat - Contexto de conversa
    if (pathname?.startsWith("/chat")) {
      return {
        mode: "contextual",
        icon: <MessageSquare className="w-5 h-5" />,
        title: "Nova Conversa",
        subtitle: "Chat com IA",
        newAction: () => router.push("/chat"),
        newLabel: "Nova Conversa"
      }
    }

    // Music Studio
    if (pathname?.startsWith("/musicstudio")) {
      return {
        mode: "contextual",
        icon: <Music className="w-5 h-5" />,
        title: "Music Studio",
        subtitle: "Criação de música",
        newAction: () => router.push("/musicstudio/create"),
        newLabel: "Nova Música"
      }
    }

    // Video Studio
    if (pathname?.startsWith("/videostudio")) {
      return {
        mode: "contextual",
        icon: <Video className="w-5 h-5" />,
        title: "Video Studio",
        subtitle: "Criação de vídeos",
        newAction: () => router.push("/videostudio/criar"),
        newLabel: "Novo Vídeo"
      }
    }

    // Image Studio
    if (pathname?.startsWith("/imagestudio")) {
      return {
        mode: "contextual",
        icon: <ImageIcon className="w-5 h-5" />,
        title: "Image Studio",
        subtitle: "Geração de imagens",
        newAction: () => router.push("/imagestudio"),
        newLabel: "Nova Imagem"
      }
    }

    // Design Studio
    if (pathname?.startsWith("/designstudio")) {
      return {
        mode: "contextual",
        icon: <Palette className="w-5 h-5" />,
        title: "Design Studio",
        subtitle: "Design gráfico",
        newAction: () => router.push("/designstudio"),
        newLabel: "Novo Design"
      }
    }

    // Páginas públicas - Navbar completa
    return { mode: "full" }
  }

  const context = getContext()

  const navItems = [
    // Só mostra Chat se estiver autenticado
    ...(isAuthenticated ? [{ label: "Chat", href: "/chat" }] : []),
    { label: "Cinema", href: "/videostudio" },
    { label: "Design", href: "/designstudio" },
    { label: "Music", href: "/musicstudio" },
    { label: "Imagem", href: "/imagestudio" },
    { label: "Comunidade", href: "/comunidade" },
  ]

  return (
    <motion.nav
      style={{
        backgroundColor: context.mode === "minimal" ? "rgba(0, 0, 0, 0.3)" : navBackground,
        borderColor: context.mode === "minimal" ? "rgba(255, 255, 255, 0.05)" : navBorder,
      }}
      className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* LEFT SIDE */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <motion.button
              onClick={() => router.push("/")}
              className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent hover:from-gray-200 hover:to-white transition-all duration-300"
            >
              DUA
            </motion.button>

            {/* Contexto Dinâmico */}
            {context.mode === "contextual" && isAuthenticated && (
              <>
                <div className="h-6 w-px bg-white/10 hidden md:block" />
                <div className="hidden md:flex items-center gap-3">
                  <div className="text-white/60">{context.icon}</div>
                  <div>
                    <h2 className="text-sm font-medium text-white">{context.title}</h2>
                    <p className="text-xs text-white/40">{context.subtitle}</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* CENTER - Desktop Navigation (apenas em modo full) */}
          {context.mode === "full" && (
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <button
                    onClick={() => router.push(item.href)}
                    className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                      pathname === item.href
                        ? "text-white"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {/* RIGHT SIDE - Sempre visível */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Créditos - SEMPRE visível quando autenticado */}
                <CreditsDisplay variant="compact" />

                {/* Botão Comprar */}
                <Button
                  onClick={() => router.push("/loja")}
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex items-center gap-2 bg-white/5 border-white/20 hover:bg-white/10 text-white"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Comprar
                </Button>

                {/* Botão de Ação Contextual */}
                {context.mode === "contextual" && context.newAction && (
                  <Button
                    onClick={context.newAction}
                    size="sm"
                    className="hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white border-0"
                  >
                    <Plus className="w-4 h-4" />
                    {context.newLabel}
                  </Button>
                )}

                {/* Avatar - SEMPRE visível */}
                <UserAvatar />
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => router.push("/waitlist")}
                  className="hidden md:inline-flex text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10"
                >
                  Obter Acesso
                </Button>
                <Button
                  onClick={() => router.push("/login")}
                  className="bg-white text-black hover:bg-gray-200 font-medium px-6"
                >
                  Entrar
                </Button>
              </>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-300 hover:text-white p-2"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-black/95 border-t border-white/10 backdrop-blur-xl"
        >
          <div className="px-4 pt-2 pb-3 space-y-1">
            {context.mode === "full" && navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  router.push(item.href)
                  setIsOpen(false)
                }}
                className={`block w-full text-left px-3 py-2 text-sm font-medium rounded-md ${
                  pathname === item.href
                    ? "text-white bg-white/10"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                {item.label}
              </button>
            ))}

            {/* Mobile Actions */}
            <div className="pt-4 pb-2 space-y-2">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-md"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      router.push("/waitlist")
                      setIsOpen(false)
                    }}
                    className="block w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-md"
                  >
                    Obter Acesso
                  </button>
                  <button
                    onClick={() => {
                      router.push("/login")
                      setIsOpen(false)
                    }}
                    className="block w-full text-center px-3 py-2 text-sm font-medium bg-white text-black hover:bg-gray-200 rounded-md"
                  >
                    Entrar
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  )
}

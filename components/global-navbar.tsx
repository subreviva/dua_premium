"use client"

import { Button } from "@/components/ui/button"
import { motion, useScroll, useTransform } from "framer-motion"
import { Menu, X } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { UserAvatar } from "@/components/user-avatar"
import { supabaseClient } from "@/lib/supabase"
import { CreditsDisplay } from "@/components/ui/credits-display"

export function GlobalNavbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [credits, setCredits] = useState<number>(0)
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
    // Verificar autenticação
    const checkAuth = async () => {
      const {
        data: { user: authUser },
      } = await supabaseClient.auth.getUser()
      setIsAuthenticated(!!authUser)
      setUser(authUser)

      if (authUser) {
        // Carregar créditos
        const { data: balanceData } = await supabaseClient
          .from("duaia_user_balances")
          .select("servicos_creditos")
          .eq("user_id", authUser.id)
          .single()

        if (balanceData && balanceData.servicos_creditos !== undefined) {
          setCredits(balanceData.servicos_creditos ?? 0)
        } else {
          const { data: userData } = await supabaseClient
            .from("users")
            .select("creditos_servicos")
            .eq("id", authUser.id)
            .single()

          if (userData?.creditos_servicos !== undefined) {
            setCredits(userData.creditos_servicos)
          }
        }
      }
    }
    checkAuth()

    // Realtime channel para updates de credits
    let channel: any = null

    const setupRealtime = async () => {
      const {
        data: { user: authUser },
      } = await supabaseClient.auth.getUser()
      if (!authUser) return

      channel = supabaseClient
        .channel(`credits-user-${authUser.id}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "duaia_user_balances",
            filter: `user_id=eq.${authUser.id}`,
          },
          (payload: any) => {
            const newVal =
              payload.new?.servicos_creditos ?? payload.record?.servicos_creditos
            if (newVal !== undefined && newVal !== null) {
              setCredits(newVal)
            }
          }
        )
        .subscribe()
    }

    setupRealtime()

    return () => {
      if (channel) {
        supabaseClient.removeChannel(channel)
      }
    }
  }, [])

  const handleLogout = async () => {
    await supabaseClient.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const navItems = [
    { label: "Chat", href: "/chat" },
    { label: "Cinema", href: "/videostudio" },
    { label: "Design", href: "/designstudio" },
    { label: "Music", href: "/musicstudio" },
    { label: "Imagem", href: "/imagestudio" },
    { label: "Comunidade", href: "/comunidade" },
    { label: "Código", href: "/acesso" },
  ]

  return (
    <motion.nav
      style={{
        backgroundColor: navBackground,
        borderColor: navBorder,
      }}
      className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-shrink-0"
          >
            <button
              onClick={() => router.push("/")}
              className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent hover:from-gray-200 hover:to-white transition-all duration-300"
            >
              DUA
            </button>
          </motion.div>

          {/* Desktop Navigation */}
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

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <CreditsDisplay variant="compact" />
                <UserAvatar />
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => router.push("/registro")}
                  className="text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10"
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
          </div>

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

      {/* Mobile menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-black/95 border-t border-white/10 backdrop-blur-xl"
        >
          <div className="px-4 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
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
                  <div className="px-3 py-2">
                    <CreditsDisplay variant="compact" />
                  </div>
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
                      router.push("/registro")
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

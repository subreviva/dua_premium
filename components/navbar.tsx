"use client"

import { Button } from "@/components/ui/button"
import { motion, useScroll, useTransform } from "framer-motion"
import { Menu, X, ShoppingCart } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { UserAvatar } from "@/components/user-avatar"
import { supabaseClient } from "@/lib/supabase"
import { getLoginRedirect } from "@/lib/route-protection"
import { CreditsDisplay } from "@/components/ui/credits-display"

export default function Navbar() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { scrollY } = useScroll()

  const navBackground = useTransform(scrollY, [0, 100], ["rgba(26, 26, 26, 0)", "rgba(26, 26, 26, 0.7)"])

  const navBorder = useTransform(scrollY, [0, 100], ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.1)"])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    // Verificar autenticação
    const checkAuth = async () => {
      const { data: { user } } = await supabaseClient.auth.getUser()
      setIsAuthenticated(!!user)
    }
    checkAuth()

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleProtectedNavigation = (href: string, label: string) => {
    if (!isAuthenticated && href !== '/community') {
      // Redirecionar para página de acesso com código
      router.push(getLoginRedirect(href))
    } else {
      router.push(href)
    }
    setIsOpen(false)
  }

  const navLinks = [
    { label: "Chat", href: "/chat", protected: true },
    { label: "Cinema", href: "/videostudio", protected: true },
    { label: "Design", href: "/designstudio", protected: true },
    { label: "Music", href: "/musicstudio", protected: true },
    { label: "Imagem", href: "/imagestudio", protected: true },
    { label: "Comunidade", href: "/community", protected: false },
  ]

  return (
    <>
      <motion.nav
        style={{
          backgroundColor: navBackground,
          borderColor: navBorder,
        }}
        className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-2xl transition-all duration-300"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              onClick={() => router.push("/")}
              className="text-3xl font-extralight text-white tracking-tight hover:text-white/80 transition-colors duration-300"
            >
              DUA
            </motion.button>

            {/* Desktop Navigation */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="hidden lg:flex items-center gap-8"
            >
              {navLinks.map((link, index) => (
                <button
                  key={link.href}
                  onClick={() => handleProtectedNavigation(link.href, link.label)}
                  className="text-white/70 hover:text-white font-light transition-colors duration-300 text-sm"
                >
                  {link.label}
                </button>
              ))}
            </motion.div>

            {/* Desktop Auth Buttons / User Avatar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="hidden lg:flex items-center gap-3"
            >
              {isAuthenticated && (
                <>
                  <CreditsDisplay variant="compact" />
                  <Button
                    onClick={() => router.push('/comprar')}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0 transition-all duration-300 rounded-full px-4 h-9 text-sm font-semibold"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Comprar
                  </Button>
                </>
              )}
              <UserAvatar />
            </motion.div>

            {/* Mobile Menu Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden text-[#f5d4c8] hover:text-[#f5f0eb] transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={{
          opacity: isOpen ? 1 : 0,
          y: isOpen ? 0 : -20,
          pointerEvents: isOpen ? "auto" : "none",
        }}
        transition={{ duration: 0.3 }}
        className="fixed top-20 left-0 right-0 z-40 lg:hidden bg-[#0a1628]/95 backdrop-blur-xl border-b border-[#f5d4c8]/10"
      >
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
          {navLinks.map((link, index) => (
            <motion.button
              key={link.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: isOpen ? 1 : 0, x: isOpen ? 0 : -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => handleProtectedNavigation(link.href, link.label)}
              className="block w-full text-left text-[#f5d4c8] hover:text-[#f5f0eb] font-medium text-lg py-2 transition-colors"
            >
              {link.label}
            </motion.button>
          ))}

          <div className="pt-6 border-t border-[#f5d4c8]/10">
            {isAuthenticated && (
              <div className="space-y-4 mb-6">
                <CreditsDisplay variant="default" className="w-full justify-center" />
                <Button
                  onClick={() => {
                    router.push('/comprar')
                    setIsOpen(false)
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0 transition-all duration-300 rounded-full h-10 text-sm font-semibold"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Comprar Créditos
                </Button>
              </div>
            )}
            <UserAvatar />
          </div>
        </div>
      </motion.div>
    </>
  )
}

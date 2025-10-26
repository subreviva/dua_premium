"use client"

import { Button } from "@/components/ui/button"
import { motion, useScroll, useTransform } from "framer-motion"
import { Menu, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function Navbar() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { scrollY } = useScroll()

  const navBackground = useTransform(scrollY, [0, 100], ["rgba(10, 22, 40, 0)", "rgba(10, 22, 40, 0.8)"])

  const navBorder = useTransform(scrollY, [0, 100], ["rgba(245, 212, 200, 0)", "rgba(245, 212, 200, 0.1)"])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { label: "Chat", href: "/chat" },
    { label: "Cinema", href: "/videostudio" },
    { label: "Design", href: "/designstudio" },
    { label: "Music", href: "/musicstudio" },
    { label: "Imagem", href: "/imagestudio" },
    { label: "Comunidade", href: "/community" },
  ]

  return (
    <>
      <motion.nav
        style={{
          backgroundColor: navBackground,
          borderColor: navBorder,
        }}
        className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-xl transition-all duration-300"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              onClick={() => router.push("/")}
              className="text-3xl font-bold text-[#f5f0eb] tracking-[-0.05em] hover:text-[#d4a574] transition-colors duration-300"
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
                  onClick={() => router.push(link.href)}
                  className="text-[#f5d4c8]/70 hover:text-[#f5d4c8] font-medium transition-colors duration-300 text-sm"
                >
                  {link.label}
                </button>
              ))}
            </motion.div>

            {/* Desktop Auth Buttons */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="hidden lg:flex items-center gap-4"
            >
              <Button
                variant="ghost"
                className="text-[#f5d4c8] hover:text-[#f5f0eb] hover:bg-[#f5d4c8]/10"
                onClick={() => router.push("/login")}
              >
                Entrar
              </Button>
              <Button
                className="rounded-full bg-[#d4a574] hover:bg-[#c89b6f] text-[#0a1628] font-semibold px-6 transition-all duration-300 hover:scale-105"
                onClick={() => router.push("/registo")}
              >
                Começar
              </Button>
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
              onClick={() => {
                router.push(link.href)
                setIsOpen(false)
              }}
              className="block w-full text-left text-[#f5d4c8] hover:text-[#f5f0eb] font-medium text-lg py-2 transition-colors"
            >
              {link.label}
            </motion.button>
          ))}

          <div className="pt-6 space-y-3 border-t border-[#f5d4c8]/10">
            <Button
              variant="outline"
              className="w-full rounded-full border-[#f5d4c8]/30 text-[#f5d4c8] hover:bg-[#f5d4c8]/10 bg-transparent"
              onClick={() => {
                router.push("/login")
                setIsOpen(false)
              }}
            >
              Entrar
            </Button>
            <Button
              className="w-full rounded-full bg-[#d4a574] hover:bg-[#c89b6f] text-[#0a1628] font-semibold"
              onClick={() => {
                router.push("/registo")
                setIsOpen(false)
              }}
            >
              Começar
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MessageSquare, Settings, User, Coins, ChevronLeft, Menu, PanelLeft, PanelLeftClose } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

interface PremiumNavbarProps {
  className?: string
  credits?: number
  title?: string
  showBackButton?: boolean
  backLink?: string
  variant?: "default" | "transparent" | "solid"
  showSidebarToggle?: boolean
  onSidebarToggle?: () => void
  isSidebarOpen?: boolean
  onNewChat?: () => void
}

export function PremiumNavbar({
  className,
  credits = 100,
  title = "DUA IA",
  showBackButton = false,
  backLink = "/",
  variant = "default",
  showSidebarToggle = false,
  onSidebarToggle,
  isSidebarOpen = false,
  onNewChat,
}: PremiumNavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const variantStyles = {
    default: "backdrop-blur-xl bg-black/60 border-b border-white/5",
    transparent: "backdrop-blur-sm bg-transparent border-b border-white/5",
    solid: "backdrop-blur-xl bg-black/80 border-b border-white/10",
  }

  return (
    <header>
      <nav className="fixed left-0 w-full z-50 px-2">
        <div
          className={cn(
            "mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12",
            isScrolled && "bg-black/50 max-w-4xl rounded-2xl border border-white/10 backdrop-blur-lg lg:px-5",
            className,
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 lg:gap-0 py-2">
            {/* Left Section - Sidebar Toggle + Logo */}
            <div className="flex items-center gap-4">
              {showSidebarToggle && onSidebarToggle && (
                <Button
                  onClick={onSidebarToggle}
                  variant="ghost"
                  size="icon"
                  className="text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-xl"
                >
                  {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
                </Button>
              )}

              {onNewChat && (
                <Button
                  onClick={onNewChat}
                  variant="ghost"
                  size="sm"
                  className="text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-xl px-3"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Nova Conversa</span>
                </Button>
              )}

              {showBackButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push(backLink)}
                  className="text-white/60 hover:text-white hover:bg-white/5 transition-all duration-300"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              )}

              <Link href="/" className="group relative">
                <Image
                  src="/dua-logo.png"
                  alt="DUA"
                  width={180}
                  height={60}
                  className="h-14 w-auto object-contain opacity-90 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105"
                  priority
                />
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-to-r from-primary via-accent to-primary group-hover:w-full transition-all duration-700" />
              </Link>
            </div>

            {/* Right Section - Credits & Actions */}
            <div className="flex items-center gap-3 sm:gap-4">
              {credits !== undefined && (
                <>
                  <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-white/20 hover:from-white/10 hover:to-white/5 transition-all duration-300 backdrop-blur-sm">
                    <Coins className="w-4 h-4 text-yellow-400/90" />
                    <span className="text-sm font-semibold text-white tracking-wide">{credits}</span>
                  </div>

                  <Button
                    onClick={() => console.log("[v0] Buy credits clicked")}
                    className={cn(
                      "hidden md:flex bg-gradient-to-br from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 text-white border border-white/20 hover:border-white/30 transition-all duration-300 rounded-xl px-5 py-2.5 text-sm font-semibold tracking-wide shadow-lg hover:shadow-white/10",
                      isScrolled && "lg:hidden",
                    )}
                  >
                    <Coins className="w-4 h-4 mr-2" />
                    COMPRAR
                  </Button>
                </>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-xl"
                  >
                    <Menu className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 bg-black/95 backdrop-blur-2xl border-white/10 rounded-xl p-2"
                >
                  <DropdownMenuItem
                    onClick={() => router.push("/profile")}
                    className="flex items-center gap-3 p-3 cursor-pointer rounded-lg focus:bg-white/5 text-white/90 hover:text-white transition-all duration-200"
                  >
                    <User className="w-4 h-4" />
                    <span className="font-medium">Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => console.log("[v0] Open settings")}
                    className="flex items-center gap-3 p-3 cursor-pointer rounded-lg focus:bg-white/5 text-white/90 hover:text-white transition-all duration-200"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="font-medium">Definições</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/5 my-2" />
                  <DropdownMenuItem
                    onClick={() => router.push("/chat")}
                    className="flex items-center gap-3 p-3 cursor-pointer rounded-lg focus:bg-white/5 text-white/90 hover:text-white transition-all duration-200"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="font-medium">Chat</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/")}
                    className="flex items-center gap-3 p-3 cursor-pointer rounded-lg focus:bg-white/5 text-white/90 hover:text-white transition-all duration-200"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="font-medium">Início</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}

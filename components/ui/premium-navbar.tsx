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
import { MessageSquare, Settings, User, Coins, ChevronLeft, Menu, PanelLeft, PanelLeftClose, LogOut, ShoppingCart } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { supabaseClient } from "@/lib/supabase"
import { UserAvatarGlobal } from "@/components/ui/user-avatar-global"
import { useCredits } from "@/hooks/use-credits"

const supabase = supabaseClient;

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
  credits: propCredits,
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
  const { credits: hookCredits, loading: creditsLoading } = useCredits()
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const displayCredits = propCredits !== undefined ? propCredits : hookCredits

  const handleBuyCredits = () => {
    router.push('/comprar')
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('[NAVBAR] Erro ao fazer logout:', error)
      router.push('/login')
    }
  }

  const variantStyles = {
    default: "backdrop-blur-xl bg-black/60 border-b border-white/5",
    transparent: "backdrop-blur-sm bg-transparent border-b border-white/5",
    solid: "backdrop-blur-xl bg-black/90 border-b border-white/10",
  }

  return (
    <nav className={cn(
      "w-full py-3 px-4 transition-all duration-300",
      variantStyles[variant],
      className
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left Section - Sidebar Toggle + Logo + New Chat */}
        <div className="flex items-center gap-2 sm:gap-4">
          {showSidebarToggle && onSidebarToggle && (
            <Button
              onClick={onSidebarToggle}
              variant="ghost"
              size="icon"
              className="text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-xl h-9 w-9"
            >
              {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
            </Button>
          )}

          <Link href="/" className="flex items-center">
            <Image
              src="/dua-logo.png"
              alt="DUA"
              width={80}
              height={30}
              className="h-8 w-auto object-contain opacity-90 hover:opacity-100 transition-all duration-300"
              priority
            />
          </Link>

          {onNewChat && (
            <Button
              onClick={onNewChat}
              variant="ghost"
              size="sm"
              className="hidden md:flex text-white/60 hover:text-white/90 hover:bg-transparent transition-all duration-300 rounded-xl px-3 h-9"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Nova Conversa
            </Button>
          )}
        </div>

        {/* Right Section - Credits + Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {displayCredits !== null && displayCredits !== undefined && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-white/20 transition-all duration-300">
              <Coins className="w-4 h-4 text-yellow-400/90" />
              <span className="text-sm font-semibold text-white">{displayCredits}</span>
            </div>
          )}

          <Button
            onClick={handleBuyCredits}
            className="hidden sm:flex bg-white/[0.08] hover:bg-white/[0.15] text-white/90 hover:text-white border border-white/15 hover:border-white/25 transition-all duration-300 rounded-full px-5 h-10 text-sm font-medium backdrop-blur-xl active:scale-95 shadow-sm hover:shadow-md"
          >
            <Coins className="w-4 h-4 mr-2" />
            Comprar
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="focus:outline-none focus:ring-2 focus:ring-purple-500/50 rounded-full transition-all">
                <UserAvatarGlobal size="md" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[calc(100vw-32px)] sm:w-80 bg-gradient-to-b from-white/[0.08] to-white/[0.03] backdrop-blur-2xl border border-white/15 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)] rounded-[28px] p-0 mt-3 max-h-[85vh] overflow-y-auto"
              sideOffset={14}
            >
              {/* Menu Items - Ultra Premium Minimal */}
              <div className="space-y-1 px-2 py-2">
                {/* Perfil */}
                <DropdownMenuItem
                  onClick={() => router.push("/perfil")}
                  className="text-white/80 hover:text-white/95 hover:bg-white/[0.08] cursor-pointer flex items-center gap-3.5 rounded-2xl px-4 py-3.5 transition-all duration-200 active:scale-[0.95] focus:bg-white/[0.08] backdrop-blur-xl group data-[highlighted]:bg-white/[0.08]"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] group-hover:from-white/[0.12] group-hover:to-white/[0.05] flex items-center justify-center transition-all duration-200 border border-white/10 flex-shrink-0">
                    <User className="w-4.5 h-4.5 text-white/70" />
                  </div>
                  <span className="font-semibold text-sm text-white/85">Meu Perfil</span>
                </DropdownMenuItem>

                {/* Chat */}
                <DropdownMenuItem
                  onClick={() => router.push("/chat")}
                  className="text-white/80 hover:text-white/95 hover:bg-white/[0.08] cursor-pointer flex items-center gap-3.5 rounded-2xl px-4 py-3.5 transition-all duration-200 active:scale-[0.95] focus:bg-white/[0.08] backdrop-blur-xl group data-[highlighted]:bg-white/[0.08]"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] group-hover:from-white/[0.12] group-hover:to-white/[0.05] flex items-center justify-center transition-all duration-200 border border-white/10 flex-shrink-0">
                    <MessageSquare className="w-4.5 h-4.5 text-white/70" />
                  </div>
                  <span className="font-semibold text-sm text-white/85">Chat</span>
                </DropdownMenuItem>

                {/* Comprar Créditos */}
                <DropdownMenuItem
                  onClick={handleBuyCredits}
                  className="text-white/80 hover:text-white/95 hover:bg-white/[0.08] cursor-pointer flex items-center gap-3.5 rounded-2xl px-4 py-3.5 transition-all duration-200 active:scale-[0.95] focus:bg-white/[0.08] backdrop-blur-xl group data-[highlighted]:bg-white/[0.08]"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] group-hover:from-white/[0.12] group-hover:to-white/[0.05] flex items-center justify-center transition-all duration-200 border border-white/10 flex-shrink-0">
                    <ShoppingCart className="w-4.5 h-4.5 text-white/70" />
                  </div>
                  <span className="font-semibold text-sm text-white/85">Comprar Créditos</span>
                </DropdownMenuItem>
              </div>

              <div className="bg-gradient-to-r from-white/5 via-white/8 to-white/5 h-px border-0 mx-2" />

              {/* Logout - Premium Minimal */}
              <div className="px-2 py-2">
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-white/70 hover:text-white/90 hover:bg-white/[0.06] cursor-pointer flex items-center gap-3.5 rounded-2xl px-4 py-3.5 transition-all duration-200 active:scale-[0.95] focus:bg-white/[0.06] backdrop-blur-xl group data-[highlighted]:bg-white/[0.06]"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/[0.06] to-white/[0.01] group-hover:from-white/[0.10] group-hover:to-white/[0.03] flex items-center justify-center transition-all duration-200 border border-white/8 flex-shrink-0">
                    <LogOut className="w-4.5 h-4.5 text-white/65" />
                  </div>
                  <span className="font-semibold text-sm text-white/75">Sair da Conta</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}

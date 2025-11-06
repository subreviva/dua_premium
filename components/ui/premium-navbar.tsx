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
import { MessageSquare, Settings, User, Coins, ChevronLeft, Menu, PanelLeft, PanelLeftClose, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@supabase/supabase-js"
import { UserAvatarGlobal } from "@/components/ui/user-avatar-global"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

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
  const [userCredits, setUserCredits] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    // Fetch real user credits if not provided via props
    if (propCredits === undefined) {
      loadUserCredits()
    }
  }, [propCredits])

  const loadUserCredits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('total_tokens, tokens_used')
          .eq('id', user.id)
          .single()
        
        if (userData) {
          setUserCredits(userData.total_tokens - userData.tokens_used)
        }
      }
    } catch (error) {
      console.error('Error loading credits:', error)
    }
  }

  const handleBuyCredits = () => {
    router.push('/comprar')
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const displayCredits = propCredits !== undefined ? propCredits : userCredits

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
              className="hidden md:flex text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-xl px-3 h-9"
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
            className="hidden sm:flex bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0 transition-all duration-300 rounded-xl px-4 h-9 text-sm font-semibold"
          >
            <Coins className="w-4 h-4 mr-2" />
            COMPRAR
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="focus:outline-none focus:ring-2 focus:ring-purple-500/50 rounded-full transition-all">
                <UserAvatarGlobal size="md" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-64 bg-black/95 backdrop-blur-2xl border-white/10 rounded-xl p-2 mt-2"
            >
              <DropdownMenuItem
                onClick={() => router.push("/perfil")}
                className="flex items-center gap-3 p-3 cursor-pointer rounded-lg focus:bg-white/5 text-white/90 hover:text-white transition-all duration-200"
              >
                <User className="w-4 h-4" />
                <span className="font-medium">Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/chat")}
                className="flex items-center gap-3 p-3 cursor-pointer rounded-lg focus:bg-white/5 text-white/90 hover:text-white transition-all duration-200"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="font-medium">Chat</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/5 my-2" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center gap-3 p-3 cursor-pointer rounded-lg focus:bg-red-500/10 text-red-400 hover:text-red-300 transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium">Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}

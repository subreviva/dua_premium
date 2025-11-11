"use client"

import { ArrowLeft, Film, Coins, User, MessageSquare, LogOut, ShoppingCart } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { supabaseClient } from "@/lib/supabase"
import Link from "next/link"
import Image from "next/image"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserAvatarGlobal } from "@/components/ui/user-avatar-global"
import { useCredits } from "@/hooks/use-credits"

const supabase = supabaseClient

export function VideoStudioNavbar() {
  const router = useRouter()
  const { credits: userCredits } = useCredits()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('[VIDEO NAVBAR] Erro ao fazer logout:', error)
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="backdrop-blur-2xl bg-black/60 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between">
          {/* Left Side */}
          <div className="flex items-center gap-3">
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
            <span className="text-[15px] font-medium text-white/90">
              Video Studio
            </span>
          </div>

          {/* Right Side - Credits Display */}
          <div className="flex items-center gap-2">
            {userCredits !== null && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-white/20 transition-all duration-300">
                <Coins className="w-4 h-4 text-yellow-400/90" />
                <span className="text-sm font-semibold text-white">{userCredits}</span>
              </div>
            )}
            <Button
              onClick={() => router.push('/comprar')}
              className="hidden sm:flex bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0 transition-all duration-300 rounded-xl px-4 h-9 text-sm font-semibold"
            >
              <Coins className="w-4 h-4 mr-2" />
              COMPRAR
            </Button>

            {/* User Profile Dropdown */}
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
                  onClick={() => router.push("/comprar")}
                  className="flex items-center gap-3 p-3 cursor-pointer rounded-lg focus:bg-purple-500/10 text-purple-400 hover:text-purple-300 transition-all duration-200 font-semibold"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span className="font-medium">Comprar Créditos</span>
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
      </div>
    </nav>
  )
}

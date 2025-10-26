"use client"

import { useState } from "react"
import { Search, Home, Sparkles, Compass, User, Heart, Plus } from "lucide-react"
import Link from "next/link"

export function MusicSidebar() {
  const [searchValue, setSearchValue] = useState("")

  return (
    <aside className="fixed hidden md:flex flex-col justify-between w-[280px] bg-white/[0.03] h-screen shrink-0 z-50 border-r border-white/5">
      {/* Top Section */}
      <div className="p-4 flex flex-col gap-8">
        {/* Logo */}
        <Link href="/" className="block active:scale-95 transition duration-100">
          <span className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
              <Sparkles className="w-5 h-5 text-white" />
            </span>
            <span className="block text-lg text-white font-semibold">Music Studio</span>
          </span>
        </Link>

        {/* Search Bar */}
        <div className="relative w-full">
          <label className="group focus-within:border-white/30 px-4 gap-2 relative flex flex-row items-center h-10 text-sm border border-white/10 outline-none focus-within:border-white/20 placeholder:text-white/50 transition-all duration-300 backdrop-blur-md rounded-full bg-white/5">
            <Search className="w-4 h-4 text-neutral-400 flex-none" />
            <input
              placeholder="Pesquisar"
              autoComplete="off"
              className="appearance-none text-white text-sm font-medium bg-transparent outline-none placeholder:text-neutral-500 w-full pr-12"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <div className="absolute right-4 inline-flex items-center gap-0.5 pointer-events-none text-xs text-neutral-500">
              <span>⌘</span>
              <span>K</span>
            </div>
          </label>
        </div>

        {/* Main Navigation */}
        <div className="flex flex-col gap-1 items-start">
          <Link
            href="/musicstudio"
            className="group/navlink flex relative items-center text-sm px-4 rounded-full h-10 font-medium gap-3 text-white hover:bg-white/[0.08] active:scale-95 bg-white/[0.08] w-full transition-all"
          >
            <Home className="w-5 h-5" />
            <span>Início</span>
          </Link>
          <Link
            href="/musicstudio"
            className="group/navlink flex relative items-center text-sm px-4 rounded-full h-10 font-medium gap-3 text-white/70 hover:text-white hover:bg-white/[0.08] active:scale-95 w-full transition-all"
          >
            <Sparkles className="w-5 h-5" />
            <span>Criar</span>
          </Link>
          <Link
            href="/musicstudio"
            className="group/navlink flex relative items-center text-sm px-4 rounded-full h-10 font-medium gap-3 text-white/70 hover:text-white hover:bg-white/[0.08] active:scale-95 w-full transition-all"
          >
            <Compass className="w-5 h-5" />
            <span>Explorar</span>
          </Link>
        </div>
      </div>

      {/* Library Section */}
      <nav className="p-4 flex flex-col gap-8 overflow-y-auto flex-1 border-t border-white/5">
        <div className="flex flex-col gap-2 items-start">
          <div className="text-sm font-medium px-4 text-neutral-400 leading-9">Biblioteca</div>
          <button className="flex items-center text-sm px-4 rounded-full h-10 font-medium gap-3 text-white/70 hover:text-white hover:bg-white/[0.08] active:scale-95 w-full transition-all">
            <User className="w-5 h-5" />
            <span>Perfil</span>
          </button>
          <button className="flex items-center text-sm px-4 rounded-full h-10 font-medium gap-3 text-white/70 hover:text-white hover:bg-white/[0.08] active:scale-95 w-full transition-all">
            <Heart className="w-5 h-5" />
            <span>Favoritos</span>
          </button>
          <button className="flex items-center text-sm px-4 rounded-full h-10 font-medium gap-3 text-white/70 hover:text-white hover:bg-white/[0.08] active:scale-95 w-full transition-all">
            <Plus className="w-5 h-5" />
            <span>Nova Playlist</span>
          </button>
        </div>
      </nav>

      {/* Footer */}
      <div className="flex flex-row flex-wrap text-xs text-white/40 gap-x-3 gap-y-1 p-4 border-t border-white/5">
        <a className="hover:text-white/60 transition-colors" href="#">
          Preços
        </a>
        <a className="hover:text-white/60 transition-colors" href="#">
          Afiliados
        </a>
        <a className="hover:text-white/60 transition-colors" href="#">
          API
        </a>
        <a className="hover:text-white/60 transition-colors" href="#">
          Sobre
        </a>
        <a className="hover:text-white/60 transition-colors" href="#">
          Termos
        </a>
        <a className="hover:text-white/60 transition-colors" href="#">
          Privacidade
        </a>
      </div>
    </aside>
  )
}

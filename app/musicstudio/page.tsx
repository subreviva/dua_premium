"use client"
import { Music, Library, Mic } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import Image from "next/image"

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 h-screen overflow-hidden relative md:overflow-auto">
        {/* Background Image with Heavy Blur */}
        <div className="absolute inset-0 z-0">
          <Image src="/images/hero-background.jpeg" alt="Background" fill className="object-cover" priority />
          {/* Heavy blur overlay */}
          <div className="absolute inset-0 backdrop-blur-3xl bg-background/40" />
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-background/60 via-background/50 to-primary/20" />
        </div>

        <main className="relative z-10 h-[100dvh] flex flex-col md:h-auto md:min-h-screen overflow-hidden">
          <nav className="pt-safe px-4 py-4 shrink-0 backdrop-blur-xl bg-background/5 border-b border-border/10 md:hidden">
            <div className="flex items-center justify-between">
              <span className="text-base font-light tracking-wide text-white">DUA Music</span>
            </div>
          </nav>

          <div className="flex-1 flex flex-col items-center justify-center px-4 pb-[96px] md:pb-8 md:px-8 md:pt-8">
            {/* Hero Text */}
            <div className="text-center mb-8 md:mb-12">
              <h1 className="text-3xl font-light tracking-tight text-balance md:text-5xl lg:text-6xl">
                Crie Música
                <br />
                <span className="gradient-text font-normal">Além da Imaginação</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-3 font-light leading-relaxed md:text-base md:mt-4">
                Transforme ideias em música profissional com DUA
              </p>
            </div>

            {/* Content Cards */}
            <div className="w-full max-w-sm space-y-2 md:space-y-3">
              <Link href="/musicstudio/create" className="group block">
                <div className="relative overflow-hidden rounded-xl glass-effect border border-border/50 p-3.5 transition-all active:scale-[0.98] touch-manipulation md:rounded-2xl md:p-5 backdrop-blur-xl">
                  <div className="absolute inset-0 gradient-primary opacity-0 group-active:opacity-10 transition-opacity" />
                  <div className="relative flex items-center gap-3 md:gap-4">
                    <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shrink-0 glow-primary md:w-11 md:h-11">
                      <Music className="w-4 h-4 text-white md:w-5 md:h-5" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-normal mb-0.5 md:text-base">Texto para Música</h3>
                      <p className="text-[10px] text-muted-foreground font-light leading-relaxed md:text-xs">
                        Descreva sua visão musical
                      </p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/musicstudio/melody" className="group block">
                <div className="relative overflow-hidden rounded-xl glass-effect border border-border/50 p-3.5 transition-all active:scale-[0.98] touch-manipulation md:rounded-2xl md:p-5 backdrop-blur-xl">
                  <div className="absolute inset-0 gradient-accent opacity-0 group-active:opacity-10 transition-opacity" />
                  <div className="relative flex items-center gap-3 md:gap-4">
                    <div className="w-9 h-9 rounded-xl gradient-accent flex items-center justify-center shrink-0 md:w-11 md:h-11">
                      <Mic className="w-4 h-4 text-white md:w-5 md:h-5" strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-normal mb-0.5 md:text-base">Melodia para Música</h3>
                      <p className="text-[10px] text-muted-foreground font-light leading-relaxed md:text-xs">
                        Grave ou carregue melodia
                      </p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/musicstudio/library" className="group block">
                <div className="relative overflow-hidden rounded-xl glass-effect border border-border/50 p-3.5 transition-all active:scale-[0.98] touch-manipulation md:rounded-2xl md:p-5 backdrop-blur-xl">
                  <div className="absolute inset-0 gradient-secondary opacity-0 group-active:opacity-10 transition-opacity" />
                  <div className="relative flex items-center gap-3 md:gap-4">
                    <div className="w-9 h-9 rounded-xl gradient-secondary flex items-center justify-center shrink-0 md:w-11 md:h-11">
                      <Library className="w-4 h-4 text-white md:w-5 md:h-5" strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-normal mb-0.5 md:text-base">Biblioteca Musical</h3>
                      <p className="text-[10px] text-muted-foreground font-light leading-relaxed md:text-xs">
                        Organize suas criações
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

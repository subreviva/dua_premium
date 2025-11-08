"use client"
import { Music, Library, Mic, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { MusicStudioNavbar } from "@/components/music-studio-navbar"
import { FeaturedTracksCarousel } from "@/components/featured-tracks-carousel"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="flex h-screen overflow-hidden bg-black">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      {/* Global Navbar - Mobile */}
      <div className="md:hidden">
        <MusicStudioNavbar />
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {/* Hero Section */}
        <div className="relative min-h-[70vh] md:min-h-screen flex items-center justify-center overflow-hidden">
          {/* Background Image with Heavy Blur */}
          <div className="absolute inset-0 z-0">
            <Image 
              src="/images/hero-background.jpeg" 
              alt="Background" 
              fill 
              className="object-cover" 
              priority 
            />
            {/* Heavy blur overlay */}
            <div className="absolute inset-0 backdrop-blur-3xl bg-black/60" />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black/50 to-pink-900/20" />
          </div>

          <main className="relative z-10 w-full pt-[68px] md:pt-0">
            <div className="flex flex-col items-center justify-center px-5 py-10 md:px-8 md:py-16">
              {/* Hero Text */}
              <div className="text-center mb-10 md:mb-16 max-w-4xl">
                <h1 className="text-[32px] leading-[1.15] font-semibold tracking-tight md:text-6xl lg:text-7xl text-white mb-4 md:mb-6">
                  Crie Música
                  <br />
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    Além da Imaginação
                  </span>
                </h1>
                <p className="text-[15px] text-zinc-300 mt-3 font-normal leading-relaxed md:text-lg max-w-2xl mx-auto">
                  Transforme ideias em música profissional com IA
                </p>
                <div className="flex flex-col gap-3 justify-center mt-6 md:mt-8">
                  <Button
                    size="lg"
                    className="w-full md:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold text-[15px] h-12 rounded-xl active:scale-[0.98] transition-transform"
                    onClick={() => router.push('/create')}
                  >
                    Começar Agora
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Quick Actions Cards - Mobile Optimized */}
              <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-3 gap-3">
                <Link href="/create" className="group block active:scale-[0.98] transition-transform">
                  <div className="relative overflow-hidden rounded-2xl bg-white/[0.06] border border-white/[0.08] p-5 transition-all active:bg-white/[0.12] h-full">
                    <div className="flex items-center md:flex-col md:items-center md:text-center gap-3 md:gap-0">
                      <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center md:mb-3 shrink-0">
                        <Music className="w-5 h-5 md:w-6 md:h-6 text-white" strokeWidth={2.5} />
                      </div>
                      <div>
                        <h3 className="text-[15px] md:text-lg font-semibold mb-0.5 md:mb-2 text-white">Texto → Música</h3>
                        <p className="text-[13px] md:text-sm text-zinc-400 font-normal">
                          Descreva sua visão
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/melody" className="group block active:scale-[0.98] transition-transform">
                  <div className="relative overflow-hidden rounded-2xl bg-white/[0.06] border border-white/[0.08] p-5 transition-all active:bg-white/[0.12] h-full">
                    <div className="flex items-center md:flex-col md:items-center md:text-center gap-3 md:gap-0">
                      <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center md:mb-3 shrink-0">
                        <Mic className="w-5 h-5 md:w-6 md:h-6 text-white" strokeWidth={2.5} />
                      </div>
                      <div>
                        <h3 className="text-[15px] md:text-lg font-semibold mb-0.5 md:mb-2 text-white">Melodia → Música</h3>
                        <p className="text-[13px] md:text-sm text-zinc-400 font-normal">
                          Transforme melodias
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/library" className="group block active:scale-[0.98] transition-transform">
                  <div className="relative overflow-hidden rounded-2xl bg-white/[0.06] border border-white/[0.08] p-5 transition-all active:bg-white/[0.12] h-full">
                    <div className="flex items-center md:flex-col md:items-center md:text-center gap-3 md:gap-0">
                      <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center md:mb-3 shrink-0">
                        <Library className="w-5 h-5 md:w-6 md:h-6 text-white" strokeWidth={2.5} />
                      </div>
                      <div>
                        <h3 className="text-[15px] md:text-lg font-semibold mb-0.5 md:mb-2 text-white">Biblioteca</h3>
                        <p className="text-[13px] md:text-sm text-zinc-400 font-normal">
                          Suas criações
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </main>
        </div>

        {/* Featured Tracks Section */}
        <div className="relative bg-black py-10 md:py-24">
          <div className="max-w-7xl mx-auto px-5 md:px-8">
            <FeaturedTracksCarousel />
          </div>
        </div>

        {/* How It Works Section - Desktop Only */}
        <div className="relative bg-black hidden md:block">
          <HowItWorksSection />
        </div>

        {/* CTA Section */}
        <div className="relative bg-black py-12 md:py-24">
          <div className="max-w-4xl mx-auto px-5 md:px-8 text-center">
            <h2 className="text-[28px] leading-[1.2] md:text-5xl font-semibold text-white mb-4 md:mb-6">
              Pronto para Criar Sua{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Primeira Música?
              </span>
            </h2>
            <p className="text-zinc-400 font-normal text-[15px] md:text-lg mb-6 md:mb-8 max-w-2xl mx-auto">
              Transforme ideias em música profissional
            </p>
            <Button
              size="lg"
              className="w-full md:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold text-[15px] md:text-lg px-8 py-6 md:py-7 rounded-xl active:scale-[0.98] transition-transform"
              onClick={() => router.push('/create')}
            >
              Criar Música Agora
              <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="relative bg-zinc-950/50 border-t border-white/5 py-6 md:py-8">
          <div className="max-w-7xl mx-auto px-5 md:px-8">
            <div className="text-center text-zinc-500 text-[13px] md:text-sm font-normal">
              <p>© 2025 DUA. Criando o futuro da música.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

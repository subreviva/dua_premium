"use client"
import { Music, Library, Mic, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FeaturedTracksCarousel } from "@/components/featured-tracks-carousel"
import { MusicStudioNavbar } from "@/components/music-studio-navbar"
import { Button } from "@/components/ui/button"

export default function MusicStudioMobile() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      {/* Elegant Transparent Navbar */}
      <MusicStudioNavbar transparent />

      {/* Main Scrollable Content - With top padding to prevent overlap */}
      <main className="pt-[68px] pb-safe">{/* pt-[68px] accounts for fixed header height */}
        {/* Hero Section - Mobile Optimized */}
        <section className="px-4 pt-8 pb-6">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-white leading-tight">
              Crie Música
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Profissional com IA
              </span>
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-xs mx-auto">
              Do texto à música completa em segundos. Simples, rápido e profissional.
            </p>
          </div>
        </section>

        {/* Quick Actions - iOS Style */}
        <section className="px-4 pb-6">
          <div className="space-y-3">
            <Link 
              href="/create" 
              className="block active:scale-[0.98] transition-transform"
            >
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <Music className="w-7 h-7 text-white" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-white mb-0.5">Criar com Texto</h3>
                    <p className="text-xs text-zinc-400 truncate">Descreva sua visão musical</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-white/40 flex-shrink-0" />
                </div>
              </div>
            </Link>

            <Link 
              href="/melody" 
              className="block active:scale-[0.98] transition-transform"
            >
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <Mic className="w-7 h-7 text-white" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-white mb-0.5">Gravar Melodia</h3>
                    <p className="text-xs text-zinc-400 truncate">Transforme sua melodia em música</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-white/40 flex-shrink-0" />
                </div>
              </div>
            </Link>

            <Link 
              href="/library" 
              className="block active:scale-[0.98] transition-transform"
            >
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0">
                    <Library className="w-7 h-7 text-white" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-white mb-0.5">Sua Biblioteca</h3>
                    <p className="text-xs text-zinc-400 truncate">Acesse todas as suas criações</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-white/40 flex-shrink-0" />
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Featured Tracks Carousel - Mobile First */}
        <section className="pb-8">
          <div className="px-4 mb-4">
            <h3 className="text-lg font-semibold text-white">Criado na DUA</h3>
            <p className="text-xs text-zinc-400 mt-1">Ouça músicas criadas pela comunidade</p>
          </div>
          <FeaturedTracksCarousel />
        </section>

        {/* CTA Section - iOS Style */}
        <section className="px-4 pb-8">
          <div className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-purple-500/10 border border-purple-500/20 rounded-3xl p-6 text-center backdrop-blur-sm">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" strokeWidth={2} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Pronta para Criar?
            </h3>
            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
              Transforme suas ideias em música profissional agora mesmo
            </p>
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl h-14 active:scale-[0.98] transition-transform"
              onClick={() => router.push('/create')}
            >
              Começar Agora
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </section>

        {/* Footer - Minimal */}
        <footer className="px-4 pb-8 text-center">
          <p className="text-xs text-zinc-600">
            © 2025 DUA Music Studio
          </p>
        </footer>
      </main>
    </div>
  )
}

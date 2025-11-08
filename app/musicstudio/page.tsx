"use client"
import { Music, Library, Mic, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
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

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {/* Hero Section */}
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
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

          <main className="relative z-10 w-full">
            <nav className="pt-safe px-4 py-4 backdrop-blur-xl bg-black/5 border-b border-white/10 md:hidden">
              <div className="flex items-center justify-between">
                <span className="text-base font-light tracking-wide text-white">DUA Music</span>
              </div>
            </nav>

            <div className="flex flex-col items-center justify-center px-4 py-16 md:px-8">
              {/* Hero Text */}
              <div className="text-center mb-12 md:mb-16 max-w-4xl">
                <h1 className="text-4xl font-light tracking-tight text-balance md:text-6xl lg:text-7xl text-white mb-6">
                  Crie Música
                  <br />
                  <span className="font-normal bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    Além da Imaginação
                  </span>
                </h1>
                <p className="text-base text-zinc-300 mt-4 font-light leading-relaxed md:text-lg max-w-2xl mx-auto">
                  Transforme ideias em música profissional com IA. Do texto à música completa em segundos.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium"
                    onClick={() => router.push('/create')}
                  >
                    Começar Agora
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                    onClick={() => router.push('/library')}
                  >
                    Ver Exemplos
                  </Button>
                </div>
              </div>

              {/* Quick Actions Cards */}
              <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/create" className="group block">
                  <div className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-6 transition-all hover:bg-white/10 hover:border-white/20 h-full">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                        <Music className="w-6 h-6 text-white" strokeWidth={2} />
                      </div>
                      <h3 className="text-lg font-medium mb-2 text-white">Texto → Música</h3>
                      <p className="text-sm text-zinc-400 font-light">
                        Descreva sua visão musical
                      </p>
                    </div>
                  </div>
                </Link>

                <Link href="/melody" className="group block">
                  <div className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-6 transition-all hover:bg-white/10 hover:border-white/20 h-full">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                        <Mic className="w-6 h-6 text-white" strokeWidth={2} />
                      </div>
                      <h3 className="text-lg font-medium mb-2 text-white">Melodia → Música</h3>
                      <p className="text-sm text-zinc-400 font-light">
                        Transforme sua melodia
                      </p>
                    </div>
                  </div>
                </Link>

                <Link href="/library" className="group block">
                  <div className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-6 transition-all hover:bg-white/10 hover:border-white/20 h-full">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4">
                        <Library className="w-6 h-6 text-white" strokeWidth={2} />
                      </div>
                      <h3 className="text-lg font-medium mb-2 text-white">Sua Biblioteca</h3>
                      <p className="text-sm text-zinc-400 font-light">
                        Gerencie suas criações
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </main>
        </div>

        {/* Featured Tracks Section */}
        <div className="relative bg-gradient-to-b from-black via-zinc-950 to-black py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <FeaturedTracksCarousel />
          </div>
        </div>

        {/* How It Works Section */}
        <div className="relative bg-black">
          <HowItWorksSection />
        </div>

        {/* CTA Section */}
        <div className="relative bg-gradient-to-b from-black to-zinc-950 py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
            <h2 className="text-3xl md:text-5xl font-light text-white mb-6">
              Pronto para Criar Sua{" "}
              <span className="font-normal bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Primeira Música?
              </span>
            </h2>
            <p className="text-zinc-400 font-light text-lg mb-8 max-w-2xl mx-auto">
              Junte-se a milhares de criadores que já estão transformando ideias em música profissional com DUA.
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium text-lg px-8 py-6"
              onClick={() => router.push('/create')}
            >
              Criar Música Agora
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="relative bg-zinc-950 border-t border-white/10 py-8">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="text-center text-zinc-500 text-sm font-light">
              <p>© 2025 DUA Music Studio. Criando o futuro da música com IA.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

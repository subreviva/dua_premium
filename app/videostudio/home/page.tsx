"use client"

import { Video, Sparkles, ArrowRight, Wand2, ArrowUpCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function VideoStudioHomePage() {
  const router = useRouter()

  return (
    <div className="flex h-screen overflow-hidden bg-black">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Hero Section */}
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
            
            {/* Animated Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
          </div>

          <main className="relative z-10 w-full pt-16 md:pt-0">
            <div className="flex flex-col items-center justify-center px-5 py-10 md:px-8 md:py-16">
              {/* Hero Text */}
              <div className="text-center mb-10 md:mb-16 max-w-5xl">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-blue-400 font-medium">Powered by Runway ML</span>
                </div>
                
                <h1 className="text-[40px] leading-[1.1] font-bold tracking-tight md:text-7xl lg:text-8xl text-white mb-6">
                  Crie Vídeos
                  <br />
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Cinematográficos
                  </span>
                </h1>
                
                <p className="text-lg text-zinc-300 font-normal leading-relaxed md:text-xl max-w-3xl mx-auto">
                  Transforme ideias em vídeos profissionais com inteligência artificial de última geração
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold text-base h-14 px-8 rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:shadow-xl hover:shadow-blue-500/30"
                    onClick={() => router.push('/videostudio/generate')}
                  >
                    <Video className="w-5 h-5 mr-2" />
                    Gerar Vídeo
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold text-base h-14 px-8 rounded-xl backdrop-blur-sm"
                    onClick={() => router.push('/videostudio/upscale')}
                  >
                    <ArrowUpCircle className="w-5 h-5 mr-2" />
                    Ver Exemplos
                  </Button>
                </div>
              </div>

              {/* Quick Actions Cards */}
              <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/videostudio/upscale" className="group block transition-transform hover:scale-[1.02]">
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 p-6 h-full backdrop-blur-sm">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="relative">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
                        <ArrowUpCircle className="w-7 h-7 text-white" strokeWidth={2.5} />
                      </div>
                      
                      <h3 className="text-xl font-semibold mb-2 text-white">Upscale 4K</h3>
                      <p className="text-sm text-zinc-400 font-normal leading-relaxed">
                        Aumente a resolução dos seus vídeos até 4K com qualidade cinematográfica
                      </p>
                      
                      <div className="mt-4 flex items-center text-blue-400 text-sm font-medium">
                        Começar agora
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/videostudio/editor" className="group block transition-transform hover:scale-[1.02]">
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-white/10 p-6 h-full backdrop-blur-sm">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="relative">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30">
                        <Wand2 className="w-7 h-7 text-white" strokeWidth={2.5} />
                      </div>
                      
                      <h3 className="text-xl font-semibold mb-2 text-white">Editor Criativo</h3>
                      <p className="text-sm text-zinc-400 font-normal leading-relaxed">
                        Transforme vídeos com comandos de texto: mude ângulos, cenários e elementos
                      </p>
                      
                      <div className="mt-4 flex items-center text-purple-400 text-sm font-medium">
                        Experimentar
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/videostudio/generate" className="group block transition-transform hover:scale-[1.02]">
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500/10 to-orange-500/10 border border-white/10 p-6 h-full backdrop-blur-sm">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="relative">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center mb-4 shadow-lg shadow-pink-500/30">
                        <Video className="w-7 h-7 text-white" strokeWidth={2.5} />
                      </div>
                      
                      <h3 className="text-xl font-semibold mb-2 text-white">Texto → Vídeo</h3>
                      <p className="text-sm text-zinc-400 font-normal leading-relaxed">
                        Descreva sua visão e veja ela ganhar vida em vídeo
                      </p>
                      
                      <div className="mt-4 flex items-center text-pink-400 text-sm font-medium">
                        Criar agora
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </main>
        </div>

        {/* Features Section */}
        <div className="relative bg-black py-20 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-5 md:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Tecnologia de Ponta
              </h2>
              <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                Powered by Runway ML Gen-4 Turbo - A mais avançada IA de geração de vídeo
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
                  <Video className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Alta Qualidade</h3>
                <p className="text-zinc-400">Vídeos em até 4K com qualidade cinematográfica</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Rápido</h3>
                <p className="text-zinc-400">Geração ultra-rápida com Gen-4 Turbo</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500/20 to-pink-600/20 border border-pink-500/30 flex items-center justify-center mx-auto mb-4">
                  <Wand2 className="w-8 h-8 text-pink-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Fácil de Usar</h3>
                <p className="text-zinc-400">Interface intuitiva e resultados profissionais</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="relative bg-gradient-to-b from-black to-blue-950/20 py-24 border-t border-white/5">
          <div className="max-w-4xl mx-auto px-5 md:px-8 text-center">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Pronto para Criar Seu{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Primeiro Vídeo?
              </span>
            </h2>
            <p className="text-zinc-400 text-lg mb-8 max-w-2xl mx-auto">
              Transforme suas ideias em vídeos profissionais em minutos
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold text-lg px-10 py-7 rounded-xl shadow-2xl shadow-blue-500/30"
              onClick={() => router.push('/videostudio/generate')}
            >
              Começar Agora
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="relative bg-zinc-950 border-t border-white/5 py-8">
          <div className="max-w-7xl mx-auto px-5 md:px-8">
            <div className="text-center text-zinc-500 text-sm">
              <p>© 2025 DUA Video Studio. Powered by Runway ML.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

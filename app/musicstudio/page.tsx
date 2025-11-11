"use client"
import { Music, Library, Mic, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
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
      {/* Sidebar - apenas desktop */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 🎵 MOBILE: Navbar superior FIXA sem espaço (pt-safe) */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 pt-safe">
          <MusicStudioNavbar />
        </div>

        {/* DESKTOP: Navbar normal */}
        <div className="hidden md:block">
          <MusicStudioNavbar />
        </div>
        
        {/* 🎵 MOBILE: Conteúdo ultra premium estilo Suno */}
        <div className="md:hidden flex-1 overflow-y-auto pt-[calc(56px+env(safe-area-inset-top))] pb-safe-nav">
          {/* Hero Section */}
          <div className="relative min-h-[60vh] flex flex-col">
            {/* Gradiente de fundo elegante */}
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-zinc-950 via-black to-black">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(120,119,198,0.08),transparent_50%)]" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-purple-500/[0.06] rounded-full blur-3xl" />
            </div>

            {/* Conteúdo centralizado */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
              {/* Hero Text */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="text-center mb-10"
              >
                <h1 className="text-[42px] leading-[1.1] font-bold tracking-tight text-white mb-4 bg-gradient-to-b from-white via-white to-white/80 bg-clip-text text-transparent">
                  Crie Música
                  <br />
                  Profissional
                </h1>
                <p className="text-[15px] text-white/50 font-light leading-relaxed max-w-[280px] mx-auto">
                  Transforme ideias em faixas completas com IA
                </p>
              </motion.div>

              {/* CTA Button Ultra Premium */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[320px]"
              >
                <button
                  onClick={() => router.push('/create')}
                  className="group relative w-full"
                >
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-purple-500/30 rounded-2xl blur-xl group-active:blur-2xl transition-all opacity-60 group-active:opacity-80" />
                  
                  {/* Button */}
                  <div className="relative w-full h-14 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 flex items-center justify-between px-6 active:scale-[0.98] transition-transform shadow-2xl shadow-purple-500/25">
                    <span className="text-[17px] font-semibold text-white tracking-tight">
                      Começar Agora
                    </span>
                    <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center group-active:scale-90 transition-transform">
                      <ArrowRight className="w-4 h-4 text-white" strokeWidth={3} />
                    </div>
                  </div>
                </button>
              </motion.div>
            </div>
          </div>

          {/* 🎵 Featured Tracks Carousel - Ultra Elegante */}
          <div className="relative bg-black py-10">
            <div className="px-6 mb-6">
              <h2 className="text-[24px] font-semibold text-white tracking-tight mb-2">
                Músicas em Destaque
              </h2>
              <p className="text-[13px] text-white/40 font-light">
                Criações recentes da comunidade
              </p>
            </div>
            
            <div className="relative">
              <FeaturedTracksCarousel />
            </div>
          </div>

          {/* Info text sutil */}
          <div className="relative bg-gradient-to-b from-black to-zinc-950 py-8 px-6">
            <p className="text-center text-[11px] text-white/30 font-light max-w-[240px] mx-auto">
              Explore todas as ferramentas pelo menu inferior
            </p>
          </div>
        </div>

        {/* DESKTOP: Layout original completo */}
        <div className="hidden md:flex md:flex-1 md:flex-col md:overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 z-0">
                <Image 
                  src="/images/hero-background.jpeg" 
                  alt="Background" 
                  fill 
                  className="object-cover" 
                  priority 
                />
                <div className="absolute inset-0 backdrop-blur-3xl bg-black/70" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
              </div>

              <main className="relative z-10 w-full">
                <div className="flex flex-col items-center justify-center px-8 py-16">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16 max-w-4xl"
                  >
                    <h1 className="text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6">
                      Crie Música
                      <br />
                      <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                        Além da Imaginação
                      </span>
                    </h1>
                    <p className="text-lg text-white/70 font-light leading-relaxed max-w-2xl mx-auto">
                      Transforme ideias em música profissional com IA
                    </p>
                  </motion.div>

                  <div className="w-full max-w-3xl">
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        {
                          href: "/create",
                          icon: Music,
                          title: "Texto → Música",
                          description: "Descreva sua visão",
                        },
                        {
                          href: "/melody",
                          icon: Mic,
                          title: "Melodia → Música",
                          description: "Transforme melodias",
                        },
                        {
                          href: "/library",
                          icon: Library,
                          title: "Biblioteca",
                          description: "Suas criações",
                        },
                      ].map((action) => (
                        <Link key={action.href} href={action.href} className="group block active:scale-[0.98] transition-transform">
                          <div className="relative overflow-hidden rounded-2xl bg-white/[0.06] border border-white/[0.08] p-5 transition-all active:bg-white/[0.12] h-full">
                            <div className="flex flex-col items-center text-center">
                              <div className="w-12 h-12 rounded-xl bg-white/[0.08] border border-white/[0.12] flex items-center justify-center mb-3 shrink-0">
                                <action.icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold mb-2 text-white">{action.title}</h3>
                                <p className="text-sm text-zinc-400 font-normal">
                                  {action.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </main>
            </div>

            <div className="relative bg-black py-24">
              <div className="max-w-7xl mx-auto px-8">
                <FeaturedTracksCarousel />
              </div>
            </div>

            <div className="relative bg-black">
              <HowItWorksSection />
            </div>

            <div className="relative bg-black py-24">
              <div className="max-w-4xl mx-auto px-8 text-center">
                <h2 className="text-5xl font-semibold text-white mb-6">
                  Pronto para Criar Sua{" "}
                  <span className="bg-gradient-to-r from-white/90 to-white/60 bg-clip-text text-transparent">
                    Primeira Música?
                  </span>
                </h2>
                <p className="text-white/60 font-light text-lg mb-8 max-w-2xl mx-auto">
                  Transforme ideias em música profissional
                </p>
                <Button
                  size="lg"
                  className="w-auto bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.12] hover:border-white/[0.15] text-white font-medium text-lg px-8 py-7 rounded-xl active:scale-[0.98] transition-all backdrop-blur-xl"
                  onClick={() => router.push('/create')}
                >
                  Criar Música Agora
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="relative bg-black/50 border-t border-white/[0.05] py-8">
              <div className="max-w-7xl mx-auto px-8">
                <div className="text-center text-white/40 text-sm font-light">
                  <p>© 2025 DUA. Criando o futuro da música.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

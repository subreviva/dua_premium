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

  const quickActions = [
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
  ]

  return (
    <div className="flex h-screen overflow-hidden bg-black">
      {/* Sidebar - apenas desktop */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar superior - sempre visível */}
        <MusicStudioNavbar />
        
        {/* Conteúdo com scroll */}
        <div className="flex-1 overflow-y-auto pb-safe-mobile md:pb-0">
          <div className="relative min-h-[70vh] md:min-h-screen flex items-center justify-center overflow-hidden">
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

            <main className="relative z-10 w-full pt-4 md:pt-0">
              <div className="flex flex-col items-center justify-center px-5 py-10 md:px-8 md:py-16">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-10 md:mb-16 max-w-4xl"
              >
                <h1 className="text-[32px] leading-[1.15] font-semibold tracking-tight md:text-6xl lg:text-7xl text-white mb-4 md:mb-6">
                  Crie Música
                  <br />
                  <span className="bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent">
                    Além da Imaginação
                  </span>
                </h1>
                <p className="text-[15px] text-white/60 mt-3 font-light leading-relaxed md:text-lg max-w-2xl mx-auto">
                  Transforme ideias em música profissional com IA
                </p>
              </motion.div>

              <div className="w-full md:max-w-3xl">
                <div className="md:hidden overflow-x-auto scrollbar-hide -mx-5 px-5 pb-4">
                  <div className="flex gap-3" style={{ width: 'max-content' }}>
                    {quickActions.map((action, index) => (
                      <motion.div
                        key={action.href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                      >
                        <Link href={action.href}>
                          <div className="w-[280px] backdrop-blur-xl bg-white/[0.06] border border-white/[0.08] rounded-2xl p-5 active:bg-white/[0.10] transition-all active:scale-[0.97]">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-xl bg-white/[0.08] border border-white/[0.12] backdrop-blur-xl flex items-center justify-center flex-shrink-0">
                                <action.icon className="w-5 h-5 text-white/90" strokeWidth={2} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-[15px] font-medium text-white/95 mb-1 tracking-tight">
                                  {action.title}
                                </h3>
                                <p className="text-[13px] text-white/50 font-light leading-snug">
                                  {action.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="hidden md:grid grid-cols-3 gap-3">
                  {quickActions.map((action) => (
                    <Link key={action.href} href={action.href} className="group block active:scale-[0.98] transition-transform">
                      <div className="relative overflow-hidden rounded-2xl bg-white/[0.06] border border-white/[0.08] p-5 transition-all active:bg-white/[0.12] h-full">
                        <div className="flex items-center md:flex-col md:items-center md:text-center gap-3 md:gap-0">
                          <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-white/[0.08] border border-white/[0.12] flex items-center justify-center md:mb-3 shrink-0">
                            <action.icon className="w-5 h-5 md:w-6 md:h-6 text-white" strokeWidth={2.5} />
                          </div>
                          <div>
                            <h3 className="text-[15px] md:text-lg font-semibold mb-0.5 md:mb-2 text-white">{action.title}</h3>
                            <p className="text-[13px] md:text-sm text-zinc-400 font-normal">
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

        <div className="relative bg-black py-10 md:py-24">
          <div className="max-w-7xl mx-auto px-5 md:px-8">
            <FeaturedTracksCarousel />
          </div>
        </div>

        <div className="relative bg-black hidden md:block">
          <HowItWorksSection />
        </div>

        <div className="relative bg-black py-12 md:py-24">
          <div className="max-w-4xl mx-auto px-5 md:px-8 text-center">
            <h2 className="text-[28px] leading-[1.2] md:text-5xl font-semibold text-white mb-4 md:mb-6">
              Pronto para Criar Sua{" "}
              <span className="bg-gradient-to-r from-white/90 to-white/60 bg-clip-text text-transparent">
                Primeira Música?
              </span>
            </h2>
            <p className="text-white/60 font-light text-[15px] md:text-lg mb-6 md:mb-8 max-w-2xl mx-auto">
              Transforme ideias em música profissional
            </p>
            <Button
              size="lg"
              className="w-full md:w-auto bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.12] hover:border-white/[0.15] text-white font-medium text-[15px] md:text-lg px-8 py-6 md:py-7 rounded-xl active:scale-[0.98] transition-all backdrop-blur-xl"
              onClick={() => router.push('/create')}
            >
              Criar Música Agora
              <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
            </Button>
          </div>
        </div>

        <div className="relative bg-black/50 border-t border-white/[0.05] py-6 md:py-8">
          <div className="max-w-7xl mx-auto px-5 md:px-8">
            <div className="text-center text-white/40 text-[13px] md:text-sm font-light">
              <p>© 2025 DUA. Criando o futuro da música.</p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}

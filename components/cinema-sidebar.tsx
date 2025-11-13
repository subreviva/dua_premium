"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Film, ImagePlay, Wand2, Sparkles, ArrowUpCircle, Home, Users } from "lucide-react"
import { cn } from "@/lib/utils"

export function CinemaSidebar() {
  const pathname = usePathname()

  const tools = [
    {
      name: "Visão Geral",
      href: "/videostudio",
      icon: Home,
      description: "Todas as ferramentas"
    },
    {
      name: "Imagem para Vídeo",
      href: "/videostudio/criar",
      icon: ImagePlay,
      description: "Transforme imagens em vídeos cinematográficos"
    },
    {
      name: "Editor Criativo",
      href: "/videostudio/editar",
      icon: Wand2,
      description: "Edite e transforme vídeos com IA"
    },
    {
      name: "Qualidade 4K",
      href: "/videostudio/qualidade",
      icon: ArrowUpCircle,
      description: "Melhore a resolução até 4K"
    },
    {
      name: "Performance (Act-Two)",
      href: "/videostudio/performance",
      icon: Users,
      description: "Anime personagens com performance"
    }
  ]

  return (
    <div className="flex h-screen w-64 flex-col border-r border-white/10 bg-black/40 backdrop-blur-2xl pt-16">
      {/* Header */}
      <div className="border-b border-white/5 p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-light text-white tracking-tight">Video Studio</h2>
            <p className="text-xs text-white/40 font-light">Criação de Vídeos</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {tools.map((tool) => {
          const isActive = pathname === tool.href
          const Icon = tool.icon

          return (
            <Link
              key={tool.href}
              href={tool.href}
              className={cn(
                "group flex items-start gap-3 rounded-xl px-3 py-3 transition-all duration-300",
                isActive
                  ? "bg-white/10 border border-white/20"
                  : "hover:bg-white/5 border border-transparent hover:border-white/10"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300",
                isActive
                  ? "bg-white/10 border border-white/20"
                  : "bg-white/5 border border-white/10 group-hover:bg-white/10"
              )}>
                <Icon className={cn(
                  "w-4 h-4 transition-colors",
                  isActive ? "text-white" : "text-white/60 group-hover:text-white"
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-light transition-colors",
                  isActive ? "text-white" : "text-white/60 group-hover:text-white"
                )}>
                  {tool.name}
                </p>
                <p className="text-xs text-white/40 font-light mt-0.5 line-clamp-2">
                  {tool.description}
                </p>
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/5 p-4">
        <div className="rounded-xl bg-white/[0.02] border border-white/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-white/60" />
            <p className="text-xs font-light text-white/60">Tecnologia IA</p>
          </div>
          <p className="text-xs text-white/40 font-light leading-relaxed">
            Ferramentas profissionais de vídeo com inteligência artificial
          </p>
        </div>
      </div>
    </div>
  )
}

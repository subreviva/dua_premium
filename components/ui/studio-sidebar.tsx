"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Music2,
  Mic2,
  FileText,
  Wand2,
  Sparkles,
  UserCircle,
  Piano,
  Scissors,
  FileAudio,
  Video,
  Image,
  DollarSign,
  Info,
  Settings2,
  PlusCircle,
  X,
} from "lucide-react"

interface StudioSidebarProps {
  isOpen: boolean
  onToggleOpen: (open: boolean) => void
  selectedTool?: string
  onSelectTool?: (tool: string) => void
}

const studioTools = [
  {
    id: "generate",
    name: "Criar Música",
    icon: Music2,
    description: "Gera música de texto",
    credits: 12,
  },
  {
    id: "upload-extend",
    name: "Melodia para Música",
    icon: Mic2,
    description: "Transforma melodia em música",
    credits: 12,
  },
  {
    id: "extend",
    name: "Estender Música",
    icon: Wand2,
    description: "Prolonga músicas",
    credits: 12,
  },
  {
    id: "cover",
    name: "Fazer Cover",
    icon: Sparkles,
    description: "Novo estilo para música",
    credits: 12,
  },
  {
    id: "add-vocals",
    name: "Adicionar Vocal",
    icon: UserCircle,
    description: "Adiciona voz gerada",
    credits: 12,
  },
  {
    id: "add-instrumental",
    name: "Adicionar Instrumental",
    icon: Piano,
    description: "Cria acompanhamento",
    credits: 12,
  },
  {
    id: "separate-vocals",
    name: "Separar Vocal",
    icon: Scissors,
    description: "Isola voz e instrumental",
    credits: 10,
  },
  {
    id: "generate-lyrics",
    name: "Gerar Letras",
    icon: FileText,
    description: "Cria letras originais",
    credits: 0.4,
  },
  {
    id: "timestamped-lyrics",
    name: "Letras Sincronizadas",
    icon: FileText,
    description: "Letras com timestamp",
    credits: 0.5,
  },
  {
    id: "convert-wav",
    name: "Converter para WAV",
    icon: FileAudio,
    description: "Exporta em WAV",
    credits: 0.4,
  },
  {
    id: "boost-style",
    name: "Intensificar Estilo",
    icon: Sparkles,
    description: "Reforça género musical",
    credits: 0.4,
  },
  {
    id: "create-video",
    name: "Criar Vídeo Musical",
    icon: Video,
    description: "Gera vídeo automático",
    credits: 2,
  },
  {
    id: "generate-cover",
    name: "Gerar Capa",
    icon: Image,
    description: "Cria artwork de álbum",
    credits: 0,
  },
  {
    id: "get-details",
    name: "Ver Detalhes",
    icon: Info,
    description: "Info sobre música",
    credits: 0,
  },
  {
    id: "check-credits",
    name: "Consultar Créditos",
    icon: DollarSign,
    description: "Verifica saldo",
    credits: 0,
  },
]

export function StudioSidebar({
  isOpen,
  onToggleOpen,
  selectedTool = "generate",
  onSelectTool,
}: StudioSidebarProps) {
  return (
    <>
      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 bottom-0 z-[60]",
          "bg-black/95 backdrop-blur-2xl border-r border-white/10",
          "transition-all duration-300 ease-in-out",
          "flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "w-[280px] lg:w-[320px]"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Music2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Estúdio DUA</h2>
              <p className="text-xs text-white/50">15 ferramentas</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleOpen(false)}
            className="lg:hidden text-white/70 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* New Creation Button */}
        <div className="p-4 border-b border-white/10">
          <Button
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
            size="lg"
            onClick={() => onSelectTool?.("generate")}
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Nova Criação
          </Button>
        </div>

        {/* Tools List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 premium-scrollbar">
          <div className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3 px-2">
            Ferramentas Suno API
          </div>
          {studioTools.map((tool) => {
            const Icon = tool.icon
            const isSelected = selectedTool === tool.id
            
            return (
              <button
                key={tool.id}
                onClick={() => onSelectTool?.(tool.id)}
                className={cn(
                  "w-full flex items-start gap-3 p-3 rounded-xl transition-all duration-200",
                  "hover:bg-white/5 group",
                  isSelected && "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all",
                    isSelected
                      ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white"
                      : "bg-white/5 text-white/70 group-hover:bg-white/10 group-hover:text-white"
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <div className={cn(
                    "font-medium text-sm transition-colors flex items-center justify-between gap-2",
                    isSelected ? "text-white" : "text-white/90 group-hover:text-white"
                  )}>
                    <span>{tool.name}</span>
                    {tool.credits > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                        {tool.credits}
                      </span>
                    )}
                    {tool.credits === 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-300">
                        FREE
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-white/50 mt-0.5">
                    {tool.description}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Settings */}
        <div className="p-4 border-t border-white/10">
          <Button
            variant="ghost"
            className="w-full justify-start text-white/70 hover:text-white hover:bg-white/5"
          >
            <Settings2 className="w-5 h-5 mr-3" />
            Configurações
          </Button>
        </div>
      </div>
    </>
  )
}

"use client"

/**
 * Design Toolbar
 * Barra lateral esquerda com ferramentas de design
 */

import { ToolId } from "@/types/designstudio"
import {
  ImageIcon,
  Wand2,
  Sparkles,
  Palette,
  FileText,
  Grid3x3,
  Copy,
  Eye,
  TrendingUp,
  MessageSquare,
  Download,
} from "lucide-react"
import { cn } from "@/lib/utils"

const TOOLS = [
  {
    id: 'generate-image' as ToolId,
    name: 'Gerar Imagem',
    icon: ImageIcon,
    category: 'create',
  },
  {
    id: 'edit-image' as ToolId,
    name: 'Editar Imagem',
    icon: Wand2,
    category: 'edit',
  },
  {
    id: 'generate-logo' as ToolId,
    name: 'Gerar Logo',
    icon: Sparkles,
    category: 'create',
  },
  {
    id: 'generate-icon' as ToolId,
    name: 'Gerar Ícone',
    icon: Grid3x3,
    category: 'create',
  },
  {
    id: 'generate-svg' as ToolId,
    name: 'Gerar Vetor',
    icon: FileText,
    category: 'create',
  },
  {
    id: 'color-palette' as ToolId,
    name: 'Paleta de Cores',
    icon: Palette,
    category: 'analyze',
  },
  {
    id: 'generate-pattern' as ToolId,
    name: 'Gerar Padrão',
    icon: Grid3x3,
    category: 'create',
  },
  {
    id: 'generate-variations' as ToolId,
    name: 'Variações',
    icon: Copy,
    category: 'edit',
  },
  {
    id: 'analyze-image' as ToolId,
    name: 'Analisar Imagem',
    icon: Eye,
    category: 'analyze',
  },
  {
    id: 'design-trends' as ToolId,
    name: 'Tendências',
    icon: TrendingUp,
    category: 'analyze',
  },
  {
    id: 'design-assistant' as ToolId,
    name: 'Assistente',
    icon: MessageSquare,
    category: 'analyze',
  },
  {
    id: 'export-project' as ToolId,
    name: 'Exportar',
    icon: Download,
    category: 'export',
  },
]

interface DesignToolbarProps {
  activeTool: ToolId | null
  onToolSelect: (toolId: ToolId) => void
}

export function DesignToolbar({ activeTool, onToolSelect }: DesignToolbarProps) {
  return (
    <nav className="flex flex-col items-center bg-black/40 backdrop-blur-xl border-r border-white/10 p-4 space-y-2 w-20 relative z-20">
      {/* Logo */}
      <div className="mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
      </div>

      {/* Tools */}
      <div className="flex-1 flex flex-col space-y-2 w-full overflow-y-auto custom-scrollbar">
        {TOOLS.map((tool) => {
          const Icon = tool.icon
          const isActive = activeTool === tool.id
          
          return (
            <button
              key={tool.id}
              onClick={() => onToolSelect(tool.id)}
              title={tool.name}
              className={cn(
                "p-3 rounded-xl transition-all duration-200 group relative",
                isActive
                  ? "bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/50"
                  : "hover:bg-white/5 border border-transparent"
              )}
            >
              <Icon 
                className={cn(
                  "h-5 w-5 transition-colors",
                  isActive 
                    ? "text-purple-400" 
                    : "text-gray-400 group-hover:text-white"
                )} 
              />
              
              {/* Tooltip */}
              <div className="absolute left-full ml-2 px-3 py-2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                {tool.name}
              </div>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

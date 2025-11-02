'use client';

import React from 'react';
import { ToolId } from '@/types/designstudio';
import { 
  ImagePlus, 
  Wand2, 
  Sparkles, 
  Boxes, 
  Code2, 
  Grid3x3, 
  Package, 
  Film, 
  Palette, 
  Copy, 
  ScanEye, 
  TrendingUp, 
  Bot 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ToolbarProps {
  activeTool: ToolId | null;
  onToolSelect: (toolId: ToolId) => void;
}

const TOOL_ICONS: Record<ToolId, React.ReactNode> = {
  'generate-image': <ImagePlus className="w-5 h-5" />,
  'edit-image': <Wand2 className="w-5 h-5" />,
  'generate-logo': <Sparkles className="w-5 h-5" />,
  'generate-icon': <Boxes className="w-5 h-5" />,
  'generate-svg': <Code2 className="w-5 h-5" />,
  'generate-pattern': <Grid3x3 className="w-5 h-5" />,
  'product-mockup': <Package className="w-5 h-5" />,
  'color-palette': <Palette className="w-5 h-5" />,
  'generate-variations': <Copy className="w-5 h-5" />,
  'analyze-image': <ScanEye className="w-5 h-5" />,
  'design-trends': <TrendingUp className="w-5 h-5" />,
  'design-assistant': <Bot className="w-5 h-5" />,
  'export-project': <Package className="w-5 h-5" />,
};

const TOOL_NAMES: Record<ToolId, string> = {
  'generate-image': 'Gerar Imagem',
  'edit-image': 'Editar Imagem',
  'generate-logo': 'Gerar Logo',
  'generate-icon': 'Gerar Ícone',
  'generate-svg': 'Gerar SVG',
  'generate-pattern': 'Gerar Padrão',
  'product-mockup': 'Mockup Produto',
  'color-palette': 'Paleta Cores',
  'generate-variations': 'Variações',
  'analyze-image': 'Analisar Imagem',
  'design-trends': 'Tendências',
  'design-assistant': 'Assistente',
  'export-project': 'Exportar',
};

const Toolbar: React.FC<ToolbarProps> = ({ activeTool, onToolSelect }) => {
  return (
    <>
      {/* Mobile: iOS Premium Horizontal Toolbar */}
      <nav className="md:hidden flex items-center bg-black/80 backdrop-blur-3xl border-b border-white/5 px-4 py-3 overflow-x-auto overflow-y-hidden scrollbar-hide shadow-2xl shadow-black/60">
        {/* Logo Mobile - iOS Style */}
        <div className="flex-shrink-0 mr-4">
          <div className="relative">
            <Image
              src="/dua-logo.png"
              alt="DUA"
              width={44}
              height={44}
              className="h-11 w-auto object-contain drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
            />
          </div>
        </div>

        {/* Divider - iOS Style */}
        <div className="h-10 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent flex-shrink-0 mr-4" />

        {/* Tools Horizontal Scroll - iOS Premium */}
        <div className="flex items-center gap-2 flex-1 overflow-x-auto scrollbar-hide">
          {(Object.keys(TOOL_ICONS) as ToolId[]).map((toolId) => (
            <button
              key={toolId}
              onClick={() => onToolSelect(toolId)}
              aria-label={TOOL_NAMES[toolId]}
              className={cn(
                'relative flex-shrink-0 group',
                'transition-all duration-300 ease-out',
                'active:scale-90 active:transition-transform active:duration-100'
              )}
            >
              {/* iOS Premium Button */}
              <div className={cn(
                'relative p-3.5 rounded-2xl',
                'transition-all duration-300',
                'border shadow-lg',
                activeTool === toolId
                  ? [
                      'bg-gradient-to-br from-blue-500/40 via-blue-600/30 to-purple-500/40',
                      'border-blue-400/40',
                      'shadow-[0_0_20px_rgba(59,130,246,0.4)]',
                      'text-white',
                    ]
                  : [
                      'bg-white/5 backdrop-blur-xl',
                      'border-white/10',
                      'hover:bg-white/10 hover:border-white/20',
                      'text-white/70 hover:text-white',
                      'shadow-black/20',
                    ]
              )}>
                <div className={cn(
                  'transition-transform duration-200',
                  activeTool === toolId ? 'scale-110' : 'scale-100'
                )}>
                  {TOOL_ICONS[toolId]}
                </div>
              </div>

              {/* Active Indicator - iOS Style Dot */}
              {activeTool === toolId && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Desktop: Vertical Toolbar */}
      <nav className="hidden md:flex flex-col items-center bg-black/40 backdrop-blur-xl border-r border-white/5 p-3 space-y-2 min-w-[80px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {/* Logo Desktop */}
        <div className="mb-4 mt-2 flex-shrink-0">
          <Image
            src="/dua-logo.png"
            alt="DUA"
            width={60}
            height={60}
            className="h-12 w-auto object-contain opacity-90"
          />
        </div>

        {/* Divider */}
        <div className="w-12 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-2 flex-shrink-0" />

        {/* Tools */}
        {(Object.keys(TOOL_ICONS) as ToolId[]).map((toolId) => (
          <button
            key={toolId}
            onClick={() => onToolSelect(toolId)}
            aria-label={TOOL_NAMES[toolId]}
            title={TOOL_NAMES[toolId]}
            className={cn(
              'group relative p-3 rounded-xl transition-all duration-300 flex-shrink-0',
              'hover:scale-105 active:scale-95',
              activeTool === toolId
                ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-white shadow-lg shadow-blue-500/20 border border-white/20'
                : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10'
            )}
          >
            {TOOL_ICONS[toolId]}
            
            {/* Tooltip */}
            <span className="absolute left-full ml-3 px-3 py-1.5 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 border border-white/10">
              {TOOL_NAMES[toolId]}
            </span>

            {/* Active indicator */}
            {activeTool === toolId && (
              <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full" />
            )}
          </button>
        ))}
      </nav>
    </>
  );
};

export default React.memo(Toolbar);

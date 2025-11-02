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
      {/* Mobile: Horizontal Toolbar */}
      <nav className="md:hidden flex items-center bg-black/95 backdrop-blur-xl border-b border-white/10 px-2 py-2 overflow-x-auto overflow-y-hidden scrollbar-hide shadow-lg shadow-black/50">
        {/* Logo Mobile */}
        <div className="flex-shrink-0 mr-3 pl-1">
          <Image
            src="/dua-logo.png"
            alt="DUA"
            width={40}
            height={40}
            className="h-10 w-auto object-contain opacity-90"
          />
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent flex-shrink-0 mr-3" />

        {/* Tools Horizontal Scroll */}
        <div className="flex items-center space-x-2 flex-1 overflow-x-auto scrollbar-hide">
          {(Object.keys(TOOL_ICONS) as ToolId[]).map((toolId) => (
            <button
              key={toolId}
              onClick={() => onToolSelect(toolId)}
              aria-label={TOOL_NAMES[toolId]}
              className={cn(
                'flex-shrink-0 p-2.5 rounded-xl transition-all duration-300',
                'active:scale-95',
                activeTool === toolId
                  ? 'bg-gradient-to-br from-blue-500/30 to-purple-500/30 text-white shadow-lg shadow-blue-500/30 border-2 border-blue-400/50'
                  : 'text-white/60 active:text-white bg-white/5 border border-white/10'
              )}
            >
              {TOOL_ICONS[toolId]}
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

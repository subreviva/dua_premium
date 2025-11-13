'use client';

import React from 'react';
import { ToolId } from '@/types/designstudio';
import { 
  ImagePlus, 
  Wand2, 
  Boxes, 
  Code2, 
  Grid3x3, 
  Package, 
  Film, 
  Palette, 
  Copy, 
  ScanEye, 
  TrendingUp, 
  Bot,
  Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ToolbarProps {
  activeTool: ToolId | null;
  onToolSelect: (toolId: ToolId) => void;
  onMenuClick?: () => void;
}

const TOOL_ICONS: Record<ToolId, React.ReactNode> = {
  'generate-image': <ImagePlus className="w-5 h-5" strokeWidth={0.75} />,
  'edit-image': <Wand2 className="w-5 h-5" strokeWidth={0.75} />,
  'generate-logo': <Wand2 className="w-5 h-5" strokeWidth={0.75} />,
  'generate-icon': <Boxes className="w-5 h-5" strokeWidth={0.75} />,
  'generate-svg': <Code2 className="w-5 h-5" strokeWidth={0.75} />,
  'generate-pattern': <Grid3x3 className="w-5 h-5" strokeWidth={0.75} />,
  'product-mockup': <Package className="w-5 h-5" strokeWidth={0.75} />,
  'color-palette': <Palette className="w-5 h-5" strokeWidth={0.75} />,
  'generate-variations': <Copy className="w-5 h-5" strokeWidth={0.75} />,
  'analyze-image': <ScanEye className="w-5 h-5" strokeWidth={0.75} />,
  'design-trends': <TrendingUp className="w-5 h-5" strokeWidth={0.75} />,
  'design-assistant': <Bot className="w-5 h-5" strokeWidth={0.75} />,
  'export-project': <Package className="w-5 h-5" strokeWidth={0.75} />,
  'remove-background': <Wand2 className="w-5 h-5" strokeWidth={0.75} />,
  'upscale-image': <Wand2 className="w-5 h-5" strokeWidth={0.75} />,
  'gemini-flash-image': <Wand2 className="w-5 h-5 text-orange-500" strokeWidth={0.75} />,
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
  'remove-background': 'Remover Fundo',
  'upscale-image': 'Upscale',
  'gemini-flash-image': 'Gerar Imagem (5 créditos)',
};

// Categorias iOS - Agrupamento inteligente
const TOOL_CATEGORIES = [
  {
    id: 'create',
    name: 'Criar',
    icon: <Wand2 className="w-5 h-5" strokeWidth={0.75} />,
    tools: ['gemini-flash-image', 'generate-image', 'generate-logo', 'generate-icon', 'generate-svg', 'generate-pattern'] as ToolId[],
  },
  {
    id: 'edit',
    name: 'Editar',
    icon: <Wand2 className="w-5 h-5" />,
    tools: ['edit-image', 'generate-variations', 'color-palette', 'remove-background', 'upscale-image'] as ToolId[],
  },
  {
    id: 'tools',
    name: 'Ferramentas',
    icon: <Package className="w-5 h-5" />,
    tools: ['product-mockup', 'analyze-image', 'export-project'] as ToolId[],
  },
  {
    id: 'ai',
    name: 'IA',
    icon: <Bot className="w-5 h-5" />,
    tools: ['design-trends', 'design-assistant'] as ToolId[],
  },
];

const Toolbar: React.FC<ToolbarProps> = ({ activeTool, onToolSelect, onMenuClick }) => {
  return (
    <>
      {/* Mobile: iOS ULTRA Premium Compact Toolbar */}
      <nav className="md:hidden flex items-center justify-between bg-black/80 backdrop-blur-2xl border-b border-white/[0.08] px-3 py-2">
        {/* Logo + Title - iOS Style Compact */}
        <div className="flex items-center gap-2.5">
          <Image
            src="/dua-logo.png"
            alt="DUA"
            width={32}
            height={32}
            className="h-8 w-auto object-contain"
          />
          <div className="flex flex-col">
            <h1 className="text-white font-semibold text-sm leading-tight tracking-tight">Design Studio</h1>
            {activeTool && (
              <span className="text-orange-500/70 text-[10px] leading-tight">{TOOL_NAMES[activeTool]}</span>
            )}
          </div>
        </div>

        {/* Menu Button - iOS Premium Compact */}
        <button
          onClick={onMenuClick}
          className={cn(
            "relative p-2 rounded-xl transition-all active:scale-90",
            "bg-transparent hover:bg-white/[0.03] backdrop-blur-xl",
            "border border-white/[0.08] hover:border-orange-500/30"
          )}
        >
          <Menu className="w-4.5 h-4.5 text-white/90" strokeWidth={0.75} />
          {activeTool && (
            <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-orange-500 rounded-full shadow-[0_0_6px_rgba(249,115,22,0.8)]" />
          )}
        </button>
      </nav>

      {/* Desktop: Vertical Toolbar */}
      <nav className="hidden md:flex flex-col items-center bg-black/40 backdrop-blur-xl border-r border-white/[0.05] p-3 space-y-2 min-w-[80px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
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
        <div className="w-12 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent my-2 flex-shrink-0" />

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
                ? 'bg-orange-500/10 text-orange-500 border border-orange-500/30'
                : 'text-white/60 hover:text-white hover:bg-white/[0.03] border border-transparent hover:border-white/[0.08]'
            )}
          >
            {TOOL_ICONS[toolId]}
            
            {/* Tooltip */}
            <span className="absolute left-full ml-3 px-3 py-1.5 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 border border-white/[0.08]">
              {TOOL_NAMES[toolId]}
            </span>

            {/* Active indicator */}
            {activeTool === toolId && (
              <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-orange-500 rounded-full" />
            )}
          </button>
        ))}
      </nav>
    </>
  );
};

export default React.memo(Toolbar);

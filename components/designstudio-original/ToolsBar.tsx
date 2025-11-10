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
  Palette, 
  Copy, 
  ScanEye, 
  TrendingUp, 
  Bot,
  Layers,
  Maximize2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolsBarProps {
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
  'export-project': <ImagePlus className="w-5 h-5" />,
  'remove-background': <Layers className="w-5 h-5" />,
  'upscale-image': <Maximize2 className="w-5 h-5" />,
};

const TOOL_NAMES: Record<ToolId, string> = {
  'generate-image': 'Gerar',
  'edit-image': 'Editar',
  'generate-logo': 'Logo',
  'generate-icon': 'Ícone',
  'generate-svg': 'SVG',
  'generate-pattern': 'Padrão',
  'product-mockup': 'Mockup',
  'color-palette': 'Cores',
  'generate-variations': 'Variações',
  'analyze-image': 'Analisar',
  'design-trends': 'Trends',
  'design-assistant': 'IA',
  'export-project': 'Export',
  'remove-background': 'Remover BG',
  'upscale-image': 'Upscale',
};

const ALL_TOOLS: ToolId[] = [
  'generate-image',
  'generate-logo',
  'generate-icon',
  'generate-svg',
  'generate-pattern',
  'edit-image',
  'remove-background',
  'upscale-image',
  'generate-variations',
  'color-palette',
  'product-mockup',
  'analyze-image',
  'design-trends',
  'design-assistant',
  'export-project',
];

const ToolsBar: React.FC<ToolsBarProps> = ({ activeTool, onToolSelect }) => {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  
  // Auto-scroll para ferramenta ativa quando muda
  React.useEffect(() => {
    if (activeTool && scrollContainerRef.current) {
      const activeButton = scrollContainerRef.current.querySelector(`[data-tool="${activeTool}"]`);
      if (activeButton) {
        activeButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeTool]);
  
  return (
    <div className="w-full bg-black/98 backdrop-blur-3xl border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.6)]">
      <div 
        ref={scrollContainerRef}
        className="flex gap-2 px-3 py-2.5 overflow-x-auto scrollbar-hide scroll-smooth"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {ALL_TOOLS.map((toolId) => {
          const isActive = activeTool === toolId;
          
          return (
            <button
              key={toolId}
              data-tool={toolId}
              onClick={() => onToolSelect(toolId)}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 min-w-[72px] px-3 py-2.5 rounded-2xl transition-all flex-shrink-0",
                "active:scale-95 touch-manipulation",
                isActive
                  ? "bg-gradient-to-br from-blue-500/35 via-blue-600/25 to-purple-500/35 border-2 border-blue-400/60 shadow-lg shadow-blue-500/30"
                  : "bg-white/8 hover:bg-white/12 border-2 border-white/10 hover:border-white/20"
              )}
            >
              <div className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                isActive 
                  ? "bg-gradient-to-br from-blue-500/50 to-purple-500/50 text-white scale-110 shadow-lg" 
                  : "bg-white/10 text-white/70"
              )}>
                {TOOL_ICONS[toolId]}
              </div>
              <span className={cn(
                "text-[10px] font-bold leading-tight text-center tracking-tight whitespace-nowrap",
                isActive ? "text-white" : "text-white/70"
              )}>
                {TOOL_NAMES[toolId]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ToolsBar;

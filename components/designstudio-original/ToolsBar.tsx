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
  'export-project': <ImagePlus className="w-5 h-5" strokeWidth={0.75} />,
  'remove-background': <Layers className="w-5 h-5" strokeWidth={0.75} />,
  'upscale-image': <Maximize2 className="w-5 h-5" strokeWidth={0.75} />,
  'gemini-flash-image': <Wand2 className="w-5 h-5 text-orange-500" strokeWidth={0.75} />,
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
  'gemini-flash-image': 'Gerar',
};

const ALL_TOOLS: ToolId[] = [
  'gemini-flash-image',
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
    <div className="w-full bg-black/80 backdrop-blur-2xl border-t border-white/[0.08]">
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
                  ? "bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500/20"
                  : "bg-transparent border border-white/[0.06] hover:bg-white/[0.03] hover:border-white/[0.1]"
              )}
            >
              <div className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                isActive 
                  ? "bg-transparent text-orange-500" 
                  : "bg-transparent text-white/70"
              )}>
                {TOOL_ICONS[toolId]}
              </div>
              <span className={cn(
                "text-[10px] font-medium leading-tight text-center tracking-tight whitespace-nowrap",
                isActive ? "text-orange-500" : "text-white/70"
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

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
  Bot
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
  'export-project': <Package className="w-5 h-5" />,
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
};

const ALL_TOOLS: ToolId[] = [
  'generate-image',
  'generate-logo',
  'generate-icon',
  'generate-svg',
  'generate-pattern',
  'edit-image',
  'generate-variations',
  'color-palette',
  'product-mockup',
  'analyze-image',
  'design-trends',
  'design-assistant',
  'export-project',
];

const ToolsBar: React.FC<ToolsBarProps> = ({ activeTool, onToolSelect }) => {
  return (
    <div className="w-full bg-black/98 backdrop-blur-3xl border-t border-white/10 shadow-[0_-2px_15px_rgba(0,0,0,0.6)]">
      <div 
        className="flex gap-2 px-2.5 py-2 overflow-x-auto scrollbar-hide scroll-smooth"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {ALL_TOOLS.map((toolId) => {
          const isActive = activeTool === toolId;
          
          return (
            <button
              key={toolId}
              onClick={() => onToolSelect(toolId)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[64px] p-2 rounded-xl transition-all flex-shrink-0",
                "active:scale-95",
                isActive
                  ? "bg-gradient-to-br from-blue-500/30 via-blue-600/20 to-purple-500/30 border border-blue-400/50 shadow-lg shadow-blue-500/25"
                  : "bg-white/5 hover:bg-white/8 border border-white/10"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                isActive 
                  ? "bg-gradient-to-br from-blue-500/40 to-purple-500/40 text-white scale-105" 
                  : "bg-white/10 text-white/70"
              )}>
                {TOOL_ICONS[toolId]}
              </div>
              <span className={cn(
                "text-[9px] font-semibold leading-tight text-center tracking-tight",
                isActive ? "text-white" : "text-white/60"
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

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
    <div className="w-full bg-black/95 backdrop-blur-3xl border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
      <div 
        className="flex gap-2 px-3 py-3 overflow-x-auto scrollbar-hide scroll-smooth"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {ALL_TOOLS.map((toolId) => {
          const isActive = activeTool === toolId;
          
          return (
            <button
              key={toolId}
              onClick={() => onToolSelect(toolId)}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 min-w-[70px] p-2.5 rounded-xl transition-all flex-shrink-0",
                "active:scale-95",
                isActive
                  ? "bg-gradient-to-br from-blue-500/30 via-blue-600/20 to-purple-500/30 border border-blue-400/40 shadow-lg shadow-blue-500/20"
                  : "bg-white/5 hover:bg-white/10 border border-white/10"
              )}
            >
              <div className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center transition-all",
                isActive 
                  ? "bg-gradient-to-br from-blue-500/40 to-purple-500/40 text-white scale-110" 
                  : "bg-white/10 text-white/70"
              )}>
                {TOOL_ICONS[toolId]}
              </div>
              <span className={cn(
                "text-[10px] font-medium leading-tight text-center",
                isActive ? "text-white" : "text-white/60"
              )}>
                {TOOL_NAMES[toolId]}
              </span>
              {isActive && (
                <div className="w-1 h-1 bg-blue-400 rounded-full shadow-[0_0_6px_rgba(59,130,246,0.8)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ToolsBar;

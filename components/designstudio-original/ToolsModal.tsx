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
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  'design-assistant': 'Assistente IA',
  'export-project': 'Exportar',
};

const TOOL_CATEGORIES = [
  {
    id: 'create',
    name: 'Criar',
    icon: <Sparkles className="w-4 h-4 text-blue-400" />,
    tools: ['generate-image', 'generate-logo', 'generate-icon', 'generate-svg', 'generate-pattern'] as ToolId[],
  },
  {
    id: 'edit',
    name: 'Editar',
    icon: <Wand2 className="w-4 h-4 text-purple-400" />,
    tools: ['edit-image', 'generate-variations', 'color-palette'] as ToolId[],
  },
  {
    id: 'tools',
    name: 'Ferramentas',
    icon: <Package className="w-4 h-4 text-cyan-400" />,
    tools: ['product-mockup', 'analyze-image', 'export-project'] as ToolId[],
  },
  {
    id: 'ai',
    name: 'IA',
    icon: <Bot className="w-4 h-4 text-pink-400" />,
    tools: ['design-trends', 'design-assistant'] as ToolId[],
  },
];

const ToolsModal: React.FC<ToolsModalProps> = ({ isOpen, onClose, activeTool, onToolSelect }) => {
  const handleToolSelect = (toolId: ToolId) => {
    onToolSelect(toolId);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[9999] bg-black/96 backdrop-blur-3xl"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 35, stiffness: 400 }}
            className="h-full flex flex-col max-w-lg mx-auto"
            style={{ 
              paddingTop: 'calc(env(safe-area-inset-top) + 1rem)',
              paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)',
              paddingLeft: '1rem',
              paddingRight: '1rem'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - iOS Clean */}
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
              <h2 className="text-white font-bold text-2xl tracking-tight">Ferramentas</h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/15 active:scale-90 transition-all flex items-center justify-center border border-white/10"
              >
                <X className="w-5 h-5 text-white/90" />
              </button>
            </div>

            {/* Tools Grid - iOS Premium Card Style */}
            <div className="flex-1 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
              <div className="grid grid-cols-3 gap-3 pb-6">
                {TOOL_CATEGORIES.map((category) => (
                  category.tools.map((toolId) => {
                    const isActive = activeTool === toolId;
                    
                    const categoryColors = {
                      create: {
                        active: "from-blue-500/25 to-purple-500/25 border-blue-400/50",
                        icon: "from-blue-500/40 to-purple-500/40",
                        glow: "shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                      },
                      edit: {
                        active: "from-purple-500/25 to-pink-500/25 border-purple-400/50",
                        icon: "from-purple-500/40 to-pink-500/40",
                        glow: "shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                      },
                      tools: {
                        active: "from-cyan-500/25 to-blue-500/25 border-cyan-400/50",
                        icon: "from-cyan-500/40 to-blue-500/40",
                        glow: "shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                      },
                      ai: {
                        active: "from-pink-500/25 to-rose-500/25 border-pink-400/50",
                        icon: "from-pink-500/40 to-rose-500/40",
                        glow: "shadow-[0_0_20px_rgba(244,114,182,0.3)]"
                      }
                    }[category.id] || {
                      active: "from-gray-500/25 to-gray-600/25 border-gray-400/50",
                      icon: "from-gray-500/40 to-gray-600/40",
                      glow: "shadow-[0_0_20px_rgba(128,128,128,0.3)]"
                    };

                    return (
                      <button
                        key={toolId}
                        onClick={() => handleToolSelect(toolId)}
                        className={cn(
                          "flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl transition-all",
                          "active:scale-95 min-h-[110px]",
                          isActive
                            ? `bg-gradient-to-br ${categoryColors.active} border-2 ${categoryColors.glow}`
                            : "bg-white/5 hover:bg-white/10 border-2 border-white/10 hover:border-white/20"
                        )}
                      >
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                          isActive 
                            ? `bg-gradient-to-br ${categoryColors.icon} scale-110` 
                            : "bg-white/10"
                        )}>
                          <div className={cn(
                            "transition-all",
                            isActive ? "text-white" : "text-white/70"
                          )}>
                            {TOOL_ICONS[toolId]}
                          </div>
                        </div>
                        <span className={cn(
                          "text-xs font-semibold text-center leading-tight px-1",
                          isActive ? "text-white" : "text-white/70"
                        )}>
                          {TOOL_NAMES[toolId]}
                        </span>
                      </button>
                    );
                  })
                ))}
              </div>
            </div>

            {/* Footer - iOS Native */}
            <div className="pt-4 flex-shrink-0">
              <button
                onClick={onClose}
                className="w-full py-4 bg-white/10 hover:bg-white/15 active:bg-white/20 rounded-2xl text-white font-semibold text-base transition-all active:scale-98 border border-white/10"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ToolsModal;

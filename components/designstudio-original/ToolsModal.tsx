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
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-2xl"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="h-full flex flex-col"
            style={{ 
              paddingTop: 'env(safe-area-inset-top)',
              paddingBottom: 'env(safe-area-inset-bottom)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-black/40 backdrop-blur-xl flex-shrink-0">
              <h2 className="text-white font-semibold text-xl">Ferramentas</h2>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 transition-all flex items-center justify-center"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Tools List - iOS Premium Flat List */}
            <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
              <div className="px-4 py-4">
                {TOOL_CATEGORIES.map((category, idx) => (
                  <div key={category.id} className={cn("mb-6", idx === TOOL_CATEGORIES.length - 1 && "mb-4")}>
                    <div className="flex items-center gap-2 px-2 mb-3">
                      {category.icon}
                      <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider">{category.name}</h3>
                    </div>
                    <div className="space-y-1.5">
                      {category.tools.map((toolId) => {
                        const isActive = activeTool === toolId;
                        const gradientColors = {
                          create: isActive ? "from-blue-500/20 to-purple-500/20 border-blue-400/40 shadow-blue-500/20" : "",
                          edit: isActive ? "from-purple-500/20 to-pink-500/20 border-purple-400/40 shadow-purple-500/20" : "",
                          tools: isActive ? "from-cyan-500/20 to-blue-500/20 border-cyan-400/40 shadow-cyan-500/20" : "",
                          ai: isActive ? "from-pink-500/20 to-rose-500/20 border-pink-400/40 shadow-pink-500/20" : "",
                        }[category.id];

                        const iconGradient = {
                          create: isActive ? "from-blue-500/30 to-purple-500/30" : "",
                          edit: isActive ? "from-purple-500/30 to-pink-500/30" : "",
                          tools: isActive ? "from-cyan-500/30 to-blue-500/30" : "",
                          ai: isActive ? "from-pink-500/30 to-rose-500/30" : "",
                        }[category.id];

                        const dotColor = {
                          create: "bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]",
                          edit: "bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]",
                          tools: "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]",
                          ai: "bg-pink-400 shadow-[0_0_8px_rgba(244,114,182,0.8)]",
                        }[category.id];

                        return (
                          <button
                            key={toolId}
                            onClick={() => handleToolSelect(toolId)}
                            className={cn(
                              "w-full flex items-center gap-3 p-3.5 rounded-xl transition-all",
                              "active:scale-98",
                              isActive
                                ? `bg-gradient-to-r ${gradientColors} border shadow-lg`
                                : "bg-white/5 hover:bg-white/8 border border-white/10"
                            )}
                          >
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center",
                              isActive ? `bg-gradient-to-br ${iconGradient}` : "bg-white/10"
                            )}>
                              {TOOL_ICONS[toolId]}
                            </div>
                            <span className={cn(
                              "font-medium text-base flex-1 text-left",
                              isActive ? "text-white" : "text-white/80"
                            )}>
                              {TOOL_NAMES[toolId]}
                            </span>
                            {isActive && (
                              <div className={cn("w-2 h-2 rounded-full", dotColor)} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-white/10 bg-black/40 backdrop-blur-xl flex-shrink-0">
              <button
                onClick={onClose}
                className="w-full py-3.5 bg-white/10 hover:bg-white/15 rounded-xl text-white font-medium transition-all active:scale-95"
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

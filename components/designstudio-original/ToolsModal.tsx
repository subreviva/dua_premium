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
  'gemini-flash-image': 'Gerar Imagem',
};

const TOOL_CATEGORIES = [
  {
    id: 'create',
    name: 'Criar',
    icon: <Wand2 className="w-4 h-4 text-orange-400" strokeWidth={0.75} />,
    tools: ['gemini-flash-image', 'generate-image', 'generate-logo', 'generate-icon', 'generate-svg', 'generate-pattern'] as ToolId[],
  },
  {
    id: 'edit',
    name: 'Editar',
    icon: <Wand2 className="w-4 h-4 text-orange-400" strokeWidth={0.75} />,
    tools: ['edit-image', 'generate-variations', 'color-palette', 'remove-background', 'upscale-image'] as ToolId[],
  },
  {
    id: 'tools',
    name: 'Ferramentas',
    icon: <Package className="w-4 h-4 text-orange-400" strokeWidth={0.75} />,
    tools: ['product-mockup', 'analyze-image', 'export-project'] as ToolId[],
  },
  {
    id: 'ai',
    name: 'IA',
    icon: <Bot className="w-4 h-4 text-orange-400" strokeWidth={0.75} />,
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
                className="w-10 h-10 rounded-full bg-transparent hover:bg-white/[0.05] active:scale-90 transition-all flex items-center justify-center border border-white/[0.08]"
              >
                <X className="w-5 h-5 text-white/90" strokeWidth={0.75} />
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
                        active: "from-orange-500/15 to-orange-600/15 border-orange-500/40",
                        icon: "from-orange-500/30 to-orange-600/30",
                        glow: "shadow-[0_0_15px_rgba(249,115,22,0.2)]"
                      },
                      edit: {
                        active: "from-orange-500/15 to-orange-600/15 border-orange-500/40",
                        icon: "from-orange-500/30 to-orange-600/30",
                        glow: "shadow-[0_0_15px_rgba(249,115,22,0.2)]"
                      },
                      tools: {
                        active: "from-orange-500/15 to-orange-600/15 border-orange-500/40",
                        icon: "from-orange-500/30 to-orange-600/30",
                        glow: "shadow-[0_0_15px_rgba(249,115,22,0.2)]"
                      },
                      ai: {
                        active: "from-orange-500/15 to-orange-600/15 border-orange-500/40",
                        icon: "from-orange-500/30 to-orange-600/30",
                        glow: "shadow-[0_0_15px_rgba(249,115,22,0.2)]"
                      }
                    }[category.id] || {
                      active: "from-white/5 to-white/10 border-white/[0.08]",
                      icon: "from-white/10 to-white/15",
                      glow: ""
                    };

                    return (
                      <button
                        key={toolId}
                        onClick={() => handleToolSelect(toolId)}
                        className={cn(
                          "flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl transition-all",
                          "active:scale-95 min-h-[110px]",
                          isActive
                            ? `bg-gradient-to-br ${categoryColors.active} border ${categoryColors.glow}`
                            : "bg-transparent hover:bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.1]"
                        )}
                      >
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                          isActive 
                            ? `bg-transparent text-orange-500 scale-110` 
                            : "bg-transparent text-white/70"
                        )}>
                          {TOOL_ICONS[toolId]}
                        </div>
                        <span className={cn(
                          "text-xs font-medium text-center leading-tight px-1",
                          isActive ? "text-orange-500" : "text-white/70"
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
                className="w-full py-4 bg-transparent hover:bg-white/[0.03] active:bg-white/[0.05] rounded-2xl text-white font-semibold text-base transition-all active:scale-98 border border-white/[0.08]"
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

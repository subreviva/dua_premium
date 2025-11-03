'use client';

import React, { useState } from 'react';
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
  Bot,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

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

// Categorias iOS - Agrupamento inteligente
const TOOL_CATEGORIES = [
  {
    id: 'create',
    name: 'Criar',
    icon: <Sparkles className="w-5 h-5" />,
    tools: ['generate-image', 'generate-logo', 'generate-icon', 'generate-svg', 'generate-pattern'] as ToolId[],
  },
  {
    id: 'edit',
    name: 'Editar',
    icon: <Wand2 className="w-5 h-5" />,
    tools: ['edit-image', 'generate-variations', 'color-palette'] as ToolId[],
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

const Toolbar: React.FC<ToolbarProps> = ({ activeTool, onToolSelect }) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleToolSelect = (toolId: ToolId) => {
    onToolSelect(toolId);
    setShowMobileMenu(false);
  };

  return (
    <>
      {/* Mobile: iOS ULTRA Premium Compact Toolbar */}
      <nav className="md:hidden flex items-center justify-between bg-black/90 backdrop-blur-3xl border-b border-white/10 px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        {/* Logo + Title - iOS Style */}
        <div className="flex items-center gap-3">
          <Image
            src="/dua-logo.png"
            alt="DUA"
            width={40}
            height={40}
            className="h-10 w-auto object-contain drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
          />
          <div className="flex flex-col">
            <h1 className="text-white font-semibold text-base leading-tight">Design Studio</h1>
            {activeTool && (
              <span className="text-white/50 text-xs">{TOOL_NAMES[activeTool]}</span>
            )}
          </div>
        </div>

        {/* Menu Button - iOS Premium */}
        <button
          onClick={() => setShowMobileMenu(true)}
          className={cn(
            "relative p-2.5 rounded-xl transition-all active:scale-90",
            "bg-white/10 hover:bg-white/20 backdrop-blur-xl",
            "border border-white/20 shadow-lg"
          )}
        >
          <Menu className="w-5 h-5 text-white" />
          {activeTool && (
            <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
          )}
        </button>
      </nav>

      {/* Mobile: iOS Premium Modal - Redesigned ULTRA CLEAN */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl"
            onClick={() => setShowMobileMenu(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="h-full flex flex-col safe-area"
              style={{ 
                paddingTop: 'env(safe-area-inset-top)',
                paddingBottom: 'env(safe-area-inset-bottom)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header - iOS Minimal */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-black/40 backdrop-blur-xl">
                <h2 className="text-white font-semibold text-xl">Ferramentas</h2>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 transition-all flex items-center justify-center"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Tools List - iOS Premium Flat List (NO accordion!) */}
              <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                <div className="px-4 py-4">
                  {/* Criar Section */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 px-2 mb-3">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider">Criar</h3>
                    </div>
                    <div className="space-y-1.5">
                      {TOOL_CATEGORIES[0].tools.map((toolId) => (
                        <button
                          key={toolId}
                          onClick={() => handleToolSelect(toolId)}
                          className={cn(
                            "w-full flex items-center gap-3 p-3.5 rounded-xl transition-all",
                            "active:scale-98",
                            activeTool === toolId
                              ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/40 shadow-lg shadow-blue-500/20"
                              : "bg-white/5 hover:bg-white/8 border border-white/10"
                          )}
                        >
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            activeTool === toolId
                              ? "bg-gradient-to-br from-blue-500/30 to-purple-500/30"
                              : "bg-white/10"
                          )}>
                            {TOOL_ICONS[toolId]}
                          </div>
                          <span className={cn(
                            "font-medium text-base flex-1 text-left",
                            activeTool === toolId ? "text-white" : "text-white/80"
                          )}>
                            {TOOL_NAMES[toolId]}
                          </span>
                          {activeTool === toolId && (
                            <div className="w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Editar Section */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 px-2 mb-3">
                      <Wand2 className="w-4 h-4 text-purple-400" />
                      <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider">Editar</h3>
                    </div>
                    <div className="space-y-1.5">
                      {TOOL_CATEGORIES[1].tools.map((toolId) => (
                        <button
                          key={toolId}
                          onClick={() => handleToolSelect(toolId)}
                          className={cn(
                            "w-full flex items-center gap-3 p-3.5 rounded-xl transition-all",
                            "active:scale-98",
                            activeTool === toolId
                              ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/40 shadow-lg shadow-purple-500/20"
                              : "bg-white/5 hover:bg-white/8 border border-white/10"
                          )}
                        >
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            activeTool === toolId
                              ? "bg-gradient-to-br from-purple-500/30 to-pink-500/30"
                              : "bg-white/10"
                          )}>
                            {TOOL_ICONS[toolId]}
                          </div>
                          <span className={cn(
                            "font-medium text-base flex-1 text-left",
                            activeTool === toolId ? "text-white" : "text-white/80"
                          )}>
                            {TOOL_NAMES[toolId]}
                          </span>
                          {activeTool === toolId && (
                            <div className="w-2 h-2 bg-purple-400 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ferramentas Section */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 px-2 mb-3">
                      <Package className="w-4 h-4 text-cyan-400" />
                      <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider">Ferramentas</h3>
                    </div>
                    <div className="space-y-1.5">
                      {TOOL_CATEGORIES[2].tools.map((toolId) => (
                        <button
                          key={toolId}
                          onClick={() => handleToolSelect(toolId)}
                          className={cn(
                            "w-full flex items-center gap-3 p-3.5 rounded-xl transition-all",
                            "active:scale-98",
                            activeTool === toolId
                              ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/40 shadow-lg shadow-cyan-500/20"
                              : "bg-white/5 hover:bg-white/8 border border-white/10"
                          )}
                        >
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            activeTool === toolId
                              ? "bg-gradient-to-br from-cyan-500/30 to-blue-500/30"
                              : "bg-white/10"
                          )}>
                            {TOOL_ICONS[toolId]}
                          </div>
                          <span className={cn(
                            "font-medium text-base flex-1 text-left",
                            activeTool === toolId ? "text-white" : "text-white/80"
                          )}>
                            {TOOL_NAMES[toolId]}
                          </span>
                          {activeTool === toolId && (
                            <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* IA Section */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 px-2 mb-3">
                      <Bot className="w-4 h-4 text-pink-400" />
                      <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider">IA</h3>
                    </div>
                    <div className="space-y-1.5">
                      {TOOL_CATEGORIES[3].tools.map((toolId) => (
                        <button
                          key={toolId}
                          onClick={() => handleToolSelect(toolId)}
                          className={cn(
                            "w-full flex items-center gap-3 p-3.5 rounded-xl transition-all",
                            "active:scale-98",
                            activeTool === toolId
                              ? "bg-gradient-to-r from-pink-500/20 to-rose-500/20 border border-pink-400/40 shadow-lg shadow-pink-500/20"
                              : "bg-white/5 hover:bg-white/8 border border-white/10"
                          )}
                        >
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            activeTool === toolId
                              ? "bg-gradient-to-br from-pink-500/30 to-rose-500/30"
                              : "bg-white/10"
                          )}>
                            {TOOL_ICONS[toolId]}
                          </div>
                          <span className={cn(
                            "font-medium text-base flex-1 text-left",
                            activeTool === toolId ? "text-white" : "text-white/80"
                          )}>
                            {TOOL_NAMES[toolId]}
                          </span>
                          {activeTool === toolId && (
                            <div className="w-2 h-2 bg-pink-400 rounded-full shadow-[0_0_8px_rgba(244,114,182,0.8)]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer - iOS Safe Area */}
              <div className="px-5 py-4 border-t border-white/10 bg-black/40 backdrop-blur-xl">
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="w-full py-3.5 bg-white/10 hover:bg-white/15 rounded-xl text-white font-medium transition-all active:scale-95"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

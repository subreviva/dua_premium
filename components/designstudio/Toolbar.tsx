'use client';

import React from 'react';
import { ImageIcon, Wand2, Sparkles, Box, Palette, ShoppingBag, Grid3x3, Copy, FileText, Eye, TrendingUp, MessageCircle, Download } from 'lucide-react';
import { ToolId } from '@/types/designstudio-full';

interface ToolbarProps {
  activeTool: ToolId | null;
  onToolSelect: (toolId: ToolId) => void;
}

const TOOLS = [
  { id: 'generate-image' as ToolId, name: 'Gerar Imagem', icon: ImageIcon },
  { id: 'edit-image' as ToolId, name: 'Editar Imagem', icon: Wand2 },
  { id: 'generate-logo' as ToolId, name: 'Gerar Logo', icon: Sparkles },
  { id: 'generate-icon' as ToolId, name: 'Gerar Ícone', icon: Box },
  { id: 'color-palette' as ToolId, name: 'Paleta de Cores', icon: Palette },
  { id: 'product-mockup' as ToolId, name: 'Mockup de Produto', icon: ShoppingBag },
  { id: 'generate-pattern' as ToolId, name: 'Gerar Padrão', icon: Grid3x3 },
  { id: 'generate-variations' as ToolId, name: 'Gerar Variações', icon: Copy },
  { id: 'generate-svg' as ToolId, name: 'Gerar SVG', icon: FileText },
  { id: 'analyze-image' as ToolId, name: 'Analisar Imagem', icon: Eye },
  { id: 'design-trends' as ToolId, name: 'Tendências Design', icon: TrendingUp },
  { id: 'design-assistant' as ToolId, name: 'Assistente Design', icon: MessageCircle },
  { id: 'export-project' as ToolId, name: 'Exportar Projeto', icon: Download },
];

const Toolbar: React.FC<ToolbarProps> = ({ activeTool, onToolSelect }) => {
  return (
    <nav className="flex flex-col items-center bg-black/40 backdrop-blur-md border-r border-white/10 p-4 space-y-4">
      <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-2xl mb-4 w-12 h-12 rounded-lg flex items-center justify-center">
        D
      </div>
      {TOOLS.map((tool) => {
        const Icon = tool.icon;
        return (
          <button
            key={tool.id}
            onClick={() => onToolSelect(tool.id)}
            aria-label={tool.name}
            title={tool.name}
            className={`p-3 rounded-lg transition-all duration-200 ${
              activeTool === tool.id
                ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg scale-110'
                : 'text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Icon size={20} />
          </button>
        );
      })}
    </nav>
  );
};

export default React.memo(Toolbar);

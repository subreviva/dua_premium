'use client';

import React, { useState } from 'react';
import ControlPanel from './ControlPanel';
import HistoryPanel from './HistoryPanel';
import SessionGallery from './SessionGallery';
import TemplateGallery, { Template } from './TemplateGallery';
import StylePresets, { useStylePresets, StylePreset } from './StylePresets';
import { ToolId, CanvasContent, ApiFunctions, ImageObject } from '@/types/designstudio';
import { Wrench, History, Sparkles, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidePanelTabsProps {
  activeTool: ToolId | null;
  canvasContent: CanvasContent;
  onContentUpdate: (content: CanvasContent) => void;
  api: ApiFunctions;
  isLoading: boolean;
  error: string | null;
  history: CanvasContent[];
  historyIndex: number;
  sessionGallery: ImageObject[];
  onUndo: () => void;
  onRedo: () => void;
  onSelectHistory: (content: CanvasContent) => void;
  onClearSession: () => void;
}

type Tab = 'tools' | 'templates' | 'styles' | 'history';

const SidePanelTabs: React.FC<SidePanelTabsProps> = (props) => {
  const [activeTab, setActiveTab] = useState<Tab>('tools');
  const { selectedStyles, toggleStyle, getStyleSuffixes } = useStylePresets();

  const handleTemplateSelect = (template: Template) => {
    // Aplicar template e voltar para a aba de ferramentas
    const enhancedPrompt = getStyleSuffixes() 
      ? `${template.prompt}, ${getStyleSuffixes()}`
      : template.prompt;
    
    // Aqui você pode adicionar lógica para aplicar o template
    // Por exemplo, atualizar o prompt input no ControlPanel
    setActiveTab('tools');
  };

  const handleStyleSelect = (style: StylePreset) => {
    toggleStyle(style);
  };

  return (
    <div className="flex flex-col h-full max-h-full">
      {/* Tabs - iOS Premium Style */}
      <div className="border-b border-white/5 bg-black/20 backdrop-blur-xl flex-shrink-0">
        <nav className="-mb-px flex gap-2 px-4 md:px-4 pt-4 md:pt-4 overflow-x-auto scrollbar-hide" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('tools')}
            className={cn(
              'flex items-center gap-2 px-4 md:px-4 py-2.5 md:py-2.5 rounded-xl font-medium text-sm transition-all duration-300 flex-shrink-0 border',
              'active:scale-95 active:transition-transform active:duration-100',
              activeTab === 'tools'
                ? 'bg-gradient-to-br from-blue-500/30 via-blue-600/20 to-purple-500/30 text-white border-blue-400/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                : 'text-white/60 hover:text-white bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 hover:border-white/20'
            )}
          >
            <Wrench className={cn(
              "w-4 h-4 transition-transform duration-200",
              activeTab === 'tools' ? "scale-110" : "scale-100"
            )} />
            <span className="whitespace-nowrap">Ferramentas</span>
          </button>
          
          <button
            onClick={() => setActiveTab('templates')}
            className={cn(
              'flex items-center gap-2 px-4 md:px-4 py-2.5 md:py-2.5 rounded-xl font-medium text-sm transition-all duration-300 flex-shrink-0 border',
              'active:scale-95 active:transition-transform active:duration-100',
              activeTab === 'templates'
                ? 'bg-gradient-to-br from-purple-500/30 via-purple-600/20 to-pink-500/30 text-white border-purple-400/30 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                : 'text-white/60 hover:text-white bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 hover:border-white/20'
            )}
          >
            <Sparkles className={cn(
              "w-4 h-4 transition-transform duration-200",
              activeTab === 'templates' ? "scale-110" : "scale-100"
            )} />
            <span className="whitespace-nowrap">Templates</span>
          </button>
          
          <button
            onClick={() => setActiveTab('styles')}
            className={cn(
              'flex items-center gap-2 px-4 md:px-4 py-2.5 md:py-2.5 rounded-xl font-medium text-sm transition-all duration-300 flex-shrink-0 border',
              'active:scale-95 active:transition-transform active:duration-100',
              activeTab === 'styles'
                ? 'bg-gradient-to-br from-pink-500/30 via-pink-600/20 to-purple-500/30 text-white border-pink-400/30 shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                : 'text-white/60 hover:text-white bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 hover:border-white/20'
            )}
          >
            <Palette className={cn(
              "w-4 h-4 transition-transform duration-200",
              activeTab === 'styles' ? "scale-110" : "scale-100"
            )} />
            <span className="whitespace-nowrap">Estilos</span>
            {selectedStyles.length > 0 && (
              <span className="bg-pink-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {selectedStyles.length}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              'flex items-center gap-2 px-4 md:px-4 py-2.5 md:py-2.5 rounded-xl font-medium text-sm transition-all duration-300 flex-shrink-0 border',
              'active:scale-95 active:transition-transform active:duration-100',
              activeTab === 'history'
                ? 'bg-gradient-to-br from-blue-500/30 via-blue-600/20 to-purple-500/30 text-white border-blue-400/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                : 'text-white/60 hover:text-white bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 hover:border-white/20'
            )}
          >
            <History className={cn(
              "w-4 h-4 transition-transform duration-200",
              activeTab === 'history' ? "scale-110" : "scale-100"
            )} />
            <span className="whitespace-nowrap">Histórico</span>
          </button>
        </nav>
      </div>
      
      {/* Content with iOS smooth scroll */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
        {activeTab === 'tools' && (
          <div className="p-4 md:p-6">
            <ControlPanel {...props} styleSuffixes={getStyleSuffixes()} />
          </div>
        )}
        
        {activeTab === 'templates' && (
          <TemplateGallery
            onSelectTemplate={handleTemplateSelect}
            currentCategory={
              props.activeTool === 'generate-logo' ? 'logo' :
              props.activeTool === 'generate-icon' ? 'icon' :
              props.activeTool === 'generate-pattern' ? 'pattern' :
              undefined
            }
          />
        )}
        
        {activeTab === 'styles' && (
          <StylePresets
            onSelectStyle={handleStyleSelect}
            selectedStyles={selectedStyles}
            allowMultiple={true}
            compact={false}
          />
        )}
        
        {activeTab === 'history' && (
          <div className="p-4 md:p-6">
            <div className="space-y-6 md:space-y-8">
              <HistoryPanel 
                history={props.history} 
                currentIndex={props.historyIndex} 
                onUndo={props.onUndo} 
                onRedo={props.onRedo} 
                onSelect={props.onSelectHistory}
                onClear={props.onClearSession}
              />
              <SessionGallery 
                gallery={props.sessionGallery} 
                onSelect={props.onSelectHistory} 
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Error message - iOS Premium Style */}
      {props.error && (
        <div className="flex-shrink-0 p-3 md:p-3 bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-xl border-t border-red-500/40 text-red-200 text-xs md:text-sm mx-3 md:mx-6 mb-3 md:mb-4 rounded-2xl shadow-lg">
          <p><span className="font-semibold">Erro:</span> {props.error}</p>
        </div>
      )}
    </div>
  );
};

export default SidePanelTabs;

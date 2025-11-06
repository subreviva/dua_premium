'use client';

import React, { useState } from 'react';
import ControlPanel from './ControlPanel';
import HistoryPanel from './HistoryPanel';
import SessionGallery from './SessionGallery';
import { ToolId, CanvasContent, ApiFunctions, ImageObject } from '@/types/designstudio';
import { Wrench, History } from 'lucide-react';
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

type Tab = 'tools' | 'history';

const SidePanelTabs: React.FC<SidePanelTabsProps> = (props) => {
  const [activeTab, setActiveTab] = useState<Tab>('tools');

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
        <div className="p-4 md:p-6">
          {activeTab === 'tools' ? (
            <ControlPanel {...props} />
          ) : (
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
          )}
        </div>
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

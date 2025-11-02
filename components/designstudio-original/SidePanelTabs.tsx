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
      {/* Tabs */}
      <div className="border-b border-white/10 bg-black/30 backdrop-blur-sm flex-shrink-0">
        <nav className="-mb-px flex space-x-1 px-3 md:px-4 pt-3 md:pt-4 overflow-x-auto scrollbar-hide" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('tools')}
            className={cn(
              'flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-t-lg font-medium text-xs md:text-sm transition-all duration-300 flex-shrink-0',
              activeTab === 'tools'
                ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-white border-b-2 border-blue-400 shadow-lg'
                : 'text-white/50 active:text-white active:bg-white/10'
            )}
          >
            <Wrench className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="whitespace-nowrap">Ferramentas</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              'flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-t-lg font-medium text-xs md:text-sm transition-all duration-300 flex-shrink-0',
              activeTab === 'history'
                ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-white border-b-2 border-blue-400 shadow-lg'
                : 'text-white/50 active:text-white active:bg-white/10'
            )}
          >
            <History className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="whitespace-nowrap">Histórico</span>
          </button>
        </nav>
      </div>
      
      {/* Content with perfect scroll */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent overscroll-contain">
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
      
      {/* Error message - fixed at bottom */}
      {props.error && (
        <div className="flex-shrink-0 p-2.5 md:p-3 bg-red-500/20 border-t border-red-500 text-red-300 text-xs md:text-sm mx-3 md:mx-6 mb-3 md:mb-4 rounded-lg">
          <p><span className="font-semibold">Erro:</span> {props.error}</p>
        </div>
      )}
    </div>
  );
};

export default SidePanelTabs;

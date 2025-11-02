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
    <div className="flex flex-col h-full">
      <div className="border-b border-white/10 bg-black/20">
        <nav className="-mb-px flex space-x-1 px-4 pt-4" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('tools')}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-medium text-sm transition-all duration-300',
              activeTab === 'tools'
                ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-white border-b-2 border-blue-400 shadow-lg'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            )}
          >
            <Wrench className="w-4 h-4" />
            Ferramentas
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-medium text-sm transition-all duration-300',
              activeTab === 'history'
                ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-white border-b-2 border-blue-400 shadow-lg'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            )}
          >
            <History className="w-4 h-4" />
            Histórico
          </button>
        </nav>
      </div>
      <div className="flex-grow p-6 overflow-y-auto scrollbar-hide">
        {activeTab === 'tools' ? (
          <ControlPanel {...props} />
        ) : (
          <div className="space-y-8">
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
      {props.error && (
        <div className="p-3 bg-red-500/20 border-t border-red-500 text-red-300 text-sm mx-6 mb-4 rounded-b-lg">
          <p><span className="font-semibold">Erro:</span> {props.error}</p>
        </div>
      )}
    </div>
  );
};

export default SidePanelTabs;

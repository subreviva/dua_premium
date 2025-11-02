
import React, { useState } from 'react';
import ControlPanel from './ControlPanel';
import HistoryPanel from './HistoryPanel';
import SessionGallery from './SessionGallery';
import { ToolId, CanvasContent, ApiFunctions, ImageObject } from '../types';

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
      <div className="border-b border-gray-700">
        <nav className="-mb-px flex space-x-4 px-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('tools')}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'tools'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
            }`}
          >
            Ferramentas
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
            }`}
          >
            Histórico & Galeria
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

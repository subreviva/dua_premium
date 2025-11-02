'use client';

import React, { useState } from 'react';
import { ToolId, CanvasContent, ApiFunctions, ImageObject } from '@/types/designstudio-full';
import GenerateImagePanel from './panels/GenerateImagePanel';
import EditImagePanel from './panels/EditImagePanel';
import GenerateSvgPanel from './panels/GenerateSvgPanel';
import ColorPalettePanel from './panels/ColorPalettePanel';
import GenerateVariationsPanel from './panels/GenerateVariationsPanel';
import AnalyzeImagePanel from './panels/AnalyzeImagePanel';
import SessionGallery from './panels/SessionGallery';
import HistoryPanel from './panels/HistoryPanel';

interface SidePanelProps {
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

const SidePanel: React.FC<SidePanelProps> = (props) => {
  const [activeTab, setActiveTab] = useState<Tab>('tools');

  const renderToolPanel = () => {
    switch (props.activeTool) {
      case 'generate-image':
        return <GenerateImagePanel {...props} />;
      case 'edit-image':
        return <EditImagePanel {...props} />;
      case 'generate-svg':
        return <GenerateSvgPanel {...props} />;
      case 'color-palette':
        return <ColorPalettePanel {...props} />;
      case 'generate-variations':
        return <GenerateVariationsPanel {...props} />;
      case 'analyze-image':
        return <AnalyzeImagePanel {...props} />;
      case 'generate-logo':
      case 'generate-icon':
      case 'product-mockup':
      case 'generate-pattern':
      case 'design-trends':
      case 'design-assistant':
      case 'export-project':
        return (
          <div className="p-6 text-center text-gray-400">
            <div className="text-4xl mb-4">🚧</div>
            <h3 className="text-lg font-semibold text-white mb-2">Em Desenvolvimento</h3>
            <p>Esta ferramenta estará disponível em breve.</p>
          </div>
        );
      default:
        return (
          <div className="p-6 text-center text-gray-400">
            <div className="text-4xl mb-4">👈</div>
            <h3 className="text-lg font-semibold text-white mb-2">Bem-vindo ao Design Studio</h3>
            <p>Selecione uma ferramenta à esquerda para começar a criar designs incríveis com IA.</p>
          </div>
        );
    }
  };

  return (
    <aside className="w-96 bg-black/40 backdrop-blur-md border-l border-white/10 flex flex-col">
      <div className="border-b border-white/10">
        <nav className="-mb-px flex space-x-4 px-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('tools')}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'tools'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
            }`}
          >
            Ferramentas
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'history'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
            }`}
          >
            Histórico & Galeria
          </button>
        </nav>
      </div>

      <div className="flex-grow p-6 overflow-y-auto custom-scrollbar">
        {activeTab === 'tools' ? (
          renderToolPanel()
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
        <div className="p-3 bg-red-500/20 border-t border-red-500 text-red-300 text-sm mx-6 mb-4 rounded-lg">
          <p><span className="font-semibold">Erro:</span> {props.error}</p>
        </div>
      )}
    </aside>
  );
};

export default SidePanel;

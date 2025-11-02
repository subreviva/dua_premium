
import React from 'react';
import { CanvasContent } from '@/types/designstudio';
import { useToast } from '@/hooks/useToast';

interface HistoryPanelProps {
  history: CanvasContent[];
  currentIndex: number;
  onUndo: () => void;
  onRedo: () => void;
  onSelect: (content: CanvasContent) => void;
  onClear: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, currentIndex, onUndo, onRedo, onSelect, onClear }) => {
  const { addToast } = useToast();

  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    addToast("Instrução copiada!");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Histórico de Ações</h2>
        <button onClick={onClear} title="Limpar sessão" className="p-1.5 text-gray-400 hover:text-white hover:bg-red-500/20 rounded-md transition">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        </button>
      </div>
      <div className="flex space-x-2">
        <button onClick={onUndo} disabled={currentIndex === 0} className="flex-1 p-2 text-sm bg-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition">Desfazer</button>
        <button onClick={onRedo} disabled={currentIndex === history.length - 1} className="flex-1 p-2 text-sm bg-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition">Refazer</button>
      </div>
      <div className="max-h-48 overflow-y-auto space-y-2 pr-2 scrollbar-hide">
        {history.slice().reverse().map((item, index) => {
          const historyIndex = history.length - 1 - index;
          const isActive = historyIndex === currentIndex;
          const prompt = item.prompt || (item.type === 'empty' ? 'Início' : `Ação ${historyIndex}`);
          return (
            <div key={historyIndex} className={`w-full p-2 rounded-md flex items-center space-x-3 text-left transition group ${isActive ? 'bg-blue-500/30' : 'bg-gray-700/50'}`}>
              <button onClick={() => onSelect(item)} className="flex-grow flex items-center space-x-3 text-left">
                <div className="w-10 h-10 bg-gray-800 rounded-md flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {item.type === 'image' && <img src={item.src} className="w-full h-full object-cover" />}
                  {item.type === 'svg' && <div className="w-full h-full p-1 bg-white" dangerouslySetInnerHTML={{ __html: item.code }} />}
                  {item.type === 'empty' && <span className="text-gray-500 text-xs">Vazio</span>}
                </div>
                <span className="text-sm text-gray-300 truncate">{prompt}</span>
              </button>
              {item.prompt && (
                <button onClick={() => handleCopyPrompt(item.prompt!)} title="Copiar instrução" className="p-1 rounded-md text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-gray-600 hover:text-white transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HistoryPanel;

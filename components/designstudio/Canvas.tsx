'use client';

import React from 'react';
import { CanvasContent } from '@/types/designstudio-full';
import { Download, Undo2, Redo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CanvasProps {
  content: CanvasContent;
  isLoading: boolean;
  loadingMessage: string;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

const Canvas: React.FC<CanvasProps> = ({ 
  content, 
  isLoading, 
  loadingMessage,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo
}) => {
  const handleDownload = () => {
    if (content.type === 'image') {
      const a = document.createElement('a');
      a.href = content.src;
      a.download = 'design-studio-image.png';
      a.click();
    } else if (content.type === 'svg') {
      const blob = new Blob([content.code], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'design-studio-vector.svg';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const renderContent = () => {
    if (isLoading) return null;

    switch (content.type) {
      case 'empty':
        return (
          <div className="text-center text-gray-400 p-8">
            <div className="text-6xl mb-4">🎨</div>
            <h2 className="text-2xl font-semibold text-white mb-2">Design Studio</h2>
            <p className="text-gray-400">Selecione uma ferramenta para começar a criar</p>
          </div>
        );
      case 'image':
        return (
          <img 
            src={content.src} 
            alt={content.prompt || 'Imagem gerada'} 
            className="object-contain w-full h-full rounded-lg"
          />
        );
      case 'svg':
        return (
          <div 
            className="w-full h-full p-8 bg-white rounded-lg" 
            dangerouslySetInnerHTML={{ __html: content.code }} 
          />
        );
      case 'text-result':
        return (
          <div className="text-center text-gray-400 p-8">
            <MessageCircleIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-semibold text-white mb-2">Resultado no Painel</h2>
            <p>O resultado desta ferramenta é exibido no painel à direita</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full max-w-5xl mx-auto flex flex-col">
      {/* Top Controls */}
      {(onUndo || onRedo) && (
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="outline"
            size="icon"
            onClick={onUndo}
            disabled={!canUndo}
            className="bg-black/40 border-white/10 hover:bg-white/10"
          >
            <Undo2 size={18} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onRedo}
            disabled={!canRedo}
            className="bg-black/40 border-white/10 hover:bg-white/10"
          >
            <Redo2 size={18} />
          </Button>
        </div>
      )}

      {/* Canvas Area */}
      <div className="flex-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 flex items-center justify-center relative aspect-square overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent" />
            <p className="mt-4 text-lg text-gray-300 animate-pulse">{loadingMessage}</p>
          </div>
        )}
        {renderContent()}
        {(content.type === 'image' || content.type === 'svg') && !isLoading && (
          <button
            onClick={handleDownload}
            title="Download"
            className="absolute top-4 right-4 z-10 p-3 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-purple-600 transition-all hover:scale-110"
          >
            <Download size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

const MessageCircleIcon = ({ className }: { className: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export default React.memo(Canvas);

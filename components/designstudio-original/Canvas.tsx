'use client';

import React from 'react';
import { CanvasContent } from '@/types/designstudio';
import Spinner from './ui/Spinner';
import { useToast } from '@/hooks/useToast';
import { Download, Sparkles, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CanvasProps {
  content: CanvasContent;
  isLoading: boolean;
  loadingMessage: string;
}

const Canvas: React.FC<CanvasProps> = ({ content, isLoading, loadingMessage }) => {
  const { addToast } = useToast();

  const handleDownload = () => {
    if (content.type === 'image') {
      const a = document.createElement('a');
      a.href = content.src;
      a.download = 'dua-design-imagem.png';
      a.click();
      addToast('Imagem descarregada.');
    } else if (content.type === 'svg') {
      const blob = new Blob([content.code], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dua-design-vetor.svg';
      a.click();
      URL.revokeObjectURL(url);
      addToast('Vetor SVG descarregado.');
    }
  };

  const renderContent = () => {
    if (isLoading) return null;

    switch (content.type) {
      case 'empty':
        return (
          <div className="text-center space-y-6 p-8">
            <div className="relative inline-block">
              <Sparkles className="w-16 h-16 text-white/40 animate-pulse" />
              <div className="absolute inset-0 blur-xl bg-blue-500/20 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold text-white/90">DUA Design Studio</h2>
              <p className="text-white/50 max-w-md mx-auto">
                Selecione uma ferramenta na barra lateral para começar a criar designs profissionais com IA
              </p>
            </div>
          </div>
        );
      case 'image':
        return (
          <img 
            src={content.src} 
            alt={content.prompt || 'Imagem gerada'} 
            className="object-contain w-full h-full rounded-lg shadow-2xl shadow-blue-500/20" 
          />
        );
      case 'svg':
        return (
          <div 
            className="w-full h-full p-8 bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl" 
            dangerouslySetInnerHTML={{ __html: content.code }} 
          />
        );
      case 'text-result':
        return (
          <div className="text-center space-y-4 p-8">
            <FileText className="w-12 h-12 text-white/40 mx-auto" />
            <h2 className="text-xl font-semibold text-white/80">Resultado no Painel</h2>
            <p className="text-white/50 max-w-md mx-auto">
              O resultado desta ferramenta é exibido no painel lateral direito
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn(
      "w-full h-full rounded-2xl flex items-center justify-center relative aspect-square max-w-full max-h-full overflow-hidden transition-all duration-300",
      content.type === 'empty' 
        ? "bg-black/20 backdrop-blur-sm border-2 border-dashed border-white/10" 
        : "bg-black/30 backdrop-blur-lg border border-white/10 shadow-2xl"
    )}>
      {isLoading && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-20 rounded-2xl">
          <Spinner />
          <p className="mt-6 text-lg text-white/80 animate-pulse font-medium">{loadingMessage}</p>
        </div>
      )}
      {renderContent()}
      {(content.type === 'image' || content.type === 'svg') && !isLoading && (
        <button 
          onClick={handleDownload} 
          title="Descarregar" 
          className="absolute top-4 right-4 z-10 p-3 bg-black/60 backdrop-blur-md rounded-xl text-white/80 hover:text-white hover:bg-gradient-to-br hover:from-blue-500/20 hover:to-purple-500/20 transition-all duration-300 border border-white/10 hover:border-white/20 hover:scale-110 active:scale-95 group"
        >
          <Download className="w-5 h-5 group-hover:animate-bounce" />
        </button>
      )}
    </div>
  );
};

export default React.memo(Canvas);

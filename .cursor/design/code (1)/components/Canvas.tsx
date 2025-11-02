
import React from 'react';
import { CanvasContent } from '../types';
import Spinner from './ui/Spinner';
import { useToast } from '../hooks/useToast';

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
          <div className="text-center text-gray-500 p-4">
            <h2 className="text-2xl font-semibold">DUA Design</h2>
            <p className="mt-2">Selecione uma ferramenta à esquerda para começar a sua criação.</p>
          </div>
        );
      case 'image':
        return <img src={content.src} alt={content.prompt || 'Imagem gerada'} className="object-contain w-full h-full" />;
      case 'svg':
        return <div className="w-full h-full p-4 bg-white rounded-md" dangerouslySetInnerHTML={{ __html: content.code }} />;
      case 'text-result':
        return (
            <div className="text-center text-gray-400 p-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 opacity-50"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                <h2 className="text-xl font-semibold">Resultado no Painel</h2>
                <p className="mt-2">O resultado desta ferramenta é exibido no painel à direita.</p>
            </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full bg-gray-800/30 rounded-lg flex items-center justify-center relative aspect-square max-w-full max-h-full overflow-hidden border-2 border-dashed border-gray-600">
      {isLoading && (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
          <Spinner />
          <p className="mt-4 text-lg text-gray-300 animate-pulse">{loadingMessage}</p>
        </div>
      )}
      {renderContent()}
      {(content.type === 'image' || content.type === 'svg') && !isLoading && (
        <button onClick={handleDownload} title="Descarregar" className="absolute top-3 right-3 z-10 p-2 bg-gray-900/50 rounded-full text-gray-300 hover:bg-blue-600 hover:text-white transition-all backdrop-blur-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
        </button>
      )}
    </div>
  );
};

export default React.memo(Canvas);

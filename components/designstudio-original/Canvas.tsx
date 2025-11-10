'use client';

import React from 'react';
import { CanvasContent, ApiFunctions } from '@/types/designstudio';
import Spinner from './ui/Spinner';
import { useToast } from '@/hooks/useToast';
import { Download, Sparkles, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import QuickActionsBar from './QuickActionsBar';

interface CanvasProps {
  content: CanvasContent;
  isLoading: boolean;
  loadingMessage: string;
  api?: ApiFunctions;
  onContentUpdate?: (content: CanvasContent) => void;
}

const Canvas: React.FC<CanvasProps> = ({ content, isLoading, loadingMessage, api, onContentUpdate }) => {
  const { addToast } = useToast();

  const handleDownload = () => {
    if (content.type === 'image') {
      const a = document.createElement('a');
      a.href = content.src;
      a.download = `dua-design-${Date.now()}.png`;
      a.click();
      addToast('Imagem descarregada.');
    } else if (content.type === 'svg') {
      const blob = new Blob([content.code], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dua-design-${Date.now()}.svg`;
      a.click();
      URL.revokeObjectURL(url);
      addToast('Vetor SVG descarregado.');
    }
  };

  const handleShare = async () => {
    if (content.type === 'image' && navigator.share) {
      try {
        // Converter base64 para blob
        const response = await fetch(content.src);
        const blob = await response.blob();
        const file = new File([blob], `design-${Date.now()}.png`, { type: 'image/png' });
        
        await navigator.share({
          title: 'Minha criação DUA',
          text: 'Feito com DUA Design Studio',
          files: [file]
        });
        addToast('Compartilhado com sucesso!');
      } catch (error) {
        // Fallback: copiar link
        addToast('Compartilhamento não disponível');
      }
    }
  };

  const handleRemoveBackground = async () => {
    if (content.type === 'image' && api && onContentUpdate) {
      const result = await api.editImage(content.src, content.mimeType, 'remove background completely, transparent PNG, isolated subject');
      if (result) {
        onContentUpdate({ type: 'image', src: result.src, mimeType: result.mimeType, prompt: 'Background removed' });
        addToast('Fundo removido com sucesso!');
      }
    }
  };

  const handleUpscale = async () => {
    if (content.type === 'image' && api && onContentUpdate) {
      const result = await api.editImage(content.src, content.mimeType, 'upscale to 4K resolution, enhance quality, sharpen details, professional photography');
      if (result) {
        onContentUpdate({ type: 'image', src: result.src, mimeType: result.mimeType, prompt: 'Upscaled to 4K' });
        addToast('Imagem melhorada!');
      }
    }
  };

  const handleGenerateVariations = async () => {
    if (content.type === 'image' && api) {
      addToast('Gerando 3 variações...');
      await api.generateVariations(content.src, content.mimeType);
    }
  };

  const renderContent = () => {
    if (isLoading) return null;

    switch (content.type) {
      case 'empty':
        return (
          <div className="text-center space-y-6 md:space-y-8 p-6 md:p-8">
            <div className="relative inline-block">
              {/* iOS Premium Sparkles */}
              <div className="relative">
                <Sparkles className="w-16 h-16 md:w-20 md:h-20 text-white/40 animate-pulse" />
                <div className="absolute inset-0 blur-2xl bg-blue-500/30 animate-pulse"></div>
                <div className="absolute inset-0 blur-3xl bg-purple-500/20 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold text-white/95 tracking-tight">DUA Design Studio</h2>
              <p className="text-base md:text-lg text-white/60 max-w-md mx-auto px-4 leading-relaxed">
                Selecione uma ferramenta para começar a criar designs profissionais com IA
              </p>
            </div>
            {/* iOS Premium Indicator Dots */}
            <div className="flex justify-center gap-2 pt-4">
              <div className="w-2 h-2 rounded-full bg-blue-400/50 animate-pulse"></div>
              <div className="w-2 h-2 rounded-full bg-blue-400/50 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 rounded-full bg-blue-400/50 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        );
      case 'image':
        return (
          <img 
            src={content.src} 
            alt={content.prompt || 'Imagem gerada'} 
            className="object-contain w-full h-full max-h-full rounded-lg shadow-2xl shadow-blue-500/20" 
          />
        );
      case 'svg':
        return (
          <div 
            className="w-full h-full p-4 md:p-8 bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl overflow-auto" 
            dangerouslySetInnerHTML={{ __html: content.code }} 
          />
        );
      case 'text-result':
        return (
          <div className="text-center space-y-3 md:space-y-4 p-4 md:p-8">
            <FileText className="w-10 h-10 md:w-12 md:h-12 text-white/40 mx-auto" />
            <h2 className="text-lg md:text-xl font-semibold text-white/80">Resultado no Painel</h2>
            <p className="text-sm md:text-base text-white/50 max-w-md mx-auto px-4">
              O resultado é exibido no painel {typeof window !== 'undefined' && window.innerWidth < 768 ? 'inferior' : 'lateral direito'}
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn(
      "w-full rounded-2xl flex items-center justify-center relative transition-all duration-300",
      // Mobile: aspect-square menor, desktop: max-h-full
      "h-auto min-h-[300px] md:h-full md:max-h-[calc(100vh-4rem)]",
      "aspect-square md:aspect-auto",
      content.type === 'empty' 
        ? "bg-black/20 backdrop-blur-sm border-2 border-dashed border-white/10" 
        : "bg-black/30 backdrop-blur-lg border border-white/10 shadow-2xl"
    )}>
      {isLoading && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center z-20 rounded-2xl animate-ios-spring">
          {/* iOS Premium Loading Spinner */}
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-blue-400/80 animate-spin shadow-[0_0_20px_rgba(59,130,246,0.4)]"></div>
            <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-purple-400/60 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
          </div>
          {/* Loading Message - iOS Style */}
          <p className="mt-6 text-base md:text-lg text-white/90 animate-pulse font-medium px-4 text-center tracking-wide">{loadingMessage}</p>
          <div className="mt-3 flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-400/60 animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 rounded-full bg-blue-400/60 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 rounded-full bg-blue-400/60 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      )}
      {renderContent()}
      
      {/* Quick Actions Bar - Desktop e Mobile */}
      {content.type === 'image' && !isLoading && api && onContentUpdate && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 hidden md:block">
          <QuickActionsBar
            imageUrl={content.src}
            onRemoveBackground={handleRemoveBackground}
            onUpscale={handleUpscale}
            onGenerateVariations={handleGenerateVariations}
            onDownload={handleDownload}
            onShare={handleShare}
            isLoading={isLoading}
          />
        </div>
      )}
      
      {/* Download button (legacy - só quando não tem Quick Actions) */}
      {(content.type === 'image' || content.type === 'svg') && !isLoading && (!api || content.type === 'svg') && (
        <button 
          onClick={handleDownload} 
          title="Descarregar" 
          className="absolute top-3 right-3 md:top-4 md:right-4 z-10 p-2.5 md:p-3 bg-black/70 backdrop-blur-xl rounded-2xl text-white/80 hover:text-white hover:bg-gradient-to-br hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-300 border border-white/20 hover:border-blue-400/40 hover:scale-110 active:scale-90 group shadow-lg shadow-black/40"
        >
          <Download className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:translate-y-0.5" />
        </button>
      )}
    </div>
  );
};

export default React.memo(Canvas);

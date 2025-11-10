
import React, { useState } from 'react';
import { CanvasContent, ApiFunctions, ImageObject } from '@/types/designstudio';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import PremiumPanelHeader from '../ui/PremiumPanelHeader';
import { Copy, AlertTriangle } from 'lucide-react';

interface GenerateVariationsPanelProps {
  canvasContent: CanvasContent;
  onContentUpdate: (content: CanvasContent) => void;
  api: ApiFunctions;
  templatePrompt?: string;
  styleSuffixes?: string;
}

const GenerateVariationsPanel: React.FC<GenerateVariationsPanelProps> = ({ canvasContent, onContentUpdate, api }) => {
  const [variations, setVariations] = useState<ImageObject[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isImageOnCanvas = canvasContent.type === 'image';

  const handleGenerate = async () => {
    if (!isImageOnCanvas || !api.generateVariations) return;
    
    setIsLoading(true);
    setError(null);
    setVariations(null);

    const base64Data = canvasContent.src.split(',')[1];
    const result = await api.generateVariations(base64Data, canvasContent.mimeType);

    if (result) {
      setVariations(result);
    } else {
      setError('Não foi possível gerar variações. Tente novamente ou use uma imagem diferente.');
    }
    setIsLoading(false);
  };

  const handleSelectVariation = (variation: ImageObject) => {
    onContentUpdate({ ...variation, type: 'image', prompt: 'Variação de imagem' });
  };

  return (
    <div className="space-y-6">
      <PremiumPanelHeader
        icon={Copy}
        title="Gerador de Variações"
        description="Crie múltiplas variações artísticas da sua imagem com diferentes estilos e interpretações."
        gradient="from-rose-500/20 to-pink-500/20"
      />
      
      {!isImageOnCanvas && (
        <div className="p-5 bg-yellow-500/10 border border-yellow-500/30 rounded-xl backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-yellow-300">Imagem Necessária</p>
              <p className="text-xs text-yellow-400/80">
                Gere uma imagem primeiro para criar variações artísticas dela.
              </p>
            </div>
          </div>
        </div>
      )}

      <Button 
        onClick={handleGenerate} 
        disabled={isLoading || !isImageOnCanvas} 
        className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 font-semibold tracking-wide shadow-lg shadow-rose-500/25"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            A Gerar Variações...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Copy className="w-4 h-4" />
            Gerar Variações da Imagem
          </span>
        )}
      </Button>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {variations && variations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Copy className="w-4 h-4" />
              Variações Geradas
            </h3>
            <span className="text-xs text-white/50 font-mono">{variations.length} opções</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {variations.map((variation, index) => (
              <button 
                key={index} 
                onClick={() => handleSelectVariation(variation)}
                className="group relative aspect-square rounded-xl overflow-hidden border-2 border-white/10 hover:border-rose-400 focus:border-rose-500 focus:outline-none transition-all duration-200 bg-white/5"
              >
                <img 
                  src={variation.src} 
                  alt={`Variação ${index + 1}`} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
                  <span className="text-xs font-medium text-white">Selecionar</span>
                </div>
              </button>
            ))}
          </div>
          <p className="text-xs text-white/50 text-center">Clique numa variação para a colocar na tela principal.</p>
        </div>
      )}
    </div>
  );
};

export default GenerateVariationsPanel;

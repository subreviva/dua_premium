
import React, { useState } from 'react';
import { CanvasContent, ApiFunctions, Color } from '@/types/designstudio';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { useToast } from '@/hooks/useToast';
import PremiumPanelHeader from '../ui/PremiumPanelHeader';
import { Palette, Copy, Check, AlertTriangle } from 'lucide-react';

interface ColorPalettePanelProps {
  canvasContent: CanvasContent;
  api: ApiFunctions;
}

const ColorPalettePanel: React.FC<ColorPalettePanelProps> = ({ canvasContent, api }) => {
  const [palette, setPalette] = useState<Color[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const { addToast } = useToast();

  const isImageOnCanvas = canvasContent.type === 'image';

  const handleExtract = async () => {
    if (!isImageOnCanvas || !api.extractColorPalette) return;
    
    setIsLoading(true);
    setError(null);
    setPalette(null);

    const base64Data = canvasContent.src.split(',')[1];
    const result = await api.extractColorPalette(base64Data, canvasContent.mimeType);

    if (result) {
      setPalette(result);
    } else {
      setError('Não foi possível extrair uma paleta. Tente novamente ou use uma imagem diferente.');
    }
    setIsLoading(false);
  };

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    addToast(`Cor ${hex} copiada!`);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  return (
    <div className="space-y-6">
      <PremiumPanelHeader
        icon={Palette}
        title="Extrator de Paleta de Cores"
        description="Analise imagens e descubra as cores dominantes com precisão profissional."
        gradient="from-pink-500/20 to-orange-500/20"
      />
      
      {!isImageOnCanvas && (
        <div className="p-5 bg-yellow-500/10 border border-yellow-500/30 rounded-xl backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-yellow-300">Imagem Necessária</p>
              <p className="text-xs text-yellow-400/80">
                Gere ou carregue uma imagem primeiro para extrair as cores dominantes.
              </p>
            </div>
          </div>
        </div>
      )}

      <Button 
        onClick={handleExtract} 
        disabled={isLoading || !isImageOnCanvas} 
        className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 font-semibold tracking-wide shadow-lg shadow-pink-500/25"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            A Analisar Cores...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Palette className="w-4 h-4" />
            Extrair Paleta da Imagem
          </span>
        )}
      </Button>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {palette && palette.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Paleta Extraída
            </h3>
            <span className="text-xs text-white/50 font-mono">{palette.length} cores</span>
          </div>
          
          <div className="grid gap-3">
            {palette.map((color, index) => (
              <div 
                key={color.hex} 
                className="group relative p-4 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  {/* Color Preview */}
                  <div className="relative">
                    <div 
                      className="w-16 h-16 rounded-lg shadow-lg border-2 border-white/20 group-hover:scale-110 transition-transform" 
                      style={{ backgroundColor: color.hex }} 
                    />
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
                  </div>
                  
                  {/* Color Info */}
                  <div className="flex-grow min-w-0">
                    <p className="font-mono text-base font-semibold text-white tracking-wide">
                      {color.hex}
                    </p>
                    <p className="text-sm text-white/60 mt-0.5">
                      {color.name}
                    </p>
                  </div>
                  
                  {/* Copy Button */}
                  <button
                    onClick={() => handleCopy(color.hex)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-all flex items-center gap-2 group/btn"
                  >
                    {copiedColor === color.hex ? (
                      <>
                        <Check className="w-4 h-4 text-green-400" />
                        <span className="text-xs font-medium text-green-400">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-white/70 group-hover/btn:text-white transition-colors" />
                        <span className="text-xs font-medium text-white/70 group-hover/btn:text-white transition-colors">
                          Copiar
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPalettePanel;

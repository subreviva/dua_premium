
import React, { useState } from 'react';
import { CanvasContent, ApiFunctions, Color } from '../../types';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { useToast } from '../../hooks/useToast';

interface ColorPalettePanelProps {
  canvasContent: CanvasContent;
  api: ApiFunctions;
}

const ColorPalettePanel: React.FC<ColorPalettePanelProps> = ({ canvasContent, api }) => {
  const [palette, setPalette] = useState<Color[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
    addToast(`Cor ${hex} copiada!`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Extrator de Paleta de Cores</h2>
        <p className="text-sm text-gray-400">Analise a imagem na tela para encontrar as suas cores dominantes.</p>
      </div>
      
      {!isImageOnCanvas && (
        <div className="p-4 bg-yellow-500/20 border border-yellow-500 text-yellow-300 rounded-lg text-center">
          Por favor, gere uma imagem primeiro para ativar a extração de cores.
        </div>
      )}

      <Button onClick={handleExtract} disabled={isLoading || !isImageOnCanvas} className="w-full">
        {isLoading ? 'A analisar...' : 'Extrair da Tela'}
      </Button>

      {isLoading && <div className="flex justify-center"><Spinner /></div>}
      {error && <p className="text-red-400 text-center">{error}</p>}

      {palette && palette.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-white">Paleta Extraída:</h3>
          <ul className="space-y-2">
            {palette.map((color) => (
              <li key={color.hex} className="flex items-center justify-between p-2 bg-gray-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-md border-2 border-gray-500" style={{ backgroundColor: color.hex }} />
                  <div>
                    <p className="font-mono text-sm text-gray-300">{color.hex}</p>
                    <p className="text-xs text-gray-400">{color.name}</p>
                  </div>
                </div>
                <Button onClick={() => handleCopy(color.hex)} className="px-2 py-1 text-xs">
                  Copiar
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ColorPalettePanel;

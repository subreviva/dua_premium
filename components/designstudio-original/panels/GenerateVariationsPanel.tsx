
import React, { useState } from 'react';
import { CanvasContent, ApiFunctions, ImageObject } from '@/types/designstudio';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';

interface GenerateVariationsPanelProps {
  canvasContent: CanvasContent;
  onContentUpdate: (content: CanvasContent) => void;
  api: ApiFunctions;
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
      <div>
        <h2 className="text-xl font-semibold mb-2">Gerador de Variações</h2>
        <p className="text-sm text-gray-400">Crie variações artísticas da imagem que está atualmente na tela.</p>
      </div>
      
      {!isImageOnCanvas && (
        <div className="p-4 bg-yellow-500/20 border border-yellow-500 text-yellow-300 rounded-lg text-center">
          Por favor, gere uma imagem primeiro para criar variações.
        </div>
      )}

      <Button onClick={handleGenerate} disabled={isLoading || !isImageOnCanvas} className="w-full">
        {isLoading ? 'A gerar...' : 'Gerar Variações'}
      </Button>

      {isLoading && <div className="flex justify-center"><Spinner /></div>}
      {error && <p className="text-red-400 text-center">{error}</p>}

      {variations && variations.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-white">Variações Geradas:</h3>
          <div className="grid grid-cols-2 gap-2">
            {variations.map((variation, index) => (
              <button 
                key={index} 
                onClick={() => handleSelectVariation(variation)}
                className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 focus:border-blue-500 focus:outline-none transition"
              >
                <img src={variation.src} alt={`Variação ${index + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
           <p className="text-xs text-gray-400 text-center">Clique numa variação para a colocar na tela.</p>
        </div>
      )}
    </div>
  );
};

export default GenerateVariationsPanel;

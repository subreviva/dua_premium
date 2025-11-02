
import React, { useState } from 'react';
import { CanvasContent, ApiFunctions } from '../../types';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';

interface AnalyzeImagePanelProps {
  canvasContent: CanvasContent;
  api: ApiFunctions;
}

const AnalyzeImagePanel: React.FC<AnalyzeImagePanelProps> = ({ canvasContent, api }) => {
  const [description, setDescription] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isImageOnCanvas = canvasContent.type === 'image';

  const handleAnalyze = async () => {
    if (!isImageOnCanvas || !api.analyzeImage) return;
    
    setIsLoading(true);
    setError(null);
    setDescription(null);

    const base64Data = canvasContent.src.split(',')[1];
    const result = await api.analyzeImage(base64Data, canvasContent.mimeType);

    if (result) {
      setDescription(result);
    } else {
      setError('Não foi possível analisar a imagem. Tente novamente.');
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Analisador de Imagem</h2>
        <p className="text-sm text-gray-400">Gere uma descrição detalhada (alt-text) para a imagem na tela, ideal para acessibilidade e SEO.</p>
      </div>
      
      {!isImageOnCanvas && (
        <div className="p-4 bg-yellow-500/20 border border-yellow-500 text-yellow-300 rounded-lg text-center">
          Por favor, gere uma imagem primeiro para a poder analisar.
        </div>
      )}

      <Button onClick={handleAnalyze} disabled={isLoading || !isImageOnCanvas} className="w-full">
        {isLoading ? 'A analisar...' : 'Analisar Imagem na Tela'}
      </Button>

      {isLoading && <div className="flex justify-center"><Spinner /></div>}
      {error && <p className="text-red-400 text-center">{error}</p>}

      {description && (
        <div className="space-y-2">
          <h3 className="font-semibold text-white">Descrição Gerada:</h3>
          <div className="p-3 bg-gray-700/50 rounded-lg text-gray-300 text-sm">
            {description}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyzeImagePanel;

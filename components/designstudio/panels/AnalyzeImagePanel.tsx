'use client';

import React, { useState } from 'react';
import { CanvasContent, ApiFunctions } from '@/types/designstudio-full';
import { Button } from '@/components/ui/button';

interface AnalyzeImagePanelProps {
  canvasContent: CanvasContent;
  api: ApiFunctions;
  isLoading: boolean;
}

const AnalyzeImagePanel: React.FC<AnalyzeImagePanelProps> = ({ canvasContent, api, isLoading }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const isImageOnCanvas = canvasContent.type === 'image';

  const handleAnalyze = async () => {
    if (!isImageOnCanvas || !api.analyzeImage) return;

    const base64Data = canvasContent.src.split(',')[1];
    const result = await api.analyzeImage(base64Data, canvasContent.mimeType);
    if (result) {
      setAnalysis(result);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-2">Analisar Imagem</h2>
        <p className="text-sm text-gray-400">Obtenha uma descrição detalhada da imagem.</p>
      </div>

      {!isImageOnCanvas && (
        <div className="p-4 bg-yellow-500/20 border border-yellow-500 text-yellow-300 rounded-lg text-center">
          Gere uma imagem primeiro para analisar.
        </div>
      )}

      <Button
        onClick={handleAnalyze}
        disabled={isLoading || !isImageOnCanvas}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
      >
        {isLoading ? 'A analisar...' : 'Analisar'}
      </Button>

      {analysis && (
        <div className="p-4 bg-black/20 rounded-lg border border-white/10">
          <p className="text-sm text-gray-300 leading-relaxed">{analysis}</p>
        </div>
      )}
    </div>
  );
};

export default AnalyzeImagePanel;

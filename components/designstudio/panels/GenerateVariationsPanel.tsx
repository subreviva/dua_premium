'use client';

import React, { useState } from 'react';
import { CanvasContent, ApiFunctions, ImageObject } from '@/types/designstudio-full';
import { Button } from '@/components/ui/button';

interface GenerateVariationsPanelProps {
  canvasContent: CanvasContent;
  onContentUpdate: (content: CanvasContent) => void;
  api: ApiFunctions;
  isLoading: boolean;
}

const GenerateVariationsPanel: React.FC<GenerateVariationsPanelProps> = ({ 
  canvasContent, 
  onContentUpdate, 
  api, 
  isLoading 
}) => {
  const [variations, setVariations] = useState<ImageObject[]>([]);
  const isImageOnCanvas = canvasContent.type === 'image';

  const handleGenerateVariations = async () => {
    if (!isImageOnCanvas || !api.generateVariations) return;

    const base64Data = canvasContent.src.split(',')[1];
    const result = await api.generateVariations(base64Data, canvasContent.mimeType);
    if (result) {
      setVariations(result);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-2">Gerar Variações</h2>
        <p className="text-sm text-gray-400">Crie variações artísticas da imagem atual.</p>
      </div>

      {!isImageOnCanvas && (
        <div className="p-4 bg-yellow-500/20 border border-yellow-500 text-yellow-300 rounded-lg text-center">
          Gere uma imagem primeiro para criar variações.
        </div>
      )}

      <Button
        onClick={handleGenerateVariations}
        disabled={isLoading || !isImageOnCanvas}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
      >
        {isLoading ? 'A gerar...' : 'Gerar Variações'}
      </Button>

      {variations.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {variations.map((variation, index) => (
            <button
              key={index}
              onClick={() => onContentUpdate({ 
                type: 'image', 
                src: variation.src, 
                mimeType: variation.mimeType, 
                prompt: canvasContent.prompt 
              })}
              className="aspect-square rounded-lg overflow-hidden border border-white/10 hover:border-purple-500 transition-all hover:scale-105"
            >
              <img src={variation.src} alt={`Variation ${index + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default GenerateVariationsPanel;

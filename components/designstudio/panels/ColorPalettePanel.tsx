'use client';

import React, { useState } from 'react';
import { CanvasContent, ApiFunctions, Color } from '@/types/designstudio-full';
import { Button } from '@/components/ui/button';

interface ColorPalettePanelProps {
  canvasContent: CanvasContent;
  api: ApiFunctions;
  isLoading: boolean;
}

const ColorPalettePanel: React.FC<ColorPalettePanelProps> = ({ canvasContent, api, isLoading }) => {
  const [palette, setPalette] = useState<Color[]>([]);
  const isImageOnCanvas = canvasContent.type === 'image';

  const handleExtractPalette = async () => {
    if (!isImageOnCanvas || !api.extractColorPalette) return;

    const base64Data = canvasContent.src.split(',')[1];
    const result = await api.extractColorPalette(base64Data, canvasContent.mimeType);
    if (result) {
      setPalette(result);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-2">Paleta de Cores</h2>
        <p className="text-sm text-gray-400">Extraia as cores principais de uma imagem.</p>
      </div>

      {!isImageOnCanvas && (
        <div className="p-4 bg-yellow-500/20 border border-yellow-500 text-yellow-300 rounded-lg text-center">
          Gere uma imagem primeiro para extrair a paleta.
        </div>
      )}

      <Button
        onClick={handleExtractPalette}
        disabled={isLoading || !isImageOnCanvas}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
      >
        {isLoading ? 'A analisar...' : 'Extrair Paleta'}
      </Button>

      {palette.length > 0 && (
        <div className="space-y-3">
          {palette.map((color, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-black/20 rounded-lg border border-white/10">
              <div
                className="w-12 h-12 rounded-lg border-2 border-white/20"
                style={{ backgroundColor: color.hex }}
              />
              <div className="flex-1">
                <p className="font-medium text-white">{color.name}</p>
                <p className="text-sm text-gray-400">{color.hex}</p>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(color.hex)}
                className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 rounded"
              >
                Copiar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ColorPalettePanel;

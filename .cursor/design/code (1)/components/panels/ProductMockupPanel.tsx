
import React, { useState } from 'react';
import { CanvasContent, ApiFunctions } from '../../types';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';

interface ProductMockupPanelProps {
  canvasContent: CanvasContent;
  onContentUpdate: (content: CanvasContent) => void;
  api: ApiFunctions;
  isLoading: boolean;
}

const ProductMockupPanel: React.FC<ProductMockupPanelProps> = ({ canvasContent, onContentUpdate, api, isLoading }) => {
  const [scene, setScene] = useState('');
  const isImageOnCanvas = canvasContent.type === 'image';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scene.trim() || !isImageOnCanvas || !api.editImage) return;

    const prompt = `Coloque a imagem fornecida numa cena de mockup de produto realista de: ${scene}. A imagem original deve ser integrada naturalmente.`;
    
    const base64Data = canvasContent.src.split(',')[1];
    const result = await api.editImage(base64Data, canvasContent.mimeType, prompt);
    if (result) {
      onContentUpdate({ type: 'image', src: result.src, mimeType: result.mimeType, prompt });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Mockup de Produto</h2>
        <p className="text-sm text-gray-400">Coloque a imagem da tela (ex: um logótipo) num produto ou cena.</p>
      </div>
      
      {!isImageOnCanvas && (
        <div className="p-4 bg-yellow-500/20 border border-yellow-500 text-yellow-300 rounded-lg text-center">
          Por favor, gere um logótipo ou imagem primeiro para criar um mockup.
        </div>
      )}

      <Textarea
        id="mockup-scene"
        label="Descreva a Cena do Mockup"
        value={scene}
        onChange={(e) => setScene(e.target.value)}
        placeholder="Ex: Uma caneca de café preta numa mesa de madeira.&#10;Ex: Uma t-shirt branca vestida por um modelo.&#10;Ex: O ecrã de um portátil num escritório."
        rows={5}
        disabled={isLoading || !isImageOnCanvas}
        required
      />

      <Button type="submit" disabled={isLoading || !scene.trim() || !isImageOnCanvas} className="w-full">
        {isLoading ? 'A gerar...' : 'Gerar Mockup'}
      </Button>
    </form>
  );
};

export default ProductMockupPanel;

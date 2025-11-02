'use client';

import React, { useState } from 'react';
import { CanvasContent, ApiFunctions } from '@/types/designstudio-full';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface EditImagePanelProps {
  canvasContent: CanvasContent;
  onContentUpdate: (content: CanvasContent) => void;
  api: ApiFunctions;
  isLoading: boolean;
}

const EditImagePanel: React.FC<EditImagePanelProps> = ({ canvasContent, onContentUpdate, api, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const isImageOnCanvas = canvasContent.type === 'image';

  const handleEdit = async (editPrompt: string) => {
    if (!editPrompt.trim() || !isImageOnCanvas || !api.editImage) return;

    const base64Data = canvasContent.src.split(',')[1];
    const result = await api.editImage(base64Data, canvasContent.mimeType, editPrompt);
    if (result) {
      onContentUpdate({ type: 'image', src: result.src, mimeType: result.mimeType, prompt: canvasContent.prompt });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleEdit(prompt);
  };

  const handleRemoveBackground = () => {
    handleEdit("Remove the background, make it transparent. Output a high-quality PNG with a transparent background.");
  };

  const handleUpscale = () => {
    handleEdit("Upscale this image to a higher resolution, enhancing details and clarity without adding new elements. Maintain the original style.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-2">Editar Imagem</h2>
        <p className="text-sm text-gray-400">Descreva como quer alterar a imagem atual, ou use uma ação rápida.</p>
      </div>
      
      {!isImageOnCanvas && (
        <div className="p-4 bg-yellow-500/20 border border-yellow-500 text-yellow-300 rounded-lg text-center">
          Por favor, gere uma imagem primeiro para ativar a edição.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="edit-prompt">Instrução de Edição Personalizada</Label>
          <Textarea
            id="edit-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: Adicione uma cidade futurista no fundo"
            rows={4}
            disabled={isLoading || !isImageOnCanvas}
            className="bg-black/20 border-white/10"
          />
        </div>
        <Button type="submit" disabled={isLoading || !prompt.trim() || !isImageOnCanvas} className="w-full bg-gradient-to-r from-purple-500 to-pink-500">
          {isLoading ? 'A editar...' : 'Aplicar Edição'}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-600" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-black/40 px-2 text-sm text-gray-400">Ações Rápidas</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button onClick={handleRemoveBackground} disabled={isLoading || !isImageOnCanvas} className="w-full bg-indigo-600 hover:bg-indigo-500">
          Remover Fundo
        </Button>
        <Button onClick={handleUpscale} disabled={isLoading || !isImageOnCanvas} className="w-full bg-purple-600 hover:bg-purple-500">
          Ampliar e Melhorar
        </Button>
      </div>
    </div>
  );
};

export default EditImagePanel;

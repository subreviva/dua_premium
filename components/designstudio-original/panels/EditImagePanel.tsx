
import React, { useState } from 'react';
import { CanvasContent, ApiFunctions } from '@/types/designstudio';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import PremiumPanelHeader from '../ui/PremiumPanelHeader';
import { Wand2, Eraser, Maximize2, AlertTriangle } from 'lucide-react';

interface EditImagePanelProps {
  canvasContent: CanvasContent;
  onContentUpdate: (content: CanvasContent) => void;
  api: ApiFunctions;
  isLoading: boolean;
  templatePrompt?: string;
  styleSuffixes?: string;
}

const EditImagePanel: React.FC<EditImagePanelProps> = ({ 
  canvasContent, 
  onContentUpdate, 
  api, 
  isLoading,
  templatePrompt = '',
  styleSuffixes = ''
}) => {
  const [prompt, setPrompt] = useState(templatePrompt || '');
  const isImageOnCanvas = canvasContent.type === 'image';

  // Atualizar prompt quando templatePrompt ou styleSuffixes mudar
  React.useEffect(() => {
    if (templatePrompt) {
      const combined = styleSuffixes 
        ? `${templatePrompt}, ${styleSuffixes}`
        : templatePrompt;
      setPrompt(combined);
    }
  }, [templatePrompt, styleSuffixes]);

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
      <PremiumPanelHeader
        icon={Wand2}
        title="Editar Imagem"
        description="Transforme a sua imagem com instruções personalizadas ou ações rápidas profissionais."
        gradient="from-indigo-500/20 to-purple-500/20"
      />
      
      {!isImageOnCanvas && (
        <div className="p-5 bg-yellow-500/10 border border-yellow-500/30 rounded-xl backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-yellow-300">Imagem Necessária</p>
              <p className="text-xs text-yellow-400/80">
                Gere ou carregue uma imagem primeiro para ativar as ferramentas de edição.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <label htmlFor="edit-prompt" className="block text-sm font-medium text-white/90">
            Instrução de Edição Personalizada
          </label>
          <Textarea
            id="edit-prompt"
            label=""
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: Adicione uma cidade futurista no fundo, mude a iluminação para pôr do sol"
            rows={4}
            disabled={isLoading || !isImageOnCanvas}
          />
        </div>
        <Button 
          type="submit" 
          disabled={isLoading || !prompt.trim() || !isImageOnCanvas} 
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 font-semibold tracking-wide shadow-lg shadow-indigo-500/25"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              A Aplicar Edição...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Wand2 className="w-4 h-4" />
              Aplicar Edição
            </span>
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-gray-900/80 backdrop-blur-sm px-4 py-1 text-sm font-medium text-white/70 rounded-full border border-white/10">
            Ações Rápidas
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button 
          onClick={handleRemoveBackground} 
          disabled={isLoading || !isImageOnCanvas} 
          className="w-full bg-white/10 hover:bg-white/20 border border-white/20 font-medium flex items-center justify-center gap-2 group"
        >
          <Eraser className="w-4 h-4 group-hover:rotate-6 transition-transform" />
          <span>Remover Fundo</span>
        </Button>
        <Button 
          onClick={handleUpscale} 
          disabled={isLoading || !isImageOnCanvas} 
          className="w-full bg-white/10 hover:bg-white/20 border border-white/20 font-medium flex items-center justify-center gap-2 group"
        >
          <Maximize2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span>Ampliar & Melhorar</span>
        </Button>
      </div>
    </div>
  );
};

export default EditImagePanel;

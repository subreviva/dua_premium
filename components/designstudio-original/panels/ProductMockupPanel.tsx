
import React, { useState } from 'react';
import { CanvasContent, ApiFunctions } from '@/types/designstudio';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import PremiumPanelHeader from '../ui/PremiumPanelHeader';
import { Laptop, AlertTriangle } from 'lucide-react';

interface ProductMockupPanelProps {
  canvasContent: CanvasContent;
  onContentUpdate: (content: CanvasContent) => void;
  api: ApiFunctions;
  isLoading: boolean;
  templatePrompt?: string;
  styleSuffixes?: string;
}

const ProductMockupPanel: React.FC<ProductMockupPanelProps> = ({ 
  canvasContent, 
  onContentUpdate, 
  api, 
  isLoading,
  templatePrompt = '',
  styleSuffixes = ''
}) => {
  const [scene, setScene] = useState(templatePrompt || '');
  const isImageOnCanvas = canvasContent.type === 'image';

  // Atualizar scene quando templatePrompt ou styleSuffixes mudar
  React.useEffect(() => {
    if (templatePrompt) {
      const combined = styleSuffixes 
        ? `${templatePrompt}, ${styleSuffixes}`
        : templatePrompt;
      setScene(combined);
    }
  }, [templatePrompt, styleSuffixes]);

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
      <PremiumPanelHeader
        icon={Laptop}
        title="Mockup de Produto"
        description="Apresente o seu design em contextos reais: t-shirts, canecas, ecrãs e mais."
        gradient="from-violet-500/20 to-fuchsia-500/20"
      />
      
      {!isImageOnCanvas && (
        <div className="p-5 bg-yellow-500/10 border border-yellow-500/30 rounded-xl backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-yellow-300">Imagem Necessária</p>
              <p className="text-xs text-yellow-400/80">
                Gere um logótipo ou imagem primeiro para criar um mockup profissional.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <label htmlFor="mockup-scene" className="block text-sm font-medium text-white/90">
          Descreva a Cena do Mockup
        </label>
        <Textarea
          id="mockup-scene"
          label=""
          value={scene}
          onChange={(e) => setScene(e.target.value)}
          placeholder="Ex: Uma caneca de café preta numa mesa de madeira&#10;Ex: Uma t-shirt branca vestida por um modelo&#10;Ex: O ecrã de um portátil num escritório moderno&#10;Ex: Um poster emoldurado numa parede branca"
          rows={5}
          disabled={isLoading || !isImageOnCanvas}
          required
        />
      </div>

      <Button 
        type="submit" 
        disabled={isLoading || !scene.trim() || !isImageOnCanvas} 
        className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 font-semibold tracking-wide shadow-lg shadow-violet-500/25"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            A Criar Mockup...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Laptop className="w-4 h-4" />
            Gerar Mockup Profissional
          </span>
        )}
      </Button>
    </form>
  );
};

export default ProductMockupPanel;

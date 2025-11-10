
import React, { useState } from 'react';
import { CanvasContent, ApiFunctions } from '@/types/designstudio';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import PremiumPanelHeader from '../ui/PremiumPanelHeader';
import { Grid3x3 } from 'lucide-react';

interface GeneratePatternPanelProps {
  onContentUpdate: (content: CanvasContent) => void;
  api: ApiFunctions;
  isLoading: boolean;
  templatePrompt?: string;
  styleSuffixes?: string;
}

const GeneratePatternPanel: React.FC<GeneratePatternPanelProps> = ({ 
  onContentUpdate, 
  api, 
  isLoading,
  templatePrompt = '',
  styleSuffixes = ''
}) => {
  const [description, setDescription] = useState(templatePrompt || '');

  // Atualizar description quando templatePrompt ou styleSuffixes mudar
  React.useEffect(() => {
    if (templatePrompt) {
      const combined = styleSuffixes 
        ? `${templatePrompt}, ${styleSuffixes}`
        : templatePrompt;
      setDescription(combined);
    }
  }, [templatePrompt, styleSuffixes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !api.generateImage) return;

    const prompt = `Um padrão contínuo e repetível (seamless, tileable) de ${description}. Estilo de design gráfico, alta resolução, detalhes intrincados.`;
    
    const result = await api.generateImage(prompt, '1:1');
    if (result) {
      onContentUpdate({ type: 'image', src: result.src, mimeType: result.mimeType, prompt });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PremiumPanelHeader
        icon={Grid3x3}
        title="Gerador de Padrões"
        description="Crie padrões seamless perfeitos para backgrounds, texturas e design gráfico."
        gradient="from-amber-500/20 to-orange-500/20"
      />
      
      <div className="space-y-3">
        <label htmlFor="pattern-description" className="block text-sm font-medium text-white/90">
          Descrição do Padrão
        </label>
        <Textarea
          id="pattern-description"
          label=""
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex: pequenas flores de cerejeira e folhas verdes num fundo rosa claro&#10;Ex: formas geométricas abstratas em tons de azul e dourado&#10;Ex: padrão art deco com linhas douradas sobre preto"
          rows={5}
          disabled={isLoading}
          required
        />
      </div>

      <Button 
        type="submit" 
        disabled={isLoading || !description.trim()} 
        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 font-semibold tracking-wide shadow-lg shadow-amber-500/25"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            A Criar Padrão...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Grid3x3 className="w-4 h-4" />
            Gerar Padrão Seamless
          </span>
        )}
      </Button>
    </form>
  );
};

export default GeneratePatternPanel;

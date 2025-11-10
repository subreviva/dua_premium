
import React, { useState } from 'react';
import { CanvasContent, ApiFunctions } from '@/types/designstudio';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import PremiumPanelHeader from '../ui/PremiumPanelHeader';
import { Code2 } from 'lucide-react';

interface GenerateSvgPanelProps {
  onContentUpdate: (content: CanvasContent) => void;
  api: ApiFunctions;
  isLoading: boolean;
  templatePrompt?: string;
  styleSuffixes?: string;
}

const GenerateSvgPanel: React.FC<GenerateSvgPanelProps> = ({ 
  onContentUpdate, 
  api, 
  isLoading,
  templatePrompt = '',
  styleSuffixes = ''
}) => {
  const [prompt, setPrompt] = useState(templatePrompt || '');

  // Atualizar prompt quando templatePrompt ou styleSuffixes mudar
  React.useEffect(() => {
    if (templatePrompt) {
      const combined = styleSuffixes 
        ? `${templatePrompt}, ${styleSuffixes}`
        : templatePrompt;
      setPrompt(combined);
    }
  }, [templatePrompt, styleSuffixes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !api.generateSvgCode) return;
    
    const result = await api.generateSvgCode(prompt);
    if (result) {
      onContentUpdate({ type: 'svg', code: result, prompt });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PremiumPanelHeader
        icon={Code2}
        title="Gerador de Vetor SVG"
        description="Crie gráficos vetoriais escaláveis perfeitamente limpos com código SVG."
        gradient="from-green-500/20 to-emerald-500/20"
      />
      
      <div className="space-y-3">
        <label htmlFor="svg-prompt" className="block text-sm font-medium text-white/90">
          Descrição do Vetor
        </label>
        <Textarea
          id="svg-prompt"
          label=""
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ex: um gato minimalista de uma só linha&#10;Ex: o logótipo de uma montanha com um sol&#10;Ex: ícone de notificação estilo material design"
          rows={5}
          disabled={isLoading}
          required
        />
      </div>

      <Button 
        type="submit" 
        disabled={isLoading || !prompt.trim()} 
        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 font-semibold tracking-wide shadow-lg shadow-green-500/25"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            A Gerar SVG...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Code2 className="w-4 h-4" />
            Gerar Código Vetorial
          </span>
        )}
      </Button>
    </form>
  );
};

export default GenerateSvgPanel;


import React, { useState } from 'react';
import { CanvasContent, ApiFunctions } from '@/types/designstudio';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import Input from '../ui/Input';
import PremiumPanelHeader from '../ui/PremiumPanelHeader';
import { Shapes } from 'lucide-react';

interface GenerateIconPanelProps {
  onContentUpdate: (content: CanvasContent) => void;
  api: ApiFunctions;
  isLoading: boolean;
  templatePrompt?: string;
  styleSuffixes?: string;
}

const GenerateIconPanel: React.FC<GenerateIconPanelProps> = ({ 
  onContentUpdate, 
  api, 
  isLoading,
  templatePrompt = '',
  styleSuffixes = ''
}) => {
  const [subject, setSubject] = useState('');
  const [style, setStyle] = useState(templatePrompt || 'minimalista, cor única');

  // Atualizar style quando templatePrompt ou styleSuffixes mudar
  React.useEffect(() => {
    if (templatePrompt) {
      const combined = styleSuffixes 
        ? `${templatePrompt}, ${styleSuffixes}`
        : templatePrompt;
      setStyle(combined);
    }
  }, [templatePrompt, styleSuffixes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !api.generateImage) return;

    const prompt = `Gere um ícone simples, moderno, estilo vetorial, representando '${subject}'. Estilo: ${style}. O ícone deve estar sobre um fundo branco liso, ser limpo e facilmente reconhecível.`;
    
    const result = await api.generateImage(prompt, '1:1');
    if (result) {
      onContentUpdate({ type: 'image', src: result.src, mimeType: result.mimeType, prompt });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PremiumPanelHeader
        icon={Shapes}
        title="Gerar Ícone"
        description="Crie ícones limpos e profissionais para qualquer aplicação ou interface."
        gradient="from-cyan-500/20 to-blue-500/20"
      />
      
      <div className="space-y-5">
        <Input
          id="icon-subject"
          label="Tema do Ícone"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Ex: Foguetão, Chávena de Café, Definições, Notificações"
          disabled={isLoading}
          required
        />

        <div className="space-y-3">
          <label htmlFor="icon-style" className="block text-sm font-medium text-white/90">
            Palavras-chave de Estilo
          </label>
          <Textarea
            id="icon-style"
            label=""
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            placeholder="Ex: minimalista, cor única, geométrico, linha fina, plano"
            rows={3}
            disabled={isLoading}
          />
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={isLoading || !subject.trim()} 
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 font-semibold tracking-wide shadow-lg shadow-cyan-500/25"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            A Criar Ícone...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Shapes className="w-4 h-4" />
            Gerar Ícone Profissional
          </span>
        )}
      </Button>
    </form>
  );
};

export default GenerateIconPanel;

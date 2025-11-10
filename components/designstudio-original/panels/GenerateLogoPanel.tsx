
import React, { useState } from 'react';
import { CanvasContent, AspectRatio, ApiFunctions } from '@/types/designstudio';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Input from '../ui/Input';
import PremiumPanelHeader from '../ui/PremiumPanelHeader';
import { Sparkles } from 'lucide-react';

interface GenerateLogoPanelProps {
  onContentUpdate: (content: CanvasContent) => void;
  api: ApiFunctions;
  isLoading: boolean;
  templatePrompt?: string;
  styleSuffixes?: string;
}

const GenerateLogoPanel: React.FC<GenerateLogoPanelProps> = ({ 
  onContentUpdate, 
  api, 
  isLoading,
  templatePrompt = '',
  styleSuffixes = ''
}) => {
  const [name, setName] = useState('');
  const [style, setStyle] = useState(templatePrompt || 'minimalista, moderno');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');

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
    if (!name.trim() || !style.trim() || !api.generateImage) return;

    const prompt = `Um logótipo profissional para uma empresa chamada "${name}". Estilo: ${style}. O logótipo deve ser um gráfico vetorial limpo sobre um fundo branco liso. Não inclua o nome da empresa como texto na imagem.`;
    
    const result = await api.generateImage(prompt, aspectRatio);
    if (result) {
      onContentUpdate({ type: 'image', src: result.src, mimeType: result.mimeType, prompt });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PremiumPanelHeader
        icon={Sparkles}
        title="Gerar Logótipo"
        description="Crie um logótipo profissional e único para a sua marca em segundos."
        gradient="from-purple-500/20 to-pink-500/20"
      />
      
      <div className="space-y-5">
        <Input
          id="logo-name"
          label="Nome da Empresa / Marca"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: QuantumLeap Technologies"
          disabled={isLoading}
          required
        />

        <Textarea
          id="logo-style"
          label="Palavras-chave de Estilo"
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          placeholder="Ex: minimalista, geométrico, colorido, elegante, tecnológico"
          rows={3}
          disabled={isLoading}
        />

        <Select
          id="logo-aspect-ratio"
          label="Proporção do Logótipo"
          value={aspectRatio}
          onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
          disabled={isLoading}
        >
          <option value="1:1">1:1 (Quadrado - Recomendado)</option>
          <option value="16:9">16:9 (Paisagem Larga)</option>
          <option value="4:3">4:3 (Paisagem Clássica)</option>
        </Select>
      </div>

      <Button 
        type="submit" 
        disabled={isLoading || !name.trim()} 
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-semibold tracking-wide shadow-lg shadow-purple-500/25"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            A Criar Logótipo...
          </span>
        ) : (
          'Gerar Logótipo Profissional'
        )}
      </Button>
    </form>
  );
};

export default GenerateLogoPanel;

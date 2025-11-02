
import React, { useState } from 'react';
import { CanvasContent, AspectRatio, ApiFunctions } from '@/types/designstudio';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Input from '../ui/Input';

interface GenerateLogoPanelProps {
  onContentUpdate: (content: CanvasContent) => void;
  api: ApiFunctions;
  isLoading: boolean;
}

const GenerateLogoPanel: React.FC<GenerateLogoPanelProps> = ({ onContentUpdate, api, isLoading }) => {
  const [name, setName] = useState('');
  const [style, setStyle] = useState('minimalista, moderno');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');

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
      <div>
        <h2 className="text-xl font-semibold mb-2">Gerar Logótipo</h2>
        <p className="text-sm text-gray-400">Descreva a sua marca para criar um logótipo único.</p>
      </div>
      
      <Input
        id="logo-name"
        label="Nome da Empresa"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ex: QuantumLeap Tech"
        disabled={isLoading}
        required
      />

      <Textarea
        id="logo-style"
        label="Palavras-chave de Estilo"
        value={style}
        onChange={(e) => setStyle(e.target.value)}
        placeholder="Ex: minimalista, geométrico, colorido, elegante"
        rows={3}
        disabled={isLoading}
      />

      <Select
        id="logo-aspect-ratio"
        label="Proporção"
        value={aspectRatio}
        onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
        disabled={isLoading}
      >
        <option value="1:1">1:1 (Quadrado)</option>
        <option value="16:9">16:9 (Paisagem)</option>
        <option value="4:3">4:3 (Paisagem)</option>
      </Select>

      <Button type="submit" disabled={isLoading || !name.trim()} className="w-full">
        {isLoading ? 'A gerar...' : 'Gerar Logótipo'}
      </Button>
    </form>
  );
};

export default GenerateLogoPanel;


import React, { useState } from 'react';
import { CanvasContent, ApiFunctions } from '@/types/designstudio';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import Input from '../ui/Input';

interface GenerateIconPanelProps {
  onContentUpdate: (content: CanvasContent) => void;
  api: ApiFunctions;
  isLoading: boolean;
}

const GenerateIconPanel: React.FC<GenerateIconPanelProps> = ({ onContentUpdate, api, isLoading }) => {
  const [subject, setSubject] = useState('');
  const [style, setStyle] = useState('minimalista, cor única');

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
      <div>
        <h2 className="text-xl font-semibold mb-2">Gerar Ícone</h2>
        <p className="text-sm text-gray-400">Crie um ícone limpo e simples para qualquer caso de uso.</p>
      </div>
      
      <Input
        id="icon-subject"
        label="Tema do Ícone"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Ex: Foguetão, Chávena de Café, Definições"
        disabled={isLoading}
        required
      />

      <Textarea
        id="icon-style"
        label="Palavras-chave de Estilo"
        value={style}
        onChange={(e) => setStyle(e.target.value)}
        placeholder="Ex: minimalista, cor única, geométrico"
        rows={3}
        disabled={isLoading}
      />

      <Button type="submit" disabled={isLoading || !subject.trim()} className="w-full">
        {isLoading ? 'A gerar...' : 'Gerar Ícone'}
      </Button>
    </form>
  );
};

export default GenerateIconPanel;

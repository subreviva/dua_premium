
import React, { useState } from 'react';
import { CanvasContent, ApiFunctions } from '@/types/designstudio';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';

interface GenerateSvgPanelProps {
  onContentUpdate: (content: CanvasContent) => void;
  api: ApiFunctions;
  isLoading: boolean;
}

const GenerateSvgPanel: React.FC<GenerateSvgPanelProps> = ({ onContentUpdate, api, isLoading }) => {
  const [prompt, setPrompt] = useState('');

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
      <div>
        <h2 className="text-xl font-semibold mb-2">Gerador de Vetor (SVG)</h2>
        <p className="text-sm text-gray-400">Descreva um ícone ou gráfico simples para gerar um ficheiro vetorial SVG.</p>
      </div>
      
      <Textarea
        id="svg-prompt"
        label="Descrição do Vetor"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Ex: um gato minimalista de uma só linha&#10;Ex: o logótipo de uma montanha com um sol"
        rows={4}
        disabled={isLoading}
        required
      />

      <Button type="submit" disabled={isLoading || !prompt.trim()} className="w-full">
        {isLoading ? 'A gerar SVG...' : 'Gerar Vetor'}
      </Button>
    </form>
  );
};

export default GenerateSvgPanel;

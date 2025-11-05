
import React, { useState } from 'react';
import { CanvasContent, ApiFunctions } from '@/types/designstudio';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';

interface GeneratePatternPanelProps {
  onContentUpdate: (content: CanvasContent) => void;
  api: ApiFunctions;
  isLoading: boolean;
}

const GeneratePatternPanel: React.FC<GeneratePatternPanelProps> = ({ onContentUpdate, api, isLoading }) => {
  const [description, setDescription] = useState('');

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
      <div>
        <h2 className="text-xl font-semibold mb-2">Gerador de Padrões</h2>
        <p className="text-sm text-gray-400">Descreva o padrão que deseja criar. Será gerado como uma imagem contínua.</p>
      </div>
      
      <Textarea
        id="pattern-description"
        label="Descrição do Padrão"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Ex: pequenas flores de cerejeira e folhas verdes num fundo rosa claro&#10;Ex: formas geométricas abstratas em tons de azul e dourado"
        rows={5}
        disabled={isLoading}
        required
      />

      <Button type="submit" disabled={isLoading || !description.trim()} className="w-full">
        {isLoading ? 'A gerar...' : 'Gerar Padrão'}
      </Button>
    </form>
  );
};

export default GeneratePatternPanel;

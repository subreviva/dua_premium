
import React, { useState } from 'react';
import { CanvasContent, AspectRatio, ApiFunctions, GenerationConfig } from '@/types/designstudio';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Input from '../ui/Input';

interface GenerateImagePanelProps {
  onContentUpdate: (content: CanvasContent) => void;
  api: ApiFunctions;
  isLoading: boolean;
}

const aspectRatios: AspectRatio[] = ['1:1', '16:9', '9:16', '4:3', '3:4'];

const GenerateImagePanel: React.FC<GenerateImagePanelProps> = ({ onContentUpdate, api, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [config, setConfig] = useState<GenerationConfig>({ temperature: 1, seed: undefined, negativePrompt: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !api.generateImage) return;

    const result = await api.generateImage(prompt, aspectRatio, config);
    if (result) {
      onContentUpdate({ type: 'image', src: result.src, mimeType: result.mimeType, prompt });
    }
  };

  const handleEnhancePrompt = async () => {
    if (!prompt.trim() || !api.enhancePrompt) return;
    const enhancedPrompt = await api.enhancePrompt(prompt);
    if (enhancedPrompt) {
      setPrompt(enhancedPrompt);
    }
  };

  const handleConfigChange = (field: keyof GenerationConfig, value: string | number) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Gerar Imagem</h2>
        <p className="text-sm text-gray-400">Descreva a imagem que pretende criar. Seja o mais detalhado possível.</p>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
            <label htmlFor="image-prompt" className="block text-sm font-medium text-gray-300">Instrução (Prompt)</label>
            <button type="button" onClick={handleEnhancePrompt} disabled={isLoading || !prompt.trim()} className="text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed">
                Assistente de Prompt ✨
            </button>
        </div>
        <Textarea id="image-prompt" label="" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ex: Uma foto cinemática de um robô a meditar numa floresta exuberante" rows={5} disabled={isLoading} />
      </div>

      <Select id="aspect-ratio" label="Proporção" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as AspectRatio)} disabled={isLoading}>
        {aspectRatios.map(ratio => (<option key={ratio} value={ratio}>{ratio}</option>))}
      </Select>

      <div>
        <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="text-sm text-blue-400 hover:text-blue-300 w-full text-left">
          {showAdvanced ? 'Ocultar' : 'Mostrar'} Opções Avançadas...
        </button>
        {showAdvanced && (
          <div className="mt-4 space-y-4 p-4 bg-gray-700/30 rounded-lg">
            <Textarea id="negative-prompt" label="Instrução Negativa" value={config.negativePrompt} onChange={(e) => handleConfigChange('negativePrompt', e.target.value)} placeholder="Ex: texto, marcas d'água, má qualidade" rows={2} disabled={isLoading} />
            <div>
              <label htmlFor="temperature" className="block text-sm font-medium text-gray-300 mb-1">Temperatura: {config.temperature}</label>
              <input id="temperature" type="range" min="0" max="2" step="0.1" value={config.temperature} onChange={(e) => handleConfigChange('temperature', parseFloat(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer" disabled={isLoading} />
            </div>
            <div className="flex items-end space-x-2">
              <div className="flex-grow"><Input id="seed" label="Semente (Seed)" type="number" value={config.seed || ''} onChange={(e) => handleConfigChange('seed', parseInt(e.target.value, 10))} placeholder="Número aleatório" disabled={isLoading} /></div>
              <Button type="button" onClick={() => handleConfigChange('seed', Math.floor(Math.random() * 1000000))} disabled={isLoading} className="px-3 py-2.5">🎲</Button>
            </div>
          </div>
        )}
      </div>

      <Button type="submit" disabled={isLoading || !prompt.trim()} className="w-full">
        {isLoading ? 'A gerar...' : 'Gerar'}
      </Button>
    </form>
  );
};

export default GenerateImagePanel;

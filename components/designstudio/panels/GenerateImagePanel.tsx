'use client';

import React, { useState } from 'react';
import { CanvasContent, AspectRatio, ApiFunctions, GenerationConfig } from '@/types/designstudio-full';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Sparkles } from 'lucide-react';

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
  const [config, setConfig] = useState<GenerationConfig>({
    temperature: 1,
    seed: undefined,
    negativePrompt: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !api.generateImage) return;

    const result = await api.generateImage(prompt, aspectRatio, config);
    if (result) {
      onContentUpdate({
        type: 'image',
        src: result.src,
        mimeType: result.mimeType,
        prompt
      });
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
        <h2 className="text-xl font-semibold text-white mb-2">Gerar Imagem</h2>
        <p className="text-sm text-gray-400">
          Descreva a imagem que pretende criar. Seja o mais detalhado possível.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="image-prompt">Instrução (Prompt)</Label>
          <button
            type="button"
            onClick={handleEnhancePrompt}
            disabled={isLoading || !prompt.trim()}
            className="text-xs text-purple-400 hover:text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <Sparkles size={12} />
            Assistente de Prompt
          </button>
        </div>
        <Textarea
          id="image-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ex: Uma foto cinemática de um robô a meditar numa floresta exuberante"
          rows={5}
          disabled={isLoading}
          className="bg-black/20 border-white/10"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="aspect-ratio">Proporção</Label>
        <Select
          value={aspectRatio}
          onValueChange={(value) => setAspectRatio(value as AspectRatio)}
          disabled={isLoading}
        >
          <SelectTrigger className="bg-black/20 border-white/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {aspectRatios.map(ratio => (
              <SelectItem key={ratio} value={ratio}>{ratio}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-purple-400 hover:text-purple-300 w-full text-left"
        >
          {showAdvanced ? 'Ocultar' : 'Mostrar'} Opções Avançadas...
        </button>
        {showAdvanced && (
          <div className="mt-4 space-y-4 p-4 bg-black/20 rounded-lg border border-white/10">
            <div className="space-y-2">
              <Label htmlFor="negative-prompt">Instrução Negativa</Label>
              <Textarea
                id="negative-prompt"
                value={config.negativePrompt}
                onChange={(e) => handleConfigChange('negativePrompt', e.target.value)}
                placeholder="Ex: texto, marcas d'água, má qualidade"
                rows={2}
                disabled={isLoading}
                className="bg-black/20 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="temperature">
                Temperatura: {config.temperature}
              </Label>
              <input
                id="temperature"
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={config.temperature}
                onChange={(e) => handleConfigChange('temperature', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                disabled={isLoading}
              />
            </div>
            <div className="flex items-end space-x-2">
              <div className="flex-grow space-y-2">
                <Label htmlFor="seed">Semente (Seed)</Label>
                <Input
                  id="seed"
                  type="number"
                  value={config.seed || ''}
                  onChange={(e) => handleConfigChange('seed', parseInt(e.target.value, 10))}
                  placeholder="Número aleatório"
                  disabled={isLoading}
                  className="bg-black/20 border-white/10"
                />
              </div>
              <Button
                type="button"
                onClick={() => handleConfigChange('seed', Math.floor(Math.random() * 1000000))}
                disabled={isLoading}
                className="px-3"
              >
                🎲
              </Button>
            </div>
          </div>
        )}
      </div>

      <Button
        type="submit"
        disabled={isLoading || !prompt.trim()}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
      >
        {isLoading ? 'A gerar...' : 'Gerar'}
      </Button>
    </form>
  );
};

export default GenerateImagePanel;

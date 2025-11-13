import React, { useState } from 'react';
import { CanvasContent, AspectRatio, ApiFunctions, GenerationConfig } from '@/types/designstudio';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Input from '../ui/Input';
import { Wand2, ChevronDown, ChevronUp, Shuffle } from 'lucide-react';

interface GenerateImagePanelProps {
  onContentUpdate: (content: CanvasContent) => void;
  api: ApiFunctions;
  isLoading: boolean;
  templatePrompt?: string;
  styleSuffixes?: string;
}

const aspectRatios: AspectRatio[] = ['1:1', '16:9', '9:16', '4:3', '3:4'];

const GenerateImagePanel: React.FC<GenerateImagePanelProps> = ({ 
  onContentUpdate, 
  api, 
  isLoading,
  templatePrompt = '',
  styleSuffixes = ''
}) => {
  const [prompt, setPrompt] = useState(templatePrompt || '');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [config, setConfig] = useState<GenerationConfig>({ temperature: 1, seed: undefined, negativePrompt: '' });

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
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-white tracking-tight">Gerar Imagem</h2>
        <p className="text-sm text-white/60 leading-relaxed">
          Descreva a imagem que pretende criar. Seja o mais detalhado possível para melhores resultados.
        </p>
      </div>
      
      {/* Prompt Input */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label htmlFor="image-prompt" className="block text-sm font-medium text-white/90">
            Instrução (Prompt)
          </label>
          <button 
            type="button" 
            onClick={handleEnhancePrompt} 
            disabled={isLoading || !prompt.trim()} 
            className="group flex items-center gap-1.5 text-xs font-medium text-orange-500 hover:text-orange-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Wand2 className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" strokeWidth={0.75} />
            <span>Melhorar Prompt</span>
          </button>
        </div>
        <Textarea 
          id="image-prompt" 
          label="" 
          value={prompt} 
          onChange={(e) => setPrompt(e.target.value)} 
          placeholder="Ex: Uma foto cinemática de um robô a meditar numa floresta exuberante ao pôr do sol" 
          rows={5} 
          disabled={isLoading} 
        />
      </div>

      {/* Aspect Ratio */}
      <Select 
        id="aspect-ratio" 
        label="Proporção da Imagem" 
        value={aspectRatio} 
        onChange={(e) => setAspectRatio(e.target.value as AspectRatio)} 
        disabled={isLoading}
      >
        {aspectRatios.map(ratio => (
          <option key={ratio} value={ratio}>
            {ratio} {ratio === '1:1' && '(Quadrado)'} 
            {ratio === '16:9' && '(Paisagem)'} 
            {ratio === '9:16' && '(Retrato)'}
            {ratio === '4:3' && '(Clássico)'} 
            {ratio === '3:4' && '(Retrato Clássico)'}
          </option>
        ))}
      </Select>

      {/* Advanced Options Toggle */}
      <div className="border-t border-white/5 pt-4">
        <button 
          type="button" 
          onClick={() => setShowAdvanced(!showAdvanced)} 
          className="flex items-center justify-between w-full text-sm font-medium text-white/70 hover:text-white/90 transition-colors group"
        >
          <span>Opções Avançadas</span>
          {showAdvanced ? (
            <ChevronUp className="w-4 h-4 group-hover:translate-y-[-2px] transition-transform" />
          ) : (
            <ChevronDown className="w-4 h-4 group-hover:translate-y-[2px] transition-transform" />
          )}
        </button>
        
        {showAdvanced && (
          <div className="mt-4 space-y-4 p-5 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <Textarea 
              id="negative-prompt" 
              label="Instrução Negativa" 
              value={config.negativePrompt} 
              onChange={(e) => handleConfigChange('negativePrompt', e.target.value)} 
              placeholder="Ex: texto, marcas d'água, má qualidade, desfocado" 
              rows={2} 
              disabled={isLoading} 
            />
            
            <div>
              <label htmlFor="temperature" className="block text-sm font-medium text-white/90 mb-2">
                Criatividade: <span className="text-blue-400 font-mono">{config.temperature?.toFixed(1)}</span>
              </label>
              <input 
                id="temperature" 
                type="range" 
                min="0" 
                max="2" 
                step="0.1" 
                value={config.temperature} 
                onChange={(e) => handleConfigChange('temperature', parseFloat(e.target.value))} 
                className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-400 [&::-webkit-slider-thumb]:cursor-pointer hover:[&::-webkit-slider-thumb]:bg-blue-300" 
                disabled={isLoading} 
              />
              <div className="flex justify-between text-xs text-white/40 mt-1">
                <span>Conservador</span>
                <span>Criativo</span>
              </div>
            </div>
            
            <div className="flex items-end gap-2">
              <div className="flex-grow">
                <Input 
                  id="seed" 
                  label="Semente (Seed)" 
                  type="number" 
                  value={config.seed || ''} 
                  onChange={(e) => handleConfigChange('seed', parseInt(e.target.value, 10))} 
                  placeholder="Aleatório" 
                  disabled={isLoading} 
                />
              </div>
              <Button 
                type="button" 
                onClick={() => handleConfigChange('seed', Math.floor(Math.random() * 1000000))} 
                disabled={isLoading} 
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border-white/20"
              >
                <Shuffle className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <Button 
        type="submit" 
        disabled={isLoading || !prompt.trim()} 
        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 font-semibold tracking-wide shadow-lg shadow-blue-500/25"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            A Gerar...
          </span>
        ) : (
          'Gerar Imagem'
        )}
      </Button>
    </form>
  );
};

export default GenerateImagePanel;

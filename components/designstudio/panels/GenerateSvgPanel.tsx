'use client';

import React, { useState } from 'react';
import { CanvasContent, ApiFunctions } from '@/types/designstudio-full';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

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
        <h2 className="text-xl font-semibold text-white mb-2">Gerar SVG</h2>
        <p className="text-sm text-gray-400">Descreva o vetor SVG que pretende criar.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="svg-prompt">Instrução</Label>
        <Textarea
          id="svg-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ex: Um ícone minimalista de uma casa com telhado triangular"
          rows={5}
          disabled={isLoading}
          className="bg-black/20 border-white/10"
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading || !prompt.trim()}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
      >
        {isLoading ? 'A gerar...' : 'Gerar SVG'}
      </Button>
    </form>
  );
};

export default GenerateSvgPanel;

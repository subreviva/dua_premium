'use client';

import React, { useState } from 'react';
import { Upload, Maximize2, Loader2, Wand2 } from 'lucide-react';
import { CanvasContent, ApiFunctions } from '@/types/designstudio';

interface UpscaleImagePanelProps {
  canvasContent: CanvasContent;
  apiFunctions: ApiFunctions;
  onUpdateCanvas: (content: CanvasContent) => void;
}

const UpscaleImagePanel: React.FC<UpscaleImagePanelProps> = ({
  canvasContent,
  apiFunctions,
  onUpdateCanvas,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upscaleFactor, setUpscaleFactor] = useState<2 | 4>(2);

  const handleUpscale = async () => {
    if (canvasContent.type !== 'image') {
      setError('Por favor, carregue uma imagem primeiro');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Extrair base64 da imagem atual
      const base64Data = canvasContent.src.split(',')[1] || canvasContent.src;
      
      // Chamar API para upscale
      const result = await apiFunctions.upscaleImage(base64Data, canvasContent.mimeType, upscaleFactor);

      if (result) {
        onUpdateCanvas({
          type: 'image',
          src: result.src,
          mimeType: result.mimeType,
          prompt: `${canvasContent.prompt} - Upscale ${upscaleFactor}x`,
        });
      } else {
        setError('Erro ao aumentar resolução da imagem');
      }
    } catch (err) {
      console.error('Erro ao fazer upscale:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      onUpdateCanvas({
        type: 'image',
        src,
        mimeType: file.type,
        prompt: `Imagem carregada: ${file.name}`,
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-teal-500/10 rounded-xl p-6 border border-white/10">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-500/20 rounded-lg">
            <Maximize2 className="w-6 h-6 text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">Aumentar Resolução</h3>
            <p className="text-sm text-gray-400">
              Aumenta a resolução de imagens usando IA avançada. Transforma imagens em HD ou 4K mantendo a qualidade.
            </p>
          </div>
        </div>
      </div>

      {/* Upload de Imagem */}
      {canvasContent.type === 'empty' && (
        <div className="space-y-4">
          <label className="block">
            <div className="flex items-center justify-center w-full h-48 border-2 border-dashed border-white/20 rounded-xl hover:border-blue-500/50 transition-colors cursor-pointer bg-white/5">
              <div className="text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-400">
                  Clique para carregar uma imagem
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG até 10MB
                </p>
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* Configurações e Botão */}
      {canvasContent.type === 'image' && (
        <div className="space-y-4">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-sm text-gray-400 mb-2">Imagem carregada:</p>
            <p className="text-sm text-white truncate">{canvasContent.prompt}</p>
          </div>

          {/* Seletor de Fator */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">
              Fator de Ampliação
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setUpscaleFactor(2)}
                className={`py-3 px-4 rounded-lg border transition-all ${
                  upscaleFactor === 2
                    ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                }`}
              >
                <div className="text-center">
                  <div className="text-lg font-semibold">2x</div>
                  <div className="text-xs">HD</div>
                </div>
              </button>
              <button
                onClick={() => setUpscaleFactor(4)}
                className={`py-3 px-4 rounded-lg border transition-all ${
                  upscaleFactor === 4
                    ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                }`}
              >
                <div className="text-center">
                  <div className="text-lg font-semibold">4x</div>
                  <div className="text-xs">4K Ultra</div>
                </div>
              </button>
            </div>
          </div>

          <button
            onClick={handleUpscale}
            disabled={isProcessing}
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-blue-500/50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" strokeWidth={0.75} />
                Aumentar Resolução {upscaleFactor}x (6 créditos)
              </>
            )}
          </button>
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Dicas */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <h4 className="text-sm font-semibold text-white mb-2">💡 Dicas:</h4>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• 2x: Ideal para melhorar fotos para redes sociais</li>
          <li>• 4x: Perfeito para impressões e banners</li>
          <li>• A IA reconstrói detalhes perdidos na imagem original</li>
          <li>• Funciona melhor com imagens que já têm boa qualidade</li>
        </ul>
      </div>
    </div>
  );
};

export default UpscaleImagePanel;

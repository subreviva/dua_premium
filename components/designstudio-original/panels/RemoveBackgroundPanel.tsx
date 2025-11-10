'use client';

import React, { useState } from 'react';
import { Upload, Eraser, Loader2, Download } from 'lucide-react';
import { CanvasContent, ApiFunctions } from '@/types/designstudio';

interface RemoveBackgroundPanelProps {
  canvasContent: CanvasContent;
  apiFunctions: ApiFunctions;
  onUpdateCanvas: (content: CanvasContent) => void;
}

const RemoveBackgroundPanel: React.FC<RemoveBackgroundPanelProps> = ({
  canvasContent,
  apiFunctions,
  onUpdateCanvas,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRemoveBackground = async () => {
    if (canvasContent.type !== 'image') {
      setError('Por favor, carregue uma imagem primeiro');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Extrair base64 da imagem atual
      const base64Data = canvasContent.src.split(',')[1] || canvasContent.src;
      
      // Chamar API para remover fundo
      const result = await apiFunctions.removeBackground(base64Data, canvasContent.mimeType);

      if (result) {
        onUpdateCanvas({
          type: 'image',
          src: result.src,
          mimeType: result.mimeType,
          prompt: `${canvasContent.prompt} - Fundo removido`,
        });
      } else {
        setError('Erro ao remover fundo da imagem');
      }
    } catch (err) {
      console.error('Erro ao remover fundo:', err);
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
      <div className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-red-500/10 rounded-xl p-6 border border-white/10">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-500/20 rounded-lg">
            <Eraser className="w-6 h-6 text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">Remover Fundo</h3>
            <p className="text-sm text-gray-400">
              Remove automaticamente o fundo de imagens usando IA. Ideal para criar recortes profissionais.
            </p>
          </div>
        </div>
      </div>

      {/* Upload de Imagem */}
      {canvasContent.type === 'empty' && (
        <div className="space-y-4">
          <label className="block">
            <div className="flex items-center justify-center w-full h-48 border-2 border-dashed border-white/20 rounded-xl hover:border-purple-500/50 transition-colors cursor-pointer bg-white/5">
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

      {/* Botão Processar */}
      {canvasContent.type === 'image' && (
        <div className="space-y-4">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-sm text-gray-400 mb-2">Imagem carregada:</p>
            <p className="text-sm text-white truncate">{canvasContent.prompt}</p>
          </div>

          <button
            onClick={handleRemoveBackground}
            disabled={isProcessing}
            className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-purple-500/50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Removendo fundo...
              </>
            ) : (
              <>
                <Eraser className="w-5 h-5" />
                Remover Fundo (5 créditos)
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
          <li>• Funciona melhor com imagens de alta qualidade</li>
          <li>• Ideal para fotos de produtos, retratos e objetos</li>
          <li>• O resultado pode ser baixado em PNG transparente</li>
        </ul>
      </div>
    </div>
  );
};

export default RemoveBackgroundPanel;

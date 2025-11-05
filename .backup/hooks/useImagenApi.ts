'use client';

import { useState, useCallback } from 'react';

// Imagen 4 Models
export const IMAGEN_MODELS = {
  ultra: 'imagen-4.0-ultra-generate-001',
  standard: 'imagen-4.0-generate-001',
  fast: 'imagen-4.0-fast-generate-001',
  imagen3: 'imagen-3.0-generate-002',
} as const;

export type ImagenModel = keyof typeof IMAGEN_MODELS;

export interface ImagenConfig {
  numberOfImages?: number; // 1-4
  aspectRatio?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
  imageSize?: '1K' | '2K'; // Only for Standard and Ultra
  personGeneration?: 'dont_allow' | 'allow_adult' | 'allow_all';
}

export interface GeneratedImage {
  url: string;
  mimeType: string;
  prompt: string;
}

interface UseImagenApiReturn {
  generateImages: (prompt: string, model: ImagenModel, config?: ImagenConfig) => Promise<GeneratedImage[]>;
  isLoading: boolean;
  error: string | null;
  loadingMessage: string;
}

export function useImagenApi(): UseImagenApiReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('');

  const generateImages = useCallback(
    async (prompt: string, model: ImagenModel, config: ImagenConfig = {}): Promise<GeneratedImage[]> => {
      setIsLoading(true);
      setError(null);
      setLoadingMessage('🎨 Gerando imagens com Imagen...');

      try {
        const modelId = IMAGEN_MODELS[model];
        
        // Default config
        const finalConfig: ImagenConfig = {
          numberOfImages: 4,
          aspectRatio: '1:1',
          personGeneration: 'allow_adult',
          ...config,
        };

        // Image size only for Standard and Ultra
        if ((model === 'standard' || model === 'ultra') && !finalConfig.imageSize) {
          finalConfig.imageSize = '2K';
        }

        const response = await fetch('/api/imagen/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            model: modelId,
            config: finalConfig,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!data.images || data.images.length === 0) {
          throw new Error('Nenhuma imagem foi gerada');
        }

        setLoadingMessage('');
        return data.images;
        
      } catch (err: any) {
        const errorMsg = err.message || 'Erro desconhecido ao gerar imagens';
        setError(errorMsg);
        setLoadingMessage('');
        throw new Error(errorMsg);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    generateImages,
    isLoading,
    error,
    loadingMessage,
  };
}

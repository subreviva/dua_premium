'use client';

import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

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
  const [userId, setUserId] = useState<string | null>(null);

  // Obter user_id do Supabase
  useEffect(() => {
    const getUserId = async () => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUserId();
  }, []);

  const generateImages = useCallback(
    async (prompt: string, model: ImagenModel, config: ImagenConfig = {}): Promise<GeneratedImage[]> => {
      setIsLoading(true);
      setError(null);
      setLoadingMessage('🎨 Gerando imagens com Imagen...');

      try {
        // ✅ GARANTIR user_id antes de continuar
        let currentUserId = userId;
        if (!currentUserId) {
          console.warn('⚠️ User ID não disponível, tentando obter...');
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          );
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            throw new Error('Você precisa estar logado para gerar imagens');
          }
          currentUserId = user.id;
          setUserId(user.id);
        }

        const modelId = IMAGEN_MODELS[model];
        
        console.log('🎨 useImagenApi - Iniciando geração');
        console.log('User ID:', currentUserId);
        console.log('Modelo:', modelId);
        console.log('Prompt:', prompt);
        
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

        console.log('Config final:', finalConfig);

        const response = await fetch('/api/imagen/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            model: modelId,
            config: finalConfig,
            user_id: currentUserId, // ✅ Usa user_id garantido
          }),
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Erro da API:', errorData);
          
          // Se erro de API não configurada
          if (response.status === 503) {
            throw new Error(
              errorData.message || 
              '🔧 API de geração de imagens não configurada. Configure GOOGLE_API_KEY na Vercel.'
            );
          }
          
          // Se erro de créditos, redirecionar
          if (response.status === 402 && errorData.redirect) {
            const details = errorData.details;
            alert(
              `❌ Créditos Insuficientes\n\n` +
              `Necessário: ${details?.creditos_necessarios || 30} créditos\n` +
              `Você tem: ${details?.creditos_atuais || 0} créditos\n` +
              `Faltam: ${details?.faltam || 30} créditos\n\n` +
              `Redirecionando para comprar créditos...`
            );
            window.location.href = errorData.redirect;
            throw new Error('Redirecionando para compra de créditos...');
          }
          
          throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Dados recebidos:', data);
        
        if (!data.images || data.images.length === 0) {
          throw new Error('Nenhuma imagem foi gerada');
        }

        console.log(`✅ ${data.images.length} imagens geradas com sucesso`);
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
    [userId]
  );

  return {
    generateImages,
    isLoading,
    error,
    loadingMessage,
  };
}

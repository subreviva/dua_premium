'use client';

import { useState, useCallback } from 'react';
import { AspectRatio, Color, ImageObject, TrendResult, GroundingChunk, GenerationConfig, ApiFunctions } from '@/types/designstudio-full';

/**
 * Hook para integração com Google Gemini API
 * Baseado no código original DUA Design Studio
 */
export const useGoogleApi = (): ApiFunctions => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('');

  const startLoading = (initialMessage: string) => {
    setIsLoading(true);
    setError(null);
    setLoadingMessage(initialMessage);
  };

  const stopLoading = () => {
    setIsLoading(false);
    setLoadingMessage('');
  };

  const generateImage = useCallback(async (
    prompt: string,
    aspectRatio: AspectRatio,
    config?: GenerationConfig
  ): Promise<ImageObject | null> => {
    startLoading('A gerar a sua obra-prima...');
    try {
      // Call API endpoint
      const response = await fetch('/api/design/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, aspectRatio, config })
      });

      if (!response.ok) {
        throw new Error('Falha ao gerar imagem');
      }

      const data = await response.json();
      return {
        src: data.src,
        mimeType: data.mimeType || 'image/png'
      };
    } catch (e) {
      console.error(e);
      setError('Falha ao gerar imagem. Por favor, tente novamente.');
      return null;
    } finally {
      stopLoading();
    }
  }, []);

  const editImage = useCallback(async (
    base64ImageData: string,
    mimeType: string,
    prompt: string
  ): Promise<ImageObject | null> => {
    startLoading('A aplicar as suas edições criativas...');
    try {
      const response = await fetch('/api/design/edit-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64ImageData, mimeType, prompt })
      });

      if (!response.ok) {
        throw new Error('Falha ao editar imagem');
      }

      const data = await response.json();
      return {
        src: data.src,
        mimeType: data.mimeType
      };
    } catch (e) {
      console.error(e);
      setError('Falha ao editar imagem. Por favor, tente novamente.');
      return null;
    } finally {
      stopLoading();
    }
  }, []);

  const extractColorPalette = useCallback(async (
    base64ImageData: string,
    mimeType: string
  ): Promise<Color[] | null> => {
    startLoading('A analisar as cores...');
    try {
      const response = await fetch('/api/design/color-palette', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64ImageData, mimeType })
      });

      if (!response.ok) {
        throw new Error('Falha ao extrair paleta');
      }

      const data = await response.json();
      return data.palette || [];
    } catch (e) {
      console.error(e);
      setError('Falha ao extrair a paleta de cores.');
      return null;
    } finally {
      stopLoading();
    }
  }, []);

  const generateVariations = useCallback(async (
    base64ImageData: string,
    mimeType: string
  ): Promise<ImageObject[] | null> => {
    startLoading('A gerar variações criativas...');
    try {
      const response = await fetch('/api/design/variations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64ImageData, mimeType })
      });

      if (!response.ok) {
        throw new Error('Falha ao gerar variações');
      }

      const data = await response.json();
      return data.variations || [];
    } catch (e) {
      console.error(e);
      setError('Falha ao gerar variações. Por favor, tente novamente.');
      return null;
    } finally {
      stopLoading();
    }
  }, []);

  const enhancePrompt = useCallback(async (idea: string): Promise<string | null> => {
    startLoading('A melhorar a sua ideia...');
    try {
      const response = await fetch('/api/design/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea })
      });

      if (!response.ok) {
        throw new Error('Falha ao melhorar prompt');
      }

      const data = await response.json();
      return data.enhancedPrompt;
    } catch (e) {
      console.error(e);
      setError('Falha ao melhorar a instrução.');
      return null;
    } finally {
      stopLoading();
    }
  }, []);

  const generateSvgCode = useCallback(async (prompt: string): Promise<string | null> => {
    startLoading('A gerar o seu vetor SVG...');
    try {
      const response = await fetch('/api/design/generate-svg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        throw new Error('Falha ao gerar SVG');
      }

      const data = await response.json();
      return data.svgCode;
    } catch (e) {
      console.error(e);
      setError('Falha ao gerar SVG.');
      return null;
    } finally {
      stopLoading();
    }
  }, []);

  const analyzeImage = useCallback(async (
    base64ImageData: string,
    mimeType: string
  ): Promise<string | null> => {
    startLoading('A analisar a imagem...');
    try {
      const response = await fetch('/api/design/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64ImageData, mimeType })
      });

      if (!response.ok) {
        throw new Error('Falha ao analisar imagem');
      }

      const data = await response.json();
      return data.analysis;
    } catch (e) {
      console.error(e);
      setError('Falha ao analisar a imagem.');
      return null;
    } finally {
      stopLoading();
    }
  }, []);

  const researchTrends = useCallback(async (query: string): Promise<TrendResult | null> => {
    startLoading('A pesquisar tendências...');
    try {
      const response = await fetch('/api/design/research-trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        throw new Error('Falha ao pesquisar tendências');
      }

      const data = await response.json();
      return {
        text: data.text,
        sources: data.sources || []
      };
    } catch (e) {
      console.error(e);
      setError('Falha ao pesquisar tendências.');
      return null;
    } finally {
      stopLoading();
    }
  }, []);

  return {
    isLoading,
    error,
    loadingMessage,
    generateImage,
    editImage,
    extractColorPalette,
    generateVariations,
    enhancePrompt,
    generateSvgCode,
    analyzeImage,
    researchTrends
  };
};

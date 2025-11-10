import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface ImageGenerationResult {
  success: boolean;
  imageUrl?: string;
  creditsCharged: number;
  creditsRemaining: number;
  imagesGenerated: number;
  freeImagesRemaining: number;
  isFree: boolean;
}

interface ImageGenerationError {
  error: string;
  message?: string;
  freeImagesUsed?: number;
  creditsRequired?: number;
  creditsAvailable?: number;
}

export function useImageGeneration() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGeneratedImage, setLastGeneratedImage] = useState<string | null>(null);

  /**
   * Detecta se uma mensagem é um pedido de imagem
   * Padrões suportados:
   * - "gera uma imagem de..."
   * - "cria uma imagem de..."
   * - "faz uma imagem de..."
   * - "desenha..."
   * - "mostra uma imagem de..."
   * - "quero uma imagem de..."
   */
  const detectImageRequest = useCallback((message: string): string | null => {
    const patterns = [
      /(?:gera|gerar)\s+(?:uma\s+)?imagem\s+(?:de\s+)?(.+)/i,
      /(?:cria|criar)\s+(?:uma\s+)?imagem\s+(?:de\s+)?(.+)/i,
      /(?:faz|fazer)\s+(?:uma\s+)?imagem\s+(?:de\s+)?(.+)/i,
      /desenha\s+(.+)/i,
      /(?:mostra|mostrar)\s+(?:uma\s+)?imagem\s+(?:de\s+)?(.+)/i,
      /(?:quero|queria)\s+(?:uma\s+)?imagem\s+(?:de\s+)?(.+)/i,
      /mostra\s+(?:uma\s+)?imagem\s+(?:de\s+)?(.+)/i,
      /(?:quero|preciso)\s+(?:de\s+)?(?:uma\s+)?imagem\s+(?:de\s+)?(.+)/i,
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return null;
  }, []);

  /**
   * Gera uma imagem usando a API
   */
  const generateImage = useCallback(async (prompt: string): Promise<ImageGenerationResult | null> => {
    setIsGenerating(true);
    setLastGeneratedImage(null);

    try {
      const response = await fetch('/api/chat/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      // Erro 402 - Créditos insuficientes
      if (response.status === 402) {
        const errorData = data as ImageGenerationError;
        toast.error('Créditos insuficientes', {
          description: errorData.message || `Precisa de ${errorData.creditsRequired} crédito para gerar mais imagens.`,
          action: {
            label: 'Comprar Créditos',
            onClick: () => {
              window.location.href = '/pricing';
              router.push('/pricing');
            },
          },
        });
        return null;
      }

      // Outros erros
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar imagem');
      }

      // Sucesso
      const result = data as ImageGenerationResult;
      setLastGeneratedImage(result.imageUrl || null);

      // Notificação de sucesso
      if (result.isFree) {
        toast.success('Imagem gerada (GRÁTIS)', {
          description: `Você tem ${result.freeImagesRemaining} imagens grátis restantes.`,
        });
      } else {
        toast.success('Imagem gerada', {
          description: `Cobrado ${result.creditsCharged} crédito. Saldo: ${result.creditsRemaining} créditos.`,
        });
      }

      return result;

    } catch (error: any) {
      console.error('Erro ao gerar imagem:', error);
      toast.error('Erro ao gerar imagem', {
        description: error.message || 'Não foi possível gerar a imagem. Tente novamente.',
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  /**
   * Processa uma mensagem e gera imagem se necessário
   * Retorna true se detectou e processou pedido de imagem
   */
  const processMessage = useCallback(async (message: string): Promise<{
    isImageRequest: boolean;
    prompt?: string;
    result?: ImageGenerationResult | null;
  }> => {
    const prompt = detectImageRequest(message);
    
    if (!prompt) {
      return { isImageRequest: false };
    }

    const result = await generateImage(prompt);
    
    return {
      isImageRequest: true,
      prompt,
      result,
    };
  }, [detectImageRequest, generateImage]);

  return {
    isGenerating,
    lastGeneratedImage,
    detectImageRequest,
    generateImage,
    processMessage,
  };
}

import { useState, useCallback, useEffect } from 'react';
import { AspectRatio, Color, ImageObject, TrendResult, GroundingChunk, GenerationConfig } from '@/types/designstudio';
import { createClient } from '@supabase/supabase-js';

// 1. Centralizar a Configuração dos Modelos
const MODELS = {
  image: 'gemini-2.5-flash-image',         // ✅ CORRIGIDO: Modelo que GERA e EDITA imagens
  vision: 'gemini-2.5-flash',             // Para análise de imagem e texto
  text: 'gemini-2.5-flash',                // Para chat, prompts, etc.
  search: 'gemini-2.5-flash',              // Para ferramentas de pesquisa
} as const;

// ⚠️ SEGURANÇA: NUNCA usar NEXT_PUBLIC_ para API keys sensíveis!
// NEXT_PUBLIC_ expõe a variável no browser (cliente)
// API keys devem ficar APENAS no servidor

// Para desenvolvimento local com mock, detectar se estamos no browser
const isBrowser = typeof window !== 'undefined';

// Modo mock para desenvolvimento
let ai: any = null;
let GoogleGenAIModule: any, Modality: any, Type: any;

// ⚠️ REMOVIDO: Não carregar API key no cliente
// const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY;

// Se não está no browser E tem a API key no servidor, inicializar
if (!isBrowser) {
  const API_KEY = process.env.GOOGLE_API_KEY;
  if (API_KEY) {
    try {
      const genai = require('@google/genai');
      GoogleGenAIModule = genai.GoogleGenAI;
      Modality = genai.Modality;
      Type = genai.Type;
      ai = new GoogleGenAIModule({ apiKey: API_KEY, vertexai: false });
      // PRODUCTION: Removed console.log("✅ Google Gemini API configurada no servidor!");
    } catch (e) {
      // PRODUCTION: Removed console.warn("⚠️ @google/genai não instalado.");
    }
  }
}

export const useDuaApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  // Obter user_id do Supabase (igual ao useImagenApi)
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

  const startLoading = (initialMessage: string) => { setIsLoading(true); setError(null); setLoadingMessage(initialMessage); };
  const stopLoading = () => { setIsLoading(false); setLoadingMessage(''); };

  // 3. Melhorar a Gestão de Erros (dentro do wrapper)
  const getErrorMessage = (e: any): string => {
    if (e.message) {
      if (e.message.includes('SAFETY')) {
        return 'O seu pedido foi bloqueado por políticas de segurança. Tente uma instrução diferente.';
      }
      if (e.message.includes('400')) {
        return 'Pedido inválido. Verifique os dados enviados.';
      }
      if (e.message.includes('500')) {
        return 'Erro no servidor da API. Tente novamente mais tarde.';
      }
    }
    return 'Ocorreu um erro inesperado. Por favor, tente novamente.';
  };

  // 2. Abstrair a Lógica de Chamada à API
  const handleApiCall = useCallback(async <T>(
    loadingMsg: string,
    apiLogic: () => Promise<T | null>,
    mockLogic: () => Promise<T | null>
  ): Promise<T | null> => {
    startLoading(loadingMsg);
    try {
      if (!ai) {
        // PRODUCTION: Removed console.warn(`⚠️ MODO MOCK ATIVO - ${loadingMsg}`);
        return await mockLogic();
      }
      // PRODUCTION: Removed console.log(`🚀 Iniciando API Call: ${loadingMsg}`);
      return await apiLogic();
    } catch (e: any) {
      // PRODUCTION: Removed console.error(`Falha em: ${loadingMsg}`, e);
      const friendlyError = getErrorMessage(e);
      setError(friendlyError);
      return null;
    } finally {
      stopLoading();
    }
  }, []);

  const generateImage = useCallback(async (prompt: string, aspectRatio: AspectRatio, config?: GenerationConfig): Promise<ImageObject | null> => {
    return handleApiCall(
      'A gerar a sua obra-prima...',
      async () => {
        // Garantir user_id
        let currentUserId = userId;
        if (!currentUserId) {
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

        // 🔒 MODO SEGURO: Chamada via API Route (API key fica no servidor)
        const response = await fetch('/api/design-studio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'generateImage',
            prompt: prompt,
            model: MODELS.image,
            user_id: currentUserId, // ✅ Envia user_id para validar créditos
            config: {
              aspectRatio,
              ...config
            }
          })
        });

        if (!response.ok) {
          const error = await response.json();
          
          // Se erro de créditos insuficientes
          if (response.status === 402 && error.redirect) {
            const details = error.details;
            alert(
              `❌ Créditos Insuficientes\n\n` +
              `Necessário: ${details?.creditos_necessarios || 30} créditos\n` +
              `Você tem: ${details?.creditos_atuais || 0} créditos\n` +
              `Faltam: ${details?.faltam || 30} créditos\n\n` +
              `Redirecionando para comprar créditos...`
            );
            window.location.href = error.redirect;
            throw new Error('Redirecionando para compra de créditos...');
          }
          
          throw new Error(error.error || 'Erro ao gerar imagem');
        }

        const data = await response.json();
        return data.image;
      },
      async () => {
        // Mock para desenvolvimento
        await new Promise(resolve => setTimeout(resolve, 2000));
        return { src: `https://picsum.photos/seed/${Date.now()}/1024/1024`, mimeType: 'image/jpeg' };
      }
    );
  }, [handleApiCall, userId]);

  const editImage = useCallback(async (base64ImageData: string, mimeType: string, prompt: string): Promise<ImageObject | null> => {
    return handleApiCall(
      'A aplicar as suas edições criativas...',
      async () => {
        // Garantir user_id
        let currentUserId = userId;
        if (!currentUserId) {
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          );
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            throw new Error('Você precisa estar logado para editar imagens');
          }
          currentUserId = user.id;
          setUserId(user.id);
        }

        // 🔒 MODO SEGURO: Chamada via API Route
        const response = await fetch('/api/design-studio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'editImage',
            prompt,
            model: MODELS.image,
            user_id: currentUserId, // ✅ Envia user_id
            config: {
              image: {
                data: base64ImageData,
                mimeType
              }
            }
          })
        });

        if (!response.ok) {
          const error = await response.json();
          
          // Se erro de créditos insuficientes
          if (response.status === 402 && error.redirect) {
            const details = error.details;
            alert(
              `❌ Créditos Insuficientes\n\n` +
              `Necessário: ${details?.creditos_necessarios || 30} créditos\n` +
              `Você tem: ${details?.creditos_atuais || 0} créditos\n` +
              `Faltam: ${details?.faltam || 30} créditos\n\n` +
              `Redirecionando para comprar créditos...`
            );
            window.location.href = error.redirect;
            throw new Error('Redirecionando para compra de créditos...');
          }
          
          throw new Error(error.error || 'Erro ao editar imagem');
        }

        const data = await response.json();
        return data.image;
      },
      async () => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return { src: `https://picsum.photos/seed/${Date.now()}/1024/1024`, mimeType: 'image/jpeg' };
      }
    );
  }, [handleApiCall, userId]);

  const extractColorPalette = useCallback(async (base64ImageData: string, mimeType: string): Promise<Color[] | null> => {
    return handleApiCall(
      'A analisar as cores...',
      async () => {
        // 🔒 MODO SEGURO: Chamada via API Route
        const response = await fetch('/api/design-studio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'extractColorPalette',
            model: MODELS.vision,
            config: {
              image: {
                data: base64ImageData,
                mimeType
              }
            }
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erro ao extrair paleta de cores');
        }

        const data = await response.json();
        return data.palette || [];
      },
      async () => {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return [
          { hex: '#FF6B6B', name: 'Coral Vibrante' }, { hex: '#4ECDC4', name: 'Turquesa Tropical' },
          { hex: '#45B7D1', name: 'Azul Oceano' }, { hex: '#FFA07A', name: 'Salmão Claro' },
          { hex: '#98D8C8', name: 'Verde Menta' }
        ];
      }
    );
  }, [handleApiCall]);

  // 5. Otimização da Função de Variações
  const generateVariations = useCallback(async (base64ImageData: string, mimeType: string): Promise<ImageObject[] | null> => {
    return handleApiCall(
      'A gerar variações criativas...',
      async () => {
        // 🔒 MODO SEGURO: Chamada via API Route
        const response = await fetch('/api/design-studio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'generateVariations',
            model: MODELS.image,
            config: {
              image: {
                data: base64ImageData,
                mimeType
              }
            }
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erro ao gerar variações');
        }

        const data = await response.json();
        return data.variations || [];
      },
      async () => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return [
          { src: `https://picsum.photos/seed/${Date.now()}/512/512`, mimeType: 'image/jpeg' },
          { src: `https://picsum.photos/seed/${Date.now() + 1}/512/512`, mimeType: 'image/jpeg' },
          { src: `https://picsum.photos/seed/${Date.now() + 2}/512/512`, mimeType: 'image/jpeg' }
        ];
      }
    );
  }, [handleApiCall]);

  const enhancePrompt = useCallback(async (idea: string): Promise<string | null> => {
    return handleApiCall(
      'A melhorar a sua ideia...',
      async () => {
        // 🔒 MODO SEGURO: Chamada via API Route
        const response = await fetch('/api/design-studio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'chat',
            prompt: `You are a creative assistant for an image generator. Take the user's simple idea and expand it into a rich, detailed, and artistic prompt in English. User idea: "${idea}"`,
            model: MODELS.text
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erro ao melhorar prompt');
        }

        const data = await response.json();
        return data.result;
      },
      async () => {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return `A stunning and vibrant ${idea}, featuring rich colors and intricate details, with professional lighting and composition, high quality, artistic masterpiece`;
      }
    );
  }, [handleApiCall]);

  const generateSvgCode = useCallback(async (prompt: string): Promise<string | null> => {
    return handleApiCall(
      'A gerar o seu vetor SVG...',
      async () => {
        // 🔒 MODO SEGURO: Chamada via API Route
        const response = await fetch('/api/design-studio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'chat',
            prompt: `You are an expert SVG generator. Based on the following description, create a clean, valid SVG code. Do not include any text, explanation, or markdown code fences. Return ONLY the raw SVG code starting with '<svg' and ending with '</svg>'. Description: ${prompt}`,
            model: MODELS.text
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erro ao gerar SVG');
        }

        const data = await response.json();
        const svgCode = data.result.trim();
        
        if (svgCode.startsWith('<svg') && svgCode.endsWith('</svg>')) { 
          return svgCode; 
        }
        setError('O modelo não retornou um código SVG válido.');
        return null;
      },
      async () => {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><circle cx="100" cy="100" r="80" fill="#4ECDC4"/><circle cx="100" cy="100" r="50" fill="#FF6B6B"/><text x="100" y="110" font-size="14" text-anchor="middle" fill="white">MOCK SVG</text></svg>`;
      }
    );
  }, [handleApiCall]);

  const analyzeImage = useCallback(async (base64ImageData: string, mimeType: string): Promise<string | null> => {
    return handleApiCall(
      'A analisar a imagem...',
      async () => {
        // 🔒 MODO SEGURO: Chamada via API Route
        const response = await fetch('/api/design-studio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'analyzeImage',
            prompt: "Descreva esta imagem em detalhe para um 'alt' text. Seja conciso mas descritivo.",
            model: MODELS.vision,
            config: {
              image: {
                data: base64ImageData,
                mimeType
              }
            }
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erro ao analisar imagem');
        }

        const data = await response.json();
        return data.result;
      },
      async () => {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return 'Uma imagem vibrante e colorida com elementos visuais interessantes, composição equilibrada e boa iluminação. Modo MOCK ativo.';
      }
    );
  }, [handleApiCall]);

  const researchTrends = useCallback(async (query: string): Promise<TrendResult | null> => {
    return handleApiCall(
      'A pesquisar tendências...',
      async () => {
        // ⚠️ Google Search requer configuração adicional
        // TODO: Implementar via API Route quando Google Search estiver configurado
        // const response = await fetch('/api/design-studio', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     action: 'researchTrends',
        //     query,
        //     model: MODELS.search
        //   })
        // });
        
        // Por enquanto, usar mock
        await new Promise(resolve => setTimeout(resolve, 2000));
        return {
          text: `Tendências de design 2024 relacionadas com "${query}": Minimalismo, cores vibrantes, gradientes suaves, tipografia bold, elementos 3D e glassmorphism são populares. Modo MOCK ativo.`,
          sources: []
        };
      },
      async () => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return {
          text: `Tendências de design 2024 relacionadas com "${query}": Minimalismo, cores vibrantes, gradientes suaves, tipografia bold, elementos 3D e glassmorphism são populares. Modo MOCK ativo.`,
          sources: []
        };
      }
    );
  }, [handleApiCall]);

  const startChat = useCallback((): any => {
    if (!ai) {
      // PRODUCTION: Removed console.warn("⚠️ MODO MOCK ATIVO - Chat não pode ser iniciado.");
      return null;
    }
    return ai.chats.create({ model: MODELS.text, config: { systemInstruction: 'O seu nome é DUA. É a assistente criativa do estúdio DUA Design. Dê ideias, sugestões e conselhos sobre design gráfico, web design, teoria das cores e tipografia. Seja concisa e direta.' } });
  }, []);

  const sendMessageStream = useCallback(async (chat: any, message: string, onChunk: (chunk: string) => void) => {
    await handleApiCall(
      'A pensar...',
      async () => {
        const response = await chat.sendMessageStream({ message });
        for await (const chunk of response) {
          onChunk(chunk.text);
        }
        return true; // Retornar um valor para satisfazer o handleApiCall
      },
      async () => {
        const mockResponse = "Desculpe, estou em modo MOCK e não posso processar o seu pedido de chat.".split(' ');
        for (const word of mockResponse) {
          await new Promise(resolve => setTimeout(resolve, 100));
          onChunk(word + ' ');
        }
        return true;
      }
    );
  }, [handleApiCall]);

  return { isLoading, error, loadingMessage, generateImage, editImage, extractColorPalette, generateVariations, enhancePrompt, generateSvgCode, analyzeImage, researchTrends, startChat, sendMessageStream };
};

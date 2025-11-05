import { useState, useCallback } from 'react';
import { AspectRatio, Color, ImageObject, TrendResult, GroundingChunk, GenerationConfig } from '@/types/designstudio';

// 1. Centralizar a Configuração dos Modelos
const MODELS = {
  image: 'gemini-2.5-flash-image-preview', // Para geração e edição de imagem
  vision: 'gemini-2.5-flash',             // Para análise de imagem e texto
  text: 'gemini-2.5-flash',                // Para chat, prompts, etc.
  search: 'gemini-2.5-flash',              // Para ferramentas de pesquisa
} as const;

// Aceitar ambas as variáveis para compatibilidade (Vercel pode usar qualquer uma)
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY;

// 4. Tipagem - usando 'any' estrategicamente devido ao require dinâmico
let ai: any = null;
let GoogleGenAIModule: any, Modality: any, Type: any;

if (API_KEY) {
  try {
    const genai = require('@google/genai');
    GoogleGenAIModule = genai.GoogleGenAI;
    Modality = genai.Modality;
    Type = genai.Type;
    // IMPORTANTE: vertexai: false para usar API Key diretamente (não OAuth2)
    ai = new GoogleGenAIModule({ apiKey: API_KEY, vertexai: false });
    // PRODUCTION: Removed console.log("✅ Google Gemini API configurada (API Key mode)!");
  } catch (e) {
    // PRODUCTION: Removed console.warn("⚠️ @google/genai não instalado. Instale com: npm install @google/genai");
  }
} else {
  // PRODUCTION: Removed console.warn("⚠️ NEXT_PUBLIC_GOOGLE_API_KEY não configurada. Usando modo MOCK.");
}

export const useDuaApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('');

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
        let finalPrompt = prompt;
        const wantsText = /\b(text|texto|palavra|letter|escrito|escrita|escrever|com as palavras|com o texto|sign|placa|lettering|typography|font)\b/i.test(prompt);
        
        if (wantsText) {
          finalPrompt = `${prompt}, high quality, professional`;
        } else {
          finalPrompt = `${prompt}, photorealistic, high quality, professional photography, no text, no words, no letters, no watermarks`;
        }
        
        if (config?.negativePrompt) {
          finalPrompt = `${finalPrompt}. Avoid the following: ${config.negativePrompt}${wantsText ? '' : ', text, words, letters, typography, captions, watermarks'}.`;
        }
        
        // PRODUCTION: Removed console.log('📝 Prompt final:', finalPrompt);

        const response = await ai!.models.generateContent({
          model: MODELS.image,
          contents: [{ parts: [{ text: finalPrompt }] }],
        });

        const imagePart = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
        if (imagePart?.inlineData) {
          const { data, mimeType } = imagePart.inlineData;
          return { src: `data:${mimeType};base64,${data}`, mimeType };
        }
        setError('O modelo não retornou uma imagem. Tente novamente.');
        return null;
      },
      async () => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return { src: `https://picsum.photos/seed/${Date.now()}/1024/1024`, mimeType: 'image/jpeg' };
      }
    );
  }, [handleApiCall]);

  const editImage = useCallback(async (base64ImageData: string, mimeType: string, prompt: string): Promise<ImageObject | null> => {
    return handleApiCall(
      'A aplicar as suas edições criativas...',
      async () => {
        const contents = [{ role: 'user', parts: [{ text: prompt }, { inlineData: { data: base64ImageData, mimeType } }] }];
        const response = await ai!.models.generateContent({ model: MODELS.image, contents });
        
        const imagePart = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
        if (imagePart?.inlineData) {
          const { data, mimeType } = imagePart.inlineData;
          return { src: `data:${mimeType};base64,${data}`, mimeType };
        }
        setError('O modelo não retornou uma imagem editada.');
        return null;
      },
      async () => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return { src: `https://picsum.photos/seed/${Date.now()}/1024/1024`, mimeType: 'image/jpeg' };
      }
    );
  }, [handleApiCall]);

  const extractColorPalette = useCallback(async (base64ImageData: string, mimeType: string): Promise<Color[] | null> => {
    return handleApiCall(
      'A analisar as cores...',
      async () => {
        const contents = [{ role: 'user', parts: [{ inlineData: { data: base64ImageData, mimeType } }, { text: "Analise esta imagem e extraia as 5 cores mais proeminentes. Forneça um nome comum para cada cor." }] }];
        const config = { responseMimeType: 'application/json', responseSchema: { type: Type.OBJECT, properties: { palette: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { hex: { type: Type.STRING, description: "O código hexadecimal da cor, ex: '#RRGGBB'" }, name: { type: Type.STRING, description: "Um nome comum para a cor, ex: 'Azul Meia-Noite'" } } } } } } };
        const response = await ai!.models.generateContent({ model: MODELS.vision, contents, config });
        const result = JSON.parse(response.text.trim());
        return result.palette || [];
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
        const contents = [{ role: 'user', parts: [{ text: "Gere 3 variações artísticas e distintas desta imagem. Cada uma deve ter um estilo único (ex: aguarela, cyberpunk, fotorealista)." }, { inlineData: { data: base64ImageData, mimeType } }] }];
        const response = await ai!.models.generateContent({ 
          model: MODELS.image, 
          contents,
          config: { candidateCount: 3 } // Pedido explícito de 3 variações
        });
        
        const variations: ImageObject[] = response.candidates
          ?.flatMap((candidate: any) => candidate.content.parts)
          .filter((part: any) => !!part.inlineData)
          .map((part: any) => ({ src: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`, mimeType: part.inlineData.mimeType })) || [];

        if (variations.length === 0) {
          setError('O modelo não retornou nenhuma variação de imagem.');
          return null;
        }
        return variations;
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
        const contents = [{ role: 'user', parts: [{ text: `You are a creative assistant for an image generator. Take the user's simple idea and expand it into a rich, detailed, and artistic prompt in English. User idea: "${idea}"` }] }];
        const response = await ai!.models.generateContent({ model: MODELS.text, contents });
        return response.text;
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
        const contents = [{ role: 'user', parts: [{ text: `You are an expert SVG generator. Based on the following description, create a clean, valid SVG code. Do not include any text, explanation, or markdown code fences. Return ONLY the raw SVG code starting with '<svg' and ending with '</svg>'. Description: ${prompt}` }] }];
        const response = await ai!.models.generateContent({ model: MODELS.text, contents });
        const svgCode = response.text.trim();
        if (svgCode.startsWith('<svg') && svgCode.endsWith('</svg>')) { return svgCode; }
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
        const contents = [{ role: 'user', parts: [{ inlineData: { data: base64ImageData, mimeType } }, { text: "Descreva esta imagem em detalhe para um 'alt' text. Seja conciso mas descritivo." }] }];
        const response = await ai!.models.generateContent({ model: MODELS.vision, contents });
        return response.text;
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
        const response = await ai!.models.generateContent({ model: MODELS.search, contents: { role: 'user', parts: [{ text: query }] }, config: { tools: [{ googleSearch: {} }] } });
        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
        const sources = groundingMetadata?.groundingAttributions as GroundingChunk[] || [];
        return { text: response.text, sources };
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

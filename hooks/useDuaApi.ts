
import { useState, useCallback } from 'react';
import { AspectRatio, Color, ImageObject, TrendResult, GroundingChunk, GenerationConfig } from '@/types/designstudio';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
let ai: any = null;
let GoogleGenAI: any, Modality: any, Type: any;

if (API_KEY) {
  try {
    const genai = require('@google/genai');
    GoogleGenAI = genai.GoogleGenAI;
    Modality = genai.Modality;
    Type = genai.Type;
    // IMPORTANTE: vertexai: false para usar API Key diretamente (não OAuth2)
    ai = new GoogleGenAI({ apiKey: API_KEY, vertexai: false });
    console.log("✅ Google Gemini API configurada (API Key mode)!");
  } catch (e) {
    console.warn("⚠️ @google/genai não instalado. Instale com: npm install @google/genai");
  }
} else {
  console.warn("⚠️ NEXT_PUBLIC_GOOGLE_API_KEY não configurada. Usando modo MOCK.");
}

export const useDuaApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('');

  const startLoading = (initialMessage: string) => { setIsLoading(true); setError(null); setLoadingMessage(initialMessage); };
  const stopLoading = () => { setIsLoading(false); setLoadingMessage(''); };

  const generateImage = useCallback(async (prompt: string, aspectRatio: AspectRatio, config?: GenerationConfig) => {
    startLoading('A gerar a sua obra-prima...');
    
    // DEBUG: Log do estado da API
    console.log('🔍 DEBUG generateImage:', {
      hasAI: !!ai,
      hasAPIKey: !!API_KEY,
      apiKeyLength: API_KEY?.length,
      prompt: prompt.substring(0, 50)
    });
    
    try {
      // MOCK MODE se API não configurada
      if (!ai) {
        console.warn('⚠️ MODO MOCK ATIVO - API não inicializada!');
        await new Promise(resolve => setTimeout(resolve, 2000));
        const mockImage = `https://picsum.photos/seed/${Date.now()}/1024/1024`;
        return { src: mockImage, mimeType: 'image/jpeg' };
      }
      
      console.log('✅ Usando API REAL - Google Imagen 4.0');

      // Melhorar prompt automaticamente para qualidade profissional
      let finalPrompt = prompt;
      
      // Detectar se o usuário quer texto na imagem
      const wantsText = /\b(text|texto|palavra|letter|escrito|escrita|escrever|com as palavras|com o texto|sign|placa|lettering|typography|font)\b/i.test(prompt);
      
      if (wantsText) {
        // Usuário quer texto - não bloquear
        console.log('📝 Texto detectado no prompt - permitindo texto na imagem');
        finalPrompt = `${prompt}, high quality, professional`;
      } else {
        // Usuário NÃO pediu texto - bloquear para evitar texto indesejado
        console.log('🚫 Bloqueando texto indesejado');
        finalPrompt = `${prompt}, photorealistic, high quality, professional photography, no text, no words, no letters, no watermarks`;
      }
      
      if (config?.negativePrompt) {
        if (wantsText) {
          finalPrompt = `${finalPrompt}. Avoid the following: ${config.negativePrompt}.`;
        } else {
          finalPrompt = `${finalPrompt}. Avoid the following: ${config.negativePrompt}, text, words, letters, typography, captions, watermarks.`;
        }
      }
      
      console.log('📝 Prompt final:', finalPrompt);

      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: finalPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio,
          ...(config?.temperature && { temperature: config.temperature }),
          ...(config?.seed && { seed: config.seed }),
        },
      });
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      const src = `data:image/png;base64,${base64ImageBytes}`;
      return { src, mimeType: 'image/png' };
    } catch (e) { console.error(e); setError('Falha ao gerar imagem. Por favor, tente novamente.'); return null; } finally { stopLoading(); }
  }, []);

  const editImage = useCallback(async (base64ImageData: string, mimeType: string, prompt: string) => {
    startLoading('A aplicar as suas edições criativas...');
    if (!ai) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const mockImage = `https://picsum.photos/seed/${Date.now()}/1024/1024`;
      stopLoading();
      return { src: mockImage, mimeType: 'image/jpeg' };
    }
    try {
      const response = await ai.models.generateContent({ model: 'gemini-2.5-flash-image-preview', contents: { role: 'user', parts: [{ inlineData: { data: base64ImageData, mimeType: mimeType } }, { text: prompt }] }, config: { responseModalities: [Modality.IMAGE, Modality.TEXT] } });
      for (const part of response.candidates[0].content.parts) { if (part.inlineData) { const src = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`; return { src, mimeType: part.inlineData.mimeType }; } }
      setError('O modelo não retornou uma imagem. Tente uma instrução diferente.'); return null;
    } catch (e) { console.error(e); setError('Falha ao editar imagem. Por favor, tente novamente.'); return null; } finally { stopLoading(); }
  }, []);

  const extractColorPalette = useCallback(async (base64ImageData: string, mimeType: string): Promise<Color[] | null> => {
    startLoading('A analisar as cores...');
    if (!ai) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      stopLoading();
      return [
        { hex: '#FF6B6B', name: 'Coral Vibrante' },
        { hex: '#4ECDC4', name: 'Turquesa Tropical' },
        { hex: '#45B7D1', name: 'Azul Oceano' },
        { hex: '#FFA07A', name: 'Salmão Claro' },
        { hex: '#98D8C8', name: 'Verde Menta' }
      ];
    }
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: { role: 'user', parts: [{ inlineData: { data: base64ImageData, mimeType: mimeType } }, { text: "Analise esta imagem e extraia as 5 cores mais proeminentes. Forneça um nome comum para cada cor." }] }, config: { responseMimeType: 'application/json', responseSchema: { type: Type.OBJECT, properties: { palette: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { hex: { type: Type.STRING, description: "O código hexadecimal da cor, ex: '#RRGGBB'" }, name: { type: Type.STRING, description: "Um nome comum para a cor, ex: 'Azul Meia-Noite'" } } } } } } } });
        const result = JSON.parse(response.text.trim()); return result.palette || [];
    } catch (e) { console.error(e); setError('Falha ao extrair a paleta de cores. O modelo pode não ter retornado um formato válido.'); return null; } finally { stopLoading(); }
  }, []);

  const generateVariations = useCallback(async (base64ImageData: string, mimeType: string): Promise<ImageObject[] | null> => {
    startLoading('A gerar variações criativas...');
    if (!ai) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      stopLoading();
      return [
        { src: `https://picsum.photos/seed/${Date.now()}/512/512`, mimeType: 'image/jpeg' },
        { src: `https://picsum.photos/seed/${Date.now() + 1}/512/512`, mimeType: 'image/jpeg' },
        { src: `https://picsum.photos/seed/${Date.now() + 2}/512/512`, mimeType: 'image/jpeg' }
      ];
    }
    try {
      const response = await ai.models.generateContent({ model: 'gemini-2.5-flash-image-preview', contents: { role: 'user', parts: [{ inlineData: { data: base64ImageData, mimeType: mimeType } }, { text: "Gere 3 variações artísticas e distintas desta imagem. Cada uma deve ter um estilo único (ex: aguarela, cyberpunk, fotorealista). Retorne apenas as imagens." }] }, config: { responseModalities: [Modality.IMAGE] } });
      const variations: ImageObject[] = response.candidates[0].content.parts.filter((part: any) => part.inlineData).map((part: any) => ({ src: `data:${part.inlineData!.mimeType};base64,${part.inlineData!.data}`, mimeType: part.inlineData!.mimeType }));
      if (variations.length === 0) { setError('O modelo não retornou nenhuma variação de imagem. Tente novamente.'); return null; }
      return variations;
    } catch (e) { console.error(e); setError('Falha ao gerar variações. Por favor, tente novamente.'); return null; } finally { stopLoading(); }
  }, []);

  const enhancePrompt = useCallback(async (idea: string): Promise<string | null> => {
    startLoading('A melhorar a sua ideia...');
    if (!ai) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      stopLoading();
      return `A stunning and vibrant ${idea}, featuring rich colors and intricate details, with professional lighting and composition, high quality, artistic masterpiece`;
    }
    try {
      const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: { role: 'user', parts: [{ text: `You are a creative assistant for an image generator. Take the user's simple idea and expand it into a rich, detailed, and artistic prompt in English. User idea: "${idea}"` }] } });
      return response.text;
    } catch (e) { console.error(e); setError('Falha ao melhorar a instrução.'); return null; } finally { stopLoading(); }
  }, []);

  const generateSvgCode = useCallback(async (prompt: string): Promise<string | null> => {
    startLoading('A gerar o seu vetor SVG...');
    if (!ai) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      stopLoading();
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <circle cx="100" cy="100" r="80" fill="#4ECDC4"/>
  <circle cx="100" cy="100" r="50" fill="#FF6B6B"/>
  <text x="100" y="110" font-size="14" text-anchor="middle" fill="white">MOCK SVG</text>
</svg>`;
    }
    try {
      const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: { role: 'user', parts: [{ text: `You are an expert SVG generator. Based on the following description, create a clean, valid SVG code. Do not include any text, explanation, or markdown code fences. Return ONLY the raw SVG code starting with '<svg' and ending with '</svg>'. Description: ${prompt}` }] } });
      const svgCode = response.text.trim();
      if (svgCode.startsWith('<svg') && svgCode.endsWith('</svg>')) { return svgCode; }
      setError('O modelo não retornou um código SVG válido. Tente uma instrução mais simples.'); return null;
    } catch (e) { console.error(e); setError('Falha ao gerar SVG.'); return null; } finally { stopLoading(); }
  }, []);

  const analyzeImage = useCallback(async (base64ImageData: string, mimeType: string): Promise<string | null> => {
    startLoading('A analisar a imagem...');
    if (!ai) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      stopLoading();
      return 'Uma imagem vibrante e colorida com elementos visuais interessantes, composição equilibrada e boa iluminação. Modo MOCK ativo.';
    }
    try {
      const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: { role: 'user', parts: [{ inlineData: { data: base64ImageData, mimeType: mimeType } }, { text: "Descreva esta imagem em detalhe para um 'alt' text. Seja conciso mas descritivo." }] } });
      return response.text;
    } catch (e) { console.error(e); setError('Falha ao analisar a imagem.'); return null; } finally { stopLoading(); }
  }, []);

  const researchTrends = useCallback(async (query: string): Promise<TrendResult | null> => {
    startLoading('A pesquisar tendências...');
    if (!ai) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      stopLoading();
      return {
        text: `Tendências de design 2024 relacionadas com "${query}": Minimalismo, cores vibrantes, gradientes suaves, tipografia bold, elementos 3D e glassmorphism são populares. Modo MOCK ativo - instale @google/genai para pesquisas reais.`,
        sources: []
      };
    }
    try {
      const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: { role: 'user', parts: [{ text: query }] }, config: { tools: [{ googleSearch: {} }] } });
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] || [];
      return { text: response.text, sources };
    } catch (e) { console.error(e); setError('Falha ao pesquisar tendências.'); return null; } finally { stopLoading(); }
  }, []);

  const startChat = useCallback((): any => {
    return ai.chats.create({ model: 'gemini-2.5-flash', config: { systemInstruction: 'O seu nome é DUA. É a assistente criativa do estúdio DUA Design. Dê ideias, sugestões e conselhos sobre design gráfico, web design, teoria das cores e tipografia. Seja concisa e direta.' } });
  }, []);

  const sendMessageStream = useCallback(async (chat: any, message: string, onChunk: (chunk: string) => void) => {
    startLoading('A pensar...');
    try {
      const response = await chat.sendMessageStream({ message });
      for await (const chunk of response) {
        onChunk(chunk.text);
      }
    } catch (e) { console.error(e); setError('Falha ao comunicar com DUA.'); } finally { stopLoading(); }
  }, []);

  return { isLoading, error, loadingMessage, generateImage, editImage, extractColorPalette, generateVariations, enhancePrompt, generateSvgCode, analyzeImage, researchTrends, startChat, sendMessageStream };
};

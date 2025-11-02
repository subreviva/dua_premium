import { NextRequest, NextResponse } from 'next/server';

/**
 * API Endpoint: Generate Image
 * 
 * IMPORTANTE: Este é um endpoint MOCK para demonstração.
 * 
 * Para ativar a API real do Google Gemini:
 * 1. Instale: npm install @google/genai
 * 2. Configure GOOGLE_API_KEY no .env.local
 * 3. Descomente o código real abaixo e remova o mock
 */

export async function POST(request: NextRequest) {
  try {
    const { prompt, aspectRatio, config } = await request.json();

    // ========== MOCK VERSION (REMOVER EM PRODUÇÃO) ==========
    // Simula delay de API
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Retorna imagem placeholder
    const mockImage = `https://picsum.photos/seed/${Date.now()}/1024/1024`;
    
    return NextResponse.json({
      src: mockImage,
      mimeType: 'image/jpeg'
    });

    // ========== REAL GOOGLE GEMINI API (DESCOMENTAR) ==========
    /*
    const { GoogleGenAI } = require('@google/genai');
    
    const API_KEY = process.env.GOOGLE_API_KEY;
    if (!API_KEY) {
      return NextResponse.json(
        { error: 'API_KEY não configurada' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY, vertexai: true });

    let finalPrompt = prompt;
    if (config?.negativePrompt) {
      finalPrompt = `${prompt}. Avoid the following: ${config.negativePrompt}.`;
    }

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

    return NextResponse.json({
      src,
      mimeType: 'image/png'
    });
    */

  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: 'Falha ao gerar imagem' },
      { status: 500 }
    );
  }
}

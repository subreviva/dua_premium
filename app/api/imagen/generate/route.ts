import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

/**
 * API Route: /api/imagen/generate
 * 
 * Gera imagens usando os modelos Google Imagen:
 * - imagen-4.0-ultra-generate-001 (Ultra qualidade, mais lento)
 * - imagen-4.0-generate-001 (Standard, balanço perfeito)
 * - imagen-4.0-fast-generate-001 (Fast, geração rápida)
 * - imagen-3.0-generate-002 (Imagen 3)
 * 
 * Documentação oficial: https://ai.google.dev/gemini-api/docs/imagen
 */

export async function POST(req: NextRequest) {
  try {
    const { prompt, model, config } = await req.json();

    // Validação
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt é obrigatório e deve ser uma string' },
        { status: 400 }
      );
    }

    if (prompt.length > 480) {
      return NextResponse.json(
        { error: 'Prompt não pode ter mais de 480 caracteres' },
        { status: 400 }
      );
    }

    // API Key
    const API_KEY = process.env.GOOGLE_API_KEY;
    if (!API_KEY) {
      console.error('❌ GOOGLE_API_KEY não configurada');
      return NextResponse.json(
        { error: 'API Key não configurada. Configure GOOGLE_API_KEY no .env.local' },
        { status: 500 }
      );
    }

    // Inicializar cliente
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    // Configuração padrão
    const finalConfig = {
      numberOfImages: 4,
      aspectRatio: '1:1',
      personGeneration: 'allow_adult',
      ...config,
    };

    // Validar número de imagens
    if (finalConfig.numberOfImages < 1 || finalConfig.numberOfImages > 4) {
      return NextResponse.json(
        { error: 'numberOfImages deve estar entre 1 e 4' },
        { status: 400 }
      );
    }

    console.log('🎨 Gerando imagens com Imagen:', {
      model: model || 'imagen-4.0-generate-001',
      prompt: prompt.substring(0, 50) + '...',
      config: finalConfig,
    });

    // Gerar imagens
    const response = await ai.models.generateImages({
      model: model || 'imagen-4.0-generate-001',
      prompt,
      config: finalConfig,
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma imagem foi gerada pela API' },
        { status: 500 }
      );
    }

    // Processar imagens geradas
    const images = response.generatedImages.map((generatedImage: any, index: number) => {
      const imageBytes = generatedImage.image.imageBytes;
      const base64Image = `data:image/png;base64,${imageBytes}`;
      
      return {
        url: base64Image,
        mimeType: 'image/png',
        prompt: prompt,
        index: index + 1,
      };
    });

    console.log(`✅ ${images.length} imagens geradas com sucesso`);

    return NextResponse.json({
      success: true,
      images,
      model: model || 'imagen-4.0-generate-001',
      config: finalConfig,
    });

  } catch (error: any) {
    console.error('❌ Erro na API Imagen:', error);

    // Erros específicos da API
    if (error.message?.includes('API key')) {
      return NextResponse.json(
        { error: 'API Key inválida ou sem permissões para Imagen' },
        { status: 401 }
      );
    }

    if (error.message?.includes('quota')) {
      return NextResponse.json(
        { error: 'Quota da API excedida. Tente novamente mais tarde.' },
        { status: 429 }
      );
    }

    if (error.message?.includes('safety')) {
      return NextResponse.json(
        { error: 'Prompt bloqueado por políticas de segurança. Tente um prompt diferente.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Erro ao gerar imagens com Imagen' },
      { status: 500 }
    );
  }
}

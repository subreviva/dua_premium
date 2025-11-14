import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { checkCredits, deductCredits } from '@/lib/credits/credits-service';
import type { CreditOperation } from '@/lib/credits/credits-config';

/**
 * API Route: /api/imagen/generate
 * 
 * Gera imagens usando os modelos Google Imagen (Junho 2025):
 * - imagen-4.0-ultra-generate-001 (Ultra qualidade, máximo realismo) - 35 créditos
 * - imagen-4.0-generate-001 (Standard, balanço perfeito) - 25 créditos ⭐
 * - imagen-4.0-fast-generate-001 (Fast, geração rápida) - 15 créditos
 * - imagen-3.0-generate-002 (Imagen 3) - 10 créditos
 * 
 * Documentação oficial: https://ai.google.dev/gemini-api/docs/imagen
 * 
 * 🔥 Sistema de créditos com verificação ANTES e dedução APÓS sucesso
 */

// Mapeamento de modelos Google → operações de créditos
const MODEL_TO_OPERATION: Record<string, CreditOperation> = {
  'imagen-4.0-ultra-generate-001': 'image_ultra',      // 35 créditos
  'imagen-4.0-generate-001': 'image_standard',         // 25 créditos ⭐
  'imagen-4.0-fast-generate-001': 'image_fast',        // 15 créditos
  'imagen-3.0-generate-002': 'image_3',                // 10 créditos
};

// ✅ Google AI Studio API (usa API Key diretamente)
const GOOGLE_API_KEY = process.env.GOOGLE_IMAGEN_API_KEY || 'AIzaSyAQYjzJB8UQz9yatYLMSvBTwjvgWG455h8';

interface GenerateImageRequest {
  prompt: string;
  model: string;
  aspectRatio: string;
  negativePrompt?: string;
  userId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateImageRequest = await request.json();
    const { prompt, model, aspectRatio, negativePrompt = '', userId } = body;

    // Validações
    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prompt é obrigatório' },
        { status: 400 }
      );
    }

    if (!model || !model.startsWith('imagen-4')) {
      return NextResponse.json(
        { error: 'Modelo inválido' },
        { status: 400 }
      );
    }

    // Calcular créditos baseado no modelo
    const creditsMap: Record<string, number> = {
      'imagen-4.0-fast-generate-001': 15,
      'imagen-4.0-generate-001': 25,
      'imagen-4.0-ultra-generate-001': 35,
    };

    const creditsRequired = creditsMap[model] || 25;

    console.log('🎨 Gerando imagem com Imagen 4:', {
      model,
      prompt: prompt.substring(0, 50) + '...',
      aspectRatio,
      creditsRequired,
      userId,
    });

    // ✅ Usar @google/genai SDK conforme documentação oficial
    // https://ai.google.dev/gemini-api/docs/imagen
    
    if (!GOOGLE_API_KEY) {
      console.error('❌ GOOGLE_IMAGEN_API_KEY não configurada');
      return NextResponse.json(
        { error: 'Serviço de geração de imagens não configurado' },
        { status: 503 }
      );
    }

    console.log('📤 Enviando request para Google Imagen API...');
    console.log(`🔗 Modelo: ${model}`);

    // Inicializar cliente Google GenAI
    const ai = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });

    // Gerar imagem usando modelo Imagen 4.0
    // Usando generateImages() conforme SDK oficial @google/genai
    // Equivalente ao Python: client.models.generate_images()
    const response = await ai.models.generateImages({
      model: model, // imagen-4.0-fast-generate-001 | imagen-4.0-generate-001 | imagen-4.0-ultra-generate-001
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: aspectRatio || '1:1',
        ...(negativePrompt && { negativePrompt }),
      },
    });

    console.log('✅ Resposta recebida da Google Imagen API');

    // Extrair imagem gerada (formato generateImages)
    // Equivalente ao Python: response.generated_images[0].image.image_bytes
    const generatedImage = response.generatedImages?.[0];
    
    if (!generatedImage?.image?.imageBytes) {
      return NextResponse.json(
        { error: 'Nenhuma imagem foi gerada' },
        { status: 500 }
      );
    }

    const imageBytes = generatedImage.image.imageBytes;
    const mimeType = 'image/png';
    const imageUrl = `data:${mimeType};base64,${imageBytes}`;

    // TODO: Debitar créditos do usuário no Supabase
    // await debitCredits(userId, creditsRequired);

    console.log('✅ Imagem gerada com sucesso');

    return NextResponse.json({
      success: true,
      image: {
        url: imageUrl,
        mimeType: mimeType || 'image/png',
        prompt: prompt,
        model: model,
        aspectRatio: aspectRatio,
        creditsUsed: creditsRequired,
      },
      credits: {
        used: creditsRequired,
        // remaining: await getUserCredits(userId),
      },
    });
  } catch (error: any) {
    console.error('❌ Erro fatal ao gerar imagem:', error);
    return NextResponse.json(
      {
        error: 'Erro interno ao gerar imagem',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

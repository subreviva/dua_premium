import { NextRequest, NextResponse } from 'next/server';
import { checkCredits, deductCredits } from '@/lib/credits/credits-service';
import type { CreditOperation } from '@/lib/credits/credits-config';

/**
 * API Endpoint: Generate Image (5 créditos)
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
    const { user_id, prompt, aspectRatio, config } = await request.json();

    // ═══════════════════════════════════════════════════════════════
    // 🔥 PASSO 1: VALIDAR E VERIFICAR CRÉDITOS
    // ═══════════════════════════════════════════════════════════════
    
    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id é obrigatório' },
        { status: 400 }
      );
    }

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'prompt é obrigatório' },
        { status: 400 }
      );
    }

    const operation: CreditOperation = 'design_generate_image';
    console.log(`🎨 [Generate Image] Verificando créditos para ${user_id}...`);

    const creditCheck = await checkCredits(user_id, operation);

    if (!creditCheck.hasCredits) {
      console.log(`❌ [Generate Image] Créditos insuficientes: ${creditCheck.message}`);
      return NextResponse.json(
        {
          error: creditCheck.message,
          required: creditCheck.required,
          current: creditCheck.currentBalance,
          deficit: creditCheck.deficit,
        },
        { status: 402 } // Payment Required
      );
    }

    console.log(`✅ [Generate Image] Créditos OK (saldo: ${creditCheck.currentBalance}, necessário: ${creditCheck.required})`);

    // ═══════════════════════════════════════════════════════════════
    // 🔥 PASSO 2: GERAR IMAGEM
    // ═══════════════════════════════════════════════════════════════

    // ========== MOCK VERSION (REMOVER EM PRODUÇÃO) ==========
    // Simula delay de API
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Retorna imagem placeholder
    const mockImage = `https://picsum.photos/seed/${Date.now()}/1024/1024`;
    
    // ═══════════════════════════════════════════════════════════════
    // 🔥 PASSO 3: DEDUZIR CRÉDITOS APÓS SUCESSO
    // ═══════════════════════════════════════════════════════════════

    console.log(`💰 [Generate Image] Deduzindo ${creditCheck.required} créditos...`);
    const deduction = await deductCredits(user_id, operation, {
      prompt: prompt.substring(0, 100),
      aspectRatio: aspectRatio || '1:1',
      model: 'mock',
    });

    if (!deduction.success) {
      console.error(`❌ [Generate Image] Falha ao deduzir créditos: ${deduction.error}`);
    } else {
      console.log(`✅ [Generate Image] Créditos deduzidos! Novo saldo: ${deduction.newBalance}`);
    }

    return NextResponse.json({
      success: true,
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
        { status: 503 }
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

    // ═══════════════════════════════════════════════════════════════
    // 🔥 PASSO 3: DEDUZIR CRÉDITOS APÓS SUCESSO
    // ═══════════════════════════════════════════════════════════════

    console.log(`💰 [Generate Image] Deduzindo ${creditCheck.required} créditos...`);
    const deduction = await deductCredits(user_id, operation, {
      prompt: prompt.substring(0, 100),
      aspectRatio: aspectRatio || '1:1',
      model: 'imagen-4.0-generate-001',
    });

    if (!deduction.success) {
      console.error(`❌ [Generate Image] Falha ao deduzir créditos: ${deduction.error}`);
    } else {
      console.log(`✅ [Generate Image] Créditos deduzidos! Novo saldo: ${deduction.newBalance}`);
    }

    return NextResponse.json({
      success: true,
      src,
      mimeType: 'image/png'
    });
    */

  } catch (error) {
    console.error('❌ [Generate Image] Erro:', error);
    return NextResponse.json(
      { error: 'Falha ao gerar imagem' },
      { status: 500 }
    );
  }
}


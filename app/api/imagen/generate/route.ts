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

export async function POST(req: NextRequest) {
  try {
    const { prompt, model, config, user_id } = await req.json();

    // 🔥 VALIDAÇÃO: userId obrigatório
    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id é obrigatório para gerar imagem' },
        { status: 400 }
      );
    }

    // Validação do prompt
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

    // ========================================
    // 🔥 PASSO 1: VERIFICAR CRÉDITOS ANTES
    // ========================================
    
    const modelId = model || 'imagen-4.0-generate-001';
    const operation = MODEL_TO_OPERATION[modelId] || 'image_standard';

    console.log(`🎨 [Imagen] Verificando créditos para usuário ${user_id} (modelo: ${modelId})...`);
    const creditCheck = await checkCredits(user_id, operation);

    if (!creditCheck.hasCredits) {
      console.log(`❌ [Imagen] Créditos insuficientes: ${creditCheck.message}`);
      return NextResponse.json(
        {
          error: 'Créditos insuficientes',
          required: creditCheck.required,
          current: creditCheck.currentBalance,
          deficit: creditCheck.deficit,
          message: creditCheck.message,
          model: modelId,
          redirect: '/loja-creditos',
        },
        { status: 402 } // 402 Payment Required
      );
    }

    console.log(`✅ [Imagen] Créditos OK (saldo: ${creditCheck.currentBalance}, necessário: ${creditCheck.required})`);

    // ========================================
    // 🔥 PASSO 2: GERAR IMAGEM
    // ========================================
    
    const API_KEY = process.env.GOOGLE_API_KEY;
    if (!API_KEY) {
      console.error('❌ GOOGLE_API_KEY não configurada');
      return NextResponse.json(
        { 
          error: 'Serviço de geração de imagens não configurado',
          message: 'A variável GOOGLE_API_KEY não está configurada no servidor. Configure-a na Vercel em: Settings > Environment Variables',
          docs: 'https://ai.google.dev/gemini-api/docs/api-key'
        },
        { status: 503 }
      );
    }

    console.log('�� Iniciando geração de imagem...');
    console.log('📝 Prompt:', prompt);
    console.log('🤖 Modelo:', modelId);
    console.log('⚙️ Config:', finalConfig);

    // Inicializar cliente
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    console.log('🚀 Chamando Google Imagen API...');

    // Gerar imagens
    let response;
    try {
      response = await ai.models.generateImages({
        model: modelId,
        prompt,
        config: finalConfig,
      });
    } catch (apiError: any) {
      console.error('❌ [Imagen] Erro ao gerar imagem:', apiError);
      // NÃO deduzir créditos se API falhou
      
      // Erros específicos da API
      if (apiError.message?.includes('API key')) {
        return NextResponse.json(
          { error: 'API Key inválida ou sem permissões para Imagen' },
          { status: 401 }
        );
      }

      if (apiError.message?.includes('quota')) {
        return NextResponse.json(
          { error: 'Quota da API excedida. Tente novamente mais tarde.' },
          { status: 429 }
        );
      }

      if (apiError.message?.includes('safety')) {
        return NextResponse.json(
          { error: 'Prompt bloqueado por políticas de segurança. Tente um prompt diferente.' },
          { status: 400 }
        );
      }

      throw apiError;
    }
    
    console.log('✅ Resposta recebida da API');

    if (!response.generatedImages || response.generatedImages.length === 0) {
      // NÃO deduzir créditos se nenhuma imagem foi gerada
      return NextResponse.json(
        { error: 'Nenhuma imagem foi gerada pela API' },
        { status: 500 }
      );
    }

    // ========================================
    // 🔥 PASSO 3: DEDUZIR CRÉDITOS APÓS SUCESSO
    // ========================================

    console.log(`💰 [Imagen] Deduzindo ${creditCheck.required} créditos (${operation})...`);
    const deduction = await deductCredits(user_id, operation, {
      prompt: prompt.substring(0, 100),
      model: modelId,
      numberOfImages: finalConfig.numberOfImages,
      aspectRatio: finalConfig.aspectRatio,
    });

    if (!deduction.success) {
      console.error(`❌ [Imagen] Falha ao deduzir créditos: ${deduction.error}`);
      // Imagens foram geradas mas créditos não foram deduzidos
      // Log crítico para análise posterior
      console.error('⚠️ [CRITICAL] Imagens geradas sem cobrança de créditos!', {
        user_id,
        model: modelId,
        error: deduction.error,
      });
    } else {
      console.log(`✅ [Imagen] Créditos deduzidos! Novo saldo: ${deduction.newBalance}`);
    }

    // Processar imagens geradas
    const images = response.generatedImages.map((generatedImage: any, index: number) => {
      const imageBytes = generatedImage.image.imageBytes;
      const base64Image = `data:image/png;base64,${imageBytes}`;
      
      return {
        url: base64Image,
        mimeType: 'image/png',
        index: index + 1,
      };
    });

    console.log(`✅ ${images.length} imagens geradas com sucesso`);

    return NextResponse.json({
      success: true,
      images,
      model: modelId,
      config: finalConfig,
      creditsUsed: creditCheck.required,
      newBalance: deduction.newBalance,
      transactionId: deduction.transactionId,
    });

  } catch (error: any) {
    console.error('❌ Erro na API Imagen:', error);
    console.error('Stack:', error.stack);

    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

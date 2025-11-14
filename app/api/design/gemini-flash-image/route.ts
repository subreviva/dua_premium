import { NextRequest, NextResponse } from 'next/server';
import { checkCredits, deductCredits } from '@/lib/credits/credits-service';
import type { CreditOperation } from '@/lib/credits/credits-config';

/**
 * API Route: /api/design/gemini-flash-image
 * 
 * 🚀 Gemini 2.5 Flash Image (Novembro 2025)
 * 
 * Modelo: gemini-2.5-flash-image
 * Custo: 5 créditos por geração
 * 
 * Capacidades:
 * - Texto → Imagem (Text-to-Image)
 * - Texto + Imagem → Imagem (Image Editing)
 * - Múltiplas imagens + Texto → Composição
 * - Preservação de detalhes de alta fidelidade
 * - Suporte a aspect ratios configuráveis (1:1, 16:9, 9:16, 4:3, 3:4)
 * - Response modalities: Text+Image ou só Image
 * 
 * Documentação: https://ai.google.dev/gemini-api/docs/imagen
 * 
 * 🔥 Sistema de créditos: checkCredits ANTES → execute → deductCredits APÓS
 */

// ============================================
// 🎨 TIPOS
// ============================================

interface GeminiFlashImageRequest {
  user_id: string;                    // Obrigatório
  prompt: string;                     // Texto descritivo
  image?: string;                     // Base64 ou URL para edição (opcional)
  images?: string[];                  // Múltiplas imagens para composição (opcional)
  
  config?: {
    aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';  // Padrão: 1:1
    responseModalities?: Array<'Text' | 'Image'>;            // Padrão: ['Text', 'Image']
    numberOfImages?: number;                                 // 1-4, padrão: 1
  };
}

// ============================================
// 🚀 POST: Gerar/Editar Imagem
// ============================================

export async function POST(req: NextRequest) {
  try {
    const body: GeminiFlashImageRequest = await req.json();
    const { user_id, prompt, image, images, config } = body;

    // ═══════════════════════════════════════════════════════════════════
    // 🔥 VALIDAÇÃO 1: user_id obrigatório
    // ═══════════════════════════════════════════════════════════════════
    
    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id é obrigatório' },
        { status: 400 }
      );
    }

    // ═══════════════════════════════════════════════════════════════════
    // 🔥 VALIDAÇÃO 2: prompt obrigatório
    // ═══════════════════════════════════════════════════════════════════
    
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'prompt é obrigatório e deve ser uma string não-vazia' },
        { status: 400 }
      );
    }

    if (prompt.length > 2000) {
      return NextResponse.json(
        { error: 'prompt não pode exceder 2000 caracteres' },
        { status: 400 }
      );
    }

    // ═══════════════════════════════════════════════════════════════════
    // 🔥 VALIDAÇÃO 3: numberOfImages (1-4)
    // ═══════════════════════════════════════════════════════════════════
    
    const numberOfImages = config?.numberOfImages || 1;
    if (numberOfImages < 1 || numberOfImages > 4) {
      return NextResponse.json(
        { error: 'numberOfImages deve estar entre 1 e 4' },
        { status: 400 }
      );
    }

    // ═══════════════════════════════════════════════════════════════════
    // 🔥 PASSO 1: VERIFICAR CRÉDITOS ANTES
    // ═══════════════════════════════════════════════════════════════════
    
    const operation: CreditOperation = 'design_gemini_flash_image';
    
    console.log(`🎨 [Gemini Flash Image] Verificando créditos para ${user_id}...`);
    const creditCheck = await checkCredits(user_id, operation);

    if (!creditCheck.hasCredits) {
      console.log(`❌ [Gemini Flash Image] Créditos insuficientes: ${creditCheck.message}`);
      return NextResponse.json(
        {
          error: 'Créditos insuficientes',
          required: creditCheck.required,
          current: creditCheck.currentBalance,
          deficit: creditCheck.deficit,
          message: creditCheck.message,
          redirect: '/comprar',
        },
        { status: 402 } // 402 Payment Required
      );
    }

    console.log(`✅ [Gemini Flash Image] Créditos OK (saldo: ${creditCheck.currentBalance}, necessário: ${creditCheck.required})`);

    // ═══════════════════════════════════════════════════════════════════
    // 🔥 PASSO 2: GERAR/EDITAR IMAGEM COM GEMINI 2.5 FLASH IMAGE
    // ═══════════════════════════════════════════════════════════════════
    
    const API_KEY = process.env.GOOGLE_API_KEY;
    if (!API_KEY) {
      console.error('❌ GOOGLE_API_KEY não configurada');
      return NextResponse.json(
        { 
          error: 'Serviço de geração de imagens não configurado',
          message: 'GOOGLE_API_KEY não está configurada no servidor',
          docs: 'https://ai.google.dev/gemini-api/docs/api-key'
        },
        { status: 503 }
      );
    }

    console.log('🎨 Iniciando geração com Gemini 2.5 Flash Image...');
    console.log(`📝 Prompt: ${prompt.substring(0, 100)}...`);
    console.log(`⚙️ Aspect Ratio: ${config?.aspectRatio || '1:1'}`);
    console.log(`🖼️  Número de imagens: ${numberOfImages}`);

    // Importar Google GenAI SDK
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(API_KEY);

    // Configurar modelo
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-image'
    });

    // Preparar conteúdo
    let parts: any[] = [{ text: prompt }];

    // Adicionar imagem(ns) se fornecida(s)
    if (image) {
      // Edição de imagem única
      const imageData = image.startsWith('data:') 
        ? image.split(',')[1] 
        : image;
      
      parts.push({
        inlineData: {
          mimeType: 'image/png',
          data: imageData
        }
      });
      console.log('🖼️  Modo: Edição de imagem (1 imagem fornecida)');
    } else if (images && images.length > 0) {
      // Composição com múltiplas imagens
      for (const img of images) {
        const imgData = img.startsWith('data:') ? img.split(',')[1] : img;
        parts.push({
          inlineData: {
            mimeType: 'image/png',
            data: imgData
          }
        });
      }
      console.log(`🖼️  Modo: Composição (${images.length} imagens fornecidas)`);
    } else {
      console.log('🖼️  Modo: Texto → Imagem (sem imagens de entrada)');
    }

    // Configuração de geração (seguindo documentação oficial)
    const generationConfig: any = {
      // Response modalities: ['Text', 'Image'] (padrão) ou ['Image'] (só imagens)
      ...(config?.responseModalities && {
        response_modalities: config.responseModalities
      }),
      
      // Aspect ratio dentro de image_config
      ...(config?.aspectRatio && {
        image_config: {
          aspect_ratio: config.aspectRatio
        }
      }),
      
      // Número de imagens a gerar (1-4)
      candidate_count: numberOfImages,
    };

    console.log('🚀 Chamando Gemini 2.5 Flash Image API...');

    // Gerar imagem
    let result;
    try {
      result = await model.generateContent({
        contents: [{ role: 'user', parts }],
        generationConfig,
      });
    } catch (apiError: any) {
      console.error('❌ [Gemini Flash Image] Erro ao gerar imagem:', apiError);
      
      // NÃO deduzir créditos se API falhou
      
      // Erros específicos da API
      if (apiError.message?.includes('API key')) {
        return NextResponse.json(
          { error: 'API Key inválida ou sem permissões para Gemini' },
          { status: 401 }
        );
      }

      if (apiError.message?.includes('quota') || apiError.message?.includes('RESOURCE_EXHAUSTED')) {
        return NextResponse.json(
          { error: 'Quota da API excedida. Tente novamente mais tarde.' },
          { status: 429 }
        );
      }

      if (apiError.message?.includes('safety') || apiError.message?.includes('SAFETY')) {
        return NextResponse.json(
          { 
            error: 'Prompt bloqueado por políticas de segurança',
            message: 'Tente um prompt diferente que não viole as diretrizes de conteúdo'
          },
          { status: 400 }
        );
      }

      throw apiError;
    }

    console.log('✅ Resposta recebida da API');

    // Processar resposta
    const response = await result.response;
    const parts_response = response.candidates?.[0]?.content?.parts || [];

    if (parts_response.length === 0) {
      // NÃO deduzir créditos se nenhuma imagem foi gerada
      return NextResponse.json(
        { error: 'Nenhuma imagem foi gerada pela API' },
        { status: 500 }
      );
    }

    // Extrair texto e imagens
    let textResponse: string | null = null;
    const generatedImages: Array<{ url: string; mimeType: string; index: number }> = [];

    for (const part of parts_response) {
      if (part.text) {
        textResponse = part.text;
      } else if (part.inlineData) {
        const base64Image = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        generatedImages.push({
          url: base64Image,
          mimeType: part.inlineData.mimeType || 'image/png',
          index: generatedImages.length + 1,
        });
      }
    }

    if (generatedImages.length === 0) {
      // NÃO deduzir créditos se nenhuma imagem foi gerada
      return NextResponse.json(
        { error: 'Nenhuma imagem foi gerada pela API (somente texto retornado)' },
        { status: 500 }
      );
    }

    console.log(`✅ ${generatedImages.length} imagem(ns) gerada(s) com sucesso`);

    // ═══════════════════════════════════════════════════════════════════
    // 🔥 PASSO 3: DEDUZIR CRÉDITOS APÓS SUCESSO
    // ═══════════════════════════════════════════════════════════════════

    console.log(`💰 [Gemini Flash Image] Deduzindo ${creditCheck.required} créditos...`);
    const deduction = await deductCredits(user_id, operation, {
      prompt: prompt.substring(0, 100),
      model: 'gemini-2.5-flash-image',
      numberOfImages: generatedImages.length,
      aspectRatio: config?.aspectRatio || '1:1',
      hasInputImage: !!image || (images && images.length > 0),
      mode: image ? 'edit' : (images && images.length > 0) ? 'compose' : 'generate',
    });

    if (!deduction.success) {
      console.error(`❌ [Gemini Flash Image] Falha ao deduzir créditos: ${deduction.error}`);
      // Imagens foram geradas mas créditos não foram deduzidos
      // Log crítico para análise posterior
      console.error('⚠️ [CRITICAL] Imagens geradas sem cobrança de créditos!', {
        user_id,
        model: 'gemini-2.5-flash-image',
        error: deduction.error,
      });
    } else {
      console.log(`✅ [Gemini Flash Image] Créditos deduzidos! Novo saldo: ${deduction.newBalance}`);
    }

    // ═══════════════════════════════════════════════════════════════════
    // ✅ RETORNAR RESPOSTA COMPLETA
    // ═══════════════════════════════════════════════════════════════════

    return NextResponse.json({
      success: true,
      images: generatedImages,
      text: textResponse,
      model: 'gemini-2.5-flash-image',
      config: {
        aspectRatio: config?.aspectRatio || '1:1',
        numberOfImages: generatedImages.length,
      },
      creditsUsed: creditCheck.required,
      newBalance: deduction.newBalance,
      transactionId: deduction.transactionId,
    });

  } catch (error: any) {
    console.error('❌ Erro na API Gemini Flash Image:', error);
    console.error('Stack:', error.stack);

    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

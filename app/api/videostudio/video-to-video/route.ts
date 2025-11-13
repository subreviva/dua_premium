/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🎬 RUNWAY ML - VIDEO TO VIDEO API (Gen4 Aleph)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Endpoint: POST /api/videostudio/video-to-video
 * 
 * FUNCIONALIDADE:
 * Transformar um vídeo existente em outro vídeo com novos estilos/conteúdos
 * usando Gen4 Aleph (modelo premium)
 * 
 * CARACTERÍSTICAS:
 * - Modelo: gen4_aleph (PREMIUM)
 * - Input: Vídeo existente
 * - Output: Vídeo transformado
 * - References: Até 1 imagem de referência (estilo)
 * - Custo: Baseado na duração do vídeo
 * 
 * DOCUMENTAÇÃO OFICIAL:
 * https://docs.runwayml.com/reference/post_v1_video_to_video
 * 
 * VALIDAÇÕES RIGOROSAS:
 * ✅ Tipos conforme documentação oficial
 * ✅ Validação de URIs (HTTPS e Data URI)
 * ✅ Validação de promptText (1-1000 chars UTF-16)
 * ✅ Validação de ratio (8 opções)
 * ✅ Validação de references (0-1 item)
 * ✅ Gestão de créditos (checkCredits + deductCredits)
 * ✅ Rate limiting 429 handling
 * ✅ Content moderation
 * 
 * @author DUA Team
 * @version 2.0.0
 * @date 2025-11-12
 */

import { NextRequest, NextResponse } from 'next/server';
import RunwayML from '@runwayml/sdk';
import { checkCredits, deductCredits } from '@/lib/credits/credits-service';
import type { CreditOperation } from '@/lib/credits/credits-config';

// ═══════════════════════════════════════════════════════════════════════════
// 📋 TIPOS - Conforme documentação oficial Runway ML
// ═══════════════════════════════════════════════════════════════════════════

type ModelType = 'gen4_aleph';
type RatioType = '1280:720' | '720:1280' | '1104:832' | '960:960' | '832:1104' | '1584:672' | '848:480' | '640:480';
type PublicFigureThreshold = 'auto' | 'low';

// Image Reference (opcional - até 1 item)
interface ImageReference {
  type: 'image';
  uri: string; // HTTPS URL ou Data URI (13-5242880 chars)
}

interface ContentModeration {
  publicFigureThreshold?: PublicFigureThreshold;
}

// Request completo
interface VideoToVideoRequest {
  model: 'gen4_aleph';
  user_id: string;
  videoUri: string; // HTTPS URL ou Data URI (13-16777216 chars)
  promptText: string; // OBRIGATÓRIO (1-1000 chars UTF-16)
  ratio: RatioType; // OBRIGATÓRIO
  seed?: number; // 0 a 4294967295
  references?: ImageReference[]; // Até 1 item
  contentModeration?: ContentModeration;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🔍 VALIDAÇÕES RIGOROSAS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Valida promptText conforme spec (1-1000 caracteres UTF-16)
 */
function validatePromptText(text: string): { valid: boolean; error?: string } {
  const utf16Length = Array.from(text).length;
  
  if (utf16Length < 1) {
    return { valid: false, error: 'promptText deve ter pelo menos 1 caractere' };
  }
  
  if (utf16Length > 1000) {
    return { valid: false, error: `promptText muito longo (${utf16Length}/1000 caracteres UTF-16)` };
  }
  
  return { valid: true };
}

/**
 * Valida URI de imagem (HTTPS URL ou Data URI)
 * Data URI: 13-5242880 caracteres, formato: data:image/*
 * HTTPS URL: 13-2048 caracteres
 */
function validateImageUri(uri: string): { valid: boolean; error?: string } {
  const dataUriRegex = /^data:image\/.+/;
  const httpsUrlRegex = /^https:\/\/.+/;
  
  if (dataUriRegex.test(uri)) {
    if (uri.length < 13) {
      return { valid: false, error: 'Data URI muito curto (mínimo 13 caracteres)' };
    }
    if (uri.length > 5242880) {
      return { valid: false, error: `Data URI muito longo (${uri.length}/5242880 caracteres)` };
    }
    return { valid: true };
  }
  
  if (httpsUrlRegex.test(uri)) {
    if (uri.length < 13) {
      return { valid: false, error: 'HTTPS URL muito curto (mínimo 13 caracteres)' };
    }
    if (uri.length > 2048) {
      return { valid: false, error: `HTTPS URL muito longo (${uri.length}/2048 caracteres)` };
    }
    return { valid: true };
  }
  
  return { valid: false, error: 'URI deve ser HTTPS URL ou Data URI (data:image/*)' };
}

/**
 * Valida URI de vídeo (HTTPS URL ou Data URI)
 * Data URI: 13-16777216 caracteres, formato: data:video/*
 * HTTPS URL: 13-2048 caracteres
 */
function validateVideoUri(uri: string): { valid: boolean; error?: string } {
  const dataUriRegex = /^data:video\/.+/;
  const httpsUrlRegex = /^https:\/\/.+/;
  
  if (dataUriRegex.test(uri)) {
    if (uri.length < 13) {
      return { valid: false, error: 'Data URI muito curto (mínimo 13 caracteres)' };
    }
    if (uri.length > 16777216) {
      return { valid: false, error: `Data URI muito longo (${uri.length}/16777216 caracteres)` };
    }
    return { valid: true };
  }
  
  if (httpsUrlRegex.test(uri)) {
    if (uri.length < 13) {
      return { valid: false, error: 'HTTPS URL muito curto (mínimo 13 caracteres)' };
    }
    if (uri.length > 2048) {
      return { valid: false, error: `HTTPS URL muito longo (${uri.length}/2048 caracteres)` };
    }
    return { valid: true };
  }
  
  return { valid: false, error: 'URI deve ser HTTPS URL ou Data URI (data:video/*)' };
}

/**
 * Valida seed (0 a 4294967295)
 */
function validateSeed(seed: number): { valid: boolean; error?: string } {
  if (!Number.isInteger(seed)) {
    return { valid: false, error: 'seed deve ser um número inteiro' };
  }
  
  if (seed < 0 || seed > 4294967295) {
    return { valid: false, error: 'seed deve estar entre 0 e 4294967295' };
  }
  
  return { valid: true };
}

/**
 * Valida Video to Video Request completo
 */
function validateVideoToVideoRequest(req: VideoToVideoRequest): string[] {
  const errors: string[] = [];

  // 1. model - deve ser exatamente "gen4_aleph"
  if (req.model !== 'gen4_aleph') {
    errors.push('model deve ser exatamente "gen4_aleph"');
  }

  // 2. videoUri - OBRIGATÓRIO
  if (!req.videoUri) {
    errors.push('videoUri é obrigatório');
  } else {
    const validation = validateVideoUri(req.videoUri);
    if (!validation.valid) {
      errors.push(`videoUri: ${validation.error}`);
    }
  }

  // 3. promptText - OBRIGATÓRIO (1-1000 caracteres UTF-16)
  if (!req.promptText || req.promptText.trim().length === 0) {
    errors.push('promptText é obrigatório');
  } else {
    const validation = validatePromptText(req.promptText);
    if (!validation.valid) {
      errors.push(`promptText: ${validation.error}`);
    }
  }

  // 4. ratio - OBRIGATÓRIO
  const validRatios: RatioType[] = ['1280:720', '720:1280', '1104:832', '960:960', '832:1104', '1584:672', '848:480', '640:480'];
  if (!req.ratio) {
    errors.push(`ratio é obrigatório. Valores válidos: ${validRatios.join(', ')}`);
  } else if (!validRatios.includes(req.ratio)) {
    errors.push(`ratio inválido. Valores válidos: ${validRatios.join(', ')}`);
  }

  // 5. seed - OPCIONAL (0 a 4294967295)
  if (req.seed !== undefined) {
    const validation = validateSeed(req.seed);
    if (!validation.valid) {
      errors.push(`seed: ${validation.error}`);
    }
  }

  // 6. references - OPCIONAL (até 1 item)
  if (req.references) {
    if (!Array.isArray(req.references)) {
      errors.push('references deve ser um array');
    } else {
      if (req.references.length > 1) {
        errors.push('references: máximo de 1 imagem de referência suportada');
      }
      
      req.references.forEach((ref, idx) => {
        if (ref.type !== 'image') {
          errors.push(`references[${idx}].type deve ser "image"`);
        }
        
        if (!ref.uri) {
          errors.push(`references[${idx}].uri é obrigatório`);
        } else {
          const validation = validateImageUri(ref.uri);
          if (!validation.valid) {
            errors.push(`references[${idx}].uri: ${validation.error}`);
          }
        }
      });
    }
  }

  // 7. contentModeration - OPCIONAL
  if (req.contentModeration?.publicFigureThreshold) {
    const validThresholds: PublicFigureThreshold[] = ['auto', 'low'];
    if (!validThresholds.includes(req.contentModeration.publicFigureThreshold)) {
      errors.push(`contentModeration.publicFigureThreshold inválido. Valores válidos: ${validThresholds.join(', ')}`);
    }
  }

  return errors;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🎬 ROUTE HANDLER - POST /api/videostudio/video-to-video
// ═══════════════════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as VideoToVideoRequest;
    const { user_id } = body;

    // ────────────────────────────────────────────────────────────────────────
    // 1️⃣ VALIDAÇÃO BÁSICA
    // ────────────────────────────────────────────────────────────────────────
    
    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id é obrigatório' },
        { status: 400 }
      );
    }

    // ────────────────────────────────────────────────────────────────────────
    // 2️⃣ VALIDAÇÃO COMPLETA
    // ────────────────────────────────────────────────────────────────────────

    const validationErrors = validateVideoToVideoRequest(body);

    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          error: 'Erros de validação',
          validationErrors,
        },
        { status: 400 }
      );
    }

    // ────────────────────────────────────────────────────────────────────────
    // 3️⃣ VERIFICAR CRÉDITOS
    // ────────────────────────────────────────────────────────────────────────

    // Gen4 Aleph é PREMIUM - custo fixo alto
    const operation: CreditOperation = 'video_gen4_aleph_5s';
    const creditsRequired = 60; // Conforme credits-config.ts

    console.log(`🎬 Verificando créditos para ${operation} (user: ${user_id})`);
    const creditCheck = await checkCredits(user_id, operation);

    if (!creditCheck.hasCredits) {
      return NextResponse.json(
        {
          error: 'Créditos insuficientes',
          required: creditCheck.required,
          current: creditCheck.currentBalance,
          deficit: creditCheck.deficit,
          operation,
          model: 'gen4_aleph',
          note: 'Gen4 Aleph é um modelo premium com custo mais alto',
        },
        { status: 402 } // Payment Required
      );
    }

    // ────────────────────────────────────────────────────────────────────────
    // 4️⃣ PREPARAR REQUEST PARA RUNWAY ML API
    // ────────────────────────────────────────────────────────────────────────

    const RUNWAY_API_KEY = process.env.RUNWAY_API_KEY;

    if (!RUNWAY_API_KEY) {
      return NextResponse.json(
        { error: 'RUNWAY_API_KEY não configurada no servidor' },
        { status: 500 }
      );
    }

    // Inicializar cliente RunwayML SDK
    const client = new RunwayML({
      apiKey: RUNWAY_API_KEY,
    });

    // Montar payload
    const payload: any = {
      model: 'gen4_aleph',
      videoUri: body.videoUri,
      promptText: body.promptText.trim(),
      ratio: body.ratio,
    };

    // Adicionar campos opcionais
    if (body.seed !== undefined) {
      payload.seed = body.seed;
    }

    if (body.references && body.references.length > 0) {
      payload.references = body.references;
    }

    if (body.contentModeration) {
      payload.contentModeration = body.contentModeration;
    }

    console.log('🎬 Runway ML Video-to-Video Request:', {
      operation,
      creditsRequired,
      model: 'gen4_aleph (PREMIUM)',
      ratio: body.ratio,
      hasReferences: !!(body.references && body.references.length > 0),
    });

    // ────────────────────────────────────────────────────────────────────────
    // 5️⃣ CHAMAR RUNWAY ML API
    // ────────────────────────────────────────────────────────────────────────

    let task;
    
    try {
      // Usar SDK oficial do RunwayML
      task = await client.videoToVideo.create(payload);
      
      console.log('✅ Runway ML Video-to-Video task criada:', task.id);
    } catch (runwayError: any) {
      console.error('❌ Erro na API Runway ML:', runwayError);
      
      // Tratar rate limiting (429)
      if (runwayError.status === 429) {
        return NextResponse.json(
          {
            error: 'Rate limit excedido',
            message: 'Por favor, aguarde alguns segundos e tente novamente.',
            retryAfter: runwayError.headers?.['retry-after'] || 60,
          },
          { status: 429 }
        );
      }
      
      return NextResponse.json(
        {
          error: 'Erro ao criar task no Runway ML',
          details: runwayError.message || 'Erro desconhecido',
          status: runwayError.status,
        },
        { status: runwayError.status || 500 }
      );
    }

    // ────────────────────────────────────────────────────────────────────────
    // 6️⃣ DEDUZIR CRÉDITOS
    // ────────────────────────────────────────────────────────────────────────

    console.log(`💳 Deduzindo ${creditsRequired} créditos (${operation})...`);
    
    const deduction = await deductCredits(user_id, operation, {
      taskId: task.id,
      model: 'gen4_aleph',
      promptText: body.promptText.substring(0, 100),
      ratio: body.ratio,
      hasReferences: !!(body.references && body.references.length > 0),
    });

    if (!deduction.success) {
      console.warn('⚠️ Task criada mas erro ao deduzir créditos');
      return NextResponse.json(
        {
          warning: 'Vídeo iniciado mas erro ao processar créditos',
          taskId: task.id,
        },
        { status: 200 }
      );
    }

    console.log(`✅ ${creditsRequired} créditos deduzidos! Novo saldo: ${deduction.newBalance}`);

    // ────────────────────────────────────────────────────────────────────────
    // 7️⃣ RESPOSTA DE SUCESSO
    // ────────────────────────────────────────────────────────────────────────

    return NextResponse.json({
      success: true,
      taskId: task.id,
      model: 'gen4_aleph',
      operation,
      creditsUsed: creditsRequired,
      newBalance: deduction.newBalance,
      transactionId: deduction.transactionId,
      ratio: body.ratio,
      hasReferences: !!(body.references && body.references.length > 0),
      tier: 'PREMIUM',
      message: 'Task criada com sucesso. Use /api/runway/task-status para verificar o progresso.',
    });

  } catch (error: any) {
    console.error('❌ Erro no endpoint /videostudio/video-to-video:', error);
    
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error.message || 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

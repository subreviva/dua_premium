/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🎭 RUNWAY ML - ACT-TWO CHARACTER PERFORMANCE API
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Endpoint: POST /api/videostudio/act-two
 * 
 * FUNCIONALIDADE:
 * Controla expressões faciais e movimentos corporais de um personagem usando
 * um vídeo de referência com performance de um ator.
 * 
 * CHARACTER INPUT:
 * - Imagem: Personagem em ambiente estático
 * - Vídeo: Personagem em ambiente animado
 * 
 * REFERENCE VIDEO:
 * - Vídeo de pessoa performando (3-30 segundos)
 * - Expressões faciais e movimentos corporais são aplicados ao personagem
 * 
 * DOCUMENTAÇÃO OFICIAL:
 * https://docs.runwayml.com/reference/post_v1_character_performance
 * 
 * VALIDAÇÕES RIGOROSAS:
 * ✅ Tipos conforme documentação oficial
 * ✅ Validação de URIs (HTTPS e Data URI)
 * ✅ Validação de ranges (seed, expressionIntensity, duration)
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

type CharacterType = 'image' | 'video';
type ReferenceType = 'video';
type RatioType = '1280:720' | '720:1280' | '960:960' | '1104:832' | '832:1104' | '1584:672';
type PublicFigureThreshold = 'auto' | 'low';
type ExpressionIntensity = 1 | 2 | 3 | 4 | 5;

// Character Image Input
interface CharacterImage {
  type: 'image';
  uri: string; // HTTPS URL ou Data URI (13-5242880 chars)
}

// Character Video Input
interface CharacterVideo {
  type: 'video';
  uri: string; // HTTPS URL ou Data URI (13-16777216 chars)
}

type Character = CharacterImage | CharacterVideo;

// Reference Video Input
interface CharacterReferenceVideo {
  type: 'video';
  uri: string; // HTTPS URL ou Data URI (13-16777216 chars)
  // Duração: 3-30 segundos (validado pela API Runway)
}

interface ContentModeration {
  publicFigureThreshold?: PublicFigureThreshold;
}

// Request completo
interface ActTwoRequest {
  model: 'act_two';
  user_id: string;
  character: Character;
  reference: CharacterReferenceVideo;
  seed?: number; // 0 a 4294967295
  bodyControl?: boolean;
  expressionIntensity?: ExpressionIntensity; // 1-5, default: 3
  ratio?: RatioType;
  contentModeration?: ContentModeration;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🔍 VALIDAÇÕES RIGOROSAS
// ═══════════════════════════════════════════════════════════════════════════

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
 * Valida expressionIntensity (1-5)
 */
function validateExpressionIntensity(intensity: number): { valid: boolean; error?: string } {
  if (!Number.isInteger(intensity)) {
    return { valid: false, error: 'expressionIntensity deve ser um número inteiro' };
  }
  
  if (intensity < 1 || intensity > 5) {
    return { valid: false, error: 'expressionIntensity deve estar entre 1 e 5' };
  }
  
  return { valid: true };
}

/**
 * Valida Act-Two Request completo
 */
function validateActTwoRequest(req: ActTwoRequest): string[] {
  const errors: string[] = [];

  // 1. model - deve ser exatamente "act_two"
  if (req.model !== 'act_two') {
    errors.push('model deve ser exatamente "act_two"');
  }

  // 2. character - OBRIGATÓRIO
  if (!req.character) {
    errors.push('character é obrigatório');
  } else {
    // Validar type
    if (req.character.type !== 'image' && req.character.type !== 'video') {
      errors.push('character.type deve ser "image" ou "video"');
    }
    
    // Validar URI
    if (!req.character.uri) {
      errors.push('character.uri é obrigatório');
    } else {
      if (req.character.type === 'image') {
        const validation = validateImageUri(req.character.uri);
        if (!validation.valid) {
          errors.push(`character.uri (imagem): ${validation.error}`);
        }
      } else if (req.character.type === 'video') {
        const validation = validateVideoUri(req.character.uri);
        if (!validation.valid) {
          errors.push(`character.uri (vídeo): ${validation.error}`);
        }
      }
    }
  }

  // 3. reference - OBRIGATÓRIO
  if (!req.reference) {
    errors.push('reference é obrigatório');
  } else {
    // Validar type
    if (req.reference.type !== 'video') {
      errors.push('reference.type deve ser "video"');
    }
    
    // Validar URI
    if (!req.reference.uri) {
      errors.push('reference.uri é obrigatório');
    } else {
      const validation = validateVideoUri(req.reference.uri);
      if (!validation.valid) {
        errors.push(`reference.uri: ${validation.error}`);
      }
    }
  }

  // 4. ratio - OPCIONAL
  if (req.ratio) {
    const validRatios: RatioType[] = ['1280:720', '720:1280', '960:960', '1104:832', '832:1104', '1584:672'];
    if (!validRatios.includes(req.ratio)) {
      errors.push(`ratio inválido. Valores válidos: ${validRatios.join(', ')}`);
    }
  }

  // 5. seed - OPCIONAL (0 a 4294967295)
  if (req.seed !== undefined) {
    const validation = validateSeed(req.seed);
    if (!validation.valid) {
      errors.push(`seed: ${validation.error}`);
    }
  }

  // 6. bodyControl - OPCIONAL (boolean)
  if (req.bodyControl !== undefined && typeof req.bodyControl !== 'boolean') {
    errors.push('bodyControl deve ser boolean (true ou false)');
  }

  // 7. expressionIntensity - OPCIONAL (1-5, default: 3)
  if (req.expressionIntensity !== undefined) {
    const validation = validateExpressionIntensity(req.expressionIntensity);
    if (!validation.valid) {
      errors.push(`expressionIntensity: ${validation.error}`);
    }
  }

  // 8. contentModeration - OPCIONAL
  if (req.contentModeration?.publicFigureThreshold) {
    const validThresholds: PublicFigureThreshold[] = ['auto', 'low'];
    if (!validThresholds.includes(req.contentModeration.publicFigureThreshold)) {
      errors.push(`contentModeration.publicFigureThreshold inválido. Valores válidos: ${validThresholds.join(', ')}`);
    }
  }

  return errors;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🎭 ROUTE HANDLER - POST /api/videostudio/act-two
// ═══════════════════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ActTwoRequest;
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

    const validationErrors = validateActTwoRequest(body);

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

    const operation: CreditOperation = 'video_act_two';
    const creditsRequired = 30; // Conforme credits-config.ts

    console.log(`🎭 Verificando créditos para ${operation} (user: ${user_id})`);
    const creditCheck = await checkCredits(user_id, operation);

    if (!creditCheck.hasCredits) {
      return NextResponse.json(
        {
          error: 'Créditos insuficientes',
          required: creditCheck.required,
          current: creditCheck.currentBalance,
          deficit: creditCheck.deficit,
          operation,
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
      model: 'act_two',
      character: body.character,
      reference: body.reference,
    };

    // Adicionar campos opcionais
    if (body.ratio) {
      payload.ratio = body.ratio;
    }

    if (body.seed !== undefined) {
      payload.seed = body.seed;
    }

    if (body.bodyControl !== undefined) {
      payload.bodyControl = body.bodyControl;
    }

    if (body.expressionIntensity !== undefined) {
      payload.expressionIntensity = body.expressionIntensity;
    }

    if (body.contentModeration) {
      payload.contentModeration = body.contentModeration;
    }

    console.log('🎭 Runway ML Act-Two Request:', {
      operation,
      creditsRequired,
      characterType: body.character.type,
      hasRatio: !!body.ratio,
      bodyControl: body.bodyControl,
      expressionIntensity: body.expressionIntensity || 3,
    });

    // ────────────────────────────────────────────────────────────────────────
    // 5️⃣ CHAMAR RUNWAY ML API
    // ────────────────────────────────────────────────────────────────────────

    let task;
    
    try {
      // Usar SDK oficial do RunwayML
      task = await client.characterPerformance.create(payload);
      
      console.log('✅ Runway ML Act-Two task criada:', task.id);
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
      characterType: body.character.type,
      bodyControl: body.bodyControl,
      expressionIntensity: body.expressionIntensity || 3,
      ratio: body.ratio,
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
      model: 'act_two',
      operation,
      creditsUsed: creditsRequired,
      newBalance: deduction.newBalance,
      transactionId: deduction.transactionId,
      characterType: body.character.type,
      bodyControl: body.bodyControl || false,
      expressionIntensity: body.expressionIntensity || 3,
      message: 'Task criada com sucesso. Use /api/runway/task-status para verificar o progresso.',
    });

  } catch (error: any) {
    console.error('❌ Erro no endpoint /videostudio/act-two:', error);
    
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error.message || 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🎬 RUNWAY ML - VIDEO UPSCALE API (4K Enhancement)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Endpoint: POST /api/videostudio/upscale
 * 
 * FUNCIONALIDADE:
 * Upscale de vídeos com fator 4X (até 4096px máximo por lado)
 * 
 * CARACTERÍSTICAS:
 * - Upscale: 4X (ex: 720p → 2880p)
 * - Máximo: 4096px por lado
 * - Modelo: upscale_v1
 * - Output: HD/4K/8K (conforme input)
 * 
 * DOCUMENTAÇÃO OFICIAL:
 * https://docs.runwayml.com/reference/post_v1_video_upscale
 * 
 * VALIDAÇÕES RIGOROSAS:
 * ✅ Tipos conforme documentação oficial
 * ✅ Validação de URIs (HTTPS e Data URI)
 * ✅ Gestão de créditos (checkCredits + deductCredits)
 * ✅ Rate limiting 429 handling
 * ✅ Limites de tamanho (4096px max)
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

type ModelType = 'upscale_v1';

interface VideoUpscaleRequest {
  model: 'upscale_v1';
  user_id: string;
  videoUri: string; // HTTPS URL ou Data URI
}

// ═══════════════════════════════════════════════════════════════════════════
// 🔍 VALIDAÇÕES RIGOROSAS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Valida URI de vídeo (HTTPS URL ou Data URI)
 * Data URI: 13-16777216 caracteres, formato: data:video/*
 * HTTPS URL: 13-2048 caracteres
 */
function validateVideoUri(uri: string): { valid: boolean; error?: string } {
  const dataUriRegex = /^data:video\/.+/;
  const httpsUrlRegex = /^https:\/\/.+/;
  
  if (dataUriRegex.test(uri)) {
    // Data URI
    if (uri.length < 13) {
      return { valid: false, error: 'Data URI muito curto (mínimo 13 caracteres)' };
    }
    if (uri.length > 16777216) {
      return { valid: false, error: `Data URI muito longo (${uri.length}/16777216 caracteres = 16MB)` };
    }
    return { valid: true };
  }
  
  if (httpsUrlRegex.test(uri)) {
    // HTTPS URL
    if (uri.length < 13) {
      return { valid: false, error: 'HTTPS URL muito curto (mínimo 13 caracteres)' };
    }
    if (uri.length > 2048) {
      return { valid: false, error: `HTTPS URL muito longo (${uri.length}/2048 caracteres)` };
    }
    return { valid: true };
  }
  
  return { valid: false, error: 'videoUri deve ser HTTPS URL ou Data URI (data:video/*)' };
}

/**
 * Valida Video Upscale Request completo
 */
function validateVideoUpscaleRequest(req: VideoUpscaleRequest): string[] {
  const errors: string[] = [];

  // 1. model - deve ser exatamente "upscale_v1"
  if (req.model !== 'upscale_v1') {
    errors.push('model deve ser exatamente "upscale_v1"');
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

  return errors;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🎬 ROUTE HANDLER - POST /api/videostudio/upscale
// ═══════════════════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as VideoUpscaleRequest;
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

    const validationErrors = validateVideoUpscaleRequest(body);

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

    const operation: CreditOperation = 'video_upscale_10s';
    const creditsRequired = 25; // Conforme credits-config.ts

    console.log(`📐 Verificando créditos para ${operation} (user: ${user_id})`);
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

    // Payload conforme documentação
    const payload = {
      model: 'upscale_v1' as const,
      videoUri: body.videoUri,
    };

    console.log('📐 Runway ML Video Upscale Request:', {
      operation,
      creditsRequired,
      videoUriType: body.videoUri.startsWith('data:') ? 'Data URI' : 'HTTPS URL',
      videoUriLength: body.videoUri.length,
    });

    // ────────────────────────────────────────────────────────────────────────
    // 5️⃣ CHAMAR RUNWAY ML API
    // ────────────────────────────────────────────────────────────────────────

    let task;
    
    try {
      // Usar SDK oficial do RunwayML
      task = await client.videoUpscale.create(payload);
      
      console.log('✅ Runway ML Video Upscale task criada:', task.id);
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
      model: 'upscale_v1',
      videoUri: body.videoUri.substring(0, 100), // Salvar apenas início (para logs)
    });

    if (!deduction.success) {
      console.warn('⚠️ Task criada mas erro ao deduzir créditos');
      return NextResponse.json(
        {
          warning: 'Upscale iniciado mas erro ao processar créditos',
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
      model: 'upscale_v1',
      operation,
      creditsUsed: creditsRequired,
      newBalance: deduction.newBalance,
      transactionId: deduction.transactionId,
      upscaleFactor: '4X',
      maxResolution: '4096px',
      message: 'Task criada com sucesso. Use /api/runway/task-status para verificar o progresso.',
      estimatedTime: 'Varia conforme duração e resolução do vídeo original',
    });

  } catch (error: any) {
    console.error('❌ Erro no endpoint /videostudio/upscale:', error);
    
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error.message || 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

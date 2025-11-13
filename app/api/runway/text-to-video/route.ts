/**
 * API: RUNWAY ML VIDEO GENERATION (Text-to-Video)
 * 
 * Modelos disponíveis (Tabela oficial Runway ML):
 * - gen4_turbo 5s: 25 créditos
 * - gen4_turbo 10s: 50 créditos
 * - gen4_aleph 5s: 60 créditos
 * - gen4_aleph 10s: 120 créditos
 * - gen3a_turbo 5s: 20 créditos
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkCredits, deductCredits } from '@/lib/credits/credits-service';
import type { CreditOperation } from '@/lib/credits/credits-config';

// Configurações do Runway ML
const RUNWAY_CONFIG = {
  SUPPORTED_MODELS: ['gen4_turbo', 'gen3a_turbo', 'gen4_aleph'] as const,
  SUPPORTED_RATIOS: ['1280:720', '720:1280', '1920:1080', '1024:1024'] as const,
  SUPPORTED_DURATIONS: [5, 10] as const,
} as const;

// Mapear modelo + duração para operação de créditos
function getOperation(model: string, duration: number): CreditOperation {
  const key = `${model}_${duration}s`;
  const mapping: Record<string, CreditOperation> = {
    'gen4_turbo_5s': 'video_gen4_turbo_5s',
    'gen4_turbo_10s': 'video_gen4_turbo_10s',
    'gen4_aleph_5s': 'video_gen4_aleph_5s',
    'gen4_aleph_10s': 'video_gen4_aleph_10s',
    'gen3a_turbo_5s': 'video_gen3a_turbo_5s',
  };
  
  return mapping[key] || 'video_gen4_turbo_5s';
}

type RunwayModel = typeof RUNWAY_CONFIG.SUPPORTED_MODELS[number];
type RunwayRatio = typeof RUNWAY_CONFIG.SUPPORTED_RATIOS[number];
type RunwayDuration = typeof RUNWAY_CONFIG.SUPPORTED_DURATIONS[number];

/**
 * POST /api/runway/text-to-video
 * Gera vídeo a partir de texto usando Runway ML
 */
export async function POST(request: NextRequest) {
  try {
    const {
      user_id,
      promptText,
      model = 'gen4_turbo',
      ratio = '1280:720',
      duration = 5,
      seed,
    } = await request.json();

    // Validar user_id
    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id é obrigatório' },
        { status: 400 }
      );
    }

    if (!promptText || promptText.trim().length < 10) {
      return NextResponse.json(
        { error: 'Prompt deve ter no mínimo 10 caracteres' },
        { status: 400 }
      );
    }

    if (!RUNWAY_CONFIG.SUPPORTED_MODELS.includes(model as RunwayModel)) {
      return NextResponse.json(
        { error: `Modelo inválido. Use: ${RUNWAY_CONFIG.SUPPORTED_MODELS.join(', ')}` },
        { status: 400 }
      );
    }

    if (!RUNWAY_CONFIG.SUPPORTED_RATIOS.includes(ratio as RunwayRatio)) {
      return NextResponse.json(
        { error: `Ratio inválido. Use: ${RUNWAY_CONFIG.SUPPORTED_RATIOS.join(', ')}` },
        { status: 400 }
      );
    }

    if (!RUNWAY_CONFIG.SUPPORTED_DURATIONS.includes(duration as RunwayDuration)) {
      return NextResponse.json(
        { error: `Duração inválida. Use: ${RUNWAY_CONFIG.SUPPORTED_DURATIONS.join(', ')}s` },
        { status: 400 }
      );
    }

    // Validação: gen3a_turbo só suporta 5s
    if (model === 'gen3a_turbo' && duration !== 5) {
      return NextResponse.json(
        { error: 'gen3a_turbo só suporta duração de 5 segundos' },
        { status: 400 }
      );
    }

    // CHECK CREDITS (25-120 créditos dependendo do modelo/duração)
    const operation = getOperation(model, duration);
    const creditCheck = await checkCredits(user_id, operation);

    if (!creditCheck.hasCredits) {
      return NextResponse.json(
        {
          error: creditCheck.message,
          required: creditCheck.required,
          current: creditCheck.currentBalance,
          deficit: creditCheck.deficit,
        },
        { status: 402 }
      );
    }    const RUNWAY_API_KEY = process.env.RUNWAY_API_KEY;

    if (!RUNWAY_API_KEY) {
      return NextResponse.json(
        { error: 'Runway API key not configured' },
        { status: 503 }
      );
    }

    console.log(`🎬 Runway Text-to-Video: model=${model}, duration=${duration}s`);

    // Call Runway ML API
    const response = await fetch('https://api.dev.runwayml.com/v1/text_to_video', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RUNWAY_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-11-06',
      },
      body: JSON.stringify({
        model,
        promptText,
        ratio,
        duration,
        seed: seed || Math.floor(Math.random() * 4294967295),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Runway API error:', errorData);
      return NextResponse.json(
        { 
          error: 'Failed to start text-to-video task',
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Runway task created:', data.id);

    // DEDUCT CREDITS após sucesso
    await deductCredits(user_id, operation, {
      taskId: data.id,
      model,
      duration,
      promptText: promptText.substring(0, 100),
      ratio,
    });

    return NextResponse.json({
      success: true,
      taskId: data.id,
      model,
      duration,
      ratio,
      message: 'Text-to-video task started successfully'
    });

  } catch (error: any) {
    console.error('[Runway] Erro:', error);
    return NextResponse.json(
      {
        error: 'Erro ao gerar vídeo',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/runway/text-to-video
 * Retorna informações sobre os modelos disponíveis
 */
export async function GET() {
  return NextResponse.json({
    models: RUNWAY_CONFIG.SUPPORTED_MODELS,
    ratios: RUNWAY_CONFIG.SUPPORTED_RATIOS,
    durations: RUNWAY_CONFIG.SUPPORTED_DURATIONS,
    pricing: {
      gen4_turbo_5s: 25,
      gen4_turbo_10s: 50,
      gen4_aleph_5s: 60,
      gen4_aleph_10s: 120,
      gen3a_turbo_5s: 20,
    },
  });
}

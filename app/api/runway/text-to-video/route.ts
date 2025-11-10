/**
 * API: RUNWAY ML VIDEO GENERATION
 * 
 * Modelos disponíveis:
 * - gen4_turbo: Gen-4 Turbo (mais rápido, menor custo)
 * - gen3a_turbo: Gen-3 Alpha Turbo
 * - gen4_aleph: Gen-4 Aleph (qualidade máxima)
 * 
 * Endpoints:
 * - POST /api/runway/text-to-video (Text → Video)
 * - POST /api/runway/image-to-video (Image → Video)
 * - POST /api/runway/video-to-video (Video → Video)
 */

import { NextRequest, NextResponse } from 'next/server';
import RunwayML from '@runwayml/sdk';
import { consumirCreditos } from '@/lib/creditos-helper';
import { refundCredits } from '@/lib/credits/credits-service';

// Inicializar cliente Runway
const client = new RunwayML({
  apiKey: process.env.RUNWAY_API_KEY || '',
});

// Configurações do Runway ML
const RUNWAY_CONFIG = {
  SUPPORTED_MODELS: ['gen4_turbo', 'gen3a_turbo', 'gen4_aleph'] as const,
  SUPPORTED_RATIOS: ['1280:720', '720:1280', '1920:1080', '1024:1024'] as const,
  DURATIONS: {
    gen4_turbo: 4, // 4 segundos
    gen3a_turbo: 5, // 5 segundos
    gen4_aleph: 10, // 10 segundos
  },
} as const;

// Mapear modelos Runway para operações do sistema de créditos
const MODEL_TO_OPERATION_MAP: Record<string, string> = {
  'gen4_turbo_5s': 'video_gen4_5s',
  'gen4_turbo_10s': 'video_gen4_10s',
  'gen4_aleph_5s': 'video_gen4_aleph_5s',
  'gen3a_turbo_5s': 'gen3_alpha_5s',
  'gen3a_turbo_10s': 'gen3_alpha_10s',
};

type RunwayModel = typeof RUNWAY_CONFIG.SUPPORTED_MODELS[number];
type RunwayRatio = typeof RUNWAY_CONFIG.SUPPORTED_RATIOS[number];

/**
 * POST /api/runway/text-to-video
 * Gera vídeo a partir de texto
 */
export async function POST(request: NextRequest) {
  try {
    const {
      userId,
      promptText,
      model = 'gen4_turbo',
      ratio = '1280:720',
      seed,
    } = await request.json();

    // Validações
    if (!userId) {
      return NextResponse.json(
        { error: 'userId é obrigatório' },
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

    // Calcular custo em créditos baseado no modelo e duração
    const duration = RUNWAY_CONFIG.DURATIONS[model as RunwayModel];
    let creditosNecessarios = 0;
    let operationKey = '';

    if (model === 'gen4_turbo') {
      operationKey = duration === 5 ? 'video_gen4_5s' : 'video_gen4_10s';
      creditosNecessarios = duration === 5 ? 20 : 40;
    } else if (model === 'gen3a_turbo') {
      operationKey = duration === 5 ? 'gen3_alpha_5s' : 'gen3_alpha_10s';
      creditosNecessarios = duration === 5 ? 18 : 35;
    } else if (model === 'gen4_aleph') {
      operationKey = 'video_gen4_aleph_5s';
      creditosNecessarios = 60;
    }

    // Consumir créditos ANTES de gerar (usando adapter que chama RPC)
    const resultadoCreditos = await consumirCreditos(
      userId,
      operationKey,
      {
        creditos: creditosNecessarios,
        model,
        promptText: promptText.substring(0, 100),
        ratio,
        duration,
      }
    );

    if (!resultadoCreditos.success) {
      return NextResponse.json(
        {
          error: 'Créditos insuficientes',
          details: resultadoCreditos.error || resultadoCreditos.details,
          redirect: '/comprar',
        },
        { status: 402 } // Payment Required
      );
    }

    // Gerar vídeo com Runway ML - Text to Video mode
    console.log(`[Runway] Gerando vídeo: model=${model}, duration=${duration}s`);

    // Para text-to-video, vamos usar gen3a_turbo conforme documentação
    const taskResponse = await client.imageToVideo.create({
      model: 'gen3a_turbo',
      promptImage: 'https://via.placeholder.com/1280x720', // Imagem placeholder
      promptText,
    });

    // Aguardar conclusão (polling manual)
    let attempts = 0;
    const maxAttempts = 120; // 2 minutos
    let currentTask: any = taskResponse;

    while (!['SUCCEEDED', 'FAILED'].includes(currentTask.status || '') && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      currentTask = await client.tasks.retrieve(taskResponse.id);
      attempts++;
      
      console.log(`[Runway] Tentativa ${attempts}: Status = ${currentTask.status || 'UNKNOWN'}`);
    }

    const finalStatus = currentTask.status || 'UNKNOWN';

    if (finalStatus === 'FAILED') {
      // Reembolsar créditos em caso de falha
      console.log('🔄 Falha na geração - reembolsando créditos');
      await refundCredits(userId, operationKey as any, 'Runway task failed');
      
      return NextResponse.json(
        {
          error: 'Falha na geração do vídeo',
          taskId: taskResponse.id,
          details: currentTask,
          refunded: true,
        },
        { status: 500 }
      );
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json(
        {
          error: 'Timeout: vídeo ainda processando',
          taskId: taskResponse.id,
          message: 'Use /api/runway/status para verificar o status',
        },
        { status: 202 }
      );
    }

    // Sucesso!
    const videoUrl = currentTask.output?.[0] || currentTask.artifacts?.[0]?.url || null;

    return NextResponse.json({
      success: true,
      taskId: taskResponse.id,
      videoUrl,
      creditosRestantes: resultadoCreditos.creditos_restantes,
      creditosGastos: creditosNecessarios,
      model,
      duration,
      status: finalStatus,
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
    durations: RUNWAY_CONFIG.DURATIONS,
    pricing: {
      gen4_turbo_4s: { creditos: 30, preco_eur: 0.90 },
      gen3a_turbo_5s: { creditos: 35, preco_eur: 1.05 },
      gen4_aleph_10s: { creditos: 100, preco_eur: 3.00 },
    },
  });
}

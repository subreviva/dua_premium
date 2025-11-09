/**
 * API: RUNWAY ML - IMAGE TO VIDEO
 * 
 * Transforma uma imagem em vídeo animado
 * Modelos: gen4_turbo, gen3a_turbo
 */

import { NextRequest, NextResponse } from 'next/server';
import RunwayML from '@runwayml/sdk';
import { consumirCreditos } from '@/lib/creditos-helper';

const client = new RunwayML({
  apiKey: process.env.RUNWAY_API_KEY || '',
});

/**
 * POST /api/runway/image-to-video
 */
export async function POST(request: NextRequest) {
  try {
    const {
      userId,
      promptImage, // URL da imagem
      promptText = '', // Opcional: descrição do movimento desejado
      model = 'gen4_turbo',
      ratio = '1280:720',
      duration = 4,
      seed,
    } = await request.json();

    // Validações
    if (!userId) {
      return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 });
    }

    if (!promptImage) {
      return NextResponse.json({ error: 'promptImage (URL) é obrigatório' }, { status: 400 });
    }

    // Calcular créditos
    const creditosNecessarios = duration === 4 ? 30 : 90;

    // Consumir créditos
    const resultadoCreditos = await consumirCreditos(userId, 'video_generation', {
      type: 'image-to-video',
      model,
      duration,
    });

    if (!resultadoCreditos.success) {
      return NextResponse.json(
        {
          error: 'Créditos insuficientes',
          redirect: '/loja-creditos',
        },
        { status: 402 }
      );
    }

    // Gerar vídeo
    console.log(`[Runway] Image-to-Video: model=${model}, duration=${duration}s`);

    const taskResponse = await client.imageToVideo.create({
      model: model === 'gen4_turbo' ? 'gen4_turbo' : 'gen3a_turbo',
      promptImage,
      promptText,
      ratio: ratio as any,
      duration,
      seed: seed || Math.floor(Math.random() * 1000000),
    } as any);

    // Polling
    let attempts = 0;
    let currentTask: any = taskResponse;

    while (!['SUCCEEDED', 'FAILED'].includes(currentTask.status || '') && attempts < 120) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      currentTask = await client.tasks.retrieve(taskResponse.id);
      attempts++;
    }

    const finalStatus = currentTask.status || 'UNKNOWN';

    if (finalStatus === 'FAILED') {
      return NextResponse.json(
        { error: 'Falha na geração', taskId: taskResponse.id },
        { status: 500 }
      );
    }

    if (attempts >= 120) {
      return NextResponse.json(
        { error: 'Timeout', taskId: taskResponse.id },
        { status: 202 }
      );
    }

    const videoUrl = currentTask.output?.[0] || currentTask.artifacts?.[0]?.url || null;

    return NextResponse.json({
      success: true,
      taskId: taskResponse.id,
      videoUrl,
      creditosRestantes: resultadoCreditos.creditos_restantes,
      creditosGastos: creditosNecessarios,
    });

  } catch (error: any) {
    console.error('[Runway] Erro:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

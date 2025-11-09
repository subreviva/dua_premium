/**
 * API: RUNWAY ML - VIDEO TO VIDEO
 * 
 * Transforma um vídeo aplicando novos estilos/efeitos
 * Modelo: gen4_aleph
 */

import { NextRequest, NextResponse } from 'next/server';
import RunwayML from '@runwayml/sdk';
import { consumirCreditos } from '@/lib/creditos-helper';

const client = new RunwayML({
  apiKey: process.env.RUNWAY_API_KEY || '',
});

/**
 * POST /api/runway/video-to-video
 */
export async function POST(request: NextRequest) {
  try {
    const {
      userId,
      videoUri, // URL do vídeo de entrada
      promptText, // Descrição da transformação desejada
      model = 'gen4_aleph',
      ratio = '1280:720',
    } = await request.json();

    // Validações
    if (!userId) {
      return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 });
    }

    if (!videoUri) {
      return NextResponse.json({ error: 'videoUri (URL) é obrigatório' }, { status: 400 });
    }

    if (!promptText || promptText.trim().length < 10) {
      return NextResponse.json(
        { error: 'promptText deve ter no mínimo 10 caracteres' },
        { status: 400 }
      );
    }

    // Calcular créditos (video-to-video é mais caro)
    const creditosNecessarios = 100; // ~10s de processamento

    // Consumir créditos
    const resultadoCreditos = await consumirCreditos(userId, 'video_generation', {
      type: 'video-to-video',
      model,
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
    console.log(`[Runway] Video-to-Video: model=${model}`);

    const taskResponse = await client.videoToVideo.create({
      videoUri,
      promptText,
      model: model as any,
      ratio: ratio as any,
    } as any);

    // Usar waitForTaskOutput helper do SDK
    try {
      const completedTask = await (taskResponse as any).waitForTaskOutput?.() || taskResponse;
      
      const videoUrl = completedTask.output?.[0] || completedTask.artifacts?.[0]?.url || null;

      return NextResponse.json({
        success: true,
        taskId: (taskResponse as any).id,
        videoUrl,
        creditosRestantes: resultadoCreditos.creditos_restantes,
        creditosGastos: creditosNecessarios,
      });
    } catch (waitError) {
      // Se waitForTaskOutput não existir, fazer polling manual
      let attempts = 0;
      let currentTask: any = taskResponse;

      while (!['SUCCEEDED', 'FAILED'].includes(currentTask.status || '') && attempts < 120) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        currentTask = await client.tasks.retrieve((taskResponse as any).id);
        attempts++;
      }

      const finalStatus = currentTask.status || 'UNKNOWN';

      if (finalStatus === 'FAILED') {
        return NextResponse.json(
          { error: 'Falha na transformação', taskId: (taskResponse as any).id },
          { status: 500 }
        );
      }

      if (attempts >= 120) {
        return NextResponse.json(
          { error: 'Timeout', taskId: (taskResponse as any).id },
          { status: 202 }
        );
      }

      const videoUrl = currentTask.output?.[0] || currentTask.artifacts?.[0]?.url || null;

      return NextResponse.json({
        success: true,
        taskId: (taskResponse as any).id,
        videoUrl,
        creditosRestantes: resultadoCreditos.creditos_restantes,
        creditosGastos: creditosNecessarios,
      });
    }

  } catch (error: any) {
    console.error('[Runway] Erro:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

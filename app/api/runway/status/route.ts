/**
 * API: RUNWAY ML - STATUS DE TASK
 * 
 * Verifica o status de uma task de geração de vídeo
 * GET /api/runway/status?taskId=xxx
 */

import { NextRequest, NextResponse } from 'next/server';
import RunwayML from '@runwayml/sdk';

const client = new RunwayML({
  apiKey: process.env.RUNWAY_API_KEY || '',
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        { error: 'taskId é obrigatório' },
        { status: 400 }
      );
    }

    const task = await client.tasks.retrieve(taskId);

    return NextResponse.json({
      taskId,
      status: (task as any).status || 'UNKNOWN',
      progress: (task as any).progress || 0,
      output: (task as any).output || null,
      artifacts: (task as any).artifacts || null,
      videoUrl: (task as any).output?.[0] || (task as any).artifacts?.[0]?.url || null,
      createdAt: (task as any).createdAt,
      completedAt: (task as any).completedAt,
    });

  } catch (error: any) {
    console.error('[Runway] Erro ao verificar status:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

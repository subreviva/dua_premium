import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkCredits, deductCredits } from '@/lib/credits/credits-service';
import type { CreditOperation } from '@/lib/credits/credits-config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      prompt, 
      userId, 
      type = 'gen4',      // gen4 | gen3 | image_to_video | act_two | video_to_video | upscale
      duration = '5s',    // 5s | 10s
      imageUrl,           // Para image_to_video e act_two
      videoUrl,           // Para video_to_video e upscale
      audioUrl,           // Para act_two
    } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 });
    }

    // Mapear tipo + duração para operação
    let operation: CreditOperation;
    let model: string;

    switch (type) {
      case 'gen4':
        operation = duration === '10s' ? 'video_gen4_10s' : 'video_gen4_5s';
        model = `Gen-4 Turbo (${duration})`;
        break;
      case 'gen4_aleph':
        operation = 'video_gen4_aleph_5s';
        model = 'Gen-4 Aleph (5s Premium)';
        break;
      case 'gen3':
        operation = duration === '10s' ? 'gen3_alpha_10s' : 'gen3_alpha_5s';
        model = `Gen-3 Alpha (${duration} Econômico)`;
        break;
      case 'image_to_video':
        if (!imageUrl) {
          return NextResponse.json({ error: 'imageUrl é obrigatório para image_to_video' }, { status: 400 });
        }
        operation = duration === '10s' ? 'image_to_video_10s' : 'image_to_video_5s';
        model = `Image to Video (${duration})`;
        break;
      case 'video_to_video':
        if (!videoUrl) {
          return NextResponse.json({ error: 'videoUrl é obrigatório para video_to_video' }, { status: 400 });
        }
        operation = 'video_to_video';
        model = 'Video to Video (Gen-4 Aleph)';
        break;
      case 'act_two':
        if (!imageUrl || !audioUrl) {
          return NextResponse.json({ error: 'imageUrl e audioUrl são obrigatórios para act_two' }, { status: 400 });
        }
        operation = 'act_two';
        model = 'Act-Two (Character Animation)';
        break;
      case 'upscale':
        if (!videoUrl) {
          return NextResponse.json({ error: 'videoUrl é obrigatório para upscale' }, { status: 400 });
        }
        operation = duration === '10s' ? 'video_upscale_10s' : 'video_upscale_5s';
        model = `Video Upscale HD/4K (${duration})`;
        break;
      default:
        return NextResponse.json({ error: 'Tipo de vídeo inválido' }, { status: 400 });
    }

    // 1️⃣ VERIFICAR CRÉDITOS
    console.log(`🎬 Verificando créditos para ${operation} (user: ${userId})`);
    const creditCheck = await checkCredits(userId, operation);

    if (!creditCheck.hasCredits) {
      return NextResponse.json(
        {
          error: 'Créditos insuficientes',
          required: creditCheck.required,
          current: creditCheck.currentBalance,
          deficit: creditCheck.deficit,
          operation,
          type,
        },
        { status: 402 }
      );
    }

    // 2️⃣ GERAR VÍDEO (simulado - substitua com API real)
    console.log(`🎬 Gerando vídeo ${model}: "${prompt || 'Sem prompt'}"`);
    const estimatedTime = operation.includes('10s') ? 15000 : 
                          operation === 'video_to_video' ? 20000 :
                          operation === 'act_two' ? 12000 : 8000;
    
    await new Promise(resolve => setTimeout(resolve, estimatedTime));
    
    const videoOutputUrl = `https://example.com/videos/${Date.now()}.mp4`;

    // 3️⃣ DEDUZIR CRÉDITOS
    console.log(`💳 Deduzindo ${creditCheck.required} créditos (${operation})...`);
    const deduction = await deductCredits(userId, operation, {
      prompt: prompt || undefined,
      resultUrl: videoOutputUrl,
      model,
      type,
      duration,
      inputImage: imageUrl,
      inputVideo: videoUrl,
      inputAudio: audioUrl,
    });

    if (!deduction.success) {
      return NextResponse.json(
        {
          warning: 'Vídeo gerado mas erro ao processar créditos',
          videoUrl: videoOutputUrl,
        },
        { status: 200 }
      );
    }

    console.log(`✅ ${creditCheck.required} créditos deduzidos! Novo saldo: ${deduction.newBalance}`);

    return NextResponse.json({
      success: true,
      videoUrl: videoOutputUrl,
      model,
      type,
      duration,
      creditsUsed: creditCheck.required,
      newBalance: deduction.newBalance,
      transactionId: deduction.transactionId,
    });

  } catch (error: any) {
    console.error('❌ Erro na API de geração de vídeo:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

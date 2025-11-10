import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkCredits, deductCredits } from '@/lib/credits/credits-service';

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
    const { prompt, userId, quality = 'standard' } = body;

    if (!userId || !prompt) {
      return NextResponse.json(
        { error: 'userId e prompt são obrigatórios' },
        { status: 400 }
      );
    }

    // Mapear qualidade para operação
    const qualityMap: Record<string, 'image_fast' | 'image_standard' | 'image_ultra' | 'image_3'> = {
      fast: 'image_fast',       // 15 créditos - Imagen-4 Fast (1K, ~2-3s)
      standard: 'image_standard', // 25 créditos - Imagen-4 Standard (2K, ~5-8s) ⭐
      ultra: 'image_ultra',     // 35 créditos - Imagen-4 Ultra (4K, ~10-15s)
      economico: 'image_3',     // 10 créditos - Imagen-3 (Econômico)
    };

    const operation = qualityMap[quality] || 'image_standard';

    // 1️⃣ VERIFICAR CRÉDITOS
    console.log(`🎨 Verificando créditos para ${operation} (user: ${userId})`);
    const creditCheck = await checkCredits(userId, operation);

    if (!creditCheck.hasCredits) {
      return NextResponse.json(
        {
          error: 'Créditos insuficientes',
          required: creditCheck.required,
          current: creditCheck.currentBalance,
          deficit: creditCheck.deficit,
          qualityUsed: quality,
        },
        { status: 402 }
      );
    }

    // 2️⃣ GERAR IMAGEM (simulado - substitua com API real Imagen)
    console.log(`🎨 Gerando imagem ${quality}: "${prompt}"`);
    await new Promise(resolve => setTimeout(resolve, quality === 'fast' ? 2000 : quality === 'ultra' ? 10000 : 5000));
    
    const imageUrl = `https://example.com/images/${Date.now()}.png`;

    // 3️⃣ DEDUZIR CRÉDITOS
    console.log(`💳 Deduzindo ${creditCheck.required} créditos (${operation})...`);
    const deduction = await deductCredits(userId, operation, {
      prompt,
      resultUrl: imageUrl,
      model: operation === 'image_3' ? 'imagen-3' : `imagen-4-${quality}`,
      quality,
    });

    if (!deduction.success) {
      return NextResponse.json(
        {
          warning: 'Imagem gerada mas erro ao processar créditos',
          imageUrl,
        },
        { status: 200 }
      );
    }

    console.log(`✅ ${creditCheck.required} créditos deduzidos! Novo saldo: ${deduction.newBalance}`);

    return NextResponse.json({
      success: true,
      imageUrl,
      quality,
      model: operation === 'image_3' ? 'imagen-3' : `imagen-4-${quality}`,
      creditsUsed: creditCheck.required,
      newBalance: deduction.newBalance,
      transactionId: deduction.transactionId,
    });

  } catch (error: any) {
    console.error('❌ Erro na API de geração de imagem:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

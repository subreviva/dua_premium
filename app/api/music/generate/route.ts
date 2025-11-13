import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkCredits, deductCredits } from '@/lib/credits/credits-service';
import type { CreditOperation } from '@/lib/credits/credits-config';

// Cliente Supabase com SERVICE_ROLE_KEY (server-only)
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
    // 1️⃣ Obter dados do request
    const body = await req.json();
    const { prompt, userId } = body;

    if (!userId || !prompt) {
      return NextResponse.json(
        { error: 'userId e prompt são obrigatórios' },
        { status: 400 }
      );
    }

    // 2️⃣ VERIFICAR CRÉDITOS ANTES
    console.log(`🎵 Verificando créditos para gerar música (user: ${userId})`);
    const creditCheck = await checkCredits(userId, 'music_generate_v5');

    if (!creditCheck.hasCredits) {
      return NextResponse.json(
        {
          error: 'Créditos insuficientes',
          required: creditCheck.required,
          current: creditCheck.currentBalance,
          deficit: creditCheck.deficit,
          message: creditCheck.message,
        },
        { status: 402 } // 402 Payment Required
      );
    }

    console.log(`✅ Créditos OK (saldo: ${creditCheck.currentBalance})`);

    // 3️⃣ EXECUTAR OPERAÇÃO (simulado - substitua com chamada real à API de música)
    console.log(`🎵 Gerando música: "${prompt}"`);
    
    // TODO: Substituir com chamada real à API Suno
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simular delay
    
    const musicUrl = `https://example.com/music/${Date.now()}.mp3`;
    const success = true;

    if (!success) {
      return NextResponse.json(
        { error: 'Erro ao gerar música' },
        { status: 500 }
      );
    }

    // 4️⃣ DEDUZIR CRÉDITOS APÓS SUCESSO
    console.log(`💳 Deduzindo ${creditCheck.required} créditos...`);
    const deduction = await deductCredits(userId, 'music_generate_v5', {
      prompt,
      resultUrl: musicUrl,
      model: 'suno-v5',
    });

    if (!deduction.success) {
      console.error('❌ Erro ao deduzir créditos:', deduction.error);
      // Música foi gerada mas créditos não foram deduzidos
      // Log para análise posterior
      return NextResponse.json(
        {
          warning: 'Música gerada mas erro ao processar créditos',
          musicUrl,
        },
        { status: 200 }
      );
    }

    console.log(`✅ Créditos deduzidos! Novo saldo: ${deduction.newBalance}`);

    // 5️⃣ RETORNAR SUCESSO
    return NextResponse.json({
      success: true,
      musicUrl,
      creditsUsed: creditCheck.required,
      newBalance: deduction.newBalance,
      transactionId: deduction.transactionId,
    });

  } catch (error: any) {
    console.error('❌ Erro na API de geração de música:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

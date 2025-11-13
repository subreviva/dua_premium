import { NextRequest, NextResponse } from 'next/server';
import { checkCredits, deductCredits } from '@/lib/credits/credits-service';
import type { CreditOperation } from '@/lib/credits/credits-config';

export async function POST(request: NextRequest) {
  try {
    const { user_id, base64ImageData, mimeType } = await request.json();

    // Validar user_id
    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id é obrigatório' },
        { status: 400 }
      );
    }

    if (!base64ImageData) {
      return NextResponse.json(
        { error: 'base64ImageData é obrigatório' },
        { status: 400 }
      );
    }

    // CHECK CREDITS (1 crédito)
    const operation: CreditOperation = 'design_analyze_image';
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
    }

    // MOCK: Análise de exemplo
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const analysis = "Esta imagem apresenta uma composição moderna e vibrante, com forte contraste entre elementos quentes e frios. A iluminação é bem equilibrada, criando profundidade e dimensão. O estilo fotográfico sugere uma abordagem contemporânea com toques artísticos.";
    
    // DEDUCT CREDITS
    await deductCredits(user_id, operation, {
      model: 'mock',
    });

    return NextResponse.json({ success: true, analysis });
  } catch (error) {
    console.error('❌ [Analyze Image] Erro:', error);
    return NextResponse.json({ error: 'Falha ao analisar imagem' }, { status: 500 });
  }
}


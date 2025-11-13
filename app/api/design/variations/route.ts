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

    // CHECK CREDITS (15 créditos!)
    const operation: CreditOperation = 'design_generate_variations';
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

    // MOCK: Gera 3 variações
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const variations = [
      { src: `https://picsum.photos/seed/${Date.now()}/512/512`, mimeType: 'image/jpeg' },
      { src: `https://picsum.photos/seed/${Date.now() + 1}/512/512`, mimeType: 'image/jpeg' },
      { src: `https://picsum.photos/seed/${Date.now() + 2}/512/512`, mimeType: 'image/jpeg' }
    ];
    
    // DEDUCT CREDITS
    await deductCredits(user_id, operation, {
      numberOfVariations: 3,
      model: 'mock',
    });

    return NextResponse.json({ success: true, variations });
  } catch (error) {
    console.error('❌ [Variations] Erro:', error);
    return NextResponse.json({ error: 'Falha ao gerar variações' }, { status: 500 });
  }
}


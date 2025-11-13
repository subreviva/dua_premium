import { NextRequest, NextResponse } from 'next/server';
import { checkCredits, deductCredits } from '@/lib/credits/credits-service';
import type { CreditOperation } from '@/lib/credits/credits-config';

export async function POST(request: NextRequest) {
  try {
    const { user_id, base64ImageData, mimeType, prompt } = await request.json();

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

    // CHECK CREDITS
    const operation: CreditOperation = 'design_edit_image';
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

    // MOCK: Simula edição retornando imagem similar
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockImage = `https://picsum.photos/seed/${Date.now()}/1024/1024`;
    
    // DEDUCT CREDITS
    await deductCredits(user_id, operation, {
      prompt: prompt?.substring(0, 100) || 'edit',
      model: 'mock',
    });

    return NextResponse.json({
      success: true,
      src: mockImage,
      mimeType: 'image/jpeg'
    });
  } catch (error) {
    console.error('❌ [Edit Image] Erro:', error);
    return NextResponse.json({ error: 'Falha ao editar imagem' }, { status: 500 });
  }
}


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

    // CHECK CREDITS (2 créditos)
    const operation: CreditOperation = 'design_extract_colors';
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

    // MOCK: Paleta de exemplo
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockPalette = [
      { hex: '#FF6B6B', name: 'Coral Vibrante' },
      { hex: '#4ECDC4', name: 'Turquesa Moderno' },
      { hex: '#45B7D1', name: 'Azul Celeste' },
      { hex: '#FFA07A', name: 'Salmão Suave' },
      { hex: '#98D8C8', name: 'Menta Fresco' }
    ];
    
    // DEDUCT CREDITS
    await deductCredits(user_id, operation, {
      model: 'mock',
    });

    return NextResponse.json({ success: true, palette: mockPalette });
  } catch (error) {
    console.error('❌ [Color Palette] Erro:', error);
    return NextResponse.json({ error: 'Falha ao extrair paleta' }, { status: 500 });
  }
}


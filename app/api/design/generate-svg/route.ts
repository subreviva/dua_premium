import { NextRequest, NextResponse } from 'next/server';
import { checkCredits, deductCredits } from '@/lib/credits/credits-service';
import type { CreditOperation } from '@/lib/credits/credits-config';

export async function POST(request: NextRequest) {
  try {
    const { user_id, prompt } = await request.json();

    // Validar user_id
    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id é obrigatório' },
        { status: 400 }
      );
    }

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'prompt é obrigatório' },
        { status: 400 }
      );
    }

    // CHECK CREDITS
    const operation: CreditOperation = 'design_generate_svg';
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

    // MOCK: SVG simples de exemplo
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const svgCode = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <circle cx="100" cy="100" r="80" fill="#4ECDC4" stroke="#2C3E50" stroke-width="4"/>
  <text x="100" y="110" text-anchor="middle" font-size="24" fill="#2C3E50" font-family="Arial">SVG</text>
</svg>`;
    
    // DEDUCT CREDITS
    await deductCredits(user_id, operation, {
      prompt: prompt.substring(0, 100),
      model: 'mock',
    });

    return NextResponse.json({ success: true, svgCode });
  } catch (error) {
    console.error('❌ [Generate SVG] Erro:', error);
    return NextResponse.json({ error: 'Falha ao gerar SVG' }, { status: 500 });
  }
}


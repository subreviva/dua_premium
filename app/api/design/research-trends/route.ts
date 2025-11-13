import { NextRequest, NextResponse } from 'next/server';
import { checkCredits, deductCredits } from '@/lib/credits/credits-service';
import type { CreditOperation } from '@/lib/credits/credits-config';

export async function POST(request: NextRequest) {
  try {
    const { user_id, query } = await request.json();

    // Validar user_id
    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id é obrigatório' },
        { status: 400 }
      );
    }

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'query é obrigatório' },
        { status: 400 }
      );
    }

    // CHECK CREDITS (2 créditos)
    const operation: CreditOperation = 'design_trends';
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

    // MOCK: Tendências de exemplo
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const text = "As tendências de design para 2025 incluem: cores vibrantes e gradientes ousados, tipografia experimental, elementos 3D e glassmorphism, design minimalista com toques maximalistas, e uma forte ênfase em acessibilidade e design inclusivo.";
    const sources = [
      { web: { uri: 'https://example.com', title: 'Design Trends 2025' } },
      { web: { uri: 'https://example.com/article', title: 'Future of Design' } }
    ];
    
    // DEDUCT CREDITS
    await deductCredits(user_id, operation, {
      query: query.substring(0, 100),
      model: 'mock',
    });

    return NextResponse.json({ success: true, text, sources });
  } catch (error) {
    console.error('❌ [Research Trends] Erro:', error);
    return NextResponse.json({ error: 'Falha ao pesquisar tendências' }, { status: 500 });
  }
}


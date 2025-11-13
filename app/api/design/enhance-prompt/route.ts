import { NextRequest, NextResponse } from 'next/server';

/**
 * Design Assistant - Enhance Prompt (GRÁTIS - 0 créditos)
 * 
 * Este endpoint é gratuito para ajudar usuários a melhorar seus prompts.
 * Rate limiting pode ser aplicado para prevenir abuso.
 */

export async function POST(request: NextRequest) {
  try {
    const { user_id, idea } = await request.json();

    // Validar user_id (para logging/rate limiting)
    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id é obrigatório' },
        { status: 400 }
      );
    }

    if (!idea || idea.trim().length === 0) {
      return NextResponse.json(
        { error: 'idea é obrigatório' },
        { status: 400 }
      );
    }

    // GRÁTIS - Sem cobrança de créditos
    console.log(`✨ [Enhance Prompt] Usuário ${user_id} (GRÁTIS)`);

    // MOCK: Melhora o prompt com detalhes
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const enhancedPrompt = `${idea}, ultra-realistic, highly detailed, 8K resolution, professional photography, dramatic lighting, cinematic composition, vibrant colors, sharp focus`;
    
    return NextResponse.json({ success: true, enhancedPrompt });
  } catch (error) {
    console.error('❌ [Enhance Prompt] Erro:', error);
    return NextResponse.json({ error: 'Falha ao melhorar prompt' }, { status: 500 });
  }
}


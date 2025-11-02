import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { idea } = await request.json();

    // MOCK: Melhora o prompt com detalhes
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const enhancedPrompt = `${idea}, ultra-realistic, highly detailed, 8K resolution, professional photography, dramatic lighting, cinematic composition, vibrant colors, sharp focus`;
    
    return NextResponse.json({ enhancedPrompt });
  } catch (error) {
    return NextResponse.json({ error: 'Falha ao melhorar prompt' }, { status: 500 });
  }
}

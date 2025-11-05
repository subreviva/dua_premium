import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { base64ImageData, mimeType } = await request.json();

    // MOCK: Análise de exemplo
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const analysis = "Esta imagem apresenta uma composição moderna e vibrante, com forte contraste entre elementos quentes e frios. A iluminação é bem equilibrada, criando profundidade e dimensão. O estilo fotográfico sugere uma abordagem contemporânea com toques artísticos.";
    
    return NextResponse.json({ analysis });
  } catch (error) {
    return NextResponse.json({ error: 'Falha ao analisar imagem' }, { status: 500 });
  }
}

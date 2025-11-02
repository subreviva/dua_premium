import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { base64ImageData, mimeType, prompt } = await request.json();

    // MOCK: Simula edição retornando imagem similar
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockImage = `https://picsum.photos/seed/${Date.now()}/1024/1024`;
    
    return NextResponse.json({
      src: mockImage,
      mimeType: 'image/jpeg'
    });
  } catch (error) {
    return NextResponse.json({ error: 'Falha ao editar imagem' }, { status: 500 });
  }
}

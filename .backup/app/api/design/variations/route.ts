import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { base64ImageData, mimeType } = await request.json();

    // MOCK: Gera 3 variações
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const variations = [
      { src: `https://picsum.photos/seed/${Date.now()}/512/512`, mimeType: 'image/jpeg' },
      { src: `https://picsum.photos/seed/${Date.now() + 1}/512/512`, mimeType: 'image/jpeg' },
      { src: `https://picsum.photos/seed/${Date.now() + 2}/512/512`, mimeType: 'image/jpeg' }
    ];
    
    return NextResponse.json({ variations });
  } catch (error) {
    return NextResponse.json({ error: 'Falha ao gerar variações' }, { status: 500 });
  }
}

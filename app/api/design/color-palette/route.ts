import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { base64ImageData, mimeType } = await request.json();

    // MOCK: Paleta de exemplo
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockPalette = [
      { hex: '#FF6B6B', name: 'Coral Vibrante' },
      { hex: '#4ECDC4', name: 'Turquesa Moderno' },
      { hex: '#45B7D1', name: 'Azul Celeste' },
      { hex: '#FFA07A', name: 'Salmão Suave' },
      { hex: '#98D8C8', name: 'Menta Fresco' }
    ];
    
    return NextResponse.json({ palette: mockPalette });
  } catch (error) {
    return NextResponse.json({ error: 'Falha ao extrair paleta' }, { status: 500 });
  }
}

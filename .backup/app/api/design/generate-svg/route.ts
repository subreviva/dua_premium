import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    // MOCK: SVG simples de exemplo
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const svgCode = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <circle cx="100" cy="100" r="80" fill="#4ECDC4" stroke="#2C3E50" stroke-width="4"/>
  <text x="100" y="110" text-anchor="middle" font-size="24" fill="#2C3E50" font-family="Arial">SVG</text>
</svg>`;
    
    return NextResponse.json({ svgCode });
  } catch (error) {
    return NextResponse.json({ error: 'Falha ao gerar SVG' }, { status: 500 });
  }
}

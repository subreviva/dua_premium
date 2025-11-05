import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    // MOCK: Tendências de exemplo
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const text = "As tendências de design para 2025 incluem: cores vibrantes e gradientes ousados, tipografia experimental, elementos 3D e glassmorphism, design minimalista com toques maximalistas, e uma forte ênfase em acessibilidade e design inclusivo.";
    const sources = [
      { web: { uri: 'https://example.com', title: 'Design Trends 2025' } },
      { web: { uri: 'https://example.com/article', title: 'Future of Design' } }
    ];
    
    return NextResponse.json({ text, sources });
  } catch (error) {
    return NextResponse.json({ error: 'Falha ao pesquisar tendências' }, { status: 500 });
  }
}

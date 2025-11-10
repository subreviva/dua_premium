import { NextRequest, NextResponse } from 'next/server';

interface LinkMetadata {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
  siteName?: string;
  type?: 'video' | 'music' | 'article' | 'website';
  provider?: string;
  embedUrl?: string;
  author?: string;
  channelName?: string;
  keywords?: string[];
  durationSeconds?: number;
}

async function fetchMetadata(url: string): Promise<LinkMetadata | null> {
  try {
    // Usar localhost quando chamando internamente no servidor
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/link-preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
      // Cache de 1 minuto para reduzir chamadas repetidas
      next: { revalidate: 60 }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data as LinkMetadata;
  } catch (err) {
    console.error('Failed to fetch metadata for', url, err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { urls } = await req.json();
    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: 'urls required' }, { status: 400 });
    }
    
    // Limitar a 10 links por request para evitar timeout
    const limited = urls.slice(0, 10);
    const metas = await Promise.all(limited.map(fetchMetadata));
    const payload = metas.filter(Boolean);
    
    return NextResponse.json({ links: payload });
  } catch (e) {
    console.error('link-intel error:', e);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}

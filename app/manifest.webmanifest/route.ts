import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: Request) {
  try {
    // Ler o manifest estático
    const manifestPath = path.join(process.cwd(), 'public', 'manifest.webmanifest');
    const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
    
    // Headers com CORS completo
    const headers = new Headers({
      'Content-Type': 'application/manifest+json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'public, max-age=3600',
    });
    
    return new NextResponse(manifestContent, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('❌ Erro ao carregar manifest:', error);
    
    // Fallback manifest mínimo
    const minimalManifest = {
      name: "DUA IA",
      short_name: "DUA",
      start_url: "/",
      display: "standalone",
      background_color: "#000000",
      theme_color: "#000000",
      icons: []
    };
    
    return new NextResponse(JSON.stringify(minimalManifest), {
      status: 200,
      headers: {
        'Content-Type': 'application/manifest+json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'no-store',
      },
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

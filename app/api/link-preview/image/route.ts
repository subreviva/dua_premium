import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const target = searchParams.get('url');
    if (!target) {
      return new Response('Missing url', { status: 400 });
    }

    // Validate URL
    let targetUrl: URL;
    try {
      targetUrl = new URL(target);
    } catch {
      return new Response('Invalid url', { status: 400 });
    }
    if (!/^https?:$/.test(targetUrl.protocol)) {
      return new Response('Unsupported protocol', { status: 400 });
    }

    const upstream = await fetch(targetUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DuaBot/1.0)'
      },
      // Revalidate frequently but allow CDN/browser cache
      cache: 'no-store'
    });

    if (!upstream.ok) {
      return new Response(`Upstream error: ${upstream.status}`, { status: 502 });
    }

    // Pass through content type and length if available
    const headers = new Headers();
    const ct = upstream.headers.get('content-type');
    if (ct) headers.set('content-type', ct);
    const cl = upstream.headers.get('content-length');
    if (cl) headers.set('content-length', cl);
    headers.set('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800');

    return new Response(upstream.body, { status: 200, headers });
  } catch (err) {
    console.error('Image proxy error:', err);
    return new Response('Image proxy failure', { status: 500 });
  }
}

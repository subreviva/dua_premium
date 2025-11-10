import { NextRequest, NextResponse } from 'next/server';
import { JSDOM } from 'jsdom';

/**
 * 🔗 API Route: Link Preview Metadata
 * 
 * Busca metadados de links (Open Graph, Twitter Cards, oEmbed)
 * Suporta: YouTube, Spotify, Twitter, websites genéricos
 */

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
  duration?: string;
  author?: string;
  publishedTime?: string;
  channelTitle?: string;
  tags?: string[];
  categoryId?: string;
}

// Detectar tipo de link
function detectLinkType(url: string): { provider: string; type: string; id?: string } {
  const urlObj = new URL(url);
  const hostname = urlObj.hostname.replace('www.', '');

  // YouTube
  if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
    const videoId = hostname.includes('youtu.be')
      ? urlObj.pathname.slice(1)
      : urlObj.searchParams.get('v');
    return { provider: 'YouTube', type: 'video', id: videoId || undefined };
  }

  // Spotify
  if (hostname.includes('spotify.com')) {
    const match = urlObj.pathname.match(/\/(track|album|playlist|artist)\/([a-zA-Z0-9]+)/);
    return {
      provider: 'Spotify',
      type: match?.[1] || 'music',
      id: match?.[2] || undefined
    };
  }

  // Twitter/X
  if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
    return { provider: 'Twitter', type: 'article' };
  }

  // SoundCloud
  if (hostname.includes('soundcloud.com')) {
    return { provider: 'SoundCloud', type: 'music' };
  }

  // Vimeo
  if (hostname.includes('vimeo.com')) {
    const videoId = urlObj.pathname.slice(1);
    return { provider: 'Vimeo', type: 'video', id: videoId };
  }

  // GitHub
  if (hostname.includes('github.com')) {
    return { provider: 'GitHub', type: 'article' };
  }

  return { provider: 'Generic', type: 'website' };
}

// Buscar metadados do YouTube usando YouTube Data API v3
async function getYouTubeMetadata(videoId: string): Promise<Partial<LinkMetadata>> {
  const apiKey = process.env.GOOGLE_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️ GOOGLE_API_KEY not found, falling back to scraping');
    return getYouTubeFallback(videoId);
  }

  try {
    // YouTube Data API v3: videos.list
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      console.error('YouTube API error:', response.status, response.statusText);
      return getYouTubeFallback(videoId);
    }

    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      console.warn('YouTube API returned no items for videoId:', videoId);
      return getYouTubeFallback(videoId);
    }

    const video = data.items[0];
    const snippet = video.snippet;
    const contentDetails = video.contentDetails;

    // Thumbnail de alta qualidade
    const thumbnail = snippet.thumbnails?.maxres?.url ||
                      snippet.thumbnails?.high?.url ||
                      snippet.thumbnails?.medium?.url ||
                      `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    return {
      title: snippet.title,
      description: snippet.description,
      author: snippet.channelTitle, // Nome do canal (correto)
      channelTitle: snippet.channelTitle,
      tags: snippet.tags || [],
      categoryId: snippet.categoryId,
      image: thumbnail,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      type: 'video',
      provider: 'YouTube',
      siteName: 'YouTube',
      publishedTime: snippet.publishedAt,
      duration: contentDetails?.duration
    };
  } catch (error) {
    console.error('YouTube Data API failed, using fallback:', error);
    return getYouTubeFallback(videoId);
  }
}

// Fallback: scraping quando API não disponível
async function getYouTubeFallback(videoId: string): Promise<Partial<LinkMetadata>> {
  try {
    // Tentar oEmbed API do YouTube primeiro
    const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    
    if (response.ok) {
      const data = await response.json();
      return {
        title: data.title,
        author: data.author_name,
        image: data.thumbnail_url,
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        type: 'video',
        provider: 'YouTube',
        siteName: 'YouTube'
      };
    }
  } catch (error) {
    console.error('YouTube oEmbed failed, falling back to scraping:', error);
  }

  // Fallback: scraping da página do vídeo
  try {
    const pageUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const pageResponse = await fetch(pageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DuaBot/1.0)'
      }
    });
    
    if (!pageResponse.ok) throw new Error('Failed to fetch page');
    
    const html = await pageResponse.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const getMetaContent = (property: string): string | null => {
      return document.querySelector(`meta[property="${property}"]`)?.getAttribute('content') ||
             document.querySelector(`meta[name="${property}"]`)?.getAttribute('content') || null;
    };

    let title = getMetaContent('og:title') || 
                getMetaContent('twitter:title') ||
                document.querySelector('title')?.textContent || 
                undefined;

    let channelName: string | undefined = undefined;
    let description = getMetaContent('og:description') || undefined;
    let keywords: string[] | undefined = undefined;
    let durationSeconds: number | undefined = undefined;

    // Tentar extrair do ytInitialPlayerResponse (mais confiável)
    try {
      const scripts = Array.from(document.querySelectorAll('script')).map(s => s.textContent || '');
      for (const sc of scripts) {
        const idx = sc.indexOf('ytInitialPlayerResponse');
        if (idx !== -1) {
          const eq = sc.indexOf('=', idx);
          if (eq !== -1) {
            let slice = sc.slice(eq + 1);
            // Procurar término do objeto
            let end = slice.indexOf('};');
            if (end === -1) end = slice.indexOf('}\n');
            if (end === -1) end = slice.indexOf('}\r');
            if (end === -1) end = slice.indexOf('}');
            let jsonRaw = end !== -1 ? slice.slice(0, end + 1) : slice;
            // Sanitizar
            const closing = jsonRaw.lastIndexOf('}');
            if (closing !== -1) jsonRaw = jsonRaw.slice(0, closing + 1);
            const data = JSON.parse(jsonRaw);
            const vd = data?.videoDetails;
            if (vd) {
              title = vd.title || title;
              channelName = vd.author || channelName;
              description = vd.shortDescription || description;
              if (Array.isArray(vd.keywords)) keywords = vd.keywords;
              if (vd.lengthSeconds) durationSeconds = Number(vd.lengthSeconds);
            }
            break;
          }
        }
      }
    } catch (e) {
      console.warn('YouTube: failed to parse ytInitialPlayerResponse', e);
    }

    // Thumbnail sempre disponível via i.ytimg.com
    const thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    return {
      title,
      author: channelName, // usar nome do canal como autor
      channelTitle: channelName,
      description,
      tags: keywords,
      image: thumbnail,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      type: 'video',
      provider: 'YouTube',
      siteName: 'YouTube'
    };
  } catch (error) {
    console.error('YouTube scraping fallback failed:', error);
    // Último recurso: retornar pelo menos o thumbnail
    return {
      image: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      type: 'video',
      provider: 'YouTube',
      siteName: 'YouTube'
    };
  }
}

// Buscar metadados do Spotify
async function getSpotifyMetadata(url: string, type: string, id: string): Promise<Partial<LinkMetadata>> {
  try {
    // Spotify não tem oEmbed público direto, mas podemos usar Open Graph
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DuaBot/1.0)'
      }
    });
    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const getMetaContent = (property: string): string | null => {
      return document.querySelector(`meta[property="${property}"]`)?.getAttribute('content') || null;
    };

    return {
      title: getMetaContent('og:title') || undefined,
      description: getMetaContent('og:description') || undefined,
      image: getMetaContent('og:image') || undefined,
      type: 'music',
      provider: 'Spotify',
      siteName: 'Spotify',
      embedUrl: `https://open.spotify.com/embed/${type}/${id}`
    };
  } catch (error) {
    console.error('Spotify metadata error:', error);
    return {};
  }
}

// Buscar metadados genéricos (Open Graph + Twitter Cards)
async function getGenericMetadata(url: string): Promise<Partial<LinkMetadata>> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DuaBot/1.0)'
      }
    });
    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const getMetaContent = (selectors: string[]): string | null => {
      for (const selector of selectors) {
        const content = document.querySelector(selector)?.getAttribute('content');
        if (content) return content;
      }
      return null;
    };

    // Buscar favicon
    let favicon = document.querySelector('link[rel="icon"]')?.getAttribute('href') ||
                  document.querySelector('link[rel="shortcut icon"]')?.getAttribute('href');
    
    if (favicon && !favicon.startsWith('http')) {
      const urlObj = new URL(url);
      favicon = `${urlObj.protocol}//${urlObj.host}${favicon.startsWith('/') ? '' : '/'}${favicon}`;
    }

    return {
      title: getMetaContent([
        'meta[property="og:title"]',
        'meta[name="twitter:title"]',
        'meta[name="title"]'
      ]) || document.querySelector('title')?.textContent || undefined,
      
      description: getMetaContent([
        'meta[property="og:description"]',
        'meta[name="twitter:description"]',
        'meta[name="description"]'
      ]) || undefined,
      
      image: getMetaContent([
        'meta[property="og:image"]',
        'meta[name="twitter:image"]',
        'meta[property="og:image:secure_url"]'
      ]) || undefined,
      
      siteName: getMetaContent([
        'meta[property="og:site_name"]'
      ]) || new URL(url).hostname.replace('www.', ''),
      
      type: (getMetaContent(['meta[property="og:type"]']) as any) || 'website',
      
      favicon: favicon || undefined,
      
      author: getMetaContent([
        'meta[name="author"]',
        'meta[property="article:author"]'
      ]) || undefined,
      
      publishedTime: getMetaContent([
        'meta[property="article:published_time"]'
      ]) || undefined
    };
  } catch (error) {
    console.error('Generic metadata error:', error);
    return {};
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL inválida' },
        { status: 400 }
      );
    }

    // Validar URL
    let urlObj: URL;
    try {
      urlObj = new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Formato de URL inválido' },
        { status: 400 }
      );
    }

    const { provider, type, id } = detectLinkType(url);
    let metadata: Partial<LinkMetadata> = { url };

    // Buscar metadados específicos por provider
    switch (provider) {
      case 'YouTube':
        if (id) {
          metadata = { ...metadata, ...(await getYouTubeMetadata(id)) };
        }
        break;

      case 'Spotify':
        if (id) {
          metadata = { ...metadata, ...(await getSpotifyMetadata(url, type, id)) };
        }
        break;

      default:
        metadata = { ...metadata, ...(await getGenericMetadata(url)) };
    }

    // Adicionar provider e type se não vieram dos metadados
    if (!metadata.provider) metadata.provider = provider;
    if (!metadata.type) metadata.type = type as any;

    return NextResponse.json(metadata);

  } catch (error) {
    console.error('Link preview error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar metadados do link' },
      { status: 500 }
    );
  }
}

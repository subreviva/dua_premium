'use client';

import { useMemo } from 'react';

/**
 * 🔗 Hook: useLinkDetection
 * 
 * Detecta URLs em texto e extrai informações
 * Suporta: URLs completas, YouTube, Spotify, Twitter, etc.
 */

export interface DetectedLink {
  url: string;
  text: string;
  startIndex: number;
  endIndex: number;
  protocol?: string;
}

// Regex base para URLs "cruas"
// Observações:
// 1. Evita capturar pontuação final comum (.,!?;:) que o usuário possa ter digitado após o link
// 2. Permite parênteses internos balanceados simples (ex: wikipedia (pt)) mas corta os externos
// 3. Não tenta validar exaustivamente TLD – assume qualquer sequência sem espaços
const RAW_URL_REGEX = /(https?:\/\/[^\s<>()]+(?:\([^\s()]*\)[^\s<>()]*)*)/gi;

// Markdown links: [texto](https://example.com/abc)
const MARKDOWN_LINK_REGEX = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/gi;

// Angle bracket links: <https://example.com/xyz>
const ANGLE_LINK_REGEX = /<(https?:\/\/[^>\s]+)>/gi;

// Trailing punctuation que deve ser removida do final da URL se presente
const TRAILING_PUNCTUATION = /[\.,!?;:]+$/;

export function useLinkDetection(text: string) {
  const links = useMemo(() => {
    if (!text) return [] as DetectedLink[];

    console.log('🔍 useLinkDetection - Input text:', text);

    const detected: DetectedLink[] = [];
    const consumedRanges: Array<[number, number]> = []; // Para evitar contagem duplicada (ex: URL dentro de markdown)

    const addRange = (start: number, end: number) => consumedRanges.push([start, end]);
    const isConsumed = (start: number, end: number) => consumedRanges.some(r => start < r[1] && end > r[0]);

    // Função de sanitização de URL (remove pontuação final)
    const sanitizeUrl = (raw: string) => raw.replace(TRAILING_PUNCTUATION, '');

    // 1. Detectar markdown links primeiro
    MARKDOWN_LINK_REGEX.lastIndex = 0;
    let mdMatch: RegExpExecArray | null;
    while ((mdMatch = MARKDOWN_LINK_REGEX.exec(text)) !== null) {
      const fullMatch = mdMatch[0];
      const label = mdMatch[1];
      const urlRaw = mdMatch[2];
      const start = mdMatch.index;
      const end = start + fullMatch.length;
      const url = sanitizeUrl(urlRaw);
      addRange(start, end);

      console.log('✅ Markdown link:', { label, url, range: [start, end] });
      detected.push({
        url,
        text: fullMatch, // remove tudo (label + parênteses) quando fazendo replace
        startIndex: start,
        endIndex: end,
        protocol: url.startsWith('http') ? url.split(':')[0] : 'https'
      });
    }

    // 2. Detectar angle bracket links <url>
    ANGLE_LINK_REGEX.lastIndex = 0;
    let angleMatch: RegExpExecArray | null;
    while ((angleMatch = ANGLE_LINK_REGEX.exec(text)) !== null) {
      const fullMatch = angleMatch[0];
      const urlRaw = angleMatch[1];
      const start = angleMatch.index;
      const end = start + fullMatch.length;
      if (isConsumed(start, end)) continue; // já coberto
      const url = sanitizeUrl(urlRaw);
      addRange(start, end);
      console.log('✅ Angle link:', { url, range: [start, end] });
      detected.push({
        url,
        text: fullMatch,
        startIndex: start,
        endIndex: end,
        protocol: url.startsWith('http') ? url.split(':')[0] : 'https'
      });
    }

    // 3. Detectar URLs "cruas"
    RAW_URL_REGEX.lastIndex = 0;
    let rawMatch: RegExpExecArray | null;
    while ((rawMatch = RAW_URL_REGEX.exec(text)) !== null) {
      const urlRaw = rawMatch[0];
      const start = rawMatch.index;
      const end = start + urlRaw.length;
      if (isConsumed(start, end)) continue; // dentro de markdown ou angle

      const sanitized = sanitizeUrl(urlRaw);
      // Ajustar endIndex se sanitização removeu chars
      const adjustedEnd = start + sanitized.length;
      console.log('✅ Raw URL:', { url: sanitized, range: [start, adjustedEnd] });
      detected.push({
        url: sanitized,
        text: urlRaw, // manter texto original para replace (inclui eventual pontuação, tratamos no sanitize só para url)
        startIndex: start,
        endIndex: adjustedEnd,
        protocol: sanitized.startsWith('http') ? sanitized.split(':')[0] : 'https'
      });
    }

    // 4. Remover duplicados por URL mantendo primeira ocorrência
    const unique: DetectedLink[] = [];
    const seen = new Set<string>();
    for (const link of detected.sort((a,b)=> a.startIndex - b.startIndex)) {
      if (!seen.has(link.url)) {
        seen.add(link.url);
        unique.push(link);
      }
    }

    console.log('🔗 Total links detected (unique):', unique.length, unique);
    return unique;
  }, [text]);

  const hasLinks = links.length > 0;

  // Dividir texto em partes (texto normal e links)
  const textParts = useMemo(() => {
    if (!hasLinks) return [{ type: 'text' as const, content: text }];

    const parts: Array<{ type: 'text' | 'link'; content: string; url?: string }> = [];
    let lastIndex = 0;

    links.forEach((link) => {
      // Adicionar texto antes do link
      if (link.startIndex > lastIndex) {
        parts.push({
          type: 'text',
          content: text.substring(lastIndex, link.startIndex)
        });
      }

      // Adicionar link
      parts.push({
        type: 'link',
        content: link.text,
        url: link.url
      });

      lastIndex = link.endIndex;
    });

    // Adicionar texto restante
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex)
      });
    }

    return parts;
  }, [text, links, hasLinks]);

  return {
    links,
    hasLinks,
    textParts,
    linkCount: links.length
  };
}

/**
 * 🎯 Hook: useRichLinkDetection
 * 
 * Versão avançada que detecta tipos específicos de links
 */
export function useRichLinkDetection(text: string) {
  const { links, hasLinks, textParts } = useLinkDetection(text);

  const categorizedLinks = useMemo(() => {
    return links.map(link => {
      const url = new URL(link.url);
      const hostname = url.hostname.replace('www.', '');

      let type: 'youtube' | 'spotify' | 'twitter' | 'soundcloud' | 'github' | 'generic' = 'generic';
      let provider = hostname;

      if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
        type = 'youtube';
        provider = 'YouTube';
      } else if (hostname.includes('spotify.com')) {
        type = 'spotify';
        provider = 'Spotify';
      } else if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
        type = 'twitter';
        provider = 'Twitter';
      } else if (hostname.includes('soundcloud.com')) {
        type = 'soundcloud';
        provider = 'SoundCloud';
      } else if (hostname.includes('github.com')) {
        type = 'github';
        provider = 'GitHub';
      }

      return {
        ...link,
        type,
        provider,
        hostname
      };
    });
  }, [links]);

  const linksByType = useMemo(() => {
    const grouped: Record<string, typeof categorizedLinks> = {
      youtube: [],
      spotify: [],
      twitter: [],
      soundcloud: [],
      github: [],
      generic: []
    };

    categorizedLinks.forEach(link => {
      grouped[link.type].push(link);
    });

    return grouped;
  }, [categorizedLinks]);

  return {
    links: categorizedLinks,
    hasLinks,
    textParts,
    linkCount: links.length,
    linksByType,
    hasYouTube: linksByType.youtube.length > 0,
    hasSpotify: linksByType.spotify.length > 0,
    hasTwitter: linksByType.twitter.length > 0
  };
}

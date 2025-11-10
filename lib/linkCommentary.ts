export interface SimpleLinkMetadata {
  url: string;
  provider?: string;
  siteName?: string;
  title?: string;
  description?: string;
  author?: string; // canal no YouTube
  channelTitle?: string;
  tags?: string[]; // Tags reais da YouTube API
  type?: string; // video | music | article | website
}

// Classificar usando tags reais da API ou palavras-chave do título/descrição
function classifyContent(meta: SimpleLinkMetadata): string[] {
  const result: string[] = [];
  const push = (tag: string) => { if (!result.includes(tag)) result.push(tag); };
  
  // Se temos tags reais do YouTube, usar diretamente (mais preciso)
  if (meta.tags && meta.tags.length > 0) {
    const tagsLower = meta.tags.map(t => t.toLowerCase());
    if (tagsLower.some(t => /music|música|song|track|album/.test(t))) push('música');
    if (tagsLower.some(t => /live|ao vivo|stream|concert/.test(t))) push('live');
    if (tagsLower.some(t => /remix|mix|mashup/.test(t))) push('remix');
    if (tagsLower.some(t => /tutorial|how to|guia|guide/.test(t))) push('tutorial');
    if (tagsLower.some(t => /trailer|teaser/.test(t))) push('trailer');
    if (tagsLower.some(t => /review|análise/.test(t))) push('review');
    if (tagsLower.some(t => /lyrics|letra/.test(t))) push('lyrics');
    if (tagsLower.some(t => /podcast/.test(t))) push('podcast');
    if (tagsLower.some(t => /shorts/.test(t))) push('short');
    if (tagsLower.some(t => /official.*video|official.*music/.test(t))) push('oficial');
  }
  
  // Fallback: análise do título e descrição se não temos tags
  if (result.length === 0) {
    const text = `${meta.title || ''} ${meta.description || ''}`.toLowerCase();
    if (/tutorial|how to|guia|guide|como /.test(text)) push('tutorial');
    if (/(^|\s)live(\s|$)|ao vivo|stream/.test(text)) push('live');
    if (/official video|official music video|clipe oficial|vídeo oficial/.test(text)) push('oficial');
    if (/lyrics|letra/.test(text)) push('lyrics');
    if (/remix|mix|versão|version/.test(text)) push('remix');
    if (/trailer|teaser/.test(text)) push('trailer');
    if (/review|análise|analysis/.test(text)) push('review');
    if (/shorts?/.test(text)) push('short');
    if (/podcast/.test(text)) push('podcast');
    if (/audio|visualizer/.test(text)) push('audio');
    if (/music|song/.test(text) && !/tutorial/.test(text)) push('música');
  }
  
  return result;
}

export function buildCommentary(metas: SimpleLinkMetadata[]): string {
  if (metas.length === 0) return '';
  const sections = metas.map(m => {
    const provider = m.provider || m.siteName || 'Link';
    const title = m.title ? `"${m.title}"` : m.url;
    const tags = classifyContent(m);
    const tagStr = tags.length ? ` Tags: ${tags.map((t: string) => `#${t}`).join(' ')}` : '';
    let prefix = '🔗';
    if (m.provider === 'YouTube') prefix = '🎬';
    else if (m.provider === 'Spotify' || m.type === 'music') prefix = '🎵';
    else if (m.provider === 'SoundCloud') prefix = '🎧';
    else if (m.provider === 'GitHub') prefix = '💻';
    const channel = m.channelTitle || m.author;
    const authorPart = channel ? ` (canal: ${channel})` : '';
    return `${prefix} ${provider}: ${title}${authorPart}.${tagStr}`;
  });
  return `Aqui está uma análise rápida dos links que você compartilhou:\n\n` + sections.join('\n') + `\n\nPosso ajudar mais se quiser detalhes ou contexto extra sobre algum deles.`;
}

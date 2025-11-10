/**
 * Auto-Search Intelligence
 * Deteta perguntas e pesquisa automaticamente sem mostrar ao usuário
 */

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink?: string;
}

interface SearchResponse {
  results: SearchResult[];
  searchQuery: string;
}

// Detectar se é uma pergunta que requer pesquisa
export function shouldSearch(message: string): boolean {
  const lower = message.toLowerCase().trim();
  
  // Perguntas diretas
  if (/^(quem|o que|onde|quando|como|por que|qual|quantos|quanto|que)(\s|é|está)/i.test(lower)) {
    return true;
  }
  
  // Verbos de interrogação
  if (/^(conhece|sabe|pode|tem|existe|há)(\s)/i.test(lower)) {
    return true;
  }
  
  // Perguntas implícitas
  if (/(me fala|me diz|explica|conta|diga|mostre) (sobre|mais sobre|quem|o que)/i.test(lower)) {
    return true;
  }
  
  // Acabou com "?"
  if (lower.endsWith('?')) {
    return true;
  }
  
  // Pedidos de informação atual
  if (/(notícias|atualidade|hoje|agora|recente|último|nova) (sobre|de|do)/i.test(lower)) {
    return true;
  }
  
  return false;
}

// Extrair query de pesquisa da mensagem
export function extractSearchQuery(message: string): string {
  // Remover palavras de cortesia no início
  let query = message
    .replace(/^(dua|hey|olá|oi|por favor|pf|pode|consegue|sabe)\s*/gi, '')
    .replace(/\?$/g, '')
    .trim();
  
  // Se começar com "quem é", manter assim
  if (/^(quem é|o que é|onde fica|quando foi|como funciona)/i.test(query)) {
    return query;
  }
  
  // Remover verbos auxiliares desnecessários
  query = query
    .replace(/^(me fala sobre|me diz sobre|me conte sobre|explica|conta sobre)\s*/gi, '')
    .trim();
  
  return query;
}

// Pesquisar usando Google Custom Search API
export async function performSearch(query: string): Promise<SearchResponse | null> {
  const apiKey = process.env.GOOGLE_API_KEY;
  const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
  
  if (!apiKey) {
    console.warn('⚠️ GOOGLE_API_KEY not configured for search');
    return null;
  }
  
  if (!searchEngineId) {
    console.warn('⚠️ GOOGLE_SEARCH_ENGINE_ID not configured');
    return null;
  }
  
  try {
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}&num=5`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Search API error:', response.status, response.statusText);
      return null;
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return { results: [], searchQuery: query };
    }
    
    const results: SearchResult[] = data.items.map((item: any) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
      displayLink: item.displayLink
    }));
    
    return { results, searchQuery: query };
  } catch (error) {
    console.error('Search failed:', error);
    return null;
  }
}

// Construir contexto de pesquisa para injetar no system prompt
export function buildSearchContext(searchResponse: SearchResponse): string {
  if (!searchResponse || searchResponse.results.length === 0) {
    return '';
  }
  
  const { results, searchQuery } = searchResponse;
  
  let context = `🔍 INFORMAÇÃO ATUAL DA INTERNET (pesquisa: "${searchQuery}"):\n\n`;
  
  results.forEach((result, index) => {
    context += `${index + 1}. **${result.title}**\n`;
    context += `   ${result.snippet}\n`;
    context += `   Fonte: ${result.displayLink || result.link}\n\n`;
  });
  
  context += `\nUSE ESTAS INFORMAÇÕES ATUALIZADAS para responder com precisão. Não mencione que pesquisou - responda diretamente como se já soubesse. Cite fontes naturalmente se relevante ("segundo [fonte]" ou "de acordo com...").`;
  
  return context;
}

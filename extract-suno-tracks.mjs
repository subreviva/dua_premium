#!/usr/bin/env node

/**
 * Script para extrair informações de tracks públicas do Suno
 * Usa as URLs fornecidas para buscar metadados e áudio
 */

const SUNO_TRACKS = [
  'https://suno.com/s/xJqFtvSGsgcaNczS',
  'https://suno.com/s/J9z2aqpTWcknLPil',
  'https://suno.com/s/EzOHEKgUHyGshDNR',
  'https://suno.com/s/Lq50KP37gz9hwLv0',
  'https://suno.com/s/xmQohTCXLLxIjOc4',
  'https://suno.com/s/zKgQ4mbyGiLCkqqo'
]

async function extractTrackData(url) {
  try {
    console.log(`\n🔍 Extraindo: ${url}`)
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const html = await response.text()
    
    // Extrair ID da track da URL
    const trackId = url.split('/s/')[1]
    
    // Buscar metadata no HTML
    const titleMatch = html.match(/<title>(.*?)<\/title>/)
    const title = titleMatch ? titleMatch[1].split(' | ')[0] : 'Untitled'
    
    // Buscar imagem de capa
    const imageMatch = html.match(/<meta property="og:image" content="(.*?)"/)
    const coverUrl = imageMatch ? imageMatch[1] : ''
    
    // Buscar URL de áudio (pode estar em diferentes formatos)
    const audioMatch = html.match(/"audio_url":"(.*?)"/) || 
                      html.match(/<audio.*?src="(.*?)"/) ||
                      html.match(/https:\/\/cdn[^"]*\.mp3/)
    const audioUrl = audioMatch ? (audioMatch[1] || audioMatch[0]) : ''
    
    // Buscar artista/criador
    const artistMatch = html.match(/"display_name":"(.*?)"/) ||
                       html.match(/<meta name="author" content="(.*?)"/)
    const artist = artistMatch ? artistMatch[1] : 'Unknown Artist'
    
    // Buscar gênero/tags
    const genreMatch = html.match(/"tags":"(.*?)"/) ||
                      html.match(/genre['":\s]+(.*?)['"]/i)
    const genre = genreMatch ? genreMatch[1] : 'Music'
    
    const trackData = {
      id: trackId,
      title: title.replace(' | Suno', '').trim(),
      artist,
      genre: genre.split(',')[0].trim(),
      cover: coverUrl || `https://picsum.photos/seed/${trackId}/400/400`,
      audioUrl: audioUrl || `https://cdn1.suno.ai/${trackId}.mp3`,
      sunoUrl: url
    }
    
    console.log('✅ Extraído:', trackData.title)
    return trackData
    
  } catch (error) {
    console.error(`❌ Erro ao extrair ${url}:`, error.message)
    const trackId = url.split('/s/')[1]
    return {
      id: trackId,
      title: 'Track from Suno',
      artist: 'Suno Community',
      genre: 'Music',
      cover: `https://picsum.photos/seed/${trackId}/400/400`,
      audioUrl: `https://cdn1.suno.ai/${trackId}.mp3`,
      sunoUrl: url
    }
  }
}

async function extractAllTracks() {
  console.log('🎵 Extraindo dados de tracks do Suno...\n')
  
  const results = []
  
  for (const url of SUNO_TRACKS) {
    const data = await extractTrackData(url)
    results.push(data)
    // Pequeno delay para não sobrecarregar o servidor
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  console.log('\n\n📊 RESULTADOS:\n')
  console.log('// Cole este array no components/featured-tracks-carousel.tsx\n')
  console.log('const FEATURED_TRACKS: Track[] = ')
  console.log(JSON.stringify(results, null, 2))
  
  console.log('\n\n✅ Extração completa!')
  console.log(`Total de tracks: ${results.length}`)
}

extractAllTracks().catch(console.error)

#!/usr/bin/env node

/**
 * EXTRAÇÃO ULTRA PROFUNDA DE ÁUDIO DO SUNO
 * Estratégia: Scraping avançado + JSON parsing + múltiplos padrões
 */

import https from 'https';
import zlib from 'zlib';

const TRACKS = [
  'xJqFtvSGsgcaNczS',
  'J9z2aqpTWcknLPil',
  'EzOHEKgUHyGshDNR',
  'Lq50KP37gz9hwLv0',
  'xmQohTCXLLxIjOc4',
  'zKgQ4mbyGiLCkqqo'
];

async function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
      }
    }, (res) => {
      let data = '';
      
      if (res.headers['content-encoding'] === 'gzip') {
        const gunzip = zlib.createGunzip();
        res.pipe(gunzip);
        gunzip.on('data', chunk => data += chunk);
        gunzip.on('end', () => resolve(data));
      } else {
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      }
    }).on('error', reject);
  });
}

async function extractDeepAudio(trackId) {
  console.log(`\n🔍 EXTRAÇÃO PROFUNDA: ${trackId}`);
  
  try {
    const url = `https://suno.com/song/${trackId}`;
    const html = await fetchHTML(url);
    
    // ESTRATÉGIA 1: Buscar JSON embutido no __NEXT_DATA__
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);
    if (nextDataMatch) {
      try {
        const jsonData = JSON.parse(nextDataMatch[1]);
        console.log('✓ JSON encontrado em __NEXT_DATA__');
        
        // Navega pelo JSON procurando audio_url
        const findAudioUrl = (obj) => {
          if (typeof obj !== 'object' || obj === null) return null;
          
          if (obj.audio_url) return obj.audio_url;
          if (obj.mp3_url) return obj.mp3_url;
          
          for (const key in obj) {
            const result = findAudioUrl(obj[key]);
            if (result) return result;
          }
          return null;
        };
        
        const audioUrl = findAudioUrl(jsonData);
        if (audioUrl) {
          console.log(`✅ ÁUDIO ENCONTRADO: ${audioUrl}`);
          return audioUrl;
        }
      } catch (e) {
        console.log('⚠️ Erro ao parsear JSON:', e.message);
      }
    }
    
    // ESTRATÉGIA 2: Regex patterns avançados
    const patterns = [
      /"audio_url"\s*:\s*"([^"]+)"/,
      /"mp3_url"\s*:\s*"([^"]+)"/,
      /"video_url"\s*:\s*"([^"]+\.mp3[^"]*)"/,
      /https:\/\/cdn[12]\.suno\.ai\/[a-zA-Z0-9-]+\.mp3/g,
      /"url"\s*:\s*"(https:\/\/[^"]*\.mp3)"/,
      /audio.*?src.*?["'](https:\/\/[^"']*\.mp3)["']/i,
    ];
    
    for (const pattern of patterns) {
      const matches = html.match(pattern);
      if (matches) {
        const url = matches[1] || matches[0];
        if (url && url.includes('.mp3')) {
          console.log(`✅ REGEX MATCH: ${url}`);
          return url;
        }
      }
    }
    
    // ESTRATÉGIA 3: Buscar em window.__INITIAL_STATE__
    const initialStateMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*({.*?});/s);
    if (initialStateMatch) {
      try {
        const state = JSON.parse(initialStateMatch[1]);
        const findAudio = (obj) => {
          if (typeof obj !== 'object') return null;
          if (obj?.audio_url) return obj.audio_url;
          for (const key in obj) {
            const result = findAudio(obj[key]);
            if (result) return result;
          }
          return null;
        };
        const audioUrl = findAudio(state);
        if (audioUrl) {
          console.log(`✅ STATE MATCH: ${audioUrl}`);
          return audioUrl;
        }
      } catch (e) {}
    }
    
    // ESTRATÉGIA 4: Construir URL baseado em padrões conhecidos
    const possibleUrls = [
      `https://cdn1.suno.ai/${trackId}.mp3`,
      `https://cdn2.suno.ai/${trackId}.mp3`,
      `https://audiopipe.suno.ai/?item_id=${trackId}`,
    ];
    
    console.log(`⚠️ Usando URLs construídas`);
    return possibleUrls[0];
    
  } catch (error) {
    console.error(`❌ Erro: ${error.message}`);
    return `https://cdn1.suno.ai/${trackId}.mp3`;
  }
}

async function processAllTracks() {
  console.log('🎵 EXTRAÇÃO ULTRA PROFUNDA DE ÁUDIO\n');
  
  const results = [];
  
  for (const trackId of TRACKS) {
    const audioUrl = await extractDeepAudio(trackId);
    results.push({
      id: trackId,
      audioUrl: audioUrl
    });
    
    // Delay para não sobrecarregar
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n\n📊 RESULTADOS FINAIS:\n');
  console.log(JSON.stringify(results, null, 2));
  
  console.log('\n\n✅ Extração completa!');
  return results;
}

processAllTracks().catch(console.error);

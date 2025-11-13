#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🎬 EXEMPLO PRÁTICO - RUNWAY ML VIDEO TO VIDEO (Gen4 Aleph)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Este script demonstra como usar o endpoint /api/videostudio/video-to-video
 * para transformar vídeos existentes com Gen4 Aleph (modelo premium).
 * 
 * CASOS DE USO:
 * 1. Transformação básica (HTTPS URL)
 * 2. Com referência de estilo
 * 3. Portrait para Reels (9:16)
 * 4. Ultra Wide cinematic (21:9)
 * 5. Vintage 1920s style
 * 6. Cyberpunk aesthetic
 * 
 * REQUISITOS:
 * - Servidor rodando em localhost:3000
 * - User com créditos suficientes (60 por vídeo)
 * - RUNWAY_API_KEY configurada
 * 
 * USO:
 * node exemplo-video-to-video.mjs
 */

const BASE_URL = 'http://localhost:3000';
const USER_ID = 'user_test_12345';

// ═══════════════════════════════════════════════════════════════════════════
// 🎨 EXEMPLO 1: Transformação Básica (Beach → Sunset)
// ═══════════════════════════════════════════════════════════════════════════

async function exemplo1_transformacao_basica() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎬 EXEMPLO 1: Transformação Básica (Beach → Sunset)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const request = {
    model: 'gen4_aleph',
    user_id: USER_ID,
    videoUri: 'https://storage.example.com/videos/beach.mp4',
    promptText: 'Transform this beach scene into a dramatic sunset with golden hour lighting and warm colors',
    ratio: '1280:720' // 16:9 Landscape
  };

  console.log('📤 Request:', JSON.stringify(request, null, 2));

  try {
    const response = await fetch(`${BASE_URL}/api/videostudio/video-to-video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    const data = await response.json();

    if (response.ok) {
      console.log('\n✅ SUCCESS:', JSON.stringify(data, null, 2));
      console.log(`\n🎬 Task ID: ${data.taskId}`);
      console.log(`💰 Créditos usados: ${data.creditsUsed}`);
      console.log(`💳 Novo saldo: ${data.newBalance}`);
    } else {
      console.error('\n❌ ERROR:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('\n❌ FETCH ERROR:', error.message);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 🖼️ EXEMPLO 2: Com Referência de Estilo (Cyberpunk)
// ═══════════════════════════════════════════════════════════════════════════

async function exemplo2_com_referencia() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🖼️ EXEMPLO 2: Com Referência de Estilo (Cyberpunk)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const request = {
    model: 'gen4_aleph',
    user_id: USER_ID,
    videoUri: 'https://storage.example.com/videos/city-night.mp4',
    promptText: 'Apply cyberpunk aesthetic with neon lights, rain effects, and futuristic atmosphere',
    ratio: '1280:720',
    references: [
      {
        type: 'image',
        uri: 'https://storage.example.com/styles/cyberpunk-blade-runner.jpg'
      }
    ],
    seed: 42 // Resultado reproduzível
  };

  console.log('📤 Request:', JSON.stringify(request, null, 2));

  try {
    const response = await fetch(`${BASE_URL}/api/videostudio/video-to-video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    const data = await response.json();

    if (response.ok) {
      console.log('\n✅ SUCCESS:', JSON.stringify(data, null, 2));
      console.log(`\n🎬 Task ID: ${data.taskId}`);
      console.log(`🖼️ Tem referência: ${data.hasReferences}`);
      console.log(`🔢 Seed: ${request.seed}`);
    } else {
      console.error('\n❌ ERROR:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('\n❌ FETCH ERROR:', error.message);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 📱 EXEMPLO 3: Portrait para Reels (9:16)
// ═══════════════════════════════════════════════════════════════════════════

async function exemplo3_portrait_reels() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📱 EXEMPLO 3: Portrait para Reels (9:16)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const request = {
    model: 'gen4_aleph',
    user_id: USER_ID,
    videoUri: 'https://storage.example.com/videos/dance-performance.mp4',
    promptText: 'Transform into 80s retro style with VHS effects, scan lines, vintage color grading, and analog artifacts',
    ratio: '720:1280', // 9:16 Portrait
    contentModeration: {
      publicFigureThreshold: 'low'
    }
  };

  console.log('📤 Request:', JSON.stringify(request, null, 2));

  try {
    const response = await fetch(`${BASE_URL}/api/videostudio/video-to-video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    const data = await response.json();

    if (response.ok) {
      console.log('\n✅ SUCCESS:', JSON.stringify(data, null, 2));
      console.log(`\n📱 Formato: Portrait 9:16 (Reels)`);
      console.log(`🎨 Estilo: 80s Retro VHS`);
    } else {
      console.error('\n❌ ERROR:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('\n❌ FETCH ERROR:', error.message);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 🎞️ EXEMPLO 4: Ultra Wide Cinematic (21:9)
// ═══════════════════════════════════════════════════════════════════════════

async function exemplo4_ultra_wide() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎞️ EXEMPLO 4: Ultra Wide Cinematic (21:9)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const request = {
    model: 'gen4_aleph',
    user_id: USER_ID,
    videoUri: 'https://storage.example.com/videos/landscape-mountain.mp4',
    promptText: 'Transform into epic cinematic blockbuster style with dramatic color grading, lens flares, and Hollywood atmosphere',
    ratio: '1584:672', // 21:9 Ultra Wide
    references: [
      {
        type: 'image',
        uri: 'https://storage.example.com/styles/interstellar-still.jpg'
      }
    ]
  };

  console.log('📤 Request:', JSON.stringify(request, null, 2));

  try {
    const response = await fetch(`${BASE_URL}/api/videostudio/video-to-video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    const data = await response.json();

    if (response.ok) {
      console.log('\n✅ SUCCESS:', JSON.stringify(data, null, 2));
      console.log(`\n🎞️ Formato: Ultra Wide 21:9 (Cinematic)`);
      console.log(`🎬 Estilo: Hollywood Blockbuster`);
    } else {
      console.error('\n❌ ERROR:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('\n❌ FETCH ERROR:', error.message);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 🎭 EXEMPLO 5: Vintage 1920s Silent Film
// ═══════════════════════════════════════════════════════════════════════════

async function exemplo5_vintage_1920s() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎭 EXEMPLO 5: Vintage 1920s Silent Film');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const request = {
    model: 'gen4_aleph',
    user_id: USER_ID,
    videoUri: 'https://storage.example.com/videos/street-scene.mp4',
    promptText: 'Convert to 1920s silent film style with black and white, heavy film grain, scratches, vintage artifacts, and vignette effect',
    ratio: '640:480', // 4:3 Clássico
    seed: 1920
  };

  console.log('📤 Request:', JSON.stringify(request, null, 2));

  try {
    const response = await fetch(`${BASE_URL}/api/videostudio/video-to-video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    const data = await response.json();

    if (response.ok) {
      console.log('\n✅ SUCCESS:', JSON.stringify(data, null, 2));
      console.log(`\n🎭 Formato: 4:3 Clássico`);
      console.log(`📼 Estilo: 1920s Silent Film`);
    } else {
      console.error('\n❌ ERROR:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('\n❌ FETCH ERROR:', error.message);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 🌈 EXEMPLO 6: Artístico Impressionista (Monet Style)
// ═══════════════════════════════════════════════════════════════════════════

async function exemplo6_impressionista() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🌈 EXEMPLO 6: Artístico Impressionista (Monet Style)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const request = {
    model: 'gen4_aleph',
    user_id: USER_ID,
    videoUri: 'https://storage.example.com/videos/garden.mp4',
    promptText: 'Apply impressionist painting style like Claude Monet with soft brush strokes, pastel colors, and dreamy atmosphere',
    ratio: '960:960', // 1:1 Square
    references: [
      {
        type: 'image',
        uri: 'https://storage.example.com/styles/monet-water-lilies.jpg'
      }
    ]
  };

  console.log('📤 Request:', JSON.stringify(request, null, 2));

  try {
    const response = await fetch(`${BASE_URL}/api/videostudio/video-to-video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    const data = await response.json();

    if (response.ok) {
      console.log('\n✅ SUCCESS:', JSON.stringify(data, null, 2));
      console.log(`\n🌈 Formato: 1:1 Square`);
      console.log(`🎨 Estilo: Impressionista (Monet)`);
    } else {
      console.error('\n❌ ERROR:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('\n❌ FETCH ERROR:', error.message);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ⚠️ EXEMPLO 7: Erro - Créditos Insuficientes
// ═══════════════════════════════════════════════════════════════════════════

async function exemplo7_creditos_insuficientes() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⚠️ EXEMPLO 7: Erro - Créditos Insuficientes');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const request = {
    model: 'gen4_aleph',
    user_id: 'user_sem_creditos',
    videoUri: 'https://storage.example.com/videos/test.mp4',
    promptText: 'Transform into any style',
    ratio: '1280:720'
  };

  console.log('📤 Request:', JSON.stringify(request, null, 2));
  console.log('⚠️ Nota: Este user não tem créditos suficientes (60 requeridos)');

  try {
    const response = await fetch(`${BASE_URL}/api/videostudio/video-to-video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    const data = await response.json();

    if (response.status === 402) {
      console.log('\n⚠️ EXPECTED ERROR (402 Payment Required):');
      console.log(JSON.stringify(data, null, 2));
      console.log(`\n💰 Créditos requeridos: ${data.required}`);
      console.log(`💳 Saldo atual: ${data.current}`);
      console.log(`⛔ Déficit: ${data.deficit}`);
    } else {
      console.log('\n❓ Resposta inesperada:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('\n❌ FETCH ERROR:', error.message);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ❌ EXEMPLO 8: Erro - Validação (Ratio Inválido)
// ═══════════════════════════════════════════════════════════════════════════

async function exemplo8_validacao_erro() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('❌ EXEMPLO 8: Erro - Validação (Ratio Inválido)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const request = {
    model: 'gen4_aleph',
    user_id: USER_ID,
    videoUri: 'https://storage.example.com/videos/test.mp4',
    promptText: 'Test',
    ratio: '1920:1080' // ❌ INVÁLIDO - não está na lista de ratios
  };

  console.log('📤 Request:', JSON.stringify(request, null, 2));
  console.log('⚠️ Nota: ratio "1920:1080" não é válido (deve ser um dos 8 ratios suportados)');

  try {
    const response = await fetch(`${BASE_URL}/api/videostudio/video-to-video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    const data = await response.json();

    if (response.status === 400) {
      console.log('\n❌ EXPECTED ERROR (400 Bad Request):');
      console.log(JSON.stringify(data, null, 2));
      console.log(`\n📋 Erros de validação: ${data.validationErrors.length}`);
    } else {
      console.log('\n❓ Resposta inesperada:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('\n❌ FETCH ERROR:', error.message);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 🚀 EXECUTAR TODOS OS EXEMPLOS
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                       ║');
  console.log('║       🎬 RUNWAY ML - VIDEO TO VIDEO API (Gen4 Aleph)                ║');
  console.log('║       Exemplos Práticos e Casos de Uso                               ║');
  console.log('║                                                                       ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════╝');

  console.log('\n📋 Este script demonstra 8 cenários de uso:');
  console.log('   1. Transformação básica (Beach → Sunset)');
  console.log('   2. Com referência de estilo (Cyberpunk)');
  console.log('   3. Portrait para Reels (9:16)');
  console.log('   4. Ultra Wide Cinematic (21:9)');
  console.log('   5. Vintage 1920s Silent Film');
  console.log('   6. Artístico Impressionista (Monet)');
  console.log('   7. Erro - Créditos Insuficientes');
  console.log('   8. Erro - Validação (Ratio Inválido)');

  console.log(`\n🌐 Servidor: ${BASE_URL}`);
  console.log(`👤 User ID: ${USER_ID}`);
  console.log(`💰 Custo por vídeo: 60 créditos (Gen4 Aleph PREMIUM)`);

  // Executar exemplos com delay
  await exemplo1_transformacao_basica();
  await sleep(2000);

  await exemplo2_com_referencia();
  await sleep(2000);

  await exemplo3_portrait_reels();
  await sleep(2000);

  await exemplo4_ultra_wide();
  await sleep(2000);

  await exemplo5_vintage_1920s();
  await sleep(2000);

  await exemplo6_impressionista();
  await sleep(2000);

  await exemplo7_creditos_insuficientes();
  await sleep(2000);

  await exemplo8_validacao_erro();

  console.log('\n╔═══════════════════════════════════════════════════════════════════════╗');
  console.log('║                   ✅ TODOS OS EXEMPLOS EXECUTADOS                     ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════╝\n');
}

// Utility: Sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Executar
main().catch(console.error);

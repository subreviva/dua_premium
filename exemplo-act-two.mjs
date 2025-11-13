#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🎭 EXEMPLOS ACT-TWO - Character Performance
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Demonstra uso do endpoint /api/videostudio/act-two
 * Character Performance: Animar personagens com vídeo de referência
 */

const BASE_URL = 'http://localhost:3000';
const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';

const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
};

// ═══════════════════════════════════════════════════════════════════════════
// EXEMPLO 1: Character Image (Avatar Estático)
// ═══════════════════════════════════════════════════════════════════════════

async function exemplo1_CharacterImage() {
  console.log(`\n${colors.cyan}🎭 EXEMPLO 1: Character Image (Avatar Estático)${colors.reset}\n`);
  
  const response = await fetch(`${BASE_URL}/api/videostudio/act-two`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'act_two',
      user_id: TEST_USER_ID,
      character: {
        type: 'image',
        uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d'
      },
      reference: {
        type: 'video',
        uri: 'https://example.com/actor-talking.mp4'
      },
      ratio: '1280:720',
      expressionIntensity: 3
    }),
  });

  const data = await response.json();
  console.log('Resposta:', JSON.stringify(data, null, 2));
  
  if (data.success) {
    console.log(`\n${colors.green}✅ Task criada!${colors.reset}`);
    console.log(`💳 Créditos usados: ${data.creditsUsed}`);
    console.log(`📋 Task ID: ${data.taskId}`);
    console.log(`🎨 Character: Imagem estática`);
    console.log(`😊 Expression Intensity: ${data.expressionIntensity}/5`);
    return data.taskId;
  } else {
    console.log(`\n${colors.yellow}⚠️ Erro: ${data.error}${colors.reset}`);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXEMPLO 2: Character Video (3D Animado)
// ═══════════════════════════════════════════════════════════════════════════

async function exemplo2_CharacterVideo() {
  console.log(`\n${colors.cyan}🎭 EXEMPLO 2: Character Video (3D Animado)${colors.reset}\n`);
  
  const response = await fetch(`${BASE_URL}/api/videostudio/act-two`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'act_two',
      user_id: TEST_USER_ID,
      character: {
        type: 'video',
        uri: 'https://example.com/3d-character.mp4'
      },
      reference: {
        type: 'video',
        uri: 'https://example.com/actor-performance.mp4'
      },
      ratio: '1280:720',
      bodyControl: false, // Apenas expressões faciais
      expressionIntensity: 4
    }),
  });

  const data = await response.json();
  console.log('Resposta:', JSON.stringify(data, null, 2));
  
  if (data.success) {
    console.log(`\n${colors.green}✅ Task criada!${colors.reset}`);
    console.log(`🎥 Character: Vídeo animado`);
    console.log(`🚶 Body Control: ${data.bodyControl ? 'Ativo' : 'Desativado'}`);
    console.log(`😄 Expression Intensity: ${data.expressionIntensity}/5`);
    return data.taskId;
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXEMPLO 3: Body Control Ativado (Movimentos Corporais)
// ═══════════════════════════════════════════════════════════════════════════

async function exemplo3_BodyControl() {
  console.log(`\n${colors.cyan}🎭 EXEMPLO 3: Body Control (Movimentos + Expressões)${colors.reset}\n`);
  
  const response = await fetch(`${BASE_URL}/api/videostudio/act-two`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'act_two',
      user_id: TEST_USER_ID,
      character: {
        type: 'video',
        uri: 'https://example.com/character-idle.mp4'
      },
      reference: {
        type: 'video',
        uri: 'https://example.com/actor-dancing.mp4'
      },
      ratio: '720:1280', // Portrait
      bodyControl: true, // ✅ ATIVADO - Movimentos corporais
      expressionIntensity: 5, // Máxima intensidade
      seed: 42
    }),
  });

  const data = await response.json();
  console.log('Resposta:', JSON.stringify(data, null, 2));
  
  if (data.success) {
    console.log(`\n${colors.green}✅ Task criada!${colors.reset}`);
    console.log(`🚶 Body Control: ${data.bodyControl ? '✅ ATIVADO' : 'Desativado'}`);
    console.log(`💃 Movimentos corporais serão aplicados`);
    console.log(`😆 Expression Intensity: MÁXIMO (${data.expressionIntensity}/5)`);
    console.log(`📱 Formato: Portrait 9:16`);
    return data.taskId;
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXEMPLO 4: Expression Intensity Comparação
// ═══════════════════════════════════════════════════════════════════════════

async function exemplo4_ExpressionIntensity() {
  console.log(`\n${colors.cyan}🎭 EXEMPLO 4: Expression Intensity Comparação${colors.reset}\n`);
  
  const intensities = [
    { level: 1, desc: 'Muito Sutil' },
    { level: 3, desc: 'Normal (Default)' },
    { level: 5, desc: 'Muito Intenso' }
  ];

  for (const { level, desc } of intensities) {
    console.log(`\n--- Testando Intensity: ${level} (${desc}) ---`);
    
    const response = await fetch(`${BASE_URL}/api/videostudio/act-two`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'act_two',
        user_id: TEST_USER_ID,
        character: {
          type: 'image',
          uri: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80'
        },
        reference: {
          type: 'video',
          uri: 'https://example.com/actor-expression.mp4'
        },
        ratio: '960:960',
        expressionIntensity: level
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      console.log(`${colors.green}✅ Task criada - Intensity: ${level}${colors.reset}`);
      console.log(`📋 Task ID: ${data.taskId}`);
    } else {
      console.log(`${colors.yellow}⚠️ Erro: ${data.error}${colors.reset}`);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXEMPLO 5: Cinematic Mode (21:9)
// ═══════════════════════════════════════════════════════════════════════════

async function exemplo5_Cinematic() {
  console.log(`\n${colors.cyan}🎭 EXEMPLO 5: Cinematic Mode (21:9 Ultra Wide)${colors.reset}\n`);
  
  const response = await fetch(`${BASE_URL}/api/videostudio/act-two`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'act_two',
      user_id: TEST_USER_ID,
      character: {
        type: 'image',
        uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e'
      },
      reference: {
        type: 'video',
        uri: 'https://example.com/epic-speech.mp4'
      },
      ratio: '1584:672', // Cinematic 21:9
      expressionIntensity: 4,
      contentModeration: {
        publicFigureThreshold: 'auto'
      }
    }),
  });

  const data = await response.json();
  console.log('Resposta:', JSON.stringify(data, null, 2));
  
  if (data.success) {
    console.log(`\n${colors.green}✅ Task criada!${colors.reset}`);
    console.log(`🎥 Formato: Cinematic 21:9 (Ultra Widescreen)`);
    console.log(`🎬 Ideal para cinema e produções premium`);
    return data.taskId;
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXEMPLO 6: Mascote Animado (Marketing)
// ═══════════════════════════════════════════════════════════════════════════

async function exemplo6_Mascote() {
  console.log(`\n${colors.cyan}🎭 EXEMPLO 6: Mascote Animado (Marketing)${colors.reset}\n`);
  
  const response = await fetch(`${BASE_URL}/api/videostudio/act-two`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'act_two',
      user_id: TEST_USER_ID,
      character: {
        type: 'image',
        uri: 'https://example.com/mascot-character.png'
      },
      reference: {
        type: 'video',
        uri: 'https://example.com/salesperson-pitch.mp4'
      },
      ratio: '1280:720',
      bodyControl: true, // Gestos de vendedor
      expressionIntensity: 5, // Muito expressivo
      seed: 12345
    }),
  });

  const data = await response.json();
  console.log('Resposta:', JSON.stringify(data, null, 2));
  
  if (data.success) {
    console.log(`\n${colors.green}✅ Task criada!${colors.reset}`);
    console.log(`🎯 Uso: Marketing / Propaganda`);
    console.log(`🤝 Gestos de vendedor aplicados`);
    console.log(`😃 Expressões muito expressivas`);
    return data.taskId;
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXEMPLO 7: Verificar Status
// ═══════════════════════════════════════════════════════════════════════════

async function verificarStatus(taskId) {
  if (!taskId) {
    console.log(`\n${colors.yellow}⚠️ Nenhum taskId fornecido${colors.reset}`);
    return;
  }

  console.log(`\n${colors.cyan}🔍 Verificando status da task: ${taskId}${colors.reset}\n`);
  
  const response = await fetch(`${BASE_URL}/api/runway/task-status?taskId=${taskId}`);
  const data = await response.json();
  
  console.log('Status:', JSON.stringify(data, null, 2));
  
  if (data.status === 'SUCCEEDED') {
    console.log(`\n${colors.green}✅ Vídeo pronto!${colors.reset}`);
    console.log(`📥 Download: ${data.output}`);
  } else if (data.status === 'PENDING' || data.status === 'RUNNING') {
    console.log(`\n${colors.yellow}⏳ Processando... Status: ${data.status}${colors.reset}`);
  } else if (data.status === 'FAILED') {
    console.log(`\n${colors.yellow}❌ Falha no processamento${colors.reset}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXEMPLO 8: Tratamento de Erros
// ═══════════════════════════════════════════════════════════════════════════

async function exemplo8_Erros() {
  console.log(`\n${colors.cyan}🎭 EXEMPLO 8: Tratamento de Erros${colors.reset}\n`);
  
  // Erro 1: Character ausente
  console.log('--- Teste 1: Character ausente ---');
  let response = await fetch(`${BASE_URL}/api/videostudio/act-two`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'act_two',
      user_id: TEST_USER_ID,
      // character: AUSENTE
      reference: {
        type: 'video',
        uri: 'https://example.com/actor.mp4'
      }
    }),
  });
  let data = await response.json();
  console.log('Status:', response.status);
  console.log('Erro:', data.error);
  console.log('Detalhes:', data.validationErrors);

  // Erro 2: Reference ausente
  console.log('\n--- Teste 2: Reference ausente ---');
  response = await fetch(`${BASE_URL}/api/videostudio/act-two`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'act_two',
      user_id: TEST_USER_ID,
      character: {
        type: 'image',
        uri: 'https://example.com/character.jpg'
      }
      // reference: AUSENTE
    }),
  });
  data = await response.json();
  console.log('Status:', response.status);
  console.log('Erro:', data.error);

  // Erro 3: expressionIntensity inválido
  console.log('\n--- Teste 3: expressionIntensity fora do range ---');
  response = await fetch(`${BASE_URL}/api/videostudio/act-two`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'act_two',
      user_id: TEST_USER_ID,
      character: {
        type: 'image',
        uri: 'https://example.com/character.jpg'
      },
      reference: {
        type: 'video',
        uri: 'https://example.com/actor.mp4'
      },
      expressionIntensity: 10 // Inválido (deve ser 1-5)
    }),
  });
  data = await response.json();
  console.log('Status:', response.status);
  console.log('Erro:', data.error);
  console.log('Detalhes:', data.validationErrors);

  // Erro 4: URI inválido (HTTP ao invés de HTTPS)
  console.log('\n--- Teste 4: URI inválido (HTTP) ---');
  response = await fetch(`${BASE_URL}/api/videostudio/act-two`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'act_two',
      user_id: TEST_USER_ID,
      character: {
        type: 'image',
        uri: 'http://example.com/character.jpg' // HTTP não é válido
      },
      reference: {
        type: 'video',
        uri: 'https://example.com/actor.mp4'
      }
    }),
  });
  data = await response.json();
  console.log('Status:', response.status);
  console.log('Erro:', data.error);
  console.log('Detalhes:', data.validationErrors);
}

// ═══════════════════════════════════════════════════════════════════════════
// MENU
// ═══════════════════════════════════════════════════════════════════════════

async function menu() {
  console.log('\n╔═══════════════════════════════════════════════════════════════════════╗');
  console.log('║  🎭 ACT-TWO CHARACTER PERFORMANCE - EXEMPLOS                          ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════╝');
  console.log('\nExemplos disponíveis:\n');
  console.log('1. Character Image (Avatar Estático)');
  console.log('2. Character Video (3D Animado)');
  console.log('3. Body Control (Movimentos + Expressões)');
  console.log('4. Expression Intensity Comparação');
  console.log('5. Cinematic Mode (21:9)');
  console.log('6. Mascote Animado (Marketing)');
  console.log('7. Tratamento de Erros');
  console.log('8. Executar TODOS os exemplos\n');

  // Executar exemplo 1 automaticamente
  console.log('Executando Exemplo 1 automaticamente...');
  await exemplo1_CharacterImage();
}

menu().catch(console.error);

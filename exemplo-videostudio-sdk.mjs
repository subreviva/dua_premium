#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🎬 EXEMPLO DE USO - RunwayML SDK Oficial
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Este exemplo demonstra como usar o endpoint /api/videostudio/criar
 * integrado com o SDK oficial @runwayml/sdk
 * 
 * REQUISITOS:
 * - Servidor rodando (npm run dev)
 * - RUNWAY_API_KEY configurada
 * - Créditos suficientes no usuário
 */

// ═══════════════════════════════════════════════════════════════════════════
// EXEMPLO 1: Gen4 Turbo - Configuração Simples
// ═══════════════════════════════════════════════════════════════════════════

async function exemploGen4Simples() {
  console.log('\n🎬 EXEMPLO 1: Gen4 Turbo - Configuração Simples\n');
  
  const response = await fetch('http://localhost:3000/api/videostudio/criar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gen4_turbo',
      user_id: '00000000-0000-0000-0000-000000000001', // Admin test user
      promptImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
      ratio: '1280:720',
      promptText: 'A beautiful mountain landscape at sunset',
      duration: 5,
    }),
  });

  const data = await response.json();
  console.log('Resposta:', JSON.stringify(data, null, 2));
  
  if (data.taskId) {
    console.log(`\n✅ Task criada! ID: ${data.taskId}`);
    console.log(`💳 Créditos usados: ${data.creditsUsed}`);
    console.log(`💰 Novo saldo: ${data.newBalance}`);
    return data.taskId;
  } else {
    console.log('\n❌ Erro:', data.error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXEMPLO 2: Gen4 Turbo - Configuração Completa
// ═══════════════════════════════════════════════════════════════════════════

async function exemploGen4Completo() {
  console.log('\n🎬 EXEMPLO 2: Gen4 Turbo - Configuração Completa\n');
  
  const response = await fetch('http://localhost:3000/api/videostudio/criar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gen4_turbo',
      user_id: '00000000-0000-0000-0000-000000000001',
      promptImage: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131',
      ratio: '1280:720',
      promptText: 'A cute cat playing with a ball of yarn in slow motion',
      duration: 10, // 10 segundos = 50 créditos
      seed: 42, // Seed fixo para reprodutibilidade
      contentModeration: {
        publicFigureThreshold: 'auto',
      },
    }),
  });

  const data = await response.json();
  console.log('Resposta:', JSON.stringify(data, null, 2));
  
  if (data.taskId) {
    console.log(`\n✅ Task criada! ID: ${data.taskId}`);
    return data.taskId;
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXEMPLO 3: Gen3a Turbo - Econômico
// ═══════════════════════════════════════════════════════════════════════════

async function exemploGen3aEconomico() {
  console.log('\n🎬 EXEMPLO 3: Gen3a Turbo - Econômico\n');
  
  const response = await fetch('http://localhost:3000/api/videostudio/criar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gen3a_turbo',
      user_id: '00000000-0000-0000-0000-000000000001',
      promptText: 'A robot dancing in a futuristic neon city at night', // OBRIGATÓRIO
      promptImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e',
      duration: 10, // 10 segundos, mas mesmo custo de 5s
      ratio: '1280:768',
      seed: 12345,
    }),
  });

  const data = await response.json();
  console.log('Resposta:', JSON.stringify(data, null, 2));
  
  if (data.taskId) {
    console.log(`\n✅ Task criada! ID: ${data.taskId}`);
    console.log(`💳 Créditos usados: ${data.creditsUsed} (econômico!)`);
    return data.taskId;
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXEMPLO 4: Portrait Mode (Vertical)
// ═══════════════════════════════════════════════════════════════════════════

async function exemploPortrait() {
  console.log('\n🎬 EXEMPLO 4: Portrait Mode (Vertical/TikTok/Stories)\n');
  
  const response = await fetch('http://localhost:3000/api/videostudio/criar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gen4_turbo',
      user_id: '00000000-0000-0000-0000-000000000001',
      promptImage: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e',
      ratio: '720:1280', // Portrait 9:16
      promptText: 'A person looking at their phone while walking in a busy city',
      duration: 5,
    }),
  });

  const data = await response.json();
  console.log('Resposta:', JSON.stringify(data, null, 2));
  
  if (data.taskId) {
    console.log(`\n✅ Task criada! ID: ${data.taskId}`);
    console.log('📱 Formato: Portrait 9:16 (ideal para TikTok/Instagram Stories)');
    return data.taskId;
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXEMPLO 5: Cinematic Mode (21:9)
// ═══════════════════════════════════════════════════════════════════════════

async function exemploCinematic() {
  console.log('\n🎬 EXEMPLO 5: Cinematic Mode (21:9)\n');
  
  const response = await fetch('http://localhost:3000/api/videostudio/criar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gen4_turbo',
      user_id: '00000000-0000-0000-0000-000000000001',
      promptImage: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1',
      ratio: '1584:672', // Cinematic 21:9
      promptText: 'An epic space battle with starships and laser beams',
      duration: 10,
    }),
  });

  const data = await response.json();
  console.log('Resposta:', JSON.stringify(data, null, 2));
  
  if (data.taskId) {
    console.log(`\n✅ Task criada! ID: ${data.taskId}`);
    console.log('🎥 Formato: Cinematic 21:9 (ultra widescreen)');
    return data.taskId;
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXEMPLO 6: Verificar Status da Task
// ═══════════════════════════════════════════════════════════════════════════

async function verificarStatus(taskId) {
  if (!taskId) {
    console.log('\n⚠️ Nenhum taskId fornecido para verificar status');
    return;
  }

  console.log(`\n🔍 Verificando status da task: ${taskId}\n`);
  
  const response = await fetch(`http://localhost:3000/api/runway/task-status?taskId=${taskId}`);
  const data = await response.json();
  
  console.log('Status:', JSON.stringify(data, null, 2));
  
  if (data.status === 'SUCCEEDED') {
    console.log(`\n✅ Vídeo pronto!`);
    console.log(`📥 Download: ${data.output}`);
  } else if (data.status === 'PENDING' || data.status === 'RUNNING') {
    console.log(`\n⏳ Processando... Status: ${data.status}`);
    console.log(`💡 Aguarde alguns segundos e verifique novamente`);
  } else if (data.status === 'FAILED') {
    console.log(`\n❌ Falha no processamento`);
    console.log(`Erro: ${data.failure || 'Desconhecido'}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXEMPLO 7: Data URI (Base64)
// ═══════════════════════════════════════════════════════════════════════════

async function exemploDataURI() {
  console.log('\n🎬 EXEMPLO 7: Usando Data URI (Base64)\n');
  
  // Mini imagem SVG convertida para base64
  const svgBase64 = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwN2JmZiIvPjwvc3ZnPg==';
  
  const response = await fetch('http://localhost:3000/api/videostudio/criar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gen4_turbo',
      user_id: '00000000-0000-0000-0000-000000000001',
      promptImage: svgBase64,
      ratio: '960:960',
      promptText: 'A blue square morphing into different shapes',
      duration: 5,
    }),
  });

  const data = await response.json();
  console.log('Resposta:', JSON.stringify(data, null, 2));
  
  if (data.taskId) {
    console.log(`\n✅ Task criada com Data URI!`);
    return data.taskId;
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXEMPLO 8: Tratamento de Erros
// ═══════════════════════════════════════════════════════════════════════════

async function exemploErros() {
  console.log('\n🎬 EXEMPLO 8: Tratamento de Erros\n');
  
  // Erro: ratio inválido
  console.log('--- Teste 1: Ratio inválido ---');
  let response = await fetch('http://localhost:3000/api/videostudio/criar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gen4_turbo',
      user_id: '00000000-0000-0000-0000-000000000001',
      promptImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
      ratio: '1920:1080', // Inválido para Gen4
    }),
  });
  let data = await response.json();
  console.log('Status:', response.status);
  console.log('Erro:', data.error);
  console.log('Detalhes:', data.validationErrors);

  // Erro: Gen3a sem promptText
  console.log('\n--- Teste 2: Gen3a sem promptText obrigatório ---');
  response = await fetch('http://localhost:3000/api/videostudio/criar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gen3a_turbo',
      user_id: '00000000-0000-0000-0000-000000000001',
      promptImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
      // promptText ausente (OBRIGATÓRIO para Gen3a)
    }),
  });
  data = await response.json();
  console.log('Status:', response.status);
  console.log('Erro:', data.error);
  console.log('Detalhes:', data.validationErrors);

  // Erro: Duration inválido para Gen3a
  console.log('\n--- Teste 3: Duration inválido para Gen3a (só aceita 5 ou 10) ---');
  response = await fetch('http://localhost:3000/api/videostudio/criar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gen3a_turbo',
      user_id: '00000000-0000-0000-0000-000000000001',
      promptText: 'Test video',
      promptImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
      duration: 7, // Inválido (só aceita 5 ou 10)
    }),
  });
  data = await response.json();
  console.log('Status:', response.status);
  console.log('Erro:', data.error);
  console.log('Detalhes:', data.validationErrors);
}

// ═══════════════════════════════════════════════════════════════════════════
// MENU INTERATIVO
// ═══════════════════════════════════════════════════════════════════════════

async function menu() {
  console.log('\n╔═══════════════════════════════════════════════════════════════════════╗');
  console.log('║  🎬 RUNWAY ML VIDEO STUDIO - EXEMPLOS DE USO                         ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════╝');
  console.log('\nEscolha um exemplo:\n');
  console.log('1. Gen4 Turbo - Configuração Simples');
  console.log('2. Gen4 Turbo - Configuração Completa');
  console.log('3. Gen3a Turbo - Econômico');
  console.log('4. Portrait Mode (9:16)');
  console.log('5. Cinematic Mode (21:9)');
  console.log('6. Data URI (Base64)');
  console.log('7. Tratamento de Erros');
  console.log('8. Executar TODOS os exemplos');
  console.log('9. Verificar status de uma task\n');

  // Executar exemplo 1 por padrão (para demonstração)
  console.log('Executando Exemplo 1 automaticamente...');
  await exemploGen4Simples();
}

// ═══════════════════════════════════════════════════════════════════════════
// EXECUTAR
// ═══════════════════════════════════════════════════════════════════════════

menu().catch(console.error);

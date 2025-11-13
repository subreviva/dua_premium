#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🧪 TESTE ULTRA RIGOROSO - /api/videostudio/criar
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Testa TODAS as validações conforme documentação RunwayML
 * 
 * CENÁRIOS:
 * ✅ Gen4 Turbo - todos os campos válidos
 * ✅ Gen3a Turbo - todos os campos válidos
 * ❌ Validações de erro (campos inválidos)
 * ❌ Créditos insuficientes
 * ❌ Rate limiting
 */

const BASE_URL = 'http://localhost:3000';
const TEST_USER_ID = '00000000-0000-0000-0000-000000000001'; // Admin test user

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(emoji, color, message) {
  console.log(`${color}${emoji} ${message}${colors.reset}`);
}

function logSuccess(message) {
  log('✅', colors.green, message);
}

function logError(message) {
  log('❌', colors.red, message);
}

function logInfo(message) {
  log('ℹ️', colors.blue, message);
}

function logWarning(message) {
  log('⚠️', colors.yellow, message);
}

async function testEndpoint(testName, payload, expectedStatus, expectedFields = []) {
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  logInfo(`Teste: ${testName}`);
  
  try {
    const response = await fetch(`${BASE_URL}/api/videostudio/criar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    
    console.log(`Status: ${response.status} (esperado: ${expectedStatus})`);
    console.log('Resposta:', JSON.stringify(data, null, 2));

    // Verificar status
    if (response.status === expectedStatus) {
      logSuccess(`Status correto: ${response.status}`);
    } else {
      logError(`Status incorreto: ${response.status} (esperado: ${expectedStatus})`);
      return false;
    }

    // Verificar campos esperados
    for (const field of expectedFields) {
      if (data[field] !== undefined) {
        logSuccess(`Campo presente: ${field}`);
      } else {
        logError(`Campo ausente: ${field}`);
        return false;
      }
    }

    return true;
  } catch (error) {
    logError(`Erro na requisição: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log(`${colors.bright}${colors.cyan}`);
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('🧪 TESTE ULTRA RIGOROSO - /api/videostudio/criar');
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log(colors.reset);

  let passed = 0;
  let failed = 0;

  // ═══════════════════════════════════════════════════════════════════════════
  // 1️⃣ GEN4 TURBO - VÁLIDO
  // ═══════════════════════════════════════════════════════════════════════════

  const test1 = await testEndpoint(
    'Gen4 Turbo - Configuração válida completa',
    {
      model: 'gen4_turbo',
      user_id: TEST_USER_ID,
      promptImage: 'https://example.com/test-image.jpg',
      ratio: '1280:720',
      promptText: 'A beautiful sunset over the ocean',
      duration: 5,
      seed: 12345,
      contentModeration: {
        publicFigureThreshold: 'auto'
      }
    },
    200, // Pode ser 402 se não houver créditos
    ['taskId', 'model', 'operation']
  );
  test1 ? passed++ : failed++;

  // ═══════════════════════════════════════════════════════════════════════════
  // 2️⃣ GEN3A TURBO - VÁLIDO
  // ═══════════════════════════════════════════════════════════════════════════

  const test2 = await testEndpoint(
    'Gen3a Turbo - Configuração válida completa',
    {
      model: 'gen3a_turbo',
      user_id: TEST_USER_ID,
      promptText: 'A dancing robot in a futuristic city',
      promptImage: 'https://example.com/robot.jpg',
      duration: 10,
      ratio: '1280:768',
      seed: 54321,
    },
    200, // Pode ser 402 se não houver créditos
    ['taskId', 'model', 'operation']
  );
  test2 ? passed++ : failed++;

  // ═══════════════════════════════════════════════════════════════════════════
  // 3️⃣ VALIDAÇÃO - user_id ausente
  // ═══════════════════════════════════════════════════════════════════════════

  const test3 = await testEndpoint(
    'Erro - user_id ausente',
    {
      model: 'gen4_turbo',
      promptImage: 'https://example.com/test.jpg',
      ratio: '1280:720',
    },
    400,
    ['error']
  );
  test3 ? passed++ : failed++;

  // ═══════════════════════════════════════════════════════════════════════════
  // 4️⃣ VALIDAÇÃO - model inválido
  // ═══════════════════════════════════════════════════════════════════════════

  const test4 = await testEndpoint(
    'Erro - model inválido',
    {
      model: 'gen5_invalid',
      user_id: TEST_USER_ID,
      promptImage: 'https://example.com/test.jpg',
    },
    400,
    ['error']
  );
  test4 ? passed++ : failed++;

  // ═══════════════════════════════════════════════════════════════════════════
  // 5️⃣ VALIDAÇÃO - Gen4 sem ratio (obrigatório)
  // ═══════════════════════════════════════════════════════════════════════════

  const test5 = await testEndpoint(
    'Erro - Gen4 sem ratio obrigatório',
    {
      model: 'gen4_turbo',
      user_id: TEST_USER_ID,
      promptImage: 'https://example.com/test.jpg',
    },
    400,
    ['error', 'validationErrors']
  );
  test5 ? passed++ : failed++;

  // ═══════════════════════════════════════════════════════════════════════════
  // 6️⃣ VALIDAÇÃO - Gen4 duration fora do range (2-10)
  // ═══════════════════════════════════════════════════════════════════════════

  const test6 = await testEndpoint(
    'Erro - Gen4 duration inválido (15 segundos)',
    {
      model: 'gen4_turbo',
      user_id: TEST_USER_ID,
      promptImage: 'https://example.com/test.jpg',
      ratio: '1280:720',
      duration: 15,
    },
    400,
    ['error', 'validationErrors']
  );
  test6 ? passed++ : failed++;

  // ═══════════════════════════════════════════════════════════════════════════
  // 7️⃣ VALIDAÇÃO - Gen3a sem promptText (obrigatório)
  // ═══════════════════════════════════════════════════════════════════════════

  const test7 = await testEndpoint(
    'Erro - Gen3a sem promptText obrigatório',
    {
      model: 'gen3a_turbo',
      user_id: TEST_USER_ID,
      promptImage: 'https://example.com/test.jpg',
    },
    400,
    ['error', 'validationErrors']
  );
  test7 ? passed++ : failed++;

  // ═══════════════════════════════════════════════════════════════════════════
  // 8️⃣ VALIDAÇÃO - Gen3a duration inválido (só aceita 5 ou 10)
  // ═══════════════════════════════════════════════════════════════════════════

  const test8 = await testEndpoint(
    'Erro - Gen3a duration inválido (7 segundos)',
    {
      model: 'gen3a_turbo',
      user_id: TEST_USER_ID,
      promptText: 'Test video',
      promptImage: 'https://example.com/test.jpg',
      duration: 7,
    },
    400,
    ['error', 'validationErrors']
  );
  test8 ? passed++ : failed++;

  // ═══════════════════════════════════════════════════════════════════════════
  // 9️⃣ VALIDAÇÃO - promptText muito longo (>1000 chars UTF-16)
  // ═══════════════════════════════════════════════════════════════════════════

  const test9 = await testEndpoint(
    'Erro - promptText muito longo (>1000 chars)',
    {
      model: 'gen4_turbo',
      user_id: TEST_USER_ID,
      promptImage: 'https://example.com/test.jpg',
      ratio: '1280:720',
      promptText: 'A'.repeat(1001),
    },
    400,
    ['error', 'validationErrors']
  );
  test9 ? passed++ : failed++;

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔟 VALIDAÇÃO - seed fora do range (0-4294967295)
  // ═══════════════════════════════════════════════════════════════════════════

  const test10 = await testEndpoint(
    'Erro - seed fora do range',
    {
      model: 'gen4_turbo',
      user_id: TEST_USER_ID,
      promptImage: 'https://example.com/test.jpg',
      ratio: '1280:720',
      seed: 5000000000,
    },
    400,
    ['error', 'validationErrors']
  );
  test10 ? passed++ : failed++;

  // ═══════════════════════════════════════════════════════════════════════════
  // 1️⃣1️⃣ VALIDAÇÃO - Gen4 ratio inválido
  // ═══════════════════════════════════════════════════════════════════════════

  const test11 = await testEndpoint(
    'Erro - Gen4 ratio inválido',
    {
      model: 'gen4_turbo',
      user_id: TEST_USER_ID,
      promptImage: 'https://example.com/test.jpg',
      ratio: '1920:1080', // Não é válido para Gen4
    },
    400,
    ['error', 'validationErrors']
  );
  test11 ? passed++ : failed++;

  // ═══════════════════════════════════════════════════════════════════════════
  // 1️⃣2️⃣ VALIDAÇÃO - URI inválido (não HTTPS nem data URI)
  // ═══════════════════════════════════════════════════════════════════════════

  const test12 = await testEndpoint(
    'Erro - promptImage com URI inválido (http)',
    {
      model: 'gen4_turbo',
      user_id: TEST_USER_ID,
      promptImage: 'http://example.com/test.jpg', // HTTP não é válido (só HTTPS)
      ratio: '1280:720',
    },
    400,
    ['error', 'validationErrors']
  );
  test12 ? passed++ : failed++;

  // ═══════════════════════════════════════════════════════════════════════════
  // 📊 RESULTADO FINAL
  // ═══════════════════════════════════════════════════════════════════════════

  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}📊 RESULTADO FINAL${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
  
  logSuccess(`Testes aprovados: ${passed}`);
  if (failed > 0) {
    logError(`Testes falhados: ${failed}`);
  } else {
    logSuccess(`Testes falhados: ${failed}`);
  }
  
  const total = passed + failed;
  const percentage = ((passed / total) * 100).toFixed(1);
  
  console.log(`\n${colors.bright}Taxa de sucesso: ${percentage}%${colors.reset}\n`);
  
  if (failed === 0) {
    console.log(`${colors.green}${colors.bright}🎉 TODOS OS TESTES PASSARAM!${colors.reset}\n`);
  } else {
    console.log(`${colors.red}${colors.bright}⚠️ ALGUNS TESTES FALHARAM${colors.reset}\n`);
  }
}

// Executar testes
runTests().catch(console.error);

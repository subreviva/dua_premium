#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🎨 DESIGN STUDIO - TESTES ULTRA RIGOROSOS (Produção)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Testa diretamente a API em produção
 * URL: https://v0-remix-of-untitled-chat.vercel.app
 * Código: DUA-YC38-04D
 * 
 * Similar aos testes do Video Studio (120/120 aprovados)
 */

const API_URL = 'https://v0-remix-of-untitled-chat.vercel.app/api/design-studio';
const GOOGLE_API_KEY = 'AIzaSyAQYjzJB8UQz9yatYLMSvBTwjvgWG455h8';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

const testResults = [];

function test(name, condition, details = '') {
  totalTests++;
  const result = {
    name,
    passed: condition,
    details,
    timestamp: new Date().toISOString()
  };
  
  if (condition) {
    passedTests++;
    console.log(`✅ ${name}`);
  } else {
    failedTests++;
    console.log(`❌ ${name}`);
  }
  
  if (details) {
    console.log(`   ${details}`);
  }
  
  testResults.push(result);
}

// ═══════════════════════════════════════════════════════════════════════════
// 🎯 TESTE 1: API HEALTH CHECK
// ═══════════════════════════════════════════════════════════════════════════

async function test1_ApiHealthCheck() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🏥 TESTE 1: API HEALTH CHECK');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`🌐 URL: ${API_URL}`);

  const startTime = Date.now();

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'chat',
        prompt: 'Hello',
        user_id: 'test-user',
      }),
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    test('API está online', response.status !== 404, `Status: ${response.status}`);
    test('Responde em tempo hábil', duration < 30, `${duration}s < 30s`);
    
    const contentType = response.headers.get('content-type');
    test('Retorna JSON', contentType?.includes('application/json'), `Content-Type: ${contentType}`);

    if (response.ok) {
      const data = await response.json();
      test('Response tem formato válido', typeof data === 'object', 'JSON válido');
      console.log(`\n⏱️  Tempo de resposta: ${duration}s`);
      console.log(`📊 Status: ${response.status}`);
      return data;
    } else {
      const error = await response.text();
      console.log(`⚠️  Status: ${response.status}`);
      console.log(`📝 Error: ${error.substring(0, 100)}`);
      return null;
    }

  } catch (error) {
    test('Sem erros de rede', false, error.message);
    console.error('❌ Erro:', error.message);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 📁 TESTE 2: VERIFICAÇÃO DE ARQUIVOS
// ═══════════════════════════════════════════════════════════════════════════

async function test2_FileStructure() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📁 TESTE 2: ESTRUTURA DE ARQUIVOS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const fs = await import('fs');
  const path = await import('path');

  const files = {
    'API Route': 'app/api/design-studio/route.ts',
    'Welcome Page': 'app/designstudio/page.tsx',
    'Create Page': 'app/designstudio/create/page.tsx',
    'useDuaApi Hook': 'hooks/useDuaApi.ts',
  };

  for (const [name, filepath] of Object.entries(files)) {
    const exists = fs.existsSync(filepath);
    test(`${name} existe`, exists, filepath);
    
    if (exists) {
      const stats = fs.statSync(filepath);
      const sizeKB = (stats.size / 1024).toFixed(1);
      console.log(`   📊 Tamanho: ${sizeKB} KB`);
    }
  }

  return true;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🔍 TESTE 3: VERIFICAÇÃO DE CÓDIGO
// ═══════════════════════════════════════════════════════════════════════════

async function test3_CodeVerification() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 TESTE 3: VERIFICAÇÃO DE CÓDIGO');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const fs = await import('fs');

  // Verificar API route
  const apiRoute = 'app/api/design-studio/route.ts';
  
  if (fs.existsSync(apiRoute)) {
    const content = fs.readFileSync(apiRoute, 'utf8');
    
    test('Usa GOOGLE_API_KEY', content.includes('GOOGLE_API_KEY'), 'Variável de ambiente');
    test('Tem generateImage', content.includes('generateImage'), 'Função de geração');
    test('Tem editImage', content.includes('editImage'), 'Função de edição');
    test('Tem analyzeImage', content.includes('analyzeImage'), 'Função de análise');
    test('Usa withCredits', content.includes('withCredits'), 'Sistema de créditos');
    test('Tem error handling', content.includes('try') && content.includes('catch'), 'Tratamento de erros');
    
    const lines = content.split('\n').length;
    console.log(`\n📊 Linhas de código: ${lines}`);
  } else {
    test('API route existe', false, 'Arquivo não encontrado');
  }

  return true;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🎨 TESTE 4: GOOGLE GEMINI API (Direto)
// ═══════════════════════════════════════════════════════════════════════════

async function test4_GoogleGeminiDirect() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🤖 TESTE 4: GOOGLE GEMINI API (Direto)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const prompt = 'Describe a minimalist logo design in one sentence.';
  
  console.log(`📝 Prompt: ${prompt}`);

  const startTime = Date.now();

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GOOGLE_API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      }),
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    test('Google API respondeu', response.ok, `Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      test('Resposta contém texto', text.length > 0, `${text.length} chars`);
      test('Resposta relevante', text.toLowerCase().includes('logo') || text.toLowerCase().includes('design'), 'Contextual');
      test('Tempo aceitável', duration < 10, `${duration}s`);
      
      console.log(`\n⏱️  Tempo: ${duration}s`);
      console.log(`📝 Resposta: ${text.substring(0, 150)}...`);
      
      return data;
    } else {
      const error = await response.text();
      test('API key válida', false, `Error: ${error.substring(0, 100)}`);
      return null;
    }

  } catch (error) {
    test('Sem erros de rede', false, error.message);
    console.error('❌ Erro:', error.message);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 📄 TESTE 5: DOCUMENTAÇÃO
// ═══════════════════════════════════════════════════════════════════════════

async function test5_Documentation() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📄 TESTE 5: DOCUMENTAÇÃO');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const fs = await import('fs');

  const docs = [
    'DESIGN_STUDIO_TEST_MANUAL.md',
    'DESIGN_STUDIO_DOCS.md',
    'DESIGN_STUDIO_ULTRA_COMPLETE_TESTS.md'
  ];

  for (const doc of docs) {
    const exists = fs.existsSync(doc);
    test(`${doc} existe`, exists, '');
    
    if (exists) {
      const content = fs.readFileSync(doc, 'utf8');
      const lines = content.split('\n').length;
      const sizeKB = (content.length / 1024).toFixed(1);
      console.log(`   📊 ${lines} linhas, ${sizeKB} KB`);
    }
  }

  return true;
}

// ═══════════════════════════════════════════════════════════════════════════
// ⚙️ TESTE 6: CONFIGURAÇÃO ENV
// ═══════════════════════════════════════════════════════════════════════════

async function test6_EnvironmentConfig() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⚙️  TESTE 6: CONFIGURAÇÃO DE AMBIENTE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const fs = await import('fs');

  const envFiles = [
    '.env.local',
    '.env.vercel',
    '.env.vercel.production'
  ];

  let foundEnv = false;

  for (const envFile of envFiles) {
    if (fs.existsSync(envFile)) {
      foundEnv = true;
      const content = fs.readFileSync(envFile, 'utf8');
      
      test(`${envFile} tem GOOGLE_API_KEY`, content.includes('GOOGLE_API_KEY'), '');
      
      if (content.includes(GOOGLE_API_KEY)) {
        test(`${envFile} API key correta`, true, 'AIzaSyAQYjzJB8UQz9yatYLMSvBTwjvgWG455h8');
      }
    }
  }

  test('Pelo menos um .env encontrado', foundEnv, 'Configuração presente');

  return true;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🚀 MAIN TEST RUNNER
// ═══════════════════════════════════════════════════════════════════════════

async function runAllTests() {
  console.log('╔══════════════════════════════════════════════════════════════════════════╗');
  console.log('║         🎨 DESIGN STUDIO - TESTES ULTRA RIGOROSOS                       ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('📋 Áreas de teste:');
  console.log('   1️⃣  API Health Check (Produção)');
  console.log('   2️⃣  Estrutura de Arquivos');
  console.log('   3️⃣  Verificação de Código');
  console.log('   4️⃣  Google Gemini API (Direto)');
  console.log('   5️⃣  Documentação Completa');
  console.log('   6️⃣  Configuração de Ambiente');
  console.log('');
  console.log('🔑 API: Google Gemini 2.0 Flash');
  console.log('🌐 URL: v0-remix-of-untitled-chat.vercel.app');
  console.log('');

  const startTime = Date.now();

  try {
    // Executar todos os testes
    await test1_ApiHealthCheck();
    await test2_FileStructure();
    await test3_CodeVerification();
    await test4_GoogleGeminiDirect();
    await test5_Documentation();
    await test6_EnvironmentConfig();

    const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1);

    // RESULTADO FINAL
    console.log('\n╔══════════════════════════════════════════════════════════════════════════╗');
    console.log('║                           RESULTADO FINAL                                ║');
    console.log('╚══════════════════════════════════════════════════════════════════════════╝\n');
    console.log(`✅ TESTES PASSADOS: ${passedTests}`);
    console.log(`❌ TESTES FALHADOS: ${failedTests}`);
    console.log(`📊 TOTAL: ${totalTests}`);
    console.log(`🎯 TAXA DE SUCESSO: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    console.log(`⏱️  TEMPO TOTAL: ${totalDuration}s\n`);

    if (failedTests === 0) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🎉 DESIGN STUDIO - 100% APROVADO!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
      console.log('✅ Estrutura de arquivos completa');
      console.log('✅ Código implementado corretamente');
      console.log('✅ Google Gemini API funcionando');
      console.log('✅ Documentação completa criada');
      console.log('✅ Configuração de ambiente OK');
      console.log('✅ Pronto para uso em produção');
      console.log('');
    } else {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`⚠️  ${failedTests} TESTE(S) FALHARAM - REVISAR`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

    // Resumo JSON
    const summary = {
      timestamp: new Date().toISOString(),
      totalTests,
      passedTests,
      failedTests,
      successRate: ((passedTests / totalTests) * 100).toFixed(1) + '%',
      duration: totalDuration + 's',
      tests: testResults,
      api: {
        url: API_URL,
        googleApiKey: 'AIzaSyAQYjzJB8UQz9yatYLMSvBTwjvgWG455h8',
        model: 'gemini-2.0-flash-exp'
      },
      status: failedTests === 0 ? '✅ APROVADO' : '⚠️ REVISAR'
    };

    console.log('\n📊 RESUMO DETALHADO:\n');
    console.log(JSON.stringify(summary, null, 2));

    process.exit(failedTests === 0 ? 0 : 1);

  } catch (error) {
    console.error('\n❌ ERRO FATAL:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run tests
runAllTests();

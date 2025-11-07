#!/usr/bin/env node
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '.env.local') });

const SUNO_API_KEY = process.env.SUNO_API_KEY;

console.log('🔍 Diagnóstico da API Key Suno\n');
console.log('═══════════════════════════════════════════════════════\n');

// Informações sobre a chave
console.log('📋 Informações da Chave:');
console.log('  - Chave completa:', SUNO_API_KEY);
console.log('  - Comprimento:', SUNO_API_KEY?.length || 0, 'caracteres');
console.log('  - Formato:', SUNO_API_KEY?.includes('-') ? 'Com hífens' : 'Hexadecimal');
console.log('  - Primeiros 8 chars:', SUNO_API_KEY?.substring(0, 8));
console.log('  - Últimos 8 chars:', SUNO_API_KEY?.substring(SUNO_API_KEY.length - 8));
console.log('');

// Testar diferentes endpoints e formatos
const endpoints = [
  {
    name: 'API kie.ai (padrão)',
    baseUrl: 'https://api.kie.ai/api/v1',
    authFormat: 'Bearer'
  },
  {
    name: 'API aimusicapi.ai (alternativa)',
    baseUrl: 'https://api.aimusicapi.ai/api/v1',
    authFormat: 'Bearer'
  },
  {
    name: 'API suno.ai (direto)',
    baseUrl: 'https://api.suno.ai/v1',
    authFormat: 'Bearer'
  }
];

async function testEndpoint(endpoint) {
  console.log(`\n🧪 Testando: ${endpoint.name}`);
  console.log(`   URL: ${endpoint.baseUrl}`);
  
  try {
    // Teste 1: Endpoint de geração
    const generateUrl = `${endpoint.baseUrl}/generate`;
    console.log(`   Testando: ${generateUrl}`);
    
    const response = await fetch(generateUrl, {
      method: 'POST',
      headers: {
        'Authorization': `${endpoint.authFormat} ${SUNO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: "test",
        customMode: false,
        instrumental: true,
        model: "V3_5",
        callBackUrl: "https://example.com/callback"
      })
    });

    const data = await response.json();
    
    console.log(`   Status HTTP: ${response.status}`);
    console.log(`   Código resposta: ${data.code || 'N/A'}`);
    console.log(`   Mensagem: ${data.msg || data.message || 'N/A'}`);
    
    if (response.ok || (data.code && data.code === 200)) {
      console.log('   ✅ SUCESSO! Este endpoint funciona!');
      return true;
    } else if (response.status === 401 || data.code === 401) {
      console.log('   ❌ Erro de autenticação - chave inválida ou sem permissões');
    } else if (response.status === 404) {
      console.log('   ⚠️  Endpoint não encontrado');
    } else {
      console.log('   ⚠️  Erro desconhecido');
    }
    
    return false;
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
    return false;
  }
}

async function runDiagnostics() {
  console.log('🚀 Iniciando diagnósticos...\n');
  
  let successCount = 0;
  
  for (const endpoint of endpoints) {
    const success = await testEndpoint(endpoint);
    if (success) successCount++;
  }
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`\n📊 Resumo: ${successCount}/${endpoints.length} endpoints funcionaram\n`);
  
  if (successCount === 0) {
    console.log('❌ PROBLEMA IDENTIFICADO:');
    console.log('   A chave API fornecida não tem permissões válidas.');
    console.log('\n💡 Possíveis soluções:');
    console.log('   1. Verifique se a chave está correta');
    console.log('   2. Confirme se a chave tem permissões ativas');
    console.log('   3. Verifique se há créditos disponíveis na conta');
    console.log('   4. Tente gerar uma nova chave no painel da API');
    console.log('   5. Verifique se precisa de um plano pago\n');
  }
}

runDiagnostics().catch(console.error);

#!/usr/bin/env node
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '.env.local') });

const SUNO_API_KEY = process.env.SUNO_API_KEY;
const BASE_URL = "https://api.kie.ai/api/v1";

console.log('🎵 Testando Suno API...\n');
console.log('API Key:', SUNO_API_KEY ? `${SUNO_API_KEY.substring(0, 8)}...` : 'NÃO ENCONTRADA');
console.log('Base URL:', BASE_URL);
console.log('═══════════════════════════════════════════════════════\n');

if (!SUNO_API_KEY) {
  console.error('❌ ERRO: SUNO_API_KEY não encontrada no .env.local');
  process.exit(1);
}

// Teste 1: Verificar autenticação
async function testAuthentication() {
  console.log('📡 Teste 1: Verificando autenticação...');
  
  try {
    const response = await fetch(`${BASE_URL}/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUNO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: "Uma música de teste breve",
        customMode: false,
        instrumental: true,
        model: "V3_5",
        callBackUrl: "https://example.com/callback"
      })
    });

    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Resposta:', JSON.stringify(data, null, 2));
    
    if (response.ok && data.code === 200) {
      console.log('✅ Autenticação SUCESSO!');
      console.log('Task ID:', data.data?.taskId);
      return data.data?.taskId;
    } else {
      console.log('❌ Autenticação FALHOU!');
      console.log('Código de erro:', data.code);
      console.log('Mensagem:', data.msg);
      return null;
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
    return null;
  }
}

// Teste 2: Verificar status de uma tarefa (se tivermos um taskId)
async function testTaskStatus(taskId) {
  if (!taskId) {
    console.log('\n⏭️  Pulando teste de status (sem taskId)');
    return;
  }

  console.log('\n📊 Teste 2: Verificando status da tarefa...');
  console.log('Task ID:', taskId);
  
  try {
    const response = await fetch(`${BASE_URL}/generate/record-info?taskId=${taskId}`, {
      headers: {
        'Authorization': `Bearer ${SUNO_API_KEY}`,
      }
    });

    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Resposta:', JSON.stringify(data, null, 2));
    
    if (response.ok && data.code === 200) {
      console.log('✅ Status verificado com SUCESSO!');
      console.log('Estado da tarefa:', data.data?.status);
      return true;
    } else {
      console.log('❌ Verificação de status FALHOU!');
      return false;
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
    return false;
  }
}

// Teste 3: Teste simples de conectividade
async function testConnectivity() {
  console.log('\n🌐 Teste 3: Verificando conectividade com a API...');
  
  try {
    const response = await fetch(BASE_URL, {
      method: 'HEAD',
      headers: {
        'Authorization': `Bearer ${SUNO_API_KEY}`,
      }
    });
    
    console.log('Status:', response.status);
    console.log('✅ Conectividade OK!');
    return true;
  } catch (error) {
    console.error('❌ Erro de conectividade:', error.message);
    return false;
  }
}

// Executar todos os testes
async function runAllTests() {
  console.log('🚀 Iniciando testes...\n');
  
  // Teste de conectividade
  await testConnectivity();
  
  // Teste de autenticação
  const taskId = await testAuthentication();
  
  // Teste de status (se tivermos um taskId)
  await testTaskStatus(taskId);
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('✨ Testes concluídos!\n');
  
  if (taskId) {
    console.log('💡 Dica: Você pode verificar o status desta tarefa mais tarde usando:');
    console.log(`   curl -H "Authorization: Bearer ${SUNO_API_KEY}" "${BASE_URL}/generate/record-info?taskId=${taskId}"`);
  }
}

// Executar
runAllTests().catch(console.error);

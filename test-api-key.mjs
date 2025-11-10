#!/usr/bin/env node

/**
 * TESTE DIAGNÓSTICO - Google API Key
 * Testa se a API key está funcionando corretamente
 */

import { readFileSync } from 'fs';

// Carregar .env.local
const envContent = readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      envVars[key] = valueParts.join('=').trim();
    }
  }
});

const API_KEY = envVars.GOOGLE_API_KEY;

console.log('🔍 TESTE DIAGNÓSTICO - GOOGLE API KEY');
console.log('=====================================\n');

console.log('1️⃣  API Key Configurada:');
console.log(`   ✅ ${API_KEY.substring(0, 25)}...${API_KEY.substring(API_KEY.length - 10)}`);
console.log(`   📏 Tamanho: ${API_KEY.length} caracteres\n`);

console.log('2️⃣  Testando endpoint de modelos...');

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

try {
  const response = await fetch(url);
  const status = response.status;
  
  console.log(`   📊 Status HTTP: ${status}`);
  
  if (status === 200) {
    const data = await response.json();
    const imageModels = data.models.filter(m => 
      m.name.includes('image') || m.name.includes('imagen')
    );
    
    console.log(`   ✅ API funcionando!`);
    console.log(`   📸 Modelos de imagem encontrados: ${imageModels.length}\n`);
    
    console.log('3️⃣  Modelos de Imagem Disponíveis:');
    imageModels.forEach(m => {
      console.log(`   - ${m.name}`);
      console.log(`     ${m.description || 'Sem descrição'}`);
    });
    
  } else {
    const error = await response.text();
    console.log(`   ❌ Erro ${status}:`);
    console.log(`   ${error}\n`);
    
    if (status === 403) {
      console.log('⚠️  ERRO 403 - Possíveis causas:');
      console.log('   1. API key tem restrições de domínio configuradas');
      console.log('   2. API "Generative Language API" não está habilitada');
      console.log('   3. API key foi bloqueada/revogada');
      console.log('   4. Cota excedida\n');
      console.log('🔧 SOLUÇÃO:');
      console.log('   → https://console.cloud.google.com/apis/credentials');
      console.log('   → Edite a API key');
      console.log('   → Remova todas as restrições temporariamente');
      console.log('   → Habilite "Generative Language API"\n');
    }
  }
  
} catch (error) {
  console.log(`   ❌ Erro de conexão: ${error.message}\n`);
}

console.log('=====================================');
console.log('Teste concluído!\n');

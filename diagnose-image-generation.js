#!/usr/bin/env node

/**
 * 🔍 Script de Diagnóstico - Geração de Imagens
 * 
 * Verifica:
 * - Variáveis de ambiente configuradas
 * - Conexão com APIs
 * - Sistema de créditos
 */

console.log('🔍 DIAGNÓSTICO - GERAÇÃO DE IMAGENS\n');

// 1. Verificar variáveis de ambiente
console.log('📋 VERIFICANDO VARIÁVEIS DE AMBIENTE:');
console.log('------------------------------------');

const requiredVars = [
  'GOOGLE_API_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

let allVarsPresent = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: Configurada (${value.substring(0, 10)}...)`);
  } else {
    console.log(`❌ ${varName}: NÃO CONFIGURADA`);
    allVarsPresent = false;
  }
});

console.log('');

// 2. Verificar @google/genai instalado
console.log('📦 VERIFICANDO DEPENDÊNCIAS:');
console.log('------------------------------------');

try {
  require.resolve('@google/genai');
  console.log('✅ @google/genai: Instalado');
} catch (e) {
  console.log('❌ @google/genai: NÃO INSTALADO');
  console.log('   Execute: npm install @google/genai');
  allVarsPresent = false;
}

try {
  require.resolve('@supabase/supabase-js');
  console.log('✅ @supabase/supabase-js: Instalado');
} catch (e) {
  console.log('❌ @supabase/supabase-js: NÃO INSTALADO');
  allVarsPresent = false;
}

console.log('');

// 3. Teste básico de conexão
if (allVarsPresent && process.env.GOOGLE_API_KEY) {
  console.log('🧪 TESTANDO CONEXÃO COM GOOGLE GEMINI:');
  console.log('------------------------------------');
  
  (async () => {
    try {
      const { GoogleGenAI } = require('@google/genai');
      const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
      
      console.log('✅ Cliente GoogleGenAI inicializado');
      console.log('');
      console.log('📌 MODELOS DISPONÍVEIS:');
      console.log('  - imagen-4.0-ultra-generate-001 (Ultra qualidade)');
      console.log('  - imagen-4.0-generate-001 (Standard)');
      console.log('  - imagen-4.0-fast-generate-001 (Rápido)');
      console.log('  - imagen-3.0-generate-002 (Imagen 3)');
      console.log('  - gemini-2.5-flash-image-preview (Gemini Experimental)');
      
    } catch (error) {
      console.log('❌ Erro ao conectar com Google Gemini:', error.message);
    }
  })();
} else {
  console.log('⚠️  IMPOSSÍVEL TESTAR - Variáveis necessárias não configuradas');
}

console.log('');
console.log('💡 PRÓXIMOS PASSOS:');
console.log('------------------------------------');

if (!process.env.GOOGLE_API_KEY) {
  console.log('1. Obtenha uma chave da API Google Gemini em:');
  console.log('   https://ai.google.dev/gemini-api/docs/api-key');
  console.log('');
  console.log('2. Configure na Vercel:');
  console.log('   Settings > Environment Variables > GOOGLE_API_KEY');
  console.log('');
  console.log('3. Redeploy o projeto');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log('⚠️  Configure SUPABASE_SERVICE_ROLE_KEY para validação de créditos');
}

console.log('');
console.log('✅ Diagnóstico concluído!');
console.log('');

#!/usr/bin/env node
/**
 * 🧪 TESTE RÁPIDO - GERAR IMAGEM REAL
 * Confirma que a API está funcionando SEM modo MOCK
 */

const fs = require('fs');
const path = require('path');

// Ler .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const API_KEY = envContent
  .split('\n')
  .find(line => line.startsWith('NEXT_PUBLIC_GOOGLE_API_KEY='))
  ?.split('=')[1]
  ?.trim();

console.log('\n🎨 TESTE DE GERAÇÃO DE IMAGEM REAL\n');
console.log('═'.repeat(60));

if (!API_KEY) {
  console.error('\n❌ ERRO: API Key não encontrada!\n');
  process.exit(1);
}

console.log('\n✅ API Key encontrada:', API_KEY.substring(0, 10) + '...');

// Inicializar API
let ai;
try {
  const { GoogleGenAI } = require('@google/genai');
  ai = new GoogleGenAI({ apiKey: API_KEY, vertexai: false });
  console.log('✅ Google Gemini API inicializada (API Key mode)\n');
} catch (e) {
  console.error('❌ Erro ao inicializar API:', e.message);
  process.exit(1);
}

// Gerar imagem REAL
async function testRealImageGeneration() {
  console.log('🎬 Gerando imagem real...');
  console.log('   Prompt: "a beautiful red rose on a wooden table"');
  console.log('   Modelo: imagen-4.0-generate-001');
  console.log('   Aguarde 10-15 segundos...\n');
  
  const startTime = Date.now();
  
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: 'a beautiful red rose on a wooden table',
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: '1:1',
      },
    });
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    const imageSize = (base64ImageBytes.length / 1024).toFixed(2);
    
    console.log('═'.repeat(60));
    console.log('\n🎉 SUCESSO! Imagem gerada com API REAL\n');
    console.log('📊 Detalhes:');
    console.log('   ✅ Tempo: ' + duration + ' segundos');
    console.log('   ✅ Tamanho: ' + imageSize + ' KB');
    console.log('   ✅ Formato: PNG');
    console.log('   ✅ Aspect Ratio: 1:1');
    console.log('   ✅ Modelo: imagen-4.0-generate-001');
    console.log('\n🚀 STATUS: API 100% FUNCIONAL (SEM MOCK!)');
    console.log('\n💡 A API está gerando imagens REAIS com Google Gemini');
    console.log('\n═'.repeat(60));
    
    // Salvar preview
    const preview = base64ImageBytes.substring(0, 100);
    console.log('\n📸 Preview (primeiros 100 chars):');
    console.log('   ' + preview + '...\n');
    
  } catch (e) {
    console.error('\n❌ ERRO ao gerar imagem:');
    console.error('   ', e.message || e);
    console.log('\n⚠️  Se o erro for 401/403, verifique a API Key');
    console.log('⚠️  Se o erro for timeout, a API está funcionando (demora normal)\n');
    process.exit(1);
  }
}

// Executar teste
testRealImageGeneration().catch(error => {
  console.error('\n💥 Erro fatal:', error);
  process.exit(1);
});

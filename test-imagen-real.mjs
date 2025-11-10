#!/usr/bin/env node

/**
 * Script de Teste REAL da API Google Imagen
 * 
 * Este script testa diretamente a API do Google Imagen
 * para verificar se está funcionando corretamente.
 */

import { GoogleGenAI } from '@google/genai';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

// Carregar .env.local
dotenv.config({ path: '.env.local' });

const API_KEY = process.env.GOOGLE_API_KEY;

console.log('🎨 TESTE REAL - Google Imagen API\n');
console.log('=====================================\n');

// Verificar API Key
if (!API_KEY) {
  console.error('❌ ERRO: GOOGLE_API_KEY não encontrada em .env.local');
  process.exit(1);
}

console.log('✅ API Key encontrada:', API_KEY.substring(0, 20) + '...\n');

// Inicializar cliente
const ai = new GoogleGenAI({ apiKey: API_KEY });

// Configuração de teste
const testConfig = {
  prompt: 'A beautiful sunset over mountains',
  model: 'imagen-4.0-generate-001',
  config: {
    numberOfImages: 1,
    aspectRatio: '1:1',
    personGeneration: 'allow_adult',
    imageSize: '1K',
  }
};

console.log('📝 Teste de Geração:');
console.log('   Prompt:', testConfig.prompt);
console.log('   Modelo:', testConfig.model);
console.log('   Config:', JSON.stringify(testConfig.config, null, 2));
console.log('\n🚀 Chamando API...\n');

try {
  const startTime = Date.now();
  
  const response = await ai.models.generateImages({
    model: testConfig.model,
    prompt: testConfig.prompt,
    config: testConfig.config,
  });
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log(`✅ SUCESSO! Tempo: ${duration}s\n`);
  
  if (response.generatedImages && response.generatedImages.length > 0) {
    console.log(`🎉 ${response.generatedImages.length} imagem(ns) gerada(s)!\n`);
    
    response.generatedImages.forEach((img, index) => {
      const imageBytes = img.image.imageBytes;
      const base64Length = imageBytes.length;
      const sizeKB = (base64Length * 0.75 / 1024).toFixed(2); // Aproximado
      
      console.log(`Imagem ${index + 1}:`);
      console.log(`   Tamanho: ~${sizeKB} KB`);
      console.log(`   Base64 length: ${base64Length} caracteres`);
      console.log(`   Preview: data:image/png;base64,${imageBytes.substring(0, 50)}...`);
      console.log('');
    });
    
    console.log('✅ TESTE CONCLUÍDO COM SUCESSO!');
    console.log('   A API Google Imagen está funcionando corretamente.');
    console.log('   O problema deve estar no frontend ou no fluxo de autenticação.\n');
    
  } else {
    console.log('⚠️ Resposta vazia da API');
    console.log('Response:', JSON.stringify(response, null, 2));
  }
  
} catch (error) {
  console.error('\n❌ ERRO ao chamar API:\n');
  console.error('Mensagem:', error.message);
  console.error('Stack:', error.stack);
  
  if (error.message?.includes('API key')) {
    console.error('\n🔑 Problema com API Key:');
    console.error('   1. Verifique se a key está correta');
    console.error('   2. Verifique se tem permissões para Imagen API');
    console.error('   3. Ative Imagen no Google AI Studio: https://ai.google.dev/');
  }
  
  if (error.message?.includes('quota')) {
    console.error('\n📊 Problema de Quota:');
    console.error('   Quota da API excedida. Aguarde ou aumente o limite.');
  }
  
  process.exit(1);
}

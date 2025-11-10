#!/usr/bin/env node

/**
 * TESTE - Geração de Imagem com Gemini
 */

import { readFileSync } from 'fs';
import { GoogleGenAI } from '@google/genai';

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

console.log('🎨 TESTE - GERAÇÃO DE IMAGEM');
console.log('============================\n');

const ai = new GoogleGenAI({ apiKey: API_KEY });

const prompt = "a beautiful sunset over mountains";

console.log(`📝 Prompt: "${prompt}"`);
console.log(`🤖 Modelo: gemini-2.5-flash-image-preview\n`);

try {
  console.log('🚀 Gerando imagem...\n');
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image-preview',
    contents: [{
      parts: [{
        text: prompt
      }]
    }]
  });

  console.log('📦 Resposta recebida!');
  console.log('Estrutura:', JSON.stringify(response, null, 2).substring(0, 500));
  
  // Procurar a imagem na resposta
  const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  
  if (imagePart?.inlineData) {
    console.log('\n✅ IMAGEM GERADA COM SUCESSO!');
    console.log(`   Tipo: ${imagePart.inlineData.mimeType}`);
    console.log(`   Tamanho: ${imagePart.inlineData.data.length} caracteres (base64)`);
  } else {
    console.log('\n❌ Nenhuma imagem encontrada na resposta');
    console.log('Conteúdo completo:', JSON.stringify(response, null, 2));
  }
  
} catch (error) {
  console.log('\n❌ ERRO:', error.message);
  console.log('\nDetalhes:', error);
  
  if (error.message.includes('400')) {
    console.log('\n⚠️  ERRO 400 - Possíveis causas:');
    console.log('   1. Modelo não suporta geração de imagem desse jeito');
    console.log('   2. Formato da requisição incorreto');
    console.log('   3. Parâmetros inválidos');
  }
}

console.log('\n============================');

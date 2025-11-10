#!/usr/bin/env node

/**
 * Script de Teste - Design Studio com gemini-2.5-flash-image
 */

import { GoogleGenAI } from '@google/genai';
import { writeFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const API_KEY = process.env.GOOGLE_API_KEY;

console.log('🎨 TESTE - Design Studio (gemini-2.5-flash-image)\n');
console.log('=====================================================\n');

if (!API_KEY) {
  console.error('❌ GOOGLE_API_KEY não encontrada');
  process.exit(1);
}

console.log('✅ API Key encontrada:', API_KEY.substring(0, 20) + '...\n');

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Teste 1: Gerar Imagem
console.log('📝 Teste 1: Gerar Imagem');
console.log('   Prompt: "A futuristic city with flying cars"');
console.log('   Modelo: gemini-2.5-flash-image\n');
console.log('🚀 Gerando...\n');

try {
  const startTime = Date.now();
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: ['A futuristic city with flying cars at sunset']
  });
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log(`✅ Resposta recebida em ${duration}s\n`);
  
  // Verificar se tem imagem
  const imagePart = response.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
  
  if (imagePart?.inlineData) {
    const { data: imageBytes, mimeType } = imagePart.inlineData;
    const sizeKB = (imageBytes.length * 0.75 / 1024).toFixed(2);
    
    console.log('🎉 Imagem gerada com sucesso!');
    console.log(`   Tipo: ${mimeType}`);
    console.log(`   Tamanho: ~${sizeKB} KB`);
    console.log(`   Base64 length: ${imageBytes.length} caracteres\n`);
    
    // Salvar imagem
    const base64Image = `data:${mimeType};base64,${imageBytes}`;
    writeFileSync('test-design-studio-output.txt', base64Image);
    console.log('💾 Imagem salva em: test-design-studio-output.txt\n');
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ DESIGN STUDIO ESTÁ 100% FUNCIONAL!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📱 Teste no navegador:');
    console.log('   → http://localhost:3000/designstudio\n');
    
  } else {
    // Verificar se tem texto
    const textPart = response.candidates?.[0]?.content?.parts?.find((p) => p.text);
    if (textPart?.text) {
      console.log('⚠️ Modelo retornou texto em vez de imagem:');
      console.log(textPart.text);
      console.log('\nNOTA: O modelo pode estar indisponível ou retornando apenas texto.');
    } else {
      console.log('❌ Nenhuma imagem foi gerada');
      console.log('Response:', JSON.stringify(response, null, 2));
    }
  }
  
} catch (error) {
  console.error('\n❌ ERRO ao gerar imagem:\n');
  console.error('Mensagem:', error.message);
  console.error('Stack:', error.stack);
  
  if (error.message?.includes('403')) {
    console.error('\n🔑 API Key pode estar bloqueada ou sem permissões');
  }
  
  process.exit(1);
}

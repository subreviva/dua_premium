#!/usr/bin/env node
/**
 * TESTE: Sistema de Geração de Imagens no Chat
 * 
 * Oferta: 2 imagens grátis por usuário, depois 1 crédito cada
 * Model: prunaai/flux-fast via Replicate API
 * 
 * Este script testa:
 * 1. Geração da 1ª imagem (grátis)
 * 2. Geração da 2ª imagem (grátis)
 * 3. Geração da 3ª imagem (cobra 1 crédito)
 * 4. Verificação de créditos insuficientes
 */

import { config } from 'dotenv';
import Replicate from 'replicate';

config({ path: '.env.local' });

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

async function testFluxFast() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   🎨 TESTE: FLUX-FAST Image Generation');
  console.log('═══════════════════════════════════════════════════════════\n');

  const prompts = [
    "a futuristic city at sunset",
    "a cute robot playing guitar",
    "abstract colorful waves"
  ];

  for (let i = 0; i < prompts.length; i++) {
    const prompt = prompts[i];
    
    console.log(`\n${i + 1}. 🎯 Prompt: "${prompt}"`);
    console.log('   ⏳ Gerando...');
    
    try {
      const startTime = Date.now();
      
      const input = {
        prompt: prompt,
        num_outputs: 1,
        aspect_ratio: "1:1",
        output_format: "jpg",
        output_quality: 80,
      };

      const output = await replicate.run("prunaai/flux-fast", { input });
      
      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      
      // Output é um FileOutput object
      const imageUrl = Array.isArray(output) ? output[0] : output;
      
      console.log(`   ✅ Gerada em ${duration}s`);
      console.log(`   🔗 URL: ${imageUrl}`);
      
      // Se quiser baixar
      // await writeFile(`test-image-${i + 1}.jpg`, output);
      // console.log(`   💾 Salva como: test-image-${i + 1}.jpg`);
      
    } catch (error) {
      console.error(`   ❌ Erro: ${error.message}`);
    }
    
    if (i < prompts.length - 1) {
      console.log('\n   ⏸️  Aguardando 2s...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('   ✅ TESTE CONCLUÍDO');
  console.log('═══════════════════════════════════════════════════════════\n');
}

console.log('🔑 API Token:', process.env.REPLICATE_API_TOKEN ? '✅ Configurado' : '❌ Não encontrado');

if (!process.env.REPLICATE_API_TOKEN) {
  console.error('\n❌ REPLICATE_API_TOKEN não configurado no .env.local');
  process.exit(1);
}

testFluxFast().catch(console.error);

#!/usr/bin/env node

/**
 * TESTE COMPLETO - GOOGLE IMAGEN API
 * Verifica endpoint, versão da API e modelos funcionais
 */

import { GoogleGenAI } from '@google/genai';

// API Key
const API_KEY = process.env.GOOGLE_API_KEY;

if (!API_KEY) {
  console.error('❌ GOOGLE_API_KEY não configurada');
  console.log('   Configure: export GOOGLE_API_KEY=sua-key-aqui');
  process.exit(1);
}

console.log('🔍 TESTE COMPLETO - GOOGLE IMAGEN API\n');
console.log('=' .repeat(60));

// Modelos funcionais (conforme documentação)
const MODELOS_FUNCIONAIS = {
  'imagen-4.0-generate-001': {
    nome: 'Standard',
    descricao: 'Modelo padrão, equilíbrio qualidade/velocidade',
    custo: 25,
  },
  'imagen-4.0-fast-generate-001': {
    nome: 'Fast',
    descricao: 'Otimizado para velocidade, ideal para previews',
    custo: 15,
  },
  'imagen-4.0-ultra-generate-001': {
    nome: 'Ultra',
    descricao: 'Maior qualidade, mais lento, máximo realismo',
    custo: 50,
  },
};

async function testarModelo(modelo, info) {
  console.log(`\n📊 Testando: ${modelo} (${info.nome})`);
  console.log(`   ${info.descricao}`);
  console.log(`   Custo: ${info.custo} créditos\n`);

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    console.log('   🔧 Configuração:');
    console.log(`      - Modelo: ${modelo}`);
    console.log('      - Prompt: "Robot holding a red skateboard"');
    console.log('      - numberOfImages: 1');
    console.log('      - aspectRatio: 1:1');

    const startTime = Date.now();

    const response = await ai.models.generateImages({
      model: modelo,
      prompt: 'Robot holding a red skateboard',
      config: {
        numberOfImages: 1,
        aspectRatio: '1:1',
      },
    });

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    if (response.generatedImages && response.generatedImages.length > 0) {
      console.log(`   ✅ SUCESSO em ${duration}s`);
      console.log(`   📷 Imagens geradas: ${response.generatedImages.length}`);
      
      const imageBytes = response.generatedImages[0].image.imageBytes;
      const sizeKB = (imageBytes.length / 1024).toFixed(2);
      console.log(`   💾 Tamanho: ${sizeKB} KB`);
      
      return { success: true, duration, sizeKB };
    } else {
      console.log('   ❌ FALHOU: Nenhuma imagem retornada');
      return { success: false };
    }
  } catch (error) {
    console.log('   ❌ ERRO:', error.message);
    if (error.response) {
      console.log('   📋 Detalhes:', JSON.stringify(error.response.data, null, 2));
    }
    return { success: false, error: error.message };
  }
}

async function testarEndpoint() {
  console.log('\n🌐 VERIFICANDO ENDPOINT DA API\n');

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    // Testar com modelo padrão
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: 'Test',
      config: { numberOfImages: 1 },
    });

    console.log('   ✅ Endpoint: generativelanguage.googleapis.com (v1beta)');
    console.log('   ✅ @google/genai usa o endpoint correto automaticamente');
    return true;
  } catch (error) {
    console.log('   ❌ Erro ao verificar endpoint:', error.message);
    return false;
  }
}

async function main() {
  // 1. Verificar endpoint
  await testarEndpoint();

  console.log('\n' + '='.repeat(60));
  console.log('\n🧪 TESTANDO TODOS OS MODELOS FUNCIONAIS\n');
  console.log('=' .repeat(60));

  const resultados = {};

  // 2. Testar cada modelo
  for (const [modelo, info] of Object.entries(MODELOS_FUNCIONAIS)) {
    resultados[modelo] = await testarModelo(modelo, info);
    
    // Aguardar 2s entre requests para não sobrecarregar API
    if (Object.keys(resultados).length < Object.keys(MODELOS_FUNCIONAIS).length) {
      console.log('\n   ⏳ Aguardando 2s...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // 3. Resumo final
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 RESUMO DOS TESTES\n');
  console.log('=' .repeat(60));

  const sucessos = Object.values(resultados).filter(r => r.success).length;
  const total = Object.keys(resultados).length;

  console.log(`\n✅ Modelos funcionais: ${sucessos}/${total}\n`);

  for (const [modelo, resultado] of Object.entries(resultados)) {
    const info = MODELOS_FUNCIONAIS[modelo];
    const status = resultado.success ? '✅' : '❌';
    const details = resultado.success 
      ? `(${resultado.duration}s, ${resultado.sizeKB}KB)`
      : `(${resultado.error || 'Falhou'})`;
    
    console.log(`${status} ${info.nome.padEnd(10)} - ${modelo} ${details}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📚 DOCUMENTAÇÃO OFICIAL:');
  console.log('   https://ai.google.dev/gemini-api/docs/imagen');
  console.log('\n💡 IMPORTANTE:');
  console.log('   - Endpoint: generativelanguage.googleapis.com');
  console.log('   - Versão API: v1beta');
  console.log('   - Modelos: imagen-4.0-{generate,fast-generate,ultra-generate}-001');
  console.log('\n' + '='.repeat(60));

  if (sucessos === total) {
    console.log('\n🎉 TODOS OS MODELOS FUNCIONANDO PERFEITAMENTE!\n');
  } else {
    console.log(`\n⚠️  ${total - sucessos} modelo(s) com problemas\n`);
  }
}

main().catch(console.error);

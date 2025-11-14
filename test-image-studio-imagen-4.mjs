#!/usr/bin/env node

/**
 * TESTE RIGOROSO - IMAGE STUDIO COM IMAGEN 4.0
 * Valida os 3 modelos Imagen 4.0 integrados no Image Studio
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';

console.log('🎨 TESTE RIGOROSO - IMAGE STUDIO IMAGEN 4.0\n');
console.log('=' .repeat(70));
console.log(`API URL: ${API_URL}`);
console.log(`Timestamp: ${new Date().toISOString()}\n`);

// Modelos a testar
const MODELOS = [
  {
    id: 'imagen-4.0-fast-generate-001',
    name: 'Imagen 4 Fast',
    credits: 15,
    aspectRatio: '1:1',
    prompt: 'A serene mountain landscape at sunset, photorealistic style',
  },
  {
    id: 'imagen-4.0-generate-001',
    name: 'Imagen 4 Standard',
    credits: 25,
    aspectRatio: '16:9',
    prompt: 'Modern minimalist interior design, natural lighting, ultra HD',
  },
  {
    id: 'imagen-4.0-ultra-generate-001',
    name: 'Imagen 4 Ultra',
    credits: 35,
    aspectRatio: '9:16',
    prompt: 'Futuristic cityscape with neon lights at night, cinematic quality',
  },
];

async function testarModelo(modelo) {
  console.log('\n' + '='.repeat(70));
  console.log(`🎨 ${modelo.name}`);
  console.log('='.repeat(70));
  console.log(`\nℹ Modelo: ${modelo.id}`);
  console.log(`ℹ Créditos: ${modelo.credits}`);
  console.log(`ℹ Proporção: ${modelo.aspectRatio}`);
  console.log(`ℹ Prompt: "${modelo.prompt.substring(0, 60)}..."\n`);

  console.log('📤 Enviando request para API...');

  const startTime = Date.now();

  try {
    const response = await fetch(`${API_URL}/api/imagen/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: modelo.prompt,
        model: modelo.id,
        aspectRatio: modelo.aspectRatio,
      }),
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    if (!response.ok) {
      const errorData = await response.json();
      console.log(`✗ Request falhou com status ${response.status}`);
      console.log(`Erro: ${JSON.stringify(errorData).substring(0, 500)}\n`);
      return { success: false, status: response.status, error: errorData };
    }

    const data = await response.json();

    if (data.success && data.image?.url) {
      console.log(`✓ SUCESSO em ${duration}s`);
      console.log(`✓ Imagem gerada: ${data.image.url.substring(0, 80)}...`);
      console.log(`✓ Modelo usado: ${data.image.model}`);
      console.log(`✓ Proporção: ${data.image.aspectRatio}`);
      console.log(`✓ Créditos usados: ${data.image.creditsUsed || modelo.credits}`);
      
      // Validar se é base64 válido
      if (data.image.url.startsWith('data:image/')) {
        const base64Data = data.image.url.split(',')[1];
        const sizeKB = (base64Data.length * 0.75 / 1024).toFixed(2);
        console.log(`✓ Tamanho estimado: ${sizeKB} KB`);
      }

      return { success: true, duration, data };
    } else {
      console.log('✗ Resposta sem imagem válida');
      console.log(`Dados: ${JSON.stringify(data).substring(0, 200)}\n`);
      return { success: false, data };
    }
  } catch (error) {
    console.log(`✗ Erro na chamada: ${error.message}\n`);
    return { success: false, error: error.message };
  }
}

async function main() {
  // Verificar se servidor está rodando
  try {
    const response = await fetch(`${API_URL}/api/health`).catch(() => null);
    if (!response || !response.ok) {
      console.log('⚠ Servidor Next.js pode não estar rodando\n');
    } else {
      console.log('✓ Servidor Next.js acessível\n');
    }
  } catch {
    console.log('⚠ Não foi possível verificar servidor\n');
  }

  console.log('='.repeat(70));
  console.log('🎨 TESTANDO TODOS OS MODELOS IMAGEN 4.0');
  console.log('='.repeat(70));

  const resultados = [];

  for (const modelo of MODELOS) {
    const resultado = await testarModelo(modelo);
    resultados.push({ modelo, resultado });

    // Aguardar 3s entre testes
    if (MODELOS.indexOf(modelo) < MODELOS.length - 1) {
      console.log('\n⏳ Aguardando 3s antes do próximo teste...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  // Relatório final
  console.log('\n' + '='.repeat(70));
  console.log('📊 RELATÓRIO FINAL');
  console.log('='.repeat(70));

  const sucessos = resultados.filter(r => r.resultado.success).length;
  const total = resultados.length;

  console.log(`\nTotal de modelos testados: ${total}`);
  console.log(`✓ Gerações bem-sucedidas: ${sucessos}`);
  console.log(`✗ Gerações falhadas: ${total - sucessos}\n`);

  resultados.forEach(({ modelo, resultado }) => {
    const status = resultado.success ? '✓' : '✗';
    const details = resultado.success
      ? `(${resultado.duration}s)`
      : `(${resultado.error || `Status ${resultado.status}`})`;
    console.log(`${status} ${modelo.name.padEnd(20)} - ${details}`);
  });

  console.log('\n' + '='.repeat(70));

  if (sucessos === total) {
    console.log('\n🎉 TODOS OS MODELOS IMAGEN 4.0 FUNCIONANDO!\n');
    console.log('✅ Image Studio está 100% operacional com:');
    console.log('   - imagen-4.0-fast-generate-001 (15 créditos)');
    console.log('   - imagen-4.0-generate-001 (25 créditos, recomendado)');
    console.log('   - imagen-4.0-ultra-generate-001 (35 créditos)\n');
  } else {
    console.log(`\n⚠ ${total - sucessos} modelo(s) com problemas\n`);
    console.log('📋 Verifique:');
    console.log('   1. GOOGLE_IMAGEN_API_KEY ou GOOGLE_API_KEY configurada');
    console.log('   2. API Key tem permissões para Imagen API');
    console.log('   3. Servidor Next.js rodando em', API_URL);
    console.log('   4. @google/genai instalado (npm install @google/genai)\n');
  }

  console.log('=' .repeat(70));

  process.exit(sucessos === total ? 0 : 1);
}

main().catch(error => {
  console.error('\n❌ Erro fatal:', error);
  process.exit(1);
});

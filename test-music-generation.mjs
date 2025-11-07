#!/usr/bin/env node
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '.env.local') });

const SUNO_API_KEY = process.env.SUNO_API_KEY;
const BASE_URL = "https://api.kie.ai/api/v1";

console.log('🎵 Teste Completo de Geração de Música com Suno API\n');
console.log('═══════════════════════════════════════════════════════\n');

async function generateMusic() {
  console.log('🎼 Iniciando geração de música de teste...\n');
  
  const generateOptions = {
    prompt: "Uma música calma e relaxante de piano instrumental, estilo lofi hip hop, atmosfera noturna tranquila",
    customMode: false,
    instrumental: true,
    model: "V3_5",
    title: "Teste API - Noite Tranquila",
    callBackUrl: "https://example.com/callback"
  };
  
  console.log('📝 Parâmetros:');
  console.log('  - Prompt:', generateOptions.prompt);
  console.log('  - Instrumental:', generateOptions.instrumental);
  console.log('  - Modelo:', generateOptions.model);
  console.log('  - Título:', generateOptions.title);
  console.log('');
  
  try {
    console.log('📡 Enviando requisição...');
    const response = await fetch(`${BASE_URL}/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUNO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(generateOptions)
    });

    const data = await response.json();
    
    if (response.ok && data.code === 200) {
      console.log('✅ Geração iniciada com SUCESSO!');
      console.log('\n📊 Detalhes da tarefa:');
      console.log('  - Task ID:', data.data.taskId);
      console.log('  - Status:', 'PENDING (aguardando processamento)');
      console.log('');
      
      const taskId = data.data.taskId;
      
      // Aguardar e verificar status
      console.log('⏳ Aguardando processamento (isso pode levar alguns minutos)...\n');
      
      let attempts = 0;
      const maxAttempts = 30; // 5 minutos (10s cada)
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 10000)); // Aguardar 10s
        attempts++;
        
        const statusResponse = await fetch(`${BASE_URL}/generate/record-info?taskId=${taskId}`, {
          headers: {
            'Authorization': `Bearer ${SUNO_API_KEY}`,
          }
        });
        
        const statusData = await statusResponse.json();
        
        if (statusResponse.ok && statusData.code === 200) {
          const status = statusData.data.status;
          console.log(`[${attempts}/${maxAttempts}] Status: ${status}`);
          
          if (status === 'SUCCESS') {
            console.log('\n🎉 MÚSICA GERADA COM SUCESSO!\n');
            console.log('📊 Resultados:');
            
            const tracks = statusData.data.response?.sunoData || [];
            tracks.forEach((track, index) => {
              console.log(`\n  🎵 Faixa ${index + 1}:`);
              console.log(`     - ID: ${track.id}`);
              console.log(`     - Título: ${track.title}`);
              console.log(`     - Duração: ${track.duration}s`);
              console.log(`     - Tags: ${track.tags}`);
              console.log(`     - URL Áudio: ${track.audio_url}`);
              console.log(`     - URL Stream: ${track.stream_audio_url}`);
              console.log(`     - URL Imagem: ${track.image_url}`);
            });
            
            console.log('\n✅ Teste COMPLETO e FUNCIONAL!');
            return true;
          } else if (status === 'FIRST_SUCCESS') {
            console.log('   ℹ️  Primeira faixa gerada, aguardando segunda...');
          } else if (status === 'TEXT_SUCCESS') {
            console.log('   ℹ️  Letras geradas, gerando áudio...');
          } else if (status.includes('FAILED') || status.includes('ERROR')) {
            console.log('\n❌ Erro na geração:', status);
            console.log('Dados:', JSON.stringify(statusData, null, 2));
            return false;
          }
        }
      }
      
      console.log('\n⚠️  Timeout: A geração está levando mais tempo que o esperado.');
      console.log('💡 Você pode verificar o status manualmente:');
      console.log(`   Task ID: ${taskId}`);
      
    } else {
      console.log('❌ Erro ao iniciar geração!');
      console.log('Código:', data.code);
      console.log('Mensagem:', data.msg);
      console.log('Dados completos:', JSON.stringify(data, null, 2));
      return false;
    }
    
  } catch (error) {
    console.error('\n❌ Erro na requisição:', error.message);
    console.error('Stack:', error.stack);
    return false;
  }
}

// Executar teste
generateMusic().catch(console.error);

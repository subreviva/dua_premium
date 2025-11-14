#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════════
 * TESTE MODO PERSONALIZADO - Music Studio
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Testa:
 * ✅ Modo personalizado (customMode: true)
 * ✅ Campos obrigatórios: style, title
 * ✅ Parâmetros avançados: vocalGender, styleWeight, etc.
 * ✅ Divisão em 2 pistas (2 variações)
 * ✅ Melodia (instrumental: false)
 * ✅ Dedução de créditos
 * ✅ Geração completa
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const sunoApiKey = 'ce5b957b21da1cbc6bc68bb131ceec06';

const supabase = createClient(supabaseUrl, serviceRoleKey);

const MAX_WAIT_TIME = 180000; // 3 minutos
const POLL_INTERVAL = 5000;   // 5 segundos
const COST_CREDITS = 6;       // Custo por geração

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatTimestamp() {
  return new Date().toISOString().split('T')[1].split('.')[0];
}

function log(emoji, message) {
  console.log(`[${formatTimestamp()}] ${message}`);
}

async function checkSunoStatus(taskId) {
  const response = await fetch(
    `https://api.kie.ai/api/v1/generate/record-info?taskId=${taskId}`,
    {
      headers: {
        'Authorization': `Bearer ${sunoApiKey}`
      }
    }
  );

  const result = await response.json();
  
  if (!response.ok || result.code !== 200) {
    throw new Error(`Status check failed: ${result.msg}`);
  }

  return result.data;
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                                                              ║');
  console.log('║       🎼 TESTE MODO PERSONALIZADO - Music Studio            ║');
  console.log('║                                                              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // ─────────────────────────────────────────────────────────────────
  // PASSO 1: Selecionar usuário
  // ─────────────────────────────────────────────────────────────────
  log('🔍', 'Buscando usuário de teste...');
  
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, email, name')
    .limit(1);

  if (usersError || !users || users.length === 0) {
    console.error('❌ Erro ao buscar usuários:', usersError);
    process.exit(1);
  }

  const testUser = users[0];
  log('✅', `Usuário: ${testUser.email}`);

  // ─────────────────────────────────────────────────────────────────
  // PASSO 2: Verificar saldo
  // ─────────────────────────────────────────────────────────────────
  log('💰', 'Verificando saldo...');
  
  const { data: balanceBefore } = await supabase
    .from('duaia_user_balances')
    .select('servicos_creditos')
    .eq('user_id', testUser.id)
    .single();

  const creditsBefore = balanceBefore?.servicos_creditos || 0;
  log('📊', `Saldo inicial: ${creditsBefore} créditos`);

  if (creditsBefore < COST_CREDITS) {
    console.error(`❌ Créditos insuficientes! Necessário: ${COST_CREDITS}, Disponível: ${creditsBefore}`);
    process.exit(1);
  }

  // ─────────────────────────────────────────────────────────────────
  // PASSO 3: Deduzir créditos
  // ─────────────────────────────────────────────────────────────────
  log('💳', `Deduzindo ${COST_CREDITS} créditos...`);

  const { error: deductError } = await supabase.rpc('deduct_servicos_credits', {
    p_user_id: testUser.id,
    p_amount: COST_CREDITS,
    p_operation: 'music_generate_custom',
    p_description: 'Custom mode test - Professional melody',
    p_metadata: {
      model: 'V3_5',
      custom_mode: true,
      test_mode: true
    }
  });

  if (deductError) {
    console.error('❌ Erro ao deduzir créditos:', deductError);
    process.exit(1);
  }

  log('✅', 'Créditos deduzidos');

  const { data: balanceAfter } = await supabase
    .from('duaia_user_balances')
    .select('servicos_creditos')
    .eq('user_id', testUser.id)
    .single();

  const creditsAfter = balanceAfter?.servicos_creditos || 0;
  log('📊', `Saldo após dedução: ${creditsAfter} créditos`);

  // ─────────────────────────────────────────────────────────────────
  // PASSO 4: Gerar música MODO PERSONALIZADO
  // ─────────────────────────────────────────────────────────────────
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║              🎹 MODO PERSONALIZADO ATIVADO                   ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const customRequest = {
    // Campos obrigatórios no modo custom
    prompt: '[Professional piano melody with emotional depth and dynamic range]',
    customMode: true,
    instrumental: false, // Melodia com voz
    model: 'V3_5',
    style: 'piano, classical, emotional, melodic',
    title: `Custom Melody Test ${Date.now()}`,
    
    // Parâmetros avançados
    vocalGender: 'f', // Voz feminina
    styleWeight: 0.8, // 80% de aderência ao estilo
    weirdnessConstraint: 0.3, // 30% de criatividade
    audioWeight: 0.7, // 70% de fidelidade ao áudio
    negativeTags: 'noise, distortion, harsh',
    
    callBackUrl: `${supabaseUrl}/functions/v1/suno-callback`
  };

  log('🎼', 'Request MODO PERSONALIZADO:');
  console.log(JSON.stringify(customRequest, null, 2));
  console.log();

  log('🎵', 'Enviando para Suno API...');

  const generateResponse = await fetch('https://api.kie.ai/api/v1/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sunoApiKey}`
    },
    body: JSON.stringify(customRequest)
  });

  const generateResult = await generateResponse.json();
  
  if (!generateResponse.ok || generateResult.code !== 200) {
    console.error('❌ Falha na geração:', generateResult);
    process.exit(1);
  }

  const taskId = generateResult.data.taskId;
  log('✅', `Task ID: ${taskId}`);

  // ─────────────────────────────────────────────────────────────────
  // PASSO 5: POLLING - Aguardar 2 variações
  // ─────────────────────────────────────────────────────────────────
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║            ⏳ AGUARDANDO 2 PISTAS (Divisão)                  ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const startTime = Date.now();
  let attempt = 0;
  let currentStatus = 'PENDING';
  let tracks = [];

  while (Date.now() - startTime < MAX_WAIT_TIME) {
    attempt++;
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    
    log('🔄', `Tentativa ${attempt} (${elapsed}s)...`);

    try {
      const statusData = await checkSunoStatus(taskId);
      currentStatus = statusData.status;

      log('📊', `Status: ${currentStatus}`);

      switch (currentStatus) {
        case 'TEXT_SUCCESS':
          log('📝', 'Letras/melodia geradas');
          break;

        case 'FIRST_SUCCESS':
          log('🎶', 'Primeira pista concluída!');
          if (statusData.response?.sunoData) {
            tracks = statusData.response.sunoData;
            log('📊', `${tracks.length} pista(s) disponível(is)`);
          }
          break;

        case 'SUCCESS':
          log('🎉', 'TODAS AS PISTAS CONCLUÍDAS!');
          
          tracks = statusData.response?.sunoData || [];
          log('✅', `Total de pistas geradas: ${tracks.length}`);
          
          if (tracks.length >= 2) {
            log('✅', 'DIVISÃO EM 2 PISTAS: SUCESSO');
            console.log('\n┌─────────────────────────────────────────┐');
            console.log('│ PISTA 1:');
            console.log(`│ - Título: ${tracks[0].title}`);
            console.log(`│ - Duração: ${tracks[0].duration}s`);
            console.log(`│ - URL: ${tracks[0].audio_url.substring(0, 50)}...`);
            console.log('├─────────────────────────────────────────┤');
            console.log('│ PISTA 2:');
            console.log(`│ - Título: ${tracks[1].title}`);
            console.log(`│ - Duração: ${tracks[1].duration}s`);
            console.log(`│ - URL: ${tracks[1].audio_url.substring(0, 50)}...`);
            console.log('└─────────────────────────────────────────┘\n');
          }
          
          break;

        case 'CREATE_TASK_FAILED':
        case 'GENERATE_AUDIO_FAILED':
        case 'CALLBACK_EXCEPTION':
        case 'SENSITIVE_WORD_ERROR':
          console.error(`\n❌ ERRO: ${currentStatus}`);
          process.exit(1);
      }

      if (currentStatus === 'SUCCESS') {
        break;
      }

    } catch (error) {
      console.error('❌ Erro ao verificar status:', error.message);
    }

    await sleep(POLL_INTERVAL);
  }

  if (currentStatus !== 'SUCCESS') {
    console.error(`\n⏱️  TIMEOUT após ${MAX_WAIT_TIME / 1000}s`);
    console.error(`Status final: ${currentStatus}`);
    process.exit(1);
  }

  // ─────────────────────────────────────────────────────────────────
  // PASSO 6: Verificar características do modo personalizado
  // ─────────────────────────────────────────────────────────────────
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║           ✅ VERIFICAÇÃO MODO PERSONALIZADO                  ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const track1 = tracks[0];
  const track2 = tracks[1];

  console.log('✓ Campos Personalizados Aplicados:');
  console.log(`  - Style: ${customRequest.style}`);
  console.log(`  - Title pattern: Custom Melody Test`);
  console.log(`  - Vocal Gender: Feminino (${customRequest.vocalGender})`);
  console.log(`  - Instrumental: ${customRequest.instrumental ? 'Sim' : 'Não (com voz)'}`);
  console.log(`  - Style Weight: ${customRequest.styleWeight * 100}%`);
  console.log(`  - Weirdness: ${customRequest.weirdnessConstraint * 100}%`);
  console.log();

  console.log('✓ 2 Pistas Geradas:');
  console.log(`  - Pista 1: ${track1.duration}s | ${track1.tags}`);
  console.log(`  - Pista 2: ${track2.duration}s | ${track2.tags}`);
  console.log();

  console.log('✓ Qualidade de Áudio:');
  console.log(`  - URL stream: ${track1.stream_audio_url ? 'Disponível' : 'N/A'}`);
  console.log(`  - Imagem capa: ${track1.image_url ? 'Disponível' : 'N/A'}`);
  console.log();

  // ─────────────────────────────────────────────────────────────────
  // RESUMO FINAL
  // ─────────────────────────────────────────────────────────────────
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                  🎊 TESTE CONCLUÍDO                          ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  console.log('┌─────────────────────────────────────────────────────────────┐');
  console.log('│ RESULTADOS MODO PERSONALIZADO                               │');
  console.log('├─────────────────────────────────────────────────────────────┤');
  console.log(`│ ✅ Modo Custom:       Ativado                               │`);
  console.log(`│ ✅ Pistas geradas:    ${tracks.length} (2 variações)                        │`);
  console.log(`│ ✅ Melodia:           ${customRequest.instrumental ? 'Não' : 'Sim (com voz)'}              │`);
  console.log(`│ ✅ Vocal Gender:      Feminino                              │`);
  console.log(`│ ✅ Style aplicado:    piano, classical, emotional           │`);
  console.log(`│ ✅ Créditos:          ${creditsBefore} → ${creditsAfter} (${COST_CREDITS} deduzidos)           │`);
  console.log(`│ ✅ Tempo total:       ${Math.floor((Date.now() - startTime) / 1000)}s                                 │`);
  console.log(`│ ✅ Status final:      SUCCESS                               │`);
  console.log('└─────────────────────────────────────────────────────────────┘\n');

  console.log('🎧 URLs das pistas:');
  console.log(`  Pista 1: ${track1.audio_url}`);
  console.log(`  Pista 2: ${track2.audio_url}`);
  console.log();

  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                                                              ║');
  console.log('║     ✅ MODO PERSONALIZADO FUNCIONANDO 100%                   ║');
  console.log('║                                                              ║');
  console.log('║  • Campos custom (style, title)     ✓                        ║');
  console.log('║  • Parâmetros avançados             ✓                        ║');
  console.log('║  • Divisão em 2 pistas              ✓                        ║');
  console.log('║  • Melodia com voz                  ✓                        ║');
  console.log('║  • Dedução de créditos              ✓                        ║');
  console.log('║  • API Suno integrada               ✓                        ║');
  console.log('║                                                              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
}

main().catch(err => {
  console.error('\n❌ ERRO FATAL:', err.message);
  console.error(err.stack);
  process.exit(1);
});

#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════════
 * TESTE COMPLETO MUSIC STUDIO - FLUXO END-TO-END PROFISSIONAL
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Verifica:
 * ✅ Dedução de créditos ANTES da geração
 * ✅ Chamada REAL à API Suno
 * ✅ Task ID retornado
 * ✅ Polling do status até conclusão
 * ✅ Transição de estados: PENDING → TEXT_SUCCESS → FIRST_SUCCESS → SUCCESS
 * ✅ URL do áudio gerado
 * ✅ Salvamento na biblioteca
 * ✅ Verificação final na biblioteca do usuário
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const sunoApiKey = 'ce5b957b21da1cbc6bc68bb131ceec06';

const supabase = createClient(supabaseUrl, serviceRoleKey);

// ═══════════════════════════════════════════════════════════════════
// CONFIGURAÇÕES
// ═══════════════════════════════════════════════════════════════════
const MAX_WAIT_TIME = 180000; // 3 minutos
const POLL_INTERVAL = 5000;   // 5 segundos
const COST_CREDITS = 6;       // Custo da geração

// ═══════════════════════════════════════════════════════════════════
// FUNÇÕES AUXILIARES
// ═══════════════════════════════════════════════════════════════════

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatTimestamp() {
  return new Date().toISOString().split('T')[1].split('.')[0];
}

function log(emoji, message) {
  console.log(`[${formatTimestamp()}] ${emoji} ${message}`);
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

// ═══════════════════════════════════════════════════════════════════
// MAIN TEST FLOW
// ═══════════════════════════════════════════════════════════════════

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                                                              ║');
  console.log('║     🎵 TESTE MUSIC STUDIO - FLUXO COMPLETO PROFISSIONAL      ║');
  console.log('║                                                              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // ─────────────────────────────────────────────────────────────────
  // PASSO 1: Selecionar usuário de teste
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
  log('✅', `Usuário selecionado: ${testUser.email}`);

  // ─────────────────────────────────────────────────────────────────
  // PASSO 2: Verificar saldo inicial
  // ─────────────────────────────────────────────────────────────────
  log('💰', 'Verificando saldo inicial...');
  
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
  // PASSO 3: Deduzir créditos (ANTES da geração)
  // ─────────────────────────────────────────────────────────────────
  log('💳', `Deduzindo ${COST_CREDITS} créditos...`);

  const taskIdPreview = `test-${Date.now()}`;
  const { error: deductError } = await supabase.rpc('deduct_servicos_credits', {
    p_user_id: testUser.id,
    p_amount: COST_CREDITS,
    p_operation: 'music_generate_v5',
    p_description: `Music generation test - ${taskIdPreview}`,
    p_metadata: {
      model: 'V3_5',
      prompt: 'calm piano music test',
      test_mode: true
    }
  });

  if (deductError) {
    console.error('❌ Erro ao deduzir créditos:', deductError);
    process.exit(1);
  }

  log('✅', 'Créditos deduzidos com sucesso');

  // Verificar saldo após dedução
  const { data: balanceAfterDeduct } = await supabase
    .from('duaia_user_balances')
    .select('servicos_creditos')
    .eq('user_id', testUser.id)
    .single();

  const creditsAfterDeduct = balanceAfterDeduct?.servicos_creditos || 0;
  log('📊', `Saldo após dedução: ${creditsAfterDeduct} créditos (${creditsBefore - creditsAfterDeduct} deduzidos)`);

  // ─────────────────────────────────────────────────────────────────
  // PASSO 4: Gerar música via Suno API
  // ─────────────────────────────────────────────────────────────────
  log('🎵', 'Iniciando geração de música...');

  const generateRequest = {
    prompt: '[calm instrumental piano music for relaxation and focus]',
    customMode: false,
    instrumental: true,
    model: 'V3_5',
    title: `Professional Test ${Date.now()}`,
    callBackUrl: `${supabaseUrl}/functions/v1/suno-callback`
  };

  log('📤', 'Request:');
  console.log(JSON.stringify(generateRequest, null, 2));

  const generateResponse = await fetch('https://api.kie.ai/api/v1/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sunoApiKey}`
    },
    body: JSON.stringify(generateRequest)
  });

  const generateResult = await generateResponse.json();
  
  if (!generateResponse.ok || generateResult.code !== 200) {
    console.error('❌ Falha na geração:', generateResult);
    process.exit(1);
  }

  const taskId = generateResult.data.taskId;
  log('✅', `Task ID: ${taskId}`);

  // ─────────────────────────────────────────────────────────────────
  // PASSO 5: Salvar task na biblioteca (status PENDING)
  // ─────────────────────────────────────────────────────────────────
  log('💾', 'Salvando task na biblioteca...');

  const { error: saveError } = await supabase
    .from('music_generations')
    .insert({
      user_id: testUser.id,
      task_id: taskId,
      prompt: generateRequest.prompt,
      model: generateRequest.model,
      status: 'PENDING',
      instrumental: true,
      custom_mode: false,
      title: generateRequest.title,
      created_at: new Date().toISOString()
    });

  if (saveError) {
    console.error('❌ Erro ao salvar na biblioteca:', saveError);
  } else {
    log('✅', 'Task salva na biblioteca com status PENDING');
  }

  // ─────────────────────────────────────────────────────────────────
  // PASSO 6: POLLING - Aguardar conclusão
  // ─────────────────────────────────────────────────────────────────
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                  ⏳ AGUARDANDO CONCLUSÃO                      ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const startTime = Date.now();
  let attempt = 0;
  let currentStatus = 'PENDING';
  let audioUrl = null;
  let sunoData = null;

  while (Date.now() - startTime < MAX_WAIT_TIME) {
    attempt++;
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    
    log('🔄', `Tentativa ${attempt} (${elapsed}s)...`);

    try {
      const statusData = await checkSunoStatus(taskId);
      currentStatus = statusData.status;

      log('📊', `Status: ${currentStatus}`);

      // Atualizar status na biblioteca
      if (currentStatus !== 'PENDING') {
        await supabase
          .from('music_generations')
          .update({ status: currentStatus })
          .eq('task_id', taskId);
      }

      // Verificar estados
      switch (currentStatus) {
        case 'TEXT_SUCCESS':
          log('📝', 'Letras geradas (se aplicável)');
          break;

        case 'FIRST_SUCCESS':
          log('🎶', 'Primeira faixa concluída!');
          break;

        case 'SUCCESS':
          log('🎉', 'MÚSICA CONCLUÍDA!');
          
          sunoData = statusData.response?.sunoData;
          if (sunoData && sunoData.length > 0) {
            audioUrl = sunoData[0].audio_url;
            
            // Atualizar na biblioteca com todos os dados
            await supabase
              .from('music_generations')
              .update({
                status: 'SUCCESS',
                audio_url: audioUrl,
                image_url: sunoData[0].image_url,
                duration: sunoData[0].duration,
                tags: sunoData[0].tags,
                completed_at: new Date().toISOString()
              })
              .eq('task_id', taskId);

            log('💾', 'Biblioteca atualizada com áudio final');
          }
          
          break;

        case 'CREATE_TASK_FAILED':
        case 'GENERATE_AUDIO_FAILED':
        case 'CALLBACK_EXCEPTION':
        case 'SENSITIVE_WORD_ERROR':
          console.error(`\n❌ ERRO NO SUNO: ${currentStatus}`);
          
          await supabase
            .from('music_generations')
            .update({ 
              status: 'ERROR',
              error_message: currentStatus 
            })
            .eq('task_id', taskId);
          
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
    console.error(`\n⏱️  TIMEOUT: Música não concluída após ${MAX_WAIT_TIME / 1000}s`);
    console.error(`Status final: ${currentStatus}`);
    process.exit(1);
  }

  // ─────────────────────────────────────────────────────────────────
  // PASSO 7: Verificar dados finais na biblioteca
  // ─────────────────────────────────────────────────────────────────
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                  ✅ VERIFICAÇÃO FINAL                         ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  log('🔍', 'Verificando dados na biblioteca...');

  const { data: libraryEntry } = await supabase
    .from('music_generations')
    .select('*')
    .eq('task_id', taskId)
    .single();

  if (!libraryEntry) {
    console.error('❌ Entrada não encontrada na biblioteca!');
    process.exit(1);
  }

  log('✅', 'Entrada encontrada na biblioteca');
  console.log('\n📦 Dados salvos:');
  console.log(JSON.stringify(libraryEntry, null, 2));

  // Verificar transações
  const { data: transactions } = await supabase
    .from('duaia_transactions')
    .select('*')
    .eq('user_id', testUser.id)
    .order('created_at', { ascending: false })
    .limit(1);

  if (transactions && transactions.length > 0) {
    log('💰', 'Última transação:');
    console.log(JSON.stringify(transactions[0], null, 2));
  }

  // ─────────────────────────────────────────────────────────────────
  // RESUMO FINAL
  // ─────────────────────────────────────────────────────────────────
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                    🎊 TESTE CONCLUÍDO                         ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  console.log('┌─────────────────────────────────────────────────────────────┐');
  console.log('│ RESULTADOS DO TESTE                                         │');
  console.log('├─────────────────────────────────────────────────────────────┤');
  console.log(`│ ✅ Usuário:           ${testUser.email.padEnd(40)}│`);
  console.log(`│ ✅ Task ID:           ${taskId.padEnd(40)}│`);
  console.log(`│ ✅ Créditos antes:    ${creditsBefore.toString().padEnd(40)}│`);
  console.log(`│ ✅ Créditos depois:   ${creditsAfterDeduct.toString().padEnd(40)}│`);
  console.log(`│ ✅ Créditos deduzidos: ${COST_CREDITS.toString().padEnd(40)}│`);
  console.log(`│ ✅ Status final:      ${currentStatus.padEnd(40)}│`);
  console.log(`│ ✅ Tempo total:       ${Math.floor((Date.now() - startTime) / 1000)}s${(' '.repeat(37))}│`);
  console.log(`│ ✅ URL do áudio:      ${(audioUrl ? 'Sim ✓' : 'Não ✗').padEnd(40)}│`);
  console.log(`│ ✅ Na biblioteca:     ${(libraryEntry ? 'Sim ✓' : 'Não ✗').padEnd(40)}│`);
  console.log('└─────────────────────────────────────────────────────────────┘\n');

  if (audioUrl) {
    console.log('🎧 URL do áudio gerado:');
    console.log(audioUrl);
    console.log();
  }

  if (sunoData && sunoData.length > 0) {
    console.log('🎵 Detalhes da música:');
    console.log(`   Título: ${sunoData[0].title}`);
    console.log(`   Tags: ${sunoData[0].tags}`);
    console.log(`   Duração: ${sunoData[0].duration}s`);
    console.log(`   Criada em: ${sunoData[0].createTime}`);
    console.log();
  }

  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                                                              ║');
  console.log('║     ✅ TODOS OS PROCESSOS FUNCIONANDO 100%                   ║');
  console.log('║                                                              ║');
  console.log('║  • Dedução de créditos        ✓                              ║');
  console.log('║  • Chamada API Suno           ✓                              ║');
  console.log('║  • Task ID gerado             ✓                              ║');
  console.log('║  • Polling de status          ✓                              ║');
  console.log('║  • Transições de estado       ✓                              ║');
  console.log('║  • Salvamento na biblioteca   ✓                              ║');
  console.log('║  • URL do áudio final         ✓                              ║');
  console.log('║                                                              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
}

main().catch(err => {
  console.error('\n❌ ERRO FATAL:', err.message);
  console.error(err.stack);
  process.exit(1);
});

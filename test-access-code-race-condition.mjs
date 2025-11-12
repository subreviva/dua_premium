#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════
 * 🛡️ TESTE DE PROTEÇÃO RACE CONDITION - CÓDIGOS DE ACESSO
 * ═══════════════════════════════════════════════════════════════
 * 
 * TESTA: Se o mesmo código pode ser usado 2x simultaneamente
 * ESPERADO: Segunda tentativa DEVE FALHAR com erro 409
 * 
 * CENÁRIO:
 * 1. Criar código de teste ativo
 * 2. Simular 2 utilizadores tentando usar código ao MESMO tempo
 * 3. Verificar que apenas 1 teve sucesso
 * 
 * @created 2024-01-24
 * @author DUA IA - Ultra Rigoroso System
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nranmngyocaqjwcokcxm.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW5tbmd5b2NhcWp3Y29rY3htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU3NzE1MiwiZXhwIjoyMDc0MTUzMTUyfQ.QigiIbtuBBvzxL3yqLHkl-QYZBSBDBrx1L4B0nf_4lQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

console.log('═══════════════════════════════════════════════════════════════');
console.log('🛡️  TESTE: Proteção Race Condition - Códigos de Acesso');
console.log('═══════════════════════════════════════════════════════════════\n');

async function simulateRegistration(code, userEmail, userName, attemptNumber) {
  console.log(`\n[TENTATIVA ${attemptNumber}] Iniciando registo para ${userEmail}...`);
  
  try {
    // PASSO 1: Criar user no auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userEmail,
      password: 'Test123!@#',
      email_confirm: true,
      user_metadata: { name: userName },
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log(`[TENTATIVA ${attemptNumber}] ⚠️  Email já existe (ok para teste)`);
        // Usar user existente
        const { data: { user } } = await supabase.auth.admin.getUserByEmail(userEmail);
        if (!user) throw new Error('User não encontrado');
        const userId = user.id;
        
        // Tentar marcar código como usado
        return await markCodeAsUsed(code, userId, attemptNumber);
      }
      throw authError;
    }

    const userId = authData.user.id;
    console.log(`[TENTATIVA ${attemptNumber}] ✅ User criado: ${userId}`);

    // PASSO 2: Tentar marcar código como usado (simulando a lógica fixa)
    return await markCodeAsUsed(code, userId, attemptNumber);
    
  } catch (error) {
    console.error(`[TENTATIVA ${attemptNumber}] ❌ Erro:`, error.message);
    return { success: false, error: error.message };
  }
}

async function markCodeAsUsed(code, userId, attemptNumber) {
  console.log(`[TENTATIVA ${attemptNumber}] Verificando código antes de marcar como usado...`);
  
  // ⚡ PROTEÇÃO: Re-verificar se código ainda está ativo
  const { data: codeCheck, error: codeCheckError } = await supabase
    .from('invite_codes')
    .select('code, active, used_by')
    .ilike('code', code)
    .limit(1)
    .single();
  
  if (codeCheckError || !codeCheck) {
    console.error(`[TENTATIVA ${attemptNumber}] ❌ Código não encontrado`);
    throw new Error('Código não encontrado');
  }
  
  if (!codeCheck.active || codeCheck.used_by) {
    console.error(`[TENTATIVA ${attemptNumber}] ❌ Código já usado por: ${codeCheck.used_by}`);
    throw new Error('Código já foi utilizado por outro utilizador');
  }
  
  console.log(`[TENTATIVA ${attemptNumber}] ✅ Código ainda ativo, marcando como usado...`);
  
  // ✅ Código ainda ativo - marcar como usado COM CONDIÇÃO
  const { error: updateError } = await supabase
    .from('invite_codes')
    .update({
      active: false,
      used_by: userId,
      used_at: new Date().toISOString(),
    })
    .ilike('code', code)
    .eq('active', true); // ⚡ CRÍTICO: Só atualizar se AINDA estiver ativo
  
  if (updateError) {
    console.error(`[TENTATIVA ${attemptNumber}] ❌ Erro ao marcar código:`, updateError.message);
    throw new Error('Erro ao processar código');
  }
  
  console.log(`[TENTATIVA ${attemptNumber}] ✅ Código marcado como usado com SUCESSO!`);
  return { success: true, userId };
}

async function runTest() {
  // SETUP: Criar código de teste
  const testCode = `TEST${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  
  console.log(`\n📝 SETUP: Criando código de teste: ${testCode}\n`);
  
  const { error: insertError } = await supabase
    .from('invite_codes')
    .insert({
      code: testCode,
      active: true,
    });
  
  if (insertError) {
    console.error('❌ Erro ao criar código de teste:', insertError);
    return;
  }
  
  console.log('✅ Código de teste criado com sucesso!\n');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🏁 INICIANDO TESTE DE RACE CONDITION');
  console.log('═══════════════════════════════════════════════════════════════');
  
  // TESTE: Simular 2 utilizadores usando código ao mesmo tempo
  const user1Email = `testuser1_${Date.now()}@example.com`;
  const user2Email = `testuser2_${Date.now()}@example.com`;
  
  console.log('\n⏱️  Executando 2 registos SIMULTÂNEOS com mesmo código...\n');
  
  const results = await Promise.allSettled([
    simulateRegistration(testCode, user1Email, 'Test User 1', 1),
    simulateRegistration(testCode, user2Email, 'Test User 2', 2),
  ]);
  
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('📊 RESULTADOS DO TESTE');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  const successes = results.filter(r => r.status === 'fulfilled' && r.value.success);
  const failures = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success));
  
  console.log(`✅ SUCESSOS: ${successes.length}`);
  console.log(`❌ FALHAS: ${failures.length}\n`);
  
  if (successes.length === 1 && failures.length === 1) {
    console.log('🎉 TESTE PASSOU! Apenas 1 utilizador conseguiu usar o código.');
    console.log('✅ Proteção Race Condition está FUNCIONANDO CORRETAMENTE!\n');
  } else if (successes.length > 1) {
    console.log('⚠️  TESTE FALHOU! Múltiplos utilizadores conseguiram usar o código.');
    console.log('❌ Proteção Race Condition NÃO está funcionando!\n');
  } else {
    console.log('⚠️  TESTE INCONCLUSIVO. Verificar logs acima.\n');
  }
  
  // VERIFICAÇÃO FINAL: Checar estado do código
  const { data: finalCodeState } = await supabase
    .from('invite_codes')
    .select('code, active, used_by, used_at')
    .eq('code', testCode)
    .single();
  
  console.log('🔍 ESTADO FINAL DO CÓDIGO:');
  console.log(`   Código: ${finalCodeState?.code}`);
  console.log(`   Ativo: ${finalCodeState?.active}`);
  console.log(`   Usado por: ${finalCodeState?.used_by || 'ninguém'}`);
  console.log(`   Usado em: ${finalCodeState?.used_at || 'nunca'}\n`);
  
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🧹 CLEANUP: Removendo dados de teste...');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  // Limpar código de teste
  await supabase.from('invite_codes').delete().eq('code', testCode);
  
  // Limpar users de teste (se criados)
  if (successes.length > 0) {
    for (const result of successes) {
      if (result.status === 'fulfilled' && result.value.userId) {
        await supabase.auth.admin.deleteUser(result.value.userId);
      }
    }
  }
  
  console.log('✅ Cleanup concluído!\n');
}

// Executar teste
runTest().catch(console.error);

#!/usr/bin/env node
/**
 * 🔍 VERIFICAÇÃO: Créditos depositados imediatamente no registro
 * 
 * Este script verifica se os 150 créditos são depositados IMEDIATAMENTE
 * quando o usuário se registra, em AMBAS as tabelas:
 * - users.creditos_servicos
 * - duaia_user_balances.servicos_creditos
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nranmngyocaqjwcokcxm.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não configurada');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

console.log('\n╔══════════════════════════════════════════════════════════════════════╗');
console.log('║     🔍 VERIFICAÇÃO: CRÉDITOS DEPOSITADOS IMEDIATAMENTE              ║');
console.log('╚══════════════════════════════════════════════════════════════════════╝\n');

async function verifyImmediateCredits() {
  try {
    // Criar código de convite temporário
    console.log('1️⃣  Criando código de convite temporário...');
    const { data: inviteCode } = await supabase
      .from('invite_codes')
      .insert({ code: `TEST-IMMEDIATE-${Date.now()}`, active: true })
      .select()
      .single();
    
    console.log('   ✅ Código criado:', inviteCode.code);

    // Simular registro via API
    console.log('\n2️⃣  Registrando usuário via API...');
    const testEmail = `test-immediate-${Date.now()}@example.com`;
    
    const startTime = Date.now();
    const response = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Immediate Credits',
        email: testEmail,
        password: 'TestPassword@123',
        inviteCode: inviteCode.code,
        acceptedTerms: true
      })
    });

    const registrationTime = Date.now() - startTime;
    console.log(`   ⏱️  Tempo de registro: ${registrationTime}ms`);

    if (!response.ok) {
      const error = await response.json();
      console.error('   ❌ Erro no registro:', error);
      throw new Error('Registro falhou');
    }

    console.log('   ✅ Registro bem-sucedido');

    // Buscar usuário IMEDIATAMENTE após registro
    console.log('\n3️⃣  Verificando créditos IMEDIATAMENTE após registro...');
    
    const { data: user } = await supabase
      .from('users')
      .select('id, email, creditos_servicos')
      .eq('email', testEmail)
      .single();

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    console.log('   📋 Usuário encontrado:', user.id.substring(0, 8) + '...');
    
    // Verificar users.creditos_servicos
    console.log('\n   📊 users.creditos_servicos:', user.creditos_servicos);
    if (user.creditos_servicos === 150) {
      console.log('   ✅ CORRETO: 150 créditos em users.creditos_servicos');
    } else {
      console.log('   ❌ ERRO: Esperado 150, encontrado', user.creditos_servicos);
    }

    // Verificar duaia_user_balances.servicos_creditos
    const { data: balance } = await supabase
      .from('duaia_user_balances')
      .select('servicos_creditos')
      .eq('user_id', user.id)
      .single();

    console.log('   📊 duaia_user_balances.servicos_creditos:', balance?.servicos_creditos || 'NULL');
    if (balance && balance.servicos_creditos === 150) {
      console.log('   ✅ CORRETO: 150 créditos em duaia_user_balances.servicos_creditos');
    } else {
      console.log('   ❌ ERRO: Esperado 150, encontrado', balance?.servicos_creditos || 'NULL');
    }

    // Verificar transação
    console.log('\n4️⃣  Verificando transação de signup_bonus...');
    const { data: transaction } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', user.id)
      .eq('transaction_type', 'signup_bonus')
      .single();

    if (transaction && transaction.amount === 150) {
      console.log('   ✅ CORRETO: Transação signup_bonus registrada com 150 créditos');
      console.log('   📋 Descrição:', transaction.description);
    } else {
      console.log('   ❌ ERRO: Transação não encontrada ou valor incorreto');
    }

    // Verificar sincronização
    console.log('\n5️⃣  Verificando SINCRONIZAÇÃO entre tabelas...');
    if (user.creditos_servicos === balance?.servicos_creditos) {
      console.log('   ✅ PERFEITO: Ambas tabelas sincronizadas (150 = 150)');
    } else {
      console.log('   ❌ ERRO: Tabelas DESSINCRONIZADAS');
      console.log(`      users.creditos_servicos: ${user.creditos_servicos}`);
      console.log(`      duaia_user_balances.servicos_creditos: ${balance?.servicos_creditos}`);
    }

    // Limpeza
    console.log('\n6️⃣  Limpando dados de teste...');
    await supabase.from('credit_transactions').delete().eq('user_id', user.id);
    await supabase.from('duaia_user_balances').delete().eq('user_id', user.id);
    await supabase.from('users').delete().eq('id', user.id);
    await supabase.auth.admin.deleteUser(user.id);
    await supabase.from('invite_codes').delete().eq('id', inviteCode.id);
    console.log('   ✅ Limpeza concluída');

    // Resumo
    console.log('\n╔══════════════════════════════════════════════════════════════════════╗');
    console.log('║                           RESUMO FINAL                               ║');
    console.log('╚══════════════════════════════════════════════════════════════════════╝\n');
    
    const allCorrect = 
      user.creditos_servicos === 150 &&
      balance?.servicos_creditos === 150 &&
      transaction?.amount === 150 &&
      user.creditos_servicos === balance?.servicos_creditos;

    if (allCorrect) {
      console.log('✅ TUDO CORRETO: 150 créditos depositados IMEDIATAMENTE');
      console.log('✅ Ambas tabelas sincronizadas: users.creditos_servicos ↔ duaia_user_balances.servicos_creditos');
      console.log('✅ Transação signup_bonus registrada corretamente');
      console.log('✅ Tempo de registro:', registrationTime + 'ms');
      console.log('\n🎉 SISTEMA FUNCIONANDO PERFEITAMENTE!\n');
      return true;
    } else {
      console.log('❌ PROBLEMAS DETECTADOS:');
      if (user.creditos_servicos !== 150) {
        console.log('   • users.creditos_servicos NÃO é 150');
      }
      if (balance?.servicos_creditos !== 150) {
        console.log('   • duaia_user_balances.servicos_creditos NÃO é 150');
      }
      if (!transaction || transaction.amount !== 150) {
        console.log('   • Transação signup_bonus AUSENTE ou incorreta');
      }
      if (user.creditos_servicos !== balance?.servicos_creditos) {
        console.log('   • Tabelas DESSINCRONIZADAS');
      }
      console.log('\n⚠️  SISTEMA PRECISA DE CORREÇÃO!\n');
      return false;
    }

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    console.log('\n⚠️  Verifique se o servidor está rodando (npm run dev)\n');
    return false;
  }
}

verifyImmediateCredits().then(success => {
  process.exit(success ? 0 : 1);
});

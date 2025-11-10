#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

console.log('\n🧪 TESTE: CRÉDITOS INSUFICIENTES\n');

// Buscar usuário real
const { data: users } = await supabase
  .from('duaia_user_balances')
  .select('user_id, servicos_creditos')
  .limit(1);

if (!users || users.length === 0) {
  console.log('❌ Nenhum usuário encontrado');
  process.exit(1);
}

const userId = users[0].user_id;
console.log(`User ID: ${userId}`);
console.log(`Saldo atual: ${users[0].servicos_creditos} créditos\n`);

// 1. Verificar se tem créditos suficientes (deve retornar has_sufficient)
console.log('1️⃣ CHECK_SERVICOS_CREDITS (10 créditos)...\n');

const { data: checkResult } = await supabase.rpc('check_servicos_credits', {
  p_user_id: userId,
  p_required_amount: 10
});

const check = typeof checkResult === 'string' ? JSON.parse(checkResult) : checkResult;
console.log(`   Has sufficient: ${check.has_sufficient}`);
console.log(`   Current balance: ${check.current_balance}`);
console.log(`   Required: ${check.required_amount}`);
console.log(`   Deficit: ${check.deficit}\n`);

// 2. Tentar deduzir MAIS créditos do que tem
console.log('2️⃣ TENTANDO DEDUZIR 1000 CRÉDITOS (deve falhar)...\n');

const { data: deductData, error: deductErr } = await supabase.rpc('deduct_servicos_credits', {
  p_user_id: userId,
  p_amount: 1000,
  p_operation: 'test_fail',
  p_description: 'Deve falhar por créditos insuficientes'
});

if (deductErr) {
  console.log(`   ✅ BLOQUEADO CORRETAMENTE!`);
  console.log(`   Erro: ${deductErr.message}\n`);
} else {
  console.log(`   ❌ FALHA! Dedução NÃO foi bloqueada!\n`);
}

// 3. Verificar que saldo não mudou
const { data: finalBalance } = await supabase.rpc('get_servicos_credits', {
  p_user_id: userId
});

console.log(`3️⃣ SALDO APÓS TENTATIVA FALHADA: ${finalBalance} créditos`);
console.log(`   ${finalBalance === users[0].servicos_creditos ? '✅' : '❌'} Saldo permaneceu inalterado\n`);

console.log('✅ TESTE COMPLETO!\n');

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = readFileSync('/tmp/test-user-id.txt', 'utf-8').trim();

console.log('═══════════════════════════════════════════════════════════');
console.log('   🔍 VERIFICAÇÃO DE CRÉDITOS NO BANCO');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('👤 User ID:', userId);
console.log('\n───────────────────────────────────────────────────────────\n');

// 1. Verificar dados do usuário
const { data: user, error: userError } = await supabase
  .from('users')
  .select('id, name, email, creditos_servicos, saldo_dua, has_access, created_at')
  .eq('id', userId)
  .single();

if (userError) {
  console.error('❌ Erro ao buscar usuário:', userError.message);
} else {
  console.log('✅ DADOS DO USUÁRIO NA TABELA users:');
  console.log('   Nome:', user.name);
  console.log('   Email:', user.email);
  console.log('   Créditos Serviços:', user.creditos_servicos, user.creditos_servicos === 150 ? '✅ CORRETO' : '❌ ERRADO');
  console.log('   DUA Coins:', user.saldo_dua, user.saldo_dua === 50 ? '✅ CORRETO' : '❌ ERRADO');
  console.log('   Tem Acesso:', user.has_access ? '✅ SIM' : '❌ NÃO');
  console.log('   Criado em:', user.created_at);
}

console.log('\n───────────────────────────────────────────────────────────\n');

// 2. Verificar código de convite
const { data: code, error: codeError } = await supabase
  .from('invite_codes')
  .select('*')
  .eq('code', 'DUA-03BN-9QT')
  .single();

if (codeError) {
  console.error('❌ Erro ao buscar código:', codeError.message);
} else {
  console.log('✅ VERIFICAÇÃO DO CÓDIGO DE CONVITE:');
  console.log('   Código:', code.code);
  console.log('   Ativo:', code.active ? '⚠️ AINDA ATIVO (ERRO)' : '✅ DESATIVADO (CORRETO)');
  console.log('   Usado por:', code.used_by === userId ? '✅ USER ID CORRETO' : '❌ USER ID ERRADO');
  console.log('   Usado em:', code.used_at || 'N/A');
}

console.log('\n═══════════════════════════════════════════════════════════');
console.log('   ✅ VERIFICAÇÃO COMPLETA');
console.log('═══════════════════════════════════════════════════════════\n');

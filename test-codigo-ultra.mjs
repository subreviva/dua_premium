import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

console.log('🔍 Ultra Mode - Testando Sistema de Códigos\n');
console.log('📋 Verificando variáveis...');
console.log('   URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌');
console.log('   KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌');
console.log('');

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log('❌ Variáveis de ambiente não configuradas!');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Teste 1: Verificar se tabela existe
console.log('📊 Teste 1: Estrutura da tabela invite_codes');
const { data: tableInfo, error: tableError } = await supabase
  .from('invite_codes')
  .select('*')
  .limit(1);

if (tableError) {
  console.log('❌ ERRO ao acessar tabela:', tableError.message);
  console.log('Código:', tableError.code);
  console.log('Detalhes:', tableError.details);
  process.exit(1);
}
console.log('✅ Tabela existe e é acessível\n');

// Teste 2: Contar códigos
console.log('📊 Teste 2: Total de códigos na base');
const { count, error: countError } = await supabase
  .from('invite_codes')
  .select('*', { count: 'exact', head: true });

if (countError) {
  console.log('❌ ERRO ao contar:', countError.message);
} else {
  console.log(`✅ Total de códigos: ${count}\n`);
}

// Teste 3: Verificar código específico
const testCode = 'DUA-03BN-9QT';
console.log(`�� Teste 3: Verificar código ${testCode}`);
const { data: codeData, error: codeError } = await supabase
  .from('invite_codes')
  .select('*')
  .eq('code', testCode)
  .single();

if (codeError) {
  console.log('❌ ERRO:', codeError.message);
  console.log('Código:', codeError.code);
  console.log('Hint:', codeError.hint);
} else {
  console.log('✅ Código encontrado:');
  console.log(JSON.stringify(codeData, null, 2));
}
console.log('');

// Teste 4: Listar primeiros 5 códigos
console.log('📊 Teste 4: Primeiros 5 códigos');
const { data: firstCodes, error: listError } = await supabase
  .from('invite_codes')
  .select('code, active, used_by')
  .order('code')
  .limit(5);

if (listError) {
  console.log('❌ ERRO:', listError.message);
} else {
  console.log('✅ Códigos:');
  firstCodes.forEach(c => console.log(`   ${c.code} - Ativo: ${c.active} - Usado por: ${c.used_by || 'ninguém'}`));
}

console.log('\n✅ Testes concluídos!');

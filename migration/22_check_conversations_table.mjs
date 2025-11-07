import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

console.log('\n🔍 Verificando tabela conversations...\n');

const { data: tables, error: tablesError } = await supabase
  .from('conversations')
  .select('*')
  .limit(1);

if (tablesError) {
  console.log('❌ Tabela conversations:', tablesError.code);
  console.log('   Mensagem:', tablesError.message);
  
  if (tablesError.code === '42P01') {
    console.log('\n📋 DIAGNÓSTICO: Tabela "conversations" não existe no DUA COIN');
    console.log('\n💡 SOLUÇÕES:');
    console.log('   1. Criar tabela conversations no DUA COIN');
    console.log('   2. Usar localStorage apenas (sem Supabase)');
  }
} else {
  console.log('✅ Tabela conversations existe e está acessível');
  console.log(`   Registros: ${tables?.length || 0}`);
}

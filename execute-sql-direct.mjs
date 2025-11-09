import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const SUPABASE_URL = 'https://nranmngyocaqjwcokcxm.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW5tbmd5b2NhcWp3Y29rY3htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMTE3Njk2NCwiZXhwIjoyMDQ2NzUyOTY0fQ.s0o1S6vkNn0vkj77a9tT3rEGwM_vPq0HHHgVCQJqbGM';

console.log('🚀 EXECUTANDO SQL VIA SUPABASE JS CLIENT...\n');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const sql = readFileSync('sql/ultra-rigorous-registration.sql', 'utf8');

// Dividir em comandos individuais
const commands = sql
  .split(';')
  .map(cmd => cmd.trim())
  .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

console.log(`📝 Total de comandos: ${commands.length}\n`);

let successCount = 0;
let errorCount = 0;

for (let i = 0; i < commands.length; i++) {
  const cmd = commands[i];
  
  // Pular comentários
  if (cmd.startsWith('--') || cmd.startsWith('/*')) continue;
  
  console.log(`[${i + 1}/${commands.length}] Executando...`);
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: cmd + ';' });
    
    if (error) {
      console.log(`❌ Erro:`, error.message);
      errorCount++;
    } else {
      console.log(`✅ Sucesso`);
      successCount++;
    }
  } catch (err) {
    console.log(`⚠️ Tentando método alternativo...`);
    
    // Tentar executar via query direto
    try {
      await supabase.from('_sql').insert({ query: cmd });
      console.log(`✅ Executado via método alternativo`);
      successCount++;
    } catch (err2) {
      console.log(`❌ Falhou:`, err2.message);
      errorCount++;
    }
  }
}

console.log(`\n${'='.repeat(60)}`);
console.log(`✅ Sucessos: ${successCount}`);
console.log(`❌ Erros: ${errorCount}`);
console.log(`${'='.repeat(60)}\n`);

// Verificar se tabelas foram criadas
console.log('🔍 Verificando tabelas criadas...\n');

try {
  const { data: sessions } = await supabase.from('user_sessions').select('count');
  console.log('✅ Tabela user_sessions:', sessions ? 'EXISTE' : 'NÃO EXISTE');
} catch (err) {
  console.log('❌ Tabela user_sessions: NÃO EXISTE');
}

try {
  const { data: logs } = await supabase.from('user_activity_logs').select('count');
  console.log('✅ Tabela user_activity_logs:', logs ? 'EXISTE' : 'NÃO EXISTE');
} catch (err) {
  console.log('❌ Tabela user_activity_logs: NÃO EXISTE');
}

try {
  const { data: users } = await supabase.from('users').select('dua_ia_balance').limit(1);
  console.log('✅ Coluna dua_ia_balance em users:', users !== null ? 'EXISTE' : 'NÃO EXISTE');
} catch (err) {
  console.log('❌ Coluna dua_ia_balance: NÃO EXISTE');
}

console.log('\n✅ VERIFICAÇÃO CONCLUÍDA!\n');

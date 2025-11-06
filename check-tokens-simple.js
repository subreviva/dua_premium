import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://gocjbfcztorfswlkkjqi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvY2piZmN6dG9yZnN3bGtranFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA1NjM4NzAsImV4cCI6MjA0NjEzOTg3MH0.k-YnrO0oL67o0pSJzrXZmqAjipkDczSXv6v-U01_-as'
);

async function checkTokens() {
  console.log('🔍 Verificando estrutura da tabela users...\n');
  
  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, full_name, total_tokens, tokens_used, has_access, tier')
    .limit(3);
  
  if (error) {
    console.error('❌ Erro:', error.message);
    return;
  }
  
  console.log('✅ Estrutura da tabela users:');
  console.log(JSON.stringify(users, null, 2));
  
  // Check token packages table
  console.log('\n🔍 Verificando tabela token_packages...\n');
  const { data: packages, error: pkgError } = await supabase
    .from('token_packages')
    .select('*');
  
  if (pkgError) {
    console.log('❌ Tabela token_packages não existe:', pkgError.message);
  } else {
    console.log('✅ Pacotes de tokens disponíveis:');
    console.log(JSON.stringify(packages, null, 2));
  }
}

checkTokens();

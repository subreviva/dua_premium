require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkPolicies() {
  console.log('\n🔍 Verificando Policies de RLS em invite_codes...\n');
  
  const { data, error } = await supabaseService
    .from('pg_policies')
    .select('*')
    .eq('tablename', 'invite_codes');
  
  if (error) {
    console.error('❌ Erro ao consultar policies:', error);
    return;
  }
  
  console.log('📋 Policies encontradas:');
  console.log(JSON.stringify(data, null, 2));
  
  console.log('\n🔍 Resumo:');
  data.forEach(policy => {
    const emoji = policy.cmd === 'DELETE' ? '🔴' : 
                  policy.cmd === 'SELECT' ? '🟢' : 
                  policy.cmd === 'INSERT' ? '🟡' : '🟠';
    console.log(`${emoji} ${policy.policyname} - ${policy.cmd} - roles: ${policy.roles}`);
  });
}

checkPolicies();

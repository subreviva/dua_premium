import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const code = 'DUA-03BN-9QT';

console.log('🔍 Verificando código:', code);

const { data, error } = await supabase
  .from('invite_codes')
  .select('*')
  .eq('code', code)
  .single();

if (error) {
  console.log('❌ Erro:', error.message);
} else if (!data) {
  console.log('❌ Código não encontrado no banco');
} else {
  console.log('\n✅ Código encontrado:');
  console.log('   ID:', data.id);
  console.log('   Código:', data.code);
  console.log('   Ativo:', data.active ? '✅ SIM' : '❌ NÃO');
  console.log('   Usado por:', data.used_by || '❌ Ninguém (disponível)');
  console.log('   Usado em:', data.used_at || 'N/A');
  console.log('   Criado em:', data.created_at);
}

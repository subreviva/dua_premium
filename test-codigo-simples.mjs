import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔍 Testando código: DUA-03BN-9QT\n');

const { data, error } = await supabase
  .from('invite_codes')
  .select('*')
  .eq('code', 'DUA-03BN-9QT')
  .single();

if (error) {
  console.log('❌ ERRO:', error.message);
  console.log('Detalhes completos:', JSON.stringify(error, null, 2));
} else {
  console.log('✅ Código encontrado:');
  console.log(JSON.stringify(data, null, 2));
}

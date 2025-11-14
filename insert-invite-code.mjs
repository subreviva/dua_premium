import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

console.log('🔑 Inserindo código de convite DUA-03BN-9QT...\n');

const { data, error } = await supabase
  .from('invite_codes')
  .insert([{
    code: 'DUA-03BN-9QT',
    active: true
  }])
  .select();

if (error) {
  if (error.code === '23505') {
    console.log('✅ Código já existe, ativando...\n');
    const { data: updated, error: updateError } = await supabase
      .from('invite_codes')
      .update({ active: true, used_by: null, used_at: null })
      .eq('code', 'DUA-03BN-9QT')
      .select();
    
    if (updateError) {
      console.error('❌ Erro ao ativar:', updateError);
    } else {
      console.log('✅ Código ativado:', updated);
    }
  } else {
    console.error('❌ Erro:', error);
  }
} else {
  console.log('✅ Código criado:', data);
}

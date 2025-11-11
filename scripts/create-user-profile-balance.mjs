import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const userId = '1f7b923b-3734-4c5a-a791-938f35d11cf3';
const email = 'vinhosclassee@gmail.com';
const name = 'carlos';

console.log('👤 Criando profile e balance para:', email);

// 1. Criar profile
const { error: profileError } = await supabase
  .from('users')
  .upsert({
    id: userId,
    email: email.toLowerCase(),
    name,
    creditos_servicos: 150,
    created_at: new Date().toISOString(),
  }, { onConflict: 'id' });

if (profileError) {
  console.error('❌ Erro profile:', profileError);
} else {
  console.log('✅ Profile criado!');
}

// 2. Criar balance
const { error: balanceError } = await supabase
  .from('duaia_user_balances')
  .upsert({
    user_id: userId,
    servicos_creditos: 150,
    duacoin_balance: 0,
  }, { onConflict: 'user_id' });

if (balanceError) {
  console.error('❌ Erro balance:', balanceError);
} else {
  console.log('✅ Balance criado: 150 créditos!');
}

// 3. Marcar código como usado (DUA-11SF-3GX foi o usado)
const { error: codeError } = await supabase
  .from('invite_codes')
  .update({
    active: false,
    used_by: userId,
    used_at: new Date().toISOString(),
  })
  .eq('code', 'DUA-11SF-3GX');

if (codeError) {
  console.error('❌ Erro código:', codeError);
} else {
  console.log('✅ Código DUA-11SF-3GX marcado como usado!');
}

console.log('\n🎉 Tudo pronto! Faz login agora!');

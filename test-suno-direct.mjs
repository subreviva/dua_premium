import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const sunoApiKey = 'ce5b957b21da1cbc6bc68bb131ceec06';

const supabase = createClient(supabaseUrl, serviceRoleKey);

console.log('🎵 TESTE MUSIC STUDIO - ABORDAGEM DIRETA');
console.log('=========================================\n');

// Criar usuário direto via admin
const testEmail = `music${Date.now()}@test.com`;
console.log(`📝 Criando usuário: ${testEmail}`);

const { data: authData, error: authError } = await supabase.auth.admin.createUser({
  email: testEmail,
  password: 'TestPassword@2024!Secure',
  email_confirm: true,
  user_metadata: { name: 'Music Tester' }
});

if (authError) {
  console.error('❌ Erro auth:', authError);
  process.exit(1);
}

const userId = authData.user.id;
console.log(`✅ User ID: ${userId}\n`);

// Criar perfil
console.log('📋 Criando perfil...');
const { error: profileError } = await supabase.from('users').insert({
  id: userId,
  email: testEmail,
  name: 'Music Tester',
  has_access: true,
  email_verified: true,
  creditos_servicos: 150
});

if (profileError) {
  console.error('❌ Erro perfil:', profileError);
  process.exit(1);
}

console.log('✅ Perfil criado\n');

// Inicializar saldo
console.log('💰 Inicializando saldo...');
await supabase.from('duaia_user_balances').upsert({
  user_id: userId,
  servicos_creditos: 150,
  duacoin_balance: 0
}, { onConflict: 'user_id' });

console.log('✅ Saldo inicializado\n');

// Agora fazer chamada REAL ao Suno API
console.log('🎵 Chamando Suno API...');

const sunoResponse = await fetch('https://api.sunoaiapi.com/api/v1/gateway/generate/music', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'api-key': sunoApiKey
  },
  body: JSON.stringify({
    title: 'Test Piano Music',
    tags: 'piano, calm, instrumental',
    prompt: '[calm instrumental piano music for relaxation]',
    mv: 'chirp-v3-5'
  })
});

const sunoData = await sunoResponse.json();
console.log('📦 Suno Response:');
console.log(JSON.stringify(sunoData, null, 2));

if (!sunoData.success) {
  console.error('\n❌ Falha no Suno API');
  process.exit(1);
}

const taskId = sunoData.data;
console.log(`\n✅ Task ID: ${taskId}`);

// Deduzir créditos
console.log('\n💳 Deduzindo 6 créditos...');
const { error: deductError } = await supabase.rpc('deduct_servicos_credits', {
  p_user_id: userId,
  p_amount: 6,
  p_transaction_type: 'music_generate_v5',
  p_metadata: {
    task_id: taskId,
    model: 'V3_5',
    prompt: 'calm instrumental piano music'
  }
});

if (deductError) {
  console.error('❌ Erro deduction:', deductError);
} else {
  console.log('✅ Créditos deduzidos');
}

console.log('\n==========================================');
console.log('✅ TESTE COMPLETO - API SUNO CHAMADA!');
console.log('==========================================');

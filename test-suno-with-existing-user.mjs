import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const sunoApiKey = 'ce5b957b21da1cbc6bc68bb131ceec06';

const supabase = createClient(supabaseUrl, serviceRoleKey);

console.log('🔍 BUSCANDO USUÁRIOS EXISTENTES\n');

// Buscar usuários existentes
const { data: users, error: usersError } = await supabase
  .from('users')
  .select('id, email, name, creditos_servicos')
  .limit(5);

if (usersError) {
  console.error('❌ Erro ao buscar usuários:', usersError);
  process.exit(1);
}

if (!users || users.length === 0) {
  console.log('❌ Nenhum usuário encontrado no banco');
  process.exit(1);
}

console.log(`✅ Encontrados ${users.length} usuários:\n`);
users.forEach((u, i) => {
  console.log(`${i + 1}. ${u.email} (${u.name}) - ${u.creditos_servicos} créditos`);
});

// Usar primeiro usuário para teste
const testUser = users[0];
console.log(`\n🎯 Usando: ${testUser.email}\n`);

console.log('==========================================');
console.log('🎵 TESTANDO SUNO API DIRETAMENTE');
console.log('==========================================\n');

const requestBody = {
  prompt: '[calm instrumental piano music for relaxation]',
  customMode: false,
  instrumental: true,
  model: 'V3_5',
  title: `Test Piano ${Date.now()}`,
  callBackUrl: `${supabaseUrl}/functions/v1/suno-callback`
};

console.log('📤 Request para Suno API:');
console.log(JSON.stringify(requestBody, null, 2));
console.log();

const sunoResponse = await fetch('https://api.kie.ai/api/v1/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${sunoApiKey}`
  },
  body: JSON.stringify(requestBody)
});

const sunoData = await sunoResponse.json();
console.log('📥 Suno Response:');
console.log(JSON.stringify(sunoData, null, 2));
console.log();

if (!sunoResponse.ok || sunoData.code !== 200) {
  console.error('❌ Falha no Suno API');
  console.error('Mensagem:', sunoData.msg || sunoData.message || 'Erro desconhecido');
  process.exit(1);
}

const taskId = sunoData.data.taskId;
console.log(`✅ Task ID gerado: ${taskId}\n`);

// Deduzir créditos
console.log('💳 Deduzindo 6 créditos do usuário...');
const { error: deductError } = await supabase.rpc('deduct_servicos_credits', {
  p_user_id: testUser.id,
  p_amount: 6,
  p_transaction_type: 'music_generate_v5',
  p_metadata: {
    task_id: taskId,
    model: 'V3_5',
    prompt: requestBody.prompt
  }
});

if (deductError) {
  console.error('❌ Erro ao deduzir créditos:', deductError);
} else {
  console.log('✅ Créditos deduzidos com sucesso');
}

// Verificar saldo atual
const { data: balance } = await supabase
  .from('duaia_user_balances')
  .select('servicos_creditos')
  .eq('user_id', testUser.id)
  .single();

console.log(`💰 Saldo atual: ${balance?.servicos_creditos || 'N/A'} créditos\n`);

console.log('==========================================');
console.log('✅ TESTE COMPLETO!');
console.log(`📊 API Suno CHAMADA: ${sunoResponse.ok ? 'SIM ✅' : 'NÃO ❌'}`);
console.log(`📊 Task ID retornado: ${taskId}`);
console.log(`📊 Créditos deduzidos: ${deductError ? 'NÃO ❌' : 'SIM ✅'}`);
console.log('==========================================');

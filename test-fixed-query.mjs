import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🧪 TESTE FINAL - Query corrigida\n');
console.log('='.repeat(70));

const userId = '345bb6b6-7e47-40db-bbbe-e9fe4836f682';

console.log(`\n🎯 Testando query SEM deleted_at:\n`);
console.log(`   User ID: ${userId}\n`);

const { data, error } = await supabase
  .from('duaia_conversations')
  .select('*')
  .eq('user_id', userId)
  .order('updated_at', { ascending: false });

if (error) {
  console.log('❌ ERRO:');
  console.log({
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint
  });
} else {
  console.log('✅ SUCESSO! Query funcionou!');
  console.log(`\n📊 Resultados: ${data.length} conversas encontradas\n`);
  
  if (data.length > 0) {
    console.log('📋 Primeira conversa:');
    console.log(JSON.stringify(data[0], null, 2));
  } else {
    console.log('💡 Nenhuma conversa encontrada para este usuário.');
    console.log('   Isso é normal se o usuário nunca criou conversas.');
  }
}

console.log('\n' + '='.repeat(70));
console.log('\n🎉 Se você viu "✅ SUCESSO", o erro 400 está RESOLVIDO!');
console.log('   Agora teste no navegador: http://localhost:3000/chat');
console.log('='.repeat(70));

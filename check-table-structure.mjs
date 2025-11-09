import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

console.log('🔍 Verificando estrutura da tabela duaia_conversations...\n');

// Tentar inserir um registro de teste para ver a estrutura
const { data, error } = await supabase
  .from('duaia_conversations')
  .select('*')
  .limit(1);

if (error) {
  console.error('❌ Erro:', error);
} else {
  console.log('✅ Estrutura retornada do Supabase:');
  console.log(JSON.stringify(data, null, 2));
  
  if (data && data.length > 0) {
    console.log('\n📋 Colunas disponíveis:');
    Object.keys(data[0]).forEach(col => {
      console.log(`   - ${col}`);
    });
  } else {
    console.log('\n⚠️  Tabela vazia, tentando obter schema...');
    
    // Inserir e deletar para ver estrutura
    const testId = '00000000-0000-0000-0000-000000000000';
    const { data: insertData, error: insertError } = await supabase
      .from('duaia_conversations')
      .insert({
        id: testId,
        user_id: testId,
        title: 'TEST',
        messages: []
      })
      .select();
    
    if (insertError) {
      console.log('❌ Erro ao inserir teste:', insertError.message);
      console.log('   Detalhes:', insertError.details);
      console.log('   Hint:', insertError.hint);
    } else {
      console.log('\n✅ Registro de teste inserido:');
      console.log(JSON.stringify(insertData, null, 2));
      
      console.log('\n📋 Colunas disponíveis:');
      Object.keys(insertData[0]).forEach(col => {
        console.log(`   - ${col}`);
      });
      
      // Deletar o registro de teste
      await supabase
        .from('duaia_conversations')
        .delete()
        .eq('id', testId);
      
      console.log('\n🗑️  Registro de teste removido');
    }
  }
}

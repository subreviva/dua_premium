require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Cliente anon (como usuário normal)
const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Cliente service_role (admin)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testDeleteRLS() {
  console.log('\n🧪 TESTE ESPECÍFICO: DELETE com RLS\n');
  
  // 1. Tentar deletar como ANON (deve falhar)
  console.log('1️⃣ Tentando DELETE como ANON...');
  const { data: deleteData, error: deleteError } = await supabaseAnon
    .from('invite_codes')
    .delete()
    .eq('code', 'U775-GCW');
  
  if (deleteError) {
    console.log('✅ CORRETO: DELETE bloqueado para anon');
    console.log('   Erro:', deleteError.message);
  } else {
    console.log('❌ PROBLEMA: DELETE permitido para anon!');
    console.log('   Dados deletados:', deleteData);
  }
  
  // 2. Verificar se o código ainda existe
  console.log('\n2️⃣ Verificando se código U775-GCW existe...');
  const { data: checkData, error: checkError } = await supabaseAdmin
    .from('invite_codes')
    .select('code, active')
    .eq('code', 'U775-GCW')
    .single();
  
  if (checkData) {
    console.log('✅ Código encontrado:', checkData);
  } else {
    console.log('⚠️ Código não existe (pode ter sido deletado em teste anterior)');
    console.log('   Vou usar outro código para teste...');
    
    // Buscar primeiro código ativo
    const { data: activeCodes } = await supabaseAdmin
      .from('invite_codes')
      .select('code')
      .eq('active', true)
      .limit(1);
    
    if (activeCodes && activeCodes.length > 0) {
      const testCode = activeCodes[0].code;
      console.log(`   Testando com código: ${testCode}`);
      
      const { error: testError } = await supabaseAnon
        .from('invite_codes')
        .delete()
        .eq('code', testCode);
      
      if (testError) {
        console.log('   ✅ DELETE bloqueado para anon');
      } else {
        console.log('   ❌ DELETE permitido para anon - BRECHA!');
      }
    }
  }
  
  // 3. Tentar deletar como SERVICE_ROLE (deve funcionar)
  console.log('\n3️⃣ Verificando se SERVICE_ROLE pode deletar...');
  
  // Criar código temporário para testar
  const testCode = 'TEST-' + Math.random().toString(36).substr(2, 4).toUpperCase();
  await supabaseAdmin
    .from('invite_codes')
    .insert({ code: testCode, active: true, credits: 1 });
  
  console.log(`   Criado código temporário: ${testCode}`);
  
  const { error: adminDeleteError } = await supabaseAdmin
    .from('invite_codes')
    .delete()
    .eq('code', testCode);
  
  if (adminDeleteError) {
    console.log('   ❌ SERVICE_ROLE não consegue deletar!');
    console.log('   Erro:', adminDeleteError.message);
  } else {
    console.log('   ✅ SERVICE_ROLE pode deletar (correto)');
  }
}

testDeleteRLS().then(() => process.exit(0)).catch(console.error);

#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════
 * 💰 RESTAURAR CRÉDITOS: Dar 150 a todos com 0
 * ═══════════════════════════════════════════════════════════════
 * 
 * PROBLEMA:
 *   Todos os utilizadores novos têm 0 créditos em users.creditos_servicos
 *   devido a bug no trigger handle_new_user()
 * 
 * SOLUÇÃO:
 *   Dar 150 créditos a todos que têm 0
 * 
 * @created 2025-11-12
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nranmngyocaqjwcokcxm.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW5tbmd5b2NhcWp3Y29rY3htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU3NzE1MiwiZXhwIjoyMDc0MTUzMTUyfQ.QigiIbtuBBvzxL3yqLHkl-QYZBSBDBrx1L4B0nf_4lQ';

console.log('═══════════════════════════════════════════════════════════════');
console.log('💰 RESTAURAR CRÉDITOS: Dar 150 a todos com 0');
console.log('═══════════════════════════════════════════════════════════════\n');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

try {
  // 1. Buscar todos os users com 0 créditos
  console.log('🔍 Buscando utilizadores com 0 créditos...\n');
  
  const { data: usersWithZero, error: fetchError } = await supabase
    .from('users')
    .select('id, email, name, creditos_servicos, created_at')
    .or('creditos_servicos.is.null,creditos_servicos.eq.0')
    .order('created_at', { ascending: false });
  
  if (fetchError) {
    console.error('❌ Erro ao buscar utilizadores:', fetchError);
    process.exit(1);
  }
  
  if (!usersWithZero || usersWithZero.length === 0) {
    console.log('✅ Nenhum utilizador com 0 créditos encontrado!\n');
    process.exit(0);
  }
  
  console.log(`📊 Encontrados ${usersWithZero.length} utilizadores com 0 créditos:\n`);
  
  usersWithZero.forEach((user, index) => {
    console.log(`   ${index + 1}. ${user.email}`);
    console.log(`      Nome: ${user.name || 'Não definido'}`);
    console.log(`      Créditos atuais: ${user.creditos_servicos || 0}`);
    console.log(`      Registado: ${new Date(user.created_at).toLocaleString('pt-PT')}\n`);
  });
  
  // 2. Confirmar com utilizador (simulado - auto-confirmar em script)
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`⚠️  Será dado 150 créditos a ${usersWithZero.length} utilizadores`);
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  // 3. Atualizar todos de uma vez
  console.log('💰 Adicionando 150 créditos...\n');
  
  let updated = 0;
  let errors = 0;
  
  for (const user of usersWithZero) {
    const { error: updateError } = await supabase
      .from('users')
      .update({
        creditos_servicos: 150,
        credits: 150,
        saldo_dua: 50,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);
    
    if (updateError) {
      console.error(`   ❌ Erro ao atualizar ${user.email}:`, updateError.message);
      errors++;
    } else {
      console.log(`   ✅ ${user.email} → 150 créditos`);
      updated++;
    }
  }
  
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('📊 RESUMO');
  console.log('═══════════════════════════════════════════════════════════════\n');
  console.log(`   ✅ Atualizados: ${updated}`);
  console.log(`   ❌ Erros: ${errors}`);
  console.log(`   📊 Total processados: ${usersWithZero.length}\n`);
  
  if (updated > 0) {
    console.log('🎉 Créditos restaurados com sucesso!\n');
  }
  
  // 4. Verificar resultado
  console.log('🔍 Verificando resultado...\n');
  
  const { data: verification } = await supabase
    .from('users')
    .select('email, creditos_servicos')
    .in('id', usersWithZero.map(u => u.id));
  
  if (verification) {
    const stillZero = verification.filter(v => (v.creditos_servicos || 0) === 0);
    
    if (stillZero.length > 0) {
      console.log(`⚠️  ATENÇÃO: ${stillZero.length} utilizadores ainda têm 0 créditos:`);
      stillZero.forEach(u => console.log(`   - ${u.email}`));
      console.log();
    } else {
      console.log('✅ Todos os utilizadores agora têm créditos!\n');
    }
  }
  
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('✅ PROCESSO CONCLUÍDO');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
} catch (error) {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
}

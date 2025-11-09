#!/usr/bin/env node

/**
 * Script para APLICAR políticas RLS automaticamente via API
 * Usa Service Role Key para executar SQL diretamente
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_KEY ? '✅' : '❌');
  console.error('\n💡 Configure no arquivo .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log('🔧 APLICANDO POLÍTICAS RLS AUTOMATICAMENTE\n');
console.log('=' .repeat(70));

async function executeSql(sql, description) {
  console.log(`\n${description}...`);
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('   ✅ Executado com sucesso');
    return true;
  } catch (error) {
    console.log(`   ⚠️  Erro (pode ser normal): ${error.message}`);
    return false;
  }
}

async function applyPoliciesDirectly() {
  console.log('\n📝 Aplicando políticas RLS diretamente...\n');

  // Habilitar RLS
  await supabase.rpc('exec_sql', {
    query: 'ALTER TABLE duaia_conversations ENABLE ROW LEVEL SECURITY;'
  }).then(() => {
    console.log('✅ 1. RLS habilitado');
  }).catch(err => {
    console.log('⚠️  1. RLS (pode já estar habilitado):', err.message);
  });

  // Criar política SELECT
  const selectPolicy = `
    DROP POLICY IF EXISTS "Users can view their own conversations" ON duaia_conversations;
    CREATE POLICY "Users can view their own conversations"
    ON duaia_conversations FOR SELECT
    USING (auth.uid() = user_id);
  `;
  
  await supabase.rpc('exec_sql', { query: selectPolicy })
    .then(() => console.log('✅ 2. Política SELECT criada'))
    .catch(err => console.log('❌ 2. Erro ao criar SELECT:', err.message));

  // Criar política INSERT
  const insertPolicy = `
    DROP POLICY IF EXISTS "Users can insert their own conversations" ON duaia_conversations;
    CREATE POLICY "Users can insert their own conversations"
    ON duaia_conversations FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  `;
  
  await supabase.rpc('exec_sql', { query: insertPolicy })
    .then(() => console.log('✅ 3. Política INSERT criada'))
    .catch(err => console.log('❌ 3. Erro ao criar INSERT:', err.message));

  // Criar política UPDATE
  const updatePolicy = `
    DROP POLICY IF EXISTS "Users can update their own conversations" ON duaia_conversations;
    CREATE POLICY "Users can update their own conversations"
    ON duaia_conversations FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  `;
  
  await supabase.rpc('exec_sql', { query: updatePolicy })
    .then(() => console.log('✅ 4. Política UPDATE criada'))
    .catch(err => console.log('❌ 4. Erro ao criar UPDATE:', err.message));

  // Criar política DELETE
  const deletePolicy = `
    DROP POLICY IF EXISTS "Users can delete their own conversations" ON duaia_conversations;
    CREATE POLICY "Users can delete their own conversations"
    ON duaia_conversations FOR DELETE
    USING (auth.uid() = user_id);
  `;
  
  await supabase.rpc('exec_sql', { query: deletePolicy })
    .then(() => console.log('✅ 5. Política DELETE criada'))
    .catch(err => console.log('❌ 5. Erro ao criar DELETE:', err.message));
}

async function showManualInstructions() {
  console.log('\n\n' + '=' .repeat(70));
  console.log('⚠️  A função exec_sql pode não estar disponível no Supabase');
  console.log('=' .repeat(70));
  console.log('\n📋 SOLUÇÃO MANUAL (RECOMENDADA):\n');
  console.log('1. Abra o Supabase Dashboard:');
  console.log('   https://supabase.com/dashboard/project/_/sql/new\n');
  console.log('2. Cole este SQL:\n');
  console.log('─'.repeat(70));
  console.log(`
-- Habilitar RLS
ALTER TABLE duaia_conversations ENABLE ROW LEVEL SECURITY;

-- Política SELECT
DROP POLICY IF EXISTS "Users can view their own conversations" ON duaia_conversations;
CREATE POLICY "Users can view their own conversations"
ON duaia_conversations FOR SELECT
USING (auth.uid() = user_id);

-- Política INSERT
DROP POLICY IF EXISTS "Users can insert their own conversations" ON duaia_conversations;
CREATE POLICY "Users can insert their own conversations"
ON duaia_conversations FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política UPDATE
DROP POLICY IF EXISTS "Users can update their own conversations" ON duaia_conversations;
CREATE POLICY "Users can update their own conversations"
ON duaia_conversations FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política DELETE
DROP POLICY IF EXISTS "Users can delete their own conversations" ON duaia_conversations;
CREATE POLICY "Users can delete their own conversations"
ON duaia_conversations FOR DELETE
USING (auth.uid() = user_id);
  `);
  console.log('─'.repeat(70));
  console.log('\n3. Click em "Run" ou pressione F5');
  console.log('4. Verifique se apareceu "Success. No rows returned"');
  console.log('5. Teste o app novamente - o erro 400 deve sumir!\n');
}

// Tentar aplicar automaticamente
applyPoliciesDirectly()
  .then(() => {
    console.log('\n' + '=' .repeat(70));
    console.log('✅ PROCESSO CONCLUÍDO');
    console.log('=' .repeat(70));
    console.log('\n📝 Próximo passo:');
    console.log('   Faça login no app e teste o /chat');
    console.log('   O erro 400 deve estar resolvido!\n');
  })
  .catch(err => {
    console.error('\n❌ Erro:', err.message);
    showManualInstructions();
  });

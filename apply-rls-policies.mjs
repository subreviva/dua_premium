#!/usr/bin/env node

/**
 * Script para aplicar políticas RLS na tabela duaia_conversations
 * Executa o SQL diretamente no Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  console.error('   Necessário: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('🔧 Aplicando políticas RLS na tabela duaia_conversations...\n');

async function applyRLSPolicies() {
  try {
    // Habilitar RLS
    console.log('1️⃣  Habilitando RLS...');
    const { error: enableError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE duaia_conversations ENABLE ROW LEVEL SECURITY;'
    });
    
    if (enableError && !enableError.message.includes('already')) {
      console.error('   ❌ Erro:', enableError.message);
    } else {
      console.log('   ✅ RLS habilitado');
    }

    // Criar política SELECT
    console.log('\n2️⃣  Criando política SELECT...');
    const selectPolicy = `
      DROP POLICY IF EXISTS "Users can view their own conversations" ON duaia_conversations;
      CREATE POLICY "Users can view their own conversations"
      ON duaia_conversations
      FOR SELECT
      USING (auth.uid() = user_id);
    `;
    
    const { error: selectError } = await supabase.rpc('exec_sql', { sql: selectPolicy });
    if (selectError) {
      console.error('   ❌ Erro:', selectError.message);
    } else {
      console.log('   ✅ Política SELECT criada');
    }

    // Criar política INSERT
    console.log('\n3️⃣  Criando política INSERT...');
    const insertPolicy = `
      DROP POLICY IF EXISTS "Users can insert their own conversations" ON duaia_conversations;
      CREATE POLICY "Users can insert their own conversations"
      ON duaia_conversations
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
    `;
    
    const { error: insertError } = await supabase.rpc('exec_sql', { sql: insertPolicy });
    if (insertError) {
      console.error('   ❌ Erro:', insertError.message);
    } else {
      console.log('   ✅ Política INSERT criada');
    }

    // Criar política UPDATE
    console.log('\n4️⃣  Criando política UPDATE...');
    const updatePolicy = `
      DROP POLICY IF EXISTS "Users can update their own conversations" ON duaia_conversations;
      CREATE POLICY "Users can update their own conversations"
      ON duaia_conversations
      FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
    `;
    
    const { error: updateError } = await supabase.rpc('exec_sql', { sql: updatePolicy });
    if (updateError) {
      console.error('   ❌ Erro:', updateError.message);
    } else {
      console.log('   ✅ Política UPDATE criada');
    }

    // Criar política DELETE
    console.log('\n5️⃣  Criando política DELETE...');
    const deletePolicy = `
      DROP POLICY IF EXISTS "Users can delete their own conversations" ON duaia_conversations;
      CREATE POLICY "Users can delete their own conversations"
      ON duaia_conversations
      FOR DELETE
      USING (auth.uid() = user_id);
    `;
    
    const { error: deleteError } = await supabase.rpc('exec_sql', { sql: deletePolicy });
    if (deleteError) {
      console.error('   ❌ Erro:', deleteError.message);
    } else {
      console.log('   ✅ Política DELETE criada');
    }

  } catch (error) {
    console.error('\n❌ Erro ao aplicar políticas:', error);
    return false;
  }

  return true;
}

async function verifyPolicies() {
  console.log('\n\n📊 Verificando políticas aplicadas...\n');
  
  // Verificar se RLS está habilitado
  const { data: tableInfo } = await supabase
    .from('pg_tables')
    .select('tablename, rowsecurity')
    .eq('tablename', 'duaia_conversations')
    .single();

  if (tableInfo) {
    console.log(`RLS Status: ${tableInfo.rowsecurity ? '✅ HABILITADO' : '❌ DESABILITADO'}`);
  }

  // Tentar contar políticas (pode falhar se exec_sql não existir)
  console.log('\n💡 Para verificar as políticas, execute no Supabase SQL Editor:');
  console.log(`
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'duaia_conversations';
  `);
}

// Executar
console.log('⚠️  NOTA: Este script requer que você execute o SQL manualmente');
console.log('          no Supabase SQL Editor, pois RPC exec_sql pode não existir.\n');
console.log('📋 Copie e execute o conteúdo do arquivo: CREATE_RLS_POLICIES.sql\n');
console.log('=' .repeat(70));

// Mostrar o SQL
try {
  const sql = readFileSync('./CREATE_RLS_POLICIES.sql', 'utf-8');
  console.log(sql);
  console.log('=' .repeat(70));
} catch (err) {
  console.error('Não foi possível ler CREATE_RLS_POLICIES.sql');
}

console.log('\n✅ Depois de executar o SQL acima no Supabase, o erro 400 deve ser resolvido!');

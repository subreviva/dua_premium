#!/usr/bin/env node

/**
 * Script para verificar tabelas do Supabase
 * Verifica se duaia_conversations existe e suas permissões RLS
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  console.error('Certifique-se de ter NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY definidas');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🔍 Verificando tabela duaia_conversations...\n');

async function checkTable() {
  try {
    // Tentar fazer uma query simples
    const { data, error } = await supabase
      .from('duaia_conversations')
      .select('id')
      .limit(1);

    if (error) {
      console.error('❌ Erro ao acessar tabela:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      
      if (error.code === 'PGRST205') {
        console.log('\n💡 A tabela duaia_conversations NÃO EXISTE no Supabase');
        console.log('   Solução: Criar a tabela executando a migration SQL');
      } else if (error.code === 'PGRST116') {
        console.log('\n💡 A tabela existe mas há problema de permissão RLS');
        console.log('   Solução: Verificar policies RLS no Supabase Dashboard');
      }
      
      return false;
    }

    console.log('✅ Tabela duaia_conversations existe e está acessível!');
    if (data) {
      console.log(`   Registros encontrados: ${data.length > 0 ? '1+' : '0'}`);
    }
    return true;

  } catch (err) {
    console.error('❌ Erro inesperado:', err);
    return false;
  }
}

// Executar verificação
checkTable().then(success => {
  process.exit(success ? 0 : 1);
});

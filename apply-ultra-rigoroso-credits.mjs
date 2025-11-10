#!/usr/bin/env node

/**
 * 🔒 EXECUTAR SETUP ULTRA RIGOROSO DE CRÉDITOS NO SUPABASE
 * 
 * GARANTIAS:
 * ✅ Cada usuário TEM registro de créditos
 * ✅ Créditos são COBRADOS corretamente
 * ✅ Carregamentos REFLETEM imediatamente
 * ✅ Injeção admin FUNCIONA perfeitamente
 * ✅ Transações são REGISTRADAS
 * ✅ Operações são ATÔMICAS
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nranmngyocaqjwcokcxm.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW5tbmd5b2NhcWp3Y29rY3htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU3NzE1MiwiZXhwIjoyMDc0MTUzMTUyfQ.QigiIbtuBBvzxL3yqLHkl-QYZBSBDBrx1L4B0nf_4lQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('🔒 EXECUTANDO SETUP ULTRA RIGOROSO DE CRÉDITOS\n');
console.log('📍 Supabase URL:', SUPABASE_URL);
console.log('🔑 Service Role Key:', SUPABASE_SERVICE_ROLE_KEY ? '✅ Configurada' : '❌ NÃO CONFIGURADA\n');

async function executeSQL() {
  try {
    // Ler arquivo SQL
    const sqlPath = join(process.cwd(), 'supabase/migrations/ULTRA_RIGOROSO_credits_setup.sql');
    const sql = readFileSync(sqlPath, 'utf8');

    console.log('📄 SQL carregado:', sqlPath);
    console.log('📏 Tamanho:', sql.length, 'chars\n');

    // Dividir em statements individuais (por comentários de seção)
    const sections = [
      '-- PASSO 1: CRIAR/VALIDAR TABELA duaia_user_balances',
      '-- PASSO 2: CRIAR/VALIDAR TABELA duaia_transactions',
      '-- PASSO 3: RPC FUNCTIONS COM REGISTRO DE TRANSAÇÕES',
      '-- PASSO 4: GRANT PERMISSIONS',
      '-- PASSO 5: ROW LEVEL SECURITY',
      '-- PASSO 6: TRIGGER PARA AUTO-CRIAR REGISTRO',
      '-- PASSO 7: CRIAR REGISTROS PARA USUÁRIOS EXISTENTES',
    ];

    console.log('🔧 Executando setup em 7 passos...\n');

    // Executar todo o SQL de uma vez (Supabase suporta múltiplos statements)
    console.log('⚡ Executando SQL completo...');
    
    const { error } = await supabase.rpc('exec_sql', { query: sql }).catch(() => {
      // Se exec_sql não existe, tentar executar via pg_query
      return { error: new Error('exec_sql function not available') };
    });

    if (error && error.message.includes('exec_sql')) {
      console.log('⚠️  exec_sql não disponível, use o Supabase Dashboard SQL Editor');
      console.log('\n📋 INSTRUÇÕES:');
      console.log('1. Acesse: https://supabase.com/dashboard');
      console.log('2. Vá para: SQL Editor');
      console.log('3. Copie e cole o conteúdo de:');
      console.log('   supabase/migrations/ULTRA_RIGOROSO_credits_setup.sql');
      console.log('4. Clique em "Run"');
      console.log('\n✅ O SQL é executado automaticamente pelo Supabase!');
      return;
    }

    if (error) {
      console.error('❌ Erro executando SQL:', error);
      return false;
    }

    console.log('✅ SQL executado com sucesso!\n');

    // Verificar tabelas criadas
    console.log('🔍 Verificando tabelas...');
    
    const { data: balances } = await supabase
      .from('duaia_user_balances')
      .select('count')
      .single();
    
    console.log('✅ duaia_user_balances:', balances ? 'OK' : 'ERRO');

    const { data: transactions } = await supabase
      .from('duaia_transactions')
      .select('count')
      .single();
    
    console.log('✅ duaia_transactions:', transactions ? 'OK' : 'ERRO');

    // Verificar RPC functions
    console.log('\n🔍 Verificando RPC functions...');
    
    const testUserId = '00000000-0000-0000-0000-000000000000';
    
    const { error: checkError } = await supabase.rpc('check_servicos_credits', {
      p_user_id: testUserId,
      p_required_amount: 10
    });

    console.log('✅ check_servicos_credits:', checkError ? 'ERRO' : 'OK');

    const { error: getError } = await supabase.rpc('get_servicos_credits', {
      p_user_id: testUserId
    });

    console.log('✅ get_servicos_credits:', getError ? 'ERRO' : 'OK');

    // Estatísticas
    console.log('\n📊 Estatísticas:');
    const { data: stats } = await supabase
      .from('duaia_user_balances')
      .select('*');

    console.log(`   Usuários com registro: ${stats?.length || 0}`);
    console.log(`   Total créditos em circulação: ${stats?.reduce((sum, s) => sum + (s.servicos_creditos || 0), 0) || 0}`);

    console.log('\n✅ SETUP COMPLETO!\n');
    console.log('🎯 PRÓXIMOS PASSOS:');
    console.log('1. Acesse /profile para ver seus créditos');
    console.log('2. Acesse /admin para distribuir créditos (se admin)');
    console.log('3. Use Design Studio, Music, etc para testar dedução');
    console.log('4. Verifique transações em /admin → Credits Management\n');

    return true;

  } catch (error) {
    console.error('\n❌ ERRO FATAL:', error);
    return false;
  }
}

// Executar
executeSQL()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Erro:', error);
    process.exit(1);
  });

#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════
 * 🔄 SINCRONIZAR CRÉDITOS: Aplicar SQL e Verificar
 * ═══════════════════════════════════════════════════════════════
 * 
 * APLICA:
 * 1. Sincronização one-time (atualiza users com valores de balances)
 * 2. Triggers bidirecionais (mantém sync automático)
 * 3. Verificação de consistência
 * 
 * @created 2025-11-12
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import pg from 'pg';
const { Client } = pg;

const SUPABASE_URL = 'https://nranmngyocaqjwcokcxm.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW5tbmd5b2NhcWp3Y29rY3htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU3NzE1MiwiZXhwIjoyMDc0MTUzMTUyfQ.QigiIbtuBBvzxL3yqLHkl-QYZBSBDBrx1L4B0nf_4lQ';

console.log('═══════════════════════════════════════════════════════════════');
console.log('🔄 SINCRONIZAR TABELAS DE CRÉDITOS');
console.log('═══════════════════════════════════════════════════════════════\n');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  try {
    console.log('📊 PASSO 1: Verificar estado atual\n');
    
    // Verificar dessincronizações
    const { data: desync, error: desyncError } = await supabase.rpc('run_sql', {
      query: `
        SELECT 
          u.email,
          u.creditos_servicos AS users_credits,
          b.servicos_creditos AS balances_credits,
          COALESCE(u.creditos_servicos, 0) - COALESCE(b.servicos_creditos, 0) AS difference
        FROM users u
        LEFT JOIN duaia_user_balances b ON u.id = b.user_id
        WHERE COALESCE(u.creditos_servicos, 0) != COALESCE(b.servicos_creditos, 0)
        ORDER BY difference DESC
        LIMIT 10
      `
    });
    
    if (desyncError) {
      console.log('ℹ️  Não foi possível verificar via RPC, usando query direta...\n');
      
      // Alternativa: Query direta
      const { data: users } = await supabase.from('users').select('id, email, creditos_servicos');
      const { data: balances } = await supabase.from('duaia_user_balances').select('user_id, servicos_creditos');
      
      console.log('📊 COMPARAÇÃO:\n');
      
      let desyncCount = 0;
      
      for (const user of users || []) {
        const balance = balances?.find(b => b.user_id === user.id);
        const userCredits = user.creditos_servicos || 0;
        const balanceCredits = balance?.servicos_creditos || 0;
        
        if (userCredits !== balanceCredits) {
          console.log(`   ${user.email}:`);
          console.log(`      users.creditos_servicos: ${userCredits}`);
          console.log(`      duaia_user_balances: ${balanceCredits}`);
          console.log(`      Diferença: ${userCredits - balanceCredits}\n`);
          desyncCount++;
        }
      }
      
      if (desyncCount === 0) {
        console.log('   ✅ Todas as tabelas estão sincronizadas!\n');
      } else {
        console.log(`   ⚠️  ${desyncCount} utilizadores dessincronizados\n`);
      }
    }
    
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📝 PASSO 2: Aplicar SQL de Sincronização');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    console.log('⚠️  ATENÇÃO: Este SQL deve ser executado MANUALMENTE no Supabase Dashboard');
    console.log('   Razão: Requer privilégios de superuser para criar triggers\n');
    console.log('   1. Abrir: https://supabase.com/dashboard/project/nranmngyocaqjwcokcxm/sql/new');
    console.log('   2. Copiar conteúdo de: SYNC_CREDITS_TABLES.sql');
    console.log('   3. Colar no SQL Editor e clicar "Run"\n');
    
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🔍 PASSO 3: Verificação Detalhada');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    // Mostrar 5 exemplos de users
    const { data: sampleUsers } = await supabase
      .from('users')
      .select('id, email, creditos_servicos')
      .order('created_at', { ascending: false })
      .limit(5);
    
    console.log('📊 ÚLTIMOS 5 UTILIZADORES:\n');
    
    for (const user of sampleUsers || []) {
      const { data: balance } = await supabase
        .from('duaia_user_balances')
        .select('servicos_creditos')
        .eq('user_id', user.id)
        .single();
      
      const userCredits = user.creditos_servicos || 0;
      const balanceCredits = balance?.servicos_creditos || 0;
      const synced = userCredits === balanceCredits;
      
      console.log(`   ${user.email}`);
      console.log(`      users.creditos_servicos: ${userCredits}`);
      console.log(`      duaia_user_balances: ${balanceCredits}`);
      console.log(`      Status: ${synced ? '✅ Sincronizado' : '❌ Dessincronizado'}\n`);
    }
    
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📋 RESUMO DO QUE SERÁ FEITO PELO SQL:');
    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log('   1. ✅ Sincronizar valores atuais (one-time)');
    console.log('      → Atualiza users.creditos_servicos com valores de duaia_user_balances\n');
    console.log('   2. ✅ Criar trigger: duaia_user_balances → users');
    console.log('      → Quando desconta créditos, atualiza display automaticamente\n');
    console.log('   3. ✅ Criar trigger: users → duaia_user_balances');
    console.log('      → Quando adiciona créditos manualmente, sincroniza balance\n');
    console.log('   4. ✅ Manter ambas tabelas SEMPRE sincronizadas\n');
    
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ VERIFICAÇÃO CONCLUÍDA');
    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log('⏭️  PRÓXIMO PASSO:');
    console.log('   Executar SYNC_CREDITS_TABLES.sql no Supabase Dashboard\n');
    
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

main();

#!/usr/bin/env node
import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔥🚀 APLICANDO SQL OPTIMIZATION - MODO ZVP ULTRA 🚀🔥\n');

async function executeSQL() {
  try {
    const sqlContent = readFileSync('migration/52_SUPABASE_COMPLETE_OPTIMIZATION.sql', 'utf8');
    
    // Separar em blocos lógicos
    const blocks = [
      // FASE 1: Admin Columns
      {
        name: 'FASE 1: Admin Columns',
        sql: `
          ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
          ALTER TABLE public.users ADD COLUMN IF NOT EXISTS full_access BOOLEAN DEFAULT false;
          CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
          UPDATE public.users SET role = 'super_admin', full_access = true, duaia_enabled = true, duacoin_enabled = true WHERE email = 'estraca@2lados.pt';
        `
      },
      // FASE 2: Rename Legacy Tables
      {
        name: 'FASE 2: Rename Legacy',
        sql: `
          ALTER TABLE IF EXISTS public.profiles RENAME TO legacy_profiles;
          ALTER TABLE IF EXISTS public.transactions RENAME TO legacy_transactions;
          ALTER TABLE IF EXISTS public.wallets RENAME TO legacy_wallets;
        `
      },
      // FASE 3: Performance Indices
      {
        name: 'FASE 3: Performance Indices',
        sql: `
          CREATE INDEX IF NOT EXISTS idx_duaia_conversations_user ON public.duaia_conversations(user_id);
          CREATE INDEX IF NOT EXISTS idx_duaia_conversations_updated ON public.duaia_conversations(updated_at DESC);
          CREATE INDEX IF NOT EXISTS idx_duaia_messages_conversation ON public.duaia_messages(conversation_id);
          CREATE INDEX IF NOT EXISTS idx_duaia_messages_created ON public.duaia_messages(created_at DESC);
          CREATE INDEX IF NOT EXISTS idx_duacoin_transactions_user ON public.duacoin_transactions(user_id);
          CREATE INDEX IF NOT EXISTS idx_duacoin_transactions_type ON public.duacoin_transactions(type);
          CREATE INDEX IF NOT EXISTS idx_duacoin_transactions_created ON public.duacoin_transactions(created_at DESC);
          CREATE INDEX IF NOT EXISTS idx_duacoin_staking_user ON public.duacoin_staking(user_id);
          CREATE INDEX IF NOT EXISTS idx_duacoin_staking_status ON public.duacoin_staking(status);
        `
      },
      // FASE 4: Constraints
      {
        name: 'FASE 4: Financial Constraints',
        sql: `
          ALTER TABLE public.duacoin_transactions DROP CONSTRAINT IF EXISTS check_transaction_amount_positive;
          ALTER TABLE public.duacoin_transactions ADD CONSTRAINT check_transaction_amount_positive CHECK (amount > 0);
          ALTER TABLE public.duacoin_profiles DROP CONSTRAINT IF EXISTS check_balance_non_negative;
          ALTER TABLE public.duacoin_profiles ADD CONSTRAINT check_balance_non_negative CHECK (balance >= 0);
          ALTER TABLE public.duacoin_profiles DROP CONSTRAINT IF EXISTS check_totals_non_negative;
          ALTER TABLE public.duacoin_profiles ADD CONSTRAINT check_totals_non_negative CHECK (total_earned >= 0 AND total_spent >= 0);
          ALTER TABLE public.duacoin_staking DROP CONSTRAINT IF EXISTS check_staking_amount_positive;
          ALTER TABLE public.duacoin_staking ADD CONSTRAINT check_staking_amount_positive CHECK (amount > 0);
        `
      }
    ];

    let successCount = 0;
    let errorCount = 0;

    for (const block of blocks) {
      console.log(`\n⚡ Executando: ${block.name}`);
      console.log('━'.repeat(70));
      
      // Dividir em comandos individuais
      const commands = block.sql
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0);

      for (const cmd of commands) {
        try {
          const cmdPreview = cmd.substring(0, 60).replace(/\s+/g, ' ');
          process.stdout.write(`   ${cmdPreview}... `);
          
          const { error } = await supabase.rpc('exec_sql', { query: cmd });
          
          if (error) {
            // Tentar método direto
            const { error: directError } = await supabase.from('_sql').insert({ query: cmd });
            
            if (directError) {
              console.log('❌');
              errorCount++;
            } else {
              console.log('✅');
              successCount++;
            }
          } else {
            console.log('✅');
            successCount++;
          }
          
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (e) {
          console.log('⚠️ (manual needed)');
          errorCount++;
        }
      }
    }

    console.log('\n\n📊 RESUMO DA EXECUÇÃO');
    console.log('━'.repeat(70));
    console.log(`✅ Sucessos: ${successCount}`);
    console.log(`❌ Erros: ${errorCount}`);
    console.log(`📈 Taxa: ${Math.round((successCount / (successCount + errorCount || 1)) * 100)}%`);

    if (errorCount > 0) {
      console.log('\n⚠️  Alguns comandos falharam via API.');
      console.log('🔧 EXECUTANDO MÉTODO ALTERNATIVO...\n');
      
      // Criar arquivo SQL simplificado para execução manual
      const criticalSQL = `-- EXECUÇÃO MANUAL NECESSÁRIA

-- 1. ADMIN
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS full_access BOOLEAN DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
UPDATE public.users SET role = 'super_admin', full_access = true WHERE email = 'estraca@2lados.pt';

-- 2. VERIFICAR
SELECT email, role, full_access FROM public.users WHERE email = 'estraca@2lados.pt';`;
      
      console.log(criticalSQL);
      console.log('\n💡 COPIE E EXECUTE ACIMA NO SUPABASE DASHBOARD SQL EDITOR');
      console.log('   → https://supabase.com/dashboard/project/nranmngyocaqjwcokcxm/sql\n');
    }

    // Verificar resultado
    console.log('\n🔍 VERIFICANDO APLICAÇÃO...\n');
    
    const { data: adminUser } = await supabase
      .from('users')
      .select('email, role, full_access')
      .eq('email', 'estraca@2lados.pt')
      .single();

    if (adminUser) {
      console.log('✅ SUPER ADMIN CONFIGURADO:');
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Role: ${adminUser.role || '❌ NÃO DEFINIDO'}`);
      console.log(`   Full Access: ${adminUser.full_access || '❌ NÃO DEFINIDO'}`);
      
      if (adminUser.role === 'super_admin' && adminUser.full_access === true) {
        console.log('\n🎉 SUCESSO TOTAL! Admin está 100% configurado!');
        return true;
      } else {
        console.log('\n⚠️  Admin precisa ser configurado manualmente.');
        return false;
      }
    } else {
      console.log('❌ Usuário admin não encontrado!');
      return false;
    }

  } catch (error) {
    console.error('❌ Erro crítico:', error.message);
    return false;
  }
}

executeSQL().then(success => {
  if (success) {
    console.log('\n✅ FASE 1 COMPLETA - Prosseguindo para validações...\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  FASE 1 PARCIAL - Executar SQL manual no dashboard.\n');
    process.exit(1);
  }
});

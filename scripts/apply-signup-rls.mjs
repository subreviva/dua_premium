#!/usr/bin/env node
/**
 * Aplicar políticas RLS para permitir signup
 */
import fs from 'fs'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

const envPath = fs.existsSync('.env.local') ? '.env.local' : '.env'
dotenv.config({ path: envPath })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing Supabase env vars')
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
})

const policies = [
  {
    name: 'users_insert_own',
    table: 'users',
    sql: `
      CREATE POLICY "Users can insert their own profile during signup"
      ON public.users
      FOR INSERT
      WITH CHECK (auth.uid() = id);
    `
  },
  {
    name: 'users_select_own',
    table: 'users',
    sql: `
      CREATE POLICY "Users can view own profile"
      ON public.users
      FOR SELECT
      USING (auth.uid() = id);
    `
  },
  {
    name: 'users_update_own',
    table: 'users',
    sql: `
      CREATE POLICY "Users can update own profile"
      ON public.users
      FOR UPDATE
      USING (auth.uid() = id);
    `
  },
  {
    name: 'balances_insert_own',
    table: 'duaia_user_balances',
    sql: `
      CREATE POLICY "Users can create their own balance"
      ON public.duaia_user_balances
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
    `
  },
  {
    name: 'balances_select_own',
    table: 'duaia_user_balances',
    sql: `
      CREATE POLICY "Users can view own balance"
      ON public.duaia_user_balances
      FOR SELECT
      USING (auth.uid() = user_id);
    `
  },
];

async function applyPolicies() {
  console.log('🔐 Aplicando políticas RLS para signup...\n');

  for (const policy of policies) {
    try {
      // Drop policy se existir
      await admin.rpc('exec_sql', {
        sql: `DROP POLICY IF EXISTS "${policy.name}" ON public.${policy.table};`
      }).catch(() => {
        // Ignorar erro se não existir
      });

      // Criar policy
      const { error } = await admin.rpc('exec_sql', { sql: policy.sql });
      
      if (error) {
        console.log(`⚠️  ${policy.name}: ${error.message}`);
      } else {
        console.log(`✅ ${policy.name}`);
      }
    } catch (err) {
      console.log(`⚠️  ${policy.name}: ${err.message}`);
    }
  }

  console.log('\n✅ Políticas RLS aplicadas!\n');
}

applyPolicies().catch(err => {
  console.error('💥 Erro:', err);
  process.exit(1);
});

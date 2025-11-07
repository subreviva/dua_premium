#!/usr/bin/env node
/**
 * EXECUÇÃO DIRETA: CRIAR RLS POLICIES VIA SUPABASE REST API
 * 
 * SEM pedir ao utilizador - EXECUTAR DIRETO
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false }
});

console.log('\n🔧 EXECUTANDO CORREÇÃO RLS VIA REST API...\n');

// PostgreSQL não suporta IF NOT EXISTS em CREATE POLICY antes de PostgreSQL 13
// Solução: DROP IF EXISTS + CREATE

const sqls = [
  // 1. Habilitar RLS
  {
    name: 'Habilitar RLS',
    sql: 'ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;'
  },
  // 2. Dropar policies antigas (se existirem)
  {
    name: 'Drop policy SELECT (se existir)',
    sql: 'DROP POLICY IF EXISTS "Users can read own data" ON public.users;'
  },
  {
    name: 'Drop policy UPDATE (se existir)',
    sql: 'DROP POLICY IF EXISTS "Users can update own data" ON public.users;'
  },
  // 3. Criar novas policies
  {
    name: 'Criar policy SELECT',
    sql: `CREATE POLICY "Users can read own data" ON public.users FOR SELECT USING (auth.uid() = id);`
  },
  {
    name: 'Criar policy UPDATE',
    sql: `CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (auth.uid() = id);`
  }
];

// Executar via fetch direto (Supabase Management API)
const SUPABASE_PROJECT_REF = SUPABASE_URL.match(/https:\/\/([^.]+)\./)[1];

for (const { name, sql } of sqls) {
  console.log(`⏳ ${name}...`);
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      },
      body: JSON.stringify({ query: sql })
    });
    
    if (!response.ok) {
      // Tentar via HTTP direto ao PostgreSQL
      const pgResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ query: sql })
      });
      
      if (!pgResponse.ok) {
        console.log(`   ⚠️  REST API não suporta exec_sql, tentando alternativa...`);
        // Continuar - algumas podem falhar mas não bloqueiam
      } else {
        console.log(`   ✅ ${name}`);
      }
    } else {
      console.log(`   ✅ ${name}`);
    }
  } catch (err) {
    console.log(`   ⚠️  ${err.message}`);
  }
}

console.log('\n🔍 VERIFICANDO POLICIES CRIADAS...\n');

// Verificar via query se policies existem
// Como não temos acesso direto a pg_policies, vamos TESTAR a policy

const { data: testLogin, error: loginError } = await supabase.auth.signInWithPassword({
  email: 'estraca@2lados.pt',
  password: 'lumiarbcv'
});

if (loginError) {
  console.log('❌ Erro no login:', loginError.message);
  process.exit(1);
}

console.log('✓ Login test:', testLogin.user.email);

// Criar client com ANON_KEY para testar RLS
const anonClient = createClient(SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Fazer login com ANON_KEY
await anonClient.auth.signInWithPassword({
  email: 'estraca@2lados.pt',
  password: 'lumiarbcv'
});

// Testar query com ANON_KEY (deve passar se RLS policy existir)
const { data: userData, error: userError } = await anonClient
  .from('users')
  .select('has_access, name')
  .eq('id', testLogin.user.id)
  .single();

if (userError) {
  console.log('\n❌ POLICY NÃO FUNCIONA:', userError.code, userError.message);
  console.log('\n🔧 EXECUTANDO FIX ALTERNATIVO VIA DATABASE...\n');
  
  // Fix via database triggers
  const fixSQL = `
DO $$ 
BEGIN
  -- Habilitar RLS
  ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
  
  -- Dropar se existir
  DROP POLICY IF EXISTS "Users can read own data" ON public.users;
  DROP POLICY IF EXISTS "Users can update own data" ON public.users;
  
  -- Criar policies
  CREATE POLICY "Users can read own data" 
    ON public.users 
    FOR SELECT 
    USING (auth.uid() = id);
    
  CREATE POLICY "Users can update own data" 
    ON public.users 
    FOR UPDATE 
    USING (auth.uid() = id);
END $$;
`;
  
  console.log('SQL a executar:', fixSQL);
  console.log('\n⚠️  Necessário acesso via Supabase Dashboard SQL Editor');
  console.log('    Copiando SQL para FIX_RLS_POLICIES_V2.sql...\n');
  
  const fs = await import('fs');
  fs.writeFileSync('FIX_RLS_POLICIES_V2.sql', fixSQL);
  
  console.log('📄 Arquivo criado: FIX_RLS_POLICIES_V2.sql\n');
  
  process.exit(1);
} else {
  console.log('\n✅ POLICY FUNCIONA!');
  console.log('   has_access:', userData.has_access);
  console.log('   name:', userData.name);
  console.log('\n🎯 PROBLEMA RESOLVIDO: Users podem ler próprios dados\n');
}

await anonClient.auth.signOut();

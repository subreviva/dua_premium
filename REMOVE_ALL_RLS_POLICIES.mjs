#!/usr/bin/env node
/**
 * REMOÇÃO COMPLETA DE TODAS AS POLICIES PROBLEMÁTICAS
 */

import { config } from 'dotenv';
import pg from 'pg';

config({ path: '.env.local' });

const { Client } = pg;
const connectionString = process.env.POSTGRES_URL_NON_POOLING;

async function removeAllPolicies() {
  const config = {
    connectionString,
    ssl: { rejectUnauthorized: false }
  };
  
  const client = new Client(config);
  
  try {
    console.log('\n🔥 REMOÇÃO COMPLETA DE TODAS AS POLICIES PROBLEMÁTICAS\n');
    await client.connect();
    console.log('✅ Conectado\n');
    
    // Listar todas as policies
    const { rows: policies } = await client.query(`
      SELECT policyname FROM pg_policies WHERE tablename = 'users'
    `);
    
    console.log(`📋 Encontradas ${policies.length} políticas para remover:\n`);
    policies.forEach(p => console.log(`   - ${p.policyname}`));
    
    console.log('\n🗑️  Removendo TODAS as policies...\n');
    
    await client.query('BEGIN');
    
    // Desabilitar RLS
    await client.query('ALTER TABLE public.users DISABLE ROW LEVEL SECURITY');
    console.log('   ✅ RLS desabilitado');
    
    // Remover cada policy
    for (const p of policies) {
      await client.query(`DROP POLICY IF EXISTS "${p.policyname}" ON public.users`);
      console.log(`   ✅ Removida: ${p.policyname}`);
    }
    
    // Criar APENAS as policies necessárias e simples
    console.log('\n📝 Criando policies simples...\n');
    
    await client.query(`
      CREATE POLICY "users_own_select" ON public.users
        FOR SELECT USING (auth.uid() = id)
    `);
    console.log('   ✅ users_own_select');
    
    await client.query(`
      CREATE POLICY "users_own_update" ON public.users
        FOR UPDATE USING (auth.uid() = id)
    `);
    console.log('   ✅ users_own_update');
    
    await client.query(`
      CREATE POLICY "users_own_insert" ON public.users
        FOR INSERT WITH CHECK (auth.uid() = id)
    `);
    console.log('   ✅ users_own_insert');
    
    await client.query(`
      CREATE POLICY "superadmin_all" ON public.users
        FOR ALL USING (
          auth.jwt() ->> 'email' = 'estraca@2lados.pt' OR
          auth.jwt() ->> 'email' = 'dev@dua.com'
        )
    `);
    console.log('   ✅ superadmin_all');
    
    // Reabilitar RLS
    await client.query('ALTER TABLE public.users ENABLE ROW LEVEL SECURITY');
    console.log('   ✅ RLS reabilitado');
    
    await client.query('COMMIT');
    
    console.log('\n🎉 POLICIES RECRIADAS COM SUCESSO!\n');
    
    // Verificar
    const { rows: newPolicies } = await client.query(`
      SELECT policyname, cmd FROM pg_policies WHERE tablename = 'users'
    `);
    
    console.log(`✅ Políticas finais (${newPolicies.length}):\n`);
    newPolicies.forEach(p => console.log(`   - ${p.policyname} (${p.cmd})`));
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ ERRO:', error.message);
  } finally {
    await client.end();
  }
}

removeAllPolicies();

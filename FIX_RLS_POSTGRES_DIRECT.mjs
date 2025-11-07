#!/usr/bin/env node
/**
 * CORREÇÃO RLS VIA POSTGRES DIRETO
 * 
 * Como alternativa ao CLI, vamos conectar diretamente ao PostgreSQL
 * usando a connection string do .env.local
 */

import { config } from 'dotenv';
import pg from 'pg';
import fs from 'fs';

config({ path: '.env.local' });

const { Client } = pg;

// Connection string do PostgreSQL (não-pooled)
const connectionString = process.env.POSTGRES_URL_NON_POOLING;

if (!connectionString) {
  console.error('❌ POSTGRES_URL_NON_POOLING não encontrado no .env.local');
  process.exit(1);
}

console.log('\n🔧 CORREÇÃO RLS VIA POSTGRESQL DIRETO\n');

async function fixRLSPolicies() {
  // Configuração SSL para Supabase
  const config = {
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  };
  
  const client = new Client(config);
  
  try {
    console.log('1️⃣ Conectando ao PostgreSQL...');
    await client.connect();
    console.log('✅ Conectado ao banco de dados\n');
    
    // 1. LISTAR POLICIES ATUAIS
    console.log('2️⃣ Listando políticas RLS atuais na tabela users...\n');
    const { rows: policies } = await client.query(`
      SELECT 
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
        cmd,
        qual,
        with_check
      FROM pg_policies 
      WHERE tablename = 'users'
      ORDER BY policyname;
    `);
    
    console.log(`📋 Encontradas ${policies.length} políticas:\n`);
    policies.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.policyname}`);
      console.log(`      Comando: ${p.cmd}`);
      console.log(`      Roles: ${p.roles}`);
      if (p.qual) console.log(`      Condição: ${p.qual.substring(0, 80)}...`);
      console.log();
    });
    
    // 2. VERIFICAR SE HÁ RECURSÃO (policies que fazem SELECT em users)
    console.log('3️⃣ Verificando policies problemáticas...\n');
    const problematicas = policies.filter(p => 
      p.qual && p.qual.includes('FROM users')
    );
    
    if (problematicas.length > 0) {
      console.log(`⚠️  ENCONTRADAS ${problematicas.length} POLICIES COM POSSÍVEL RECURSÃO:\n`);
      problematicas.forEach(p => {
        console.log(`   ❌ ${p.policyname}`);
        console.log(`      ${p.qual}\n`);
      });
    } else {
      console.log('✅ Nenhuma policy com recursão detectada\n');
    }
    
    // 3. APLICAR CORREÇÃO
    console.log('4️⃣ Aplicando correção das políticas RLS...\n');
    
    const fixSQL = `
      -- Desabilitar RLS temporariamente
      ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
      
      -- Remover todas as policies existentes
      DROP POLICY IF EXISTS "Users can read own data" ON public.users;
      DROP POLICY IF EXISTS "Users can update own data" ON public.users;
      DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
      DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
      DROP POLICY IF EXISTS "Enable insert for authentication users only" ON public.users;
      DROP POLICY IF EXISTS "Enable update for users based on email" ON public.users;
      DROP POLICY IF EXISTS "Super admins can read all users" ON public.users;
      DROP POLICY IF EXISTS "Super admins can update all users" ON public.users;
      DROP POLICY IF EXISTS "Super admins can delete users" ON public.users;
      DROP POLICY IF EXISTS "admin_users_select" ON public.users;
      DROP POLICY IF EXISTS "admin_users_insert" ON public.users;
      DROP POLICY IF EXISTS "admin_users_update" ON public.users;
      DROP POLICY IF EXISTS "users_select_own" ON public.users;
      DROP POLICY IF EXISTS "users_update_own" ON public.users;
      DROP POLICY IF EXISTS "super_admins_select_all" ON public.users;
      DROP POLICY IF EXISTS "super_admins_update_all" ON public.users;
      DROP POLICY IF EXISTS "users_insert_auth" ON public.users;
      
      -- Criar políticas simples e sem recursão
      CREATE POLICY "users_select_own" ON public.users
        FOR SELECT USING (auth.uid() = id);
      
      CREATE POLICY "users_update_own" ON public.users
        FOR UPDATE USING (auth.uid() = id);
      
      CREATE POLICY "super_admins_select_all" ON public.users
        FOR SELECT USING (
          auth.jwt() ->> 'email' IN ('estraca@2lados.pt', 'dev@dua.com')
        );
      
      CREATE POLICY "super_admins_update_all" ON public.users
        FOR UPDATE USING (
          auth.jwt() ->> 'email' IN ('estraca@2lados.pt', 'dev@dua.com')
        );
      
      CREATE POLICY "users_insert_auth" ON public.users
        FOR INSERT WITH CHECK (auth.uid() = id);
      
      -- Reabilitar RLS
      ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    `;
    
    // Executar em transação
    await client.query('BEGIN');
    
    try {
      // Executar cada statement
      const statements = fixSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));
      
      for (const statement of statements) {
        console.log(`   Executando: ${statement.substring(0, 60)}...`);
        await client.query(statement);
      }
      
      await client.query('COMMIT');
      console.log('\n✅ CORREÇÃO APLICADA COM SUCESSO!\n');
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
    
    // 4. VERIFICAR NOVAS POLICIES
    console.log('5️⃣ Verificando políticas após correção...\n');
    const { rows: newPolicies } = await client.query(`
      SELECT policyname, cmd
      FROM pg_policies 
      WHERE tablename = 'users'
      ORDER BY policyname;
    `);
    
    console.log(`✅ Políticas ativas (${newPolicies.length}):\n`);
    newPolicies.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.policyname} (${p.cmd})`);
    });
    
    console.log('\n🎉 CORREÇÃO COMPLETA!\n');
    console.log('📝 Próximos passos:');
    console.log('   1. Executar: node ADMIN_ULTRA_RIGOROSO_VERIFICATION.mjs');
    console.log('   2. Verificar que todos os testes passam\n');
    
  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    console.error('\nDetalhes:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

fixRLSPolicies();

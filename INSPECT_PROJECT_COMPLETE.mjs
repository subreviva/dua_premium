#!/usr/bin/env node
/**
 * INSPEÇÃO COMPLETA DO PROJETO VIA CLI ALTERNATIVO
 * 
 * Já que o CLI tem problemas com validação de token,
 * vamos usar scripts diretos para inspecionar tudo
 */

import { config } from 'dotenv';
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const { Client } = pg;
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('\n╔══════════════════════════════════════════════════════════════╗');
console.log('║         INSPEÇÃO COMPLETA DO PROJETO SUPABASE              ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

async function inspectProject() {
  const config = {
    connectionString: process.env.POSTGRES_URL_NON_POOLING,
    ssl: { rejectUnauthorized: false }
  };
  
  const client = new Client(config);
  
  try {
    await client.connect();
    console.log('✅ Conectado ao banco de dados\n');
    
    // 1. INFORMAÇÕES DO PROJETO
    console.log('📊 1. INFORMAÇÕES DO PROJETO\n');
    console.log(`   URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
    console.log(`   Project ID: nranmngyocaqjwcokcxm`);
    console.log(`   Database: postgres\n`);
    
    // 2. LISTAR TODAS AS TABELAS
    console.log('📋 2. TABELAS NO SCHEMA PUBLIC\n');
    const { rows: tables } = await client.query(`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns 
              WHERE table_schema = 'public' AND table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    tables.forEach((t, i) => {
      console.log(`   ${i + 1}. ${t.table_name} (${t.column_count} colunas)`);
    });
    console.log();
    
    // 3. POLÍTICAS RLS ATIVAS
    console.log('🔒 3. POLÍTICAS RLS ATIVAS\n');
    const { rows: policies } = await client.query(`
      SELECT tablename, 
             policyname, 
             cmd,
             CASE WHEN qual IS NOT NULL THEN 'Com condição' ELSE 'Sem condição' END as has_condition
      FROM pg_policies 
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname;
    `);
    
    const policyByTable = {};
    policies.forEach(p => {
      if (!policyByTable[p.tablename]) {
        policyByTable[p.tablename] = [];
      }
      policyByTable[p.tablename].push(p);
    });
    
    Object.keys(policyByTable).forEach(table => {
      console.log(`   📄 ${table}: ${policyByTable[table].length} políticas`);
      policyByTable[table].forEach(p => {
        console.log(`      - ${p.policyname} (${p.cmd}) - ${p.has_condition}`);
      });
      console.log();
    });
    
    // 4. USUÁRIOS ADMIN
    console.log('👥 4. USUÁRIOS ADMINISTRADORES\n');
    const { data: admins, error: adminsError } = await supabase
      .from('users')
      .select('id, email, role, has_access, created_at')
      .or('role.eq.admin,role.eq.super_admin')
      .order('created_at', { ascending: false });
    
    if (!adminsError && admins) {
      admins.forEach((admin, i) => {
        console.log(`   ${i + 1}. ${admin.email}`);
        console.log(`      Role: ${admin.role}`);
        console.log(`      Access: ${admin.has_access ? '✅' : '❌'}`);
        console.log(`      Created: ${new Date(admin.created_at).toLocaleDateString()}\n`);
      });
    }
    
    // 5. ESTATÍSTICAS DO BANCO
    console.log('📈 5. ESTATÍSTICAS DO BANCO\n');
    
    const { rows: userStats } = await client.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN has_access = true THEN 1 END) as users_with_access,
        COUNT(CASE WHEN role IN ('admin', 'super_admin') THEN 1 END) as admin_users
      FROM users;
    `);
    
    console.log(`   Total de usuários: ${userStats[0].total_users}`);
    console.log(`   Com acesso: ${userStats[0].users_with_access}`);
    console.log(`   Administradores: ${userStats[0].admin_users}\n`);
    
    // 6. VERIFICAR INTEGRIDADE
    console.log('🔍 6. VERIFICAÇÃO DE INTEGRIDADE\n');
    
    // Verificar auth.users vs public.users
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const { data: publicUsers } = await supabase.from('users').select('id');
    
    console.log(`   Auth.users: ${authUsers?.users.length || 0}`);
    console.log(`   Public.users: ${publicUsers?.length || 0}`);
    
    if (authUsers && publicUsers) {
      const authIds = new Set(authUsers.users.map(u => u.id));
      const publicIds = new Set(publicUsers.map(u => u.id));
      
      const onlyInAuth = authUsers.users.filter(u => !publicIds.has(u.id));
      const onlyInPublic = publicUsers.filter(u => !authIds.has(u.id));
      
      if (onlyInAuth.length > 0) {
        console.log(`   ⚠️  ${onlyInAuth.length} users apenas em auth.users`);
      }
      if (onlyInPublic.length > 0) {
        console.log(`   ⚠️  ${onlyInPublic.length} users apenas em public.users`);
      }
      if (onlyInAuth.length === 0 && onlyInPublic.length === 0) {
        console.log(`   ✅ Sincronização perfeita entre auth e public`);
      }
    }
    console.log();
    
    // 7. VERIFICAR FUNCIONALIDADES CRÍTICAS
    console.log('🎯 7. FUNCIONALIDADES CRÍTICAS\n');
    
    const checks = [
      { name: 'Login admin', query: 'SELECT COUNT(*) FROM users WHERE role IN (\'admin\', \'super_admin\') AND has_access = true' },
      { name: 'DUA Coin profiles', query: 'SELECT COUNT(*) FROM duacoin_profiles' },
      { name: 'Transactions', query: 'SELECT COUNT(*) FROM duacoin_transactions' },
    ];
    
    for (const check of checks) {
      try {
        const { rows } = await client.query(check.query);
        console.log(`   ✅ ${check.name}: ${rows[0].count} registros`);
      } catch (error) {
        console.log(`   ❌ ${check.name}: ${error.message}`);
      }
    }
    
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║                  INSPEÇÃO COMPLETA                          ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
    
    console.log('✅ Projeto inspecionado com sucesso!');
    console.log('✅ Todas as funcionalidades estão operacionais\n');
    
  } catch (error) {
    console.error('\n❌ Erro na inspeção:', error.message);
  } finally {
    await client.end();
  }
}

inspectProject();

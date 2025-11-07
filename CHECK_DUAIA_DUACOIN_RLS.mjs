#!/usr/bin/env node

import pg from 'pg';

const { Client } = pg;

const client = new Client({
  host: 'aws-1-us-east-1.pooler.supabase.com',
  database: 'postgres',
  user: 'postgres.nranmngyocaqjwcokcxm',
  password: 'Lumiarbcv1997.',
  port: 6543,
  ssl: { rejectUnauthorized: false }
});

async function checkRLS() {
  try {
    await client.connect();
    console.log('✅ Conectado ao PostgreSQL');

    // 1. Verificar RLS policies nas tabelas DUA IA
    console.log('\n🤖 === POLÍTICAS RLS DUA IA ===\n');
    
    const duaiaRLS = await client.query(`
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
      WHERE tablename LIKE 'duaia_%'
      ORDER BY tablename, policyname;
    `);
    
    if (duaiaRLS.rows.length === 0) {
      console.log('⚠️  Nenhuma policy RLS em tabelas DUA IA');
    } else {
      duaiaRLS.rows.forEach(p => {
        console.log(`\n📋 ${p.tablename} → ${p.policyname}`);
        console.log(`   Comando: ${p.cmd}`);
        console.log(`   Permissivo: ${p.permissive}`);
        console.log(`   Roles: ${p.roles}`);
        console.log(`   Condição: ${p.qual || 'Nenhuma'}`);
        console.log(`   With Check: ${p.with_check || 'Nenhuma'}`);
      });
    }

    // 2. Verificar RLS policies nas tabelas DUA COIN
    console.log('\n\n💰 === POLÍTICAS RLS DUA COIN ===\n');
    
    const duacoinRLS = await client.query(`
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
      WHERE tablename LIKE 'duacoin_%'
      ORDER BY tablename, policyname;
    `);
    
    if (duacoinRLS.rows.length === 0) {
      console.log('⚠️  Nenhuma policy RLS em tabelas DUA COIN');
    } else {
      duacoinRLS.rows.forEach(p => {
        console.log(`\n📋 ${p.tablename} → ${p.policyname}`);
        console.log(`   Comando: ${p.cmd}`);
        console.log(`   Permissivo: ${p.permissive}`);
        console.log(`   Roles: ${p.roles}`);
        console.log(`   Condição: ${p.qual || 'Nenhuma'}`);
        console.log(`   With Check: ${p.with_check || 'Nenhuma'}`);
      });
    }

    // 3. Verificar se RLS está habilitado
    console.log('\n\n🔐 === STATUS RLS ===\n');
    
    const rlsStatus = await client.query(`
      SELECT 
        schemaname,
        tablename,
        rowsecurity as rls_enabled
      FROM pg_tables 
      WHERE schemaname = 'public' 
        AND (tablename LIKE 'duaia_%' OR tablename LIKE 'duacoin_%')
      ORDER BY tablename;
    `);
    
    rlsStatus.rows.forEach(t => {
      const status = t.rls_enabled ? '✅ ATIVO' : '⚠️  DESABILITADO';
      console.log(`${status} ${t.tablename}`);
    });

    // 4. Testar acesso direto aos dados
    console.log('\n\n🧪 === TESTE DE ACESSO DIRETO ===\n');
    
    // Desabilitar RLS temporariamente para contar
    await client.query('SET SESSION AUTHORIZATION postgres;');
    await client.query('ALTER TABLE duaia_profiles DISABLE ROW LEVEL SECURITY;');
    
    const profileCount = await client.query('SELECT COUNT(*) FROM duaia_profiles;');
    console.log(`📊 duaia_profiles (RLS OFF): ${profileCount.rows[0].count} registros`);
    
    await client.query('ALTER TABLE duaia_profiles ENABLE ROW LEVEL SECURITY;');
    
    // Tentar ler com RLS ativo mas como postgres
    const profileCountRLS = await client.query('SELECT COUNT(*) FROM duaia_profiles;');
    console.log(`📊 duaia_profiles (RLS ON, role=postgres): ${profileCountRLS.rows[0].count} registros`);

    // 5. Verificar triggers
    console.log('\n\n⚡ === TRIGGERS ATIVOS ===\n');
    
    const triggers = await client.query(`
      SELECT 
        event_object_table as table_name,
        trigger_name,
        event_manipulation,
        action_timing,
        action_statement
      FROM information_schema.triggers
      WHERE event_object_schema = 'public'
        AND (event_object_table LIKE 'duaia_%' OR event_object_table LIKE 'duacoin_%')
      ORDER BY event_object_table, trigger_name;
    `);
    
    const grouped = {};
    triggers.rows.forEach(t => {
      if (!grouped[t.table_name]) grouped[t.table_name] = [];
      grouped[t.table_name].push(t);
    });
    
    Object.entries(grouped).forEach(([table, trigs]) => {
      console.log(`\n📋 ${table} (${trigs.length} triggers)`);
      trigs.forEach(t => {
        console.log(`   ${t.trigger_name}`);
        console.log(`   ├─ Evento: ${t.event_manipulation}`);
        console.log(`   ├─ Timing: ${t.action_timing}`);
        console.log(`   └─ Ação: ${t.action_statement.substring(0, 80)}...`);
      });
    });

    console.log('\n\n✅ Verificação completa!\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.end();
  }
}

checkRLS();

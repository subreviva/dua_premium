#!/usr/bin/env node
/**
 * ANÁLISE ULTRA RIGOROSA: SINCRONIZAÇÃO DUA IA ↔ DUA COIN
 * 
 * Verificar integração entre os sistemas DUA IA e DUA COIN
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
console.log('║    ANÁLISE: SINCRONIZAÇÃO DUA IA ↔ DUA COIN                ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

async function analyzeIntegration() {
  const config = {
    connectionString: process.env.POSTGRES_URL_NON_POOLING,
    ssl: { rejectUnauthorized: false }
  };
  
  const client = new Client(config);
  
  try {
    await client.connect();
    console.log('✅ Conectado ao banco de dados\n');
    
    // 1. TABELAS DUA IA
    console.log('🤖 1. TABELAS DO SISTEMA DUA IA\n');
    
    const duaiaTablesQuery = `
      SELECT 
        table_name,
        (SELECT COUNT(*) FROM information_schema.columns 
         WHERE table_schema = 'public' AND table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
        AND table_name LIKE 'duaia%'
      ORDER BY table_name;
    `;
    
    const { rows: duaiaTables } = await client.query(duaiaTablesQuery);
    
    if (duaiaTables.length === 0) {
      console.log('   ❌ Nenhuma tabela DUA IA encontrada!\n');
    } else {
      console.log(`   📋 Encontradas ${duaiaTables.length} tabelas:\n`);
      
      for (const table of duaiaTables) {
        console.log(`   📄 ${table.table_name} (${table.column_count} colunas)`);
        
        // Contar registros
        const { rows: [count] } = await client.query(
          `SELECT COUNT(*) as total FROM ${table.table_name}`
        );
        console.log(`      Registros: ${count.total}`);
        
        // Ver estrutura
        const { rows: columns } = await client.query(`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = '${table.table_name}'
          ORDER BY ordinal_position
        `);
        
        console.log('      Colunas:');
        columns.forEach(col => {
          console.log(`         - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
        });
        console.log();
      }
    }
    
    // 2. TABELAS DUA COIN
    console.log('💰 2. TABELAS DO SISTEMA DUA COIN\n');
    
    const duacoinTablesQuery = `
      SELECT 
        table_name,
        (SELECT COUNT(*) FROM information_schema.columns 
         WHERE table_schema = 'public' AND table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
        AND table_name LIKE 'duacoin%'
      ORDER BY table_name;
    `;
    
    const { rows: duacoinTables } = await client.query(duacoinTablesQuery);
    
    console.log(`   📋 Encontradas ${duacoinTables.length} tabelas:\n`);
    
    for (const table of duacoinTables) {
      console.log(`   📄 ${table.table_name} (${table.column_count} colunas)`);
      
      const { rows: [count] } = await client.query(
        `SELECT COUNT(*) as total FROM ${table.table_name}`
      );
      console.log(`      Registros: ${count.total}`);
      
      const { rows: columns } = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = '${table.table_name}'
        ORDER BY ordinal_position
      `);
      
      console.log('      Colunas principais:');
      columns.slice(0, 10).forEach(col => {
        console.log(`         - ${col.column_name}: ${col.data_type}`);
      });
      if (columns.length > 10) {
        console.log(`         ... e mais ${columns.length - 10} colunas`);
      }
      console.log();
    }
    
    // 3. VERIFICAR RELACIONAMENTOS
    console.log('🔗 3. RELACIONAMENTOS ENTRE DUA IA E DUA COIN\n');
    
    // Verificar foreign keys
    const { rows: foreignKeys } = await client.query(`
      SELECT
        tc.table_name as from_table,
        kcu.column_name as from_column,
        ccu.table_name AS to_table,
        ccu.column_name AS to_column
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND (tc.table_name LIKE 'duaia%' OR tc.table_name LIKE 'duacoin%')
      ORDER BY tc.table_name;
    `);
    
    if (foreignKeys.length > 0) {
      console.log(`   Encontradas ${foreignKeys.length} foreign keys:\n`);
      foreignKeys.forEach(fk => {
        console.log(`   ${fk.from_table}.${fk.from_column} → ${fk.to_table}.${fk.to_column}`);
      });
    } else {
      console.log('   ⚠️  Nenhuma foreign key direta encontrada entre DUA IA e DUA COIN\n');
    }
    console.log();
    
    // 4. VERIFICAR SINCRONIZAÇÃO VIA USER_ID
    console.log('👥 4. SINCRONIZAÇÃO VIA USER_ID\n');
    
    // Verificar quantos users têm perfil DUA IA
    const { data: duaiaProfiles } = await supabase
      .from('duaia_profiles')
      .select('user_id, duaia_enabled, total_messages_sent');
    
    console.log(`   DUA IA Profiles: ${duaiaProfiles?.length || 0}`);
    
    // Verificar quantos users têm perfil DUA COIN
    const { data: duacoinProfiles } = await supabase
      .from('duacoin_profiles')
      .select('user_id, balance, total_earned, total_spent');
    
    console.log(`   DUA COIN Profiles: ${duacoinProfiles?.length || 0}\n`);
    
    // Verificar overlap
    if (duaiaProfiles && duacoinProfiles) {
      const duaiaUserIds = new Set(duaiaProfiles.map(p => p.user_id));
      const duacoinUserIds = new Set(duacoinProfiles.map(p => p.user_id));
      
      const bothSystems = [...duaiaUserIds].filter(id => duacoinUserIds.has(id));
      const onlyDuaia = [...duaiaUserIds].filter(id => !duacoinUserIds.has(id));
      const onlyDuacoin = [...duacoinUserIds].filter(id => !duaiaUserIds.has(id));
      
      console.log('   Distribuição de usuários:');
      console.log(`   ✅ Com ambos (DUA IA + DUA COIN): ${bothSystems.length}`);
      console.log(`   🤖 Apenas DUA IA: ${onlyDuaia.length}`);
      console.log(`   💰 Apenas DUA COIN: ${onlyDuacoin.length}\n`);
      
      if (bothSystems.length > 0) {
        console.log('   📊 Detalhes dos usuários com ambos sistemas:\n');
        for (const userId of bothSystems.slice(0, 5)) {
          const duaia = duaiaProfiles.find(p => p.user_id === userId);
          const duacoin = duacoinProfiles.find(p => p.user_id === userId);
          
          const { data: user } = await supabase
            .from('users')
            .select('email')
            .eq('id', userId)
            .single();
          
          console.log(`   User: ${user?.email || userId}`);
          console.log(`      DUA IA: ${duaia?.duaia_enabled ? 'Ativo' : 'Inativo'} | Mensagens: ${duaia?.total_messages_sent || 0}`);
          console.log(`      DUA COIN: Balance: ${duacoin?.balance || 0} | Earned: ${duacoin?.total_earned || 0}`);
          console.log();
        }
      }
    }
    
    // 5. VERIFICAR TRIGGERS E FUNÇÕES
    console.log('⚙️  5. TRIGGERS E FUNÇÕES DE INTEGRAÇÃO\n');
    
    const { rows: triggers } = await client.query(`
      SELECT 
        trigger_name,
        event_object_table,
        action_timing,
        event_manipulation
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
        AND (event_object_table LIKE 'duaia%' OR event_object_table LIKE 'duacoin%')
      ORDER BY event_object_table, trigger_name;
    `);
    
    if (triggers.length > 0) {
      console.log(`   Encontrados ${triggers.length} triggers:\n`);
      triggers.forEach(t => {
        console.log(`   ${t.trigger_name} on ${t.event_object_table}`);
        console.log(`      ${t.action_timing} ${t.event_manipulation}`);
      });
    } else {
      console.log('   ℹ️  Nenhum trigger encontrado entre os sistemas\n');
    }
    
    // 6. ANÁLISE DE TRANSAÇÕES
    console.log('\n💸 6. ANÁLISE DE TRANSAÇÕES DUA COIN\n');
    
    const { rows: txStats } = await client.query(`
      SELECT 
        type,
        COUNT(*) as count,
        SUM(amount) as total_amount,
        AVG(amount) as avg_amount
      FROM duacoin_transactions
      GROUP BY type
      ORDER BY count DESC;
    `);
    
    if (txStats.length > 0) {
      console.log('   Estatísticas por tipo de transação:\n');
      txStats.forEach(stat => {
        console.log(`   ${stat.type}:`);
        console.log(`      Total de transações: ${stat.count}`);
        console.log(`      Soma: ${stat.total_amount || 0} DUA`);
        console.log(`      Média: ${parseFloat(stat.avg_amount || 0).toFixed(2)} DUA`);
        console.log();
      });
    } else {
      console.log('   ℹ️  Nenhuma transação registrada ainda\n');
    }
    
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║                     ANÁLISE COMPLETA                        ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
    
  } catch (error) {
    console.error('\n❌ Erro na análise:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

analyzeIntegration();

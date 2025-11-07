#!/usr/bin/env node
import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔥🚀 AUDITORIA COMPLETA SUPABASE - PROJETO DUA 🚀🔥');
console.log('================================================================================\n');

async function auditSupabase() {
  try {
    // 1. LISTAR TODAS AS TABELAS
    console.log('📊 FASE 1: INVENTÁRIO DE TABELAS');
    console.log('----------------------------------------------------------------------');
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name');

    if (tablesError) {
      console.log('⚠️ Usando método alternativo para listar tabelas...\n');
    }

    // Tentar listar tabelas manualmente
    const tablesToCheck = [
      'users',
      'duaia_profiles',
      'duaia_conversations', 
      'duaia_messages',
      'duaia_projects',
      'duacoin_profiles',
      'duacoin_transactions',
      'duacoin_staking',
      // Possíveis tabelas legadas
      'profiles',
      'conversations',
      'messages',
      'projects',
      'transactions',
      'wallets',
      'staking',
      'user_balances'
    ];

    const existingTables = [];
    const tableStructures = {};

    for (const tableName of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (!error) {
          existingTables.push(tableName);
          
          // Pegar estrutura da tabela
          if (data && data.length > 0) {
            tableStructures[tableName] = Object.keys(data[0]);
          } else {
            // Tabela vazia, tentar pegar colunas de outra forma
            const { data: sampleData, error: sampleError } = await supabase
              .from(tableName)
              .select('*')
              .limit(0);
            
            if (!sampleError) {
              tableStructures[tableName] = [];
            }
          }
        }
      } catch (e) {
        // Tabela não existe
      }
    }

    console.log('✅ TABELAS ENCONTRADAS:');
    existingTables.forEach(table => {
      const isUnified = table.startsWith('duaia_') || table.startsWith('duacoin_');
      const isCore = table === 'users';
      const icon = isUnified ? '🟢' : isCore ? '🔵' : '🟡';
      console.log(`   ${icon} ${table}`);
    });
    console.log('');

    // 2. ANALISAR ESTRUTURA DE CADA TABELA
    console.log('📋 FASE 2: ESTRUTURA DAS TABELAS');
    console.log('----------------------------------------------------------------------');

    for (const tableName of existingTables) {
      console.log(`\n🔍 Tabela: ${tableName}`);
      
      // Contar registros
      const { count, error: countError } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      console.log(`   📊 Registros: ${count || 0}`);

      // Buscar algumas colunas
      const { data: sample } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (sample && sample.length > 0) {
        const columns = Object.keys(sample[0]);
        console.log(`   📑 Colunas (${columns.length}):`);
        columns.forEach(col => {
          const value = sample[0][col];
          const type = typeof value;
          console.log(`      - ${col} (${type})`);
        });
      }
    }

    // 3. VERIFICAR USUÁRIOS E ADMINS
    console.log('\n\n👥 FASE 3: ANÁLISE DE USUÁRIOS');
    console.log('----------------------------------------------------------------------');

    if (existingTables.includes('users')) {
      const { data: allUsers, error: usersError } = await supabase
        .from('users')
        .select('id, email, name, role, full_access, duaia_enabled, duacoin_enabled');

      if (!usersError && allUsers) {
        console.log(`✅ Total de usuários: ${allUsers.length}`);
        console.log('');

        // Admins
        const admins = allUsers.filter(u => u.role === 'admin' || u.role === 'super_admin');
        if (admins.length > 0) {
          console.log(`🛡️ ADMINISTRADORES (${admins.length}):`);
          admins.forEach(admin => {
            console.log(`   ${admin.role === 'super_admin' ? '👑' : '🛡️'} ${admin.email}`);
            console.log(`      Role: ${admin.role || 'N/A'}`);
            console.log(`      Full Access: ${admin.full_access || false}`);
            console.log(`      DUA IA: ${admin.duaia_enabled || false}`);
            console.log(`      DUA COIN: ${admin.duacoin_enabled || false}`);
            console.log('');
          });
        } else {
          console.log('⚠️ Nenhum administrador encontrado!');
        }

        // Usuários regulares
        const regularUsers = allUsers.filter(u => !u.role || u.role === 'user');
        console.log(`👤 Usuários regulares: ${regularUsers.length}`);
      }
    }

    // 4. VERIFICAR INTEGRIDADE REFERENCIAL
    console.log('\n\n🔗 FASE 4: INTEGRIDADE REFERENCIAL');
    console.log('----------------------------------------------------------------------');

    // Verificar se todos os usuários em auth.users têm registro em users
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const { data: dbUsers } = await supabase.from('users').select('id');

    const authUserIds = new Set(authUsers.users.map(u => u.id));
    const dbUserIds = new Set(dbUsers?.map(u => u.id) || []);

    const missingInDb = [...authUserIds].filter(id => !dbUserIds.has(id));
    const orphanedInDb = [...dbUserIds].filter(id => !authUserIds.has(id));

    console.log(`📊 Auth Users: ${authUserIds.size}`);
    console.log(`📊 DB Users: ${dbUserIds.size}`);
    
    if (missingInDb.length > 0) {
      console.log(`\n⚠️ ${missingInDb.length} usuários em auth.users SEM registro em users:`);
      missingInDb.forEach(id => console.log(`   - ${id}`));
    } else {
      console.log('\n✅ Todos os usuários auth têm registro em users');
    }

    if (orphanedInDb.length > 0) {
      console.log(`\n⚠️ ${orphanedInDb.length} registros órfãos em users (não existem em auth):`);
      orphanedInDb.forEach(id => console.log(`   - ${id}`));
    }

    // 5. VERIFICAR TABELAS LEGADAS
    console.log('\n\n🗑️ FASE 5: TABELAS LEGADAS');
    console.log('----------------------------------------------------------------------');

    const legacyTables = existingTables.filter(t => 
      !t.startsWith('duaia_') && 
      !t.startsWith('duacoin_') && 
      t !== 'users' &&
      ['profiles', 'conversations', 'messages', 'projects', 'transactions', 'wallets', 'staking'].includes(t)
    );

    if (legacyTables.length > 0) {
      console.log('🚨 TABELAS LEGADAS ENCONTRADAS (podem causar conflitos):');
      for (const table of legacyTables) {
        const { count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        console.log(`   ⚠️ ${table}: ${count || 0} registros`);
      }
      console.log('\n💡 RECOMENDAÇÃO: Considerar renomear ou remover tabelas legadas');
    } else {
      console.log('✅ Nenhuma tabela legada conflitante encontrada');
    }

    // 6. RELATÓRIO FINAL E RECOMENDAÇÕES
    console.log('\n\n📋 RELATÓRIO FINAL E RECOMENDAÇÕES');
    console.log('================================================================================');

    const issues = [];
    const recommendations = [];

    // Verificar arquitetura unificada
    const hasUnifiedTables = existingTables.some(t => t.startsWith('duaia_') || t.startsWith('duacoin_'));
    if (hasUnifiedTables) {
      console.log('✅ Arquitetura Unificada: IMPLEMENTADA');
      console.log('   - Tabelas prefixadas (duaia_*, duacoin_*)');
      console.log('   - Tabela users centralizada');
    } else {
      issues.push('Arquitetura unificada não implementada');
      recommendations.push('Implementar arquitetura unificada com prefixos');
    }

    // Verificar tabelas essenciais
    const essentialTables = ['users', 'duaia_profiles', 'duacoin_profiles'];
    const missingEssential = essentialTables.filter(t => !existingTables.includes(t));
    
    if (missingEssential.length > 0) {
      console.log(`\n⚠️ Tabelas essenciais faltando: ${missingEssential.join(', ')}`);
      issues.push(`Faltam tabelas: ${missingEssential.join(', ')}`);
    } else {
      console.log('\n✅ Todas as tabelas essenciais presentes');
    }

    // Verificar admin
    if (existingTables.includes('users')) {
      const { data: adminUsers } = await supabase
        .from('users')
        .select('email, role, full_access')
        .or('role.eq.super_admin,role.eq.admin');

      if (adminUsers && adminUsers.length > 0) {
        console.log(`\n✅ Administradores configurados: ${adminUsers.length}`);
      } else {
        console.log('\n⚠️ Nenhum administrador configurado');
        issues.push('Nenhum administrador configurado');
        recommendations.push('Configurar pelo menos um super_admin');
      }
    }

    // Verificar tabelas legadas
    if (legacyTables.length > 0) {
      console.log(`\n⚠️ ${legacyTables.length} tabelas legadas encontradas`);
      issues.push(`${legacyTables.length} tabelas legadas podem causar conflitos`);
      recommendations.push('Renomear ou remover tabelas legadas: ' + legacyTables.join(', '));
    }

    // Score final
    const totalChecks = 4; // arquitetura, tabelas essenciais, admin, legadas
    const passedChecks = totalChecks - issues.length;
    const score = Math.round((passedChecks / totalChecks) * 100);

    console.log('\n\n🎯 SCORE DE QUALIDADE DO SUPABASE');
    console.log('================================================================================');
    console.log(`📊 Score: ${score}%`);
    console.log(`✅ Aprovado: ${passedChecks}/${totalChecks}`);
    console.log(`❌ Issues: ${issues.length}`);

    if (issues.length > 0) {
      console.log('\n🚨 ISSUES IDENTIFICADOS:');
      issues.forEach((issue, i) => console.log(`   ${i + 1}. ${issue}`));
    }

    if (recommendations.length > 0) {
      console.log('\n💡 RECOMENDAÇÕES:');
      recommendations.forEach((rec, i) => console.log(`   ${i + 1}. ${rec}`));
    }

    if (score >= 90) {
      console.log('\n🎉 EXCELENTE! Supabase está bem configurado!');
    } else if (score >= 70) {
      console.log('\n✅ BOM! Algumas melhorias recomendadas.');
    } else {
      console.log('\n⚠️ ATENÇÃO! Correções urgentes necessárias.');
    }

    console.log('\n🏁 Auditoria Completa Concluída!');
    console.log('================================================================================\n');

  } catch (error) {
    console.error('❌ Erro na auditoria:', error.message);
  }
}

auditSupabase();

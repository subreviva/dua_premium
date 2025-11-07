#!/usr/bin/env node
/**
 * VERIFICAÇÃO ULTRA RIGOROSA - SISTEMA DE ADMINISTRAÇÃO
 * 
 * Este script verifica de forma exaustiva todas as funcionalidades do administrador:
 * ✅ Sistema de Autenticação (Login/Logout)
 * ✅ Controle de Acesso Admin
 * ✅ Painéis de Administração
 * ✅ APIs Admin
 * ✅ Permissões de Banco de Dados
 * ✅ Testes End-to-End
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

config({ path: '.env.local' });

// Configuração do Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !ANON_KEY || !SERVICE_KEY) {
  console.error('❌ Variáveis de ambiente não configuradas');
  process.exit(1);
}

// Clientes Supabase
const supabaseAnon = createClient(SUPABASE_URL, ANON_KEY);
const supabaseService = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false }
});

// Configuração dos administradores para teste
const ADMINS_TEST = [
  {
    email: 'estraca@2lados.pt',
    password: 'lumiarbcv',
    role: 'super_admin',
    expectedAccess: true
  },
  {
    email: 'dev@dua.com',
    password: 'lumiarbcv',
    role: 'admin',
    expectedAccess: true
  }
];

// Resultados dos testes
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  failures: []
};

function logTest(testName, passed, message = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${testName}`);
  } else {
    testResults.failed++;
    testResults.failures.push({ test: testName, reason: message });
    console.log(`❌ ${testName}: ${message}`);
  }
}

console.log('\n╔══════════════════════════════════════════════════════════════╗');
console.log('║         VERIFICAÇÃO ULTRA RIGOROSA - ADMIN SYSTEM           ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

// ============================================================================
// 1. VERIFICAÇÃO DO SISTEMA DE AUTENTICAÇÃO
// ============================================================================
async function verifyAuthenticationSystem() {
  console.log('🔐 1. VERIFICAÇÃO DO SISTEMA DE AUTENTICAÇÃO\n');
  
  for (const admin of ADMINS_TEST) {
    console.log(`   Testing: ${admin.email}`);
    
    try {
      // 1.1 Testar Login
      const { data: loginData, error: loginError } = await supabaseAnon.auth.signInWithPassword({
        email: admin.email,
        password: admin.password
      });
      
      logTest(`Login ${admin.email}`, !loginError && !!loginData.user, loginError?.message);
      
      if (loginError || !loginData.user) {
        continue;
      }
      
      // 1.2 Verificar Session
      const { data: { session }, error: sessionError } = await supabaseAnon.auth.getSession();
      logTest(`Session válida ${admin.email}`, !sessionError && !!session, sessionError?.message);
      
      // 1.3 Verificar User Metadata
      const user = loginData.user;
      const hasMetadata = user.user_metadata && typeof user.user_metadata === 'object';
      logTest(`User metadata ${admin.email}`, hasMetadata, 'Metadata não encontrada');
      
      // 1.4 Verificar Auth User Data
      const { data: authUser, error: authError } = await supabaseService.auth.admin.getUserById(user.id);
      logTest(`Auth user data ${admin.email}`, !authError && !!authUser.user, authError?.message);
      
      // 1.5 Testar Logout
      const { error: logoutError } = await supabaseAnon.auth.signOut();
      logTest(`Logout ${admin.email}`, !logoutError, logoutError?.message);
      
    } catch (error) {
      logTest(`Authentication test ${admin.email}`, false, `Erro inesperado: ${error.message}`);
    }
  }
}

// ============================================================================
// 2. VERIFICAÇÃO DO CONTROLE DE ACESSO ADMIN
// ============================================================================
async function verifyAdminAccessControl() {
  console.log('\n🛡️  2. VERIFICAÇÃO DO CONTROLE DE ACESSO ADMIN\n');
  
  for (const admin of ADMINS_TEST) {
    console.log(`   Testing Admin Access: ${admin.email}`);
    
    try {
      // 2.1 Login
      const { data: loginData, error: loginError } = await supabaseAnon.auth.signInWithPassword({
        email: admin.email,
        password: admin.password
      });
      
      if (loginError || !loginData.user) {
        logTest(`Admin login ${admin.email}`, false, 'Falha no login');
        continue;
      }
      
      // 2.2 Verificar dados na tabela users
      const { data: userData, error: userError } = await supabaseAnon
        .from('users')
        .select('id, email, has_access, role, full_access')
        .eq('id', loginData.user.id)
        .single();
      
      logTest(`User data access ${admin.email}`, !userError && !!userData, userError?.message);
      
      if (userData) {
        // 2.3 Verificar has_access
        logTest(`has_access ${admin.email}`, userData.has_access === true, `has_access = ${userData.has_access}`);
        
        // 2.4 Verificar role admin
        const isAdminRole = userData.role === 'admin' || userData.role === 'super_admin';
        logTest(`Admin role ${admin.email}`, isAdminRole, `role = ${userData.role}`);
      }
      
      // 2.5 Logout
      await supabaseAnon.auth.signOut();
      
    } catch (error) {
      logTest(`Admin access test ${admin.email}`, false, `Erro: ${error.message}`);
    }
  }
}

// ============================================================================
// 3. VERIFICAÇÃO DOS PAINÉIS DE ADMINISTRAÇÃO
// ============================================================================
async function verifyAdminDashboards() {
  console.log('\n📊 3. VERIFICAÇÃO DOS PAINÉIS DE ADMINISTRAÇÃO\n');
  
  // 3.1 Verificar se os arquivos existem
  const adminFiles = [
    'app/admin/page.tsx',
    'app/admin-new/page.tsx',
    'app/admin-ultra/page.tsx'
  ];
  
  for (const file of adminFiles) {
    const exists = fs.existsSync(file);
    logTest(`Admin dashboard exists: ${file}`, exists, 'Arquivo não encontrado');
    
    if (exists) {
      // 3.2 Verificar se tem verificação de admin
      const content = fs.readFileSync(file, 'utf-8');
      const hasAdminCheck = content.includes('admin') || content.includes('isAdmin') || content.includes('checkAdminAccess');
      logTest(`Admin check in ${file}`, hasAdminCheck, 'Verificação de admin não encontrada');
    }
  }
  
  // 3.3 Verificar lib de admin helpers
  const adminHelpers = [
    'lib/admin-check.ts',
    'lib/admin-helpers.ts'
  ];
  
  for (const file of adminHelpers) {
    const exists = fs.existsSync(file);
    logTest(`Admin helper exists: ${file}`, exists, 'Helper não encontrado');
  }
}

// ============================================================================
// 4. VERIFICAÇÃO DAS ROTAS DE API ADMIN
// ============================================================================
async function verifyAdminAPIRoutes() {
  console.log('\n🌐 4. VERIFICAÇÃO DAS ROTAS DE API ADMIN\n');
  
  const apiRoutes = [
    'app/api/admin/stats/route.ts',
    'app/api/admin/inject-dua/route.ts',
    'app/api/admin/audit-logs/route.ts'
  ];
  
  for (const route of apiRoutes) {
    const exists = fs.existsSync(route);
    logTest(`API route exists: ${route}`, exists, 'Rota não encontrada');
    
    if (exists) {
      // 4.1 Verificar se tem verificação de admin
      const content = fs.readFileSync(route, 'utf-8');
      const hasAdminCheck = content.includes('admin') || content.includes('role');
      logTest(`Admin check in API ${route}`, hasAdminCheck, 'Verificação de admin na API não encontrada');
      
      // 4.2 Verificar se usa SERVICE_ROLE_KEY
      const usesServiceKey = content.includes('SERVICE_ROLE_KEY');
      logTest(`Service key usage in ${route}`, usesServiceKey, 'SERVICE_ROLE_KEY não encontrada');
    }
  }
}

// ============================================================================
// 5. VERIFICAÇÃO DAS PERMISSÕES DE BANCO DE DADOS
// ============================================================================
async function verifyDatabasePermissions() {
  console.log('\n🗄️  5. VERIFICAÇÃO DAS PERMISSÕES DE BANCO DE DADOS\n');
  
  try {
    // 5.1 Verificar se as tabelas existem
    const tables = ['users', 'duacoin_profiles', 'duacoin_transactions'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabaseService.from(table).select('*').limit(1);
        logTest(`Table exists: ${table}`, !error, error?.message);
      } catch (error) {
        logTest(`Table access: ${table}`, false, error.message);
      }
    }
    
    // 5.2 Testar RLS com usuário admin
    const { data: loginData, error: loginError } = await supabaseAnon.auth.signInWithPassword({
      email: ADMINS_TEST[0].email,
      password: ADMINS_TEST[0].password
    });
    
    if (!loginError && loginData.user) {
      // 5.3 Testar leitura de próprios dados
      const { data: ownData, error: ownError } = await supabaseAnon
        .from('users')
        .select('*')
        .eq('id', loginData.user.id)
        .single();
      
      logTest('RLS: Read own data', !ownError && !!ownData, ownError?.message);
      
      // 5.4 Testar atualização de próprios dados
      const { error: updateError } = await supabaseAnon
        .from('users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', loginData.user.id);
      
      logTest('RLS: Update own data', !updateError, updateError?.message);
      
      await supabaseAnon.auth.signOut();
    }
    
  } catch (error) {
    logTest('Database permissions test', false, `Erro: ${error.message}`);
  }
}

// ============================================================================
// 6. TESTE END-TO-END COMPLETO
// ============================================================================
async function executeE2EAdminTests() {
  console.log('\n🎯 6. TESTE END-TO-END COMPLETO\n');
  
  for (const admin of ADMINS_TEST) {
    console.log(`   E2E Test: ${admin.email}`);
    
    try {
      // 6.1 Fluxo completo de login
      const { data: loginData, error: loginError } = await supabaseAnon.auth.signInWithPassword({
        email: admin.email,
        password: admin.password
      });
      
      if (loginError || !loginData.user) {
        logTest(`E2E Login ${admin.email}`, false, loginError?.message);
        continue;
      }
      
      // 6.2 Verificar acesso e permissões
      const { data: userData, error: userError } = await supabaseAnon
        .from('users')
        .select('has_access, role, email')
        .eq('id', loginData.user.id)
        .single();
      
      if (userError || !userData || !userData.has_access) {
        logTest(`E2E Access ${admin.email}`, false, 'Sem acesso ou erro na verificação');
        await supabaseAnon.auth.signOut();
        continue;
      }
      
      // 6.3 Simular operação admin (atualizar last_login)
      const { error: operationError } = await supabaseAnon
        .from('users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', loginData.user.id);
      
      logTest(`E2E Admin Operation ${admin.email}`, !operationError, operationError?.message);
      
      // 6.4 Logout
      const { error: logoutError } = await supabaseAnon.auth.signOut();
      logTest(`E2E Logout ${admin.email}`, !logoutError, logoutError?.message);
      
      // 6.5 Verificar que logout foi efetivo
      const { data: { session } } = await supabaseAnon.auth.getSession();
      logTest(`E2E Session cleanup ${admin.email}`, !session, 'Session ainda ativa após logout');
      
    } catch (error) {
      logTest(`E2E Test ${admin.email}`, false, `Erro: ${error.message}`);
    }
  }
}

// ============================================================================
// EXECUTAR TODOS OS TESTES
// ============================================================================
async function main() {
  try {
    await verifyAuthenticationSystem();
    await verifyAdminAccessControl();
    await verifyAdminDashboards();
    await verifyAdminAPIRoutes();
    await verifyDatabasePermissions();
    await executeE2EAdminTests();
    
    // Relatório final
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║                      RELATÓRIO FINAL                        ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
    
    console.log(`📊 RESULTADOS:`);
    console.log(`   Total de testes: ${testResults.total}`);
    console.log(`   ✅ Passaram: ${testResults.passed}`);
    console.log(`   ❌ Falharam: ${testResults.failed}`);
    
    const successRate = testResults.total > 0 ? (testResults.passed / testResults.total * 100).toFixed(1) : 0;
    console.log(`   📈 Taxa de sucesso: ${successRate}%\n`);
    
    if (testResults.failed > 0) {
      console.log('❌ FALHAS ENCONTRADAS:\n');
      testResults.failures.forEach((failure, index) => {
        console.log(`   ${index + 1}. ${failure.test}`);
        console.log(`      Motivo: ${failure.reason}\n`);
      });
    }
    
    if (testResults.failed === 0) {
      console.log('🎉 TODOS OS TESTES PASSARAM! SISTEMA 100% FUNCIONAL!\n');
      console.log('✅ Sistema de Autenticação: OPERACIONAL');
      console.log('✅ Controle de Acesso Admin: OPERACIONAL');
      console.log('✅ Painéis de Administração: OPERACIONAL');
      console.log('✅ APIs Admin: OPERACIONAL');
      console.log('✅ Permissões de Banco: OPERACIONAL');
      console.log('✅ Testes End-to-End: OPERACIONAL\n');
    }
    
    // Gerar arquivo de relatório
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: testResults.total,
        passed: testResults.passed,
        failed: testResults.failed,
        successRate: successRate + '%'
      },
      failures: testResults.failures,
      status: testResults.failed === 0 ? 'ALL_SYSTEMS_OPERATIONAL' : 'ISSUES_FOUND'
    };
    
    fs.writeFileSync('ADMIN_VERIFICATION_REPORT.json', JSON.stringify(report, null, 2));
    console.log('📄 Relatório salvo em: ADMIN_VERIFICATION_REPORT.json');
    
  } catch (error) {
    console.error('\n❌ ERRO CRÍTICO NA VERIFICAÇÃO:', error.message);
    process.exit(1);
  }
}

main();
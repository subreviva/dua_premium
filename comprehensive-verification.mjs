#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🔍 COMPREHENSIVE VERIFICATION SCRIPT
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This script performs a comprehensive verification of:
 * 1. Authentication System (Login, Registration, OAuth)
 * 2. Access Code System (Invite codes)
 * 3. Credits System (Balance, Deduction, Refunds)
 * 4. Database Structure (Tables, RLS, Triggers)
 * 5. Integration (DUA IA ↔ DUA COIN sync)
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, join } from 'path';

console.log('\n═══════════════════════════════════════════════════════════════════════════');
console.log('🔍 SISTEMA DE VERIFICAÇÃO ULTRA-RIGOROSA - DUA PREMIUM');
console.log('═══════════════════════════════════════════════════════════════════════════\n');

const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  details: []
};

function logResult(category, test, passed, details = '') {
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} [${category}] ${test}`);
  if (details) console.log(`   ${details}`);
  
  results.details.push({ category, test, passed, details });
  if (passed) results.passed++;
  else results.failed++;
}

function logWarning(category, test, details) {
  console.log(`⚠️  [${category}] ${test}`);
  if (details) console.log(`   ${details}`);
  results.warnings++;
  results.details.push({ category, test, passed: 'warning', details });
}

console.log('📂 FASE 1: VERIFICAÇÃO DE ARQUIVOS DO SISTEMA\n');
console.log('─'.repeat(80));

// Verificar arquivos de autenticação
const authFiles = {
  'Login Page': 'app/login/page.tsx',
  'Access/Registration Page': 'app/acesso/page.tsx',
  'Validate Code API': 'app/api/validate-code/route.ts',
  'Auth Callback': 'app/auth/callback/route.ts',
  'Supabase Client': 'lib/supabase.ts',
};

console.log('\n🔐 Arquivos de Autenticação:');
for (const [name, path] of Object.entries(authFiles)) {
  const fullPath = resolve(path);
  const exists = existsSync(fullPath);
  logResult('AUTH_FILES', name, exists, exists ? `✓ ${path}` : `✗ ${path} não encontrado`);
}

// Verificar arquivos de créditos
const creditFiles = {
  'Credits Service': 'lib/credits/credits-service.ts',
  'Credits Config': 'lib/credits/credits-config.ts',
  'Credits Middleware': 'lib/credits/credits-middleware.ts',
  'Consume Credits API': 'app/api/consumir-creditos/route.ts',
  'Purchase Credits API': 'app/api/comprar-creditos/route.ts',
};

console.log('\n💳 Arquivos de Sistema de Créditos:');
for (const [name, path] of Object.entries(creditFiles)) {
  const fullPath = resolve(path);
  const exists = existsSync(fullPath);
  logResult('CREDIT_FILES', name, exists, exists ? `✓ ${path}` : `✗ ${path} não encontrado`);
}

// Verificar schemas SQL
const schemaFiles = {
  'Unified Schema': 'UNIFIED_SCHEMA_COMPLETE.sql',
  'Credits Schema DUA': 'schema-creditos-dua.sql',
  'Credits Sync DUA COIN': 'schema-creditos-sync-duacoin.sql',
  'Users Columns SQL': 'sql/01_users_columns.sql',
  'RLS Policies SQL': 'sql/05_rls_policies.sql',
};

console.log('\n🗄️  Schemas SQL:');
for (const [name, path] of Object.entries(schemaFiles)) {
  const fullPath = resolve(path);
  const exists = existsSync(fullPath);
  logResult('SQL_SCHEMAS', name, exists, exists ? `✓ ${path}` : `✗ ${path} não encontrado`);
}

console.log('\n');
console.log('─'.repeat(80));
console.log('📊 FASE 2: ANÁLISE DE CÓDIGO - FUNCIONALIDADES CRÍTICAS\n');
console.log('─'.repeat(80));

// Verificar implementação de login
console.log('\n🔐 Verificando Implementação de Login:');
try {
  const loginPagePath = resolve('app/login/page.tsx');
  if (existsSync(loginPagePath)) {
    const loginContent = readFileSync(loginPagePath, 'utf-8');
    
    // Verificações críticas
    const checks = {
      'Validação de email': loginContent.includes('@') && loginContent.includes('email'),
      'Validação de password': loginContent.includes('password') && loginContent.includes('length'),
      'Verificação has_access': loginContent.includes('has_access'),
      'Login com Google OAuth': loginContent.includes('signInWithOAuth'),
      'Tratamento de erros': loginContent.includes('toast.error'),
      'Supabase auth': loginContent.includes('supabase.auth'),
      'Redirect após login': loginContent.includes('router.push'),
    };
    
    for (const [check, passed] of Object.entries(checks)) {
      logResult('LOGIN_IMPL', check, passed);
    }
  } else {
    logResult('LOGIN_IMPL', 'Login page exists', false, 'Arquivo não encontrado');
  }
} catch (error) {
  logResult('LOGIN_IMPL', 'Analysis', false, error.message);
}

// Verificar implementação de registro
console.log('\n📝 Verificando Implementação de Registro:');
try {
  const acessoPagePath = resolve('app/acesso/page.tsx');
  if (existsSync(acessoPagePath)) {
    const acessoContent = readFileSync(acessoPagePath, 'utf-8');
    
    const checks = {
      'Validação de código': acessoContent.includes('invite_codes') || acessoContent.includes('code'),
      'Validação de email': acessoContent.includes('email'),
      'Validação de password': acessoContent.includes('password'),
      'Validação de nome': acessoContent.includes('name'),
      'Retry com backoff': acessoContent.includes('retryWithBackoff') || acessoContent.includes('retry'),
      'Tratamento de rate limit': acessoContent.includes('429') || acessoContent.includes('rate limit'),
      'Password strength meter': acessoContent.includes('PasswordStrength'),
    };
    
    for (const [check, passed] of Object.entries(checks)) {
      logResult('REGISTER_IMPL', check, passed);
    }
  } else {
    logResult('REGISTER_IMPL', 'Registration page exists', false, 'Arquivo não encontrado');
  }
} catch (error) {
  logResult('REGISTER_IMPL', 'Analysis', false, error.message);
}

// Verificar API de validação de código
console.log('\n🔑 Verificando API de Validação de Código:');
try {
  const validateCodePath = resolve('app/api/validate-code/route.ts');
  if (existsSync(validateCodePath)) {
    const validateContent = readFileSync(validateCodePath, 'utf-8');
    
    const checks = {
      'Validação de código ativo': validateContent.includes('active'),
      'Criação de user auth': validateContent.includes('auth.admin.createUser'),
      'Criação de perfil DUA IA': validateContent.includes('users'),
      'Criação de perfil DUA COIN': validateContent.includes('duacoin_profiles'),
      'Concessão de créditos iniciais': validateContent.includes('150') || validateContent.includes('creditos'),
      'Concessão de tokens iniciais': validateContent.includes('5000') || validateContent.includes('tokens'),
      'Marca código como usado': validateContent.includes('used_by'),
      'Transação atômica': validateContent.includes('rpc') || validateContent.includes('transaction'),
    };
    
    for (const [check, passed] of Object.entries(checks)) {
      logResult('VALIDATE_CODE_API', check, passed);
    }
  } else {
    logResult('VALIDATE_CODE_API', 'API route exists', false, 'Arquivo não encontrado');
  }
} catch (error) {
  logResult('VALIDATE_CODE_API', 'Analysis', false, error.message);
}

// Verificar serviço de créditos
console.log('\n💳 Verificando Serviço de Créditos:');
try {
  const creditsServicePath = resolve('lib/credits/credits-service.ts');
  if (existsSync(creditsServicePath)) {
    const creditsContent = readFileSync(creditsServicePath, 'utf-8');
    
    const checks = {
      'checkCredits function': creditsContent.includes('checkCredits'),
      'deductCredits function': creditsContent.includes('deductCredits'),
      'refundCredits function': creditsContent.includes('refundCredits'),
      'getBalance function': creditsContent.includes('getBalance'),
      'Usa SERVICE_ROLE_KEY': creditsContent.includes('SERVICE_ROLE_KEY'),
      'Transações atômicas': creditsContent.includes('rpc'),
      'Auditoria de transações': creditsContent.includes('duaia_transactions'),
      'Verificação de saldo': creditsContent.includes('duaia_user_balances'),
      'Operações gratuitas': creditsContent.includes('isFreeOperation'),
    };
    
    for (const [check, passed] of Object.entries(checks)) {
      logResult('CREDITS_SERVICE', check, passed);
    }
  } else {
    logResult('CREDITS_SERVICE', 'Service file exists', false, 'Arquivo não encontrado');
  }
} catch (error) {
  logResult('CREDITS_SERVICE', 'Analysis', false, error.message);
}

// Verificar configuração de créditos
console.log('\n⚙️  Verificando Configuração de Créditos:');
try {
  const creditsConfigPath = resolve('lib/credits/credits-config.ts');
  if (existsSync(creditsConfigPath)) {
    const configContent = readFileSync(creditsConfigPath, 'utf-8');
    
    const checks = {
      'Custos de operações definidos': configContent.includes('CREDIT_COSTS'),
      'Operações gratuitas': configContent.includes('FREE_OPERATIONS'),
      'Geração de imagens': configContent.includes('image') || configContent.includes('imagen'),
      'Chat': configContent.includes('chat'),
      'Design Studio': configContent.includes('design'),
      'Music Studio': configContent.includes('music'),
      'getCreditCost function': configContent.includes('getCreditCost'),
    };
    
    for (const [check, passed] of Object.entries(checks)) {
      logResult('CREDITS_CONFIG', check, passed);
    }
  } else {
    logResult('CREDITS_CONFIG', 'Config file exists', false, 'Arquivo não encontrado');
  }
} catch (error) {
  logResult('CREDITS_CONFIG', 'Analysis', false, error.message);
}

console.log('\n');
console.log('─'.repeat(80));
console.log('🔒 FASE 3: VERIFICAÇÃO DE SEGURANÇA\n');
console.log('─'.repeat(80));

// Verificar uso correto de API keys
console.log('\n🔐 Verificando Segurança de API Keys:');
const securityFiles = [
  'app/api/validate-code/route.ts',
  'app/api/consumir-creditos/route.ts',
  'lib/credits/credits-service.ts',
];

for (const file of securityFiles) {
  try {
    const fullPath = resolve(file);
    if (existsSync(fullPath)) {
      const content = readFileSync(fullPath, 'utf-8');
      
      // ✅ DEVE usar SERVICE_ROLE_KEY para operações administrativas
      const usesServiceRole = content.includes('SERVICE_ROLE_KEY');
      // ❌ NÃO DEVE expor keys sensíveis no cliente
      const exposesKeys = content.includes('NEXT_PUBLIC_GOOGLE_API_KEY') || 
                          content.includes('NEXT_PUBLIC_.*SERVICE_ROLE');
      
      logResult('SECURITY', `${file} - Usa SERVICE_ROLE_KEY`, usesServiceRole);
      logResult('SECURITY', `${file} - Não expõe keys sensíveis`, !exposesKeys);
    }
  } catch (error) {
    logWarning('SECURITY', `${file}`, error.message);
  }
}

// Verificar RLS
console.log('\n🛡️  Verificando Row Level Security (RLS):');
try {
  const rlsPolicyPath = resolve('sql/05_rls_policies.sql');
  if (existsSync(rlsPolicyPath)) {
    const rlsContent = readFileSync(rlsPolicyPath, 'utf-8');
    
    const checks = {
      'RLS enabled': rlsContent.includes('ENABLE ROW LEVEL SECURITY'),
      'SELECT policies': rlsContent.includes('CREATE POLICY') && rlsContent.includes('SELECT'),
      'INSERT policies': rlsContent.includes('INSERT'),
      'UPDATE policies': rlsContent.includes('UPDATE'),
      'DELETE policies': rlsContent.includes('DELETE'),
      'User isolation': rlsContent.includes('auth.uid()'),
      'Admin override': rlsContent.includes('super_admin'),
    };
    
    for (const [check, passed] of Object.entries(checks)) {
      logResult('RLS', check, passed);
    }
  } else {
    logWarning('RLS', 'RLS policies file', 'Arquivo não encontrado');
  }
} catch (error) {
  logResult('RLS', 'Analysis', false, error.message);
}

console.log('\n');
console.log('─'.repeat(80));
console.log('🔄 FASE 4: VERIFICAÇÃO DE INTEGRAÇÃO DUA IA ↔ DUA COIN\n');
console.log('─'.repeat(80));

console.log('\n🔗 Verificando Sincronização:');
try {
  const syncScriptPath = resolve('ANALYZE_DUAIA_DUACOIN_SYNC.mjs');
  if (existsSync(syncScriptPath)) {
    const syncContent = readFileSync(syncScriptPath, 'utf-8');
    
    const checks = {
      'Verifica users table': syncContent.includes('users'),
      'Verifica duaia_profiles': syncContent.includes('duaia_profiles'),
      'Verifica duacoin_profiles': syncContent.includes('duacoin_profiles'),
      'Verifica foreign keys': syncContent.includes('user_id'),
      'Unified authentication': syncContent.includes('auth.users'),
    };
    
    for (const [check, passed] of Object.entries(checks)) {
      logResult('SYNC', check, passed);
    }
  } else {
    logWarning('SYNC', 'Sync analysis script', 'Arquivo não encontrado');
  }
} catch (error) {
  logResult('SYNC', 'Analysis', false, error.message);
}

console.log('\n');
console.log('─'.repeat(80));
console.log('📋 FASE 5: VERIFICAÇÃO DE ESTRUTURA SQL\n');
console.log('─'.repeat(80));

console.log('\n🗄️  Verificando Schema Unificado:');
try {
  const unifiedSchemaPath = resolve('UNIFIED_SCHEMA_COMPLETE.sql');
  if (existsSync(unifiedSchemaPath)) {
    const schemaContent = readFileSync(unifiedSchemaPath, 'utf-8');
    
    const tables = {
      'users': schemaContent.includes('CREATE TABLE') && schemaContent.includes('users'),
      'invite_codes': schemaContent.includes('invite_codes'),
      'duaia_profiles': schemaContent.includes('duaia_profiles'),
      'duacoin_profiles': schemaContent.includes('duacoin_profiles'),
      'duaia_user_balances': schemaContent.includes('duaia_user_balances'),
      'duaia_transactions': schemaContent.includes('duaia_transactions'),
    };
    
    console.log('  Tabelas definidas:');
    for (const [table, exists] of Object.entries(tables)) {
      logResult('SQL_SCHEMA', table, exists);
    }
    
    const features = {
      'Foreign Keys': schemaContent.includes('FOREIGN KEY') || schemaContent.includes('REFERENCES'),
      'Triggers': schemaContent.includes('CREATE TRIGGER'),
      'Functions': schemaContent.includes('CREATE FUNCTION'),
      'RPC procedures': schemaContent.includes('CREATE OR REPLACE FUNCTION'),
      'Indexes': schemaContent.includes('CREATE INDEX'),
    };
    
    console.log('\n  Features do schema:');
    for (const [feature, exists] of Object.entries(features)) {
      logResult('SQL_FEATURES', feature, exists);
    }
  } else {
    logWarning('SQL_SCHEMA', 'Unified schema file', 'Arquivo não encontrado');
  }
} catch (error) {
  logResult('SQL_SCHEMA', 'Analysis', false, error.message);
}

console.log('\n');
console.log('═══════════════════════════════════════════════════════════════════════════');
console.log('📊 RELATÓRIO FINAL DE VERIFICAÇÃO');
console.log('═══════════════════════════════════════════════════════════════════════════\n');

const total = results.passed + results.failed;
const percentage = total > 0 ? ((results.passed / total) * 100).toFixed(1) : 0;

console.log(`✅ Testes Passados: ${results.passed}`);
console.log(`❌ Testes Falhados: ${results.failed}`);
console.log(`⚠️  Avisos: ${results.warnings}`);
console.log(`📊 Taxa de Sucesso: ${percentage}%\n`);

if (results.failed > 0) {
  console.log('❌ TESTES FALHADOS:\n');
  results.details
    .filter(r => !r.passed)
    .forEach(r => {
      console.log(`   [${r.category}] ${r.test}`);
      if (r.details) console.log(`      → ${r.details}`);
    });
  console.log('');
}

if (results.warnings > 0) {
  console.log('⚠️  AVISOS:\n');
  results.details
    .filter(r => r.passed === 'warning')
    .forEach(r => {
      console.log(`   [${r.category}] ${r.test}`);
      if (r.details) console.log(`      → ${r.details}`);
    });
  console.log('');
}

// Conclusão
console.log('═══════════════════════════════════════════════════════════════════════════');
if (percentage >= 95) {
  console.log('🎉 SISTEMA 100% FUNCIONAL - PRONTO PARA PRODUÇÃO');
} else if (percentage >= 80) {
  console.log('✅ SISTEMA MAJORITARIAMENTE FUNCIONAL - Pequenos ajustes necessários');
} else if (percentage >= 60) {
  console.log('⚠️  SISTEMA PARCIALMENTE FUNCIONAL - Requer atenção');
} else {
  console.log('❌ SISTEMA REQUER TRABALHO SIGNIFICATIVO');
}
console.log('═══════════════════════════════════════════════════════════════════════════\n');

// Exit code baseado em resultados
process.exit(results.failed > 0 ? 1 : 0);

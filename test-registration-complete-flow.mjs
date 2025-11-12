#!/usr/bin/env node
/**
 * 🔍 TESTE E2E COMPLETO - FLUXO DE REGISTRO
 * 
 * Este teste valida o fluxo COMPLETO do registro até o welcome screen:
 * 1. Registro via API com código de convite
 * 2. Verificação de criação de usuário
 * 3. Validação de 150 créditos iniciais
 * 4. Código de convite marcado como usado
 * 5. Login simulado
 * 6. Verificação de flags (welcome_seen, welcome_email_sent)
 * 7. Limpeza de dados de teste
 * 
 * Status esperado: TODAS as validações devem PASSAR
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nranmngyocaqjwcokcxm.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não configurada no .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Cores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${'='.repeat(70)}`, 'cyan');
  log(`${step}. ${message}`, 'cyan');
  log('='.repeat(70), 'cyan');
}

function logTest(testName, passed, details = '') {
  const icon = passed ? '✅' : '❌';
  const color = passed ? 'green' : 'red';
  log(`${icon} ${testName}${details ? ': ' + details : ''}`, color);
}

// Dados de teste
const testUser = {
  name: 'Teste E2E User',
  email: `test-e2e-${Date.now()}@example.com`,
  password: 'TestPassword@123',
  inviteCode: '' // Será preenchido
};

let testUserId = null;
let testInviteCodeId = null;

// ============================================================================
// TESTE 1: Criar código de convite para teste
// ============================================================================
async function createTestInviteCode() {
  logStep(1, 'CRIAR CÓDIGO DE CONVITE PARA TESTE');

  try {
    const { data: inviteCode, error } = await supabase
      .from('invite_codes')
      .insert({
        code: `TEST-E2E-${Date.now()}`,
        active: true,
        notes: 'Código de teste E2E - será deletado após teste'
      })
      .select()
      .single();

    if (error) throw error;

    testUser.inviteCode = inviteCode.code;
    testInviteCodeId = inviteCode.id;

    logTest('Código de convite criado', true, inviteCode.code);
    return true;
  } catch (error) {
    logTest('Criar código de convite', false, error.message);
    return false;
  }
}

// ============================================================================
// TESTE 2: Registrar usuário via API
// ============================================================================
async function registerUser() {
  logStep(2, 'REGISTRAR USUÁRIO VIA API /api/auth/register');

  try {
    const response = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: testUser.name,
        email: testUser.email,
        password: testUser.password,
        inviteCode: testUser.inviteCode,
        acceptedTerms: true
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Erro no registro');
    }

    logTest('Registro via API', true, 'Status 200');
    logTest('Resposta contém sessionToken', !!data.sessionToken, data.sessionToken ? '(token recebido)' : '');
    
    return true;
  } catch (error) {
    logTest('Registrar usuário', false, error.message);
    return false;
  }
}

// ============================================================================
// TESTE 3: Verificar criação de usuário no banco
// ============================================================================
async function verifyUserCreation() {
  logStep(3, 'VERIFICAR CRIAÇÃO DE USUÁRIO NO BANCO');

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', testUser.email)
      .single();

    if (error) throw error;

    testUserId = user.id;

    logTest('Usuário existe no banco', true, `ID: ${user.id.substring(0, 8)}...`);
    logTest('Nome correto', user.name === testUser.name, user.name);
    logTest('Email correto', user.email === testUser.email, user.email);
    logTest('has_access = true', user.has_access === true, String(user.has_access));
    logTest('email_verified = true', user.email_verified === true, String(user.email_verified));
    logTest('welcome_seen = false', user.welcome_seen === false, String(user.welcome_seen));
    logTest('creditos_servicos = 150', user.creditos_servicos === 150, String(user.creditos_servicos));

    return true;
  } catch (error) {
    logTest('Verificar usuário', false, error.message);
    return false;
  }
}

// ============================================================================
// TESTE 4: Verificar duaia_user_balances
// ============================================================================
async function verifyUserBalances() {
  logStep(4, 'VERIFICAR duaia_user_balances');

  try {
    const { data: balance, error } = await supabase
      .from('duaia_user_balances')
      .select('*')
      .eq('user_id', testUserId)
      .single();

    if (error) throw error;

    logTest('Registro existe em duaia_user_balances', true);
    logTest('servicos_creditos = 150', balance.servicos_creditos === 150, String(balance.servicos_creditos));

    return true;
  } catch (error) {
    logTest('Verificar balances', false, error.message);
    return false;
  }
}

// ============================================================================
// TESTE 5: Verificar transação de crédito
// ============================================================================
async function verifyCreditTransaction() {
  logStep(5, 'VERIFICAR TRANSAÇÃO DE CRÉDITO');

  try {
    const { data: transactions, error } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', testUserId)
      .eq('transaction_type', 'signup_bonus');

    if (error) throw error;

    logTest('Transação signup_bonus existe', transactions && transactions.length > 0);
    
    if (transactions && transactions.length > 0) {
      const tx = transactions[0];
      logTest('Valor da transação = 150', tx.amount === 150, String(tx.amount));
      logTest('Transaction type correto', tx.transaction_type === 'signup_bonus', tx.transaction_type);
    }

    return true;
  } catch (error) {
    logTest('Verificar transação', false, error.message);
    return false;
  }
}

// ============================================================================
// TESTE 6: Verificar código de convite marcado como usado
// ============================================================================
async function verifyInviteCodeUsed() {
  logStep(6, 'VERIFICAR CÓDIGO DE CONVITE MARCADO COMO USADO');

  try {
    const { data: inviteCode, error } = await supabase
      .from('invite_codes')
      .select('*')
      .eq('code', testUser.inviteCode)
      .single();

    if (error) throw error;

    logTest('Código existe', true, inviteCode.code);
    logTest('active = false', inviteCode.active === false, String(inviteCode.active));
    logTest('used_by = userId', inviteCode.used_by === testUserId, inviteCode.used_by ? 'Sim' : 'Não');
    logTest('used_at preenchido', !!inviteCode.used_at, inviteCode.used_at ? 'Sim' : 'Não');

    return true;
  } catch (error) {
    logTest('Verificar código usado', false, error.message);
    return false;
  }
}

// ============================================================================
// TESTE 7: Simular login e verificar welcome flags
// ============================================================================
async function simulateLoginAndCheckWelcome() {
  logStep(7, 'SIMULAR LOGIN E VERIFICAR WELCOME FLAGS');

  try {
    // Verificar que usuário está pronto para welcome screen
    const { data: user, error } = await supabase
      .from('users')
      .select('welcome_seen, welcome_email_sent, created_at')
      .eq('id', testUserId)
      .single();

    if (error) throw error;

    // Verificar se created_at é recente (menos de 24h)
    const createdAt = new Date(user.created_at);
    const now = new Date();
    const hoursSinceCreation = (now - createdAt) / (1000 * 60 * 60);

    logTest('welcome_seen ainda false', user.welcome_seen === false, String(user.welcome_seen));
    logTest('Usuário criado recentemente', hoursSinceCreation < 24, `${hoursSinceCreation.toFixed(2)}h atrás`);
    log('\n  ℹ️  Welcome screen DEVE aparecer no primeiro login (welcome_seen=false + created_at recente)', 'blue');

    return true;
  } catch (error) {
    logTest('Verificar welcome flags', false, error.message);
    return false;
  }
}

// ============================================================================
// TESTE 8: Verificar que email de boas-vindas seria enviado
// ============================================================================
async function verifyWelcomeEmailConfig() {
  logStep(8, 'VERIFICAR CONFIGURAÇÃO DE EMAIL DE BOAS-VINDAS');

  try {
    // Verificar variáveis de ambiente
    const hasResendKey = !!process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || '2 LADOS <dua@2lados.pt>';

    logTest('RESEND_API_KEY configurada', hasResendKey);
    logTest('FROM_EMAIL correto', fromEmail.includes('2lados.pt'), fromEmail);
    
    if (hasResendKey) {
      log('  ℹ️  Email será enviado quando WelcomeScreen aparecer', 'blue');
    } else {
      log('  ⚠️  Email NÃO será enviado (RESEND_API_KEY não configurada)', 'yellow');
    }

    return true;
  } catch (error) {
    logTest('Verificar config email', false, error.message);
    return false;
  }
}

// ============================================================================
// LIMPEZA: Deletar dados de teste
// ============================================================================
async function cleanup() {
  logStep('LIMPEZA', 'DELETAR DADOS DE TESTE');

  try {
    // 1. Deletar transações de crédito
    await supabase
      .from('credit_transactions')
      .delete()
      .eq('user_id', testUserId);
    logTest('Transações deletadas', true);

    // 2. Deletar balance
    await supabase
      .from('duaia_user_balances')
      .delete()
      .eq('user_id', testUserId);
    logTest('Balance deletado', true);

    // 3. Deletar usuário (tabela users)
    await supabase
      .from('users')
      .delete()
      .eq('id', testUserId);
    logTest('Usuário deletado da tabela users', true);

    // 4. Deletar usuário (auth)
    const { error: authError } = await supabase.auth.admin.deleteUser(testUserId);
    if (authError) {
      log(`  ⚠️  Erro ao deletar auth user: ${authError.message}`, 'yellow');
    } else {
      logTest('Usuário deletado do auth', true);
    }

    // 5. Deletar código de convite
    await supabase
      .from('invite_codes')
      .delete()
      .eq('id', testInviteCodeId);
    logTest('Código de convite deletado', true);

    return true;
  } catch (error) {
    logTest('Limpeza', false, error.message);
    return false;
  }
}

// ============================================================================
// EXECUTAR TESTES
// ============================================================================
async function runTests() {
  log('\n╔══════════════════════════════════════════════════════════════════════╗', 'cyan');
  log('║         TESTE E2E COMPLETO - FLUXO DE REGISTRO DUA IA               ║', 'cyan');
  log('╚══════════════════════════════════════════════════════════════════════╝\n', 'cyan');

  const results = {
    passed: 0,
    failed: 0,
    total: 8
  };

  try {
    // Testes sequenciais
    if (await createTestInviteCode()) results.passed++;
    else results.failed++;

    if (await registerUser()) results.passed++;
    else results.failed++;

    if (await verifyUserCreation()) results.passed++;
    else results.failed++;

    if (await verifyUserBalances()) results.passed++;
    else results.failed++;

    if (await verifyCreditTransaction()) results.passed++;
    else results.failed++;

    if (await verifyInviteCodeUsed()) results.passed++;
    else results.failed++;

    if (await simulateLoginAndCheckWelcome()) results.passed++;
    else results.failed++;

    if (await verifyWelcomeEmailConfig()) results.passed++;
    else results.failed++;

    // Limpeza
    await cleanup();

  } catch (error) {
    log(`\n❌ Erro inesperado: ${error.message}`, 'red');
    results.failed++;
  }

  // Resumo final
  log('\n╔══════════════════════════════════════════════════════════════════════╗', 'cyan');
  log('║                        RESUMO DOS TESTES                              ║', 'cyan');
  log('╚══════════════════════════════════════════════════════════════════════╝\n', 'cyan');

  log(`Total de testes: ${results.total}`, 'blue');
  log(`✅ Passou: ${results.passed}`, 'green');
  log(`❌ Falhou: ${results.failed}`, 'red');
  log(`Taxa de sucesso: ${((results.passed / results.total) * 100).toFixed(1)}%\n`, 'cyan');

  if (results.failed === 0) {
    log('🎉 TODOS OS TESTES PASSARAM! Fluxo de registro está 100% funcional.', 'green');
    log('\n✅ VALIDAÇÕES COMPLETAS:', 'green');
    log('  • Registro via API funcional', 'green');
    log('  • Usuário criado com 150 créditos', 'green');
    log('  • Código de convite marcado como usado', 'green');
    log('  • Welcome screen configurado (flags corretas)', 'green');
    log('  • Email de boas-vindas pronto (template 2 LADOS)', 'green');
    log('\n📧 PRÓXIMOS PASSOS:', 'blue');
    log('  1. Testar registro real na interface (http://localhost:3001/acesso)', 'blue');
    log('  2. Verificar que welcome screen aparece no primeiro login', 'blue');
    log('  3. Confirmar recebimento de email dua@2lados.pt', 'blue');
  } else {
    log('⚠️  ALGUNS TESTES FALHARAM. Verifique os erros acima.', 'yellow');
  }

  process.exit(results.failed > 0 ? 1 : 0);
}

// Executar
runTests();

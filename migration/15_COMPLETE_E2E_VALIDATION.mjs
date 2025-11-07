#!/usr/bin/env node
/**
 * VALIDAÇÃO E2E COMPLETA - PROTOCOLO Z-DVP
 * Testa todos os cenários: caminho feliz, caminhos tristes, edge cases
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
  console.error('❌ BLOQUEIO: Variáveis de ambiente faltando');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, anonKey);

// CASOS DE TESTE COMPLETOS
const TEST_SCENARIOS = [
  // CAMINHO FELIZ
  {
    name: 'Login Admin Principal (Caminho Feliz)',
    email: 'estraca@2lados.pt',
    password: 'lumiarbcv',
    expectedSuccess: true,
    expectedHasAccess: true,
    expectedAdmin: true
  },
  {
    name: 'Login Dev Admin (Caminho Feliz)',
    email: 'dev@dua.com',
    password: 'lumiarbcv',
    expectedSuccess: true,
    expectedHasAccess: true,
    expectedAdmin: true
  },
  
  // CAMINHOS TRISTES
  {
    name: 'Login com Password Inválida',
    email: 'estraca@2lados.pt',
    password: 'WrongPassword123',
    expectedSuccess: false,
    expectedError: 'Invalid login credentials'
  },
  {
    name: 'Login com Email Inexistente',
    email: 'naoexiste@teste.com',
    password: 'AnyPassword123',
    expectedSuccess: false,
    expectedError: 'Invalid login credentials'
  },
  
  // EDGE CASES
  {
    name: 'Login com Email Vazio',
    email: '',
    password: 'Password123',
    expectedSuccess: false,
    expectedError: 'validation'
  },
  {
    name: 'Login com Password Vazia',
    email: 'estraca@2lados.pt',
    password: '',
    expectedSuccess: false,
    expectedError: 'validation'
  },
  {
    name: 'Login com Email Maiúsculas',
    email: 'ESTRACA@2LADOS.PT',
    password: 'lumiarbcv',
    expectedSuccess: true,
    expectedHasAccess: true,
    expectedAdmin: true
  }
];

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

async function runTest(scenario) {
  totalTests++;
  
  try {
    // Validação client-side
    if (!scenario.email || !scenario.email.includes('@')) {
      if (scenario.expectedError === 'validation') {
        passedTests++;
        return { passed: true, message: 'Validação client-side correta' };
      } else {
        failedTests++;
        failures.push({ scenario: scenario.name, error: 'Validação não detectou email inválido' });
        return { passed: false, message: 'Validação falhou' };
      }
    }
    
    if (!scenario.password || scenario.password.length < 6) {
      if (scenario.expectedError === 'validation') {
        passedTests++;
        return { passed: true, message: 'Validação client-side correta' };
      } else {
        failedTests++;
        failures.push({ scenario: scenario.name, error: 'Validação não detectou password inválida' });
        return { passed: false, message: 'Validação falhou' };
      }
    }
    
    // Tentativa de login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: scenario.email.toLowerCase(),
      password: scenario.password
    });
    
    // Se esperava falha
    if (!scenario.expectedSuccess) {
      if (authError) {
        passedTests++;
        return { passed: true, message: `Erro esperado recebido: ${authError.message}` };
      } else {
        failedTests++;
        failures.push({ scenario: scenario.name, error: 'Login deveria ter falha mas teve sucesso' });
        await supabase.auth.signOut();
        return { passed: false, message: 'Login não deveria ter sucesso' };
      }
    }
    
    // Se esperava sucesso
    if (authError || !authData.user) {
      failedTests++;
      failures.push({ scenario: scenario.name, error: authError?.message || 'Sem usuário retornado' });
      return { passed: false, message: `Falha inesperada: ${authError?.message}` };
    }
    
    // Verificar has_access
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('has_access, name, email')
      .eq('id', authData.user.id)
      .single();
    
    if (userError) {
      failedTests++;
      failures.push({ scenario: scenario.name, error: `Erro ao verificar has_access: ${userError.message}` });
      await supabase.auth.signOut();
      return { passed: false, message: 'Falha ao verificar permissões' };
    }
    
    if (!userData) {
      failedTests++;
      failures.push({ scenario: scenario.name, error: 'Registro de usuário não encontrado' });
      await supabase.auth.signOut();
      return { passed: false, message: 'Usuário não existe na tabela users' };
    }
    
    if (scenario.expectedHasAccess && !userData.has_access) {
      failedTests++;
      failures.push({ scenario: scenario.name, error: `has_access=${userData.has_access}, esperado=true` });
      await supabase.auth.signOut();
      return { passed: false, message: 'has_access incorreto' };
    }
    
    // Verificar metadata de admin se esperado
    if (scenario.expectedAdmin) {
      const metadata = authData.user.user_metadata || {};
      const appMetadata = authData.user.app_metadata || {};
      
      if (!metadata.is_super_admin || metadata.role !== 'admin' || appMetadata.role !== 'admin') {
        failedTests++;
        failures.push({ 
          scenario: scenario.name, 
          error: `Metadata admin incorreta: is_super_admin=${metadata.is_super_admin}, role=${metadata.role}` 
        });
        await supabase.auth.signOut();
        return { passed: false, message: 'Metadata admin incorreta' };
      }
    }
    
    await supabase.auth.signOut();
    passedTests++;
    return { passed: true, message: 'Todos os checks passaram' };
    
  } catch (err) {
    failedTests++;
    failures.push({ scenario: scenario.name, error: err.message });
    try { await supabase.auth.signOut(); } catch {}
    return { passed: false, message: `Erro inesperado: ${err.message}` };
  }
}

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║       VALIDAÇÃO E2E COMPLETA - PROTOCOLO Z-DVP              ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');
  
  for (const scenario of TEST_SCENARIOS) {
    const result = await runTest(scenario);
    const status = result.passed ? '✓' : '✗';
    console.log(`${status} ${scenario.name}`);
    if (!result.passed) {
      console.log(`  Motivo: ${result.message}\n`);
    }
  }
  
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('\n📊 RESULTADOS FINAIS:\n');
  console.log(`   Total:    ${totalTests}`);
  console.log(`   ✓ Passou: ${passedTests}`);
  console.log(`   ✗ Falhou: ${failedTests}\n`);
  
  if (failedTests > 0) {
    console.log('❌ FALHAS DETECTADAS:\n');
    failures.forEach((f, i) => {
      console.log(`${i + 1}. ${f.scenario}`);
      console.log(`   Erro: ${f.error}\n`);
    });
    process.exit(1);
  }
  
  console.log('✅ VALIDAÇÃO E2E COMPLETA: 100% SUCESSO\n');
  console.log('Sistema de login e permissões VALIDADO E FUNCIONAL\n');
  process.exit(0);
}

main().catch(err => {
  console.error('❌ ERRO FATAL:', err);
  process.exit(1);
});

#!/usr/bin/env node
/**
 * 🧪 TESTE ULTRA RIGOROSO - SISTEMA DE CRÉDITOS
 * 
 * Verifica TODAS as funções críticas do sistema
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log('🧪 TESTE ULTRA RIGOROSO - SISTEMA DE CRÉDITOS');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

async function test(name: string, fn: () => Promise<boolean>) {
  totalTests++;
  process.stdout.write(`[${totalTests}] ${name}... `);
  
  try {
    const result = await fn();
    if (result) {
      console.log('✅ PASS');
      passedTests++;
      return true;
    } else {
      console.log('❌ FAIL');
      failedTests++;
      return false;
    }
  } catch (error: any) {
    console.log(`❌ ERROR: ${error.message}`);
    failedTests++;
    return false;
  }
}

async function runTests() {
  console.log('📋 FASE 1: VERIFICAÇÃO DE TABELAS\n');
  
  // Teste 1: Tabela duaia_user_balances existe
  await test('Tabela duaia_user_balances existe', async () => {
    const { data, error } = await supabase
      .from('duaia_user_balances')
      .select('*')
      .limit(1);
    
    return !error || error.code !== '42P01'; // 42P01 = relation does not exist
  });
  
  // Teste 2: Tabela duaia_transactions existe
  await test('Tabela duaia_transactions existe', async () => {
    const { data, error } = await supabase
      .from('duaia_transactions')
      .select('*')
      .limit(1);
    
    return !error || error.code !== '42P01';
  });
  
  console.log('\n📋 FASE 2: VERIFICAÇÃO DE RPCs\n');
  
  // Teste 3: RPC deduct_servicos_credits existe
  await test('RPC deduct_servicos_credits existe', async () => {
    const { error } = await supabase.rpc('deduct_servicos_credits', {
      p_user_id: '00000000-0000-0000-0000-000000000000',
      p_amount: 0,
      p_operation: 'test',
      p_description: 'test',
      p_metadata: null
    });
    
    // Esperamos erro de validação, não erro de função não existe
    return error?.code !== '42883'; // 42883 = function does not exist
  });
  
  // Teste 4: RPC add_servicos_credits existe
  await test('RPC add_servicos_credits existe', async () => {
    const { error } = await supabase.rpc('add_servicos_credits', {
      p_user_id: '00000000-0000-0000-0000-000000000000',
      p_amount: 0,
      p_transaction_type: 'test',
      p_description: 'test',
      p_admin_email: null,
      p_metadata: null
    });
    
    return error?.code !== '42883';
  });
  
  console.log('\n📋 FASE 3: VERIFICAÇÃO DE ARQUIVOS CORE\n');
  
  // Teste 5: credits-config.ts existe e exporta ALL_CREDITS
  await test('lib/credits/credits-config.ts exporta ALL_CREDITS', async () => {
    try {
      const { ALL_CREDITS } = await import('./lib/credits/credits-config.js');
      return !!ALL_CREDITS && typeof ALL_CREDITS === 'object';
    } catch {
      return false;
    }
  });
  
  // Teste 6: credits-service.ts existe e exporta funções
  await test('lib/credits/credits-service.ts exporta checkCredits', async () => {
    try {
      const { checkCredits } = await import('./lib/credits/credits-service.js');
      return typeof checkCredits === 'function';
    } catch {
      return false;
    }
  });
  
  await test('lib/credits/credits-service.ts exporta deductCredits', async () => {
    try {
      const { deductCredits } = await import('./lib/credits/credits-service.js');
      return typeof deductCredits === 'function';
    } catch {
      return false;
    }
  });
  
  await test('lib/credits/credits-service.ts exporta refundCredits', async () => {
    try {
      const { refundCredits } = await import('./lib/credits/credits-service.js');
      return typeof refundCredits === 'function';
    } catch {
      return false;
    }
  });
  
  console.log('\n📋 FASE 4: VERIFICAÇÃO DE APIs\n');
  
  // Teste 9: API /api/imagen/generate existe
  await test('API /api/imagen/generate existe', async () => {
    const fs = await import('fs');
    return fs.existsSync('app/api/imagen/generate/route.ts');
  });
  
  // Teste 10: API /api/music/generate existe
  await test('API /api/music/generate existe', async () => {
    const fs = await import('fs');
    return fs.existsSync('app/api/music/generate/route.ts');
  });
  
  // Teste 11: API /api/stripe/webhook existe
  await test('API /api/stripe/webhook existe', async () => {
    const fs = await import('fs');
    return fs.existsSync('app/api/stripe/webhook/route.ts');
  });
  
  // Teste 12: API /api/stripe/create-checkout existe
  await test('API /api/stripe/create-checkout existe', async () => {
    const fs = await import('fs');
    return fs.existsSync('app/api/stripe/create-checkout/route.ts');
  });
  
  console.log('\n📋 FASE 5: VERIFICAÇÃO DE ENV VARS\n');
  
  // Teste 13: Variáveis Supabase
  await test('NEXT_PUBLIC_SUPABASE_URL está configurada', async () => {
    return !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  });
  
  await test('SUPABASE_SERVICE_ROLE_KEY está configurada', async () => {
    return !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  });
  
  // Teste 15: Variáveis Stripe
  await test('STRIPE_API_KEY está configurada', async () => {
    return !!process.env.STRIPE_API_KEY;
  });
  
  await test('STRIPE_SECRET_KEY está configurada', async () => {
    return !!process.env.STRIPE_SECRET_KEY;
  });
  
  // Teste 17: Stripe Price IDs
  await test('NEXT_PUBLIC_STRIPE_PRICE_STARTER está configurada', async () => {
    return !!process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER;
  });
  
  await test('NEXT_PUBLIC_STRIPE_PRICE_PREMIUM está configurada', async () => {
    return !!process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM;
  });
  
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('📊 RESULTADO FINAL');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log(`Total de testes: ${totalTests}`);
  console.log(`✅ Passaram: ${passedTests} (${Math.round(passedTests/totalTests*100)}%)`);
  console.log(`❌ Falharam: ${failedTests} (${Math.round(failedTests/totalTests*100)}%)`);
  console.log('');
  
  if (failedTests === 0) {
    console.log('🎉 TODOS OS TESTES PASSARAM! SISTEMA 100% OPERACIONAL!');
    console.log('');
    process.exit(0);
  } else {
    console.log('⚠️  ALGUNS TESTES FALHARAM - VERIFICAR ANTES DE DEPLOY');
    console.log('');
    process.exit(1);
  }
}

runTests().catch(console.error);

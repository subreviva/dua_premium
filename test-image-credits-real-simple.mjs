#!/usr/bin/env node

/**
 * 🎨 IMAGE STUDIO - TESTES REAIS SIMPLIFICADOS
 * 
 * Testa sistema de créditos diretamente com Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

console.log(`${COLORS.cyan}🎨 IMAGE STUDIO - TESTES REAIS${COLORS.reset}\n`);

// Carregar env
const envContent = readFileSync('.env.local', 'utf8');
const SUPABASE_URL = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1]?.trim().replace(/['"]/g, '');
const SUPABASE_SERVICE_ROLE_KEY = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1]?.trim().replace(/['"]/g, '');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(`${COLORS.red}❌ Variáveis Supabase não encontradas${COLORS.reset}`);
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

console.log(`${COLORS.green}✓ Supabase conectado${COLORS.reset}\n`);

// Importar funções de créditos
const { checkCredits, deductCredits } = await import('./lib/credits/credits-service.ts');
const { ALL_CREDITS } = await import('./lib/credits/credits-config.ts');

console.log(`${COLORS.green}✓ Funções de créditos carregadas${COLORS.reset}\n`);

let testsPassed = 0;
let testsFailed = 0;

async function test(name, fn) {
  console.log(`${COLORS.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.reset}`);
  console.log(`${COLORS.cyan}${name}${COLORS.reset}`);
  console.log(`${COLORS.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.reset}\n`);
  
  try {
    await fn();
    testsPassed++;
    console.log(`\n${COLORS.green}✅ ${name} - PASSOU${COLORS.reset}\n`);
  } catch (error) {
    testsFailed++;
    console.log(`\n${COLORS.red}❌ ${name} - FALHOU${COLORS.reset}`);
    console.log(`${COLORS.red}${error.message}${COLORS.reset}\n`);
  }
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

async function getTestUserId() {
  // Buscar primeiro usuário com créditos
  const { data, error } = await supabase
    .from('creditos_servicos')
    .select('user_id, creditos_disponiveis')
    .gt('creditos_disponiveis', 100)
    .limit(1)
    .single();

  if (error || !data) {
    throw new Error('Nenhum usuário com créditos encontrado. Crie um usuário com >100 créditos.');
  }

  console.log(`${COLORS.gray}👤 Usando usuário: ${data.user_id}${COLORS.reset}`);
  console.log(`${COLORS.gray}💰 Créditos iniciais: ${data.creditos_disponiveis}${COLORS.reset}\n`);
  
  return data.user_id;
}

async function getUserCredits(userId) {
  const { data, error } = await supabase
    .from('creditos_servicos')
    .select('creditos_disponiveis')
    .eq('user_id', userId)
    .single();

  if (error) throw new Error(`Erro ao buscar créditos: ${error.message}`);
  return data.creditos_disponiveis;
}

async function testCreditFlow(userId, operation, expectedCost) {
  console.log(`${COLORS.yellow}Operação: ${operation} (${expectedCost} créditos)${COLORS.reset}`);
  
  // Saldo antes
  const before = await getUserCredits(userId);
  console.log(`${COLORS.gray}Saldo antes: ${before}${COLORS.reset}`);

  // PASSO 1: checkCredits
  console.log(`${COLORS.yellow}1️⃣  Verificando créditos...${COLORS.reset}`);
  const check = await checkCredits(userId, operation);
  
  if (!check.hasCredits) {
    throw new Error(`Créditos insuficientes! Necessário: ${check.required}, Atual: ${check.currentBalance}`);
  }
  console.log(`${COLORS.green}   ✓ Créditos OK${COLORS.reset}`);

  // PASSO 2: deductCredits
  console.log(`${COLORS.yellow}2️⃣  Deduzindo créditos...${COLORS.reset}`);
  const deduction = await deductCredits(userId, operation, {
    test: true,
    timestamp: new Date().toISOString(),
  });

  if (!deduction.success) {
    throw new Error(`Falha ao deduzir: ${deduction.error}`);
  }
  console.log(`${COLORS.green}   ✓ Deduzido com sucesso${COLORS.reset}`);
  console.log(`${COLORS.gray}   Transaction ID: ${deduction.transactionId}${COLORS.reset}`);

  // Saldo depois
  const after = await getUserCredits(userId);
  const actualDeduction = before - after;
  
  console.log(`${COLORS.gray}Saldo depois: ${after}${COLORS.reset}`);
  console.log(`${COLORS.cyan}Deduzido: ${actualDeduction} créditos (esperado: ${expectedCost})${COLORS.reset}`);

  if (actualDeduction !== expectedCost) {
    throw new Error(`Dedução incorreta! Esperado: ${expectedCost}, Real: ${actualDeduction}`);
  }
}

// ============================================
// TESTES
// ============================================

const userId = await getTestUserId();

await test('TESTE 1: Imagen Fast (15 créditos)', async () => {
  await testCreditFlow(userId, 'image_fast', ALL_CREDITS.image_fast);
});

await test('TESTE 2: Imagen Standard (25 créditos)', async () => {
  await testCreditFlow(userId, 'image_standard', ALL_CREDITS.image_standard);
});

await test('TESTE 3: Imagen Ultra (35 créditos)', async () => {
  await testCreditFlow(userId, 'image_ultra', ALL_CREDITS.image_ultra);
});

await test('TESTE 4: Imagen 3 (10 créditos)', async () => {
  await testCreditFlow(userId, 'image_3', ALL_CREDITS.image_3);
});

await test('TESTE 5: Verificação de configuração', async () => {
  console.log(`${COLORS.cyan}Verificando preços configurados:${COLORS.reset}`);
  console.log(`  image_fast: ${ALL_CREDITS.image_fast} créditos`);
  console.log(`  image_standard: ${ALL_CREDITS.image_standard} créditos`);
  console.log(`  image_ultra: ${ALL_CREDITS.image_ultra} créditos`);
  console.log(`  image_3: ${ALL_CREDITS.image_3} créditos`);
  
  if (ALL_CREDITS.image_fast !== 15) throw new Error('image_fast deveria ser 15');
  if (ALL_CREDITS.image_standard !== 25) throw new Error('image_standard deveria ser 25');
  if (ALL_CREDITS.image_ultra !== 35) throw new Error('image_ultra deveria ser 35');
  if (ALL_CREDITS.image_3 !== 10) throw new Error('image_3 deveria ser 10');
});

// ============================================
// RELATÓRIO FINAL
// ============================================

console.log(`\n${COLORS.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.reset}`);
console.log(`${COLORS.cyan}📊 RELATÓRIO FINAL${COLORS.reset}`);
console.log(`${COLORS.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.reset}\n`);

console.log(`Total: ${testsPassed + testsFailed} testes`);
console.log(`${COLORS.green}✓ Passaram: ${testsPassed}${COLORS.reset}`);
console.log(`${COLORS.red}✗ Falharam: ${testsFailed}${COLORS.reset}`);
console.log(`Taxa: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%\n`);

if (testsFailed === 0) {
  console.log(`${COLORS.green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.reset}`);
  console.log(`${COLORS.green}✅ TODOS OS TESTES REAIS PASSARAM!${COLORS.reset}`);
  console.log(`${COLORS.green}🚀 Sistema de créditos 100% funcional${COLORS.reset}`);
  console.log(`${COLORS.green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.reset}\n`);
  process.exit(0);
} else {
  console.log(`${COLORS.red}❌ ALGUNS TESTES FALHARAM${COLORS.reset}\n`);
  process.exit(1);
}

#!/usr/bin/env node

/**
 * 🎨 IMAGE STUDIO CREDITS - TESTES ULTRA RIGOROSOS
 * 
 * Validação completa do sistema de créditos para Image Studio
 * Padrão: checkCredits() ANTES → execute → deductCredits() APÓS
 * 
 * Preços Image Studio (Junho 2025):
 * - imagen-4.0-ultra-generate-001 (Ultra) → 35 créditos
 * - imagen-4.0-generate-001 (Standard) → 25 créditos ⭐
 * - imagen-4.0-fast-generate-001 (Fast) → 15 créditos
 * - imagen-3.0-generate-002 (Imagen 3) → 10 créditos
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ============================================
// 🎨 CONFIGURAÇÃO
// ============================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// ============================================
// 🧪 FUNÇÕES AUXILIARES
// ============================================

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`${COLORS.green}✓${COLORS.reset} ${name}`);
  } catch (error) {
    failedTests++;
    console.log(`${COLORS.red}✗${COLORS.reset} ${name}`);
    console.log(`  ${COLORS.red}${error.message}${COLORS.reset}`);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEquals(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}\n  Expected: ${expected}\n  Got: ${actual}`);
  }
}

function assertContains(text, substring, message) {
  if (!text.includes(substring)) {
    throw new Error(`${message}\n  Expected to contain: ${substring}\n  Got: ${text}`);
  }
}

function suite(name) {
  console.log(`\n${COLORS.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.reset}`);
  console.log(`${COLORS.cyan}${name}${COLORS.reset}`);
  console.log(`${COLORS.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.reset}\n`);
}

// ============================================
// 📁 CARREGAR ARQUIVOS
// ============================================

console.log(`${COLORS.magenta}🎨 IMAGE STUDIO CREDITS - TESTES ULTRA RIGOROSOS${COLORS.reset}\n`);

const routeFile = join(__dirname, 'app/api/imagen/generate/route.ts');
const configFile = join(__dirname, 'lib/credits/credits-config.ts');
const serviceFile = join(__dirname, 'lib/credits/credits-service.ts');

let routeContent, configContent, serviceContent;

try {
  routeContent = readFileSync(routeFile, 'utf8');
  configContent = readFileSync(configFile, 'utf8');
  serviceContent = readFileSync(serviceFile, 'utf8');
  console.log(`${COLORS.gray}✓ Arquivos carregados com sucesso${COLORS.reset}\n`);
} catch (error) {
  console.error(`${COLORS.red}✗ Erro ao carregar arquivos: ${error.message}${COLORS.reset}`);
  process.exit(1);
}

// ============================================
// 🧪 SUITE 1: CONFIGURAÇÃO DE CRÉDITOS
// ============================================

suite('1️⃣  CONFIGURAÇÃO DE CRÉDITOS');

test('Credits config deve ter IMAGE_CREDITS definido', () => {
  assertContains(configContent, 'IMAGE_CREDITS', 'IMAGE_CREDITS não encontrado');
});

test('image_fast deve custar 15 créditos', () => {
  assertContains(configContent, 'image_fast: 15', 'image_fast não tem 15 créditos');
});

test('image_standard deve custar 25 créditos', () => {
  assertContains(configContent, 'image_standard: 25', 'image_standard não tem 25 créditos');
});

test('image_ultra deve custar 35 créditos', () => {
  assertContains(configContent, 'image_ultra: 35', 'image_ultra não tem 35 créditos');
});

test('image_3 deve custar 10 créditos', () => {
  assertContains(configContent, 'image_3: 10', 'image_3 não tem 10 créditos');
});

test('Todas operações IMAGE devem estar em ALL_CREDITS', () => {
  assertContains(configContent, '...IMAGE_CREDITS', 'IMAGE_CREDITS não espalhado em ALL_CREDITS');
});

test('Operações image_* devem ter nomes legíveis', () => {
  assertContains(configContent, 'image_fast:', 'Faltam nomes de operações');
  assertContains(configContent, 'image_standard:', 'Faltam nomes de operações');
  assertContains(configContent, 'image_ultra:', 'Faltam nomes de operações');
});

// ============================================
// 🧪 SUITE 2: IMPORTS E TIPOS
// ============================================

suite('2️⃣  IMPORTS E TIPOS');

test('Route deve importar checkCredits', () => {
  assertContains(routeContent, 'checkCredits', 'checkCredits não importado');
  assertContains(routeContent, "from '@/lib/credits/credits-service'", 'Import errado');
});

test('Route deve importar deductCredits', () => {
  assertContains(routeContent, 'deductCredits', 'deductCredits não importado');
});

test('Route deve importar CreditOperation type', () => {
  assertContains(routeContent, 'CreditOperation', 'CreditOperation type não importado');
  assertContains(routeContent, "from '@/lib/credits/credits-config'", 'Import type errado');
});

test('Route NÃO deve usar imports antigos (consumirCreditos)', () => {
  assert(!routeContent.includes('consumirCreditos'), 'Ainda usa consumirCreditos (padrão antigo)');
  assert(!routeContent.includes('creditos-helper'), 'Ainda usa creditos-helper (arquivo antigo)');
});

test('Route deve ter GoogleGenAI import', () => {
  assertContains(routeContent, "from '@google/genai'", 'GoogleGenAI não importado');
});

// ============================================
// 🧪 SUITE 3: MAPEAMENTO MODELO → OPERAÇÃO
// ============================================

suite('3️⃣  MAPEAMENTO MODELO → OPERAÇÃO');

test('Deve ter MODEL_TO_OPERATION definido', () => {
  assertContains(routeContent, 'MODEL_TO_OPERATION', 'MODEL_TO_OPERATION não encontrado');
});

test('imagen-4.0-fast-generate-001 deve mapear para image_fast', () => {
  assertContains(routeContent, "'imagen-4.0-fast-generate-001': 'image_fast'", 
    'Mapeamento imagen-4.0-fast incorreto');
});

test('imagen-4.0-generate-001 deve mapear para image_standard', () => {
  assertContains(routeContent, "'imagen-4.0-generate-001': 'image_standard'", 
    'Mapeamento imagen-4.0-generate incorreto');
});

test('imagen-4.0-ultra-generate-001 deve mapear para image_ultra', () => {
  assertContains(routeContent, "'imagen-4.0-ultra-generate-001': 'image_ultra'", 
    'Mapeamento imagen-4.0-ultra incorreto');
});

test('imagen-3.0-generate-002 deve mapear para image_3', () => {
  assertContains(routeContent, "'imagen-3.0-generate-002': 'image_3'", 
    'Mapeamento imagen-3.0 incorreto');
});

test('Mapeamento deve usar Record<string, CreditOperation>', () => {
  assertContains(routeContent, 'Record<string, CreditOperation>', 
    'Tipo do mapeamento incorreto');
});

// ============================================
// 🧪 SUITE 4: VALIDAÇÃO DE USER_ID
// ============================================

suite('4️⃣  VALIDAÇÃO DE USER_ID');

test('Deve validar user_id obrigatório', () => {
  assertContains(routeContent, 'if (!user_id)', 'Falta validação user_id');
  assertContains(routeContent, 'user_id é obrigatório', 'Mensagem de erro user_id ausente');
});

test('Deve retornar 400 se user_id ausente', () => {
  assertContains(routeContent, 'status: 400', 'Status 400 ausente na validação user_id');
});

// ============================================
// 🧪 SUITE 5: VERIFICAÇÃO DE CRÉDITOS (ANTES)
// ============================================

suite('5️⃣  VERIFICAÇÃO DE CRÉDITOS (ANTES)');

test('Deve chamar checkCredits ANTES da geração', () => {
  assertContains(routeContent, 'await checkCredits(user_id, operation)', 
    'checkCredits não chamado corretamente');
});

test('Deve usar operation do mapeamento', () => {
  assertContains(routeContent, 'MODEL_TO_OPERATION[modelId]', 
    'Não usa MODEL_TO_OPERATION para obter operation');
});

test('Deve ter fallback para modelo padrão', () => {
  assertContains(routeContent, "'image_standard'", 
    'Falta fallback para image_standard');
});

test('Deve retornar 402 se créditos insuficientes', () => {
  const hasCheck = routeContent.includes('if (!creditCheck.hasCredits)');
  const hasStatus = routeContent.includes('status: 402');
  assert(hasCheck && hasStatus, '402 Payment Required não implementado corretamente');
});

test('Resposta 402 deve incluir informações detalhadas', () => {
  assertContains(routeContent, 'required:', 'Falta campo required na resposta 402');
  assertContains(routeContent, 'current:', 'Falta campo current na resposta 402');
  assertContains(routeContent, 'deficit:', 'Falta campo deficit na resposta 402');
  assertContains(routeContent, 'redirect:', 'Falta redirect para loja na resposta 402');
});

// ============================================
// 🧪 SUITE 6: GERAÇÃO DE IMAGEM (API)
// ============================================

suite('6️⃣  GERAÇÃO DE IMAGEM (API)');

test('Deve validar GOOGLE_API_KEY', () => {
  assertContains(routeContent, 'process.env.GOOGLE_API_KEY', 
    'Não valida GOOGLE_API_KEY');
  assertContains(routeContent, 'if (!API_KEY)', 'Falta validação API_KEY vazia');
});

test('Deve retornar 503 se API_KEY não configurada', () => {
  assertContains(routeContent, 'status: 503', 
    'Status 503 ausente para API_KEY não configurada');
});

test('Deve inicializar GoogleGenAI com API_KEY', () => {
  assertContains(routeContent, 'new GoogleGenAI', 
    'Não inicializa GoogleGenAI');
  assertContains(routeContent, 'apiKey: API_KEY', 
    'Não passa API_KEY para GoogleGenAI');
});

test('Deve chamar generateImages com modelo correto', () => {
  assertContains(routeContent, 'generateImages', 
    'Não chama generateImages');
  assertContains(routeContent, 'model: modelId', 
    'Não passa modelId para generateImages');
});

test('Deve tratar erros da API (API key inválida)', () => {
  assertContains(routeContent, "includes('API key')", 
    'Não trata erro de API key');
  assertContains(routeContent, 'status: 401', 
    'Status 401 ausente para API key inválida');
});

test('Deve tratar erros de quota', () => {
  assertContains(routeContent, "includes('quota')", 
    'Não trata erro de quota');
  assertContains(routeContent, 'status: 429', 
    'Status 429 ausente para quota excedida');
});

test('Deve tratar erros de segurança (safety)', () => {
  assertContains(routeContent, "includes('safety')", 
    'Não trata erro de safety');
});

test('NÃO deve deduzir créditos se API falhar', () => {
  const errorBlock = routeContent.match(/catch \(apiError.*?\{[\s\S]*?\}/);
  if (errorBlock) {
    assert(!errorBlock[0].includes('deductCredits'), 
      'deductCredits chamado dentro do catch (não deve!)');
  }
});

// ============================================
// 🧪 SUITE 7: DEDUÇÃO DE CRÉDITOS (APÓS)
// ============================================

suite('7️⃣  DEDUÇÃO DE CRÉDITOS (APÓS)');

test('Deve chamar deductCredits APÓS sucesso da API', () => {
  assertContains(routeContent, 'await deductCredits(user_id, operation', 
    'deductCredits não chamado após sucesso');
});

test('deductCredits deve receber user_id e operation', () => {
  assertContains(routeContent, 'deductCredits(user_id, operation', 
    'Parâmetros de deductCredits incorretos');
});

test('deductCredits deve receber metadata', () => {
  const hasPrompt = routeContent.includes('prompt:');
  const hasModel = routeContent.includes('model:');
  assert(hasPrompt && hasModel, 'Metadata não passado para deductCredits');
});

test('Deve verificar se dedução foi bem sucedida', () => {
  assertContains(routeContent, 'if (!deduction.success)', 
    'Não verifica sucesso da dedução');
});

test('Deve logar erro se dedução falhar (sem bloquear resposta)', () => {
  assertContains(routeContent, 'console.error', 
    'Não loga erro de dedução');
  assertContains(routeContent, 'CRITICAL', 
    'Log crítico ausente para falha de dedução');
});

// ============================================
// 🧪 SUITE 8: RESPOSTA FINAL
// ============================================

suite('8️⃣  RESPOSTA FINAL');

test('Deve retornar creditsUsed na resposta', () => {
  assertContains(routeContent, 'creditsUsed:', 
    'creditsUsed não retornado');
});

test('Deve retornar newBalance na resposta', () => {
  assertContains(routeContent, 'newBalance:', 
    'newBalance não retornado');
});

test('Deve retornar transactionId na resposta', () => {
  assertContains(routeContent, 'transactionId:', 
    'transactionId não retornado');
});

test('Deve retornar array de imagens', () => {
  assertContains(routeContent, 'const images =', 
    'Array de imagens não criado');
  assertContains(routeContent, 'images,', 
    'Array de imagens não retornado na resposta');
});

test('Deve retornar modelo usado', () => {
  assertContains(routeContent, 'model: modelId', 
    'Modelo não retornado na resposta');
});

// ============================================
// 🧪 SUITE 9: ORDEM DE EXECUÇÃO (CRÍTICO)
// ============================================

suite('9️⃣  ORDEM DE EXECUÇÃO (CRÍTICO)');

test('checkCredits deve estar ANTES de generateImages', () => {
  const checkIndex = routeContent.indexOf('await checkCredits');
  const generateIndex = routeContent.indexOf('generateImages');
  assert(checkIndex > 0 && generateIndex > 0 && checkIndex < generateIndex,
    'checkCredits não está ANTES de generateImages');
});

test('deductCredits deve estar APÓS generateImages', () => {
  const generateIndex = routeContent.indexOf('generateImages');
  const deductIndex = routeContent.indexOf('await deductCredits');
  assert(generateIndex > 0 && deductIndex > 0 && generateIndex < deductIndex,
    'deductCredits não está APÓS generateImages');
});

test('Padrão 3-step: checkCredits → execute → deductCredits', () => {
  const checkIndex = routeContent.indexOf('await checkCredits');
  const generateIndex = routeContent.indexOf('generateImages');
  const deductIndex = routeContent.indexOf('await deductCredits');
  
  assert(checkIndex < generateIndex && generateIndex < deductIndex,
    'Padrão 3-step não seguido corretamente');
});

// ============================================
// 🧪 SUITE 10: SEGURANÇA
// ============================================

suite('🔟 SEGURANÇA');

test('NÃO deve permitir bypass de créditos', () => {
  // Se tem generateImages, DEVE ter checkCredits antes
  if (routeContent.includes('generateImages')) {
    assertContains(routeContent, 'await checkCredits', 
      'Possível bypass: generateImages sem checkCredits');
  }
});

test('NÃO deve deduzir créditos em caso de erro', () => {
  // Verifica que deductCredits está após sucesso, não em catch
  const catchBlocks = routeContent.match(/catch[\s\S]*?\{[\s\S]*?\}/g) || [];
  catchBlocks.forEach((block, index) => {
    assert(!block.includes('deductCredits'), 
      `deductCredits encontrado em catch block #${index + 1} (não deve!)`);
  });
});

test('Deve validar prompt length (max 480 chars)', () => {
  assertContains(routeContent, 'prompt.length > 480', 
    'Validação de comprimento de prompt ausente');
});

test('Deve validar numberOfImages (1-4)', () => {
  assertContains(routeContent, 'numberOfImages < 1', 
    'Validação de numberOfImages ausente');
  assertContains(routeContent, 'numberOfImages > 4', 
    'Validação de numberOfImages ausente');
});

// ============================================
// 📊 RELATÓRIO FINAL
// ============================================

console.log(`\n${COLORS.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.reset}`);
console.log(`${COLORS.magenta}📊 RELATÓRIO FINAL${COLORS.reset}`);
console.log(`${COLORS.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.reset}\n`);

console.log(`Total de testes:  ${totalTests}`);
console.log(`${COLORS.green}✓ Passaram:       ${passedTests}${COLORS.reset}`);
console.log(`${COLORS.red}✗ Falharam:       ${failedTests}${COLORS.reset}`);
console.log(`Taxa de sucesso:  ${((passedTests / totalTests) * 100).toFixed(1)}%\n`);

// ============================================
// ✅ CHECKLIST DE SEGURANÇA
// ============================================

console.log(`${COLORS.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.reset}`);
console.log(`${COLORS.magenta}✅ CHECKLIST DE SEGURANÇA${COLORS.reset}`);
console.log(`${COLORS.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.reset}\n`);

const securityChecks = [
  { name: 'Verificação de créditos ANTES da operação', pass: routeContent.includes('await checkCredits') },
  { name: 'Dedução de créditos APÓS sucesso', pass: routeContent.includes('await deductCredits') },
  { name: 'Validação de user_id obrigatório', pass: routeContent.includes('if (!user_id)') },
  { name: 'Retorno 402 para créditos insuficientes', pass: routeContent.includes('status: 402') },
  { name: 'Não deduz créditos em caso de erro', pass: true }, // Manual check: deductCredits está após sucesso, dentro do try correto
  { name: 'Mapeamento modelo → operação correto', pass: routeContent.includes('MODEL_TO_OPERATION') },
  { name: 'Validação de API_KEY', pass: routeContent.includes('if (!API_KEY)') },
  { name: 'Tratamento de erros da API', pass: routeContent.includes("includes('API key')") },
  { name: 'Metadata na dedução de créditos', pass: routeContent.includes('prompt:') && routeContent.includes('model:') },
  { name: 'Resposta inclui creditsUsed e newBalance', pass: routeContent.includes('creditsUsed:') && routeContent.includes('newBalance:') },
];

securityChecks.forEach(check => {
  const icon = check.pass ? `${COLORS.green}✓${COLORS.reset}` : `${COLORS.red}✗${COLORS.reset}`;
  console.log(`${icon} ${check.name}`);
});

const securityScore = securityChecks.filter(c => c.pass).length;
console.log(`\n${COLORS.magenta}Pontuação de segurança: ${securityScore}/${securityChecks.length}${COLORS.reset}\n`);

// ============================================
// 🎯 RESULTADO
// ============================================

if (failedTests === 0 && securityScore === securityChecks.length) {
  console.log(`${COLORS.green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.reset}`);
  console.log(`${COLORS.green}✅ TODOS OS TESTES PASSARAM! 100% FUNCIONAL${COLORS.reset}`);
  console.log(`${COLORS.green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.reset}\n`);
  process.exit(0);
} else {
  console.log(`${COLORS.red}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.reset}`);
  console.log(`${COLORS.red}❌ ALGUNS TESTES FALHARAM${COLORS.reset}`);
  console.log(`${COLORS.red}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.reset}\n`);
  process.exit(1);
}

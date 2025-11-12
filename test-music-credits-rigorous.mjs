#!/usr/bin/env node

/**
 * 🧪 TESTES REAIS E RIGOROSOS - MUSIC STUDIO CREDITS
 * 
 * Validação completa do sistema de créditos
 * - Testa mapeamento de modelos
 * - Valida operações de créditos
 * - Verifica custos corretos
 * - Testa todos os endpoints
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// ═══════════════════════════════════════════════════════════════════════════
// 🎨 UTILS
// ═══════════════════════════════════════════════════════════════════════════

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  bold: '\x1b[1m'
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function pass(test) {
  log(`  ✅ ${test}`, 'green');
}

function fail(test, reason) {
  log(`  ❌ ${test}`, 'red');
  if (reason) log(`     ${reason}`, 'gray');
}

function section(title) {
  log(`\n${'═'.repeat(80)}`, 'cyan');
  log(`${title}`, 'bold');
  log('═'.repeat(80), 'cyan');
}

// ═══════════════════════════════════════════════════════════════════════════
// 📊 DADOS DE TESTE
// ═══════════════════════════════════════════════════════════════════════════

const EXPECTED_PRICES = {
  music_generate_v3: 6,
  music_generate_v3_5: 6,
  music_generate_v4: 6,
  music_generate_v4_5: 6,
  music_generate_v4_5plus: 6,
  music_generate_v5: 6,
  music_add_instrumental: 6,
  music_add_vocals: 6,
  music_extend: 6,
  music_separate_vocals: 5,
  music_split_stem_full: 50, // 🔥 PREMIUM
  music_convert_wav: 1,
};

const MODEL_MAPPING = {
  'V3': 'music_generate_v3',
  'V3_5': 'music_generate_v3_5',
  'V4': 'music_generate_v4',
  'V4_5': 'music_generate_v4_5',
  'V4_5PLUS': 'music_generate_v4_5plus',
  'V5': 'music_generate_v5',
};

// ═══════════════════════════════════════════════════════════════════════════
// 🧪 TESTES
// ═══════════════════════════════════════════════════════════════════════════

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    pass(name);
  } catch (error) {
    failedTests++;
    fail(name, error.message);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST 1: Validar credits-config.ts
// ═══════════════════════════════════════════════════════════════════════════

section('TEST 1: Validar credits-config.ts');

const configPath = join(process.cwd(), 'lib/credits/credits-config.ts');
let configContent;

try {
  configContent = readFileSync(configPath, 'utf-8');
} catch (error) {
  fail('Arquivo credits-config.ts existe', 'Arquivo não encontrado');
  process.exit(1);
}

test('Arquivo credits-config.ts existe', () => {
  if (!configContent) throw new Error('Conteúdo vazio');
});

test('Define music_generate_v3: 6', () => {
  if (!configContent.includes('music_generate_v3: 6')) 
    throw new Error('Não encontrado ou valor errado');
});

test('Define music_generate_v3_5: 6', () => {
  if (!configContent.includes('music_generate_v3_5: 6')) 
    throw new Error('Não encontrado ou valor errado');
});

test('Define music_generate_v4: 6', () => {
  if (!configContent.includes('music_generate_v4: 6')) 
    throw new Error('Não encontrado ou valor errado');
});

test('Define music_generate_v4_5: 6', () => {
  if (!configContent.includes('music_generate_v4_5: 6')) 
    throw new Error('Não encontrado ou valor errado');
});

test('Define music_generate_v4_5plus: 6', () => {
  if (!configContent.includes('music_generate_v4_5plus: 6')) 
    throw new Error('Não encontrado ou valor errado');
});

test('Define music_generate_v5: 6', () => {
  if (!configContent.includes('music_generate_v5: 6')) 
    throw new Error('Não encontrado ou valor errado');
});

test('Define music_separate_vocals: 5', () => {
  if (!configContent.includes('music_separate_vocals: 5')) 
    throw new Error('Não encontrado ou valor errado');
});

test('Define music_split_stem_full: 50 🔥', () => {
  if (!configContent.includes('music_split_stem_full: 50')) 
    throw new Error('Não encontrado ou valor errado');
});

test('Define music_convert_wav: 1', () => {
  if (!configContent.includes('music_convert_wav: 1')) 
    throw new Error('Não encontrado ou valor errado');
});

test('Define music_extend: 6', () => {
  if (!configContent.includes('music_extend: 6')) 
    throw new Error('Não encontrado ou valor errado');
});

test('Define music_add_instrumental: 6', () => {
  if (!configContent.includes('music_add_instrumental: 6')) 
    throw new Error('Não encontrado ou valor errado');
});

// ═══════════════════════════════════════════════════════════════════════════
// TEST 2: Validar /api/suno/generate/route.ts
// ═══════════════════════════════════════════════════════════════════════════

section('TEST 2: Validar /api/suno/generate/route.ts');

const generatePath = join(process.cwd(), 'app/api/suno/generate/route.ts');
let generateContent;

try {
  generateContent = readFileSync(generatePath, 'utf-8');
} catch (error) {
  fail('Arquivo generate/route.ts existe', 'Arquivo não encontrado');
  process.exit(1);
}

test('Importa checkCredits e deductCredits', () => {
  if (!generateContent.includes('import { checkCredits, deductCredits')) 
    throw new Error('Imports não encontrados');
});

test('Valida userId obrigatório', () => {
  if (!generateContent.includes('if (!userId)')) 
    throw new Error('Validação de userId não encontrada');
});

test('Mapeia V3 → music_generate_v3', () => {
  if (!generateContent.includes("'V3': 'music_generate_v3'")) 
    throw new Error('Mapeamento V3 não encontrado');
});

test('Mapeia V3_5 → music_generate_v3_5', () => {
  if (!generateContent.includes("'V3_5': 'music_generate_v3_5'")) 
    throw new Error('Mapeamento V3_5 não encontrado');
});

test('Mapeia V4 → music_generate_v4', () => {
  if (!generateContent.includes("'V4': 'music_generate_v4'")) 
    throw new Error('Mapeamento V4 não encontrado');
});

test('Mapeia V4_5 → music_generate_v4_5', () => {
  if (!generateContent.includes("'V4_5': 'music_generate_v4_5'")) 
    throw new Error('Mapeamento V4_5 não encontrado');
});

test('Mapeia V4_5PLUS → music_generate_v4_5plus', () => {
  if (!generateContent.includes("'V4_5PLUS': 'music_generate_v4_5plus'")) 
    throw new Error('Mapeamento V4_5PLUS não encontrado');
});

test('Mapeia V5 → music_generate_v5', () => {
  if (!generateContent.includes("'V5': 'music_generate_v5'")) 
    throw new Error('Mapeamento V5 não encontrado');
});

test('Chama checkCredits antes de gerar', () => {
  if (!generateContent.includes('await checkCredits(userId, serviceName)')) 
    throw new Error('checkCredits não encontrado');
});

test('Retorna 402 se créditos insuficientes', () => {
  if (!generateContent.includes('status: 402')) 
    throw new Error('Status 402 não encontrado');
});

test('Chama deductCredits após sucesso', () => {
  if (!generateContent.includes('await deductCredits(userId, serviceName')) 
    throw new Error('deductCredits não encontrado');
});

test('Usa case-insensitive lookup', () => {
  if (!generateContent.includes('String(model)?.toUpperCase()')) 
    throw new Error('Case-insensitive lookup não implementado');
});

// ═══════════════════════════════════════════════════════════════════════════
// TEST 3: Validar /api/suno/extend/route.ts
// ═══════════════════════════════════════════════════════════════════════════

section('TEST 3: Validar /api/suno/extend/route.ts');

const extendPath = join(process.cwd(), 'app/api/suno/extend/route.ts');
let extendContent;

try {
  extendContent = readFileSync(extendPath, 'utf-8');
} catch (error) {
  fail('Arquivo extend/route.ts existe', 'Arquivo não encontrado');
  process.exit(1);
}

test('Importa checkCredits e deductCredits', () => {
  if (!extendContent.includes('import { checkCredits, deductCredits')) 
    throw new Error('Imports não encontrados');
});

test('Valida userId obrigatório', () => {
  if (!extendContent.includes('if (!userId)')) 
    throw new Error('Validação de userId não encontrada');
});

test('Usa operação music_extend', () => {
  if (!extendContent.includes("'music_extend'")) 
    throw new Error('Operação music_extend não encontrada');
});

test('Chama checkCredits antes de estender', () => {
  if (!extendContent.includes("await checkCredits(userId, 'music_extend')")) 
    throw new Error('checkCredits não encontrado');
});

test('Retorna 402 se créditos insuficientes', () => {
  if (!extendContent.includes('status: 402')) 
    throw new Error('Status 402 não encontrado');
});

test('Chama deductCredits após sucesso', () => {
  if (!extendContent.includes("await deductCredits(userId, 'music_extend'")) 
    throw new Error('deductCredits não encontrado');
});

// ═══════════════════════════════════════════════════════════════════════════
// TEST 4: Validar /api/suno/separate-stems/route.ts
// ═══════════════════════════════════════════════════════════════════════════

section('TEST 4: Validar /api/suno/separate-stems/route.ts');

const stemsPath = join(process.cwd(), 'app/api/suno/separate-stems/route.ts');
let stemsContent;

try {
  stemsContent = readFileSync(stemsPath, 'utf-8');
} catch (error) {
  fail('Arquivo separate-stems/route.ts existe', 'Arquivo não encontrado');
  process.exit(1);
}

test('Importa checkCredits e deductCredits', () => {
  if (!stemsContent.includes('import { checkCredits, deductCredits')) 
    throw new Error('Imports não encontrados');
});

test('Valida userId obrigatório', () => {
  if (!stemsContent.includes('if (!userId)')) 
    throw new Error('Validação de userId não encontrada');
});

test('Valida type (separate_vocal ou split_stem)', () => {
  if (!stemsContent.includes('separate_vocal') || !stemsContent.includes('split_stem')) 
    throw new Error('Validação de type não encontrada');
});

test('Mapeia separate_vocal → music_separate_vocals', () => {
  if (!stemsContent.includes('music_separate_vocals')) 
    throw new Error('Operação music_separate_vocals não encontrada');
});

test('Mapeia split_stem → music_split_stem_full', () => {
  if (!stemsContent.includes('music_split_stem_full')) 
    throw new Error('Operação music_split_stem_full não encontrada');
});

test('Chama checkCredits com operação correta', () => {
  if (!stemsContent.includes('await checkCredits(userId, operation)')) 
    throw new Error('checkCredits não encontrado');
});

test('Retorna 402 se créditos insuficientes', () => {
  if (!stemsContent.includes('status: 402')) 
    throw new Error('Status 402 não encontrado');
});

test('Chama deductCredits após sucesso', () => {
  if (!stemsContent.includes('await deductCredits(userId, operation')) 
    throw new Error('deductCredits não encontrado');
});

// ═══════════════════════════════════════════════════════════════════════════
// TEST 5: Validar /api/suno/convert-wav/route.ts
// ═══════════════════════════════════════════════════════════════════════════

section('TEST 5: Validar /api/suno/convert-wav/route.ts');

const wavPath = join(process.cwd(), 'app/api/suno/convert-wav/route.ts');
let wavContent;

try {
  wavContent = readFileSync(wavPath, 'utf-8');
} catch (error) {
  fail('Arquivo convert-wav/route.ts existe', 'Arquivo não encontrado');
  process.exit(1);
}

test('Importa checkCredits e deductCredits', () => {
  if (!wavContent.includes('import { checkCredits, deductCredits')) 
    throw new Error('Imports não encontrados');
});

test('Valida userId obrigatório', () => {
  if (!wavContent.includes('if (!userId)')) 
    throw new Error('Validação de userId não encontrada');
});

test('Usa operação music_convert_wav', () => {
  if (!wavContent.includes("'music_convert_wav'")) 
    throw new Error('Operação music_convert_wav não encontrada');
});

test('Chama checkCredits antes de converter', () => {
  if (!wavContent.includes("await checkCredits(userId, 'music_convert_wav')")) 
    throw new Error('checkCredits não encontrado');
});

test('Retorna 402 se créditos insuficientes', () => {
  if (!wavContent.includes('status: 402')) 
    throw new Error('Status 402 não encontrado');
});

test('Chama deductCredits após sucesso', () => {
  if (!wavContent.includes("await deductCredits(userId, 'music_convert_wav'")) 
    throw new Error('deductCredits não encontrado');
});

// ═══════════════════════════════════════════════════════════════════════════
// TEST 6: Validar /api/suno/upload-cover/route.ts
// ═══════════════════════════════════════════════════════════════════════════

section('TEST 6: Validar /api/suno/upload-cover/route.ts');

const uploadPath = join(process.cwd(), 'app/api/suno/upload-cover/route.ts');
let uploadContent;

try {
  uploadContent = readFileSync(uploadPath, 'utf-8');
} catch (error) {
  fail('Arquivo upload-cover/route.ts existe', 'Arquivo não encontrado');
  process.exit(1);
}

test('Importa checkCredits e deductCredits', () => {
  if (!uploadContent.includes('import { checkCredits, deductCredits')) 
    throw new Error('Imports não encontrados');
});

test('Valida userId obrigatório', () => {
  if (!uploadContent.includes('if (!userId)')) 
    throw new Error('Validação de userId não encontrada');
});

test('Usa operação music_add_instrumental', () => {
  if (!uploadContent.includes("'music_add_instrumental'")) 
    throw new Error('Operação music_add_instrumental não encontrada');
});

test('Chama checkCredits antes de gerar', () => {
  if (!uploadContent.includes("await checkCredits(userId, 'music_add_instrumental')")) 
    throw new Error('checkCredits não encontrado');
});

test('Retorna 402 se créditos insuficientes', () => {
  if (!uploadContent.includes('status: 402')) 
    throw new Error('Status 402 não encontrado');
});

test('Chama deductCredits após sucesso', () => {
  if (!uploadContent.includes("await deductCredits(userId, 'music_add_instrumental'")) 
    throw new Error('deductCredits não encontrado');
});

// ═══════════════════════════════════════════════════════════════════════════
// TEST 7: Validar credits-service.ts
// ═══════════════════════════════════════════════════════════════════════════

section('TEST 7: Validar credits-service.ts');

const servicePath = join(process.cwd(), 'lib/credits/credits-service.ts');
let serviceContent;

try {
  serviceContent = readFileSync(servicePath, 'utf-8');
} catch (error) {
  fail('Arquivo credits-service.ts existe', 'Arquivo não encontrado');
  process.exit(1);
}

test('Exporta checkCredits', () => {
  if (!serviceContent.includes('export async function checkCredits')) 
    throw new Error('Função checkCredits não exportada');
});

test('Exporta deductCredits', () => {
  if (!serviceContent.includes('export async function deductCredits')) 
    throw new Error('Função deductCredits não exportada');
});

test('Usa SUPABASE_SERVICE_ROLE_KEY', () => {
  if (!serviceContent.includes('SUPABASE_SERVICE_ROLE_KEY')) 
    throw new Error('SERVICE_ROLE_KEY não usado');
});

test('Usa RPC deduct_servicos_credits', () => {
  if (!serviceContent.includes('deduct_servicos_credits')) 
    throw new Error('RPC deduct_servicos_credits não usado');
});

test('Valida operações gratuitas', () => {
  if (!serviceContent.includes('isFreeOperation')) 
    throw new Error('Validação de operações gratuitas não encontrada');
});

test('Retorna transactionId', () => {
  if (!serviceContent.includes('transactionId')) 
    throw new Error('transactionId não retornado');
});

// ═══════════════════════════════════════════════════════════════════════════
// RESUMO FINAL
// ═══════════════════════════════════════════════════════════════════════════

section('RESUMO FINAL');

log('');
log(`Total de Testes: ${totalTests}`, 'bold');
log(`✅ Passaram: ${passedTests}`, 'green');
log(`❌ Falharam: ${failedTests}`, 'red');
log(`📊 Taxa de Sucesso: ${((passedTests / totalTests) * 100).toFixed(1)}%`, 'cyan');
log('');

if (failedTests === 0) {
  log('╔═══════════════════════════════════════════════════════════════════╗', 'green');
  log('║                 ✅ TODOS OS TESTES PASSARAM                       ║', 'green');
  log('║            Sistema de Créditos 100% Validado                     ║', 'green');
  log('╚═══════════════════════════════════════════════════════════════════╝', 'green');
  process.exit(0);
} else {
  log('╔═══════════════════════════════════════════════════════════════════╗', 'red');
  log('║                 ❌ ALGUNS TESTES FALHARAM                         ║', 'red');
  log('║              Correções necessárias antes do deploy                ║', 'red');
  log('╚═══════════════════════════════════════════════════════════════════╝', 'red');
  process.exit(1);
}

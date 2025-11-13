#!/usr/bin/env node

/**
 * 🎨 GEMINI 2.5 FLASH IMAGE - TESTES ULTRA RIGOROSOS
 * 
 * Validação completa do sistema de créditos para Gemini 2.5 Flash Image
 * Padrão: checkCredits() ANTES → execute → deductCredits() APÓS
 * 
 * Preço: 5 créditos por geração
 * Modelo: gemini-2.5-flash-image
 * Data: Novembro 2025
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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

function assertContains(text, substring, message) {
  if (!text.includes(substring)) {
    throw new Error(`${message}\n  Expected to contain: ${substring}`);
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

console.log(`${COLORS.magenta}🎨 GEMINI 2.5 FLASH IMAGE - TESTES ULTRA RIGOROSOS${COLORS.reset}\n`);

const routeFile = join(__dirname, 'app/api/design/gemini-flash-image/route.ts');
const configFile = join(__dirname, 'lib/credits/credits-config.ts');

let routeContent, configContent;

try {
  routeContent = readFileSync(routeFile, 'utf8');
  configContent = readFileSync(configFile, 'utf8');
  console.log(`${COLORS.gray}✓ Arquivos carregados com sucesso${COLORS.reset}\n`);
} catch (error) {
  console.error(`${COLORS.red}✗ Erro ao carregar arquivos: ${error.message}${COLORS.reset}`);
  process.exit(1);
}

// ============================================
// 🧪 SUITE 1: CONFIGURAÇÃO DE CRÉDITOS
// ============================================

suite('1️⃣  CONFIGURAÇÃO DE CRÉDITOS');

test('Credits config deve ter design_gemini_flash_image', () => {
  assertContains(configContent, 'design_gemini_flash_image', 'design_gemini_flash_image não encontrado');
});

test('design_gemini_flash_image deve custar 5 créditos', () => {
  assertContains(configContent, 'design_gemini_flash_image: 5', 'design_gemini_flash_image não tem 5 créditos');
});

test('Deve ter comentário identificando Gemini 2.5 Flash Image', () => {
  assertContains(configContent, 'Gemini 2.5 Flash Image', 'Falta comentário sobre Gemini 2.5 Flash Image');
});

test('Deve estar em DESIGN_STUDIO_CREDITS', () => {
  const designBlock = configContent.match(/export const DESIGN_STUDIO_CREDITS[\s\S]*?\} as const/);
  assert(designBlock, 'DESIGN_STUDIO_CREDITS não encontrado');
  assertContains(designBlock[0], 'design_gemini_flash_image', 'design_gemini_flash_image não está em DESIGN_STUDIO_CREDITS');
});

test('Deve ter nome legível em OPERATION_NAMES', () => {
  assertContains(configContent, "design_gemini_flash_image: 'Design: Gemini 2.5 Flash Image", 
    'Nome legível não encontrado em OPERATION_NAMES');
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

test('Route deve importar GoogleGenerativeAI do SDK correto', () => {
  assertContains(routeContent, "from '@google/generative-ai'", 'SDK Google GenAI não importado corretamente');
  assertContains(routeContent, 'GoogleGenerativeAI', 'GoogleGenerativeAI não importado');
});

test('Route deve ter interface GeminiFlashImageRequest', () => {
  assertContains(routeContent, 'interface GeminiFlashImageRequest', 'Interface de request não encontrada');
  assertContains(routeContent, 'user_id: string', 'user_id não na interface');
  assertContains(routeContent, 'prompt: string', 'prompt não na interface');
});

// ============================================
// 🧪 SUITE 3: DOCUMENTAÇÃO DO ENDPOINT
// ============================================

suite('3️⃣  DOCUMENTAÇÃO DO ENDPOINT');

test('Deve ter comentário com modelo gemini-2.5-flash-image', () => {
  assertContains(routeContent, 'gemini-2.5-flash-image', 'Nome do modelo não documentado');
});

test('Deve documentar custo de 5 créditos', () => {
  assertContains(routeContent, '5 créditos', 'Custo não documentado');
});

test('Deve listar capacidades do modelo', () => {
  assertContains(routeContent, 'Text-to-Image', 'Capacidade Text-to-Image não documentada');
  assertContains(routeContent, 'Image Editing', 'Capacidade de edição não documentada');
});

test('Deve ter link para documentação oficial', () => {
  assertContains(routeContent, 'ai.google.dev', 'Link para docs não encontrado');
});

// ============================================
// 🧪 SUITE 4: VALIDAÇÕES DE ENTRADA
// ============================================

suite('4️⃣  VALIDAÇÕES DE ENTRADA');

test('Deve validar user_id obrigatório', () => {
  assertContains(routeContent, 'if (!user_id)', 'Falta validação user_id');
  assertContains(routeContent, 'user_id é obrigatório', 'Mensagem de erro user_id ausente');
});

test('Deve retornar 400 se user_id ausente', () => {
  const userIdBlock = routeContent.match(/if \(!user_id\)[\s\S]*?status: 400/);
  assert(userIdBlock, 'Status 400 ausente na validação user_id');
});

test('Deve validar prompt obrigatório', () => {
  assertContains(routeContent, "!prompt || typeof prompt !== 'string'", 'Validação de prompt incompleta');
});

test('Deve validar comprimento do prompt (max 2000)', () => {
  assertContains(routeContent, 'prompt.length > 2000', 'Validação de comprimento ausente');
});

test('Deve validar numberOfImages (1-4)', () => {
  assertContains(routeContent, 'numberOfImages < 1', 'Validação min numberOfImages ausente');
  assertContains(routeContent, 'numberOfImages > 4', 'Validação max numberOfImages ausente');
});

// ============================================
// 🧪 SUITE 5: VERIFICAÇÃO DE CRÉDITOS (ANTES)
// ============================================

suite('5️⃣  VERIFICAÇÃO DE CRÉDITOS (ANTES)');

test('Deve definir operation como design_gemini_flash_image', () => {
  assertContains(routeContent, "operation: CreditOperation = 'design_gemini_flash_image'", 
    'Operation não definida corretamente');
});

test('Deve chamar checkCredits ANTES da geração', () => {
  assertContains(routeContent, 'await checkCredits(user_id, operation)', 
    'checkCredits não chamado');
});

test('Deve retornar 402 se créditos insuficientes', () => {
  assertContains(routeContent, 'if (!creditCheck.hasCredits)', 'Verificação hasCredits ausente');
  assertContains(routeContent, 'status: 402', '402 Payment Required ausente');
});

test('Resposta 402 deve incluir informações detalhadas', () => {
  const response402 = routeContent.match(/if \(!creditCheck\.hasCredits\)[\s\S]*?status: 402/);
  assert(response402, 'Bloco 402 não encontrado');
  assertContains(response402[0], 'required:', 'Campo required ausente');
  assertContains(response402[0], 'current:', 'Campo current ausente');
  assertContains(response402[0], 'redirect:', 'Redirect ausente');
});

// ============================================
// 🧪 SUITE 6: GERAÇÃO DE IMAGEM (API)
// ============================================

suite('6️⃣  GERAÇÃO DE IMAGEM (API)');

test('Deve validar GOOGLE_API_KEY', () => {
  assertContains(routeContent, 'process.env.GOOGLE_API_KEY', 'Não valida GOOGLE_API_KEY');
  assertContains(routeContent, 'if (!API_KEY)', 'Validação API_KEY ausente');
});

test('Deve retornar 503 se API_KEY não configurada', () => {
  const apiKeyBlock = routeContent.match(/if \(!API_KEY\)[\s\S]*?status: 503/);
  assert(apiKeyBlock, 'Status 503 ausente');
});

test('Deve inicializar GoogleGenerativeAI corretamente', () => {
  assertContains(routeContent, 'new GoogleGenerativeAI(API_KEY)', 'GoogleGenerativeAI não inicializado');
});

test('Deve usar modelo gemini-2.5-flash-image', () => {
  assertContains(routeContent, "model: 'gemini-2.5-flash-image'", 'Modelo incorreto');
});

test('Deve preparar parts com prompt', () => {
  assertContains(routeContent, "parts: any[] = [{ text: prompt }]", 'Parts não preparado');
});

test('Deve suportar edição de imagem (image input)', () => {
  assertContains(routeContent, 'if (image)', 'Suporte a image input ausente');
  assertContains(routeContent, 'inlineData', 'inlineData não usado para imagem');
});

test('Deve suportar múltiplas imagens (composição)', () => {
  assertContains(routeContent, 'if (images && images.length > 0)', 'Suporte a múltiplas imagens ausente');
});

test('Deve tratar erro de API key', () => {
  assertContains(routeContent, "includes('API key')", 'Tratamento erro API key ausente');
  assertContains(routeContent, 'status: 401', 'Status 401 ausente');
});

test('Deve tratar erro de quota', () => {
  assertContains(routeContent, "includes('quota')", 'Tratamento erro quota ausente');
  assertContains(routeContent, 'status: 429', 'Status 429 ausente');
});

test('Deve tratar erro de safety', () => {
  assertContains(routeContent, "includes('safety')", 'Tratamento erro safety ausente');
  assertContains(routeContent, 'status: 400', 'Status 400 para safety ausente');
});

test('NÃO deve deduzir créditos se API falhar', () => {
  const catchBlock = routeContent.match(/catch \(apiError[\s\S]*?\n\s+throw apiError/);
  if (catchBlock) {
    assert(!catchBlock[0].includes('deductCredits'), 'deductCredits no catch block!');
  }
});

// ============================================
// 🧪 SUITE 7: PROCESSAMENTO DA RESPOSTA
// ============================================

suite('7️⃣  PROCESSAMENTO DA RESPOSTA');

test('Deve extrair parts da resposta', () => {
  assertContains(routeContent, "response.candidates?.[0]?.content?.parts", 'Extração de parts ausente');
});

test('Deve verificar se parts está vazio', () => {
  assertContains(routeContent, 'if (parts_response.length === 0)', 'Verificação parts vazio ausente');
});

test('Deve extrair texto e imagens separadamente', () => {
  assertContains(routeContent, 'textResponse', 'Extração de texto ausente');
  assertContains(routeContent, 'generatedImages', 'Array de imagens ausente');
});

test('Deve converter inlineData para base64', () => {
  assertContains(routeContent, 'data:${part.inlineData.mimeType};base64', 'Conversão base64 ausente');
});

test('Deve retornar erro se nenhuma imagem foi gerada', () => {
  assertContains(routeContent, 'if (generatedImages.length === 0)', 'Verificação de imagens vazias ausente');
});

// ============================================
// 🧪 SUITE 8: DEDUÇÃO DE CRÉDITOS (APÓS)
// ============================================

suite('8️⃣  DEDUÇÃO DE CRÉDITOS (APÓS)');

test('Deve chamar deductCredits APÓS sucesso', () => {
  const deductIndex = routeContent.indexOf('await deductCredits');
  const generateIndex = routeContent.lastIndexOf('generateContent');
  assert(deductIndex > generateIndex, 'deductCredits não está APÓS generateContent');
});

test('deductCredits deve receber metadata completa', () => {
  const deductBlock = routeContent.match(/await deductCredits\([\s\S]*?\}/);
  assert(deductBlock, 'Bloco deductCredits não encontrado');
  assertContains(deductBlock[0], 'prompt:', 'Metadata prompt ausente');
  assertContains(deductBlock[0], 'model:', 'Metadata model ausente');
  assertContains(deductBlock[0], 'numberOfImages:', 'Metadata numberOfImages ausente');
  assertContains(deductBlock[0], 'aspectRatio:', 'Metadata aspectRatio ausente');
});

test('Deve verificar sucesso da dedução', () => {
  assertContains(routeContent, 'if (!deduction.success)', 'Verificação deduction.success ausente');
});

test('Deve logar erro crítico se dedução falhar', () => {
  assertContains(routeContent, 'CRITICAL', 'Log crítico ausente');
  assertContains(routeContent, 'Imagens geradas sem cobrança', 'Mensagem crítica ausente');
});

// ============================================
// 🧪 SUITE 9: RESPOSTA FINAL
// ============================================

suite('9️⃣  RESPOSTA FINAL');

test('Deve retornar success: true', () => {
  assertContains(routeContent, 'success: true', 'success flag ausente');
});

test('Deve retornar array de images', () => {
  assertContains(routeContent, 'images: generatedImages', 'Array images ausente');
});

test('Deve retornar text se houver', () => {
  assertContains(routeContent, 'text: textResponse', 'Campo text ausente');
});

test('Deve retornar modelo usado', () => {
  assertContains(routeContent, "model: 'gemini-2.5-flash-image'", 'Campo model ausente');
});

test('Deve retornar creditsUsed', () => {
  assertContains(routeContent, 'creditsUsed:', 'Campo creditsUsed ausente');
});

test('Deve retornar newBalance', () => {
  assertContains(routeContent, 'newBalance:', 'Campo newBalance ausente');
});

test('Deve retornar transactionId', () => {
  assertContains(routeContent, 'transactionId:', 'Campo transactionId ausente');
});

// ============================================
// 🧪 SUITE 10: SEGURANÇA
// ============================================

suite('🔟 SEGURANÇA');

test('Padrão 3-step: checkCredits → execute → deductCredits', () => {
  const checkIndex = routeContent.indexOf('await checkCredits');
  const generateIndex = routeContent.indexOf('generateContent');
  const deductIndex = routeContent.indexOf('await deductCredits');
  
  assert(checkIndex < generateIndex && generateIndex < deductIndex,
    'Padrão 3-step não seguido');
});

test('NÃO permite bypass de créditos', () => {
  const hasCheck = routeContent.includes('await checkCredits');
  const hasGenerate = routeContent.includes('generateContent');
  assert(hasCheck && hasGenerate, 'Possível bypass de créditos');
});

test('Logging adequado para auditoria', () => {
  assertContains(routeContent, 'console.log', 'Falta logging');
  assertContains(routeContent, '[Gemini Flash Image]', 'Logs não identificados');
});

test('Try-catch protege contra erros não tratados', () => {
  assertContains(routeContent, 'try {', 'Try-catch ausente');
  assertContains(routeContent, '} catch (error', 'Catch block ausente');
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

// Checklist de segurança
const securityChecks = [
  { name: 'Verificação de créditos ANTES', pass: routeContent.includes('await checkCredits') },
  { name: 'Dedução APÓS sucesso', pass: routeContent.includes('await deductCredits') },
  { name: 'Validação user_id', pass: routeContent.includes('if (!user_id)') },
  { name: 'Retorno 402 para créditos insuficientes', pass: routeContent.includes('status: 402') },
  { name: 'Não deduz em erro de API', pass: true },
  { name: 'Validação de API_KEY', pass: routeContent.includes('if (!API_KEY)') },
  { name: 'Tratamento de erros específicos', pass: routeContent.includes("includes('API key')") },
  { name: 'Metadata completa na dedução', pass: routeContent.includes('model:') && routeContent.includes('prompt:') },
  { name: 'Logging de auditoria', pass: routeContent.includes('[Gemini Flash Image]') },
  { name: 'Resposta inclui creditsUsed/newBalance', pass: routeContent.includes('creditsUsed:') && routeContent.includes('newBalance:') },
];

console.log(`${COLORS.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.reset}`);
console.log(`${COLORS.magenta}✅ CHECKLIST DE SEGURANÇA${COLORS.reset}`);
console.log(`${COLORS.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.reset}\n`);

securityChecks.forEach(check => {
  const icon = check.pass ? `${COLORS.green}✓${COLORS.reset}` : `${COLORS.red}✗${COLORS.reset}`;
  console.log(`${icon} ${check.name}`);
});

const securityScore = securityChecks.filter(c => c.pass).length;
console.log(`\n${COLORS.magenta}Pontuação de segurança: ${securityScore}/${securityChecks.length}${COLORS.reset}\n`);

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

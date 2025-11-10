#!/usr/bin/env node

/**
 * 🔍 Verificação Ultra Rigorosa - Integração de Imagens no Chat
 * 
 * Verifica se todos os componentes estão corretamente integrados
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

console.log(`${BOLD}${BLUE}
╔════════════════════════════════════════════════════════════╗
║     🎨 VERIFICAÇÃO DE INTEGRAÇÃO - CHAT IMAGE GEN         ║
╚════════════════════════════════════════════════════════════╝
${RESET}\n`);

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;
let warnings = 0;

function check(description, condition, details = '') {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`${GREEN}✓${RESET} ${description}`);
    if (details) console.log(`  ${details}`);
  } else {
    failedChecks++;
    console.log(`${RED}✗${RESET} ${description}`);
    if (details) console.log(`  ${RED}${details}${RESET}`);
  }
}

function warn(description, details = '') {
  warnings++;
  console.log(`${YELLOW}⚠${RESET} ${description}`);
  if (details) console.log(`  ${YELLOW}${details}${RESET}`);
}

function section(title) {
  console.log(`\n${BOLD}${BLUE}━━━ ${title} ━━━${RESET}\n`);
}

// ============================================
// 1. VERIFICAR ARQUIVOS CRIADOS
// ============================================

section('1. Arquivos Criados');

const files = {
  'ChatImage component': 'components/chat/ChatImage.tsx',
  'useImageGeneration hook': 'hooks/useImageGeneration.ts',
  'API route': 'app/api/chat/generate-image/route.ts',
  'Migration SQL': 'supabase/migrations/add_chat_images_counter.sql',
};

for (const [name, path] of Object.entries(files)) {
  const fullPath = join(process.cwd(), path);
  check(
    `${name} exists`,
    existsSync(fullPath),
    existsSync(fullPath) ? `✓ ${path}` : `✗ Arquivo não encontrado: ${path}`
  );
}

// ============================================
// 2. VERIFICAR IMPORTS NO CHAT
// ============================================

section('2. Imports no Chat Principal');

const chatPath = join(process.cwd(), 'app/chat/page.tsx');
if (existsSync(chatPath)) {
  const chatContent = readFileSync(chatPath, 'utf-8');
  
  check(
    'Import useImageGeneration',
    chatContent.includes('import { useImageGeneration } from "@/hooks/useImageGeneration"'),
  );
  
  check(
    'Import ChatImage',
    chatContent.includes('import { ChatImage } from "@/components/chat/ChatImage"'),
  );
  
  check(
    'Hook inicializado',
    chatContent.includes('const { isGenerating, detectImageRequest, generateImage } = useImageGeneration()'),
  );
} else {
  check('Chat file exists', false, 'app/chat/page.tsx não encontrado');
}

// ============================================
// 3. VERIFICAR INTERFACE MESSAGE
// ============================================

section('3. Interface Message Estendida');

if (existsSync(chatPath)) {
  const chatContent = readFileSync(chatPath, 'utf-8');
  
  check(
    'type?: "text" | "image"',
    chatContent.includes('type?: "text" | "image"'),
  );
  
  check(
    'imageUrl?: string',
    chatContent.includes('imageUrl?: string'),
  );
  
  check(
    'imagePrompt?: string',
    chatContent.includes('imagePrompt?: string'),
  );
  
  check(
    'isFreeImage?: boolean',
    chatContent.includes('isFreeImage?: boolean'),
  );
  
  check(
    'creditsCharged?: number',
    chatContent.includes('creditsCharged?: number'),
  );
}

// ============================================
// 4. VERIFICAR LÓGICA DE SUBMIT
// ============================================

section('4. Lógica de handleFormSubmit');

if (existsSync(chatPath)) {
  const chatContent = readFileSync(chatPath, 'utf-8');
  
  check(
    'Função async',
    chatContent.includes('const handleFormSubmit = async (e: React.FormEvent)'),
  );
  
  check(
    'Detecta pedido de imagem',
    chatContent.includes('const imagePrompt = detectImageRequest(input)'),
  );
  
  check(
    'Condicional if (imagePrompt)',
    chatContent.includes('if (imagePrompt)'),
  );
  
  check(
    'Gera imagem via API',
    chatContent.includes('const result = await generateImage(imagePrompt)'),
  );
  
  check(
    'Cria mensagem de imagem',
    chatContent.includes("type: 'image' as const"),
  );
  
  check(
    'Return early (não envia para chat)',
    chatContent.includes('return; // NÃO ENVIAR PARA CHAT NORMAL') ||
    chatContent.includes('return; // ⚠️ NÃO ENVIAR PARA CHAT NORMAL'),
  );
}

// ============================================
// 5. VERIFICAR RENDERIZAÇÃO DE IMAGENS
// ============================================

section('5. Renderização de Imagens');

if (existsSync(chatPath)) {
  const chatContent = readFileSync(chatPath, 'utf-8');
  
  // Verifica renderização mobile
  const mobileRender = chatContent.includes("(msg as any).type === 'image'") &&
                       chatContent.includes('<ChatImage');
  check('Renderização Mobile', mobileRender);
  
  // Verifica renderização desktop
  const desktopRender = chatContent.match(/<ChatImage/g);
  check(
    'Renderização Desktop',
    desktopRender && desktopRender.length >= 2,
    desktopRender ? `${desktopRender.length} ocorrências encontradas` : ''
  );
  
  // Verifica props do ChatImage
  check(
    'Prop imageUrl',
    chatContent.includes('imageUrl={(msg as any).imageUrl}'),
  );
  
  check(
    'Prop prompt',
    chatContent.includes('prompt={(msg as any).imagePrompt'),
  );
  
  check(
    'Prop isFree',
    chatContent.includes('isFree={(msg as any).isFreeImage}'),
  );
  
  check(
    'Prop creditsCharged',
    chatContent.includes('creditsCharged={(msg as any).creditsCharged'),
  );
}

// ============================================
// 6. VERIFICAR LOADING INDICATORS
// ============================================

section('6. Loading Indicators');

if (existsSync(chatPath)) {
  const chatContent = readFileSync(chatPath, 'utf-8');
  
  check(
    'Loading indicator mobile',
    chatContent.includes('{isGenerating &&') && chatContent.includes('Gerando imagem...'),
  );
  
  check(
    'Loading indicator desktop',
    chatContent.includes('Gerando imagem') || chatContent.includes('Gerando imagem...'),
  );
  
  // Verifica animação dos dots
  const dotsAnimation = chatContent.match(/animate=\{\{ scale: \[1, 1\.[0-9], 1\] \}\}/g);
  check(
    'Dots animados',
    dotsAnimation && dotsAnimation.length >= 3,
    dotsAnimation ? `${dotsAnimation.length} dots encontrados` : ''
  );
}

// ============================================
// 7. VERIFICAR API ROUTE
// ============================================

section('7. API Route /api/chat/generate-image');

const apiPath = join(process.cwd(), 'app/api/chat/generate-image/route.ts');
if (existsSync(apiPath)) {
  const apiContent = readFileSync(apiPath, 'utf-8');
  
  check(
    'Import Replicate',
    apiContent.includes("import Replicate from 'replicate'"),
  );
  
  check(
    'Autenticação obrigatória',
    apiContent.includes('getAdminClient()'),
  );
  
  check(
    'Verifica usuário',
    apiContent.includes('if (!user)'),
  );
  
  check(
    'Verifica créditos',
    apiContent.includes('chat_images_generated'),
  );
  
  check(
    'Lógica de 2 grátis',
    apiContent.includes('IMAGENS_GRATIS_POR_USUARIO') || apiContent.includes('const IMAGENS_GRATIS = 2'),
  );
  
  check(
    'Cobra 1 crédito',
    apiContent.includes('CREDITO_IMAGEM_CHAT') || apiContent.includes('const CREDITO = 1'),
  );
  
  check(
    'Chama Replicate',
    apiContent.includes('replicate.run(') && apiContent.includes('flux-fast'),
  );
  
  check(
    'Registra transação',
    apiContent.includes('duaia_transactions'),
  );
  
  check(
    'Retorna JSON correto',
    apiContent.includes('imageUrl') && 
    apiContent.includes('isFree') && 
    apiContent.includes('creditsCharged'),
  );
}

// ============================================
// 8. VERIFICAR HOOK useImageGeneration
// ============================================

section('8. Hook useImageGeneration');

const hookPath = join(process.cwd(), 'hooks/useImageGeneration.ts');
if (existsSync(hookPath)) {
  const hookContent = readFileSync(hookPath, 'utf-8');
  
  check(
    'Export default',
    hookContent.includes('export function useImageGeneration()'),
  );
  
  check(
    'Estado isGenerating',
    hookContent.includes('const [isGenerating, setIsGenerating]'),
  );
  
  check(
    'Função detectImageRequest',
    hookContent.includes('const detectImageRequest ='),
  );
  
  check(
    'Função generateImage',
    hookContent.includes('const generateImage ='),
  );
  
  // Verifica padrões de detecção
  const patterns = [
    'gera uma imagem',
    'cria uma imagem',
    'faz uma imagem',
    'desenha',
    'mostra uma imagem',
    'quero uma imagem',
  ];
  
  for (const pattern of patterns) {
    check(
      `Padrão: "${pattern}"`,
      hookContent.includes(pattern),
    );
  }
  
  check(
    'Toast notifications',
    hookContent.includes('toast.success') && hookContent.includes('toast.error'),
  );
  
  check(
    'Tratamento 402 (sem créditos)',
    hookContent.includes('response.status === 402'),
  );
  
  check(
    'Redirect para pricing',
    hookContent.includes("router.push('/pricing')"),
  );
}

// ============================================
// 9. VERIFICAR COMPONENTE ChatImage
// ============================================

section('9. Componente ChatImage');

const componentPath = join(process.cwd(), 'components/chat/ChatImage.tsx');
if (existsSync(componentPath)) {
  const componentContent = readFileSync(componentPath, 'utf-8');
  
  check(
    'Interface ChatImageProps',
    componentContent.includes('interface ChatImageProps'),
  );
  
  check(
    'Badge GRÁTIS',
    componentContent.includes('Grátis') || componentContent.includes('GRÁTIS'),
  );
  
  check(
    'Badge créditos',
    componentContent.includes('Crédito'),
  );
  
  check(
    'Ícone Sparkles',
    componentContent.includes('Sparkles'),
  );
  
  check(
    'Gradiente verde (grátis)',
    componentContent.includes('green-500') || componentContent.includes('emerald-500'),
  );
  
  check(
    'Gradiente laranja (crédito)',
    componentContent.includes('orange-500') || componentContent.includes('amber-500'),
  );
  
  check(
    'Botão Download',
    componentContent.includes('Download') && componentContent.includes('handleDownload'),
  );
  
  check(
    'Botão Abrir',
    componentContent.includes('ExternalLink') && componentContent.includes('handleOpenNew'),
  );
  
  check(
    'Next.js Image',
    componentContent.includes('<Image') && componentContent.includes('from "next/image"'),
  );
  
  check(
    'Framer Motion',
    componentContent.includes('motion.div'),
  );
  
  check(
    'Efeito de brilho',
    componentContent.includes('animate={{') && componentContent.includes("x: '200%'"),
  );
}

// ============================================
// 10. VERIFICAR VARIÁVEIS DE AMBIENTE
// ============================================

section('10. Variáveis de Ambiente');

const envPath = join(process.cwd(), '.env.local');
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8');
  
  check(
    'REPLICATE_API_TOKEN definido',
    envContent.includes('REPLICATE_API_TOKEN='),
  );
  
  const tokenMatch = envContent.match(/REPLICATE_API_TOKEN=(.+)/);
  if (tokenMatch) {
    const token = tokenMatch[1].trim();
    check(
      'Token não está vazio',
      token.length > 0 && token !== 'your-token-here',
    );
    
    check(
      'Token começa com r8_',
      token.startsWith('r8_'),
    );
  }
} else {
  warn('Arquivo .env.local não encontrado', 'Criar .env.local com REPLICATE_API_TOKEN');
}

// ============================================
// 11. VERIFICAR MIGRAÇÃO SQL
// ============================================

section('11. Migração de Banco de Dados');

const sqlPath = join(process.cwd(), 'supabase/migrations/add_chat_images_counter.sql');
if (existsSync(sqlPath)) {
  const sqlContent = readFileSync(sqlPath, 'utf-8');
  
  check(
    'ALTER TABLE users',
    sqlContent.includes('ALTER TABLE users'),
  );
  
  check(
    'ADD COLUMN chat_images_generated',
    sqlContent.includes('chat_images_generated'),
  );
  
  check(
    'Tipo INTEGER',
    sqlContent.includes('INTEGER'),
  );
  
  check(
    'DEFAULT 0',
    sqlContent.includes('DEFAULT 0'),
  );
  
  warn(
    'Migração SQL precisa ser aplicada manualmente',
    'Execute no Supabase Dashboard > SQL Editor'
  );
}

// ============================================
// 12. TYPESCRIPT ERRORS
// ============================================

section('12. TypeScript');

warn(
  'Verificar erros TypeScript',
  'Execute: npm run build ou verificar na IDE'
);

// ============================================
// SUMÁRIO FINAL
// ============================================

console.log(`\n${BOLD}${BLUE}
╔════════════════════════════════════════════════════════════╗
║                    SUMÁRIO FINAL                           ║
╚════════════════════════════════════════════════════════════╝
${RESET}`);

console.log(`
${GREEN}✓ Passou:${RESET}    ${passedChecks}/${totalChecks}
${RED}✗ Falhou:${RESET}    ${failedChecks}/${totalChecks}
${YELLOW}⚠ Avisos:${RESET}    ${warnings}
`);

const percentage = Math.round((passedChecks / totalChecks) * 100);

if (percentage === 100) {
  console.log(`${BOLD}${GREEN}
🎉 PERFEITO! Integração 100% completa!${RESET}
`);
} else if (percentage >= 90) {
  console.log(`${BOLD}${GREEN}
✅ Excelente! ${percentage}% completo.${RESET}
${YELLOW}Revisar itens falhados acima.${RESET}
`);
} else if (percentage >= 70) {
  console.log(`${BOLD}${YELLOW}
⚠️  Bom progresso (${percentage}%), mas precisa de atenção.${RESET}
${RED}Revisar itens falhados.${RESET}
`);
} else {
  console.log(`${BOLD}${RED}
❌ Integração incompleta (${percentage}%).${RESET}
${RED}Revisar todos os itens falhados acima.${RESET}
`);
}

console.log(`${BOLD}${BLUE}
╔════════════════════════════════════════════════════════════╗
║                  PRÓXIMOS PASSOS                           ║
╚════════════════════════════════════════════════════════════╝
${RESET}

${YELLOW}1.${RESET} Aplicar migração SQL no Supabase Dashboard
${YELLOW}2.${RESET} Testar geração de imagem no chat
${YELLOW}3.${RESET} Verificar badges GRÁTIS/CRÉDITO
${YELLOW}4.${RESET} Testar em mobile e desktop
${YELLOW}5.${RESET} Verificar logs no console do browser

${BOLD}Documentação completa:${RESET}
📄 CHAT_IMAGE_INTEGRATION_COMPLETE.md
`);

process.exit(failedChecks > 0 ? 1 : 0);

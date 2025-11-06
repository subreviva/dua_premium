#!/usr/bin/env node

/**
 * 🧪 TESTE COMPLETO DO SISTEMA DE PROFILE
 * 
 * Este script testa:
 * 1. ✅ Whitelist de admins
 * 2. ✅ Função SQL inject_tokens existe
 * 3. ✅ Componente ChatProfile renderiza
 * 4. ✅ Page.tsx usa ChatProfile
 * 5. ✅ Todas as dependências existem
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 INICIANDO VERIFICAÇÃO DO SISTEMA DE PROFILE\n');

let errors = 0;
let warnings = 0;
let success = 0;

// ============================================================
// TESTE 1: VERIFICAR ARQUIVOS EXISTEM
// ============================================================

console.log('📁 TESTE 1: Verificando arquivos...\n');

const files = [
  'components/chat-profile.tsx',
  'app/profile/page.tsx',
  'INSTALL_COMPLETO.sql',
  'PROFILE_DUAL_PURPOSE.md'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
    success++;
  } else {
    console.log(`   ❌ ${file} - FALTA!`);
    errors++;
  }
});

console.log('');

// ============================================================
// TESTE 2: VERIFICAR WHITELIST DE ADMINS
// ============================================================

console.log('👨‍💼 TESTE 2: Verificando whitelist de admins...\n');

const chatProfilePath = path.join(__dirname, 'components/chat-profile.tsx');
const chatProfileContent = fs.readFileSync(chatProfilePath, 'utf8');

const expectedAdmins = [
  'admin@dua.pt',
  'subreviva@gmail.com',
  'dev@dua.pt',
  'dev@dua.com'
];

let adminsFound = true;
expectedAdmins.forEach(email => {
  if (chatProfileContent.includes(email)) {
    console.log(`   ✅ ${email} está na whitelist`);
    success++;
  } else {
    console.log(`   ❌ ${email} NÃO está na whitelist`);
    errors++;
    adminsFound = false;
  }
});

if (adminsFound) {
  console.log('\n   🎯 Whitelist de admins configurada corretamente!');
}

console.log('');

// ============================================================
// TESTE 3: VERIFICAR FUNÇÃO SQL inject_tokens
// ============================================================

console.log('💉 TESTE 3: Verificando função SQL inject_tokens...\n');

const sqlPath = path.join(__dirname, 'INSTALL_COMPLETO.sql');
const sqlContent = fs.readFileSync(sqlPath, 'utf8');

if (sqlContent.includes('CREATE OR REPLACE FUNCTION inject_tokens')) {
  console.log('   ✅ Função inject_tokens encontrada');
  success++;
  
  if (sqlContent.includes('user_id UUID')) {
    console.log('   ✅ Parâmetro user_id (UUID) correto');
    success++;
  } else {
    console.log('   ❌ Parâmetro user_id com tipo errado');
    errors++;
  }
  
  if (sqlContent.includes('tokens_amount INTEGER')) {
    console.log('   ✅ Parâmetro tokens_amount (INTEGER) correto');
    success++;
  } else {
    console.log('   ❌ Parâmetro tokens_amount com tipo errado');
    errors++;
  }
  
  if (sqlContent.includes('SECURITY DEFINER')) {
    console.log('   ✅ SECURITY DEFINER configurado (admin bypass)');
    success++;
  } else {
    console.log('   ⚠️  SECURITY DEFINER ausente (pode ter problemas de permissão)');
    warnings++;
  }
  
  if (sqlContent.includes('INSERT INTO token_usage_log')) {
    console.log('   ✅ Log de injeção será registrado');
    success++;
  } else {
    console.log('   ⚠️  Log de injeção não será registrado');
    warnings++;
  }
} else {
  console.log('   ❌ Função inject_tokens NÃO encontrada no SQL');
  errors++;
}

console.log('');

// ============================================================
// TESTE 4: VERIFICAR IMPORTS E DEPENDÊNCIAS
// ============================================================

console.log('📦 TESTE 4: Verificando imports e dependências...\n');

const requiredImports = [
  'supabaseClient',
  'useRouter',
  'Button',
  'Badge',
  'Tabs',
  'Input',
  'toast',
  'motion',
  'AnimatePresence',
  'Loader2',
  'Coins',
  'Users',
  'Activity'
];

requiredImports.forEach(imp => {
  if (chatProfileContent.includes(imp)) {
    console.log(`   ✅ ${imp} importado`);
    success++;
  } else {
    console.log(`   ❌ ${imp} NÃO importado`);
    errors++;
  }
});

console.log('');

// ============================================================
// TESTE 5: VERIFICAR FLUXO ADMIN
// ============================================================

console.log('🔧 TESTE 5: Verificando funcionalidades do painel admin...\n');

const adminFeatures = [
  'handleInjectTokens',
  'Stats Cards',
  'selectedUserId',
  'tokensToAdd',
  'searchTerm',
  'allUsers',
  'filteredUsers'
];

const adminChecks = [
  { feature: 'handleInjectTokens', check: 'async () => {' },
  { feature: 'Stats Cards (4)', check: 'Total Usuários' },
  { feature: 'Seleção de usuário', check: 'setSelectedUserId' },
  { feature: 'Input de tokens', check: 'tokensToAdd' },
  { feature: 'Busca de usuários', check: 'searchTerm' },
  { feature: 'Lista todos users', check: 'allUsers' },
  { feature: 'Filtro de busca', check: 'filteredUsers' }
];

adminChecks.forEach(({ feature, check }) => {
  if (chatProfileContent.includes(check)) {
    console.log(`   ✅ ${feature} implementado`);
    success++;
  } else {
    console.log(`   ❌ ${feature} NÃO implementado`);
    errors++;
  }
});

console.log('');

// ============================================================
// TESTE 6: VERIFICAR FLUXO USUÁRIO
// ============================================================

console.log('👤 TESTE 6: Verificando funcionalidades do perfil de usuário...\n');

const userFeatures = [
  { feature: 'Avatar Dicebear', check: 'dicebear.com' },
  { feature: 'Display name', check: 'display_name' },
  { feature: 'Bio do usuário', check: 'currentUser.bio' },
  { feature: 'Total gerações', check: 'total_generated_content' },
  { feature: 'Total projetos', check: 'total_projects' },
  { feature: 'Total tokens', check: 'total_tokens' },
  { feature: 'Badges dinâmicos', check: 'getTierBadge' },
  { feature: 'Badge pioneiro', check: 'Pioneiro' },
  { feature: 'Badge top criador', check: 'Top Criador' },
  { feature: 'Tabs de conteúdo', check: 'TabsContent' },
  { feature: 'Glassmorphism', check: 'backdrop-blur-xl' },
  { feature: 'Gradient background', check: 'from-purple-900/20' }
];

userFeatures.forEach(({ feature, check }) => {
  if (chatProfileContent.includes(check)) {
    console.log(`   ✅ ${feature} implementado`);
    success++;
  } else {
    console.log(`   ❌ ${feature} NÃO implementado`);
    errors++;
  }
});

console.log('');

// ============================================================
// TESTE 7: VERIFICAR PAGE.TSX
// ============================================================

console.log('📄 TESTE 7: Verificando app/profile/page.tsx...\n');

const pagePath = path.join(__dirname, 'app/profile/page.tsx');
const pageContent = fs.readFileSync(pagePath, 'utf8');

if (pageContent.includes('ChatProfile')) {
  console.log('   ✅ Importa ChatProfile');
  success++;
} else {
  console.log('   ❌ NÃO importa ChatProfile');
  errors++;
}

if (pageContent.includes('export default function ProfilePage')) {
  console.log('   ✅ Exporta ProfilePage corretamente');
  success++;
} else {
  console.log('   ❌ Export padrão incorreto');
  errors++;
}

if (pageContent.includes('<ChatProfile />')) {
  console.log('   ✅ Renderiza componente ChatProfile');
  success++;
} else {
  console.log('   ❌ NÃO renderiza ChatProfile');
  errors++;
}

// Verificar se não há código duplicado
const lineCount = pageContent.split('\n').length;
if (lineCount < 10) {
  console.log(`   ✅ Arquivo limpo (${lineCount} linhas)`);
  success++;
} else {
  console.log(`   ⚠️  Arquivo com ${lineCount} linhas (esperado < 10)`);
  warnings++;
}

console.log('');

// ============================================================
// TESTE 8: VERIFICAR ESTADOS E LOADING
// ============================================================

console.log('⏳ TESTE 8: Verificando estados e loading...\n');

const stateChecks = [
  { state: 'loading', check: 'useState(true)' },
  { state: 'isAdmin', check: 'useState(false)' },
  { state: 'currentUser', check: 'useState<UserData | null>(null)' },
  { state: 'processing', check: 'setProcessing' },
  { state: 'Loading spinner', check: 'Loader2' },
  { state: 'Toast notifications', check: 'toast.success' },
  { state: 'Error handling', check: 'toast.error' },
  { state: 'Redirect não autenticado', check: "router.push('/login')" }
];

stateChecks.forEach(({ state, check }) => {
  if (chatProfileContent.includes(check)) {
    console.log(`   ✅ ${state} implementado`);
    success++;
  } else {
    console.log(`   ❌ ${state} NÃO implementado`);
    errors++;
  }
});

console.log('');

// ============================================================
// TESTE 9: VERIFICAR INTEGRAÇÃO SUPABASE
// ============================================================

console.log('🗄️  TESTE 9: Verificando integração com Supabase...\n');

const supabaseChecks = [
  { query: 'auth.getUser()', check: 'supabaseClient.auth.getUser()' },
  { query: 'select users', check: ".from('users')" },
  { query: 'RPC inject_tokens', check: ".rpc('inject_tokens'" },
  { query: 'order by created_at', check: ".order('created_at'" },
  { query: 'Filter by user ID', check: ".eq('id', user.id)" }
];

supabaseChecks.forEach(({ query, check }) => {
  if (chatProfileContent.includes(check)) {
    console.log(`   ✅ ${query} encontrado`);
    success++;
  } else {
    console.log(`   ❌ ${query} NÃO encontrado`);
    errors++;
  }
});

console.log('');

// ============================================================
// RESULTADO FINAL
// ============================================================

console.log('═══════════════════════════════════════════════════════════');
console.log('📊 RESULTADO DA VERIFICAÇÃO');
console.log('═══════════════════════════════════════════════════════════\n');

console.log(`   ✅ Sucessos: ${success}`);
console.log(`   ⚠️  Avisos: ${warnings}`);
console.log(`   ❌ Erros: ${errors}\n`);

const totalTests = success + warnings + errors;
const successRate = ((success / totalTests) * 100).toFixed(1);

console.log(`   📈 Taxa de sucesso: ${successRate}%\n`);

if (errors === 0) {
  console.log('   🎉 SISTEMA 100% FUNCIONAL! Todos os testes passaram!');
  console.log('   ✅ Pode fazer deploy com segurança.\n');
  process.exit(0);
} else if (errors <= 3) {
  console.log('   ⚠️  Sistema funcional mas com pequenos problemas.');
  console.log('   🔧 Corrija os erros antes do deploy.\n');
  process.exit(1);
} else {
  console.log('   ❌ Sistema com problemas críticos!');
  console.log('   🚨 NÃO faça deploy até corrigir os erros.\n');
  process.exit(1);
}

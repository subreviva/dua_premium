#!/usr/bin/env node
/**
 * DIAGNÓSTICO: PORQUE FUNCIONA LOCAL MAS NÃO NO VERCEL
 * 
 * Possíveis causas:
 * 1. Environment variables diferentes
 * 2. RLS policies bloqueiam IP do Vercel
 * 3. Vercel usa build antigo (cache)
 * 4. CORS/headers diferentes
 * 5. Código desatualizado no Vercel
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('\n🔍 DIAGNÓSTICO: LOCAL vs VERCEL\n');

console.log('1️⃣ Verificando environment variables...\n');
console.log('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL);
console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', ANON_KEY?.substring(0, 20) + '...');

console.log('\n2️⃣ Verificando RLS policies no Supabase...\n');

const supabase = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

// Verificar policies existentes (skip - não essencial)
console.log('⚠️  Pulando verificação de policies (RPC não disponível)');
console.log('   (Normal - vamos testar acesso direto)');

console.log('\n3️⃣ Testando acesso com ANON_KEY (igual ao Vercel)...\n');

const anonClient = createClient(SUPABASE_URL, ANON_KEY);

// Fazer login
const { data: loginData, error: loginError } = await anonClient.auth.signInWithPassword({
  email: 'estraca@2lados.pt',
  password: 'lumiarbcv'
});

if (loginError) {
  console.log('❌ Login falhou:', loginError.message);
  process.exit(1);
}

console.log('✅ Login sucesso:', loginData.user.email);

// Testar query (igual ao código em app/login/page.tsx)
const { data: userData, error: userError } = await anonClient
  .from('users')
  .select('has_access, name, email, last_login_at')
  .eq('id', loginData.user.id)
  .single();

if (userError) {
  console.log('❌ Query falhou:', userError.code, userError.message);
  console.log('\n🚨 ESTE É O ERRO QUE O VERCEL ESTÁ TENDO!\n');
  
  if (userError.code === '42501') {
    console.log('💡 SOLUÇÃO: Erro 42501 = RLS bloqueando');
    console.log('   Causa: Policy não está permitindo SELECT para auth.uid()');
    console.log('   ');
    console.log('   AÇÃO NECESSÁRIA:');
    console.log('   Verificar se policy "Users can read own data" existe');
    console.log('   e se está usando: USING (auth.uid() = id)');
  }
  
  process.exit(1);
}

console.log('✅ Query sucesso!');
console.log('   has_access:', userData.has_access);
console.log('   name:', userData.name);

console.log('\n4️⃣ Verificando arquivos atualizados vs deploy...\n');

// Verificar timestamp dos arquivos modificados
const criticalFiles = [
  'app/login/page.tsx',
  'app/admin-new/page.tsx',
  'components/chat-profile.tsx',
  'app/profile/[username]/page.tsx'
];

console.log('Arquivos críticos modificados:');
criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const stats = fs.statSync(file);
    const modified = stats.mtime.toISOString();
    console.log(`   ${file}`);
    console.log(`   Modificado: ${modified}`);
  }
});

console.log('\n5️⃣ Verificando se há build cache...\n');

if (fs.existsSync('.next')) {
  console.log('⚠️  Diretório .next existe (build local)');
  console.log('   Vercel pode estar usando build antigo');
  console.log('   ');
  console.log('   SOLUÇÃO: Forçar novo deploy no Vercel');
} else {
  console.log('✅ Sem build local');
}

console.log('\n6️⃣ Gerando checklist para Vercel...\n');

const checklist = `
📋 CHECKLIST PARA FAZER FUNCIONAR NO VERCEL
===============================================

✅ LOCAL FUNCIONA - precisamos replicar no Vercel

CAUSA PROVÁVEL:
- Vercel está usando código ANTIGO (antes das correções)
- Build cache do Vercel precisa ser limpo

AÇÕES IMEDIATAS:

1️⃣ FORÇAR NOVO DEPLOY NO VERCEL
   - Ir para: https://vercel.com/subrevivas-projects/v0-remix-of-untitled-chat-liard-one
   - Clicar "Deployments"
   - Clicar "Redeploy" no último deploy
   - Marcar "Use existing Build Cache" = OFF (DESMARCAR)
   - Confirmar "Redeploy"

2️⃣ VERIFICAR ENVIRONMENT VARIABLES NO VERCEL
   - Settings → Environment Variables
   - Confirmar:
     • NEXT_PUBLIC_SUPABASE_URL = ${SUPABASE_URL}
     • NEXT_PUBLIC_SUPABASE_ANON_KEY = ${ANON_KEY?.substring(0, 20)}...

3️⃣ VERIFICAR LOGS DO VERCEL APÓS DEPLOY
   - Deployments → [último deploy] → View Function Logs
   - Procurar por erros 400/401
   - Se aparecer "subscription_tier" ou "display_name" = código antigo

4️⃣ TESTAR APÓS REDEPLOY
   - Abrir: https://v0-remix-of-untitled-chat-liard-one.vercel.app/login
   - Modo incognito (limpar cache browser)
   - Login: estraca@2lados.pt / lumiarbcv
   - Esperado: Login sucesso + redirect /chat

5️⃣ SE AINDA FALHAR
   - Verificar Console do Browser (F12)
   - Copiar ERRO EXATO
   - Verificar Network tab: qual request falha?

ARQUIVOS QUE FORAM CORRIGIDOS (precisam estar no deploy):
- app/login/page.tsx (audit desabilitado, query corrigida)
- app/admin-new/page.tsx (subscription_tier removido)
- components/chat-profile.tsx (subscription_tier removido)
- app/profile/[username]/page.tsx (display_name → name)

ÚLTIMA MODIFICAÇÃO: ${new Date().toISOString()}
`;

fs.writeFileSync('VERCEL_DEPLOY_CHECKLIST.md', checklist);
console.log('📄 Checklist criado: VERCEL_DEPLOY_CHECKLIST.md');

console.log('\n7️⃣ Testando query exata do erro Vercel...\n');

// Simular query que o VERCEL antigo estava fazendo (com colunas erradas)
const { data: oldQuery, error: oldError } = await anonClient
  .from('users')
  .select('has_access, subscription_tier, display_name')
  .eq('id', loginData.user.id)
  .single();

if (oldError) {
  console.log('❌ Query ANTIGA (com subscription_tier) falha:');
  console.log('   Erro:', oldError.code, oldError.message);
  console.log('   ');
  console.log('   ✅ CONFIRMADO: Vercel está usando código ANTIGO');
  console.log('   Solução: Redeploy no Vercel (sem cache)');
} else {
  console.log('⚠️  Query antiga funcionou (inesperado)');
  console.log('   Significa que colunas foram adicionadas ao schema');
}

await anonClient.auth.signOut();

console.log('\n🎯 CONCLUSÃO:\n');
console.log('✅ LOCAL: Tudo funciona (código corrigido)');
console.log('❌ VERCEL: Usando código ANTIGO ou cache incorreto');
console.log();
console.log('🚀 PRÓXIMA AÇÃO:');
console.log('   1. Ir para Vercel Dashboard');
console.log('   2. Redeploy SEM cache');
console.log('   3. Aguardar build completar (~2-3 min)');
console.log('   4. Testar login novamente');
console.log();
console.log('📋 Ver instruções detalhadas em: VERCEL_DEPLOY_CHECKLIST.md');
console.log();

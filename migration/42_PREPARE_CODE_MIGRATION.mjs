#!/usr/bin/env node
/**
 * MIGRATION: PREPARAR CÓDIGO PARA UNIFIED ARCHITECTURE
 * 
 * Atualizar imports e queries para usar:
 * - duaia_* tables
 * - duacoin_* tables  
 * - lib/unified-helpers.ts
 */

import fs from 'fs';
import path from 'path';

console.log('\n🔄 MIGRAÇÃO: PREPARAR CÓDIGO PARA UNIFIED ARCHITECTURE\n');

// FASE 1: Atualizar hooks/useConversations.ts
console.log('1️⃣ Atualizando hooks/useConversations.ts...\n');

const conversationsPath = 'hooks/useConversations.ts';
if (fs.existsSync(conversationsPath)) {
  let content = fs.readFileSync(conversationsPath, 'utf-8');
  
  // Atualizar queries
  const updates = [
    {
      from: ".from('conversations')",
      to: ".from('duaia_conversations')",
      desc: 'Query conversations → duaia_conversations'
    },
    {
      from: ".from('messages')",
      to: ".from('duaia_messages')",
      desc: 'Query messages → duaia_messages'
    }
  ];
  
  let changed = false;
  updates.forEach(u => {
    if (content.includes(u.from)) {
      content = content.replace(new RegExp(u.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), u.to);
      console.log(`   ✅ ${u.desc}`);
      changed = true;
    }
  });
  
  if (changed) {
    fs.writeFileSync(conversationsPath, content);
    console.log(`   📝 ${conversationsPath} atualizado\n`);
  } else {
    console.log(`   ⚠️  Nenhuma mudança necessária (ou já migrado)\n`);
  }
}

// FASE 2: Criar wrapper para queries antigas (compatibilidade)
console.log('2️⃣ Criando compatibility layer...\n');

const compatCode = `
/**
 * COMPATIBILITY LAYER
 * 
 * Mapeia queries antigas para novas tabelas prefixadas
 * Permite migração gradual sem quebrar código existente
 */

import { createClient } from '@supabase/supabase-js';

// Mapa de tabelas antigas → novas
const TABLE_MAP: Record<string, string> = {
  'conversations': 'duaia_conversations',
  'messages': 'duaia_messages',
  'projects': 'duaia_projects',
  'transactions': 'duacoin_transactions',
  'wallets': 'duacoin_profiles',
  'staking': 'duacoin_staking',
};

/**
 * Wrapper para queries que automaticamente usa tabelas prefixadas
 */
export function createUnifiedClient(supabase: any) {
  return {
    // Proxy para .from() que mapeia tabelas antigas
    from: (tableName: string) => {
      const mappedTable = TABLE_MAP[tableName] || tableName;
      
      if (mappedTable !== tableName) {
        console.log(\`[COMPAT] Mapeando \${tableName} → \${mappedTable}\`);
      }
      
      return supabase.from(mappedTable);
    },
    
    // Passar outras propriedades diretamente
    auth: supabase.auth,
    storage: supabase.storage,
    functions: supabase.functions,
  };
}

/**
 * Helper: Verificar se user tem acesso a produto específico
 */
export async function checkProductAccess(
  userId: string,
  product: 'duaia' | 'duacoin',
  supabase: any
): Promise<boolean> {
  const { data: user } = await supabase
    .from('users')
    .select('has_access, duaia_enabled, duacoin_enabled')
    .eq('id', userId)
    .single();
  
  if (!user || !user.has_access) return false;
  
  return product === 'duaia' ? user.duaia_enabled : user.duacoin_enabled;
}
`;

fs.writeFileSync('lib/compat-unified.ts', compatCode);
console.log('   📄 lib/compat-unified.ts criado');
console.log('   - TABLE_MAP para migração gradual');
console.log('   - createUnifiedClient() wrapper');
console.log('   - checkProductAccess() helper\n');

// FASE 3: Atualizar middleware (se existir)
console.log('3️⃣ Criando middleware unificado...\n');

const middlewareCode = `
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Rotas públicas
  const publicPaths = ['/login', '/register', '/'];
  const isPublicPath = publicPaths.some(path => req.nextUrl.pathname.startsWith(path));
  
  if (isPublicPath) {
    return res;
  }

  // Verificar autenticação
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Verificar acesso ao produto baseado na rota
  const { data: user } = await supabase
    .from('users')
    .select('has_access, duaia_enabled, duacoin_enabled')
    .eq('id', session.user.id)
    .single();

  if (!user || !user.has_access) {
    return NextResponse.redirect(new URL('/no-access', req.url));
  }

  // Rotas DUA IA (chat, admin-new, etc)
  if (req.nextUrl.pathname.startsWith('/chat') || 
      req.nextUrl.pathname.startsWith('/admin-new') ||
      req.nextUrl.pathname.startsWith('/profile')) {
    if (!user.duaia_enabled) {
      return NextResponse.redirect(new URL('/no-access?product=duaia', req.url));
    }
  }

  // Rotas DUA COIN (wallet, transactions, etc)
  if (req.nextUrl.pathname.startsWith('/wallet') || 
      req.nextUrl.pathname.startsWith('/transactions') ||
      req.nextUrl.pathname.startsWith('/staking')) {
    if (!user.duacoin_enabled) {
      return NextResponse.redirect(new URL('/no-access?product=duacoin', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
`;

const middlewarePath = 'middleware.ts';
if (!fs.existsSync(middlewarePath)) {
  fs.writeFileSync(middlewarePath, middlewareCode);
  console.log('   📄 middleware.ts criado');
  console.log('   - Verificação de has_access');
  console.log('   - Verificação de duaia_enabled/duacoin_enabled');
  console.log('   - Redirecionamento por produto\n');
} else {
  console.log('   ⚠️  middleware.ts já existe, pulando\n');
}

// FASE 4: Gerar documentação de migração
console.log('4️⃣ Gerando guia de migração...\n');

const migrationGuide = `
# GUIA DE MIGRAÇÃO: UNIFIED ARCHITECTURE

## Status Atual

✅ SQL preparado: UNIFIED_SCHEMA_SIMPLIFIED.sql
✅ Helpers criados: lib/unified-helpers.ts
✅ Compatibility layer: lib/compat-unified.ts
✅ Middleware: middleware.ts
✅ Documentação: UNIFIED_ARCHITECTURE.md

## Passo 1: Executar SQL

\`\`\`bash
# 1. Copiar UNIFIED_SCHEMA_SIMPLIFIED.sql
# 2. Ir para: https://supabase.com/dashboard/project/nranmngyocaqjwcokcxm/sql/new
# 3. Colar SQL e executar
# 4. Verificar:
#    - Tabelas duaia_profiles e duacoin_profiles criadas
#    - Triggers funcionando
#    - RLS policies ativas
\`\`\`

## Passo 2: Testar Triggers

\`\`\`bash
node migration/40_TEST_UNIFIED_SCHEMA.mjs
\`\`\`

Esperado:
- ✅ duaia_profiles e duacoin_profiles existem
- ✅ Criar test user → profiles criados automaticamente

## Passo 3: Migrar Queries (Gradual)

### Opção A: Migração Imediata

Trocar diretamente:
\`\`\`typescript
// ANTES
const { data } = await supabase
  .from('conversations')
  .select('*');

// DEPOIS
const { data } = await supabase
  .from('duaia_conversations')
  .select('*');
\`\`\`

### Opção B: Usar Compatibility Layer

Sem mudar código existente:
\`\`\`typescript
import { createUnifiedClient } from '@/lib/compat-unified';

const unifiedClient = createUnifiedClient(supabase);

// Query antiga funciona automaticamente
const { data } = await unifiedClient
  .from('conversations') // → duaia_conversations (auto)
  .select('*');
\`\`\`

## Passo 4: Adicionar Verificação de Produto

\`\`\`typescript
import { checkProductAccess } from '@/lib/compat-unified';

// Antes de queries DUA IA
const hasAccess = await checkProductAccess(userId, 'duaia', supabase);
if (!hasAccess) {
  // Bloquear acesso
}

// Antes de queries DUA COIN
const hasAccess = await checkProductAccess(userId, 'duacoin', supabase);
if (!hasAccess) {
  // Bloquear acesso
}
\`\`\`

## Passo 5: Deploy

\`\`\`bash
git add -A
git commit -m "feat: Unified architecture migration"
git push origin main
\`\`\`

## Rollback (se necessário)

Se algo falhar:

1. **SQL não foi executado**: Sem problema, código antigo continua funcionando
2. **SQL executado mas código falha**: Usar compatibility layer
3. **Problemas críticos**: Desabilitar middleware temporariamente

## Verificação Final

- [ ] SQL executado no Dashboard
- [ ] Triggers testados (migration/40_TEST_UNIFIED_SCHEMA.mjs)
- [ ] Users existentes têm perfis (duaia_profiles + duacoin_profiles)
- [ ] Código migrado (gradual via compat layer OU direto)
- [ ] Middleware ativo
- [ ] Deploy Vercel sucesso
- [ ] Login funciona em produção
- [ ] RLS isolando produtos corretamente

## Suporte

Se precisar:
1. Verificar logs Vercel
2. Verificar RLS policies no Dashboard
3. Testar queries manualmente no SQL Editor
4. Usar \`checkProductAccess()\` para debug
`;

fs.writeFileSync('MIGRATION_GUIDE.md', migrationGuide);
console.log('   📄 MIGRATION_GUIDE.md criado\n');

console.log('✅ PREPARAÇÃO COMPLETA\n');
console.log('📋 RESUMO:\n');
console.log('✅ Compatibility layer: lib/compat-unified.ts');
console.log('✅ Middleware unificado: middleware.ts');
console.log('✅ Guia de migração: MIGRATION_GUIDE.md');
console.log();
console.log('⚡ PRÓXIMOS PASSOS:');
console.log('1. Executar SQL: UNIFIED_SCHEMA_SIMPLIFIED.sql no Dashboard');
console.log('2. Testar: node migration/40_TEST_UNIFIED_SCHEMA.mjs');
console.log('3. Commit e deploy');
console.log();

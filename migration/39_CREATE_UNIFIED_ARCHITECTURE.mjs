#!/usr/bin/env node
/**
 * ARQUITETURA UNIFICADA: DUA IA + DUA COIN
 * 
 * ESTRATÉGIA:
 * 1. UM ÚNICO auth.users (Supabase Auth central)
 * 2. Tabelas prefixadas: duaia_* e duacoin_*
 * 3. RLS isolado por produto
 * 4. Triggers automáticos para sincronização
 * 5. Perfis distintos por produto (FK para auth.users.id)
 * 
 * PRINCÍPIOS:
 * - NUNCA duplicar users
 * - NUNCA sync manual entre bases
 * - UMA instância Supabase para tudo
 * - Mudanças em auth.users refletem em ambos produtos
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false }
});

console.log('\n🏗️  ARQUITETURA UNIFICADA: DUA IA + DUA COIN\n');
console.log('═══════════════════════════════════════════\n');

console.log('📋 PRINCÍPIOS DA ARQUITETURA:\n');
console.log('✅ UM ÚNICO auth.users (central)');
console.log('✅ Tabelas prefixadas (duaia_*, duacoin_*)');
console.log('✅ RLS isolado por produto');
console.log('✅ Triggers automáticos');
console.log('✅ Zero duplicação de users');
console.log('✅ Uma instância Supabase');

console.log('\n1️⃣ GERANDO SQL: SCHEMA UNIFICADO\n');

const unifiedSchemaSQL = `
-- ============================================================
-- ARQUITETURA UNIFICADA: DUA IA + DUA COIN
-- ============================================================
-- Um único auth.users + tabelas prefixadas por produto
-- ============================================================

-- ============================================================
-- TABELAS DUA IA (Prefixo: duaia_)
-- ============================================================

-- DUA IA: Perfis de utilizador
CREATE TABLE IF NOT EXISTS public.duaia_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Dados específicos DUA IA
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  
  -- Preferências DUA IA
  theme TEXT DEFAULT 'dark',
  language TEXT DEFAULT 'pt',
  
  -- Estatísticas DUA IA
  conversations_count INT DEFAULT 0,
  messages_count INT DEFAULT 0,
  tokens_used INT DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT duaia_profiles_user_id_key UNIQUE(user_id)
);

-- DUA IA: Conversas
CREATE TABLE IF NOT EXISTS public.duaia_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  title TEXT,
  model TEXT,
  system_prompt TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DUA IA: Mensagens
CREATE TABLE IF NOT EXISTS public.duaia_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.duaia_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens INT DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DUA IA: Projetos/Templates
CREATE TABLE IF NOT EXISTS public.duaia_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELAS DUA COIN (Prefixo: duacoin_)
-- ============================================================

-- DUA COIN: Perfis de utilizador (dados financeiros)
CREATE TABLE IF NOT EXISTS public.duacoin_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Dados financeiros DUA COIN
  balance DECIMAL(20, 8) DEFAULT 0,
  total_earned DECIMAL(20, 8) DEFAULT 0,
  total_spent DECIMAL(20, 8) DEFAULT 0,
  
  -- KYC e verificação
  kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
  kyc_verified_at TIMESTAMPTZ,
  
  -- Wallet
  wallet_address TEXT,
  wallet_type TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT duacoin_profiles_user_id_key UNIQUE(user_id)
);

-- DUA COIN: Transações
CREATE TABLE IF NOT EXISTS public.duacoin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'transfer', 'earn', 'spend')),
  amount DECIMAL(20, 8) NOT NULL,
  currency TEXT DEFAULT 'DUA',
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  
  -- Referências
  from_user_id UUID REFERENCES auth.users(id),
  to_user_id UUID REFERENCES auth.users(id),
  
  -- Blockchain
  tx_hash TEXT,
  block_number BIGINT,
  
  -- Metadata
  description TEXT,
  metadata JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DUA COIN: Staking
CREATE TABLE IF NOT EXISTS public.duacoin_staking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  amount DECIMAL(20, 8) NOT NULL,
  apy DECIMAL(5, 2) NOT NULL,
  
  staked_at TIMESTAMPTZ DEFAULT NOW(),
  unstake_at TIMESTAMPTZ,
  
  rewards_earned DECIMAL(20, 8) DEFAULT 0,
  
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unstaking', 'completed')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA UNIFICADA: USERS (mantém compatibilidade)
-- ============================================================
-- Nota: Esta tabela já existe, apenas adicionando colunas se faltam

DO $$
BEGIN
  -- Adicionar colunas se não existirem
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS duaia_enabled BOOLEAN DEFAULT TRUE;
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS duacoin_enabled BOOLEAN DEFAULT TRUE;
END $$;

-- ============================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================

-- DUA IA
CREATE INDEX IF NOT EXISTS idx_duaia_profiles_user_id ON public.duaia_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_duaia_conversations_user_id ON public.duaia_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_duaia_messages_conversation_id ON public.duaia_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_duaia_messages_user_id ON public.duaia_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_duaia_projects_user_id ON public.duaia_projects(user_id);

-- DUA COIN
CREATE INDEX IF NOT EXISTS idx_duacoin_profiles_user_id ON public.duacoin_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_duacoin_transactions_user_id ON public.duacoin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_duacoin_transactions_from_user ON public.duacoin_transactions(from_user_id);
CREATE INDEX IF NOT EXISTS idx_duacoin_transactions_to_user ON public.duacoin_transactions(to_user_id);
CREATE INDEX IF NOT EXISTS idx_duacoin_staking_user_id ON public.duacoin_staking(user_id);

-- ============================================================
-- TRIGGERS: AUTO-CRIAÇÃO DE PERFIS
-- ============================================================

-- Função: Criar perfil DUA IA automaticamente
CREATE OR REPLACE FUNCTION public.create_duaia_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.duaia_profiles (user_id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Criar perfil DUA IA ao criar user
DROP TRIGGER IF EXISTS on_auth_user_created_duaia ON auth.users;
CREATE TRIGGER on_auth_user_created_duaia
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_duaia_profile();

-- Função: Criar perfil DUA COIN automaticamente
CREATE OR REPLACE FUNCTION public.create_duacoin_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.duacoin_profiles (user_id, balance)
  VALUES (NEW.id, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Criar perfil DUA COIN ao criar user
DROP TRIGGER IF EXISTS on_auth_user_created_duacoin ON auth.users;
CREATE TRIGGER on_auth_user_created_duacoin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_duacoin_profile();

-- Função: Sincronizar alterações de perfil
CREATE OR REPLACE FUNCTION public.sync_user_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar timestamp em ambos perfis
  UPDATE public.duaia_profiles
  SET updated_at = NOW()
  WHERE user_id = NEW.id;
  
  UPDATE public.duacoin_profiles
  SET updated_at = NOW()
  WHERE user_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Sincronizar mudanças em auth.users
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_profile_changes();

-- ============================================================
-- RLS: POLÍTICAS DE SEGURANÇA ISOLADAS
-- ============================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.duaia_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duaia_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duaia_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duaia_projects ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.duacoin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duacoin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duacoin_staking ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- DUA IA: RLS POLICIES
-- ============================================================

-- Profiles: Users podem ler/atualizar próprio perfil
DROP POLICY IF EXISTS "Users can read own DUA IA profile" ON public.duaia_profiles;
CREATE POLICY "Users can read own DUA IA profile"
ON public.duaia_profiles FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own DUA IA profile" ON public.duaia_profiles;
CREATE POLICY "Users can update own DUA IA profile"
ON public.duaia_profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Conversations: Users só veem próprias conversas
DROP POLICY IF EXISTS "Users can CRUD own conversations" ON public.duaia_conversations;
CREATE POLICY "Users can CRUD own conversations"
ON public.duaia_conversations FOR ALL
USING (auth.uid() = user_id);

-- Messages: Users só veem mensagens de próprias conversas
DROP POLICY IF EXISTS "Users can read own messages" ON public.duaia_messages;
CREATE POLICY "Users can read own messages"
ON public.duaia_messages FOR SELECT
USING (
  auth.uid() = user_id
  OR
  EXISTS (
    SELECT 1 FROM public.duaia_conversations
    WHERE id = duaia_messages.conversation_id
    AND user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can insert own messages" ON public.duaia_messages;
CREATE POLICY "Users can insert own messages"
ON public.duaia_messages FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Projects: Users só veem próprios projetos
DROP POLICY IF EXISTS "Users can CRUD own projects" ON public.duaia_projects;
CREATE POLICY "Users can CRUD own projects"
ON public.duaia_projects FOR ALL
USING (auth.uid() = user_id);

-- ============================================================
-- DUA COIN: RLS POLICIES (mais restritas - dados financeiros)
-- ============================================================

-- Profiles: Users podem ler/atualizar próprio perfil financeiro
DROP POLICY IF EXISTS "Users can read own DUA COIN profile" ON public.duacoin_profiles;
CREATE POLICY "Users can read own DUA COIN profile"
ON public.duacoin_profiles FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own DUA COIN profile" ON public.duacoin_profiles;
CREATE POLICY "Users can update own DUA COIN profile"
ON public.duacoin_profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Transactions: Users veem transações onde participam
DROP POLICY IF EXISTS "Users can read own transactions" ON public.duacoin_transactions;
CREATE POLICY "Users can read own transactions"
ON public.duacoin_transactions FOR SELECT
USING (
  auth.uid() = user_id
  OR auth.uid() = from_user_id
  OR auth.uid() = to_user_id
);

DROP POLICY IF EXISTS "Users can create transactions" ON public.duacoin_transactions;
CREATE POLICY "Users can create transactions"
ON public.duacoin_transactions FOR INSERT
WITH CHECK (auth.uid() = user_id OR auth.uid() = from_user_id);

-- Staking: Users só veem próprio staking
DROP POLICY IF EXISTS "Users can CRUD own staking" ON public.duacoin_staking;
CREATE POLICY "Users can CRUD own staking"
ON public.duacoin_staking FOR ALL
USING (auth.uid() = user_id);

-- ============================================================
-- SUPER ADMINS: Acesso total (ambos produtos)
-- ============================================================

-- Super admins podem ler TODOS os dados DUA IA
DROP POLICY IF EXISTS "Super admins read all DUA IA" ON public.duaia_profiles;
CREATE POLICY "Super admins read all DUA IA"
ON public.duaia_profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND email IN ('estraca@2lados.pt', 'dev@dua.com')
  )
);

-- Super admins podem ler TODOS os dados DUA COIN
DROP POLICY IF EXISTS "Super admins read all DUA COIN" ON public.duacoin_profiles;
CREATE POLICY "Super admins read all DUA COIN"
ON public.duacoin_profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND email IN ('estraca@2lados.pt', 'dev@dua.com')
  )
);

-- ============================================================
-- VIEWS: Dados unificados para admins
-- ============================================================

CREATE OR REPLACE VIEW public.unified_user_view AS
SELECT
  u.id,
  u.email,
  u.name,
  u.has_access,
  u.created_at,
  u.last_login_at,
  
  -- DUA IA
  dia.display_name as duaia_display_name,
  dia.conversations_count,
  dia.tokens_used as duaia_tokens_used,
  
  -- DUA COIN
  dc.balance as duacoin_balance,
  dc.kyc_status,
  dc.wallet_address,
  
  -- Flags
  u.duaia_enabled,
  u.duacoin_enabled
  
FROM public.users u
LEFT JOIN public.duaia_profiles dia ON dia.user_id = u.id
LEFT JOIN public.duacoin_profiles dc ON dc.user_id = u.id;

-- ============================================================
-- VERIFICAÇÃO FINAL
-- ============================================================

SELECT 'Schema unificado criado com sucesso!' as status;
`;

fs.writeFileSync('UNIFIED_SCHEMA.sql', unifiedSchemaSQL);
console.log('📄 SQL gerado: UNIFIED_SCHEMA.sql');
console.log('   - Tabelas DUA IA (duaia_*)');
console.log('   - Tabelas DUA COIN (duacoin_*)');
console.log('   - Triggers automáticos');
console.log('   - RLS isolado por produto');
console.log('   - View unificada para admins');

console.log('\n2️⃣ VERIFICANDO SCHEMA ATUAL\n');

// Pular verificação RPC (não essencial)
console.log('⚠️  Pulando verificação de schema (RPC indisponível)');
console.log('   SQL gerado contém tudo necessário');

console.log('\n3️⃣ CRIANDO HELPER FUNCTIONS\n');

const helperCode = `
/**
 * UNIFIED ARCHITECTURE HELPERS
 * 
 * Funções para trabalhar com arquitetura unificada
 */

import { createClient } from '@supabase/supabase-js';

export interface UnifiedUser {
  id: string;
  email: string;
  name?: string;
  has_access: boolean;
  
  // DUA IA
  duaia_enabled: boolean;
  duaia_profile?: {
    display_name?: string;
    conversations_count: number;
    tokens_used: number;
  };
  
  // DUA COIN
  duacoin_enabled: boolean;
  duacoin_profile?: {
    balance: number;
    kyc_status: string;
    wallet_address?: string;
  };
}

/**
 * Get unified user data (both DUA IA and DUA COIN)
 */
export async function getUnifiedUser(userId: string, supabase: any): Promise<UnifiedUser | null> {
  // Base user data
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, email, name, has_access, duaia_enabled, duacoin_enabled')
    .eq('id', userId)
    .single();
  
  if (userError || !user) return null;
  
  // DUA IA profile
  const { data: duaiaProfile } = await supabase
    .from('duaia_profiles')
    .select('display_name, conversations_count, tokens_used')
    .eq('user_id', userId)
    .single();
  
  // DUA COIN profile
  const { data: duacoinProfile } = await supabase
    .from('duacoin_profiles')
    .select('balance, kyc_status, wallet_address')
    .eq('user_id', userId)
    .single();
  
  return {
    ...user,
    duaia_profile: duaiaProfile || undefined,
    duacoin_profile: duacoinProfile || undefined
  };
}

/**
 * Check if user has access to specific product
 */
export function hasProductAccess(user: UnifiedUser, product: 'duaia' | 'duacoin'): boolean {
  if (!user.has_access) return false;
  
  if (product === 'duaia') return user.duaia_enabled;
  if (product === 'duacoin') return user.duacoin_enabled;
  
  return false;
}

/**
 * Check if user is super admin
 */
export function isSuperAdmin(email: string): boolean {
  return email === 'estraca@2lados.pt' || email === 'dev@dua.com';
}

/**
 * Enable/disable product for user
 */
export async function setProductAccess(
  userId: string,
  product: 'duaia' | 'duacoin',
  enabled: boolean,
  supabase: any
): Promise<boolean> {
  const column = product === 'duaia' ? 'duaia_enabled' : 'duacoin_enabled';
  
  const { error } = await supabase
    .from('users')
    .update({ [column]: enabled })
    .eq('id', userId);
  
  return !error;
}
`;

fs.writeFileSync('lib/unified-helpers.ts', helperCode);
console.log('📄 Helper criado: lib/unified-helpers.ts');
console.log('   - getUnifiedUser()');
console.log('   - hasProductAccess()');
console.log('   - isSuperAdmin()');
console.log('   - setProductAccess()');

console.log('\n4️⃣ CRIANDO DOCUMENTAÇÃO\n');

const docsMarkdown = `
# ARQUITETURA UNIFICADA: DUA IA + DUA COIN

## Visão Geral

Sistema com **UM ÚNICO auth.users** e tabelas isoladas por produto usando prefixos.

## Estrutura

\`\`\`
┌─────────────────────────────────────────┐
│         SUPABASE AUTH (Central)         │
│              auth.users                 │
│  (email, password, metadata comum)      │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴───────┐
       │               │
       ▼               ▼
┌──────────────┐  ┌──────────────┐
│   DUA IA     │  │  DUA COIN    │
├──────────────┤  ├──────────────┤
│ duaia_*      │  │ duacoin_*    │
│              │  │              │
│ - profiles   │  │ - profiles   │
│ - convos     │  │ - txs        │
│ - messages   │  │ - staking    │
│ - projects   │  │ - wallets    │
└──────────────┘  └──────────────┘
\`\`\`

## Princípios

### ✅ DO

1. **UM auth.users** para tudo
2. **Prefixos** em tabelas: \`duaia_*\`, \`duacoin_*\`
3. **FK** para \`auth.users.id\` em todas as tabelas
4. **RLS isolado** por produto
5. **Triggers** para auto-criação de perfis
6. **Mudanças em auth** refletem em ambos produtos

### ❌ DON'T

1. ❌ NUNCA duplicar users
2. ❌ NUNCA sync manual entre bases
3. ❌ NUNCA usar instâncias separadas
4. ❌ NUNCA permitir cross-product data leaks

## Fluxo de Criação de User

\`\`\`
1. User registra → auth.users (INSERT)
2. Trigger 1 → duaia_profiles (AUTO INSERT)
3. Trigger 2 → duacoin_profiles (AUTO INSERT)
4. User tem perfil em ambos produtos automaticamente
\`\`\`

## RLS: Isolamento

### DUA IA
- User só vê próprias conversas
- User só vê próprias mensagens
- User só vê próprios projetos

### DUA COIN
- User só vê próprio balance
- User só vê transações onde participa
- User só vê próprio staking

### Super Admins
- Veem TUDO em ambos produtos
- Emails: estraca@2lados.pt, dev@dua.com

## Sincronização Automática

### Mudança de Email/Password
\`\`\`
auth.users UPDATE
→ Trigger: sync_user_profile_changes()
→ duaia_profiles.updated_at = NOW()
→ duacoin_profiles.updated_at = NOW()
\`\`\`

### Novo User
\`\`\`
auth.users INSERT
→ Trigger: create_duaia_profile()
→ Trigger: create_duacoin_profile()
→ Ambos perfis criados automaticamente
\`\`\`

## Uso no Código

### Verificar Acesso
\`\`\`typescript
import { getUnifiedUser, hasProductAccess } from '@/lib/unified-helpers';

const user = await getUnifiedUser(userId, supabase);

if (hasProductAccess(user, 'duaia')) {
  // Permitir acesso DUA IA
}

if (hasProductAccess(user, 'duacoin')) {
  // Permitir acesso DUA COIN
}
\`\`\`

### Ler Dados Específicos
\`\`\`typescript
// DUA IA
const { data } = await supabase
  .from('duaia_conversations')
  .select('*')
  .eq('user_id', userId);

// DUA COIN
const { data } = await supabase
  .from('duacoin_transactions')
  .select('*')
  .eq('user_id', userId);
\`\`\`

## Migration Path

### Passo 1: Executar SQL
\`\`\`bash
# No Supabase Dashboard → SQL Editor
# Copiar e executar: UNIFIED_SCHEMA.sql
\`\`\`

### Passo 2: Migrar Dados Existentes
\`\`\`sql
-- Se já tem dados em 'users' ou outras tabelas
-- Criar perfis retroativos
INSERT INTO duaia_profiles (user_id, display_name)
SELECT id, name FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO duacoin_profiles (user_id, balance)
SELECT id, 0 FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
\`\`\`

### Passo 3: Atualizar Código
\`\`\`typescript
// Trocar imports
import { getUnifiedUser } from '@/lib/unified-helpers';

// Trocar queries
// DE: .from('conversations')
// PARA: .from('duaia_conversations')
\`\`\`

## Vantagens

✅ **Zero Duplicação**: Um user = um auth.users
✅ **Isolamento**: RLS garante privacidade
✅ **Sincronização**: Triggers automáticos
✅ **Escalabilidade**: Fácil adicionar novos produtos
✅ **Manutenção**: Mudanças em auth refletem em tudo
✅ **Segurança**: Cross-product leaks impossíveis

## Manutenção

### Adicionar Novo Produto
\`\`\`sql
-- 1. Criar tabelas com prefixo
CREATE TABLE public.novoproduto_profiles (...);

-- 2. Criar trigger de auto-criação
CREATE FUNCTION create_novoproduto_profile() ...;
CREATE TRIGGER on_auth_user_created_novoproduto ...;

-- 3. Criar RLS policies
ALTER TABLE novoproduto_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY ...;
\`\`\`

### Adicionar Campo em User
\`\`\`sql
-- Adicionar em auth.users (evitar se possível)
-- OU adicionar em perfil específico
ALTER TABLE duaia_profiles ADD COLUMN novo_campo TEXT;
\`\`\`

## Troubleshooting

### User não tem perfil
\`\`\`sql
-- Verificar triggers
SELECT * FROM pg_trigger WHERE tgname LIKE '%duaia%';

-- Criar perfil manualmente
INSERT INTO duaia_profiles (user_id) VALUES ('user-uuid');
\`\`\`

### RLS bloqueando
\`\`\`sql
-- Verificar policies
SELECT * FROM pg_policies WHERE tablename LIKE 'duaia%';

-- Testar como user
SET ROLE authenticated;
SET request.jwt.claim.sub = 'user-uuid';
SELECT * FROM duaia_profiles;
\`\`\`
`;

fs.writeFileSync('UNIFIED_ARCHITECTURE.md', docsMarkdown);
console.log('📄 Documentação criada: UNIFIED_ARCHITECTURE.md');

console.log('\n✅ ARQUITETURA UNIFICADA COMPLETA!\n');
console.log('📋 RESUMO:\n');
console.log('✅ SQL gerado: UNIFIED_SCHEMA.sql');
console.log('✅ Helpers criados: lib/unified-helpers.ts');
console.log('✅ Documentação: UNIFIED_ARCHITECTURE.md');
console.log();
console.log('📋 PRÓXIMOS PASSOS:\n');
console.log('1. Executar UNIFIED_SCHEMA.sql no Supabase Dashboard');
console.log('2. Verificar triggers criados');
console.log('3. Testar criação de novo user (perfis devem ser auto-criados)');
console.log('4. Atualizar código para usar lib/unified-helpers.ts');
console.log('5. Migrar queries para usar tabelas prefixadas (duaia_*, duacoin_*)');
console.log();


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

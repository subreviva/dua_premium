-- ============================================================
-- UNIFIED SCHEMA COMPLETE - Todas as 7 tabelas
-- ============================================================

-- TABELAS JÁ CRIADAS (não precisa executar novamente):
-- ✅ duaia_profiles
-- ✅ duacoin_profiles
-- ✅ users.duaia_enabled
-- ✅ users.duacoin_enabled

-- ============================================================
-- TABELAS FALTANTES (5/7)
-- ============================================================

-- 1. duaia_conversations (conversas do DUA IA)
CREATE TABLE IF NOT EXISTS public.duaia_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  model TEXT DEFAULT 'gpt-4o-mini',
  system_prompt TEXT,
  message_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_duaia_conversations_user ON public.duaia_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_duaia_conversations_updated ON public.duaia_conversations(updated_at DESC);

ALTER TABLE public.duaia_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own conversations" ON public.duaia_conversations;
CREATE POLICY "Users manage own conversations"
ON public.duaia_conversations
FOR ALL
USING (auth.uid() = user_id);

-- 2. duaia_messages (mensagens do DUA IA)
CREATE TABLE IF NOT EXISTS public.duaia_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.duaia_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens_used INT DEFAULT 0,
  model TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_duaia_messages_conversation ON public.duaia_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_duaia_messages_user ON public.duaia_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_duaia_messages_created ON public.duaia_messages(created_at DESC);

ALTER TABLE public.duaia_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own messages" ON public.duaia_messages;
CREATE POLICY "Users manage own messages"
ON public.duaia_messages
FOR ALL
USING (auth.uid() = user_id);

-- 3. duaia_projects (projetos gerados no DUA IA)
CREATE TABLE IF NOT EXISTS public.duaia_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.duaia_conversations(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  code_content TEXT,
  language TEXT,
  framework TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_duaia_projects_user ON public.duaia_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_duaia_projects_conversation ON public.duaia_projects(conversation_id);
CREATE INDEX IF NOT EXISTS idx_duaia_projects_status ON public.duaia_projects(status);

ALTER TABLE public.duaia_projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own projects" ON public.duaia_projects;
CREATE POLICY "Users manage own projects"
ON public.duaia_projects
FOR ALL
USING (auth.uid() = user_id);

-- 4. duacoin_transactions (transações da DUA COIN)
CREATE TABLE IF NOT EXISTS public.duacoin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'transfer', 'reward', 'payment', 'refund')),
  amount DECIMAL(20, 8) NOT NULL,
  balance_before DECIMAL(20, 8) NOT NULL,
  balance_after DECIMAL(20, 8) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  description TEXT,
  metadata JSONB,
  from_address TEXT,
  to_address TEXT,
  tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_duacoin_transactions_user ON public.duacoin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_duacoin_transactions_type ON public.duacoin_transactions(type);
CREATE INDEX IF NOT EXISTS idx_duacoin_transactions_status ON public.duacoin_transactions(status);
CREATE INDEX IF NOT EXISTS idx_duacoin_transactions_created ON public.duacoin_transactions(created_at DESC);

ALTER TABLE public.duacoin_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own transactions" ON public.duacoin_transactions;
CREATE POLICY "Users read own transactions"
ON public.duacoin_transactions
FOR SELECT
USING (auth.uid() = user_id);

-- 5. duacoin_staking (staking da DUA COIN)
CREATE TABLE IF NOT EXISTS public.duacoin_staking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(20, 8) NOT NULL,
  duration_days INT NOT NULL,
  apy_rate DECIMAL(5, 2) NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ NOT NULL,
  rewards_earned DECIMAL(20, 8) DEFAULT 0,
  last_reward_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_duacoin_staking_user ON public.duacoin_staking(user_id);
CREATE INDEX IF NOT EXISTS idx_duacoin_staking_status ON public.duacoin_staking(status);
CREATE INDEX IF NOT EXISTS idx_duacoin_staking_end_date ON public.duacoin_staking(end_date);

ALTER TABLE public.duacoin_staking ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own staking" ON public.duacoin_staking;
CREATE POLICY "Users manage own staking"
ON public.duacoin_staking
FOR ALL
USING (auth.uid() = user_id);

-- ============================================================
-- TRIGGERS PARA ATUALIZAR CONTADORES
-- ============================================================

-- Atualizar conversations_count em duaia_profiles
CREATE OR REPLACE FUNCTION update_duaia_conversations_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.duaia_profiles
  SET conversations_count = (
    SELECT COUNT(*) FROM public.duaia_conversations WHERE user_id = NEW.user_id
  )
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_conversation_created ON public.duaia_conversations;
CREATE TRIGGER on_conversation_created
  AFTER INSERT ON public.duaia_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_duaia_conversations_count();

-- Atualizar messages_count em duaia_profiles
CREATE OR REPLACE FUNCTION update_duaia_messages_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.duaia_profiles
  SET 
    messages_count = (
      SELECT COUNT(*) FROM public.duaia_messages WHERE user_id = NEW.user_id
    ),
    tokens_used = (
      SELECT COALESCE(SUM(tokens_used), 0) FROM public.duaia_messages WHERE user_id = NEW.user_id
    )
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_message_created ON public.duaia_messages;
CREATE TRIGGER on_message_created
  AFTER INSERT ON public.duaia_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_duaia_messages_count();

-- Atualizar message_count em duaia_conversations
CREATE OR REPLACE FUNCTION update_conversation_message_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.duaia_conversations
  SET 
    message_count = (
      SELECT COUNT(*) FROM public.duaia_messages WHERE conversation_id = NEW.conversation_id
    ),
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_message_added ON public.duaia_messages;
CREATE TRIGGER on_message_added
  AFTER INSERT ON public.duaia_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_message_count();

-- ============================================================
-- VERIFICAÇÃO FINAL
-- ============================================================
SELECT 
  'duaia_profiles' as table_name,
  COUNT(*) as total_records
FROM public.duaia_profiles
UNION ALL
SELECT 
  'duacoin_profiles' as table_name,
  COUNT(*) as total_records
FROM public.duacoin_profiles
UNION ALL
SELECT 
  'duaia_conversations' as table_name,
  COUNT(*) as total_records
FROM public.duaia_conversations
UNION ALL
SELECT 
  'duaia_messages' as table_name,
  COUNT(*) as total_records
FROM public.duaia_messages
UNION ALL
SELECT 
  'duaia_projects' as table_name,
  COUNT(*) as total_records
FROM public.duaia_projects
UNION ALL
SELECT 
  'duacoin_transactions' as table_name,
  COUNT(*) as total_records
FROM public.duacoin_transactions
UNION ALL
SELECT 
  'duacoin_staking' as table_name,
  COUNT(*) as total_records
FROM public.duacoin_staking;

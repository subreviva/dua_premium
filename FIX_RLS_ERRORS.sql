-- ============================================
-- FIX URGENTE: Erros 403, 406, 409 no sistema
-- ============================================

-- 1. Verificar se tabela users existe e tem colunas necessárias
DO $$ 
BEGIN
  -- Adicionar colunas que podem estar faltando
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'role'
  ) THEN
    ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'full_access'
  ) THEN
    ALTER TABLE users ADD COLUMN full_access BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE users ADD COLUMN avatar_url TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'credits'
  ) THEN
    ALTER TABLE users ADD COLUMN credits INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'name'
  ) THEN
    ALTER TABLE users ADD COLUMN name TEXT;
  END IF;
END $$;

-- 2. CRIAR tabela duaia_user_balances se não existir
CREATE TABLE IF NOT EXISTS duaia_user_balances (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  servicos_creditos INTEGER DEFAULT 100,
  duacoin_balance DECIMAL(20, 8) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. REMOVER todas as políticas RLS antigas
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_insert_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_insert_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;

DROP POLICY IF EXISTS "balances_select_own" ON duaia_user_balances;
DROP POLICY IF EXISTS "balances_insert_own" ON duaia_user_balances;
DROP POLICY IF EXISTS "balances_update_own" ON duaia_user_balances;

-- 4. ATIVAR RLS nas tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE duaia_user_balances ENABLE ROW LEVEL SECURITY;

-- 5. POLÍTICAS ULTRA-PERMISSIVAS para tabela users
CREATE POLICY "users_select_own"
ON users FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "users_insert_own"
ON users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 6. POLÍTICAS ULTRA-PERMISSIVAS para duaia_user_balances
CREATE POLICY "balances_select_own"
ON duaia_user_balances FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "balances_insert_own"
ON duaia_user_balances FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "balances_update_own"
ON duaia_user_balances FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 7. Garantir que tabela admin_accounts existe
CREATE TABLE IF NOT EXISTS admin_accounts (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'user',
  permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. RLS para admin_accounts
ALTER TABLE admin_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_select_own" ON admin_accounts;
CREATE POLICY "admin_select_own"
ON admin_accounts FOR SELECT
TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "admin_insert_own" ON admin_accounts;
CREATE POLICY "admin_insert_own"
ON admin_accounts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- 9. Função para criar usuário automaticamente
CREATE OR REPLACE FUNCTION create_user_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir em users
  INSERT INTO public.users (id, email, created_at)
  VALUES (NEW.id, NEW.email, NOW())
  ON CONFLICT (id) DO NOTHING;

  -- Inserir em duaia_user_balances
  INSERT INTO public.duaia_user_balances (user_id, servicos_creditos, duacoin_balance)
  VALUES (NEW.id, 100, 0)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Trigger para criar usuário automaticamente no signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_on_signup();

-- 11. GRANT permissões explícitas
GRANT ALL ON users TO authenticated;
GRANT ALL ON duaia_user_balances TO authenticated;
GRANT ALL ON admin_accounts TO authenticated;

-- ============================================
-- RESULTADO ESPERADO:
-- ✅ Sem erros 403 (permissão negada)
-- ✅ Sem erros 406 (coluna não encontrada)  
-- ✅ Sem erros 409 (conflito ao inserir)
-- ✅ Usuários criados automaticamente
-- ✅ Créditos iniciais de 100
-- ============================================

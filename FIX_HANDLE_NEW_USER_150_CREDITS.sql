-- ═══════════════════════════════════════════════════════════════
-- 🔧 CORREÇÃO: Função handle_new_user - 150 Créditos Iniciais
-- ═══════════════════════════════════════════════════════════════
-- 
-- PROBLEMA:
--   Função atual cria users com apenas 30 créditos
--   Deve criar com 150 créditos (padrão DUA IA)
-- 
-- SOLUÇÃO:
--   Atualizar função para:
--   1. Dar 150 créditos de serviços
--   2. Inicializar todas as colunas de créditos
--   3. Marcar has_access = true (já têm código validado)
-- 
-- @created 2025-11-12
-- @author DUA IA - Ultra Rigoroso System
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Criar perfil com 150 créditos iniciais
  INSERT INTO public.users (
    id,
    email,
    name,
    credits,
    creditos_servicos,
    duaia_credits,
    duacoin_balance,
    saldo_dua,
    has_access,
    email_verified,
    registration_completed,
    account_type
  )
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)), -- Extrair nome do metadata ou email
    150, -- créditos gerais
    150, -- ⚡ CRÍTICO: créditos de serviços (SOURCE OF TRUTH)
    0, -- duaia credits
    0, -- duacoin balance
    50, -- saldo DUA inicial
    true, -- ✅ Acesso garantido (código já validado antes de signup)
    CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN true ELSE false END, -- Verificar se email confirmado
    false, -- onboarding ainda não completo
    'normal' -- conta tipo normal
  )
  ON CONFLICT (id) DO UPDATE SET
    -- Se já existir (improvável), garantir que tem os créditos certos
    credits = GREATEST(EXCLUDED.credits, users.credits),
    creditos_servicos = CASE 
      WHEN users.creditos_servicos = 0 OR users.creditos_servicos IS NULL 
      THEN 150 
      ELSE users.creditos_servicos 
    END,
    has_access = true,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════
-- COMENTÁRIO: Documentar mudança
-- ═══════════════════════════════════════════════════════════════

COMMENT ON FUNCTION public.handle_new_user() IS 
'Trigger function: Cria perfil automaticamente quando user faz signup. 
Inicializa com 150 créditos de serviços (padrão DUA IA).
Atualizado em 2025-11-12 para corrigir bug de 0 créditos.';

-- ═══════════════════════════════════════════════════════════════
-- TESTE: Verificar se função funciona
-- ═══════════════════════════════════════════════════════════════

-- Para testar, criar user temporário:
-- INSERT INTO auth.users (id, email, email_confirmed_at) 
-- VALUES (gen_random_uuid(), 'test@example.com', NOW());
-- 
-- Depois verificar:
-- SELECT id, email, creditos_servicos FROM users WHERE email = 'test@example.com';
-- 
-- Limpar:
-- DELETE FROM users WHERE email = 'test@example.com';
-- DELETE FROM auth.users WHERE email = 'test@example.com';

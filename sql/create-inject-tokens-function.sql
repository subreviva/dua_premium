-- ================================================================
-- FUNÇÃO: inject_tokens
-- ================================================================
-- Permite administradores injetar tokens em contas de usuários
-- Usado no painel de administração para adicionar créditos
-- ================================================================

-- Remove função existente se houver
DROP FUNCTION IF EXISTS public.inject_tokens(integer, uuid);
DROP FUNCTION IF EXISTS public.inject_tokens(bigint, uuid);

-- Cria a função inject_tokens
CREATE OR REPLACE FUNCTION public.inject_tokens(
  tokens_amount INTEGER,
  user_id UUID
)
RETURNS TABLE(
  success BOOLEAN,
  new_balance INTEGER,
  message TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER -- Executa com privilégios do criador
AS $$
DECLARE
  current_balance INTEGER;
  admin_id UUID;
BEGIN
  -- Pega o ID do usuário que está executando
  admin_id := auth.uid();
  
  -- Verifica se quem está executando é admin (has_access = true)
  IF NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = admin_id 
    AND has_access = true
  ) THEN
    RETURN QUERY SELECT FALSE, 0, 'Acesso negado: apenas administradores podem injetar tokens'::TEXT;
    RETURN;
  END IF;

  -- Verifica se o usuário alvo existe
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = user_id) THEN
    RETURN QUERY SELECT FALSE, 0, 'Usuário não encontrado'::TEXT;
    RETURN;
  END IF;

  -- Valida quantidade de tokens
  IF tokens_amount <= 0 THEN
    RETURN QUERY SELECT FALSE, 0, 'Quantidade de tokens deve ser maior que zero'::TEXT;
    RETURN;
  END IF;

  -- Pega saldo atual
  SELECT COALESCE(total_tokens, 0) INTO current_balance
  FROM public.users
  WHERE id = user_id;

  -- Atualiza o saldo
  UPDATE public.users
  SET 
    total_tokens = COALESCE(total_tokens, 0) + tokens_amount,
    updated_at = NOW()
  WHERE id = user_id;

  -- Registra no audit_logs (se a tabela existir)
  BEGIN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      details,
      ip_address,
      created_at
    ) VALUES (
      user_id,
      'tokens_injected',
      jsonb_build_object(
        'amount', tokens_amount,
        'previous_balance', current_balance,
        'new_balance', current_balance + tokens_amount,
        'injected_by', admin_id
      ),
      inet_client_addr()::TEXT,
      NOW()
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- Ignora erro se audit_logs não existir
      NULL;
  END;

  -- Retorna sucesso
  RETURN QUERY SELECT 
    TRUE, 
    (current_balance + tokens_amount)::INTEGER, 
    format('✅ %s tokens injetados com sucesso! Novo saldo: %s', tokens_amount, current_balance + tokens_amount)::TEXT;
END;
$$;

-- Comentário da função
COMMENT ON FUNCTION public.inject_tokens IS 'Injeta tokens em conta de usuário (apenas admins)';

-- ================================================================
-- PERMISSÕES
-- ================================================================

-- Permite execução apenas para usuários autenticados
GRANT EXECUTE ON FUNCTION public.inject_tokens TO authenticated;

-- Remove permissão de anônimos (segurança)
REVOKE EXECUTE ON FUNCTION public.inject_tokens FROM anon;

-- ================================================================
-- FORÇA RELOAD DO SCHEMA CACHE
-- ================================================================

-- Notifica PostgREST para recarregar o schema
NOTIFY pgrst, 'reload schema';

-- Aguarda 1 segundo
SELECT pg_sleep(1);

-- Notifica novamente (garantia)
NOTIFY pgrst, 'reload schema';

-- Aguarda 1 segundo
SELECT pg_sleep(1);

-- Notifica terceira vez (máxima garantia)
NOTIFY pgrst, 'reload schema';

-- ================================================================
-- TESTE DA FUNÇÃO (opcional - comente se não quiser testar)
-- ================================================================

-- Para testar, descomente as linhas abaixo e substitua pelo UUID real:
/*
SELECT * FROM public.inject_tokens(
  100,  -- quantidade de tokens
  'SEU-USER-UUID-AQUI'::UUID  -- UUID do usuário
);
*/

-- ================================================================
-- ✅ PRONTO!
-- ================================================================
-- Execute este script no Supabase SQL Editor
-- A função inject_tokens estará disponível imediatamente
-- ================================================================

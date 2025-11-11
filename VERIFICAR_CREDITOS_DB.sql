-- =====================================================
-- 🔍 SCRIPT DE VERIFICAÇÃO DO SISTEMA DE CRÉDITOS
-- =====================================================
-- Execute no Supabase Dashboard → SQL Editor
-- Este script verifica qual estrutura de créditos existe
-- =====================================================

-- 1. VERIFICAR SE TABELA duaia_user_balances EXISTE
-- =====================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'duaia_user_balances'
  ) THEN
    RAISE NOTICE '✅ Tabela duaia_user_balances EXISTE';
  ELSE
    RAISE NOTICE '❌ Tabela duaia_user_balances NÃO EXISTE';
  END IF;
END $$;

-- 2. VERIFICAR SE COLUNA users.credits EXISTE
-- =====================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'credits'
  ) THEN
    RAISE NOTICE '✅ Coluna users.credits EXISTE';
  ELSE
    RAISE NOTICE '❌ Coluna users.credits NÃO EXISTE';
  END IF;
END $$;

-- 3. VERIFICAR SE RPC deduct_servicos_credits EXISTE
-- =====================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_proc 
    WHERE proname = 'deduct_servicos_credits'
  ) THEN
    RAISE NOTICE '✅ RPC deduct_servicos_credits EXISTE';
  ELSE
    RAISE NOTICE '❌ RPC deduct_servicos_credits NÃO EXISTE';
  END IF;
END $$;

-- 4. VERIFICAR SE RPC get_service_cost EXISTE
-- =====================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_proc 
    WHERE proname = 'get_service_cost'
  ) THEN
    RAISE NOTICE '✅ RPC get_service_cost EXISTE';
  ELSE
    RAISE NOTICE '❌ RPC get_service_cost NÃO EXISTE';
  END IF;
END $$;

-- 5. VERIFICAR ESTRUTURA DA TABELA duaia_user_balances (SE EXISTE)
-- =====================================================
SELECT 
  'duaia_user_balances' as tabela,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'duaia_user_balances'
ORDER BY ordinal_position;

-- 6. VERIFICAR COLUNAS RELACIONADAS A CRÉDITOS NA TABELA users
-- =====================================================
SELECT 
  'users' as tabela,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users'
  AND (
    column_name LIKE '%credit%' 
    OR column_name LIKE '%balance%'
    OR column_name LIKE '%coin%'
  )
ORDER BY ordinal_position;

-- 7. CONTAR REGISTROS EM duaia_user_balances (SE EXISTE)
-- =====================================================
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'duaia_user_balances') THEN
    SELECT COUNT(*) INTO v_count FROM duaia_user_balances;
    RAISE NOTICE '📊 Total de registros em duaia_user_balances: %', v_count;
  END IF;
END $$;

-- 8. VERIFICAR POLÍTICAS RLS EM duaia_user_balances (SE EXISTE)
-- =====================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'duaia_user_balances';

-- 9. EXEMPLO DE CONSULTA PARA VERIFICAR SEU PRÓPRIO SALDO
-- =====================================================
-- Substitua 'SEU_USER_ID_AQUI' pelo ID real do seu usuário

-- Se duaia_user_balances existe:
-- SELECT 
--   user_id,
--   servicos_creditos,
--   duacoin_balance,
--   created_at,
--   updated_at
-- FROM duaia_user_balances
-- WHERE user_id = 'SEU_USER_ID_AQUI';

-- Se users.credits existe:
-- SELECT 
--   id,
--   email,
--   credits,
--   duaia_credits,
--   duacoin_balance
-- FROM users
-- WHERE id = 'SEU_USER_ID_AQUI';

-- =====================================================
-- 📋 RESUMO DA VERIFICAÇÃO
-- =====================================================
DO $$
DECLARE
  v_has_duaia_balances BOOLEAN;
  v_has_users_credits BOOLEAN;
  v_has_deduct_rpc BOOLEAN;
  v_has_cost_rpc BOOLEAN;
BEGIN
  -- Verificar existência das estruturas
  v_has_duaia_balances := EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'duaia_user_balances'
  );
  
  v_has_users_credits := EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'credits'
  );
  
  v_has_deduct_rpc := EXISTS (
    SELECT FROM pg_proc WHERE proname = 'deduct_servicos_credits'
  );
  
  v_has_cost_rpc := EXISTS (
    SELECT FROM pg_proc WHERE proname = 'get_service_cost'
  );

  -- Mostrar resumo
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE '📊 RESUMO DA VERIFICAÇÃO DO SISTEMA DE CRÉDITOS';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  
  IF v_has_duaia_balances THEN
    RAISE NOTICE '✅ Sistema DUA IA (duaia_user_balances) - ENCONTRADO';
  ELSE
    RAISE NOTICE '❌ Sistema DUA IA (duaia_user_balances) - NÃO ENCONTRADO';
  END IF;
  
  IF v_has_users_credits THEN
    RAISE NOTICE '✅ Sistema Legacy (users.credits) - ENCONTRADO';
  ELSE
    RAISE NOTICE '❌ Sistema Legacy (users.credits) - NÃO ENCONTRADO';
  END IF;
  
  IF v_has_deduct_rpc THEN
    RAISE NOTICE '✅ RPC deduct_servicos_credits - ENCONTRADO';
  ELSE
    RAISE NOTICE '❌ RPC deduct_servicos_credits - NÃO ENCONTRADO';
  END IF;
  
  IF v_has_cost_rpc THEN
    RAISE NOTICE '✅ RPC get_service_cost - ENCONTRADO';
  ELSE
    RAISE NOTICE '❌ RPC get_service_cost - NÃO ENCONTRADO';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE '🎯 RECOMENDAÇÃO';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  
  IF v_has_duaia_balances AND v_has_deduct_rpc THEN
    RAISE NOTICE '✅ Sistema DUA IA está completo e funcional!';
    RAISE NOTICE '   Use: duaia_user_balances.servicos_creditos';
  ELSIF v_has_users_credits THEN
    RAISE NOTICE '⚠️  Apenas sistema Legacy encontrado.';
    RAISE NOTICE '   Aplique o SQL para criar estrutura DUA IA completa.';
  ELSE
    RAISE NOTICE '❌ NENHUM sistema de créditos encontrado!';
    RAISE NOTICE '   URGENTE: Aplique um dos SQLs de setup.';
  END IF;
  
  RAISE NOTICE '';
END $$;

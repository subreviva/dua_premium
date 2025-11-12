-- ============================================
-- 🎨 FUNÇÃO: Criar usuário de teste para Imagen
-- ============================================
--
-- Esta função cria ou retorna um usuário de teste para validação
-- do sistema de créditos do Image Studio
--
-- Uso: SELECT get_or_create_test_user_for_imagen('test@example.com', 'Test User', 1000);

CREATE OR REPLACE FUNCTION get_or_create_test_user_for_imagen(
  p_email TEXT,
  p_name TEXT DEFAULT 'Test User',
  p_initial_credits INTEGER DEFAULT 1000
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_credits_exists BOOLEAN;
BEGIN
  -- Verificar se usuário já existe (por email)
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email
  LIMIT 1;

  -- Se não existe, criar novo usuário
  IF v_user_id IS NULL THEN
    -- Inserir usuário no auth.users (Supabase Auth)
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      p_email,
      crypt('test-password-imagen-2025', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('name', p_name, 'test_user', true),
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    )
    RETURNING id INTO v_user_id;

    RAISE NOTICE 'Novo usuário criado: %', v_user_id;
  ELSE
    RAISE NOTICE 'Usuário existente encontrado: %', v_user_id;
  END IF;

  -- Verificar se registro de créditos existe
  SELECT EXISTS(
    SELECT 1 FROM creditos_servicos WHERE user_id = v_user_id
  ) INTO v_credits_exists;

  -- Se não existe, criar registro de créditos
  IF NOT v_credits_exists THEN
    INSERT INTO creditos_servicos (
      user_id,
      creditos_disponiveis,
      creditos_totais_comprados,
      creditos_totais_gastos
    ) VALUES (
      v_user_id,
      p_initial_credits,
      p_initial_credits,
      0
    );

    RAISE NOTICE 'Registro de créditos criado: % créditos', p_initial_credits;
  ELSE
    -- Atualizar créditos para valor inicial (reset para testes)
    UPDATE creditos_servicos
    SET creditos_disponiveis = p_initial_credits
    WHERE user_id = v_user_id;

    RAISE NOTICE 'Créditos resetados para: %', p_initial_credits;
  END IF;

  RETURN v_user_id;
END;
$$;

-- Comentário na função
COMMENT ON FUNCTION get_or_create_test_user_for_imagen IS 
  'Cria ou retorna usuário de teste para validação do Image Studio. Uso apenas para testes!';

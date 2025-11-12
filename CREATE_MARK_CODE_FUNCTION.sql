-- ═══════════════════════════════════════════════════════════════
-- 🛡️ FUNÇÃO: Marcar Código de Acesso como Usado (Thread-Safe)
-- ═══════════════════════════════════════════════════════════════
-- 
-- DESCRIÇÃO:
--   Marca um código de convite como usado de forma ATÓMICA.
--   Garante que apenas 1 utilizador pode usar cada código.
--   Usa SELECT FOR UPDATE para lock pessimista.
-- 
-- PARÂMETROS:
--   p_code      TEXT     - Código de acesso (case-insensitive)
--   p_user_id   UUID     - ID do utilizador que está usando o código
-- 
-- RETORNO:
--   JSON com sucesso/erro
-- 
-- EXEMPLOS:
--   SELECT mark_invite_code_as_used('ABC123', '550e8400-e29b-41d4-a716-446655440000');
--   → { "success": true, "message": "Código marcado como usado" }
--   
--   SELECT mark_invite_code_as_used('ABC123', 'outro-user-id');
--   → { "success": false, "error": "Código já foi utilizado" }
-- 
-- @created 2024-01-24
-- @author DUA IA - Ultra Rigoroso System
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION mark_invite_code_as_used(
  p_code TEXT,
  p_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_code_record RECORD;
BEGIN
  -- 🔒 LOCK: Adquirir lock EXCLUSIVO na linha do código
  -- FOR UPDATE garante que apenas 1 transação pode processar este código
  SELECT id, code, active, used_by
  INTO v_code_record
  FROM invite_codes
  WHERE UPPER(code) = UPPER(p_code)
  FOR UPDATE; -- ⚡ CRÍTICO: Lock pessimista

  -- Verificar se código existe
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Código não encontrado',
      'code', 'CODE_NOT_FOUND'
    );
  END IF;

  -- Verificar se código ainda está ativo
  IF v_code_record.active = false OR v_code_record.used_by IS NOT NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Este código já foi utilizado por outro utilizador',
      'code', 'CODE_ALREADY_USED',
      'used_by', v_code_record.used_by
    );
  END IF;

  -- ✅ Código válido e ativo - marcar como usado
  UPDATE invite_codes
  SET 
    active = false,
    used_by = p_user_id,
    used_at = NOW()
  WHERE id = v_code_record.id;

  -- Retornar sucesso
  RETURN json_build_object(
    'success', true,
    'message', 'Código marcado como usado com sucesso',
    'code', v_code_record.code,
    'marked_at', NOW()
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Tratar erros inesperados
    RETURN json_build_object(
      'success', false,
      'error', 'Erro interno ao processar código',
      'code', 'INTERNAL_ERROR',
      'details', SQLERRM
    );
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- PERMISSÕES: Permitir uso por utilizadores autenticados
-- ═══════════════════════════════════════════════════════════════

-- Permitir uso da função por todos autenticados
GRANT EXECUTE ON FUNCTION mark_invite_code_as_used(TEXT, UUID) TO authenticated;

-- Permitir uso da função via anon (para registo)
GRANT EXECUTE ON FUNCTION mark_invite_code_as_used(TEXT, UUID) TO anon;

-- ═══════════════════════════════════════════════════════════════
-- COMENTÁRIOS: Documentação no schema
-- ═══════════════════════════════════════════════════════════════

COMMENT ON FUNCTION mark_invite_code_as_used(TEXT, UUID) IS 
'Marca código de convite como usado de forma thread-safe usando SELECT FOR UPDATE lock';

-- ═══════════════════════════════════════════════════════════════
-- SPRINT 2: ORGANIZAÇÃO POR DATA
-- ═══════════════════════════════════════════════════════════════
-- Adiciona função para agrupar conversas por data
-- Grupos: Hoje / Ontem / Últimos 7 dias / Últimos 30 dias / Mais antigos
-- ═══════════════════════════════════════════════════════════════

-- Função: Agrupar conversas por data
CREATE OR REPLACE FUNCTION get_conversations_grouped_by_date(uid UUID)
RETURNS TABLE (
  group_name TEXT,
  group_order INTEGER,
  conversations JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH grouped AS (
    SELECT 
      CASE 
        WHEN DATE(c.updated_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo') = CURRENT_DATE THEN 'Hoje'
        WHEN DATE(c.updated_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo') = CURRENT_DATE - INTERVAL '1 day' THEN 'Ontem'
        WHEN c.updated_at >= NOW() - INTERVAL '7 days' THEN 'Últimos 7 dias'
        WHEN c.updated_at >= NOW() - INTERVAL '30 days' THEN 'Últimos 30 dias'
        ELSE 'Mais antigos'
      END as grp_name,
      CASE 
        WHEN DATE(c.updated_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo') = CURRENT_DATE THEN 1
        WHEN DATE(c.updated_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo') = CURRENT_DATE - INTERVAL '1 day' THEN 2
        WHEN c.updated_at >= NOW() - INTERVAL '7 days' THEN 3
        WHEN c.updated_at >= NOW() - INTERVAL '30 days' THEN 4
        ELSE 5
      END as grp_order,
      jsonb_build_object(
        'id', c.id,
        'title', c.title,
        'messages', c.messages,
        'createdAt', c.created_at,
        'updatedAt', c.updated_at,
        'messageCount', c.message_count,
        'userId', c.user_id,
        'syncVersion', c.sync_version
      ) as conversation_json
    FROM conversations c
    WHERE c.user_id = uid 
      AND c.deleted_at IS NULL
    ORDER BY c.updated_at DESC
  )
  SELECT 
    grp_name as group_name,
    grp_order as group_order,
    jsonb_agg(conversation_json ORDER BY (conversation_json->>'updatedAt')::timestamptz DESC) as conversations
  FROM grouped
  GROUP BY grp_name, grp_order
  ORDER BY grp_order;
END;
$$;

-- Comentário da função
COMMENT ON FUNCTION get_conversations_grouped_by_date(UUID) IS 
'Retorna conversas do usuário agrupadas por período de tempo: Hoje, Ontem, Últimos 7 dias, Últimos 30 dias, Mais antigos. 
Usa timezone America/Sao_Paulo para cálculo de "Hoje" e "Ontem".
Retorna: group_name (TEXT), group_order (INTEGER), conversations (JSONB[])';

-- ═══════════════════════════════════════════════════════════════
-- TESTES
-- ═══════════════════════════════════════════════════════════════

-- Teste 1: Verificar função criada
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'get_conversations_grouped_by_date'
  ) THEN
    RAISE NOTICE '✅ Função get_conversations_grouped_by_date criada com sucesso';
  ELSE
    RAISE EXCEPTION '❌ Função get_conversations_grouped_by_date não foi criada';
  END IF;
END $$;

-- Teste 2: Executar com usuário de teste (substituir USER_ID_AQUI)
-- SELECT * FROM get_conversations_grouped_by_date('USER_ID_AQUI');

-- Resultado esperado:
-- group_name      | group_order | conversations
-- ----------------+-------------+---------------
-- Hoje            | 1           | [{...}, {...}]
-- Ontem           | 2           | [{...}]
-- Últimos 7 dias  | 3           | [{...}, {...}]
-- Últimos 30 dias | 4           | [{...}]
-- Mais antigos    | 5           | [{...}, {...}]

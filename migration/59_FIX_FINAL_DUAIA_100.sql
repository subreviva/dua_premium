-- 🔥 CORREÇÃO FINAL: DUA IA 85% → 100%
-- Problema 1: Coluna 'name' não existe em duaia_projects (já foi renomeada para 'title')
-- Problema 2: RLS INSERT policies em duaia_conversations e duaia_messages estão bloqueando
-- Problema 3: user_id em duaia_messages deve aceitar NULL (mensagens de IA não têm user_id)

-- ============================================================================
-- FIX 1: Adicionar RLS INSERT policies para duaia_conversations
-- ============================================================================

-- Limpar policies antigas que podem estar bloqueando
DROP POLICY IF EXISTS "duaia_conversations_insert" ON public.duaia_conversations;
DROP POLICY IF EXISTS "Users can insert own conversations" ON public.duaia_conversations;
DROP POLICY IF EXISTS "duaia_conversations_100_insert" ON public.duaia_conversations;

-- Criar policy de INSERT correta
CREATE POLICY "duaia_conversations_100_insert" ON public.duaia_conversations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- ============================================================================
-- FIX 2: Adicionar RLS INSERT policies para duaia_messages e permitir NULL user_id
-- ============================================================================

-- Permitir user_id NULL em duaia_messages (para mensagens de IA/assistant)
ALTER TABLE public.duaia_messages
  ALTER COLUMN user_id DROP NOT NULL;

-- Limpar policies antigas
DROP POLICY IF EXISTS "duaia_messages_insert" ON public.duaia_messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON public.duaia_messages;
DROP POLICY IF EXISTS "duaia_messages_100_insert" ON public.duaia_messages;

-- Criar policy de INSERT correta (permite mensagens de IA com user_id NULL)
CREATE POLICY "duaia_messages_100_insert" ON public.duaia_messages
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND (
      user_id = auth.uid() OR user_id IS NULL
    )
  );

-- ============================================================================
-- FIX 3: Corrigir TRIGGER de contadores de mensagens (melhorado)
-- ============================================================================

DROP TRIGGER IF EXISTS trigger_update_conversation_message_count_100 ON public.duaia_messages;

CREATE OR REPLACE FUNCTION update_conversation_message_count_100()
RETURNS TRIGGER AS $$
DECLARE
  msg_user_id UUID;
BEGIN
  -- Identificar user_id (da mensagem ou da conversa)
  IF NEW.user_id IS NOT NULL THEN
    msg_user_id := NEW.user_id;
  ELSE
    -- Se user_id é NULL (mensagem de IA), buscar da conversa
    SELECT user_id INTO msg_user_id
    FROM duaia_conversations
    WHERE id = NEW.conversation_id;
  END IF;

  -- Atualizar contador na conversa
  UPDATE duaia_conversations 
  SET 
    message_count = COALESCE(message_count, 0) + 1,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;

  -- Atualizar contador no profile (se tiver user_id)
  IF msg_user_id IS NOT NULL THEN
    UPDATE duaia_profiles 
    SET 
      messages_count = (
        SELECT COUNT(*) 
        FROM duaia_messages m
        LEFT JOIN duaia_conversations c ON m.conversation_id = c.id
        WHERE m.user_id = msg_user_id OR c.user_id = msg_user_id
      ),
      updated_at = NOW()
    WHERE user_id = msg_user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_conversation_message_count_100
  AFTER INSERT ON public.duaia_messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_message_count_100();

-- ============================================================================
-- FIX 4: Garantir que duaia_projects usa 'title' (não 'name')
-- ============================================================================

-- Já foi corrigido no SQL anterior (56_SQL_100_PERCENT_COMPLETE.sql)
-- Verificação: garantir que coluna title existe
ALTER TABLE public.duaia_projects 
  ADD COLUMN IF NOT EXISTS title TEXT;

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================
SELECT 
  '✅ CORREÇÃO DUA IA APLICADA' as status,
  'RLS INSERT policies criadas' as fix1,
  'user_id NULL permitido em messages' as fix2,
  'Trigger de contadores corrigido' as fix3,
  'Coluna title garantida em projects' as fix4;

-- Verificar policies criadas
SELECT 
  '🔐 RLS POLICIES DUA IA' as check_type,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
AND tablename LIKE 'duaia_%';

-- Verificar estrutura duaia_messages
SELECT 
  '📋 ESTRUTURA duaia_messages' as check_type,
  column_name,
  is_nullable,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'duaia_messages'
AND column_name IN ('user_id', 'conversation_id', 'role', 'content');

-- Verificar estrutura duaia_projects
SELECT 
  '📋 ESTRUTURA duaia_projects' as check_type,
  column_name,
  is_nullable,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'duaia_projects'
AND column_name IN ('title', 'description', 'user_id');

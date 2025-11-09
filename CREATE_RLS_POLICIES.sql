-- =========================================
-- POLÍTICAS RLS PARA duaia_conversations
-- =========================================
-- Este script cria políticas RLS que permitem que usuários autenticados
-- gerenciem suas próprias conversas

-- 1. Habilitar RLS na tabela (se ainda não estiver)
ALTER TABLE duaia_conversations ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Users can view their own conversations" ON duaia_conversations;
DROP POLICY IF EXISTS "Users can insert their own conversations" ON duaia_conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON duaia_conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON duaia_conversations;

-- 3. Criar política para SELECT (ler conversas)
CREATE POLICY "Users can view their own conversations"
ON duaia_conversations
FOR SELECT
USING (
  auth.uid() = user_id
);

-- 4. Criar política para INSERT (criar conversas)
CREATE POLICY "Users can insert their own conversations"
ON duaia_conversations
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
);

-- 5. Criar política para UPDATE (atualizar conversas)
CREATE POLICY "Users can update their own conversations"
ON duaia_conversations
FOR UPDATE
USING (
  auth.uid() = user_id
)
WITH CHECK (
  auth.uid() = user_id
);

-- 6. Criar política para DELETE (deletar conversas - soft delete)
CREATE POLICY "Users can delete their own conversations"
ON duaia_conversations
FOR DELETE
USING (
  auth.uid() = user_id
);

-- 7. Verificar políticas criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'duaia_conversations';

-- 8. Verificar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'duaia_conversations';

-- =========================================
-- RESULTADOS ESPERADOS:
-- =========================================
-- Deve mostrar 4 políticas:
-- 1. Users can view their own conversations (SELECT)
-- 2. Users can insert their own conversations (INSERT)
-- 3. Users can update their own conversations (UPDATE)
-- 4. Users can delete their own conversations (DELETE)
--
-- RLS deve estar habilitado: rowsecurity = true
-- =========================================

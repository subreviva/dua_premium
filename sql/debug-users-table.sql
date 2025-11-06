-- Script de DEBUG para verificar o estado atual da tabela users
-- Execute este script no SQL Editor do Supabase para diagnosticar o problema

-- 1. VERIFICAR SE A TABELA EXISTE
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'users'
    ) 
    THEN '✅ Tabela users existe'
    ELSE '❌ Tabela users NÃO existe'
  END as status_tabela;

-- 2. LISTAR TODAS AS COLUNAS DA TABELA USERS
SELECT 
  '📋 COLUNAS DA TABELA USERS:' as titulo;

SELECT 
  column_name as "Coluna",
  data_type as "Tipo",
  is_nullable as "Nullable",
  column_default as "Default"
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- 3. VERIFICAR CONSTRAINTS
SELECT 
  '🔒 CONSTRAINTS DA TABELA:' as titulo;

SELECT 
  conname as "Constraint",
  contype as "Tipo",
  pg_get_constraintdef(oid) as "Definição"
FROM pg_constraint
WHERE conrelid = 'public.users'::regclass;

-- 4. VERIFICAR ÍNDICES
SELECT 
  '📊 ÍNDICES DA TABELA:' as titulo;

SELECT 
  indexname as "Índice",
  indexdef as "Definição"
FROM pg_indexes
WHERE schemaname = 'public' 
  AND tablename = 'users';

-- 5. VERIFICAR RLS (Row Level Security)
SELECT 
  '🛡️ ROW LEVEL SECURITY:' as titulo;

SELECT 
  CASE 
    WHEN relrowsecurity 
    THEN '✅ RLS está ATIVADO'
    ELSE '❌ RLS está DESATIVADO'
  END as status_rls
FROM pg_class
WHERE relname = 'users' 
  AND relnamespace = 'public'::regnamespace;

-- 6. LISTAR POLÍTICAS RLS
SELECT 
  '📜 POLÍTICAS RLS:' as titulo;

SELECT 
  polname as "Política",
  polcmd as "Comando",
  polroles::regrole[] as "Roles",
  pg_get_expr(polqual, polrelid) as "USING",
  pg_get_expr(polwithcheck, polrelid) as "WITH CHECK"
FROM pg_policy
WHERE polrelid = 'public.users'::regclass;

-- 7. VERIFICAR SE HÁ DADOS NA TABELA
SELECT 
  '📈 ESTATÍSTICAS DA TABELA:' as titulo;

SELECT 
  COUNT(*) as "Total de Registros",
  COUNT(DISTINCT id) as "IDs Únicos",
  COUNT(name) as "Com Nome",
  COUNT(username) as "Com Username",
  COUNT(avatar_url) as "Com Avatar",
  COUNT(bio) as "Com Bio"
FROM public.users;

-- 8. TESTAR UPSERT (simulação sem executar)
SELECT 
  '🧪 TESTE DE UPSERT:' as titulo;

-- Mostrar exemplo de como fazer UPSERT
SELECT 
  'INSERT INTO public.users (id, email, name, username, bio, avatar_url, updated_at) 
   VALUES (''user-id-example'', ''email@example.com'', ''Nome'', ''username'', ''bio'', ''avatar.jpg'', NOW())
   ON CONFLICT (id) 
   DO UPDATE SET 
     name = EXCLUDED.name,
     username = EXCLUDED.username,
     bio = EXCLUDED.bio,
     avatar_url = EXCLUDED.avatar_url,
     updated_at = EXCLUDED.updated_at;' as exemplo_upsert;

-- 9. VERIFICAR PERMISSÕES DO USUÁRIO ATUAL
SELECT 
  '👤 PERMISSÕES DO USUÁRIO ATUAL:' as titulo;

SELECT 
  grantee as "Usuário",
  privilege_type as "Privilégio"
FROM information_schema.table_privileges
WHERE table_schema = 'public' 
  AND table_name = 'users'
  AND grantee = current_user;

-- 10. VERIFICAR SE O POSTGREST ESTÁ CIENTE DA TABELA
SELECT 
  '🔄 STATUS DO SCHEMA CACHE:' as titulo;

SELECT 
  pg_notify('pgrst', 'reload schema') as "Forçando reload do schema";

-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFICAÇÃO DE CRÉDITOS E DADOS DE USUÁRIO
-- Execute este SQL no Supabase SQL Editor para diagnosticar problemas
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Verificar TODOS os usuários e seus créditos
SELECT 
  u.id,
  u.email,
  u.name,
  u.avatar_url,
  u.has_access,
  u.creditos_servicos as creditos_tabela_users,
  b.servicos_creditos as creditos_tabela_balances,
  b.duacoin_balance,
  u.created_at,
  b.created_at as balance_created_at
FROM users u
LEFT JOIN duaia_user_balances b ON u.id = b.user_id
ORDER BY u.created_at DESC
LIMIT 20;

-- 2. Verificar se há usuários SEM balance
SELECT 
  u.id,
  u.email,
  u.name,
  'SEM BALANCE' as problema
FROM users u
LEFT JOIN duaia_user_balances b ON u.id = b.user_id
WHERE b.user_id IS NULL;

-- 3. Verificar se há balances ZERADOS quando deveriam ter 150
SELECT 
  b.user_id,
  u.email,
  b.servicos_creditos,
  'CRÉDITOS ZERADOS' as problema
FROM duaia_user_balances b
JOIN users u ON u.id = b.user_id
WHERE b.servicos_creditos = 0
  AND u.created_at > NOW() - INTERVAL '7 days'; -- Usuários dos últimos 7 dias

-- 4. CORRIGIR: Criar balances para usuários que não têm
INSERT INTO duaia_user_balances (user_id, servicos_creditos, duacoin_balance)
SELECT 
  u.id,
  150, -- Créditos iniciais
  0    -- DuaCoin inicial
FROM users u
LEFT JOIN duaia_user_balances b ON u.id = b.user_id
WHERE b.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- 5. CORRIGIR: Atualizar créditos para usuários recentes com balance zerado
UPDATE duaia_user_balances
SET servicos_creditos = 150
WHERE servicos_creditos = 0
  AND user_id IN (
    SELECT id FROM users 
    WHERE created_at > NOW() - INTERVAL '7 days'
  );

-- 6. Verificar resultado final
SELECT 
  COUNT(*) as total_usuarios,
  COUNT(b.user_id) as usuarios_com_balance,
  SUM(CASE WHEN b.servicos_creditos >= 150 THEN 1 ELSE 0 END) as usuarios_com_150_ou_mais,
  SUM(CASE WHEN b.servicos_creditos = 0 THEN 1 ELSE 0 END) as usuarios_com_zero_creditos
FROM users u
LEFT JOIN duaia_user_balances b ON u.id = b.user_id;

-- 7. Ver últimos registros criados (debug)
SELECT 
  u.email,
  u.name,
  u.avatar_url,
  b.servicos_creditos,
  u.created_at
FROM users u
LEFT JOIN duaia_user_balances b ON u.id = b.user_id
ORDER BY u.created_at DESC
LIMIT 5;

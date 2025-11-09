-- ===================================================
-- SISTEMA DE CRÉDITOS DUA IA - SCHEMA
-- ===================================================
-- Adiciona suporte para:
-- 1. Saldo DUA (saldo_dua) - moeda nativa para comprar créditos
-- 2. Créditos de Serviços (creditos_servicos) - consumidos nos serviços de IA
-- 3. Tabela de transações para auditoria
-- ===================================================

-- ===================================================
-- 1. ADICIONAR COLUNAS À TABELA USERS
-- ===================================================
-- Adicionar saldo_dua e creditos_servicos na tabela users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS saldo_dua DECIMAL(20, 8) DEFAULT 0,
ADD COLUMN IF NOT EXISTS creditos_servicos INTEGER DEFAULT 0;

-- Comentários descritivos
COMMENT ON COLUMN public.users.saldo_dua IS 'Saldo DUA nativo do utilizador (usado para comprar créditos de serviços)';
COMMENT ON COLUMN public.users.creditos_servicos IS 'Créditos de serviços de IA (consumidos ao usar os estúdios)';

-- ===================================================
-- 2. CRIAR TABELA DE TRANSAÇÕES
-- ===================================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Tipo de transação
    source_type TEXT NOT NULL CHECK (source_type IN (
        'DUA_IA_COMPRA_CREDITOS',
        'DUA_IA_GASTO_SERVICO',
        'DUA_IA_RECARGA_SALDO',
        'DUA_IA_BONUS',
        'DUA_IA_REEMBOLSO'
    )),
    
    -- Valores
    amount_dua DECIMAL(20, 8) DEFAULT 0, -- Valor em DUA (se aplicável)
    amount_creditos INTEGER DEFAULT 0,    -- Valor em créditos (se aplicável)
    
    -- Detalhes
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Status
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    
    -- Auditoria
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comentários
COMMENT ON TABLE public.transactions IS 'Registo de todas as transações de DUA e Créditos';
COMMENT ON COLUMN public.transactions.source_type IS 'Tipo de transação (compra de créditos, gasto em serviço, etc)';
COMMENT ON COLUMN public.transactions.amount_dua IS 'Quantidade de DUA movimentada (negativo = débito, positivo = crédito)';
COMMENT ON COLUMN public.transactions.amount_creditos IS 'Quantidade de créditos movimentados (negativo = gasto, positivo = compra)';

-- ===================================================
-- 3. ÍNDICES PARA PERFORMANCE
-- ===================================================
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_source_type ON public.transactions(source_type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_type ON public.transactions(user_id, source_type);

-- ===================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ===================================================
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Política: Utilizadores só podem ver suas próprias transações
DROP POLICY IF EXISTS "Users read own transactions" ON public.transactions;
CREATE POLICY "Users read own transactions"
ON public.transactions FOR SELECT
USING (auth.uid() = user_id);

-- Política: Apenas o sistema pode inserir transações (via service_role)
DROP POLICY IF EXISTS "System insert transactions" ON public.transactions;
CREATE POLICY "System insert transactions"
ON public.transactions FOR INSERT
WITH CHECK (true); -- Service role bypassa RLS

-- ===================================================
-- 5. CONSTRAINTS DE VALIDAÇÃO
-- ===================================================
-- Garantir que saldo_dua não seja negativo
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS check_saldo_dua_non_negative;
ALTER TABLE public.users ADD CONSTRAINT check_saldo_dua_non_negative 
CHECK (saldo_dua >= 0);

-- Garantir que creditos_servicos não seja negativo
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS check_creditos_non_negative;
ALTER TABLE public.users ADD CONSTRAINT check_creditos_non_negative 
CHECK (creditos_servicos >= 0);

-- ===================================================
-- 6. FUNÇÃO PARA ATUALIZAR updated_at
-- ===================================================
CREATE OR REPLACE FUNCTION update_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS trigger_update_transactions_updated_at ON public.transactions;
CREATE TRIGGER trigger_update_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION update_transactions_updated_at();

-- ===================================================
-- 7. VIEW PARA RELATÓRIOS
-- ===================================================
CREATE OR REPLACE VIEW public.user_balance_summary AS
SELECT 
    u.id as user_id,
    u.email,
    u.name,
    u.saldo_dua,
    u.creditos_servicos,
    COUNT(t.id) FILTER (WHERE t.source_type = 'DUA_IA_COMPRA_CREDITOS') as total_compras,
    COUNT(t.id) FILTER (WHERE t.source_type = 'DUA_IA_GASTO_SERVICO') as total_gastos,
    SUM(t.amount_creditos) FILTER (WHERE t.source_type = 'DUA_IA_COMPRA_CREDITOS') as total_creditos_comprados,
    SUM(ABS(t.amount_creditos)) FILTER (WHERE t.source_type = 'DUA_IA_GASTO_SERVICO') as total_creditos_gastos
FROM public.users u
LEFT JOIN public.transactions t ON t.user_id = u.id
GROUP BY u.id, u.email, u.name, u.saldo_dua, u.creditos_servicos;

COMMENT ON VIEW public.user_balance_summary IS 'Resumo de saldos e transações por utilizador';

-- ===================================================
-- 8. DADOS INICIAIS DE TESTE
-- ===================================================
-- Adicionar saldo inicial para utilizadores existentes (para testes)
UPDATE public.users 
SET saldo_dua = 100.00000000,
    creditos_servicos = 500
WHERE saldo_dua = 0 AND creditos_servicos = 0
  AND id IN (
    SELECT id FROM public.users 
    WHERE saldo_dua = 0 AND creditos_servicos = 0 
    LIMIT 5
  );

-- ===================================================
-- DONE: Schema de créditos completo!
-- ===================================================
-- Execute este SQL no Supabase SQL Editor
-- Depois implemente os endpoints de API
-- ===================================================

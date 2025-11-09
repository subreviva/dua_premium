# 🔧 APLICAR SCHEMA DE CRÉDITOS NO SUPABASE DASHBOARD

## ✅ STATUS ATUAL:
- ✅ `users.saldo_dua` - JÁ EXISTE
- ✅ `users.creditos_servicos` - JÁ EXISTE  
- ✅ `transactions` table - JÁ EXISTE (mas precisa de colunas)
- ⏳ Triggers de sincronização - PRECISA APLICAR
- ⏳ Funções SQL - PRECISA APLICAR

---

## 📋 PASSO A PASSO:

### 1️⃣ Abrir Supabase Dashboard

```bash
# URL do projeto:
https://supabase.com/dashboard/project/nranmngyocaqjwcokcxm
```

### 2️⃣ Ir para SQL Editor

- **Clique em:** SQL Editor (na barra lateral esquerda)
- **Clique em:** + New Query

### 3️⃣ Copiar e Colar o SQL

- **Arquivo:** `schema-creditos-sync-duacoin.sql`
- **Ação:** Copiar TODO o conteúdo (296 linhas)
- **Colar:** No SQL Editor do Supabase

### 4️⃣ Executar SQL

- **Clique em:** RUN (canto inferior direito)
- **Aguardar:** Processamento completo

### 5️⃣ Verificar Sucesso

Você deve ver:
```
✅ ALTER TABLE successful
✅ CREATE FUNCTION successful  
✅ CREATE TRIGGER successful
✅ CREATE INDEX successful
✅ CREATE POLICY successful
✅ CREATE VIEW successful
```

---

## 🎯 O QUE O SCHEMA FAZ:

### 1. **Completa tabela `transactions`:**
```sql
- id (UUID)
- user_id (FK para users)
- source_type (purchase, service_usage, refund, bonus, transfer)
- amount_dua (quanto DUA foi movido)
- amount_creditos (quantos créditos foram movidos)
- description (texto descritivo)
- metadata (JSON com detalhes)
- status (pending, completed, failed, refunded)
- created_at, updated_at
```

### 2. **Sincronização Automática:**
```
users.saldo_dua ↔️ duacoin_profiles.balance

Se você atualiza um, o outro atualiza automaticamente!
```

**Triggers criados:**
- `trigger_sync_saldo_to_duacoin` - users → duacoin_profiles
- `trigger_sync_duacoin_to_saldo` - duacoin_profiles → users

### 3. **Funções Atômicas:**

**`comprar_creditos(user_id, amount_eur, exchange_rate, creditos)`**
- Verifica saldo DUA suficiente
- Debita `saldo_dua`
- Credita `creditos_servicos`
- Registra em `transactions`
- Tudo ATÔMICO (ou tudo ou nada)

**`consumir_creditos(user_id, creditos, service_type, metadata)`**
- Verifica créditos suficientes
- Debita `creditos_servicos`
- Registra em `transactions`
- Tudo ATÔMICO

### 4. **View para Dashboard:**

**`user_balance_summary`**
```sql
SELECT 
  saldo_dua,
  creditos_servicos,
  duacoin_balance (= saldo_dua),
  total_transactions,
  total_creditos_comprados,
  total_creditos_consumidos
FROM user_balance_summary
WHERE id = 'user-uuid';
```

### 5. **RLS (Row Level Security):**
- Usuários veem APENAS suas próprias transações
- Apenas `service_role` pode inserir transações

### 6. **Índices para Performance:**
```sql
idx_transactions_user_id
idx_transactions_source_type
idx_transactions_created_at
idx_transactions_user_type
```

---

## ✅ APÓS APLICAR:

### Teste 1: Verificar sincronização

```sql
-- Atualizar saldo_dua
UPDATE users 
SET saldo_dua = 100 
WHERE email = 'vinhosclasse@gmail.com';

-- Verificar se duacoin_profiles.balance também mudou
SELECT 
  u.email,
  u.saldo_dua,
  dp.balance
FROM users u
JOIN duacoin_profiles dp ON u.id = dp.user_id
WHERE u.email = 'vinhosclasse@gmail.com';

-- Resultado esperado:
-- saldo_dua = 100
-- balance = 100 (sincronizado!)
```

### Teste 2: Comprar créditos

```sql
-- Comprar 1000 créditos por 10 EUR
SELECT comprar_creditos(
  (SELECT id FROM users WHERE email = 'vinhosclasse@gmail.com'),
  10.00,  -- EUR
  0.0476, -- Exchange rate (1 EUR = 21 DUA)
  1000    -- Créditos
);

-- Resultado esperado:
-- {
--   "success": true,
--   "transaction_id": "uuid...",
--   "saldo_dua_restante": 99.524,
--   "creditos_total": 1000
-- }
```

### Teste 3: Consumir créditos

```sql
-- Gerar música (50 créditos)
SELECT consumir_creditos(
  (SELECT id FROM users WHERE email = 'vinhosclasse@gmail.com'),
  50,
  'music_generation',
  '{"model": "suno", "duration": 30}'::jsonb
);

-- Resultado esperado:
-- {
--   "success": true,
--   "transaction_id": "uuid...",
--   "creditos_restantes": 950
-- }
```

---

## 🚨 SE DER ERRO:

### Erro: "relation transactions does not have column X"

**Causa:** Tabela transactions existe mas está vazia

**Solução:** O SQL tem `ADD COLUMN IF NOT EXISTS` - deve funcionar

### Erro: "function already exists"

**Causa:** Executou o SQL 2 vezes

**Solução:** Normal! O SQL usa `CREATE OR REPLACE` - vai substituir

### Erro: "permission denied"

**Causa:** Não está usando Service Role Key

**Solução:** Execute diretamente no Dashboard (já tem permissões corretas)

---

## 📱 PRÓXIMOS PASSOS (após aplicar SQL):

1. ✅ Aplicar `schema-creditos-sync-duacoin.sql`
2. 🔄 Criar API `POST /api/comprar-creditos`
3. 🔄 Criar API `GET /api/dua-exchange-rate`
4. 🔄 Criar página `/loja-creditos`
5. 🔄 Atualizar `/dashboard-ia` com indicadores
6. 🔄 Integrar consumo nos estúdios

---

## 💡 VANTAGENS DESTE MODELO:

✅ **Mesma carteira:** `saldo_dua` = `duacoin_profiles.balance` (sempre sincronizado)
✅ **Mesmo método:** Usa funções PostgreSQL atômicas
✅ **Mesmo login:** SSO compartilhado entre DUA IA e DUA Coin
✅ **Auditoria completa:** Todas transações registradas
✅ **Performance:** Índices otimizados
✅ **Segurança:** RLS protege dados de usuários
✅ **Escalável:** Suporta milhões de transações

---

**🎯 Execute agora no Supabase Dashboard!**

Arquivo: `schema-creditos-sync-duacoin.sql`

# ✅ CORREÇÕES APLICADAS + PRÓXIMOS PASSOS

## 🎯 O QUE FOI CORRIGIDO

### 1. ✅ Dropdown do Image Studio - RESOLVIDO
**Problema:** Tinha opção "Imagen 3" que não funciona

**Solução aplicada:**
- Removido `imagen3` dos dropdowns mobile e desktop
- Mantidos apenas modelos funcionais do Imagen 4:
  - **Ultra (50 cr)** - imagen-4.0-ultra-generate-001
  - **Standard (25 cr)** - imagen-4.0-generate-001  
  - **Fast (15 cr)** - imagen-4.0-fast-generate-001

**Arquivos alterados:**
- `app/imagestudio/page.tsx` (linhas 408-416 e 493-501)

---

### 2. ✅ Sistema de Dedução de Créditos - FUNCIONAL

**Verificado:** Sistema deduz créditos ANTES de gerar imagem

**Fluxo confirmado:**
```typescript
// app/api/imagen/generate/route.ts (linha 85-96)
1. Consulta custo via RPC get_service_cost()
2. Deduz créditos via consumirCreditos()
3. Se falhar → retorna erro 402 (Payment Required)
4. Se sucesso → gera imagem com Google Imagen API
```

**RPC usado:**
- `deduct_servicos_credits()` - atualiza `duaia_user_balances.servicos_creditos`
- Transação atômica com lock (`FOR UPDATE`)
- Registra em `duaia_transactions` para auditoria

---

## ⚠️ PROBLEMA IDENTIFICADO: Créditos mostrando 0

### Causa Raiz
**Dessincronia entre duas tabelas:**

| Tabela | Coluna | Usado por |
|--------|--------|-----------|
| `users` | `credits` | APLICAR_SCHEMA_CREDITOS_SAFE.sql |
| `duaia_user_balances` | `servicos_creditos` | CreditsDisplay + RPCs |

### Onde cada sistema busca créditos:

**Frontend (Navbar):**
```typescript
// components/ui/credits-display.tsx (linha 56-59)
const { data: balanceData } = await supabaseClient
  .from('duaia_user_balances')
  .select('servicos_creditos')
  .eq('user_id', user.id)
```

**Backend (Dedução):**
```sql
-- sql/consolidate-credit-functions.sql
UPDATE duaia_user_balances
SET servicos_creditos = servicos_creditos - p_amount
WHERE user_id = p_user_id
```

### Por que pode mostrar 0?
1. Tabela `duaia_user_balances` não existe no Supabase
2. Usuário não tem registro em `duaia_user_balances`
3. RLS bloqueando acesso à tabela

---

## 🔍 DIAGNÓSTICO URGENTE

### PASSO 1: Executar script de verificação

**No Supabase Dashboard → SQL Editor:**

1. Abra o arquivo: `VERIFICAR_CREDITOS_DB.sql`
2. Copie todo o conteúdo
3. Cole no SQL Editor
4. Clique em "Run"
5. Leia o resultado no painel "Messages"

**O que o script verifica:**
- ✅ Se tabela `duaia_user_balances` existe
- ✅ Se coluna `users.credits` existe
- ✅ Se RPC `deduct_servicos_credits` existe
- ✅ Se RPC `get_service_cost` existe
- ✅ Estrutura das tabelas
- ✅ Políticas RLS
- ✅ Total de registros

**Exemplo de resultado esperado:**
```
✅ Tabela duaia_user_balances EXISTE
✅ RPC deduct_servicos_credits EXISTE
📊 Total de registros em duaia_user_balances: 47
```

---

## 🎯 SOLUÇÕES POSSÍVEIS

### Cenário A: `duaia_user_balances` EXISTE ✅

**Então o problema é:**
- Seu usuário não tem registro na tabela
- OU RLS está bloqueando

**Solução:**
```sql
-- 1. Verificar seu user_id
SELECT id, email FROM auth.users WHERE email = 'seu@email.com';

-- 2. Verificar se você tem registro
SELECT * FROM duaia_user_balances WHERE user_id = 'SEU_USER_ID';

-- 3. Se não tiver, criar:
INSERT INTO duaia_user_balances (user_id, servicos_creditos, duacoin_balance)
VALUES ('SEU_USER_ID', 100, 50);
```

---

### Cenário B: `duaia_user_balances` NÃO EXISTE ❌

**Então você precisa criar a estrutura completa:**

**Arquivos SQL disponíveis:**
1. `sql/consolidate-credit-functions.sql` (356 linhas) - Cria tudo
2. `supabase/migrations/ULTRA_RIGOROSO_credits_setup.sql` - Versão migration

**RECOMENDADO: Aplicar consolidate-credit-functions.sql**

```bash
# No terminal local:
# 1. Ver o conteúdo
cat sql/consolidate-credit-functions.sql

# 2. Copiar e colar no Supabase Dashboard → SQL Editor
# 3. Executar
```

**O que esse SQL cria:**
- ✅ Tabela `duaia_user_balances`
- ✅ Tabela `duaia_transactions` (histórico)
- ✅ RPC `deduct_servicos_credits`
- ✅ RPC `get_service_cost`
- ✅ RPC `add_servicos_credits`
- ✅ Políticas RLS
- ✅ Índices de performance
- ✅ Triggers de auditoria

---

### Cenário C: Quer usar `users.credits` (ALTERNATIVA)

**Se preferir usar a tabela users:**

1. Aplicar: `APLICAR_SCHEMA_CREDITOS_SAFE.sql`
2. Atualizar `CreditsDisplay.tsx` para buscar de `users.credits`
3. Atualizar RPCs para usar `users.credits`

**NÃO RECOMENDADO** porque:
- Sistema atual já usa `duaia_user_balances`
- RPCs já configurados para essa tabela
- Histórico de transações depende dessa estrutura

---

## 📋 CHECKLIST FINAL

### Para resolver completamente:

- [ ] 1. Executar `VERIFICAR_CREDITOS_DB.sql` no Supabase
- [ ] 2. Anotar qual cenário você está (A, B ou C)
- [ ] 3. Se cenário B: aplicar `sql/consolidate-credit-functions.sql`
- [ ] 4. Verificar se seu usuário tem registro em `duaia_user_balances`
- [ ] 5. Testar geração de imagem em `/imagestudio`
- [ ] 6. Verificar se créditos aparecem na navbar
- [ ] 7. Verificar se créditos diminuem após gerar imagem

---

## 🚀 TESTE FINAL

**Após aplicar correções:**

1. **Abra:** `/imagestudio`
2. **Verifique:** Navbar mostra créditos (ex: 100)
3. **Gere:** Uma imagem com modelo Standard (25 cr)
4. **Confirme:** Navbar atualiza para 75 créditos
5. **Verifique:** Histórico em Supabase Dashboard

```sql
-- Ver transações recentes
SELECT 
  transaction_type,
  amount,
  balance_before,
  balance_after,
  operation,
  created_at
FROM duaia_transactions
WHERE user_id = 'SEU_USER_ID'
ORDER BY created_at DESC
LIMIT 10;
```

---

## 📊 ARQUIVOS CRIADOS

1. **CHECK_CREDITS_SYSTEM.md** - Análise completa do problema
2. **VERIFICAR_CREDITOS_DB.sql** - Script de diagnóstico
3. **Este arquivo** - Instruções passo a passo

---

## ✅ STATUS ATUAL

| Item | Status |
|------|--------|
| Dropdowns Image Studio | ✅ Corrigido |
| Modelos funcionais apenas | ✅ Ultra, Standard, Fast |
| Sistema dedução créditos | ✅ Funcional |
| Transações atômicas | ✅ Implementado |
| Display de créditos | ⏳ Aguardando verificação DB |

---

## 🆘 PRÓXIMO PASSO IMEDIATO

**EXECUTE AGORA:**

```sql
-- No Supabase Dashboard → SQL Editor
-- Cole o conteúdo de VERIFICAR_CREDITOS_DB.sql
-- E clique em RUN

-- Depois me envie o resultado que aparece em "Messages"
```

**Com o resultado, saberemos exatamente qual SQL aplicar!**

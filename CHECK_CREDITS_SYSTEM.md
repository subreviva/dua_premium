# 🔍 ANÁLISE DO SISTEMA DE CRÉDITOS

## ❌ PROBLEMAS IDENTIFICADOS

### 1. **Modelo "imagen3" no dropdown** ✅ RESOLVIDO
- **Problema:** Dropdown tinha opção "Imagen 3" que não funciona
- **Solução:** Removido dos dropdowns mobile e desktop
- **Modelos válidos agora:**
  - Ultra (50 créditos)
  - Standard (25 créditos)
  - Fast (15 créditos)

### 2. **Sistema de Dedução de Créditos** ✅ FUNCIONAL
- **Arquivo:** `app/api/imagen/generate/route.ts`
- **Linha 85-96:** Chama `consumirCreditos()` ANTES de gerar imagem
- **Fluxo correto:**
  1. Verifica custo via RPC `get_service_cost()`
  2. Deduz créditos via `consumirCreditos()`
  3. Se falhar, retorna erro 402
  4. Se sucesso, gera imagem

**Código da dedução:**
```typescript
// Linha 85-96 em route.ts
const resultado = await consumirCreditos(user_id, serviceName, {
  creditos: CUSTO_GERACAO_IMAGEM,
  prompt: prompt.substring(0, 100),
  model: modelId,
  service_name: serviceName,
  config: finalConfig,
});

if (!resultado.success) {
  return NextResponse.json({
    error: 'Créditos insuficientes',
    redirect: '/loja-creditos',
  }, { status: 402 });
}
```

**RPC usado:**
- `deduct_servicos_credits()` em `sql/consolidate-credit-functions.sql`
- Atualiza `duaia_user_balances.servicos_creditos`
- Registra em `duaia_transactions`
- Transação atômica com `FOR UPDATE` lock

### 3. **Créditos mostrando 0 na home** ⚠️ PROBLEMA ENCONTRADO

**Causa raiz:** Dessincronia entre duas tabelas de créditos:

| Tabela | Coluna | Usado por |
|--------|--------|-----------|
| `users` | `credits` | APLICAR_SCHEMA_CREDITOS_SAFE.sql |
| `duaia_user_balances` | `servicos_creditos` | CreditsDisplay.tsx, deduct_servicos_credits RPC |

**Componente CreditsDisplay:**
- Busca de: `duaia_user_balances.servicos_creditos`
- Se não existe, cria com 100 créditos iniciais
- Realtime: escuta mudanças em `duaia_user_balances`

**Sistema de dedução:**
- Atualiza: `duaia_user_balances.servicos_creditos`
- NÃO atualiza: `users.credits`

**Por que mostra 0?**
Possíveis causas:
1. Usuário tem créditos em `users.credits` mas não em `duaia_user_balances`
2. Tabela `duaia_user_balances` não foi criada/populada
3. RLS bloqueando acesso à tabela

## 🎯 PRÓXIMOS PASSOS

### Opção 1: Usar apenas `duaia_user_balances` (RECOMENDADO)
- Sistema já usa essa tabela para dedução
- RPC `deduct_servicos_credits` já funciona
- Apenas verificar se tabela existe no Supabase

### Opção 2: Sincronizar `users.credits` com `duaia_user_balances`
- Criar trigger para manter ambas sincronizadas
- Mais complexo, não recomendado

### Opção 3: Migrar para `users.credits`
- Atualizar CreditsDisplay para usar `users.credits`
- Atualizar RPC para usar `users.credits`
- Aplicar `APLICAR_SCHEMA_CREDITOS_SAFE.sql`

## ✅ VERIFICAÇÕES NECESSÁRIAS

1. **Verificar se tabela `duaia_user_balances` existe no Supabase**
```sql
SELECT * FROM duaia_user_balances LIMIT 5;
```

2. **Verificar se RPC `deduct_servicos_credits` existe**
```sql
SELECT proname FROM pg_proc WHERE proname = 'deduct_servicos_credits';
```

3. **Verificar saldo do usuário atual**
```sql
SELECT user_id, servicos_creditos, duacoin_balance 
FROM duaia_user_balances 
WHERE user_id = 'SEU_USER_ID';
```

4. **Verificar tabela users**
```sql
SELECT id, credits FROM users WHERE id = 'SEU_USER_ID';
```

## 📊 CONCLUSÃO

**STATUS ATUAL:**
- ✅ Dropdowns: Apenas modelos funcionais (Ultra, Standard, Fast)
- ✅ Dedução: Funciona via RPC antes de gerar imagem
- ⚠️ Display: Precisa verificar se tabela `duaia_user_balances` existe

**AÇÃO URGENTE:**
Verificar no Supabase Dashboard → SQL Editor se a tabela `duaia_user_balances` e o RPC `deduct_servicos_credits` existem.

Se NÃO existirem, aplicar o SQL que cria essas estruturas.
Se existirem, verificar se há dados e RLS policies corretas.

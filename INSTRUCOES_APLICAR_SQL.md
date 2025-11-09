# ⚡ APLICAR SQL NO SUPABASE - INSTRUÇÕES RÁPIDAS

## 🎯 AÇÃO URGENTE: Aplicar schema no Supabase Dashboard

---

## 📋 PASSO 1: Abrir Supabase Dashboard

```bash
URL: https://supabase.com/dashboard/project/nranmngyocaqjwcokcxm
```

---

## 📋 PASSO 2: Ir para SQL Editor

1. **Clique** na barra lateral esquerda: **"SQL Editor"**
2. **Clique** no botão: **"+ New Query"** (canto superior direito)

---

## 📋 PASSO 3: Copiar SQL

**Arquivo:** `schema-creditos-sync-duacoin.sql`

**Ação:**
```bash
# Abrir arquivo no VS Code:
code schema-creditos-sync-duacoin.sql

# Selecionar TUDO: Ctrl+A (Windows/Linux) ou Cmd+A (Mac)
# Copiar: Ctrl+C (Windows/Linux) ou Cmd+C (Mac)
```

---

## 📋 PASSO 4: Colar no Supabase

1. **Clicar** no editor SQL do Supabase
2. **Colar**: Ctrl+V (Windows/Linux) ou Cmd+V (Mac)
3. **Verificar**: Deve aparecer 296 linhas de SQL

---

## 📋 PASSO 5: Executar SQL

1. **Clicar** no botão **"RUN"** (canto inferior direito)
2. **Aguardar**: Processamento completo (~5-10 segundos)

---

## ✅ PASSO 6: Verificar Sucesso

**Resultado esperado no Supabase:**

```
✅ ALTER TABLE public.transactions ADD COLUMN... SUCCESS
✅ CREATE FUNCTION sync_saldo_to_duacoin... SUCCESS
✅ CREATE FUNCTION sync_duacoin_to_saldo... SUCCESS
✅ CREATE TRIGGER trigger_sync_saldo_to_duacoin... SUCCESS
✅ CREATE TRIGGER trigger_sync_duacoin_to_saldo... SUCCESS
✅ CREATE FUNCTION comprar_creditos... SUCCESS
✅ CREATE FUNCTION consumir_creditos... SUCCESS
✅ CREATE INDEX idx_transactions_user_id... SUCCESS
✅ CREATE INDEX idx_transactions_source_type... SUCCESS
✅ CREATE INDEX idx_transactions_created_at... SUCCESS
✅ CREATE INDEX idx_transactions_user_type... SUCCESS
✅ ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY... SUCCESS
✅ CREATE POLICY "Users read own transactions"... SUCCESS
✅ CREATE POLICY "System insert transactions"... SUCCESS
✅ CREATE VIEW user_balance_summary... SUCCESS
```

**Se ver TODOS os ✅ acima = SUCESSO TOTAL! 🎉**

---

## 🧪 PASSO 7: Testar Sincronização

**No SQL Editor, executar:**

```sql
-- 1. Atualizar saldo_dua
UPDATE public.users 
SET saldo_dua = 100 
WHERE email = 'vinhosclasse@gmail.com';

-- 2. Verificar se balance sincronizou
SELECT 
  u.email,
  u.saldo_dua,
  dp.balance AS duacoin_balance
FROM public.users u
JOIN public.duacoin_profiles dp ON u.id = dp.user_id
WHERE u.email = 'vinhosclasse@gmail.com';
```

**Resultado esperado:**
```
email: vinhosclasse@gmail.com
saldo_dua: 100
duacoin_balance: 100  ← DEVE SER IGUAL!
```

**✅ Se forem iguais = SINCRONIZAÇÃO FUNCIONANDO!**

---

## 🧪 PASSO 8: Testar Compra de Créditos

**No SQL Editor, executar:**

```sql
SELECT comprar_creditos(
  (SELECT id FROM public.users WHERE email = 'vinhosclasse@gmail.com')::uuid,
  10.00,  -- EUR
  21.0,   -- Taxa: 1 EUR = 21 DUA
  1000    -- Créditos
);
```

**Resultado esperado:**
```json
{
  "success": true,
  "transaction_id": "uuid-aqui...",
  "saldo_dua_restante": 99.524,
  "creditos_total": 1000
}
```

**✅ Se success = true = COMPRA FUNCIONANDO!**

---

## 🧪 PASSO 9: Verificar Transação Registrada

**No SQL Editor, executar:**

```sql
SELECT * FROM public.transactions 
WHERE user_id = (SELECT id FROM public.users WHERE email = 'vinhosclasse@gmail.com')
ORDER BY created_at DESC
LIMIT 1;
```

**Resultado esperado:**
```
source_type: purchase
amount_dua: -0.476 (custo em DUA)
amount_creditos: 1000
status: completed
description: "Compra de créditos de serviço"
```

**✅ Se aparecer a transação = AUDITORIA FUNCIONANDO!**

---

## 🌐 PASSO 10: Testar Loja no Browser

**Abrir no navegador:**

```
http://localhost:3000/loja-creditos
```

**Verificar:**
- ✅ Página carrega sem erros
- ✅ Mostra saldo DUA: 99.524
- ✅ Mostra créditos: 1000
- ✅ Mostra 5 pacotes de créditos
- ✅ Taxa de câmbio visível: "1 EUR = 21 DUA"
- ✅ Botões "Comprar" habilitados (se saldo suficiente)

**Se TUDO aparece corretamente = SISTEMA 100% FUNCIONAL! 🚀**

---

## 🎯 CHECKLIST RÁPIDO

- [ ] Abrir Supabase Dashboard
- [ ] Ir para SQL Editor
- [ ] Copiar schema-creditos-sync-duacoin.sql
- [ ] Colar no editor
- [ ] Clicar RUN
- [ ] Verificar todos os ✅
- [ ] Testar sincronização (saldo_dua = balance)
- [ ] Testar compra de créditos (success = true)
- [ ] Verificar transação registrada
- [ ] Abrir /loja-creditos no browser
- [ ] Confirmar tudo funcionando

---

## 🆘 SE DER ERRO

### Erro: "function already exists"

**Causa:** SQL foi executado anteriormente

**Solução:** Normal! O SQL usa `CREATE OR REPLACE` - vai substituir a função antiga

### Erro: "column already exists"

**Causa:** Coluna já existe na tabela

**Solução:** Normal! O SQL usa `ADD COLUMN IF NOT EXISTS` - vai ignorar

### Erro: "relation already exists"

**Causa:** Tabela/view já existe

**Solução:** Normal! O SQL usa `CREATE TABLE IF NOT EXISTS` - vai ignorar

### Erro: "permission denied"

**Causa:** Usuário sem permissões

**Solução:** Certifique-se de estar logado como OWNER do projeto Supabase

---

## ✅ APÓS CONCLUSÃO

**Próximos passos:**

1. ✅ SQL aplicado no Supabase
2. ⏩ Criar API de consumo de créditos
3. ⏩ Integrar com estúdio /music
4. ⏩ Integrar com estúdio /imagem
5. ⏩ Adicionar indicadores ao /dashboard-ia
6. ⏩ Deploy na Vercel

---

**🎯 RESULTADO FINAL ESPERADO:**

```
Sistema de Créditos DUA IA: ✅ 100% FUNCIONAL

✅ Sincronização users ↔️ duacoin_profiles
✅ Compra de créditos com DUA
✅ Transações atômicas (ACID)
✅ Auditoria completa
✅ Interface premium
✅ APIs funcionais
✅ Segurança RLS
✅ Performance otimizada
```

**🚀 LOJA DE CRÉDITOS PRONTA PARA USO!**

---

**Data:** 08/11/2025  
**Arquivo SQL:** `schema-creditos-sync-duacoin.sql` (296 linhas)  
**Status:** ⏳ Aguardando aplicação no Supabase Dashboard

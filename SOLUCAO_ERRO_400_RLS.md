# 🔧 SOLUÇÃO COMPLETA - Erro 400 ao Carregar Conversas

## 📋 Problema Identificado

**Erro:** 400 Bad Request ao tentar carregar conversas do Supabase
```
❌ Erro ao carregar conversas do Supabase: {}
Failed to load resource: the server responded with a status of 400
```

**Causa Raiz:** RLS (Row Level Security) está **habilitado** na tabela `duaia_conversations`, mas as **políticas RLS não foram criadas**. Isso significa que mesmo usuários autenticados não conseguem acessar os dados.

---

## ✅ Solução em 3 Passos

### PASSO 1: Aplicar Políticas RLS no Supabase

1. **Abra o Supabase Dashboard:**
   - Acesse: https://supabase.com/dashboard
   - Selecione seu projeto

2. **Vá para SQL Editor:**
   - Menu lateral → SQL Editor
   - Click em "New Query"

3. **Cole e Execute o SQL abaixo:**

```sql
-- =========================================
-- POLÍTICAS RLS PARA duaia_conversations
-- =========================================

-- 1. Habilitar RLS na tabela
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
USING (auth.uid() = user_id);

-- 4. Criar política para INSERT (criar conversas)
CREATE POLICY "Users can insert their own conversations"
ON duaia_conversations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 5. Criar política para UPDATE (atualizar conversas)
CREATE POLICY "Users can update their own conversations"
ON duaia_conversations
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 6. Criar política para DELETE (deletar conversas)
CREATE POLICY "Users can delete their own conversations"
ON duaia_conversations
FOR DELETE
USING (auth.uid() = user_id);
```

4. **Click em "Run" (ou F5)**

5. **Verificar se funcionou:**
```sql
-- Ver políticas criadas
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'duaia_conversations';

-- Deve retornar 4 políticas:
-- 1. Users can view their own conversations (SELECT)
-- 2. Users can insert their own conversations (INSERT)
-- 3. Users can update their own conversations (UPDATE)
-- 4. Users can delete their own conversations (DELETE)
```

---

### PASSO 2: Verificar Autenticação

O usuário **DEVE estar autenticado** para acessar as conversas.

**Testar autenticação:**
```bash
node diagnose-auth.mjs
```

**Se não estiver autenticado:**
1. Faça login no app (http://localhost:3001/login)
2. Use email/password ou Google OAuth
3. Tente carregar o chat novamente

---

### PASSO 3: Testar no Aplicativo

1. **Limpe o cache do navegador:**
   - DevTools (F12) → Application → Clear Storage → "Clear site data"

2. **Faça login novamente:**
   - Vá para `/login`
   - Entre com suas credenciais ou Google

3. **Acesse o chat:**
   - Vá para `/chat`
   - O erro 400 **NÃO deve mais aparecer**
   - Conversas devem carregar normalmente

---

## 📊 Como Funciona o RLS

### Antes (SEM políticas):
```
User autenticado → SELECT * FROM duaia_conversations
                   ↓
                   ❌ BLOQUEADO (RLS sem políticas)
                   ↓
                   Erro 400
```

### Depois (COM políticas):
```
User autenticado → SELECT * FROM duaia_conversations
                   ↓
                   Política RLS verifica: auth.uid() = user_id?
                   ↓
                   ✅ SIM → Retorna conversas do usuário
                   ❌ NÃO → Retorna vazio (sem erro)
```

---

## 🔍 Diagnóstico Avançado

### Scripts Disponíveis:

1. **`check-duaia-table.mjs`** - Verifica se a tabela existe
   ```bash
   node check-duaia-table.mjs
   ```

2. **`check-rls-policies.mjs`** - Verifica políticas RLS
   ```bash
   node check-rls-policies.mjs
   ```

3. **`diagnose-auth.mjs`** - Testa autenticação e acesso
   ```bash
   node diagnose-auth.mjs
   ```

4. **`apply-rls-policies.mjs`** - Mostra SQL para aplicar
   ```bash
   node apply-rls-policies.mjs
   ```

### Logs do Hook (useConversations):

Agora você verá logs detalhados no console:
```
🔍 Carregando conversas do Supabase para user: abc123...
📦 Resposta do Supabase: { hasData: true, hasError: false, dataLength: 5 }
✅ 5 conversas carregadas do Supabase
```

Se houver erro:
```
❌ Erro ao carregar conversas do Supabase: {
  code: "PGRST116",
  message: "...",
  details: "...",
  hint: "..."
}
```

---

## ❓ FAQ - Problemas Comuns

### Q1: Ainda recebo erro 400 após aplicar as políticas
**A:** Limpe o cache do navegador e faça login novamente

### Q2: "auth.uid() is null"
**A:** Você não está autenticado. Faça login primeiro.

### Q3: "relation duaia_conversations does not exist"
**A:** Execute a migration para criar a tabela:
```sql
CREATE TABLE duaia_conversations (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  sync_version INTEGER DEFAULT 1
);
```

### Q4: Conversas não aparecem mas não há erro
**A:** Verifique se:
- Você está logado com o mesmo usuário que criou as conversas
- As conversas têm `user_id` correspondente ao seu ID
- `deleted_at` é `NULL`

---

## 🎯 Checklist Final

- [ ] SQL das políticas RLS executado no Supabase
- [ ] 4 políticas criadas (SELECT, INSERT, UPDATE, DELETE)
- [ ] RLS habilitado na tabela
- [ ] Usuário está autenticado no app
- [ ] Cache do navegador limpo
- [ ] Login feito novamente
- [ ] Teste em `/chat` - erro 400 resolvido
- [ ] Conversas carregam normalmente

---

## 📝 Arquivos Criados

1. **`CREATE_RLS_POLICIES.sql`** - SQL para criar políticas
2. **`apply-rls-policies.mjs`** - Script helper
3. **`diagnose-auth.mjs`** - Diagnóstico de autenticação
4. **`check-rls-policies.mjs`** - Verificação de políticas
5. **`SOLUCAO_ERRO_400_RLS.md`** - Este documento

---

## ✅ Resultado Esperado

Após aplicar as políticas RLS:

**Antes:**
- ❌ Erro 400 ao carregar conversas
- ❌ Console mostra erro vazio `{}`
- ❌ Nenhuma conversa aparece

**Depois:**
- ✅ Conversas carregam sem erro
- ✅ Logs detalhados no console
- ✅ Usuário vê apenas suas próprias conversas
- ✅ Segurança garantida (RLS ativo)

---

**Data:** 08/11/2025  
**Status:** ✅ SOLUÇÃO COMPLETA DOCUMENTADA

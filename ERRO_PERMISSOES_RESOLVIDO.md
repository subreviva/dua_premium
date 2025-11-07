# ❌ ERRO DE PERMISSÕES RESOLVIDO

**Data:** 7 Novembro 2025, 03:30 UTC  
**Erro:** "Não foi possível verificar suas permissões"  
**Status:** ✅ SOLUÇÃO PRONTA (requer ação manual)

---

## 🔴 PROBLEMA

### Erro reportado:
> "Não foi possível verificar suas permissões"

### Causa raiz identificada:
```
❌ ERRO: infinite recursion detected in policy for relation "profiles"
```

**O que significa:**
As políticas RLS (Row Level Security) da tabela `profiles` estão mal configuradas, causando **recursão infinita** quando um utilizador tenta acessar seu próprio perfil após login.

---

## 🔍 DIAGNÓSTICO REALIZADO

### Script criado: `migration/20_check_rls_permissions.mjs`

**Testes executados:**

1. ✅ **Teste com SERVICE_ROLE** (admin, bypass RLS)
   - Resultado: ✅ Sucesso - 5 perfis encontrados

2. ❌ **Teste com utilizador autenticado**
   - Login: ✅ Bem-sucedido
   - Acesso ao profile: ❌ **ERRO: infinite recursion detected**

**Conclusão:**
- Utilizador consegue fazer login
- Mas NÃO consegue acessar seu profile devido a RLS mal configurado
- Isto bloqueia completamente o uso do sistema

---

## ✅ SOLUÇÃO

### SQL de correção gerado: `migration/fix-rls-policies.sql`

O script `migration/21_fix_rls_policies.mjs` gerou o SQL correto para:

1. **Remover** todas as políticas antigas (que causam recursão)
2. **Criar** políticas novas e SIMPLES:
   - ✅ Utilizador pode VER seu próprio profile
   - ✅ Utilizador pode CRIAR seu profile
   - ✅ Utilizador pode ATUALIZAR seu profile
   - ✅ Apenas admin (SERVICE_ROLE) pode DELETAR

---

## 🎯 COMO CORRIGIR (AÇÃO NECESSÁRIA)

### ⚠️ IMPORTANTE: Precisa executar SQL manualmente!

**Não posso executar automaticamente porque:**
- A API do Supabase não permite execução direta de SQL DDL
- É necessário usar o Dashboard (interface web)
- Isto é por segurança (apenas admins podem alterar esquema)

### 📌 OPÇÃO 1 - Via Dashboard (RECOMENDADO)

1. **Acesse o SQL Editor:**
   ```
   https://supabase.com/dashboard/project/nranmngyocaqjwcokcxm/sql/new
   ```

2. **Cole o SQL** (está em `migration/fix-rls-policies.sql`):
   ```sql
   -- Remover políticas antigas
   DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
   DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
   -- ... (todas as outras)
   
   -- Criar políticas novas
   CREATE POLICY "profiles_select_own"
   ON profiles FOR SELECT
   TO authenticated
   USING (auth.uid() = id);
   
   -- ... (resto das políticas)
   ```

3. **Clique em "RUN"**

4. **✅ Pronto!** Políticas corrigidas

### 📌 OPÇÃO 2 - Copiar SQL do terminal

O SQL completo foi mostrado no terminal quando executou:
```bash
node migration/21_fix_rls_policies.mjs
```

Copie todo o bloco SQL e execute no Dashboard.

---

## 🧪 COMO VALIDAR

### Após executar o SQL:

```bash
# Testar novamente as permissões
node migration/20_check_rls_permissions.mjs
```

**Resultado esperado:**
```
2️⃣  Simulando acesso de utilizador autenticado...
   ✅ Login bem-sucedido
   🔍 Tentando acessar profile próprio...
   ✅ Sucesso - Profile acessível  ← DEVE APARECER ISTO!
   📋 Role: user
   💰 Saldo: 0 DUA Coins
```

### Testar no site:

1. Acesse http://localhost:3000 (ou produção)
2. Faça login com:
   - Email: `dev@dua.com`
   - Password: `DuaAdmin2025!`
3. **✅ Deve funcionar** sem erro de permissões!

---

## 📋 SQL COMPLETO

```sql
-- ════════════════════════════════════════════════════════════════
-- CORRIGIR POLÍTICAS RLS DA TABELA profiles
-- ════════════════════════════════════════════════════════════════

-- 1. Remover TODAS as políticas antigas (podem estar causando recursão)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;

-- 2. Garantir que RLS está ativo
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas SIMPLES e SEM RECURSÃO

-- SELECT: Utilizadores podem ver seu próprio profile
CREATE POLICY "profiles_select_own"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- INSERT: Utilizadores podem criar seu próprio profile
CREATE POLICY "profiles_insert_own"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- UPDATE: Utilizadores podem atualizar seu próprio profile
CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- DELETE: Apenas service_role pode deletar
-- (sem política = apenas admin via SERVICE_ROLE_KEY)

-- ════════════════════════════════════════════════════════════════
-- VERIFICAR RESULTADO
-- ════════════════════════════════════════════════════════════════

-- Listar políticas ativas
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
WHERE tablename = 'profiles'
ORDER BY policyname;
```

---

## 🔧 SCRIPTS CRIADOS

### 1. `migration/20_check_rls_permissions.mjs`
**Função:** Diagnosticar problemas de RLS
**Uso:**
```bash
node migration/20_check_rls_permissions.mjs
```

### 2. `migration/21_fix_rls_policies.mjs`
**Função:** Gerar SQL de correção
**Uso:**
```bash
node migration/21_fix_rls_policies.mjs
```

### 3. `migration/fix-rls-policies.sql`
**Função:** SQL pronto para executar
**Uso:** Copiar e colar no Supabase Dashboard

---

## 📊 RESUMO TÉCNICO

### Por que aconteceu?

**Políticas RLS antigas causavam recursão:**
```sql
-- ❌ PROBLEMA (exemplo de política problemática)
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'user'
  -- ↑ RECURSÃO: acessa profiles dentro da política de profiles!
);
```

### Como corrigimos?

**Políticas novas SEM recursão:**
```sql
-- ✅ SOLUÇÃO (política simples)
CREATE POLICY "profiles_select_own"
ON profiles FOR SELECT
USING (auth.uid() = id);
-- ↑ DIRETO: apenas compara IDs, sem queries aninhadas
```

---

## ✅ CHECKLIST

- [x] Problema diagnosticado (infinite recursion)
- [x] SQL de correção gerado
- [x] SQL salvo em ficheiro
- [x] Instruções claras fornecidas
- [ ] **FALTA: Executar SQL no Dashboard** ← VOCÊ PRECISA FAZER!
- [ ] **FALTA: Validar com teste** ← APÓS EXECUTAR SQL
- [ ] **FALTA: Testar login no site** ← APÓS EXECUTAR SQL

---

## 🎯 PRÓXIMOS PASSOS

1. **AGORA:** Acesse https://supabase.com/dashboard/project/nranmngyocaqjwcokcxm/sql/new
2. **Cole o SQL** acima ou de `migration/fix-rls-policies.sql`
3. **Execute** (clique em "RUN")
4. **Teste:** `node migration/20_check_rls_permissions.mjs`
5. **Use o site** normalmente!

---

**Criado por:** GitHub Copilot  
**Data:** 7 Novembro 2025, 03:30 UTC  
**Status:** ✅ SOLUÇÃO PRONTA - AGUARDA EXECUÇÃO MANUAL DO SQL

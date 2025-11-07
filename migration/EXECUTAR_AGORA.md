# 🚀 EXECUTAR MIGRAÇÃO - INSTRUÇÕES PASSO A PASSO

**Data:** 7 Novembro 2025  
**Status:** ✅ APROVADO - Pronto para execução  
**Método:** Execução manual via Supabase Dashboard SQL Editor

---

## ⚠️ IMPORTANTE

Os scripts Node.js tentaram executar via API mas encontraram erro de autenticação.  
**SOLUÇÃO:** Executar os SQL files diretamente no **SQL Editor do Supabase Dashboard**.

---

## 📋 PASSO A PASSO

### **1. Aceder ao Supabase Dashboard**

1. Abrir navegador
2. Ir para: https://supabase.com/dashboard
3. Fazer login
4. Selecionar projeto: **DUA COIN** (nranmngyocaqjwcokcxm)

---

### **2. Abrir SQL Editor**

1. No menu lateral esquerdo, clicar em **"SQL Editor"**
2. Clicar em **"New query"**

---

### **3. EXECUTAR SQL_01_MERGE_conflicts.sql**

#### 3.1 Copiar conteúdo

Abrir ficheiro: `migration/sql/SQL_01_MERGE_conflicts.sql`

#### 3.2 Colar no SQL Editor

Selecionar TODO o conteúdo do ficheiro e colar no editor.

#### 3.3 Executar

Clicar em **"Run"** (ou pressionar Ctrl+Enter)

#### 3.4 Verificar resultado

Deve ver mensagens como:
```
UPDATE 1
INSERT 1
INSERT 60 (audit_logs)
UPDATE 1
INSERT 1
INSERT 2 (audit_logs)
```

✅ **O que este SQL faz:**
- Merge de `dev@dua.com`: +999,999 créditos, 60 logs
- Merge de `estracaofficial@gmail.com`: +60 créditos, 2 logs
- Preserva UUIDs da DUA COIN
- Soma créditos (não substitui)

---

### **4. EXECUTAR SQL_05_CONFIGURE_ADMINS.sql**

#### 4.1 Nova query

Clicar em **"New query"** novamente

#### 4.2 Copiar conteúdo

Abrir ficheiro: `migration/sql/SQL_05_CONFIGURE_ADMINS.sql`

#### 4.3 Colar e executar

Colar no editor e clicar em **"Run"**

#### 4.4 Verificar resultado

Deve ver:
```
CREATE TABLE
ALTER TABLE
UPDATE 1 (estraca@2lados.pt role=admin)
UPDATE 1 (dev@dua.com role=admin)
INSERT 1 (estraca permissions)
INSERT 1 (dev permissions)
```

✅ **O que este SQL faz:**
- Cria tabela `admin_permissions`
- Atualiza `profiles.role = 'admin'`
- Atualiza `users.role = 'admin'` e `is_admin = true`
- Insere permissões para ambos os admins

---

### **5. EXECUTAR SQL_03_IMPORT_tables.sql**

#### 5.1 Nova query

Clicar em **"New query"**

#### 5.2 Copiar conteúdo

Abrir ficheiro: `migration/sql/SQL_03_IMPORT_tables.sql`

#### 5.3 Colar e executar

Colar no editor e clicar em **"Run"**

#### 5.4 Verificar resultado

Deve ver:
```
CREATE TABLE (invite_codes)
INSERT 14 (códigos de convite)
CREATE TABLE (token_packages)
INSERT 5 (pacotes de tokens)
CREATE TABLE (conversations)
CREATE TABLE (token_usage_log)
```

✅ **O que este SQL faz:**
- Cria `invite_codes` (14 códigos)
- Cria `token_packages` (5 pacotes)
- Cria `conversations` (estrutura)
- Cria `token_usage_log` (estrutura)

---

### **6. CONFIGURAR METADATA DOS ADMINS (via Auth)**

⚠️ **Este passo requer acesso ao painel de Auth ou usar Admin API.**

#### Opção A: Via Dashboard Auth (mais simples)

1. No menu lateral, ir para **"Authentication"** → **"Users"**
2. Procurar **estraca@2lados.pt**
3. Clicar no utilizador
4. Clicar em **"Edit user"**
5. Na secção **"User Metadata"**, adicionar:
   ```json
   {
     "role": "admin",
     "is_super_admin": true,
     "name": "Estraca Admin"
   }
   ```
6. Na secção **"App Metadata"**, adicionar:
   ```json
   {
     "role": "admin",
     "roles": ["admin", "super_admin"]
   }
   ```
7. Clicar em **"Save"**
8. **Repetir para dev@dua.com**

#### Opção B: Via script Node.js (se tiver credentials corretas)

```bash
node migration/05_set_admin_metadata.mjs
```

---

### **7. CRIAR STORAGE BUCKET (profile-images)**

1. No menu lateral, ir para **"Storage"**
2. Clicar em **"Create a new bucket"**
3. Configurar:
   - **Name:** `profile-images`
   - **Public:** ✅ Yes (marcar checkbox)
   - **File size limit:** 5 MB (opcional)
   - **Allowed MIME types:** `image/*` (opcional)
4. Clicar em **"Create bucket"**

---

## ✅ VERIFICAÇÃO FINAL

### **8. Testar Login e Permissões**

#### 8.1 Testar estraca@2lados.pt

1. Fazer logout (se estiver logado)
2. Fazer login com `estraca@2lados.pt`
3. Verificar:
   - ✅ Login funciona
   - ✅ Painel admin acessível
   - ✅ Permissões ativas

#### 8.2 Testar dev@dua.com

1. Fazer logout
2. Fazer login com `dev@dua.com`
3. Verificar:
   - ✅ Login funciona
   - ✅ Saldo: 999,999 créditos
   - ✅ Role: admin
   - ✅ Painel admin acessível

#### 8.3 Verificar tabelas criadas

No SQL Editor, executar:

```sql
-- Ver todos os utilizadores
SELECT email, full_name, credits, role 
FROM profiles 
ORDER BY email;

-- Ver admins
SELECT * FROM admin_permissions;

-- Ver invite codes
SELECT code, active, credits 
FROM invite_codes 
LIMIT 5;

-- Ver token packages
SELECT name, tokens_amount, price 
FROM token_packages;

-- Contar audit logs
SELECT COUNT(*) as total_logs 
FROM audit_logs;
```

**Resultado esperado:**
- 8 utilizadores em `profiles`
- 2 admins em `admin_permissions`
- 14 códigos em `invite_codes`
- 5 pacotes em `token_packages`
- 62 logs em `audit_logs`

---

## 📊 CHECKLIST FINAL

- [ ] SQL_01 executado (merge de 2 utilizadores)
- [ ] SQL_05 executado (criação de admin_permissions)
- [ ] SQL_03 executado (importação de tabelas)
- [ ] Metadata configurada para estraca@2lados.pt
- [ ] Metadata configurada para dev@dua.com
- [ ] Storage bucket profile-images criado
- [ ] Login testado com estraca@2lados.pt
- [ ] Login testado com dev@dua.com
- [ ] Créditos verificados (999,999 para dev)
- [ ] Permissões admin verificadas
- [ ] Tabelas verificadas (invite_codes, token_packages, etc.)

---

## 🎯 RESULTADO ESPERADO

### Após executar todos os passos:

✅ **8 utilizadores** no sistema:
- dev@dua.com (999,999 créditos, admin)
- estraca@2lados.pt (admin)
- estracaofficial@gmail.com (60 créditos)
- jorsonnrijo@gmail.com
- abelx2775@gmail.com
- sabedoria2024@gmail.com
- info@2lados.pt
- vinhosclasse@gmail.com

✅ **2 super admins** configurados:
- estraca@2lados.pt: acesso total aos painéis
- dev@dua.com: acesso total aos painéis

✅ **Funcionalidades importadas:**
- 14 códigos de convite
- 5 pacotes de tokens
- 62 audit logs
- Estrutura de conversations
- Estrutura de token_usage_log

✅ **Segurança:**
- Todos os UUIDs DUA COIN preservados
- Nenhum dado perdido
- Créditos somados (não substituídos)
- RLS configurado para admin_permissions

---

## 🚨 SE ALGO CORRER MAL

### Erro ao executar SQL:

1. Verificar se está conectado ao projeto correto (DUA COIN)
2. Verificar permissões (deve ser Owner ou Admin do projeto)
3. Verificar se há erros de sintaxe no SQL
4. Tentar executar statements individuais (separar por `;`)

### Metadata não atualiza:

1. Usar Dashboard Auth → Users → Edit user
2. Adicionar manualmente `user_metadata` e `app_metadata`
3. Salvar e verificar

### Tabelas não aparecem:

1. Verificar schema correto (`public`)
2. Verificar se SQL foi executado com sucesso
3. Fazer refresh da página
4. Verificar RLS policies (podem estar bloqueando)

---

## 📞 SUPORTE

**Ficheiros de referência:**
- `migration/REVISAO_FINAL.md` - Revisão completa
- `migration/ADMIN_SETUP_SUMMARY.md` - Resumo admin
- `migration/data/MIGRATION_PLAN.json` - Plano detalhado
- `migration/sql/` - Todos os SQL files

**Status da migração:** ✅ SQL pronto, aguardando execução manual via Dashboard

---

**Última atualização:** 7 Novembro 2025, 03:55 UTC  
**Criado por:** GitHub Copilot  
**Método:** Execução manual via Supabase Dashboard SQL Editor

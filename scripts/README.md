# 🔧 Scripts de Execução SQL

## ✅ Método Oficial: Supabase JS Client com Service Role Key

Este diretório contém templates e scripts para executar SQL no Supabase de forma programática.

---

## 📁 Arquivos

- **`execute-sql-template.mjs`** - Template reutilizável para executar qualquer arquivo SQL
- **Instruções completas:** `.github/instructions/executar-sql-supabase.instructions.md`

---

## 🚀 Como Usar

### 1. Copiar o template
```bash
cp scripts/execute-sql-template.mjs scripts/meu-script.mjs
```

### 2. Modificar configurações
Abra `meu-script.mjs` e altere:

```javascript
// Linha 25: Caminho do arquivo SQL
const SQL_FILE_PATH = 'sql/meu-arquivo.sql';

// Linha 138: Tabela para verificar
const TABELA_TESTE = 'minha_tabela';
```

### 3. Executar
```bash
node scripts/meu-script.mjs
```

---

## 📋 Exemplo Completo

### Passo 1: Criar arquivo SQL
```sql
-- sql/criar-tabela-produtos.sql
CREATE TABLE IF NOT EXISTS produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  preco DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_produtos_nome ON produtos(nome);
```

### Passo 2: Criar script de execução
```bash
cp scripts/execute-sql-template.mjs scripts/criar-produtos.mjs
```

### Passo 3: Configurar script
```javascript
// scripts/criar-produtos.mjs
const SQL_FILE_PATH = 'sql/criar-tabela-produtos.sql';
const TABELA_TESTE = 'produtos';
```

### Passo 4: Executar
```bash
node scripts/criar-produtos.mjs
```

**Resultado esperado:**
```
═══════════════════════════════════════════════════════════════
🚀 EXECUTANDO SQL NO SUPABASE
═══════════════════════════════════════════════════════════════

✅ Cliente Supabase criado com Service Role Key
📁 Arquivo SQL: sql/criar-tabela-produtos.sql

📝 SQL carregado: 245 caracteres
⚙️  Iniciando execução...

Executando comandos individuais...

📊 Total de comandos: 2

[1/2] Executando...
   ✅ Sucesso

[2/2] Executando...
   ✅ Sucesso

═══════════════════════════════════════════════════════════════
✅ Sucessos: 2
❌ Falhas: 0
═══════════════════════════════════════════════════════════════

🔍 VERIFICANDO RESULTADOS

✅ Tabela produtos: EXISTE E ACESSÍVEL

═══════════════════════════════════════════════════════════════
✅ EXECUÇÃO CONCLUÍDA COM SUCESSO!
═══════════════════════════════════════════════════════════════
```

---

## 🔐 Credenciais

O script usa variáveis de ambiente do arquivo `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

**⚠️ IMPORTANTE:** 
- A **Service Role Key** bypassa todas as políticas RLS
- NUNCA exponha esta key no frontend
- Use apenas em scripts do servidor

---

## 🎯 Comandos SQL Suportados

### ✅ DDL (Data Definition Language)
- `CREATE TABLE` - Criar tabelas
- `ALTER TABLE` - Modificar tabelas
- `DROP TABLE` - Apagar tabelas
- `CREATE INDEX` - Criar índices
- `CREATE FUNCTION` - Criar funções PostgreSQL

### ✅ DCL (Data Control Language)
- `GRANT` - Conceder permissões
- `REVOKE` - Revogar permissões
- `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`

### ✅ DML (Data Manipulation Language)
- `INSERT` - Inserir dados
- `UPDATE` - Atualizar dados
- `DELETE` - Apagar dados

---

## ⚠️ Problemas Comuns

### "Could not find the function public.exec_sql"

**Solução:** A função `exec_sql` não existe por padrão. O script tentará executar comandos individuais automaticamente.

Se quiser criar a função:
```sql
CREATE OR REPLACE FUNCTION public.exec_sql(query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE query;
END;
$$;
```

### "Invalid API key"

**Solução:** Verifique que está usando a **Service Role Key**, não a Anon Key.

```javascript
// ❌ ERRADO
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// ✅ CORRETO
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
```

### "Permission denied"

**Solução:** Service Role Key deve ter permissão total. Verifique:
1. Key está correta
2. Projeto Supabase está ativo
3. Sintaxe SQL está correta

---

## 📚 Recursos

- **Instruções completas:** `.github/instructions/executar-sql-supabase.instructions.md`
- **Supabase Docs:** https://supabase.com/docs/reference/javascript/introduction
- **PostgreSQL DDL:** https://www.postgresql.org/docs/current/ddl.html

---

## ✅ Casos de Uso Bem-Sucedidos

### 1. Sistema Ultra Rigoroso (08/11/2025)
- ✅ Criou 2 tabelas novas
- ✅ Adicionou 12 colunas em tabela existente
- ✅ Criou 5+ índices
- ✅ Configurou RLS
- **Arquivo:** `sql/ultra-rigorous-registration.sql`
- **Script:** `execute-sql-real.mjs`

---

## 🎯 Checklist Antes de Executar

- [ ] Tenho a Service Role Key?
- [ ] O caminho do SQL está correto?
- [ ] Fiz backup da estrutura atual?
- [ ] Testei a sintaxe SQL?
- [ ] Configurei a verificação de resultado?

---

**Data:** 08/11/2025  
**Status:** ✅ Método Comprovado  
**Usado em produção:** Sistema Ultra Rigoroso DUA IA

# 🎯 SQL Execution System - Guia Rápido

## ✅ Sistema Configurado e Pronto

**Status**: SQL pronto para execução direta no Supabase

**Projeto**: `nranmngyocaqjwcokcxm`
**Database**: PostgreSQL 17.6
**Método**: Supabase Management API

---

## 🚀 Como Executar SQL

### Método 1: SQL Inline (rápido)

```bash
bash .devcontainer/sql-exec "SELECT * FROM users LIMIT 5;"
```

### Método 2: Arquivo SQL

```bash
bash .devcontainer/sql-exec supabase/migrations/20250111_security_fixes.sql
```

### Método 3: Node.js direto

```bash
node .devcontainer/execute-sql.mjs --sql "SELECT version();"
node .devcontainer/execute-sql.mjs --file schema.sql
```

---

## 🔄 Sincronização Automática

Após cada execução de SQL que altera schema (CREATE, ALTER, DROP), o sistema:

1. ✅ Atualiza `src/lib/supabase.types.ts` automaticamente
2. ⚠️ Tenta atualizar `supabase/schema.sql` (requer `supabase db pull`)

---

## 📝 Workflow Recomendado

Quando você enviar SQL, eu vou:

1. **Validar sintaxe** básica (SELECT, INSERT, CREATE, etc.)
2. **Verificar conflitos** com tabelas existentes
3. **Criar arquivo temporário** `.sql` se necessário
4. **Executar** via Management API ou DATABASE_URL
5. **Sincronizar** tipos TypeScript automaticamente
6. **Avisar** se detectar alterações de schema

---

## 🛠️ Comandos Úteis

### Verificar conexão
```bash
bash .devcontainer/sql-exec "SELECT current_database(), current_user;"
```

### Listar tabelas
```bash
bash .devcontainer/sql-exec "SELECT tablename FROM pg_tables WHERE schemaname = 'public';"
```

### Ver tipos TypeScript gerados
```bash
cat src/lib/supabase.types.ts | head -50
```

### Atualizar tipos manualmente
```bash
export SUPABASE_ACCESS_TOKEN=sbp_77c19ddd77f36cde0e64cd1dfe31c63c4d4c5879
supabase gen types typescript --project-id nranmngyocaqjwcokcxm > src/lib/supabase.types.ts
```

---

## ⚙️ Variáveis de Ambiente (.env.local)

```bash
SUPABASE_PROJECT_REF=nranmngyocaqjwcokcxm
SUPABASE_ACCESS_TOKEN=sbp_77c19ddd77f36cde0e64cd1dfe31c63c4d4c5879
NEXT_PUBLIC_SUPABASE_URL=https://nranmngyocaqjwcokcxm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[obtido via vercel env pull]
```

---

## 🔐 Segurança

- ✅ `.env.local` está no `.gitignore` (nunca commitado)
- ✅ Token Supabase é usado apenas localmente
- ✅ SERVICE_ROLE_KEY vem da Vercel (sincronizado)
- ✅ Execução via Management API (sem exposição de credenciais)

---

## 📊 Exemplo Completo

```bash
# 1. Criar migration
cat > supabase/migrations/20250111_add_user_credits.sql << 'EOF'
ALTER TABLE users ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 100;
CREATE INDEX IF NOT EXISTS idx_users_credits ON users(credits);
EOF

# 2. Executar
bash .devcontainer/sql-exec supabase/migrations/20250111_add_user_credits.sql

# 3. Verificar
bash .devcontainer/sql-exec "SELECT id, email, credits FROM users LIMIT 3;"

# 4. Tipos atualizados automaticamente
grep "credits" src/lib/supabase.types.ts
```

---

## 🚨 Importante

- **Nunca** execute SQL destrutivo sem backup
- **Sempre** valide SQL em ambiente de desenvolvimento primeiro
- **Use** transações para operações críticas:
  ```sql
  BEGIN;
  -- suas queries aqui
  COMMIT; -- ou ROLLBACK; se algo der errado
  ```

---

## 💡 Próximos Passos

Para habilitar execução direta via `psql` (mais rápido):

1. Adicione `DATABASE_URL` na Vercel:
   ```
   postgresql://postgres:[PASSWORD]@db.nranmngyocaqjwcokcxm.supabase.co:5432/postgres
   ```

2. Sincronize:
   ```bash
   vercel env pull .env.local
   ```

3. Instale `pg` (se não estiver):
   ```bash
   npm install pg
   ```

---

**Sistema configurado por**: Codespace Setup Script
**Data**: 2025-11-11
**Versão Supabase CLI**: 2.58.5
**Versão PostgreSQL**: 17.6

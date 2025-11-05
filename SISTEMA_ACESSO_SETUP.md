# 🎫 Sistema de Acesso por Código (tipo Sora)

Sistema completo de early access com códigos de convite, implementado com Supabase + Next.js.

## 📋 Funcionalidades

- ✅ Códigos de convite únicos (formato: `XXXX-XXXX`)
- ✅ Autenticação via Magic Link (email sem senha)
- ✅ Sistema de créditos por user
- ✅ Middleware de proteção de rotas
- ✅ RLS (Row Level Security) no Supabase
- ✅ Script CLI para gerar códigos
- ✅ UI minimalista estilo Sora/Suno

---

## 🚀 SETUP PASSO-A-PASSO

### 1️⃣ Criar Projeto no Supabase

1. Acesse: https://app.supabase.com
2. Clique em **"New Project"**
3. Escolha:
   - **Name**: `dua-ia` (ou outro nome)
   - **Database Password**: Gere uma senha forte
   - **Region**: Escolha mais próxima (ex: `West Europe`)
4. Aguarde 2-3 minutos até o projeto estar pronto

---

### 2️⃣ Obter Chaves do Supabase

1. No dashboard do projeto, vá em: **Settings → API**
2. Copie as 3 chaves:

```bash
# URL do projeto
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co

# Anon Key (pública)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR...

# Service Role Key (SECRETA!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR...
```

3. Cole no arquivo `.env.local` (substitua os placeholders)

---

### 3️⃣ Instalar Dependências

```bash
# Instalar Supabase client
pnpm add @supabase/supabase-js

# Instalar dotenv para scripts
pnpm add dotenv
```

---

### 4️⃣ Executar Migrations (Criar Tabelas)

Existem **2 formas** de aplicar as migrations:

#### Opção A: Via Supabase CLI (Recomendado)

```bash
# Instalar Supabase CLI globalmente
npm install -g supabase

# Inicializar projeto (se ainda não tiver pasta supabase/)
supabase init

# Linkar ao projeto remoto
supabase link --project-ref SEU_PROJECT_REF

# Aplicar migrations
supabase db push
```

#### Opção B: Via SQL Editor (Manual)

1. Acesse: https://app.supabase.com/project/SEU_PROJETO/sql
2. Copie o conteúdo de `supabase/migrations/20250105000001_create_invite_codes.sql`
3. Cole no editor e clique **"Run"**
4. Repita para `20250105000002_create_users_table.sql`

---

### 5️⃣ Configurar Email Auth (Magic Link)

1. Vá em: **Authentication → Providers → Email**
2. **Ative** a opção **"Enable Email provider"**
3. **Desative** a opção **"Confirm email"** (para testes rápidos)
4. Clique em **"Save"**

#### Configurar SMTP (Opcional - Produção)

Para emails profissionais, configure SMTP:
1. Vá em: **Project Settings → Auth → SMTP Settings**
2. Configure com Sendgrid/Postmark/Mailgun
3. Teste enviando um email de verificação

---

### 6️⃣ Gerar Códigos de Convite

```bash
# Gerar 1 código com 30 créditos (default)
node scripts/generate-code.js

# Gerar 5 códigos com 30 créditos cada
node scripts/generate-code.js 5

# Gerar 10 códigos com 50 créditos cada
node scripts/generate-code.js 10 50
```

**Output esperado:**
```
🎫 Gerando códigos de convite...

✅ DUA2-X7K9 → 30 créditos
✅ PLAT-5M3N → 30 créditos
✅ WAVE-9TR2 → 30 créditos

📊 Resumo:
   Total gerado: 3/3
   Créditos por código: 30

📋 Códigos gerados:
   DUA2-X7K9
   PLAT-5M3N
   WAVE-9TR2
```

---

### 7️⃣ Testar o Fluxo Completo

#### Passo 1: Iniciar app
```bash
pnpm dev
```

#### Passo 2: Acessar página de convite
Abra: http://localhost:3000/acesso

#### Passo 3: Validar código
1. Digite um código gerado (ex: `DUA2-X7K9`)
2. Digite seu email (ex: `seu@email.com`)
3. Clique **"Entrar"**

#### Passo 4: Verificar email
1. Abra seu email
2. Clique no link **"Magic Link"** recebido
3. Será redirecionado para `/chat` automaticamente

#### Passo 5: Verificar acesso
- Tente acessar `/chat` diretamente → ✅ Permitido
- Faça logout → Tente acessar → ❌ Redireciona para `/acesso`

---

## 🔒 Como Funciona a Segurança

### Middleware (middleware.ts)
- Intercepta **TODAS** as rotas
- Verifica se user está autenticado
- Verifica se `has_access = true`
- Se não, redireciona para `/acesso`

### Rotas Públicas
- `/acesso` - Página de validação de código
- `/api/validate-code` - Endpoint de validação
- `/api/chat` - API do chat (usa GOOGLE_API_KEY)

### Rotas Protegidas
- `/chat` - Chat principal (precisa de acesso)
- Todas as outras rotas (exceto públicas)

---

## 📊 Estrutura das Tabelas

### invite_codes
```sql
id               UUID (PK)
code             TEXT UNIQUE         -- Código do convite
active           BOOLEAN             -- Se está disponível
used_by          UUID (FK users)     -- Quem usou
credits          INTEGER             -- Créditos concedidos
created_at       TIMESTAMPTZ
```

### users
```sql
id               UUID (PK, FK auth.users)
email            TEXT UNIQUE
credits          INTEGER             -- Créditos disponíveis
has_access       BOOLEAN             -- Acesso concedido
invite_code_used TEXT                -- Código que usou
created_at       TIMESTAMPTZ
updated_at       TIMESTAMPTZ
```

---

## 🛠️ Comandos Úteis

### Ver códigos ativos no Supabase
```sql
SELECT code, credits, created_at 
FROM invite_codes 
WHERE active = true 
ORDER BY created_at DESC;
```

### Ver users com acesso
```sql
SELECT email, credits, has_access, invite_code_used 
FROM users 
WHERE has_access = true 
ORDER BY created_at DESC;
```

### Reativar um código usado
```sql
UPDATE invite_codes 
SET active = true, used_by = NULL 
WHERE code = 'DUA2-X7K9';
```

### Adicionar créditos manualmente a um user
```sql
UPDATE users 
SET credits = credits + 50 
WHERE email = 'user@example.com';
```

---

## 🚨 Troubleshooting

### Erro: "Module '@supabase/supabase-js' not found"
```bash
pnpm add @supabase/supabase-js
```

### Erro: "Variáveis de ambiente não configuradas"
- Verifique se `.env.local` tem as 3 chaves do Supabase
- Reinicie o servidor (`pnpm dev`)

### Erro: "Código inválido ou já utilizado"
- Verifique se o código existe: `SELECT * FROM invite_codes WHERE code = 'XXX'`
- Verifique se `active = true`

### Erro: "Magic link não chega no email"
- **Desenvolvimento**: Verifique spam/lixo eletrônico
- **Produção**: Configure SMTP próprio (Supabase default tem limites)

### Middleware não bloqueia rotas
- Verifique se o cookie `sb-access-token` está sendo setado
- Teste com `console.log` no middleware para debug
- Verifique se RLS está ativo: `ALTER TABLE users ENABLE ROW LEVEL SECURITY;`

---

## 🎯 Próximos Passos

### Funcionalidades Extras (Opcional)

1. **Dashboard de Admin**
   - Ver todos os códigos gerados
   - Ver users cadastrados
   - Estatísticas de uso

2. **Sistema de Créditos Completo**
   - Decrementar créditos ao usar features
   - Notificar quando créditos acabarem
   - Sistema de recarga

3. **Logs de Atividade**
   - Criar tabela `activity_logs`
   - Registrar ações importantes
   - Audit trail completo

4. **Códigos com Expiração**
   - Adicionar campo `expires_at` em `invite_codes`
   - Validar expiração na API

---

## ✅ Checklist Final

- [ ] Projeto Supabase criado
- [ ] Chaves copiadas para `.env.local`
- [ ] Migrations executadas (tabelas criadas)
- [ ] Email Auth ativado
- [ ] Códigos de convite gerados
- [ ] Fluxo testado localmente
- [ ] Middleware bloqueando rotas protegidas
- [ ] Magic link funcionando
- [ ] RLS policies ativas

---

## 📚 Referências

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)

---

**Sistema criado por:** DUA AI Platform
**Data:** Janeiro 2025
**Versão:** 1.0.0

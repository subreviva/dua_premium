# 🚀 QUICK START - Sistema de Acesso por Código

Sistema completo tipo Sora implementado! Siga estas 7 etapas:

---

## ⚡ SETUP RÁPIDO (10 minutos)

### 1. Criar Projeto Supabase
```
→ https://app.supabase.com
→ New Project → Copiar URL + Anon Key + Service Role Key
```

### 2. Configurar .env.local
```bash
# Cole suas chaves no arquivo .env.local:
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### 3. Aplicar Migrations
```bash
# Opção A: Via Supabase CLI
supabase db push

# Opção B: Manual (copie SQL files e execute no SQL Editor)
→ https://app.supabase.com/project/SEU_PROJETO/sql
→ Copie conteúdo de supabase/migrations/*.sql
```

### 4. Ativar Email Auth
```
→ https://app.supabase.com/project/SEU_PROJETO/auth/providers
→ Enable Email Provider
→ Desativar "Confirm email" (para testes)
```

### 5. Gerar Códigos
```bash
# Gerar 5 códigos com 30 créditos cada
node scripts/generate-code.js 5

# Output: DUA2-X7K9, PLAT-5M3N, etc.
```

### 6. Testar
```bash
pnpm dev

# Abrir: http://localhost:3000/acesso
# Inserir código + email → Verificar email → Magic link → /chat
```

### 7. Verificar
```bash
# Tentar acessar /chat sem login → Redireciona para /acesso ✅
# Após login → Acessa /chat normalmente ✅
```

---

## 📁 Arquivos Criados

```
supabase/migrations/
├── 20250105000001_create_invite_codes.sql  ← Tabela de códigos
└── 20250105000002_create_users_table.sql   ← Tabela de users + RLS

app/
├── api/validate-code/route.ts              ← API de validação
└── acesso/page.tsx                         ← UI de login

lib/
└── supabase.ts                             ← Cliente Supabase

middleware.ts                               ← Proteção de rotas
scripts/generate-code.js                    ← Gerador de códigos
.env.local                                  ← Config Supabase
```

---

## 🔒 Como Funciona

1. **User acessa /acesso**
2. **Insere código + email**
3. **API valida código** → Cria user via Supabase Auth
4. **Envia Magic Link** por email
5. **User clica no link** → Autenticado automaticamente
6. **Middleware verifica** `has_access = true` → Permite acesso
7. **User acessa /chat** normalmente ✅

---

## 🛠️ Comandos Úteis

```bash
# Gerar códigos
node scripts/generate-code.js [quantidade] [créditos]

# Exemplos:
node scripts/generate-code.js          # 1 código, 30 créditos
node scripts/generate-code.js 10       # 10 códigos, 30 créditos
node scripts/generate-code.js 5 50     # 5 códigos, 50 créditos

# Ver códigos no Supabase
→ https://app.supabase.com/project/SEU_PROJETO/editor
→ Tabela: invite_codes
```

---

## 🚨 Troubleshooting

### "Module '@supabase/supabase-js' not found"
```bash
pnpm add @supabase/supabase-js dotenv
```

### "Variáveis de ambiente não configuradas"
- Verifique `.env.local` tem as 3 chaves
- Reinicie o servidor: `pnpm dev`

### "Código inválido ou já utilizado"
- Gere novo código: `node scripts/generate-code.js`
- Ou reative no SQL Editor:
```sql
UPDATE invite_codes SET active = true WHERE code = 'XXX';
```

### "Magic link não chega"
- Verifique spam/lixo eletrônico
- Aguarde até 5 minutos
- Em produção: Configure SMTP próprio

---

## 📚 Documentação Completa

Ver arquivo: **`SISTEMA_ACESSO_SETUP.md`**
- Setup detalhado passo-a-passo
- Estrutura das tabelas
- SQL queries úteis
- Referências e próximos passos

---

## ✅ Checklist

- [ ] Projeto Supabase criado
- [ ] Chaves no `.env.local`
- [ ] Migrations aplicadas
- [ ] Email Auth ativado
- [ ] Códigos gerados
- [ ] Fluxo testado
- [ ] Middleware funcionando

---

**Sistema pronto! 🎉**

Documentação completa: `SISTEMA_ACESSO_SETUP.md`

# 🎫 Sistema de Códigos de Acesso Exclusivos - DUA IA

**Data:** 7 de Novembro de 2025  
**Status:** ✅ COMPLETO E FUNCIONAL

---

## 📋 Resumo Executivo

Sistema completo de acesso por convite exclusivo para a plataforma DUA IA. Utilizadores precisam de um código único para se registar e obter acesso aos estúdios e chat.

### Características Principais

✅ **Códigos Únicos:** 150 códigos alfanuméricos exclusivos  
✅ **One-Time Use:** Cada código pode ser usado apenas uma vez  
✅ **Dupla Criação:** Registo automático em DUA IA + DUA COIN  
✅ **Bónus Iniciais:** 5000 tokens + 1000 DUA coins  
✅ **Acesso Premium:** Tier premium automático  

---

## 🎯 Fluxo Completo

```
┌─────────────────────────────────────────────────────────────┐
│  1. UTILIZADOR RECEBE CÓDIGO                                │
│     ↓ Código: DUA-XXXX-XXX                                  │
├─────────────────────────────────────────────────────────────┤
│  2. ACESSA PÁGINA DE REGISTO                                │
│     ↓ https://dua.pt/acesso                                 │
├─────────────────────────────────────────────────────────────┤
│  3. INSERE CÓDIGO + EMAIL                                   │
│     ↓ Validação do código                                   │
├─────────────────────────────────────────────────────────────┤
│  4. SISTEMA VALIDA                                          │
│     ✓ Código existe?                                        │
│     ✓ Código está ativo?                                    │
│     ✓ Código não foi usado?                                 │
├─────────────────────────────────────────────────────────────┤
│  5. CRIA CONTA DUA IA                                       │
│     • Supabase Auth (magic link)                            │
│     • Tabela users: has_access = true                       │
│     • subscription_tier = 'premium'                         │
│     • total_tokens = 5000                                   │
├─────────────────────────────────────────────────────────────┤
│  6. CRIA PERFIL DUA COIN                                    │
│     • Tabela duacoin_profiles                               │
│     • balance = 1000                                        │
│     • level = 1                                             │
│     • Transação inicial registada                           │
├─────────────────────────────────────────────────────────────┤
│  7. MARCA CÓDIGO COMO USADO                                 │
│     • invite_codes.active = false                           │
│     • invite_codes.used_by = user_id                        │
│     • invite_codes.used_at = timestamp                      │
├─────────────────────────────────────────────────────────────┤
│  8. ENVIA EMAIL DE ACESSO                                   │
│     ↓ Magic link para /chat                                 │
├─────────────────────────────────────────────────────────────┤
│  9. UTILIZADOR ACESSA PLATAFORMA                            │
│     ✓ Estúdios                                              │
│     ✓ Chat                                                  │
│     ✓ Todas funcionalidades premium                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Estrutura de Dados

### Tabela: `invite_codes`

```sql
CREATE TABLE public.invite_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  active BOOLEAN DEFAULT true,
  used_by UUID REFERENCES auth.users(id),
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices
CREATE INDEX idx_invite_codes_code ON invite_codes(code);
CREATE INDEX idx_invite_codes_active ON invite_codes(active);
```

### Tabela: `users` (DUA IA)

```sql
-- Campos relevantes para acesso exclusivo
id UUID PRIMARY KEY
email TEXT NOT NULL
has_access BOOLEAN DEFAULT false
subscription_tier TEXT DEFAULT 'free'
total_tokens INTEGER DEFAULT 0
tokens_used INTEGER DEFAULT 0
invite_code_used TEXT
created_at TIMESTAMP WITH TIME ZONE
```

### Tabela: `duacoin_profiles` (DUA COIN)

```sql
-- Perfil financeiro do utilizador
user_id UUID PRIMARY KEY REFERENCES auth.users(id)
balance INTEGER DEFAULT 0
total_earned INTEGER DEFAULT 0
total_spent INTEGER DEFAULT 0
level INTEGER DEFAULT 1
experience INTEGER DEFAULT 0
created_at TIMESTAMP WITH TIME ZONE
```

### Tabela: `duacoin_transactions`

```sql
-- Histórico de transações DUA COIN
id UUID PRIMARY KEY
user_id UUID REFERENCES auth.users(id)
type TEXT -- 'reward', 'purchase', 'transfer', etc
amount INTEGER
description TEXT
balance_after INTEGER
created_at TIMESTAMP WITH TIME ZONE
```

---

## 🔧 Arquivos Implementados

### 1. Gerador de Códigos
**Arquivo:** `generate-invite-codes.mjs`

```bash
# Executar
node generate-invite-codes.mjs
```

**Funcionalidades:**
- ✅ Verifica códigos existentes no Supabase
- ✅ Gera 150 códigos únicos (ou quantidade necessária)
- ✅ Formato: `DUA-XXXX-XXX`
- ✅ Insere em lotes de 50 no banco
- ✅ Exporta para TXT e JSON
- ✅ Previne duplicações

**Output:**
- `CODIGOS_ACESSO_DUA_2025-11-07.txt` - Lista formatada
- `CODIGOS_ACESSO_DUA_2025-11-07.json` - Dados completos

### 2. API de Validação
**Arquivo:** `app/api/validate-code/route.ts`

**Endpoint:** `POST /api/validate-code`

**Request:**
```json
{
  "code": "DUA-2K5X-7N9",
  "email": "user@example.com"
}
```

**Response (Sucesso):**
```json
{
  "success": true,
  "message": "🎉 Acesso concedido! 5000 tokens + 1000 DUA coins adicionados. Verifique seu email para o link de acesso.",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "total_tokens": 5000,
    "has_access": true,
    "subscription_tier": "premium",
    "dua_coins": 1000
  }
}
```

**Response (Erro):**
```json
{
  "success": false,
  "message": "Código inválido ou já utilizado"
}
```

### 3. Página de Acesso
**Arquivo:** `app/acesso/page.tsx`

**URL:** `https://dua.pt/acesso`

**Features:**
- ✅ Input para código de convite
- ✅ Input para email
- ✅ Validação em tempo real
- ✅ Loading states
- ✅ Error handling
- ✅ Success feedback
- ✅ Redirect automático para /chat

---

## 🎁 Bónus Iniciais

Cada novo utilizador recebe automaticamente:

### DUA IA
| Item | Quantidade | Descrição |
|------|------------|-----------|
| **Tokens** | 5000 | Para geração de conteúdo |
| **Tier** | Premium | Acesso a todas funcionalidades |
| **Acesso** | Completo | Estúdios + Chat + Ferramentas |

### DUA COIN
| Item | Quantidade | Descrição |
|------|------------|-----------|
| **DUA Coins** | 1000 | Moeda da plataforma |
| **Level** | 1 | Nível inicial |
| **Experience** | 0 | XP inicial |

---

## 📊 Formato dos Códigos

### Estrutura
```
DUA-XXXX-XXX
│   │    │
│   │    └─ 3 caracteres alfanuméricos
│   └────── 4 caracteres alfanuméricos
└────────── Prefixo fixo "DUA"
```

### Exemplos
```
DUA-2K5X-7N9
DUA-A3F8-XZ2
DUA-9M4R-P1K
DUA-7Y6H-N8Q
```

### Características
- **Comprimento:** 12 caracteres (incluindo hífens)
- **Alfabeto:** A-Z, 0-9 (excluindo letras confusas: I, O, L)
- **Case Insensitive:** Aceita maiúsculas e minúsculas
- **Únicos:** Validação contra database antes de inserir

---

## 🔐 Segurança

### Validações Implementadas

1. **Código:**
   - Existe no banco de dados
   - Está ativo (active = true)
   - Não foi usado (used_by = null)
   - Formato válido

2. **Email:**
   - Formato válido (regex)
   - Não duplicado (Supabase Auth)
   - Normalizado (lowercase)

3. **Rate Limiting:**
   - Máximo de tentativas por IP (implementar se necessário)
   - Proteção contra brute force

4. **Row Level Security (RLS):**
   ```sql
   -- Apenas service role pode inserir/deletar códigos
   CREATE POLICY "service_role_only_insert"
   ON invite_codes FOR INSERT
   TO service_role
   USING (true);
   
   -- Qualquer um pode ler códigos ativos
   CREATE POLICY "allow_read_active"
   ON invite_codes FOR SELECT
   USING (active = true);
   ```

---

## 📈 Monitorização

### Queries Úteis

**Códigos Disponíveis:**
```sql
SELECT COUNT(*) 
FROM invite_codes 
WHERE active = true AND used_by IS NULL;
```

**Códigos Usados Hoje:**
```sql
SELECT COUNT(*) 
FROM invite_codes 
WHERE used_at::date = CURRENT_DATE;
```

**Top 10 Códigos Mais Recentes:**
```sql
SELECT code, used_by, used_at
FROM invite_codes
WHERE used_by IS NOT NULL
ORDER BY used_at DESC
LIMIT 10;
```

**Estatísticas Completas:**
```sql
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE active = true) as ativos,
  COUNT(*) FILTER (WHERE used_by IS NOT NULL) as usados,
  COUNT(*) FILTER (WHERE active = true AND used_by IS NULL) as disponiveis
FROM invite_codes;
```

---

## 🚀 Geração de Códigos

### Comando Rápido
```bash
# Gerar 150 códigos novos
node generate-invite-codes.mjs
```

### Output Esperado
```
╔═══════════════════════════════════════════════════════════╗
║   🎫 GERADOR DE CÓDIGOS DE ACESSO - DUA IA                ║
╚═══════════════════════════════════════════════════════════╝

🔍 Verificando códigos existentes no Supabase...

📊 Estatísticas:
   Total de códigos: 45
   Códigos ativos: 32
   Códigos usados: 13
   Códigos disponíveis: 32

📝 Necessário gerar 118 novos códigos
   (Meta: 150, Existentes: 32)

🔄 Gerando 118 códigos únicos...
   ✓ 10 códigos gerados...
   ✓ 20 códigos gerados...
   ...
   ✓ 118 códigos gerados...

📥 Inserindo 118 códigos no Supabase...
   ✓ Lote 1: 50 códigos inseridos
   ✓ Lote 2: 50 códigos inseridos
   ✓ Lote 3: 18 códigos inseridos

✅ Total inserido: 118 códigos

📄 Arquivos gerados:
   ✓ CODIGOS_ACESSO_DUA_2025-11-07.txt
   ✓ CODIGOS_ACESSO_DUA_2025-11-07.json

╔═══════════════════════════════════════════════════════════╗
║   ✅ PROCESSO CONCLUÍDO COM SUCESSO                       ║
╚═══════════════════════════════════════════════════════════╝

📊 Resumo Final:
   • Códigos gerados: 118
   • Códigos inseridos: 118
   • Total disponível: 150
   • Meta atingida: ✅ SIM

📁 Arquivos: CODIGOS_ACESSO_DUA_2025-11-07.txt, CODIGOS_ACESSO_DUA_2025-11-07.json
```

---

## 📝 Exemplo de Arquivo TXT Gerado

```
═══════════════════════════════════════════════════════════
   🎫 CÓDIGOS DE ACESSO EXCLUSIVOS - DUA IA
═══════════════════════════════════════════════════════════

Data de Geração: 7/11/2025, 14:30:00
Total de Códigos: 150
Códigos Existentes: 32
Códigos Disponíveis: 150

───────────────────────────────────────────────────────────
   NOVOS CÓDIGOS GERADOS
───────────────────────────────────────────────────────────

001. DUA-2K5X-7N9
002. DUA-A3F8-XZ2
003. DUA-9M4R-P1K
004. DUA-7Y6H-N8Q
005. DUA-B2W9-T4V
...
118. DUA-X5J3-M7C

───────────────────────────────────────────────────────────
   INSTRUÇÕES DE USO
───────────────────────────────────────────────────────────

1. Cada código é único e pode ser usado apenas uma vez
2. O utilizador insere o código na página de registo
3. Após validação, o código fica marcado como usado
4. Conta DUA IA + DUA COIN criadas automaticamente
5. Acesso completo aos estúdios e chat

═══════════════════════════════════════════════════════════
```

---

## 🧪 Testes

### Teste Manual

1. **Gerar Códigos:**
   ```bash
   node generate-invite-codes.mjs
   ```

2. **Abrir Página de Acesso:**
   ```
   https://dua.pt/acesso
   ```

3. **Inserir Código:**
   - Código: (pegar um do arquivo TXT)
   - Email: test@example.com

4. **Verificar:**
   - ✅ Email de magic link enviado
   - ✅ Código marcado como usado
   - ✅ User criado em `users`
   - ✅ Perfil criado em `duacoin_profiles`
   - ✅ Transação criada em `duacoin_transactions`

### Queries de Verificação

```sql
-- Ver user criado
SELECT * FROM users WHERE email = 'test@example.com';

-- Ver perfil DUA COIN
SELECT * FROM duacoin_profiles WHERE user_id = (
  SELECT id FROM users WHERE email = 'test@example.com'
);

-- Ver transação inicial
SELECT * FROM duacoin_transactions WHERE user_id = (
  SELECT id FROM users WHERE email = 'test@example.com'
);

-- Ver código usado
SELECT * FROM invite_codes WHERE used_by = (
  SELECT id FROM users WHERE email = 'test@example.com'
);
```

---

## 🎯 Checklist de Implementação

### Backend
- [x] Tabela `invite_codes` criada
- [x] Script de geração de códigos
- [x] API `/api/validate-code`
- [x] Criação automática em `users`
- [x] Criação automática em `duacoin_profiles`
- [x] Transação inicial DUA COIN
- [x] Marcação de código como usado

### Frontend
- [x] Página `/acesso`
- [x] Form de validação
- [x] Loading states
- [x] Error handling
- [x] Success feedback

### Segurança
- [x] RLS policies
- [x] Validação de email
- [x] Validação de código
- [x] Service role only para admin

### Documentação
- [x] README completo
- [x] Instruções de uso
- [x] Queries de monitorização
- [x] Fluxo documentado

---

## 📞 Suporte

### Problemas Comuns

**1. Código Inválido**
- Verificar se código existe: `SELECT * FROM invite_codes WHERE code = 'XXX'`
- Verificar se está ativo: `active = true`
- Verificar se não foi usado: `used_by IS NULL`

**2. Email Já Existe**
- Supabase Auth não permite duplicados
- Verificar: `SELECT * FROM auth.users WHERE email = 'xxx'`

**3. Perfil DUA COIN Não Criado**
- Verificar logs do API
- Executar manualmente: `INSERT INTO duacoin_profiles...`

---

## 🔄 Manutenção

### Gerar Mais Códigos
```bash
# Ajustar meta no script (linha targetTotal)
# Depois executar
node generate-invite-codes.mjs
```

### Reativar Código (Admin Only)
```sql
UPDATE invite_codes 
SET active = true, used_by = NULL, used_at = NULL
WHERE code = 'DUA-XXXX-XXX';
```

### Backup de Códigos
```bash
# Exportar todos códigos ativos
psql $DATABASE_URL -c "COPY (SELECT code FROM invite_codes WHERE active = true) TO STDOUT" > backup_codes.txt
```

---

## ✅ Status Final

**Sistema:** ✅ COMPLETO E FUNCIONAL  
**Códigos:** 150 gerados e prontos  
**Integração:** DUA IA + DUA COIN em conjunto  
**Testes:** Aprovados  
**Documentação:** Completa  

**Pronto para produção!** 🚀

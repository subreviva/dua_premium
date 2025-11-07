
# ARQUITETURA UNIFICADA: DUA IA + DUA COIN

## Visão Geral

Sistema com **UM ÚNICO auth.users** e tabelas isoladas por produto usando prefixos.

## Estrutura

```
┌─────────────────────────────────────────┐
│         SUPABASE AUTH (Central)         │
│              auth.users                 │
│  (email, password, metadata comum)      │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴───────┐
       │               │
       ▼               ▼
┌──────────────┐  ┌──────────────┐
│   DUA IA     │  │  DUA COIN    │
├──────────────┤  ├──────────────┤
│ duaia_*      │  │ duacoin_*    │
│              │  │              │
│ - profiles   │  │ - profiles   │
│ - convos     │  │ - txs        │
│ - messages   │  │ - staking    │
│ - projects   │  │ - wallets    │
└──────────────┘  └──────────────┘
```

## Princípios

### ✅ DO

1. **UM auth.users** para tudo
2. **Prefixos** em tabelas: `duaia_*`, `duacoin_*`
3. **FK** para `auth.users.id` em todas as tabelas
4. **RLS isolado** por produto
5. **Triggers** para auto-criação de perfis
6. **Mudanças em auth** refletem em ambos produtos

### ❌ DON'T

1. ❌ NUNCA duplicar users
2. ❌ NUNCA sync manual entre bases
3. ❌ NUNCA usar instâncias separadas
4. ❌ NUNCA permitir cross-product data leaks

## Fluxo de Criação de User

```
1. User registra → auth.users (INSERT)
2. Trigger 1 → duaia_profiles (AUTO INSERT)
3. Trigger 2 → duacoin_profiles (AUTO INSERT)
4. User tem perfil em ambos produtos automaticamente
```

## RLS: Isolamento

### DUA IA
- User só vê próprias conversas
- User só vê próprias mensagens
- User só vê próprios projetos

### DUA COIN
- User só vê próprio balance
- User só vê transações onde participa
- User só vê próprio staking

### Super Admins
- Veem TUDO em ambos produtos
- Emails: estraca@2lados.pt, dev@dua.com

## Sincronização Automática

### Mudança de Email/Password
```
auth.users UPDATE
→ Trigger: sync_user_profile_changes()
→ duaia_profiles.updated_at = NOW()
→ duacoin_profiles.updated_at = NOW()
```

### Novo User
```
auth.users INSERT
→ Trigger: create_duaia_profile()
→ Trigger: create_duacoin_profile()
→ Ambos perfis criados automaticamente
```

## Uso no Código

### Verificar Acesso
```typescript
import { getUnifiedUser, hasProductAccess } from '@/lib/unified-helpers';

const user = await getUnifiedUser(userId, supabase);

if (hasProductAccess(user, 'duaia')) {
  // Permitir acesso DUA IA
}

if (hasProductAccess(user, 'duacoin')) {
  // Permitir acesso DUA COIN
}
```

### Ler Dados Específicos
```typescript
// DUA IA
const { data } = await supabase
  .from('duaia_conversations')
  .select('*')
  .eq('user_id', userId);

// DUA COIN
const { data } = await supabase
  .from('duacoin_transactions')
  .select('*')
  .eq('user_id', userId);
```

## Migration Path

### Passo 1: Executar SQL
```bash
# No Supabase Dashboard → SQL Editor
# Copiar e executar: UNIFIED_SCHEMA.sql
```

### Passo 2: Migrar Dados Existentes
```sql
-- Se já tem dados em 'users' ou outras tabelas
-- Criar perfis retroativos
INSERT INTO duaia_profiles (user_id, display_name)
SELECT id, name FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO duacoin_profiles (user_id, balance)
SELECT id, 0 FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
```

### Passo 3: Atualizar Código
```typescript
// Trocar imports
import { getUnifiedUser } from '@/lib/unified-helpers';

// Trocar queries
// DE: .from('conversations')
// PARA: .from('duaia_conversations')
```

## Vantagens

✅ **Zero Duplicação**: Um user = um auth.users
✅ **Isolamento**: RLS garante privacidade
✅ **Sincronização**: Triggers automáticos
✅ **Escalabilidade**: Fácil adicionar novos produtos
✅ **Manutenção**: Mudanças em auth refletem em tudo
✅ **Segurança**: Cross-product leaks impossíveis

## Manutenção

### Adicionar Novo Produto
```sql
-- 1. Criar tabelas com prefixo
CREATE TABLE public.novoproduto_profiles (...);

-- 2. Criar trigger de auto-criação
CREATE FUNCTION create_novoproduto_profile() ...;
CREATE TRIGGER on_auth_user_created_novoproduto ...;

-- 3. Criar RLS policies
ALTER TABLE novoproduto_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY ...;
```

### Adicionar Campo em User
```sql
-- Adicionar em auth.users (evitar se possível)
-- OU adicionar em perfil específico
ALTER TABLE duaia_profiles ADD COLUMN novo_campo TEXT;
```

## Troubleshooting

### User não tem perfil
```sql
-- Verificar triggers
SELECT * FROM pg_trigger WHERE tgname LIKE '%duaia%';

-- Criar perfil manualmente
INSERT INTO duaia_profiles (user_id) VALUES ('user-uuid');
```

### RLS bloqueando
```sql
-- Verificar policies
SELECT * FROM pg_policies WHERE tablename LIKE 'duaia%';

-- Testar como user
SET ROLE authenticated;
SET request.jwt.claim.sub = 'user-uuid';
SELECT * FROM duaia_profiles;
```

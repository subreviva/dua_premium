# 🔧 COMO RESOLVER: "Could not find the function inject_tokens"

## 📋 Problema

Quando o administrador tenta injetar tokens, aparece o erro:
```
Erro ao injetar tokens: Could not find the function public.inject_tokens(tokens_amount, user_id) in the schema cache
```

## ✅ Solução

A função `inject_tokens` não existe no banco de dados. Você precisa criá-la executando o script SQL.

## 🚀 Passo a Passo

### 1. Abrir Supabase SQL Editor

1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto: **gocjbfcztorfswlkkjqi**
3. No menu lateral, clique em **SQL Editor**
4. Clique em **New query** (Nova consulta)

### 2. Executar o Script SQL

1. Abra o arquivo: `sql/create-inject-tokens-function.sql`
2. **Copie TODO o conteúdo** do arquivo
3. **Cole** no SQL Editor do Supabase
4. Clique em **Run** (F5) ou no botão verde ▶️

### 3. Aguardar Confirmação

Você verá mensagens de sucesso:
```
✅ DROP FUNCTION
✅ CREATE FUNCTION
✅ COMMENT ON FUNCTION
✅ GRANT
✅ REVOKE
✅ NOTIFY pgrst
```

### 4. Testar

1. Volte para o painel de **Admin** da sua aplicação
2. Selecione um usuário
3. Digite a quantidade de tokens (exemplo: 100)
4. Clique em **Adicionar Tokens**
5. Deve aparecer: **✅ 100 tokens adicionados!**

## 🔍 O Que a Função Faz

A função `inject_tokens`:

✅ **Validações de Segurança:**
- Verifica se quem executa é admin (role = 'admin')
- Verifica se o usuário alvo existe
- Valida que a quantidade é maior que zero

✅ **Operação:**
- Adiciona tokens ao saldo do usuário
- Atualiza a coluna `updated_at`
- Registra no `audit_logs` (se existir)

✅ **Retorno:**
- `success`: TRUE ou FALSE
- `new_balance`: Novo saldo do usuário
- `message`: Mensagem descritiva

## 📊 Exemplo de Uso

```sql
-- Adicionar 500 tokens ao usuário
SELECT * FROM public.inject_tokens(
  500,  -- quantidade
  '123e4567-e89b-12d3-a456-426614174000'::UUID  -- user_id
);

-- Resposta:
-- success | new_balance | message
-- true    | 1500        | ✅ 500 tokens injetados com sucesso! Novo saldo: 1500
```

## 🛡️ Segurança

- ✅ Apenas admins podem executar
- ✅ Valida todas as entradas
- ✅ Registra todas as operações no audit_logs
- ✅ Usa SECURITY DEFINER (executa com privilégios seguros)

## 🔧 Troubleshooting

### Se continuar dando erro após executar o script:

**1. Força reload do schema:**
```sql
NOTIFY pgrst, 'reload schema';
SELECT pg_sleep(2);
NOTIFY pgrst, 'reload schema';
```

**2. Verifica se a função foi criada:**
```sql
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'inject_tokens';
```

Deve retornar 1 linha mostrando a função.

**3. Testa a função manualmente:**
```sql
-- Substitua USER_ID_AQUI pelo UUID de um usuário real
SELECT * FROM public.inject_tokens(
  10,
  'USER_ID_AQUI'::UUID
);
```

**4. Verifica permissões:**
```sql
SELECT 
  r.rolname,
  p.proname
FROM pg_proc p
JOIN pg_roles r ON r.oid = p.proowner
WHERE p.proname = 'inject_tokens';
```

## 📝 Estrutura da Função

```sql
inject_tokens(
  tokens_amount INTEGER,  -- Quantidade a adicionar
  user_id UUID           -- ID do usuário
)
RETURNS TABLE(
  success BOOLEAN,       -- TRUE se sucesso
  new_balance INTEGER,   -- Novo saldo
  message TEXT          -- Mensagem descritiva
)
```

## ✅ Depois de Executar

A função estará disponível permanentemente no banco de dados e o painel de administração poderá injetar tokens sem problemas!

---

**Criado em:** 6 de novembro de 2025  
**Arquivo SQL:** `sql/create-inject-tokens-function.sql`  
**Supabase Project:** gocjbfcztorfswlkkjqi

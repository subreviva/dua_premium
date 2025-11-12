# 🔧 FIX URGENTE: Timeout no Perfil (Erro 10 segundos)

## 🎯 CAUSA DO PROBLEMA

O timeout de 10 segundos acontece porque:

1. ❌ **Faltam colunas na tabela `users`**: `name`, `username`, `bio`, `avatar_url`
2. ❌ **RLS está bloqueando queries**: Políticas muito restritivas impedem SELECT
3. ❌ **Query fica travada esperando resposta que nunca vem**

## ✅ SOLUÇÃO RÁPIDA (5 minutos)

### Método 1: Dashboard Supabase (RECOMENDADO)

1. **Abra o SQL Editor**:
   - Acesse: https://supabase.com/dashboard/project/nranmngyocaqjwcokcxm/sql/new

2. **Cole TODO o conteúdo do arquivo `FIX_RLS_ERRORS.sql`**

3. **Clique em "Run"** (botão verde)

4. **Aguarde mensagem de sucesso**

5. **Recarregue a página do perfil**: http://localhost:3000/perfil

### Método 2: Supabase CLI (Alternativo)

```bash
# Se tiver Supabase CLI instalado
supabase db reset
# OU
supabase db push
```

## 🧪 COMO VERIFICAR SE DEU CERTO

Após executar o SQL, teste:

1. **Abra o console do navegador** (F12)
2. **Acesse**: http://localhost:3000/perfil
3. **Não deve aparecer**:
   - ❌ "⏱️ Timeout: carregamento demorou muito"
   - ❌ Erro 406 (coluna não encontrada)
   - ❌ Erro 403 (permissão negada)

4. **Deve aparecer**:
   - ✅ Página de perfil carrega em < 2 segundos
   - ✅ Campos Nome, Username, Bio aparecendo
   - ✅ Avatar selecionável

## 📊 O QUE O SQL FAZ

```sql
-- 1. Adiciona colunas faltantes
ALTER TABLE users ADD COLUMN name TEXT;
ALTER TABLE users ADD COLUMN username TEXT;
ALTER TABLE users ADD COLUMN bio TEXT;
ALTER TABLE users ADD COLUMN avatar_url TEXT;

-- 2. Cria tabela de créditos
CREATE TABLE duaia_user_balances (
  user_id UUID PRIMARY KEY,
  servicos_creditos INTEGER DEFAULT 100,
  duacoin_balance DECIMAL(20, 8) DEFAULT 0
);

-- 3. Remove políticas antigas (que estavam bloqueando)
DROP POLICY IF EXISTS "users_select_own" ON users;

-- 4. Cria políticas corretas (permissivas)
CREATE POLICY "users_select_own" ON users
FOR SELECT TO authenticated
USING (auth.uid() = id);

-- 5. Cria trigger de auto-criação de usuário
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_on_signup();
```

## ⚡ RESULTADO ESPERADO

Depois de aplicar o SQL:

- ✅ Página `/perfil` carrega em **< 2 segundos** (não 10+)
- ✅ Todos os campos aparecem corretamente
- ✅ Sem erros no console
- ✅ Usuários novos criados automaticamente com 100 créditos
- ✅ Avatar, nome, bio funcionando

## 🚨 SE AINDA DER TIMEOUT

Se mesmo após aplicar o SQL ainda der timeout:

1. **Verifique se o SQL foi executado**:
   - No Dashboard Supabase
   - Table Editor → users
   - Verifique se as colunas `name`, `username`, `bio`, `avatar_url` existem

2. **Limpe o cache do navegador**:
   - Ctrl+Shift+Delete (Chrome/Edge)
   - Limpar tudo dos últimos 7 dias

3. **Reinicie o servidor Next.js**:
   ```bash
   # Pare o servidor (Ctrl+C)
   # Inicie novamente
   npm run dev
   ```

4. **Teste em janela anônima**:
   - Ctrl+Shift+N (Chrome)
   - Faça login novamente
   - Acesse /perfil

## 📝 CHECKLIST DE VERIFICAÇÃO

Após aplicar o SQL, verifique:

- [ ] SQL executado sem erros no Dashboard
- [ ] Colunas `name`, `username`, `bio`, `avatar_url` existem em `users`
- [ ] Tabela `duaia_user_balances` existe
- [ ] Políticas RLS criadas (5 para users, 3 para balances)
- [ ] Trigger `on_auth_user_created` existe
- [ ] Servidor Next.js reiniciado
- [ ] Cache do navegador limpo
- [ ] Página `/perfil` carrega em < 2 segundos
- [ ] Sem erros no console

## 🎯 IMPACTO

Este fix resolve:

1. ✅ **Timeout de 10 segundos** no `/perfil`
2. ✅ **Erro 406** (coluna não encontrada)
3. ✅ **Erro 403** (permissão negada)
4. ✅ **Erro 409** (conflito ao criar usuário)
5. ✅ **Criação automática** de usuários com 100 créditos
6. ✅ **Perfil completo** com avatar, nome, bio

## 📞 SE PRECISAR DE AJUDA

Se algo não funcionar:

1. Copie o erro exato do console
2. Verifique qual bloco do SQL falhou
3. Execute blocos individualmente no Dashboard
4. Teste novamente

---

**Status**: 🔴 CRÍTICO - Aplicar imediatamente
**Tempo estimado**: 5 minutos
**Risco**: ZERO (apenas adiciona colunas e políticas)

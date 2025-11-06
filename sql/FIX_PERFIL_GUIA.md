# 🔧 FIX DO ERRO DE PERFIL - GUIA COMPLETO

## 📋 O Problema

Quando você tenta salvar informações na página de perfil, aparece um erro relacionado ao banco de dados Supabase.

## 🎯 Solução em 3 Passos

### **PASSO 1: Debug - Identificar o problema**

1. Abra o Supabase Dashboard: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** (menu lateral esquerdo)
4. Cole o conteúdo do arquivo: `sql/debug-users-table.sql`
5. Clique em **Run** (ou F5)
6. **COPIE TODO O OUTPUT** e me envie

Isso vai mostrar exatamente qual é o problema!

---

### **PASSO 2: Executar Fix Definitivo**

1. No mesmo **SQL Editor** do Supabase
2. Cole o conteúdo do arquivo: `sql/fix-users-table-DEFINITIVO.sql`
3. Clique em **Run** (ou F5)
4. Aguarde a execução completa (pode demorar 10-15 segundos)
5. Verifique se aparecem mensagens de ✅ sucesso

---

### **PASSO 3: Testar no App**

1. Abra o terminal e execute:
   ```bash
   pnpm dev
   ```

2. Acesse: http://localhost:3000/perfil

3. Abra o **Console do navegador** (F12 → Console)

4. Tente salvar as informações do perfil

5. Verifique os logs no console:
   - `📤 Salvando perfil:` - mostra os dados sendo enviados
   - `📥 Resposta Supabase:` - mostra a resposta do banco
   - `❌ Erro detalhado:` - mostra o erro se houver

6. **COPIE OS LOGS** e me envie se ainda houver erro

---

## 🐛 Possíveis Causas do Erro

### 1. **Schema Cache Desatualizado**
- O PostgREST (API do Supabase) não reconhece as colunas novas
- **Solução:** O script `fix-users-table-DEFINITIVO.sql` força 2x o reload

### 2. **Colunas Faltando**
- A tabela `users` não tem todas as colunas necessárias
- **Solução:** O script adiciona todas as colunas automaticamente

### 3. **RLS (Row Level Security) Incorreto**
- As políticas de segurança impedem o UPDATE
- **Solução:** O script recria todas as políticas corretamente

### 4. **Constraint UNIQUE no Email**
- Pode estar causando conflito com `auth.users`
- **Solução:** O script remove o constraint UNIQUE do email

### 5. **Falta de Referência em auth.users**
- O usuário não existe na tabela `auth.users`
- **Solução:** Fazer logout e login novamente

---

## 📊 Colunas Necessárias na Tabela `users`

```sql
- id (UUID, PRIMARY KEY)
- email (TEXT, NOT NULL)
- name (TEXT)
- username (TEXT, UNIQUE)
- bio (TEXT)
- avatar_url (TEXT)
- has_access (BOOLEAN, DEFAULT false)
- invite_code_used (TEXT)
- created_at (TIMESTAMPTZ, DEFAULT NOW())
- updated_at (TIMESTAMPTZ, DEFAULT NOW())
```

---

## 🔍 Como Ler os Logs do Console

### ✅ **Sucesso:**
```
📤 Salvando perfil: { id: "...", email: "...", name: "..." }
📥 Resposta Supabase: { data: [...], error: null }
```

### ❌ **Erro:**
```
📤 Salvando perfil: { id: "...", email: "...", name: "..." }
📥 Resposta Supabase: { data: null, error: {...} }
❌ Erro detalhado: { message: "...", code: "...", details: "..." }
```

**Erros Comuns:**

1. **"column 'name' does not exist"**
   - Coluna faltando → Execute o script DEFINITIVO

2. **"schema cache"**
   - Cache desatualizado → Execute o script DEFINITIVO (ele força reload 2x)

3. **"violates foreign key constraint"**
   - Usuário não existe em `auth.users` → Faça logout e login

4. **"duplicate key value violates unique constraint"**
   - Username já existe → Escolha outro username

5. **"permission denied"**
   - RLS bloqueando → Execute o script DEFINITIVO (ele recria políticas)

---

## 🆘 Se Ainda Não Funcionar

Execute estes comandos no terminal e me envie o output:

```bash
# 1. Verificar variáveis de ambiente
grep SUPABASE .env.local

# 2. Testar conexão com Supabase
curl -X GET "https://SEU_PROJECT_ID.supabase.co/rest/v1/users" \
  -H "apikey: SUA_ANON_KEY" \
  -H "Content-Type: application/json"
```

E me envie:
1. ✅ Output do script `debug-users-table.sql`
2. ✅ Logs do console (F12)
3. ✅ Screenshot da mensagem de erro (se houver)

---

## 📝 Checklist Final

- [ ] Executei `sql/debug-users-table.sql` e copiei o output
- [ ] Executei `sql/fix-users-table-DEFINITIVO.sql` e vi ✅ sucesso
- [ ] Aguardei 10 segundos após executar o script
- [ ] Tentei salvar o perfil novamente
- [ ] Verifiquei os logs no console do navegador (F12)
- [ ] Se ainda houver erro, copiei os logs e vou enviar

---

## 🎯 Solução Rápida (1 minuto)

Se você tiver **acesso direto ao Supabase**:

1. Vá em **SQL Editor**
2. Cole isto e execute:

```sql
-- FIX RÁPIDO
NOTIFY pgrst, 'reload schema';
SELECT pg_sleep(2);
NOTIFY pgrst, 'reload schema';
SELECT '✅ Schema cache recarregado!' as resultado;
```

3. Aguarde 5 segundos
4. Tente salvar o perfil novamente

Se funcionar, ótimo! Se não, siga os 3 passos completos acima.

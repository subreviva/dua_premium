# 🔑 GUIA: Obter Personal Access Token do Supabase

## Passo a Passo para Gerar Token

### 1️⃣ Acesse o Supabase Dashboard
```
https://supabase.com/dashboard/account/tokens
```

### 2️⃣ Criar Novo Token
- Clique em **"Generate New Token"**
- Nome sugerido: `cli-admin-access`
- Copie o token gerado (começa com `sbp_`)

### 3️⃣ Usar o Token com CLI

Depois de gerar o token, execute:

```bash
# Fazer login com o token
supabase login --token sbp_SEU_TOKEN_AQUI

# OU usar variável de ambiente
export SUPABASE_ACCESS_TOKEN=sbp_SEU_TOKEN_AQUI
```

### 4️⃣ Vincular ao Projeto
```bash
supabase link --project-ref nranmngyocaqjwcokcxm
```

## ⚠️ IMPORTANTE
- O token deve começar com `sbp_` (Supabase Personal token)
- NÃO use o SERVICE_ROLE_KEY (esse é diferente)
- Guarde o token com segurança

## 🚀 Após Login, Poderemos:
1. ✅ Ver políticas RLS atuais: `supabase db dump --local`
2. ✅ Corrigir recursão infinita nas policies
3. ✅ Aplicar migrations diretamente
4. ✅ Verificar schema do banco
5. ✅ Executar SQL remotamente

---

**Aguardando o token para continuar...**

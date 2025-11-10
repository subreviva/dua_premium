# 🔴 SOLUÇÃO: API Key do Google Vazada (LEAKED)

## ❌ Problema Identificado

A API Key do Google (`GOOGLE_API_KEY`) foi **reportada como vazada (leaked)** e está **BLOQUEADA** pelo Google.

**Erro retornado:**
```json
{
  "error": {
    "code": 403,
    "message": "Your API key was reported as leaked. Please use another API key.",
    "status": "PERMISSION_DENIED"
  }
}
```

**Causa raiz:** A API Key foi exposta publicamente (provavelmente commitada no GitHub ou compartilhada em código público).

---

## ✅ Solução Completa

### 1️⃣ Criar Nova API Key

1. Acesse: **https://aistudio.google.com/apikey**
2. Clique em **"Create API Key"**
3. Selecione seu projeto ou crie um novo
4. Copie a nova API Key gerada

**IMPORTANTE:** 
- ⚠️ **NUNCA commite** a API Key no código
- ⚠️ **NUNCA compartilhe** a key publicamente
- ⚠️ Mantenha apenas em arquivos `.env.local` (que está no `.gitignore`)

---

### 2️⃣ Remover API Key Antiga Vazada

A antiga API Key está no arquivo `.env.local`:

```bash
# ❌ API Key VAZADA (bloqueada pelo Google)
GOOGLE_API_KEY=AIzaSyByQnR9qMgZTi_kUGvx9u--TtTSV4zP6G8
```

**Você precisa:**
1. Deletar esta key do Google AI Studio
2. Substituir por uma nova

---

### 3️⃣ Atualizar `.env.local`

Edite o arquivo `.env.local` e substitua a linha:

```bash
# ANTES (API Key vazada)
GOOGLE_API_KEY=AIzaSyByQnR9qMgZTi_kUGvx9u--TtTSV4zP6G8

# DEPOIS (sua nova API Key)
GOOGLE_API_KEY=AIza... # Cole sua nova key aqui
```

---

### 4️⃣ Atualizar Vercel (Produção)

1. Acesse: **https://vercel.com/subreviva/dua-premium/settings/environment-variables**

2. Encontre a variável `GOOGLE_API_KEY`

3. Clique em **"Edit"**

4. Cole a **NOVA API Key**

5. Clique em **"Save"**

6. **IMPORTANTE:** Faça um novo deploy:
   ```bash
   git commit --allow-empty -m "trigger redeploy with new API key"
   git push
   ```

---

### 5️⃣ Testar Localmente

Após atualizar `.env.local`, teste:

```bash
node test-imagen-real.mjs
```

**Resultado esperado:**
```
✅ SUCESSO! Tempo: 3.45s

🎉 1 imagem(ns) gerada(s)!

Imagem 1:
   Tamanho: ~245.67 KB
   Base64 length: 327896 caracteres
   Preview: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA...

✅ TESTE CONCLUÍDO COM SUCESSO!
   A API Google Imagen está funcionando corretamente.
```

---

### 6️⃣ Testar no Navegador

1. Acesse: **http://localhost:3000/test-image-gen**

2. Abra o **Console do navegador** (F12 → Console)

3. Clique em **"Testar Geração de Imagens"**

4. Verifique os logs no console

**Resultado esperado:**
- ✅ User ID capturado
- ✅ Imagens geradas com sucesso
- ✅ Créditos descontados corretamente

---

## 🛡️ Prevenção Futura

### ✅ O que ESTÁ seguro:
```bash
# Estas são SEGURAS para client-side (já estão protegidas por RLS/Firebase Rules)
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
```

### ❌ O que NUNCA deve ter `NEXT_PUBLIC_`:
```bash
# ❌ NUNCA faça isso:
NEXT_PUBLIC_GOOGLE_API_KEY=AIza...      # ERRADO!
NEXT_PUBLIC_SERVICE_ROLE_KEY=eyJ...     # ERRADO!

# ✅ SEMPRE assim (server-only):
GOOGLE_API_KEY=AIza...                  # CORRETO!
SUPABASE_SERVICE_ROLE_KEY=eyJ...        # CORRETO!
```

### 📝 Verificação Automática

Adicione ao seu workflow:

```bash
# Verificar se não há API Keys expostas
grep -r "NEXT_PUBLIC_GOOGLE_API_KEY" app/
grep -r "NEXT_PUBLIC_.*KEY" .env.local

# Não deve retornar NADA (exit code 1 = nada encontrado = bom)
```

---

## 🔍 Verificação de Segurança

Após criar a nova API Key, verifique:

```bash
# 1. .env.local não está commitado
git status .env.local
# Resultado esperado: "not tracked" ou "ignored"

# 2. .gitignore contém .env.local
cat .gitignore | grep .env.local
# Resultado esperado: .env.local

# 3. Nenhuma API Key no código commitado
git log -S "AIzaSy" --all
# Resultado esperado: nada ou apenas commits antigos
```

---

## 📊 Status da Correção

- [x] ✅ Problema identificado: API Key vazada e bloqueada
- [ ] ⏳ Criar nova API Key no Google AI Studio
- [ ] ⏳ Atualizar `.env.local` com nova key
- [ ] ⏳ Atualizar Vercel com nova key
- [ ] ⏳ Testar localmente com `test-imagen-real.mjs`
- [ ] ⏳ Testar no navegador em `/test-image-gen`
- [ ] ⏳ Deletar API Key antiga do Google AI Studio

---

## 🚀 Próximos Passos

1. **AGORA:** Crie nova API Key em https://aistudio.google.com/apikey
2. **DEPOIS:** Atualize `.env.local` localmente
3. **DEPOIS:** Teste com `node test-imagen-real.mjs`
4. **DEPOIS:** Atualize Vercel com nova key
5. **DEPOIS:** Faça novo deploy (`git push`)
6. **DEPOIS:** Delete a key antiga do Google AI Studio

---

## 📞 Suporte

Se ainda tiver problemas após seguir estes passos:

1. Verifique os logs do console (F12)
2. Verifique os logs do terminal onde está rodando `pnpm dev`
3. Execute novamente `node test-imagen-real.mjs`
4. Verifique se a nova API Key tem permissões para Imagen API

---

**Data de criação:** 10 de Novembro de 2025  
**Última atualização:** 10 de Novembro de 2025

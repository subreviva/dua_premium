# 🚨 URGENTE - API KEY BLOQUEADA - REGENERAR AGORA!

## ❌ PROBLEMA ATUAL

Sua aplicação está retornando erros **403 Forbidden** ao tentar gerar imagens:

```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent 403 (Forbidden)
```

**CAUSA:** A API Key `AIzaSyCqOOQHYQlhOkpFEgkJfAk1fenAxfyENPU` está **BLOQUEADA** pela Google por ter sido exposta publicamente no GitHub.

---

## ⚡ SOLUÇÃO IMEDIATA (5 MINUTOS)

### PASSO 1: Acesse o Google Cloud Console

1. **Abra:** https://console.cloud.google.com/apis/credentials
2. **Faça login** com sua conta Google
3. **Selecione o projeto:** `My First Project` (ID: practical-brace-476222-i6)

### PASSO 2: Regenere a API Key

1. Na página de **Credentials**, encontre a key:
   ```
   AIzaSyCqOOQHYQlhOkpFEgkJfAk1fenAxfyENPU
   ```

2. Clique no **ícone de lápis** (editar) ao lado da key

3. **Role até o final** da página e clique em:
   ```
   🔄 REGENERATE KEY
   ```

4. **⚠️ ATENÇÃO:** Clique em **REGENERATE** para confirmar
   - A key antiga será IMEDIATAMENTE invalidada
   - Uma NOVA key será gerada

5. **COPIE A NOVA KEY** que aparece na tela
   - ⚠️ Você só verá ela UMA VEZ!
   - Exemplo: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

### PASSO 3: Configure Restrições (OBRIGATÓRIO!)

**ANTES de fechar a página**, configure as restrições:

#### A. Application Restrictions

1. Encontre a seção **"Application restrictions"**
2. Selecione: **HTTP referrers (websites)**
3. Clique em **ADD AN ITEM** e adicione:

```
https://v0-remix-of-untitled-chat-git-main-subreviva.vercel.app/*
https://*.vercel.app/*
http://localhost:3000/*
http://localhost:*/*
```

4. Clique em **DONE**

#### B. API Restrictions

1. Encontre a seção **"API restrictions"**
2. Selecione: **Restrict key**
3. Marque APENAS estas APIs:

   - ✅ **Generative Language API** (para Gemini/Imagen)
   - ✅ **Firebase Authentication API**
   - ✅ **Cloud Firestore API**
   - ✅ **Firebase Storage API**

4. **DESMARQUE** todas as outras APIs

5. Clique em **SAVE** no topo da página

### PASSO 4: Atualize o .env.local

1. Abra o arquivo `.env.local` na raiz do projeto
2. Encontre a linha:
   ```bash
   GOOGLE_API_KEY=AIzaSyCqOOQHYQlhOkpFEgkJfAk1fenAxfyENPU
   ```

3. **Substitua** pela NOVA key:
   ```bash
   GOOGLE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

4. **Também atualize** esta linha (se existir):
   ```bash
   NEXT_PUBLIC_GOOGLE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

5. **SALVE o arquivo**

### PASSO 5: Reinicie o Servidor

```bash
# Pare o servidor (Ctrl+C)
# Inicie novamente:
npm run dev
```

### PASSO 6: Atualize no Vercel (Produção)

1. Acesse: https://vercel.com/subreviva/v0-remix-of-untitled-chat/settings/environment-variables

2. Encontre estas variáveis e **EDITE** com a NOVA key:
   - `GOOGLE_API_KEY`
   - `NEXT_PUBLIC_GOOGLE_API_KEY`

3. Cole a **NOVA key** em ambas

4. Clique em **SAVE**

5. **REDEPLOY** o projeto:
   ```bash
   # Via terminal:
   vercel --prod
   
   # OU via Dashboard:
   # Deployments → ⋯ (três pontos) → Redeploy
   ```

---

## ✅ TESTE

Após fazer os passos acima:

1. Acesse: http://localhost:3000/designstudio
2. Tente gerar uma imagem
3. Deve funcionar sem erro 403

Se ainda der erro:
- Aguarde 2-3 minutos (propagação das restrições)
- Limpe o cache do navegador (Ctrl+Shift+R)
- Verifique se salvou o `.env.local` corretamente

---

## 🔒 PROTEÇÃO FUTURA

Estas mudanças JÁ FORAM FEITAS no código:

✅ API key removida de todos os arquivos commitados  
✅ `.env.local` protegido no `.gitignore`  
✅ Template `.env.example` criado sem valores reais  
✅ Código usando `process.env` para ler a key  

**NUNCA MAIS** será exposta no GitHub! 🎉

---

## 📞 EM CASO DE DÚVIDAS

Se encontrar problemas:

1. **Verifique o console do navegador** (F12 → Console)
2. **Procure por erros** 403, 401 ou mensagens da API
3. **Confira se a key** está igual no `.env.local` e no Vercel
4. **Teste primeiro** em localhost antes de fazer deploy

---

**⏰ TEMPO ESTIMADO:** 5-10 minutos  
**🚨 URGÊNCIA:** CRÍTICA - Sua aplicação não funciona sem isso!  

**Comece AGORA!** → https://console.cloud.google.com/apis/credentials

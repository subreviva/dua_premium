# 🚨 SOLUÇÃO PARA ERRO 403 - RESTRIÇÕES DE API KEY

## ❌ PROBLEMA ATUAL

Erro no navegador:
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent 403 (Forbidden)
```

**CAUSA:** A API key tem **restrições de HTTP Referrer** configuradas no Google Cloud Console que estão bloqueando as requisições vindas do seu domínio.

---

## ✅ SOLUÇÃO RÁPIDA (5 MINUTOS)

### PASSO 1: Acesse o Google Cloud Console

1. **Abra:** https://console.cloud.google.com/apis/credentials
2. **Faça login** com sua conta Google
3. **Selecione o projeto:** `My First Project` ou `dua-ia`

### PASSO 2: Edite a API Key

1. Encontre a key: `AIzaSyD0rzuRYzjNWJ01ZDhaWpNye8MZRfVuRYA`
2. Clique no **ícone de lápis** (editar)

### PASSO 3: Configure HTTP Referrers

Encontre a seção **"Application restrictions"** e configure:

#### Opção A: SEM RESTRIÇÕES (para testar rapidamente)
1. Selecione: **"None"**
2. Clique em **SAVE**
3. Aguarde 1-2 minutos
4. Teste novamente no navegador

#### Opção B: COM RESTRIÇÕES (mais seguro)
1. Selecione: **"HTTP referrers (websites)"**
2. Clique em **ADD AN ITEM**
3. Adicione ESTES domínios:

```
https://*.githubpreview.dev/*
https://*.app.github.dev/*
https://*.preview.app.github.dev/*
https://v0-remix-of-untitled-chat-git-main-subreviva.vercel.app/*
https://*.vercel.app/*
http://localhost:3000/*
http://localhost:*/*
```

4. Clique em **DONE**
5. Clique em **SAVE** no topo da página

### PASSO 4: Verifique APIs Habilitadas

Na seção **"API restrictions"**:

1. Selecione: **"Restrict key"**
2. Marque ESTAS APIs:
   - ✅ **Generative Language API**
   - ✅ **Cloud Storage API** (se usar Firebase Storage)
   - ✅ **Firebase Authentication API** (se usar Firebase Auth)

3. Clique em **SAVE**

---

## 🧪 TESTE APÓS CONFIGURAR

1. **Aguarde 1-2 minutos** (propagação das configurações)

2. **Limpe o cache do navegador:**
   - Chrome/Edge: `Ctrl+Shift+Delete` → Limpar tudo
   - Ou abra em aba anônima

3. **Teste a geração de imagem:**
   - Acesse: seu domínio Codespaces ou localhost
   - Vá em Design Studio
   - Tente gerar uma imagem

4. **Verifique o console do navegador** (F12):
   - Se funcionar: verá status 200
   - Se falhar: verá qual erro específico

---

## 🔍 DIAGNÓSTICO ADICIONAL

Se ainda der erro 403 após configurar:

### Verificar se a API está habilitada:

1. **Acesse:** https://console.cloud.google.com/apis/library
2. **Busque:** "Generative Language API"
3. **Certifique-se** de que está **ENABLED** (verde)
4. Se estiver desabilitada, clique em **ENABLE**

### Verificar quotas:

1. **Acesse:** https://console.cloud.google.com/iam-admin/quotas
2. **Filtre por:** "Generative Language API"
3. **Verifique** se não excedeu os limites

---

## 📋 CHECKLIST

Marque conforme for fazendo:

- [ ] Acessei o Google Cloud Console
- [ ] Editei a API key
- [ ] Configurei HTTP Referrers (adicionei todos os domínios)
- [ ] Salvei as alterações
- [ ] Aguardei 1-2 minutos
- [ ] Limpei cache do navegador
- [ ] Testei no Design Studio
- [ ] ✅ Funcionou!

---

## 🎯 DOMÍNIOS QUE VOCÊ PRECISA ADICIONAR

Copie e cole cada um desses no HTTP referrers:

```
https://*.githubpreview.dev/*
https://*.app.github.dev/*
https://*.preview.app.github.dev/*
https://v0-remix-of-untitled-chat-git-main-subreviva.vercel.app/*
https://*.vercel.app/*
http://localhost:3000/*
http://localhost:*/*
```

---

## ⚡ ATALHO DIRETO

**Link direto para editar credenciais:**
https://console.cloud.google.com/apis/credentials

---

## 📞 SE AINDA NÃO FUNCIONAR

Me mostre:
1. Screenshot da configuração de "Application restrictions"
2. Screenshot da seção "API restrictions"  
3. Erro exato do console do navegador (F12)

---

**⏰ TEMPO ESTIMADO:** 5 minutos  
**🎯 RESULTADO ESPERADO:** Geração de imagens funcionando 100%

# 🔒 ROTAÇÃO IMEDIATA DE API KEY - GOOGLE CLOUD PLATFORM

## ⚠️ SITUAÇÃO CRÍTICA

A API Key `AIzaSyCqOOQHYQlhOkpFEgkJfAk1fenAxfyENPU` foi **COMPROMETIDA** e exposta publicamente no GitHub.

**Data da Detecção:** 9 de Novembro de 2025  
**Projeto Afetado:** My First Project (ID: practical-brace-476222-i6)  
**URL da Exposição:** https://github.com/subreviva/dua_premium/blob/0f61c35bb9b05aab287684dcfa80652450d44a09/setup-firebase-credentials.mjs

---

## 🚨 AÇÕES IMEDIATAS NECESSÁRIAS

### 1️⃣ REGENERAR A API KEY (URGENTE)

1. **Acesse o Google Cloud Console:**
   - URL: https://console.cloud.google.com/
   - Selecione o projeto: `My First Project` (practical-brace-476222-i6)

2. **Navegue até Credenciais:**
   - No menu lateral, vá em: **APIs & Services** → **Credentials**
   - Ou busque por "Credentials" na barra de pesquisa

3. **Localize a API Key comprometida:**
   - Procure pela key: `AIzaSyCqOOQHYQlhOkpFEgkJfAk1fenAxfyENPU`
   - Clique no ícone de **editar (lápis)** ao lado da key

4. **Regenere a Key:**
   - Clique no botão **"REGENERATE KEY"**
   - ⚠️ IMPORTANTE: A key antiga será IMEDIATAMENTE invalidada
   - Copie a NOVA key gerada (você NÃO poderá vê-la novamente)

5. **Salve a nova key de forma segura:**
   ```bash
   # No arquivo .env.local (NÃO commitar!)
   GOOGLE_API_KEY=SUA_NOVA_KEY_AQUI
   ```

---

### 2️⃣ ADICIONAR RESTRIÇÕES À NOVA API KEY (OBRIGATÓRIO)

#### A. Restrições de Aplicação

1. No editor da API Key, vá até **"Application restrictions"**
2. Selecione: **"HTTP referrers (websites)"**
3. Adicione os domínios permitidos:
   ```
   https://seu-dominio-producao.com/*
   https://seu-dominio-vercel.app/*
   http://localhost:3000/*
   ```

#### B. Restrições de API

1. Na seção **"API restrictions"**, selecione: **"Restrict key"**
2. Marque APENAS as APIs que você realmente usa:
   - ✅ **Firebase Authentication API**
   - ✅ **Cloud Firestore API**
   - ✅ **Firebase Storage API**
   - ✅ **Generative Language API** (Gemini)
   - ❌ **Desmarque todas as outras APIs**

3. Clique em **"SAVE"**

---

### 3️⃣ AUDITAR USO DA API KEY ANTIGA

1. **Verifique atividade suspeita:**
   - Acesse: **APIs & Services** → **Dashboard**
   - Verifique chamadas de API nos últimos 7 dias
   - Procure por:
     - Picos de uso anormais
     - Chamadas de IPs/países desconhecidos
     - APIs que você não usa sendo chamadas

2. **Revise Billing:**
   - Acesse: **Billing** → **Reports**
   - Verifique custos inesperados
   - Configure alertas de billing se necessário

---

## 📋 CHECKLIST DE SEGURANÇA

Marque cada item conforme concluído:

- [ ] **API Key regenerada** no Google Cloud Console
- [ ] **Nova key salva** no arquivo `.env.local`
- [ ] **Restrições de HTTP referrers** configuradas
- [ ] **Restrições de API** configuradas (apenas APIs necessárias)
- [ ] **Auditoria de uso** realizada (últimos 7 dias)
- [ ] **Billing verificado** sem cobranças suspeitas
- [ ] **Aplicação testada** com a nova key
- [ ] **Documentação antiga** removida do repositório (já feito ✅)

---

## 🔐 CONFIGURAÇÃO LOCAL

Após regenerar a key, configure-a localmente:

```bash
# 1. Edite o arquivo .env.local na raiz do projeto
nano .env.local

# 2. Adicione/atualize a variável:
GOOGLE_API_KEY=SUA_NOVA_KEY_REGENERADA_AQUI

# 3. Verifique que o .env.local NÃO está sendo rastreado pelo git:
git status
# Deve estar listado em "Untracked files" ou não aparecer

# 4. Teste a aplicação:
npm run dev
```

---

## ⚡ VARIÁVEIS DE AMBIENTE NECESSÁRIAS

Certifique-se de que seu `.env.local` contém:

```bash
# Google Cloud Platform
GOOGLE_API_KEY=sua-nova-key-regenerada
GOOGLE_GEMINI_API_KEY=sua-gemini-key

# Firebase (geradas automaticamente pelo setup-firebase-credentials.mjs)
NEXT_PUBLIC_FIREBASE_API_KEY=gerada-automaticamente
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu-projeto-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-projeto.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abc123
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## 🎯 DEPLOY EM PRODUÇÃO (Vercel)

Após regenerar a key, atualize no Vercel:

```bash
# Via CLI do Vercel:
vercel env add GOOGLE_API_KEY production
# Cole a NOVA key quando solicitado

# Ou via Dashboard:
# 1. Acesse: https://vercel.com/seu-projeto/settings/environment-variables
# 2. Edite GOOGLE_API_KEY
# 3. Cole a nova key
# 4. Salve e faça redeploy
```

---

## 📚 MELHORES PRÁTICAS IMPLEMENTADAS

✅ **API Keys em variáveis de ambiente** (process.env)  
✅ **Arquivo .env.local no .gitignore**  
✅ **Template .env.example** sem valores reais  
✅ **Validação de keys** no código (verifica se existe antes de usar)  
✅ **Documentação limpa** (sem fragmentos de keys)  

---

## 🔗 LINKS ÚTEIS

- **Google Cloud Console:** https://console.cloud.google.com/
- **Credentials:** https://console.cloud.google.com/apis/credentials
- **API Dashboard:** https://console.cloud.google.com/apis/dashboard
- **Billing:** https://console.cloud.google.com/billing
- **Security Best Practices:** https://cloud.google.com/docs/security/best-practices

---

## 📞 SUPORTE

Se encontrar problemas após regenerar a key:

1. Verifique se a nova key está no `.env.local`
2. Reinicie o servidor de desenvolvimento (`npm run dev`)
3. Limpe cache do Next.js: `rm -rf .next`
4. Verifique logs do Google Cloud Console para erros de autenticação

---

**⏰ PRAZO:** Esta rotação deve ser feita **IMEDIATAMENTE** para evitar uso não autorizado da API key comprometida.

**✅ STATUS:** As alterações de código já foram feitas. Falta apenas regenerar a key no Google Cloud Console.

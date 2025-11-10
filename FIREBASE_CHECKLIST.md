# ✅ CHECKLIST: CONFIGURAR PROTEÇÕES FIREBASE

## 📋 TAREFAS (Marque com [x] quando completar)

### 🔐 PASSO 1: HTTP Referrer Restrictions (5 min)

- [ ] **1.1** Abrir: https://console.cloud.google.com/apis/credentials
- [ ] **1.2** Login com sua conta Google
- [ ] **1.3** Selecionar projeto: **dua-ia**
- [ ] **1.4** Procurar API Key: `AIzaSyD0rzuRYzjNWJ01ZDhaWpNye8MZRfVuRYA`
- [ ] **1.5** Clicar no ícone de editar (✏️) ao lado da key
- [ ] **1.6** Em "Application restrictions" → Selecionar **"HTTP referrers (web sites)"**
- [ ] **1.7** Clicar em **"ADD AN ITEM"**
- [ ] **1.8** Adicionar cada domínio (um por vez):
  ```
  https://*.vercel.app/*
  https://*.github.dev/*
  https://nasty-spooky-phantom-4j656gxvrgprhj4jx-3000.app.github.dev/*
  ```
- [ ] **1.9** Clicar em **"SAVE"**
- [ ] **1.10** Aguardar 2-5 minutos (propagação das mudanças)

**✅ Como saber se funcionou:**
- Verá mensagem de sucesso
- Restrições aparecem na lista da API key

---

### 🔥 PASSO 2: Firebase Security Rules (5 min)

- [ ] **2.1** Abrir: https://console.firebase.google.com
- [ ] **2.2** Login com sua conta Google
- [ ] **2.3** Selecionar projeto: **dua-ia**
- [ ] **2.4** Menu lateral → **Storage**
- [ ] **2.5** Aba **"Rules"** (no topo)
- [ ] **2.6** Copiar conteúdo do arquivo `storage.rules` deste projeto
- [ ] **2.7** Colar no editor de regras do Firebase Console
- [ ] **2.8** Clicar em **"Publish"**
- [ ] **2.9** Confirmar publicação

**✅ Como saber se funcionou:**
- Verá mensagem: "Rules published successfully"
- Data de última publicação atualizada

**📄 Conteúdo do storage.rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /community/{fileName} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.resource.size < 10 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
    
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null 
                         && request.auth.uid == userId
                         && request.resource.size < 10 * 1024 * 1024;
    }
    
    match /avatars/{userId} {
      allow read: if true;
      allow write: if request.auth != null 
                   && request.auth.uid == userId
                   && request.resource.size < 2 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
    
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

---

### 📊 PASSO 3: Configurar Alertas (OPCIONAL - 5 min)

- [ ] **3.1** No Firebase Console → **Usage and billing**
- [ ] **3.2** Clicar em **"Details & settings"**
- [ ] **3.3** Aba **"Quotas"**
- [ ] **3.4** Configurar limites:
  - Download diário: Alerta se > 10GB
  - Upload diário: Alerta se > 1GB
  - Operações: Alerta se > 100k/dia
- [ ] **3.5** Ativar notificações por email
- [ ] **3.6** Salvar configurações

---

### 🧪 PASSO 4: Testar Proteções (2 min)

- [ ] **4.1** Abrir seu site (Vercel ou Codespaces)
- [ ] **4.2** Ir para área de upload de imagem
- [ ] **4.3** Tentar fazer upload de uma imagem
- [ ] **4.4** Verificar se funciona ✅

**✅ Como saber se funcionou:**
- Upload bem-sucedido do seu domínio
- DevTools não mostra erros de CORS/Referrer

---

## 📊 RESUMO DO QUE VOCÊ FEZ

Quando completar tudo acima, você terá:

✅ **HTTP Referrer Restrictions:**
- Apenas seus domínios podem usar a Firebase API key
- Outros sites = bloqueados (403 Forbidden)

✅ **Firebase Security Rules:**
- Apenas usuários autenticados podem fazer upload
- Máximo 10MB por arquivo
- Apenas imagens permitidas
- Usuários só acessam seus próprios arquivos

✅ **Monitoramento (Opcional):**
- Alertas se houver uso anormal
- Proteção contra abuse/custos inesperados

---

## ❓ PROBLEMAS COMUNS

### "Não encontro a API Key no Google Cloud Console"
**Solução:**
1. Verifique se está no projeto correto: **dua-ia**
2. Vá em: APIs & Services → Credentials
3. Procure por chaves criadas recentemente
4. Ou procure por: `AIzaSyD0rzuRYzjNWJ01ZDhaWpNye8MZRfVuRYA`

### "Erro 403 após configurar Referrer"
**Solução:**
- Aguarde 5-10 minutos (propagação)
- Verifique se adicionou `/*` no final do domínio
- Verifique se incluiu `https://` no início

### "Security Rules não salvam"
**Solução:**
- Verifique sintaxe (copie exatamente do arquivo)
- Verifique se há erros no editor
- Tente fazer logout/login do Firebase Console

---

## 🎉 QUANDO TERMINAR

**Me avise aqui que eu vou:**
1. ✅ Verificar se está tudo configurado
2. ✅ Fazer testes de segurança
3. ✅ Criar documentação final
4. ✅ Marcar como "100% SEGURO"

---

## 📝 NOTAS

**Tempo total estimado:** 15-20 minutos

**Nível de dificuldade:** ⭐⭐ (Fácil - apenas clicar e colar)

**Impacto:** 🔒 Alta segurança (proteção contra abuse e custos)

---

**Está pronto para começar?** 🚀

Siga os passos acima e me avise quando terminar ou se tiver alguma dúvida!

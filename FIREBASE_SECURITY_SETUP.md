# 🔥 GUIA: CONFIGURAR PROTEÇÕES FIREBASE

## 📋 CHECKLIST DE PROTEÇÕES

### ✅ 1. HTTP Referrer Restrictions (Google Cloud Console)
### ✅ 2. Firebase Security Rules
### ✅ 3. Monitoramento e Alertas

---

## 🔐 1. HTTP REFERRER RESTRICTIONS

### O que faz:
Permite que APENAS seus domínios usem a API key. Se alguém copiar a key e tentar usar em outro site, será bloqueado.

### Como Configurar:

#### Passo 1: Acessar Google Cloud Console
```
🌐 URL: https://console.cloud.google.com/apis/credentials
```

#### Passo 2: Encontrar a API Key
1. Procure por: `AIzaSyD0rzuRYzjNWJ01ZDhaWpNye8MZRfVuRYA`
2. Ou procure pela key do Firebase
3. Clique no ícone de editar (✏️)

#### Passo 3: Configurar Application Restrictions
1. Em "Application restrictions"
2. Selecione: **"HTTP referrers (web sites)"**
3. Clique em "ADD AN ITEM"

#### Passo 4: Adicionar seus domínios
Adicione cada linha abaixo (uma de cada vez):

```
https://*.vercel.app/*
https://*.github.dev/*
https://nasty-spooky-phantom-4j656gxvrgprhj4jx-3000.app.github.dev/*
```

Se você tiver domínio próprio, adicione também:
```
https://seu-dominio.com/*
https://*.seu-dominio.com/*
```

#### Passo 5: Salvar
Clique em "SAVE" no final da página.

**⏱️ Atenção:** Pode levar alguns minutos para as mudanças serem aplicadas.

---

## 🔥 2. FIREBASE SECURITY RULES

### O que faz:
Controla quem pode fazer upload/download de arquivos no Firebase Storage.

### Regras Recomendadas:

#### Para Firebase Storage:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Pasta pública da comunidade
    match /community/{fileName} {
      // Qualquer um pode ler
      allow read: if true;
      
      // Apenas usuários autenticados podem fazer upload
      allow write: if request.auth != null
                   && request.resource.size < 10 * 1024 * 1024  // Max 10MB
                   && request.resource.contentType.matches('image/.*');  // Só imagens
    }
    
    // Pasta privada de usuários
    match /users/{userId}/{fileName} {
      // Apenas o dono pode ler/escrever
      allow read, write: if request.auth != null 
                         && request.auth.uid == userId
                         && request.resource.size < 10 * 1024 * 1024;
    }
    
    // Bloquear tudo que não foi explicitamente permitido
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

### Como Aplicar:

#### Opção A: Firebase Console (Manual)
1. Acesse: https://console.firebase.google.com
2. Selecione projeto: **dua-ia**
3. Menu lateral → **Storage**
4. Aba **Rules**
5. Cole as regras acima
6. Clique em **"Publish"**

#### Opção B: Arquivo Local (Automático)
```bash
# Criar arquivo storage.rules
cat > storage.rules << 'EOF'
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /community/{fileName} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.resource.size < 10 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
    
    match /users/{userId}/{fileName} {
      allow read, write: if request.auth != null 
                         && request.auth.uid == userId
                         && request.resource.size < 10 * 1024 * 1024;
    }
    
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
EOF

# Deploy (requer Firebase CLI instalado)
firebase deploy --only storage:rules
```

---

## 📊 3. MONITORAMENTO E ALERTAS

### Firebase Console - Configurar Quotas

1. Acesse: https://console.firebase.google.com
2. Projeto: **dua-ia**
3. Menu lateral → **Usage and billing**

### Configurar Alertas:

#### Storage Alerts:
- **Download diário:** Alerta se > 10GB/dia
- **Upload diário:** Alerta se > 1GB/dia
- **Operações:** Alerta se > 100k operações/dia

#### Como Configurar:
1. Em "Usage and billing"
2. Clique em "Details & settings"
3. Aba "Quotas"
4. Configure limites personalizados
5. Ative notificações por email

---

## ✅ VERIFICAÇÃO

### Testar se está protegido:

```bash
# Teste 1: Tentar usar a key de outro domínio (deve falhar)
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models" \
  -H "Content-Type: application/json" \
  -H "x-goog-api-key: AIzaSyD0rzuRYzjNWJ01ZDhaWpNye8MZRfVuRYA" \
  -H "Referer: https://site-nao-autorizado.com"

# Esperado: Erro 403 Forbidden
```

```bash
# Teste 2: Do seu domínio (deve funcionar)
# Abrir seu site e testar upload de imagem
# Esperado: Upload com sucesso
```

---

## 📝 ADICIONAR COMENTÁRIOS NO CÓDIGO

Vou atualizar o código para documentar que a key é pública de forma segura:

```typescript
// lib/firebase.ts

// ✅ SEGURANÇA - FIREBASE API KEY
// Esta API key pode ser pública porque:
// 1. Firebase foi projetado para client-side (navegador)
// 2. Segurança REAL está em Firebase Security Rules (server-side)
// 3. HTTP Referrer Restrictions limitam domínios autorizados
// 4. Quotas e alertas configurados para detectar abuse
//
// Proteções configuradas:
// - HTTP Referrer: *.vercel.app/*, *.github.dev/*
// - Storage Rules: Upload apenas para usuários autenticados
// - Limite de tamanho: 10MB por arquivo
// - Apenas imagens permitidas
//
// Mesma abordagem usada por Supabase (NEXT_PUBLIC_SUPABASE_ANON_KEY)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  // ...
};
```

---

## 🎯 RESUMO DO QUE FAZER

### Ações Obrigatórias:
1. ✅ Configurar HTTP Referrer Restrictions (Google Cloud Console)
2. ✅ Configurar Firebase Security Rules (Firebase Console)

### Ações Recomendadas:
3. ✅ Configurar alertas de quota
4. ✅ Adicionar comentários no código
5. ✅ Testar proteções

### Tempo Estimado:
- **HTTP Referrer:** 5 minutos
- **Security Rules:** 5 minutos
- **Alertas:** 5 minutos
- **Total:** ~15 minutos

---

## 🚀 PRÓXIMOS PASSOS

**AGORA:**
1. Abra Google Cloud Console (link acima)
2. Configure HTTP Referrer Restrictions
3. Abra Firebase Console (link acima)
4. Configure Security Rules

**DEPOIS:**
Eu vou:
- Adicionar comentários de documentação no código
- Criar arquivo `storage.rules` local
- Atualizar `.env.example` com instruções

---

## ❓ PERGUNTAS FREQUENTES

**Q: E se eu mudar de domínio?**
A: Adicione o novo domínio no HTTP Referrer Restrictions.

**Q: Isso deixa a key 100% segura?**
A: Sim, para os padrões do Firebase. A segurança real está nas Rules, não na key.

**Q: É o mesmo que Supabase?**
A: Exatamente! Supabase usa `NEXT_PUBLIC_SUPABASE_ANON_KEY` (pública) + RLS (proteção).

**Q: Alguém pode copiar minha key?**
A: Sim, mas não conseguirá usar (HTTP Referrer bloqueia). E mesmo que usasse, Security Rules impedem upload/download não autorizado.

---

**Quando terminar de configurar, me avise que vou atualizar o código com a documentação!** 🔥

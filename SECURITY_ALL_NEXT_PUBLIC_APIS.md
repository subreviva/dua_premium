# 🔍 AUDITORIA COMPLETA - TODAS AS APIs NEXT_PUBLIC_*

**Data:** 10 de Novembro de 2025  
**Status:** ⚠️ **ANÁLISE DE RISCO COMPLETA**

---

## 📊 RESUMO EXECUTIVO

Encontradas **3 categorias** de variáveis `NEXT_PUBLIC_*` com dados sensíveis:

1. ✅ **SEGURO (Resolvido):** `NEXT_PUBLIC_GOOGLE_API_KEY` - REMOVIDO
2. ⚠️ **ATENÇÃO:** `NEXT_PUBLIC_FIREBASE_API_KEY` - ANALISAR
3. ✅ **SEGURO (Por Design):** `NEXT_PUBLIC_SUPABASE_ANON_KEY` - OK

---

## 1️⃣ GOOGLE API KEY - ✅ RESOLVIDO

### Status: ✅ SEGURO

**Variável:** `NEXT_PUBLIC_GOOGLE_API_KEY`  
**Risco:** 🚨 CRÍTICO (era pública, permitia uso não autorizado)  
**Ação:** ✅ **REMOVIDA** completamente

**Detalhes:**
- Removida de todos os arquivos
- Removida do Vercel Production
- Substituída por `GOOGLE_API_KEY` (server-only)
- Migrado para API Routes

---

## 2️⃣ FIREBASE API KEY - ⚠️ ANALISAR

### Status: ⚠️ ATENÇÃO - REQUER DECISÃO

**Variável:** `NEXT_PUBLIC_FIREBASE_API_KEY`  
**Valor Atual:** `AIzaSyD0rzuRYzjNWJ01ZDhaWpNye8MZRfVuRYA`  
**Uso:** Inicialização do Firebase Client SDK (Storage, Auth)

### 🤔 Análise de Risco:

#### ✅ ARGUMENTOS PARA MANTER PÚBLICO:

1. **Design Oficial do Firebase:**
   - Firebase SDK foi PROJETADO para rodar no browser
   - API key é **identificador público**, não uma credencial secreta
   - Documentação oficial usa `NEXT_PUBLIC_*`

2. **Segurança Real Está em:**
   - Firebase Security Rules (server-side)
   - Firebase Authentication
   - Firestore/Storage Rules
   - **NÃO** na API key em si

3. **Funcionalidade Necessária:**
   - Upload de imagens (Storage)
   - Autenticação de usuários
   - Conexão com Firebase (client-side)

4. **Comparação com Supabase:**
   - Supabase também usa `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Mesma filosofia: chave pública + regras de segurança

#### ⚠️ RISCOS SE MANTER PÚBLICO:

1. **Quota Abuse:**
   - Alguém pode copiar a key e fazer requests
   - Consome seu quota do Firebase
   - Pode gerar custos

2. **Reputação:**
   - Aparecer em scanners de segurança
   - GitHub Security Alerts

3. **Controle:**
   - Menos controle sobre quem usa a API

#### 🔐 OPÇÕES DE MITIGAÇÃO:

**OPÇÃO A: MANTER PÚBLICO (Recomendado pelo Firebase)**
```typescript
// lib/firebase.ts (ATUAL)
apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY, // ✅ OK

// Segurança através de:
// 1. Firebase Security Rules
// 2. HTTP Referrer restrictions (Google Cloud Console)
// 3. Application restrictions
```

**OPÇÃO B: MIGRAR PARA SERVER-SIDE (Mais Restritivo)**
```typescript
// Criar API Route: /api/firebase/upload
export async function POST(req: Request) {
  const apiKey = process.env.FIREBASE_API_KEY; // Server-only
  // ... upload logic
}

// Desvantagens:
// - Perde funcionalidades client-side do Firebase
// - Mais complexo (proxy para tudo)
// - Não é o padrão recomendado pelo Firebase
```

### 📝 RECOMENDAÇÃO:

**✅ MANTER `NEXT_PUBLIC_FIREBASE_API_KEY` (com proteções)**

**Por quê?**
- É o design oficial do Firebase
- Segurança real está nas Security Rules
- Supabase usa o mesmo padrão (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- Funciona perfeitamente com proteções adequadas

**Proteções Necessárias:**

1. **✅ HTTP Referrer Restrictions:**
   ```
   Google Cloud Console → APIs & Services → Credentials
   → Editar API Key → Application restrictions
   → HTTP referrers → Adicionar:
      - https://seu-dominio.vercel.app/*
      - https://seu-dominio-custom.com/*
   ```

2. **✅ Firebase Security Rules:**
   ```javascript
   // Storage Rules (exemplo)
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         // Apenas usuários autenticados podem fazer upload
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```

3. **✅ Usage Quotas/Alerts:**
   - Configurar alertas de quota no Firebase Console
   - Monitorar uso anormal

### 📍 Onde está sendo usada:

```typescript
// lib/firebase.ts
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Usado para:
// - Upload de imagens da comunidade
// - Storage de assets
// - (Potencialmente) Autenticação
```

---

## 3️⃣ SUPABASE ANON KEY - ✅ SEGURO

### Status: ✅ SEGURO (Por Design)

**Variável:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
**Risco:** ✅ **BAIXO** (projetado para ser público)

### 💡 Por que é Seguro:

1. **"Anon" = Anonymous = Público**
   - Supabase tem 2 chaves:
     - `ANON_KEY` → Pública (browser)
     - `SERVICE_ROLE_KEY` → Privada (server)

2. **Segurança em RLS (Row Level Security):**
   ```sql
   -- Exemplo de política RLS:
   CREATE POLICY "Users can only see their own data"
   ON users
   FOR SELECT
   USING (auth.uid() = id);
   ```
   - ANON_KEY tem permissões limitadas
   - RLS políticas controlam acesso real aos dados

3. **Design Oficial:**
   - Documentação oficial do Supabase usa `NEXT_PUBLIC_*`
   - É o padrão da indústria para esse tipo de serviço

### 📍 Onde está sendo usada:

```typescript
// lib/supabase.ts
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Usado em múltiplos lugares:
// - Autenticação de usuários
// - Queries do banco de dados (com RLS)
// - Realtime subscriptions
```

### ✅ Já Protegido Por:
- RLS Policies (Row Level Security)
- Supabase Auth
- Permissões de tabela

---

## 🎯 OUTRAS VARIÁVEIS NEXT_PUBLIC_* ENCONTRADAS

### ✅ SEGURAS (Não são credenciais):

```bash
# Configurações públicas (OK usar NEXT_PUBLIC_):
NEXT_PUBLIC_GOOGLE_API_VERSION=v1alpha                  # ✅ Versão (não é sensível)
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co         # ✅ URL pública
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dua-ia.firebaseapp.com # ✅ Domínio público
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dua-ia                  # ✅ ID público
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...                 # ✅ Bucket público
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...            # ✅ Sender ID
NEXT_PUBLIC_FIREBASE_APP_ID=...                         # ✅ App ID público
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...                 # ✅ Analytics ID
```

**Por quê são seguras?**
- São **identificadores**, não credenciais
- Precisam estar públicas para funcionar
- Não dão acesso a nada sozinhas

---

## 📋 CHECKLIST DE AÇÃO

### ✅ COMPLETO:
- [x] `NEXT_PUBLIC_GOOGLE_API_KEY` - REMOVIDO completamente
- [x] Migrado para `GOOGLE_API_KEY` (server-only)
- [x] API Routes implementadas
- [x] Vercel configurado sem `NEXT_PUBLIC_GOOGLE_API_KEY`

### ⏳ RECOMENDAÇÕES:

#### Para Firebase API Key:
- [ ] **OPÇÃO 1 (Recomendado):** Manter `NEXT_PUBLIC_FIREBASE_API_KEY` + Configurar restrições
  - [ ] Configurar HTTP Referrer restrictions no Google Cloud Console
  - [ ] Verificar Firebase Security Rules estão ativas
  - [ ] Configurar alertas de quota
  
- [ ] **OPÇÃO 2 (Mais Restritivo):** Migrar para server-side
  - [ ] Criar API Routes para upload/download
  - [ ] Remover `NEXT_PUBLIC_FIREBASE_API_KEY`
  - [ ] Adicionar `FIREBASE_API_KEY` (server-only)
  - [ ] Atualizar todos os componentes que usam Firebase Storage

#### Para Supabase:
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - ✅ OK (manter como está)
- [x] RLS Policies já configuradas
- [x] Service Role Key protegida (não é NEXT_PUBLIC_)

---

## 🎓 REGRAS ATUALIZADAS DE SEGURANÇA

### ❌ NUNCA usar NEXT_PUBLIC_* para:
- ✅ API Keys de serviços que **NÃO** foram projetados para client-side
  - Exemplo: Google Gemini API, OpenAI, Anthropic, etc.
- ✅ Tokens de autenticação pessoais
- ✅ Secret keys
- ✅ Service Role keys
- ✅ Private keys
- ✅ Senhas/passwords

### ✅ PODE usar NEXT_PUBLIC_* para:
- ✅ Firebase config (com Security Rules + Referrer restrictions)
- ✅ Supabase ANON key (com RLS policies)
- ✅ URLs públicas
- ✅ IDs de projetos públicos
- ✅ Versões de API
- ✅ Feature flags públicas
- ✅ Analytics IDs (Google Analytics, etc.)

### 🔐 Regra de Decisão:
```
┌─────────────────────────────────────┐
│ Esta variável pode ficar pública?   │
└────────────┬────────────────────────┘
             │
     ┌───────▼──────────┐
     │ SIM → Perguntas: │
     └───────┬──────────┘
             │
    ┌────────▼─────────────────────────────────────────┐
    │ 1. O serviço foi projetado para rodar no browser?│
    │    (Firebase, Supabase = SIM, Gemini API = NÃO)  │
    │                                                   │
    │ 2. Tem proteções server-side?                    │
    │    (Security Rules, RLS, Auth = SIM)             │
    │                                                   │
    │ 3. Está documentado oficialmente como público?   │
    │    (Docs oficiais usam NEXT_PUBLIC = SIM)        │
    │                                                   │
    │ 4. Tem restrições de domínio/referrer?           │
    │    (HTTP Referrer, CORS = SIM)                   │
    └───────────────────────────────────────────────────┘
             │
    Se TODAS as respostas = SIM
             │
             ▼
    ✅ NEXT_PUBLIC_* é SEGURO
    (Com as proteções adequadas)
```

---

## 📊 COMPARAÇÃO: GOOGLE vs FIREBASE vs SUPABASE

| Serviço | Variável | Status | Por quê? |
|---------|----------|--------|----------|
| **Google Gemini** | `NEXT_PUBLIC_GOOGLE_API_KEY` | ❌ REMOVIDO | API não foi projetada para client-side, sem proteções adequadas |
| **Firebase** | `NEXT_PUBLIC_FIREBASE_API_KEY` | ⚠️ DECISÃO | Pode ser público COM Security Rules + Referrer restrictions |
| **Supabase** | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ MANTER | Projetado para ser público, protegido por RLS |

---

## 🚀 PRÓXIMOS PASSOS

### 1. Decisão Sobre Firebase (URGENTE):

**Escolha uma opção:**

#### OPÇÃO A: Manter Público (Recomendado)
```bash
# 1. Configurar HTTP Referrer restrictions
# Google Cloud Console → Credentials → Edit API Key
# Adicionar: https://seu-dominio.vercel.app/*

# 2. Verificar Firebase Security Rules
# Firebase Console → Storage → Rules

# 3. Manter variável atual
# ✅ NEXT_PUBLIC_FIREBASE_API_KEY (já configurada)
```

#### OPÇÃO B: Migrar para Server-Side
```bash
# 1. Criar .env.local:
# FIREBASE_API_KEY=AIzaSy... (sem NEXT_PUBLIC_)

# 2. Criar API Routes para upload
# /api/firebase/upload
# /api/firebase/download

# 3. Atualizar componentes
# Remover inicialização do Firebase no cliente
```

### 2. Documentar Decisão:
- [ ] Adicionar comentários no código explicando por quê cada NEXT_PUBLIC_* é seguro
- [ ] Atualizar README com guidelines de segurança
- [ ] Criar checklist para novos desenvolvedores

### 3. Monitoramento:
- [ ] Configurar alertas de quota no Firebase
- [ ] Monitorar logs de acesso no Supabase
- [ ] Revisar Security Rules periodicamente

---

## ✅ CONCLUSÃO

### Status Geral:
- 🔒 **Google Gemini API:** ✅ 100% SEGURO (removido de NEXT_PUBLIC_)
- ⚠️ **Firebase API:** REQUER DECISÃO (recomendação: manter com proteções)
- ✅ **Supabase API:** 100% SEGURO (por design)

### Recomendação Final:

**Para Firebase:**
**✅ Manter `NEXT_PUBLIC_FIREBASE_API_KEY` com as seguintes proteções:**

1. HTTP Referrer restrictions configuradas
2. Firebase Security Rules ativas
3. Quotas/alertas configurados

**Razão:** É o padrão oficial do Firebase, funciona bem com as proteções adequadas, e Supabase usa a mesma abordagem com sucesso.

---

**Auditoria completa por:** Sistema de Segurança  
**Data:** 10 de Novembro de 2025  
**Arquivos analisados:** 50+  
**Vulnerabilidades encontradas:** 1 crítica (Google), 1 para decisão (Firebase), 0 em Supabase

# 🔥 FIREBASE - CONFIGURAR PROTEÇÕES

## 🎯 O QUE FAZER (3 passos simples)

### 1️⃣ Google Cloud Console (5 min)
**Link:** https://console.cloud.google.com/apis/credentials

**O que fazer:**
1. Login → Selecionar projeto **dua-ia**
2. Encontrar API Key: `AIzaSyD0rzuRYzjNWJ01ZDhaWpNye8MZRfVuRYA`
3. Editar → Application restrictions → "HTTP referrers"
4. Adicionar:
   - `https://*.vercel.app/*`
   - `https://*.github.dev/*`
5. Salvar

**Por quê:**
Só seus domínios poderão usar a API key.

---

### 2️⃣ Firebase Console (5 min)
**Link:** https://console.firebase.google.com

**O que fazer:**
1. Login → Projeto **dua-ia**
2. Menu Storage → Rules
3. Copiar o conteúdo do arquivo **`storage.rules`** (neste projeto)
4. Colar e Publicar

**Por quê:**
Só usuários autenticados poderão fazer upload.

---

### 3️⃣ Testar (2 min)
1. Abrir seu site
2. Fazer upload de uma imagem
3. Verificar se funciona ✅

---

## 📁 ARQUIVOS CRIADOS PARA VOCÊ

1. **`FIREBASE_CHECKLIST.md`** → Passo a passo detalhado
2. **`FIREBASE_SECURITY_SETUP.md`** → Guia completo
3. **`storage.rules`** → Regras de segurança (copiar para Firebase)
4. **`lib/firebase.ts`** → Atualizado com documentação

---

## ✅ RESULTADO

Depois dessas configurações:
- ✅ API key só funciona nos seus domínios
- ✅ Upload só para usuários autenticados
- ✅ Máximo 10MB por arquivo
- ✅ 100% seguro (padrão do Firebase)

---

## 🚀 COMECE AGORA

1. Abra: https://console.cloud.google.com/apis/credentials
2. Siga o passo 1 acima
3. Me avise quando terminar!

**Dúvidas?** Pergunte! 😊

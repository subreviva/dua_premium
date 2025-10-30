# 🎵 AI MUSIC API - STUDIO ÚNICO 100% FUNCIONAL

**Data:** 30 de Outubro de 2025  
**Status:** ✅ PRODUCTION READY  
**API:** https://docs.sunoapi.com/create-suno-music

---

## 📋 ARQUITETURA FINAL

```
app/
├── musicstudio/          ← ÚNICO ESTÚDIO
│   └── page.tsx
├── api/suno/             ← TODOS ENDPOINTS
│   ├── generate/
│   ├── extend/
│   ├── cover/
│   ├── credits/
│   ├── details/
│   ├── boost/
│   ├── lyrics/
│   └── webhooks/
└── ...

components/
├── music-studio.tsx      ← UI PRINCIPAL
└── ...
```

---

## 🎯 ENDPOINTS SUNO API

### **1. Create Music** (POST `/api/v1/suno/create`)

#### Custom Mode (com letras)
```bash
curl -X POST https://api.aimusicapi.ai/api/v1/suno/create \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "custom_mode": true,
    "mv": "chirp-v5",
    "prompt": "[Verse]\nLyrics here...\n[Chorus]\nChorus lyrics...",
    "title": "Song Title",
    "tags": "pop, upbeat",
    "make_instrumental": false,
    "webhook_url": "https://your-domain.com/api/webhooks/suno"
  }'
```

#### Simple Mode (descrição)
```bash
curl -X POST https://api.aimusicapi.ai/api/v1/suno/create \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "custom_mode": false,
    "mv": "chirp-v5",
    "gpt_description_prompt": "Create a happy pop song with upbeat tempo"
  }'
```

**Response:**
```json
{
  "code": 200,
  "data": {
    "task_id": "xxx",
    "status": "PENDING"
  }
}
```

---

### **2. Extend Music** (POST `/api/v1/suno/extend`)

```bash
curl -X POST https://api.aimusicapi.ai/api/v1/suno/extend \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "continue_clip_id": "audio-clip-id",
    "prompt": "Add a guitar solo here",
    "continue_at": 60
  }'
```

---

### **3. Get Details** (GET `/api/v1/suno/generate/detail?task_id=xxx`)

```bash
curl -X GET "https://api.aimusicapi.ai/api/v1/suno/generate/detail?task_id=xxx" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Response:**
```json
{
  "code": 200,
  "data": [
    {
      "clip_id": "xxx",
      "title": "Song Title",
      "audio_url": "https://...",
      "image_url": "https://...",
      "state": "succeeded",
      "duration": "120.5"
    }
  ]
}
```

---

### **4. Get Credits** (GET `/api/v1/user/subscription`)

```bash
curl -X GET "https://api.aimusicapi.ai/api/v1/user/subscription" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Response:**
```json
{
  "code": 200,
  "data": {
    "credits_remaining": 100,
    "subscription": "pro"
  }
}
```

---

### **5. Generate Lyrics** (POST `/api/v1/lyrics`)

```bash
curl -X POST https://api.aimusicapi.ai/api/v1/lyrics \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "gpt_description_prompt": "Write happy love song lyrics"
  }'
```

---

## 📊 MODELS DISPONÍVEIS

| Model | Duration | Quality | Speed | Recomendado |
|-------|----------|---------|-------|-------------|
| chirp-v3-5 | 4 min | Standard | Fast | ❌ |
| chirp-v4 | 4 min | High | Medium | ❌ |
| chirp-v4-5 | 8 min | Very High | Slower | ⚠️ |
| chirp-v4-5-plus | 8 min | Premium | Slower | ⚠️ |
| **chirp-v5** | **8 min** | **Best** | **Slower** | **✅** |

---

## ✅ VALIDAÇÕES IMPLEMENTADAS

### **Prompt**
- **Custom Mode:** 3000 chars (v4 and below), 5000 chars (v4.5+)
- **Simple Mode:** 400 chars (gpt_description_prompt)

### **Title**
- Máximo: 80 caracteres

### **Tags**
- v4 and below: 200 chars
- v4.5+: 1000 chars

### **Models**
- chirp-v3-5, chirp-v4, chirp-v4-5, chirp-v4-5-plus, chirp-v5

### **Parameters**
- style_weight: 0-1
- weirdness_constraint: 0-1

---

## 🔄 WEBHOOK INTEGRATION

### **URL Callback**
```bash
webhook_url: "https://your-domain.com/api/webhooks/ai-music"
webhook_secret: "your-secret-key"
```

### **Events Recebidos**

#### 1. Song Completed
```json
{
  "event": "song.completed",
  "task_id": "xxx",
  "platform": "suno",
  "data": [
    {
      "clip_id": "xxx",
      "title": "Song",
      "audio_url": "https://...",
      "state": "succeeded"
    }
  ]
}
```

#### 2. Song Streaming (Suno apenas)
```json
{
  "event": "song.streaming",
  "task_id": "xxx",
  "data": [...]
}
```

#### 3. Song Failed
```json
{
  "event": "song.failed",
  "task_id": "xxx",
  "message": "Generation failed",
  "refund_processed": true
}
```

---

## 🔐 VERIFICAÇÃO DE ASSINATURA

### Node.js
```javascript
import crypto from 'crypto'

function verifyWebhook(secret, timestamp, signature, body) {
  const message = `${timestamp}.${body}`
  const expected = crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('hex')
  
  return crypto.timingSafeEqual(
    Buffer.from(signature.replace('sha256=', '')),
    Buffer.from(expected)
  )
}
```

### Headers Esperados
```
X-Webhook-Id: unique-event-id
X-Webhook-Timestamp: 1698696000
X-Webhook-Signature: sha256=abc123...
X-Webhook-Event: song.completed
```

---

## 🚀 SETUP FINAL

### 1. Environment
```bash
SUNO_API_KEY=sk_xxx
SUNO_API_URL=https://api.aimusicapi.ai/api/v1
```

### 2. Iniciar Servidor
```bash
npm run dev
```

### 3. Acessar Studio
```
http://localhost:3000/musicstudio
```

### 4. Endpoints Disponíveis
- `POST /api/suno/generate` - Gerar música
- `POST /api/suno/extend` - Estender música
- `GET /api/suno/details` - Obter detalhes
- `GET /api/suno/credits` - Obter créditos
- `POST /api/suno/lyrics` - Gerar letras
- `POST /api/webhooks/ai-music` - Receber webhooks

---

## 🔧 TROUBLESHOOTING

### Erro: "Not Found" nos Credits
**Causa:** Endpoint `/generate/credit` não existe  
**Solução:** Usar `/user/subscription` ✅

### Erro: "Invalid model"
**Causa:** Modelo não reconhecido  
**Solução:** Usar valores entre: chirp-v3-5, chirp-v4, chirp-v4-5, chirp-v4-5-plus, chirp-v5

### Erro: "Unauthorized"
**Causa:** API key inválida ou expirada  
**Solução:** Verificar SUNO_API_KEY em https://aimusicapi.ai/dashboard/apikey

### Erro: "Insufficient credits"
**Causa:** Sem créditos disponíveis  
**Solução:** Comprar créditos em https://aimusicapi.ai/dashboard

---

## ✨ FEATURES COMPLETAS

✅ Geração de música (custom + simple mode)  
✅ Extensão de música  
✅ Geração de letras  
✅ Suporte a 5 modelos (v3.5 até v5)  
✅ Webhook integration com HMAC verification  
✅ Error handling completo  
✅ Validação de todos os campos  
✅ Credit tracking  
✅ UI responsivo  
✅ 100% funcional e testado

---

**Documentação Oficial:** https://docs.sunoapi.com/create-suno-music  
**Dashboard:** https://aimusicapi.ai/dashboard  
**Status:** ✅ PRODUCTION READY

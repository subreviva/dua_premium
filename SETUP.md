# 🎵 DUA Music Studio - Quick Setup Guide

## ✅ Migration Completa para Suno API Oficial

### 1️⃣ Configurar API Key

1. Obter chave em: https://sunoapi.org/api-key
2. Criar arquivo `.env.local`:

```bash
SUNO_API_KEY=sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

⚠️ **IMPORTANTE**: Use `SUNO_API_KEY` (não `NEXT_PUBLIC_*`)

### 2️⃣ Verificar Instalação

```bash
# Instalar dependências (se necessário)
pnpm install

# Verificar tipos
pnpm tsc --noEmit

# Iniciar servidor de desenvolvimento
pnpm dev
```

### 3️⃣ Testar Funcionalidades

#### Geração Simples
1. Acesse: http://localhost:3000/musicstudio
2. Modo: "Simple Mode"
3. Digite um prompt: "A chill lofi hip hop beat"
4. Clique "Create Music"
5. Aguarde polling (5s interval)

#### Geração Custom
1. Toggle: "Custom Mode"
2. Preencha:
   - **Lyrics**: Use "Load Example" ou escreva custom
   - **Title**: "My Song"
   - **Tags**: "pop, energetic, male vocals"
3. Clique "Create Music"

#### Estender Música
1. Expandir "Advanced Options"
2. Em "Extend Audio":
   - **Audio ID**: Cole um taskId de música anterior
   - **Extension prompt**: "Add an epic guitar solo"
3. Clique "Extend Audio"

### 4️⃣ Endpoints Migrados

| Endpoint | Status | Método |
|----------|--------|--------|
| `/api/music/generate` | ✅ Migrado | POST |
| `/api/music/status` | ✅ Migrado | GET |
| `/api/music/credits` | ✅ Migrado | GET |
| `/api/music/extend` | ✅ Migrado | POST |
| `/api/music/lyrics` | ⏳ Legado (Railway) | POST |
| `/api/music/stems` | ⏳ Legado (Railway) | POST |
| `/api/music/custom` | ⏳ Legado (Railway) | POST |

### 5️⃣ Arquitetura

```
┌─────────────┐
│   Browser   │
│  (UI/UX)    │
└──────┬──────┘
       │
       │ POST /api/music/generate
       │ GET  /api/music/status
       │ GET  /api/music/credits
       │
       ▼
┌─────────────────────┐
│  Next.js API Routes │
│  (Server-side)      │
│  - Bearer Auth      │
│  - Model Mapping    │
└──────────┬──────────┘
           │
           │ lib/suno-api.ts
           │
           ▼
  ┌────────────────────┐
  │  Suno API v1       │
  │  api.sunoapi.org   │
  │  - Task-based      │
  │  - Record-info     │
  └────────────────────┘
```

### 6️⃣ Fluxo de Geração

```
1. User Input → UI
   ↓
2. POST /api/music/generate
   ↓
3. Returns: { taskId: "xxx" }
   ↓
4. UI starts polling every 5s
   ↓
5. GET /api/music/status?ids=xxx
   ↓
6. Status: "submitted" → "complete"
   ↓
7. Display: audioUrl, imageUrl, lyrics
```

### 7️⃣ Mapeamento de Modelos

```javascript
// UI (legacy) → API (oficial)
"chirp-v3-5"    → "V3_5"
"chirp-auk"     → "V4_5"
"chirp-bluejay" → "V4_5PLUS"
"chirp-crow"    → "V5"
```

### 8️⃣ Debug

#### Verificar logs no servidor:
```bash
# Console do Next.js mostra:
[Music Generate] Creating music via Suno API: { ... }
[Music Generate] ✅ Task created: <taskId>
[Status] Polling Task IDs: [ ... ]
[Status] <taskId>: complete 🎵 audio ready
```

#### Se não funcionar:
1. ✅ Confirmar `SUNO_API_KEY` em `.env.local`
2. ✅ Reiniciar servidor: `pnpm dev`
3. ✅ Verificar console do navegador (erros de rede)
4. ✅ Verificar créditos: https://sunoapi.org/dashboard

### 9️⃣ Recursos Adicionados

- 🔒 **Segurança**: API key server-side only
- 🚀 **Performance**: Edge Runtime mantido
- 📊 **Status Real**: Polling oficial com record-info
- 🎯 **Compatibilidade**: UI mantém mesma interface
- 📝 **Types**: TypeScript completo e validado

### 🔟 Próximos Passos

Para implementar endpoints adicionais (ver `SUNO_MIGRATION.md`):

1. **Timestamped Lyrics**: Sincronização com áudio
2. **Upload Workflows**: Cover e extend com upload
3. **Stems**: Vocal e instrumental separation
4. **WAV Export**: Alta qualidade
5. **Video Generation**: MP4 com visualização

---

## 📚 Documentação

- 📖 Migration Details: `SUNO_MIGRATION.md`
- 🌐 Official Docs: https://docs.sunoapi.org/
- 🔑 API Keys: https://sunoapi.org/api-key
- 💬 Support: support@sunoapi.org

## ✨ Sucesso!

Sua aplicação está agora usando a **API Oficial do Suno** com:
- ✅ Task-based workflow
- ✅ Bearer authentication
- ✅ Record-info polling
- ✅ Full TypeScript support
- ✅ Backward-compatible UI

Aproveite! 🎵🎉

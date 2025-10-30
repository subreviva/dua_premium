# 🎨 GOOEY.AI MUSIC STUDIO - INTEGRAÇÃO COMPLETA

Integração completa da API Gooey.AI com suporte a Suno v5, v4.5 e v3.5.

**📚 Ver também:** [MCP AI Music API Integration](./MCP_AI_MUSIC_API.md) para acesso à documentação via Model Context Protocol.

---

## 📋 O QUE FOI CRIADO

### **1. API Routes**
- ✅ `/api/gooey/generate/route.ts` - Gera música via Gooey.AI
- ✅ `/api/gooey/status/[runId]/route.ts` - Verifica status da geração

### **2. Componentes**
- ✅ `components/gooey-music-studio.tsx` - UI completa do Music Studio
- ✅ `app/gooeymusic/page.tsx` - Página do Gooey Music Studio

### **3. Funcionalidades**

#### **Inputs:**
- ✅ Textarea com contador de caracteres (500 max)
- ✅ Dropdown de modelos (v5, v4.5, v3.5)
- ✅ Dropdown de duração (60s-300s)
- ✅ Dropdown de outputs (1 ou 2 músicas)
- ✅ Toggle Instrumental
- ✅ Toggle Custom Style + input
- ✅ Validação (mín 10 caracteres)

#### **Geração:**
- ✅ Botão "Criar Música" com loading state
- ✅ Chamada API Gooey.AI
- ✅ Polling automático a cada 5s
- ✅ Timeout após 2 minutos
- ✅ Progress tracking (0-100%)

#### **Cards de Música:**
- ✅ **Processing**: spinner animado + progresso
- ✅ **Completed**: cover, título, tags, player, ações
- ✅ **Failed**: erro + botão retry

#### **Player de Áudio:**
- ✅ Botão Play/Pause circular
- ✅ HTML5 audio controls
- ✅ Auto-stop quando termina

#### **Ações:**
- ✅ Download (fetch + save)
- ✅ Share (Web Share API + clipboard fallback)
- ✅ More menu (show lyrics, remix)
- ✅ Lyrics expandible

#### **Persistência:**
- ✅ LocalStorage automático
- ✅ Load ao iniciar
- ✅ Save quando atualiza

---

## 🚀 COMO USAR

### **1. Configurar API Key**

Adicione ao `.env.local`:
```bash
GOOEY_API_KEY=sua_chave_aqui
```

Obter chave em: https://gooey.ai/

### **2. Acessar**

```
http://localhost:3000/gooeymusic
```

### **3. Criar Música**

1. Digite descrição (ex: "energetic rock song with heavy guitars")
2. Selecione modelo (v5 recomendado)
3. Configure duração (120s padrão)
4. Toggle instrumental se quiser
5. Clique "Criar Música"
6. Aguarde processamento (~30-60s)
7. Música aparece no grid!

---

## 📊 FLUXO DE DADOS

```
USER INPUT
    ↓
[Validação]
    ↓
POST /api/gooey/generate
    ↓
{text_prompt, model_version, duration_sec, ...}
    ↓
Gooey.AI API → run_id
    ↓
[Add card "processing"]
    ↓
[Start polling loop]
    ↓
GET /api/gooey/status/{run_id} (cada 5s)
    ↓
{status: "processing" | "completed" | "failed"}
    ↓
[Update card progress]
    ↓
Status = "completed"
    ↓
[Update card com audio_url, image_url, lyrics]
    ↓
[Stop polling]
    ↓
[Save to localStorage]
    ↓
DONE ✅
```

---

## 🎯 PARÂMETROS API

### **Generate (POST /api/gooey/generate)**

```typescript
{
  prompt: string,           // Descrição da música (obrigatório)
  model: string,            // "v5" | "v4.5" | "v3.5" (padrão: "v5")
  instrumental: boolean,    // true = sem vocals (padrão: false)
  style: string,            // "heavy metal, male vocals" (opcional)
  duration: number,         // 60-300 segundos (padrão: 120)
  outputs: number,          // 1 ou 2 (padrão: 1)
  input_audio?: string      // URL para extend (opcional)
}
```

### **Status (GET /api/gooey/status/{runId})**

Resposta:
```typescript
{
  status: "processing" | "completed" | "failed",
  output: {
    audio_url: string,
    image_url: string,
    video_url: string,
    title: string,
    text: string,         // Lyrics completas
    tags: string[]
  }
}
```

---

## 🎨 UI COMPONENTS

### **Form Card**
- Background: `bg-neutral-900`
- Border: `border-neutral-800`
- Padding: `p-6`
- Gap: `space-y-6`

### **Textarea**
- Min height: `120px`
- Character counter: green → orange (>450)
- Disabled quando loading

### **Buttons**
- Primary: gradient purple-pink
- Outline: neutral-700 borders
- Hover: scale slight

### **Song Cards**
- Grid: 1 col (mobile) → 2 cols (tablet) → 3 cols (desktop)
- Gap: `gap-6`
- Hover: border purple-500/50

---

## 🔒 SEGURANÇA

- ✅ API Key no backend (.env)
- ✅ Edge runtime (fast + secure)
- ✅ Error handling completo
- ✅ Validação de inputs
- ✅ Timeout protection
- ✅ No CORS issues

---

## 📱 RESPONSIVO

### **Mobile (<768px)**
- Textarea: full width
- Dropdowns: stack vertical
- Grid: 1 coluna
- Buttons: full width

### **Tablet (768-1200px)**
- Grid: 2 colunas
- Form: 90% width

### **Desktop (>1200px)**
- Grid: 3 colunas
- Form: 70% width
- Dropdowns: row

---

## ⚡ OTIMIZAÇÕES

- ✅ Debounce character count
- ✅ Cleanup intervals on unmount
- ✅ LocalStorage caching
- ✅ Lazy load images
- ✅ Audio preload="none"
- ✅ Error boundaries

---

## 🐛 TROUBLESHOOTING

### **"GOOEY_API_KEY not configured"**
→ Adicionar ao `.env.local`

### **"Failed to generate music"**
→ Verificar API key válida
→ Verificar créditos Gooey.AI

### **Timeout após 2 minutos**
→ Normal para v3.5/v4
→ Verificar manualmente no Gooey.AI dashboard

### **Download não funciona**
→ CORS issue - usar proxy se necessário

### **Músicas não aparecem após reload**
→ Verificar localStorage habilitado
→ Limpar cache se corrompido

---

## 📦 DEPENDÊNCIAS

Já incluídas no projeto:
- ✅ `@/components/ui/*` (shadcn/ui)
- ✅ `lucide-react` (icons)
- ✅ `next` (framework)

---

## 🚀 DEPLOY

### **Vercel**

1. Adicionar environment variable:
```
GOOEY_API_KEY=xxx
```

2. Deploy:
```bash
vercel --prod
```

### **Outras Plataformas**

Garantir:
- Node.js 18+
- Environment variable configurada
- Edge runtime suportado

---

## 📊 PERFORMANCE

### **Métricas Esperadas**
- First Load: < 1s
- Form Interaction: instant
- API Call: < 500ms
- Polling Overhead: ~50ms/5s
- Card Render: < 100ms

### **Otimizações Implementadas**
- Edge runtime (low latency)
- Minimal dependencies
- Lazy load heavy components
- LocalStorage over API calls
- Debounced inputs

---

## 🎯 PRÓXIMOS PASSOS

### **Melhorias Possíveis**
- [ ] Extend música existente
- [ ] Remix com input_audio
- [ ] Playlist mode
- [ ] Export to formats (WAV, FLAC)
- [ ] Collaborative editing
- [ ] Version history
- [ ] Favorites system
- [ ] Search & filter
- [ ] Tags autocomplete
- [ ] Batch generation

---

## 📞 SUPORTE

### **Gooey.AI**
- Docs: https://gooey.ai/docs
- API Ref: https://api.gooey.ai/docs
- Dashboard: https://gooey.ai/

### **Suno**
- Website: https://suno.ai/
- Models: v5 (best), v4.5, v3.5

---

## ✅ CHECKLIST DE INTEGRAÇÃO

- [x] API routes criadas
- [x] Componente UI completo
- [x] Página configurada
- [x] Environment vars documentadas
- [x] Error handling implementado
- [x] Loading states
- [x] Responsive design
- [x] LocalStorage persistence
- [x] Audio player funcional
- [x] Download/Share actions
- [x] Lyrics display
- [x] Retry mechanism
- [x] Polling automático
- [x] Timeout protection
- [x] TypeScript types
- [x] Documentação completa

---

**STATUS: ✅ 100% COMPLETO E PRONTO PARA USO!**

Acesse: http://localhost:3000/gooeymusic

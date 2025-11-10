# 🏗️ Arquitetura: SDK vs API Routes - Explicação Completa

## ❌ Por que NÃO funciona usar SDK diretamente no Hook?

### 🔴 Problema Fundamental

```typescript
// ❌ ISTO NÃO FUNCIONA:
// hooks/useDuaApi.ts (roda no BROWSER)

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
//                                    ^^^^^^^^^^^^^^^^^^^^^^^^^^
//                                    undefined no browser!
```

**React hooks rodam no BROWSER (cliente), não no servidor!**

- `process.env` **NÃO EXISTE** no browser
- `process.env.GOOGLE_API_KEY` retorna `undefined`
- SDK não consegue inicializar
- Código cai no fallback de mock
- **Resultado:** Imagens falsas (Picsum/Unsplash)

## ✅ Solução Correta: API Routes

### Arquitetura Atual (Funcionando)

```
┌─────────────────────────────────────────────────────────┐
│                       BROWSER                            │
│  ┌────────────────────────────────────────────────┐    │
│  │  hooks/useDuaApi.ts                            │    │
│  │  - generateImage()                             │    │
│  │  - editImage()                                 │    │
│  │  - extractColorPalette()                       │    │
│  │  └─> fetch('/api/design-studio', ...)         │    │
│  └────────────┬───────────────────────────────────┘    │
└───────────────┼──────────────────────────────────────────┘
                │ HTTP POST
                │ { action: "generateImage", prompt: "..." }
                ▼
┌─────────────────────────────────────────────────────────┐
│                   SERVIDOR (Next.js)                     │
│  ┌────────────────────────────────────────────────┐    │
│  │  app/api/design-studio/route.ts                │    │
│  │  const ai = new GoogleGenAI({                  │    │
│  │    apiKey: process.env.GOOGLE_API_KEY ✅       │    │
│  │  });                                           │    │
│  │                                                │    │
│  │  await ai.models.generateContent(...)         │    │
│  └────────────┬───────────────────────────────────┘    │
└───────────────┼──────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────┐
│              Google Gemini API                           │
│              (generativelanguage.googleapis.com)         │
└─────────────────────────────────────────────────────────┘
```

### Fluxo de Execução

1. **Browser** - Usuário clica "Gerar Imagem"
2. **Hook** - `generateImage()` faz `fetch('/api/design-studio')`
3. **API Route** - Recebe request, inicializa SDK com API key do servidor
4. **SDK** - Chama Google Gemini API
5. **API Route** - Retorna imagem em base64
6. **Browser** - Exibe imagem

## 🔒 Segurança

### ✅ CORRETO (API Route)
```typescript
// app/api/design-studio/route.ts
export async function POST(request: Request) {
  const API_KEY = process.env.GOOGLE_API_KEY; // ✅ Servidor
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  // API key NUNCA vai para o browser
}
```

### ❌ ERRADO (Hook)
```typescript
// hooks/useDuaApi.ts
const API_KEY = process.env.GOOGLE_API_KEY; // ❌ undefined
// OU PIOR:
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY; // ❌ Exposto!
```

## 📊 Comparação

| Aspecto | SDK no Hook | API Route |
|---------|-------------|-----------|
| **API Key** | ❌ Inacessível | ✅ Segura |
| **Performance** | - | ✅ Mesma |
| **Segurança** | ❌ Exposta ou null | ✅ 100% |
| **Manutenção** | ❌ Complexa | ✅ Simples |
| **Rate Limiting** | ❌ Não controlável | ✅ Controlável |
| **Caching** | ❌ Difícil | ✅ Fácil |
| **Monitoramento** | ❌ Impossível | ✅ Possível |

## 🧪 Como Testar

### 1. Teste via curl (API Route)
```bash
curl -X POST http://localhost:3000/api/design-studio \
  -H "Content-Type: application/json" \
  -d '{"action":"generateImage","prompt":"test","model":"gemini-2.5-flash-image-preview"}'
```

**Resultado esperado:**
```json
{
  "image": {
    "src": "data:image/png;base64,iVBORw0KG...",
    "mimeType": "image/png"
  }
}
```

### 2. Teste no Browser
1. Abra: http://localhost:3000/designstudio
2. Digite um prompt
3. Clique "Gerar"
4. **Deve ver imagem REAL** (não Picsum)

## 🐛 Debugging

### Se ver imagens Picsum/Unsplash:

**Causa:** Hook não consegue chamar API Route

**Soluções:**
1. Verificar se servidor está rodando: `ps aux | grep "next dev"`
2. Verificar logs: `tail -f /tmp/next-dev.log`
3. Testar API Route: `curl localhost:3000/api/design-studio`
4. Verificar `.env.local`: `grep GOOGLE_API_KEY .env.local`

### Se ver erro "SDK não inicializado":

**Causa:** Código tentou usar `ai` diretamente no hook

**Solução:** Reverter para versão com API Routes:
```bash
git checkout hooks/useDuaApi.ts
```

## 📝 Arquivos Importantes

```
hooks/useDuaApi.ts
├─> Faz fetch() para API Route
└─> NUNCA usa SDK diretamente

app/api/design-studio/route.ts
├─> Inicializa SDK com process.env.GOOGLE_API_KEY
├─> Chama Google Gemini API
└─> Retorna resultado para o browser

.env.local
└─> GOOGLE_API_KEY=AIzaSy... (NUNCA commitar!)
```

## ✅ Status Atual

```
✅ API Route funcionando - Gera imagens reais
✅ Hook limpo - Apenas faz fetch()
✅ Segurança 100% - API key no servidor
✅ TypeScript - Sem erros
✅ Servidor rodando - Port 3000
```

## 🎯 Lição Aprendida

> **React hooks rodam no browser. Variáveis de ambiente do servidor (process.env) não existem no browser. Sempre use API Routes para lógica server-side.**

---

**Data:** 2025-11-10  
**Status:** ✅ FUNCIONANDO  
**Método:** API Routes (correto)

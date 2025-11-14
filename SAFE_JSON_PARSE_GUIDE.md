# 🛡️ GUIA: Safe JSON Parse - Eliminando Erro DOCTYPE

## ❌ ERRO QUE ESTE GUIA RESOLVE:
```
Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

## ✅ SOLUÇÃO: Use `safeParse()` do helper

### 📦 Import:
```typescript
import { safeParse } from '@/lib/fetch-utils'
```

### ❌ PADRÃO INSEGURO (NÃO USE):
```typescript
const response = await fetch('/api/endpoint')
const data = await response.json() // ❌ PODE QUEBRAR COM HTML!
```

### ✅ PADRÃO SEGURO (USE SEMPRE):
```typescript
import { safeParse } from '@/lib/fetch-utils'

const response = await fetch('/api/endpoint')
const data = await safeParse(response) // ✅ SEGURO

if (!data) {
  console.error('Failed to parse response')
  return
}

// Usar data normalmente
```

### 🔍 QUANDO USAR:

**SEMPRE** que você fizer:
- `await response.json()`
- `await res.json()`
- `await statusResponse.json()`
- Qualquer `.json()` em Response

### 📝 EXEMPLOS DE USO:

#### 1️⃣ Fetch Simples:
```typescript
import { safeParse } from '@/lib/fetch-utils'

const response = await fetch('/api/credits')
if (!response.ok) {
  throw new Error('Request failed')
}

const data = await safeParse(response)
if (!data) {
  throw new Error('Invalid response')
}

setCredits(data.balance)
```

#### 2️⃣ Polling Loop:
```typescript
import { safeParse } from '@/lib/fetch-utils'

const pollStatus = async () => {
  const response = await fetch(`/api/status?taskId=${taskId}`)
  
  if (!response.ok) {
    // Retry
    setTimeout(pollStatus, 5000)
    return
  }
  
  const data = await safeParse(response)
  if (!data) {
    // Retry
    setTimeout(pollStatus, 5000)
    return
  }
  
  // Processar data
  setStatus(data.status)
}
```

#### 3️⃣ Com Error Handling:
```typescript
import { safeParse } from '@/lib/fetch-utils'

try {
  const response = await fetch('/api/generate', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
  
  if (!response.ok) {
    const error = await safeParse(response)
    throw new Error(error?.message || 'Generation failed')
  }
  
  const result = await safeParse(response)
  if (!result) {
    throw new Error('Invalid response')
  }
  
  return result
} catch (error) {
  console.error(error)
  toast.error(error.message)
}
```

### 🎯 BENEFÍCIOS:

✅ **Nunca mais erro DOCTYPE**  
✅ **Validação automática de Content-Type**  
✅ **Try/catch interno**  
✅ **Null em vez de exceção**  
✅ **Logs informativos**  

### 📊 ARQUIVOS JÁ PROTEGIDOS:

- ✅ contexts/generation-context.tsx
- ✅ contexts/stems-context.tsx
- ✅ components/task-monitor.tsx
- ✅ components/generation-progress-modal.tsx
- ✅ components/credits-display.tsx
- ✅ components/ui/link-preview.tsx
- ✅ components/admin/AdminCreditsPanel.tsx (parcial)
- ✅ app/musicstudio/create/page.tsx
- ✅ app/videostudio/qualidade/page.tsx
- ✅ app/videostudio/editar/page.tsx
- ✅ app/videostudio/image-to-video/page.tsx
- ✅ app/videostudio/performance/page.tsx

### ⚠️ COMPONENTES QUE AINDA PRECISAM ATUALIZAR:

- ❌ components/recording-panel.tsx
- ❌ components/ai-features-panel.tsx
- ❌ components/create-panel.tsx
- ❌ components/ai-music-generator.tsx
- ❌ components/file-upload.tsx
- ❌ components/track-detail-modal.tsx
- ❌ components/extend-modal.tsx
- ❌ components/song-context-menu.tsx
- ❌ components/audio-editor.tsx
- ❌ components/lyrics-generator.tsx
- ❌ components/pricing/*.tsx
- ❌ app/(music)/**/*.tsx

### 🚀 PRÓXIMOS PASSOS:

1. Importar `safeParse` em cada componente
2. Substituir **TODOS** os `await response.json()` por `await safeParse(response)`
3. Adicionar validação `if (!data) return`
4. Testar componente

### 💡 DICA RÁPIDA:

Use busca global no projeto:
```bash
# Encontrar todos os .json() não seguros:
grep -r "await.*\.json()" --include="*.tsx" --include="*.ts"
```

---

**Criado em:** 2025-11-14  
**Status:** GUIA OFICIAL - Seguir em TODOS os componentes

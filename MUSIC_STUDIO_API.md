# Estúdio de Música DUA - API Reference
## Ferramentas Suno API Implementadas

### 1. Criar Música (Generate Music)
**Endpoint:** `POST /api/studio/generate`  
**Custo:** 12 créditos  
**Descrição:** Gera música completa a partir de descrição de texto

**Body:**
```json
{
  "prompt": "Música romântica sobre o pôr do sol",
  "tags": "pop, romântico, acoustic",
  "title": "Pôr do Sol",
  "make_instrumental": false
}
```

**Response:**
```json
{
  "success": true,
  "clipIds": ["abc123", "def456"],
  "taskId": "task_789",
  "message": "Música em geração"
}
```

---

### 2. Melodia para Música (Upload and Extend Audio)
**Endpoint:** `POST /api/studio/upload-extend`  
**Custo:** 12 créditos  
**Descrição:** Transforma assobio, humming ou melodia em música completa

**Body:**
```json
{
  "audioUrl": "clip_id_or_url",
  "prompt": "Continue this melody as a pop song",
  "tags": "pop, energetic",
  "title": "Minha Melodia",
  "make_instrumental": false
}
```

---

### 3. Estender Música (Extend Music)
**Endpoint:** `POST /api/studio/extend`  
**Custo:** 12 créditos  
**Descrição:** Prolonga músicas existentes mantendo coerência

**Body:**
```json
{
  "audioId": "clip_123",
  "continueAt": 30,
  "prompt": "Continue with more energy"
}
```

---

### 4. Fazer Cover (Upload and Cover Audio)
**Endpoint:** `POST /api/studio/cover`  
**Custo:** 12 créditos  
**Descrição:** Transforma música em novo estilo

**Body:**
```json
{
  "audioId": "clip_123",
  "newStyle": "rock",
  "prompt": "Convert to rock style"
}
```

---

### 5. Adicionar Vocal (Add Vocals)
**Endpoint:** `POST /api/studio/add-vocals`  
**Custo:** 12 créditos  
**Descrição:** Adiciona voz gerada a instrumental

**Body:**
```json
{
  "audioId": "clip_123",
  "lyrics": "Letra da música aqui",
  "vocalStyle": "female, pop"
}
```

---

### 6. Adicionar Instrumental (Add Instrumental)
**Endpoint:** `POST /api/studio/add-instrumental`  
**Custo:** 12 créditos  
**Descrição:** Cria acompanhamento para vocal isolado

**Body:**
```json
{
  "audioId": "clip_123",
  "style": "pop",
  "prompt": "Create pop instrumental"
}
```

---

### 7. Separar Vocal (Separate Vocals from Music)
**Endpoint:** `POST /api/studio/separate-vocals`  
**Custo:** 10 créditos  
**Descrição:** Separa música em voz e instrumental

**Body:**
```json
{
  "audioId": "clip_123"
}
```

**Response:**
```json
{
  "success": true,
  "taskId": "task_789",
  "vocalUrl": "https://...",
  "instrumentalUrl": "https://...",
  "message": "Separação em processamento"
}
```

---

### 8. Gerar Letras (Generate Lyrics)
**Endpoint:** `POST /api/studio/generate-lyrics`  
**Custo:** 0.4 créditos  
**Descrição:** Cria letras originais sobre qualquer tema

**Body:**
```json
{
  "prompt": "Write lyrics about summer love"
}
```

**Response:**
```json
{
  "success": true,
  "lyrics": "Letra completa aqui...",
  "title": "Summer Love"
}
```

---

### 9. Letras Sincronizadas (Get Timestamped Lyrics)
**Endpoint:** `GET /api/studio/timestamped-lyrics?audioId=xxx`  
**Custo:** 0.5 créditos  
**Descrição:** Devolve letras com timestamp palavra-por-palavra

**Response:**
```json
{
  "success": true,
  "lyrics": [
    {"time": 0.5, "word": "Eu"},
    {"time": 0.8, "word": "te"},
    {"time": 1.2, "word": "amo"}
  ],
  "text": "Eu te amo..."
}
```

---

### 10. Converter para WAV (Convert to WAV Format)
**Endpoint:** `POST /api/studio/convert-wav`  
**Custo:** 0.4 créditos  
**Descrição:** Exporta em WAV de qualidade profissional

**Body:**
```json
{
  "audioId": "clip_123"
}
```

**Response:**
```json
{
  "success": true,
  "wavUrl": "https://...",
  "message": "Conversão concluída"
}
```

---

### 11. Intensificar Estilo (Boost Music Style)
**Endpoint:** `POST /api/studio/boost-style`  
**Custo:** 0.4 créditos  
**Descrição:** Reforça características do género musical

**Body:**
```json
{
  "audioId": "clip_123",
  "style": "trap"
}
```

---

### 12. Criar Vídeo Musical (Create Music Video)
**Endpoint:** `POST /api/studio/create-video`  
**Custo:** 2 créditos  
**Descrição:** Gera vídeo automático com visualizações

**Body:**
```json
{
  "audioId": "clip_123",
  "visualStyle": "abstract"
}
```

**Response:**
```json
{
  "success": true,
  "videoUrl": "https://...",
  "taskId": "task_789",
  "message": "Vídeo em criação"
}
```

---

### 13. Gerar Capa (Cover Music)
**Endpoint:** `POST /api/studio/generate-cover-art`  
**Custo:** 0 créditos (FREE)  
**Descrição:** Cria artwork/capa de álbum automaticamente

**Body:**
```json
{
  "audioId": "clip_123",
  "prompt": "Album cover for pop music"
}
```

**Response:**
```json
{
  "success": true,
  "coverUrl": "https://...",
  "message": "Capa gerada"
}
```

---

### 14. Ver Detalhes (Get Music Generation Details)
**Endpoint:** `GET /api/studio/get-status?ids=xxx,yyy`  
**Custo:** 0 créditos (FREE)  
**Descrição:** Consulta informações completas sobre música gerada

**Response:**
```json
{
  "success": true,
  "songs": [
    {
      "id": "clip_123",
      "title": "Minha Música",
      "status": "complete",
      "audioUrl": "https://...",
      "videoUrl": "https://...",
      "imageUrl": "https://...",
      "duration": 180,
      "tags": "pop, energetic",
      "prompt": "Create a pop song",
      "createdAt": "2025-10-28T10:00:00Z"
    }
  ]
}
```

**Status possíveis:**
- `submitted` - Pedido recebido (20%)
- `queued` - Na fila de processamento (30%)
- `streaming` - Em geração (70%)
- `complete` - Concluído (100%)
- `error` - Erro no processamento

---

### 15. Consultar Créditos (Get Remaining Credits)
**Endpoint:** `GET /api/studio/check-credits`  
**Custo:** 0 créditos (FREE)  
**Descrição:** Verifica saldo de créditos disponível

**Response:**
```json
{
  "success": true,
  "credits": 250,
  "totalCredits": 500,
  "usedCredits": 250
}
```

---

## Tabela de Custos

| Ferramenta | Créditos |
|------------|----------|
| Criar Música | 12 |
| Melodia para Música | 12 |
| Estender Música | 12 |
| Fazer Cover | 12 |
| Adicionar Vocal | 12 |
| Adicionar Instrumental | 12 |
| Separar Vocal | 10 |
| Gerar Letras | 0.4 |
| Letras Sincronizadas | 0.5 |
| Converter para WAV | 0.4 |
| Intensificar Estilo | 0.4 |
| Criar Vídeo Musical | 2 |
| Gerar Capa | 0 (FREE) |
| Ver Detalhes | 0 (FREE) |
| Consultar Créditos | 0 (FREE) |

---

## Variáveis de Ambiente Necessárias

```env
SUNOAPI_KEY=88cff88fcfae127759fa1f329f2abf84
SUNOAPI_BASE_URL=https://api.sunoapi.org
NEXT_PUBLIC_URL=https://dua.2lados.pt
```

---

## Workflow de Polling para Status

1. Fazer POST para gerar música (recebe `clipIds` e `taskId`)
2. Fazer GET para `/api/studio/get-status?ids=clip1,clip2` a cada 3 segundos
3. Verificar campo `status` em cada música:
   - `submitted` → continuar polling
   - `queued` → continuar polling
   - `streaming` → continuar polling
   - `complete` → usar `audioUrl`, `videoUrl`, `imageUrl`
   - `error` → mostrar erro
4. Máximo de 60 tentativas (3 minutos timeout)

---

## Modelo AI Usado

Todas as ferramentas usam: **`chirp-v3-5`** (modelo mais recente da Suno)

---

## Documentação Oficial

https://docs.sunoapi.org/

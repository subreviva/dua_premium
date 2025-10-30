# Suno API - Referência Completa
## Implementação Oficial v1 - https://api.sunoapi.org/api/v1

### 🔑 Autenticação
- **Base URL:** `https://api.sunoapi.org/api/v1`
- **Header:** `Authorization: Bearer SUNO_API_KEY`
- **Env Variable:** `SUNO_API_KEY` (server-only, não público)

---

## 📊 Gestão de Conta

### 1. Consultar Créditos
```typescript
getCredits()
// GET /generate/credit
// Retorna: { code: 200, msg: string, data: number }
```

---

## 🎵 Geração de Música

### 2. Criar Música (Generate)
```typescript
generateMusic({
  prompt: string,              // Obrigatório: descrição da música
  customMode: boolean,         // false = modo simples, true = personalizado
  instrumental: boolean,       // false = com vocais, true = instrumental
  model: string,              // V3_5, V4, V4_5, V4_5PLUS, V5
  callBackUrl: string,        // OBRIGATÓRIO: URL para notificações
  
  // Opcionais:
  style?: string,             // Estilo musical (max 200-1000 chars)
  title?: string,             // Título (max 80 chars)
  negativeTags?: string,      // Estilos a evitar
  vocalGender?: 'm' | 'f',    // Gênero vocal
  styleWeight?: number,       // 0-1: ênfase no estilo
  weirdnessConstraint?: number, // 0-1: criatividade
  audioWeight?: number,       // 0-1: fidelidade ao áudio
  personaId?: string,         // ID de persona customizada
})
// POST /generate
// Custo: 12 créditos
// Retorna: { code: 200, data: { taskId: string } }
```

**Regras customMode:**
- `customMode=false`: apenas `prompt` necessário
- `customMode=true` + `instrumental=true`: requer `style` e `title`
- `customMode=true` + `instrumental=false`: requer `prompt`, `style` e `title`

### 3. Estender Música (Extend)
```typescript
extendMusic({
  audioId: string,            // ID da música original
  defaultParamFlag: boolean,  // false = usa params originais, true = novos params
  model: string,              // Deve ser o mesmo da música original
  callBackUrl: string,        // OBRIGATÓRIO
  
  // Se defaultParamFlag=true, obrigatórios:
  prompt?: string,
  style?: string,
  title?: string,
  continueAt?: number,        // Segundo onde inicia extensão
  
  // Opcionais (mesmos da geração):
  negativeTags, vocalGender, styleWeight, weirdnessConstraint, audioWeight, personaId
})
// POST /generate/extend
// Custo: 12 créditos
```

### 4. Gerar Letras
```typescript
generateLyrics({
  prompt: string,             // Até ~200 palavras: tema e emoção
  callBackUrl: string,        // OBRIGATÓRIO
})
// POST /lyrics
// Retorna apenas texto, sem áudio
// Verificar status: getLyricsStatus(taskId)
```

---

## 🎤 Upload & Transformação

### 5. Upload & Cover
```typescript
uploadCover({
  uploadUrl: string,          // URL do áudio (max 8 min)
  customMode: boolean,
  callBackUrl: string,
  
  // Se customMode=false:
  prompt: string,             // Max 500 chars
  
  // Se customMode=true + instrumental=true:
  style: string,
  title: string,
  
  // Se customMode=true + instrumental=false:
  prompt: string,
  style: string,
  title: string,
  
  // Opcionais:
  model, negativeTags, vocalGender, styleWeight, weirdnessConstraint, audioWeight, personaId
})
// POST /generate/upload-cover
// Preserva melodia original, cria cover
// Arquivos retidos por 15 dias
```

### 6. Upload & Extend
```typescript
uploadExtend({
  uploadUrl: string,
  defaultParamFlag: boolean,
  callBackUrl: string,
  
  // Se defaultParamFlag=true:
  prompt?, style?, title?, continueAt?,
  
  // Opcionais:
  model, instrumental, negativeTags, vocalGender, styleWeight, weirdnessConstraint, audioWeight, personaId
})
// POST /generate/upload-extend
// Estende áudio fornecido pelo usuário
```

### 7. Adicionar Instrumental
```typescript
addInstrumental({
  uploadUrl: string,          // Voz ou melodia
  title: string,              // Obrigatório
  tags: string,               // Estilos (pop, rock, etc.)
  callBackUrl: string,
  
  // Opcionais:
  negativeTags?: string,
  vocalGender?: 'm' | 'f',
  styleWeight?: number,
  weirdnessConstraint?: number,
  audioWeight?: number,
  model?: 'V4_5PLUS' | 'V5',
})
// POST /generate/add-instrumental
// Cria acompanhamento instrumental
// Callback retorna: instrumental_url
```

### 8. Adicionar Vocais
```typescript
addVocals({
  uploadUrl: string,          // Faixa instrumental
  prompt: string,             // Descrição letras/tema
  title: string,
  style: string,
  callBackUrl: string,
  
  // Opcionais:
  negativeTags, vocalGender, styleWeight, weirdnessConstraint, audioWeight,
  model: 'V4_5PLUS' | 'V5',
})
// POST /generate/add-vocals
// Adiciona vocais IA a instrumental
```

---

## 🔍 Consulta de Status

### 9. Status de Tarefa
```typescript
getTaskStatus(taskId: string)
// GET /generate/record-info?taskId=...
// Status: PENDING, TEXT_SUCCESS, FIRST_SUCCESS, SUCCESS,
//         CREATE_TASK_FAILED, GENERATE_AUDIO_FAILED, etc.
```

### 10. Status de Letras
```typescript
getLyricsStatus(taskId: string)
// GET /lyrics/record-info?taskId=...
```

### 11. Status de WAV
```typescript
getWavStatus(taskId: string)
// GET /wav/record-info?taskId=...
```

### 12. Status de Stems
```typescript
getStemStatus(taskId: string)
// GET /vocal-removal/record-info?taskId=...
```

### 13. Status de Vídeo
```typescript
getVideoStatus(taskId: string)
// GET /mp4/record-info?taskId=...
```

### 14. Status de Capa
```typescript
getCoverStatus(taskId: string)
// GET /suno/cover/record-info?taskId=...
```

---

## 🎨 Recursos Avançados

### 15. Letras com Timestamp (Karaoke)
```typescript
getTimestampedLyrics({
  taskId: string,
  audioId?: string,           // Ou musicIndex
  musicIndex?: number,        // audioId tem prioridade
})
// POST /generate/get-timestamped-lyrics
// Retorna: alignedWords (palavras com tempo início/fim)
// Não funciona para instrumentais
```

### 16. Separação de Vocais/Stems
```typescript
separateStems({
  taskId: string,
  audioId: string,
  type: 'separate_vocal' | 'split_stem',
  callBackUrl: string,
})
// POST /vocal-removal/generate
// separate_vocal: 1 crédito (instrumental + vocal)
// split_stem: 5 créditos (12 stems: drums, bass, etc.)
// Stems retidos por 14 dias (download em 12h recomendado)
```

### 17. Conversão para WAV
```typescript
convertToWav({
  taskId: string,
  audioId: string,
  callBackUrl: string,
})
// POST /wav/generate
// Callback retorna: audioWavUrl
// Arquivos grandes - download rápido recomendado
```

### 18. Criar Vídeo Musical
```typescript
generateMusicVideo({
  taskId: string,
  audioId: string,
  callBackUrl: string,
  author?: string,            // Max 50 chars
  domainName?: string,        // Max 50 chars
})
// POST /mp4/generate
// Visualização animada sincronizada
// Callback retorna: video_url
```

### 19. Gerar Capa Personalizada
```typescript
generateCover({
  taskId: string,             // Da música original
  callBackUrl: string,
})
// POST /suno/cover/generate
// Gera 2 opções de capa
// Cada música só pode ter 1 capa
// Imagens disponíveis por 14 dias
```

### 20. Potenciar Estilo (V4_5+)
```typescript
boostStyle({
  content: string,            // Descrição longa de estilo
})
// POST /style/generate
// Controle detalhado de expressão estilística
```

### 21. Criar Persona
```typescript
generatePersona({
  taskId: string,             // Música já concluída
  musicIndex: number,         // Cada índice gera 1 persona apenas
  name: string,
  description: string,
})
// POST /generate/generate-persona
// Persona reutilizável em personaId
```

---

## 🔄 Callbacks e Notificações

Todos os endpoints enviam POST para `callBackUrl` com:

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "callbackType": "text" | "first" | "complete" | "error",
    "task_id": "...",
    "data": [
      {
        "audioUrl": "https://...",
        "streamUrl": "https://...",
        "imgUrl": "https://...",
        "prompt": "...",
        "modelName": "V5",
        "title": "...",
        "tags": "...",
        "duration": 120
      }
    ]
  }
}
```

**Tipos de Callback:**
- `text`: Texto enviado ao modelo
- `first`: Primeiro preview
- `complete`: Versão final
- `error`: Erro na geração

**Boas Práticas:**
1. Use HTTPS
2. Valide origem/IP
3. Idempotência (processar taskId só uma vez)
4. Responda rapidamente (evite timeouts)
5. Download assíncrono de arquivos

---

## ⚠️ Limites e Restrições

### Comprimento de Campos
- **prompt**: 500 chars (simples), 3000 (V3_5/V4), 5000 (V4_5+)
- **style**: 200 chars (V3_5/V4), 1000 (V4_5+)
- **title**: 80 chars
- **author/domainName**: 50 chars

### Rate Limits
- **Concorrência**: Até 20 requisições a cada 10 segundos
- **Erro 405**: Limite excedido - distribua requisições

### Créditos
- Geração/Extensão: 12 créditos
- Separate Vocal: 1 crédito
- Split Stem: 5 créditos
- **Erro 429**: Créditos insuficientes

### Retenção de Arquivos
- **Geral**: 14-15 dias
- **Stems**: Download em 12h recomendado
- **WAV**: Arquivos grandes, download imediato

### Códigos de Erro
- `400`: Parâmetros inválidos
- `401`: Não autorizado (API key inválida)
- `405`: Limite de requisições excedido
- `429`: Créditos insuficientes
- `500`: Erro interno

---

## 🏗️ Endpoints da Aplicação

### Server Routes (Next.js API)
- `POST /api/music/generate` → generateMusic()
- `GET /api/music/status?ids=...` → getTaskStatus()
- `GET /api/music/credits` → getCredits()
- `POST /api/music/extend` → extendMusic()
- `POST /api/music/callback` → Recebe callbacks Suno

### Mapeamento de Modelos (Legacy → Oficial)
```typescript
'chirp-v3-5' → 'V3_5'
'chirp-v3-0' → 'V3_5'
'chirp-auk' → 'V4_5'
'chirp-bluejay' → 'V4_5PLUS'
'chirp-crow' → 'V5'
```

---

## 📝 Exemplo Completo

```typescript
// 1. Verificar créditos
const credits = await getCredits()
console.log(`Créditos: ${credits.data}`)

// 2. Gerar música
const result = await generateMusic({
  prompt: "Música romântica sobre Portugal ao pôr do sol",
  customMode: false,
  instrumental: false,
  model: "V5",
  callBackUrl: "https://seu-dominio.com/api/music/callback"
})

const taskId = result.data.taskId

// 3. Polling status (alternativa ao callback)
const status = await getTaskStatus(taskId)
console.log(status.data.status) // PENDING, SUCCESS, etc.

// 4. Quando completo, download do áudio
const audioUrl = status.data.sunoData[0].audioUrl
```

---

## 🔐 Segurança

1. **NUNCA exponha** `SUNO_API_KEY` no frontend
2. Use variável de ambiente server-only
3. Todos os requests passam por API routes Next.js
4. Valide callbacks no endpoint `/api/music/callback`
5. Implemente rate limiting próprio se necessário

---

## 📦 Deployment

### Vercel Environment Variables
```bash
SUNO_API_KEY=seu_token_aqui
```

### URLs de Produção
- **App**: https://v0-remix-of-untitled-chat-66vzblpqu.vercel.app
- **Callback**: https://v0-remix-of-untitled-chat-66vzblpqu.vercel.app/api/music/callback

---

## 📚 Documentação Oficial
- **Docs**: https://docs.sunoapi.org/
- **API Key**: https://sunoapi.org/api-key
- **Support**: Documentação oficial para detalhes adicionais

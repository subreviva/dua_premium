# Video Studio - Sistema de Créditos

## 📊 Tabela de Créditos por Funcionalidade

### 1. Image to Video (Criar)
**Endpoint:** `/api/runway/image-to-video`  
**Modelos:** Gen4 Turbo, Gen3a Turbo

| Modelo | Duração | Créditos |
|--------|---------|----------|
| **Gen4 Turbo** | 5s | 25 |
| **Gen4 Turbo** | 10s | 50 |
| **Gen3a Turbo** | 5s | 20 |
| **Gen3a Turbo** | 10s | 20 |

**Aspect Ratios:**
- Gen4 Turbo: 6 opções (1280:768, 768:1280, 1104:832, 960:960, 832:1104, 1536:640)
- Gen3a Turbo: 2 opções (1280:768, 768:1280)

---

### 2. Video to Video (Editar)
**Endpoint:** `/api/runway/video-to-video`  
**Modelo:** Gen4 Aleph (único)

| Operação | Créditos |
|----------|----------|
| **Video Transformation** | 50 |

**Aspect Ratios:** 8 opções
- 1280:720 (16:9 Landscape)
- 720:1280 (9:16 Portrait)
- 1104:832 (4:3 Standard)
- 960:960 (1:1 Square)
- 832:1104 (3:4 Portrait)
- 1584:672 (21:9 Cinematic)
- 848:480 (16:9 SD)
- 640:480 (4:3 VGA)

**Capacidades:**
- Controle de câmera (ângulos e movimentos)
- Modificação de iluminação e atmosfera
- Adição/remoção de objetos
- Transformação de cenários

---

### 3. Video Upscale (Qualidade)
**Endpoint:** `/api/runway/video-upscale`  
**Modelo:** upscale_v1 (único)

| Operação | Créditos |
|----------|----------|
| **4X Upscale** | 25 |

**Especificações:**
- Fator de upscale: 4X
- Limite máximo: 4096px por lado
- Entrada: MP4, MOV, WebM
- Saída: Alta qualidade 4X

---

## 🎯 APIs Implementadas

### 1. Image to Video
```typescript
POST /api/runway/image-to-video
{
  "imageUri": "data:image/jpeg;base64,..." | "https://...",
  "promptText": "string (opcional para Gen4)",
  "model": "gen4_turbo" | "gen3a_turbo",
  "duration": 5 | 10,
  "ratio": "1280:768" | ...,
  "seed": 0-4294967295 (opcional)
}
```

### 2. Video to Video
```typescript
POST /api/runway/video-to-video
{
  "videoUri": "data:video/mp4;base64,..." | "https://...",
  "promptText": "string (1-1000 chars)",
  "model": "gen4_aleph",
  "ratio": "1280:720" | ...,
  "seed": 0-4294967295 (opcional),
  "references": [{ type: "image", uri: "..." }] (opcional, max 1),
  "contentModeration": {
    "publicFigureThreshold": "auto" | "low"
  }
}
```

### 3. Video Upscale
```typescript
POST /api/runway/video-upscale
{
  "videoUri": "data:video/mp4;base64,..." | "https://...",
  "model": "upscale_v1"
}
```

### 4. Task Status (Polling)
```typescript
GET /api/runway/task-status?taskId=xxx
Response: {
  "status": "PENDING" | "RUNNING" | "SUCCEEDED" | "FAILED",
  "progress": 0-100,
  "output": "https://..." (quando SUCCEEDED)
}
```

---

## 🎨 Design Pattern - Elegância Máxima

### Características das Páginas
1. **Layout Split:** Grid 2 colunas (controles | resultado)
2. **Dropdowns:** Todos os seletores com ChevronDown
3. **Botões Transparentes:** `bg-transparent border border-white/10`
4. **Botão Primário:** Branco no preto `bg-white text-black`
5. **Zero Ícones:** Apenas texto ou spinner minimalista
6. **Exemplos:** Input/Output lado a lado no painel direito

### Estados Visuais
- **Empty:** Mostra exemplo (Input → Output)
- **Processing:** Spinner circular + barra de progresso + porcentagem
- **Result:** Vídeo player + botões Download/New

---

## 💳 Sistema de Débito de Créditos

### Fluxo de Pagamento
1. Usuário clica em "Generate/Transform/Upscale"
2. Sistema verifica saldo de créditos
3. Debita créditos ANTES de chamar API
4. Chama API Runway
5. Poll status até conclusão
6. Retorna resultado

### Validações
- Verificar se usuário tem créditos suficientes
- Mostrar custo antes de gerar
- Não permitir geração sem créditos
- Estornar créditos em caso de falha

---

## 📱 Páginas Implementadas

### ✅ /videostudio/criar (Image to Video)
- **Status:** 100% Elegante
- **Features:** Dropdowns, exemplo showcase, 2 modelos
- **Créditos:** 20-50 por geração

### ✅ /videostudio/editar (Video to Video)
- **Status:** 100% Elegante
- **Features:** Dropdown aspect ratio, exemplo showcase
- **Créditos:** 50 por transformação

### 🔄 /videostudio/upscale (Video Upscale)
- **Status:** Pendente redesign
- **Features:** Upload vídeo, upscale 4X
- **Créditos:** 30 por upscale

---

## 🚀 Próximos Passos

1. ✅ Implementar débito de créditos nas APIs
2. ✅ Validar saldo antes de processar
3. ✅ Atualizar página /upscale com design elegante
4. ✅ Adicionar indicadores de custo em tempo real
5. ✅ Implementar sistema de estorno em falhas

---

## 📚 Documentação Runway ML

**Base URL:** `https://api.dev.runwayml.com/v1`  
**Version Header:** `X-Runway-Version: 2024-11-06`  
**Auth:** `Authorization: Bearer {API_KEY}`

**Endpoints:**
- `/image_to_video` - Gerar vídeo de imagem
- `/video_to_video` - Transformar vídeo
- `/video_upscale` - Upscale 4X
- `/tasks/{id}` - Verificar status

---

## 🎯 Regras de Negócio

1. **Durações:** Apenas 5s e 10s permitidos
2. **Aspect Ratios:** Depende do modelo escolhido
3. **Prompt:** Obrigatório para Gen3a, opcional para Gen4
4. **Upscale:** Máximo 4096px por lado
5. **Polling:** Check status a cada 5 segundos
6. **Timeout:** Máximo 10 minutos (120 tentativas)
7. **Créditos:** Débito imediato, estorno em falha

---

**Atualizado:** 2025-01-12  
**Versão:** 2.0 - Sistema Ultra Elegante

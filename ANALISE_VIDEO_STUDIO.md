# 🎬 ANÁLISE COMPLETA - VIDEO STUDIO (RUNWAY ML)

**Data:** 10 de novembro de 2025

---

## 📋 ENDPOINTS IDENTIFICADOS NO CÓDIGO

### ✅ RUNWAY ML - APIs Disponíveis

| # | Endpoint | Descrição | Duração | Modelo |
|---|----------|-----------|---------|--------|
| 1 | `/api/runway/text-to-video` | Texto → Vídeo | 4-10s | Gen-4 Turbo/Aleph |
| 2 | `/api/runway/image-to-video` | Imagem → Vídeo | 2-10s | Gen-4 Turbo/Gen-3a |
| 3 | `/api/runway/video-to-video` | Vídeo → Vídeo | Variável | Gen-4 Aleph |
| 4 | `/api/runway/video-upscale` | Upscale para 4K | N/A | Gen-4 |
| 5 | `/api/runway/character-performance` | Act-Two (personagens) | N/A | Act-Two |
| 6 | `/api/runway/upload-image` | Upload de imagem | N/A | Auxiliar |
| 7 | `/api/runway/upload-video` | Upload de vídeo | N/A | Auxiliar |
| 8 | `/api/runway/status` | Status de task | N/A | Auxiliar |
| 9 | `/api/runway/task-status` | Status detalhado | N/A | Auxiliar |

---

## 📊 COMPARAÇÃO COM TABELA service_costs

### ✅ CONFIGURADOS NA TABELA (4 serviços)

| Serviço DB | Custo | Status | Endpoint Correspondente |
|------------|-------|--------|-------------------------|
| `video_gen4_5s` | 20 créditos | ✅ | `/api/runway/text-to-video` (Gen-4 Turbo 5s) |
| `video_gen4_10s` | 40 créditos | ✅ | `/api/runway/text-to-video` (Gen-4 Turbo 10s) |
| `video_upscale_5s` | 10 créditos | ✅ | `/api/runway/video-upscale` (5s) |
| `video_gen4_aleph_5s` | 60 créditos | ✅ | `/api/runway/text-to-video` (Gen-4 Aleph 5s) |

---

## ⚠️ ENDPOINTS SEM SERVIÇO NA TABELA (5+)

### 1. **Image to Video** 🖼️→🎬
- **Endpoint:** `/api/runway/image-to-video`
- **Função:** Converter imagem estática em vídeo animado
- **Duração:** 2-10 segundos configurável
- **Modelo:** Gen-4 Turbo ou Gen-3a Turbo
- **Status:** ❌ **NÃO TEM CUSTO DEFINIDO**
- **Custo Sugerido:**
  - `video_image_to_video_5s`: **15 créditos** (5 segundos)
  - `video_image_to_video_10s`: **30 créditos** (10 segundos)

### 2. **Video to Video** 🎬→🎬
- **Endpoint:** `/api/runway/video-to-video`
- **Função:** Transformar/editar vídeo existente
- **Modelo:** Gen-4 Aleph (apenas)
- **Status:** ❌ **NÃO TEM CUSTO DEFINIDO**
- **Custo Sugerido:** **50 créditos** (processamento premium)

### 3. **Character Performance (Act-Two)** 🎭
- **Endpoint:** `/api/runway/character-performance`
- **Função:** Animar personagem com performance de áudio
- **Modelo:** Act-Two (tecnologia única)
- **Status:** ❌ **NÃO TEM CUSTO DEFINIDO**
- **Custo Sugerido:** **35 créditos** (IA avançada)

### 4. **Video Upscale 10s** 📈
- **Endpoint:** `/api/runway/video-upscale`
- **Função:** Upscale de vídeo para 4K (10 segundos)
- **Status:** ⚠️ Só tem `video_upscale_5s` na tabela
- **Custo Sugerido:** `video_upscale_10s`: **20 créditos**

### 5. **Gen-3 Alpha Turbo** ⚡
- **Endpoint:** `/api/runway/text-to-video` ou `/api/runway/image-to-video`
- **Função:** Geração com modelo Gen-3a (mais barato)
- **Status:** ❌ **NÃO TEM CUSTO DEFINIDO**
- **Custo Sugerido:**
  - `video_gen3a_5s`: **12 créditos** (mais barato que Gen-4)
  - `video_gen3a_10s`: **24 créditos**

---

## 🎯 MODELOS RUNWAY ML

### Gen-4 Turbo
- **Duração:** 4 segundos padrão
- **Uso:** Text-to-Video, Image-to-Video
- **Custo atual:** 20 créditos (5s), 40 créditos (10s)

### Gen-3 Alpha Turbo
- **Duração:** 5 segundos padrão
- **Uso:** Text-to-Video, Image-to-Video
- **Custo sugerido:** 12 créditos (5s), 24 créditos (10s)

### Gen-4 Aleph
- **Duração:** 10 segundos padrão
- **Uso:** Text-to-Video, Video-to-Video (qualidade máxima)
- **Custo atual:** 60 créditos (5s)

### Act-Two
- **Tipo:** Character Performance
- **Uso:** Animar personagens com áudio
- **Custo sugerido:** 35 créditos

---

## 📊 RESUMO DE DISCREPÂNCIAS

| Situação | Quantidade | Observação |
|----------|-----------|------------|
| ✅ Serviços configurados | 4 | Text-to-Video, Upscale básico |
| ⚠️ Endpoints sem custo | 5+ | Image-to-Video, Video-to-Video, Act-Two, etc. |
| ⚠️ Modelos sem custo | 1 | Gen-3 Alpha Turbo |
| ⚠️ Durações limitadas | Várias | Só 5s/10s, faltam 2s, 4s |

---

## 💡 PROPOSTA DE ATUALIZAÇÃO

### OPÇÃO 1: Serviços Essenciais (6 novos)
```typescript
// IMAGE TO VIDEO
video_image_to_video_5s: 15,    // Imagem → Vídeo 5s
video_image_to_video_10s: 30,   // Imagem → Vídeo 10s

// VIDEO TO VIDEO
video_to_video: 50,              // Editar/transformar vídeo

// CHARACTER PERFORMANCE
video_act_two: 35,               // Animar personagem

// GEN-3 ALPHA TURBO (mais barato)
video_gen3a_5s: 12,              // Gen-3a 5s
video_gen3a_10s: 24,             // Gen-3a 10s
```

### OPÇÃO 2: Completo + Durações Variáveis (10+ novos)
Adicionar todas as combinações de modelo + duração:
- Gen-4 Turbo: 2s, 4s, 5s, 10s
- Gen-3a Turbo: 2s, 5s, 10s
- Image-to-Video: 2s, 5s, 10s
- Video Upscale: 5s, 10s
- Etc.

---

## ✅ DECISÃO NECESSÁRIA

**Você prefere:**

1. ✅ **Adicionar apenas essenciais** (6 serviços: Image-to-Video, Video-to-Video, Act-Two, Gen-3a)?
2. 🚀 **Adicionar completo** (10+ serviços com todas as durações)?
3. 🎯 **Personalizar** (você escolhe quais adicionar)?

---

## 📈 IMPACTO

**Opção 1 (Essenciais):**
```
Total serviços: 30 → 36 (+6)
Video Studio: 4 → 10 serviços
Custo total somado: 233 → 395 créditos
```

**Opção 2 (Completo):**
```
Total serviços: 30 → 40+ (+10+)
Video Studio: 4 → 14+ serviços
Custo total somado: 233 → 500+ créditos
```

---

**Qual opção preferes?**

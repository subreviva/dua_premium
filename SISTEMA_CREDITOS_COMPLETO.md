# 🎯 SISTEMA DE CRÉDITOS DUA IA - DOCUMENTAÇÃO COMPLETA

## 📊 CONVERSÃO BASE

```
1 DUA COIN = €0,30
1 DUA COIN = 10 CRÉDITOS
1 CRÉDITO = €0,030
```

---

## 💰 PACOTES DE CRÉDITOS

| Pacote | DUA | EUR | Créditos Base | Bônus | Total | €/Créd | Imagens | Músicas | Vídeos 5s |
|--------|-----|-----|---------------|-------|-------|--------|---------|---------|-----------|
| 🎯**Starter** | 10 | €3,00 | 100 | 0% | 100 | €0,030 | 33 | 16 | 3 |
| 💡**Basic** | 25 | €7,50 | 250 | 5% | 262 | €0,029 | 87 | 43 | 8 |
| ⭐**Standard** | 50 | €15,00 | 500 | 10% | 550 | €0,027 | 183 | 91 | 18 |
| 🔥**Plus** | 100 | €30,00 | 1.000 | 15% | 1.150 | €0,026 | 383 | 191 | 38 |
| 💎**Pro** | 200 | €60,00 | 2.000 | 20% | 2.400 | €0,025 | 800 | 400 | 80 |
| 👑**Premium** | 500 | €150,00 | 5.000 | 25% | 6.250 | €0,024 | 2.083 | 1.041 | 208 |

---

## 🎵 ESTÚDIO DE MÚSICA - Todas as Ações

| Ação | API | Créditos | Preço EUR | Custo Real | Markup |
|------|-----|----------|-----------|------------|--------|
| **Gerar Música** | `/api/suno/generate` | 6 | €0,180 | €0,054 | 233% |
| **Upload Cover** (Melodia→Música) | `/api/suno/upload-cover` | 18 | €0,540 | €0,162 | 233% |
| **Estender Música** | `/api/suno/extend` | 8 | €0,240 | €0,072 | 233% |
| **Converter WAV** | `/api/suno/convert-wav` | 1 | €0,030 | €0,002 | 1567% 🔥 |
| **Separar Vocais** | `/api/suno/separate-stems` | 5 | €0,150 | €0,045 | 233% |
| **Stem Split Completo** | `/api/suno/separate-stems` | 25 | €0,750 | €0,225 | 233% |
| **Gerar MIDI** | `/api/suno/generate-midi` | 0 | GRÁTIS | €0,000 | N/A |

### Exemplos de Uso:
```typescript
// Gerar música
POST /api/suno/generate
{
  "prompt": "upbeat electronic dance music",
  "style": "electronic",
  "instrumental": false
}
// Debita: 6 créditos (€0,18)

// Converter para WAV
POST /api/suno/convert-wav
{
  "audioId": "abc123"
}
// Debita: 1 crédito (€0,03)

// Stem Split completo
POST /api/suno/separate-stems
{
  "audioId": "abc123",
  "mode": "full"
}
// Debita: 25 créditos (€0,75)
```

---

## �� ESTÚDIO DE IMAGEM - Todas as Ações

| Ação | API | Créditos | Preço EUR | Custo Real | Markup |
|------|-----|----------|-----------|------------|--------|
| **Gerar Imagem** | `/api/imagen/generate` | 3 | €0,090 | €0,035 | 157% |
| **Editar Imagem** | `/api/imagen/edit` | 2 | €0,060 | €0,035 | 71% |
| **Upscale (2x-4x)** | `/api/imagen/upscale` | 1 | €0,030 | €0,017 | 76% |
| **Gerar Variações** | `/api/imagen/variations` | 2 | €0,060 | €0,035 | 71% |

### Exemplos de Uso:
```typescript
// Gerar imagem
POST /api/imagen/generate
{
  "prompt": "beautiful sunset over mountains",
  "aspectRatio": "16:9",
  "negativePrompt": "people, text"
}
// Debita: 3 créditos (€0,09)

// Upscale imagem
POST /api/imagen/upscale
{
  "imageUrl": "https://...",
  "scale": 2
}
// Debita: 1 crédito (€0,03)
```

---

## 🎬 ESTÚDIO DE VÍDEO - Todas as Ações

| Ação | API | Créditos | Preço EUR | Custo Real | Markup |
|------|-----|----------|-----------|------------|--------|
| **Vídeo 5s Fast** | `/api/veo/generate` | 30 | €0,900 | €0,675 | 33% |
| **Vídeo 15s Fast** | `/api/veo/generate` | 90 | €2,700 | €2,025 | 33% |
| **Vídeo 5s Standard** | `/api/veo/generate` | 60 | €1,800 | €1,800 | 0% |
| **Vídeo 15s Standard** | `/api/veo/generate` | 180 | €5,400 | €5,400 | 0% |
| **Estender Vídeo** | `/api/veo/extend` | 15 | €0,450 | €0,337 | 33% |
| **Interpolação (FPS)** | `/api/veo/interpolate` | 20 | €0,600 | €0,450 | 33% |

### Exemplos de Uso:
```typescript
// Gerar vídeo 5s rápido
POST /api/veo/generate
{
  "prompt": "sunset over ocean waves",
  "duration": 5,
  "quality": "fast"
}
// Debita: 30 créditos (€0,90)

// Gerar vídeo 15s qualidade máxima
POST /api/veo/generate
{
  "prompt": "cinematic drone shot of city",
  "duration": 15,
  "quality": "standard"
}
// Debita: 180 créditos (€5,40)
```

---

## 🎨 ESTÚDIO DE DESIGN - Todas as Ações

| Ação | API | Créditos | Preço EUR | Custo Real | Markup |
|------|-----|----------|-----------|------------|--------|
| **Gerar Design** | `/api/design/generate-image` | 4 | €0,120 | €0,035 | 243% |
| **Gerar SVG** | `/api/design/generate-svg` | 3 | €0,090 | €0,035 | 157% |
| **Variações de Design** | `/api/design/variations` | 2 | €0,060 | €0,035 | 71% |
| **Extrair Paleta** | `/api/design/color-palette` | 0 | GRÁTIS | €0,000 | N/A |
| **Analisar Imagem** | `/api/design/analyze-image` | 1 | €0,030 | €0,0001 | 60000% 🔥 |
| **Melhorar Prompt** | `/api/design/enhance-prompt` | 1 | €0,030 | €0,0001 | 60000% 🔥 |
| **Editar Design** | `/api/design/edit-image` | 2 | €0,060 | €0,035 | 71% |
| **Pesquisar Tendências** | `/api/design/research-trends` | 0 | GRÁTIS | €0,000 | N/A |

### Exemplos de Uso:
```typescript
// Gerar design de logo
POST /api/design/generate-image
{
  "prompt": "modern tech startup logo",
  "designType": "logo",
  "dimensions": "512x512"
}
// Debita: 4 créditos (€0,12)

// Melhorar prompt
POST /api/design/enhance-prompt
{
  "prompt": "cool logo"
}
// Retorna: "modern minimalist technology logo with gradient colors..."
// Debita: 1 crédito (€0,03)
```

---

## 💬 CHAT / ASSISTENTE IA

| Ação | API | Créditos | Preço EUR | Custo Real | Markup |
|------|-----|----------|-----------|------------|--------|
| **Mensagem Chat** | `/api/chat` | 1 | €0,030 | €0,00005 | 60000% 🔥 |
| **Mensagem Longa** | `/api/chat` | 2 | €0,060 | €0,0001 | 60000% 🔥 |

---

## 📊 ANÁLISE DE LUCRO POR CENÁRIO

### Cenário STARTER (€3,00 - 100 créditos)
**Uso: 60% imagens + 30% chat + 10% música**

- 20 imagens (60 créd) → Custo: €0,70 | Cobrado: €1,80
- 30 chats (30 créd) → Custo: €0,0015 | Cobrado: €0,90
- 1,6 músicas (10 créd) → Custo: €0,09 | Cobrado: €0,30

**LUCRO: €2,21 (280% markup!)** ✅

---

### Cenário STANDARD (€15,00 - 550 créditos)
**Uso: 50% imagens + 25% música + 20% chat + 5% vídeo**

- 91 imagens (275 créd) → Custo: €3,19 | Cobrado: €8,25
- 22 músicas (137 créd) → Custo: €1,19 | Cobrado: €4,11
- 110 chats (110 créd) → Custo: €0,006 | Cobrado: €3,30
- 0,9 vídeos 5s (28 créd) → Custo: €0,61 | Cobrado: €0,84

**LUCRO: €10,01 (201% markup!)** ✅

---

### Cenário PREMIUM (€150,00 - 6.250 créditos)
**Uso: 40% imagens + 30% música + 20% vídeo + 10% chat**

- 833 imagens (2500 créd) → Custo: €29,16 | Cobrado: €75,00
- 312 músicas (1875 créd) → Custo: €16,85 | Cobrado: €56,25
- 41 vídeos 5s (1250 créd) → Custo: €27,68 | Cobrado: €37,50
- 625 chats (625 créd) → Custo: €0,03 | Cobrado: €18,75

**LUCRO: €113,78 (154% markup!)** ✅

---

## 📈 PROJEÇÃO MENSAL (1000 USERS)

| Pacote | Users | Receita | Custo | Lucro | Margem |
|--------|-------|---------|-------|-------|--------|
| Starter | 500 | €3.750 | €1.110 | **€2.640** | 70% |
| Basic | 300 | €5.400 | €1.620 | **€3.780** | 70% |
| Standard | 150 | €5.625 | €1.688 | **€3.937** | 70% |
| Plus | 40 | €3.000 | €900 | **€2.100** | 70% |
| Pro | 8 | €1.200 | €360 | **€840** | 70% |
| Premium | 2 | €720 | €318 | **€402** | 56% |
| **TOTAL** | **1000** | **€19.695** | **€5.996** | **€13.699** | **70%** 🔥 |

---

## 🎯 RESUMO EXECUTIVO

### ✅ TOTAL DE AÇÕES DISPONÍVEIS: **30 ações**

- **Música**: 7 ações (6 pagas + 1 grátis)
- **Imagem**: 4 ações (todas pagas)
- **Vídeo**: 6 ações (4 implementadas + 2 planejadas)
- **Design**: 8 ações (5 pagas + 3 grátis)
- **Chat**: 2 ações (todas pagas)

### 💰 CUSTOS E LUCROS

- **Markup Médio**: 200-300% (serviços principais)
- **Markup Máximo**: 60.000% (chat/análise AI)
- **Margem de Lucro Média**: 70%
- **ROI por Pacote**: 154%-280%

### 🚀 AÇÕES MAIS LUCRATIVAS

1. **Chat/Análise AI**: 60.000% markup
2. **Converter WAV**: 1.567% markup
3. **Gerar Design**: 243% markup
4. **Música (geral)**: 233% markup
5. **Imagem**: 157% markup

### ⚠️ AÇÕES COM MENOR MARGEM

1. **Vídeo 5s/15s Standard**: 0% markup (preço = custo)
2. **Vídeo Fast**: 33% markup

---

## 🔧 INTEGRAÇÃO COM CÓDIGO

### Exemplo de Consumo de Créditos:

```typescript
import { consumirCreditos } from '@/lib/creditos-helper';
import { CREDITOS_CONFIG } from '@/lib/creditos-config';

// No endpoint de geração de música
async function generateMusic(userId: string, prompt: string) {
  const creditos = CREDITOS_CONFIG.SERVICE_COSTS.MUSICA_GENERATE; // 6 créditos
  
  // Verificar e consumir créditos
  const resultado = await consumirCreditos(userId, 'MUSICA_GENERATE', {
    prompt,
    timestamp: new Date().toISOString()
  });
  
  if (!resultado.success) {
    return { error: 'Créditos insuficientes', redirect: '/loja-creditos' };
  }
  
  // Continuar com geração...
  const music = await sunoAPI.generate(prompt);
  
  return { success: true, music, creditos_restantes: resultado.creditos_restantes };
}
```

---

## 📱 IMPLEMENTAÇÃO NOS ESTÚDIOS

### Cada botão de ação deve:

1. **Verificar créditos** antes de executar
2. **Mostrar custo** no botão (ex: "Gerar Música - 6 créditos")
3. **Debitar créditos** ao iniciar processo
4. **Registrar transação** no histórico
5. **Redirecionar** para `/loja-creditos` se insuficiente

### Exemplo UI:

```tsx
<Button onClick={handleGenerate} disabled={saldoCreditos < 6}>
  <Music className="w-4 h-4 mr-2" />
  Gerar Música
  <span className="ml-2 text-xs opacity-70">6 créditos</span>
</Button>

{saldoCreditos < 6 && (
  <p className="text-sm text-red-500 mt-2">
    Créditos insuficientes. 
    <Link href="/loja-creditos" className="underline">Comprar créditos</Link>
  </p>
)}
```

---

## ✅ PRÓXIMOS PASSOS

1. ✅ Configuração de créditos criada
2. ✅ Pacotes definidos
3. ✅ Todas as ações mapeadas
4. ⏳ Integrar consumo de créditos em cada API
5. ⏳ Atualizar UI dos estúdios com indicadores de créditos
6. ⏳ Aplicar schema SQL no Supabase
7. ⏳ Testar fluxo completo

---

## 🎯 STATUS: SISTEMA 100% PLANEJADO E DOCUMENTADO

**Margem de Lucro Alvo**: 70%  
**ROI Médio**: 200%  
**Sistema**: OTIMIZADO PARA MÁXIMO LUCRO ✅


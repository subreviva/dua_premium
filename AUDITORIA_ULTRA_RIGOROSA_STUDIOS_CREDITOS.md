# 🔒 AUDITORIA ULTRA RIGOROSA - SISTEMA DE CRÉDITOS NOS ESTÚDIOS

**Data**: 2025-01-11  
**Auditor**: Sistema DUA IA Ultra Rigoroso  
**Objetivo**: Verificar se TODOS os estúdios cobram créditos corretamente

---

## 📊 RESUMO EXECUTIVO

| Estúdio | Endpoint | Status Créditos | Método | Vulnerabilidade |
|---------|----------|-----------------|---------|-----------------|
| **Design** | `/api/design-studio` | ✅ **FIXADO** | `withCredits` middleware | ✅ Corrigido em commit fb45330 |
| **Imagen** | `/api/imagen/generate` | ⚠️ **LEGADO** | `consumirCreditos` helper | ⚠️ Sistema antigo, funciona mas inconsistente |
| **Suno** | `/api/suno/generate` | ⚠️ **RISCO** | `checkCredits` → `deductCredits` | ⚠️ Se API falhar, créditos NÃO deduzidos |
| **Music** | `/api/music/generate` | ✅ **OK** | `checkCredits` → `deductCredits` | ✅ Implementado corretamente |
| **Video** | `/api/video/generate` | ✅ **OK** | `checkCredits` → `deductCredits` | ✅ Implementado corretamente |
| **Veo** | `/api/veo/generate` | ❌ **CRÍTICO** | **NENHUM** | ❌ **GERA VÍDEOS GRÁTIS ILIMITADOS** |

---

## ❌ VULNERABILIDADE CRÍTICA #1: VEO NÃO COBRA CRÉDITOS

### 📂 Arquivo: `app/api/veo/generate/route.ts`

**Problema**: API gera vídeos de 8 segundos com Google Veo 3 **SEM cobrar créditos**!

```typescript
// LINHA 1-150: NÃO TEM nenhuma menção a créditos
export async function POST(request: NextRequest) {
  // ❌ SEM checkCredits
  // ❌ SEM deductCredits
  // ❌ SEM withCredits
  // ❌ SEM consumirCreditos
  
  // Apenas gera o vídeo direto:
  const operation = {
    id: operationId,
    status: 'processing',
    metadata: { prompt, resolution, aspectRatio, duration: 8 },
  }
  
  generateVideoAsync(operationId)
  
  return NextResponse.json({ name: `operations/${operationId}` })
}
```

**Impacto**:
- ❌ Usuários podem gerar **vídeos ilimitados** sem pagar
- ❌ Perda de receita potencial enorme
- ❌ Vulnerabilidade de segurança financeira

**Evidência**:
```bash
$ grep -r "checkCredits\|deductCredits\|withCredits" app/api/veo/
# RESULTADO: Sem resultados (0 matches)
```

---

## ⚠️ VULNERABILIDADE #2: SUNO COM RACE CONDITION

### 📂 Arquivo: `app/api/suno/generate/route.ts`

**Problema**: Se API Suno falhar **APÓS** `checkCredits`, créditos são verificados mas **NUNCA deduzidos**.

```typescript
// LINHA 47-68: ✅ VERIFICA créditos OK
const creditCheck = await checkCredits(userId, 'music_generate_v5')
if (!creditCheck.hasCredits) {
  return NextResponse.json({ error: 'Créditos insuficientes' }, { status: 402 })
}

// LINHA 123-143: ⚠️ GERA música (PODE FALHAR AQUI)
try {
  taskId = await client.generateMusic({ prompt, ... })
} catch (generationError) {
  // ❌ Se falhar aqui, créditos NUNCA são deduzidos!
  console.error('Erro ao gerar música:', generationError)
  throw generationError // Retorna erro SEM deduzir créditos
}

// LINHA 165-180: Deduz créditos (nunca executa se linha 143 falhou)
const deduction = await deductCredits(userId, 'music_generate_v5', ...)
```

**Cenário de Exploração**:
1. Usuário tem 50 créditos
2. Tenta gerar música (custa 100 créditos de Suno)
3. `checkCredits` verifica: 50 < 100 → **FALHA** (protegido ✅)

**Cenário Problema**:
1. Usuário tem 150 créditos
2. Tenta gerar música (custa 100 créditos)
3. `checkCredits` verifica: 150 >= 100 → **PASSA** ✅
4. API Suno falha (erro 500, timeout, etc.) → **ERRO** ❌
5. Créditos **NUNCA são deduzidos** ⚠️
6. Usuário pode **tentar infinitas vezes** sem perder créditos

**Solução**: Usar `withCredits` middleware que deduz **ANTES** da operação.

---

## ⚠️ INCONSISTÊNCIA #3: IMAGEN USA SISTEMA LEGADO

### 📂 Arquivo: `app/api/imagen/generate/route.ts`

**Problema**: Usa `consumirCreditos` em vez de `withCredits` ou `checkCredits/deductCredits`.

```typescript
// LINHA 54-105: Sistema legado
const supabase = createClient(URL, SERVICE_ROLE_KEY)
const serviceName = SERVICE_NAME_MAP[modelId] || 'image_standard'

// Consulta custo via RPC
const { data: costData } = await supabase.rpc('get_service_cost', {
  p_service_name: serviceName
})

const CUSTO_GERACAO_IMAGEM = costData || 25

// Usa adapter antigo
const resultado = await consumirCreditos(user_id, serviceName, {
  creditos: CUSTO_GERACAO_IMAGEM,
  prompt,
  model,
})

if (!resultado.success) {
  return NextResponse.json({ error: 'Créditos insuficientes' }, { status: 402 })
}

// ✅ FUNCIONA mas é inconsistente com outros estúdios
```

**Status**: ⚠️ **FUNCIONAL mas INCONSISTENTE**
- ✅ Cobra créditos corretamente
- ⚠️ Usa sistema diferente dos outros estúdios
- ⚠️ Dificulta manutenção (2 sistemas paralelos)

---

## ✅ IMPLEMENTAÇÕES CORRETAS

### 1. **Design Studio** (`/api/design-studio/route.ts`)

```typescript
// ✅ USA MIDDLEWARE withCredits
export async function POST(req: NextRequest) {
  const { action } = await req.json()
  const operation = mapActionToOperation(action) // ex: 'design_generate_image'
  
  return withCredits(req, operation, async (userId, context) => {
    // ✅ Créditos já deduzidos ANTES de chegar aqui
    const result = await generateImage(prompt)
    return NextResponse.json({ result })
  })
}
```

**Vantagens**:
- ✅ Deduz créditos **ANTES** da operação
- ✅ Refund automático se falhar
- ✅ Validação de userId automática
- ✅ Admin bypass automático

---

### 2. **Music Studio** (`/api/music/generate/route.ts`)

```typescript
// ✅ USA checkCredits → deductCredits
export async function POST(req: NextRequest) {
  const { userId, prompt } = await req.json()
  
  // 1️⃣ Verificar créditos
  const creditCheck = await checkCredits(userId, 'music_generate_v5')
  if (!creditCheck.hasCredits) {
    return NextResponse.json({ error: 'Créditos insuficientes' }, { status: 402 })
  }
  
  // 2️⃣ Gerar música (simulado)
  const musicUrl = await generateMusic(prompt)
  
  // 3️⃣ Deduzir créditos
  const deduction = await deductCredits(userId, 'music_generate_v5', { prompt, resultUrl: musicUrl })
  
  return NextResponse.json({ musicUrl, newBalance: deduction.newBalance })
}
```

**Status**: ✅ **CORRETO** (mas pode melhorar com `withCredits`)

---

### 3. **Video Studio** (`/api/video/generate/route.ts`)

```typescript
// ✅ USA checkCredits → deductCredits COM MÚLTIPLAS OPERAÇÕES
export async function POST(req: NextRequest) {
  const { userId, type, duration } = await req.json()
  
  // Mapear tipo para operação
  let operation: CreditOperation
  switch (type) {
    case 'gen4': operation = duration === '10s' ? 'video_gen4_10s' : 'video_gen4_5s'; break
    case 'gen3': operation = duration === '10s' ? 'gen3_alpha_10s' : 'gen3_alpha_5s'; break
    // ... mais opções
  }
  
  // 1️⃣ Verificar créditos
  const creditCheck = await checkCredits(userId, operation)
  if (!creditCheck.hasCredits) {
    return NextResponse.json({ error: 'Créditos insuficientes', required: creditCheck.required }, { status: 402 })
  }
  
  // 2️⃣ Gerar vídeo
  const videoUrl = await generateVideo(prompt, type, duration)
  
  // 3️⃣ Deduzir créditos
  const deduction = await deductCredits(userId, operation, { prompt, resultUrl: videoUrl, model, type, duration })
  
  return NextResponse.json({ videoUrl, creditsUsed: creditCheck.required, newBalance: deduction.newBalance })
}
```

**Status**: ✅ **EXCELENTE** - Múltiplas operações, custos dinâmicos

---

## 🔧 PLANO DE CORREÇÃO

### PRIORIDADE 1 - CRÍTICO (VEO)

**Tarefa**: Adicionar sistema de créditos ao VEO

```typescript
// app/api/veo/generate/route.ts
import { withCredits } from '@/lib/credits/credits-middleware'

export async function POST(request: NextRequest) {
  const { prompt, resolution } = await parseRequest(request)
  
  // Mapear resolução para operação
  const operation = resolution === '1080p' ? 'veo_generate_1080p' : 'veo_generate_720p'
  
  return withCredits(request, operation, async (userId, context) => {
    // Créditos já deduzidos
    const operationId = generateOperationId()
    const operation = createOperation(operationId, prompt, resolution)
    operationStore.set(operationId, operation)
    generateVideoAsync(operationId)
    
    return NextResponse.json({ name: `operations/${operationId}` }, { status: 202 })
  })
}
```

**Custos Sugeridos** (adicionar em `credits-config.ts`):
```typescript
veo_generate_720p: 50,   // 8 segundos 720p
veo_generate_1080p: 100, // 8 segundos 1080p
```

---

### PRIORIDADE 2 - ALTO (SUNO)

**Opção 1**: Migrar para `withCredits` (RECOMENDADO)

```typescript
// app/api/suno/generate/route.ts
import { withCredits } from '@/lib/credits/credits-middleware'

export async function POST(request: NextRequest) {
  const { prompt, model, customMode } = await request.json()
  const operation = 'music_generate_v5'
  
  return withCredits(request, operation, async (userId, context) => {
    // Créditos JÁ deduzidos - se falhar, refund automático
    const taskId = await client.generateMusic({ prompt, model, customMode })
    return NextResponse.json({ taskId, creditsUsed: context.cost })
  })
}
```

**Opção 2**: Inverter ordem (deduzir ANTES de gerar)

```typescript
// Deduzir créditos ANTES
const deduction = await deductCredits(userId, 'music_generate_v5', ...)

// Tentar gerar música
try {
  const taskId = await client.generateMusic({ prompt })
  return NextResponse.json({ taskId })
} catch (error) {
  // REFUND: Música não foi gerada, devolver créditos
  await refundCredits(deduction.transactionId)
  throw error
}
```

---

### PRIORIDADE 3 - MÉDIO (IMAGEN)

**Tarefa**: Migrar `consumirCreditos` para `withCredits` para consistência

```typescript
// ANTES (linha 54-105)
const resultado = await consumirCreditos(user_id, serviceName, { creditos, prompt, model })

// DEPOIS
return withCredits(req, 'imagen_generate_ultra', async (userId, context) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY })
  const response = await ai.models.generateImages({ model, prompt, config })
  return NextResponse.json({ images: response.generatedImages })
})
```

**Operações a Criar** (baseado em SERVICE_NAME_MAP):
```typescript
// credits-config.ts
imagen_generate_ultra: 100,   // imagen-4.0-ultra-generate-001
imagen_generate_standard: 25, // imagen-4.0-generate-001
imagen_generate_fast: 15,     // imagen-4.0-fast-generate-001
imagen_generate_3: 20,        // imagen-3.0-generate-002
```

---

## 📋 CHECKLIST DE VERIFICAÇÃO

### Design Studio ✅
- [x] Importa `withCredits`
- [x] Usa `withCredits` no handler
- [x] Mapeia actions para operations
- [x] Deduz créditos ANTES da operação
- [x] Admin bypass funcionando

### Imagen Studio ⚠️
- [x] Cobra créditos
- [x] Valida user_id
- [ ] Usa `withCredits` (usa `consumirCreditos` legado)
- [x] Custo dinâmico via RPC
- [ ] Consistente com outros estúdios

### Suno Studio ⚠️
- [x] Verifica créditos (`checkCredits`)
- [x] Deduz créditos (`deductCredits`)
- [ ] Deduz ANTES da geração (deduz DEPOIS)
- [ ] Refund automático se falhar
- [x] Valida user_id

### Music Studio ✅
- [x] Verifica créditos
- [x] Deduz créditos
- [x] Valida user_id
- [x] Tratamento de erro OK

### Video Studio ✅
- [x] Verifica créditos
- [x] Deduz créditos
- [x] Múltiplas operações (gen4, gen3, upscale, etc.)
- [x] Custos dinâmicos por tipo/duração
- [x] Valida user_id

### Veo Studio ❌
- [ ] Importa sistema de créditos
- [ ] Verifica créditos
- [ ] Deduz créditos
- [ ] Valida user_id
- [ ] QUALQUER proteção financeira

---

## 🎯 RECOMENDAÇÕES FINAIS

### 1. **URGENTE: Fixar VEO** ⚠️
Adicionar sistema de créditos IMEDIATAMENTE para prevenir uso ilimitado gratuito.

### 2. **IMPORTANTE: Refatorar SUNO** 
Migrar para `withCredits` ou inverter ordem (deduzir ANTES).

### 3. **MELHORIA: Padronizar IMAGEN**
Migrar para `withCredits` para consistência de código.

### 4. **AUDITORIA: Verificar outros endpoints**
Procurar por outros endpoints que possam gerar conteúdo (extend, upscale, remix, etc.).

---

## 📊 TABELA DE CUSTOS (REFERÊNCIA)

| Operação | Custo | Arquivo Config |
|----------|-------|----------------|
| `design_generate_image` | 4 | credits-config.ts linha 24 |
| `imagen_generate_ultra` | 100 | RPC get_service_cost |
| `imagen_generate_standard` | 25 | RPC get_service_cost |
| `music_generate_v5` | 100 | credits-config.ts linha 53 |
| `video_gen4_5s` | 50 | credits-config.ts linha 64 |
| `video_gen4_10s` | 100 | credits-config.ts linha 65 |
| `veo_generate_720p` | ❌ **NÃO EXISTE** | ❌ NÃO IMPLEMENTADO |
| `veo_generate_1080p` | ❌ **NÃO EXISTE** | ❌ NÃO IMPLEMENTADO |

---

## ✅ VERIFICAÇÃO FINAL

Para cada estúdio, execute:

```bash
# 1. Verificar se tem sistema de créditos
grep -n "withCredits\|checkCredits\|deductCredits\|consumirCreditos" app/api/<studio>/*/route.ts

# 2. Testar geração sem créditos
# - Criar usuário com 0 créditos
# - Tentar gerar conteúdo
# - Deve retornar 402 Payment Required

# 3. Testar geração com créditos
# - Criar usuário com 200 créditos
# - Gerar 1 conteúdo
# - Verificar saldo diminuiu corretamente
# - Verificar transação no histórico
```

---

**Conclusão**: 3/6 estúdios têm vulnerabilidades financeiras. VEO é CRÍTICO (geração grátis ilimitada).

**Próximos Passos**:
1. Fixar VEO (URGENTE)
2. Refatorar Suno (race condition)
3. Padronizar Imagen (consistência)

---

**Data da Auditoria**: 2025-01-11  
**Auditado por**: Sistema DUA IA Ultra Rigoroso  
**Status**: ⚠️ **VULNERABILIDADES CRÍTICAS ENCONTRADAS**

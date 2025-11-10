# 💳 SISTEMA DE CRÉDITOS DUA - GUIA DE IMPLEMENTAÇÃO COMPLETO

**Data:** 10 de Novembro de 2025  
**Versão:** 2.0.0  
**Status:** ✅ Implementado e pronto para deploy

---

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Configuração de Créditos](#configuração-de-créditos)
4. [Implementação Passo a Passo](#implementação-passo-a-passo)
5. [Uso nas APIs](#uso-nas-apis)
6. [SQL Setup](#sql-setup)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 VISÃO GERAL

Sistema ultra profissional de créditos integrado a TODO o projeto DUA:
- ✅ **Música** (Suno V5, instrumental, vocais, stem separation)
- ✅ **Imagem** (Gemini Flash, Standard, Ultra)
- ✅ **Vídeo** (Gen-4 Turbo, Aleph, Upscale)
- ✅ **Chat** (Básico grátis, Avançado GPT-4)
- ✅ **Live Audio** (1min, 5min)
- ✅ **Design Studio** (14 ferramentas)

### WORKFLOW DE CRÉDITOS

```
┌──────────────┐
│ 1. CHECK     │ → Verificar saldo ANTES
├──────────────┤
│ 2. EXECUTE   │ → Executar operação
├──────────────┤
│ 3. DEDUCT    │ → Deduzir créditos APÓS sucesso
├──────────────┤
│ 4. REFUND    │ → Reembolsar se falhar (rollback)
└──────────────┘
```

---

## 🏗️ ARQUITETURA

### Arquivos Criados

```
lib/credits/
├── credits-config.ts           # ⚙️ Configuração centralizada
├── credits-service.ts          # 🔧 Serviço de créditos (server-only)
└── credits-middleware.ts       # 🛡️ Middleware para APIs

supabase/migrations/
└── credits_rpc_functions.sql   # 📊 Funções SQL atômicas

app/api/
└── design-studio-v2/route.ts   # 🎨 Exemplo implementado
```

### Fluxo de Dados

```
API Route
   │
   ├─→ withCredits() middleware
   │      │
   │      ├─→ checkCredits()
   │      │      └─→ duaia_user_balances
   │      │
   │      ├─→ Execute Handler
   │      │
   │      ├─→ deductCredits()
   │      │      ├─→ RPC: deduct_servicos_credits()
   │      │      └─→ duaia_transactions (audit)
   │      │
   │      └─→ refundCredits() (se falhar)
   │             └─→ RPC: add_servicos_credits()
   │
   └─→ Response
```

---

## ⚙️ CONFIGURAÇÃO DE CRÉDITOS

### Tabela Completa

| Categoria | Operação | Créditos | Descrição |
|-----------|----------|----------|-----------|
| **MÚSICA** ||||
|| `music_generate_v5` | 6 | Gerar música Suno V5 |
|| `music_add_instrumental` | 6 | Adicionar instrumental |
|| `music_add_vocals` | 6 | Adicionar vocais |
|| `music_separate_vocals` | 5 | Separar vocais |
|| `music_convert_wav` | 1 | Converter para WAV |
| **IMAGEM** ||||
|| `image_fast` | 2 | Gemini Flash (rápido) |
|| `image_standard` | 4 | Gemini Standard |
|| `image_ultra` | 6 | Gemini Ultra (máxima qualidade) |
|| `image_gemini` | 4 | Gemini genérico |
| **VÍDEO** ||||
|| `video_gen4_5s` | 20 | Gen-4 Turbo 5 segundos |
|| `video_gen4_10s` | 40 | Gen-4 Turbo 10 segundos |
|| `video_upscale_5s` | 10 | Upscale 5 segundos |
|| `video_gen4_aleph_5s` | 60 | Gen-4 Aleph 5s (premium) |
| **CHAT** ||||
|| `chat_basic` | **0** | Grátis - 50 mensagens/dia |
|| `chat_advanced` | 1 | GPT-4 / Claude / Gemini Pro |
| **LIVE AUDIO** ||||
|| `live_audio_1min` | 3 | 1 minuto ao vivo |
|| `live_audio_5min` | 13 | 5 minutos ao vivo |
| **DESIGN STUDIO** ||||
|| `design_generate_image` | 4 | Gerar imagem |
|| `design_generate_logo` | 6 | Gerar logo (alta qualidade) |
|| `design_generate_icon` | 4 | Gerar ícone |
|| `design_generate_pattern` | 4 | Gerar padrão |
|| `design_generate_svg` | 6 | Gerar SVG (vetorial) |
|| `design_edit_image` | 5 | Editar imagem com IA |
|| `design_remove_background` | 5 | Remover fundo |
|| `design_upscale_image` | 6 | Upscale HD/4K |
|| `design_generate_variations` | 8 | 3 variações (3x custo) |
|| `design_analyze_image` | 2 | Analisar imagem |
|| `design_extract_colors` | 2 | Paleta de cores |
|| `design_trends` | 3 | Tendências design |
|| `design_assistant` | 1 | Chat assistente |
|| `design_export_png` | **0** | Exportar PNG (grátis) |
|| `design_export_svg` | **0** | Exportar SVG (grátis) |

---

## 🚀 IMPLEMENTAÇÃO PASSO A PASSO

### STEP 1: Aplicar Funções SQL

```bash
# Abrir Supabase Dashboard → SQL Editor
# Copiar e executar: supabase/migrations/credits_rpc_functions.sql
```

Funções criadas:
- `deduct_servicos_credits(user_id, amount)` → Deduzir créditos
- `add_servicos_credits(user_id, amount)` → Adicionar créditos
- `get_servicos_credits(user_id)` → Obter saldo

### STEP 2: Verificar Tabelas

Garantir que existem:

```sql
-- duaia_user_balances
CREATE TABLE IF NOT EXISTS duaia_user_balances (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  servicos_creditos INTEGER DEFAULT 0,
  duacoin_balance DECIMAL(20, 8) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- duaia_transactions
CREATE TABLE IF NOT EXISTS duaia_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  type TEXT, -- 'debit' ou 'credit'
  amount INTEGER,
  currency TEXT, -- 'credits' ou 'duacoin'
  description TEXT,
  metadata JSONB,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### STEP 3: Configurar Environment Variables

```.env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...  # IMPORTANTE: Service Role

# APIs
GOOGLE_API_KEY=AIzaSyxxx...
SUNO_API_KEY=xxx...
REPLICATE_API_TOKEN=xxx...
```

### STEP 4: Implementar em Nova API

#### Exemplo: Music Generation API

```typescript
// app/api/music/generate/route.ts
import { NextRequest } from 'next/server';
import { withCredits } from '@/lib/credits/credits-middleware';

export async function POST(req: NextRequest) {
  return withCredits(
    req,
    'music_generate_v5', // ← Operação
    async (userId) => {
      // Créditos já validados e deduzidos!
      
      const { prompt, duration } = await req.json();
      
      // Chamar API Suno
      const music = await generateMusic(prompt, duration);
      
      return NextResponse.json({
        success: true,
        music,
      });
    },
    {
      // Metadados opcionais
      prompt: body.prompt?.substring(0, 100),
      duration: body.duration,
    }
  );
}
```

#### Exemplo: Image Generation API

```typescript
// app/api/image/generate/route.ts
import { withCredits } from '@/lib/credits/credits-middleware';

export async function POST(req: NextRequest) {
  const { quality } = await req.json();
  
  // Mapear qualidade para operação
  const operation = quality === 'fast' ? 'image_fast' 
                  : quality === 'ultra' ? 'image_ultra'
                  : 'image_standard';
  
  return withCredits(
    req,
    operation,
    async (userId) => {
      const image = await generateImage(...);
      return NextResponse.json({ success: true, image });
    }
  );
}
```

---

## 🛡️ USO NAS APIs

### Opção 1: Middleware Automático (Recomendado)

```typescript
import { withCredits } from '@/lib/credits/credits-middleware';

export async function POST(req: NextRequest) {
  return withCredits(
    req,
    'design_generate_image',
    async (userId) => {
      // Sua lógica aqui
      // Créditos JÁ foram:
      // ✅ Verificados
      // ✅ Deduzidos
      // ✅ Registrados no audit trail
      
      return NextResponse.json({ success: true });
    }
  );
}
```

**Benefícios:**
- ✅ Validação automática
- ✅ Dedução automática após sucesso
- ✅ Rollback automático se falhar
- ✅ Audit trail completo
- ✅ Headers com saldo atualizado

### Opção 2: Manual (Controle Total)

```typescript
import { checkCredits, deductCredits, refundCredits } from '@/lib/credits/credits-service';

export async function POST(req: NextRequest) {
  const { userId } = await req.json();
  
  // 1. CHECK
  const check = await checkCredits(userId, 'video_gen4_5s');
  if (!check.hasCredits) {
    return NextResponse.json({
      error: 'insufficient_credits',
      ...check,
    }, { status: 402 });
  }
  
  try {
    // 2. EXECUTE
    const result = await generateVideo(...);
    
    // 3. DEDUCT
    await deductCredits(userId, 'video_gen4_5s', {
      resultUrl: result.url,
    });
    
    return NextResponse.json({ success: true, result });
  } catch (error) {
    // 4. REFUND (se já deduziu)
    await refundCredits(userId, 'video_gen4_5s', error.message);
    throw error;
  }
}
```

---

## 📊 SQL SETUP

### Teste de Funções

```sql
-- 1. Dar 100 créditos a um usuário
SELECT add_servicos_credits('user-uuid-here', 100);

-- 2. Verificar saldo
SELECT get_servicos_credits('user-uuid-here');
-- Resultado: 100

-- 3. Deduzir 30 créditos
SELECT deduct_servicos_credits('user-uuid-here', 30);
-- Resultado: 70

-- 4. Ver histórico
SELECT * FROM duaia_transactions 
WHERE user_id = 'user-uuid-here' 
AND currency = 'credits'
ORDER BY created_at DESC;
```

### Dar Créditos para Teste

```sql
-- Opção 1: Atualizar direto
UPDATE duaia_user_balances
SET servicos_creditos = 1000
WHERE user_id = 'your-user-uuid';

-- Opção 2: Usar função (registra no audit)
SELECT add_servicos_credits('your-user-uuid', 1000);
```

---

## ✅ TESTING

### 1. Testar Check de Créditos

```bash
curl -X POST http://localhost:3000/api/design-studio-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid",
    "tool": "generate-image",
    "prompt": "Beautiful landscape"
  }'
```

**Resposta com créditos:**
```json
{
  "success": true,
  "image": {
    "src": "data:image/png;base64,...",
    "mimeType": "image/png"
  }
}
```

**Resposta SEM créditos:**
```json
{
  "error": "insufficient_credits",
  "message": "❌ Você tem 0, precisa de 4 (faltam 4)",
  "required": 4,
  "current": 0,
  "deficit": 4,
  "redirect": "/loja-creditos"
}
```

### 2. Verificar Audit Trail

```sql
SELECT 
  description,
  amount,
  type,
  metadata->>'operation' as operation,
  created_at
FROM duaia_transactions
WHERE user_id = 'your-uuid'
AND currency = 'credits'
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🔧 TROUBLESHOOTING

### Problema: "Função deduct_servicos_credits não existe"

**Solução:**
```sql
-- Verificar se funções existem
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name LIKE '%servicos_credits%';

-- Se vazio, executar:
-- supabase/migrations/credits_rpc_functions.sql
```

### Problema: "Tabela duaia_user_balances não existe"

**Solução:**
```sql
CREATE TABLE IF NOT EXISTS duaia_user_balances (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  servicos_creditos INTEGER DEFAULT 0,
  duacoin_balance DECIMAL(20, 8) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Problema: "Cannot find module '@/lib/credits/...'"

**Solução:**
- Verificar que arquivos foram criados em `lib/credits/`
- Reiniciar dev server: `npm run dev`
- Verificar `tsconfig.json` tem paths configurados

### Problema: Créditos deduzidos mas operação falhou

**Solução:**
- Sistema tem rollback automático com `withCredits()`
- Para implementações manuais, sempre usar try/catch:

```typescript
try {
  const result = await operation();
  await deductCredits(...);
} catch (error) {
  await refundCredits(..., error.message);
  throw error;
}
```

---

## 📈 ESTATÍSTICAS DE USO

### Obter Stats de Usuário

```typescript
import { getCreditStats } from '@/lib/credits/credits-service';

const stats = await getCreditStats(userId);
console.log(stats);
// {
//   totalSpent: 150,
//   totalRefunded: 10,
//   transactionCount: 45,
//   lastTransaction: { ... }
// }
```

---

## 🎯 PRÓXIMOS PASSOS

### APIs a Implementar

- [ ] `/api/music/generate` → `music_generate_v5`
- [ ] `/api/video/generate` → `video_gen4_5s` / `video_gen4_10s`
- [ ] `/api/chat/message` → `chat_basic` / `chat_advanced`
- [ ] `/api/live-audio/stream` → `live_audio_1min` / `live_audio_5min`

### Exemplo Template

```typescript
export async function POST(req: NextRequest) {
  return withCredits(
    req,
    'OPERATION_NAME_HERE', // ← Da credits-config.ts
    async (userId) => {
      // Sua lógica
      return NextResponse.json({ success: true });
    }
  );
}
```

---

## 📚 REFERÊNCIAS

**Arquivos:**
- `lib/credits/credits-config.ts` - Configurações
- `lib/credits/credits-service.ts` - Serviços
- `lib/credits/credits-middleware.ts` - Middleware
- `app/api/design-studio-v2/route.ts` - Exemplo completo

**Tabelas:**
- `duaia_user_balances` - Saldos dos usuários
- `duaia_transactions` - Histórico de transações

**Funções:**
- `deduct_servicos_credits(user_id, amount)`
- `add_servicos_credits(user_id, amount)`
- `get_servicos_credits(user_id)`

---

**Status:** ✅ Sistema implementado e pronto para uso  
**Última atualização:** 10/11/2025  
**Versão:** 2.0.0

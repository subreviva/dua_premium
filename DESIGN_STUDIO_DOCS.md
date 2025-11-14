# 🎨 DESIGN STUDIO - DOCUMENTAÇÃO TÉCNICA COMPLETA

## 📚 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [API Routes](#api-routes)
4. [Ferramentas](#ferramentas)
5. [Sistema de Créditos](#sistema-de-créditos)
6. [Interface iOS](#interface-ios)
7. [Interface Desktop](#interface-desktop)
8. [Integração Google Gemini](#integração-google-gemini)
9. [Fluxo de Dados](#fluxo-de-dados)
10. [Deployment](#deployment)

---

## 🎯 Visão Geral

O **Design Studio** é uma plataforma profissional de geração e edição de imagens usando IA, integrada com **Google Gemini 2.5 Flash Image**. Oferece 6 ferramentas principais com interface adaptativa para iOS e Desktop.

### Tecnologias

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Supabase
- **IA:** Google Gemini 2.5 Flash Image (imagen-3.0-generate-001)
- **Autenticação:** Supabase Auth
- **Storage:** Supabase Storage (imagens)
- **Database:** PostgreSQL (Supabase)

### Configuração

```bash
# Variáveis de ambiente (.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://lhvymocfsyypjxslcqfh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
GOOGLE_API_KEY=AIzaSyAQYjzJB8UQz9yatYLMSvBTwjvgWG455h8
```

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        DESIGN STUDIO                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐         ┌──────────────┐                 │
│  │   iOS App    │         │   Desktop    │                 │
│  │   (Mobile)   │         │   (Browser)  │                 │
│  └──────┬───────┘         └──────┬───────┘                 │
│         │                         │                          │
│         └──────────┬──────────────┘                         │
│                    │                                         │
│         ┌──────────▼──────────┐                            │
│         │   Frontend Layer     │                            │
│         │  - Canvas Component  │                            │
│         │  - Tools Bar         │                            │
│         │  - Bottom Sheet      │                            │
│         └──────────┬──────────┘                            │
│                    │                                         │
│         ┌──────────▼──────────┐                            │
│         │   API Layer          │                            │
│         │  /api/design-studio  │                            │
│         └──────────┬──────────┘                            │
│                    │                                         │
│         ┌──────────▼──────────┐                            │
│         │  Credits Middleware  │                            │
│         │   (withCredits)      │                            │
│         └──────────┬──────────┘                            │
│                    │                                         │
│    ┌───────────────┼───────────────┐                       │
│    │               │               │                        │
│ ┌──▼────┐   ┌─────▼─────┐   ┌────▼────┐                  │
│ │Google │   │  Supabase │   │ Credits │                  │
│ │Gemini │   │  Storage  │   │   DB    │                  │
│ └───────┘   └───────────┘   └─────────┘                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔌 API Routes

### Endpoint Principal

**URL:** `/api/design-studio`  
**Method:** `POST`  
**Auth:** Bearer Token (Supabase)

### Request Body

```typescript
interface DesignStudioRequest {
  action: 'generateImage' | 'editImage' | 'analyzeImage' | 
          'removeBackground' | 'upscale' | 'chat';
  user_id: string;
  prompt?: string;
  imageData?: string; // Base64
  mimeType?: string;
  model?: string;
  config?: {
    numberOfImages?: number;
    aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3';
    safetySettings?: 'default' | 'strict' | 'permissive';
  };
}
```

### Response

```typescript
interface DesignStudioResponse {
  images?: Array<{
    data: string; // Base64
    mimeType: string;
    width?: number;
    height?: number;
  }>;
  text?: string; // Para analyze e chat
  creditsUsed?: number;
  creditsRemaining?: number;
  model?: string;
}
```

---

## 🛠️ Ferramentas

### 1. Generate Image

**Custo:** 10 créditos  
**Ação:** `generateImage`  
**Modelo:** `gemini-2.5-flash-image`

**Código:**
```typescript
const response = await fetch('/api/design-studio', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    action: 'generateImage',
    user_id: userId,
    prompt: 'A minimalist logo design...',
    config: {
      numberOfImages: 1,
      aspectRatio: '1:1',
      safetySettings: 'default',
    },
  }),
});

const { images } = await response.json();
// images[0].data = Base64 PNG
```

**Output:**
- Formato: PNG-24 com canal alpha
- Resolução: 1024x1024 (1:1) ou customizado
- Qualidade: Ultra premium, sem artifacts

---

### 2. Edit Image

**Custo:** 8 créditos  
**Ação:** `editImage`

**Código:**
```typescript
const response = await fetch('/api/design-studio', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    action: 'editImage',
    user_id: userId,
    prompt: 'Change colors to blue and gold gradient',
    imageData: base64Image,
    mimeType: 'image/png',
  }),
});
```

---

### 3. Analyze Image

**Custo:** 5 créditos  
**Ação:** `analyzeImage`

**Código:**
```typescript
const response = await fetch('/api/design-studio', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    action: 'analyzeImage',
    user_id: userId,
    imageData: base64Image,
    mimeType: 'image/png',
    prompt: 'Analyze design, colors, composition',
  }),
});

const { text } = await response.json();
// text = Análise detalhada em texto
```

---

### 4. Remove Background

**Custo:** 6 créditos  
**Ação:** `removeBackground`

**Implementação:**
```typescript
// API route: app/api/design-studio/route.ts
case 'removeBackground': {
  const prompt = `Remove the background from this image completely. 
    Keep only the main subject with clean, smooth edges.`;
  
  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: imageData,
        mimeType: mimeType || 'image/png',
      },
    },
  ]);
  
  // Retorna PNG com fundo transparente
}
```

---

### 5. Upscale Image

**Custo:** 7 créditos  
**Ação:** `upscale`

**Código:**
```typescript
const response = await fetch('/api/design-studio', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    action: 'upscale',
    user_id: userId,
    imageData: base64Image,
    mimeType: 'image/png',
    prompt: 'Upscale this image to 4x resolution maintaining quality',
  }),
});
```

**Output:**
- Resolução: 4x original (ex: 512x512 → 2048x2048)
- Qualidade: Detalhes preservados, sem pixelização
- Formato: PNG ou WebP

---

### 6. Design Assistant (Chat)

**Custo:** 2 créditos por mensagem  
**Ação:** `chat`

**Código:**
```typescript
const response = await fetch('/api/design-studio', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    action: 'chat',
    user_id: userId,
    prompt: 'What are the design trends for 2025?',
  }),
});

const { text } = await response.json();
```

**Features:**
- Contextual responses
- Design expertise
- Code snippets (CSS, Tailwind)
- Best practices
- Trend analysis

---

## 💳 Sistema de Créditos

### Middleware: `withCredits`

**Localização:** `lib/api/withCredits.ts`

```typescript
export function withCredits(
  handler: (req: Request, context: any) => Promise<Response>,
  creditCost: number,
  operationType: string
) {
  return async (req: Request, context: any) => {
    const userId = await getUserId(req);
    
    // 1. Verificar se é admin
    const isAdmin = await checkAdmin(userId);
    if (isAdmin) {
      // Bypass: créditos ilimitados
      return handler(req, context);
    }
    
    // 2. Verificar saldo
    const credits = await getUserCredits(userId);
    if (credits < creditCost) {
      return Response.json(
        { error: 'Créditos insuficientes' },
        { status: 402 }
      );
    }
    
    // 3. Debitar créditos
    await deductCredits(userId, creditCost, operationType);
    
    // 4. Executar operação
    const response = await handler(req, context);
    
    // 5. Log de auditoria
    await logOperation(userId, operationType, creditCost);
    
    return response;
  };
}
```

### Custos por Operação

```typescript
const CREDIT_COSTS = {
  design_generate_image: 10,
  design_edit_image: 8,
  design_upscale_image: 7,
  design_remove_background: 6,
  design_analyze_image: 5,
  design_assistant: 2,
} as const;
```

### Tabela de Créditos (Supabase)

```sql
CREATE TABLE user_credits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  credits INTEGER NOT NULL DEFAULT 100,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  amount INTEGER NOT NULL,
  operation_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 📱 Interface iOS

### Bottom Sheet

**Componente:** `BottomSheet.tsx`

```typescript
export function BottomSheet({ children }: { children: React.ReactNode }) {
  const [height, setHeight] = useState<'half' | 'full'>('half');
  
  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl"
      style={{
        height: height === 'half' ? '50vh' : '90vh',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      onDragEnd={(e, info) => {
        if (info.offset.y < -100) setHeight('full');
        if (info.offset.y > 100) setHeight('half');
      }}
    >
      <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3" />
      {children}
    </motion.div>
  );
}
```

### Safe Area Insets

```css
/* globals.css */
.ios-safe-top {
  padding-top: env(safe-area-inset-top);
}

.ios-safe-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

.ios-safe-left {
  padding-left: env(safe-area-inset-left);
}

.ios-safe-right {
  padding-right: env(safe-area-inset-right);
}
```

### Canvas iOS

```typescript
function CanvasIOS() {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const handlePinch = (event: any) => {
    setScale(event.scale);
  };
  
  const handlePan = (event: any) => {
    setPosition({
      x: position.x + event.delta.x,
      y: position.y + event.delta.y,
    });
  };
  
  return (
    <div
      className="relative w-full h-full overflow-hidden"
      onTouchStart={handlePinch}
      onTouchMove={handlePan}
    >
      <img
        src={imageUrl}
        style={{
          transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
          transition: 'transform 0.1s ease-out',
        }}
        className="max-w-full h-auto"
      />
    </div>
  );
}
```

---

## 💻 Interface Desktop

### Vertical Toolbar

```typescript
function DesktopToolbar() {
  return (
    <aside className="hidden lg:flex flex-col w-20 bg-gray-900 border-r border-gray-800">
      <ToolButton icon={Sparkles} label="Generate" />
      <ToolButton icon={Edit} label="Edit" />
      <ToolButton icon={Search} label="Analyze" />
      <ToolButton icon={Eraser} label="Remove BG" />
      <ToolButton icon={ArrowUp} label="Upscale" />
      <ToolButton icon={MessageSquare} label="Chat" />
    </aside>
  );
}
```

### Split Panel Desktop

```typescript
function DesktopLayout() {
  return (
    <div className="flex h-screen">
      {/* Toolbar */}
      <DesktopToolbar />
      
      {/* Canvas */}
      <main className="flex-1 flex items-center justify-center bg-gray-50">
        <Canvas />
      </main>
      
      {/* Side Panel */}
      <aside className="w-80 bg-white border-l border-gray-200 p-6">
        <SidePanelTabs />
      </aside>
    </div>
  );
}
```

### Responsive Breakpoints

```typescript
// tailwind.config.ts
export default {
  theme: {
    screens: {
      'sm': '640px',   // Mobile landscape
      'md': '768px',   // Tablet portrait
      'lg': '1024px',  // Desktop (toolbar switch)
      'xl': '1280px',  // Large desktop
      '2xl': '1536px', // Ultra wide
    },
  },
};
```

---

## 🤖 Integração Google Gemini

### Configuração

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash-image',
  generationConfig: {
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
  },
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    // ... outros
  ],
});
```

### Generate Image

```typescript
async function generateImage(prompt: string, config: any) {
  const result = await model.generateContent([
    {
      text: prompt,
      // Image generation parameters
      imageGenerationConfig: {
        numberOfImages: config.numberOfImages || 1,
        aspectRatio: config.aspectRatio || '1:1',
        negativePrompt: 'blurry, low quality, distorted',
      },
    },
  ]);
  
  const response = result.response;
  const images = response.candidates?.[0]?.content?.parts
    ?.filter(part => part.inlineData)
    .map(part => ({
      data: part.inlineData.data,
      mimeType: part.inlineData.mimeType,
    }));
  
  return images;
}
```

### Edit Image

```typescript
async function editImage(imageData: string, prompt: string, mimeType: string) {
  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: imageData,
        mimeType: mimeType,
      },
    },
  ]);
  
  // Extrai imagem editada
  const editedImage = result.response.candidates?.[0]?.content?.parts
    ?.find(part => part.inlineData);
  
  return {
    data: editedImage?.inlineData?.data,
    mimeType: editedImage?.inlineData?.mimeType,
  };
}
```

### Analyze Image

```typescript
async function analyzeImage(imageData: string, mimeType: string) {
  const result = await model.generateContent([
    `Analyze this design in detail:
     - Color palette and theory
     - Typography assessment
     - Composition and balance
     - Suggest 3 specific improvements`,
    {
      inlineData: {
        data: imageData,
        mimeType: mimeType,
      },
    },
  ]);
  
  return result.response.text();
}
```

---

## 🔄 Fluxo de Dados

### 1. User Input → Frontend

```
┌──────────┐
│  User    │ Escreve prompt: "Create a logo..."
└────┬─────┘
     │
     ▼
┌──────────────┐
│  Form Input  │ Valida prompt (min 10 chars)
└────┬─────────┘
     │
     ▼
┌──────────────┐
│ Submit Click │ Trigger onGenerate()
└──────────────┘
```

### 2. Frontend → API

```typescript
// app/designstudio/create/page.tsx
async function handleGenerate() {
  setLoading(true);
  
  try {
    const response = await fetch('/api/design-studio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        action: 'generateImage',
        user_id: session.user.id,
        prompt: userPrompt,
        config: {
          numberOfImages: 1,
          aspectRatio: '1:1',
        },
      }),
    });
    
    if (!response.ok) {
      throw new Error('Generation failed');
    }
    
    const { images, creditsRemaining } = await response.json();
    
    setGeneratedImage(images[0]);
    setCredits(creditsRemaining);
    addToHistory(images[0]);
    
  } catch (error) {
    showError(error.message);
  } finally {
    setLoading(false);
  }
}
```

### 3. API → Credits Middleware

```
┌─────────────┐
│ API Request │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│ withCredits()    │ Verifica admin + saldo
└──────┬───────────┘
       │
       ├─ Admin? → Bypass (créditos ilimitados)
       │
       └─ User? → Verifica saldo
                   │
                   ├─ Saldo OK → Debita créditos
                   │
                   └─ Saldo baixo → Erro 402
```

### 4. API → Google Gemini

```
┌──────────────┐
│ Handler      │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ Google GenAI     │ model.generateContent()
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Gemini API       │ Processa prompt + gera imagem
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Response         │ Base64 PNG + metadata
└──────────────────┘
```

### 5. API → Frontend

```typescript
// Response JSON
{
  "images": [
    {
      "data": "iVBORw0KGgoAAAANS...", // Base64
      "mimeType": "image/png",
      "width": 1024,
      "height": 1024
    }
  ],
  "creditsUsed": 10,
  "creditsRemaining": 90,
  "model": "gemini-2.5-flash-image"
}
```

### 6. Frontend → UI Update

```
┌──────────────┐
│ Response OK  │
└──────┬───────┘
       │
       ├─ setGeneratedImage(images[0])
       │
       ├─ setCredits(creditsRemaining)
       │
       ├─ addToHistory(image)
       │
       └─ showSuccess("Image generated!")
```

---

## 🚀 Deployment

### Vercel Configuration

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "GOOGLE_API_KEY": "@google-api-key",
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-key"
  },
  "regions": ["iad1"],
  "functions": {
    "app/api/design-studio/route.ts": {
      "maxDuration": 60,
      "memory": 1024
    }
  }
}
```

### Environment Variables (Vercel)

```bash
# Production
vercel env add GOOGLE_API_KEY production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production

# Preview
vercel env add GOOGLE_API_KEY preview

# Development
vercel env pull .env.local
```

### Build & Deploy

```bash
# Local build test
npm run build

# Deploy preview
vercel

# Deploy production
vercel --prod

# Check deployment
vercel logs https://v0-remix-of-untitled-chat.vercel.app
```

---

## 📊 Monitoring & Analytics

### Error Tracking

```typescript
// lib/monitoring/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// In API route
try {
  // ... operation
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      operation: 'generateImage',
      user_id: userId,
    },
  });
  throw error;
}
```

### Performance Metrics

```typescript
// lib/monitoring/performance.ts
export async function trackPerformance(
  operation: string,
  userId: string,
  duration: number
) {
  await supabase.from('performance_logs').insert({
    operation,
    user_id: userId,
    duration_ms: duration,
    timestamp: new Date().toISOString(),
  });
}

// Usage
const start = Date.now();
const result = await generateImage(prompt);
const duration = Date.now() - start;
await trackPerformance('generateImage', userId, duration);
```

---

## 🔒 Segurança

### API Key Protection

```typescript
// ❌ NUNCA fazer isso
const GOOGLE_API_KEY = 'AIzaSy...'; // Hardcoded

// ✅ Correto
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

if (!GOOGLE_API_KEY) {
  throw new Error('GOOGLE_API_KEY not configured');
}
```

### Input Sanitization

```typescript
function sanitizePrompt(prompt: string): string {
  // Remove caracteres perigosos
  return prompt
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .trim()
    .slice(0, 2000); // Max 2000 chars
}
```

### Rate Limiting

```typescript
// lib/rateLimit.ts
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 req/min
});

export async function checkRateLimit(userId: string) {
  const { success } = await ratelimit.limit(userId);
  
  if (!success) {
    throw new Error('Rate limit exceeded');
  }
}
```

---

## 📝 Exemplos de Uso

### Exemplo 1: Generate Logo

```typescript
const response = await fetch('/api/design-studio', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    action: 'generateImage',
    user_id: 'user-123',
    prompt: `Create a minimalist logo for "DUA Tech"
      - Colors: Purple (#8B5CF6) and Pink (#EC4899) gradient
      - Style: Geometric, modern, clean lines
      - Format: Icon + text
      - Mood: Premium, innovative, trustworthy`,
    config: {
      numberOfImages: 1,
      aspectRatio: '1:1',
      safetySettings: 'default',
    },
  }),
});

const { images } = await response.json();
const logoUrl = `data:image/png;base64,${images[0].data}`;
```

### Exemplo 2: Batch Processing

```typescript
async function processMultipleImages(prompts: string[]) {
  const results = await Promise.all(
    prompts.map(async (prompt) => {
      const response = await fetch('/api/design-studio', {
        method: 'POST',
        body: JSON.stringify({
          action: 'generateImage',
          user_id: userId,
          prompt,
        }),
      });
      return response.json();
    })
  );
  
  return results;
}

// Usage
const prompts = [
  'Logo version A: Purple gradient',
  'Logo version B: Pink gradient',
  'Logo version C: Blue gradient',
];

const variations = await processMultipleImages(prompts);
```

---

## 🎓 Best Practices

### 1. Prompt Engineering

```typescript
// ❌ Prompt vago
"Create a logo"

// ✅ Prompt detalhado
`Create a minimalist logo design:
 - Company: "DUA Tech" (AI platform)
 - Colors: Purple (#8B5CF6) to Pink (#EC4899) gradient
 - Style: Geometric shapes, clean lines, modern
 - Elements: Abstract symbol + text
 - Mood: Premium, innovative, professional
 - Format: Vector-style, scalable
 - Avoid: Realistic textures, complex details`
```

### 2. Error Handling

```typescript
async function handleGenerateWithRetry(prompt: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await generateImage(prompt);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Exponential backoff
      await new Promise(r => setTimeout(r, 2 ** i * 1000));
    }
  }
}
```

### 3. Image Optimization

```typescript
import sharp from 'sharp';

async function optimizeImage(base64: string) {
  const buffer = Buffer.from(base64, 'base64');
  
  const optimized = await sharp(buffer)
    .resize(1024, 1024, { fit: 'inside' })
    .png({ quality: 90, compressionLevel: 9 })
    .toBuffer();
  
  return optimized.toString('base64');
}
```

---

## 📞 Suporte

**Documentação:** `/docs/design-studio`  
**API Reference:** `/api-docs`  
**GitHub:** https://github.com/subreviva/v0-remix-of-untitled-chat  
**Issues:** https://github.com/subreviva/v0-remix-of-untitled-chat/issues

---

**Versão:** 1.0.0  
**Última atualização:** 14 de Novembro de 2025  
**Autor:** DUA Tech Team

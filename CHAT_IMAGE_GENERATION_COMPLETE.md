# 🎨 SISTEMA DE GERAÇÃO DE IMAGENS NO CHAT

## 📋 Resumo Executivo

Sistema implementado para gerar imagens diretamente no chat usando FLUX-FAST via Replicate API.

**Oferta Especial:**
- 🎁 **2 imagens GRÁTIS** por usuário
- 💰 Depois: **1 crédito** por imagem adicional

---

## ⚡ Especificações Técnicas

### API Model
- **Provider:** Replicate
- **Model:** `prunaai/flux-fast`
- **Performance:** ~2-3 segundos por imagem
- **Qualidade:** Alta qualidade, aspect ratio 1:1

### Configuração
```bash
# .env.local
REPLICATE_API_TOKEN=your_replicate_token_here
```

---

## 🎯 Sistema de Créditos

### Lógica de Cobrança

```typescript
const IMAGENS_GRATIS_POR_USUARIO = 2;
const CREDITO_IMAGEM_CHAT = 1;

// Usuário com 0 imagens geradas
chat_images_generated = 0
→ Imagem 1: GRÁTIS ✅
→ Saldo: 0 → 0

// Usuário com 1 imagem gerada
chat_images_generated = 1
→ Imagem 2: GRÁTIS ✅
→ Saldo: 0 → 0

// Usuário com 2 imagens geradas
chat_images_generated = 2
→ Imagem 3: COBRA 1 CRÉDITO 💰
→ Saldo: 150 → 149

// Créditos insuficientes
chat_images_generated = 5, creditos_servicos = 0
→ Erro 402: Créditos insuficientes
```

---

## 📊 Database Schema

### Nova Coluna: `chat_images_generated`

```sql
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS chat_images_generated INTEGER DEFAULT 0;

COMMENT ON COLUMN public.users.chat_images_generated IS 
  'Number of images generated in chat (2 free, then 1 credit each)';
```

**Aplicar:**
```bash
chmod +x apply-chat-images-sql.sh
./apply-chat-images-sql.sh
```

Ou executar manualmente no Supabase Dashboard.

---

## 🔧 API Endpoint

### POST `/api/chat/generate-image`

**Request:**
```json
{
  "prompt": "a futuristic city at sunset"
}
```

**Response (Grátis):**
```json
{
  "success": true,
  "imageUrl": "https://replicate.delivery/.../output.jpeg",
  "creditsCharged": 0,
  "creditsRemaining": 150,
  "imagesGenerated": 1,
  "freeImagesRemaining": 1,
  "isFree": true
}
```

**Response (Cobrado):**
```json
{
  "success": true,
  "imageUrl": "https://replicate.delivery/.../output.jpeg",
  "creditsCharged": 1,
  "creditsRemaining": 149,
  "imagesGenerated": 3,
  "freeImagesRemaining": 0,
  "isFree": false
}
```

**Response (Erro - Sem créditos):**
```json
{
  "error": "Créditos insuficientes",
  "message": "Você já usou suas 2 imagens grátis. Precisa de 1 crédito para gerar mais imagens.",
  "freeImagesUsed": 5,
  "creditsRequired": 1,
  "creditsAvailable": 0
}
```

---

## 🎨 Parâmetros de Geração

```typescript
const input = {
  prompt: string,          // Descrição da imagem
  num_outputs: 1,          // Sempre 1 imagem
  aspect_ratio: "1:1",     // Quadrado perfeito
  output_format: "jpg",    // JPEG para menor tamanho
  output_quality: 80,      // Qualidade ótima
};
```

---

## 📝 Registro de Transações

### Formato `duaia_transactions`

```typescript
{
  user_id: "uuid",
  transaction_type: "debit",
  amount: -1,
  balance_before: 150,
  balance_after: 149,
  operation: "chat_image_generation",
  description: "Geração de imagem no chat",
  metadata: {
    prompt: "a futuristic city...",
    model: "prunaai/flux-fast",
    image_number: 3
  }
}
```

**Importante:** Transações só são criadas quando há cobrança (após 2 imagens grátis).

---

## 🧪 Testes

### Teste 1: Verificar API Replicate
```bash
node test-flux-fast.mjs
```

**Resultado Esperado:**
```
✅ Gerada em 2.91s
🔗 URL: https://replicate.delivery/.../output.jpeg
```

### Teste 2: Endpoint completo
```bash
# Em breve: test-chat-image-generation.mjs
```

---

## 🚀 Integração no Chat

### Frontend (Exemplo)

```typescript
async function generateImageInChat(prompt: string) {
  try {
    const response = await fetch('/api/chat/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    const data = await response.json();

    if (response.status === 402) {
      // Sem créditos
      toast.error(data.message);
      return null;
    }

    if (!response.ok) {
      throw new Error(data.error);
    }

    // Mostrar imagem no chat
    addMessageToChat({
      type: 'image',
      url: data.imageUrl,
      isFree: data.isFree,
      creditsCharged: data.creditsCharged
    });

    // Atualizar UI de créditos
    updateCreditsDisplay(data.creditsRemaining);

    return data;

  } catch (error) {
    console.error('Erro ao gerar imagem:', error);
    toast.error('Erro ao gerar imagem');
    return null;
  }
}
```

### Detecção de Pedidos de Imagem

```typescript
function detectImageRequest(userMessage: string): string | null {
  const patterns = [
    /gera(?:r)?\s+(?:uma\s+)?imagem\s+(?:de\s+)?(.+)/i,
    /cria(?:r)?\s+(?:uma\s+)?imagem\s+(?:de\s+)?(.+)/i,
    /faz\s+(?:uma\s+)?imagem\s+(?:de\s+)?(.+)/i,
    /desenha\s+(.+)/i,
    /mostra\s+(?:uma\s+)?imagem\s+(?:de\s+)?(.+)/i,
  ];

  for (const pattern of patterns) {
    const match = userMessage.match(pattern);
    if (match && match[1]) {
      return match[1].trim(); // Retorna o prompt
    }
  }

  return null;
}

// Uso
const userMessage = "gera uma imagem de um gato astronauta";
const prompt = detectImageRequest(userMessage);

if (prompt) {
  await generateImageInChat(prompt);
}
```

---

## 💰 Economia de Custos

### Replicate Pricing
- **FLUX-FAST:** ~$0.003 por imagem
- **Tempo médio:** 2-3 segundos

### Sistema DUA
- **2 imagens grátis:** $0.006 de custo para DUA
- **3ª imagem em diante:** 1 crédito (€0.03-0.05 valor real)
- **Margem:** ~90% de lucro por imagem paga

### Exemplo de Uso
```
Usuário usa 10 imagens:
- 2 grátis = $0.006 (custo DUA)
- 8 pagas = 8 créditos = €0.24-0.40 (receita)
- Custo 8 imagens = $0.024 (€0.022)
- Lucro = €0.22-0.38 (90%+ margem)
```

---

## ✅ Arquivos Criados/Modificados

### 1. API Route
`/app/api/chat/generate-image/route.ts` (165 linhas)
- Verificação de autenticação
- Lógica de oferta (2 grátis + créditos)
- Integração Replicate
- Registro de transações

### 2. Migration SQL
`/supabase/migrations/add_chat_images_counter.sql`
- Adiciona coluna `chat_images_generated`

### 3. Scripts de Teste
- `test-flux-fast.mjs` - Teste direto API Replicate
- `add-chat-images-column.mjs` - Adicionar coluna automaticamente
- `apply-chat-images-sql.sh` - Aplicar SQL manualmente

### 4. Configuração
`.env.local` - Adicionado `REPLICATE_API_TOKEN`

---

## 🎯 Próximos Passos

### Frontend (Pendente)
1. **Detecção automática** - Identificar pedidos de imagem no chat
2. **Componente de imagem** - Mostrar imagem gerada com estilo
3. **Loading state** - Spinner durante geração (~3s)
4. **Badge de créditos** - Mostrar "GRÁTIS" ou "1 crédito"
5. **Contador visual** - "X de 2 imagens grátis usadas"

### Integrações (Opcional)
1. **Histórico de imagens** - Galeria de imagens geradas
2. **Download de imagens** - Botão para baixar
3. **Compartilhamento** - Share URL da imagem
4. **Edição** - Regenerar com prompt ajustado

---

## 🔐 Segurança

### Rate Limiting
- ✅ 2 imagens grátis por usuário (permanente)
- ✅ Créditos verificados antes de gerar
- ⚠️ TODO: Rate limit temporal (ex: 10 imagens/hora)

### Validação
- ✅ Autenticação obrigatória
- ✅ Prompt sanitizado (máx 1000 chars)
- ✅ Verificação de saldo em tempo real
- ⚠️ TODO: Content moderation (filtro NSFW)

### Custos
- ✅ Limite de 2 grátis previne abuso inicial
- ✅ Cobrança automática após limite
- ✅ Transações registradas para auditoria

---

## 📈 Métricas Sugeridas

### Analytics
```sql
-- Total de imagens geradas
SELECT SUM(chat_images_generated) FROM users;

-- Usuários que usaram 2+ imagens (conversão)
SELECT COUNT(*) FROM users WHERE chat_images_generated >= 2;

-- Média de imagens por usuário
SELECT AVG(chat_images_generated) FROM users;

-- Receita de imagens (créditos cobrados)
SELECT 
  COUNT(*) as imagens_pagas,
  COUNT(*) * 1 as creditos_consumidos
FROM duaia_transactions 
WHERE operation = 'chat_image_generation';
```

---

## ✨ Diferencial Competitivo

**Antes:**
- Usuários sem imagens no chat
- Necessário sair para outro serviço

**Depois:**
- Geração inline no chat
- 2 imagens grátis para experimentar
- Modelo FLUX-FAST ultra rápido (~3s)
- Preço justo (1 crédito = €0.03-0.05)

**Resultado:** Experiência completa e fluida! 🎨✨

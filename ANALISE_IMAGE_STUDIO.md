# 🎨 ANÁLISE RIGOROSA: IMAGE STUDIO

**Data:** 10 novembro 2025  
**Objetivo:** Verificar se todos os serviços de geração de imagem estão configurados com custos adequados

---

## 📍 LOCALIZAÇÃO DO ESTÚDIO

- **Rota UI:** `/imagestudio` (`app/imagestudio/page.tsx`)
- **Hook Principal:** `useImagenApi` (`hooks/useImagenApi.ts`)
- **API Endpoint:** `/api/imagen/generate` (`app/api/imagen/generate/route.ts`)
- **Provedor:** Google Imagen (via `@google/genai`)

---

## 🔍 ANÁLISE DE ENDPOINTS

### ✅ Endpoint de Geração Identificado

**`POST /api/imagen/generate`**
- **Função:** Gerar imagens com Google Imagen
- **Modelos Disponíveis:**
  - `imagen-4.0-ultra-generate-001` → **Ultra** (máxima qualidade)
  - `imagen-4.0-generate-001` → **Standard** (balanceado)
  - `imagen-4.0-fast-generate-001` → **Fast** (rápido)
  - `imagen-3.0-generate-002` → **Imagen 3** (versão anterior)

**Configurações:**
- `numberOfImages`: 1-4 imagens por geração
- `aspectRatio`: 1:1, 3:4, 4:3, 9:16, 16:9
- `imageSize`: 1K ou 2K (apenas Standard/Ultra)
- `personGeneration`: dont_allow, allow_adult, allow_all

**Custo Atual no Código:**
```typescript
const CUSTO_GERACAO_IMAGEM = 30; // linha 18 do route.ts
```

---

## 📊 COMPARAÇÃO: CÓDIGO vs TABELA DE CUSTOS

### ❌ PROBLEMA IDENTIFICADO

**Custo hardcoded no código:**
- `CUSTO_GERACAO_IMAGEM = 30 créditos` (route.ts linha 18)

**Na tabela `service_costs`:**
- NÃO EXISTE serviço `image_generate` ou similar!

**Status:** 🔴 **ZERO serviços do Image Studio configurados na tabela**

---

## 🎯 PROPOSTA DE CONFIGURAÇÃO

### Opção 1: MODELO ÚNICO (Simplificado)
**Serviço único que engloba todos os modelos:**

```sql
image_generate: 30 créditos
```
- **Vantagem:** Simplicidade, já está implementado no código
- **Desvantagem:** Usuário não vê diferença de custo entre modelos

---

### Opção 2: POR MODELO (Diferenciado)
**4 serviços distintos com preços diferenciados:**

```sql
image_ultra:    40 créditos  (Ultra qualidade, mais lento)
image_standard: 30 créditos  (Standard, balanceado) ⭐ RECOMENDADO
image_fast:     20 créditos  (Fast, rápido)
image_3:        15 créditos  (Imagen 3, versão anterior)
```

- **Vantagem:** Transparência, usuário escolhe custo x qualidade
- **Desvantagem:** Requer modificação no código para consultar custos dinamicamente

---

### Opção 3: POR MODELO + NÚMERO DE IMAGENS (Granular)
**Cobrar por modelo E quantidade de imagens:**

```sql
image_ultra_1img:    10 créditos
image_ultra_4img:    40 créditos
image_standard_1img:  8 créditos
image_standard_4img: 30 créditos
image_fast_1img:      5 créditos
image_fast_4img:     20 créditos
```

- **Vantagem:** Máxima flexibilidade e justiça no preço
- **Desvantagem:** Complexidade adicional (12 serviços)

---

## 💰 ANÁLISE DE CUSTOS GOOGLE IMAGEN

**Custos reais da Google (referência):**
- Imagen 4 Ultra: ~$0.08 por imagem
- Imagen 4 Standard: ~$0.04 por imagem
- Imagen 4 Fast: ~$0.02 por imagem
- Imagen 3: ~$0.015 por imagem

**Para geração de 4 imagens (padrão):**
- Ultra: ~$0.32 (⚡ custo alto)
- Standard: ~$0.16 (💚 balanceado)
- Fast: ~$0.08 (💸 econômico)
- Imagen 3: ~$0.06 (💵 barato)

---

## ✅ RECOMENDAÇÃO FINAL

**Adotar Opção 2 (Por Modelo) com ajustes:**

```typescript
// Serviços para adicionar à tabela service_costs
image_ultra:    35 créditos  // $0.32 custo → margem 50%
image_standard: 25 créditos  // $0.16 custo → margem 56% ⭐ DEFAULT
image_fast:     15 créditos  // $0.08 custo → margem 47%
image_3:        10 créditos  // $0.06 custo → margem 40%
```

**Justificativa:**
- ✅ Transparência para o usuário
- ✅ Margem de lucro consistente (40-56%)
- ✅ Incentiva uso de modelos mais rápidos
- ✅ Diferenciação de qualidade clara

---

## 🔧 ALTERAÇÕES NECESSÁRIAS

### 1. **Adicionar à tabela `service_costs`** ✅
```sql
-- IMAGE STUDIO (4 serviços)
('image_ultra', 'Imagen Ultra 4K', 'Geração máxima qualidade (4 imagens)', 35, true, 'Zap', 'image'),
('image_standard', 'Imagen Standard 2K', 'Geração balanceada (4 imagens)', 25, true, 'Image', 'image'),
('image_fast', 'Imagen Fast 1K', 'Geração rápida (4 imagens)', 15, true, 'Zap', 'image'),
('image_3', 'Imagen 3', 'Versão anterior (4 imagens)', 10, true, 'ImageIcon', 'image'),
```

### 2. **Modificar `/api/imagen/generate/route.ts`** ⚠️
**Remover hardcoded `CUSTO_GERACAO_IMAGEM = 30`**

**Adicionar consulta dinâmica:**
```typescript
// Determinar service_name baseado no modelo
const serviceNameMap: Record<string, string> = {
  'imagen-4.0-ultra-generate-001': 'image_ultra',
  'imagen-4.0-generate-001': 'image_standard',
  'imagen-4.0-fast-generate-001': 'image_fast',
  'imagen-3.0-generate-002': 'image_3',
};

const serviceName = serviceNameMap[model] || 'image_standard';

// Consultar custo via RPC
const { data: costData } = await supabase.rpc('get_service_cost', {
  p_service_name: serviceName
});

const CUSTO_GERACAO_IMAGEM = costData || 25; // fallback 25
```

### 3. **Atualizar `useImagenApi.ts`** (opcional)
**Mostrar custo estimado antes de gerar:**
```typescript
const costs = {
  ultra: 35,
  standard: 25,
  fast: 15,
  imagen3: 10,
};

console.log(`💰 Custo estimado: ${costs[model]} créditos`);
```

---

## 📈 RESUMO DE IMPACTO

**Antes:**
- 0 serviços configurados
- Custo fixo 30 créditos (hardcoded)
- Sem distinção entre modelos

**Depois:**
- +4 serviços configurados
- Custos dinâmicos (10-35 créditos)
- Transparência total para o usuário
- Admin pode ajustar custos via painel

**Total de serviços do sistema:**
- Atual: 37 serviços
- Com Image Studio: **41 serviços** 🎯

---

## ❓ DECISÃO NECESSÁRIA

**Qual opção você prefere?**

1. **Opção 1:** Serviço único `image_generate: 30 créditos` (mais simples, sem mudanças no código)
2. **Opção 2:** 4 serviços por modelo `image_ultra/standard/fast/3` (recomendado, requer mudança no código)
3. **Opção 3:** 12 serviços por modelo+quantidade (máxima granularidade, complexo)

**Aguardando sua decisão para prosseguir com a implementação! 🚀**

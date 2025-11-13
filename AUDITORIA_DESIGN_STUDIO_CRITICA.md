# 🚨 AUDITORIA CRÍTICA: DESIGN STUDIO SEM CRÉDITOS

## ❌ PROBLEMA CRÍTICO IDENTIFICADO

**Taxa de Conformidade: 67.9% (24 falhas críticas)**

### 📊 SITUAÇÃO ATUAL

| Endpoint | Status | Créditos Config | checkCredits | deductCredits | 402 Error |
|----------|--------|-----------------|--------------|---------------|-----------|
| ✅ gemini-flash-image | **FUNCIONAL** | ✅ 5 créditos | ✅ | ✅ | ✅ |
| ❌ generate-image | **MOCK** | ✅ 4 créditos | ❌ | ❌ | ❌ |
| ❌ generate-svg | **MOCK** | ✅ 6 créditos | ❌ | ❌ | ❌ |
| ❌ edit-image | **MOCK** | ✅ 5 créditos | ❌ | ❌ | ❌ |
| ❌ variations | **MOCK** | ✅ 8 créditos | ❌ | ❌ | ❌ |
| ❌ analyze-image | **MOCK** | ✅ 2 créditos | ❌ | ❌ | ❌ |
| ❌ color-palette | **MOCK** | ✅ 2 créditos | ❌ | ❌ | ❌ |
| ❌ research-trends | **MOCK** | ✅ 3 créditos | ❌ | ❌ | ❌ |
| ❌ enhance-prompt | **MOCK** | ✅ 1 crédito | ❌ | ❌ | ❌ |

### ⚠️ ENDPOINTS SEM IMPLEMENTAÇÃO

| Ferramenta | Créditos | Status |
|------------|----------|--------|
| generate-logo | 6 | ⚠️ Sem endpoint dedicado |
| generate-icon | 4 | ⚠️ Sem endpoint dedicado |
| generate-pattern | 4 | ⚠️ Sem endpoint dedicado |
| remove-background | 5 | ⚠️ Sem endpoint dedicado |
| upscale-image | 6 | ⚠️ Sem endpoint dedicado |
| export-project | 0 | ⚠️ Sem endpoint dedicado (grátis) |

---

## 🔥 IMPACTO

### ❌ CRÍTICO (8 endpoints)
**USUÁRIOS PODEM USAR SEM PAGAR!**

Endpoints que existem mas **NÃO cobram créditos**:
1. `generate-image` - 4 créditos configurados, **NÃO cobra**
2. `generate-svg` - 6 créditos configurados, **NÃO cobra**
3. `edit-image` - 5 créditos configurados, **NÃO cobra**
4. `variations` - 8 créditos configurados, **NÃO cobra**
5. `analyze-image` - 2 créditos configurados, **NÃO cobra**
6. `color-palette` - 2 créditos configurados, **NÃO cobra**
7. `research-trends` - 3 créditos configurados, **NÃO cobra**
8. `enhance-prompt` - 1 crédito configurado, **NÃO cobra**

**Total de créditos sendo dados GRÁTIS por operação: até 36 créditos!**

### ⚠️ MÉDIO (6 ferramentas)
Ferramentas sem endpoint dedicado - provavelmente usam endpoints genéricos que também podem não estar cobrando.

---

## ✅ ÚNICO ENDPOINT FUNCIONAL

**`gemini-flash-image`** - Este é o **ÚNICO** endpoint com:
- ✅ checkCredits ANTES da operação
- ✅ deductCredits DEPOIS do sucesso
- ✅ 402 Payment Required se créditos insuficientes
- ✅ Metadata completo
- ✅ Error handling adequado

**Este deve ser o MODELO PADRÃO para todos os outros!**

---

## 🎯 PLANO DE AÇÃO URGENTE

### PRIORIDADE 1: CORRIGIR ENDPOINTS CRÍTICOS (24-48h)

Para cada endpoint que já existe mas NÃO cobra créditos:

1. **generate-image/route.ts**
   - Adicionar import: `checkCredits`, `deductCredits` de `@/lib/credits/credits-service`
   - Adicionar ANTES da operação: `checkCredits(user_id, 'design_generate_image')`
   - Adicionar DEPOIS do sucesso: `deductCredits(user_id, 'design_generate_image', metadata)`
   - Adicionar retorno 402 se créditos insuficientes
   - **Tempo estimado: 30min**

2. **generate-svg/route.ts**
   - Mesmo padrão acima
   - Operation: `design_generate_svg`
   - **Tempo estimado: 30min**

3. **edit-image/route.ts**
   - Mesmo padrão acima
   - Operation: `design_edit_image`
   - **Tempo estimado: 30min**

4. **variations/route.ts**
   - Mesmo padrão acima
   - Operation: `design_generate_variations`
   - **Tempo estimado: 30min**

5. **analyze-image/route.ts**
   - Mesmo padrão acima
   - Operation: `design_analyze_image`
   - **Tempo estimado: 30min**

6. **color-palette/route.ts**
   - Mesmo padrão acima
   - Operation: `design_extract_colors`
   - **Tempo estimado: 30min**

7. **research-trends/route.ts**
   - Mesmo padrão acima
   - Operation: `design_trends`
   - **Tempo estimado: 30min**

8. **enhance-prompt/route.ts**
   - Mesmo padrão acima
   - Operation: `design_assistant`
   - **Tempo estimado: 30min**

**Total: 4 horas de trabalho**

### PRIORIDADE 2: CRIAR ENDPOINTS FALTANTES (1 semana)

Para ferramentas sem endpoint dedicado, criar endpoints seguindo o padrão de `gemini-flash-image`:

1. **generate-logo/route.ts** (6 créditos)
2. **generate-icon/route.ts** (4 créditos)
3. **generate-pattern/route.ts** (4 créditos)
4. **remove-background/route.ts** (5 créditos)
5. **upscale-image/route.ts** (6 créditos)
6. **export-project/route.ts** (0 créditos - grátis, mas com rate limiting)

**Tempo estimado: 6-8 horas**

### PRIORIDADE 3: VERIFICAR ENDPOINTS GENÉRICOS

Verificar se `design-studio/route.ts` e `design-studio-v2/route.ts` estão cobrando créditos corretamente para as ferramentas que não têm endpoint dedicado.

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

Para cada endpoint, seguir este padrão (baseado em `gemini-flash-image`):

```typescript
import { checkCredits, deductCredits } from '@/lib/credits/credits-service';
import type { CreditOperation } from '@/lib/credits/credits-config';

export async function POST(req: NextRequest) {
  try {
    // 1. Parse request
    const body = await req.json();
    const { user_id, ...params } = body;

    // 2. Validar user_id
    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id obrigatório' },
        { status: 400 }
      );
    }

    // 3. CHECK CREDITS BEFORE
    const operation: CreditOperation = 'design_XXX'; // Substituir pelo correto
    const creditCheck = await checkCredits(user_id, operation);

    if (!creditCheck.success) {
      return NextResponse.json(
        {
          error: creditCheck.message,
          required: creditCheck.required,
          current: creditCheck.currentBalance,
          deficit: creditCheck.deficit,
        },
        { status: 402 } // Payment Required
      );
    }

    // 4. EXECUTAR OPERAÇÃO
    // ... código da operação ...

    // 5. DEDUCT CREDITS AFTER SUCCESS
    const deduction = await deductCredits(user_id, operation, {
      // metadata relevante
    });

    if (!deduction.success) {
      console.error('❌ Falha ao deduzir créditos:', deduction.error);
    }

    // 6. RETORNAR SUCESSO
    return NextResponse.json({
      success: true,
      // ... dados da resposta ...
    });

  } catch (error) {
    console.error('❌ Erro:', error);
    return NextResponse.json(
      { error: 'Erro interno' },
      { status: 500 }
    );
  }
}
```

### ✅ VALIDAÇÕES NECESSÁRIAS

Para cada endpoint implementado:
- [ ] `user_id` obrigatório (400 se faltando)
- [ ] `checkCredits` ANTES da operação
- [ ] `deductCredits` DEPOIS do sucesso
- [ ] **NÃO deduz** se operação falhar
- [ ] Retorna 402 se créditos insuficientes
- [ ] Metadata completo no deductCredits
- [ ] Error handling adequado (401, 429, 503)
- [ ] Logs detalhados

---

## 🧪 TESTES A EXECUTAR

Após cada correção:

```bash
node test-design-studio-credits-ultra.mjs
```

**Objetivo: 100% de conformidade (106/106 testes passando)**

---

## 📈 MÉTRICAS DE SUCESSO

### Antes da Correção
- ✅ Passa: 72/106 (67.9%)
- ❌ Falha: 24/106 (22.6%)
- ⚠️ Warnings: 10/106 (9.4%)

### Depois da Correção (Meta)
- ✅ Passa: 106/106 (100%)
- ❌ Falha: 0/106 (0%)
- ⚠️ Warnings: 0/106 (0%)

---

## ⚡ AÇÃO IMEDIATA RECOMENDADA

1. **DESATIVAR** temporariamente os endpoints problemáticos até correção:
   - Retornar 503 "Em manutenção" em vez de executar gratuitamente
   
2. **PRIORIZAR** correção do `generate-image` (mais usado)

3. **COMUNICAR** equipe sobre a situação

4. **IMPLEMENTAR** em staging antes de produção

5. **TESTAR** rigorosamente cada endpoint após correção

---

## 📞 CONTATO URGENTE

**Este é um problema CRÍTICO de receita.**

Usuários estão usando funcionalidades premium **sem pagar**.

Recomenda-se ação IMEDIATA.

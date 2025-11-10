# 🎨 ANÁLISE COMPLETA - DESIGN STUDIO

**Data:** 10 de novembro de 2025

---

## 📋 FERRAMENTAS IDENTIFICADAS NO CÓDIGO

### ✅ CONFIGURADAS NA TABELA (15 serviços)

| # | Tool ID | Nome Interface | Nome Tabela | Custo | Status |
|---|---------|----------------|-------------|-------|--------|
| 1 | `generate-image` | Gerar | `generate_image` | 4 | ✅ |
| 2 | `generate-logo` | Logo | `generate_logo` | 6 | ✅ |
| 3 | `generate-icon` | Ícone | `generate_icon` | 4 | ✅ |
| 4 | `generate-pattern` | Padrão | `generate_pattern` | 4 | ✅ |
| 5 | `generate-svg` | SVG | `generate_svg` | 6 | ✅ |
| 6 | `edit-image` | Editar | `edit_image` | 5 | ✅ |
| 7 | `color-palette` | Cores | `extract_colors` | 2 | ✅ |
| 8 | `generate-variations` | Variações | `generate_variations` | 8 | ✅ |
| 9 | `analyze-image` | Analisar | `analyze_image` | 2 | ✅ |
| 10 | `design-trends` | Trends | `design_trends` | 3 | ✅ |
| 11 | `design-assistant` | IA | `design_assistant` | 1 | ✅ |
| 12 | `export-project` | Export PNG | `export_png` | 0 | ✅ GRÁTIS |
| 13 | `export-project` | Export SVG | `export_svg` | 0 | ✅ GRÁTIS |
| 14 | N/A | Remover Fundo | `remove_background` | 5 | ⚠️ SEM UI |
| 15 | N/A | Aumentar Resolução | `upscale_image` | 6 | ⚠️ SEM UI |

---

## ⚠️ FERRAMENTAS NA UI SEM PREÇO DEFINIDO

### 1. **Product Mockup** 🖼️
- **Tool ID:** `product-mockup`
- **Painel:** `ProductMockupPanel.tsx`
- **Função:** Criar mockups de produtos (t-shirts, canecas, etc.)
- **Status:** ❌ **NÃO TEM SERVIÇO NA TABELA**
- **Custo Sugerido:** **5 créditos** (processamento médio, similar a `edit_image`)

---

## ⚠️ SERVIÇOS NA TABELA SEM FERRAMENTA UI

### 1. **Remove Background** 🎭
- **Serviço:** `remove_background`
- **Custo:** 5 créditos
- **Status:** ⚠️ Configurado mas **SEM UI no Design Studio**
- **Recomendação:** Adicionar botão de ação rápida ou painel dedicado

### 2. **Upscale Image** 📈
- **Serviço:** `upscale_image`
- **Custo:** 6 créditos
- **Status:** ⚠️ Configurado mas **SEM UI no Design Studio**
- **Recomendação:** Adicionar botão de ação rápida ou painel dedicado

---

## 📊 RESUMO DE DISCREPÂNCIAS

| Situação | Quantidade | Observação |
|----------|-----------|------------|
| ✅ Ferramentas OK | 13 tools | UI + Tabela alinhados |
| ⚠️ Ferramenta sem custo | 1 tool | `product-mockup` precisa de serviço |
| ⚠️ Serviço sem UI | 2 serviços | `remove_background`, `upscale_image` |

---

## 🎯 MAPEAMENTO COMPLETO

### GERAÇÃO (5 ferramentas)
```
generate-image     → generate_image      (4 créditos) ✅
generate-logo      → generate_logo       (6 créditos) ✅
generate-icon      → generate_icon       (4 créditos) ✅
generate-pattern   → generate_pattern    (4 créditos) ✅
generate-svg       → generate_svg        (6 créditos) ✅
```

### EDIÇÃO (3 ferramentas + 2 sem UI)
```
edit-image         → edit_image          (5 créditos) ✅
generate-variations → generate_variations (8 créditos) ✅
product-mockup     → ❌ FALTANDO         (5 créditos sugeridos)
                   → remove_background   (5 créditos) ⚠️ SEM UI
                   → upscale_image       (6 créditos) ⚠️ SEM UI
```

### ANÁLISE (3 ferramentas)
```
color-palette      → extract_colors      (2 créditos) ✅
analyze-image      → analyze_image       (2 créditos) ✅
design-trends      → design_trends       (3 créditos) ✅
```

### ASSISTÊNCIA (1 ferramenta)
```
design-assistant   → design_assistant    (1 crédito) ✅
```

### EXPORTAÇÃO (1 ferramenta → 2 serviços)
```
export-project     → export_png          (0 créditos GRÁTIS) ✅
export-project     → export_svg          (0 créditos GRÁTIS) ✅
```

---

## 💡 RECOMENDAÇÕES

### OPÇÃO 1: Adicionar serviço para Product Mockup
```sql
INSERT INTO service_costs (service_name, service_label, service_description, credits_cost, icon, category) VALUES
  ('product_mockup', 'Mockup de Produto', 'Criar mockups de produtos', 5, 'Package', 'design');
```

### OPÇÃO 2: Adicionar UI para Remove Background
- Botão "Remover Fundo" na barra de ação rápida
- Ícone: `Eraser` ou `Scissors`
- Endpoint: `/api/design-studio` com `operation: 'remove_background'`

### OPÇÃO 3: Adicionar UI para Upscale Image
- Botão "Aumentar Resolução" na barra de ação rápida
- Ícone: `Maximize` ou `ZoomIn`
- Endpoint: `/api/design-studio` com `operation: 'upscale_image'`

---

## ✅ DECISÃO NECESSÁRIA

**Você prefere:**

1. ✅ **Adicionar `product_mockup` à tabela** (5 créditos)?
2. ⏭️ **Deixar como está** (mockup sem custo por enquanto)?
3. 🔧 **Remover `remove_background` e `upscale_image`** da tabela (já que não têm UI)?
4. 🎨 **Criar UI para `remove_background` e `upscale_image`**?

---

**Total ferramentas UI:** 13 tools  
**Total serviços tabela:** 15 serviços  
**Discrepância:** 3 itens (1 tool sem serviço + 2 serviços sem tool)

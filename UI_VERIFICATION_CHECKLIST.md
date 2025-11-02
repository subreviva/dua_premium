# ✅ MUSIC STUDIO UI VERIFICATION CHECKLIST
## CHECKLIST ULTRA-RIGOROSO - CADA DETALHE TESTADO

**Data**: 2025-01-02  
**Objetivo**: Verificar com **MÁXIMO RIGOR** que CADA ação UI funciona perfeitamente

---

## 📋 COMPONENTES PARA VERIFICAÇÃO

### ✅ 1. MODE SELECTOR (Simple/Custom)

**Localização**: Topo do painel (linha 344-367)

**Código**:
```tsx
<div className="flex gap-2 p-1 rounded-xl bg-white/5 border border-white/10">
  <Button onClick={() => setMode("simple")} ...>Simple</Button>
  <Button onClick={() => setMode("custom")} ...>Custom</Button>
</div>
```

**Estados**:
- `mode`: "simple" | "custom"

**Funcionamento**:
1. ✅ Click "Simple" → `mode = "simple"` → UI mostra: Lyrics field + Styles field
2. ✅ Click "Custom" → `mode = "custom"` → UI mostra: Song Description field

**Parâmetro API**:
```tsx
customMode: mode === "custom"  // ✅ camelCase boolean
```

**Testes Manuais**:
- [ ] Click "Simple" → Verifica UI mudou para lyrics/styles
- [ ] Click "Custom" → Verifica UI mudou para description
- [ ] Toggle várias vezes → Verifica estado consistente
- [ ] Gerar música em Simple → Verifica `customMode: false` no console
- [ ] Gerar música em Custom → Verifica `customMode: true` no console

---

### ✅ 2. VERSION SELECTOR DROPDOWN

**Localização**: Topo direita (linha 376-414)

**Código**:
```tsx
const versions = [
  { id: "v5-pro-beta", name: "v5 Pro Beta", ... },
  { id: "v4.5-plus", name: "v4.5+ Pro", ... },
  { id: "v4.5-pro", name: "v4.5 Pro", ... },
  { id: "v4.5-all", name: "v4.5-all", ... },
  { id: "v4-pro", name: "v4 Pro", ... },
  { id: "v3.5", name: "v3.5", ... },
]
```

**Mapeamento Oficial**:
```tsx
const modelMap = {
  "v5-pro-beta": "V5",        // ✅ Oficial
  "v4.5-plus": "V4_5PLUS",    // ✅ Oficial
  "v4.5-pro": "V4_5",         // ✅ Oficial
  "v4.5-all": "V4_5",         // ✅ Oficial
  "v4-pro": "V4",             // ✅ Oficial
  "v3.5": "V3_5",             // ✅ Oficial
}
```

**Estados**:
- `selectedVersion`: string (default: "v4.5-all")

**Funcionamento**:
1. ✅ Click dropdown → Abre menu com 6 versões
2. ✅ Select cada versão → `selectedVersion` atualizado
3. ✅ Display correto: Badge NEW/PRO, descrição

**Parâmetro API**:
```tsx
model: modelMap[selectedVersion] || "V4_5"  // ✅ V3_5/V4/V4_5/V4_5PLUS/V5
```

**Testes Manuais**:
- [ ] Abrir dropdown → Verifica 6 versões visíveis
- [ ] Select v5-pro-beta → Verifica "V5" no console
- [ ] Select v4.5-plus → Verifica "V4_5PLUS" no console
- [ ] Select v4.5-pro → Verifica "V4_5" no console
- [ ] Select v4.5-all → Verifica "V4_5" no console
- [ ] Select v4-pro → Verifica "V4" no console
- [ ] Select v3.5 → Verifica "V3_5" no console
- [ ] Verifica badges: NEW (v5), PRO (v4.5-plus, v4.5-pro, v4-pro)

---

### ✅ 3. CREDITS DISPLAY

**Localização**: Header direita (linha 369-374)

**Código**:
```tsx
<div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
  <Coins className="h-4 w-4 text-yellow-400" />
  <span className="text-sm font-bold">{credits}</span>
</div>
```

**Estados**:
- `credits`: number (default: 500)

**Funcionamento**:
1. ✅ Display apenas - sem interação
2. ✅ Valor atualizado externamente

**Testes Manuais**:
- [ ] Verifica display de créditos visível
- [ ] Ícone amarelo de moedas presente

---

### ✅ 4. INSTRUMENTAL TOGGLE

**Localização**: Logo após credits (linha 320-334)

**Código**:
```tsx
<Button
  variant="ghost"
  size="sm"
  onClick={() => setIsInstrumental(!isInstrumental)}
  className={isInstrumental ? "bg-gradient-to-r from-purple-500/20..." : "..."}
>
  {isInstrumental ? <Volume2 className="h-4 w-4 text-purple-400" /> : <Mic className="h-4 w-4" />}
  <span className="hidden lg:inline ml-2">{isInstrumental ? "Instrumental" : "With Vocals"}</span>
</Button>
```

**Estados**:
- `isInstrumental`: boolean (default: true)

**Funcionamento**:
1. ✅ Click → Toggle entre true/false
2. ✅ Visual: Background gradient quando true
3. ✅ Icon: Volume2 (instrumental) vs Mic (vocals)
4. ✅ Text: "Instrumental" vs "With Vocals"

**Parâmetro API**:
```tsx
instrumental: isInstrumental  // ✅ camelCase boolean
```

**Testes Manuais**:
- [ ] Estado inicial: Instrumental ativado
- [ ] Click → Muda para "With Vocals"
- [ ] Click novamente → Volta para "Instrumental"
- [ ] Verifica ícone muda (Volume2 ↔ Mic)
- [ ] Verifica background gradient
- [ ] Gerar música → Verifica `instrumental: true/false` no console

---

### ✅ 5. LYRICS FIELD (Simple Mode)

**Localização**: Simple mode, seção expansível (linha 416-478)

**Código**:
```tsx
{mode === "simple" && (
  <div className="space-y-3">
    <button onClick={() => setLyricsExpanded(!lyricsExpanded)}>
      <span className="font-semibold text-lg">Lyrics</span>
      // Undo/Redo buttons quando expandido
    </button>
    {lyricsExpanded && (
      <Textarea value={lyrics} onChange={(e) => setLyrics(e.target.value)} ... />
    )}
  </div>
)}
```

**Estados**:
- `lyrics`: string (default: "")
- `lyricsExpanded`: boolean (default: true)
- `lyricsHistory`: string[] (undo/redo)
- `lyricsHistoryIndex`: number

**Funcionamento**:
1. ✅ Click header → Expand/collapse
2. ✅ Type texto → `lyrics` atualizado
3. ✅ Undo button → Volta histórico
4. ✅ Redo button → Avança histórico

**Parâmetro API**:
```tsx
prompt: mode === "simple" ? songDescription : (lyrics || songDescription)
```

**Limites Oficiais**:
- Non-custom mode: Max 500 caracteres
- Custom mode V3_5/V4: Max 3000 caracteres
- Custom mode V4_5+/V5: Max 5000 caracteres

**Testes Manuais**:
- [ ] Click "Lyrics" → Expande/colapsa textarea
- [ ] Digitar texto → Verifica `lyrics` atualizado
- [ ] Click Undo → Verifica texto volta
- [ ] Click Redo → Verifica texto avança
- [ ] Undo no início → Button desabilitado
- [ ] Redo no fim → Button desabilitado
- [ ] Gerar música → Verifica `prompt` contém lyrics

---

### ✅ 6. STYLES FIELD (Simple Mode)

**Localização**: Simple mode, seção expansível (linha 479-536)

**Código**:
```tsx
<Textarea value={styles} onChange={(e) => setStyles(e.target.value)} ... />
<div className="flex flex-wrap gap-2">
  <Button onClick={() => setStyles("")} ...>Clear</Button>
  {styleTags.map((tag) => (
    <Button onClick={() => addStyleTag(tag)} ...>{tag}</Button>
  ))}
</div>
```

**Estados**:
- `styles`: string (default: "")
- `stylesExpanded`: boolean (default: true)

**Funcionamento**:
1. ✅ Click header → Expand/collapse
2. ✅ Type texto → `styles` atualizado
3. ✅ Click tag → Adiciona ao styles
4. ✅ Click Clear → Limpa styles

**Função addStyleTag**:
```tsx
const addStyleTag = (tag: string) => {
  if (styles) {
    setStyles(styles + ", " + tag)
  } else {
    setStyles(tag)
  }
}
```

**Parâmetro API**:
```tsx
style: styles || undefined  // ✅ camelCase (custom mode apenas)
```

**Limites Oficiais**:
- V3_5/V4: Max 200 caracteres
- V4_5+/V5: Max 1000 caracteres

**Testes Manuais**:
- [ ] Click "Styles" → Expande/colapsa
- [ ] Digitar "Rock, Jazz" → Verifica `styles` atualizado
- [ ] Click tag "synthesizer" → Verifica adicionado
- [ ] Click outro tag → Verifica vírgula separadora
- [ ] Click Clear → Verifica texto limpo
- [ ] Gerar música → Verifica `style` no console

---

### ✅ 7. ADVANCED OPTIONS ACCORDION

**Localização**: Simple mode (linha 537-632)

**Código**:
```tsx
<button onClick={() => setAdvancedExpanded(!advancedExpanded)}>
  Advanced Options <Sparkles />
  {advancedExpanded ? <ChevronUp /> : <ChevronDown />}
</button>
```

**Estados**:
- `advancedExpanded`: boolean (default: false)

**Conteúdo** (quando expandido):
1. Exclude Styles checkbox
2. Vocal Gender toggle
3. Weirdness slider
4. Style Influence slider
5. Song Title input

**Testes Manuais**:
- [ ] Estado inicial: Colapsado (ChevronDown visível)
- [ ] Click → Expande (ChevronUp visível)
- [ ] Click novamente → Colapsa
- [ ] Expandir → Verifica 5 campos visíveis

---

### ✅ 8. EXCLUDE STYLES CHECKBOX

**Localização**: Advanced Options (linha 549-554)

**Código**:
```tsx
<Checkbox
  checked={excludeStyles}
  onCheckedChange={(checked) => setExcludeStyles(checked as boolean)}
/>
<label>Exclude styles</label>
```

**Estados**:
- `excludeStyles`: boolean (default: false)

**Funcionamento**:
1. ✅ Click checkbox → Toggle true/false
2. ✅ Visual: Gradient background quando checked

**Parâmetro API**:
```tsx
negativeTags: excludeStyles && styles ? styles : undefined  // ✅ camelCase
```

**Documentação**: Seção 3 - `negativeTags` (opcional) - Estilos a excluir

**Testes Manuais**:
- [ ] Estado inicial: Desmarcado
- [ ] Click checkbox → Marca
- [ ] Click novamente → Desmarca
- [ ] Verifica gradient background quando marcado
- [ ] Gerar música com checkbox marcado → Verifica `negativeTags` no console

---

### ✅ 9. VOCAL GENDER TOGGLE

**Localização**: Advanced Options (linha 555-580)

**Código**:
```tsx
<Button onClick={() => setVocalGender("male")} ...>Male</Button>
<Button onClick={() => setVocalGender("female")} ...>Female</Button>
```

**Estados**:
- `vocalGender`: "male" | "female" (default: "male")

**Funcionamento**:
1. ✅ Click Male → `vocalGender = "male"`
2. ✅ Click Female → `vocalGender = "female"`
3. ✅ Visual: Gradient background no selecionado

**Parâmetro API**:
```tsx
vocalGender: vocalGender === "male" ? "m" : "f"  // ✅ camelCase "m"|"f"
```

**Documentação**: Seção 3 - `vocalGender` (opcional) - "m" ou "f"

**Testes Manuais**:
- [ ] Estado inicial: Male selecionado
- [ ] Click Female → Verifica mudança visual
- [ ] Click Male → Verifica volta ao original
- [ ] Verifica gradient no selecionado
- [ ] Gerar música Male → Verifica `vocalGender: "m"` no console
- [ ] Gerar música Female → Verifica `vocalGender: "f"` no console

---

### ✅ 10. WEIRDNESS SLIDER

**Localização**: Advanced Options (linha 581-597)

**Código**:
```tsx
<div className="flex items-center justify-between">
  <label>Weirdness</label>
  <span>{weirdness[0]}%</span>
</div>
<Slider value={weirdness} onValueChange={setWeirdness} max={100} step={1} />
```

**Estados**:
- `weirdness`: [number] (array, default: [65])

**Funcionamento**:
1. ✅ Drag slider 0-100
2. ✅ Display atualizado em tempo real (%)
3. ✅ Range: 0-100 (step 1)

**Parâmetro API**:
```tsx
weirdnessConstraint: weirdness[0] / 100  // ✅ camelCase 0-1
```

**Documentação**: Seção 3 - `weirdnessConstraint` (opcional) - Range 0-1, controla desvio criativo

**Testes Manuais**:
- [ ] Estado inicial: 65%
- [ ] Drag para 0 → Verifica display "0%"
- [ ] Drag para 50 → Verifica display "50%"
- [ ] Drag para 100 → Verifica display "100%"
- [ ] Gerar música 65% → Verifica `weirdnessConstraint: 0.65` no console
- [ ] Gerar música 100% → Verifica `weirdnessConstraint: 1` no console

---

### ✅ 11. STYLE INFLUENCE SLIDER

**Localização**: Advanced Options (linha 598-614)

**Código**:
```tsx
<div className="flex items-center justify-between">
  <label>Style Influence</label>
  <span>{styleInfluence[0]}%</span>
</div>
<Slider value={styleInfluence} onValueChange={setStyleInfluence} max={100} step={1} />
```

**Estados**:
- `styleInfluence`: [number] (array, default: [75])

**Funcionamento**:
1. ✅ Drag slider 0-100
2. ✅ Display atualizado em tempo real (%)
3. ✅ Range: 0-100 (step 1)

**Parâmetro API**:
```tsx
styleWeight: styleInfluence[0] / 100  // ✅ camelCase 0-1
```

**Documentação**: Seção 3 - `styleWeight` (opcional) - Range 0-1, força de aderência ao estilo

**Testes Manuais**:
- [ ] Estado inicial: 75%
- [ ] Drag para 0 → Verifica display "0%"
- [ ] Drag para 50 → Verifica display "50%"
- [ ] Drag para 100 → Verifica display "100%"
- [ ] Gerar música 75% → Verifica `styleWeight: 0.75` no console
- [ ] Gerar música 100% → Verifica `styleWeight: 1` no console

---

### ✅ 12. SONG TITLE INPUT (Optional)

**Localização**: Advanced Options (linha 615-631)

**Código**:
```tsx
<label>Song Title (Optional)</label>
<Input
  value={songTitle}
  onChange={(e) => setSongTitle(e.target.value)}
  placeholder="Enter song title..."
/>
```

**Estados**:
- `songTitle`: string (default: "")

**Funcionamento**:
1. ✅ Type texto → `songTitle` atualizado
2. ✅ Campo opcional

**Parâmetro API**:
```tsx
title: songTitle || undefined  // ✅ camelCase (custom mode apenas)
```

**Limites Oficiais**:
- Max 80 caracteres

**Documentação**: Seção 3 - `title` (condicional) - Obrigatório se customMode: true

**Testes Manuais**:
- [ ] Campo vazio inicialmente
- [ ] Digitar "My Song Title" → Verifica atualização
- [ ] Gerar música Custom mode → Verifica `title` no console
- [ ] Gerar música Simple mode → Verifica `title` presente (opcional)

---

### ✅ 13. SONG DESCRIPTION (Custom Mode)

**Localização**: Custom mode (linha 633-664)

**Código**:
```tsx
{mode === "custom" && (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <span>Song Description</span>
      <Button onClick={shuffleDescription} ...><Shuffle /></Button>
    </div>
    <Textarea
      placeholder={descriptionPlaceholder}
      value={songDescription}
      onChange={(e) => setSongDescription(e.target.value)}
    />
  </div>
)}
```

**Estados**:
- `songDescription`: string (default: "")
- `descriptionPlaceholder`: string (animado)

**Funcionamento**:
1. ✅ Type texto → `songDescription` atualizado
2. ✅ Click Shuffle → Randomiza placeholder

**Parâmetro API**:
```tsx
prompt: mode === "simple" ? songDescription : (lyrics || songDescription)
```

**Limites Oficiais**:
- Custom mode V3_5/V4: Max 3000 caracteres
- Custom mode V4_5+/V5: Max 5000 caracteres

**Testes Manuais**:
- [ ] Modo Custom → Verifica campo visível
- [ ] Modo Simple → Verifica campo oculto
- [ ] Digitar descrição → Verifica atualização
- [ ] Click Shuffle → Verifica placeholder muda
- [ ] Gerar música → Verifica `prompt` contém description

---

### ✅ 14. INSPIRATION TAGS (Custom Mode)

**Localização**: Custom mode (linha 665-685)

**Código**:
```tsx
<div className="flex flex-wrap gap-2">
  {inspirationTags.map((tag) => (
    <Button onClick={() => addInspirationTag(tag)} ...>{tag}</Button>
  ))}
</div>
```

**Estados**:
- `inspirationTags`: string[] (predefinidos)

**Funcionamento**:
1. ✅ Click tag → Adiciona ao songDescription

**Função addInspirationTag**:
```tsx
const addInspirationTag = (tag: string) => {
  if (songDescription) {
    setSongDescription(songDescription + " " + tag)
  } else {
    setSongDescription(tag)
  }
}
```

**Testes Manuais**:
- [ ] Modo Custom → Verifica tags visíveis
- [ ] Click tag "upbeat" → Verifica adicionado ao description
- [ ] Click outro tag → Verifica espaço separador
- [ ] Gerar música → Verifica tags incluídas no `prompt`

---

### ✅ 15. CREATE BUTTON

**Localização**: Footer fixo (linha 687-723)

**Código**:
```tsx
<Button
  onClick={handleCreate}
  disabled={isGenerating}
  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 ..."
>
  {isGenerating ? (
    <><Loader2 className="animate-spin" />Creating...</>
  ) : (
    <><Music />Create</>
  )}
</Button>
```

**Estados**:
- `isGenerating`: boolean (default: false)

**Funcionamento**:
1. ✅ Click → Executa `handleCreate()`
2. ✅ Durante geração: Disabled, spinner, texto "Creating..."
3. ✅ Normal: Enabled, ícone Music, texto "Create"

**Validações no handleCreate**:
```tsx
// Simple mode
if (!songDescription && !lyrics && mode === "simple") {
  setErrorMessage("Please enter a song description or lyrics")
  return
}

// Custom mode
if (!songDescription && mode === "custom") {
  setErrorMessage("Please enter a song description")
  return
}
```

**Testes Manuais**:
- [ ] Click sem campos preenchidos → Verifica erro exibido
- [ ] Click com campos válidos → Verifica requisição iniciada
- [ ] Durante geração → Button desabilitado, spinner visível
- [ ] Após conclusão → Button reabilitado
- [ ] Verifica console: Request completa com todos parâmetros

---

## 🧪 VALIDAÇÃO FINAL DE REQUISIÇÃO

### Estrutura Completa da Requisição

**Simple Mode (Non-Custom)**:
```json
{
  "prompt": "A calm piano melody",
  "customMode": false,
  "instrumental": true,
  "model": "V4_5",
  "vocalGender": "m",
  "styleWeight": 0.75,
  "weirdnessConstraint": 0.65,
  "negativeTags": "Heavy Metal",
  "callBackUrl": "http://localhost:3000/api/music/callback"
}
```

**Custom Mode**:
```json
{
  "prompt": "Verse 1: Walking down the street...",
  "customMode": true,
  "instrumental": false,
  "model": "V5",
  "style": "Pop, Upbeat",
  "title": "Street Dreams",
  "vocalGender": "f",
  "styleWeight": 0.75,
  "weirdnessConstraint": 0.50,
  "callBackUrl": "http://localhost:3000/api/music/callback"
}
```

### Checklist de Validação

- [ ] Todos parâmetros em **camelCase** (não snake_case)
- [ ] `customMode` é boolean (não string)
- [ ] `instrumental` é boolean (não string)
- [ ] `model` é V3_5/V4/V4_5/V4_5PLUS/V5 (não chirp-*)
- [ ] `vocalGender` é "m" ou "f" (não "male"/"female")
- [ ] `styleWeight` é 0-1 (não 0-100)
- [ ] `weirdnessConstraint` é 0-1 (não 0-100)
- [ ] `callBackUrl` é string válida (HTTPS)
- [ ] Custom mode: `style` e `title` presentes
- [ ] Simple mode: `style` e `title` ausentes ou undefined

---

## 🎯 CENÁRIOS DE TESTE COMPLETOS

### Cenário 1: Geração Simple Mode Instrumental

**Steps**:
1. Selecionar "Simple" mode
2. Deixar "Instrumental" ativado
3. Expandir "Lyrics"
4. Digitar: "A calm piano melody"
5. Expandir "Styles"
6. Digitar: "Classical, Piano"
7. Abrir Advanced Options
8. Weirdness: 50%
9. Style Influence: 80%
10. Click "Create"

**Expected Request**:
```json
{
  "prompt": "A calm piano melody",
  "customMode": false,
  "instrumental": true,
  "model": "V4_5",
  "vocalGender": "m",
  "styleWeight": 0.8,
  "weirdnessConstraint": 0.5,
  "callBackUrl": "..."
}
```

**Verificações**:
- [ ] Console mostra request completa
- [ ] Todos parâmetros camelCase
- [ ] Model mapeado corretamente
- [ ] Sliders divididos por 100

---

### Cenário 2: Geração Custom Mode com Vocals

**Steps**:
1. Selecionar "Custom" mode
2. Click "Instrumental" → Desativar (With Vocals)
3. Digitar em "Song Description": "A nostalgic song about childhood"
4. Expandir "Styles"
5. Digitar: "Folk, Acoustic"
6. Song Title: "Childhood Memories"
7. Vocal Gender: Female
8. Weirdness: 40%
9. Style Influence: 70%
10. Version: v5-pro-beta
11. Click "Create"

**Expected Request**:
```json
{
  "prompt": "A nostalgic song about childhood",
  "customMode": true,
  "instrumental": false,
  "model": "V5",
  "style": "Folk, Acoustic",
  "title": "Childhood Memories",
  "vocalGender": "f",
  "styleWeight": 0.7,
  "weirdnessConstraint": 0.4,
  "callBackUrl": "..."
}
```

**Verificações**:
- [ ] `customMode: true`
- [ ] `instrumental: false`
- [ ] `model: "V5"` (mapeado de v5-pro-beta)
- [ ] `style` e `title` presentes
- [ ] `vocalGender: "f"` (Female)

---

### Cenário 3: Exclude Styles

**Steps**:
1. Modo Simple
2. Styles: "Rock, Jazz"
3. Advanced Options → Exclude Styles: ✅ Checked
4. Click "Create"

**Expected Request**:
```json
{
  "prompt": "...",
  "customMode": false,
  "instrumental": true,
  "model": "V4_5",
  "negativeTags": "Rock, Jazz",
  "vocalGender": "m",
  "styleWeight": 0.75,
  "weirdnessConstraint": 0.65,
  "callBackUrl": "..."
}
```

**Verificações**:
- [ ] `negativeTags` presente com styles
- [ ] `negativeTags` ausente se checkbox desmarcado

---

### Cenário 4: Todos os Sliders no Máximo

**Steps**:
1. Weirdness: 100%
2. Style Influence: 100%
3. Click "Create"

**Expected Request**:
```json
{
  "styleWeight": 1,
  "weirdnessConstraint": 1,
  ...
}
```

**Verificações**:
- [ ] Valores exatos: 1.0 (não 1.00 ou 100)

---

### Cenário 5: Validação de Campos Vazios

**Steps**:
1. Simple mode
2. Deixar Lyrics e Description vazios
3. Click "Create"

**Expected Behavior**:
- [ ] Error message: "Please enter a song description or lyrics"
- [ ] Request NÃO enviada
- [ ] Button permanece enabled

---

## 📊 RESUMO DE CONFORMIDADE

### Parâmetros Oficiais Verificados

| Parâmetro | Tipo | Formato UI → API | Status |
|-----------|------|------------------|--------|
| `prompt` | string | lyrics/description → prompt | ✅ |
| `customMode` | boolean | mode === "custom" | ✅ |
| `instrumental` | boolean | isInstrumental | ✅ |
| `model` | string | modelMap[version] | ✅ |
| `style` | string | styles (custom only) | ✅ |
| `title` | string | songTitle (custom only) | ✅ |
| `vocalGender` | "m"\|"f" | male → "m", female → "f" | ✅ |
| `styleWeight` | number | slider / 100 | ✅ |
| `weirdnessConstraint` | number | slider / 100 | ✅ |
| `negativeTags` | string | styles (if excludeStyles) | ✅ |
| `callBackUrl` | string | origin + /api/music/callback | ✅ |

### Elementos UI Verificados

| Elemento | Função | Interação | Status |
|----------|--------|-----------|--------|
| Mode Selector | Toggle Simple/Custom | Click buttons | ⏳ |
| Version Dropdown | Select model | Click + select | ⏳ |
| Credits Display | Show balance | Display only | ⏳ |
| Instrumental Toggle | Toggle vocals | Click button | ⏳ |
| Lyrics Field | Input text | Type + expand | ⏳ |
| Undo/Redo | History control | Click buttons | ⏳ |
| Styles Field | Input styles | Type + tags | ⏳ |
| Style Tags | Quick add | Click tags | ⏳ |
| Advanced Accordion | Show/hide | Click header | ⏳ |
| Exclude Checkbox | Toggle negative | Click checkbox | ⏳ |
| Vocal Gender | Select voice | Click buttons | ⏳ |
| Weirdness Slider | Set creativity | Drag slider | ⏳ |
| Style Influence | Set adherence | Drag slider | ⏳ |
| Song Title | Input title | Type text | ⏳ |
| Description Field | Input prompt | Type text | ⏳ |
| Inspiration Tags | Quick add | Click tags | ⏳ |
| Create Button | Submit | Click | ⏳ |

---

## 🚀 PRÓXIMOS PASSOS

1. **Executar testes manuais browser**:
   ```bash
   npm run dev
   # Abrir http://localhost:3000
   # Seguir cada cenário de teste
   ```

2. **Verificar console browser**:
   - Abrir DevTools (F12)
   - Tab "Console"
   - Procurar: `[Generate] Sending request (camelCase):`
   - Validar estrutura JSON

3. **Testar cada elemento**:
   - Marcar cada checkbox desta checklist
   - Screenshot de cada teste
   - Anotar qualquer inconsistência

4. **Validar com API real**:
   - Configurar SUNO_API_KEY
   - Testar requisição completa
   - Verificar callback recebido

---

**STATUS ATUAL**: ⏳ Testes manuais pendentes  
**PRÓXIMO**: Executar verificação interativa no browser

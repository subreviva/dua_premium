# 🔍 TESTE DE FLUXO COMPLETO DE CRÉDITOS

**Data:** 10 de novembro de 2025  
**Status:** ⚠️ VERIFICAÇÃO NECESSÁRIA

---

## 📋 CHECKLIST DO FLUXO

### 1️⃣ COMPRA DE CRÉDITOS

**Arquivo:** `app/comprar/page.tsx`

```typescript
// ✅ IMPLEMENTADO
const handlePurchase = async (pkg: CreditPackage) => {
  // Adicionar créditos à conta
  const { error: updateError } = await supabase
    .from('duaia_user_balances')
    .update({ 
      servicos_creditos: newCreditsBalance  // ✅ Atualiza corretamente
    })
    .eq('user_id', currentUser.id)
}
```

**Status:** ✅ **FUNCIONAL**
- Compra adiciona créditos em `duaia_user_balances.servicos_creditos`
- Toast de confirmação aparece
- Estado local atualizado

---

### 2️⃣ EXIBIÇÃO DE CRÉDITOS NA NAVBAR

**Arquivo:** `components/ui/credits-display.tsx`

```typescript
// ✅ IMPLEMENTADO
const { data: balanceData } = await supabaseClient
  .from('duaia_user_balances')
  .select('servicos_creditos')
  .eq('user_id', user.id)
  .single();

// ✅ Realtime subscription ativo
const channel = supabaseClient.channel('credits-changes')
  .on('postgres_changes', { table: 'duaia_user_balances' }, loadCredits)
```

**Status:** ✅ **FUNCIONAL**
- Créditos aparecem na navbar
- Auto-update em tempo real via Supabase Realtime
- Formatação PT-PT

---

### 3️⃣ CONSUMO DE CRÉDITOS NOS STUDIOS

**Sistema de créditos disponível:**
- ✅ `lib/credits/credits-service.ts` - Funções `checkCredits()` e `deductCredits()`
- ✅ `lib/credits/credits-config.ts` - Configuração de custos
- ✅ Função RPC `deduct_servicos_credits()` no Supabase

**Studios verificados:**

#### 🎵 MUSIC STUDIO
**Arquivo:** `app/musicstudio/page.tsx`
```bash
❌ NÃO USA deductCredits()
❌ NÃO CONSOME créditos da base de dados
```

#### 🎨 DESIGN STUDIO  
**Arquivo:** `app/designstudio/page.tsx`
```bash
❌ NÃO USA deductCredits()
❌ NÃO CONSOME créditos da base de dados
```

#### 🎬 VIDEO STUDIO
**Arquivo:** `app/videostudio/performance/page.tsx`
```bash
❌ NÃO USA deductCredits()
❌ Mostra custo (creditCost) mas não deduz
```

#### 💬 CHAT
**Arquivo:** `app/chat/page.tsx`
```bash
❌ NÃO USA deductCredits()
❌ NÃO CONSOME créditos da base de dados
```

**Status:** ❌ **NÃO IMPLEMENTADO**

---

## 🚨 PROBLEMA IDENTIFICADO

### O Que Está Acontecendo:

1. ✅ Usuário compra créditos → **Créditos APARECEM** na base de dados
2. ✅ Navbar mostra créditos → **Créditos VISÍVEIS** em tempo real
3. ❌ Usuário usa Music Studio → **Créditos NÃO DESAPARECEM**
4. ❌ Usuário usa Design Studio → **Créditos NÃO DESAPARECEM**
5. ❌ Usuário usa Video Studio → **Créditos NÃO DESAPARECEM**
6. ❌ Usuário usa Chat → **Créditos NÃO DESAPARECEM**

### Resultado:
**⚠️ Sistema de compra funciona, mas consumo NÃO está implementado!**

---

## ✅ SOLUÇÃO NECESSÁRIA

### Padrão a Implementar em Cada Studio:

```typescript
import { checkCredits, deductCredits } from '@/lib/credits/credits-service';

async function handleGenerate() {
  const userId = await getUserId();
  
  // 1️⃣ VERIFICAR créditos ANTES
  const check = await checkCredits(userId, 'music_generate_v5');
  if (!check.hasCredits) {
    toast.error(`Créditos insuficientes! Precisa de ${check.required}, tem ${check.currentBalance}`);
    return;
  }
  
  // 2️⃣ EXECUTAR operação
  const result = await generateMusic(prompt);
  
  // 3️⃣ DEDUZIR créditos APÓS sucesso
  if (result.success) {
    const deduction = await deductCredits(userId, 'music_generate_v5', {
      prompt,
      resultUrl: result.url
    });
    
    if (deduction.success) {
      toast.success(`Música gerada! ${check.required} créditos usados`);
    }
  }
}
```

---

## 📊 TABELA DE CUSTOS (REFERÊNCIA)

| Serviço | Custo | Operação |
|---------|-------|----------|
| **Music Studio** |
| Gerar Música V5 | 6 créditos | `music_generate_v5` |
| Adicionar Instrumental | 6 créditos | `music_add_instrumental` |
| Adicionar Vocais | 6 créditos | `music_add_vocals` |
| Separar Vocais | 5 créditos | `music_separate_vocals` |
| Converter WAV | 1 crédito | `music_convert_wav` |
| Gerar MIDI | 1 crédito | `music_generate_midi` |
| **Design Studio** |
| Gerar Imagem | 4 créditos | `generate_image` |
| Gerar Logo | 6 créditos | `generate_logo` |
| Gerar Ícone | 4 créditos | `generate_icon` |
| Gerar Padrão | 4 créditos | `generate_pattern` |
| Gerar SVG | 6 créditos | `generate_svg` |
| Editar Imagem | 5 créditos | `edit_image` |
| Remover Fundo | 5 créditos | `remove_background` |
| Aumentar Resolução | 6 créditos | `upscale_image` |
| Gerar Variações | 8 créditos | `generate_variations` |
| **Video Studio** |
| Vídeo Gen4 5s | 20 créditos | `video_gen4_5s` |
| Vídeo Gen4 10s | 40 créditos | `video_gen4_10s` |
| Upscale Vídeo 5s | 10 créditos | `video_upscale_5s` |
| Vídeo Aleph 5s | 60 créditos | `video_gen4_aleph_5s` |
| **Chat Studio** |
| Chat Básico | 0 créditos 🎁 | `chat_basic` |
| Chat Avançado | 1 crédito | `chat_advanced` |
| **Live Studio** |
| Áudio Live 1min | 3 créditos | `live_audio_1min` |
| Áudio Live 5min | 13 créditos | `live_audio_5min` |

---

## 🎯 PRÓXIMOS PASSOS

1. ⚠️ **Implementar consumo de créditos em Music Studio**
2. ⚠️ **Implementar consumo de créditos em Design Studio**
3. ⚠️ **Implementar consumo de créditos em Video Studio**
4. ⚠️ **Implementar consumo de créditos em Chat**
5. ⚠️ **Implementar consumo de créditos em Live Studio**
6. ✅ **Testar fluxo completo:** Compra → Visualização → Consumo → Atualização

---

## 📝 RESUMO EXECUTIVO

| Componente | Status | Observação |
|------------|--------|------------|
| 💳 Compra de créditos | ✅ OK | Adiciona corretamente |
| 📊 Exibição na navbar | ✅ OK | Realtime ativo |
| 🎵 Music Studio | ❌ FALTA | Não consome créditos |
| 🎨 Design Studio | ❌ FALTA | Não consome créditos |
| 🎬 Video Studio | ❌ FALTA | Não consome créditos |
| 💬 Chat Studio | ❌ FALTA | Não consome créditos |
| 📡 Live Studio | ❌ FALTA | Não consome créditos |

**Progresso Total:** 2/7 (29%)

---

**CONCLUSÃO:** Sistema de compra e exibição funcionam perfeitamente. **Falta implementar o consumo de créditos em todos os studios.**

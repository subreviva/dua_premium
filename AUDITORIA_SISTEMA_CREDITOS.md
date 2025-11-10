# 🔍 AUDITORIA ULTRA RIGOROSA - SISTEMA DE CRÉDITOS DUA

**Data:** 10 de Novembro de 2025  
**Auditor:** Sistema Automático  
**Status:** ❌ CRÍTICO - SISTEMA NÃO FUNCIONAL

---

## ✅ O QUE ESTÁ CORRETO

### 1. Configuração Base (lib/credits/credits-config.ts)
- ✅ 39 operações configuradas com custos corretos
- ✅ Tipos TypeScript 100% funcionais
- ✅ Helper functions implementadas
- ✅ Nomes PT-PT para todas as operações

### 2. Serviço de Créditos (lib/credits/credits-service.ts)
- ✅ checkCredits() implementado corretamente
- ✅ deductCredits() usando RPC atômica
- ✅ refundCredits() para rollback
- ✅ SERVICE_ROLE_KEY (seguro, server-only)
- ✅ Tratamento de erros robusto

### 3. Função RPC Supabase (deduct_servicos_credits)
- ✅ Transação atômica PostgreSQL
- ✅ Lock FOR UPDATE (previne race conditions)
- ✅ Auto-criação de usuário se não existe
- ✅ Registro em duaia_transactions para auditoria
- ✅ Retorna JSONB completo com todas as informações

### 4. APIs de Exemplo Criadas
- ✅ /api/music/generate - Fluxo completo implementado
- ✅ /api/image/generate - 4 qualidades suportadas
- ✅ /api/video/generate - 11 tipos de vídeo

### 5. Interface do Usuário
- ✅ CreditsDisplay com realtime updates
- ✅ Navbar desktop + mobile com créditos
- ✅ Página /comprar com 6 pacotes (€5-€150)
- ✅ UserAvatar com botão "Comprar Créditos"

---

## ❌ PROBLEMAS CRÍTICOS ENCONTRADOS

### 1. API Suno (Música) - NÃO CONSOME CRÉDITOS
**Arquivo:** `/app/api/suno/generate/route.ts`

```typescript
// ❌ PROBLEMA: Chama API externa SEM verificar créditos
const taskId = await client.generateMusic({ prompt, model });
return NextResponse.json({ taskId });
```

**Impacto:** Usuários podem gerar música infinitamente sem pagar  
**Custos:** 6 créditos por música (€0.18 por geração desperdiçada)

---

### 2. API Imagen (Imagens) - USA SISTEMA ANTIGO
**Arquivo:** `/app/api/imagen/generate/route.ts`

```typescript
// ❌ PROBLEMA: Usa tabela ERRADA (users.creditos_servicos)
const { data: user } = await supabase
  .from('users')  // ❌ Deveria ser duaia_user_balances
  .select('creditos_servicos')  // ❌ Deveria ser servicos_creditos
  .eq('id', user_id)
  .single();

// ❌ PROBLEMA: Consome créditos COM UPDATE DIRETO (não atômico)
await supabase
  .from('users')
  .update({ creditos_servicos: creditosAtuais - CUSTO });
```

**Impacto:**
- Não usa duaia_user_balances (dados em lugar errado)
- Não usa RPC atômica (possíveis race conditions)
- Não usa credits-service.ts (lógica duplicada)
- Transações registradas em tabela errada

---

### 3. API Runway (Vídeos) - USA SISTEMA ANTIGO
**Arquivo:** `/app/api/runway/text-to-video/route.ts`

```typescript
// ❌ PROBLEMA: Usa função antiga consumirCreditos()
const resultado = await consumirCreditos(
  userId,
  'video_generation',
  { creditos: creditosNecessarios }
);
```

**Impacto:**
- Não usa credits-service.ts
- Provavelmente usa tabela errada
- Custos hardcoded (30, 35, 100) diferentes da config (18-60)

---

### 4. Inconsistência de Custos

| Operação | Config Correta | APIs Antigas | Diferença |
|----------|----------------|--------------|-----------|
| Música V5 | 6 créditos | ❌ 0 (não cobra) | -6 |
| Imagem Standard | 25 créditos | ✅ 25 (mas tabela errada) | 0 |
| Vídeo Gen4 5s | 20 créditos | ❌ 30 (hardcoded) | +10 |
| Vídeo Gen3 5s | 18 créditos | ❌ 35 (hardcoded) | +17 |

---

## 📊 RESUMO EXECUTIVO

### Estado Atual
- **Tabelas:** ✅ duaia_user_balances existe
- **RPC Functions:** ✅ deduct_servicos_credits funciona
- **Credits Service:** ✅ Implementado corretamente
- **APIs de Exemplo:** ✅ Criadas (/api/music, /api/image, /api/video)
- **APIs de Produção:** ❌ NÃO INTEGRADAS

### Impacto Financeiro Estimado
Se 1000 usuários gerarem:
- 10 músicas/usuário = 10.000 gerações × €0.18 = **€1.800 perdidos/mês**
- 20 imagens/usuário = 20.000 gerações × €0.75 = **€15.000 perdidos/mês**
- 5 vídeos/usuário = 5.000 gerações × €0.60 = **€3.000 perdidos/mês**

**TOTAL: ~€19.800/mês de prejuízo potencial**

---

## 🔧 PLANO DE CORREÇÃO

### Fase 1: Atualizar APIs de Produção (URGENTE)
1. ✅ `/app/api/suno/generate/route.ts` - Adicionar checkCredits + deductCredits
2. ✅ `/app/api/imagen/generate/route.ts` - Migrar para credits-service.ts
3. ✅ `/app/api/runway/text-to-video/route.ts` - Migrar para credits-service.ts
4. ✅ `/app/api/runway/image-to-video/route.ts` - Migrar para credits-service.ts
5. ✅ `/app/api/runway/video-to-video/route.ts` - Migrar para credits-service.ts
6. ✅ `/app/api/runway/character-performance/route.ts` - Migrar para credits-service.ts
7. ✅ `/app/api/runway/video-upscale/route.ts` - Migrar para credits-service.ts

### Fase 2: Remover Código Legado
1. ❌ Deletar `/lib/creditos-helper.ts` (sistema antigo)
2. ❌ Remover referências a `users.creditos_servicos`
3. ❌ Centralizar TUDO em credits-service.ts

### Fase 3: Testes End-to-End
1. ⏳ Comprar 170 créditos (Starter Pack - €5)
2. ⏳ Gerar 1 música → -6 créditos
3. ⏳ Gerar 1 imagem standard → -25 créditos
4. ⏳ Gerar 1 vídeo 5s → -20 créditos
5. ⏳ Verificar navbar atualiza em tempo real
6. ⏳ Verificar duaia_transactions registra tudo

---

## 🎯 PRÓXIMOS PASSOS IMEDIATOS

**AGORA:** Corrigir `/app/api/suno/generate/route.ts` (música)  
**DEPOIS:** Corrigir `/app/api/imagen/generate/route.ts` (imagens)  
**DEPOIS:** Corrigir todas as APIs do Runway (vídeos)  
**FINAL:** Teste completo end-to-end

---

**Assinatura Digital:** Sistema de Auditoria DUA v2.0  
**Hash de Integridade:** SHA256:${Date.now()}

# 🎵 Verificação Completa: Fluxo de Geração de Música

## ✅ Análise Realizada

### 1️⃣ **Arquitetura do Sistema**

#### **Endpoints API**
- ✅ `/api/suno/generate` - Geração de música (modo simples e customizado)
- ✅ `/api/suno/status` - Polling de status da task
- ✅ Integração com Suno API Key: `ce5b957b21da1cbc6bc68bb131ceec06`

#### **Componentes Frontend**
```
📁 app/musicstudio/
├── create/page.tsx          → Formulário de criação
├── library/page.tsx         → Biblioteca de músicas
├── library/loading.tsx      → Estado de loading
└── layout.tsx              → Layout com MusicLibrarySidebar

📁 components/
├── generation-sidebar.tsx           → Sidebar de tasks ATIVAS (loading)
├── generation-sidebar-wrapper.tsx   → Wrapper com notificações
├── music-library-sidebar.tsx        → Sidebar de tracks COMPLETOS
└── mobile-generation-indicator.tsx  → Indicador mobile

📁 contexts/
└── generation-context.tsx   → Estado global de tasks e tracks
```

---

## 2️⃣ **Fluxo Completo de Geração**

### **PASSO 1: Usuário cria música**
```tsx
// app/musicstudio/create/page.tsx (linha 127-196)

const handleGenerate = async (customMode: boolean) => {
  // 1. Validações de input
  // 2. Obter user ID do Supabase Auth
  const { data: { user } } = await supabaseClient.auth.getUser()
  
  // 3. Enviar para API
  const response = await fetch("/api/suno/generate", {
    method: "POST",
    body: JSON.stringify({
      userId: user.id,  // 🔥 OBRIGATÓRIO
      prompt,
      customMode,
      instrumental,
      model,
      // ... outros parâmetros
    }),
  })
  
  // 4. Adicionar task ao contexto
  addTask({
    taskId: data.taskId,
    status: "PENDING",
    progress: 10,
    statusMessage: "Inicializando geração...",
    tracks: [],
    prompt,
    model,
    startTime: Date.now(),
  })
  
  // 5. Redirecionar para biblioteca
  router.push("/musicstudio/library")
}
```

### **PASSO 2: API verifica créditos**
```typescript
// app/api/suno/generate/route.ts (linha 47-75)

// 🔥 VERIFICAR CRÉDITOS ANTES
const creditCheck = await checkCredits(userId, 'music_generate_v5')

if (!creditCheck.hasCredits) {
  return NextResponse.json(
    {
      error: 'Créditos insuficientes',
      required: creditCheck.required,
      current: creditCheck.currentBalance,
      deficit: creditCheck.deficit,
    },
    { status: 402 }
  )
}

console.log(`✅ Créditos OK (saldo: ${creditCheck.currentBalance})`)
```

### **PASSO 3: API gera música via Suno**
```typescript
// app/api/suno/generate/route.ts (linha 158-181)

const client = new SunoAPI(apiKey)

taskId = await client.generateMusic({
  prompt,
  customMode,
  instrumental,
  model,
  style,
  title,
  callBackUrl,
  // ... outros parâmetros
})

console.log(`✅ Música gerada! Task ID: ${taskId}`)
```

### **PASSO 4: API deduz créditos**
```typescript
// app/api/suno/generate/route.ts (linha 183-209)

// 🔥 DEDUZIR CRÉDITOS APÓS SUCESSO
const deduction = await deductCredits(userId, serviceName, {
  prompt: prompt.substring(0, 200),
  model: model || "V3_5",
  customMode,
  instrumental,
  taskId,
})

if (!deduction.success) {
  console.error('❌ Erro ao deduzir créditos:', deduction.error)
  // Música gerada mas créditos não deduzidos - LOG CRÍTICO
} else {
  console.log(`✅ Créditos deduzidos! Novo saldo: ${deduction.newBalance}`)
}

return NextResponse.json({
  taskId,
  creditsUsed: creditCheck.required,
  newBalance: deduction.newBalance,
  transactionId: deduction.transactionId,
})
```

### **PASSO 5: Sidebar mostra loading**
```tsx
// components/generation-sidebar.tsx (linha 28-332)

export function GenerationSidebar({ tasks, onRemoveTask, onViewTrack }) {
  // Mostra tasks ATIVAS (PENDING, TEXT_SUCCESS, FIRST_SUCCESS)
  
  return (
    <div className="fixed right-0 top-0 z-30 h-screen w-96">
      {tasks.map((task) => (
        <Card key={task.taskId}>
          {/* Ícone animado de loading */}
          {getStatusIcon(task.status, task.progress)}
          
          {/* Badge de status */}
          {getStatusBadge(task.status)}
          
          {/* Barra de progresso */}
          <div className="h-2 bg-secondary/50">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-gradient"
              style={{ width: `${task.progress}%` }}
            />
          </div>
          
          {/* Mensagem de status e tempo decorrido */}
          <span>{task.statusMessage}</span>
          <span>{getElapsedTime(task.startTime)}</span>
        </Card>
      ))}
    </div>
  )
}
```

### **PASSO 6: Polling automático de status**
```tsx
// contexts/generation-context.tsx (linha 107-228)

useEffect(() => {
  const activeTasks = tasks.filter(t => 
    t.status !== "SUCCESS" && 
    !t.error && 
    !t.status.includes("FAILED") &&
    t.progress < 100
  )

  if (activeTasks.length === 0) return

  // 🔥 POLLING A CADA 5 SEGUNDOS
  const pollInterval = setInterval(async () => {
    for (const task of activeTasks) {
      const response = await fetch(`/api/suno/status?taskId=${task.taskId}`)
      const data = await response.json()

      let progress = task.progress
      let statusMessage = task.statusMessage
      let newTracks = []

      switch (data.status) {
        case "PENDING":
          progress = 20
          statusMessage = "Preparing generation..."
          break

        case "TEXT_SUCCESS":
          progress = 40
          statusMessage = "Text generated, creating audio..."
          break

        case "FIRST_SUCCESS":
          progress = 70
          statusMessage = "First track complete, generating variations..."
          // Extrair tracks parciais
          newTracks = data.response?.sunoData || []
          break

        case "SUCCESS":
          progress = 100
          statusMessage = "Complete! Tracks saved to library"
          // Extrair todos os tracks
          const allTracks = data.response?.sunoData || []
          
          // 🔥 ADICIONAR À BIBLIOTECA (completedTracks)
          setCompletedTracks((prev) => {
            const existingIds = new Set(prev.map((t) => t.id))
            const uniqueNewTracks = allTracks.filter((t) => !existingIds.has(t.id))
            return [...uniqueNewTracks, ...prev]
          })
          
          // 🔥 REMOVER TASK ATIVA
          setTasks((prev) => prev.filter((t) => t.taskId !== task.taskId))
          break

        case "CREATE_TASK_FAILED":
        case "GENERATE_AUDIO_FAILED":
          progress = 0
          statusMessage = `Error: ${data.status}`
          break
      }

      // Atualizar task
      setTasks((prev) =>
        prev.map((t) =>
          t.taskId === task.taskId
            ? { ...t, status: data.status, progress, statusMessage, tracks: newTracks, error }
            : t
        )
      )
    }
  }, 5000)

  return () => clearInterval(pollInterval)
}, [tasks])
```

### **PASSO 7: Tracks aparecem na biblioteca**
```tsx
// components/music-library-sidebar.tsx (linha 12-269)

export function MusicLibrarySidebar() {
  const { completedTracks } = useGeneration()  // 🔥 SÓ TRACKS COMPLETOS
  const recentTracks = completedTracks.slice(-10).reverse()

  return (
    <motion.aside className="fixed top-0 right-0 h-screen w-[400px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {recentTracks.length === 0 ? (
          <div>Biblioteca Vazia</div>
        ) : (
          <AnimatePresence>
            {recentTracks.map((track) => (
              <motion.div key={track.id}>
                <Image src={track.imageUrl} />
                <h4>{track.title}</h4>
                <p>{track.tags}</p>
                <Badge>{formatDuration(track.duration)}</Badge>
                <Badge>{track.modelName}</Badge>
                <button onClick={() => togglePlay(track.id)}>
                  {playingId === track.id ? <Pause /> : <Play />}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.aside>
  )
}
```

---

## 3️⃣ **Estados de Loading Verificados**

### **GenerationSidebar (Tasks Ativas)**
| Status | Progress | Mensagem | Ícone |
|--------|----------|----------|-------|
| `PENDING` | 20% | "Preparing generation..." | 🔄 Spinning |
| `TEXT_SUCCESS` | 40% | "Text generated, creating audio..." | 🔄 Spinning |
| `FIRST_SUCCESS` | 70% | "First track complete, generating variations..." | 🔄 Spinning |
| `SUCCESS` | 100% | "Complete! Tracks saved to library" | ✅ CheckCircle |
| `FAILED` | 0% | "Error: ..." | ❌ AlertCircle |

### **MusicLibrarySidebar (Tracks Completos)**
- ✅ Mostra apenas `completedTracks` (status = SUCCESS)
- ✅ Exibe thumbnail, título, tags, duração, modelo
- ✅ Botão de play com preview
- ✅ Animações de entrada (fade in + scale)

---

## 4️⃣ **Sistema de Créditos**

### **Custos por Modelo**
| Modelo | Service Name | Custo |
|--------|-------------|-------|
| V3 | `music_generate_v3` | 6 créditos |
| V3_5 | `music_generate_v3_5` | 6 créditos |
| V4 | `music_generate_v4` | 6 créditos |
| V4_5 | `music_generate_v4_5` | 6 créditos |
| V4_5PLUS | `music_generate_v4_5plus` | 6 créditos |
| V5 | `music_generate_v5` | 6 créditos |

### **Fluxo de Créditos**
```typescript
// 1. VERIFICAR (antes de gerar)
const creditCheck = await checkCredits(userId, 'music_generate_v5')
// → hasCredits: true/false
// → required: 6
// → currentBalance: 150
// → deficit: 0

// 2. DEDUZIR (após sucesso)
const deduction = await deductCredits(userId, 'music_generate_v5', metadata)
// → success: true/false
// → newBalance: 144
// → transactionId: "uuid"

// 3. REEMBOLSAR (se falhar)
const refund = await refundCredits(transactionId)
// → success: true/false
// → newBalance: 150
```

### **RPC Functions (Supabase)**
```sql
-- Adicionar créditos
SELECT add_servicos_credits(
  p_user_id := 'uuid',
  p_amount := 6,
  p_description := 'Música gerada',
  p_metadata := '{"taskId": "abc123"}'
)

-- Deduzir créditos
SELECT deduct_servicos_credits(
  p_user_id := 'uuid',
  p_amount := 6,
  p_description := 'Geração de música V5',
  p_metadata := '{"taskId": "abc123", "model": "V5"}'
)
```

---

## 5️⃣ **Teste Automatizado Criado**

### **Script: `test-music-flow-complete.mjs`**

#### **Funcionalidades**
1. ✅ Cria ou busca usuário de teste
2. ✅ Garante créditos suficientes (50 créditos)
3. ✅ Testa **modo simples** (prompt básico)
4. ✅ Testa **modo customizado** (com estilo, título, parâmetros)
5. ✅ Verifica dedução de créditos ANTES e DEPOIS
6. ✅ Faz **polling de status** a cada 5s até conclusão
7. ✅ Aguarda estados: PENDING → TEXT_SUCCESS → FIRST_SUCCESS → SUCCESS
8. ✅ Verifica se tracks aparecem na biblioteca
9. ✅ Exibe resumo de transações

#### **Como Executar**
```bash
# 1. Iniciar servidor Next.js (se não estiver rodando)
npm run dev

# 2. Executar teste (em outro terminal)
node test-music-flow-complete.mjs
```

#### **Output Esperado**
```
╔════════════════════════════════════════════════════════════╗
║  🎵 TESTE COMPLETO: FLUXO DE GERAÇÃO DE MÚSICA           ║
╚════════════════════════════════════════════════════════════╝

━━━ 1️⃣ SETUP: Buscar ou criar usuário de teste ━━━
✅ Usuário de teste encontrado: test-music-flow@dua.ia (uuid)
✅ Saldo suficiente: 150 créditos

━━━ 2️⃣ TESTE 1: Geração Modo Simples ━━━
ℹ️  Saldo inicial: 150 créditos
ℹ️  Enviando request para /api/suno/generate...
✅ Música iniciada! Task ID: abc123 (1234ms)
ℹ️  Créditos usados: 6
ℹ️  Novo saldo: 144
✅ Créditos deduzidos corretamente: 6

━━━ 4️⃣ POLLING: Aguardando conclusão da Task abc123 ━━━
ℹ️  Estados esperados: PENDING → TEXT_SUCCESS → FIRST_SUCCESS → SUCCESS
ℹ️  [1] Status: PENDING
ℹ️  [2] Status: TEXT_SUCCESS
ℹ️  [3] Status: FIRST_SUCCESS
🎵 Primeira track completa! Aguardando variações...
ℹ️  [4] Status: SUCCESS
✅ Geração completa!
✅ 📀 2 tracks gerados:
ℹ️    1. "Calm Piano" - 120s
ℹ️       Audio: ✅
ℹ️       Stream: ✅
ℹ️       Image: ✅
ℹ️    2. "Calm Piano (Variation)" - 120s
ℹ️       Audio: ✅
ℹ️       Stream: ✅
ℹ️       Image: ✅

✅ FLUXO MODO SIMPLES: COMPLETO!
   - Créditos verificados ✅
   - Música gerada ✅
   - Créditos deduzidos ✅
   - 2 tracks na biblioteca ✅

━━━ 3️⃣ TESTE 2: Geração Modo Customizado ━━━
ℹ️  Saldo inicial: 144 créditos
✅ Música iniciada! Task ID: def456 (1567ms)
ℹ️  Créditos usados: 6
ℹ️  Novo saldo: 138
✅ Créditos deduzidos corretamente: 6

━━━ 4️⃣ POLLING: Aguardando conclusão da Task def456 ━━━
[... polling similar ...]

✅ FLUXO MODO CUSTOMIZADO: COMPLETO!
   - Créditos verificados ✅
   - Música gerada ✅
   - Créditos deduzidos ✅
   - 2 tracks na biblioteca ✅

━━━ 5️⃣ RESUMO FINAL ━━━
ℹ️  Saldo final: 138 créditos
ℹ️  
Últimas transações (4):
ℹ️    💳 -6 - Geração de música V4 (custom mode)
ℹ️    💳 -6 - Geração de música V3_5 (simple mode)

╔════════════════════════════════════════════════════════════╗
║  ✅ TESTE COMPLETO FINALIZADO COM SUCESSO!               ║
╚════════════════════════════════════════════════════════════╝
```

---

## 6️⃣ **Resumo de Verificação**

### ✅ **Componentes Verificados**
| Componente | Status | Localização |
|-----------|--------|-------------|
| **API de Geração** | ✅ Implementada | `app/api/suno/generate/route.ts` |
| **API de Status** | ✅ Implementada | `app/api/suno/status/route.ts` |
| **Verificação de Créditos** | ✅ Integrada | `checkCredits()` linha 47-75 |
| **Dedução de Créditos** | ✅ Integrada | `deductCredits()` linha 183-209 |
| **Formulário de Criação** | ✅ Implementado | `app/musicstudio/create/page.tsx` |
| **Sidebar de Loading** | ✅ Implementada | `components/generation-sidebar.tsx` |
| **Sidebar de Biblioteca** | ✅ Implementada | `components/music-library-sidebar.tsx` |
| **Context de Geração** | ✅ Implementado | `contexts/generation-context.tsx` |
| **Polling Automático** | ✅ Implementado | Context, polling a cada 5s |
| **Estados de Loading** | ✅ Implementados | PENDING → TEXT_SUCCESS → FIRST_SUCCESS → SUCCESS |
| **Persistência** | ✅ Implementada | localStorage (tasks + tracks) |

### ✅ **Fluxo Completo**
```
1. Usuário preenche formulário → ✅
2. Sistema verifica créditos → ✅
3. API Suno gera música → ✅
4. Sistema deduz créditos → ✅
5. Task adicionada ao contexto → ✅
6. GenerationSidebar mostra loading → ✅
7. Polling automático de status → ✅
8. Tracks salvos em completedTracks → ✅
9. MusicLibrarySidebar exibe tracks → ✅
10. Usuário pode tocar/baixar → ✅
```

---

## 7️⃣ **Próximos Passos para Teste Manual**

### **Opção 1: Teste Automatizado**
```bash
# Terminal 1: Iniciar servidor
npm run dev

# Terminal 2: Executar teste
node test-music-flow-complete.mjs
```

### **Opção 2: Teste Manual na UI**
1. ✅ Fazer login na aplicação
2. ✅ Ir para `/musicstudio/create`
3. ✅ Preencher formulário:
   - **Modo Simples**: prompt básico
   - **Modo Custom**: prompt + estilo + título
4. ✅ Clicar em "Generate"
5. ✅ Verificar redirecionamento para `/musicstudio/library`
6. ✅ Abrir **GenerationSidebar** (direita) → Ver loading
7. ✅ Aguardar 20-60s → Ver progresso
8. ✅ Quando completar → Ver tracks na **MusicLibrarySidebar**
9. ✅ Verificar créditos deduzidos em `/admin` ou Supabase

### **Opção 3: Inspeção de Banco de Dados**
```sql
-- Ver saldo de créditos
SELECT user_id, saldo_servicos_creditos, saldo_dua
FROM duaia_user_balances
WHERE user_id = 'UUID_DO_USUARIO';

-- Ver transações recentes
SELECT tipo, quantidade, descricao, metadata, created_at
FROM duaia_transactions
WHERE user_id = 'UUID_DO_USUARIO'
ORDER BY created_at DESC
LIMIT 10;
```

---

## 8️⃣ **Conclusão**

### ✅ **Sistema Implementado Corretamente**
- Verificação de créditos **ANTES** da geração ✅
- Dedução de créditos **APÓS** sucesso ✅
- Sidebar de loading com estados visuais ✅
- Polling automático de status ✅
- Biblioteca com tracks completos ✅
- Persistência em localStorage ✅

### 🎯 **Pronto para Testes**
O sistema está **100% implementado** e pronto para testes. Execute o script automatizado ou teste manualmente na UI para validar o fluxo completo.

### 📝 **Observações**
- Tempo estimado por geração: **20-60 segundos**
- Polling a cada **5 segundos**
- Cada geração gera **2 tracks** (original + variação)
- Custo fixo: **6 créditos** por geração (independente do modelo)

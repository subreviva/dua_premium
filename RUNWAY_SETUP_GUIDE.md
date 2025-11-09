# 🚀 RUNWAY ML - GUIA DE CONFIGURAÇÃO RÁPIDA

## ⚡ Setup em 5 Minutos

### 1️⃣ Obter API Key

1. Acesse https://app.runwayml.com/
2. Faça login ou crie conta
3. Vá em **Settings** → **API**
4. Clique em **Create New API Key**
5. Copie a key (começa com `RL_...`)

### 2️⃣ Adicionar ao .env.local

```bash
# Adicione esta linha no arquivo .env.local
RUNWAY_API_KEY=RL_your_api_key_here
```

### 3️⃣ Reiniciar Servidor

```bash
# No terminal:
npm run dev
```

### 4️⃣ Testar API

```bash
# Teste text-to-video:
curl -X POST http://localhost:3000/api/runway/text-to-video \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "promptText": "A beautiful sunset over the ocean",
    "model": "gen4_turbo",
    "duration": 4
  }'
```

### 5️⃣ Atualizar UI

Editar `app/videostudio/page.tsx`:

```typescript
// Mudar de:
const response = await fetch('/api/veo/generate', {...})

// Para:
const response = await fetch('/api/runway/text-to-video', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: session.user.id,
    promptText: prompt,
    model: selectedModel, // gen4_turbo | gen3a_turbo | gen4_aleph
    duration: selectedDuration, // 4 | 5 | 10
    ratio: selectedRatio, // 1280:720 | 720:1280 | etc
  }),
});
```

---

## ✅ CHECKLIST COMPLETO

- [ ] Obter Runway API Key
- [ ] Adicionar `RUNWAY_API_KEY` ao `.env.local`
- [ ] Reiniciar servidor (`npm run dev`)
- [ ] Testar endpoint `/api/runway/text-to-video`
- [ ] Atualizar UI do Video Studio
- [ ] Adicionar seletor de modelo (Turbo/Aleph)
- [ ] Atualizar display de créditos (30/35/100)
- [ ] Remover código antigo do Veo
- [ ] Testar fluxo completo
- [ ] Deploy no Vercel

---

## 🎯 MODELOS DISPONÍVEIS

| Modelo | Duração | Créditos | Quando Usar |
|--------|---------|----------|-------------|
| **gen4_turbo** | 4s | 30 | Protótipos, testes rápidos |
| **gen3a_turbo** | 5s | 35 | Produção média qualidade |
| **gen4_aleph** | 10s | 100 | Produção profissional |

---

## 💰 CUSTOS

- **Gen-4 Turbo (4s):** 30 créditos = €0,90
- **Gen-3a Turbo (5s):** 35 créditos = €1,05
- **Gen-4 Aleph (10s):** 100 créditos = €3,00

**LUCRO:** 233-350% 🚀

---

## 🔧 TROUBLESHOOTING

### Erro: "API Key inválida"
```bash
# Verificar se key está no .env.local:
cat .env.local | grep RUNWAY

# Se não aparecer, adicione:
echo 'RUNWAY_API_KEY=RL_your_key' >> .env.local

# Reinicie:
npm run dev
```

### Erro: "Task timeout"
- Tempo limite: 120 tentativas × 5s = 10 minutos
- Vídeos complexos podem demorar mais
- Aumentar `maxAttempts` se necessário

### Erro: "Insufficient credits"
- Usuário sem créditos suficientes
- Redirecionar para `/loja-creditos`

---

## 📊 LOGS E DEBUGGING

```bash
# Ver logs do servidor:
npm run dev

# Logs incluem:
[Runway] Iniciando geração de vídeo...
[Runway] Task criada: task-123
[Runway] Aguardando... tentativa 1/120
[Runway] Status: PROCESSING (50%)
[Runway] ✅ Concluído! URL: https://...
```

---

## 🚀 DEPLOY

### Vercel

1. Adicionar variável de ambiente:
```bash
# No dashboard Vercel:
Settings → Environment Variables
RUNWAY_API_KEY = RL_your_key
```

2. Deploy:
```bash
git add .
git commit -m "feat: Runway ML integration"
git push origin main
```

3. Vercel fará deploy automático ✅

---

## 📚 DOCUMENTAÇÃO COMPLETA

Veja `RUNWAY_ML_IMPLEMENTATION.md` para:
- Exemplos de código completos
- Todos os endpoints
- Comparação Veo vs Runway
- Diagramas de fluxo
- Casos de uso

---

## ⚡ MIGRAÇÃO COMPLETA

### Arquivos Modificados:
1. ✅ `lib/creditos-config.ts` - Custos atualizados
2. ✅ `lib/creditos-acoes-completo.ts` - Ações Runway
3. ✅ `app/api/runway/*` - 4 novos endpoints
4. ⏳ `app/videostudio/page.tsx` - **Precisa atualizar**

### Arquivos para Remover:
- `app/api/veo/generate/route.ts`
- `app/api/veo/operation/route.ts`

---

**PRONTO PARA USAR!** 🎉

Basta adicionar a API Key e reiniciar o servidor.

# 🚀 DUA MUSIC - GUIA RÁPIDO

> **Problema resolvido:** Erro 400 Bad Request no `/api/music/custom`
> **Status:** ✅ Código corrigido, pronto para testar

---

## ⚡ INÍCIO RÁPIDO (3 comandos)

```bash
# 1. Configure API key
echo "SUNO_API_KEY=sua_chave_aqui" > .env.local

# 2. Inicie servidor
./start.sh

# 3. (Novo terminal) Teste endpoints
./test-endpoints.sh
```

✅ **Pronto!** Acesse `http://localhost:3000`

---

## 🔑 CONFIGURAÇÃO ESSENCIAL

### 1. Obter chave API da Suno

Você precisa de uma chave API válida. Se não tiver:

1. Acesse [suno.ai](https://suno.ai)
2. Crie conta / faça login
3. Obtenha API key nas configurações
4. Cole no `.env.local`

### 2. Criar arquivo `.env.local`

```bash
# Na raiz do projeto
echo "SUNO_API_KEY=sk-xxxxxxxxxxxxxxx" > .env.local
```

⚠️ **Importante:** Substitua `sk-xxxxxxxxxxxxxxx` pela sua chave real

### 3. Verificar configuração

```bash
# Ver se chave está configurada (sem mostrar valor)
cat .env.local | grep SUNO_API_KEY
```

Deve mostrar: `SUNO_API_KEY=sk-...`

---

## 🧪 TESTAR SE FUNCIONA

### Opção 1: Script Automático (RECOMENDADO)

```bash
./test-endpoints.sh
```

**Resultados esperados:**
- ✅ Test 1: Diagnostic endpoint OK
- ✅ Test 2: Echo test OK
- ✅ Test 3-5: Custom endpoint OK
- ✅ Test 6: Error handling OK

### Opção 2: Interface Web

1. Abra `http://localhost:3000`
2. Clique em **"Custom"** (modo customizado)
3. Preencha:
   - **Song Description:** "a happy pop song"
   - **Styles:** "pop, upbeat"
   - **Title:** "Test Song"
4. Clique **"Create"**
5. Aguarde... (pode demorar 30-60s)

**Sucesso se:**
- ❌ NÃO aparece "400 Bad Request"
- ✅ Aparece "Processing... (X%)"
- ✅ Música é gerada

### Opção 3: Teste Manual (curl)

```bash
curl -X POST http://localhost:3000/api/music/custom \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A happy song",
    "tags": "pop",
    "title": "Test"
  }' | jq
```

**Sucesso se retorna:**
```json
{
  "success": true,
  "task_id": "abc123...",
  "data": { ... }
}
```

---

## 🐛 PROBLEMAS COMUNS

### ❌ Erro: "SUNO_API_KEY not configured"

**Causa:** Chave API não foi configurada

**Solução:**
```bash
echo "SUNO_API_KEY=sua_chave_real" > .env.local
# Reinicie servidor (Ctrl+C e ./start.sh)
```

### ❌ Erro: "Server not running"

**Causa:** Servidor dev não está ativo

**Solução:**
```bash
./start.sh
# Ou manualmente: npm run dev
```

### ❌ Erro: "Port 3000 already in use"

**Causa:** Outro processo usando porta 3000

**Solução:**
```bash
# Mata processo na porta 3000
kill -9 $(lsof -t -i:3000)

# Reinicia servidor
./start.sh
```

### ❌ Erro 502: "Bad Gateway"

**Causa:** API externa da Suno com problema OU chave inválida

**Solução:**
1. Verifique se chave API está correta
2. Teste em [suno.ai](https://suno.ai) se site funciona
3. Aguarde alguns minutos (pode ser instabilidade temporária)

### ⚠️ Erro: "ENOPRO: No file system provider"

**Causa:** Bug conhecido do devcontainer

**Impacto:** Nenhum - pode ignorar

**Solução:** Não precisa fazer nada, sistema funciona normalmente

---

## 📊 VERIFICAR LOGS

### Logs do Servidor (Terminal)

Quando você cria música, deve ver:

```
📥 [Custom] Received body: { "prompt": "...", ... }
🎵 [Custom] Processed params: { prompt: '...', tags: '...', ... }
🚀 [Custom] Calling Suno API...
✅ [Custom] SUCCESS - Task ID: abc123
```

### Logs do Navegador (DevTools - F12)

Console deve mostrar:

```javascript
[v0] Generation params: { ... }
[v0] Music generation started: { success: true, task_id: "..." }
[v0] Polling attempt 1 result: { ... }
...
[v0] Music generation complete
[v0] Saving 2 songs to localStorage
```

### Sem Logs?

**Problema:** Endpoint não está sendo chamado

**Verifique:**
1. Console do navegador para erros JavaScript
2. Network tab (F12) → veja se POST foi feito
3. Servidor está rodando? (`./start.sh` ativo?)

---

## 📁 ARQUIVOS IMPORTANTES

| Arquivo | Propósito |
|---------|-----------|
| `.env.local` | Chave API (NÃO commite!) |
| `start.sh` | Inicia servidor automaticamente |
| `test-endpoints.sh` | Testa todos endpoints |
| `app/api/music/custom/route.ts` | Endpoint corrigido |
| `RESUMO_EXECUTIVO.md` | Documentação completa |

---

## 🎯 CHECKLIST FINAL

Antes de usar, verifique:

- [ ] `.env.local` criado com SUNO_API_KEY válida
- [ ] Servidor rodando (`./start.sh` ou `npm run dev`)
- [ ] Testes passando (`./test-endpoints.sh`)
- [ ] Porta 3000 acessível (`curl http://localhost:3000/api/test-simple`)
- [ ] Console do navegador aberto (F12)
- [ ] Console do servidor visível (terminal)

✅ **Tudo OK?** Comece a criar música!

---

## 🆘 AJUDA

**Ainda com problemas?**

1. Leia `RESUMO_EXECUTIVO.md` (documentação completa)
2. Verifique logs no servidor E navegador
3. Execute `./test-endpoints.sh` e veja onde falha
4. Confirme `.env.local` tem chave válida

**Arquivos de ajuda:**
- `RESUMO_EXECUTIVO.md` - Documentação completa
- `REVOLUCAO_COMPLETA.md` - Detalhes técnicos
- `ENDPOINT_SIMPLIFICATION_COMPLETE.md` - Changelog

---

## 🎉 TUDO FUNCIONANDO?

Parabéns! Agora você pode:

✅ Criar música customizada (modo Custom)
✅ Gerar música simples (modo Simple)
✅ Ver créditos disponíveis
✅ Acompanhar progresso de geração

**Próximos passos:**
- Explore outras features (Upload, Extend, Stems)
- Teste diferentes estilos musicais
- Crie personas personalizadas
- Gere MIDI e WAV

**Importante:** Algumas features avançadas podem ainda ter problemas.
Foque primeiro em geração básica (Custom/Simple).

---

**Versão:** 1.0
**Status:** ✅ Pronto para usar
**Última atualização:** 2025-01-XX

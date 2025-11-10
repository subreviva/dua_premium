# 🔍 DEBUG: Como Descobrir o Problema de Geração de Imagens

## 🎯 Objetivo
Identificar **exatamente** onde está falhando a geração de imagens.

---

## 🧪 PASSO 1: Testar na Página de Debug (MAIS FÁCIL)

Após o deploy completar (~2 min):

1. **Acesse:** `https://seu-dominio.vercel.app/test-image-gen`

2. **Abra o Console do Navegador:**
   - Pressione **F12**
   - Vá na aba **Console**

3. **Clique em "🚀 Testar Geração"**

4. **Observe os logs:**
   ```
   🧪 Teste: Enviando requisição...
   🎨 useImagenApi - Iniciando geração
   User ID: xxx...
   Modelo: imagen-4.0-generate-001
   Prompt: a beautiful sunset...
   Config final: {...}
   📥 Status: 200 (ou erro)
   📦 Dados: {...}
   ```

5. **Copie TUDO que aparecer no console** e me envie

---

## 📊 PASSO 2: Verificar Logs da Vercel

1. **Acesse:** https://vercel.com/dashboard
2. **Seu Projeto** → **Deployments**
3. **Último deploy** → **Functions**
4. **Clique em `/api/imagen/generate`**
5. **Veja os Runtime Logs**

### O que procurar:

#### ✅ Se estiver funcionando:
```
🎨 Iniciando geração de imagem...
📝 Prompt: a beautiful sunset...
🤖 Modelo: imagen-4.0-generate-001
⚙️ Config: {...}
🚀 Chamando Google Imagen API...
✅ Resposta recebida da API
✅ 4 imagens geradas com sucesso
```

#### ❌ Se GOOGLE_API_KEY ausente:
```
❌ GOOGLE_API_KEY não configurada
```
**Solução:** Verificar Environment Variables na Vercel

#### ❌ Se erro da Google:
```
❌ Erro na API Imagen: [mensagem]
Stack: [detalhes]
```
**Pode ser:**
- API Key inválida (401)
- Quota excedida (429)
- Prompt bloqueado (400)
- Serviço indisponível (503)

---

## 🔍 PASSO 3: Verificar Variáveis na Vercel

1. **Vercel Dashboard** → Seu Projeto
2. **Settings** → **Environment Variables**
3. **Verificar:**

```
✅ GOOGLE_API_KEY
   - Deve começar com: AIza...
   - Environments: Production ✓ Preview ✓ Development ✓
   
✅ NEXT_PUBLIC_SUPABASE_URL
   - Deve terminar com: .supabase.co
   
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
   - Key pública do Supabase
   
✅ SUPABASE_SERVICE_ROLE_KEY
   - Service role key do Supabase
```

---

## 🧰 PASSO 4: Testar API Diretamente (Avançado)

Se quiser testar direto a API:

```bash
curl -X POST https://seu-dominio.vercel.app/api/imagen/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "a beautiful sunset",
    "model": "imagen-4.0-generate-001",
    "config": {
      "numberOfImages": 1,
      "aspectRatio": "1:1"
    }
  }'
```

### Respostas Esperadas:

#### ✅ Sucesso (200):
```json
{
  "success": true,
  "images": [
    {
      "url": "data:image/png;base64,...",
      "mimeType": "image/png",
      "prompt": "a beautiful sunset",
      "index": 1
    }
  ],
  "model": "imagen-4.0-generate-001"
}
```

#### ❌ API não configurada (503):
```json
{
  "error": "Serviço de geração de imagens não configurado",
  "message": "A variável GOOGLE_API_KEY não está configurada...",
  "docs": "https://ai.google.dev/gemini-api/docs/api-key"
}
```

#### ❌ Créditos insuficientes (402):
```json
{
  "error": "Créditos insuficientes",
  "details": {
    "creditos_necessarios": 30,
    "creditos_atuais": 0,
    "faltam": 30
  },
  "redirect": "/loja-creditos"
}
```

---

## 📋 Checklist de Diagnóstico

Faça e me diga o resultado:

- [ ] Deploy completou com sucesso?
- [ ] Acessei `/test-image-gen`?
- [ ] Abri o Console (F12)?
- [ ] Cliquei em "Testar Geração"?
- [ ] Qual foi o **status** retornado? (200, 400, 402, 503, 500?)
- [ ] Qual foi a **mensagem de erro**?
- [ ] Verifiquei os logs da Vercel?
- [ ] GOOGLE_API_KEY está configurada?
- [ ] A key começa com "AIza..."?

---

## 🎯 Possíveis Causas & Soluções

| Sintoma | Causa Provável | Solução |
|---------|---------------|---------|
| Status 503 | GOOGLE_API_KEY ausente | Adicionar na Vercel |
| Status 401 | API Key inválida | Gerar nova key |
| Status 402 | Sem créditos | Comprar créditos |
| Status 429 | Quota Google excedida | Aguardar 24h |
| Status 400 | Prompt inválido | Mudar prompt |
| Status 500 | Erro no servidor | Ver logs Vercel |
| Nenhum log | Request não chegou | Problema de rede |

---

## 📸 O Que Preciso Ver

Para te ajudar, preciso de:

1. **Screenshot do console** quando testar em `/test-image-gen`
2. **Screenshot dos logs** da Vercel (Functions → /api/imagen/generate)
3. **Print das Environment Variables** (pode esconder os valores)
4. **Qual mensagem de erro exata** aparece

---

## 🚀 Próximos Passos

1. ✅ Aguarde deploy completar (2-3 min)
2. ✅ Acesse `/test-image-gen`
3. ✅ Teste e copie os logs
4. ✅ Me envie os resultados
5. ✅ Vou identificar o problema exato!

---

**💡 Com esses logs, vou saber EXATAMENTE o que está errado e como corrigir!**

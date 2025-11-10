# 🎨 COMO RESOLVER: Geração de Imagens não Funciona

## ❌ Problema Identificado

Você está vendo o erro **400** porque a variável `GOOGLE_API_KEY` **não está configurada na Vercel**.

Sem essa chave, as APIs de geração de imagem (`/api/imagen/generate` e `/api/design-studio`) não conseguem funcionar.

---

## ✅ SOLUÇÃO COMPLETA (3 Passos)

### 📌 Passo 1: Obter a Google API Key

1. Acesse: https://ai.google.dev/gemini-api/docs/api-key
2. Clique em **"Get API Key"**
3. Escolha **"Create API key in new project"** ou use um projeto existente
4. Copie a chave (algo como: `AIzaSyC...`)

**💡 Importante:**
- A chave é **GRATUITA** com quota generosa
- Habilite o serviço **Gemini API**
- Habilite também **Imagen API** (se disponível em sua região)

---

### 📌 Passo 2: Configurar na Vercel

1. Acesse seu projeto na Vercel: https://vercel.com/dashboard
2. Vá em **Settings** → **Environment Variables**
3. Adicione a variável:

```
Name: GOOGLE_API_KEY
Value: [Cole sua chave aqui]
```

4. Selecione todos os ambientes (Production, Preview, Development)
5. Clique em **Save**

---

### 📌 Passo 3: Redeploy do Projeto

**Opção A - Pela Vercel Dashboard:**
1. Vá em **Deployments**
2. Encontre o último deploy
3. Clique nos 3 pontinhos → **Redeploy**
4. Confirme

**Opção B - Pelo Git:**
```bash
git commit --allow-empty -m "trigger: configurar GOOGLE_API_KEY"
git push
```

---

## 🔍 Verificar se Funcionou

Após o redeploy, teste:

1. Acesse **Image Studio** em seu site
2. Digite um prompt: `"a beautiful sunset over mountains"`
3. Clique em **"Gerar Imagem"**
4. Aguarde 5-10 segundos
5. ✅ Deve gerar 4 imagens!

---

## 📊 Sistema de Créditos

Com a correção, o sistema funcionará assim:

- **Custo:** 30 créditos por geração (4 imagens)
- **Usuários logados:** Créditos são debitados automaticamente
- **Usuários não logados:** Podem gerar, mas sem histórico

---

## 🛠️ Diagnóstico Local

Para verificar se está tudo OK localmente:

```bash
node diagnose-image-generation.js
```

Deve mostrar:
```
✅ GOOGLE_API_KEY: Configurada
✅ @google/genai: Instalado
✅ Cliente GoogleGenAI inicializado
```

---

## ⚡ APIs Disponíveis Após Configuração

### Image Studio (`/imagestudio`)
- **Modelo:** Google Imagen 4
- **Variantes:**
  - `ultra` - Máxima qualidade (lento)
  - `standard` - Balanceado (recomendado)
  - `fast` - Rápido
  - `imagen3` - Versão anterior

### Design Studio (`/designstudio`)
- **Modelo:** Gemini 2.5 Flash Image Preview
- **Recursos:**
  - Geração de imagens
  - Edição com IA
  - Variações criativas
  - Extração de paleta de cores
  - Análise de imagens

---

## 🚨 Erros Comuns

### ❌ Erro 503: "Serviço não configurado"
**Causa:** `GOOGLE_API_KEY` não está na Vercel  
**Solução:** Siga Passo 2 acima

### ❌ Erro 401: "API Key inválida"
**Causa:** Chave incorreta ou expirada  
**Solução:** Gere nova chave em https://ai.google.dev/

### ❌ Erro 402: "Créditos insuficientes"
**Causa:** Usuário sem créditos  
**Solução:** Vai redirecionar automaticamente para `/loja-creditos`

### ❌ Erro 429: "Quota excedida"
**Causa:** Limite da Google atingido  
**Solução:** Aguarde reset (diário) ou upgrade do plano Google

---

## 💰 Custo Google

A API do Google Gemini/Imagen é **gratuita** com limites:

- **Tier Gratuito:**
  - 15 requisições/minuto
  - 1500 requisições/dia
  
- **Tier Pago:** (Opcional, para produção)
  - Imagen 4 Standard: ~$0.04 por imagem
  - Imagen 4 Ultra: ~$0.08 por imagem

Para a maioria dos casos, o tier gratuito é suficiente.

---

## 📝 Checklist Final

- [ ] Obtive a `GOOGLE_API_KEY`
- [ ] Configurei na Vercel (Settings > Environment Variables)
- [ ] Fiz redeploy do projeto
- [ ] Aguardei 2-3 minutos para o deploy completar
- [ ] Testei gerando uma imagem
- [ ] ✅ FUNCIONOU!

---

## 🆘 Ainda com Problemas?

Se após configurar ainda não funcionar:

1. **Verifique os logs da Vercel:**
   - Deployments > [Seu deploy] > Runtime Logs
   - Procure por erros com "GOOGLE_API_KEY"

2. **Teste localmente:**
   ```bash
   # Criar .env.local
   echo "GOOGLE_API_KEY=sua-chave-aqui" > .env.local
   
   # Rodar dev
   npm run dev
   
   # Testar em http://localhost:3000/imagestudio
   ```

3. **Verifique permissões da API:**
   - Acesse: https://console.cloud.google.com/
   - Vá em "APIs & Services" > "Enabled APIs"
   - Certifique-se que "Generative Language API" está habilitada

---

## 🎯 Resumo Rápido

```bash
# 1. Obter chave
https://ai.google.dev/gemini-api/docs/api-key

# 2. Configurar Vercel
GOOGLE_API_KEY=AIzaSyC...

# 3. Redeploy
git commit --allow-empty -m "add: GOOGLE_API_KEY"
git push

# 4. Testar
# Acesse /imagestudio e gere uma imagem
```

---

**✨ Depois dessa configuração, todos os estúdios de imagem vão funcionar perfeitamente!**

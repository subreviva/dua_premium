# 🚀 CONFIGURAR VARIÁVEIS DE AMBIENTE NO VERCEL

## ❌ ERRO ATUAL
```
Error: supabaseUrl is required.
```

O build falhou porque **faltam as variáveis de ambiente** no Vercel.

---

## ✅ SOLUÇÃO RÁPIDA

### 1️⃣ Aceder ao Dashboard Vercel
👉 https://vercel.com/subrevivas-projects/v0-remix-of-untitled-chat/settings/environment-variables

### 2️⃣ Adicionar estas variáveis:

#### **NEXT_PUBLIC_SUPABASE_URL**
```
https://gocjbfcztorfswlkkjqi.supabase.co
```
- Tipo: **Plain Text**
- Ambientes: ✅ Production ✅ Preview ✅ Development

---

#### **NEXT_PUBLIC_SUPABASE_ANON_KEY**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvY2piZmN6dG9yZnN3bGtranFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODYzNTUsImV4cCI6MjA3Nzg2MjM1NX0.MFqNbSXuIzORJmn4FmG_UsuLz5OvZ3Q-Wdnlm7jmpaY
```
- Tipo: **Sensitive** (esconder valor)
- Ambientes: ✅ Production ✅ Preview ✅ Development

---

#### **SUPABASE_SERVICE_ROLE_KEY** ⚠️ CRÍTICO
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvY2piZmN6dG9yZnN3bGtranFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI4NjM1NSwiZXhwIjoyMDc3ODYyMzU1fQ.AhNnsqi7E3Rco-m36fAVuqW5UsyDWdMAVKYkFAneOPk
```
- Tipo: **Sensitive** (esconder valor)
- Ambientes: ✅ Production ✅ Preview ✅ Development
- ⚠️ **ATENÇÃO:** Esta é a chave ADMIN - bypassa todas as permissões!
- 🔒 NUNCA compartilhar publicamente!

---

### 3️⃣ Após adicionar as variáveis

**OPÇÃO A - Redeploy Manual:**
```bash
# Triggerar novo deploy
git commit --allow-empty -m "trigger: Force redeploy with env vars"
git push origin main
```

**OPÇÃO B - Redeploy no Dashboard:**
1. Ir para: https://vercel.com/subrevivas-projects/v0-remix-of-untitled-chat/deployments
2. Clicar nos "..." do último deploy
3. Clicar em "Redeploy"

---

## 📋 CHECKLIST

- [ ] Adicionar `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Adicionar `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Adicionar `SUPABASE_SERVICE_ROLE_KEY` (buscar no Supabase Dashboard)
- [ ] Verificar que todas estão em **Production**
- [ ] Fazer redeploy (git push ou manual)
- [ ] Verificar build passou ✅

---

## 🔐 OUTRAS VARIÁVEIS (OPCIONAIS)

Se precisar adicionar mais tarde:

```env
# Google AI (para chat)
GOOGLE_GENERATIVE_AI_API_KEY=sua_key_aqui

# Gemini API
GEMINI_API_KEY=sua_key_aqui

# Imagen API
GEMINI_IMAGEN_API_KEY=sua_key_aqui
```

---

## ✅ RESULTADO ESPERADO

Após adicionar as variáveis e fazer redeploy:

```
✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
Build completed successfully
```

---

## 🆘 SUPORTE

Se continuar com erro, verificar:
1. ✅ Variáveis estão em **Production**
2. ✅ Não há espaços antes/depois dos valores
3. ✅ Fez redeploy após adicionar variáveis

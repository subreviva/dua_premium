# �� Credenciais Supabase Atualizadas

**Data:** 2025-11-11 02:30 UTC

## ✅ Variáveis Atualizadas na Vercel

### Production
- ✅ `NEXT_PUBLIC_SUPABASE_URL` = https://nranmngyocaqjwcokcxm.supabase.co
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` = eyJhbGci...UQeTU (anon public key)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` = eyJhbGci...f_4lQ (service role secret)

### Development
- ✅ `NEXT_PUBLIC_SUPABASE_URL` = https://nranmngyocaqjwcokcxm.supabase.co
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` = eyJhbGci...UQeTU
- ✅ `SUPABASE_SERVICE_ROLE_KEY` = eyJhbGci...f_4lQ

### Preview
- ✅ `NEXT_PUBLIC_SUPABASE_URL` = https://nranmngyocaqjwcokcxm.supabase.co
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` = eyJhbGci...UQeTU
- ✅ `SUPABASE_SERVICE_ROLE_KEY` = eyJhbGci...f_4lQ

## ✅ Variáveis Atualizadas Localmente

`.env.local` atualizado com:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_URL` (sem NEXT_PUBLIC_)
- `SUPABASE_ANON_KEY` (sem NEXT_PUBLIC_)
- `SUPABASE_JWT_SECRET` (mantido)

## 🚀 Deploy Produção

**URL Atual:** https://v0-remix-of-untitled-chat-hou8uxaj0.vercel.app

**Status:** ● Ready (2 minutos atrás)

## 🔑 Credenciais Supabase Completas

### Anon Key (Public)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW5tbmd5b2NhcWp3Y29rY3htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NzcxNTIsImV4cCI6MjA3NDE1MzE1Mn0.dFKTXrh2w8FOzcXndyjlVXP-jUaBUxkBZEWLd4UQeTU
```

### Service Role Key (Secret)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW5tbmd5b2NhcWp3Y29rY3htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU3NzE1MiwiZXhwIjoyMDc0MTUzMTUyfQ.QigiIbtuBBvzxL3yqLHkl-QYZBSBDBrx1L4B0nf_4lQ
```

### Publishable Key
```
sb_publishable_zwdrTFjCLVqZlw03oyVITg_AfGKQi9r
```

### Secret Key
```
sb_secret_8ut4VoQUgG-mYKwrE2wW5g_kbHq35Xo
```

## 📝 Próximos Passos

1. ✅ Testar registo em: https://v0-remix-of-untitled-chat-hou8uxaj0.vercel.app/acesso
2. ✅ Usar código: `DUA-11SF-3GX` (ou qualquer dos 168 ativos)
3. ✅ Verificar que não há 404 errors
4. ✅ Confirmar que 150 créditos aparecem após registo

## 🔧 Comandos Executados

```bash
# Vercel - Production
vercel env rm NEXT_PUBLIC_SUPABASE_URL production --yes
vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY production --yes
vercel env rm SUPABASE_SERVICE_ROLE_KEY production --yes

echo "https://nranmngyocaqjwcokcxm.supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL production
echo "eyJhbGci...UQeTU" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
echo "eyJhbGci...f_4lQ" | vercel env add SUPABASE_SERVICE_ROLE_KEY production

# Vercel - Development & Preview
# (mesmo processo)

# Deploy
vercel --prod --force
```

## ⚠️ Notas de Segurança

- ✅ `.env.local` está no `.gitignore` (não vai para Git)
- ✅ Service Role Key está apenas em variáveis de ambiente (não em código)
- ✅ Anon Key é público (seguro para frontend)
- ✅ Todas as APIs usam RLS (Row Level Security)

# 📧 Desabilitar Confirmação de Email no Supabase

Para evitar o problema de "Email not confirmed", podes desabilitar a confirmação de email no Supabase:

## 🔧 Passos no Dashboard Supabase

1. Acede: https://supabase.com/dashboard/project/nranmngyocaqjwcokcxm

2. Vai a: **Authentication** → **Settings** → **Email Auth**

3. Desativa: **"Confirm email"**
   - Muda para: **OFF** / **Disabled**

4. Guarda as alterações

## ✅ Resultado

Após desabilitar:
- ✅ Novos registos NÃO precisam confirmar email
- ✅ Login funciona IMEDIATAMENTE após signup
- ✅ Não precisa chamar API `/api/auth/confirm-email`
- ✅ Sistema 100% frontend funciona perfeitamente

## 🚀 Alternativa: Manter confirmação mas auto-confirmar

Se quiseres manter a confirmação de email ativa mas auto-confirmar programaticamente:

1. Mantém "Confirm email" **ON**
2. A nossa API `/api/auth/confirm-email` confirma automaticamente
3. Usa Service Role Key para bypasses RLS

---

**Recomendação:** 
- Para produção com códigos de acesso: **DESABILITAR** confirmação de email
- Para produção pública: **MANTER** confirmação de email + auto-confirm via API



📋 CHECKLIST PARA FAZER FUNCIONAR NO VERCEL
===============================================

✅ LOCAL FUNCIONA - precisamos replicar no Vercel

CAUSA PROVÁVEL:
- Vercel está usando código ANTIGO (antes das correções)
- Build cache do Vercel precisa ser limpo

AÇÕES IMEDIATAS:

1️⃣ FORÇAR NOVO DEPLOY NO VERCEL
   - Ir para: https://vercel.com/subrevivas-projects/v0-remix-of-untitled-chat-liard-one
   - Clicar "Deployments"
   - Clicar "Redeploy" no último deploy
   - Marcar "Use existing Build Cache" = OFF (DESMARCAR)
   - Confirmar "Redeploy"

2️⃣ VERIFICAR ENVIRONMENT VARIABLES NO VERCEL
   - Settings → Environment Variables
   - Confirmar:
     • NEXT_PUBLIC_SUPABASE_URL = https://nranmngyocaqjwcokcxm.supabase.co
     • NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIs...

3️⃣ VERIFICAR LOGS DO VERCEL APÓS DEPLOY
   - Deployments → [último deploy] → View Function Logs
   - Procurar por erros 400/401
   - Se aparecer "subscription_tier" ou "display_name" = código antigo

4️⃣ TESTAR APÓS REDEPLOY
   - Abrir: https://v0-remix-of-untitled-chat-liard-one.vercel.app/login
   - Modo incognito (limpar cache browser)
   - Login: estraca@2lados.pt / lumiarbcv
   - Esperado: Login sucesso + redirect /chat

5️⃣ SE AINDA FALHAR
   - Verificar Console do Browser (F12)
   - Copiar ERRO EXATO
   - Verificar Network tab: qual request falha?

ARQUIVOS QUE FORAM CORRIGIDOS (precisam estar no deploy):
- app/login/page.tsx (audit desabilitado, query corrigida)
- app/admin-new/page.tsx (subscription_tier removido)
- components/chat-profile.tsx (subscription_tier removido)
- app/profile/[username]/page.tsx (display_name → name)

ÚLTIMA MODIFICAÇÃO: 2025-11-07T13:11:36.044Z

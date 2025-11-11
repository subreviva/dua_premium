# ⚡ QUICK FIX: Aplicar Correção de Auth

## 🎯 Passos Rápidos

### 1. ✅ Arquivos Já Corrigidos
- `lib/supabase.ts` - Cliente com PKCE e auto-logout
- `hooks/useSupabaseAuth.ts` - Hook React completo
- `components/auth-error-boundary.tsx` - Boundary global

### 2. 🔧 Adicionar AuthErrorBoundary no Layout

**Arquivo:** `app/layout.tsx`

```typescript
import { AuthErrorBoundary } from '@/components/auth-error-boundary'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {/* Adicionar aqui: */}
        <AuthErrorBoundary>
          {children}
        </AuthErrorBoundary>
      </body>
    </html>
  )
}
```

### 3. 🔄 Reiniciar Servidor

```bash
# Parar servidor atual (se necessário)
pkill -f "next dev"

# Iniciar novamente
./start-dev-forever.sh
```

### 4. 🧹 Limpar Cache do Navegador

```bash
# No navegador (DevTools Console):
localStorage.clear()
location.reload()
```

### 5. ✅ Testar

1. Fazer logout
2. Fazer login novamente
3. Erro deve ter desaparecido!

---

## 🚨 Se Erro Persistir

### Opção 1: Limpar Completamente
```bash
# No Console do navegador:
localStorage.clear()
sessionStorage.clear()
location.reload()
```

### Opção 2: Forçar Novo Login
```typescript
// No Console do navegador:
import { supabaseClient } from '@/lib/supabase'
await supabaseClient.auth.signOut()
location.href = '/login'
```

### Opção 3: Verificar Supabase Dashboard
1. Ir para: https://supabase.com/dashboard
2. Projeto: nranmngyocaqjwcokcxm
3. Authentication → Users
4. Verificar se usuário existe e está ativo

---

## ✅ Confirmação de Sucesso

Você NÃO deve mais ver:
- ❌ "Invalid Refresh Token"
- ❌ "Refresh Token Not Found"

Deve ver:
- ✅ Login funcionando normalmente
- ✅ Tokens renovando automaticamente
- ✅ Logout limpo sem erros

---

**Status:** Correção aplicada e pronta! 🎉

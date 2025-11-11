# 🔐 AUDITORIA COMPLETA - SISTEMA DE AUTENTICAÇÃO E PERMISSÕES

**Data:** 2025-11-11
**Projeto:** DUA IA Platform
**Escopo:** Login, Registo, Administradores, Artistas

---

## ✅ SCHEMA SUPABASE VALIDADO

### 📊 Tabelas Confirmadas

| Tabela | Campos Críticos | RLS Status | Observações |
|--------|----------------|------------|-------------|
| **users** | 38 colunas (email, role, has_access, etc.) | ✅ 4 policies | Tabela principal de utilizadores |
| **admin_accounts** | id, role, permissions, created_at | ✅ 3 policies | Registo específico de admins |
| **admin_permissions** | - | ✅ Confirmada | Permissões granulares |
| **artists** | 10 campos (name, genre, location, etc.) | ✅ 1 policy (read-only) | Apenas admins podem criar |
| **artist_applications** | - | ✅ Confirmada | Candidaturas de artistas |

### 🔑 Administradores Ativos

```sql
-- 2 contas admin confirmadas:
1. estraca@2lados.pt (users.role: super_admin, admin_accounts.role: admin)
2. info@2lados.pt (users.role: user, admin_accounts.role: admin)
3. dev@dua.com (users.role: admin, sem admin_accounts)
```

**⚠️ INCONSISTÊNCIA DETECTADA:**
- `info@2lados.pt` tem `admin_accounts` mas `users.role = 'user'`
- `dev@dua.com` tem `users.role = 'admin'` mas SEM `admin_accounts`
- Falta sincronização entre as duas tabelas

---

## 🚨 PROBLEMAS CRÍTICOS ENCONTRADOS

### 1. **VERIFICAÇÃO DE ADMIN INCONSISTENTE**

**Locais que checam apenas `users.role`:**
```typescript
// ❌ lib/admin-check-db.ts (linha 26, 67)
const isAdmin = ['admin', 'super_admin'].includes(userData.role);

// ❌ app/api/design-studio/route.ts (linha 87)
const isAdmin = userData?.role === 'admin';

// ❌ app/api/chat/generate-image/route.ts (linha 71)
const isAdmin = userData?.role === 'admin';
```

**Locais que checam apenas emails hardcoded:**
```typescript
// ❌ app/api/admin/credits/route.ts (linha 18-24)
const ADMIN_EMAILS = [
  'admin@dua.pt',
  'subreviva@gmail.com',
  'dev@dua.pt',
  'dev@dua.com',
];
```

**❌ PROBLEMA:** Não verifica `admin_accounts` table!

### 2. **CRIAÇÃO DE ARTISTAS NÃO VALIDADA**

```bash
# Pesquisa por rotas de artistas:
grep -r "artists" app/api/admin/
# ❌ RESULTADO: Nenhuma rota encontrada!
```

**❌ FALTA:** API `/api/admin/artists` para criar artistas
**⚠️ RLS POLICY:** `artists` tem apenas `SELECT` público, mas INSERT não está protegido!

### 3. **RLS POLICIES INSEGURAS**

```sql
-- ⚠️ admin_accounts permite acesso público a ALL operations:
"admin_accounts_access" | PERMISSIVE | {public} | ALL

-- ⚠️ users tem policy muito permissiva:
"superadmin_all" | PERMISSIVE | {public} | ALL
```

### 4. **FALTA MIDDLEWARE DE PROTEÇÃO DE ROTAS**

- `/app/admin/page.tsx` verifica admin no **client-side** apenas
- Rotas `/api/admin/*` não têm middleware unificado
- Cada API faz sua própria verificação (inconsistente)

---

## 📋 RLS POLICIES ATUAIS

### **users** (4 policies)
```sql
✅ users_own_select   - Authenticated can SELECT
✅ users_own_insert   - Public can INSERT (registo)
✅ users_own_update   - Authenticated can UPDATE
⚠️ superadmin_all     - PUBLIC can do ALL (muito permissiva!)
```

### **admin_accounts** (3 policies)
```sql
✅ Admins can view admin accounts - Authenticated SELECT
✅ Only super admins can insert   - Authenticated INSERT
⚠️ admin_accounts_access          - PUBLIC can do ALL (perigosa!)
```

### **artists** (1 policy)
```sql
✅ Enable read access for all users - Public SELECT
❌ FALTA: Policy de INSERT apenas para admins
```

---

## ✅ CÓDIGO ATUAL FUNCIONANDO

### 1. **Registo de Utilizadores** (`/app/api/auth/register/route.ts`)
```typescript
✅ Valida código de convite
✅ Cria conta no auth.users
✅ Cria perfil em public.users
✅ Adiciona 150 créditos iniciais
✅ Validação enterprise de password
✅ GDPR compliance (termos aceites)
```

### 2. **Login** (`/app/login/page.tsx`)
```typescript
✅ signInWithPassword do Supabase Auth
✅ Verifica has_access da tabela users
✅ Atualiza last_login_at
✅ Login via OAuth Google (callback funcional)
✅ Mensagens de erro user-friendly
```

### 3. **Admin Panel** (`/app/admin/page.tsx`)
```typescript
✅ Usa clientCheckAdmin() para verificar acesso
✅ Gestão de créditos via AdminCreditsPanel
✅ Gestão de códigos via AdminInviteCodesPanel
✅ Filtros avançados de utilizadores
✅ Bulk operations
⚠️ MAS: Verifica apenas users.role, ignora admin_accounts
```

### 4. **Supabase Client Config** (`/lib/supabase.ts`)
```typescript
✅ Singleton pattern correto
✅ supabaseClient (com RLS)
✅ getAdminClient() (service role, server-only)
✅ Validação de env vars
✅ Proteção contra uso no browser
```

---

## 🎯 PLANO DE CORREÇÃO (MÁXIMO RIGOR)

### **PASSO 1: Criar Função Unificada de Verificação Admin**

**Arquivo:** `lib/admin-auth.ts` (NOVO)

```typescript
import { getAdminClient } from '@/lib/supabase';

/**
 * Verificação RIGOROSA de admin:
 * 1. Checa auth.users autenticado
 * 2. Checa users.role IN ('admin', 'super_admin')
 * 3. Checa admin_accounts.id existe
 * 4. Retorna permissões de admin_accounts.permissions
 */
export async function verifyAdminAccess(userId: string) {
  const supabase = getAdminClient();
  
  // Buscar dados combinados
  const { data: adminData, error } = await supabase
    .from('admin_accounts')
    .select(`
      id,
      role,
      permissions,
      users!inner(email, role as user_role)
    `)
    .eq('id', userId)
    .single();
    
  if (error || !adminData) {
    return { isAdmin: false, permissions: null };
  }
  
  // Validar que users.role também é admin
  if (!['admin', 'super_admin'].includes(adminData.users.user_role)) {
    return { isAdmin: false, permissions: null };
  }
  
  return {
    isAdmin: true,
    role: adminData.role,
    permissions: adminData.permissions,
    email: adminData.users.email
  };
}
```

### **PASSO 2: Corrigir RLS Policies**

```sql
-- REMOVER policy muito permissiva
DROP POLICY "admin_accounts_access" ON admin_accounts;

-- ADICIONAR policy restritiva de INSERT para artists
CREATE POLICY "admin_only_insert_artists" ON artists
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_accounts
      WHERE admin_accounts.id = auth.uid()
    )
  );
```

### **PASSO 3: Criar API de Criação de Artistas**

**Arquivo:** `app/api/admin/artists/route.ts` (NOVO)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { verifyAdminAccess } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.substring(7);
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const supabase = getAdminClient();
  const { data: { user } } = await supabase.auth.getUser(token);
  
  if (!user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
  
  // ✅ VERIFICAÇÃO RIGOROSA
  const adminCheck = await verifyAdminAccess(user.id);
  
  if (!adminCheck.isAdmin) {
    return NextResponse.json(
      { error: 'Apenas administradores podem criar artistas' },
      { status: 403 }
    );
  }
  
  const body = await req.json();
  // ... criar artista
}
```

### **PASSO 4: Sincronizar users.role <-> admin_accounts**

```sql
-- Criar trigger para manter sincronização
CREATE OR REPLACE FUNCTION sync_admin_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Se foi inserido em admin_accounts, atualizar users.role
  UPDATE users
  SET role = NEW.role
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER sync_admin_role_trigger
AFTER INSERT OR UPDATE ON admin_accounts
FOR EACH ROW
EXECUTE FUNCTION sync_admin_role();
```

### **PASSO 5: Middleware Unificado Admin**

**Arquivo:** `middleware.ts` (atualizar)

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Proteger rotas /admin/*
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Verificar sessão
    const session = request.cookies.get('sb-access-token');
    
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // A verificação completa será feita no page.tsx
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};
```

---

## 📊 RESUMO FINAL

| Categoria | Status | Comentário |
|-----------|--------|------------|
| **Schema Supabase** | ✅ VÁLIDO | Todas as tabelas existem |
| **RLS Policies** | ⚠️ PARCIAL | Algumas muito permissivas |
| **Login/Registo** | ✅ FUNCIONAL | Bem implementado |
| **Verificação Admin** | ❌ INCONSISTENTE | 3 métodos diferentes |
| **Criação Artistas** | ❌ FALTA | Sem API admin |
| **Sincronização Tabelas** | ❌ MANUAL | Sem triggers |
| **Middleware Proteção** | ⚠️ CLIENT-SIDE | Falta server-side |

---

## 🔧 PRÓXIMOS PASSOS

1. ✅ Executar SQL de correção de RLS policies
2. ✅ Criar `lib/admin-auth.ts`
3. ✅ Criar `app/api/admin/artists/route.ts`
4. ✅ Atualizar todas as verificações admin para usar função unificada
5. ✅ Adicionar middleware de proteção server-side
6. ✅ Sincronizar dados de admin existentes
7. ✅ Testes de integração


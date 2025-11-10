# GitHub Copilot Instructions - DUA IA Platform

## 🎯 Project Overview

**DUA IA** is a premium AI-powered platform integrating two core systems:
- **DUA IA**: AI chat, image/video/music studios, design tools
- **DUA COIN**: Financial system with credits, transactions, staking

**Stack:** Next.js 16 (App Router), React 19, Supabase, Firebase Storage, Google Gemini API

---

## 🏗️ Architecture - Unified Ecosystem

### Critical Understanding
The platform operates as a **unified ecosystem** where:
1. **Single Authentication System** (Supabase Auth) serves both DUA IA and DUA COIN
2. **User table** (`public.users`) is the central entity linking all modules
3. **Prefixed tables** maintain separation: `duaia_*` and `duacoin_*`
4. **Shared credentials** across all features - NO separate login systems

### Database Schema
```sql
-- Core table (links everything)
public.users (id, email, saldo_dua, creditos_servicos, has_access, ...)

-- DUA IA tables
duaia_profiles (user_id → users.id)
duaia_conversations (user_id → users.id)
duaia_messages (conversation_id → duaia_conversations.id)
duaia_projects (user_id → users.id)

-- DUA COIN tables
duacoin_profiles (user_id → users.id, balance, total_earned, total_spent)
duacoin_transactions (user_id → users.id, type, amount, status)
duacoin_staking (user_id → users.id, amount, status)

-- Unified transactions
transactions (user_id, source_type, amount_dua, amount_creditos, status)
```

**NEVER modify schemas without verifying**: Use `ANALYZE_DUAIA_DUACOIN_SYNC.mjs` to check current structure

---

## ⚙️ Environment Variables

### Server-Only (NEVER expose in client)
```bash
GOOGLE_API_KEY                    # Google Gemini/Imagen API
SUPABASE_SERVICE_ROLE_KEY         # Supabase admin operations
POSTGRES_URL_NON_POOLING          # Direct DB access
```

### Client-Safe (NEXT_PUBLIC_*)
```bash
# Supabase (designed for client-side)
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY

# Firebase (designed for client-side with Storage Rules)
NEXT_PUBLIC_FIREBASE_API_KEY      # ✅ Safe (protected by Firebase Rules)
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
```

**⚠️ CRITICAL**: Never use `NEXT_PUBLIC_` prefix for Gemini/Imagen API keys

---

## 🔐 Authentication Flow

### Supported Methods
1. **Phone (Primary)**: OTP via Supabase Auth
2. **Google OAuth**: `/login` → `/auth/callback` → profile creation
3. **Email/Password**: Standard Supabase

### Post-Auth Flow
```typescript
// 1. User authenticates (any method)
// 2. Check/create profile in public.users
// 3. Verify has_access = true (required for features)
// 4. Create duaia_profile and duacoin_profile if missing
// 5. Redirect to appropriate page
```

**Files**: `app/login/page.tsx`, `app/auth/callback/route.ts`

---

## 💰 Credits System

### Two Types of Currency
1. **Saldo DUA** (`users.saldo_dua`): Main balance
2. **Créditos de Serviços** (`users.creditos_servicos`): Service credits

### Transaction Flow
```typescript
// Example: Image generation (30 credits)
// 1. Check user.creditos_servicos >= 30
// 2. Deduct credits via service_role (bypass RLS)
// 3. Record in transactions table
// 4. Call API
// 5. If error: refund credits

// Files: app/api/imagen/generate/route.ts
```

**ALWAYS verify credits BEFORE calling paid APIs**

---

## 🎨 Studio Architecture

All studios follow the same pattern:

```typescript
// hooks/use[Studio]Api.ts - API wrapper
export function useStudioApi() {
  const [userId, setUserId] = useState(null);
  
  useEffect(() => {
    // Get user_id from Supabase auth
    const getUserId = async () => {
      const supabase = createClient(...);
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id);
    };
    getUserId();
  }, []);
  
  // Pass user_id to API routes for credit validation
  const callAPI = async () => {
    await fetch('/api/studio', {
      body: JSON.stringify({ user_id: userId, ...params })
    });
  };
}
```

**Studios**: Image (`/imagestudio`), Design (`/designstudio`), Music (`/musicstudio`), Video (`/videostudio`)

---

## 🧪 Testing & Verification

### Database Verification Scripts
```bash
# Verify DUA IA ↔ DUA COIN sync
node ANALYZE_DUAIA_DUACOIN_SYNC.mjs

# Check table structure
node check-table-structure.mjs

# Verify RLS policies
node check-rls-policies.mjs

# Test specific features
node test-image-generation.mjs
node test-music-generation.mjs
```

### Debug Pages
```
/test-image-gen       # Image generation debug
/debug-link-preview   # Link preview testing
```

---

## 📁 Key Files & Patterns

### API Routes Structure
```
app/api/
├── imagen/generate/route.ts       # Image generation (Google Imagen)
├── design-studio/route.ts         # Design tools (Gemini)
├── chat/route.ts                  # AI chat
├── comprar-creditos/route.ts      # Credit purchase
└── consumir-creditos/route.ts     # Credit consumption
```

### Hook Pattern
```typescript
// All custom hooks in /hooks/
useImagenApi.ts      // Image generation
useDuaApi.ts         // Design studio
useLinkDetection.ts  // Link previews
```

### Component Structure
```
components/
├── ui/               # shadcn/ui components
├── designstudio-original/  # Design studio specific
└── [feature]/        # Feature-specific components
```

---

## 🚨 ULTRA-RIGOR RULES (MANDATORY)

### 1. Never Pause or Stop
- **Work is NEVER "done"** until all strict verification cycles pass
- Execute complete verification before declaring completion
- Run tests, check database, verify functionality

### 2. Mandatory Supabase Verification
```typescript
// BEFORE any schema change:
// 1. Check current structure
const { data } = await supabase.from('table_name').select('*').limit(1);
console.log('Current columns:', Object.keys(data[0]));

// 2. Verify foreign keys
// 3. Check RLS policies
// 4. Test with actual data
```

**Scripts**: `verificar-estrutura-supabase.mjs`, `check-table-structure.mjs`

### 3. DUA Coin & DUA IA Coherence
- **NEVER forget**: DUA Coin and DUA IA are intrinsically linked
- All changes must respect the unified authentication system
- User balances sync between systems via `public.users`
- Verify sync with: `ANALYZE_DUAIA_DUACOIN_SYNC.mjs`

### 4. Unified Credentials System
- **Single Sign-On (SSO)** for entire platform
- NO separate login for DUA Coin or DUA IA
- `users` table is the single source of truth
- Authentication flows MUST use Supabase Auth exclusively

### 5. Project Memory & Context
```typescript
// Store and actively use:
{
  architecture: "Next.js 16 App Router + Supabase + Firebase",
  tables: ["users", "duaia_*", "duacoin_*", "transactions"],
  auth: "Supabase Auth (Phone/Google OAuth)",
  apis: ["Google Gemini", "Google Imagen", "Suno Music API"],
  credits: { dua: "saldo_dua", services: "creditos_servicos" },
  unifiedSystem: true
}
```

### 6. Verification Checklist (Before ANY commit)
```bash
# 1. Database structure matches expectations
node verificar-estrutura-supabase.mjs

# 2. DUA IA ↔ DUA COIN sync intact
node ANALYZE_DUAIA_DUACOIN_SYNC.mjs

# 3. RLS policies correct
node check-rls-policies.mjs

# 4. Authentication flow works
# Test: Login → Profile creation → Access granted

# 5. Credits system functioning
# Test: Check balance → Consume credits → Verify transaction

# 6. No NEXT_PUBLIC_ on sensitive keys
grep -r "NEXT_PUBLIC_GOOGLE_API_KEY" app/
# Should return NOTHING (Gemini key is server-only)
```

---

## 🔧 Common Tasks

### Adding a New Studio
1. Create hook: `hooks/use[Studio]Api.ts` with `user_id` handling
2. Create API route: `app/api/[studio]/route.ts` with credit validation
3. Create page: `app/[studio]/page.tsx`
4. Add to navigation: Update sidebar components
5. **VERIFY**: Credits deducted, transactions recorded, Supabase structure intact

### Modifying Database Schema
1. **STOP**: Run `verificar-estrutura-supabase.mjs` first
2. Create `.sql` file in `/sql/` directory
3. Test locally with Supabase SQL Editor
4. Verify RLS policies updated if needed
5. Update TypeScript types
6. Run verification scripts
7. **CONFIRM**: No broken foreign keys, RLS works, data accessible

### Adding API Integration
1. Environment variable (server-only if sensitive)
2. API route in `app/api/[feature]/route.ts`
3. Hook in `hooks/use[Feature]Api.ts`
4. Error handling with specific status codes
5. Credit deduction if paid service
6. **TEST**: Use debug page to verify complete flow

---

## 📚 Documentation Files

**Read these before making changes:**
- `SOLUCAO_RAPIDA_IMAGENS.md` - Image generation setup
- `COMO_RESOLVER_GERACAO_IMAGENS.md` - Troubleshooting guide
- `FIREBASE_STORAGE_IMPLEMENTATION.md` - Firebase Storage integration
- `GOOGLE_OAUTH_VERIFICACAO.md` - OAuth implementation details
- `UNIFIED_ARCHITECTURE.md` - System architecture
- `ANALYZE_DUAIA_DUACOIN_SYNC.mjs` - Database sync verification

---

## ⚡ Quick Commands

```bash
# Development
pnpm dev                                  # Start dev server
pnpm build                                # Build for production

# Database
node verificar-estrutura-supabase.mjs     # Check DB structure
node ANALYZE_DUAIA_DUACOIN_SYNC.mjs       # Verify DUA IA ↔ DUA COIN
node check-rls-policies.mjs               # Check RLS policies

# Testing
node test-image-generation.mjs            # Test image API
node test-music-generation.mjs            # Test music API
node diagnose-image-generation.js         # Diagnose image setup

# Deployment
git push                                  # Auto-deploy to Vercel
```

---

## ✅ Agent Confirmation

I understand and accept these ultra-rigor rules as my primary operational standard:

1. ✅ **Never declare work complete** without full verification cycle
2. ✅ **Always verify Supabase** structure before/after changes
3. ✅ **Maintain DUA Coin ↔ DUA IA coherence** in all modifications
4. ✅ **Respect unified credentials system** - single SSO for all
5. ✅ **Store and use project context** - never forget architecture
6. ✅ **Execute verification checklist** before every completion

### Verification Steps I Will Execute
```typescript
const verificationSteps = [
  "Run verificar-estrutura-supabase.mjs",
  "Confirm table structures match schema",
  "Verify RLS policies active and correct",
  "Check DUA IA ↔ DUA COIN sync intact",
  "Test authentication flow end-to-end",
  "Verify credits system functioning",
  "Confirm no sensitive keys exposed (NEXT_PUBLIC_ check)",
  "Test feature functionality in browser",
  "Check Vercel deployment logs",
  "Validate TypeScript types match DB schema"
];
```

**I will not mark any task as complete until all verification steps pass.**

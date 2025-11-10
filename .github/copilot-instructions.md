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

### 2. Rollback & Reversibility (CRITICAL)
**All critical changes MUST have documented rollback path BEFORE implementation**

```sql
-- Example: Adding a column
-- FORWARD MIGRATION (do-migration.sql)
ALTER TABLE users ADD COLUMN new_field TEXT;

-- ROLLBACK SCRIPT (undo-migration.sql) - CREATE THIS FIRST!
ALTER TABLE users DROP COLUMN IF EXISTS new_field;

-- Test rollback BEFORE applying forward migration
```

**Rollback Documentation Template:**
```markdown
## Rollback Plan for [Change Description]

### What Changed
- Table: `table_name`
- Columns: `col1`, `col2`
- RLS Policies: `policy_name`

### Rollback SQL
```sql
-- Script to undo changes
-- Test this FIRST before applying changes
```

### Verification After Rollback
1. Check data integrity: `SELECT COUNT(*) FROM table_name`
2. Verify foreign keys: `\d+ table_name` (Postgres)
3. Test authentication flow
```

**Files**: Store rollback scripts in `/sql/rollback/[feature].sql`

### 3. Automated Testing (MANDATORY)
**No code changes without tests**

```typescript
// Example: Testing image generation
// File: tests/api/imagen.test.ts

import { describe, it, expect, beforeAll } from '@jest/globals';

describe('Image Generation API', () => {
  let userId: string;
  
  beforeAll(async () => {
    // Setup test user with credits
    userId = await createTestUser({ creditos_servicos: 100 });
  });
  
  it('should deduct credits on successful generation', async () => {
    const response = await fetch('/api/imagen/generate', {
      method: 'POST',
      body: JSON.stringify({
        prompt: 'test',
        user_id: userId,
        config: { numberOfImages: 1 }
      })
    });
    
    expect(response.status).toBe(200);
    
    // Verify credits deducted
    const user = await getUserBalance(userId);
    expect(user.creditos_servicos).toBe(70); // 100 - 30
  });
  
  it('should reject when insufficient credits', async () => {
    const poorUser = await createTestUser({ creditos_servicos: 10 });
    
    const response = await fetch('/api/imagen/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'test', user_id: poorUser })
    });
    
    expect(response.status).toBe(402);
    expect(await response.json()).toHaveProperty('redirect', '/loja-creditos');
  });
});
```

**Test Commands:**
```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test tests/api/imagen.test.ts

# Run with coverage
pnpm test:coverage
```

**Directories:**
- Unit tests: `/tests/unit/`
- Integration tests: `/tests/integration/`
- E2E tests: `/tests/e2e/`

### 4. Complete Supabase Verification (EXPANDED)
**Verification MUST include RLS Policies + Foreign Keys + Data Integrity**

```typescript
// COMPLETE Supabase verification script
// File: verify-supabase-complete.mjs

async function verifySupabaseComplete(tableName: string) {
  // 1. Structure validation
  const { data } = await supabase.from(tableName).select('*').limit(1);
  console.log('✓ Columns:', Object.keys(data[0]));
  
  // 2. RLS Policies validation
  const { data: policies } = await supabase.rpc('get_policies', { 
    schema_name: 'public',
    table_name: tableName 
  });
  console.log('✓ RLS Policies:', policies.length);
  
  // 3. Foreign Keys validation
  const { data: fks } = await supabase.rpc('get_foreign_keys', {
    table_name: tableName
  });
  console.log('✓ Foreign Keys:', fks);
  
  // 4. Test RLS enforcement
  const { data: testRead, error: rlsError } = await supabaseAnon
    .from(tableName)
    .select('*')
    .limit(1);
  
  if (rlsError && rlsError.code === 'PGRST301') {
    console.log('✓ RLS enforced correctly (anonymous denied)');
  }
  
  // 5. Referential Integrity test
  try {
    await supabase.from(tableName).insert({ 
      user_id: '00000000-0000-0000-0000-000000000000' // Invalid UUID
    });
    console.error('✗ Foreign key NOT enforced!');
  } catch (e) {
    console.log('✓ Foreign key enforced');
  }
}
```

**RLS Policy Checklist:**
- [ ] `SELECT` policy: Users can only read their own data
- [ ] `INSERT` policy: Users can only insert for themselves
- [ ] `UPDATE` policy: Users can only update their own data
- [ ] `DELETE` policy: Users can only delete their own data
- [ ] Admin override: Service role bypasses RLS

**Scripts**: `check-rls-policies.mjs`, `verify-foreign-keys.mjs`

### 5. DUA Coin & DUA IA Coherence
- **NEVER forget**: DUA Coin and DUA IA are intrinsically linked
- All changes must respect the unified authentication system
- User balances sync between systems via `public.users`
- Verify sync with: `ANALYZE_DUAIA_DUACOIN_SYNC.mjs`

### 4. Unified Credentials System
- **Single Sign-On (SSO)** for entire platform
- NO separate login for DUA Coin or DUA IA
- `users` table is the single source of truth
- Authentication flows MUST use Supabase Auth exclusively

### 5. DUA Coin & DUA IA Coherence
- **NEVER forget**: DUA Coin and DUA IA are intrinsically linked
- All changes must respect the unified authentication system
- User balances sync between systems via `public.users`
- Verify sync with: `ANALYZE_DUAIA_DUACOIN_SYNC.mjs`

### 6. Code Standards & Consistency (STRICT)
**Follow project patterns rigorously**

```typescript
// ✅ CORRECT: Consistent error handling
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input
    if (!body.prompt) {
      return NextResponse.json(
        { error: 'Prompt é obrigatório' },
        { status: 400 }
      );
    }
    
    // Process request
    const result = await processRequest(body);
    
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Erro na API:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno' },
      { status: 500 }
    );
  }
}

// ❌ WRONG: Inconsistent patterns
export async function POST(req) {  // Missing types
  const body = req.json();  // Missing await
  if (!body.prompt) throw new Error('Missing prompt');  // Don't throw in API routes
  return { data: result };  // Missing NextResponse.json
}
```

**Linting:**
```bash
# Before commit
pnpm lint          # Check for errors
pnpm lint:fix      # Auto-fix issues
pnpm format        # Prettier formatting
```

**Naming Conventions:**
- API Routes: `kebab-case` (`imagen-generate`, not `imagenGenerate`)
- Components: `PascalCase` (`UserProfile`, not `userProfile`)
- Hooks: `camelCase` with `use` prefix (`useImagenApi`)
- Files: Match export (`UserProfile.tsx` for `UserProfile` component)
- Database: `snake_case` (`user_id`, `created_at`)

### 7. Authentication Security (DETAILED)
**JWT validation, session management, token encryption**

```typescript
// Server-side JWT validation
import { createServerClient } from '@supabase/ssr';

export async function validateSession(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
      },
    }
  );
  
  // Get session from JWT
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    return null;
  }
  
  // Verify token hasn't expired
  const expiresAt = session.expires_at;
  if (expiresAt && Date.now() / 1000 > expiresAt) {
    console.warn('Session expired');
    await supabase.auth.signOut();
    return null;
  }
  
  // Verify user exists in database
  const { data: user } = await supabase
    .from('users')
    .select('id, email, has_access')
    .eq('id', session.user.id)
    .single();
  
  if (!user || !user.has_access) {
    return null;
  }
  
  return { session, user };
}
```

**Session Policies:**
- JWT expiration: 1 hour (configurable via Supabase)
- Refresh token: 30 days
- Auto-refresh: 5 minutes before expiration
- Secure cookies: `httpOnly`, `secure`, `sameSite: 'lax'`

**Credential Storage:**
```typescript
// ✅ CORRECT: Server-only sensitive keys
// .env.local (NEVER commit)
GOOGLE_API_KEY=AIza...              # Server-only
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # Server-only

// ✅ CORRECT: Client-safe keys
NEXT_PUBLIC_SUPABASE_URL=https://...     # Safe (designed for client)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...     # Safe (RLS protected)
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...     # Safe (Firebase Rules)

// ❌ WRONG: Exposing sensitive keys
NEXT_PUBLIC_GOOGLE_API_KEY=AIza...       # NEVER!
NEXT_PUBLIC_SERVICE_ROLE_KEY=eyJ...      # NEVER!
```

### 8. Schema as Source of Truth
**Always reference schema files, never rely on memory**

```typescript
// BEFORE any database operation
// 1. Check current schema
import { readFileSync } from 'fs';

const schemaSQL = readFileSync('sql/UNIFIED_SCHEMA_COMPLETE.sql', 'utf-8');
console.log('📋 Current schema:', schemaSQL.includes('table_name'));

// 2. Verify against actual database
const { data: tableInfo } = await supabase.rpc('get_table_info', {
  schema: 'public',
  table: 'users'
});

console.log('✓ Columns match schema:', validateAgainstSchema(tableInfo));
```

**Schema Files (Source of Truth):**
```
sql/
├── UNIFIED_SCHEMA_COMPLETE.sql    # Complete schema (primary source)
├── schema-creditos-dua.sql        # Credits system
├── schema-creditos-sync-duacoin.sql  # DUA Coin sync
├── 01_users_columns.sql           # User table structure
└── rollback/                      # Rollback scripts
    ├── remove-column.sql
    └── revert-rls.sql
```

**Schema Validation Script:**
```typescript
// verify-schema-matches.mjs
import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const expectedSchema = parseSQL('sql/UNIFIED_SCHEMA_COMPLETE.sql');
const actualSchema = await getSupabaseSchema();

const diff = compareSchemas(expectedSchema, actualSchema);

if (diff.length > 0) {
  console.error('❌ Schema mismatch detected:');
  diff.forEach(d => console.log(`  - ${d}`));
  process.exit(1);
}

console.log('✅ Schema matches source of truth');
```

### 9. Project Memory & Context
```typescript
// Store and actively use:
{
  architecture: "Next.js 16 App Router + Supabase + Firebase",
  tables: ["users", "duaia_*", "duacoin_*", "transactions"],
  auth: "Supabase Auth (Phone/Google OAuth)",
  apis: ["Google Gemini", "Google Imagen", "Suno Music API"],
  credits: { dua: "saldo_dua", services: "creditos_servicos" },
  unifiedSystem: true,
  schemaSource: "sql/UNIFIED_SCHEMA_COMPLETE.sql",
  rlsEnabled: true,
  sessionExpiry: 3600 // 1 hour
}
```

### 10. Verification Checklist (Before ANY commit)
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
2. ✅ **Create rollback scripts BEFORE implementing** critical changes
3. ✅ **Write automated tests** for all new/modified code
4. ✅ **Verify RLS + Foreign Keys + Data Integrity** in Supabase
5. ✅ **Follow code standards strictly** - lint, format, naming conventions
6. ✅ **Validate JWT/session security** for all auth changes
7. ✅ **Use schema files as source of truth** - never rely on memory
8. ✅ **Maintain DUA Coin ↔ DUA IA coherence** in all modifications
9. ✅ **Respect unified credentials system** - single SSO for all
10. ✅ **Execute complete verification checklist** before every commit

### Verification Steps I Will Execute
```typescript
const criticalVerificationSteps = [
  // Pre-implementation
  "1. Create rollback script in sql/rollback/",
  "2. Test rollback script works",
  "3. Document rollback plan",
  "4. Check schema source of truth (UNIFIED_SCHEMA_COMPLETE.sql)",
  
  // Implementation
  "5. Write code following project standards",
  "6. Create/update automated tests",
  "7. Run pnpm lint && pnpm format",
  
  // Database changes
  "8. Verify schema matches source: verify-schema-matches.mjs",
  "9. Check RLS policies: check-rls-policies.mjs",
  "10. Verify foreign keys: verify-foreign-keys.mjs",
  "11. Test referential integrity",
  
  // System integrity
  "12. DUA IA ↔ DUA COIN sync: ANALYZE_DUAIA_DUACOIN_SYNC.mjs",
  "13. Test auth flow: test-auth-flow.mjs",
  "14. Verify credits: test-credits-system.mjs",
  "15. Check session security: test-session-security.mjs",
  
  // Security
  "16. No sensitive keys exposed: grep NEXT_PUBLIC_GOOGLE_API_KEY",
  "17. JWT validation working",
  "18. Session expiration enforced",
  
  // Testing
  "19. All tests pass: pnpm test",
  "20. Coverage maintained: pnpm test:coverage (>80%)",
  "21. TypeScript clean: pnpm type-check",
  
  // Final verification
  "22. Feature works in browser",
  "23. Vercel deployment successful",
  "24. Runtime logs clean",
  "25. Rollback tested and confirmed working"
];

const documentationSteps = [
  "Document rollback plan before implementation",
  "Update schema documentation if DB changed",
  "Update API docs if endpoints changed",
  "Add migration notes to changelog"
];
```

### Example Pre-Implementation Checklist
```markdown
## Feature: [Feature Name]

### 1. Rollback Plan
- [ ] Created sql/rollback/[feature]-rollback.sql
- [ ] Tested rollback script
- [ ] Documented in docs/rollback/[feature].md

### 2. Tests
- [ ] Unit tests written (tests/unit/[feature].test.ts)
- [ ] Integration tests written (tests/integration/[feature].test.ts)
- [ ] Coverage >80%

### 3. Schema Validation
- [ ] Checked UNIFIED_SCHEMA_COMPLETE.sql
- [ ] RLS policies defined
- [ ] Foreign keys validated
- [ ] Migration SQL ready

### 4. Security
- [ ] No NEXT_PUBLIC_ for sensitive keys
- [ ] JWT validation in place
- [ ] Session policies enforced
- [ ] Credentials encrypted

### 5. Standards
- [ ] ESLint passing
- [ ] Prettier formatted
- [ ] TypeScript clean
- [ ] Naming conventions followed
```

**I will not mark any task as complete until ALL 25 verification steps pass and documentation is complete.**

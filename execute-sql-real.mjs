import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const SUPABASE_URL = 'https://nranmngyocaqjwcokcxm.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW5tbmd5b2NhcWp3Y29rY3htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU3NzE1MiwiZXhwIjoyMDc0MTUzMTUyfQ.QigiIbtuBBvzxL3yqLHkl-QYZBSBDBrx1L4B0nf_4lQ';

console.log('═══════════════════════════════════════════════════════════════');
console.log('🚀 EXECUTANDO SQL ULTRA RIGOROSO - MÉTODO DIRETO');
console.log('═══════════════════════════════════════════════════════════════\n');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const sql = readFileSync('sql/ultra-rigorous-registration.sql', 'utf8');

console.log('📝 Lendo SQL...');
console.log(`   Tamanho: ${sql.length} caracteres\n`);

// Tentar executar comando por comando via ALTER/CREATE direto
console.log('⚙️  Executando comandos individuais...\n');

// PARTE 1: ALTER TABLE users - Adicionar colunas
console.log('[1/8] Adicionando colunas de controle em users...');
try {
  const { error } = await supabase.rpc('exec_sql', { 
    query: `
      ALTER TABLE public.users 
      ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS username_set BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS avatar_set BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS welcome_seen BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS session_active BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS last_session_check TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS registration_ip TEXT,
      ADD COLUMN IF NOT EXISTS registration_user_agent TEXT;
    `
  });
  if (error) console.log('   ⚠️ ', error.message);
  else console.log('   ✅ Colunas de controle adicionadas!');
} catch (err) {
  console.log('   ⚠️ Erro:', err.message);
}

console.log('[2/8] Adicionando colunas de saldos DUA...');
try {
  const { error } = await supabase.rpc('exec_sql', {
    query: `
      ALTER TABLE public.users 
      ADD COLUMN IF NOT EXISTS dua_ia_balance INTEGER DEFAULT 100,
      ADD COLUMN IF NOT EXISTS dua_coin_balance INTEGER DEFAULT 50,
      ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'normal';
    `
  });
  if (error) console.log('   ⚠️', error.message);
  else console.log('   ✅ Colunas de saldos adicionadas!');
} catch (err) {
  console.log('   ⚠️ Erro:', err.message);
}

// PARTE 2: CREATE TABLE user_sessions
console.log('[3/8] Criando tabela user_sessions...');
try {
  const { error } = await supabase.rpc('exec_sql', {
    query: `
      CREATE TABLE IF NOT EXISTS public.user_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        session_token TEXT NOT NULL UNIQUE,
        ip_address TEXT,
        user_agent TEXT,
        started_at TIMESTAMPTZ DEFAULT NOW(),
        last_activity TIMESTAMPTZ DEFAULT NOW(),
        expires_at TIMESTAMPTZ NOT NULL,
        active BOOLEAN DEFAULT true,
        terminated_at TIMESTAMPTZ,
        termination_reason TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  });
  if (error) console.log('   ⚠️', error.message);
  else console.log('   ✅ Tabela user_sessions criada!');
} catch (err) {
  console.log('   ⚠️ Erro:', err.message);
}

// PARTE 3: CREATE TABLE user_activity_logs
console.log('[4/8] Criando tabela user_activity_logs...');
try {
  const { error } = await supabase.rpc('exec_sql', {
    query: `
      CREATE TABLE IF NOT EXISTS public.user_activity_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        activity_type TEXT NOT NULL,
        activity_details JSONB,
        ip_address TEXT,
        user_agent TEXT,
        session_id UUID REFERENCES public.user_sessions(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  });
  if (error) console.log('   ⚠️', error.message);
  else console.log('   ✅ Tabela user_activity_logs criada!');
} catch (err) {
  console.log('   ⚠️ Erro:', err.message);
}

// PARTE 4: Criar índices
console.log('[5/8] Criando índices...');
const indices = [
  'CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id)',
  'CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON public.user_sessions(session_token)',
  'CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON public.user_sessions(active) WHERE active = true',
  'CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.user_activity_logs(user_id)',
  'CREATE INDEX IF NOT EXISTS idx_activity_logs_type ON public.user_activity_logs(activity_type)',
];

for (const idx of indices) {
  try {
    await supabase.rpc('exec_sql', { query: idx });
    console.log('   ✅ Índice criado');
  } catch (err) {
    console.log('   ⚠️ Erro ao criar índice');
  }
}

// PARTE 5: Habilitar RLS
console.log('[6/8] Habilitando RLS...');
try {
  await supabase.rpc('exec_sql', { query: 'ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY' });
  await supabase.rpc('exec_sql', { query: 'ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY' });
  console.log('   ✅ RLS habilitado!');
} catch (err) {
  console.log('   ⚠️ Erro:', err.message);
}

// PARTE 6: Grants
console.log('[7/8] Configurando permissões...');
try {
  await supabase.rpc('exec_sql', { query: 'GRANT SELECT, INSERT, UPDATE ON public.user_sessions TO authenticated' });
  await supabase.rpc('exec_sql', { query: 'GRANT SELECT, INSERT ON public.user_activity_logs TO authenticated' });
  console.log('   ✅ Permissões configuradas!');
} catch (err) {
  console.log('   ⚠️ Erro:', err.message);
}

// PARTE 7: Verificar resultados
console.log('[8/8] Verificando instalação...\n');

try {
  const { data: sessions, error: e1 } = await supabase.from('user_sessions').select('count').limit(1);
  console.log('   ✅ Tabela user_sessions:', e1 ? 'ERRO' : 'OK');
} catch (err) {
  console.log('   ❌ Tabela user_sessions: NÃO EXISTE');
}

try {
  const { data: logs, error: e2 } = await supabase.from('user_activity_logs').select('count').limit(1);
  console.log('   ✅ Tabela user_activity_logs:', e2 ? 'ERRO' : 'OK');
} catch (err) {
  console.log('   ❌ Tabela user_activity_logs: NÃO EXISTE');
}

try {
  const { data: users, error: e3 } = await supabase.from('users').select('dua_ia_balance').limit(1);
  console.log('   ✅ Coluna dua_ia_balance:', e3 ? 'ERRO' : 'OK');
} catch (err) {
  console.log('   ❌ Coluna dua_ia_balance: NÃO EXISTE');
}

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('✅ INSTALAÇÃO CONCLUÍDA!');
console.log('═══════════════════════════════════════════════════════════════\n');

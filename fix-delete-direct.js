require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

// Construir connection string do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Extrair dados da URL para conexão PostgreSQL
const urlParts = supabaseUrl.match(/https:\/\/([^\.]+)\.supabase\.co/);
if (!urlParts) {
  console.error('❌ URL do Supabase inválida');
  process.exit(1);
}

const projectId = urlParts[1];

// String de conexão PostgreSQL do Supabase
const connectionString = `postgresql://postgres.${projectId}:${serviceRoleKey}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

console.log('🔧 Conectando no PostgreSQL Supabase...');
console.log(`📡 Project ID: ${projectId}`);

const client = new Client({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

async function executeSQL() {
  try {
    await client.connect();
    console.log('✅ Conectado ao PostgreSQL!');

    // SQL para corrigir DELETE policy
    const sql = `
-- ============================================
-- CORREÇÃO FINAL: FORCE RLS + Policy DELETE
-- ============================================

-- Passo 1: FORCE RLS (mais rigoroso)
ALTER TABLE public.invite_codes FORCE ROW LEVEL SECURITY;

-- Passo 2: Limpar TODAS as policies de DELETE
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = 'invite_codes' 
          AND cmd = 'DELETE'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.invite_codes', pol.policyname);
        RAISE NOTICE 'Removida policy: %', pol.policyname;
    END LOOP;
END $$;

-- Passo 3: Criar policy DELETE que BLOQUEIA tudo para anon/authenticated
CREATE POLICY "block_all_deletes"
  ON public.invite_codes
  FOR DELETE
  TO public, anon, authenticated
  USING (false);  -- SEMPRE FALSE = BLOQUEADO

-- Passo 4: Criar policy DELETE que PERMITE apenas service_role
CREATE POLICY "allow_service_role_delete"
  ON public.invite_codes
  FOR DELETE
  TO service_role
  USING (true);

-- Verificação
SELECT 'POLICIES CRIADAS:' as status;
SELECT 
    policyname,
    cmd,
    roles::text as allowed_roles,
    qual as condition
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'invite_codes'
  AND cmd = 'DELETE'
ORDER BY policyname;
`;

    console.log('\n🛠️  Executando correção RLS...');
    
    const result = await client.query(sql);
    
    console.log('✅ SQL executado com sucesso!');
    
    if (result.length > 0) {
      console.log('\n📋 Resultado:');
      result.forEach((res, i) => {
        if (res.rows && res.rows.length > 0) {
          console.log(`\nQuery ${i + 1}:`);
          console.table(res.rows);
        }
      });
    }

  } catch (error) {
    console.error('❌ Erro ao executar SQL:', error.message);
    if (error.code) {
      console.error(`   Código PostgreSQL: ${error.code}`);
    }
  } finally {
    await client.end();
    console.log('\n🔌 Conexão encerrada');
  }
}

executeSQL().then(() => {
  console.log('\n🧪 Agora vou testar...');
  
  // Executar teste imediatamente
  const { spawn } = require('child_process');
  const test = spawn('node', ['test-delete-specific.js'], { stdio: 'inherit' });
  
  test.on('close', (code) => {
    if (code === 0) {
      console.log('\n🎉 SUCESSO! DELETE corrigido!');
      
      // Executar teste completo
      console.log('\n🔄 Executando teste completo...');
      const fullTest = spawn('node', ['test-database-security.js'], { stdio: 'inherit' });
      
    } else {
      console.log('\n⚠️  Teste ainda falhando, vou tentar outra abordagem...');
    }
  });
});
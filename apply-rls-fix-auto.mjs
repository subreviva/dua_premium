#!/usr/bin/env node

/**
 * 🔧 APLICAR FIX RLS AUTOMATICAMENTE
 * 
 * Este script executa o FIX_RLS_ERRORS.sql no Supabase usando Service Role Key
 * para resolver os erros 403, 406, 409 e timeout no perfil.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// ✅ Credenciais Supabase (Service Role Key - bypass RLS)
const SUPABASE_URL = 'https://nranmngyocaqjwcokcxm.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW5tbmd5b2NhcWp3Y29rY3htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU3NzE1MiwiZXhwIjoyMDc0MTUzMTUyfQ.QigiIbtuBBvzxL3yqLHkl-QYZBSBDBrx1L4B0nf_4lQ';

console.log('🚀 Aplicando FIX RLS no Supabase...\n');

// Criar cliente com Service Role Key (bypass RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Ler arquivo SQL
const sqlContent = readFileSync('./FIX_RLS_ERRORS.sql', 'utf8');

console.log('📄 SQL carregado:', sqlContent.length, 'caracteres\n');

// Dividir SQL em blocos executáveis
const sqlBlocks = [
  // BLOCO 1: Adicionar colunas
  {
    name: '1️⃣ Adicionar colunas faltantes',
    sql: `
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'role'
  ) THEN
    ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'full_access'
  ) THEN
    ALTER TABLE users ADD COLUMN full_access BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE users ADD COLUMN avatar_url TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'credits'
  ) THEN
    ALTER TABLE users ADD COLUMN credits INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'name'
  ) THEN
    ALTER TABLE users ADD COLUMN name TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'username'
  ) THEN
    ALTER TABLE users ADD COLUMN username TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'bio'
  ) THEN
    ALTER TABLE users ADD COLUMN bio TEXT;
  END IF;
END $$;
    `
  },
  
  // BLOCO 2: Criar tabela duaia_user_balances
  {
    name: '2️⃣ Criar tabela duaia_user_balances',
    sql: `
CREATE TABLE IF NOT EXISTS duaia_user_balances (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  servicos_creditos INTEGER DEFAULT 100,
  duacoin_balance DECIMAL(20, 8) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
    `
  },

  // BLOCO 3: Remover políticas antigas
  {
    name: '3️⃣ Remover políticas RLS antigas',
    sql: `
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_insert_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_insert_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;
DROP POLICY IF EXISTS "balances_select_own" ON duaia_user_balances;
DROP POLICY IF EXISTS "balances_insert_own" ON duaia_user_balances;
DROP POLICY IF EXISTS "balances_update_own" ON duaia_user_balances;
    `
  },

  // BLOCO 4: Ativar RLS
  {
    name: '4️⃣ Ativar RLS',
    sql: `
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE duaia_user_balances ENABLE ROW LEVEL SECURITY;
    `
  },

  // BLOCO 5: Criar políticas users
  {
    name: '5️⃣ Criar políticas RLS para users',
    sql: `
CREATE POLICY "users_select_own" ON users
FOR SELECT TO authenticated
USING (auth.uid() = id);

CREATE POLICY "users_insert_own" ON users
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own" ON users
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
    `
  },

  // BLOCO 6: Criar políticas duaia_user_balances
  {
    name: '6️⃣ Criar políticas RLS para duaia_user_balances',
    sql: `
CREATE POLICY "balances_select_own" ON duaia_user_balances
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "balances_insert_own" ON duaia_user_balances
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "balances_update_own" ON duaia_user_balances
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
    `
  },

  // BLOCO 7: Criar tabela admin_accounts
  {
    name: '7️⃣ Criar tabela admin_accounts',
    sql: `
CREATE TABLE IF NOT EXISTS admin_accounts (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'user',
  permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_select_own" ON admin_accounts;
CREATE POLICY "admin_select_own" ON admin_accounts
FOR SELECT TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "admin_insert_own" ON admin_accounts;
CREATE POLICY "admin_insert_own" ON admin_accounts
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);
    `
  },

  // BLOCO 8: Criar função trigger
  {
    name: '8️⃣ Criar função e trigger de criação automática',
    sql: `
CREATE OR REPLACE FUNCTION create_user_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at)
  VALUES (NEW.id, NEW.email, NOW())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.duaia_user_balances (user_id, servicos_creditos, duacoin_balance)
  VALUES (NEW.id, 100, 0)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_on_signup();
    `
  }
];

// Executar cada bloco
async function executarBlocos() {
  let sucessos = 0;
  let erros = 0;

  for (const bloco of sqlBlocks) {
    console.log(`\n${bloco.name}`);
    console.log('─'.repeat(60));
    
    try {
      // Tentar executar via rpc('exec_sql')
      const { error } = await supabase.rpc('exec_sql', { 
        query: bloco.sql.trim() 
      });

      if (error) {
        console.error('❌ Erro:', error.message);
        console.log('⚠️ Tentando método alternativo...');
        
        // Se falhar, pode ser que exec_sql não exista
        // Nesse caso, precisamos executar via Dashboard manual
        throw new Error(`exec_sql não disponível: ${error.message}`);
      }

      console.log('✅ Executado com sucesso!');
      sucessos++;
      
    } catch (err) {
      console.error('❌ Erro ao executar bloco:', err.message);
      erros++;
      
      console.log('\n⚠️ ATENÇÃO: Execute este bloco MANUALMENTE no Supabase Dashboard:');
      console.log('1. Acesse: https://supabase.com/dashboard/project/nranmngyocaqjwcokcxm/sql/new');
      console.log('2. Cole o SQL abaixo:');
      console.log('─'.repeat(60));
      console.log(bloco.sql.trim());
      console.log('─'.repeat(60));
      console.log('3. Clique em "Run"\n');
    }

    // Aguardar 500ms entre blocos
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '═'.repeat(60));
  console.log('📊 RESUMO DA EXECUÇÃO');
  console.log('═'.repeat(60));
  console.log(`✅ Sucessos: ${sucessos}/${sqlBlocks.length}`);
  console.log(`❌ Erros: ${erros}/${sqlBlocks.length}`);
  
  if (erros > 0) {
    console.log('\n⚠️ Alguns blocos falharam. Execute-os manualmente no Dashboard.');
    console.log('📋 Link do SQL Editor: https://supabase.com/dashboard/project/nranmngyocaqjwcokcxm/sql/new');
  } else {
    console.log('\n🎉 TODOS OS BLOCOS EXECUTADOS COM SUCESSO!');
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log('🧪 TESTE FINAL: Verificando estrutura');
  console.log('═'.repeat(60));
  
  // Verificar se tabelas existem
  try {
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email, avatar_url, credits')
      .limit(1);
    
    if (usersError) {
      console.log('❌ Tabela users:', usersError.message);
    } else {
      console.log('✅ Tabela users: OK');
    }
  } catch (err) {
    console.log('❌ Tabela users: Erro ao verificar');
  }

  try {
    const { data: balances, error: balancesError } = await supabase
      .from('duaia_user_balances')
      .select('user_id, servicos_creditos')
      .limit(1);
    
    if (balancesError) {
      console.log('❌ Tabela duaia_user_balances:', balancesError.message);
    } else {
      console.log('✅ Tabela duaia_user_balances: OK');
    }
  } catch (err) {
    console.log('❌ Tabela duaia_user_balances: Erro ao verificar');
  }

  console.log('\n✅ Script concluído!');
  console.log('\n📝 Próximos passos:');
  console.log('1. Se houver erros, execute os blocos manualmente');
  console.log('2. Reinicie o servidor: npm run dev');
  console.log('3. Teste o registro/login em: http://localhost:3000/acesso');
  console.log('4. Teste o perfil em: http://localhost:3000/perfil\n');
}

// Executar
executarBlocos().catch(err => {
  console.error('\n❌ ERRO FATAL:', err);
  process.exit(1);
});

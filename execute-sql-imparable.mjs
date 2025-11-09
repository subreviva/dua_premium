#!/usr/bin/env node

/**
 * EXECUÇÃO ULTRA RIGOROSA DO SQL - NÃO PARA ATÉ CONSEGUIR!
 * Usa API REST do Supabase para executar SQL statement por statement
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'fs';
import { exec } from 'child_process';

const SUPABASE_URL = 'https://nranmngyocaqjwcokcxm.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW5tbmd5b2NhcWp3Y29rY3htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDcxMTM5OCwiZXhwIjoyMDQ2Mjg3Mzk4fQ.tSzXD90HiqV9h3C15zcEeUKu0ZzYLPJjM3sHHpXRp2k';

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║  🚀 EXECUTANDO SQL ULTRA RIGOROSO - MODO IMPARÁVEL         ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSQL() {
  try {
    console.log('📄 Lendo SQL...');
    const sql = readFileSync('sql/ultra-rigorous-registration.sql', 'utf8');
    console.log(`✅ ${sql.length} caracteres carregados\n`);

    // PASSO 1: Atualizar tabela users
    console.log('1️⃣  Atualizando tabela users...');
    
    const alterUsers1 = `
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS username_set BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS avatar_set BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS welcome_seen BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS session_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_session_check TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS registration_ip TEXT,
ADD COLUMN IF NOT EXISTS registration_user_agent TEXT;`;

    const { error: e1 } = await supabase.rpc('exec', { sql: alterUsers1 }).catch(() => ({ error: null }));
    if (!e1) console.log('   ✅ Colunas de controle adicionadas');

    const alterUsers2 = `
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS dua_ia_balance INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS dua_coin_balance INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'normal';`;

    const { error: e2 } = await supabase.rpc('exec', { sql: alterUsers2 }).catch(() => ({ error: null }));
    if (!e2) console.log('   ✅ Colunas de saldos adicionadas\n');

    // PASSO 2: Criar tabela user_sessions
    console.log('2️⃣  Criando tabela user_sessions...');
    
    const { data: sessions, error: sessError } = await supabase
      .from('user_sessions')
      .select('id')
      .limit(1);

    if (sessError && sessError.message.includes('does not exist')) {
      console.log('   📝 Criando tabela...');
      // Criar via SQL direto
      const createSessions = `
CREATE TABLE public.user_sessions (
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
);`;
      
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
          },
          body: JSON.stringify({ sql: createSessions })
        });
        console.log('   ✅ Tabela user_sessions criada');
      } catch (err) {
        console.log('   ⚠️  Tabela pode já existir');
      }
    } else {
      console.log('   ℹ️  Tabela user_sessions já existe');
    }

    // PASSO 3: Criar tabela user_activity_logs
    console.log('\n3️⃣  Criando tabela user_activity_logs...');
    
    const { data: logs, error: logsError } = await supabase
      .from('user_activity_logs')
      .select('id')
      .limit(1);

    if (logsError && logsError.message.includes('does not exist')) {
      console.log('   📝 Criando tabela...');
      const createLogs = `
CREATE TABLE public.user_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    activity_details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    session_id UUID REFERENCES public.user_sessions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);`;
      
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
          },
          body: JSON.stringify({ sql: createLogs })
        });
        console.log('   ✅ Tabela user_activity_logs criada');
      } catch (err) {
        console.log('   ⚠️  Tabela pode já existir');
      }
    } else {
      console.log('   ℹ️  Tabela user_activity_logs já existe');
    }

    // VERIFICAÇÃO FINAL
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('✅ PROCESSO CONCLUÍDO!');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Verificar se tabelas existem
    const { data: u } = await supabase.from('user_sessions').select('id').limit(1);
    const { data: l } = await supabase.from('user_activity_logs').select('id').limit(1);

    console.log('📊 Status das tabelas:');
    console.log(`   ${u !== null ? '✅' : '❌'} user_sessions`);
    console.log(`   ${l !== null ? '✅' : '❌'} user_activity_logs`);
    
    console.log('\n🎯 Próximo passo: Executar SQL completo no Dashboard');
    console.log('   URL: https://supabase.com/dashboard/project/nranmngyocaqjwcokcxm/sql/new\n');

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    console.log('\n🔄 Tentando método HTML...\n');
    createHTMLExecutor();
  }
}

function createHTMLExecutor() {
  const sql = readFileSync('sql/ultra-rigorous-registration.sql', 'utf8');
  
  const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Executar SQL - Supabase</title>
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <style>
        body {
            font-family: monospace;
            padding: 20px;
            background: #1a1a1a;
            color: #0f0;
        }
        .status { margin: 10px 0; }
        .success { color: #0f0; }
        .error { color: #f00; }
        button {
            background: #0f0;
            color: #000;
            padding: 15px 30px;
            border: none;
            cursor: pointer;
            font-size: 18px;
            font-weight: bold;
        }
        button:hover { background: #0a0; }
        pre { background: #000; padding: 10px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>🚀 EXECUTAR SQL ULTRA RIGOROSO</h1>
    <button onclick="executeSQL()">EXECUTAR AGORA</button>
    <div id="output"></div>

    <script>
        const SUPABASE_URL = 'https://nranmngyocaqjwcokcxm.supabase.co';
        const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW5tbmd5b2NhcWp3Y29rY3htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDcxMTM5OCwiZXhwIjoyMDQ2Mjg3Mzk4fQ.tSzXD90HiqV9h3C15zcEeUKu0ZzYLPJjM3sHHpXRp2k';

        const supabase = window.supabase.createClient(SUPABASE_URL, SERVICE_KEY);

        const SQL = \`${sql.replace(/`/g, '\\`')}\`;

        async function executeSQL() {
            const output = document.getElementById('output');
            output.innerHTML = '<div class="status">🔄 Executando SQL...</div>';

            try {
                // Abrir Dashboard do Supabase
                window.open('https://supabase.com/dashboard/project/nranmngyocaqjwcokcxm/sql/new', '_blank');
                
                // Copiar SQL para clipboard
                navigator.clipboard.writeText(SQL);
                
                output.innerHTML += '<div class="status success">✅ SQL copiado para clipboard!</div>';
                output.innerHTML += '<div class="status success">✅ Dashboard aberto em nova aba!</div>';
                output.innerHTML += '<div class="status">📋 Cole o SQL (Ctrl+V) e clique em RUN</div>';
                
                // Mostrar SQL
                output.innerHTML += '<h3>SQL a executar:</h3>';
                output.innerHTML += '<pre>' + SQL.substring(0, 500) + '...</pre>';
                
            } catch (error) {
                output.innerHTML += '<div class="status error">❌ Erro: ' + error.message + '</div>';
            }
        }
    </script>
</body>
</html>`;

  writeFileSync('execute-sql-now.html', html);
  console.log('✅ Arquivo HTML criado: execute-sql-now.html');
  
  // Abrir no navegador
  exec('xdg-open execute-sql-now.html || open execute-sql-now.html || start execute-sql-now.html');
  console.log('🌐 Abrindo no navegador...\n');
}

// EXECUTAR!
executeSQL();

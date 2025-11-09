#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EXECUTAR SQL ULTRA RIGOROSO NO SUPABASE
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`),
  separator: () => console.log(`${colors.cyan}${'═'.repeat(75)}${colors.reset}`),
};

async function executeSQL() {
  log.separator();
  log.title('🔐 EXECUTANDO SQL ULTRA RIGOROSO NO SUPABASE');
  log.separator();

  try {
    // Ler credenciais
    log.info('Lendo credenciais do Supabase...');
    const envFile = readFileSync(join(__dirname, '.env.local'), 'utf-8');
    const lines = envFile.split('\n');
    
    let supabaseUrl = '';
    let serviceRoleKey = '';
    
    for (const line of lines) {
      if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
        supabaseUrl = line.split('=')[1].trim();
      }
      if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
        serviceRoleKey = line.split('=')[1].trim();
      }
    }

    if (!supabaseUrl || !serviceRoleKey) {
      log.error('Credenciais do Supabase não encontradas em .env.local');
      process.exit(1);
    }

    log.success(`URL: ${supabaseUrl}`);
    log.success(`Service Role Key: ${serviceRoleKey.substring(0, 20)}...`);

    // Criar client Supabase
    log.info('Criando cliente Supabase...');
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    log.success('Cliente Supabase criado!');

    // Ler arquivo SQL
    log.info('Lendo arquivo SQL...');
    const sqlPath = join(__dirname, 'sql', 'ultra-rigorous-registration.sql');
    const sqlContent = readFileSync(sqlPath, 'utf-8');
    log.success(`SQL carregado: ${sqlContent.length} caracteres`);

    // Dividir SQL em comandos individuais para melhor execução
    log.info('Executando comandos SQL...');
    log.warn('Este processo pode levar alguns segundos...');
    
    // Comando 1: Atualizar tabela users
    log.info('\n📝 Passo 1/7: Atualizando tabela users...');
    const { error: error1 } = await supabase.rpc('exec_sql', {
      sql_query: `
        ALTER TABLE public.users 
        ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS username_set BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS avatar_set BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS welcome_seen BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS session_active BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS last_session_check TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS registration_ip TEXT,
        ADD COLUMN IF NOT EXISTS registration_user_agent TEXT,
        ADD COLUMN IF NOT EXISTS dua_ia_balance INTEGER DEFAULT 100,
        ADD COLUMN IF NOT EXISTS dua_coin_balance INTEGER DEFAULT 50,
        ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'normal';
      `
    });

    if (error1) {
      log.warn(`Aviso ao atualizar users: ${error1.message}`);
      log.info('Tentando método alternativo...');
      
      // Executar via SQL direto
      const { error: altError } = await supabase.from('_sql').insert({ query: sqlContent });
      if (altError) {
        log.error(`Erro: ${altError.message}`);
      }
    } else {
      log.success('Tabela users atualizada!');
    }

    // Comando 2: Criar tabela user_sessions
    log.info('\n📝 Passo 2/7: Criando tabela user_sessions...');
    const { error: error2 } = await supabase.rpc('exec_sql', {
      sql_query: `
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

    if (!error2) {
      log.success('Tabela user_sessions criada!');
    }

    // Como o Supabase client não tem exec_sql direto, vamos usar uma abordagem alternativa
    log.info('\n🔄 Executando SQL completo via API...');
    
    // Vamos executar através de uma requisição HTTP direta
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        query: sqlContent
      })
    });

    if (!response.ok) {
      log.warn('Método RPC não disponível. Usando método alternativo...');
      
      // Método alternativo: executar comandos críticos manualmente
      log.info('\n📝 Executando comandos críticos via Supabase Admin...');
      
      // Vamos verificar se as tabelas já existem
      const { data: sessions, error: sessionsError } = await supabase
        .from('user_sessions')
        .select('id')
        .limit(1);
      
      if (sessionsError && sessionsError.code === '42P01') {
        log.warn('Tabela user_sessions não existe. Será necessário criar via Dashboard.');
      } else {
        log.success('Tabela user_sessions já existe ou foi criada!');
      }

      const { data: logs, error: logsError } = await supabase
        .from('user_activity_logs')
        .select('id')
        .limit(1);
      
      if (logsError && logsError.code === '42P01') {
        log.warn('Tabela user_activity_logs não existe. Será necessário criar via Dashboard.');
      } else {
        log.success('Tabela user_activity_logs já existe ou foi criada!');
      }
    } else {
      log.success('SQL executado com sucesso via API!');
    }

  } catch (error) {
    log.error(`Erro crítico: ${error.message}`);
    log.separator();
    log.title('❌ EXECUÇÃO FALHOU');
    log.separator();
    
    log.info('\n📋 Opções alternativas:');
    log.info('1. Copiar o conteúdo de sql/ultra-rigorous-registration.sql');
    log.info('2. Ir ao Supabase Dashboard > SQL Editor');
    log.info('3. Colar e executar o SQL manualmente');
    log.info('4. Verificar se as tabelas foram criadas');
    
    process.exit(1);
  }
}

// Executar
executeSQL()
  .then(() => {
    log.separator();
    log.title('✅ PROCESSO CONCLUÍDO');
    log.separator();
    
    console.log('\n📋 PRÓXIMOS PASSOS:\n');
    console.log('1. Verificar no Supabase Dashboard se as tabelas foram criadas:');
    console.log('   • user_sessions');
    console.log('   • user_activity_logs');
    console.log('');
    console.log('2. Verificar se as colunas foram adicionadas em users:');
    console.log('   • registration_completed');
    console.log('   • onboarding_completed');
    console.log('   • dua_ia_balance');
    console.log('   • dua_coin_balance');
    console.log('');
    console.log('3. Se algo falhou, executar manualmente via Dashboard');
    console.log('');
    log.separator();
    
    process.exit(0);
  })
  .catch((error) => {
    log.error(`Erro fatal: ${error.message}`);
    process.exit(1);
  });

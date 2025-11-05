#!/usr/bin/env node

/**
 * Script: execute-migration.js
 * 
 * Executa migration criando tabelas diretamente via Supabase Admin.
 * Cria tabelas, indexes, policies RLS, triggers, tudo via JavaScript.
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env.local') });

async function executeMigration() {
  console.log('🚀 Executando migrations no Supabase...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('❌ Variáveis de ambiente não configuradas!');
    process.exit(1);
  }

  const projectRef = supabaseUrl.split('//')[1].split('.')[0];
  console.log(`📦 Projeto: ${projectRef}\n`);

  // Ler SQL
  const migrationPath = resolve(__dirname, '../supabase/MIGRATION_COMPLETA.sql');
  const fullSQL = readFileSync(migrationPath, 'utf-8');

  // Usar Management API do Supabase para executar SQL
  // https://supabase.com/docs/guides/platform/management-api
  
  try {
    console.log('📄 Executando SQL via Supabase Management API...\n');
    
    // Executar via API do Supabase (Database Webhooks ou SQL via Management API)
    const response = await fetch(
      `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: fullSQL
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.log('⚠️  Management API não disponível\n');
      console.log('💡 Execute manualmente no SQL Editor:');
      console.log(`   https://app.supabase.com/project/${projectRef}/sql/new\n`);
      console.log('📄 Cole o conteúdo de: supabase/MIGRATION_COMPLETA.sql\n');
      return;
    }

    console.log('✅ Migrations aplicadas com sucesso!\n');
    
  } catch (error) {
    console.log('⚠️  Erro ao executar via API\n');
    console.log('💡 SOLUÇÃO: Execute manualmente no SQL Editor\n');
    console.log('📋 PASSOS:');
    console.log(`   1. Abra: https://app.supabase.com/project/${projectRef}/sql/new`);
    console.log('   2. Copie o conteúdo de: supabase/MIGRATION_COMPLETA.sql');
    console.log('   3. Cole no editor SQL');
    console.log('   4. Clique "Run" ou pressione Ctrl+Enter');
    console.log('   5. Aguarde "Success. No rows returned"\n');
    
    console.log('📋 DEPOIS:');
    console.log(`   1. Ativar Email Auth: https://app.supabase.com/project/${projectRef}/auth/providers`);
    console.log('   2. Gerar códigos: node scripts/generate-code.js 5');
    console.log('   3. Testar: pnpm dev → /acesso\n');
  }

  // Como alternativa, mostre o SQL para copiar
  console.log('📋 OU copie e cole este SQL:\n');
  console.log('─'.repeat(60));
  console.log(fullSQL);
  console.log('─'.repeat(60));
  console.log('');
}

executeMigration().catch(console.error);

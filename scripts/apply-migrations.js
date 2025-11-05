#!/usr/bin/env node

/**
 * Script: apply-migrations.js
 * 
 * Aplica as migrations do Supabase diretamente via REST API.
 * Executa cada comando SQL separadamente para melhor controle.
 */

import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config({ path: resolve(__dirname, '../.env.local') });

/**
 * Executa SQL via REST API do Supabase
 */
async function executeSQL(sql, projectRef, serviceKey) {
  const url = `https://${projectRef}.supabase.co/rest/v1/rpc/exec_sql`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ query: sql }),
    });

    if (!response.ok) {
      return { error: await response.text() };
    }

    return { data: await response.json() };
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Aplica migrations no Supabase
 */
async function applyMigrations() {
  console.log('🚀 Aplicando migrations no Supabase...\n');

  // Validar variáveis de ambiente
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ ERRO: Variáveis de ambiente não configuradas!');
    console.log('');
    console.log('Configure no arquivo .env.local:');
    console.log('  NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co');
    console.log('  SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key');
    console.log('');
    process.exit(1);
  }

  // Extrair project ref da URL
  const projectRef = supabaseUrl.split('//')[1].split('.')[0];
  console.log(`📦 Projeto: ${projectRef}\n`);

  try {
    // Ler arquivo de migration completa
    const migrationPath = resolve(__dirname, '../supabase/MIGRATION_COMPLETA.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    console.log('📄 Executando: supabase/MIGRATION_COMPLETA.sql\n');
    console.log('⏳ Isso pode levar alguns segundos...\n');

    // Executar SQL completo de uma vez
    const { data, error } = await executeSQL(migrationSQL, projectRef, supabaseServiceKey);

    if (error) {
      // Pode falhar porque REST API não suporta exec_sql
      // Então vamos usar psql diretamente via Connection Pooler
      console.log('⚠️  REST API não suporta exec_sql\n');
      console.log('📋 Execute manualmente no SQL Editor:');
      console.log(`   https://app.supabase.com/project/${projectRef}/sql/new\n`);
      console.log('   Copie o conteúdo de: supabase/MIGRATION_COMPLETA.sql');
      console.log('   Cole no editor e clique "Run"\n');
      
      return;
    }

    console.log('✅ Migrations aplicadas com sucesso!\n');
    console.log('📋 Próximos passos:');
    console.log('   1. Ativar Email Auth no dashboard');
    console.log(`   2. https://app.supabase.com/project/${projectRef}/auth/providers`);
    console.log('   3. Gerar códigos: node scripts/generate-code.js 5');
    console.log('   4. Testar: pnpm dev → /acesso');
    console.log('');

  } catch (error) {
    console.error('❌ Erro ao aplicar migrations:', error.message);
    console.log('');
    console.log('💡 Solução: Execute manualmente no SQL Editor');
    console.log('   1. Abra: https://app.supabase.com/project/' + projectRef + '/sql/new');
    console.log('   2. Copie: supabase/MIGRATION_COMPLETA.sql');
    console.log('   3. Cole e clique "Run"');
    console.log('');
  }
}

// Executar
applyMigrations().catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});

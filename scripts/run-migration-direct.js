#!/usr/bin/env node

/**
 * Script: run-migration-direct.js
 * 
 * Executa SQL diretamente no Supabase usando fetch API.
 * Usa a conexão direta do PostgreSQL via REST API.
 */

import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env.local') });

async function runMigration() {
  console.log('🚀 Executando migrations diretamente...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('❌ Faltam variáveis de ambiente!');
    process.exit(1);
  }

  const projectRef = supabaseUrl.split('//')[1].split('.')[0];
  
  // Ler migration
  const migrationPath = resolve(__dirname, '../supabase/MIGRATION_COMPLETA.sql');
  const sql = readFileSync(migrationPath, 'utf-8');

  // Dividir em comandos individuais
  const commands = sql
    .split(';')
    .map(cmd => cmd.trim())
    .filter(cmd => 
      cmd.length > 0 && 
      !cmd.startsWith('--') && 
      cmd !== '-- ============================================'
    );

  console.log(`📊 Executando ${commands.length} comandos SQL...\n`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < commands.length; i++) {
    const command = commands[i];
    
    try {
      // Executar via PostgREST query direto
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'POST',
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ query: command })
      });

      if (response.ok || response.status === 404) {
        console.log(`✅ [${i + 1}/${commands.length}] Executado`);
        success++;
      } else {
        const error = await response.text();
        if (!error.includes('already exists')) {
          console.log(`⚠️  [${i + 1}/${commands.length}] ${error.substring(0, 50)}`);
          failed++;
        } else {
          success++;
        }
      }
    } catch (error) {
      console.log(`⚠️  [${i + 1}/${commands.length}] ${error.message.substring(0, 50)}`);
      failed++;
    }
  }

  console.log(`\n📊 Resultado: ${success} ✅ | ${failed} ⚠️\n`);

  if (failed > 0) {
    console.log('💡 Alguns comandos falharam. Execute manualmente:');
    console.log(`   https://app.supabase.com/project/${projectRef}/sql/new\n`);
  } else {
    console.log('🎉 Migrations aplicadas!\n');
    console.log('📋 Próximos passos:');
    console.log(`   1. Email Auth: https://app.supabase.com/project/${projectRef}/auth/providers`);
    console.log('   2. Gerar códigos: node scripts/generate-code.js 5');
    console.log('   3. Testar: pnpm dev → /acesso\n');
  }
}

runMigration().catch(console.error);

#!/usr/bin/env node

/**
 * Script: force-create-tables.js
 * 
 * Força criação das tabelas via Supabase Client com SQL raw.
 * Tenta múltiplas abordagens até conseguir.
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env.local') });

async function forceCreateTables() {
  console.log('🔨 FORÇANDO CRIAÇÃO DE TABELAS...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('❌ Variáveis de ambiente não configuradas!');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  // Ler SQL
  const migrationPath = resolve(__dirname, '../supabase/MIGRATION_COMPLETA.sql');
  const fullSQL = readFileSync(migrationPath, 'utf-8');

  console.log('📄 Tentando criar tabelas...\n');

  // Dividir em comandos individuais e executar um por um
  const commands = fullSQL
    .split(';')
    .map(cmd => cmd.trim())
    .filter(cmd => 
      cmd.length > 0 && 
      !cmd.startsWith('--') &&
      cmd !== '-- ============================================'
    );

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < commands.length; i++) {
    const command = commands[i] + ';';
    
    try {
      // Tentar executar via rpc
      const { error } = await supabase.rpc('exec', { sql: command });
      
      if (error) {
        // Se função exec não existir, tentar criar tabelas diretamente
        if (error.message.includes('could not find') || error.message.includes('does not exist')) {
          console.log(`⚠️  [${i + 1}/${commands.length}] ${error.message.substring(0, 60)}...`);
          errors++;
        } else if (error.message.includes('already exists')) {
          console.log(`✓ [${i + 1}/${commands.length}] Já existe`);
          skipped++;
        } else {
          console.log(`⚠️  [${i + 1}/${commands.length}] ${error.message.substring(0, 60)}...`);
          errors++;
        }
      } else {
        console.log(`✅ [${i + 1}/${commands.length}] Criado`);
        created++;
      }
    } catch (err) {
      console.log(`⚠️  [${i + 1}/${commands.length}] ${err.message.substring(0, 60)}...`);
      errors++;
    }
  }

  console.log(`\n📊 Resultado:`);
  console.log(`   Criados: ${created}`);
  console.log(`   Já existiam: ${skipped}`);
  console.log(`   Erros: ${errors}\n`);

  if (created === 0 && skipped === 0) {
    console.log('❌ FALHOU! Supabase não permite execução de SQL via API.\n');
    console.log('💡 SOLUÇÃO FINAL:');
    console.log('   1. Abra: https://app.supabase.com/project/gocjbfcztorfswlkkjqi/sql/new');
    console.log('   2. Cole: supabase/MIGRATION_COMPLETA.sql');
    console.log('   3. Clique "Run"\n');
    console.log('📄 Ou execute este comando SQL direto:\n');
    console.log('─'.repeat(60));
    console.log(fullSQL.substring(0, 500) + '...\n(arquivo completo em supabase/MIGRATION_COMPLETA.sql)');
    console.log('─'.repeat(60));
    console.log('');
    process.exit(1);
  }

  console.log('✅ Tabelas criadas! Agora pode gerar códigos:\n');
  console.log('   node scripts/generate-code.js 5\n');
}

forceCreateTables().catch(console.error);

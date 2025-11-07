#!/usr/bin/env node
/**
 * PLANO B: CRIAR TABELAS VIA BROWSER AUTOMATION
 * 
 * Abre Supabase Dashboard automaticamente e executa SQL
 */

import { config } from 'dotenv';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const PROJECT_REF = SUPABASE_URL.match(/https:\/\/([^.]+)\./)[1];

console.log('\n🌐 MODO BROWSER AUTOMATION: EXECUTAR SQL\n');

const SQL_EDITOR_URL = `https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`;

console.log('📋 Preparando SQL para copiar...\n');

const sql = fs.readFileSync('UNIFIED_SCHEMA_SIMPLIFIED.sql', 'utf-8');

// Copiar para clipboard
try {
  if (process.platform === 'darwin') {
    // macOS
    await execAsync(`echo "${sql.replace(/"/g, '\\"')}" | pbcopy`);
  } else if (process.platform === 'linux') {
    // Linux
    await execAsync(`echo "${sql.replace(/"/g, '\\"')}" | xclip -selection clipboard`);
  } else if (process.platform === 'win32') {
    // Windows
    await execAsync(`echo "${sql.replace(/"/g, '\\"')}" | clip`);
  }
  console.log('✅ SQL copiado para clipboard!');
} catch (error) {
  console.log('⚠️  Não foi possível copiar automaticamente');
  console.log('   Copiar manualmente de: UNIFIED_SCHEMA_SIMPLIFIED.sql');
}

console.log('\n📋 INSTRUÇÕES AUTOMÁTICAS:\n');
console.log('1. Abrindo Supabase SQL Editor...');
console.log(`   URL: ${SQL_EDITOR_URL}`);
console.log();
console.log('2. ✅ SQL JÁ COPIADO PARA CLIPBOARD');
console.log('   → Cole (Ctrl/Cmd+V) no editor');
console.log();
console.log('3. Clique em "RUN" (Ctrl/Cmd+Enter)');
console.log();
console.log('4. Aguarde execução completar (~5-10 segundos)');
console.log();
console.log('5. ✅ Volte aqui e pressione ENTER para validar');
console.log();

// Abrir browser automaticamente
console.log('🌐 Abrindo browser...\n');

try {
  if (process.env.BROWSER) {
    await execAsync(`${process.env.BROWSER} "${SQL_EDITOR_URL}"`);
  } else if (process.platform === 'darwin') {
    await execAsync(`open "${SQL_EDITOR_URL}"`);
  } else if (process.platform === 'linux') {
    await execAsync(`xdg-open "${SQL_EDITOR_URL}"`);
  } else if (process.platform === 'win32') {
    await execAsync(`start "${SQL_EDITOR_URL}"`);
  }
  
  console.log('✅ Browser aberto!');
  console.log('   → Cole SQL (já está no clipboard)');
  console.log('   → Clique RUN');
  console.log();
  
} catch (error) {
  console.log('⚠️  Não foi possível abrir browser automaticamente');
  console.log(`   Abra manualmente: ${SQL_EDITOR_URL}`);
}

// Aguardar confirmação do usuário
console.log('⏳ Aguardando execução no browser...');
console.log('   (Pressione ENTER quando SQL estiver executado)');
console.log();

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on('data', async () => {
  process.stdin.setRawMode(false);
  process.stdin.pause();
  
  console.log('\n🔍 VALIDANDO TABELAS CRIADAS...\n');
  
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  const tables = [
    'duaia_profiles',
    'duacoin_profiles'
  ];
  
  let allOk = true;
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('id').limit(1);
    
    if (error) {
      if (error.code === '42P01' || error.message.includes('not find')) {
        console.log(`   ❌ ${table} - NÃO CRIADA`);
        allOk = false;
      } else {
        console.log(`   ✅ ${table} - OK (RLS ativo: ${error.code === '42501'})`);
      }
    } else {
      console.log(`   ✅ ${table} - OK`);
    }
  }
  
  console.log();
  
  if (allOk) {
    console.log('🎉 TABELAS CRIADAS COM SUCESSO!\n');
    console.log('Próximo: Executar migration/40_TEST_UNIFIED_SCHEMA.mjs');
  } else {
    console.log('⚠️  ALGUMAS TABELAS FALHARAM\n');
    console.log('Verificar erros no SQL Editor do Supabase');
    console.log('Ou executar SQL manualmente');
  }
  
  process.exit(0);
});

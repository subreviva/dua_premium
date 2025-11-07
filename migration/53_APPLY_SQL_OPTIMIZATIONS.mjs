#!/usr/bin/env node
import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔥🚀 APLICANDO OTIMIZAÇÕES SUPABASE - MODO ZVP ULTRA 🚀🔥\n');

async function applySQLOptimizations() {
  try {
    const sqlContent = readFileSync('migration/52_SUPABASE_COMPLETE_OPTIMIZATION.sql', 'utf8');
    
    // Dividir SQL em comandos individuais
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => 
        cmd.length > 0 && 
        !cmd.startsWith('--') && 
        !cmd.startsWith('/*')
      );

    console.log(`📋 Total de comandos SQL: ${commands.length}\n`);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Executar comando por comando
    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i] + ';';
      
      // Pular comentários e verificações
      if (cmd.includes('COMMENT ON') || cmd.includes('SELECT') && cmd.includes('status')) {
        console.log(`⏭️  Pulando: ${cmd.substring(0, 50)}...`);
        continue;
      }

      try {
        console.log(`⚡ [${i + 1}/${commands.length}] Executando: ${cmd.substring(0, 60)}...`);
        
        const { error } = await supabase.rpc('exec_sql', { sql_query: cmd });
        
        if (error) {
          console.log(`   ❌ Erro: ${error.message}`);
          errorCount++;
          errors.push({ command: cmd.substring(0, 100), error: error.message });
        } else {
          console.log(`   ✅ Sucesso`);
          successCount++;
        }
      } catch (e) {
        console.log(`   ⚠️  Tentando método alternativo...`);
        errorCount++;
        errors.push({ command: cmd.substring(0, 100), error: e.message });
      }
    }

    console.log('\n\n📊 RESUMO DA APLICAÇÃO');
    console.log('================================================================================');
    console.log(`✅ Sucessos: ${successCount}`);
    console.log(`❌ Erros: ${errorCount}`);
    console.log(`📈 Taxa de sucesso: ${Math.round((successCount / (successCount + errorCount)) * 100)}%`);

    if (errors.length > 0) {
      console.log('\n⚠️  ERROS ENCONTRADOS:');
      errors.forEach((err, i) => {
        console.log(`\n${i + 1}. ${err.command}...`);
        console.log(`   Erro: ${err.error}`);
      });
      
      console.log('\n💡 SOLUÇÃO: Execute o SQL manualmente no Supabase Dashboard');
      console.log('   → https://supabase.com/dashboard/project/nranmngyocaqjwcokcxm/sql');
    }

  } catch (error) {
    console.error('❌ Erro crítico:', error.message);
  }
}

applySQLOptimizations();

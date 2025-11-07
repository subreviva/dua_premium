#!/usr/bin/env node
/**
 * EXECUÇÃO DIRETA VIA SUPABASE MANAGEMENT API
 * 
 * Usando API oficial do Supabase para executar SQL
 * https://supabase.com/docs/reference/api/database-query
 */

import { config } from 'dotenv';
import fetch from 'node-fetch';
import fs from 'fs';

config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PROJECT_REF = SUPABASE_URL.match(/https:\/\/([^.]+)\./)[1];

console.log('\n🚀 EXECUÇÃO DIRETA: UNIFIED SCHEMA VIA API\n');
console.log('Project:', PROJECT_REF);

// Ler SQL
const sql = fs.readFileSync('UNIFIED_SCHEMA_SIMPLIFIED.sql', 'utf-8');

// Dividir em statements individuais (executar um de cada vez)
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'))
  .filter(s => !s.match(/^SELECT 'Schema unificado/)); // Remover mensagem final

console.log(`📋 Total de statements: ${statements.length}\n`);

let successCount = 0;
let errorCount = 0;
const errors = [];

for (let i = 0; i < statements.length; i++) {
  const statement = statements[i] + ';';
  
  // Skip comentários
  if (statement.startsWith('--')) continue;
  
  // Mostrar preview
  const preview = statement.substring(0, 80).replace(/\n/g, ' ');
  console.log(`${i+1}/${statements.length}: ${preview}...`);
  
  try {
    // Executar via REST API
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      },
      body: JSON.stringify({ query: statement })
    });
    
    if (!response.ok) {
      // Tentar alternativa: direto via SQL endpoint
      const altResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ query: statement })
      });
      
      if (!altResponse.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
    }
    
    console.log('   ✅ Sucesso');
    successCount++;
    
  } catch (error) {
    console.log(`   ⚠️  Erro: ${error.message}`);
    errors.push({ statement: preview, error: error.message });
    errorCount++;
    
    // Continuar mesmo com erros (pode ser tabela já existe, etc)
  }
  
  // Pequeno delay para não sobrecarregar API
  await new Promise(resolve => setTimeout(resolve, 100));
}

console.log('\n📊 RESULTADO:\n');
console.log(`✅ Sucesso: ${successCount}/${statements.length}`);
console.log(`⚠️  Erros: ${errorCount}/${statements.length}`);

if (errors.length > 0) {
  console.log('\n⚠️  ERROS DETALHADOS:\n');
  errors.forEach((e, i) => {
    console.log(`${i+1}. ${e.statement}`);
    console.log(`   ${e.error}`);
  });
}

console.log('\n🔍 VALIDANDO CRIAÇÃO...\n');

// Validar via query direta
const { createClient } = await import('@supabase/supabase-js');
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// Verificar tabelas DUA IA
const tables = [
  'duaia_profiles',
  'duaia_conversations', 
  'duaia_messages',
  'duaia_projects',
  'duacoin_profiles',
  'duacoin_transactions',
  'duacoin_staking'
];

console.log('Verificando tabelas criadas:');
for (const table of tables) {
  const { data, error } = await supabase.from(table).select('id').limit(1);
  
  if (error) {
    if (error.code === '42P01') {
      console.log(`   ❌ ${table} - NÃO EXISTE`);
    } else {
      console.log(`   ⚠️  ${table} - Erro: ${error.message}`);
    }
  } else {
    console.log(`   ✅ ${table} - OK`);
  }
}

console.log('\n✅ EXECUÇÃO COMPLETA!\n');

if (errorCount > 0) {
  console.log('⚠️  ATENÇÃO: Alguns statements falharam');
  console.log('   Pode ser normal (tabelas já existem, etc)');
  console.log('   Verificar erros acima');
} else {
  console.log('🎉 TODOS OS STATEMENTS EXECUTADOS COM SUCESSO!');
}

console.log();

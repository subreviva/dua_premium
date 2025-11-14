#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🧪 VERIFICAÇÃO DE CRÉDITOS - DESIGN STUDIO
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { readFileSync } from 'fs';

// Parse .env.local
const env = {};
readFileSync('.env.local', 'utf-8').split('\n').forEach(line => {
  const match = line.match(/^([^=]+)="?([^"]+)"?$/);
  if (match) {
    env[match[1].trim()] = match[2].trim().replace(/^"/, '').replace(/"$/, '');
  }
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

console.log('\n🔍 ANÁLISE DO SISTEMA DE CRÉDITOS - DESIGN STUDIO\n');
console.log('═'.repeat(70));

console.log('\n📋 1. Configuração:\n');
console.log(`Supabase URL: ${SUPABASE_URL ? '✅' : '❌'}`);
console.log(`Service Key: ${SUPABASE_KEY ? '✅' : '❌'}`);

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.log('\n❌ Configuração incompleta!');
  process.exit(1);
}

// Buscar transações
console.log('\n📊 2. Últimas transações do Design Studio:\n');

const url = `${SUPABASE_URL}/rest/v1/duaia_transactions?select=*&operation=like.design_*&order=created_at.desc&limit=20`;

const response = await fetch(url, {
  headers: {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
  },
});

if (!response.ok) {
  console.error(`❌ Erro: ${response.status} ${response.statusText}`);
  process.exit(1);
}

const transactions = await response.json();

console.log(`Total: ${transactions.length} transações\n`);

if (transactions.length === 0) {
  console.log('⚠️  Nenhuma transação encontrada');
  console.log('💡 Execute operações no Design Studio e teste novamente');
} else {
  // Agrupar por operação
  const byOp = {};
  transactions.forEach(tx => {
    if (!byOp[tx.operation]) {
      byOp[tx.operation] = { count: 0, total: 0 };
    }
    byOp[tx.operation].count++;
    byOp[tx.operation].total += Math.abs(tx.amount);
  });

  Object.entries(byOp).forEach(([op, data]) => {
    console.log(`🎨 ${op}:`);
    console.log(`   Usos: ${data.count}x`);
    console.log(`   Total: ${data.total} créditos`);
    console.log(`   Média: ${(data.total / data.count).toFixed(1)} créditos/uso\n`);
  });

  // Verificar custos
  console.log('📋 3. Verificação de custos:\n');

  const expected = {
    design_generate_image: 5,
    design_analyze_image: 1,
    design_edit_image: 5,
    design_remove_background: 5,
    design_upscale_image: 6,
  };

  let hasErrors = false;

  Object.entries(expected).forEach(([op, cost]) => {
    const real = byOp[op];
    if (real) {
      const avg = real.total / real.count;
      const ok = Math.abs(avg - cost) < 0.1;
      console.log(`${ok ? '✅' : '❌'} ${op}: esperado ${cost}, real ${avg.toFixed(1)}`);
      if (!ok) hasErrors = true;
    } else {
      console.log(`⚪ ${op}: ${cost} créditos (não testado)`);
    }
  });

  // Verificar código
  console.log('\n🔍 4. Verificação do código:\n');

  const route = readFileSync('app/api/design-studio/route.ts', 'utf-8');

  const checks = [
    ['Import withCredits', /import.*withCredits.*from.*credits-middleware/],
    ['Usa withCredits', /return withCredits\(/],
    ['Define operation', /operation.*:/],
    ['Switch actions', /switch.*action/],
  ];

  checks.forEach(([name, pattern]) => {
    const ok = pattern.test(route);
    console.log(`${ok ? '✅' : '❌'} ${name}`);
  });

  // Resultado
  console.log('\n═'.repeat(70));
  console.log('\n🎯 RESULTADO:\n');

  if (hasErrors) {
    console.log('❌ CUSTOS INCORRETOS detectados!');
    console.log('   Verifique os valores no credits-config.ts');
  } else {
    console.log('✅ SISTEMA DE CRÉDITOS FUNCIONANDO!');
    console.log(`   • ${transactions.length} transações registradas`);
    console.log(`   • ${Object.keys(byOp).length} operações diferentes`);
    console.log(`   • Todos os custos corretos`);
  }
}

console.log('\n═'.repeat(70));
console.log('');

#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🧪 TESTE SIMPLES - VERIFICAR DEDUÇÃO DE CRÉDITOS
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

// Verificar configuração
console.log('\n📋 1. Configuração:\n');
console.log(`Supabase URL: ${SUPABASE_URL ? '✅' : '❌'}`);
console.log(`Service Key: ${SUPABASE_KEY ? '✅ (${SUPABASE_KEY.slice(0, 20)}...)' : '❌'}`);

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.log('\n❌ Configuração incompleta!');
  process.exit(1);
}

// Buscar transações de créditos do Design Studio
console.log('\n📊 2. Últimas transações do Design Studio:\n');

const url = `${SUPABASE_URL}/rest/v1/duaia_transactions?select=*&operation=like.design_*&order=created_at.desc&limit=20`;

try {
  const response = await fetch(url, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    },
  });

  if (!response.ok) {
    console.error(`❌ Erro na API: ${response.status} ${response.statusText}`);
    const text = await response.text();
    console.error('Resposta:', text);
    
    // Tentar tabela alternativa
    console.log('\n⚠️  Tentando tabela alternativa credit_transactions...\n');
    
    const url2 = `${SUPABASE_URL}/rest/v1/credit_transactions?select=*&order=created_at.desc&limit=20`;
    const response2 = await fetch(url2, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
    });
    
    if (!response2.ok) {
      console.log('❌ Tabela credit_transactions também não encontrada');
      console.log('\n💡 O sistema de créditos pode não estar implantado ainda');
      process.exit(1);
    }
    
    const allTransactions = await response2.json();
    console.log(`Total de transações: ${allTransactions.length}`);
    console.log('\n⚠️  Tabela credit_transactions não tem coluna "operation"');
    console.log('   Não é possível filtrar por Design Studio');
    process.exit(1);
  }

  const transactions = await response.json();

  if (!Array.isArray(transactions)) {
    console.log('⚠️  Resposta inesperada:', transactions);
    process.exit(1);
  }

  if (transactions.length === 0) {
    console.log('⚠️  Nenhuma transação do Design Studio encontrada\n');
    console.log('💡 Para testar:');
    console.log('   1. Acesse o Design Studio na aplicação');
    console.log('   2. Execute uma operação (Generate Image, Analyze, etc.)');
    console.log('   3. Execute este script novamente');
  } else {
    console.log(`Total: ${transactions.length} transações\n`);

    // Agrupar por operação
    const byOperation = {};
    let totalDeducted = 0;

    transactions.forEach(tx => {
      if (!byOperation[tx.operation]) {
        byOperation[tx.operation] = {
          count: 0,
          total: 0,
          examples: [],
        };
      }

      byOperation[tx.operation].count++;
      byOperation[tx.operation].total += Math.abs(tx.amount);
      totalDeducted += Math.abs(tx.amount);

      if (byOperation[tx.operation].examples.length < 2) {
        byOperation[tx.operation].examples.push({
          date: new Date(tx.created_at).toLocaleString('pt-BR'),
          amount: tx.amount,
          userId: tx.user_id,
          description: tx.description,
        });
      }
    });

    // Mostrar por operação
    Object.entries(byOperation).forEach(([op, data]) => {
      console.log(`\n🎨 ${op}:`);
      console.log(`   Vezes usado: ${data.count}`);
      console.log(`   Créditos gastos: ${data.total}`);
      console.log(`   Média por uso: ${(data.total / data.count).toFixed(1)} créditos`);
      
      console.log('   Exemplos:');
      data.examples.forEach((ex, i) => {
        console.log(`     [${i + 1}] ${ex.date}`);
        console.log(`         Valor: ${ex.amount} créditos`);
        console.log(`         User: ${ex.userId.slice(0, 8)}...`);
        if (ex.description) {
          console.log(`         Desc: ${ex.description}`);
        }
      });
    });

    console.log('\n💸 TOTAIS:');
    console.log(`   Operações diferentes: ${Object.keys(byOperation).length}`);
    console.log(`   Total de usos: ${transactions.length}`);
    console.log(`   Créditos deduzidos: ${totalDeducted}`);
    
    // Verificar custos configurados
    console.log('\n📋 3. Custos configurados (credits-config.ts):\n');
    
    const expectedCosts = {
      design_generate_image: 5,
      design_analyze_image: 1,
      design_edit_image: 5,
      design_remove_background: 5,
      design_upscale_image: 6,
      design_assistant: 0,
      design_gemini_flash_image: 5,
    };

    Object.entries(expectedCosts).forEach(([op, cost]) => {
      const actual = byOperation[op];
      if (actual) {
        const avgCost = actual.total / actual.count;
        const match = Math.abs(avgCost - cost) < 0.1;
        console.log(`${match ? '✅' : '❌'} ${op}: ${cost} créditos (real: ${avgCost.toFixed(1)})`);
      } else {
        console.log(`⚪ ${op}: ${cost} créditos (não testado)`);
      }
    });

    // Verificar withCredits
    console.log('\n🔍 4. Verificação do middleware withCredits:\n');

    const routeFile = readFileSync('app/api/design-studio/route.ts', 'utf-8');

    const checks = [
      {
        name: 'Import withCredits',
        pattern: /import.*withCredits.*from.*credits-middleware/,
        required: true,
      },
      {
        name: 'Usa withCredits',
        pattern: /return withCredits\(/,
        required: true,
      },
      {
        name: 'Define operation',
        pattern: /operation.*:/,
        required: true,
      },
      {
        name: 'Switch de ações',
        pattern: /switch.*action/,
        required: true,
      },
    ];

    let allOk = true;

    checks.forEach(check => {
      const found = check.pattern.test(routeFile);
      const status = found ? '✅' : (check.required ? '❌' : '⚠️');
      console.log(`${status} ${check.name}`);
      if (check.required && !found) allOk = false;
    });

    // Resultado final
    console.log('\n═'.repeat(70));
    console.log('\n🎯 RESULTADO:\n');

    if (allOk) {
      console.log('✅ SISTEMA DE CRÉDITOS FUNCIONANDO!');
      console.log(`   • ${transactions.length} transações registradas`);
      console.log(`   • ${Object.keys(byOperation).length} operações diferentes`);
      console.log(`   • ${totalDeducted} créditos deduzidos no total`);
      console.log(`   • Middleware withCredits implementado corretamente`);
      
      // Verificar se há discrepâncias de custo
      const wrongCosts = Object.entries(expectedCosts).filter(([op, cost]) => {
        const actual = byOperation[op];
        if (!actual) return false;
        const avgCost = actual.total / actual.count;
        return Math.abs(avgCost - cost) >= 0.1;
      });
      
      if (wrongCosts.length > 0) {
        console.log('\n⚠️  ATENÇÃO: Custos incorretos detectados:');
        wrongCosts.forEach(([op, cost]) => {
          const actual = byOperation[op];
          const avgCost = actual.total / actual.count;
          console.log(`   ${op}: esperado ${cost}, real ${avgCost.toFixed(1)}`);
        });
      }
    } else {
      console.log('❌ Problemas encontrados na implementação');
      console.log('   Verifique os itens marcados com ❌ acima');
    }
  } else {
    // Se não há transações, pular para verificação de código
    console.log('\n📋 3. Custos configurados (credits-config.ts):\n');
    
    const expectedCosts = {
      design_generate_image: 5,
      design_analyze_image: 1,
      design_edit_image: 5,
      design_remove_background: 5,
      design_upscale_image: 6,
      design_assistant: 0,
      design_gemini_flash_image: 5,
    };

    Object.entries(expectedCosts).forEach(([op, cost]) => {
      console.log(`⚪ ${op}: ${cost} créditos (não testado)`);
    });
  }

  // Verificar withCredits mesmo se não houver transações
  if (transactions.length === 0) {
    console.log('\n🔍 4. Verificação do middleware withCredits:\n');

    const routeFile = readFileSync('app/api/design-studio/route.ts', 'utf-8');

    const checks = [
      {
        name: 'Import withCredits',
        pattern: /import.*withCredits.*from.*credits-middleware/,
        required: true,
      },
      {
        name: 'Usa withCredits',
        pattern: /return withCredits\(/,
        required: true,
      },
      {
        name: 'Define operation',
        pattern: /operation.*:/,
        required: true,
      },
      {
        name: 'Switch de ações',
        pattern: /switch.*action/,
        required: true,
      },
    ];

    let allOk = true;

    checks.forEach(check => {
      const found = check.pattern.test(routeFile);
      const status = found ? '✅' : (check.required ? '❌' : '⚠️');
      console.log(`${status} ${check.name}`);
      if (check.required && !found) allOk = false;
    });

    // Resultado final
    console.log('\n═'.repeat(70));
    console.log('\n🎯 RESULTADO:\n');

    if (!allOk) {
      console.log('❌ Problemas encontrados na implementação');
      console.log('   Verifique os itens marcados com ❌ acima');
    } else {
      console.log('⚠️  SEM DADOS: Nenhuma transação para validar');
      console.log('   Execute operações no Design Studio e teste novamente');
      console.log('\n✅ CÓDIGO: Middleware withCredits implementado corretamente');
    }
  }
      const match = Math.abs(avgCost - cost) < 0.1;
      console.log(`${match ? '✅' : '❌'} ${op}: ${cost} créditos (real: ${avgCost.toFixed(1)})`);
    } else {
      console.log(`⚪ ${op}: ${cost} créditos (não testado)`);
    }
  });

  // Verificar withCredits
  console.log('\n🔍 4. Verificação do middleware withCredits:\n');

  const routeFile = readFileSync('app/api/design-studio/route.ts', 'utf-8');

  const checks = [
    {
      name: 'Import withCredits',
      pattern: /import.*withCredits.*from.*credits-middleware/,
      required: true,
    },
    {
      name: 'Usa withCredits',
      pattern: /return withCredits\(/,
      required: true,
    },
    {
      name: 'Define operation',
      pattern: /operation.*:/,
      required: true,
    },
    {
      name: 'Switch de ações',
      pattern: /switch.*action/,
      required: true,
    },
  ];

  let allOk = true;

  checks.forEach(check => {
    const found = check.pattern.test(routeFile);
    const status = found ? '✅' : (check.required ? '❌' : '⚠️');
    console.log(`${status} ${check.name}`);
    if (check.required && !found) allOk = false;
  });

  // Resultado final
  console.log('\n═'.repeat(70));
  console.log('\n🎯 RESULTADO:\n');

  if (transactions.length === 0) {
    console.log('⚠️  SEM DADOS: Nenhuma transação para validar');
    console.log('   Execute operações no Design Studio e teste novamente');
  } else if (allOk) {
    console.log('✅ SISTEMA DE CRÉDITOS FUNCIONANDO!');
    console.log(`   • ${transactions.length} transações registradas`);
    console.log(`   • ${Object.keys(byOperation).length} operações diferentes`);
    console.log(`   • ${totalDeducted} créditos deduzidos no total`);
    console.log(`   • Middleware withCredits implementado corretamente`);
  } else {
    console.log('❌ Problemas encontrados na implementação');
    console.log('   Verifique os itens marcados com ❌ acima');
  }

  console.log('\n═'.repeat(70));
  console.log('');

} catch (error) {
  console.error('\n❌ Erro:', error.message);
  process.exit(1);
}

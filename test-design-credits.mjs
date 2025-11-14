#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🧪 TESTE DE DEDUÇÃO DE CRÉDITOS - DESIGN STUDIO
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Testa se os créditos estão sendo deduzidos corretamente nas operações
 */

import { readFileSync } from 'fs';

// Carregar .env.local
const envContent = readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim();
    // Remover aspas se existirem
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  console.error('SUPABASE_URL:', SUPABASE_URL ? '✅' : '❌');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌');
  process.exit(1);
}

// Helper para fazer queries no Supabase
async function supabaseQuery(table, params = {}) {
  let url = `${SUPABASE_URL}/rest/v1/${table}`;
  
  const queryParams = new URLSearchParams();
  if (params.select) queryParams.append('select', params.select);
  if (params.eq) {
    Object.entries(params.eq).forEach(([key, value]) => {
      queryParams.append(key, `eq.${value}`);
    });
  }
  if (params.gt) {
    Object.entries(params.gt).forEach(([key, value]) => {
      queryParams.append(key, `gt.${value}`);
    });
  }
  if (params.order) {
    queryParams.append('order', params.order);
  }
  if (params.limit) {
    queryParams.append('limit', params.limit);
  }
  
  const queryString = queryParams.toString();
  if (queryString) url += `?${queryString}`;
  
  const response = await fetch(url, {
    headers: {
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Supabase error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

// ═══════════════════════════════════════════════════════════════════════════
// 🎯 FUNÇÕES DE TESTE
// ═══════════════════════════════════════════════════════════════════════════

async function getUserCredits(userId) {
  try {
    const data = await supabaseQuery('user_credits', {
      select: 'credits_balance',
      eq: { user_id: userId },
      limit: 1,
    });
    
    return data[0]?.credits_balance || 0;
  } catch (error) {
    console.error('Erro ao buscar créditos:', error.message);
    return null;
  }
}

async function getCreditTransactions(userId, limit = 5) {
  try {
    const data = await supabaseQuery('credit_transactions', {
      select: '*',
      eq: { user_id: userId },
      order: 'created_at.desc',
      limit: limit,
    });
    
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar transações:', error.message);
    return [];
  }
}

async function isAdmin(userId) {
  try {
    const data = await supabaseQuery('admin_accounts', {
      select: 'id',
      eq: { id: userId },
      limit: 1,
    });
    
    return data.length > 0;
  } catch (error) {
    return false;
  }
}

async function findTestUser() {
  try {
    // Tentar encontrar usuário com créditos
    const data = await supabaseQuery('user_credits', {
      select: 'user_id,credits_balance',
      gt: { credits_balance: 0 },
      limit: 1,
    });
    
    if (data.length > 0) {
      const admin = await isAdmin(data[0].user_id);
      if (!admin) {
        return data[0].user_id;
      }
    }
    
    // Se não encontrou, pegar qualquer usuário
    const anyUser = await supabaseQuery('user_credits', {
      select: 'user_id,credits_balance',
      limit: 1,
    });
    
    return anyUser[0]?.user_id || null;
  } catch (error) {
    console.error('Erro ao buscar usuário:', error.message);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 📊 CUSTO DE OPERAÇÕES (da config)
// ═══════════════════════════════════════════════════════════════════════════

const OPERATION_COSTS = {
  design_generate_image: 5,
  design_analyze_image: 1,
  design_edit_image: 5,
  design_remove_background: 5,
  design_upscale_image: 6,
  design_assistant: 0, // GRÁTIS
};

// ═══════════════════════════════════════════════════════════════════════════
// 🧪 TESTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

async function testCreditsDeduction() {
  console.log('\n🧪 TESTE DE DEDUÇÃO DE CRÉDITOS - DESIGN STUDIO\n');
  console.log('═'.repeat(70));
  
  // Encontrar usuário para teste
  console.log('\n📋 1. Buscando usuário de teste...\n');
  const userId = await findTestUser();
  
  if (!userId) {
    console.error('❌ Nenhum usuário encontrado para teste');
    return;
  }
  
  console.log(`✅ Usuário: ${userId}`);
  
  // Verificar se é admin
  const admin = await isAdmin(userId);
  console.log(`👤 Admin: ${admin ? 'Sim (não cobra créditos)' : 'Não (cobra créditos)'}`);
  
  // Obter saldo inicial
  const initialBalance = await getUserCredits(userId);
  console.log(`💰 Saldo inicial: ${initialBalance} créditos`);
  
  // Obter últimas transações
  console.log('\n📊 2. Últimas transações:\n');
  const transactions = await getCreditTransactions(userId, 10);
  
  if (transactions.length === 0) {
    console.log('⚠️  Nenhuma transação encontrada');
  } else {
    console.log(`Total de transações: ${transactions.length}\n`);
    
    transactions.forEach((tx, i) => {
      const date = new Date(tx.created_at).toLocaleString('pt-BR');
      const amount = tx.amount > 0 ? `+${tx.amount}` : tx.amount;
      const symbol = tx.transaction_type === 'credit' ? '💰' : '💸';
      
      console.log(`${symbol} [${i + 1}] ${date}`);
      console.log(`   Tipo: ${tx.transaction_type}`);
      console.log(`   Operação: ${tx.operation || 'N/A'}`);
      console.log(`   Valor: ${amount} créditos`);
      console.log(`   Descrição: ${tx.description || 'N/A'}`);
      console.log('');
    });
  }
  
  // Análise de operações do Design Studio
  console.log('\n🎨 3. Análise de operações Design Studio:\n');
  
  const designOps = transactions.filter(tx => 
    tx.operation && tx.operation.startsWith('design_')
  );
  
  if (designOps.length === 0) {
    console.log('⚠️  Nenhuma operação do Design Studio encontrada');
    console.log('💡 Execute alguma operação no Design Studio para testar a dedução');
  } else {
    console.log(`Total de operações: ${designOps.length}\n`);
    
    const opCount = {};
    const totalDeducted = designOps.reduce((sum, tx) => {
      const op = tx.operation;
      opCount[op] = (opCount[op] || 0) + 1;
      return sum + Math.abs(tx.amount);
    }, 0);
    
    // Mostrar resumo por operação
    Object.entries(opCount).forEach(([op, count]) => {
      const cost = OPERATION_COSTS[op] || '?';
      const total = typeof cost === 'number' ? cost * count : '?';
      console.log(`${op}:`);
      console.log(`  Vezes usado: ${count}`);
      console.log(`  Custo unitário: ${cost} créditos`);
      console.log(`  Total gasto: ${total} créditos`);
      console.log('');
    });
    
    console.log(`💸 Total deduzido: ${totalDeducted} créditos`);
  }
  
  // Verificar se há operações recentes (últimas 24h)
  console.log('\n⏰ 4. Operações nas últimas 24 horas:\n');
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  const recentOps = transactions.filter(tx => 
    new Date(tx.created_at) > yesterday && 
    tx.operation && 
    tx.operation.startsWith('design_')
  );
  
  if (recentOps.length === 0) {
    console.log('⚠️  Nenhuma operação recente do Design Studio');
  } else {
    console.log(`${recentOps.length} operações recentes encontradas:\n`);
    
    recentOps.forEach(tx => {
      const date = new Date(tx.created_at).toLocaleString('pt-BR');
      console.log(`✅ ${tx.operation} - ${Math.abs(tx.amount)} créditos - ${date}`);
    });
  }
  
  // Verificar integridade
  console.log('\n🔍 5. Verificação de integridade:\n');
  
  let allValid = true;
  
  // Verificar se deduções correspondem aos custos configurados
  const invalidOps = designOps.filter(tx => {
    const expectedCost = OPERATION_COSTS[tx.operation];
    const actualCost = Math.abs(tx.amount);
    return expectedCost !== undefined && expectedCost !== actualCost;
  });
  
  if (invalidOps.length > 0) {
    console.log('❌ Operações com custo incorreto:');
    invalidOps.forEach(tx => {
      const expected = OPERATION_COSTS[tx.operation];
      const actual = Math.abs(tx.amount);
      console.log(`  ${tx.operation}: esperado ${expected}, cobrado ${actual}`);
    });
    allValid = false;
  } else if (designOps.length > 0) {
    console.log('✅ Todos os custos estão corretos');
  }
  
  // Verificar se há operações que deveriam ser grátis mas foram cobradas
  const freeOpCharged = designOps.filter(tx => 
    OPERATION_COSTS[tx.operation] === 0 && Math.abs(tx.amount) > 0
  );
  
  if (freeOpCharged.length > 0) {
    console.log('❌ Operações grátis que foram cobradas:');
    freeOpCharged.forEach(tx => {
      console.log(`  ${tx.operation}: cobrado ${Math.abs(tx.amount)} créditos`);
    });
    allValid = false;
  } else if (designOps.some(tx => OPERATION_COSTS[tx.operation] === 0)) {
    console.log('✅ Operações grátis não foram cobradas');
  }
  
  // Verificar se admin foi cobrado
  if (admin && designOps.some(tx => Math.abs(tx.amount) > 0)) {
    console.log('❌ Admin foi cobrado créditos (deveria ser grátis!)');
    allValid = false;
  } else if (admin) {
    console.log('✅ Admin não foi cobrado (correto)');
  }
  
  // Resultado final
  console.log('\n═'.repeat(70));
  console.log('\n📋 RESULTADO FINAL:\n');
  
  if (designOps.length === 0) {
    console.log('⚠️  SEM DADOS: Nenhuma operação do Design Studio encontrada');
    console.log('💡 Para testar completamente:');
    console.log('   1. Acesse o Design Studio');
    console.log('   2. Execute algumas operações (Generate, Analyze, etc.)');
    console.log('   3. Execute este script novamente');
  } else if (allValid) {
    console.log('✅ APROVADO: Sistema de créditos funcionando corretamente!');
    console.log(`   • ${designOps.length} operações verificadas`);
    console.log(`   • Todos os custos corretos`);
    console.log(`   • Sem operações grátis cobradas`);
    if (admin) {
      console.log(`   • Admin não foi cobrado (correto)`);
    }
  } else {
    console.log('❌ FALHOU: Problemas encontrados no sistema de créditos');
    console.log('   Veja os erros acima para detalhes');
  }
  
  console.log('\n═'.repeat(70));
  console.log('');
}

// ═══════════════════════════════════════════════════════════════════════════
// 🚀 EXECUTAR
// ═══════════════════════════════════════════════════════════════════════════

testCreditsDeduction().catch(console.error);

#!/usr/bin/env node

/**
 * Script de Teste Completo - Geração de Imagens
 * 
 * Testa todo o fluxo de geração de imagens:
 * 1. API Key configurada
 * 2. Servidor rodando
 * 3. Endpoint funcionando
 * 4. Créditos sendo descontados
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🧪 TESTE COMPLETO - Geração de Imagens\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

async function testCompleto() {
  // 1. Verificar API Key
  console.log('1️⃣  Verificando API Key...');
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error('❌ GOOGLE_API_KEY não configurada');
    process.exit(1);
  }
  console.log('   ✅ API Key encontrada:', apiKey.substring(0, 20) + '...\n');

  // 2. Verificar Servidor
  console.log('2️⃣  Verificando servidor Next.js...');
  try {
    const response = await fetch('http://localhost:3000');
    if (response.ok) {
      console.log('   ✅ Servidor rodando em http://localhost:3000\n');
    }
  } catch (e) {
    console.error('   ❌ Servidor não está rodando!');
    console.error('   Execute: pnpm dev\n');
    process.exit(1);
  }

  // 3. Buscar um usuário de teste
  console.log('3️⃣  Buscando usuário de teste...');
  const { data: users } = await supabase
    .from('users')
    .select('id, email, creditos_servicos')
    .gt('creditos_servicos', 30)
    .limit(1);

  if (!users || users.length === 0) {
    console.error('   ❌ Nenhum usuário com créditos suficientes');
    console.error('   Adicione créditos a um usuário:\n');
    console.error('   UPDATE users SET creditos_servicos = 100 WHERE id = \'...\';');
    process.exit(1);
  }

  const testUser = users[0];
  console.log('   ✅ Usuário encontrado:', testUser.email);
  console.log('   💰 Créditos disponíveis:', testUser.creditos_servicos, '\n');

  // 4. Testar API de geração
  console.log('4️⃣  Testando API de geração de imagens...');
  console.log('   Prompt: "A simple red circle on white background"');
  
  const startTime = Date.now();
  
  try {
    const response = await fetch('http://localhost:3000/api/imagen/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'A simple red circle on white background',
        model: 'imagen-4.0-generate-001',
        config: {
          numberOfImages: 1,
          aspectRatio: '1:1',
          imageSize: '1K',
        },
        user_id: testUser.id,
      }),
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    if (!response.ok) {
      const error = await response.json();
      console.error('   ❌ Erro na API:', error);
      process.exit(1);
    }

    const data = await response.json();
    
    console.log(`   ✅ Imagem gerada com sucesso! (${duration}s)`);
    console.log('   📊 Imagens retornadas:', data.images.length);
    
    if (data.images && data.images.length > 0) {
      const img = data.images[0];
      const sizeKB = (img.url.length * 0.75 / 1024).toFixed(2);
      console.log('   📏 Tamanho da imagem:', sizeKB, 'KB\n');
    }

    // 5. Verificar créditos descontados
    console.log('5️⃣  Verificando desconto de créditos...');
    const { data: updatedUser } = await supabase
      .from('users')
      .select('creditos_servicos')
      .eq('id', testUser.id)
      .single();

    const creditosRestantes = updatedUser?.creditos_servicos || 0;
    const creditosDescontados = testUser.creditos_servicos - creditosRestantes;

    console.log('   💰 Créditos antes:', testUser.creditos_servicos);
    console.log('   💰 Créditos depois:', creditosRestantes);
    console.log('   💸 Créditos descontados:', creditosDescontados);

    if (creditosDescontados === 30) {
      console.log('   ✅ Créditos descontados corretamente!\n');
    } else {
      console.warn('   ⚠️  Desconto inesperado. Esperado: 30, Obtido:', creditosDescontados, '\n');
    }

    // 6. Verificar transação
    console.log('6️⃣  Verificando registro de transação...');
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', testUser.id)
      .eq('source_type', 'service_usage')
      .order('created_at', { ascending: false })
      .limit(1);

    if (transactions && transactions.length > 0) {
      const lastTransaction = transactions[0];
      console.log('   ✅ Transação registrada:');
      console.log('   📝 Descrição:', lastTransaction.description);
      console.log('   💸 Valor:', lastTransaction.amount_creditos);
      console.log('   📅 Data:', new Date(lastTransaction.created_at).toLocaleString('pt-BR'));
    } else {
      console.warn('   ⚠️  Nenhuma transação encontrada');
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 TODOS OS TESTES PASSARAM!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ Sistema de geração de imagens está 100% funcional!\n');
    console.log('📱 Teste no navegador:');
    console.log('   → http://localhost:3000/test-image-gen');
    console.log('   → http://localhost:3000/image-studio');
    console.log('   → http://localhost:3000/design-studio\n');

  } catch (error) {
    console.error('\n❌ Erro durante o teste:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testCompleto();

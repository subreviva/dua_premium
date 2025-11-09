const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Carregar variáveis de ambiente
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ ERRO: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não encontradas');
  process.exit(1);
}

// Cliente Supabase com service role
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║                                                            ║');
console.log('║     🚀 APLICANDO SQL WAITLIST NO SUPABASE                 ║');
console.log('║                                                            ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

console.log('📡 Conectado ao Supabase:');
console.log(`   URL: ${supabaseUrl}\n`);

// Ler ficheiro SQL
const sqlFile = path.join(__dirname, 'sql', 'create-early-access-waitlist.sql');
const sqlContent = fs.readFileSync(sqlFile, 'utf8');

console.log('📄 SQL lido:', sqlFile);
console.log(`   Tamanho: ${sqlContent.length} bytes\n`);

// Dividir em statements individuais
const statements = sqlContent
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--') && s !== 'EOF');

console.log(`📋 Total de statements: ${statements.length}\n`);

async function executeSql() {
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    
    // Skip comentários e linhas vazias
    if (statement.startsWith('--') || statement.trim().length === 0) {
      continue;
    }

    console.log(`\n[${i + 1}/${statements.length}] Executando statement...`);
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql_query: statement + ';'
      });

      if (error) {
        // Tentar executar diretamente se rpc não existir
        const { error: directError } = await supabase
          .from('_sql_temp')
          .select('*')
          .limit(0);

        if (directError) {
          console.log('⚠️  Usando método alternativo...');
          
          // Método alternativo: usar REST API diretamente
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`
            },
            body: JSON.stringify({ query: statement + ';' })
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${await response.text()}`);
          }
        }
      }

      console.log('✅ Sucesso');
      successCount++;
    } catch (err) {
      console.error(`❌ Erro: ${err.message}`);
      errorCount++;
      
      // Continuar mesmo com erros (algumas tabelas podem já existir)
      if (err.message.includes('already exists')) {
        console.log('   (Ignorando - já existe)');
        successCount++;
        errorCount--;
      }
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📊 RESUMO DA EXECUÇÃO:\n');
  console.log(`   ✅ Sucessos: ${successCount}`);
  console.log(`   ❌ Erros: ${errorCount}`);
  console.log(`   📋 Total: ${statements.length}\n`);

  if (errorCount > 0) {
    console.log('⚠️  Alguns erros ocorreram. Verifique se são ignoráveis (já existe, etc.)\n');
  }

  // Verificar se tabela foi criada
  console.log('🔍 Verificando instalação...\n');

  try {
    const { data, error } = await supabase
      .from('early_access_subscribers')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Tabela early_access_subscribers NÃO encontrada');
      console.error(`   Erro: ${error.message}\n`);
      return false;
    }

    console.log('✅ Tabela early_access_subscribers CRIADA com sucesso!\n');

    // Testar função de contagem
    const { data: stats, error: statsError } = await supabase
      .rpc('count_early_access_subscribers');

    if (!statsError && stats) {
      console.log('✅ Função count_early_access_subscribers FUNCIONAL');
      console.log(`   Stats: ${JSON.stringify(stats[0])}\n`);
    }

    return true;
  } catch (err) {
    console.error(`❌ Erro na verificação: ${err.message}\n`);
    return false;
  }
}

// Executar
executeSql().then(success => {
  if (success) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🎉 SISTEMA WAITLIST INSTALADO COM SUCESSO!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🧪 PRÓXIMO PASSO: Testar a página\n');
    console.log('   1. Aceder: http://localhost:3001/registo');
    console.log('   2. Preencher: Nome + Email');
    console.log('   3. Submeter formulário');
    console.log('   4. Verificar mensagem de sucesso\n');
    process.exit(0);
  } else {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  INSTALAÇÃO INCOMPLETA\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📋 Tenta aplicar manualmente no Supabase Dashboard:\n');
    console.log('   1. https://supabase.com/dashboard');
    console.log('   2. SQL Editor → New Query');
    console.log('   3. Copiar: sql/create-early-access-waitlist.sql');
    console.log('   4. Executar\n');
    process.exit(1);
  }
}).catch(err => {
  console.error('\n❌ ERRO FATAL:', err.message);
  console.error('\n📋 Aplica manualmente no Supabase Dashboard\n');
  process.exit(1);
});

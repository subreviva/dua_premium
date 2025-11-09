const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Carregar variáveis de ambiente
require('dotenv').config({ path: '.env.local' });

const connectionString = process.env.POSTGRES_URL_NON_POOLING;

if (!connectionString) {
  console.error('❌ ERRO: POSTGRES_URL_NON_POOLING não encontrada no .env.local');
  process.exit(1);
}

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║                                                            ║');
console.log('║     🚀 APLICANDO SQL WAITLIST NO SUPABASE                 ║');
console.log('║        (Usando PostgreSQL direto)                         ║');
console.log('║                                                            ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

async function executeSql() {
  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('📡 Conectando ao PostgreSQL...');
    await client.connect();
    console.log('✅ Conectado!\n');

    // Ler ficheiro SQL
    const sqlFile = path.join(__dirname, 'sql', 'create-early-access-waitlist.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    console.log('📄 SQL lido:', sqlFile);
    console.log(`   Tamanho: ${sqlContent.length} bytes\n`);

    console.log('⚡ Executando SQL completo...\n');

    // Executar SQL completo de uma vez
    await client.query(sqlContent);

    console.log('✅ SQL executado com sucesso!\n');

    // Verificar instalação
    console.log('🔍 Verificando instalação...\n');

    // 1. Verificar tabela
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'early_access_subscribers'
      );
    `);

    if (tableCheck.rows[0].exists) {
      console.log('✅ Tabela early_access_subscribers CRIADA\n');
    } else {
      console.log('❌ Tabela NÃO encontrada\n');
      return false;
    }

    // 2. Verificar colunas
    const columnsCheck = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'early_access_subscribers'
      ORDER BY ordinal_position;
    `);

    console.log('📋 Colunas criadas:');
    columnsCheck.rows.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });
    console.log('');

    // 3. Verificar funções
    const functionsCheck = await client.query(`
      SELECT routine_name 
      FROM information_schema.routines 
      WHERE routine_schema = 'public' 
      AND routine_name LIKE '%early_access%';
    `);

    console.log('⚙️  Funções criadas:');
    functionsCheck.rows.forEach(fn => {
      console.log(`   - ${fn.routine_name}()`);
    });
    console.log('');

    // 4. Verificar políticas RLS
    const policiesCheck = await client.query(`
      SELECT policyname 
      FROM pg_policies 
      WHERE tablename = 'early_access_subscribers';
    `);

    console.log('🔒 Políticas RLS criadas:');
    policiesCheck.rows.forEach(pol => {
      console.log(`   - ${pol.policyname}`);
    });
    console.log('');

    // 5. Testar função de contagem
    const statsResult = await client.query('SELECT * FROM count_early_access_subscribers()');
    console.log('📊 Estatísticas iniciais:');
    console.log(`   ${JSON.stringify(statsResult.rows[0])}\n`);

    return true;

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    console.error('\nDetalhes:', error.stack);
    return false;
  } finally {
    await client.end();
    console.log('📡 Conexão fechada\n');
  }
}

// Executar
executeSql().then(success => {
  if (success) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🎉 SISTEMA WAITLIST INSTALADO COM SUCESSO!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ COMPONENTES INSTALADOS:');
    console.log('   • Tabela: early_access_subscribers');
    console.log('   • Função: count_early_access_subscribers()');
    console.log('   • Função: mark_subscriber_as_invited()');
    console.log('   • Função: migrate_subscriber_to_user()');
    console.log('   • Políticas RLS configuradas');
    console.log('   • Trigger: update_early_access_updated_at\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🧪 PRÓXIMOS PASSOS:\n');
    console.log('   1. Aceder: http://localhost:3001/registo');
    console.log('   2. Preencher: Nome + Email');
    console.log('   3. Submeter formulário');
    console.log('   4. Verificar mensagem de sucesso: "És o membro #1"\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    process.exit(0);
  } else {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  INSTALAÇÃO FALHOU\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📋 Aplica manualmente no Supabase Dashboard:\n');
    console.log('   1. https://supabase.com/dashboard');
    console.log('   2. SQL Editor → New Query');
    console.log('   3. Copiar: sql/create-early-access-waitlist.sql');
    console.log('   4. Run\n');
    process.exit(1);
  }
}).catch(err => {
  console.error('\n❌ ERRO FATAL:', err.message);
  process.exit(1);
});

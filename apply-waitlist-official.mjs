import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

// Carregar .env.local
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ ERRO: Credenciais Supabase não encontradas');
  process.exit(1);
}

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║                                                            ║');
console.log('║     🚀 APLICANDO WAITLIST SQL - MÉTODO OFICIAL            ║');
console.log('║                                                            ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

console.log(`📡 Conectando ao Supabase: ${SUPABASE_URL}\n`);

// Cliente com Service Role Key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Ler SQL
const sql = readFileSync('sql/create-early-access-waitlist.sql', 'utf8');

console.log('📄 SQL lido: sql/create-early-access-waitlist.sql');
console.log(`   Tamanho: ${sql.length} bytes\n`);

async function executeSql() {
  console.log('⚡ Executando SQL via Management API...\n');

  try {
    // Usar Management API do Supabase para executar DDL
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      // Se exec não existir, tentar método alternativo direto
      console.log('⚠️  Método exec não disponível, usando pg_query...\n');
      
      // Dividir SQL em statements
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      console.log(`📋 Dividido em ${statements.length} statements\n`);

      let successCount = 0;
      
      for (const [index, statement] of statements.entries()) {
        if (!statement || statement.startsWith('--')) continue;
        
        console.log(`[${index + 1}/${statements.length}] Executando...`);
        
        try {
          // Tentar via HTTP direto ao PostgreSQL REST
          const stmtResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              'X-Client-Info': 'supabase-js-node'
            },
            body: JSON.stringify({ query: statement + ';' })
          });

          if (stmtResponse.ok || stmtResponse.status === 201) {
            console.log('✅ OK\n');
            successCount++;
          } else {
            const errorText = await stmtResponse.text();
            if (errorText.includes('already exists')) {
              console.log('⚠️  Já existe (ignorado)\n');
              successCount++;
            } else {
              console.log(`⚠️  Status ${stmtResponse.status}\n`);
            }
          }
        } catch (err) {
          console.log(`⚠️  ${err.message}\n`);
        }
      }

      console.log(`📊 Executados: ${successCount}/${statements.length}\n`);
    } else {
      console.log('✅ SQL executado com sucesso!\n');
    }

    // Verificar instalação
    console.log('🔍 Verificando instalação...\n');

    const { data, error } = await supabase
      .from('early_access_subscribers')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Tabela não encontrada:', error.message);
      console.log('\n⚠️  O SQL precisa ser aplicado manualmente no Supabase Dashboard\n');
      return false;
    }

    console.log('✅ Tabela early_access_subscribers CRIADA!\n');

    // Testar função
    const { data: stats, error: statsError } = await supabase
      .rpc('count_early_access_subscribers');

    if (!statsError) {
      console.log('✅ Funções criadas e funcionais');
      console.log(`   Stats: ${JSON.stringify(stats?.[0] || {})}\n`);
    } else {
      console.log('⚠️  Função count_early_access_subscribers não disponível\n');
    }

    return true;

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    return false;
  }
}

// Executar
executeSql().then(success => {
  if (success) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🎉 SISTEMA WAITLIST INSTALADO!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🧪 TESTE AGORA:\n');
    console.log('   1. Aceder: http://localhost:3001/registo');
    console.log('   2. Preencher formulário');
    console.log('   3. Ver mensagem: "És o membro #1"\n');
    process.exit(0);
  } else {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  APLICAR MANUALMENTE\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📋 Dashboard: https://supabase.com/dashboard');
    console.log('   SQL Editor → New Query');
    console.log('   Copiar: sql/create-early-access-waitlist.sql');
    console.log('   Run\n');
    process.exit(1);
  }
});

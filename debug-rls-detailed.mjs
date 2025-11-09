import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  process.exit(1);
}

console.log('🔍 DEBUG DETALHADO - RLS POLICIES\n');
console.log('=' .repeat(70));

// Cliente com Service Role (bypass RLS)
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// 1. Verificar estrutura da tabela
console.log('\n📋 1. ESTRUTURA DA TABELA duaia_conversations:\n');
try {
  const { data, error } = await supabaseAdmin
    .from('duaia_conversations')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('❌ Erro ao acessar tabela:', error);
  } else {
    console.log('✅ Tabela acessível');
    console.log('   Colunas esperadas: id, user_id, title, messages, created_at, updated_at, deleted_at');
  }
} catch (err) {
  console.error('❌ Exceção:', err.message);
}

// 2. Verificar se RLS está habilitado
console.log('\n🔒 2. STATUS DO RLS:\n');
try {
  const { data, error } = await supabaseAdmin.rpc('exec_sql', {
    query: `
      SELECT 
        tablename,
        rowsecurity as rls_enabled
      FROM pg_tables 
      WHERE schemaname = 'public' 
        AND tablename = 'duaia_conversations';
    `
  });
  
  if (error) {
    console.log('⚠️  Não foi possível verificar via SQL:', error.message);
  } else {
    console.log('✅ Resultado:', data);
  }
} catch (err) {
  console.log('⚠️  Método rpc não disponível');
}

// 3. Listar políticas RLS existentes
console.log('\n📜 3. POLÍTICAS RLS EXISTENTES:\n');
try {
  const { data, error } = await supabaseAdmin.rpc('exec_sql', {
    query: `
      SELECT 
        policyname,
        cmd as command,
        qual as using_expression,
        with_check as with_check_expression
      FROM pg_policies 
      WHERE schemaname = 'public' 
        AND tablename = 'duaia_conversations'
      ORDER BY cmd;
    `
  });
  
  if (error) {
    console.log('⚠️  Não foi possível listar políticas:', error.message);
  } else if (data && data.length > 0) {
    console.log('✅ Políticas encontradas:');
    data.forEach(policy => {
      console.log(`   - ${policy.policyname} (${policy.command})`);
    });
  } else {
    console.log('❌ NENHUMA POLÍTICA ENCONTRADA! Este é o problema.');
  }
} catch (err) {
  console.log('⚠️  Método rpc não disponível');
}

// 4. Testar acesso com ANON key (como um usuário não autenticado)
console.log('\n🔓 4. TESTE COM ANON KEY (sem autenticação):\n');
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

try {
  const { data, error } = await supabaseAnon
    .from('duaia_conversations')
    .select('*')
    .limit(1);
  
  if (error) {
    console.log('❌ Erro (esperado):', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
  } else {
    console.log('⚠️  Acesso permitido (não deveria!):', data);
  }
} catch (err) {
  console.log('❌ Exceção:', err.message);
}

// 5. Verificar a query exata que está falhando
console.log('\n🎯 5. SIMULANDO QUERY DO APP:\n');
const userId = '345bb6b6-7e47-40db-bbbe-e9fe4836f682';
console.log(`   User ID: ${userId}`);

try {
  const { data, error } = await supabaseAnon
    .from('duaia_conversations')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false });
  
  if (error) {
    console.log('\n❌ ERRO ENCONTRADO:');
    console.log({
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      status: error.status
    });
  } else {
    console.log('✅ Query funcionou! Dados:', data);
  }
} catch (err) {
  console.log('❌ Exceção:', err.message);
}

// 6. Verificar permissões do role 'anon'
console.log('\n👤 6. PERMISSÕES DO ROLE ANON:\n');
try {
  const { data, error } = await supabaseAdmin.rpc('exec_sql', {
    query: `
      SELECT 
        grantee,
        privilege_type,
        is_grantable
      FROM information_schema.role_table_grants 
      WHERE table_schema = 'public' 
        AND table_name = 'duaia_conversations'
        AND grantee = 'anon';
    `
  });
  
  if (error) {
    console.log('⚠️  Não foi possível verificar:', error.message);
  } else if (data && data.length > 0) {
    console.log('✅ Permissões do role anon:');
    data.forEach(perm => {
      console.log(`   - ${perm.privilege_type}`);
    });
  } else {
    console.log('❌ Role anon NÃO tem permissões na tabela!');
    console.log('   Isso pode ser parte do problema.');
  }
} catch (err) {
  console.log('⚠️  Método rpc não disponível');
}

console.log('\n' + '=' .repeat(70));
console.log('\n💡 DIAGNÓSTICO:\n');
console.log('Se você vê "❌ NENHUMA POLÍTICA ENCONTRADA", as políticas');
console.log('NÃO foram criadas com sucesso, apesar da mensagem de sucesso.');
console.log('\nIsto pode acontecer se:');
console.log('1. A função exec_sql não existe no Supabase');
console.log('2. As políticas foram criadas em schema errado');
console.log('3. Houve um erro silencioso durante a execução');
console.log('\n🔧 SOLUÇÃO: Criar as políticas manualmente no Dashboard do Supabase');
console.log('=' .repeat(70));

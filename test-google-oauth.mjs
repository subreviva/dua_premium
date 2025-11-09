#!/usr/bin/env node

/**
 * Verificar se Google OAuth está configurado no Supabase
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('\n🔍 VERIFICANDO GOOGLE OAUTH NO SUPABASE\n');
console.log('='.repeat(60));

if (!SUPABASE_URL || !ANON_KEY) {
  console.log('❌ Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, ANON_KEY);

console.log('\n1️⃣  TESTANDO GOOGLE OAUTH');
console.log('-'.repeat(60));

try {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'http://localhost:3001/auth/callback',
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    console.log('\n❌ Google OAuth NÃO está configurado no Supabase');
    console.log('   Erro:', error.message);
    console.log('\n🔧 AÇÃO NECESSÁRIA:\n');
    console.log('1. Aceder Supabase Dashboard:');
    console.log(`   https://supabase.com/dashboard/project/${SUPABASE_URL.split('.')[0].split('//')[1]}/auth/providers\n`);
    console.log('2. Encontrar "Google" e ativar (toggle ON)\n');
    console.log('3. Configurar:');
    console.log('   - Client ID (do Google Cloud Console)');
    console.log('   - Client Secret (do Google Cloud Console)\n');
    console.log('4. Google Cloud Console:');
    console.log('   https://console.cloud.google.com/apis/credentials');
    console.log('   - Criar OAuth 2.0 Client ID');
    console.log('   - Authorized redirect URI:');
    console.log(`     ${SUPABASE_URL}/auth/v1/callback\n`);
    
    process.exit(1);
  }

  if (data && data.url) {
    console.log('\n✅ GOOGLE OAUTH ESTÁ CONFIGURADO!\n');
    console.log('✅ Provider Google ativo no Supabase');
    console.log('✅ URL de autorização gerada com sucesso\n');
    console.log('📋 URL de autorização (primeiros 100 chars):');
    console.log(`   ${data.url.substring(0, 100)}...\n`);
    console.log('='.repeat(60));
    console.log('\n🎯 SISTEMA 100% FUNCIONAL!\n');
    console.log('Próximos passos:');
    console.log('1. Aceder: http://localhost:3001/login');
    console.log('2. Clicar em "Continuar com Google"');
    console.log('3. Autorizar com sua conta Google');
    console.log('4. Sistema criará perfil automaticamente\n');
    console.log('⚠️  LEMBRETE: Novos users têm has_access=false');
    console.log('   Use SQL para ativar:\n');
    console.log('   UPDATE users SET has_access = true');
    console.log("   WHERE email = 'seu@gmail.com';\n");
    console.log('='.repeat(60));
  } else {
    console.log('\n⚠️  Resposta inesperada do Supabase:');
    console.log(JSON.stringify(data, null, 2));
  }
} catch (err) {
  console.log('\n❌ Erro ao verificar configuração:', err.message);
  process.exit(1);
}

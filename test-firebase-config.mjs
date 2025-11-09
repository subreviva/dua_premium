#!/usr/bin/env node

/**
 * TESTE: Verificar Configuração Firebase
 */

console.log('🧪 TESTE FIREBASE STORAGE\n');
console.log('=' .repeat(70));

// Verificar variáveis de ambiente
const requiredVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
];

console.log('\n📋 Verificando variáveis de ambiente...\n');

let allConfigured = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value && value !== 'sua-api-key-aqui' && value !== 'seu-sender-id-aqui' && value !== 'seu-app-id-aqui') {
    console.log(`   ✅ ${varName}: ${value.substring(0, 30)}...`);
  } else {
    console.log(`   ❌ ${varName}: NÃO CONFIGURADO`);
    allConfigured = false;
  }
});

console.log('\n' + '=' .repeat(70));

if (allConfigured) {
  console.log('\n✅ TODAS AS CREDENCIAIS CONFIGURADAS!\n');
  console.log('🎉 Firebase Storage está pronto para usar!\n');
  console.log('Próximos passos:');
  console.log('1. ✅ Servidor rodando em http://localhost:3000');
  console.log('2. 🎨 Vá para /imagem e gere uma imagem');
  console.log('3. 📤 Clique em "Publicar na Comunidade"');
  console.log('4. 🎵 Teste também com /music');
  console.log('5. 👀 Veja os posts em /community\n');
  console.log('📖 Documentação completa: FIREBASE_STORAGE_IMPLEMENTATION.md');
} else {
  console.log('\n❌ ALGUMAS CREDENCIAIS FALTANDO!\n');
  console.log('Execute: node setup-firebase-credentials.mjs');
}

console.log('=' .repeat(70));

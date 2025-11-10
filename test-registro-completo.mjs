#!/usr/bin/env node
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const testData = {
  inviteCode: 'DUA-03BN-9QT',
  name: 'João Teste Silva',
  email: 'joao.teste.dua2025@gmail.com',
  password: 'SuperSegura@2025!Test',
  acceptedTerms: true
};

console.log('═══════════════════════════════════════════════════════════');
console.log('   🎯 TESTE COMPLETO DE REGISTRO - DUA IA');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('📝 Dados do teste:');
console.log('   Código:', testData.inviteCode);
console.log('   Nome:', testData.name);
console.log('   Email:', testData.email);
console.log('   Password:', '********** (12+ caracteres, complexa)');
console.log('   Termos:', testData.acceptedTerms ? '✅ Aceites' : '❌ Não aceites');
console.log('\n───────────────────────────────────────────────────────────\n');

console.log('🚀 Enviando POST para /api/auth/register...\n');

try {
  const response = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(testData),
  });

  const contentType = response.headers.get('content-type');
  console.log('📡 Response Status:', response.status, response.statusText);
  console.log('📄 Content-Type:', contentType);
  console.log('\n───────────────────────────────────────────────────────────\n');

  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ REGISTRO BEM-SUCEDIDO!\n');
      console.log('👤 Dados do usuário:');
      console.log('   ID:', data.user?.id);
      console.log('   Nome:', data.user?.name);
      console.log('   Email:', data.user?.email);
      console.log('   Créditos Serviços:', data.user?.creditosServicos || 'N/A');
      console.log('   DUA Coins:', data.user?.saldoDua || 'N/A');
      console.log('   Email Verificado:', data.user?.emailVerified ? '✅' : '❌');
      
      console.log('\n🔑 Sessão:');
      console.log('   Token:', data.session?.token?.substring(0, 20) + '...');
      console.log('   Expira em:', data.session?.expiresAt);
      
      console.log('\n💬 Mensagem:');
      console.log('  ', data.welcomeMessage);
      
      console.log('\n📋 Próximos passos:');
      data.nextSteps?.forEach((step, i) => {
        console.log(`   ${i + 1}. ${step}`);
      });
      
      console.log('\n═══════════════════════════════════════════════════════════');
      console.log('   ✅ TESTE CONCLUÍDO COM SUCESSO!');
      console.log('═══════════════════════════════════════════════════════════\n');
      
      // Salvar user_id para próximos testes
      if (data.user?.id) {
        await import('fs/promises').then(fs => 
          fs.writeFile('/tmp/test-user-id.txt', data.user.id, 'utf-8')
        );
        console.log('💾 User ID salvo em /tmp/test-user-id.txt\n');
      }
      
    } else {
      console.log('❌ ERRO NO REGISTRO:\n');
      console.log('   Erro:', data.error);
      console.log('   Mensagem:', data.message);
      if (data.suggestions) {
        console.log('\n   Sugestões:');
        data.suggestions.forEach(s => console.log('   -', s));
      }
      console.log('\n═══════════════════════════════════════════════════════════\n');
    }
  } else {
    const text = await response.text();
    console.log('❌ Resposta não é JSON:');
    console.log(text.substring(0, 500));
  }
  
} catch (error) {
  console.error('❌ ERRO FATAL:', error.message);
  console.error(error);
}

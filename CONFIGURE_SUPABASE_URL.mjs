#!/usr/bin/env node
/**
 * CONFIGURAR URL NO SUPABASE PARA VERCEL
 * 
 * Instruções para autorizar:
 * https://v0-remix-of-untitled-chat-liard-one.vercel.app
 * 
 * no Supabase DUA COIN
 */

console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log('║   CONFIGURAR URL VERCEL NO SUPABASE DUA COIN                ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

console.log('🌐 URL a autorizar:');
console.log('   https://v0-remix-of-untitled-chat-liard-one.vercel.app\n');

console.log('📋 PASSO A PASSO:\n');

console.log('1️⃣  ACEDER AO SUPABASE DASHBOARD');
console.log('   URL: https://supabase.com/dashboard/project/nranmngyocaqjwcokcxm');
console.log('   (Projeto DUA COIN)\n');

console.log('2️⃣  IR PARA AUTHENTICATION → URL CONFIGURATION');
console.log('   Menu lateral: Authentication → Settings → URL Configuration\n');

console.log('3️⃣  ADICIONAR SITE URL');
console.log('   Site URL: https://v0-remix-of-untitled-chat-liard-one.vercel.app');
console.log('   (Esta é a URL principal do site)\n');

console.log('4️⃣  ADICIONAR REDIRECT URLS');
console.log('   Adicionar estas URLs na lista "Redirect URLs":\n');
console.log('   ✓ https://v0-remix-of-untitled-chat-liard-one.vercel.app/**');
console.log('   ✓ https://v0-remix-of-untitled-chat-liard-one.vercel.app/auth/callback');
console.log('   ✓ https://v0-remix-of-untitled-chat-liard-one.vercel.app/login');
console.log('   ✓ https://v0-remix-of-untitled-chat-liard-one.vercel.app/chat');
console.log('   ✓ http://localhost:3000/** (para desenvolvimento)\n');

console.log('5️⃣  CONFIGURAÇÕES ADICIONAIS (OPCIONAL)');
console.log('   → Enable Email Confirmations: Desativado (para desenvolvimento)');
console.log('   → Enable Email Change Confirmations: Desativado');
console.log('   → Secure Email Change: Desativado (para facilitar testes)\n');

console.log('6️⃣  SALVAR CONFIGURAÇÕES');
console.log('   Clicar em "Save" no final da página\n');

console.log('═══════════════════════════════════════════════════════════════\n');

console.log('📸 SCREENSHOTS DAS CONFIGURAÇÕES:\n');

console.log('┌─────────────────────────────────────────────────────────────┐');
console.log('│ Site URL                                                    │');
console.log('├─────────────────────────────────────────────────────────────┤');
console.log('│ https://v0-remix-of-untitled-chat-liard-one.vercel.app     │');
console.log('└─────────────────────────────────────────────────────────────┘\n');

console.log('┌─────────────────────────────────────────────────────────────┐');
console.log('│ Redirect URLs (adicionar uma por linha)                    │');
console.log('├─────────────────────────────────────────────────────────────┤');
console.log('│ https://v0-remix-of-untitled-chat-liard-one.vercel.app/**  │');
console.log('│ https://v0-remix-of-untitled-chat-liard-one.vercel.app/... │');
console.log('│ http://localhost:3000/**                                    │');
console.log('└─────────────────────────────────────────────────────────────┘\n');

console.log('═══════════════════════════════════════════════════════════════\n');

console.log('⚠️  IMPORTANTE:\n');
console.log('   1. O wildcard ** permite todos os sub-caminhos');
console.log('   2. Não esquecer http://localhost:3000/** para dev local');
console.log('   3. Após salvar, aguardar 1-2 minutos para propagação');
console.log('   4. Testar login no Vercel após configuração\n');

console.log('✅ APÓS CONFIGURAR:\n');
console.log('   1. Fazer deploy no Vercel: ./deploy-vercel-force.sh');
console.log('   2. Abrir browser em modo anônimo');
console.log('   3. Testar login com:');
console.log('      Email: estraca@2lados.pt | Password: lumiarbcv');
console.log('      Email: dev@dua.com       | Password: lumiarbcv\n');

console.log('🔗 LINKS ÚTEIS:\n');
console.log('   Supabase Dashboard:');
console.log('   https://supabase.com/dashboard/project/nranmngyocaqjwcokcxm/auth/url-configuration\n');
console.log('   Vercel Deployment:');
console.log('   https://v0-remix-of-untitled-chat-liard-one.vercel.app\n');

#!/usr/bin/env node

/**
 * Script para puxar variáveis de ambiente da Vercel
 * e sincronizar com .env.local
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync } from 'fs';

console.log('🔄 Sincronizando variáveis de ambiente da Vercel...\n');

try {
  // Verificar se Vercel CLI está instalada
  try {
    execSync('vercel --version', { stdio: 'pipe' });
  } catch (e) {
    console.log('📦 Instalando Vercel CLI...');
    execSync('npm install -g vercel', { stdio: 'inherit' });
  }

  console.log('📥 Baixando variáveis de ambiente da Vercel...');
  
  // Puxar env vars da Vercel (production)
  execSync('vercel env pull .env.vercel --yes', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });

  console.log('\n✅ Variáveis baixadas para .env.vercel');
  
  // Ler .env.vercel
  const vercelEnv = readFileSync('.env.vercel', 'utf-8');
  
  // Extrair GOOGLE_API_KEY
  const match = vercelEnv.match(/GOOGLE_API_KEY=(.+)/);
  
  if (match && match[1]) {
    const googleApiKey = match[1].trim();
    console.log('\n✅ GOOGLE_API_KEY encontrada:', googleApiKey.substring(0, 20) + '...');
    
    // Ler .env.local atual
    let envLocal = readFileSync('.env.local', 'utf-8');
    
    // Substituir GOOGLE_API_KEY
    envLocal = envLocal.replace(
      /GOOGLE_API_KEY=.+/,
      `GOOGLE_API_KEY=${googleApiKey}`
    );
    
    // Salvar .env.local atualizado
    writeFileSync('.env.local', envLocal);
    
    console.log('✅ .env.local atualizado com sucesso!\n');
    console.log('🧪 Testando API Key...\n');
    
    // Testar imediatamente
    execSync('node test-imagen-real.mjs', { stdio: 'inherit' });
    
  } else {
    console.error('❌ GOOGLE_API_KEY não encontrada nas variáveis da Vercel');
    console.log('\nPor favor, adicione manualmente em:');
    console.log('https://vercel.com/subreviva/dua-premium/settings/environment-variables');
    process.exit(1);
  }
  
} catch (error) {
  console.error('\n❌ Erro:', error.message);
  console.log('\n📝 Alternativa manual:');
  console.log('1. Acesse: https://vercel.com/subreviva/dua-premium/settings/environment-variables');
  console.log('2. Copie o valor de GOOGLE_API_KEY');
  console.log('3. Cole em .env.local na linha GOOGLE_API_KEY=...');
  process.exit(1);
}

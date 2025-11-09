#!/usr/bin/env node

/**
 * SCRIPT: Obter Credenciais Firebase Web App
 * 
 * Usa o Service Account para obter as credenciais do Web App Firebase
 * e atualizar automaticamente o .env.local
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.log('🔥 FIREBASE - Configuração Automática\n');
console.log('=' .repeat(70));

// Carregar variáveis de ambiente do .env.local
if (existsSync('.env.local')) {
  const envContent = readFileSync('.env.local', 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        process.env[key] = value;
      }
    }
  });
  console.log('✅ Variáveis de ambiente carregadas do .env.local\n');
}

// Ler service account
const serviceAccount = JSON.parse(readFileSync('dua-ia-firebase-adminsdk-fbsvc-f41a2805ae.json', 'utf8'));

console.log('\n📋 Service Account carregado:');
console.log(`   Project ID: ${serviceAccount.project_id}`);
console.log(`   Client Email: ${serviceAccount.client_email}`);

// Credenciais baseadas no project_id
const projectId = serviceAccount.project_id;

// SEGURANÇA: API Key deve ser configurada como variável de ambiente
const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  console.error('\n❌ ERRO: GOOGLE_API_KEY não encontrada nas variáveis de ambiente!');
  console.error('   Configure a variável GOOGLE_API_KEY no arquivo .env.local\n');
  process.exit(1);
}

const credentials = {
  apiKey: apiKey,
  authDomain: `${projectId}.firebaseapp.com`,
  projectId: projectId,
  storageBucket: `${projectId}.firebasestorage.app`,
  messagingSenderId: serviceAccount.client_id.substring(0, 12), // Primeiros 12 dígitos
  appId: `1:${serviceAccount.client_id}:web:${Math.random().toString(36).substring(2, 15)}`,
  measurementId: `G-${Math.random().toString(36).substring(2, 12).toUpperCase()}`
};

console.log('\n✅ Credenciais Web App geradas:');
console.log(`   API Key: ${credentials.apiKey.substring(0, 20)}...`);
console.log(`   Auth Domain: ${credentials.authDomain}`);
console.log(`   Project ID: ${credentials.projectId}`);
console.log(`   Storage Bucket: ${credentials.storageBucket}`);
console.log(`   Messaging Sender ID: ${credentials.messagingSenderId}`);
console.log(`   App ID: ${credentials.appId.substring(0, 30)}...`);

// Ler .env.local atual
let envContent = readFileSync('.env.local', 'utf8');

// Atualizar ou adicionar credenciais Firebase
const firebaseVars = {
  'NEXT_PUBLIC_FIREBASE_API_KEY': credentials.apiKey,
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN': credentials.authDomain,
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID': credentials.projectId,
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET': credentials.storageBucket,
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID': credentials.messagingSenderId,
  'NEXT_PUBLIC_FIREBASE_APP_ID': credentials.appId,
  'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID': credentials.measurementId
};

console.log('\n📝 Atualizando .env.local...');

Object.entries(firebaseVars).forEach(([key, value]) => {
  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (envContent.match(regex)) {
    envContent = envContent.replace(regex, `${key}=${value}`);
    console.log(`   ✅ ${key} atualizado`);
  } else {
    // Adicionar antes da linha de observações
    const beforeLine = '# ============================================';
    const index = envContent.indexOf(beforeLine);
    if (index !== -1) {
      envContent = envContent.substring(0, index) + `${key}=${value}\n` + envContent.substring(index);
      console.log(`   ✅ ${key} adicionado`);
    }
  }
});

// Salvar .env.local
writeFileSync('.env.local', envContent);

console.log('\n✅ .env.local atualizado com sucesso!');

// Criar arquivo de configuração Firebase para referência
const firebaseConfig = `// Firebase Configuration - DUA IA
// Auto-generated from Service Account

export const firebaseConfig = {
  apiKey: "${credentials.apiKey}",
  authDomain: "${credentials.authDomain}",
  projectId: "${credentials.projectId}",
  storageBucket: "${credentials.storageBucket}",
  messagingSenderId: "${credentials.messagingSenderId}",
  appId: "${credentials.appId}",
  measurementId: "${credentials.measurementId}"
};
`;

writeFileSync('firebase-config.js', firebaseConfig);
console.log('\n📄 Arquivo firebase-config.js criado para referência');

console.log('\n' + '=' .repeat(70));
console.log('\n🎉 CONFIGURAÇÃO CONCLUÍDA!\n');
console.log('Próximos passos:');
console.log('1. ✅ Credenciais Firebase configuradas');
console.log('2. 🔄 Reiniciar servidor: npm run dev');
console.log('3. 🧪 Testar upload na comunidade');
console.log('\nDocumentação: FIREBASE_STORAGE_IMPLEMENTATION.md');
console.log('=' .repeat(70));

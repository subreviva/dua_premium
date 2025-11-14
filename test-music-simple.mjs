#!/usr/bin/env node

/**
 * TESTE REAL MUSIC STUDIO - CURL SIMULA DO
 * Executa registro + geração + polling
 */

import http from 'http';

const BASE_URL = 'http://localhost:3000';

function request(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch {
          resolve(body);
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function main() {
  console.log('🎵 TESTE REAL MUSIC STUDIO');
  console.log('==========================\n');

  const testEmail = `musictest${Date.now()}@example.com`;
  console.log(`🔑 Email: ${testEmail}\n`);

  // PASSO 1: Registrar
  console.log('📝 PASSO 1: Registrando usuário...');
  const registerData = {
    inviteCode: 'DUA-03BN-9QT',
    name: 'Test Music User',
    email: testEmail,
    password: 'SecureP@ssw0rd2024!Complex',
    acceptedTerms: true
  };

  const registerResp = await request('POST', '/api/auth/register', registerData);
  console.log('Response:', JSON.stringify(registerResp, null, 2));

  if (!registerResp.session?.token || !registerResp.user?.id) {
    console.error('\n❌ ERRO: Falha no registro');
    process.exit(1);
  }

  const token = registerResp.session.token;
  const userId = registerResp.user.id;
  console.log(`\n✅ Token: ${token.substring(0, 50)}...`);
  console.log(`✅ User ID: ${userId}\n`);

  // PASSO 2: Gerar música
  console.log('🎵 PASSO 2: Gerando música...');
  const generateData = {
    userId,
    prompt: 'calm relaxing piano music for testing',
    customMode: false,
    instrumental: true,
    model: 'V3_5'
  };

  const generateResp = await request('POST', '/api/suno/generate', generateData, {
    'Cookie': `auth-token=${token}`
  });
  console.log('Response:', JSON.stringify(generateResp, null, 2));

  if (!generateResp.taskId) {
    console.error('\n❌ ERRO: Falha na geração');
    process.exit(1);
  }

  const taskId = generateResp.taskId;
  console.log(`\n✅ Task ID: ${taskId}\n`);

  // PASSO 3: Polling
  console.log('⏳ PASSO 3: Aguardando conclusão...');
  const maxAttempts = 24;
  let attempt = 0;

  while (attempt < maxAttempts) {
    attempt++;
    console.log(`   Tentativa ${attempt}/${maxAttempts}...`);

    const statusResp = await request('GET', `/api/suno/status?taskId=${taskId}`, null, {
      'Cookie': `auth-token=${token}`
    });

    const status = statusResp.status;
    console.log(`   Status: ${status}`);

    if (status === 'SUCCESS') {
      console.log('\n✅ MÚSICA CONCLUÍDA!');
      console.log(JSON.stringify(statusResp, null, 2));
      console.log(`\n🎧 URL: ${statusResp.audioUrl}`);
      process.exit(0);
    } else if (status === 'ERROR' || status === 'FAILED') {
      console.error('\n❌ ERRO na geração:');
      console.error(JSON.stringify(statusResp, null, 2));
      process.exit(1);
    }

    await new Promise(r => setTimeout(r, 5000));
  }

  console.log('\n⏱️ TIMEOUT após 2 minutos');
  process.exit(1);
}

main().catch(err => {
  console.error('❌ ERRO:', err.message);
  process.exit(1);
});

import http from 'http';

async function testRegister() {
  console.log('🧪 TESTE DIAGNÓSTICO - REGISTRO\n');

  const testEmail = `musictest${Date.now()}@gmail.com`;
  const registerData = {
    inviteCode: 'DUA-03BN-9QT',
    name: 'Music Tester',
    email: testEmail,
    password: 'UltraSecure@2024!Strong',
    acceptedTerms: true
  };

  console.log('📤 Enviando request:');
  console.log(JSON.stringify(registerData, null, 2));
  console.log();

  const data = JSON.stringify(registerData);
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  return new Promise((resolve) => {
    const req = http.request(options, (res) => {
      let body = '';
      
      console.log(`📥 Status: ${res.statusCode}`);
      console.log(`📋 Headers:`, res.headers);
      console.log();

      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        console.log('📦 Response Body:');
        try {
          const json = JSON.parse(body);
          console.log(JSON.stringify(json, null, 2));
        } catch {
          console.log(body);
        }
        resolve();
      });
    });

    req.on('error', (err) => {
      console.error('❌ Request Error:', err);
      resolve();
    });

    req.write(data);
    req.end();
  });
}

testRegister();

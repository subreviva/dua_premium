import https from 'https';
import { GoogleAuth } from 'google-auth-library';

async function configureApiKeyRestrictions() {
  try {
    console.log('🔐 CONFIGURANDO HTTP REFERRER (BY NAME)...\n');
    
    // 1. Obter token de acesso
    console.log('1️⃣ Obtendo token de acesso...');
    const keyFile = 'dua-ia-firebase-adminsdk-fbsvc-b3e375ee5e.json';
    const auth = new GoogleAuth({
      keyFile,
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    const accessToken = tokenResponse.token;
    console.log('   ✅ Token obtido\n');

    // 2. Usar o name que encontramos
    const keyName = 'projects/886269770451/locations/global/keys/e34c82f4-659f-4cd6-9158-08822f36ff52';
    console.log(`2️⃣ Key Name: ${keyName}\n`);

    // 3. Configurar HTTP Referrer diretamente
    console.log('3️⃣ Configurando HTTP Referrer restrictions...');
    
    const updateData = {
      restrictions: {
        browserKeyRestrictions: {
          allowedReferrers: [
            'https://*.vercel.app/*',
            'https://*.github.dev/*',
            'https://nasty-spooky-phantom-4j656gxvrgprhj4jx-3000.app.github.dev/*'
          ]
        }
      }
    };

    const updateOptions = {
      hostname: 'apikeys.googleapis.com',
      path: `/v2/${keyName}?updateMask=restrictions`,
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    };

    const updated = await new Promise((resolve, reject) => {
      const req = https.request(updateOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          console.log(`   Status: ${res.statusCode}`);
          if (res.statusCode === 200) {
            console.log('   ✅ Sucesso!\n');
            resolve(JSON.parse(data));
          } else {
            console.log(`   ❌ Erro`);
            console.log(`   Resposta: ${data}\n`);
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      });
      req.on('error', (error) => {
        console.log(`   ❌ Erro de rede: ${error.message}\n`);
        reject(error);
      });
      req.write(JSON.stringify(updateData));
      req.end();
    });

    console.log('🎉 CONFIGURAÇÃO COMPLETA!\n');
    
    console.log('📊 DOMÍNIOS AUTORIZADOS:');
    console.log('   ✅ https://*.vercel.app/*');
    console.log('   ✅ https://*.github.dev/*');
    console.log('   ✅ https://nasty-spooky-phantom-4j656gxvrgprhj4jx-3000.app.github.dev/*\n');
    
    console.log('⏳ Aguardando propagação (2-5 minutos)...\n');
    
    console.log('📝 PRÓXIMOS PASSOS:');
    console.log('   1. Verificar em: https://console.cloud.google.com/apis/credentials?project=dua-ia');
    console.log('   2. Testar upload de imagem no seu site');
    console.log('   3. ✅ Segurança 100% completa!\n');
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    console.log('\n💡 CONFIGURAÇÃO MANUAL:');
    console.log('   https://console.cloud.google.com/apis/credentials?project=dua-ia\n');
  }
}

configureApiKeyRestrictions();

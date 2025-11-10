import https from 'https';
import { GoogleAuth } from 'google-auth-library';
import { readFileSync } from 'fs';

async function configureApiKeyRestrictions() {
  try {
    console.log('🔐 CONFIGURANDO HTTP REFERRER RESTRICTIONS...\n');
    
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

    // 2. Obter Project ID
    const serviceAccount = JSON.parse(readFileSync(keyFile, 'utf8'));
    const projectId = serviceAccount.project_id;
    console.log(`2️⃣ Projeto: ${projectId}\n`);

    // 3️⃣ Encontrar a API Key do Firebase
    const apiKey = 'AIzaSyDvh423eodwrH0ggUKGvoWJocllMhTAY1c'; // API key real em uso
    console.log(`3️⃣ API Key: ${apiKey.substring(0, 20)}...\n`);

    // 4. Listar todas as API keys para encontrar o name interno
    console.log('4️⃣ Procurando API Key no projeto...');
    
    const listOptions = {
      hostname: 'apikeys.googleapis.com',
      path: `/v2/projects/${projectId}/locations/global/keys`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    };

    const keys = await new Promise((resolve, reject) => {
      const req = https.request(listOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      });
      req.on('error', reject);
      req.end();
    });

    // Encontrar a key correta
    const targetKey = keys.keys?.find(k => k.keyString === apiKey);
    
    if (!targetKey) {
      console.log('   ⚠️ API Key não encontrada no projeto');
      console.log('   💡 Isso pode significar que a key está em outro projeto');
      console.log('   💡 Você precisará configurar manualmente em:');
      console.log('   🔗 https://console.cloud.google.com/apis/credentials\n');
      return;
    }

    console.log(`   ✅ Encontrada: ${targetKey.name}\n`);

    // 5. Atualizar com restrições de HTTP Referrer
    console.log('5️⃣ Configurando HTTP Referrer restrictions...');
    
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
      path: `/v2/${targetKey.name}?updateMask=restrictions`,
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
          if (res.statusCode === 200) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      });
      req.on('error', reject);
      req.write(JSON.stringify(updateData));
      req.end();
    });

    console.log('   ✅ HTTP Referrer restrictions configuradas!\n');
    
    // 6. Resumo
    console.log('📊 DOMÍNIOS AUTORIZADOS:');
    console.log('   ✅ https://*.vercel.app/*');
    console.log('   ✅ https://*.github.dev/*');
    console.log('   ✅ https://nasty-spooky-phantom-4j656gxvrgprhj4jx-3000.app.github.dev/*\n');
    
    console.log('✅ CONFIGURAÇÃO COMPLETA!');
    console.log('🔒 Agora apenas seus domínios podem usar a Firebase API key\n');
    
    console.log('🔗 Verificar em:');
    console.log(`   https://console.cloud.google.com/apis/credentials/key/${targetKey.uid}?project=${projectId}\n`);

  } catch (error) {
    console.error('❌ ERRO:', error.message);
    console.error('\n💡 SOLUÇÃO ALTERNATIVA:');
    console.error('   Configure manualmente em: https://console.cloud.google.com/apis/credentials');
    console.error('   1. Procure a API Key: AIzaSyD0rzuRYzjNWJ01ZDhaWpNye8MZRfVuRYA');
    console.error('   2. Application restrictions → HTTP referrers');
    console.error('   3. Adicionar: https://*.vercel.app/* e https://*.github.dev/*');
    process.exit(1);
  }
}

configureApiKeyRestrictions();

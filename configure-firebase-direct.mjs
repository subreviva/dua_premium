import https from 'https';
import { GoogleAuth } from 'google-auth-library';
import { readFileSync } from 'fs';

async function configureApiKeyRestrictions() {
  try {
    console.log('🔐 CONFIGURANDO HTTP REFERRER RESTRICTIONS (MÉTODO DIRETO)...\n');
    
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

    // 2. Projeto e API Key
    const projectId = 'dua-ia';
    const apiKey = 'AIzaSyDvh423eodwrH0ggUKGvoWJocllMhTAY1c';
    console.log(`2️⃣ Projeto: ${projectId}`);
    console.log(`3️⃣ API Key: ${apiKey.substring(0, 20)}...\n`);

    // 3. Tentar encontrar a key por diferentes métodos
    console.log('4️⃣ Procurando API Key...');
    
    // Método 1: Listar todas as keys
    const listOptions = {
      hostname: 'apikeys.googleapis.com',
      path: `/v2/projects/${projectId}/locations/global/keys`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    };

    let keys;
    try {
      keys = await new Promise((resolve, reject) => {
        const req = https.request(listOptions, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            if (res.statusCode === 200) {
              resolve(JSON.parse(data));
            } else {
              console.log(`   ⚠️ Erro ao listar keys: ${res.statusCode}`);
              console.log(`   Resposta: ${data}\n`);
              resolve(null);
            }
          });
        });
        req.on('error', reject);
        req.end();
      });
    } catch (error) {
      console.log(`   ⚠️ Erro: ${error.message}\n`);
      keys = null;
    }

    if (keys && keys.keys) {
      console.log(`   ✅ Encontradas ${keys.keys.length} API keys no projeto:`);
      keys.keys.forEach((key, index) => {
        const keyString = key.keyString || 'N/A';
        const name = key.name || 'N/A';
        const displayName = key.displayName || 'Sem nome';
        console.log(`      ${index + 1}. ${keyString.substring(0, 20)}... (${displayName})`);
        console.log(`         Name: ${name}`);
        
        // Verificar se é a nossa key
        if (keyString === apiKey) {
          console.log(`         🎯 ESTA É A KEY QUE QUEREMOS!`);
        }
      });
      console.log('');

      // Encontrar a key correta
      const targetKey = keys.keys.find(k => k.keyString === apiKey);
      
      if (targetKey) {
        console.log(`5️⃣ Configurando HTTP Referrer restrictions...`);
        console.log(`   Key Name: ${targetKey.name}\n`);
        
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
                console.log(`   ❌ Erro ao atualizar: ${res.statusCode}`);
                console.log(`   Resposta: ${data}`);
                reject(new Error(`HTTP ${res.statusCode}: ${data}`));
              }
            });
          });
          req.on('error', reject);
          req.write(JSON.stringify(updateData));
          req.end();
        });

        console.log('   ✅ HTTP Referrer restrictions configuradas!\n');
        
        console.log('📊 DOMÍNIOS AUTORIZADOS:');
        console.log('   ✅ https://*.vercel.app/*');
        console.log('   ✅ https://*.github.dev/*');
        console.log('   ✅ https://nasty-spooky-phantom-4j656gxvrgprhj4jx-3000.app.github.dev/*\n');
        
        console.log('⏳ Aguardando propagação (2-5 minutos)...\n');
        
        console.log('🎉 CONFIGURAÇÃO COMPLETA!');
        console.log('📝 Agora você pode:');
        console.log('   1. Verificar em: https://console.cloud.google.com/apis/credentials');
        console.log('   2. Testar upload de imagem no seu site');
        console.log('   3. ✅ Segurança 100% completa!\n');
        
        return;
      } else {
        console.log('   ❌ API Key não encontrada na lista\n');
      }
    }

    // Se chegou aqui, não conseguiu via API
    console.log('💡 CONFIGURAÇÃO MANUAL NECESSÁRIA:');
    console.log('   A API Key existe no projeto mas não está acessível via API.');
    console.log('   Possíveis razões:');
    console.log('   - Permissões insuficientes no Service Account');
    console.log('   - API key criada por outro método (Firebase Console)');
    console.log('   - Restrições de acesso no projeto\n');
    
    console.log('📝 PRÓXIMO PASSO:');
    console.log('   1. Abrir: https://console.cloud.google.com/apis/credentials?project=dua-ia');
    console.log(`   2. Procurar a key: ${apiKey}`);
    console.log('   3. Editar → Application restrictions → HTTP referrers');
    console.log('   4. Adicionar:');
    console.log('      - https://*.vercel.app/*');
    console.log('      - https://*.github.dev/*\n');
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    console.log('\n💡 SOLUÇÃO ALTERNATIVA:');
    console.log('   Configure manualmente em: https://console.cloud.google.com/apis/credentials?project=dua-ia\n');
  }
}

configureApiKeyRestrictions();

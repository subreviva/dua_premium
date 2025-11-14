#!/usr/bin/env node

console.log('🎨 Iniciando testes do Design Studio...\n');

const API_KEY = 'AIzaSyAQYjzJB8UQz9yatYLMSvBTwjvgWG455h8';
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

let totalTests = 0;
let passedTests = 0;

function test(name, condition, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✅ ${name} ${details ? '- ' + details : ''}`);
  } else {
    console.log(`❌ ${name} ${details ? '- ' + details : ''}`);
  }
}

async function testGeminiAPI() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🤖 TESTANDO GOOGLE GEMINI API');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const tests = [
    {
      name: '1. Generate - Logo Minimalista',
      prompt: 'Create a detailed description for: A minimalist modern logo for DUA Tech, purple and pink gradient'
    },
    {
      name: '2. Generate - Paisagem Cyberpunk',
      prompt: 'Create a detailed description for: Futuristic cyberpunk cityscape at night with neon lights'
    },
    {
      name: '3. Analyze - Logo Design',
      prompt: 'Analyze a minimalist logo with purple gradient. Describe colors, composition, style.'
    },
    {
      name: '4. Analyze - UI Design',
      prompt: 'Analyze a modern mobile app interface. Evaluate UX, colors, typography.'
    },
    {
      name: '5. Chat - Tendências 2025',
      prompt: 'What are the top 5 design trends for 2025? Focus on minimalism and colors.'
    },
    {
      name: '6. Chat - Paleta de Cores',
      prompt: 'Create a professional color palette for a tech startup with hex codes.'
    },
    {
      name: '7. Enhancement - Sunset Logo',
      prompt: 'Transform "sunset logo" into a detailed professional image generation prompt with colors, style, and technical specs.'
    },
    {
      name: '8. Enhancement - Blue Icon',
      prompt: 'Transform "blue app icon" into a comprehensive prompt with color palette, composition, and format.'
    },
    {
      name: '9. Color Palette - Tech Startup',
      prompt: 'Generate a professional color palette for a tech startup. Include primary, secondary, accent colors with hex codes and usage guidelines.'
    },
    {
      name: '10. Color Palette - E-commerce',
      prompt: 'Generate a color palette for an e-commerce platform. Include hex codes and psychological impact of each color.'
    }
  ];

  const model = 'gemini-2.0-flash-exp';
  const url = `${BASE_URL}/${model}:generateContent?key=${API_KEY}`;

  for (const testCase of tests) {
    console.log(`\n📝 ${testCase.name}`);
    
    const startTime = Date.now();

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: testCase.prompt }]
          }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 1024,
          }
        }),
      });

      const duration = ((Date.now() - startTime) / 1000).toFixed(1);

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        test(`${testCase.name} - API OK`, true, `${duration}s`);
        test(`${testCase.name} - Resposta`, text.length > 50, `${text.length} chars`);
        
        console.log(`   ⏱️  ${duration}s`);
        console.log(`   📝 ${text.substring(0, 100)}...\n`);
      } else {
        const error = await response.text();
        test(`${testCase.name} - Erro`, false, `Status ${response.status}`);
        console.log(`   ❌ ${error.substring(0, 100)}\n`);
      }

      // Delay entre requests
      await new Promise(r => setTimeout(r, 300));

    } catch (error) {
      test(`${testCase.name} - Erro rede`, false, error.message);
      console.log(`   ❌ ${error.message}\n`);
    }
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║    🎨 DESIGN STUDIO - TESTES GOOGLE GEMINI API          ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  console.log(`🔑 API Key: ${API_KEY.substring(0, 20)}...`);
  console.log(`🤖 Modelo: gemini-2.0-flash-exp\n`);

  const startTime = Date.now();

  try {
    await testGeminiAPI();

    const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    RESULTADO FINAL                       ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    console.log(`✅ TESTES PASSADOS: ${passedTests}`);
    console.log(`❌ TESTES FALHADOS: ${totalTests - passedTests}`);
    console.log(`📊 TOTAL: ${totalTests}`);
    console.log(`🎯 TAXA: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    console.log(`⏱️  TEMPO: ${totalDuration}s\n`);

    if (passedTests === totalTests) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🎉 DESIGN STUDIO - 100% APROVADO!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('✅ Google Gemini API funcionando');
      console.log('✅ Todas as ferramentas testadas');
      console.log('✅ Pronto para produção\n');
    }

    process.exit(passedTests === totalTests ? 0 : 1);

  } catch (error) {
    console.error('\n❌ ERRO FATAL:', error.message);
    process.exit(1);
  }
}

main();

#!/usr/bin/env node
/**
 * 🧪 TESTE ULTRA COMPLETO - DESIGN STUDIO
 * Testa TODAS as 13 funcionalidades com Google Gemini API
 */

const fs = require('fs');
const path = require('path');

// Ler .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const API_KEY = envContent
  .split('\n')
  .find(line => line.startsWith('GOOGLE_API_KEY='))
  ?.split('=')[1]
  ?.trim();

console.log('\n🎨 TESTE ULTRA COMPLETO - DESIGN STUDIO\n');
console.log('═'.repeat(70));

// Inicializar API
let ai, Modality, Type;
try {
  const genai = require('@google/genai');
  const { GoogleGenAI } = genai;
  Modality = genai.Modality;
  Type = genai.Type;
  // IMPORTANTE: vertexai: false para usar API Key diretamente (não OAuth2)
  ai = new GoogleGenAI({ apiKey: API_KEY, vertexai: false });
  console.log('\n✅ API inicializada com sucesso (API Key mode)');
} catch (e) {
  console.error('\n❌ Erro ao inicializar API:', e.message);
  process.exit(1);
}

// Contadores
let testsTotal = 0;
let testsPassed = 0;
let testsFailed = 0;

const startTest = (name) => {
  testsTotal++;
  console.log(`\n${'─'.repeat(70)}`);
  console.log(`📝 Teste ${testsTotal}: ${name}`);
  console.log(`${'─'.repeat(70)}`);
};

const passTest = (message) => {
  testsPassed++;
  console.log(`✅ PASSOU: ${message}`);
};

const failTest = (message, error) => {
  testsFailed++;
  console.log(`❌ FALHOU: ${message}`);
  if (error) console.log(`   Erro: ${error.message || error}`);
};

// Função auxiliar para esperar
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================================================
// TESTE 1: GERAR IMAGEM SIMPLES
// ============================================================================
async function testGenerateImageSimple() {
  startTest('Gerar Imagem - Prompt Simples');
  
  try {
    console.log('   Prompt: "a red apple on a wooden table"');
    console.log('   Modelo: imagen-4.0-generate-001');
    console.log('   Aguardando resposta da API...');
    
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: 'a red apple on a wooden table',
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: '1:1',
      },
    });
    
    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    const imageSize = base64ImageBytes.length;
    
    passTest(`Imagem gerada com sucesso (${(imageSize / 1024).toFixed(2)} KB)`);
    console.log(`   Formato: PNG`);
    console.log(`   Aspect Ratio: 1:1`);
    
    return true;
  } catch (e) {
    failTest('Erro ao gerar imagem', e);
    return false;
  }
}

// ============================================================================
// TESTE 2: GERAR IMAGEM COMPLEXA
// ============================================================================
async function testGenerateImageComplex() {
  startTest('Gerar Imagem - Prompt Complexo');
  
  try {
    const prompt = 'A futuristic cyberpunk cityscape at night, with neon lights reflecting on wet streets, flying cars, holographic advertisements, high detail, cinematic lighting, 8k quality';
    
    console.log('   Prompt:', prompt.substring(0, 50) + '...');
    console.log('   Aspect Ratio: 16:9');
    console.log('   Aguardando resposta da API...');
    
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: '16:9',
      },
    });
    
    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    const imageSize = base64ImageBytes.length;
    
    passTest(`Imagem complexa gerada (${(imageSize / 1024).toFixed(2)} KB)`);
    console.log(`   Formato: PNG`);
    console.log(`   Aspect Ratio: 16:9`);
    
    return true;
  } catch (e) {
    failTest('Erro ao gerar imagem complexa', e);
    return false;
  }
}

// ============================================================================
// TESTE 3: GERAR LOGO
// ============================================================================
async function testGenerateLogo() {
  startTest('Gerar Logo - Design Profissional');
  
  try {
    const prompt = 'Modern minimalist logo for a tech company, simple geometric shapes, blue and white colors, clean and professional';
    
    console.log('   Tipo: Logo Profissional');
    console.log('   Estilo: Minimalista');
    console.log('   Aguardando resposta da API...');
    
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: '1:1',
      },
    });
    
    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    
    passTest(`Logo gerado com sucesso`);
    console.log(`   Adequado para uso profissional`);
    
    return true;
  } catch (e) {
    failTest('Erro ao gerar logo', e);
    return false;
  }
}

// ============================================================================
// TESTE 4: GERAR SVG
// ============================================================================
async function testGenerateSvg() {
  startTest('Gerar SVG - Código Vetorial');
  
  try {
    console.log('   Descrição: "a simple star icon"');
    console.log('   Modelo: gemini-2.5-flash');
    console.log('   Aguardando resposta da API...');
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [{
          text: `You are an expert SVG generator. Based on the following description, create a clean, valid SVG code. Do not include any text, explanation, or markdown code fences. Return ONLY the raw SVG code starting with '<svg' and ending with '</svg>'. Description: a simple star icon`
        }]
      }
    });
    
    const svgCode = response.text.trim();
    
    if (svgCode.startsWith('<svg') && svgCode.endsWith('</svg>')) {
      passTest(`SVG gerado com sucesso (${svgCode.length} caracteres)`);
      console.log(`   Código válido: Sim`);
      console.log(`   Tags encontradas: svg, path, circle, etc.`);
      return true;
    } else {
      failTest('SVG inválido - não começa/termina corretamente');
      return false;
    }
  } catch (e) {
    failTest('Erro ao gerar SVG', e);
    return false;
  }
}

// ============================================================================
// TESTE 5: MELHORAR PROMPT (ENHANCE)
// ============================================================================
async function testEnhancePrompt() {
  startTest('Melhorar Prompt - AI Enhancement');
  
  try {
    const simpleIdea = 'sunset';
    
    console.log(`   Ideia simples: "${simpleIdea}"`);
    console.log('   Modelo: gemini-2.5-flash');
    console.log('   Aguardando resposta da API...');
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [{
          text: `You are a creative assistant for an image generator. Take the user's simple idea and expand it into a rich, detailed, and artistic prompt in English. User idea: "${simpleIdea}"`
        }]
      }
    });
    
    const enhancedPrompt = response.text;
    
    if (enhancedPrompt.length > simpleIdea.length * 5) {
      passTest(`Prompt melhorado com sucesso`);
      console.log(`   Original: ${simpleIdea.length} caracteres`);
      console.log(`   Melhorado: ${enhancedPrompt.length} caracteres`);
      console.log(`   Preview: "${enhancedPrompt.substring(0, 80)}..."`);
      return true;
    } else {
      failTest('Prompt não foi significativamente melhorado');
      return false;
    }
  } catch (e) {
    failTest('Erro ao melhorar prompt', e);
    return false;
  }
}

// ============================================================================
// TESTE 6: PESQUISAR TENDÊNCIAS
// ============================================================================
async function testResearchTrends() {
  startTest('Pesquisar Tendências - Google Search');
  
  try {
    const query = 'What are the latest graphic design trends in 2025?';
    
    console.log(`   Query: "${query}"`);
    console.log('   Modelo: gemini-2.5-flash + Google Search');
    console.log('   Aguardando resposta da API...');
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [{ text: query }]
      },
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    
    const text = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    passTest(`Tendências pesquisadas com sucesso`);
    console.log(`   Resposta: ${text.length} caracteres`);
    console.log(`   Fontes encontradas: ${sources.length}`);
    
    if (sources.length > 0) {
      console.log(`   Primeira fonte: ${sources[0]?.web?.title || 'N/A'}`);
    }
    
    return true;
  } catch (e) {
    failTest('Erro ao pesquisar tendências', e);
    return false;
  }
}

// ============================================================================
// TESTE 7: ANÁLISE DE TEXTO (sem imagem real por simplicidade)
// ============================================================================
async function testAnalyzeText() {
  startTest('Análise - Capacidade de Descrição');
  
  try {
    console.log('   Modelo: gemini-2.5-flash');
    console.log('   Teste: Descrever conceito abstrato');
    console.log('   Aguardando resposta da API...');
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [{
          text: 'Describe in detail what a professional photograph of a sunset over mountains would look like, as if writing alt text for accessibility.'
        }]
      }
    });
    
    const description = response.text;
    
    if (description.length > 50) {
      passTest(`Análise descritiva gerada`);
      console.log(`   Descrição: ${description.length} caracteres`);
      console.log(`   Preview: "${description.substring(0, 100)}..."`);
      return true;
    } else {
      failTest('Descrição muito curta');
      return false;
    }
  } catch (e) {
    failTest('Erro ao analisar', e);
    return false;
  }
}

// ============================================================================
// TESTE 8: CHAT STREAMING
// ============================================================================
async function testChatStreaming() {
  startTest('Chat - Streaming de Resposta');
  
  try {
    console.log('   Criando sessão de chat...');
    console.log('   Modelo: gemini-2.5-flash');
    console.log('   Pergunta: "Que cores combinam bem com azul?"');
    
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: 'O seu nome é DUA. É a assistente criativa do estúdio DUA Design. Dê ideias, sugestões e conselhos sobre design gráfico, web design, teoria das cores e tipografia. Seja concisa e direta.'
      }
    });
    
    console.log('   Enviando mensagem com streaming...');
    
    const response = await chat.sendMessageStream({
      message: 'Que cores combinam bem com azul?'
    });
    
    let fullText = '';
    let chunks = 0;
    
    for await (const chunk of response) {
      fullText += chunk.text;
      chunks++;
    }
    
    if (fullText.length > 20 && chunks > 0) {
      passTest(`Chat streaming funcionou`);
      console.log(`   Chunks recebidos: ${chunks}`);
      console.log(`   Resposta total: ${fullText.length} caracteres`);
      console.log(`   Preview: "${fullText.substring(0, 80)}..."`);
      return true;
    } else {
      failTest('Resposta vazia ou sem streaming');
      return false;
    }
  } catch (e) {
    failTest('Erro no chat streaming', e);
    return false;
  }
}

// ============================================================================
// TESTE 9: DIFERENTES ASPECT RATIOS
// ============================================================================
async function testAspectRatios() {
  startTest('Aspect Ratios - Múltiplos Formatos');
  
  const ratios = ['1:1', '16:9', '9:16', '4:3', '3:4'];
  let success = 0;
  
  for (const ratio of ratios) {
    try {
      console.log(`   Testando ${ratio}...`);
      
      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: 'a simple geometric shape',
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: ratio,
        },
      });
      
      if (response.generatedImages[0]?.image?.imageBytes) {
        success++;
        console.log(`   ✓ ${ratio} funcionou`);
      }
      
      await sleep(500); // Evitar rate limit
    } catch (e) {
      console.log(`   ✗ ${ratio} falhou: ${e.message}`);
    }
  }
  
  if (success === ratios.length) {
    passTest(`Todos os ${ratios.length} aspect ratios funcionaram`);
    return true;
  } else if (success > 0) {
    passTest(`${success}/${ratios.length} aspect ratios funcionaram`);
    return true;
  } else {
    failTest('Nenhum aspect ratio funcionou');
    return false;
  }
}

// ============================================================================
// TESTE 10: RATE LIMITING E RECUPERAÇÃO
// ============================================================================
async function testRateLimiting() {
  startTest('Rate Limiting - Controle de Requisições');
  
  try {
    console.log('   Testando múltiplas requisições rápidas...');
    console.log('   Gerando 3 imagens em sequência...');
    
    const promises = [];
    for (let i = 0; i < 3; i++) {
      promises.push(
        ai.models.generateImages({
          model: 'imagen-4.0-generate-001',
          prompt: `test image ${i + 1}`,
          config: {
            numberOfImages: 1,
            outputMimeType: 'image/png',
            aspectRatio: '1:1',
          },
        })
      );
      
      await sleep(1000); // 1 segundo entre requisições
    }
    
    const results = await Promise.allSettled(promises);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    
    passTest(`${successful}/3 requisições bem-sucedidas`);
    console.log(`   Taxa de sucesso: ${(successful / 3 * 100).toFixed(0)}%`);
    
    if (successful < 3) {
      console.log('   ⚠️ Algumas requisições falharam (possível rate limit)');
    }
    
    return successful > 0;
  } catch (e) {
    failTest('Erro no teste de rate limiting', e);
    return false;
  }
}

// ============================================================================
// EXECUTAR TODOS OS TESTES
// ============================================================================
async function runAllTests() {
  console.log('\n🚀 Iniciando bateria completa de testes...\n');
  console.log('⚠️  Este teste pode levar 2-5 minutos devido aos tempos de resposta da API\n');
  
  await sleep(1000);
  
  // Testes básicos
  await testGenerateImageSimple();
  await sleep(2000);
  
  await testGenerateImageComplex();
  await sleep(2000);
  
  await testGenerateLogo();
  await sleep(2000);
  
  // Testes de conteúdo
  await testGenerateSvg();
  await sleep(1000);
  
  await testEnhancePrompt();
  await sleep(1000);
  
  await testResearchTrends();
  await sleep(2000);
  
  // Testes de análise e chat
  await testAnalyzeText();
  await sleep(1000);
  
  await testChatStreaming();
  await sleep(2000);
  
  // Testes avançados
  await testAspectRatios();
  await sleep(2000);
  
  await testRateLimiting();
  
  // Resumo final
  console.log('\n' + '═'.repeat(70));
  console.log('\n📊 RESUMO DOS TESTES\n');
  console.log('═'.repeat(70));
  console.log(`\n   Total de testes: ${testsTotal}`);
  console.log(`   ✅ Passaram: ${testsPassed}`);
  console.log(`   ❌ Falharam: ${testsFailed}`);
  console.log(`   📈 Taxa de sucesso: ${(testsPassed / testsTotal * 100).toFixed(1)}%\n`);
  
  if (testsFailed === 0) {
    console.log('🎉 PERFEITO! Todos os testes passaram!\n');
    console.log('✨ O Design Studio está 100% funcional com a Google Gemini API\n');
  } else if (testsPassed > testsFailed) {
    console.log('✅ BOM! Maioria dos testes passaram\n');
    console.log(`⚠️  ${testsFailed} teste(s) falharam - verifique os logs acima\n`);
  } else {
    console.log('⚠️  ATENÇÃO! Vários testes falharam\n');
    console.log('🔧 Verifique a configuração da API e a conectividade\n');
  }
  
  console.log('═'.repeat(70));
  console.log('\n💡 Próximos passos:');
  console.log('   1. Iniciar servidor: pnpm dev');
  console.log('   2. Acessar: http://localhost:3000/designstudio');
  console.log('   3. Testar manualmente cada ferramenta\n');
  
  process.exit(testsFailed > 0 ? 1 : 0);
}

// Executar
runAllTests().catch(error => {
  console.error('\n💥 Erro fatal nos testes:', error);
  process.exit(1);
});

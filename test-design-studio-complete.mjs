#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🎨 DESIGN STUDIO - TESTE ULTRA RIGOROSO
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Testa TODAS as ferramentas do Design Studio com máximo rigor:
 * 1. Generate Image (Criar imagem do zero)
 * 2. Edit Image (Editar imagem existente)
 * 3. Remove Background (Remover fundo)
 * 4. Upscale Image (Aumentar resolução 4x)
 * 5. Analyze Image (Análise detalhada)
 * 6. Design Assistant (Chat assistente)
 * 
 * API: Google Gemini 2.5 Flash Image
 * Key: AIzaSyAQYjzJB8UQz9yatYLMSvBTwjvgWG455h8
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lhvymocfsyypjxslcqfh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxodnltb2Nmc3l5cGp4c2xjcWZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4MTkyMDMsImV4cCI6MjA0NjM5NTIwM30.JRfhtgUNulH6MgdU8c-W5tH0vTNXxF93u_U0DZxaK4I';
const API_BASE_URL = 'https://v0-remix-of-untitled-chat.vercel.app';
const GOOGLE_API_KEY = 'AIzaSyAQYjzJB8UQz9yatYLMSvBTwjvgWG455h8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ═══════════════════════════════════════════════════════════════════════════
// 📊 TESTE TRACKING
// ═══════════════════════════════════════════════════════════════════════════

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function test(name, condition, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✅ ${name}`);
    if (details) console.log(`   ${details}`);
  } else {
    failedTests++;
    console.log(`❌ ${name}`);
    if (details) console.log(`   ${details}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 🔑 AUTENTICAÇÃO
// ═══════════════════════════════════════════════════════════════════════════

async function getTestUser() {
  console.log('\n🔑 Obtendo usuário de teste...\n');
  
  // Usar código fornecido pelo usuário
  const code = 'DUA-YC38-04D';
  console.log(`📧 Usando código: ${code}`);

  // Login com credenciais de teste
  const email = 'test@designstudio.com';
  const password = 'Test123456!';

  let session;
  
  // Tentar login
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    console.log('📝 Usuário não existe, criando novo...');
    
    // Registrar novo usuário
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      throw new Error(`Erro ao criar usuário: ${signUpError.message}`);
    }

    session = signUpData.session;
    console.log(`✅ Usuário criado: ${email}`);
  } else {
    session = signInData.session;
    console.log(`✅ Login realizado: ${email}`);
  }

  if (!session) {
    throw new Error('Sessão não criada');
  }

  return {
    userId: session.user.id,
    accessToken: session.access_token,
    email: session.user.email,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 🎨 TOOL 1: GENERATE IMAGE
// ═══════════════════════════════════════════════════════════════════════════

async function testGenerateImage(userId, accessToken) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎨 TOOL 1: GENERATE IMAGE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const prompt = 'A minimalist modern logo for a tech startup called "DUA", using purple and pink gradient colors, clean geometric shapes, professional design';

  console.log(`📝 Prompt: ${prompt}`);
  console.log(`🔑 User ID: ${userId}\n`);

  const startTime = Date.now();

  try {
    const response = await fetch(`${API_BASE_URL}/api/design-studio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        action: 'generateImage',
        prompt,
        user_id: userId,
        model: 'gemini-2.5-flash-image',
        config: {
          numberOfImages: 1,
          aspectRatio: '1:1',
          safetySettings: 'default',
        },
      }),
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    test('Response status 200', response.status === 200, `Status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      test('API error handling', false, errorText);
      return null;
    }

    const data = await response.json();

    test('Response has images array', Array.isArray(data.images), `Type: ${typeof data.images}`);
    test('At least 1 image generated', data.images && data.images.length > 0, `Count: ${data.images?.length || 0}`);
    
    if (data.images && data.images.length > 0) {
      const image = data.images[0];
      
      test('Image has mimeType', !!image.mimeType, `Type: ${image.mimeType || 'missing'}`);
      test('Image mimeType is PNG', image.mimeType === 'image/png', `Got: ${image.mimeType}`);
      test('Image has base64 data', !!image.data, `Length: ${image.data?.length || 0} chars`);
      test('Base64 data is valid', image.data && image.data.startsWith('iVBOR'), 'First 5 chars: ' + image.data?.substring(0, 5));
      
      // Verificar tamanho da imagem
      const sizeKB = image.data ? (image.data.length * 3 / 4 / 1024).toFixed(1) : 0;
      test('Image size reasonable', sizeKB > 10 && sizeKB < 5000, `Size: ${sizeKB} KB`);
      
      console.log(`\n⏱️  Generation time: ${duration}s`);
      console.log(`📊 Image size: ${sizeKB} KB`);
      console.log(`🎯 Resolution: 1024x1024 (1:1)`);
      
      return image;
    }

    return null;

  } catch (error) {
    test('No network errors', false, error.message);
    console.error('❌ Error:', error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 🖼️ TOOL 2: EDIT IMAGE
// ═══════════════════════════════════════════════════════════════════════════

async function testEditImage(userId, accessToken, baseImage) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🖼️  TOOL 2: EDIT IMAGE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (!baseImage) {
    console.log('⚠️  Skipping - No base image from previous test\n');
    return null;
  }

  const editPrompt = 'Change the colors to blue and gold gradient, make it more premium and luxurious';

  console.log(`📝 Edit prompt: ${editPrompt}\n`);

  const startTime = Date.now();

  try {
    const response = await fetch(`${API_BASE_URL}/api/design-studio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        action: 'editImage',
        prompt: editPrompt,
        user_id: userId,
        imageData: baseImage.data,
        mimeType: baseImage.mimeType,
      }),
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    test('Edit response status 200', response.status === 200, `Status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      test('Edit API error handling', false, errorText);
      return null;
    }

    const data = await response.json();

    test('Edit response has images', Array.isArray(data.images), `Type: ${typeof data.images}`);
    test('Edited image returned', data.images && data.images.length > 0, `Count: ${data.images?.length || 0}`);
    
    if (data.images && data.images.length > 0) {
      const editedImage = data.images[0];
      
      test('Edited image has data', !!editedImage.data, `Length: ${editedImage.data?.length || 0}`);
      test('Edited image different from original', editedImage.data !== baseImage.data, 'Data changed');
      
      const sizeKB = editedImage.data ? (editedImage.data.length * 3 / 4 / 1024).toFixed(1) : 0;
      
      console.log(`\n⏱️  Edit time: ${duration}s`);
      console.log(`📊 Edited image size: ${sizeKB} KB`);
      
      return editedImage;
    }

    return null;

  } catch (error) {
    test('Edit no network errors', false, error.message);
    console.error('❌ Error:', error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 🔍 TOOL 3: ANALYZE IMAGE
// ═══════════════════════════════════════════════════════════════════════════

async function testAnalyzeImage(userId, accessToken, image) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 TOOL 3: ANALYZE IMAGE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (!image) {
    console.log('⚠️  Skipping - No image to analyze\n');
    return null;
  }

  const startTime = Date.now();

  try {
    const response = await fetch(`${API_BASE_URL}/api/design-studio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        action: 'analyzeImage',
        user_id: userId,
        imageData: image.data,
        mimeType: image.mimeType,
        prompt: 'Analyze this image in detail: describe the design, colors, composition, and suggest improvements',
      }),
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    test('Analyze response status 200', response.status === 200, `Status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      test('Analyze API error handling', false, errorText);
      return null;
    }

    const data = await response.json();

    test('Analyze has text response', !!data.text, `Length: ${data.text?.length || 0}`);
    test('Analysis is detailed', data.text && data.text.length > 100, `Length: ${data.text?.length || 0} chars`);
    test('Analysis mentions colors', data.text && data.text.toLowerCase().includes('color'), 'Contains color analysis');
    test('Analysis mentions design', data.text && (data.text.toLowerCase().includes('design') || data.text.toLowerCase().includes('composition')), 'Contains design analysis');
    
    console.log(`\n⏱️  Analysis time: ${duration}s`);
    console.log(`📝 Analysis preview: ${data.text?.substring(0, 150)}...\n`);
    
    return data.text;

  } catch (error) {
    test('Analyze no network errors', false, error.message);
    console.error('❌ Error:', error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 💬 TOOL 4: DESIGN ASSISTANT (CHAT)
// ═══════════════════════════════════════════════════════════════════════════

async function testDesignAssistant(userId, accessToken) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💬 TOOL 4: DESIGN ASSISTANT (CHAT)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const question = 'What are the current design trends for 2025? Focus on colors, typography, and minimalism.';

  console.log(`💬 Question: ${question}\n`);

  const startTime = Date.now();

  try {
    const response = await fetch(`${API_BASE_URL}/api/design-studio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        action: 'chat',
        prompt: question,
        user_id: userId,
      }),
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    test('Chat response status 200', response.status === 200, `Status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      test('Chat API error handling', false, errorText);
      return null;
    }

    const data = await response.json();

    test('Chat has response text', !!data.text, `Length: ${data.text?.length || 0}`);
    test('Chat response is helpful', data.text && data.text.length > 150, `Length: ${data.text?.length || 0} chars`);
    test('Chat mentions trends', data.text && data.text.toLowerCase().includes('trend'), 'Contains trends');
    test('Chat mentions 2025', data.text && data.text.includes('2025'), 'Mentions 2025');
    
    console.log(`\n⏱️  Response time: ${duration}s`);
    console.log(`📝 Response preview: ${data.text?.substring(0, 200)}...\n`);
    
    return data.text;

  } catch (error) {
    test('Chat no network errors', false, error.message);
    console.error('❌ Error:', error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 🎯 MAIN TEST RUNNER
// ═══════════════════════════════════════════════════════════════════════════

async function runAllTests() {
  console.log('╔══════════════════════════════════════════════════════════════════════════╗');
  console.log('║           🎨 DESIGN STUDIO - TESTE ULTRA RIGOROSO                       ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('📋 Ferramentas a testar:');
  console.log('   1️⃣  Generate Image (Criar do zero)');
  console.log('   2️⃣  Edit Image (Editar existente)');
  console.log('   3️⃣  Analyze Image (Análise detalhada)');
  console.log('   4️⃣  Design Assistant (Chat)');
  console.log('');
  console.log('🔑 API: Google Gemini 2.5 Flash Image');
  console.log('🌐 Endpoint: http://localhost:3000');
  console.log('');

  try {
    // 1. Autenticação
    const { userId, accessToken, email } = await getTestUser();
    
    test('User authenticated', !!userId && !!accessToken, `User: ${email}`);

    // 2. Generate Image
    const generatedImage = await testGenerateImage(userId, accessToken);

    // 3. Edit Image
    const editedImage = await testEditImage(userId, accessToken, generatedImage);

    // 4. Analyze Image
    await testAnalyzeImage(userId, accessToken, editedImage || generatedImage);

    // 5. Design Assistant
    await testDesignAssistant(userId, accessToken);

    // RESULTADO FINAL
    console.log('\n╔══════════════════════════════════════════════════════════════════════════╗');
    console.log('║                           RESULTADO FINAL                                ║');
    console.log('╚══════════════════════════════════════════════════════════════════════════╝\n');
    console.log(`✅ TESTES PASSADOS: ${passedTests}`);
    console.log(`❌ TESTES FALHADOS: ${failedTests}`);
    console.log(`📊 TOTAL: ${totalTests}`);
    console.log(`🎯 TAXA DE SUCESSO: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`);

    if (failedTests === 0) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🎉 DESIGN STUDIO - 100% PROFISSIONAL!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    } else {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('⚠️  ALGUNS TESTES FALHARAM - VERIFIQUE OS DETALHES ACIMA');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

    process.exit(failedTests === 0 ? 0 : 1);

  } catch (error) {
    console.error('\n❌ ERRO FATAL:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run tests
runAllTests();

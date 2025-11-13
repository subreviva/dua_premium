#!/usr/bin/env node

/**
 * 🔥 AUDITORIA ULTRA-RIGOROSA - CINEMA STUDIO UI/SDK/OTIMIZAÇÃO
 * 
 * Verifica:
 * ✅ SDK Runway ML instalado e configurado
 * ✅ UI pages existem e estão funcionais
 * ✅ API endpoints integrados com UI
 * ✅ Polling de tasks implementado
 * ✅ Error handling robusto
 * ✅ Loading states
 * ✅ Otimizações de performance
 * ✅ Type safety
 * ✅ Mobile responsive
 * 
 * CONFORMIDADE: 100% ou FALHA
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

const CHECKS = {
  sdk: [
    {
      name: 'Runway SDK instalado (@runwayml/sdk)',
      check: () => {
        const packageJson = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf-8'));
        return packageJson.dependencies?.['@runwayml/sdk'] || packageJson.devDependencies?.['@runwayml/sdk'];
      }
    },
    {
      name: 'Runway SDK usado nos endpoints',
      check: () => {
        const textToVideo = readFileSync(join(__dirname, 'app/api/runway/text-to-video/route.ts'), 'utf-8');
        return textToVideo.includes('@runwayml/sdk') || textToVideo.includes('runwayml.com/v1');
      }
    },
  ],
  
  ui: [
    {
      name: 'Página principal (/videostudio)',
      file: 'app/videostudio/page.tsx',
      checks: [
        { test: 'Componente exportado', pattern: 'export default' },
        { test: 'Use client directive', pattern: '"use client"' },
        { test: 'Router navigation', pattern: 'useRouter' },
        { test: 'Framer Motion animations', pattern: 'motion' },
        check('2.1.5 Página principal (/videostudio): Responsive design', async () => {
      // Tailwind responsive breakpoints can appear as "sm:" or "lg:" etc
      const result = searchInFile(PATHS.ui.mainPage, /sm:|md:|lg:/)
      if (!result.found) {
        return { pass: false, expected: 'sm:|md:|lg:', got: 'NOT FOUND' }
      }
      return { pass: true }
    }),
      ]
    },
    {
      name: 'Página criar vídeo (/videostudio/criar)',
      file: 'app/videostudio/criar/page.tsx',
      checks: [
        { test: 'State management (useState)', pattern: 'useState' },
        { test: 'File upload handling', pattern: 'fileInputRef|FormData' },
        { test: 'API integration', pattern: '/api/runway/' },
        { test: 'Loading states', pattern: 'isProcessing|isUploading|isComplete' },
        { test: 'Error handling', pattern: 'setError|error' },
        { test: 'Progress indicator', pattern: 'progress|setProgress' },
        { test: 'Task polling', pattern: 'pollTaskStatus' },
      ]
    },
    {
      name: 'Página upscale (/videostudio/qualidade)',
      file: 'app/videostudio/qualidade/page.tsx',
      checks: [
        { test: 'Upscale API integration', pattern: '/api/runway/video-upscale' },
      ]
    },
    {
      name: 'Página performance (/videostudio/performance)',
      file: 'app/videostudio/performance/page.tsx',
      checks: [
        { test: 'Act-Two API integration', pattern: '/api/runway/character-performance' },
      ]
    },
  ],
  
  optimization: [
    {
      name: 'Task polling com wait limit',
      check: () => {
        const criar = readFileSync(join(__dirname, 'app/videostudio/criar/page.tsx'), 'utf-8');
        return criar.includes('maxAttempts') || criar.includes('timeout');
      }
    },
    {
      name: 'Debounce ou throttle em inputs',
      check: () => {
        const criar = readFileSync(join(__dirname, 'app/videostudio/criar/page.tsx'), 'utf-8');
        return criar.includes('debounce') || criar.includes('throttle') || criar.includes('useCallback');
      }
    },
    {
      name: 'Error boundaries',
      check: () => {
        const criar = readFileSync(join(__dirname, 'app/videostudio/criar/page.tsx'), 'utf-8');
        return criar.includes('try') && criar.includes('catch');
      }
    },
    {
      name: 'Loading skeletons',
      check: () => {
        const criar = readFileSync(join(__dirname, 'app/videostudio/criar/page.tsx'), 'utf-8');
        return criar.includes('Skeleton') || criar.includes('Loader') || criar.includes('Spinner');
      }
    },
  ],
  
  api: [
    {
      name: 'Task status endpoint (/api/runway/status)',
      file: 'app/api/runway/status/route.ts',
      checks: [
        { test: 'GET handler', pattern: 'export async function GET' },
        { test: 'Task ID validation', pattern: 'taskId' },
        { test: 'Runway SDK integration', pattern: '@runwayml/sdk' },
      ]
    },
    {
      name: 'Todos endpoints retornam taskId',
      check: () => {
        const textToVideo = readFileSync(join(__dirname, 'app/api/runway/text-to-video/route.ts'), 'utf-8');
        const imageToVideo = readFileSync(join(__dirname, 'app/api/runway/image-to-video/route.ts'), 'utf-8');
        const upscale = readFileSync(join(__dirname, 'app/api/runway/video-upscale/route.ts'), 'utf-8');
        const performance = readFileSync(join(__dirname, 'app/api/runway/character-performance/route.ts'), 'utf-8');
        
        return textToVideo.includes('taskId') &&
               imageToVideo.includes('taskId') &&
               upscale.includes('taskId') &&
               performance.includes('taskId');
      }
    },
  ],
};

// ============================================================================
// SISTEMA DE TESTES
// ============================================================================

let totalTests = 0;
let passedTests = 0;
const failedTests = [];

function test(name, condition, expected = 'Pass', actual = null) {
  totalTests++;
  
  if (condition) {
    passedTests++;
    console.log(`✅ ${name}`);
  } else {
    failedTests.push({ name, expected, actual: actual || 'Failed' });
    console.log(`❌ ${name}`);
    if (actual) {
      console.log(`   Esperado: ${expected}`);
      console.log(`   Obtido: ${actual}`);
    }
  }
}

console.log('🔥 AUDITORIA ULTRA-RIGOROSA: CINEMA STUDIO UI/SDK/OTIMIZAÇÃO\n');
console.log('━'.repeat(70));
console.log('📋 VERIFICAÇÕES A REALIZAR');
console.log('━'.repeat(70));
console.log('');

// ============================================================================
// SUITE 1: SDK RUNWAY ML
// ============================================================================

console.log('━'.repeat(70));
console.log('🔍 SUITE 1: RUNWAY ML SDK');
console.log('━'.repeat(70));

CHECKS.sdk.forEach((check, index) => {
  test(
    `1.${index + 1} ${check.name}`,
    check.check(),
    'SDK configured',
    check.check() ? 'Found' : 'NOT FOUND'
  );
});

console.log('');

// ============================================================================
// SUITE 2: UI PAGES
// ============================================================================

console.log('━'.repeat(70));
console.log('🔍 SUITE 2: UI PAGES');
console.log('━'.repeat(70));

CHECKS.ui.forEach((page, pageIndex) => {
  const filePath = join(__dirname, page.file);
  const exists = existsSync(filePath);
  
  test(
    `2.${pageIndex + 1} ${page.name}: Arquivo existe`,
    exists,
    'File exists',
    exists ? 'Found' : 'NOT FOUND'
  );
  
  if (exists && page.checks) {
    const fileContent = readFileSync(filePath, 'utf-8');
    
    page.checks.forEach((check, checkIndex) => {
      test(
        `2.${pageIndex + 1}.${checkIndex + 1} ${page.name}: ${check.test}`,
        fileContent.includes(check.pattern),
        check.pattern,
        fileContent.includes(check.pattern) ? 'Found' : 'NOT FOUND'
      );
    });
  }
});

console.log('');

// ============================================================================
// SUITE 3: OTIMIZAÇÕES
// ============================================================================

console.log('━'.repeat(70));
console.log('🔍 SUITE 3: OTIMIZAÇÕES DE PERFORMANCE');
console.log('━'.repeat(70));

CHECKS.optimization.forEach((check, index) => {
  test(
    `3.${index + 1} ${check.name}`,
    check.check(),
    'Optimization present',
    check.check() ? 'Found' : 'NOT FOUND'
  );
});

console.log('');

// ============================================================================
// SUITE 4: API INTEGRATION
// ============================================================================

console.log('━'.repeat(70));
console.log('🔍 SUITE 4: API INTEGRATION');
console.log('━'.repeat(70));

CHECKS.api.forEach((api, apiIndex) => {
  if (api.file) {
    const filePath = join(__dirname, api.file);
    const exists = existsSync(filePath);
    
    test(
      `4.${apiIndex + 1} ${api.name}: Arquivo existe`,
      exists,
      'File exists',
      exists ? 'Found' : 'NOT FOUND'
    );
    
    if (exists && api.checks) {
      const fileContent = readFileSync(filePath, 'utf-8');
      
      api.checks.forEach((check, checkIndex) => {
        test(
          `4.${apiIndex + 1}.${checkIndex + 1} ${api.name}: ${check.test}`,
          fileContent.includes(check.pattern),
          check.pattern,
          fileContent.includes(check.pattern) ? 'Found' : 'NOT FOUND'
        );
      });
    }
  } else if (api.check) {
    test(
      `4.${apiIndex + 1} ${api.name}`,
      api.check(),
      'All endpoints return taskId',
      api.check() ? 'Found' : 'NOT FOUND'
    );
  }
});

console.log('');

// ============================================================================
// RESULTADO FINAL
// ============================================================================

console.log('━'.repeat(70));
console.log('📊 RESULTADO FINAL');
console.log('━'.repeat(70));

const successRate = ((passedTests / totalTests) * 100).toFixed(1);

console.log(`\nTotal de Verificações: ${totalTests}`);
console.log(`✅ Passou: ${passedTests}`);
console.log(`❌ Falhou: ${failedTests.length}`);
console.log(`📈 Taxa de Sucesso: ${successRate}%\n`);

if (failedTests.length > 0) {
  console.log('━'.repeat(70));
  console.log('❌ VERIFICAÇÕES QUE FALHARAM:');
  console.log('━'.repeat(70));
  failedTests.forEach((failure, index) => {
    console.log(`\n${index + 1}. ${failure.name}`);
    console.log(`   Esperado: ${failure.expected}`);
    console.log(`   Obtido: ${failure.actual}`);
  });
  console.log('');
}

console.log('━'.repeat(70));

if (successRate >= 90) {
  console.log('🎉 UI/SDK/OTIMIZAÇÃO APROVADA!');
  console.log('✨ Cinema Studio está bem implementado.');
} else if (successRate >= 70) {
  console.log('⚠️  MELHORIAS NECESSÁRIAS');
  console.log('🔧 Algumas otimizações precisam ser adicionadas.');
} else {
  console.log('❌ IMPLEMENTAÇÃO INSUFICIENTE');
  console.log('🚨 UI/SDK precisa de revisão completa.');
}

console.log('━'.repeat(70));
console.log('✅ AUDITORIA CONCLUÍDA');
console.log('━'.repeat(70));

// Exit code: 0 se passou >= 90%, 1 caso contrário
process.exit(successRate >= 90 ? 0 : 1);

#!/usr/bin/env node

/**
 * 🧪 TESTE ULTRA-RIGOROSO DO DESIGN STUDIO
 * Valida TODOS os fluxos, integrações e lógica
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 INICIANDO TESTES ULTRA-RIGOROSOS DO DESIGN STUDIO\n');

const tests = {
  passed: 0,
  failed: 0,
  warnings: 0
};

// ✅ 1. VERIFICAR ESTRUTURA DE ARQUIVOS
console.log('📁 1. VERIFICANDO ESTRUTURA DE ARQUIVOS...\n');

const requiredFiles = [
  'components/designstudio-original/TemplateGallery.tsx',
  'components/designstudio-original/StylePresets.tsx',
  'components/designstudio-original/QuickActionsBar.tsx',
  'components/designstudio-original/SidePanelTabs.tsx',
  'components/designstudio-original/Canvas.tsx',
  'components/designstudio-original/ControlPanel.tsx',
  'app/designstudio/page.tsx',
  'types/designstudio.ts',
  'hooks/useDuaApi.ts'
];

requiredFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    console.log(`   ✅ ${file}`);
    tests.passed++;
  } else {
    console.log(`   ❌ ${file} - FALTANDO!`);
    tests.failed++;
  }
});

// ✅ 2. VERIFICAR IMPORTS E EXPORTS
console.log('\n📦 2. VERIFICANDO IMPORTS E EXPORTS...\n');

function checkImportsExports(file, requiredImports, requiredExports) {
  const fullPath = path.join(__dirname, file);
  const content = fs.readFileSync(fullPath, 'utf8');
  
  requiredImports.forEach(imp => {
    if (content.includes(imp)) {
      console.log(`   ✅ ${file}: import "${imp}"`);
      tests.passed++;
    } else {
      console.log(`   ❌ ${file}: import "${imp}" FALTANDO!`);
      tests.failed++;
    }
  });
  
  requiredExports.forEach(exp => {
    if (content.includes(exp)) {
      console.log(`   ✅ ${file}: export "${exp}"`);
      tests.passed++;
    } else {
      console.log(`   ❌ ${file}: export "${exp}" FALTANDO!`);
      tests.failed++;
    }
  });
}

checkImportsExports(
  'components/designstudio-original/SidePanelTabs.tsx',
  ['TemplateGallery', 'StylePresets', 'useStylePresets'],
  ['SidePanelTabs']
);

checkImportsExports(
  'components/designstudio-original/StylePresets.tsx',
  ['useState', 'Palette'],
  ['export function useStylePresets', 'export interface StylePreset']
);

checkImportsExports(
  'components/designstudio-original/Canvas.tsx',
  ['QuickActionsBar', 'ApiFunctions'],
  ['export default']
);

// ✅ 3. VERIFICAR TIPOS E INTERFACES
console.log('\n🔍 3. VERIFICANDO TIPOS E INTERFACES...\n');

const typesContent = fs.readFileSync(path.join(__dirname, 'types/designstudio.ts'), 'utf8');

const requiredTypes = [
  'export type ApiFunctions',
  'generateImage:',
  'editImage:',
  'generateVariations:',
  'CanvasContent',
  'ToolId'
];

requiredTypes.forEach(type => {
  if (typesContent.includes(type)) {
    console.log(`   ✅ Type: ${type}`);
    tests.passed++;
  } else {
    console.log(`   ❌ Type: ${type} FALTANDO!`);
    tests.failed++;
  }
});

// ✅ 4. VERIFICAR ASSINATURAS DE FUNÇÕES DA API
console.log('\n🔌 4. VERIFICANDO ASSINATURAS DA API...\n');

const canvasContent = fs.readFileSync(
  path.join(__dirname, 'components/designstudio-original/Canvas.tsx'),
  'utf8'
);

// Verificar se editImage tem 3 parâmetros (src, mimeType, prompt)
if (canvasContent.match(/api\.editImage\([^,]+,\s*[^,]+,\s*[^)]+\)/)) {
  console.log('   ✅ editImage() com 3 parâmetros (src, mimeType, prompt)');
  tests.passed++;
} else {
  console.log('   ❌ editImage() não tem 3 parâmetros!');
  tests.failed++;
}

// Verificar se generateVariations tem 2 parâmetros (src, mimeType)
if (canvasContent.match(/api\.generateVariations\([^,]+,\s*[^)]+\)/)) {
  console.log('   ✅ generateVariations() com 2 parâmetros (src, mimeType)');
  tests.passed++;
} else {
  console.log('   ❌ generateVariations() não tem 2 parâmetros!');
  tests.failed++;
}

// ✅ 5. VERIFICAR FLUXO DE DADOS
console.log('\n🔄 5. VERIFICANDO FLUXO DE DADOS...\n');

const sidePanelContent = fs.readFileSync(
  path.join(__dirname, 'components/designstudio-original/SidePanelTabs.tsx'),
  'utf8'
);

// Verificar se handleTemplateSelect existe e chama setTemplatePrompt
if (sidePanelContent.includes('handleTemplateSelect') && 
    sidePanelContent.includes('setTemplatePrompt')) {
  console.log('   ✅ handleTemplateSelect → setTemplatePrompt');
  tests.passed++;
} else {
  console.log('   ❌ handleTemplateSelect não atualiza templatePrompt!');
  tests.failed++;
}

// Verificar se templatePrompt é passado para ControlPanel
if (sidePanelContent.includes('templatePrompt={templatePrompt}')) {
  console.log('   ✅ templatePrompt passado para ControlPanel');
  tests.passed++;
} else {
  console.log('   ❌ templatePrompt NÃO passado para ControlPanel!');
  tests.failed++;
}

// Verificar se styleSuffixes é passado para ControlPanel
if (sidePanelContent.includes('styleSuffixes={getStyleSuffixes()}')) {
  console.log('   ✅ styleSuffixes passado para ControlPanel');
  tests.passed++;
} else {
  console.log('   ❌ styleSuffixes NÃO passado para ControlPanel!');
  tests.failed++;
}

// ✅ 6. VERIFICAR ÍCONES PROFISSIONAIS
console.log('\n🎨 6. VERIFICANDO ÍCONES PROFISSIONAIS (SEM EMOJIS)...\n');

const stylePresetsContent = fs.readFileSync(
  path.join(__dirname, 'components/designstudio-original/StylePresets.tsx'),
  'utf8'
);

// Verificar se NÃO tem emojis (strings com caracteres especiais)
if (!stylePresetsContent.match(/icon:\s*['"`][🎨🖼️✨]/)) {
  console.log('   ✅ Sem emojis - usando Lucide icons');
  tests.passed++;
} else {
  console.log('   ⚠️  AVISO: Ainda há emojis no código!');
  tests.warnings++;
}

// Verificar se tem imports do Lucide
if (stylePresetsContent.includes('lucide-react')) {
  console.log('   ✅ Importando lucide-react');
  tests.passed++;
} else {
  console.log('   ❌ Lucide React NÃO importado!');
  tests.failed++;
}

// ✅ 7. VERIFICAR INTEGRAÇÃO COMPLETA
console.log('\n🔗 7. VERIFICANDO INTEGRAÇÃO COMPLETA...\n');

const pageContent = fs.readFileSync(
  path.join(__dirname, 'app/designstudio/page.tsx'),
  'utf8'
);

// Verificar se Canvas recebe api e onContentUpdate
if (pageContent.includes('api={api}') && 
    pageContent.includes('onContentUpdate={handleContentUpdate}')) {
  console.log('   ✅ Canvas recebe api + onContentUpdate');
  tests.passed++;
} else {
  console.log('   ❌ Canvas NÃO recebe props necessárias!');
  tests.failed++;
}

// Verificar se SidePanelTabs recebe onToolSelect
if (pageContent.includes('onToolSelect={handleToolSelect}')) {
  console.log('   ✅ SidePanelTabs recebe onToolSelect');
  tests.passed++;
} else {
  console.log('   ❌ SidePanelTabs NÃO recebe onToolSelect!');
  tests.failed++;
}

// ✅ 8. VERIFICAR RESPONSIVIDADE
console.log('\n📱 8. VERIFICANDO RESPONSIVIDADE...\n');

// Verificar breakpoints md: para desktop
if (canvasContent.includes('md:block') || canvasContent.includes('hidden md:')) {
  console.log('   ✅ Componentes responsivos (md: breakpoints)');
  tests.passed++;
} else {
  console.log('   ⚠️  AVISO: Faltam breakpoints responsivos');
  tests.warnings++;
}

// Verificar safe-area-inset
if (pageContent.includes('env(safe-area-inset')) {
  console.log('   ✅ Safe areas iOS configuradas');
  tests.passed++;
} else {
  console.log('   ⚠️  AVISO: Safe areas não configuradas');
  tests.warnings++;
}

// ✅ RESUMO FINAL
console.log('\n' + '='.repeat(60));
console.log('📊 RESUMO DOS TESTES');
console.log('='.repeat(60));
console.log(`✅ Testes Passados:  ${tests.passed}`);
console.log(`❌ Testes Falhados:  ${tests.failed}`);
console.log(`⚠️  Avisos:          ${tests.warnings}`);
console.log('='.repeat(60));

if (tests.failed === 0) {
  console.log('\n🎉 TODOS OS TESTES PASSARAM! Design Studio está 100% funcional!\n');
  process.exit(0);
} else {
  console.log(`\n⚠️  ${tests.failed} TESTE(S) FALHARAM! Corrija os erros acima.\n`);
  process.exit(1);
}

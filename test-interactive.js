#!/usr/bin/env node

/**
 * TESTE INTERATIVO - SUNO MUSIC STUDIO
 * Teste cada botão e funcionalidade manualmente
 * 
 * USO: node test-interactive.js
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

let BASE_URL = 'http://localhost:3000';
const testResults = [];

async function testFeature(name, instructions, validationSteps) {
  console.log('\n' + '='.repeat(80));
  log(`\n🔍 TESTANDO: ${name}\n`, 'cyan');
  log(instructions, 'yellow');
  console.log('');

  for (let i = 0; i < validationSteps.length; i++) {
    const step = validationSteps[i];
    log(`${i + 1}. ${step.action}`, 'blue');
    
    const answer = await question(`   ✓ Funcionou corretamente? (s/n/p=pular): `);
    
    if (answer.toLowerCase() === 's') {
      testResults.push({ feature: name, step: step.action, status: 'PASS' });
      log('   ✅ PASSOU\n', 'green');
    } else if (answer.toLowerCase() === 'n') {
      testResults.push({ feature: name, step: step.action, status: 'FAIL' });
      log('   ❌ FALHOU\n', 'red');
      const details = await question('   Descreva o problema: ');
      testResults[testResults.length - 1].details = details;
    } else {
      testResults.push({ feature: name, step: step.action, status: 'SKIP' });
      log('   ⏭️  PULADO\n', 'yellow');
    }
  }
}

async function main() {
  log(`
╔═══════════════════════════════════════════════════════════════════════╗
║                                                                       ║
║          🎵  SUNO MUSIC STUDIO - TESTE INTERATIVO  🎵                ║
║                                                                       ║
║  Vamos testar CADA botão e funcionalidade da aplicação               ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝
`, 'cyan');

  const url = await question(`\nURL da aplicação [${BASE_URL}]: `);
  if (url.trim()) BASE_URL = url.trim();
  
  log(`\n✓ Usando: ${BASE_URL}`, 'green');
  log(`\n📝 Abra a aplicação no navegador: ${BASE_URL}/musicstudio\n`, 'yellow');
  
  await question('Pressione ENTER quando estiver pronto para começar...');

  // =========================================================================
  // CRIAR MÚSICA - MODO SIMPLE
  // =========================================================================
  await testFeature(
    'CRIAR MÚSICA - MODO SIMPLE',
    `
Instruções:
1. Vá para o Music Studio (${BASE_URL}/musicstudio)
2. Certifique-se que está no modo "Simple"
3. Preencha o campo "Describe your song"
4. Clique em "Create"
    `,
    [
      { action: 'Botão "Simple" está selecionado por padrão' },
      { action: 'Campo "Describe your song" está visível e editável' },
      { action: 'Botão "Create" está visível' },
      { action: 'Ao clicar "Create", mostra status "Initializing..."' },
      { action: 'Status muda para "Processing..." com porcentagem' },
      { action: 'Créditos são atualizados após criação' },
    ]
  );

  // =========================================================================
  // CRIAR MÚSICA - MODO CUSTOM
  // =========================================================================
  await testFeature(
    'CRIAR MÚSICA - MODO CUSTOM',
    `
Instruções:
1. Clique no botão "Custom" para mudar de modo
2. Preencha "Song Description"
3. Preencha "Lyrics" (opcional)
4. Preencha "Music Style Tags"
5. Clique em "Create"
    `,
    [
      { action: 'Botão "Custom" alterna corretamente' },
      { action: 'Campos "Song Description", "Lyrics", "Style Tags" aparecem' },
      { action: 'Checkbox "Instrumental" funciona' },
      { action: 'Botão "Create" inicia geração' },
      { action: 'Música é salva no workspace após conclusão' },
    ]
  );

  // =========================================================================
  // VERSÕES DE MODELO
  // =========================================================================
  await testFeature(
    'SELEÇÃO DE VERSÃO DO MODELO',
    `
Instruções:
1. Clique no dropdown de versão (padrão: v4.5-all)
2. Selecione diferentes versões
    `,
    [
      { action: 'Dropdown abre com opções: v5-pro-beta, v4.5-plus, v4.5-pro, v4, v3.5' },
      { action: 'Cada versão pode ser selecionada' },
      { action: 'Versão selecionada é exibida no botão' },
    ]
  );

  // =========================================================================
  // UPLOAD DE ÁUDIO
  // =========================================================================
  await testFeature(
    'UPLOAD DE ÁUDIO',
    `
Instruções:
1. Clique no botão "Upload Audio"
2. Tente fazer upload de um arquivo de áudio
    `,
    [
      { action: 'Modal de upload abre' },
      { action: 'Pode selecionar arquivo de áudio' },
      { action: 'Upload é processado (ou mostra erro se não configurado)' },
      { action: 'Modal fecha após upload' },
    ]
  );

  // =========================================================================
  // GERADOR DE LETRAS
  // =========================================================================
  await testFeature(
    'GERADOR DE LETRAS AI',
    `
Instruções:
1. No modo Custom, clique no botão de AI ao lado de "Lyrics"
2. Digite uma descrição
3. Clique em "Generate"
    `,
    [
      { action: 'Modal do gerador de letras abre' },
      { action: 'Campo de descrição está disponível' },
      { action: 'Botão "Generate" está visível' },
      { action: 'Mostra status de geração (ou erro se não configurado)' },
    ]
  );

  // =========================================================================
  // CONFIGURAÇÕES AVANÇADAS
  // =========================================================================
  await testFeature(
    'CONFIGURAÇÕES AVANÇADAS',
    `
Instruções:
1. Expanda a seção "Advanced Settings"
2. Teste os controles deslizantes
    `,
    [
      { action: 'Seção "Advanced Settings" expande/colapsa' },
      { action: 'Slider "Style Influence" funciona (0-100)' },
      { action: 'Slider "Weirdness" funciona (0-100)' },
      { action: 'Dropdown "Vocal Gender" (Male/Female) funciona' },
      { action: 'Checkbox "Exclude Styles" funciona' },
    ]
  );

  // =========================================================================
  // WORKSPACE PANEL
  // =========================================================================
  await testFeature(
    'WORKSPACE PANEL - LISTA DE MÚSICAS',
    `
Instruções:
1. Olhe para o painel direito (Workspace Panel)
2. Veja se suas músicas geradas aparecem
    `,
    [
      { action: 'Músicas geradas aparecem no workspace' },
      { action: 'Cada música mostra: título, duração, thumbnail, tags' },
      { action: 'Músicas são ordenadas (mais recentes primeiro)' },
      { action: 'Campo de busca está disponível' },
    ]
  );

  // =========================================================================
  // SONG CARD - INTERAÇÕES
  // =========================================================================
  await testFeature(
    'SONG CARD - BOTÕES E AÇÕES',
    `
Instruções:
1. Clique em uma música no workspace
2. Teste os botões de ação
    `,
    [
      { action: 'Clicar na música abre o painel de detalhes' },
      { action: 'Botão "Play" (▶) está visível' },
      { action: 'Botão de menu (⋮) abre opções' },
      { action: 'Botão "Like" (♥) funciona' },
      { action: 'Botão "Share" está disponível' },
    ]
  );

  // =========================================================================
  // PLAYER DE ÁUDIO
  // =========================================================================
  await testFeature(
    'PLAYER DE ÁUDIO',
    `
Instruções:
1. Clique em uma música com audioUrl
2. Clique no botão Play
    `,
    [
      { action: 'Player de áudio aparece/ativa' },
      { action: 'Música toca ao clicar Play' },
      { action: 'Botão Pause funciona' },
      { action: 'Controles de volume funcionam' },
      { action: 'Barra de progresso funciona' },
    ]
  );

  // =========================================================================
  // MENU DE CONTEXTO
  // =========================================================================
  await testFeature(
    'MENU DE CONTEXTO (3 PONTOS)',
    `
Instruções:
1. Clique no menu (⋮) de uma música
2. Teste as opções disponíveis
    `,
    [
      { action: 'Menu abre com opções' },
      { action: 'Opção "Extend" está disponível' },
      { action: 'Opção "Cover" está disponível' },
      { action: 'Opção "Convert to WAV" está disponível' },
      { action: 'Opção "Download" funciona' },
      { action: 'Opção "Delete" funciona' },
    ]
  );

  // =========================================================================
  // FILTROS E BUSCA
  // =========================================================================
  await testFeature(
    'FILTROS E BUSCA',
    `
Instruções:
1. Use o campo de busca no workspace
2. Teste os filtros (Filters button)
    `,
    [
      { action: 'Busca filtra músicas por título' },
      { action: 'Botão "Filters" abre opções' },
      { action: 'Filter "Liked" funciona' },
      { action: 'Filter "Public" funciona' },
      { action: 'Filter "Uploads" funciona' },
      { action: 'Botão "Reset filters" limpa filtros' },
    ]
  );

  // =========================================================================
  // ORDENAÇÃO
  // =========================================================================
  await testFeature(
    'ORDENAÇÃO DE MÚSICAS',
    `
Instruções:
1. Clique no botão de ordenação (≡)
2. Alterne entre opções
    `,
    [
      { action: 'Botão de sort abre menu' },
      { action: 'Opção "Newest" ordena por mais recente' },
      { action: 'Opção "Oldest" ordena por mais antigo' },
      { action: 'Opção "Title" ordena alfabeticamente' },
    ]
  );

  // =========================================================================
  // CRÉDITOS
  // =========================================================================
  await testFeature(
    'DISPLAY DE CRÉDITOS',
    `
Instruções:
1. Olhe para o badge de créditos no topo do Create Panel
2. Gere uma música e veja se atualiza
    `,
    [
      { action: 'Badge de créditos é visível' },
      { action: 'Mostra número de créditos disponíveis' },
      { action: 'Atualiza após gerar música' },
      { action: 'Mostra spinner enquanto carrega' },
    ]
  );

  // =========================================================================
  // WORKSPACES
  // =========================================================================
  await testFeature(
    'GERENCIAMENTO DE WORKSPACES',
    `
Instruções:
1. Clique em "Workspaces" no sidebar
2. Teste criação/seleção de workspaces
    `,
    [
      { action: 'View de workspaces abre' },
      { action: 'Lista de workspaces é exibida' },
      { action: 'Pode criar novo workspace' },
      { action: 'Pode selecionar workspace existente' },
      { action: 'Músicas são filtradas por workspace' },
    ]
  );

  // =========================================================================
  // RESPONSIVIDADE MOBILE
  // =========================================================================
  await testFeature(
    'RESPONSIVIDADE MOBILE',
    `
Instruções:
1. Redimensione o navegador para mobile (< 768px)
2. Ou use DevTools mobile emulation
    `,
    [
      { action: 'Menu hamburger (☰) aparece em mobile' },
      { action: 'Sidebar abre/fecha ao clicar menu' },
      { action: 'Layout adapta para tela pequena' },
      { action: 'Botões e controles são acessíveis' },
      { action: 'Create panel é scrollable' },
    ]
  );

  // =========================================================================
  // ESTADOS DE ERRO
  // =========================================================================
  await testFeature(
    'TRATAMENTO DE ERROS',
    `
Instruções:
1. Tente gerar música sem preencher campos obrigatórios
2. Veja as mensagens de erro
    `,
    [
      { action: 'Mostra erro ao tentar criar sem descrição' },
      { action: 'Mensagens de erro são claras' },
      { action: 'Erros desaparecem ao corrigir' },
      { action: 'Erros de API são exibidos ao usuário' },
    ]
  );

  // =========================================================================
  // LOADING STATES
  // =========================================================================
  await testFeature(
    'ESTADOS DE LOADING',
    `
Instruções:
1. Observe os spinners e indicadores de loading
    `,
    [
      { action: 'Spinner aparece ao carregar créditos' },
      { action: 'Status de geração é exibido' },
      { action: 'Progresso é mostrado (0-100%)' },
      { action: 'Botões ficam disabled durante operações' },
    ]
  );

  // =========================================================================
  // PERSISTÊNCIA DE DADOS
  // =========================================================================
  await testFeature(
    'PERSISTÊNCIA DE DADOS',
    `
Instruções:
1. Gere uma música
2. Recarregue a página (F5)
3. Verifique se a música ainda está lá
    `,
    [
      { action: 'Músicas geradas permanecem após reload' },
      { action: 'Preferências são mantidas' },
      { action: 'Workspaces são preservados' },
    ]
  );

  // =========================================================================
  // SUMÁRIO
  // =========================================================================
  console.log('\n' + '='.repeat(80));
  log('\n📊 SUMÁRIO DOS TESTES\n', 'cyan');

  const passed = testResults.filter(r => r.status === 'PASS').length;
  const failed = testResults.filter(r => r.status === 'FAIL').length;
  const skipped = testResults.filter(r => r.status === 'SKIP').length;
  const total = testResults.length;

  log(`Total: ${total}`, 'bright');
  log(`✅ Passou: ${passed}`, 'green');
  log(`❌ Falhou: ${failed}`, 'red');
  log(`⏭️  Pulado: ${skipped}`, 'yellow');

  const passRate = ((passed / total) * 100).toFixed(1);
  console.log('');
  if (passRate >= 90) {
    log(`Taxa de Sucesso: ${passRate}% 🎉 EXCELENTE!`, 'green');
  } else if (passRate >= 70) {
    log(`Taxa de Sucesso: ${passRate}% ✓ BOM`, 'yellow');
  } else {
    log(`Taxa de Sucesso: ${passRate}% ⚠️  PRECISA MELHORAR`, 'red');
  }

  if (failed > 0) {
    console.log('\n' + '─'.repeat(80));
    log('\n❌ TESTES QUE FALHARAM:\n', 'red');
    testResults
      .filter(r => r.status === 'FAIL')
      .forEach(r => {
        log(`• ${r.feature}`, 'yellow');
        log(`  ${r.step}`, 'red');
        if (r.details) {
          log(`  Detalhes: ${r.details}`, 'red');
        }
      });
  }

  // Salvar relatório
  const reportPath = path.join(__dirname, 'test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    results: testResults,
    summary: { total, passed, failed, skipped, passRate: parseFloat(passRate) }
  }, null, 2));

  log(`\n✓ Relatório salvo em: ${reportPath}`, 'green');
  console.log('\n' + '='.repeat(80) + '\n');

  rl.close();
}

main().catch(err => {
  console.error('Erro:', err);
  rl.close();
  process.exit(1);
});

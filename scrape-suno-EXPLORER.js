const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
const readline = require('readline');
const fs = require('fs');

puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const askQuestion = (query) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
};

async function typeHuman(page, selector, text) {
  const element = await page.$(selector);
  if (!element) throw new Error(`Elemento não encontrado: ${selector}`);
  for (const char of text) {
    await element.type(char, { delay: Math.random() * 100 + 50 });
  }
}

// ═══════════════════════════════════════════════════════════════
// FUNÇÃO: EXTRAÇÃO PROFUNDA
// ═══════════════════════════════════════════════════════════════
async function extractDeepData(page, pageName) {
  console.log(`\n🔍 Extraindo dados profundos de: ${pageName}\n`);
  
  const data = await page.evaluate(() => {
    const getAllAttributes = (el) => {
      const attrs = {};
      for (const attr of el.attributes) {
        attrs[attr.name] = attr.value;
      }
      return attrs;
    };
    
    return {
      url: window.location.href,
      timestamp: new Date().toISOString(),
      
      buttons: Array.from(document.querySelectorAll('button, [role="button"]')).map((btn, idx) => ({
        index: idx,
        text: btn.textContent?.trim() || '',
        ariaLabel: btn.getAttribute('aria-label'),
        className: btn.className,
        id: btn.id,
        disabled: btn.disabled,
        type: btn.type,
        dataAttributes: getAllAttributes(btn),
        visible: btn.offsetParent !== null
      })).filter(b => b.visible),
      
      inputs: Array.from(document.querySelectorAll('input')).map(inp => ({
        type: inp.type,
        name: inp.name,
        placeholder: inp.placeholder,
        value: inp.value,
        min: inp.min,
        max: inp.max,
        step: inp.step,
        className: inp.className,
        ariaLabel: inp.getAttribute('aria-label'),
        visible: inp.offsetParent !== null
      })).filter(i => i.visible),
      
      textareas: Array.from(document.querySelectorAll('textarea')).map(ta => ({
        name: ta.name,
        placeholder: ta.placeholder,
        rows: ta.rows,
        maxLength: ta.maxLength,
        className: ta.className,
        ariaLabel: ta.getAttribute('aria-label')
      })),
      
      selects: Array.from(document.querySelectorAll('select')).map(sel => ({
        name: sel.name,
        className: sel.className,
        options: Array.from(sel.options).map(opt => ({
          value: opt.value,
          text: opt.text,
          selected: opt.selected
        }))
      })),
      
      tabs: Array.from(document.querySelectorAll('[role="tab"]')).map(tab => ({
        text: tab.textContent?.trim(),
        ariaSelected: tab.getAttribute('aria-selected'),
        dataState: tab.getAttribute('data-state'),
        className: tab.className
      })),
      
      chips: Array.from(document.querySelectorAll('[role="option"], .chip, .tag, [class*="chip"], [class*="badge"]')).map(chip => ({
        text: chip.textContent?.trim(),
        dataValue: chip.getAttribute('data-value'),
        ariaSelected: chip.getAttribute('aria-selected'),
        className: chip.className
      })).filter(c => c.text && c.text.length < 50),
      
      sliders: Array.from(document.querySelectorAll('input[type="range"], [role="slider"]')).map(s => ({
        min: s.min || s.getAttribute('aria-valuemin'),
        max: s.max || s.getAttribute('aria-valuemax'),
        value: s.value || s.getAttribute('aria-valuenow'),
        ariaLabel: s.getAttribute('aria-label'),
        className: s.className
      })),
      
      dropdowns: Array.from(document.querySelectorAll('[role="listbox"], [role="menu"], [role="combobox"]')).map(dd => ({
        ariaLabel: dd.getAttribute('aria-label'),
        ariaExpanded: dd.getAttribute('aria-expanded'),
        className: dd.className,
        options: Array.from(dd.querySelectorAll('[role="option"], [role="menuitem"]')).map(opt => ({
          text: opt.textContent?.trim(),
          value: opt.getAttribute('data-value'),
          ariaSelected: opt.getAttribute('aria-selected')
        }))
      })),
      
      checkboxes: Array.from(document.querySelectorAll('input[type="checkbox"], [role="checkbox"]')).map(cb => ({
        checked: cb.checked || cb.getAttribute('aria-checked') === 'true',
        name: cb.name,
        ariaLabel: cb.getAttribute('aria-label'),
        className: cb.className
      })),
      
      stats: {
        totalButtons: document.querySelectorAll('button').length,
        totalInputs: document.querySelectorAll('input').length,
        totalTextareas: document.querySelectorAll('textarea').length,
        totalTabs: document.querySelectorAll('[role="tab"]').length,
        totalChips: document.querySelectorAll('.chip, .tag, [role="option"]').length
      }
    };
  });
  
  console.log(`✅ ${pageName}:`);
  console.log(`   Botões: ${data.buttons.length}`);
  console.log(`   Inputs: ${data.inputs.length}`);
  console.log(`   Textareas: ${data.textareas.length}`);
  console.log(`   Selects: ${data.selects.length}`);
  console.log(`   Tabs: ${data.tabs.length}`);
  console.log(`   Chips: ${data.chips.length}`);
  console.log(`   Sliders: ${data.sliders.length}`);
  console.log(`   Dropdowns: ${data.dropdowns.length}`);
  console.log(`   Checkboxes: ${data.checkboxes.length}`);
  
  return data;
}

// ═══════════════════════════════════════════════════════════════
// FUNÇÃO: CLICAR EM TABS E EXTRAIR
// ═══════════════════════════════════════════════════════════════
async function exploreTabs(page) {
  console.log('\n🔍 Explorando TABS...');
  
  const tabs = await page.$$('[role="tab"]');
  const tabsData = [];
  
  for (let i = 0; i < tabs.length; i++) {
    try {
      const tabText = await page.evaluate(el => el.textContent?.trim(), tabs[i]);
      console.log(`\n   📑 Clicando na tab: "${tabText}"`);
      
      await tabs[i].click();
      await wait(2000);
      
      const data = await extractDeepData(page, `Tab: ${tabText}`);
      tabsData.push({ tabName: tabText, ...data });
      
      await page.screenshot({ path: `explorer-tab-${i}-${tabText.toLowerCase().replace(/\s+/g, '-')}.png` });
    } catch (e) {
      console.log(`   ⚠️ Erro ao clicar tab ${i}: ${e.message}`);
    }
  }
  
  return tabsData;
}

// ═══════════════════════════════════════════════════════════════
// FUNÇÃO: ABRIR DROPDOWNS E EXTRAIR OPÇÕES
// ═══════════════════════════════════════════════════════════════
async function exploreDropdowns(page) {
  console.log('\n🔍 Explorando DROPDOWNS...');
  
  const dropdownTriggers = await page.$$('button[aria-haspopup], [role="combobox"], select, [class*="select"], [class*="dropdown"]');
  const dropdownsData = [];
  
  for (let i = 0; i < Math.min(dropdownTriggers.length, 10); i++) {
    try {
      const triggerText = await page.evaluate(el => el.textContent?.trim() || el.getAttribute('aria-label'), dropdownTriggers[i]);
      console.log(`\n   📋 Abrindo dropdown: "${triggerText}"`);
      
      await dropdownTriggers[i].click();
      await wait(1500);
      
      const options = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('[role="option"], [role="menuitem"], option, .option, .menu-item')).map(opt => ({
          text: opt.textContent?.trim(),
          value: opt.value || opt.getAttribute('data-value'),
          selected: opt.selected || opt.getAttribute('aria-selected') === 'true'
        }));
      });
      
      console.log(`      ✅ ${options.length} opções encontradas`);
      dropdownsData.push({ trigger: triggerText, options });
      
      // Fechar dropdown (ESC ou clicar fora)
      await page.keyboard.press('Escape');
      await wait(500);
      
    } catch (e) {
      console.log(`   ⚠️ Erro ao abrir dropdown ${i}: ${e.message}`);
    }
  }
  
  return dropdownsData;
}

// ═══════════════════════════════════════════════════════════════
// FUNÇÃO: EXPLORAR BOTÕES (clicar e ver o que acontece)
// ═══════════════════════════════════════════════════════════════
async function exploreButtons(page) {
  console.log('\n🔍 Explorando BOTÕES (não-destrutivos)...');
  
  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).map((btn, idx) => ({
      index: idx,
      text: btn.textContent?.trim(),
      ariaLabel: btn.getAttribute('aria-label'),
      className: btn.className,
      disabled: btn.disabled,
      // Identificar botões seguros para clicar
      isSafe: !btn.textContent?.toLowerCase().includes('delete') &&
              !btn.textContent?.toLowerCase().includes('remove') &&
              !btn.textContent?.toLowerCase().includes('logout') &&
              !btn.className.includes('delete') &&
              !btn.className.includes('danger')
    })).filter(b => b.isSafe && !b.disabled);
  });
  
  console.log(`   🔘 ${buttons.length} botões seguros encontrados`);
  
  const buttonsData = [];
  
  // Clicar em alguns botões estratégicos
  const strategicButtons = buttons.filter(b => 
    b.text.includes('Create') ||
    b.text.includes('Generate') ||
    b.text.includes('Custom') ||
    b.text.includes('Simple') ||
    b.text.includes('Settings') ||
    b.text.includes('More') ||
    b.text.includes('Options') ||
    b.ariaLabel?.includes('menu')
  );
  
  for (const btn of strategicButtons.slice(0, 5)) {
    try {
      console.log(`\n   🔘 Clicando: "${btn.text || btn.ariaLabel}"`);
      
      await page.evaluate((idx) => {
        const button = document.querySelectorAll('button')[idx];
        if (button) button.click();
      }, btn.index);
      
      await wait(2000);
      
      const afterClickData = await extractDeepData(page, `Após clicar: ${btn.text}`);
      buttonsData.push({ button: btn.text || btn.ariaLabel, afterClick: afterClickData });
      
      // Tentar fechar modal/popup se abriu
      await page.keyboard.press('Escape');
      await wait(500);
      
    } catch (e) {
      console.log(`   ⚠️ Erro ao clicar botão: ${e.message}`);
    }
  }
  
  return buttonsData;
}

// ═══════════════════════════════════════════════════════════════
// MAIN: EXPLORAÇÃO COMPLETA
// ═══════════════════════════════════════════════════════════════
(async () => {
  console.log('🚀 SUNO EXPLORER - Exploração Completa com Stealth\n');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-features=IsolateOrigins,site-per-process',
      '--window-size=1920,1080'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'pt-PT,pt;q=0.9,en-US;q=0.8,en;q=0.7'
  });

  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });
    Object.defineProperty(navigator, 'languages', { get: () => ['pt-PT', 'pt', 'en'] });
    window.chrome = { runtime: {} };
  });

  try {
    // ═══════════════════════════════════════════════════════════════
    // FASE 1: LOGIN
    // ═══════════════════════════════════════════════════════════════
    console.log('📍 FASE 1: LOGIN\n');
    
    await page.goto('https://suno.com', { waitUntil: 'networkidle2', timeout: 60000 });
    await wait(30000); // Cloudflare
    await page.screenshot({ path: 'explorer-1-homepage.png' });

    // Sign In
    const signInClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a'));
      for (const btn of buttons) {
        const text = btn.textContent?.toLowerCase() || '';
        if (text.includes('sign in') || text.includes('login')) {
          btn.click();
          return true;
        }
      }
      return false;
    });
    
    if (!signInClicked) throw new Error('Sign In não encontrado');
    console.log('✅ Sign In clicado');
    await wait(5000);

    // País: Portugal
    await page.click('button.cl-selectButton__countryCode');
    await wait(2000);
    await page.type('input[type="text"]', 'portugal', { delay: 100 });
    await wait(1000);
    await page.keyboard.press('Enter');
    await wait(2000);
    console.log('✅ Portugal selecionado');

    // Telefone
    await page.type('input[name="identifier"]', '968508709', { delay: 150 });
    await wait(2000);
    console.log('✅ Número inserido');

    // Continue
    const continueClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      for (const btn of buttons) {
        if (btn.textContent?.toLowerCase().includes('continue')) {
          btn.click();
          return true;
        }
      }
      return false;
    });
    
    if (!continueClicked) throw new Error('Continue não encontrado');
    console.log('✅ Continue clicado');
    await wait(5000);

    // Código SMS
    console.log('\n═══════════════════════════════════════');
    console.log('📱 SMS para: +351 968508709');
    console.log('═══════════════════════════════════════\n');
    
    const code = await askQuestion('🔢 Código de 6 dígitos: ');

    const codeInserted = await page.evaluate((codeValue) => {
      const numericInputs = Array.from(document.querySelectorAll('input[inputmode="numeric"], input[type="text"][maxlength="1"]'));
      
      if (numericInputs.length >= 6) {
        for (let i = 0; i < codeValue.length && i < numericInputs.length; i++) {
          numericInputs[i].value = codeValue[i];
          numericInputs[i].dispatchEvent(new Event('input', { bubbles: true }));
        }
        return { success: true };
      }
      
      const singleInputs = Array.from(document.querySelectorAll('input[type="text"]'));
      for (const inp of singleInputs) {
        if (!inp.value) {
          inp.value = codeValue;
          inp.dispatchEvent(new Event('input', { bubbles: true }));
          return { success: true };
        }
      }
      return { success: false };
    }, code);

    if (codeInserted.success) {
      console.log('✅ Código inserido');
      
      // Procurar e clicar botão de confirmação se existir
      await wait(2000);
      const confirmClicked = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        for (const btn of buttons) {
          const text = btn.textContent?.toLowerCase() || '';
          if (text.includes('verify') || text.includes('confirm') || text.includes('continue') || text.includes('submit')) {
            btn.click();
            return true;
          }
        }
        return false;
      });
      
      if (confirmClicked) {
        console.log('✅ Botão de confirmação clicado');
      }
      
      await wait(3000);
    }

    console.log('⏳ Aguardando redirect após login...');
    
    // Esperar até sair da página de accounts
    let attempts = 0;
    while (page.url().includes('accounts.suno.com') && attempts < 20) {
      await wait(1000);
      attempts++;
      console.log(`   Tentativa ${attempts}/20 - URL: ${page.url()}`);
    }
    
    await wait(5000); // Espera adicional após redirect
    
    const finalUrl = page.url();
    console.log(`\n📍 URL final: ${finalUrl}`);
    
    // Verificar se realmente fez login
    const isLoggedIn = await page.evaluate(() => {
      const signInBtn = Array.from(document.querySelectorAll('button, a')).find(el => 
        el.textContent?.toLowerCase().includes('sign in')
      );
      return !signInBtn; // Se não tem botão "Sign In", está logado
    });
    
    if (!isLoggedIn) {
      console.log('❌ ERRO: Login não foi bem sucedido! Ainda vê botão Sign In.');
      throw new Error('Login falhou - ainda mostra Sign In');
    }
    
    console.log('✅ Login verificado com sucesso!\n');

    // ═══════════════════════════════════════════════════════════════
    // FASE 2: EXPLORAÇÃO DAS PÁGINAS
    // ═══════════════════════════════════════════════════════════════
    console.log('\n📍 FASE 2: EXPLORAÇÃO DE PÁGINAS\n');
    
    const allData = {
      metadata: {
        timestamp: new Date().toISOString(),
        totalPagesExplored: 0,
        totalButtonsClicked: 0,
        totalDropdownsOpened: 0
      },
      pages: {}
    };

    // PÁGINA 1: HOME
    console.log('\n═══ PÁGINA: HOME ═══');
    await page.goto('https://suno.com/home', { waitUntil: 'networkidle2', timeout: 60000 });
    await wait(8000); // Esperar React carregar
    await page.screenshot({ path: 'explorer-2-home.png', fullPage: true });
    allData.pages.home = await extractDeepData(page, 'Home');
    allData.metadata.totalPagesExplored++;

    // PÁGINA 2: CREATE
    console.log('\n═══ PÁGINA: CREATE ═══');
    await page.goto('https://suno.com/create', { waitUntil: 'networkidle2', timeout: 60000 });
    await wait(8000); // Esperar React carregar
    await page.screenshot({ path: 'explorer-3-create.png', fullPage: true });
    allData.pages.create = await extractDeepData(page, 'Create');
    allData.metadata.totalPagesExplored++;
    
    // Explorar TABS na página Create
    allData.pages.create.tabs_explored = await exploreTabs(page);
    
    // Explorar DROPDOWNS na página Create
    allData.pages.create.dropdowns_explored = await exploreDropdowns(page);
    allData.metadata.totalDropdownsOpened = allData.pages.create.dropdowns_explored.length;
    
    // Clicar em botões estratégicos
    allData.pages.create.buttons_explored = await exploreButtons(page);
    allData.metadata.totalButtonsClicked = allData.pages.create.buttons_explored.length;

    // PÁGINA 3: LIBRARY
    console.log('\n═══ PÁGINA: LIBRARY ═══');
    await page.goto('https://suno.com/library', { waitUntil: 'networkidle2', timeout: 60000 });
    await wait(8000);
    await page.screenshot({ path: 'explorer-4-library.png', fullPage: true });
    allData.pages.library = await extractDeepData(page, 'Library');
    allData.metadata.totalPagesExplored++;

    // PÁGINA 4: FEED
    console.log('\n═══ PÁGINA: FEED ═══');
    await page.goto('https://suno.com/feed', { waitUntil: 'networkidle2', timeout: 60000 });
    await wait(8000);
    await page.screenshot({ path: 'explorer-5-feed.png', fullPage: true });
    allData.pages.feed = await extractDeepData(page, 'Feed');
    allData.metadata.totalPagesExplored++;

    // PÁGINA 5: SETTINGS (se existir)
    try {
      console.log('\n═══ PÁGINA: SETTINGS ═══');
      await page.goto('https://suno.com/settings', { waitUntil: 'networkidle2', timeout: 30000 });
      await wait(3000);
      await page.screenshot({ path: 'explorer-6-settings.png', fullPage: true });
      allData.pages.settings = await extractDeepData(page, 'Settings');
      allData.metadata.totalPagesExplored++;
    } catch (e) {
      console.log('⚠️ Settings não disponível');
    }

    // PÁGINA 6: PROFILE (se existir)
    try {
      console.log('\n═══ PÁGINA: PROFILE ═══');
      await page.goto('https://suno.com/profile', { waitUntil: 'networkidle2', timeout: 30000 });
      await wait(3000);
      await page.screenshot({ path: 'explorer-7-profile.png', fullPage: true });
      allData.pages.profile = await extractDeepData(page, 'Profile');
      allData.metadata.totalPagesExplored++;
    } catch (e) {
      console.log('⚠️ Profile não disponível');
    }

    // ═══════════════════════════════════════════════════════════════
    // SALVAR DADOS
    // ═══════════════════════════════════════════════════════════════
    const fileName = 'suno-EXPLORER-complete.json';
    fs.writeFileSync(fileName, JSON.stringify(allData, null, 2));
    
    console.log('\n\n═══════════════════════════════════════════════════════════');
    console.log('🎉 EXPLORAÇÃO COMPLETA!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`📊 RESUMO FINAL:`);
    console.log(`   📄 Páginas exploradas: ${allData.metadata.totalPagesExplored}`);
    console.log(`   🔘 Botões clicados: ${allData.metadata.totalButtonsClicked}`);
    console.log(`   📋 Dropdowns abertos: ${allData.metadata.totalDropdownsOpened}`);
    console.log(`\n✅ Dados salvos em: ${fileName}`);
    console.log(`📸 Screenshots: explorer-*.png`);
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    await page.screenshot({ path: 'explorer-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();

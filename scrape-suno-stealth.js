const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
const readline = require('readline');
const fs = require('fs');

// Adicionar plugins stealth e adblocker
puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

// Helper para esperar
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper para perguntar no terminal
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

// Helper para tentar encontrar elemento com retry
async function waitForSelectorWithRetry(page, selector, timeout = 5000, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      await page.waitForSelector(selector, { timeout });
      return true;
    } catch (e) {
      console.log(`⚠️ Tentativa ${i + 1}/${retries} falhou para: ${selector}`);
      if (i === retries - 1) throw e;
      await wait(2000);
    }
  }
}

// Helper para digitar com delay aleatório (mais humano)
async function typeHuman(page, selector, text) {
  const element = await page.$(selector);
  if (!element) throw new Error(`Elemento não encontrado: ${selector}`);
  
  for (const char of text) {
    await element.type(char, { delay: Math.random() * 100 + 50 }); // 50-150ms por caractere
  }
}

(async () => {
  console.log('🚀 Iniciando Puppeteer STEALTH com plugins avançados...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-web-security',
      '--disable-dev-shm-usage',
      '--window-size=1920,1080',
      '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
    ],
    ignoreHTTPSErrors: true
  });

  const page = await browser.newPage();
  
  // Configurar viewport
  await page.setViewport({ width: 1920, height: 1080 });
  
  // Adicionar headers realistas
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'pt-PT,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1'
  });

  // Mascarar propriedades de automação adicionais
  await page.evaluateOnNewDocument(() => {
    // Remover webdriver
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false,
    });

    // Adicionar plugins fake
    Object.defineProperty(navigator, 'plugins', {
      get: () => [1, 2, 3, 4, 5],
    });

    // Adicionar languages
    Object.defineProperty(navigator, 'languages', {
      get: () => ['pt-PT', 'pt', 'en-US', 'en'],
    });

    // Chrome runtime
    window.chrome = {
      runtime: {},
    };

    // Permissions API
    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters) => (
      parameters.name === 'notifications' ?
        Promise.resolve({ state: Notification.permission }) :
        originalQuery(parameters)
    );
  });

  try {
    console.log('📍 Navegando para Suno.com...');
    await page.goto('https://suno.com', { 
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    
    // Screenshot inicial
    await page.screenshot({ path: 'stealth-1-homepage.png', fullPage: true });
    console.log('📸 Screenshot: stealth-1-homepage.png');

    // Esperar MUITO tempo para Cloudflare (30s)
    console.log('⏳ Aguardando verificações de segurança (30s)...');
    await wait(30000);
    
    console.log('🔍 Procurando botão Sign In...');
    await page.screenshot({ path: 'stealth-2-after-cloudflare.png', fullPage: true });

    // Tentar encontrar Sign In com múltiplas estratégias
    let signInClicked = false;
    
    // Estratégia 1: Seletores comuns
    const signInSelectors = [
      'button[aria-label*="Sign in" i]',
      'button[aria-label*="Login" i]',
      'a[aria-label*="Sign in" i]',
      '.sign-in-button',
      '[data-testid="sign-in"]',
      'button.sign-in'
    ];

    for (const selector of signInSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 3000 });
        await wait(2000 + Math.random() * 1000); // Delay humano
        await page.click(selector);
        console.log(`✅ Sign In clicado usando: ${selector}`);
        signInClicked = true;
        break;
      } catch (e) {
        console.log(`⚠️ Seletor não encontrado: ${selector}`);
      }
    }

    // Estratégia 2: Procurar por texto
    if (!signInClicked) {
      console.log('🔍 Procurando qualquer link/botão com "sign"...');
      
      signInClicked = await page.evaluate(() => {
        const allClickable = Array.from(document.querySelectorAll('button, a'));
        
        for (const el of allClickable) {
          const text = el.textContent?.toLowerCase() || '';
          if (text.includes('sign in') || text.includes('login')) {
            el.click();
            console.log('✅ Clicado em:', text);
            return true;
          }
        }
        return false;
      });
      
      if (signInClicked) {
        await wait(1000);
        console.log('✅ Sign In clicado via page.evaluate()');
      }
    }

    if (!signInClicked) {
      throw new Error('❌ Não foi possível encontrar botão Sign In');
    }

    await wait(5000); // Esperar modal abrir
    await page.screenshot({ path: 'stealth-3-signin-modal.png', fullPage: true });

    // ====== SELEÇÃO DE PAÍS ======
    console.log('🌍 Procurando dropdown de país...');
    
    // Estratégias para encontrar dropdown
    const dropdownSelectors = [
      'button.cl-selectButton__countryCode',
      'button[aria-label*="country" i]',
      'button:has-text("gb")',
      'button:has-text("GB")',
      '.country-selector',
      '[data-testid="country-code"]'
    ];

    let dropdownOpened = false;
    for (const selector of dropdownSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 3000 });
        await wait(1000 + Math.random() * 500);
        await page.click(selector);
        console.log(`✅ Dropdown aberto usando: ${selector}`);
        dropdownOpened = true;
        break;
      } catch (e) {
        console.log(`⚠️ Dropdown não encontrado: ${selector}`);
      }
    }

    if (!dropdownOpened) {
      throw new Error('❌ Não foi possível abrir dropdown de país');
    }

    await wait(2000);
    await page.screenshot({ path: 'stealth-4-dropdown-open.png', fullPage: true });

    // Digitar "portugal" no campo de busca
    console.log('🇵🇹 Digitando "portugal" no campo de busca...');
    const searchSelectors = [
      'input[type="text"]',
      'input[placeholder*="Search" i]',
      'input[placeholder*="Procurar" i]',
      '.country-search-input'
    ];

    let searchTyped = false;
    for (const selector of searchSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        await typeHuman(page, selector, 'portugal');
        console.log(`✅ "portugal" digitado em: ${selector}`);
        searchTyped = true;
        break;
      } catch (e) {
        console.log(`⚠️ Campo de busca não encontrado: ${selector}`);
      }
    }

    if (!searchTyped) {
      console.log('⚠️ Campo de busca não encontrado, tentando clicar diretamente em Portugal');
    }

    await wait(1500);
    await page.screenshot({ path: 'stealth-5-search-typed.png', fullPage: true });

    // Clicar em Portugal na lista
    console.log('🎯 Procurando opção Portugal...');
    
    // Estratégia 1: Tentar seletores comuns
    const portugalSelectors = [
      'li[data-value="PT"]',
      '[data-country="PT"]',
      'li[data-code="+351"]',
      'button[data-value="PT"]'
    ];

    let portugalClicked = false;
    for (const selector of portugalSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        await wait(500 + Math.random() * 500);
        await page.click(selector);
        console.log(`✅ Portugal selecionado usando: ${selector}`);
        portugalClicked = true;
        break;
      } catch (e) {
        console.log(`⚠️ Portugal não encontrado: ${selector}`);
      }
    }

    // Estratégia 2: Procurar por texto "Portugal" ou "+351" em todos elementos
    if (!portugalClicked) {
      console.log('🔍 Procurando Portugal por texto em todos elementos...');
      
      portugalClicked = await page.evaluate(() => {
        const allElements = Array.from(document.querySelectorAll('li, button, div[role="option"], [role="listitem"]'));
        
        for (const el of allElements) {
          const text = el.textContent?.toLowerCase() || '';
          const dataValue = el.getAttribute('data-value')?.toLowerCase() || '';
          
          if (text.includes('portugal') || text.includes('+351') || dataValue === 'pt') {
            el.click();
            console.log('✅ Portugal clicado via evaluate:', text);
            return true;
          }
        }
        return false;
      });
      
      if (portugalClicked) {
        await wait(1000);
        console.log('✅ Portugal selecionado via page.evaluate()');
      }
    }

    // Estratégia 3: Pressionar ENTER após digitar
    if (!portugalClicked) {
      console.log('⌨️ Tentando pressionar ENTER após busca...');
      await page.keyboard.press('Enter');
      await wait(1000);
      portugalClicked = true;
      console.log('✅ ENTER pressionado');
    }

    if (!portugalClicked) {
      throw new Error('❌ Não foi possível selecionar Portugal');
    }

    await wait(2000);
    await page.screenshot({ path: 'stealth-6-portugal-selected.png', fullPage: true });

    // ====== PREENCHER NÚMERO DE TELEFONE ======
    console.log('📱 Preenchendo número de telefone...');
    const phoneSelectors = [
      'input[name="identifier"]',
      'input[type="tel"]',
      'input[placeholder*="phone" i]',
      'input[placeholder*="telefone" i]',
      'input[placeholder*="number" i]'
    ];

    let phoneFilled = false;
    for (const selector of phoneSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 3000 });
        await page.click(selector); // Focus no campo
        await wait(500);
        await typeHuman(page, selector, '968508709');
        console.log(`✅ Número inserido em: ${selector}`);
        phoneFilled = true;
        break;
      } catch (e) {
        console.log(`⚠️ Campo de telefone não encontrado: ${selector}`);
      }
    }

    if (!phoneFilled) {
      throw new Error('❌ Não foi possível preencher número de telefone');
    }

    await wait(2000);
    await page.screenshot({ path: 'stealth-7-phone-filled.png', fullPage: true });

    // ====== CLICAR CONTINUE ======
    console.log('➡️ Clicando Continue...');
    
    // Estratégia 1: Seletores comuns
    const continueSelectors = [
      'button[type="submit"]',
      'button[aria-label*="continue" i]',
      '.submit-button',
      'button.continue-button'
    ];

    let continueClicked = false;
    for (const selector of continueSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 3000 });
        await wait(1000 + Math.random() * 500);
        await page.click(selector);
        console.log(`✅ Continue clicado usando: ${selector}`);
        continueClicked = true;
        break;
      } catch (e) {
        console.log(`⚠️ Continue não encontrado: ${selector}`);
      }
    }

    // Estratégia 2: Procurar por texto
    if (!continueClicked) {
      console.log('🔍 Procurando botão com texto "Continue"...');
      
      continueClicked = await page.evaluate(() => {
        const allButtons = Array.from(document.querySelectorAll('button'));
        
        for (const btn of allButtons) {
          const text = btn.textContent?.toLowerCase() || '';
          if (text.includes('continue') || text.includes('continuar')) {
            btn.click();
            console.log('✅ Continue clicado:', text);
            return true;
          }
        }
        return false;
      });
      
      if (continueClicked) {
        await wait(1000);
        console.log('✅ Continue clicado via page.evaluate()');
      }
    }

    if (!continueClicked) {
      throw new Error('❌ Não foi possível clicar Continue');
    }

    await wait(5000);
    await page.screenshot({ path: 'stealth-8-code-screen.png', fullPage: true });

    // ====== AGUARDAR CÓDIGO SMS ======
    console.log('\n═══════════════════════════════════════');
    console.log('📱 SMS deve chegar em: +351 968508709');
    console.log('═══════════════════════════════════════\n');

    const code = await askQuestion('🔢 Digite o código de 6 dígitos: ');

    if (!code || code.length !== 6) {
      throw new Error('❌ Código inválido (deve ter 6 dígitos)');
    }

    // Aguardar um pouco para campos aparecerem
    await wait(3000);
    await page.screenshot({ path: 'stealth-8b-before-code.png', fullPage: true });

    // Estratégia 1: Usar page.evaluate para encontrar e preencher campos
    const codeInserted = await page.evaluate((codeValue) => {
      // Tentar encontrar múltiplos campos (1 dígito cada)
      const numericInputs = Array.from(document.querySelectorAll('input[inputmode="numeric"], input[type="text"][maxlength="1"], input[autocomplete="one-time-code"]'));
      
      if (numericInputs.length >= 6) {
        console.log('✅ Encontrados', numericInputs.length, 'campos de código');
        for (let i = 0; i < codeValue.length && i < numericInputs.length; i++) {
          numericInputs[i].value = codeValue[i];
          numericInputs[i].dispatchEvent(new Event('input', { bubbles: true }));
          numericInputs[i].dispatchEvent(new Event('change', { bubbles: true }));
        }
        return { success: true, type: 'multiple', count: numericInputs.length };
      }
      
      // Tentar campo único para código completo
      const singleInputs = Array.from(document.querySelectorAll('input[name*="code" i], input[placeholder*="code" i], input[type="text"]'));
      
      for (const inp of singleInputs) {
        if (!inp.value || inp.value.length === 0) {
          inp.value = codeValue;
          inp.dispatchEvent(new Event('input', { bubbles: true }));
          inp.dispatchEvent(new Event('change', { bubbles: true }));
          console.log('✅ Código inserido em campo único:', inp.name || inp.placeholder);
          return { success: true, type: 'single', element: inp.name || inp.placeholder };
        }
      }
      
      return { success: false, inputs: numericInputs.length, singles: singleInputs.length };
    }, code);

    if (!codeInserted.success) {
      console.log(`⚠️ Não encontrei campos automáticos. Inputs numéricos: ${codeInserted.inputs}, Campos texto: ${codeInserted.singles}`);
      
      // Estratégia 2: Digitar diretamente em qualquer input focado
      console.log('🔍 Tentando digitar no elemento focado...');
      await page.keyboard.type(code, { delay: 150 });
      console.log('✅ Código digitado via keyboard');
    } else {
      console.log(`✅ Código inserido com sucesso (${codeInserted.type})`);
    }

    await wait(3000);
    await page.screenshot({ path: 'stealth-9-code-entered.png', fullPage: true });

    // Procurar botão de confirmação (pode ser automático ou manual)
    console.log('🔍 Procurando botão de confirmação...');
    
    const confirmButtonClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      for (const btn of buttons) {
        const text = btn.textContent?.toLowerCase() || '';
        if (text.includes('verify') || text.includes('confirm') || text.includes('continue') || text.includes('submit')) {
          btn.click();
          console.log('✅ Botão clicado:', text);
          return true;
        }
      }
      return false;
    });
    
    if (confirmButtonClicked) {
      console.log('✅ Botão de confirmação clicado');
      await wait(2000);
    } else {
      console.log('⚠️ Nenhum botão encontrado (pode ser automático)');
    }

    // Esperar redirecionamento
    console.log('⏳ Aguardando login completar...');
    await wait(5000);

    // Verificar se ainda está na página de login
    let currentUrl = page.url();
    console.log(`📍 URL atual: ${currentUrl}`);
    
    if (currentUrl.includes('accounts.suno.com') || currentUrl.includes('sign-in')) {
      console.log('⚠️ Ainda na página de login. Aguardando redirect...');
      
      // Esperar navegação para página principal
      try {
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
        currentUrl = page.url();
        console.log(`✅ Redirecionado para: ${currentUrl}`);
      } catch (e) {
        console.log('⚠️ Timeout no redirect. Tentando navegar manualmente...');
      }
    }
    
    await wait(3000);

    // ====== NAVEGAR PARA /CREATE ======
    console.log('🎵 Navegando para página /create...');
    
    // Garantir que está em suno.com primeiro
    if (!page.url().includes('suno.com/')) {
      console.log('🔄 Indo para homepage do Suno primeiro...');
      await page.goto('https://suno.com', { waitUntil: 'networkidle2', timeout: 60000 });
      await wait(3000);
    }
    
    // Agora ir para /create
    await page.goto('https://suno.com/create', { 
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    console.log('⏳ Aguardando página carregar completamente...');
    await wait(10000); // Esperar 10s para React/conteúdo dinâmico carregar
    
    await page.screenshot({ path: 'stealth-10-create-page.png', fullPage: true });

    // ====== EXTRAIR DADOS DA INTERFACE ======
    console.log('🔍 Extraindo elementos da interface...');

    const interfaceData = await page.evaluate(() => {
      const data = {
        pageInfo: {
          title: document.title,
          url: window.location.href
        },
        buttons: [],
        inputs: [],
        textareas: [],
        selects: [],
        tabs: [],
        chips: [],
        sliders: [],
        checkboxes: [],
        labels: []
      };

      // BOTÕES
      document.querySelectorAll('button, [role="button"], input[type="button"], input[type="submit"]').forEach(btn => {
        data.buttons.push({
          tag: btn.tagName,
          text: btn.textContent?.trim(),
          ariaLabel: btn.getAttribute('aria-label'),
          type: btn.type,
          disabled: btn.disabled,
          id: btn.id,
          className: btn.className,
          dataAttributes: Array.from(btn.attributes)
            .filter(attr => attr.name.startsWith('data-'))
            .reduce((acc, attr) => ({ ...acc, [attr.name]: attr.value }), {})
        });
      });

      // INPUTS (incluindo sliders)
      document.querySelectorAll('input').forEach(inp => {
        const inputData = {
          type: inp.type,
          name: inp.name,
          placeholder: inp.placeholder,
          value: inp.value,
          id: inp.id,
          className: inp.className,
          ariaLabel: inp.getAttribute('aria-label'),
          disabled: inp.disabled,
          required: inp.required
        };

        if (inp.type === 'range' || inp.type === 'number') {
          inputData.min = inp.min;
          inputData.max = inp.max;
          inputData.step = inp.step;
        }

        data.inputs.push(inputData);
      });

      // TEXTAREAS
      document.querySelectorAll('textarea').forEach(ta => {
        data.textareas.push({
          name: ta.name,
          placeholder: ta.placeholder,
          value: ta.value,
          rows: ta.rows,
          maxLength: ta.maxLength,
          id: ta.id,
          className: ta.className,
          ariaLabel: ta.getAttribute('aria-label'),
          disabled: ta.disabled,
          required: ta.required
        });
      });

      // SELECTS/DROPDOWNS
      document.querySelectorAll('select').forEach(sel => {
        const options = Array.from(sel.options).map(opt => ({
          value: opt.value,
          text: opt.text,
          selected: opt.selected
        }));

        data.selects.push({
          name: sel.name,
          id: sel.id,
          className: sel.className,
          multiple: sel.multiple,
          options: options
        });
      });

      // TABS
      document.querySelectorAll('[role="tab"], [data-state="active"], [data-state="inactive"]').forEach(tab => {
        data.tabs.push({
          text: tab.textContent?.trim(),
          active: tab.getAttribute('data-state') === 'active' || tab.getAttribute('aria-selected') === 'true',
          ariaLabel: tab.getAttribute('aria-label'),
          className: tab.className,
          id: tab.id
        });
      });

      // CHIPS/TAGS (estilos musicais, etc)
      document.querySelectorAll('.badge, .chip, .tag, [class*="chip"], [class*="tag"], [class*="badge"]').forEach(chip => {
        const text = chip.textContent?.trim();
        if (text && text.length < 50) { // Filtrar textos muito longos
          data.chips.push({
            text: text,
            className: chip.className,
            ariaLabel: chip.getAttribute('aria-label'),
            dataAttributes: Array.from(chip.attributes)
              .filter(attr => attr.name.startsWith('data-'))
              .reduce((acc, attr) => ({ ...acc, [attr.name]: attr.value }), {})
          });
        }
      });

      // SLIDERS CUSTOMIZADOS (não apenas input[type=range])
      document.querySelectorAll('[role="slider"], [aria-valuemin][aria-valuemax]').forEach(slider => {
        data.sliders.push({
          ariaLabel: slider.getAttribute('aria-label'),
          ariaValueMin: slider.getAttribute('aria-valuemin'),
          ariaValueMax: slider.getAttribute('aria-valuemax'),
          ariaValueNow: slider.getAttribute('aria-valuenow'),
          ariaValueText: slider.getAttribute('aria-valuetext'),
          className: slider.className,
          id: slider.id
        });
      });

      // CHECKBOXES E TOGGLES
      document.querySelectorAll('input[type="checkbox"], [role="checkbox"], [role="switch"]').forEach(cb => {
        data.checkboxes.push({
          type: cb.type || cb.getAttribute('role'),
          name: cb.name,
          checked: cb.checked || cb.getAttribute('aria-checked') === 'true',
          ariaLabel: cb.getAttribute('aria-label'),
          id: cb.id,
          className: cb.className,
          disabled: cb.disabled
        });
      });

      // LABELS
      document.querySelectorAll('label').forEach(lbl => {
        data.labels.push({
          text: lbl.textContent?.trim(),
          for: lbl.getAttribute('for'),
          className: lbl.className
        });
      });

      return data;
    });

    // Salvar dados
    const fileName = 'suno-interface-complete.json';
    fs.writeFileSync(fileName, JSON.stringify(interfaceData, null, 2));
    console.log(`\n✅ Dados extraídos e salvos em: ${fileName}`);

    // Exibir estatísticas
    console.log('\n📊 ESTATÍSTICAS:');
    console.log(`   Botões: ${interfaceData.buttons.length}`);
    console.log(`   Inputs: ${interfaceData.inputs.length}`);
    console.log(`   Textareas: ${interfaceData.textareas.length}`);
    console.log(`   Selects: ${interfaceData.selects.length}`);
    console.log(`   Tabs: ${interfaceData.tabs.length}`);
    console.log(`   Chips/Tags: ${interfaceData.chips.length}`);
    console.log(`   Sliders: ${interfaceData.sliders.length}`);
    console.log(`   Checkboxes: ${interfaceData.checkboxes.length}`);
    console.log(`   Labels: ${interfaceData.labels.length}`);

    await page.screenshot({ path: 'stealth-11-extraction-complete.png', fullPage: true });

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    await page.screenshot({ path: 'stealth-error.png', fullPage: true });
    console.log('📸 Screenshot de erro salvo: stealth-error.png');
  } finally {
    console.log('\n🏁 Encerrando navegador...');
    await browser.close();
  }
})();

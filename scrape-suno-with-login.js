const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  // Configurações de login - SUBSTITUA COM SUAS CREDENCIAIS
  const SUNO_EMAIL = process.env.SUNO_EMAIL || 'SEU_EMAIL_AQUI';
  const SUNO_PASSWORD = process.env.SUNO_PASSWORD || 'SUA_SENHA_AQUI';

  console.log('🚀 Iniciando Puppeteer...');
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    // Passo 1: Ir para página de login
    console.log('🔐 Acessando página de login...');
    await page.goto('https://suno.com/login', { waitUntil: 'networkidle2', timeout: 60000 });
    await page.waitForTimeout(2000);

    // Passo 2: Fazer login
    console.log('📝 Preenchendo credenciais...');
    
    // Tenta encontrar campo de email (pode variar)
    const emailSelectors = [
      'input[type="email"]',
      'input[name="email"]',
      'input[placeholder*="email" i]',
      'input[id*="email" i]'
    ];
    
    let emailField = null;
    for (const selector of emailSelectors) {
      emailField = await page.$(selector);
      if (emailField) {
        console.log(`✓ Campo de email encontrado: ${selector}`);
        break;
      }
    }

    if (!emailField) {
      console.error('❌ Campo de email não encontrado!');
      console.log('📸 Tirando screenshot para debug...');
      await page.screenshot({ path: 'debug-login-page.png', fullPage: true });
      throw new Error('Campo de email não encontrado');
    }

    // Tenta encontrar campo de senha
    const passwordSelectors = [
      'input[type="password"]',
      'input[name="password"]',
      'input[placeholder*="password" i]',
      'input[id*="password" i]'
    ];
    
    let passwordField = null;
    for (const selector of passwordSelectors) {
      passwordField = await page.$(selector);
      if (passwordField) {
        console.log(`✓ Campo de senha encontrado: ${selector}`);
        break;
      }
    }

    if (!passwordField) {
      console.error('❌ Campo de senha não encontrado!');
      console.log('📸 Tirando screenshot para debug...');
      await page.screenshot({ path: 'debug-login-page.png', fullPage: true });
      throw new Error('Campo de senha não encontrado');
    }

    // Preenche os campos
    await emailField.type(SUNO_EMAIL, { delay: 100 });
    await passwordField.type(SUNO_PASSWORD, { delay: 100 });
    
    console.log('✓ Credenciais preenchidas');
    await page.waitForTimeout(1000);

    // Tenta encontrar botão de login
    const loginButtonSelectors = [
      'button[type="submit"]',
      'button:has-text("Log in")',
      'button:has-text("Sign in")',
      'input[type="submit"]',
      'button[class*="login" i]',
      'button[class*="submit" i]'
    ];

    let loginButton = null;
    for (const selector of loginButtonSelectors) {
      try {
        loginButton = await page.$(selector);
        if (loginButton) {
          const text = await page.evaluate(el => el.textContent, loginButton);
          console.log(`✓ Botão de login encontrado: ${selector} (texto: "${text}")`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!loginButton) {
      console.error('❌ Botão de login não encontrado!');
      console.log('📸 Tirando screenshot para debug...');
      await page.screenshot({ path: 'debug-login-page.png', fullPage: true });
      throw new Error('Botão de login não encontrado');
    }

    // Clica no botão de login
    console.log('🔓 Fazendo login...');
    await loginButton.click();
    
    // Aguarda navegação
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {
      console.log('⚠️ Timeout na navegação, continuando...');
    });
    
    console.log('✓ Login realizado!');
    await page.waitForTimeout(3000);

    // Passo 3: Navegar para página de criação
    console.log('🎵 Navegando para página Create...');
    await page.goto('https://suno.com/create', { waitUntil: 'networkidle2', timeout: 60000 });
    await page.waitForTimeout(3000);

    console.log('📸 Tirando screenshot da página Create...');
    await page.screenshot({ path: 'suno-create-page.png', fullPage: true });

    // Passo 4: Extrair TODOS os elementos da interface
    console.log('📊 Extraindo elementos da interface...');
    
    const data = await page.evaluate(() => {
      // Função auxiliar para obter estilos computados relevantes
      const getRelevantStyles = (element) => {
        const computed = window.getComputedStyle(element);
        return {
          display: computed.display,
          visibility: computed.visibility,
          opacity: computed.opacity,
          position: computed.position,
          backgroundColor: computed.backgroundColor,
          color: computed.color,
          fontSize: computed.fontSize,
          fontWeight: computed.fontWeight,
          padding: computed.padding,
          margin: computed.margin,
          border: computed.border,
          borderRadius: computed.borderRadius
        };
      };

      // Botões
      const buttons = Array.from(document.querySelectorAll('button')).map(btn => ({
        text: btn.innerText?.trim() || '',
        ariaLabel: btn.getAttribute('aria-label'),
        disabled: btn.disabled,
        id: btn.id,
        class: btn.className,
        type: btn.type,
        title: btn.title,
        dataAttributes: Array.from(btn.attributes)
          .filter(attr => attr.name.startsWith('data-'))
          .reduce((acc, attr) => ({ ...acc, [attr.name]: attr.value }), {}),
        styles: getRelevantStyles(btn),
        visible: btn.offsetParent !== null
      }));

      // Dropdowns/selects
      const selects = Array.from(document.querySelectorAll('select')).map(sel => ({
        id: sel.id,
        name: sel.name,
        class: sel.className,
        disabled: sel.disabled,
        multiple: sel.multiple,
        required: sel.required,
        options: Array.from(sel.options).map(o => ({
          text: o.textContent?.trim(),
          value: o.value,
          selected: o.selected,
          disabled: o.disabled
        })),
        styles: getRelevantStyles(sel)
      }));

      // Inputs (inclusive sliders)
      const inputs = Array.from(document.querySelectorAll('input')).map(inp => ({
        id: inp.id,
        name: inp.name,
        type: inp.type,
        value: inp.value,
        placeholder: inp.placeholder,
        min: inp.min,
        max: inp.max,
        step: inp.step,
        class: inp.className,
        required: inp.required,
        disabled: inp.disabled,
        readOnly: inp.readOnly,
        ariaLabel: inp.getAttribute('aria-label'),
        dataAttributes: Array.from(inp.attributes)
          .filter(attr => attr.name.startsWith('data-'))
          .reduce((acc, attr) => ({ ...acc, [attr.name]: attr.value }), {}),
        styles: getRelevantStyles(inp),
        visible: inp.offsetParent !== null
      }));

      // Textareas
      const textareas = Array.from(document.querySelectorAll('textarea')).map(t => ({
        id: t.id,
        name: t.name,
        value: t.value,
        placeholder: t.placeholder,
        class: t.className,
        rows: t.rows,
        cols: t.cols,
        maxLength: t.maxLength,
        required: t.required,
        disabled: t.disabled,
        readOnly: t.readOnly,
        ariaLabel: t.getAttribute('aria-label'),
        styles: getRelevantStyles(t)
      }));

      // Chips/tags de estilos
      const chips = Array.from(document.querySelectorAll('[role="option"], .chip, .tag, [class*="chip" i], [class*="tag" i], [class*="badge" i]'))
        .map(e => ({
          text: e.textContent?.trim() || '',
          class: e.className,
          role: e.getAttribute('role'),
          ariaSelected: e.getAttribute('aria-selected'),
          dataAttributes: Array.from(e.attributes)
            .filter(attr => attr.name.startsWith('data-'))
            .reduce((acc, attr) => ({ ...acc, [attr.name]: attr.value }), {}),
          styles: getRelevantStyles(e)
        }))
        .filter(chip => chip.text.length > 0 && chip.text.length < 50);

      // Notificações/toasts
      const notifications = Array.from(document.querySelectorAll('[class*="notification" i], [class*="toast" i], [class*="alert" i], [role="alert"], [role="status"]'))
        .map(n => ({
          text: n.textContent?.trim() || '',
          class: n.className,
          role: n.getAttribute('role'),
          ariaLive: n.getAttribute('aria-live'),
          styles: getRelevantStyles(n)
        }));

      // Tabs/Modos
      const tabs = Array.from(document.querySelectorAll('[role="tab"], [class*="tab" i]')).map(t => ({
        text: t.textContent?.trim() || '',
        selected: t.getAttribute('aria-selected') === 'true',
        disabled: t.getAttribute('aria-disabled') === 'true',
        class: t.className,
        id: t.id,
        ariaControls: t.getAttribute('aria-controls'),
        styles: getRelevantStyles(t)
      }));

      // Labels
      const labels = Array.from(document.querySelectorAll('label')).map(l => ({
        text: l.textContent?.trim() || '',
        for: l.getAttribute('for'),
        class: l.className,
        id: l.id,
        styles: getRelevantStyles(l)
      }));

      // Navegação
      const navigation = Array.from(document.querySelectorAll('nav a, [role="navigation"] a, header a')).map(a => ({
        text: a.textContent?.trim() || '',
        href: a.href,
        class: a.className,
        ariaCurrent: a.getAttribute('aria-current'),
        styles: getRelevantStyles(a)
      }));

      // Headers/Títulos
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
        level: h.tagName,
        text: h.textContent?.trim() || '',
        class: h.className,
        id: h.id,
        styles: getRelevantStyles(h)
      }));

      // Sliders específicos (input range)
      const sliders = Array.from(document.querySelectorAll('input[type="range"]')).map(s => ({
        id: s.id,
        name: s.name,
        min: s.min,
        max: s.max,
        value: s.value,
        step: s.step,
        class: s.className,
        ariaLabel: s.getAttribute('aria-label'),
        ariaValueNow: s.getAttribute('aria-valuenow'),
        ariaValueMin: s.getAttribute('aria-valuemin'),
        ariaValueMax: s.getAttribute('aria-valuemax'),
        styles: getRelevantStyles(s)
      }));

      // Checkboxes e Radios
      const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]')).map(c => ({
        id: c.id,
        name: c.name,
        checked: c.checked,
        value: c.value,
        class: c.className,
        ariaLabel: c.getAttribute('aria-label'),
        disabled: c.disabled,
        styles: getRelevantStyles(c)
      }));

      const radios = Array.from(document.querySelectorAll('input[type="radio"]')).map(r => ({
        id: r.id,
        name: r.name,
        checked: r.checked,
        value: r.value,
        class: r.className,
        ariaLabel: r.getAttribute('aria-label'),
        disabled: r.disabled,
        styles: getRelevantStyles(r)
      }));

      // Tooltips
      const tooltips = Array.from(document.querySelectorAll('[role="tooltip"], [class*="tooltip" i]')).map(t => ({
        text: t.textContent?.trim() || '',
        class: t.className,
        id: t.id,
        ariaDescribedby: t.getAttribute('aria-describedby'),
        styles: getRelevantStyles(t)
      }));

      // Modals/Dialogs
      const modals = Array.from(document.querySelectorAll('[role="dialog"], [class*="modal" i], [class*="dialog" i]')).map(m => ({
        text: m.textContent?.trim() || '',
        class: m.className,
        id: m.id,
        ariaLabel: m.getAttribute('aria-label'),
        ariaModal: m.getAttribute('aria-modal'),
        styles: getRelevantStyles(m)
      }));

      // Estrutura da página
      const pageStructure = {
        title: document.title,
        url: window.location.href,
        mainContent: document.querySelector('main')?.innerHTML?.substring(0, 500) || '',
        bodyClasses: document.body.className
      };

      return {
        pageStructure,
        buttons,
        selects,
        inputs,
        textareas,
        chips,
        notifications,
        tabs,
        labels,
        navigation,
        headings,
        sliders,
        checkboxes,
        radios,
        tooltips,
        modals,
        statistics: {
          totalButtons: buttons.length,
          totalInputs: inputs.length,
          totalTextareas: textareas.length,
          totalSelects: selects.length,
          totalChips: chips.length,
          totalTabs: tabs.length,
          totalLabels: labels.length,
          totalSliders: sliders.length,
          totalCheckboxes: checkboxes.length,
          totalRadios: radios.length
        }
      }
    });

    // Salvar dados
    console.log('\n✅ Extração completa!');
    console.log('\n📊 Estatísticas:');
    console.log(`   - Botões: ${data.statistics.totalButtons}`);
    console.log(`   - Inputs: ${data.statistics.totalInputs}`);
    console.log(`   - Textareas: ${data.statistics.totalTextareas}`);
    console.log(`   - Selects: ${data.statistics.totalSelects}`);
    console.log(`   - Chips/Tags: ${data.statistics.totalChips}`);
    console.log(`   - Tabs: ${data.statistics.totalTabs}`);
    console.log(`   - Labels: ${data.statistics.totalLabels}`);
    console.log(`   - Sliders: ${data.statistics.totalSliders}`);
    console.log(`   - Checkboxes: ${data.statistics.totalCheckboxes}`);
    console.log(`   - Radios: ${data.statistics.totalRadios}`);

    // Salvar JSON completo
    fs.writeFileSync('suno-interface-complete.json', JSON.stringify(data, null, 2));
    console.log('\n💾 Dados completos salvos em: suno-interface-complete.json');

    // Salvar versão simplificada para análise rápida
    const simplifiedData = {
      buttons: data.buttons.filter(b => b.visible && b.text).map(b => ({
        text: b.text,
        ariaLabel: b.ariaLabel,
        type: b.type
      })),
      inputs: data.inputs.filter(i => i.visible).map(i => ({
        type: i.type,
        placeholder: i.placeholder,
        ariaLabel: i.ariaLabel,
        min: i.min,
        max: i.max
      })),
      textareas: data.textareas.map(t => ({
        placeholder: t.placeholder,
        ariaLabel: t.ariaLabel
      })),
      tabs: data.tabs.map(t => ({
        text: t.text,
        selected: t.selected
      })),
      chips: data.chips.filter(c => c.text).map(c => c.text),
      sliders: data.sliders.map(s => ({
        ariaLabel: s.ariaLabel,
        min: s.min,
        max: s.max,
        value: s.value
      }))
    };

    fs.writeFileSync('suno-interface-simplified.json', JSON.stringify(simplifiedData, null, 2));
    console.log('💾 Versão simplificada salva em: suno-interface-simplified.json');

    console.log('\n🎉 Scraping concluído com sucesso!');

  } catch (error) {
    console.error('\n❌ Erro durante o scraping:');
    console.error(error.message);
    console.error(error.stack);
    
    // Tira screenshot para debug
    try {
      await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
      console.log('📸 Screenshot de erro salvo em: error-screenshot.png');
    } catch (e) {
      console.error('Não foi possível salvar screenshot de erro');
    }
  } finally {
    await browser.close();
    console.log('\n👋 Navegador fechado.');
  }
})();

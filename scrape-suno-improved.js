const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  console.log('🚀 Iniciando Puppeteer com configurações anti-detecção...');
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process'
    ]
  });
  
  const page = await browser.newPage();
  
  // Configurações para evitar detecção
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  await page.setViewport({ width: 1920, height: 1080 });
  
  // Remove automation flags
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    window.navigator.chrome = { runtime: {} };
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
  });

  try {
    console.log('🔐 Acessando Suno.com...');
    await page.goto('https://suno.com', { 
      waitUntil: 'networkidle2', 
      timeout: 90000 
    });
    
    // Aguarda extra para Cloudflare
    console.log('⏳ Aguardando verificações de segurança (15s)...');
    await new Promise(r => setTimeout(r, 15000));
    
    console.log('📸 Screenshot 1: Homepage');
    await page.screenshot({ path: '1-homepage.png', fullPage: true });

    // Clica em Sign In
    console.log('\n🖱️  Clicando em "Sign In"...');
    await page.waitForSelector('button, a', { timeout: 10000 });
    
    const signInClicked = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('button, a'));
      const signIn = elements.find(el => {
        const text = el.textContent?.trim().toLowerCase() || '';
        return text === 'sign in' || text === 'log in';
      });
      if (signIn) {
        signIn.click();
        return true;
      }
      return false;
    });

    if (!signInClicked) {
      console.log('❌ Botão Sign In não encontrado');
      await page.screenshot({ path: 'error-no-signin.png', fullPage: true });
      throw new Error('Sign In button not found');
    }

    await new Promise(r => setTimeout(r, 5000));
    console.log('📸 Screenshot 2: Modal de login');
    await page.screenshot({ path: '2-login-modal.png', fullPage: true });

    // Aguarda o campo de país aparecer
    console.log('\n⏳ Aguardando campos de login carregarem...');
    await page.waitForSelector('input', { timeout: 10000 });
    await new Promise(r => setTimeout(r, 2000));

    // Clica no dropdown de país
    console.log('🌍 Clicando no dropdown de país...');
    const dropdownClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const countryBtn = buttons.find(btn => 
        btn.className.includes('countryCode') || 
        btn.textContent?.trim() === 'gb' ||
        btn.textContent?.trim() === 'us'
      );
      if (countryBtn) {
        countryBtn.click();
        return true;
      }
      return false;
    });

    if (dropdownClicked) {
      console.log('✅ Dropdown aberto');
      await new Promise(r => setTimeout(r, 3000));
      
      console.log('📸 Screenshot 3: Dropdown de países');
      await page.screenshot({ path: '3-country-dropdown.png', fullPage: true });

      // Digita "portugal" para buscar
      console.log('🇵🇹 Digitando "portugal"...');
      await page.keyboard.type('portugal', { delay: 150 });
      await new Promise(r => setTimeout(r, 2000));
      
      // Clica em Portugal
      await page.evaluate(() => {
        const options = Array.from(document.querySelectorAll('*'));
        const portugal = options.find(el => {
          const text = el.textContent?.trim().toLowerCase() || '';
          return (text.includes('portugal') || text.includes('+351')) && 
                 el.offsetParent !== null;
        });
        if (portugal) portugal.click();
      });
      
      console.log('✅ Portugal selecionado');
      await new Promise(r => setTimeout(r, 2000));
    }

    console.log('📸 Screenshot 4: País selecionado');
    await page.screenshot({ path: '4-country-selected.png', fullPage: true });

    // Preenche número
    console.log('\n📱 Preenchendo número 968508709...');
    await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const phoneInput = inputs.find(inp => {
        const placeholder = inp.placeholder?.toLowerCase() || '';
        const name = inp.name?.toLowerCase() || '';
        return (placeholder.includes('phone') || placeholder.includes('number') || name.includes('phone')) &&
               inp.type === 'tel';
      });
      if (phoneInput) {
        phoneInput.focus();
        phoneInput.click();
      }
    });
    
    await new Promise(r => setTimeout(r, 500));
    await page.keyboard.type('968508709', { delay: 150 });
    console.log('✅ Número inserido');
    
    await new Promise(r => setTimeout(r, 2000));
    console.log('📸 Screenshot 5: Número preenchido');
    await page.screenshot({ path: '5-number-filled.png', fullPage: true });

    // Clica Continue
    console.log('\n🖱️  Clicando em Continue...');
    const continueClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const continueBtn = buttons.find(btn => {
        const text = btn.textContent?.trim().toLowerCase() || '';
        return text === 'continue' && !btn.disabled;
      });
      if (continueBtn) {
        continueBtn.click();
        return true;
      }
      return false;
    });

    if (!continueClicked) {
      console.log('❌ Botão Continue não encontrado');
      await page.screenshot({ path: 'error-no-continue.png', fullPage: true });
      throw new Error('Continue button not found');
    }

    console.log('✅ Continue clicado');
    await new Promise(r => setTimeout(r, 5000));
    
    console.log('📸 Screenshot 6: Após Continue');
    await page.screenshot({ path: '6-after-continue.png', fullPage: true });

    // Solicita código
    console.log('\n⏸️  ════════════════════════════════════════');
    console.log('📱 CÓDIGO DE VERIFICAÇÃO');
    console.log('════════════════════════════════════════');
    console.log('✅ País: Portugal (+351)');
    console.log('✅ Número: 968508709');
    console.log('');

    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const code = await new Promise((resolve) => {
      rl.question('🔢 Digite o código de 6 dígitos: ', (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    });

    console.log(`\n✅ Código: ${code}`);
    console.log('📝 Preenchendo...');

    // Aguarda campos de código aparecerem
    await page.waitForSelector('input', { timeout: 10000 });
    await new Promise(r => setTimeout(r, 1000));

    // Preenche código
    await page.evaluate((verificationCode) => {
      const inputs = Array.from(document.querySelectorAll('input[type="text"], input[type="tel"], input[inputmode="numeric"]'));
      
      if (inputs.length >= verificationCode.length) {
        // Campos separados
        for (let i = 0; i < verificationCode.length; i++) {
          if (inputs[i]) {
            inputs[i].value = verificationCode[i];
            inputs[i].dispatchEvent(new Event('input', { bubbles: true }));
            inputs[i].dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
      } else if (inputs.length === 1) {
        // Campo único
        inputs[0].value = verificationCode;
        inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
        inputs[0].dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, code);

    console.log('✅ Código preenchido');
    await new Promise(r => setTimeout(r, 3000));
    
    console.log('📸 Screenshot 7: Código inserido');
    await page.screenshot({ path: '7-code-filled.png', fullPage: true });

    // Aguarda redirecionamento automático ou clica Verify
    console.log('⏳ Aguardando verificação (15s)...');
    
    // Tenta clicar em verify se existir
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const verifyBtn = buttons.find(b => {
        const text = b.textContent?.trim().toLowerCase() || '';
        return (text.includes('verify') || text.includes('confirm')) && !b.disabled;
      });
      if (verifyBtn) verifyBtn.click();
    });
    
    await new Promise(r => setTimeout(r, 15000));
    
    console.log('📸 Screenshot 8: Após verificação');
    await page.screenshot({ path: '8-after-verify.png', fullPage: true });

    // Navega para /create com retry
    console.log('\n🎵 Navegando para /create...');
    let attempts = 0;
    let success = false;
    
    while (attempts < 3 && !success) {
      try {
        await page.goto('https://suno.com/create', { 
          waitUntil: 'networkidle2', 
          timeout: 60000 
        });
        
        // Aguarda Cloudflare
        await new Promise(r => setTimeout(r, 10000));
        
        const currentUrl = page.url();
        const title = await page.title();
        
        console.log(`📍 URL: ${currentUrl}`);
        console.log(`📄 Título: ${title}`);
        
        if (!title.includes('Just a moment') && currentUrl.includes('suno.com')) {
          success = true;
        } else {
          console.log(`⚠️  Ainda em verificação (tentativa ${attempts + 1}/3)`);
          await new Promise(r => setTimeout(r, 15000));
        }
      } catch (err) {
        console.log(`❌ Erro na tentativa ${attempts + 1}: ${err.message}`);
      }
      attempts++;
    }

    if (!success) {
      console.log('❌ Não conseguiu passar verificação Cloudflare');
      await page.screenshot({ path: 'error-cloudflare.png', fullPage: true });
      throw new Error('Cloudflare verification failed');
    }

    console.log('✅ Página /create carregada!');
    await new Promise(r => setTimeout(r, 5000));
    
    console.log('📸 Screenshot 9: Página Create');
    await page.screenshot({ path: '9-create-page.png', fullPage: true });

    // Extração
    console.log('\n📊 Extraindo elementos...');
    
    const data = await page.evaluate(() => {
      return {
        pageInfo: {
          title: document.title,
          url: window.location.href
        },
        buttons: Array.from(document.querySelectorAll('button')).map(b => ({
          text: b.innerText?.trim(),
          ariaLabel: b.getAttribute('aria-label'),
          className: b.className
        })).filter(b => b.text || b.ariaLabel),
        
        inputs: Array.from(document.querySelectorAll('input')).map(i => ({
          type: i.type,
          placeholder: i.placeholder,
          ariaLabel: i.getAttribute('aria-label'),
          name: i.name,
          min: i.min,
          max: i.max
        })),
        
        textareas: Array.from(document.querySelectorAll('textarea')).map(t => ({
          placeholder: t.placeholder,
          ariaLabel: t.getAttribute('aria-label')
        })),
        
        tabs: Array.from(document.querySelectorAll('[role="tab"]')).map(t => ({
          text: t.textContent?.trim(),
          selected: t.getAttribute('aria-selected') === 'true'
        })),
        
        chips: Array.from(document.querySelectorAll('[role="option"], .chip, .tag')).map(c => 
          c.textContent?.trim()
        ).filter(t => t && t.length < 50)
      };
    });

    console.log('\n✅ Dados extraídos:');
    console.log(`   - Botões: ${data.buttons.length}`);
    console.log(`   - Inputs: ${data.inputs.length}`);
    console.log(`   - Textareas: ${data.textareas.length}`);
    console.log(`   - Tabs: ${data.tabs.length}`);
    console.log(`   - Chips: ${data.chips.length}`);

    fs.writeFileSync('suno-interface-data.json', JSON.stringify(data, null, 2));
    console.log('\n💾 suno-interface-data.json');

    fs.writeFileSync('suno-interface-simplified.json', JSON.stringify({
      buttons: data.buttons.map(b => b.text || b.ariaLabel).filter(Boolean),
      inputPlaceholders: data.inputs.map(i => i.placeholder).filter(Boolean),
      textareas: data.textareas.map(t => t.placeholder).filter(Boolean),
      tabs: data.tabs.map(t => t.text),
      chips: data.chips
    }, null, 2));
    console.log('💾 suno-interface-simplified.json');

    console.log('\n🎉 CONCLUÍDO!');

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    await page.screenshot({ path: 'error-final.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();

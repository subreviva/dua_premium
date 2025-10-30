const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  console.log('🚀 Iniciando Puppeteer...');
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    console.log('🔐 Acessando Suno.com...');
    await page.goto('https://suno.com', { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(r => setTimeout(r, 3000));

    console.log('📸 Screenshot inicial...');
    await page.screenshot({ path: 'step1-homepage.png', fullPage: true });

    // Clica em Sign In
    console.log('\n🖱️  Clicando em Sign In...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a'));
      const signInBtn = buttons.find(b => b.textContent?.trim().toLowerCase().includes('sign in'));
      if (signInBtn) signInBtn.click();
    });

    await new Promise(r => setTimeout(r, 3000));
    console.log('📸 Screenshot após Sign In...');
    await page.screenshot({ path: 'step2-login-modal.png', fullPage: true });

    // Procura por dropdown/select de país
    console.log('\n🌍 Procurando seletor de país...');
    
    // Verifica todos os selects e buttons que podem ser dropdown de país
    const countrySelectors = await page.evaluate(() => {
      const selects = Array.from(document.querySelectorAll('select'));
      const buttons = Array.from(document.querySelectorAll('button[role="combobox"], button[aria-haspopup="listbox"], [class*="country"], [class*="flag"]'));
      
      return {
        selects: selects.map(s => ({
          name: s.name,
          id: s.id,
          className: s.className,
          options: Array.from(s.options).slice(0, 5).map(o => o.textContent?.trim())
        })),
        buttons: buttons.map(b => ({
          text: b.textContent?.trim(),
          ariaLabel: b.getAttribute('aria-label'),
          className: b.className,
          role: b.getAttribute('role')
        }))
      };
    });

    console.log('\n📋 Selects encontrados:', JSON.stringify(countrySelectors.selects, null, 2));
    console.log('\n📋 Buttons de dropdown:', JSON.stringify(countrySelectors.buttons, null, 2));

    // Tenta encontrar e clicar no dropdown de país
    const countryDropdownClicked = await page.evaluate(() => {
      // Procura por elementos com indicativo ou bandeira
      const candidates = Array.from(document.querySelectorAll('button, div, span')).filter(el => {
        const text = el.textContent?.trim() || '';
        const className = el.className || '';
        return text.includes('+') || 
               className.includes('country') || 
               className.includes('flag') ||
               el.getAttribute('role') === 'combobox';
      });

      console.log('Candidates:', candidates.map(c => ({ text: c.textContent?.trim(), class: c.className })));

      // Tenta clicar no primeiro candidato
      if (candidates.length > 0) {
        candidates[0].click();
        return true;
      }
      return false;
    });

    if (countryDropdownClicked) {
      console.log('✓ Clicou no dropdown de país');
      await new Promise(r => setTimeout(r, 2000));
      
      console.log('📸 Screenshot após abrir dropdown...');
      await page.screenshot({ path: 'step3-country-dropdown.png', fullPage: true });

      // Procura e seleciona Portugal
      console.log('🇵🇹 Procurando Portugal na lista...');
      
      const portugalSelected = await page.evaluate(() => {
        // Procura todas as opções visíveis
        const options = Array.from(document.querySelectorAll('[role="option"], li, div[class*="option"], div[class*="item"]'));
        
        console.log('Options found:', options.length);
        
        // Procura por Portugal ou +351
        const portugalOption = options.find(opt => {
          const text = opt.textContent?.trim() || '';
          return text.toLowerCase().includes('portugal') || text.includes('+351');
        });

        if (portugalOption) {
          console.log('Found Portugal:', portugalOption.textContent);
          portugalOption.click();
          return true;
        }
        return false;
      });

      if (portugalSelected) {
        console.log('✓ Portugal selecionado (+351)');
        await new Promise(r => setTimeout(r, 1000));
      } else {
        console.log('⚠️  Portugal não encontrado, continuando...');
      }
    }

    console.log('📸 Screenshot após selecionar país...');
    await page.screenshot({ path: 'step4-after-country.png', fullPage: true });

    // Agora preenche o número de telefone (SEM indicativo)
    console.log('\n📱 Preenchendo número: 968508709');
    
    const phoneFilled = await page.evaluate(() => {
      // Procura campo de telefone
      const phoneInputs = Array.from(document.querySelectorAll('input[type="tel"], input[name*="phone"], input[placeholder*="phone" i], input[placeholder*="number" i]'));
      
      console.log('Phone inputs found:', phoneInputs.length);
      
      if (phoneInputs.length > 0) {
        const phoneInput = phoneInputs[0];
        phoneInput.focus();
        phoneInput.value = '968508709';
        phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
        phoneInput.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
      return false;
    });

    if (phoneFilled) {
      console.log('✓ Número preenchido');
    } else {
      console.log('⚠️  Campo de telefone não encontrado');
    }

    await new Promise(r => setTimeout(r, 2000));
    console.log('📸 Screenshot após preencher número...');
    await page.screenshot({ path: 'step5-phone-filled.png', fullPage: true });

    // Clica em Continue/Next
    console.log('\n🖱️  Procurando botão Continue...');
    
    const continueClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const continueBtn = buttons.find(b => {
        const text = b.textContent?.trim().toLowerCase() || '';
        return (text === 'continue' || text === 'next' || text === 'send code') && !b.disabled;
      });

      if (continueBtn) {
        console.log('Found continue button:', continueBtn.textContent);
        continueBtn.click();
        return true;
      }
      return false;
    });

    if (continueClicked) {
      console.log('✓ Clicou em Continue');
      await new Promise(r => setTimeout(r, 3000));
      
      console.log('📸 Screenshot após Continue...');
      await page.screenshot({ path: 'step6-after-continue.png', fullPage: true });

      console.log('\n⏸️  ════════════════════════════════════════');
      console.log('📱 VERIFICAÇÃO DE CÓDIGO');
      console.log('════════════════════════════════════════');
      console.log('');
      console.log('Código enviado para: +351 968508709');
      console.log('');

      // Aguarda código
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

      console.log(`\n✓ Código recebido: ${code}`);
      console.log('📝 Preenchendo código...');

      // Preenche código
      const codeFilled = await page.evaluate((verificationCode) => {
        const codeInputs = Array.from(document.querySelectorAll('input[type="text"], input[type="tel"], input[type="number"]'));
        
        console.log('Code inputs found:', codeInputs.length);
        
        if (codeInputs.length === 1) {
          // Um único campo
          codeInputs[0].value = verificationCode;
          codeInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
          return true;
        } else if (codeInputs.length === verificationCode.length) {
          // Um campo por dígito
          for (let i = 0; i < verificationCode.length; i++) {
            codeInputs[i].value = verificationCode[i];
            codeInputs[i].dispatchEvent(new Event('input', { bubbles: true }));
          }
          return true;
        }
        return false;
      }, code);

      if (codeFilled) {
        console.log('✓ Código preenchido');
        await new Promise(r => setTimeout(r, 2000));
        
        console.log('📸 Screenshot após código...');
        await page.screenshot({ path: 'step7-code-filled.png', fullPage: true });

        // Clica em Verify/Confirm
        const verifyClicked = await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const verifyBtn = buttons.find(b => {
            const text = b.textContent?.trim().toLowerCase() || '';
            return (text.includes('verify') || text.includes('confirm') || text.includes('continue')) && !b.disabled;
          });

          if (verifyBtn) {
            verifyBtn.click();
            return true;
          }
          return false;
        });

        if (verifyClicked) {
          console.log('✓ Clicou em Verify');
          await new Promise(r => setTimeout(r, 5000));
          console.log('✓ Login completo!');
        }
      }
    }

    // Navega para /create
    console.log('\n🎵 Navegando para /create...');
    await page.goto('https://suno.com/create', { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(r => setTimeout(r, 5000));

    console.log('📸 Screenshot final da página Create...');
    await page.screenshot({ path: 'suno-create-final.png', fullPage: true });

    // Extração completa
    console.log('\n📊 Extraindo todos os elementos da interface...');
    
    const data = await page.evaluate(() => {
      return {
        buttons: Array.from(document.querySelectorAll('button')).map(b => ({
          text: b.innerText?.trim(),
          ariaLabel: b.getAttribute('aria-label'),
          className: b.className,
          disabled: b.disabled
        })).filter(b => b.text || b.ariaLabel),
        
        inputs: Array.from(document.querySelectorAll('input')).map(i => ({
          type: i.type,
          placeholder: i.placeholder,
          ariaLabel: i.getAttribute('aria-label'),
          name: i.name,
          id: i.id,
          min: i.min,
          max: i.max,
          value: i.value
        })),
        
        textareas: Array.from(document.querySelectorAll('textarea')).map(t => ({
          placeholder: t.placeholder,
          ariaLabel: t.getAttribute('aria-label'),
          name: t.name,
          rows: t.rows
        })),
        
        selects: Array.from(document.querySelectorAll('select')).map(s => ({
          name: s.name,
          options: Array.from(s.options).map(o => o.textContent?.trim())
        })),
        
        tabs: Array.from(document.querySelectorAll('[role="tab"]')).map(t => ({
          text: t.textContent?.trim(),
          selected: t.getAttribute('aria-selected') === 'true'
        })),
        
        chips: Array.from(document.querySelectorAll('[role="option"], .chip, .tag, [class*="chip"], [class*="tag"]'))
          .map(c => c.textContent?.trim())
          .filter(t => t && t.length > 0 && t.length < 50),
        
        sliders: Array.from(document.querySelectorAll('input[type="range"]')).map(s => ({
          ariaLabel: s.getAttribute('aria-label'),
          min: s.min,
          max: s.max,
          value: s.value
        })),
        
        labels: Array.from(document.querySelectorAll('label')).map(l => ({
          text: l.textContent?.trim(),
          for: l.getAttribute('for')
        })).filter(l => l.text)
      };
    });

    console.log('\n✅ Extração completa!');
    console.log(`   - Botões: ${data.buttons.length}`);
    console.log(`   - Inputs: ${data.inputs.length}`);
    console.log(`   - Textareas: ${data.textareas.length}`);
    console.log(`   - Selects: ${data.selects.length}`);
    console.log(`   - Tabs: ${data.tabs.length}`);
    console.log(`   - Chips: ${data.chips.length}`);
    console.log(`   - Sliders: ${data.sliders.length}`);
    console.log(`   - Labels: ${data.labels.length}`);

    fs.writeFileSync('suno-interface-data.json', JSON.stringify(data, null, 2));
    console.log('\n💾 Dados completos: suno-interface-data.json');

    const simplified = {
      buttons: data.buttons.map(b => b.text || b.ariaLabel).filter(Boolean),
      inputPlaceholders: data.inputs.map(i => i.placeholder).filter(Boolean),
      textareaPlaceholders: data.textareas.map(t => t.placeholder).filter(Boolean),
      tabs: data.tabs.map(t => t.text),
      chips: data.chips,
      sliders: data.sliders.map(s => s.ariaLabel).filter(Boolean)
    };

    fs.writeFileSync('suno-interface-simplified.json', JSON.stringify(simplified, null, 2));
    console.log('💾 Versão simplificada: suno-interface-simplified.json');

    console.log('\n🎉 Scraping concluído com sucesso!');

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    console.error(error.stack);
    await page.screenshot({ path: 'error-final.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('\n👋 Concluído!');
  }
})();

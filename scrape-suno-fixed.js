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

    console.log('📸 Screenshot 1: Homepage');
    await page.screenshot({ path: '1-homepage.png', fullPage: true });

    // Clica em Sign In
    console.log('\n🖱️  Clicando em "Sign In"...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a'));
      const signInBtn = buttons.find(b => {
        const text = b.textContent?.trim().toLowerCase() || '';
        return text === 'sign in' || text === 'log in';
      });
      if (signInBtn) signInBtn.click();
    });

    await new Promise(r => setTimeout(r, 3000));
    console.log('📸 Screenshot 2: Modal de login aberto');
    await page.screenshot({ path: '2-login-modal.png', fullPage: true });

    // Passo 1: Clicar no dropdown de país (botão com "gb")
    console.log('\n🌍 PASSO 1: Clicando no dropdown de país (gb)...');
    const countryDropdownClicked = await page.evaluate(() => {
      // Procura o botão com classe de country code
      const countryButton = Array.from(document.querySelectorAll('button')).find(btn => {
        return btn.className.includes('countryCode') || btn.textContent?.trim() === 'gb';
      });
      
      if (countryButton) {
        console.log('Found country button:', countryButton.textContent);
        countryButton.click();
        return true;
      }
      return false;
    });

    if (!countryDropdownClicked) {
      console.log('❌ Dropdown de país não encontrado!');
      await page.screenshot({ path: 'error-no-dropdown.png', fullPage: true });
      throw new Error('Country dropdown not found');
    }

    console.log('✅ Dropdown de país aberto!');
    await new Promise(r => setTimeout(r, 2000));
    
    console.log('📸 Screenshot 3: Dropdown de países aberto');
    await page.screenshot({ path: '3-country-dropdown-open.png', fullPage: true });

    // Passo 2: Procurar e clicar em Portugal
    console.log('\n🇵🇹 PASSO 2: Procurando Portugal na lista...');
    
    const portugalClicked = await page.evaluate(() => {
      // Procura em várias possibilidades
      const allElements = Array.from(document.querySelectorAll('li, div[role="option"], button, [class*="option"], [class*="item"]'));
      
      console.log('Total elements to check:', allElements.length);
      
      // Procura por Portugal ou +351
      const portugalElement = allElements.find(el => {
        const text = el.textContent?.trim() || '';
        const lowerText = text.toLowerCase();
        return lowerText.includes('portugal') || text.includes('+351') || lowerText === 'pt';
      });

      if (portugalElement) {
        console.log('Found Portugal element:', portugalElement.textContent);
        portugalElement.click();
        return true;
      }
      
      // Se não encontrou, tenta procurar por data attributes
      const portugalByData = allElements.find(el => {
        const dataValue = el.getAttribute('data-value');
        const dataCountry = el.getAttribute('data-country');
        return dataValue === 'pt' || dataCountry === 'portugal' || dataValue === '+351';
      });
      
      if (portugalByData) {
        console.log('Found Portugal by data attr');
        portugalByData.click();
        return true;
      }
      
      return false;
    });

    if (!portugalClicked) {
      console.log('⚠️  Portugal não encontrado automaticamente');
      console.log('📝 Tentando digitar "portugal" no campo de busca...');
      
      // Tenta digitar no campo de busca se houver
      await page.keyboard.type('portugal');
      await new Promise(r => setTimeout(r, 1000));
      
      // Tenta clicar novamente
      await page.evaluate(() => {
        const portugalElement = Array.from(document.querySelectorAll('*')).find(el => {
          const text = el.textContent?.trim().toLowerCase() || '';
          return text.includes('portugal') && el.offsetParent !== null;
        });
        if (portugalElement) portugalElement.click();
      });
    }

    console.log('✅ Portugal selecionado (+351)');
    await new Promise(r => setTimeout(r, 2000));
    
    console.log('📸 Screenshot 4: Após selecionar Portugal');
    await page.screenshot({ path: '4-portugal-selected.png', fullPage: true });

    // Passo 3: Preencher APENAS o número (sem indicativo)
    console.log('\n📱 PASSO 3: Preenchendo número 968508709...');
    
    const phoneField = await page.evaluate(() => {
      // Procura o input de telefone (não o de country code)
      const inputs = Array.from(document.querySelectorAll('input'));
      const phoneInput = inputs.find(inp => {
        const type = inp.type;
        const name = inp.name || '';
        const id = inp.id || '';
        const placeholder = inp.placeholder?.toLowerCase() || '';
        
        // Deve ser tipo tel ou ter indicação de phone/number, mas NÃO ser o country code
        return (type === 'tel' || 
                placeholder.includes('phone') || 
                placeholder.includes('number') ||
                name.includes('phone')) &&
               !name.includes('country') &&
               !id.includes('country');
      });
      
      if (phoneInput) {
        console.log('Found phone input:', phoneInput.name, phoneInput.placeholder);
        phoneInput.focus();
        phoneInput.click();
        return true;
      }
      return false;
    });

    if (phoneField) {
      // Limpa o campo primeiro
      await page.keyboard.down('Control');
      await page.keyboard.press('A');
      await page.keyboard.up('Control');
      await page.keyboard.press('Backspace');
      
      // Digita o número
      await page.keyboard.type('968508709', { delay: 100 });
      console.log('✅ Número digitado: 968508709');
    } else {
      console.log('⚠️  Campo de telefone não encontrado');
    }

    await new Promise(r => setTimeout(r, 2000));
    console.log('📸 Screenshot 5: Número preenchido');
    await page.screenshot({ path: '5-phone-filled.png', fullPage: true });

    // Passo 4: Clicar em Continue
    console.log('\n🖱️  PASSO 4: Clicando em Continue...');
    
    const continueClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const continueBtn = buttons.find(btn => {
        const text = btn.textContent?.trim().toLowerCase() || '';
        return text === 'continue' && !btn.disabled;
      });
      
      if (continueBtn) {
        console.log('Found Continue button');
        continueBtn.click();
        return true;
      }
      return false;
    });

    if (!continueClicked) {
      console.log('❌ Botão Continue não encontrado!');
      await page.screenshot({ path: 'error-no-continue.png', fullPage: true });
      throw new Error('Continue button not found');
    }

    console.log('✅ Clicou em Continue');
    await new Promise(r => setTimeout(r, 4000));
    
    console.log('📸 Screenshot 6: Após clicar Continue');
    await page.screenshot({ path: '6-after-continue.png', fullPage: true });

    // Verificar se código foi solicitado
    console.log('\n⏸️  ════════════════════════════════════════');
    console.log('📱 VERIFICAÇÃO DE CÓDIGO');
    console.log('════════════════════════════════════════');
    console.log('');
    console.log('✅ País: Portugal (+351)');
    console.log('✅ Número: 968508709');
    console.log('');
    console.log('Verifica o teu telemóvel agora!');
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

    console.log(`\n✅ Código recebido: ${code}`);
    console.log('📝 Preenchendo código...');

    // Preenche os campos de código
    await page.evaluate((verificationCode) => {
      const codeInputs = Array.from(document.querySelectorAll('input[type="text"], input[type="tel"], input[inputmode="numeric"]'));
      
      console.log('Code inputs found:', codeInputs.length);
      
      if (codeInputs.length >= verificationCode.length) {
        // Múltiplos campos (um por dígito)
        for (let i = 0; i < verificationCode.length; i++) {
          if (codeInputs[i]) {
            codeInputs[i].focus();
            codeInputs[i].value = verificationCode[i];
            codeInputs[i].dispatchEvent(new Event('input', { bubbles: true }));
          }
        }
      } else if (codeInputs.length === 1) {
        // Um único campo
        codeInputs[0].focus();
        codeInputs[0].value = verificationCode;
        codeInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, code);

    console.log('✅ Código preenchido');
    await new Promise(r => setTimeout(r, 2000));
    
    console.log('📸 Screenshot 7: Código preenchido');
    await page.screenshot({ path: '7-code-filled.png', fullPage: true });

    // Aguarda um pouco para o login completar automaticamente
    console.log('⏳ Aguardando login completar...');
    await new Promise(r => setTimeout(r, 5000));

    console.log('📸 Screenshot 8: Após login');
    await page.screenshot({ path: '8-after-login.png', fullPage: true });

    // Navega para /create
    console.log('\n🎵 Navegando para https://suno.com/create...');
    await page.goto('https://suno.com/create', { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(r => setTimeout(r, 5000));

    console.log('📸 Screenshot 9: Página Create');
    await page.screenshot({ path: '9-create-page.png', fullPage: true });

    // EXTRAÇÃO COMPLETA
    console.log('\n📊 Extraindo TODOS os elementos da interface...');
    
    const data = await page.evaluate(() => {
      return {
        pageInfo: {
          title: document.title,
          url: window.location.href
        },
        buttons: Array.from(document.querySelectorAll('button')).map(b => ({
          text: b.innerText?.trim(),
          ariaLabel: b.getAttribute('aria-label'),
          className: b.className,
          disabled: b.disabled,
          type: b.type
        })).filter(b => b.text || b.ariaLabel),
        
        inputs: Array.from(document.querySelectorAll('input')).map(i => ({
          type: i.type,
          placeholder: i.placeholder,
          ariaLabel: i.getAttribute('aria-label'),
          name: i.name,
          id: i.id,
          min: i.min,
          max: i.max,
          step: i.step,
          value: i.value,
          className: i.className
        })),
        
        textareas: Array.from(document.querySelectorAll('textarea')).map(t => ({
          placeholder: t.placeholder,
          ariaLabel: t.getAttribute('aria-label'),
          name: t.name,
          rows: t.rows,
          maxLength: t.maxLength,
          value: t.value
        })),
        
        selects: Array.from(document.querySelectorAll('select')).map(s => ({
          name: s.name,
          id: s.id,
          options: Array.from(s.options).map(o => ({
            text: o.textContent?.trim(),
            value: o.value,
            selected: o.selected
          }))
        })),
        
        tabs: Array.from(document.querySelectorAll('[role="tab"], [data-state="active"], [data-state="inactive"]')).map(t => ({
          text: t.textContent?.trim(),
          selected: t.getAttribute('aria-selected') === 'true' || t.getAttribute('data-state') === 'active',
          ariaLabel: t.getAttribute('aria-label'),
          dataState: t.getAttribute('data-state')
        })),
        
        chips: Array.from(document.querySelectorAll('[role="option"], .chip, .tag, [class*="chip"], [class*="tag"], [class*="badge"]'))
          .map(c => ({
            text: c.textContent?.trim(),
            className: c.className,
            selected: c.getAttribute('aria-selected') === 'true'
          }))
          .filter(c => c.text && c.text.length > 0 && c.text.length < 50),
        
        sliders: Array.from(document.querySelectorAll('input[type="range"]')).map(s => ({
          ariaLabel: s.getAttribute('aria-label'),
          name: s.name,
          min: s.min,
          max: s.max,
          value: s.value,
          step: s.step
        })),
        
        labels: Array.from(document.querySelectorAll('label')).map(l => ({
          text: l.textContent?.trim(),
          for: l.getAttribute('for')
        })).filter(l => l.text),
        
        checkboxes: Array.from(document.querySelectorAll('input[type="checkbox"]')).map(c => ({
          name: c.name,
          checked: c.checked,
          ariaLabel: c.getAttribute('aria-label')
        })),
        
        headers: Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
          level: h.tagName,
          text: h.textContent?.trim()
        })).filter(h => h.text)
      };
    });

    console.log('\n✅ EXTRAÇÃO COMPLETA!');
    console.log('\n📊 Estatísticas:');
    console.log(`   - Botões: ${data.buttons.length}`);
    console.log(`   - Inputs: ${data.inputs.length}`);
    console.log(`   - Textareas: ${data.textareas.length}`);
    console.log(`   - Selects: ${data.selects.length}`);
    console.log(`   - Tabs: ${data.tabs.length}`);
    console.log(`   - Chips/Tags: ${data.chips.length}`);
    console.log(`   - Sliders: ${data.sliders.length}`);
    console.log(`   - Labels: ${data.labels.length}`);
    console.log(`   - Checkboxes: ${data.checkboxes.length}`);
    console.log(`   - Headers: ${data.headers.length}`);

    // Salva dados completos
    fs.writeFileSync('suno-interface-data.json', JSON.stringify(data, null, 2));
    console.log('\n💾 Dados completos salvos: suno-interface-data.json');

    // Salva versão simplificada
    const simplified = {
      buttons: data.buttons.map(b => b.text || b.ariaLabel).filter(Boolean),
      inputPlaceholders: data.inputs.map(i => i.placeholder || i.ariaLabel).filter(Boolean),
      textareaPlaceholders: data.textareas.map(t => t.placeholder || t.ariaLabel).filter(Boolean),
      tabs: data.tabs.map(t => ({ text: t.text, selected: t.selected })),
      styleChips: data.chips.map(c => c.text),
      sliders: data.sliders.map(s => ({ label: s.ariaLabel, min: s.min, max: s.max })),
      labels: data.labels.map(l => l.text)
    };

    fs.writeFileSync('suno-interface-simplified.json', JSON.stringify(simplified, null, 2));
    console.log('💾 Versão simplificada: suno-interface-simplified.json');

    console.log('\n🎉 SCRAPING CONCLUÍDO COM SUCESSO!');
    console.log('\n📋 Próximos passos:');
    console.log('   1. ✅ Dados extraídos do Suno.com');
    console.log('   2. 🔍 Analisar arquivos JSON gerados');
    console.log('   3. 📝 Comparar com nossa implementação');
    console.log('   4. 🔧 Adicionar elementos faltantes ao Music Studio');

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    console.error(error.stack);
    await page.screenshot({ path: 'error-final.png', fullPage: true });
    console.log('📸 Screenshot de erro salvo: error-final.png');
  } finally {
    await browser.close();
    console.log('\n👋 Navegador fechado!');
  }
})();

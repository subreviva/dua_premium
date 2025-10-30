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

    // Procura botão de Sign In / Log In
    console.log('\n🔍 Procurando botão de login...');
    const buttons = await page.$$eval('button, a', elements => 
      elements.map(el => ({
        text: el.textContent?.trim() || '',
        tag: el.tagName,
        href: el.href || null
      })).filter(b => b.text)
    );

    console.log('\n📋 Botões encontrados:');
    buttons.slice(0, 20).forEach((btn, idx) => {
      console.log(`   ${idx + 1}. ${btn.tag}: "${btn.text}"`);
    });

    // Procura e clica no botão de Sign In
    const signInButton = buttons.find(b => 
      b.text.toLowerCase().includes('sign in') || 
      b.text.toLowerCase().includes('log in') ||
      b.text.toLowerCase().includes('login')
    );

    if (signInButton) {
      console.log(`\n✓ Encontrado: "${signInButton.text}"`);
      console.log('🖱️  Clicando no botão de login...');
      
      await page.evaluate((buttonText) => {
        const buttons = Array.from(document.querySelectorAll('button, a'));
        const btn = buttons.find(b => b.textContent?.trim() === buttonText);
        if (btn) btn.click();
      }, signInButton.text);

      await new Promise(r => setTimeout(r, 3000));
      console.log('📸 Screenshot após clicar...');
      await page.screenshot({ path: 'step2-login-page.png', fullPage: true });

      // Verifica se tem campo de telefone/email
      const inputs = await page.$$eval('input', elements =>
        elements.map(el => ({
          type: el.type,
          placeholder: el.placeholder,
          name: el.name,
          id: el.id,
          ariaLabel: el.getAttribute('aria-label')
        }))
      );

      console.log('\n📋 Campos de input encontrados:');
      inputs.forEach((inp, idx) => {
        console.log(`   ${idx + 1}. Type: ${inp.type}, Placeholder: "${inp.placeholder}", Name: ${inp.name}`);
      });

      // Procura campo de telefone/email
      const phoneOrEmailInput = inputs.find(inp => 
        inp.type === 'tel' ||
        inp.type === 'email' ||
        inp.placeholder?.toLowerCase().includes('phone') ||
        inp.placeholder?.toLowerCase().includes('email') ||
        inp.name?.toLowerCase().includes('phone') ||
        inp.name?.toLowerCase().includes('email')
      );

      if (phoneOrEmailInput) {
        console.log(`\n✓ Campo de input encontrado: ${JSON.stringify(phoneOrEmailInput)}`);
        console.log('📱 Preenchendo número: +351968508709');

        // Preenche o número
        await page.evaluate((inputDetails) => {
          let input;
          if (inputDetails.id) {
            input = document.getElementById(inputDetails.id);
          } else if (inputDetails.name) {
            input = document.querySelector(`input[name="${inputDetails.name}"]`);
          } else if (inputDetails.type) {
            input = document.querySelector(`input[type="${inputDetails.type}"]`);
          }
          
          if (input) {
            input.focus();
            input.value = '+351968508709';
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }, phoneOrEmailInput);

        await new Promise(r => setTimeout(r, 2000));
        console.log('📸 Screenshot após preencher número...');
        await page.screenshot({ path: 'step3-phone-filled.png', fullPage: true });

        // Procura botão de Next/Continue/Submit
        const nextButtons = await page.$$eval('button', elements =>
          elements.map(el => ({
            text: el.textContent?.trim() || '',
            type: el.type,
            disabled: el.disabled
          })).filter(b => b.text && !b.disabled)
        );

        console.log('\n📋 Botões disponíveis após preencher:');
        nextButtons.forEach((btn, idx) => {
          console.log(`   ${idx + 1}. "${btn.text}" (type: ${btn.type})`);
        });

        const nextButton = nextButtons.find(b =>
          b.text.toLowerCase().includes('next') ||
          b.text.toLowerCase().includes('continue') ||
          b.text.toLowerCase().includes('submit') ||
          b.text.toLowerCase().includes('send')
        );

        if (nextButton) {
          console.log(`\n✓ Botão Next encontrado: "${nextButton.text}"`);
          console.log('🖱️  Clicando...');

          await page.evaluate((buttonText) => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const btn = buttons.find(b => b.textContent?.trim() === buttonText && !b.disabled);
            if (btn) btn.click();
          }, nextButton.text);

          await new Promise(r => setTimeout(r, 3000));
          console.log('📸 Screenshot após Next...');
          await page.screenshot({ path: 'step4-after-next.png', fullPage: true });

          console.log('\n⏸️  ════════════════════════════════════════');
          console.log('📱 VERIFICAÇÃO DE CÓDIGO NECESSÁRIA');
          console.log('════════════════════════════════════════');
          console.log('');
          console.log('Um código de verificação foi enviado para: +351968508709');
          console.log('');
          console.log('Por favor, forneça o código abaixo:');
          console.log('');

          // Aguarda código do usuário via readline
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

          // Procura campos de código
          const codeInputs = await page.$$('input[type="text"], input[type="tel"], input[type="number"]');
          console.log(`✓ Encontrados ${codeInputs.length} campos`);

          if (codeInputs.length > 0) {
            if (codeInputs.length === 1) {
              // Um campo único para o código completo
              await codeInputs[0].type(code, { delay: 100 });
            } else if (codeInputs.length === code.length) {
              // Um campo por dígito
              for (let i = 0; i < code.length; i++) {
                await codeInputs[i].type(code[i], { delay: 100 });
              }
            } else {
              // Tenta o primeiro campo visível
              await codeInputs[0].type(code, { delay: 100 });
            }

            console.log('✓ Código preenchido');
            await new Promise(r => setTimeout(r, 2000));
            console.log('📸 Screenshot após código...');
            await page.screenshot({ path: 'step5-code-filled.png', fullPage: true });

            // Procura botão de confirmar
            const confirmButtons = await page.$$eval('button', elements =>
              elements.map(el => ({
                text: el.textContent?.trim() || '',
                disabled: el.disabled
              })).filter(b => b.text && !b.disabled)
            );

            const confirmButton = confirmButtons.find(b =>
              b.text.toLowerCase().includes('verify') ||
              b.text.toLowerCase().includes('confirm') ||
              b.text.toLowerCase().includes('submit') ||
              b.text.toLowerCase().includes('continue')
            );

            if (confirmButton) {
              console.log(`✓ Botão confirmar: "${confirmButton.text}"`);
              await page.evaluate((buttonText) => {
                const buttons = Array.from(document.querySelectorAll('button'));
                const btn = buttons.find(b => b.textContent?.trim() === buttonText);
                if (btn) btn.click();
              }, confirmButton.text);

              await new Promise(r => setTimeout(r, 5000));
              console.log('✓ Login completo!');
            }
          }
        }
      }
    } else {
      console.log('\n⚠️  Botão de Sign In não encontrado automaticamente');
    }

    // Navega para /create
    console.log('\n🎵 Navegando para /create...');
    await page.goto('https://suno.com/create', { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(r => setTimeout(r, 5000));

    console.log('📸 Screenshot final...');
    await page.screenshot({ path: 'suno-create-logged.png', fullPage: true });

    // Extração de dados
    console.log('\n📊 Extraindo elementos...');
    const data = await page.evaluate(() => {
      return {
        buttons: Array.from(document.querySelectorAll('button')).map(b => ({
          text: b.innerText?.trim(),
          ariaLabel: b.getAttribute('aria-label'),
          className: b.className
        })).filter(b => b.text),
        
        inputs: Array.from(document.querySelectorAll('input')).map(i => ({
          type: i.type,
          placeholder: i.placeholder,
          ariaLabel: i.getAttribute('aria-label')
        })),
        
        textareas: Array.from(document.querySelectorAll('textarea')).map(t => ({
          placeholder: t.placeholder,
          ariaLabel: t.getAttribute('aria-label')
        })),
        
        tabs: Array.from(document.querySelectorAll('[role="tab"]')).map(t => ({
          text: t.textContent?.trim(),
          selected: t.getAttribute('aria-selected') === 'true'
        })),
        
        chips: Array.from(document.querySelectorAll('[role="option"], .chip, .tag')).map(c => c.textContent?.trim()).filter(t => t && t.length < 50)
      };
    });

    console.log('\n✅ Dados extraídos:');
    console.log(`   - Botões: ${data.buttons.length}`);
    console.log(`   - Inputs: ${data.inputs.length}`);
    console.log(`   - Textareas: ${data.textareas.length}`);
    console.log(`   - Tabs: ${data.tabs.length}`);
    console.log(`   - Chips: ${data.chips.length}`);

    fs.writeFileSync('suno-interface-data.json', JSON.stringify(data, null, 2));
    console.log('\n💾 Dados salvos: suno-interface-data.json');

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    await page.screenshot({ path: 'error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('\n👋 Concluído!');
  }
})();

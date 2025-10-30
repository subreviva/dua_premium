const puppeteer = require('puppeteer');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const PHONE_NUMBER = '+351968508709'; // Número de Portugal

  console.log('🚀 Iniciando Puppeteer...');
  const browser = await puppeteer.launch({ 
    headless: true, // Modo headless para funcionar no Codespaces
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    defaultViewport: { width: 1920, height: 1080 }
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    // Passo 1: Ir para página de login
    console.log('🔐 Acessando página de login do Suno...');
    await page.goto('https://suno.com/login', { waitUntil: 'networkidle2', timeout: 60000 });
    await wait(3000);

    console.log('📸 Screenshot da página de login...');
    await page.screenshot({ path: 'step1-login-page.png', fullPage: true });

    // Passo 2: Procurar botão de login com telefone ou Google
    console.log('🔍 Procurando opções de login...');
    
    // Verifica todos os botões disponíveis
    const loginButtons = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.map(btn => ({
        text: btn.innerText?.trim() || '',
        ariaLabel: btn.getAttribute('aria-label'),
        class: btn.className,
        id: btn.id
      })).filter(btn => btn.text.length > 0);
    });

    console.log('\n📋 Botões de login disponíveis:');
    loginButtons.forEach((btn, idx) => {
      console.log(`   ${idx + 1}. "${btn.text}" (aria-label: ${btn.ariaLabel})`);
    });

    // Procura por botão de continuar com Google (geralmente é a opção padrão)
    const googleButton = loginButtons.find(btn => 
      btn.text.toLowerCase().includes('google') ||
      btn.text.toLowerCase().includes('continue with google')
    );

    if (googleButton) {
      console.log('\n✓ Encontrado botão do Google');
      console.log('🖱️ Clicando no botão "Continue with Google"...');
      
      await page.evaluate((buttonText) => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find(b => b.innerText?.trim() === buttonText);
        if (btn) btn.click();
      }, googleButton.text);

      await wait(3000);
      
      // Aguarda popup ou redirecionamento do Google
      console.log('⏳ Aguardando página de login do Google...');
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
      await wait(2000);

      console.log('📸 Screenshot da página do Google...');
      await page.screenshot({ path: 'step2-google-login.png', fullPage: true });

      // Preenche número de telefone no Google
      console.log('📱 Preenchendo número de telefone no Google...');
      
      // Tenta encontrar o campo de email/telefone
      const emailInputSelectors = [
        'input[type="email"]',
        'input[type="tel"]',
        'input[name="identifier"]',
        'input[id="identifierId"]',
        'input[aria-label*="email" i]',
        'input[aria-label*="phone" i]'
      ];

      let inputField = null;
      for (const selector of emailInputSelectors) {
        try {
          inputField = await page.$(selector);
          if (inputField) {
            console.log(`✓ Campo de input encontrado: ${selector}`);
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (inputField) {
        await inputField.click();
        await wait(500);
        await inputField.type(PHONE_NUMBER, { delay: 100 });
        console.log(`✓ Número preenchido: ${PHONE_NUMBER}`);
        await wait(1000);

        console.log('📸 Screenshot após preencher número...');
        await page.screenshot({ path: 'step3-phone-filled.png', fullPage: true });

        // Clica no botão Next/Seguinte
        const nextButtonSelectors = [
          'button:has-text("Next")',
          'button:has-text("Seguinte")',
          'button[id="identifierNext"]',
          'button[type="button"]'
        ];

        let nextButton = null;
        for (const selector of nextButtonSelectors) {
          try {
            nextButton = await page.$(selector);
            if (nextButton) {
              const isVisible = await page.evaluate(el => {
                return el && el.offsetParent !== null;
              }, nextButton);
              
              if (isVisible) {
                console.log(`✓ Botão Next encontrado: ${selector}`);
                break;
              }
            }
          } catch (e) {
            continue;
          }
        }

        if (nextButton) {
          console.log('🖱️ Clicando em Next...');
          await nextButton.click();
          await wait(3000);

          console.log('📸 Screenshot após clicar em Next...');
          await page.screenshot({ path: 'step4-after-next.png', fullPage: true });

          // Aqui deve aparecer a página para inserir o código
          console.log('\n⏸️  AGUARDANDO CÓDIGO DE VERIFICAÇÃO');
          console.log('📱 Verifica o teu telefone e fornece o código quando chegar.');
          console.log('');

          // Espera pelo código do usuário
          const verificationCode = await askQuestion('🔢 Digite o código de verificação recebido: ');
          
          console.log(`\n✓ Código recebido: ${verificationCode}`);
          console.log('📝 Preenchendo código...');

          // Procura campos de código (pode ser um único input ou múltiplos)
          const codeInputs = await page.$$('input[type="text"], input[type="tel"], input[type="number"]');
          
          if (codeInputs.length > 0) {
            console.log(`✓ Encontrados ${codeInputs.length} campos de código`);
            
            if (codeInputs.length === 1) {
              // Um único campo para o código completo
              await codeInputs[0].type(verificationCode, { delay: 100 });
            } else {
              // Múltiplos campos (um dígito por campo)
              for (let i = 0; i < Math.min(verificationCode.length, codeInputs.length); i++) {
                await codeInputs[i].type(verificationCode[i], { delay: 100 });
              }
            }

            console.log('✓ Código preenchido');
            await wait(1000);

            console.log('📸 Screenshot após preencher código...');
            await page.screenshot({ path: 'step5-code-filled.png', fullPage: true });

            // Procura botão de confirmar/next
            const confirmButton = await page.$('button[type="button"], button[type="submit"]');
            if (confirmButton) {
              console.log('🖱️ Clicando em confirmar...');
              await confirmButton.click();
              await wait(3000);
            }

            // Aguarda navegação para o Suno
            console.log('⏳ Aguardando login completar...');
            await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
            await wait(3000);

            console.log('✓ Login realizado!');
          } else {
            console.error('❌ Campos de código não encontrados!');
            await page.screenshot({ path: 'error-no-code-fields.png', fullPage: true });
          }
        }
      }
    } else {
      console.log('\n⚠️  Botão do Google não encontrado automaticamente.');
      console.log('Por favor, faz login manualmente na janela do navegador que abriu.');
      console.log('Pressiona ENTER quando completares o login...');
      await askQuestion('\n[Pressiona ENTER após fazer login manualmente]');
    }

    // Navegar para página Create
    console.log('\n🎵 Navegando para página Create...');
    await page.goto('https://suno.com/create', { waitUntil: 'networkidle2', timeout: 60000 });
    await wait(5000);

    console.log('📸 Tirando screenshot da página Create...');
    await page.screenshot({ path: 'suno-create-final.png', fullPage: true });

    // Extrair dados da interface
    console.log('\n📊 Extraindo elementos da interface...');
    
    const data = await page.evaluate(() => {
      const getRelevantStyles = (element) => {
        const computed = window.getComputedStyle(element);
        return {
          display: computed.display,
          visibility: computed.visibility,
          backgroundColor: computed.backgroundColor,
          color: computed.color,
          fontSize: computed.fontSize,
          padding: computed.padding
        };
      };

      return {
        buttons: Array.from(document.querySelectorAll('button')).map(btn => ({
          text: btn.innerText?.trim() || '',
          ariaLabel: btn.getAttribute('aria-label'),
          disabled: btn.disabled,
          class: btn.className,
          visible: btn.offsetParent !== null
        })).filter(b => b.visible && b.text),
        
        inputs: Array.from(document.querySelectorAll('input')).map(inp => ({
          type: inp.type,
          placeholder: inp.placeholder,
          ariaLabel: inp.getAttribute('aria-label'),
          min: inp.min,
          max: inp.max,
          value: inp.value,
          visible: inp.offsetParent !== null
        })).filter(i => i.visible),
        
        textareas: Array.from(document.querySelectorAll('textarea')).map(t => ({
          placeholder: t.placeholder,
          ariaLabel: t.getAttribute('aria-label'),
          value: t.value
        })),
        
        tabs: Array.from(document.querySelectorAll('[role="tab"]')).map(t => ({
          text: t.textContent?.trim(),
          selected: t.getAttribute('aria-selected') === 'true'
        })),
        
        chips: Array.from(document.querySelectorAll('[role="option"], .chip, .tag, [class*="chip"], [class*="tag"]'))
          .map(c => c.textContent?.trim())
          .filter(text => text && text.length < 50),
        
        sliders: Array.from(document.querySelectorAll('input[type="range"]')).map(s => ({
          ariaLabel: s.getAttribute('aria-label'),
          min: s.min,
          max: s.max,
          value: s.value,
          step: s.step
        })),

        pageTitle: document.title,
        url: window.location.href
      };
    });

    console.log('\n✅ Extração completa!');
    console.log(`\n📊 Encontrado:`);
    console.log(`   - Botões: ${data.buttons.length}`);
    console.log(`   - Inputs: ${data.inputs.length}`);
    console.log(`   - Textareas: ${data.textareas.length}`);
    console.log(`   - Tabs: ${data.tabs.length}`);
    console.log(`   - Chips/Tags: ${data.chips.length}`);
    console.log(`   - Sliders: ${data.sliders.length}`);

    fs.writeFileSync('suno-interface-data.json', JSON.stringify(data, null, 2));
    console.log('\n💾 Dados salvos em: suno-interface-data.json');

    console.log('\n🎉 Scraping concluído com sucesso!');
    console.log('\n📋 Próximos passos:');
    console.log('   1. Analisar suno-interface-data.json');
    console.log('   2. Comparar com nossa implementação atual');
    console.log('   3. Adicionar elementos faltantes');
    console.log('   4. Ajustar placeholders e labels');

  } catch (error) {
    console.error('\n❌ Erro durante o scraping:');
    console.error(error.message);
    
    try {
      await page.screenshot({ path: 'error-final.png', fullPage: true });
      console.log('📸 Screenshot de erro salvo');
    } catch (e) {}
  } finally {
    rl.close();
    console.log('\n⏳ Aguardando 5 segundos antes de fechar...');
    await wait(5000);
    await browser.close();
    console.log('👋 Navegador fechado.');
  }
})();

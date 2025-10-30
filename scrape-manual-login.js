const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  console.log('🚀 Iniciando Puppeteer em modo visível...');
  console.log('📱 Uma janela do navegador vai abrir para você fazer login');
  console.log('');
  
  // Usar xvfb-run para simular display no Codespaces
  const browser = await puppeteer.launch({ 
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--remote-debugging-port=9222'
    ],
    executablePath: '/home/codespace/.cache/puppeteer/chrome/linux-142.0.7444.59/chrome-linux64/chrome'
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    console.log('🔐 Abrindo página de login do Suno...');
    await page.goto('https://suno.com', { waitUntil: 'networkidle2', timeout: 60000 });
    
    console.log('');
    console.log('============================================');
    console.log('👉 FAÇA LOGIN MANUALMENTE NA JANELA DO NAVEGADOR');
    console.log('============================================');
    console.log('');
    console.log('Instruções:');
    console.log('1. Clique em "Sign In" ou "Log In"');
    console.log('2. Use: +351968508709');
    console.log('3. Insira o código quando receber');
    console.log('4. Complete o login');
    console.log('');
    console.log('⏳ Aguardando você completar o login...');
    console.log('⌨️  Pressione ENTER aqui quando estiver logado');
    console.log('');

    // Aguardar input do usuário
    await new Promise(resolve => {
      process.stdin.once('data', () => {
        resolve();
      });
    });

    console.log('✅ Login confirmado! Continuando...');
    
    // Navegar para página Create
    console.log('🎵 Navegando para página Create...');
    await page.goto('https://suno.com/create', { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('📸 Tirando screenshot da página Create...');
    await page.screenshot({ path: 'suno-create-logged-in.png', fullPage: true });

    // Extrair TODOS os dados
    console.log('📊 Extraindo elementos da interface...');
    
    const data = await page.evaluate(() => {
      const getStyles = (el) => {
        const computed = window.getComputedStyle(el);
        return {
          display: computed.display,
          visibility: computed.visibility,
          backgroundColor: computed.backgroundColor,
          color: computed.color,
          fontSize: computed.fontSize,
          padding: computed.padding,
          margin: computed.margin,
          border: computed.border
        };
      };

      return {
        // Estrutura da página
        pageInfo: {
          title: document.title,
          url: window.location.href,
          bodyClass: document.body.className
        },

        // Botões
        buttons: Array.from(document.querySelectorAll('button')).map(btn => ({
          text: btn.innerText?.trim() || '',
          ariaLabel: btn.getAttribute('aria-label'),
          disabled: btn.disabled,
          type: btn.type,
          className: btn.className,
          id: btn.id,
          title: btn.title,
          visible: btn.offsetParent !== null,
          styles: getStyles(btn)
        })).filter(b => b.text || b.ariaLabel),

        // Inputs
        inputs: Array.from(document.querySelectorAll('input')).map(inp => ({
          type: inp.type,
          name: inp.name,
          id: inp.id,
          placeholder: inp.placeholder,
          ariaLabel: inp.getAttribute('aria-label'),
          value: inp.value,
          min: inp.min,
          max: inp.max,
          step: inp.step,
          className: inp.className,
          required: inp.required,
          disabled: inp.disabled,
          visible: inp.offsetParent !== null
        })),

        // Textareas
        textareas: Array.from(document.querySelectorAll('textarea')).map(t => ({
          name: t.name,
          id: t.id,
          placeholder: t.placeholder,
          ariaLabel: t.getAttribute('aria-label'),
          value: t.value,
          className: t.className,
          rows: t.rows,
          maxLength: t.maxLength
        })),

        // Selects
        selects: Array.from(document.querySelectorAll('select')).map(sel => ({
          name: sel.name,
          id: sel.id,
          className: sel.className,
          options: Array.from(sel.options).map(o => ({
            text: o.textContent?.trim(),
            value: o.value,
            selected: o.selected
          }))
        })),

        // Tabs/Modos
        tabs: Array.from(document.querySelectorAll('[role="tab"], [data-state="active"], [data-state="inactive"]')).map(t => ({
          text: t.textContent?.trim() || '',
          role: t.getAttribute('role'),
          ariaSelected: t.getAttribute('aria-selected'),
          dataState: t.getAttribute('data-state'),
          className: t.className,
          id: t.id
        })),

        // Chips/Tags de estilos
        chips: Array.from(document.querySelectorAll('[role="option"], .chip, .tag, [class*="chip"], [class*="tag"], [class*="badge"]'))
          .map(c => ({
            text: c.textContent?.trim() || '',
            className: c.className,
            role: c.getAttribute('role'),
            ariaSelected: c.getAttribute('aria-selected'),
            dataValue: c.getAttribute('data-value')
          }))
          .filter(c => c.text && c.text.length > 0 && c.text.length < 50),

        // Sliders
        sliders: Array.from(document.querySelectorAll('input[type="range"]')).map(s => ({
          name: s.name,
          id: s.id,
          ariaLabel: s.getAttribute('aria-label'),
          min: s.min,
          max: s.max,
          value: s.value,
          step: s.step,
          className: s.className
        })),

        // Labels
        labels: Array.from(document.querySelectorAll('label')).map(l => ({
          text: l.textContent?.trim() || '',
          htmlFor: l.getAttribute('for'),
          className: l.className
        })).filter(l => l.text),

        // Checkboxes
        checkboxes: Array.from(document.querySelectorAll('input[type="checkbox"]')).map(c => ({
          name: c.name,
          id: c.id,
          checked: c.checked,
          ariaLabel: c.getAttribute('aria-label'),
          className: c.className
        })),

        // Tooltips
        tooltips: Array.from(document.querySelectorAll('[role="tooltip"], [data-tooltip], [title]'))
          .map(t => ({
            text: t.textContent?.trim() || t.getAttribute('title') || t.getAttribute('data-tooltip'),
            role: t.getAttribute('role'),
            className: t.className
          }))
          .filter(t => t.text),

        // Headers
        headers: Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
          level: h.tagName,
          text: h.textContent?.trim() || '',
          className: h.className,
          id: h.id
        })).filter(h => h.text),

        // Links principais
        links: Array.from(document.querySelectorAll('a')).map(a => ({
          text: a.textContent?.trim() || '',
          href: a.href,
          className: a.className,
          ariaLabel: a.getAttribute('aria-label')
        })).filter(l => l.text || l.ariaLabel).slice(0, 50), // Limitar a 50 links

        // Estatísticas
        stats: {
          totalButtons: document.querySelectorAll('button').length,
          totalInputs: document.querySelectorAll('input').length,
          totalTextareas: document.querySelectorAll('textarea').length,
          totalSelects: document.querySelectorAll('select').length,
          totalTabs: document.querySelectorAll('[role="tab"]').length,
          totalChips: document.querySelectorAll('[role="option"], .chip, .tag').length,
          totalSliders: document.querySelectorAll('input[type="range"]').length,
          totalCheckboxes: document.querySelectorAll('input[type="checkbox"]').length
        }
      };
    });

    console.log('\n✅ Extração completa!');
    console.log('\n📊 Estatísticas:');
    console.log(`   - Botões: ${data.stats.totalButtons}`);
    console.log(`   - Inputs: ${data.stats.totalInputs}`);
    console.log(`   - Textareas: ${data.stats.totalTextareas}`);
    console.log(`   - Selects: ${data.stats.totalSelects}`);
    console.log(`   - Tabs: ${data.stats.totalTabs}`);
    console.log(`   - Chips/Tags: ${data.stats.totalChips}`);
    console.log(`   - Sliders: ${data.stats.totalSliders}`);
    console.log(`   - Checkboxes: ${data.stats.totalCheckboxes}`);

    // Salvar JSON completo
    fs.writeFileSync('suno-interface-data.json', JSON.stringify(data, null, 2));
    console.log('\n💾 Dados salvos em: suno-interface-data.json');

    // Salvar versão simplificada
    const simplified = {
      buttons: data.buttons.filter(b => b.visible).map(b => ({ text: b.text, ariaLabel: b.ariaLabel })),
      inputs: data.inputs.filter(i => i.visible && i.placeholder).map(i => ({ type: i.type, placeholder: i.placeholder, ariaLabel: i.ariaLabel })),
      textareas: data.textareas.map(t => ({ placeholder: t.placeholder, ariaLabel: t.ariaLabel })),
      tabs: data.tabs.map(t => ({ text: t.text, selected: t.ariaSelected === 'true' || t.dataState === 'active' })),
      chips: data.chips.map(c => c.text),
      sliders: data.sliders.map(s => ({ label: s.ariaLabel, min: s.min, max: s.max, value: s.value }))
    };

    fs.writeFileSync('suno-interface-simplified.json', JSON.stringify(simplified, null, 2));
    console.log('💾 Versão simplificada: suno-interface-simplified.json');

    console.log('\n🎉 Scraping concluído!');
    console.log('\n📋 Próximos passos:');
    console.log('   1. ✅ Dados extraídos e salvos');
    console.log('   2. 🔍 Analisar suno-interface-data.json');
    console.log('   3. 📝 Comparar com nossa implementação');
    console.log('   4. 🔧 Adicionar elementos faltantes');

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    try {
      await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
      console.log('📸 Screenshot de erro salvo');
    } catch (e) {}
  } finally {
    console.log('\n⏳ Aguardando 10 segundos antes de fechar...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    await browser.close();
    console.log('👋 Navegador fechado.');
  }
})();

const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('🔍 Acessando Suno.com...');
  await page.goto('https://suno.com/create', { waitUntil: 'networkidle2', timeout: 60000 });

  const data = await page.evaluate(() => {
    // Botões
    const buttons = Array.from(document.querySelectorAll('button')).map(btn => ({
      text: btn.innerText,
      ariaLabel: btn.getAttribute('aria-label'),
      disabled: btn.disabled,
      id: btn.id,
      class: btn.className
    }));

    // Dropdowns/selects
    const selects = Array.from(document.querySelectorAll('select')).map(sel => ({
      id: sel.id,
      name: sel.name,
      options: Array.from(sel.options).map(o => o.textContent)
    }));

    // Inputs (inclusive sliders)
    const inputs = Array.from(document.querySelectorAll('input')).map(inp => ({
      id: inp.id,
      name: inp.name,
      type: inp.type,
      value: inp.value,
      placeholder: inp.placeholder,
      min: inp.min,
      max: inp.max
    }));

    // Textareas
    const textareas = Array.from(document.querySelectorAll('textarea')).map(t => ({
      id: t.id,
      name: t.name,
      value: t.value,
      placeholder: t.placeholder
    }));

    // Chips/tags de estilos
    const chips = Array.from(document.querySelectorAll('[role="option"], .chip, .tag')).map(e => e.textContent.trim());

    // Notificações/toasts
    const notifications = Array.from(document.querySelectorAll('[class*=notification], [role="alert"]')).map(n => n.textContent.trim());

    // Tabs/Modos
    const tabs = Array.from(document.querySelectorAll('[role="tab"]')).map(t => ({
      text: t.textContent.trim(),
      selected: t.getAttribute('aria-selected') === 'true'
    }));

    // Labels
    const labels = Array.from(document.querySelectorAll('label')).map(l => ({
      text: l.textContent.trim(),
      for: l.getAttribute('for')
    }));

    // Estrutura de navegação
    const navigation = Array.from(document.querySelectorAll('nav a, [role="navigation"] a')).map(a => ({
      text: a.textContent.trim(),
      href: a.href
    }));

    // Headers/Títulos
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
      level: h.tagName,
      text: h.textContent.trim()
    }));

    return {
      buttons,
      selects,
      inputs,
      textareas,
      chips,
      notifications,
      tabs,
      labels,
      navigation,
      headings
    }
  });

  console.log('\n📊 Dados extraídos do Suno.com:');
  console.log(JSON.stringify(data, null, 2));

  // Salvar em arquivo
  const fs = require('fs');
  fs.writeFileSync('suno-interface-data.json', JSON.stringify(data, null, 2));
  console.log('\n✅ Dados salvos em suno-interface-data.json');

  await browser.close();
})();

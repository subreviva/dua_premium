// ════════════════════════════════════════════════════════════════
// SUNO.COM INTERFACE EXTRACTOR
// ════════════════════════════════════════════════════════════════
// 
// INSTRUÇÕES:
// 1. Abre https://suno.com/create no teu browser
// 2. Faz login manualmente
// 3. Pressiona F12 para abrir DevTools
// 4. Vai para a tab "Console"
// 5. Cola TODO este código e pressiona ENTER
// 6. Copia o resultado JSON que aparece
// 7. Envia-me o JSON completo
//
// ════════════════════════════════════════════════════════════════

(function() {
  console.log('🚀 Iniciando extração da interface do Suno...\n');
  
  const data = {
    pageInfo: {
      title: document.title,
      url: window.location.href,
      timestamp: new Date().toISOString()
    },
    
    // BOTÕES
    buttons: Array.from(document.querySelectorAll('button')).map((btn, idx) => ({
      index: idx,
      text: btn.innerText?.trim() || '',
      ariaLabel: btn.getAttribute('aria-label'),
      title: btn.title,
      disabled: btn.disabled,
      type: btn.type,
      className: btn.className,
      id: btn.id,
      dataAttributes: Array.from(btn.attributes)
        .filter(attr => attr.name.startsWith('data-'))
        .reduce((acc, attr) => ({ ...acc, [attr.name]: attr.value }), {}),
      visible: btn.offsetParent !== null
    })).filter(b => b.visible && (b.text || b.ariaLabel)),
    
    // INPUTS
    inputs: Array.from(document.querySelectorAll('input')).map((inp, idx) => ({
      index: idx,
      type: inp.type,
      name: inp.name,
      id: inp.id,
      placeholder: inp.placeholder,
      ariaLabel: inp.getAttribute('aria-label'),
      value: inp.value,
      defaultValue: inp.defaultValue,
      min: inp.min,
      max: inp.max,
      step: inp.step,
      checked: inp.checked,
      className: inp.className,
      required: inp.required,
      disabled: inp.disabled,
      readOnly: inp.readOnly,
      visible: inp.offsetParent !== null
    })).filter(i => i.visible),
    
    // TEXTAREAS
    textareas: Array.from(document.querySelectorAll('textarea')).map((t, idx) => ({
      index: idx,
      name: t.name,
      id: t.id,
      placeholder: t.placeholder,
      ariaLabel: t.getAttribute('aria-label'),
      value: t.value,
      rows: t.rows,
      cols: t.cols,
      maxLength: t.maxLength,
      className: t.className,
      required: t.required,
      disabled: t.disabled,
      readOnly: t.readOnly
    })),
    
    // SELECTS
    selects: Array.from(document.querySelectorAll('select')).map((sel, idx) => ({
      index: idx,
      name: sel.name,
      id: sel.id,
      className: sel.className,
      disabled: sel.disabled,
      multiple: sel.multiple,
      required: sel.required,
      options: Array.from(sel.options).map(o => ({
        text: o.textContent?.trim(),
        value: o.value,
        selected: o.selected,
        disabled: o.disabled
      }))
    })),
    
    // TABS
    tabs: Array.from(document.querySelectorAll('[role="tab"], [data-state="active"], [data-state="inactive"]')).map((t, idx) => ({
      index: idx,
      text: t.textContent?.trim() || '',
      role: t.getAttribute('role'),
      ariaSelected: t.getAttribute('aria-selected'),
      dataState: t.getAttribute('data-state'),
      ariaLabel: t.getAttribute('aria-label'),
      className: t.className,
      id: t.id,
      isActive: t.getAttribute('aria-selected') === 'true' || t.getAttribute('data-state') === 'active'
    })).filter(t => t.text),
    
    // CHIPS/TAGS (estilos musicais)
    chips: Array.from(document.querySelectorAll('[role="option"], .chip, .tag, [class*="chip"], [class*="tag"], [class*="badge"], [class*="pill"]'))
      .map((c, idx) => ({
        index: idx,
        text: c.textContent?.trim() || '',
        className: c.className,
        role: c.getAttribute('role'),
        ariaSelected: c.getAttribute('aria-selected'),
        dataValue: c.getAttribute('data-value'),
        dataLabel: c.getAttribute('data-label'),
        isSelected: c.getAttribute('aria-selected') === 'true' || c.classList.contains('selected')
      }))
      .filter(c => c.text && c.text.length > 0 && c.text.length < 50),
    
    // SLIDERS
    sliders: Array.from(document.querySelectorAll('input[type="range"]')).map((s, idx) => ({
      index: idx,
      name: s.name,
      id: s.id,
      ariaLabel: s.getAttribute('aria-label'),
      min: s.min,
      max: s.max,
      value: s.value,
      step: s.step,
      className: s.className,
      ariaValueNow: s.getAttribute('aria-valuenow'),
      ariaValueMin: s.getAttribute('aria-valuemin'),
      ariaValueMax: s.getAttribute('aria-valuemax'),
      ariaValueText: s.getAttribute('aria-valuetext')
    })),
    
    // LABELS
    labels: Array.from(document.querySelectorAll('label')).map((l, idx) => ({
      index: idx,
      text: l.textContent?.trim() || '',
      htmlFor: l.getAttribute('for'),
      className: l.className,
      id: l.id
    })).filter(l => l.text && l.text.length < 100),
    
    // CHECKBOXES
    checkboxes: Array.from(document.querySelectorAll('input[type="checkbox"]')).map((c, idx) => ({
      index: idx,
      name: c.name,
      id: c.id,
      checked: c.checked,
      ariaLabel: c.getAttribute('aria-label'),
      className: c.className,
      disabled: c.disabled,
      // Tenta encontrar o label associado
      label: document.querySelector(`label[for="${c.id}"]`)?.textContent?.trim() || ''
    })),
    
    // RADIO BUTTONS
    radios: Array.from(document.querySelectorAll('input[type="radio"]')).map((r, idx) => ({
      index: idx,
      name: r.name,
      id: r.id,
      value: r.value,
      checked: r.checked,
      ariaLabel: r.getAttribute('aria-label'),
      className: r.className,
      label: document.querySelector(`label[for="${r.id}"]`)?.textContent?.trim() || ''
    })),
    
    // HEADERS/TÍTULOS
    headers: Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map((h, idx) => ({
      index: idx,
      level: h.tagName,
      text: h.textContent?.trim() || '',
      className: h.className,
      id: h.id
    })).filter(h => h.text),
    
    // TOOLTIPS
    tooltips: Array.from(document.querySelectorAll('[role="tooltip"], [data-tooltip], [title]'))
      .map((t, idx) => ({
        index: idx,
        text: t.textContent?.trim() || t.getAttribute('title') || t.getAttribute('data-tooltip'),
        role: t.getAttribute('role'),
        className: t.className
      }))
      .filter(t => t.text),
    
    // MODAIS/DIALOGS
    modals: Array.from(document.querySelectorAll('[role="dialog"], [class*="modal"], [class*="dialog"]'))
      .map((m, idx) => ({
        index: idx,
        ariaLabel: m.getAttribute('aria-label'),
        ariaModal: m.getAttribute('aria-modal'),
        className: m.className,
        id: m.id,
        visible: m.offsetParent !== null
      }))
      .filter(m => m.visible),
    
    // ESTRUTURA DE NAVEGAÇÃO
    navigation: Array.from(document.querySelectorAll('nav a, [role="navigation"] a, header a'))
      .map((a, idx) => ({
        index: idx,
        text: a.textContent?.trim() || '',
        href: a.href,
        ariaCurrent: a.getAttribute('aria-current'),
        className: a.className
      }))
      .filter(n => n.text)
      .slice(0, 30), // Limita a 30 para não sobrecarregar
    
    // ESTATÍSTICAS
    stats: {
      totalButtons: document.querySelectorAll('button').length,
      visibleButtons: document.querySelectorAll('button').length,
      totalInputs: document.querySelectorAll('input').length,
      totalTextareas: document.querySelectorAll('textarea').length,
      totalSelects: document.querySelectorAll('select').length,
      totalTabs: document.querySelectorAll('[role="tab"]').length,
      totalChips: document.querySelectorAll('[role="option"], .chip, .tag').length,
      totalSliders: document.querySelectorAll('input[type="range"]').length,
      totalCheckboxes: document.querySelectorAll('input[type="checkbox"]').length,
      totalRadios: document.querySelectorAll('input[type="radio"]').length,
      totalLabels: document.querySelectorAll('label').length
    }
  };
  
  console.log('✅ Extração completa!\n');
  console.log('📊 Estatísticas:');
  console.log(`   - Botões visíveis: ${data.buttons.length}`);
  console.log(`   - Inputs: ${data.inputs.length}`);
  console.log(`   - Textareas: ${data.textareas.length}`);
  console.log(`   - Selects: ${data.selects.length}`);
  console.log(`   - Tabs: ${data.tabs.length}`);
  console.log(`   - Chips/Tags: ${data.chips.length}`);
  console.log(`   - Sliders: ${data.sliders.length}`);
  console.log(`   - Checkboxes: ${data.checkboxes.length}`);
  console.log(`   - Radio buttons: ${data.radios.length}`);
  console.log(`   - Labels: ${data.labels.length}`);
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📋 COPIA O JSON ABAIXO (do { até ao último })');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  // Output do JSON
  console.log(JSON.stringify(data, null, 2));
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('✅ FEITO! Copia todo o JSON acima e envia para o Copilot');
  console.log('═══════════════════════════════════════════════════════════');
  
  // Também cria um download automático
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'suno-create-interface.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  console.log('\n💾 Ficheiro também foi descarregado automaticamente: suno-create-interface.json');
  
  return data;
})();

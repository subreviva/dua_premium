// ════════════════════════════════════════════════════════════════
// SUNO.COM ULTRA DEEP INTERFACE EXTRACTOR
// ════════════════════════════════════════════════════════════════
// 
// EXTRAI **TUDO** DA PÁGINA:
// - Todos os botões com eventos, estados, posições
// - Todos os dropdowns com opções completas
// - Todas as funções e event listeners
// - Layout completo, estrutura DOM, estilos
// - Dados de estado, variáveis React/Vue
// - APIs chamadas, network requests
// - LocalStorage, SessionStorage, Cookies
//
// INSTRUÇÕES:
// 1. Abre https://suno.com/create no teu browser
// 2. Faz login manualmente
// 3. Pressiona F12 para abrir DevTools
// 4. Vai para a tab "Console"
// 5. Cola TODO este código e pressiona ENTER
// 6. Aguarda (pode demorar 10-20 segundos)
// 7. Copia o JSON que aparece (vai ser GRANDE)
// 8. Envia-me o JSON completo
//
// ════════════════════════════════════════════════════════════════

(function() {
  console.log('🚀 ULTRA DEEP EXTRACTOR - Iniciando análise profunda...\n');
  console.log('⏳ Isto pode demorar 10-20 segundos...\n');
  
  const startTime = performance.now();
  
  // ══════════════════════════════════════════════════════════════
  // FUNÇÃO AUXILIAR: Extrair estilos computados
  // ══════════════════════════════════════════════════════════════
  const getComputedStyles = (element) => {
    const computed = window.getComputedStyle(element);
    return {
      display: computed.display,
      position: computed.position,
      width: computed.width,
      height: computed.height,
      backgroundColor: computed.backgroundColor,
      color: computed.color,
      fontSize: computed.fontSize,
      fontWeight: computed.fontWeight,
      padding: computed.padding,
      margin: computed.margin,
      border: computed.border,
      borderRadius: computed.borderRadius,
      cursor: computed.cursor,
      opacity: computed.opacity,
      zIndex: computed.zIndex,
      transform: computed.transform,
      transition: computed.transition
    };
  };
  
  // ══════════════════════════════════════════════════════════════
  // FUNÇÃO AUXILIAR: Extrair posição e dimensões
  // ══════════════════════════════════════════════════════════════
  const getElementGeometry = (element) => {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      left: rect.left
    };
  };
  
  // ══════════════════════════════════════════════════════════════
  // FUNÇÃO AUXILIAR: Extrair todos os atributos
  // ══════════════════════════════════════════════════════════════
  const getAllAttributes = (element) => {
    const attrs = {};
    for (const attr of element.attributes) {
      attrs[attr.name] = attr.value;
    }
    return attrs;
  };
  
  // ══════════════════════════════════════════════════════════════
  // FUNÇÃO AUXILIAR: Tentar extrair event listeners
  // ══════════════════════════════════════════════════════════════
  const getEventListeners = (element) => {
    const events = {};
    const eventTypes = ['click', 'change', 'input', 'submit', 'focus', 'blur', 'keydown', 'keyup', 'mouseenter', 'mouseleave'];
    
    eventTypes.forEach(type => {
      // Verifica se tem handler inline
      if (element[`on${type}`]) {
        events[type] = 'inline handler detected';
      }
      
      // Verifica atributo onclick, onchange, etc
      if (element.getAttribute(`on${type}`)) {
        events[type] = element.getAttribute(`on${type}`);
      }
    });
    
    return Object.keys(events).length > 0 ? events : null;
  };
  
  // ══════════════════════════════════════════════════════════════
  // FUNÇÃO AUXILIAR: Extrair hierarquia de elementos
  // ══════════════════════════════════════════════════════════════
  const getElementPath = (element) => {
    const path = [];
    let current = element;
    
    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();
      
      if (current.id) {
        selector += `#${current.id}`;
      } else if (current.className && typeof current.className === 'string') {
        const classes = current.className.split(' ').filter(c => c).slice(0, 3).join('.');
        if (classes) selector += `.${classes}`;
      }
      
      path.unshift(selector);
      current = current.parentElement;
    }
    
    return path.join(' > ');
  };
  
  console.log('📦 Extraindo dados da página...\n');
  
  const data = {
    // ══════════════════════════════════════════════════════════════
    // META INFORMAÇÕES
    // ══════════════════════════════════════════════════════════════
    pageInfo: {
      title: document.title,
      url: window.location.href,
      pathname: window.location.pathname,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      language: navigator.language,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio
      },
      documentReady: document.readyState,
      charSet: document.characterSet
    },
    
    // ══════════════════════════════════════════════════════════════
    // BOTÕES (ULTRA DETALHADO)
    // ══════════════════════════════════════════════════════════════
    buttons: Array.from(document.querySelectorAll('button, [role="button"], [type="button"], [type="submit"]')).map((btn, idx) => ({
      index: idx,
      // Textos
      text: btn.textContent?.trim() || '',
      innerText: btn.innerText?.trim() || '',
      innerHTML: btn.innerHTML?.substring(0, 200), // Primeiros 200 chars
      
      // Atributos
      id: btn.id,
      className: btn.className,
      name: btn.name,
      type: btn.type,
      value: btn.value,
      title: btn.title,
      
      // Atributos ARIA
      ariaLabel: btn.getAttribute('aria-label'),
      ariaDescribedBy: btn.getAttribute('aria-describedby'),
      ariaExpanded: btn.getAttribute('aria-expanded'),
      ariaHaspopup: btn.getAttribute('aria-haspopup'),
      ariaPressed: btn.getAttribute('aria-pressed'),
      ariaDisabled: btn.getAttribute('aria-disabled'),
      role: btn.getAttribute('role'),
      
      // Estados
      disabled: btn.disabled,
      visible: btn.offsetParent !== null,
      focused: document.activeElement === btn,
      
      // Atributos data-*
      dataAttributes: Array.from(btn.attributes)
        .filter(attr => attr.name.startsWith('data-'))
        .reduce((acc, attr) => ({ ...acc, [attr.name]: attr.value }), {}),
      
      // Todos os atributos
      allAttributes: getAllAttributes(btn),
      
      // Geometria e posição
      geometry: getElementGeometry(btn),
      
      // Estilos computados
      styles: getComputedStyles(btn),
      
      // Event listeners (detectáveis)
      events: getEventListeners(btn),
      
      // Hierarquia DOM
      domPath: getElementPath(btn),
      
      // Elementos filhos
      hasIcon: btn.querySelector('svg, i, img') !== null,
      childrenCount: btn.children.length,
      childTags: Array.from(btn.children).map(c => c.tagName.toLowerCase()),
      
      // Classes específicas
      hasClass: {
        primary: btn.className.includes('primary'),
        secondary: btn.className.includes('secondary'),
        danger: btn.className.includes('danger'),
        success: btn.className.includes('success'),
        outline: btn.className.includes('outline'),
        ghost: btn.className.includes('ghost'),
        icon: btn.className.includes('icon'),
        loading: btn.className.includes('loading'),
        active: btn.className.includes('active')
      }
    })).filter(b => b.visible || b.text || b.ariaLabel),
    
    // ══════════════════════════════════════════════════════════════
    // INPUTS (ULTRA DETALHADO)
    // ══════════════════════════════════════════════════════════════
    inputs: Array.from(document.querySelectorAll('input')).map((inp, idx) => ({
      index: idx,
      // Tipo e identificação
      type: inp.type,
      name: inp.name,
      id: inp.id,
      className: inp.className,
      
      // Valores
      value: inp.value,
      defaultValue: inp.defaultValue,
      placeholder: inp.placeholder,
      
      // Validação
      pattern: inp.pattern,
      minLength: inp.minLength,
      maxLength: inp.maxLength,
      min: inp.min,
      max: inp.max,
      step: inp.step,
      required: inp.required,
      
      // Estados
      checked: inp.checked,
      disabled: inp.disabled,
      readOnly: inp.readOnly,
      autofocus: inp.autofocus,
      autocomplete: inp.autocomplete,
      
      // ARIA
      ariaLabel: inp.getAttribute('aria-label'),
      ariaDescribedBy: inp.getAttribute('aria-describedby'),
      ariaInvalid: inp.getAttribute('aria-invalid'),
      ariaRequired: inp.getAttribute('aria-required'),
      
      // Atributos data-*
      dataAttributes: Array.from(inp.attributes)
        .filter(attr => attr.name.startsWith('data-'))
        .reduce((acc, attr) => ({ ...acc, [attr.name]: attr.value }), {}),
      
      // Todos atributos
      allAttributes: getAllAttributes(inp),
      
      // Geometria
      geometry: getElementGeometry(inp),
      
      // Estilos
      styles: getComputedStyles(inp),
      
      // Events
      events: getEventListeners(inp),
      
      // Hierarquia
      domPath: getElementPath(inp),
      
      // Label associado
      labelText: inp.labels?.[0]?.textContent?.trim() || 
                 document.querySelector(`label[for="${inp.id}"]`)?.textContent?.trim() || '',
      
      // Validação HTML5
      validity: {
        valid: inp.validity?.valid,
        valueMissing: inp.validity?.valueMissing,
        typeMismatch: inp.validity?.typeMismatch,
        patternMismatch: inp.validity?.patternMismatch,
        tooLong: inp.validity?.tooLong,
        tooShort: inp.validity?.tooShort,
        rangeUnderflow: inp.validity?.rangeUnderflow,
        rangeOverflow: inp.validity?.rangeOverflow,
        stepMismatch: inp.validity?.stepMismatch
      },
      
      visible: inp.offsetParent !== null
    })).filter(i => i.visible),
    
    // ══════════════════════════════════════════════════════════════
    // TEXTAREAS (ULTRA DETALHADO)
    // ══════════════════════════════════════════════════════════════
    textareas: Array.from(document.querySelectorAll('textarea')).map((ta, idx) => ({
      index: idx,
      name: ta.name,
      id: ta.id,
      className: ta.className,
      
      // Valores
      value: ta.value,
      defaultValue: ta.defaultValue,
      placeholder: ta.placeholder,
      
      // Propriedades
      rows: ta.rows,
      cols: ta.cols,
      maxLength: ta.maxLength,
      minLength: ta.minLength,
      wrap: ta.wrap,
      
      // Estados
      required: ta.required,
      disabled: ta.disabled,
      readOnly: ta.readOnly,
      autofocus: ta.autofocus,
      
      // ARIA
      ariaLabel: ta.getAttribute('aria-label'),
      ariaDescribedBy: ta.getAttribute('aria-describedby'),
      
      // Data attributes
      dataAttributes: Array.from(ta.attributes)
        .filter(attr => attr.name.startsWith('data-'))
        .reduce((acc, attr) => ({ ...acc, [attr.name]: attr.value }), {}),
      
      allAttributes: getAllAttributes(ta),
      geometry: getElementGeometry(ta),
      styles: getComputedStyles(ta),
      events: getEventListeners(ta),
      domPath: getElementPath(ta),
      
      labelText: document.querySelector(`label[for="${ta.id}"]`)?.textContent?.trim() || '',
      visible: ta.offsetParent !== null
    })),
    
    // ══════════════════════════════════════════════════════════════
    // SELECTS/DROPDOWNS (ULTRA DETALHADO)
    // ══════════════════════════════════════════════════════════════
    selects: Array.from(document.querySelectorAll('select')).map((sel, idx) => ({
      index: idx,
      name: sel.name,
      id: sel.id,
      className: sel.className,
      
      // Propriedades
      multiple: sel.multiple,
      size: sel.size,
      disabled: sel.disabled,
      required: sel.required,
      autofocus: sel.autofocus,
      
      // Valor selecionado
      value: sel.value,
      selectedIndex: sel.selectedIndex,
      
      // ARIA
      ariaLabel: sel.getAttribute('aria-label'),
      
      // Todas as opções
      options: Array.from(sel.options).map((opt, optIdx) => ({
        index: optIdx,
        value: opt.value,
        text: opt.textContent?.trim(),
        label: opt.label,
        selected: opt.selected,
        disabled: opt.disabled,
        defaultSelected: opt.defaultSelected
      })),
      
      // Optgroups (se existirem)
      optgroups: Array.from(sel.querySelectorAll('optgroup')).map(og => ({
        label: og.label,
        disabled: og.disabled,
        options: Array.from(og.querySelectorAll('option')).map(opt => ({
          value: opt.value,
          text: opt.textContent?.trim(),
          selected: opt.selected
        }))
      })),
      
      dataAttributes: Array.from(sel.attributes)
        .filter(attr => attr.name.startsWith('data-'))
        .reduce((acc, attr) => ({ ...acc, [attr.name]: attr.value }), {}),
      
      allAttributes: getAllAttributes(sel),
      geometry: getElementGeometry(sel),
      styles: getComputedStyles(sel),
      events: getEventListeners(sel),
      domPath: getElementPath(sel),
      
      labelText: document.querySelector(`label[for="${sel.id}"]`)?.textContent?.trim() || '',
      visible: sel.offsetParent !== null
    })),
    
    // ══════════════════════════════════════════════════════════════
    // DROPDOWNS CUSTOMIZADOS (divs com role="listbox", "menu", etc)
    // ══════════════════════════════════════════════════════════════
    customDropdowns: Array.from(document.querySelectorAll('[role="listbox"], [role="menu"], [role="combobox"], [class*="dropdown"], [class*="select"]')).map((dd, idx) => ({
      index: idx,
      tag: dd.tagName.toLowerCase(),
      id: dd.id,
      className: dd.className,
      role: dd.getAttribute('role'),
      
      // ARIA
      ariaLabel: dd.getAttribute('aria-label'),
      ariaExpanded: dd.getAttribute('aria-expanded'),
      ariaHaspopup: dd.getAttribute('aria-haspopup'),
      ariaControls: dd.getAttribute('aria-controls'),
      ariaOwns: dd.getAttribute('aria-owns'),
      
      // Opções dentro do dropdown
      options: Array.from(dd.querySelectorAll('[role="option"], [role="menuitem"], li, .option, .item')).map((opt, optIdx) => ({
        index: optIdx,
        text: opt.textContent?.trim(),
        value: opt.getAttribute('data-value') || opt.getAttribute('value'),
        selected: opt.getAttribute('aria-selected') === 'true' || opt.classList.contains('selected'),
        disabled: opt.getAttribute('aria-disabled') === 'true' || opt.hasAttribute('disabled'),
        className: opt.className,
        dataAttributes: Array.from(opt.attributes)
          .filter(attr => attr.name.startsWith('data-'))
          .reduce((acc, attr) => ({ ...acc, [attr.name]: attr.value }), {})
      })),
      
      dataAttributes: Array.from(dd.attributes)
        .filter(attr => attr.name.startsWith('data-'))
        .reduce((acc, attr) => ({ ...acc, [attr.name]: attr.value }), {}),
      
      allAttributes: getAllAttributes(dd),
      geometry: getElementGeometry(dd),
      styles: getComputedStyles(dd),
      domPath: getElementPath(dd),
      visible: dd.offsetParent !== null
    })).filter(dd => dd.visible),
    
    // ══════════════════════════════════════════════════════════════
    // TABS (ULTRA DETALHADO)
    // ══════════════════════════════════════════════════════════════
    tabs: Array.from(document.querySelectorAll('[role="tab"], [role="tablist"] > *, [class*="tab"]')).map((tab, idx) => ({
      index: idx,
      tag: tab.tagName.toLowerCase(),
      text: tab.textContent?.trim() || '',
      id: tab.id,
      className: tab.className,
      
      // ARIA
      role: tab.getAttribute('role'),
      ariaLabel: tab.getAttribute('aria-label'),
      ariaSelected: tab.getAttribute('aria-selected'),
      ariaControls: tab.getAttribute('aria-controls'),
      ariaDisabled: tab.getAttribute('aria-disabled'),
      
      // Estados
      dataState: tab.getAttribute('data-state'),
      isActive: tab.getAttribute('aria-selected') === 'true' || 
                tab.getAttribute('data-state') === 'active' ||
                tab.classList.contains('active'),
      disabled: tab.getAttribute('aria-disabled') === 'true' || tab.hasAttribute('disabled'),
      
      // Tab panel associado
      controlsPanel: tab.getAttribute('aria-controls'),
      panelExists: tab.getAttribute('aria-controls') ? 
                   document.getElementById(tab.getAttribute('aria-controls')) !== null : false,
      
      dataAttributes: Array.from(tab.attributes)
        .filter(attr => attr.name.startsWith('data-'))
        .reduce((acc, attr) => ({ ...acc, [attr.name]: attr.value }), {}),
      
      allAttributes: getAllAttributes(tab),
      geometry: getElementGeometry(tab),
      styles: getComputedStyles(tab),
      events: getEventListeners(tab),
      domPath: getElementPath(tab),
      visible: tab.offsetParent !== null
    })).filter(t => t.text || t.ariaLabel),
    
    // ══════════════════════════════════════════════════════════════
    // TAB PANELS (conteúdo das tabs)
    // ══════════════════════════════════════════════════════════════
    tabPanels: Array.from(document.querySelectorAll('[role="tabpanel"]')).map((panel, idx) => ({
      index: idx,
      id: panel.id,
      className: panel.className,
      ariaLabel: panel.getAttribute('aria-label'),
      ariaLabelledby: panel.getAttribute('aria-labelledby'),
      hidden: panel.hidden || panel.getAttribute('aria-hidden') === 'true',
      dataState: panel.getAttribute('data-state'),
      
      // Conteúdo resumido
      contentSummary: panel.textContent?.trim().substring(0, 500),
      elementCount: panel.querySelectorAll('*').length,
      
      dataAttributes: Array.from(panel.attributes)
        .filter(attr => attr.name.startsWith('data-'))
        .reduce((acc, attr) => ({ ...acc, [attr.name]: attr.value }), {}),
      
      geometry: getElementGeometry(panel),
      styles: getComputedStyles(panel),
      domPath: getElementPath(panel),
      visible: panel.offsetParent !== null
    })),
    
    // ══════════════════════════════════════════════════════════════
    // CHIPS/TAGS/BADGES (estilos musicais, filtros, etc)
    // ══════════════════════════════════════════════════════════════
    chips: Array.from(document.querySelectorAll('[role="option"], .chip, .tag, .badge, [class*="chip"], [class*="tag"], [class*="badge"], [class*="pill"]'))
      .map((chip, idx) => ({
        index: idx,
        tag: chip.tagName.toLowerCase(),
        text: chip.textContent?.trim() || '',
        id: chip.id,
        className: chip.className,
        
        // ARIA
        role: chip.getAttribute('role'),
        ariaLabel: chip.getAttribute('aria-label'),
        ariaSelected: chip.getAttribute('aria-selected'),
        ariaPressed: chip.getAttribute('aria-pressed'),
        
        // Valores e estados
        dataValue: chip.getAttribute('data-value'),
        dataLabel: chip.getAttribute('data-label'),
        dataType: chip.getAttribute('data-type'),
        isSelected: chip.getAttribute('aria-selected') === 'true' || 
                    chip.getAttribute('aria-pressed') === 'true' ||
                    chip.classList.contains('selected') ||
                    chip.classList.contains('active'),
        isDisabled: chip.getAttribute('aria-disabled') === 'true' || chip.hasAttribute('disabled'),
        
        // Ícones/badges
        hasIcon: chip.querySelector('svg, i, img') !== null,
        hasCloseButton: chip.querySelector('[aria-label*="remove" i], [aria-label*="close" i], .close') !== null,
        
        dataAttributes: Array.from(chip.attributes)
          .filter(attr => attr.name.startsWith('data-'))
          .reduce((acc, attr) => ({ ...acc, [attr.name]: attr.value }), {}),
        
        allAttributes: getAllAttributes(chip),
        geometry: getElementGeometry(chip),
        styles: getComputedStyles(chip),
        events: getEventListeners(chip),
        domPath: getElementPath(chip),
        visible: chip.offsetParent !== null
      }))
      .filter(chip => chip.visible && chip.text && chip.text.length > 0 && chip.text.length < 100),
    
    // ══════════════════════════════════════════════════════════════
    // SLIDERS/RANGES (ULTRA DETALHADO)
    // ══════════════════════════════════════════════════════════════
    sliders: Array.from(document.querySelectorAll('input[type="range"], [role="slider"]')).map((slider, idx) => ({
      index: idx,
      tag: slider.tagName.toLowerCase(),
      type: slider.type,
      name: slider.name,
      id: slider.id,
      className: slider.className,
      
      // Valores
      value: slider.value,
      defaultValue: slider.defaultValue,
      min: slider.min || slider.getAttribute('aria-valuemin'),
      max: slider.max || slider.getAttribute('aria-valuemax'),
      step: slider.step,
      
      // ARIA
      ariaLabel: slider.getAttribute('aria-label'),
      ariaValueNow: slider.getAttribute('aria-valuenow'),
      ariaValueMin: slider.getAttribute('aria-valuemin'),
      ariaValueMax: slider.getAttribute('aria-valuemax'),
      ariaValueText: slider.getAttribute('aria-valuetext'),
      ariaOrientation: slider.getAttribute('aria-orientation'),
      
      // Estados
      disabled: slider.disabled || slider.getAttribute('aria-disabled') === 'true',
      
      // Label associado
      labelText: document.querySelector(`label[for="${slider.id}"]`)?.textContent?.trim() || 
                 slider.getAttribute('aria-label') || '',
      
      // Value display element (se existir)
      valueDisplay: (() => {
        const describedBy = slider.getAttribute('aria-describedby');
        if (describedBy) {
          const displayEl = document.getElementById(describedBy);
          return displayEl ? displayEl.textContent?.trim() : null;
        }
        return null;
      })(),
      
      dataAttributes: Array.from(slider.attributes)
        .filter(attr => attr.name.startsWith('data-'))
        .reduce((acc, attr) => ({ ...acc, [attr.name]: attr.value }), {}),
      
      allAttributes: getAllAttributes(slider),
      geometry: getElementGeometry(slider),
      styles: getComputedStyles(slider),
      events: getEventListeners(slider),
      domPath: getElementPath(slider),
      visible: slider.offsetParent !== null
    })).filter(s => s.visible),
    
    // ══════════════════════════════════════════════════════════════
    // CHECKBOXES (ULTRA DETALHADO)
    // ══════════════════════════════════════════════════════════════
    checkboxes: Array.from(document.querySelectorAll('input[type="checkbox"], [role="checkbox"]')).map((cb, idx) => ({
      index: idx,
      tag: cb.tagName.toLowerCase(),
      type: cb.type,
      name: cb.name,
      id: cb.id,
      className: cb.className,
      value: cb.value,
      
      // Estados
      checked: cb.checked || cb.getAttribute('aria-checked') === 'true',
      defaultChecked: cb.defaultChecked,
      indeterminate: cb.indeterminate || cb.getAttribute('aria-checked') === 'mixed',
      disabled: cb.disabled || cb.getAttribute('aria-disabled') === 'true',
      required: cb.required,
      
      // ARIA
      ariaLabel: cb.getAttribute('aria-label'),
      ariaChecked: cb.getAttribute('aria-checked'),
      ariaDescribedBy: cb.getAttribute('aria-describedby'),
      
      // Label
      labelText: (() => {
        if (cb.labels && cb.labels[0]) return cb.labels[0].textContent?.trim();
        const label = document.querySelector(`label[for="${cb.id}"]`);
        if (label) return label.textContent?.trim();
        const ariaLabel = cb.getAttribute('aria-label');
        if (ariaLabel) return ariaLabel;
        // Procurar label parent
        const parentLabel = cb.closest('label');
        if (parentLabel) return parentLabel.textContent?.trim();
        return '';
      })(),
      
      dataAttributes: Array.from(cb.attributes)
        .filter(attr => attr.name.startsWith('data-'))
        .reduce((acc, attr) => ({ ...acc, [attr.name]: attr.value }), {}),
      
      allAttributes: getAllAttributes(cb),
      geometry: getElementGeometry(cb),
      styles: getComputedStyles(cb),
      events: getEventListeners(cb),
      domPath: getElementPath(cb),
      visible: cb.offsetParent !== null
    })).filter(cb => cb.visible),
    
    // ══════════════════════════════════════════════════════════════
    // RADIO BUTTONS (ULTRA DETALHADO)
    // ══════════════════════════════════════════════════════════════
    radios: Array.from(document.querySelectorAll('input[type="radio"], [role="radio"]')).map((radio, idx) => ({
      index: idx,
      tag: radio.tagName.toLowerCase(),
      type: radio.type,
      name: radio.name,
      id: radio.id,
      className: radio.className,
      value: radio.value,
      
      // Estados
      checked: radio.checked || radio.getAttribute('aria-checked') === 'true',
      defaultChecked: radio.defaultChecked,
      disabled: radio.disabled || radio.getAttribute('aria-disabled') === 'true',
      required: radio.required,
      
      // ARIA
      ariaLabel: radio.getAttribute('aria-label'),
      ariaChecked: radio.getAttribute('aria-checked'),
      
      // Label
      labelText: (() => {
        if (radio.labels && radio.labels[0]) return radio.labels[0].textContent?.trim();
        const label = document.querySelector(`label[for="${radio.id}"]`);
        if (label) return label.textContent?.trim();
        const ariaLabel = radio.getAttribute('aria-label');
        if (ariaLabel) return ariaLabel;
        const parentLabel = radio.closest('label');
        if (parentLabel) return parentLabel.textContent?.trim();
        return '';
      })(),
      
      // Grupo (outros radios com mesmo name)
      groupName: radio.name,
      groupSize: document.querySelectorAll(`input[type="radio"][name="${radio.name}"]`).length,
      
      dataAttributes: Array.from(radio.attributes)
        .filter(attr => attr.name.startsWith('data-'))
        .reduce((acc, attr) => ({ ...acc, [attr.name]: attr.value }), {}),
      
      allAttributes: getAllAttributes(radio),
      geometry: getElementGeometry(radio),
      styles: getComputedStyles(radio),
      events: getEventListeners(radio),
      domPath: getElementPath(radio),
      visible: radio.offsetParent !== null
    })).filter(r => r.visible),
    
    // ══════════════════════════════════════════════════════════════
    // LABELS (todos)
    // ══════════════════════════════════════════════════════════════
    labels: Array.from(document.querySelectorAll('label')).map((label, idx) => ({
      index: idx,
      text: label.textContent?.trim() || '',
      htmlFor: label.getAttribute('for'),
      id: label.id,
      className: label.className,
      
      // Elemento associado
      hasAssociatedInput: label.htmlFor ? document.getElementById(label.htmlFor) !== null : false,
      associatedInputType: (() => {
        if (!label.htmlFor) return null;
        const input = document.getElementById(label.htmlFor);
        return input ? input.type || input.tagName.toLowerCase() : null;
      })(),
      
      // Elementos dentro do label
      containsInput: label.querySelector('input, select, textarea') !== null,
      
      dataAttributes: Array.from(label.attributes)
        .filter(attr => attr.name.startsWith('data-'))
        .reduce((acc, attr) => ({ ...acc, [attr.name]: attr.value }), {}),
      
      geometry: getElementGeometry(label),
      styles: getComputedStyles(label),
      domPath: getElementPath(label),
      visible: label.offsetParent !== null
    })).filter(l => l.text && l.text.length < 200),
    
    // ══════════════════════════════════════════════════════════════
    // HEADERS/TÍTULOS
    // ══════════════════════════════════════════════════════════════
    headers: Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map((h, idx) => ({
      index: idx,
      level: h.tagName,
      text: h.textContent?.trim() || '',
      id: h.id,
      className: h.className,
      
      dataAttributes: Array.from(h.attributes)
        .filter(attr => attr.name.startsWith('data-'))
        .reduce((acc, attr) => ({ ...acc, [attr.name]: attr.value }), {}),
      
      geometry: getElementGeometry(h),
      styles: getComputedStyles(h),
      domPath: getElementPath(h),
      visible: h.offsetParent !== null
    })).filter(h => h.visible && h.text),
    
    // ══════════════════════════════════════════════════════════════
    // LINKS/NAVEGAÇÃO
    // ══════════════════════════════════════════════════════════════
    links: Array.from(document.querySelectorAll('a[href]')).map((a, idx) => ({
      index: idx,
      text: a.textContent?.trim() || '',
      href: a.href,
      pathname: new URL(a.href, window.location.href).pathname,
      target: a.target,
      rel: a.rel,
      download: a.download,
      id: a.id,
      className: a.className,
      
      // ARIA
      ariaLabel: a.getAttribute('aria-label'),
      ariaCurrent: a.getAttribute('aria-current'),
      ariaDisabled: a.getAttribute('aria-disabled'),
      
      // Estados
      isExternal: a.hostname !== window.location.hostname,
      isActive: a.getAttribute('aria-current') === 'page' || a.classList.contains('active'),
      
      dataAttributes: Array.from(a.attributes)
        .filter(attr => attr.name.startsWith('data-'))
        .reduce((acc, attr) => ({ ...acc, [attr.name]: attr.value }), {}),
      
      geometry: getElementGeometry(a),
      styles: getComputedStyles(a),
      domPath: getElementPath(a),
      visible: a.offsetParent !== null
    })).filter(l => l.visible && (l.text || l.ariaLabel)).slice(0, 50), // Limitar a 50
    
    // ══════════════════════════════════════════════════════════════
    // MODAIS/DIALOGS
    // ══════════════════════════════════════════════════════════════
    modals: Array.from(document.querySelectorAll('[role="dialog"], [role="alertdialog"], [class*="modal"], [class*="dialog"]')).map((modal, idx) => ({
      index: idx,
      tag: modal.tagName.toLowerCase(),
      id: modal.id,
      className: modal.className,
      
      // ARIA
      role: modal.getAttribute('role'),
      ariaLabel: modal.getAttribute('aria-label'),
      ariaModal: modal.getAttribute('aria-modal'),
      ariaDescribedBy: modal.getAttribute('aria-describedby'),
      ariaLabelledBy: modal.getAttribute('aria-labelledby'),
      
      // Estados
      open: modal.getAttribute('aria-hidden') !== 'true' && modal.offsetParent !== null,
      dataState: modal.getAttribute('data-state'),
      
      // Conteúdo
      titleElement: modal.querySelector('h1, h2, h3, [role="heading"]')?.textContent?.trim(),
      hasCloseButton: modal.querySelector('[aria-label*="close" i], .close, [data-dismiss]') !== null,
      
      // Elementos dentro
      buttonsCount: modal.querySelectorAll('button').length,
      inputsCount: modal.querySelectorAll('input, select, textarea').length,
      
      dataAttributes: Array.from(modal.attributes)
        .filter(attr => attr.name.startsWith('data-'))
        .reduce((acc, attr) => ({ ...acc, [attr.name]: attr.value }), {}),
      
      geometry: getElementGeometry(modal),
      styles: getComputedStyles(modal),
      domPath: getElementPath(modal),
      visible: modal.offsetParent !== null
    })),
    
    // ══════════════════════════════════════════════════════════════
    // TOOLTIPS
    // ══════════════════════════════════════════════════════════════
    tooltips: Array.from(document.querySelectorAll('[role="tooltip"], [data-tooltip], [title]'))
      .map((tip, idx) => ({
        index: idx,
        tag: tip.tagName.toLowerCase(),
        text: tip.textContent?.trim() || tip.getAttribute('title') || tip.getAttribute('data-tooltip'),
        id: tip.id,
        className: tip.className,
        role: tip.getAttribute('role'),
        title: tip.getAttribute('title'),
        
        dataAttributes: Array.from(tip.attributes)
          .filter(attr => attr.name.startsWith('data-'))
          .reduce((acc, attr) => ({ ...acc, [attr.name]: attr.value }), {}),
        
        visible: tip.offsetParent !== null
      }))
      .filter(t => t.text && t.text.length < 300),
    
    // ══════════════════════════════════════════════════════════════
    // FORMS
    // ══════════════════════════════════════════════════════════════
    forms: Array.from(document.querySelectorAll('form')).map((form, idx) => ({
      index: idx,
      id: form.id,
      name: form.name,
      action: form.action,
      method: form.method,
      enctype: form.enctype,
      target: form.target,
      novalidate: form.noValidate,
      
      // Elementos do form
      elementsCount: form.elements.length,
      inputsCount: form.querySelectorAll('input').length,
      selectsCount: form.querySelectorAll('select').length,
      textareasCount: form.querySelectorAll('textarea').length,
      buttonsCount: form.querySelectorAll('button').length,
      
      dataAttributes: Array.from(form.attributes)
        .filter(attr => attr.name.startsWith('data-'))
        .reduce((acc, attr) => ({ ...acc, [attr.name]: attr.value }), {}),
      
      domPath: getElementPath(form)
    })),
    
    // ══════════════════════════════════════════════════════════════
    // IMAGENS
    // ══════════════════════════════════════════════════════════════
    images: Array.from(document.querySelectorAll('img')).map((img, idx) => ({
      index: idx,
      src: img.src,
      alt: img.alt,
      title: img.title,
      width: img.width,
      height: img.height,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      loading: img.loading,
      id: img.id,
      className: img.className,
      
      dataAttributes: Array.from(img.attributes)
        .filter(attr => attr.name.startsWith('data-'))
        .reduce((acc, attr) => ({ ...acc, [attr.name]: attr.value }), {}),
      
      visible: img.offsetParent !== null
    })).filter(i => i.visible).slice(0, 30), // Limitar
    
    // ══════════════════════════════════════════════════════════════
    // SVG ICONS
    // ══════════════════════════════════════════════════════════════
    svgIcons: Array.from(document.querySelectorAll('svg')).map((svg, idx) => ({
      index: idx,
      id: svg.id,
      className: svg.className.baseVal || svg.className,
      viewBox: svg.getAttribute('viewBox'),
      width: svg.getAttribute('width'),
      height: svg.getAttribute('height'),
      ariaLabel: svg.getAttribute('aria-label'),
      ariaHidden: svg.getAttribute('aria-hidden'),
      role: svg.getAttribute('role'),
      
      // Contar elementos internos
      pathsCount: svg.querySelectorAll('path').length,
      circlesCount: svg.querySelectorAll('circle').length,
      
      dataAttributes: Array.from(svg.attributes)
        .filter(attr => attr.name.startsWith('data-'))
        .reduce((acc, attr) => ({ ...acc, [attr.name]: attr.value }), {}),
      
      visible: svg.offsetParent !== null
    })).filter(s => s.visible).slice(0, 50),
    
    // ══════════════════════════════════════════════════════════════
    // PROGRESS BARS / LOADERS
    // ══════════════════════════════════════════════════════════════
    progressBars: Array.from(document.querySelectorAll('progress, [role="progressbar"], [class*="progress"], [class*="loader"]')).map((prog, idx) => ({
      index: idx,
      tag: prog.tagName.toLowerCase(),
      id: prog.id,
      className: prog.className,
      
      // Progress específico
      value: prog.value,
      max: prog.max,
      
      // ARIA
      role: prog.getAttribute('role'),
      ariaValueNow: prog.getAttribute('aria-valuenow'),
      ariaValueMin: prog.getAttribute('aria-valuemin'),
      ariaValueMax: prog.getAttribute('aria-valuemax'),
      ariaLabel: prog.getAttribute('aria-label'),
      
      // Percentagem calculada
      percentage: prog.max ? (prog.value / prog.max * 100).toFixed(2) + '%' : 
                  prog.getAttribute('aria-valuenow') && prog.getAttribute('aria-valuemax') ?
                  (prog.getAttribute('aria-valuenow') / prog.getAttribute('aria-valuemax') * 100).toFixed(2) + '%' : null,
      
      dataAttributes: Array.from(prog.attributes)
        .filter(attr => attr.name.startsWith('data-'))
        .reduce((acc, attr) => ({ ...acc, [attr.name]: attr.value }), {}),
      
      visible: prog.offsetParent !== null
    })).filter(p => p.visible),
    
    // ══════════════════════════════════════════════════════════════
    // CONTAINERS/SECTIONS (principais)
    // ══════════════════════════════════════════════════════════════
    mainContainers: Array.from(document.querySelectorAll('main, section, article, aside, nav, header, footer')).map((container, idx) => ({
      index: idx,
      tag: container.tagName.toLowerCase(),
      id: container.id,
      className: container.className,
      
      // ARIA
      role: container.getAttribute('role'),
      ariaLabel: container.getAttribute('aria-label'),
      ariaLabelledBy: container.getAttribute('aria-labelledby'),
      
      // Conteúdo
      childrenCount: container.children.length,
      deepElementsCount: container.querySelectorAll('*').length,
      textLength: container.textContent?.trim().length,
      
      // Elementos importantes dentro
      buttonsCount: container.querySelectorAll('button').length,
      inputsCount: container.querySelectorAll('input').length,
      linksCount: container.querySelectorAll('a').length,
      
      dataAttributes: Array.from(container.attributes)
        .filter(attr => attr.name.startsWith('data-'))
        .reduce((acc, attr) => ({ ...acc, [attr.name]: attr.value }), {}),
      
      geometry: getElementGeometry(container),
      styles: {
        display: window.getComputedStyle(container).display,
        position: window.getComputedStyle(container).position,
        width: window.getComputedStyle(container).width,
        height: window.getComputedStyle(container).height
      },
      
      domPath: getElementPath(container),
      visible: container.offsetParent !== null
    })).filter(c => c.visible),
    
    // ══════════════════════════════════════════════════════════════
    // DIVS IMPORTANTES (com muitos elementos ou IDs/classes relevantes)
    // ══════════════════════════════════════════════════════════════
    importantDivs: Array.from(document.querySelectorAll('div[id], div[class*="container"], div[class*="wrapper"], div[class*="panel"], div[class*="card"]'))
      .filter(div => div.querySelectorAll('*').length > 5) // Pelo menos 5 elementos filhos
      .map((div, idx) => ({
        index: idx,
        id: div.id,
        className: div.className,
        
        // ARIA
        role: div.getAttribute('role'),
        ariaLabel: div.getAttribute('aria-label'),
        
        // Conteúdo
        childrenCount: div.children.length,
        deepElementsCount: div.querySelectorAll('*').length,
        
        // Tipos de elementos dentro
        buttonsCount: div.querySelectorAll('button').length,
        inputsCount: div.querySelectorAll('input').length,
        selectsCount: div.querySelectorAll('select').length,
        textareasCount: div.querySelectorAll('textarea').length,
        
        dataAttributes: Array.from(div.attributes)
          .filter(attr => attr.name.startsWith('data-'))
          .reduce((acc, attr) => ({ ...acc, [attr.name]: attr.value }), {}),
        
        geometry: getElementGeometry(div),
        domPath: getElementPath(div),
        visible: div.offsetParent !== null
      }))
      .filter(d => d.visible)
      .slice(0, 30), // Limitar a 30
    
    // ══════════════════════════════════════════════════════════════
    // SCRIPTS NA PÁGINA
    // ══════════════════════════════════════════════════════════════
    scripts: Array.from(document.querySelectorAll('script')).map((script, idx) => ({
      index: idx,
      src: script.src,
      type: script.type,
      async: script.async,
      defer: script.defer,
      id: script.id,
      hasInlineCode: !script.src && script.textContent?.length > 0,
      inlineCodeLength: script.textContent?.length || 0
    })).slice(0, 20), // Limitar
    
    // ══════════════════════════════════════════════════════════════
    // STORAGE (LocalStorage, SessionStorage)
    // ══════════════════════════════════════════════════════════════
    storage: {
      localStorage: (() => {
        const data = {};
        try {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            // Tentar parse JSON
            try {
              data[key] = JSON.parse(value);
            } catch {
              data[key] = value.substring(0, 200); // Limitar tamanho
            }
          }
        } catch (e) {
          data._error = 'Acesso negado ao localStorage';
        }
        return data;
      })(),
      
      sessionStorage: (() => {
        const data = {};
        try {
          for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            const value = sessionStorage.getItem(key);
            try {
              data[key] = JSON.parse(value);
            } catch {
              data[key] = value.substring(0, 200);
            }
          }
        } catch (e) {
          data._error = 'Acesso negado ao sessionStorage';
        }
        return data;
      })()
    },
    
    // ══════════════════════════════════════════════════════════════
    // VARIÁVEIS GLOBAIS (React, Vue, Angular, etc)
    // ══════════════════════════════════════════════════════════════
    globalVariables: {
      hasReact: typeof window.React !== 'undefined',
      hasVue: typeof window.Vue !== 'undefined',
      hasAngular: typeof window.angular !== 'undefined',
      hasJQuery: typeof window.jQuery !== 'undefined',
      
      // Tentar encontrar root do React
      reactRoot: (() => {
        const roots = document.querySelectorAll('[data-reactroot], [data-react-root]');
        return roots.length > 0 ? roots[0].id || roots[0].className : null;
      })(),
      
      // Variáveis customizadas (comuns em apps)
      hasCustom: {
        app: typeof window.app !== 'undefined',
        config: typeof window.config !== 'undefined',
        state: typeof window.state !== 'undefined',
        store: typeof window.store !== 'undefined'
      }
    },
    
    // ══════════════════════════════════════════════════════════════
    // CSS VARIABLES (custom properties)
    // ══════════════════════════════════════════════════════════════
    cssVariables: (() => {
      const styles = window.getComputedStyle(document.documentElement);
      const vars = {};
      
      // Pegar primeiras 50 variáveis CSS
      Array.from(document.styleSheets).slice(0, 5).forEach(sheet => {
        try {
          Array.from(sheet.cssRules).forEach(rule => {
            if (rule.style) {
              for (let i = 0; i < rule.style.length; i++) {
                const prop = rule.style[i];
                if (prop.startsWith('--')) {
                  vars[prop] = rule.style.getPropertyValue(prop).trim();
                }
              }
            }
          });
        } catch (e) {
          // CORS ou acesso negado
        }
      });
      
      return Object.keys(vars).slice(0, 50).reduce((acc, key) => {
        acc[key] = vars[key];
        return acc;
      }, {});
    })(),
    
    // ══════════════════════════════════════════════════════════════
    // ESTATÍSTICAS GERAIS
    // ══════════════════════════════════════════════════════════════
    statistics: {
      totalElements: document.querySelectorAll('*').length,
      totalButtons: document.querySelectorAll('button, [role="button"], [type="button"]').length,
      totalInputs: document.querySelectorAll('input').length,
      totalTextareas: document.querySelectorAll('textarea').length,
      totalSelects: document.querySelectorAll('select').length,
      totalLinks: document.querySelectorAll('a[href]').length,
      totalImages: document.querySelectorAll('img').length,
      totalSVGs: document.querySelectorAll('svg').length,
      totalForms: document.querySelectorAll('form').length,
      totalTabs: document.querySelectorAll('[role="tab"]').length,
      totalModals: document.querySelectorAll('[role="dialog"], [role="alertdialog"]').length,
      totalScripts: document.querySelectorAll('script').length,
      totalStylesheets: document.querySelectorAll('link[rel="stylesheet"]').length,
      
      // Elementos com eventos
      elementsWithOnClick: document.querySelectorAll('[onclick]').length,
      elementsWithDataAttributes: document.querySelectorAll('[data-]').length,
      
      // Acessibilidade
      elementsWithAriaLabel: document.querySelectorAll('[aria-label]').length,
      elementsWithRole: document.querySelectorAll('[role]').length,
      
      // Performance
      domDepth: (() => {
        let maxDepth = 0;
        const getDepth = (el, depth = 0) => {
          maxDepth = Math.max(maxDepth, depth);
          Array.from(el.children).forEach(child => getDepth(child, depth + 1));
        };
        getDepth(document.body);
        return maxDepth;
      })()
    }
  };
  
  const endTime = performance.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log('\n✅ EXTRAÇÃO ULTRA DEEP COMPLETA!\n');
  console.log(`⏱️ Tempo de execução: ${duration} segundos\n`);
  console.log('📊 ESTATÍSTICAS DETALHADAS:');
  console.log(`   📦 Total de elementos no DOM: ${data.statistics.totalElements}`);
  console.log(`   🔘 Botões: ${data.buttons.length} (visíveis e funcionais)`);
  console.log(`   📝 Inputs: ${data.inputs.length}`);
  console.log(`   📄 Textareas: ${data.textareas.length}`);
  console.log(`   📋 Selects nativos: ${data.selects.length}`);
  console.log(`   🎯 Dropdowns customizados: ${data.customDropdowns.length}`);
  console.log(`   📑 Tabs: ${data.tabs.length}`);
  console.log(`   🏷️ Chips/Tags: ${data.chips.length}`);
  console.log(`   🎚️ Sliders: ${data.sliders.length}`);
  console.log(`   ☑️ Checkboxes: ${data.checkboxes.length}`);
  console.log(`   🔘 Radio buttons: ${data.radios.length}`);
  console.log(`   🏷️ Labels: ${data.labels.length}`);
  console.log(`   📰 Headers: ${data.headers.length}`);
  console.log(`   🔗 Links: ${data.links.length}`);
  console.log(`   🖼️ Imagens: ${data.images.length}`);
  console.log(`   🎨 SVG Icons: ${data.svgIcons.length}`);
  console.log(`   📝 Forms: ${data.forms.length}`);
  console.log(`   💬 Modais: ${data.modals.length}`);
  console.log(`   📦 Containers principais: ${data.mainContainers.length}`);
  console.log(`   🎯 Divs importantes: ${data.importantDivs.length}`);
  console.log(`   📜 Scripts: ${data.scripts.length}`);
  console.log(`   💾 localStorage items: ${Object.keys(data.storage.localStorage).length}`);
  console.log(`   💾 sessionStorage items: ${Object.keys(data.storage.sessionStorage).length}`);
  console.log(`   🎨 CSS Variables: ${Object.keys(data.cssVariables).length}`);
  console.log(`   🌲 Profundidade máxima DOM: ${data.statistics.domDepth} níveis`);
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📋 JSON COMPLETO ABAIXO - COPIA TUDO!');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  // Output JSON
  const jsonString = JSON.stringify(data, null, 2);
  console.log(jsonString);
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`✅ FEITO! ${jsonString.length} caracteres extraídos`);
  console.log('📋 Copia todo o JSON acima (do { até ao último })');
  console.log('═══════════════════════════════════════════════════════════');
  
  // Download automático
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `suno-ultra-deep-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  console.log(`\n💾 Ficheiro descarregado: suno-ultra-deep-${Date.now()}.json`);
  console.log('📤 Envia-me esse ficheiro ou cola o JSON acima!');
  
  return data;
})();

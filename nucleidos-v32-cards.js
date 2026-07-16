(() => {
  'use strict';
  const api = window.NucleidosV32;
  if (!api) return;
  const ATOM_PANEL_PREFERENCE = 'nucleidos.atomPanelExpanded.v32';

  try {
    api.atomPanelExpanded = localStorage.getItem(ATOM_PANEL_PREFERENCE) !== 'false';
  } catch (_) {
    api.atomPanelExpanded = true;
  }

  function renameIds(clone, prefix) {
    api.$$('[id]', clone).forEach(node => {
      node.dataset.v32SourceId = node.id;
      node.id = `${prefix}-${node.id}`;
    });
  }

  function copyCanvas(source, clone, sourceId) {
    const target = clone.querySelector(`[data-v32-source-id="${sourceId}"]`);
    if (!(source instanceof HTMLCanvasElement) || !(target instanceof HTMLCanvasElement)) return;
    target.width = source.width;
    target.height = source.height;
    try { target.getContext('2d').drawImage(source, 0, 0); } catch (_) {}
  }

  function localTabs(clone) {
    const buttons = api.$$('.tab-button', clone);
    const panels = api.$$('.tab-panel', clone);
    buttons.forEach(button => button.addEventListener('click', event => {
      event.stopPropagation();
      buttons.forEach(item => item.classList.toggle('active', item === button));
      panels.forEach(panel => panel.classList.toggle('active', panel.dataset.panel === button.dataset.tab));
    }));
    buttons.forEach(button => button.classList.toggle('active', button.dataset.tab === 'summary'));
    panels.forEach(panel => panel.classList.toggle('active', panel.dataset.panel === 'summary'));
  }

  function installAtomDetails(clone) {
    const sheet = clone.querySelector('.tab-panel[data-panel="structure"] .detail-sheet');
    if (!sheet) return;
    const shells = clone.querySelector('[data-v32-source-id="shellText"]')?.textContent?.trim() || '—';
    const rows = document.createElement('div');
    rows.className = 'atom-data-rows-v34';
    rows.innerHTML = `<div class="detail-row"><span>Capas electrónicas</span><strong>${shells}</strong></div><div class="detail-row"><span>Representación atómica</span><strong>Modelo 3D esquemático</strong></div>`;
    sheet.append(...rows.children);
  }

  function updateAtomToggle(record) {
    const button = record.controls?.querySelector('[data-window-action="atom-toggle"]');
    if (!button) return;
    const expanded = api.atomPanelExpanded !== false;
    const label = expanded ? 'Replegar modelo 3D' : 'Desplegar modelo 3D';
    button.innerHTML = expanded ? api.icons.collapseAtom : api.icons.expandAtom;
    button.setAttribute('aria-label', label);
    button.setAttribute('aria-expanded', String(expanded));
    button.title = label;
  }

  function applyAtomPanelState(record, expanded) {
    if (!record?.element?.isConnected) return;
    const element = record.element;
    const wasCollapsed = element.classList.contains('atom-panel-collapsed-v32');
    if (!expanded && !wasCollapsed) {
      if (!record.maximized) {
        const geometry = api.geometry(element);
        const infoWidth = element.querySelector('.card-info')?.getBoundingClientRect().width || geometry.width * .53;
        record.atomExpandedGeometry = geometry;
        const width = api.clamp(Math.round(Math.max(520, infoWidth + 2)), 420, geometry.width);
        api.applyGeometry(element, {
          ...geometry,
          left: api.clamp(geometry.left, 6, Math.max(6, innerWidth - width - 6)),
          width
        });
      } else if (record.restoreGeometry) {
        const geometry = record.restoreGeometry;
        record.atomExpandedGeometry = { ...geometry };
        const width = api.clamp(Math.round(Math.max(520, geometry.width * .53)), 420, geometry.width);
        record.restoreGeometry = {
          ...geometry,
          left: api.clamp(geometry.left, 6, Math.max(6, innerWidth - width - 6)),
          width
        };
      }
      element.classList.add('atom-panel-collapsed-v32');
    } else if (expanded && wasCollapsed) {
      element.classList.remove('atom-panel-collapsed-v32');
      if (record.maximized && record.atomExpandedGeometry) record.restoreGeometry = record.atomExpandedGeometry;
      else if (record.atomExpandedGeometry) api.applyGeometry(element, record.atomExpandedGeometry);
      record.atomExpandedGeometry = null;
    }
    updateAtomToggle(record);
  }

  api.setAtomPanelsExpanded = expanded => {
    api.atomPanelExpanded = Boolean(expanded);
    try { localStorage.setItem(ATOM_PANEL_PREFERENCE, String(api.atomPanelExpanded)); } catch (_) {}
    api.cardsByUid.forEach(record => applyAtomPanelState(record, api.atomPanelExpanded));
    document.dispatchEvent(new CustomEvent('nucleidos:card-layout', { detail: { atomPanelExpanded: api.atomPanelExpanded } }));
  };

  api.toggleAtomPanels = () => api.setAtomPanelsExpanded(api.atomPanelExpanded === false);

  function cardActions(clone, record) {
    clone.querySelector('[data-v32-source-id="addCompareButton"]')?.addEventListener('click', event => {
      event.stopPropagation();
      api.setSelected(record.nuclide);
      if (typeof api.addToComparator === 'function') api.addToComparator(record.nuclide);
      else if (typeof addSelectedToCompare === 'function') addSelectedToCompare();
    });
    clone.querySelector('[data-v32-source-id="exportCardButton"]')?.addEventListener('click', event => {
      event.stopPropagation();
      api.setSelected(record.nuclide);
      api.templateCard.classList.add('v32-template-rendering');
      api.originalSelect(record.nuclide);
      api.templateCard.classList.remove('open', 'v32-template-rendering');
      if (typeof exportSelectedCardPng === 'function') exportSelectedCardPng();
    });
  }

  function installAtomAnimation(clone, record) {
    const canvas = clone.querySelector('[data-v32-source-id="atomCanvas"]');
    if (!(canvas instanceof HTMLCanvasElement)) return;
    record.atomCanvas = canvas;
    record.atomState = typeof buildAtomState === 'function' ? buildAtomState(record.nuclide) : null;
    record.atomAnimationEnabled = true;
    record.atomFrame = performance.now() * .001;
    canvas.classList.remove('paused');
    canvas.title = 'Pulsar para pausar o reanudar la animación 3D';
    canvas.addEventListener('click', event => {
      event.stopPropagation();
      record.atomAnimationEnabled = !record.atomAnimationEnabled;
      if (!record.atomAnimationEnabled) record.atomFrame = performance.now() * .001;
      canvas.classList.toggle('paused', !record.atomAnimationEnabled);
      canvas.setAttribute('aria-label', record.atomAnimationEnabled
        ? 'Simulación atómica 3D en movimiento'
        : 'Simulación atómica 3D pausada');
    });
  }

  function startAtomRenderer() {
    if (api.atomRendererStarted) return;
    api.atomRendererStarted = true;
    const render = time => {
      const source = api.templateCard?.querySelector('#atomCanvas');
      const visible = [...api.cardsByUid.values()].filter(record =>
        record.atomCanvas?.isConnected
        && !record.minimized
        && !record.element.classList.contains('atom-panel-collapsed-v32')
        && record.element.getAttribute('aria-hidden') !== 'true'
      );
      if (source instanceof HTMLCanvasElement && visible.length
        && typeof state !== 'undefined' && typeof drawAtom === 'function') {
        const saved = {
          atom: state.atom,
          animationEnabled: state.animationEnabled,
          atomFrame: state.atomFrame
        };
        for (const record of visible) {
          if (!record.atomState) continue;
          const target = record.atomCanvas;
          const rect = target.getBoundingClientRect();
          const dpr = Math.min(2, window.devicePixelRatio || 1);
          const width = Math.max(300, Math.floor(rect.width * dpr));
          const height = Math.max(260, Math.floor(rect.height * dpr));
          if (source.width !== width || source.height !== height) {
            source.width = width;
            source.height = height;
          }
          if (target.width !== width || target.height !== height) {
            target.width = width;
            target.height = height;
          }
          state.atom = record.atomState;
          state.animationEnabled = record.atomAnimationEnabled;
          state.atomFrame = record.atomFrame;
          drawAtom(time);
          record.atomFrame = state.atomFrame;
          const context = target.getContext('2d');
          context.clearRect(0, 0, width, height);
          context.drawImage(source, 0, 0, width, height);
        }
        state.atom = saved.atom;
        state.animationEnabled = saved.animationEnabled;
        state.atomFrame = saved.atomFrame;
      }
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }

  api.createCard = nuclide => {
    const existing = api.cardsByUid.get(nuclide.uid);
    if (existing) {
      if (existing.minimized) api.restore(existing);
      api.focus(existing);
      return existing;
    }

    api.templateCard.classList.add('v32-template-rendering');
    api.originalSelect(nuclide);
    api.templateCard.classList.remove('open', 'v32-template-rendering');
    api.templateCard.setAttribute('aria-hidden', 'true');

    const sourceAtom = api.$('#atomCanvas', api.templateCard);
    const clone = api.templateCard.cloneNode(true);
    const prefix = `nuclide-${String(nuclide.uid).replace(/[^a-z0-9_-]/gi, '-')}-${Date.now()}`;
    clone.id = `${prefix}-window`;
    clone.removeAttribute('style');
    clone.className = 'nuclide-card nuclide-card-window-v32 managed-window-v32 open';
    clone.setAttribute('aria-hidden', 'false');
    clone.querySelector('.card-window-bar-v31')?.remove();
    clone.querySelector('.resize-handles-v31')?.remove();
    clone.querySelector('.card-close')?.remove();
    renameIds(clone, prefix);

    const record = api.register(clone, 'card', `${nuclide.symbol}-${nuclide.a}`, { id: `card-${nuclide.uid}`, nuclide });
    const header = document.createElement('header');
    header.className = 'window-header-v32 card-window-header-v32';
    header.innerHTML = `<div class="window-title-v32"><strong>${nuclide.symbol}-${nuclide.a}</strong><span>${nuclide.element} · Z=${nuclide.z} · N=${nuclide.n}</span></div>`;
    header.appendChild(api.controls(record));
    clone.insertBefore(header, clone.firstChild);
    document.body.appendChild(clone);
    api.applyGeometry(clone, api.safeGeometry(1160, 740));
    api.drag(record, header);
    api.resizeHandles(record, 420, 300);
    localTabs(clone);
    installAtomDetails(clone);
    cardActions(clone, record);
    copyCanvas(sourceAtom, clone, 'atomCanvas');
    installAtomAnimation(clone, record);
    api.cardsByUid.set(nuclide.uid, record);
    applyAtomPanelState(record, api.atomPanelExpanded !== false);
    api.focus(record);
    return record;
  };

  api.installCards = () => {
    const template = api.$('#nuclideCard');
    if (!template || template.dataset.v32Template === '1') return false;
    const originalSelect = window.selectNuclide;
    const originalClose = window.closeNuclideCard;
    if (typeof originalSelect !== 'function') return false;

    api.templateCard = template;
    api.originalSelect = originalSelect;
    api.originalClose = originalClose;
    template.dataset.v32Template = '1';
    template.classList.remove('open');
    template.setAttribute('aria-hidden', 'true');

    const multiSelect = nuclide => { if (nuclide) api.createCard(nuclide); };
    const closeActiveCard = () => {
      const record = api.activeWindow?.type === 'card'
        ? api.activeWindow
        : [...api.cardsByUid.values()].sort((a, b) => (b.lastFocus || 0) - (a.lastFocus || 0))[0];
      if (record) api.close(record);
      else originalClose?.();
    };

    window.selectNuclide = multiSelect;
    window.closeNuclideCard = closeActiveCard;
    try { selectNuclide = multiSelect; } catch (_) {}
    try { closeNuclideCard = closeActiveCard; } catch (_) {}
    startAtomRenderer();
    return true;
  };
})();

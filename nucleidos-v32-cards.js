(() => {
  'use strict';
  const api = window.NucleidosV32;
  if (!api) return;

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

  function cardActions(clone, record) {
    clone.querySelector('[data-v32-source-id="addCompareButton"]')?.addEventListener('click', event => {
      event.stopPropagation();
      api.setSelected(record.nuclide);
      if (typeof addSelectedToCompare === 'function') addSelectedToCompare();
    });
    clone.querySelector('[data-v32-source-id="exportCardButton"]')?.addEventListener('click', event => {
      event.stopPropagation();
      api.setSelected(record.nuclide);
      api.originalSelect(record.nuclide);
      api.templateCard.classList.remove('open');
      if (typeof exportSelectedCardPng === 'function') exportSelectedCardPng();
    });
  }

  api.createCard = nuclide => {
    const existing = api.cardsByUid.get(nuclide.uid);
    if (existing) {
      if (existing.minimized) api.restore(existing);
      api.focus(existing);
      return existing;
    }

    api.originalSelect(nuclide);
    api.templateCard.classList.remove('open');
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
    api.applyGeometry(clone, api.safeGeometry());
    api.drag(record, header);
    api.resizeHandles(record, 420, 300);
    localTabs(clone);
    cardActions(clone, record);
    copyCanvas(sourceAtom, clone, 'atomCanvas');
    api.cardsByUid.set(nuclide.uid, record);
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
    return true;
  };
})();
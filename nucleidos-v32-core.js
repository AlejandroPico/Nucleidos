(() => {
  'use strict';
  const api = window.NucleidosV32 = window.NucleidosV32 || {};
  const windows = api.windows = new Map();
  api.cardsByUid = new Map();
  api.SAFE_TOP = 70;
  api.activeWindow = null;
  api.cascade = 0;
  api.$ = (s, r = document) => r.querySelector(s);
  api.$$ = (s, r = document) => [...r.querySelectorAll(s)];
  api.clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  api.icons = {
    minimize: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 11.5h10"/></svg>',
    maximize: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="3" width="10" height="10" rx="1"/></svg>',
    restore: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="5" y="3" width="8" height="8" rx="1"/><path d="M11 11v2H3V5h2"/></svg>',
    close: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 4 8 8M12 4l-8 8"/></svg>'
  };

  api.waitFor = (test, timeout = 20000) => new Promise(resolve => {
    const start = performance.now();
    const tick = () => {
      try { if (test()) return resolve(true); } catch (_) {}
      if (performance.now() - start >= timeout) return resolve(false);
      setTimeout(tick, 60);
    };
    tick();
  });

  api.ensureTaskbar = () => {
    if (api.taskbar) return api.taskbar;
    const bar = document.createElement('aside');
    bar.id = 'windowTaskbarV32';
    bar.className = 'window-taskbar-v32';
    bar.setAttribute('aria-label', 'Ventanas minimizadas');
    document.body.appendChild(bar);
    api.taskbar = bar;
    return bar;
  };

  api.makeButton = (action, label, icon) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.windowAction = action;
    button.className = `window-action-v32 window-${action}-v32`;
    button.setAttribute('aria-label', label);
    button.title = label;
    button.innerHTML = icon;
    return button;
  };

  api.setSelected = nuclide => {
    if (typeof state === 'undefined') return;
    state.selected = nuclide || null;
    if (nuclide && typeof buildAtomState === 'function') state.atom = buildAtomState(nuclide);
    if (typeof scheduleRender === 'function') scheduleRender();
    document.dispatchEvent(new CustomEvent('nucleidos:window-selection', { detail: { nuclide: nuclide || null } }));
  };

  api.normalizeZ = () => {
    const visible = [...windows.values()]
      .filter(r => r.element.isConnected && !r.minimized && r.element.getAttribute('aria-hidden') !== 'true')
      .sort((a, b) => (a.lastFocus || 0) - (b.lastFocus || 0));
    visible.forEach((record, index) => {
      record.element.style.zIndex = String(760 + index);
      record.element.classList.toggle('window-active-v32', record === api.activeWindow);
    });
  };

  api.focus = record => {
    if (!record || !record.element.isConnected || record.minimized || record.element.getAttribute('aria-hidden') === 'true') return;
    api.activeWindow = record;
    record.lastFocus = performance.now();
    api.normalizeZ();
    if (record.type === 'card') api.setSelected(record.nuclide);
  };

  api.geometry = element => {
    const r = element.getBoundingClientRect();
    return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
  };

  api.applyGeometry = (element, g) => Object.assign(element.style, {
    position: 'fixed', left: `${g.left}px`, top: `${g.top}px`, width: `${g.width}px`, height: `${g.height}px`, right: 'auto', bottom: 'auto'
  });

  api.safeGeometry = (width = 860, height = 620) => {
    const w = Math.min(width, Math.max(360, innerWidth - 24));
    const h = Math.min(height, Math.max(280, innerHeight - api.SAFE_TOP - 18));
    const offset = (api.cascade++ % 8) * 26;
    return {
      left: api.clamp(24 + offset, 8, Math.max(8, innerWidth - w - 8)),
      top: api.clamp(api.SAFE_TOP + 12 + offset, api.SAFE_TOP, Math.max(api.SAFE_TOP, innerHeight - h - 8)),
      width: w, height: h
    };
  };

  api.updateMaxIcon = record => {
    const button = record.controls?.querySelector('[data-window-action="maximize"]');
    if (!button) return;
    button.innerHTML = record.maximized ? api.icons.restore : api.icons.maximize;
    const label = record.maximized ? 'Restaurar tamaño' : 'Maximizar';
    button.setAttribute('aria-label', label);
    button.title = label;
  };

  api.maximize = record => {
    if (!record || record.minimized) return;
    if (!record.maximized) {
      record.restoreGeometry = api.geometry(record.element);
      record.maximized = true;
      record.element.classList.add('window-maximized-v32');
      api.applyGeometry(record.element, { left: 8, top: api.SAFE_TOP, width: Math.max(360, innerWidth - 16), height: Math.max(280, innerHeight - api.SAFE_TOP - 8) });
    } else {
      record.maximized = false;
      record.element.classList.remove('window-maximized-v32');
      api.applyGeometry(record.element, record.restoreGeometry || api.safeGeometry());
    }
    api.updateMaxIcon(record);
    api.focus(record);
    requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
  };

  api.createTask = record => {
    api.ensureTaskbar();
    record.taskItem?.remove();
    const item = document.createElement('div');
    item.className = 'window-task-v32';
    const title = document.createElement('button');
    title.type = 'button'; title.className = 'window-task-title-v32'; title.textContent = record.title;
    const restore = api.makeButton('restore', 'Restaurar', api.icons.restore);
    const close = api.makeButton('close', 'Cerrar', api.icons.close);
    title.addEventListener('click', () => api.restore(record));
    restore.addEventListener('click', () => api.restore(record));
    close.addEventListener('click', () => api.close(record));
    item.append(title, restore, close);
    api.taskbar.appendChild(item);
    record.taskItem = item;
  };

  api.minimize = record => {
    if (!record || record.minimized) return;
    record.minimized = true;
    record.element.classList.add('window-minimized-v32');
    record.element.setAttribute('aria-hidden', 'true');
    record.element.style.display = 'none';
    api.createTask(record);
    if (api.activeWindow === record) api.activeWindow = null;
    api.normalizeZ();
  };

  api.restore = record => {
    if (!record || !record.element.isConnected) return;
    record.minimized = false;
    record.element.classList.remove('window-minimized-v32');
    record.element.style.removeProperty('display');
    record.element.setAttribute('aria-hidden', 'false');
    record.taskItem?.remove(); record.taskItem = null;
    api.focus(record);
    requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
  };

  api.close = record => {
    if (!record) return;
    record.taskItem?.remove(); record.taskItem = null;
    if (record.type === 'card') {
      windows.delete(record.id);
      api.cardsByUid.delete(record.nuclide.uid);
      record.element.remove();
    } else {
      record.element.querySelector('[data-close-profile]')?.click();
      record.element.classList.remove('window-minimized-v32', 'window-maximized-v32', 'window-active-v32');
      record.element.style.removeProperty('display');
      record.minimized = false; record.maximized = false;
      api.updateMaxIcon(record);
    }
    if (api.activeWindow === record) api.activeWindow = null;
    const next = [...windows.values()]
      .filter(r => r.element.isConnected && !r.minimized && r.element.getAttribute('aria-hidden') !== 'true')
      .sort((a, b) => (b.lastFocus || 0) - (a.lastFocus || 0))[0];
    if (next) api.focus(next);
    const selectedCard = next?.type === 'card' ? next : [...api.cardsByUid.values()].sort((a, b) => (b.lastFocus || 0) - (a.lastFocus || 0))[0];
    api.setSelected(selectedCard?.nuclide || null);
  };

  api.controls = record => {
    const nav = document.createElement('nav'); nav.className = 'window-controls-v32';
    const min = api.makeButton('minimize', 'Minimizar', api.icons.minimize);
    const max = api.makeButton('maximize', 'Maximizar', api.icons.maximize);
    const close = api.makeButton('close', 'Cerrar', api.icons.close);
    min.addEventListener('click', e => { e.stopPropagation(); api.minimize(record); });
    max.addEventListener('click', e => { e.stopPropagation(); api.maximize(record); });
    close.addEventListener('click', e => { e.stopPropagation(); api.close(record); });
    nav.append(min, max, close); record.controls = nav; return nav;
  };

  api.register = (element, type, title, data = {}) => {
    const id = data.id || `${type}-${Math.random().toString(36).slice(2)}`;
    if (windows.has(id)) return windows.get(id);
    const record = { id, element, type, title, minimized: false, maximized: false, lastFocus: performance.now(), ...data };
    windows.set(id, record);
    element.dataset.v32Window = id;
    element.classList.add('managed-window-v32');
    element.addEventListener('pointerdown', () => queueMicrotask(() => api.focus(record)));
    return record;
  };

  api.drag = (record, header) => {
    if (!header || header.dataset.v32Drag) return;
    header.dataset.v32Drag = '1';
    let drag = null;
    header.addEventListener('pointerdown', e => {
      if (e.button !== 0 || e.target.closest('button') || record.minimized || record.maximized) return;
      const r = api.geometry(record.element);
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, left: r.left, top: r.top };
      header.setPointerCapture?.(e.pointerId); api.focus(record); e.preventDefault();
    });
    header.addEventListener('pointermove', e => {
      if (!drag || drag.id !== e.pointerId) return;
      record.element.style.left = `${api.clamp(drag.left + e.clientX - drag.x, 0, Math.max(0, innerWidth - record.element.offsetWidth))}px`;
      record.element.style.top = `${api.clamp(drag.top + e.clientY - drag.y, api.SAFE_TOP, Math.max(api.SAFE_TOP, innerHeight - record.element.offsetHeight))}px`;
    });
    const end = e => { if (drag && drag.id === e.pointerId) drag = null; };
    header.addEventListener('pointerup', end); header.addEventListener('pointercancel', end);
  };

  api.resizeHandles = (record, minWidth = 380, minHeight = 260) => {
    if (record.element.querySelector(':scope > .resize-handles-v32')) return;
    const host = document.createElement('div'); host.className = 'resize-handles-v32';
    for (const d of ['n','ne','e','se','s','sw','w','nw']) {
      const h = document.createElement('div'); h.className = `resize-handle-v32 resize-${d}-v32`; h.dataset.resizeDirection = d; host.appendChild(h);
    }
    record.element.appendChild(host);
    host.addEventListener('pointerdown', e => {
      const handle = e.target.closest('[data-resize-direction]');
      if (!handle || record.minimized || record.maximized) return;
      const r = api.geometry(record.element); const start = { id: e.pointerId, x: e.clientX, y: e.clientY }; const d = handle.dataset.resizeDirection;
      handle.setPointerCapture?.(e.pointerId); api.focus(record);
      const move = m => {
        if (m.pointerId !== start.id) return;
        const dx = m.clientX - start.x, dy = m.clientY - start.y;
        let { left, top, width, height } = r;
        if (d.includes('e')) width = api.clamp(r.width + dx, minWidth, innerWidth - r.left - 6);
        if (d.includes('s')) height = api.clamp(r.height + dy, minHeight, innerHeight - r.top - 6);
        if (d.includes('w')) { width = api.clamp(r.width - dx, minWidth, r.right - 6); left = r.right - width; }
        if (d.includes('n')) { height = api.clamp(r.height - dy, minHeight, r.bottom - api.SAFE_TOP); top = r.bottom - height; }
        api.applyGeometry(record.element, { left, top, width, height });
        record.element.dispatchEvent(new Event('resize'));
      };
      const end = m => {
        if (m.pointerId !== start.id) return;
        handle.removeEventListener('pointermove', move); handle.removeEventListener('pointerup', end); handle.removeEventListener('pointercancel', end);
        window.dispatchEvent(new Event('resize'));
      };
      handle.addEventListener('pointermove', move); handle.addEventListener('pointerup', end); handle.addEventListener('pointercancel', end);
      e.preventDefault(); e.stopPropagation();
    });
  };
})();
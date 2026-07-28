/* ============================================================================
   comments.js — in-situ review notes

   No login, no backend. Notes live in this browser only and export to
   CSV / Markdown / JSON. Several reviewers' JSON exports can be merged
   into one combined CSV for reconciliation.
   ========================================================================= */

(function (global) {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const KEY = 'day1wf.notes.v1';
  const WHO = 'day1wf.who.v1';

  const TYPES = [
    { k: 'concept', label: 'Concept' },
    { k: 'flow',    label: 'Flow & state' },
    { k: 'screen',  label: 'Screen' },
    { k: 'copy',    label: 'Copy' }
  ];

  const Notes = {
    items: [],
    merged: [],
    mode: false,
    who: '',
    filter: 'all',
    draft: null,

    init() {
      try {
        this.items = JSON.parse(localStorage.getItem(KEY) || '[]');
        this.who = localStorage.getItem(WHO) || '';
      } catch (e) { this.items = []; }
    },

    persist() {
      try { localStorage.setItem(KEY, JSON.stringify(this.items)); } catch (e) {}
    },

    all() { return this.items; },
    forScreen(id) { return this.items.filter(n => n.screen === id); },

    toggleMode() {
      this.mode = !this.mode;
      const b = $('[data-cmt]');
      if (b) b.setAttribute('aria-pressed', String(this.mode));
      const s = $('#screen');
      if (s) s.classList.toggle('commenting', this.mode);
      this.closePop();
    },

    /* ------------------------- pins on the screen -------------------- */

    mount() {
      const screen = $('#screen');
      const host = $('#pins');
      if (!screen || !host) return;

      const wrap = $('#stagewrap');
      host.style.cssText = 'position:absolute;inset:0;pointer-events:none';
      wrap.style.position = 'relative';

      screen.classList.toggle('commenting', this.mode);

      const id = screen.dataset.screen;
      host.innerHTML = this.forScreen(id).map((n, i) =>
        `<button class="pin" data-pin-id="${n.id}" style="left:${n.x}%;top:${n.y}%;pointer-events:auto"
           title="${esc(n.type)}">${i + 1}</button>`).join('');

      $$('[data-pin-id]', host).forEach(b => b.onclick = e => {
        e.stopPropagation();
        this.openThread(b.dataset.pinId, b);
      });

      screen.onclick = e => {
        if (!this.mode) return;
        if (e.target.closest('.pin') || e.target.closest('.pop')) return;
        const r = screen.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 100;
        const y = ((e.clientY - r.top) / r.height) * 100;
        this.openComposer(id, x, y);
      };
    },

    ghost(x, y) {
      const host = $('#pins');
      if (!host) return;
      const g = document.createElement('span');
      g.className = 'pin pin--ghost';
      g.id = 'ghostpin';
      g.style.cssText = `left:${x}%;top:${y}%`;
      g.textContent = '+';
      host.appendChild(g);
    },

    closePop() {
      const p = $('#pop'); if (p) p.remove();
      const g = $('#ghostpin'); if (g) g.remove();
      this.draft = null;
    },

    place(el, x, y) {
      const wrap = $('#stagewrap');
      const r = wrap.getBoundingClientRect();
      const left = Math.min(Math.max((x / 100) * r.width - 134, 8), r.width - 276);
      const top = (y / 100) * r.height + 12;
      el.style.left = left + 'px';
      el.style.top = Math.min(top, r.height - 40) + 'px';
    },

    openComposer(screenId, x, y) {
      this.closePop();
      this.ghost(x, y);
      const s = global.CONTENT.SCREENS.find(z => z.id === screenId);
      this.draft = { type: 'concept' };

      const el = document.createElement('div');
      el.className = 'pop';
      el.id = 'pop';
      el.innerHTML = `
        <div class="pop__types">
          ${TYPES.map(t => `<button data-type="${t.k}" aria-pressed="${t.k === 'concept'}">${t.label}</button>`).join('')}
        </div>
        <textarea placeholder="What about this screen?" autofocus></textarea>
        <div class="pop__row">
          <span class="pop__hint">${esc(s ? s.id : '')}</span>
          <button class="btn-quiet" data-cancel>Cancel</button>
          <button class="btn-pink" data-save>Add</button>
        </div>`;

      $('#stagewrap').appendChild(el);
      this.place(el, x, y);

      $$('[data-type]', el).forEach(b => b.onclick = () => {
        $$('[data-type]', el).forEach(x2 => x2.setAttribute('aria-pressed', String(x2 === b)));
        this.draft.type = b.dataset.type;
      });

      const ta = $('textarea', el);
      setTimeout(() => ta.focus(), 20);

      const save = () => {
        const text = ta.value.trim();
        if (!text) { this.closePop(); return; }
        this.add({ screen: screenId, stage: s ? s.stage : 0, x, y, type: this.draft.type, text });
        this.closePop();
        this.mount();
        $('#top').innerHTML = global.App.topbar();
        global.App.wireTop();
      };

      $('[data-save]', el).onclick = save;
      $('[data-cancel]', el).onclick = () => this.closePop();
      ta.onkeydown = e => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) save();
        if (e.key === 'Escape') this.closePop();
      };
    },

    openThread(noteId, pinEl) {
      this.closePop();
      const n = this.items.find(z => z.id === noteId);
      if (!n) return;

      const el = document.createElement('div');
      el.className = 'pop';
      el.id = 'pop';
      el.innerHTML = `
        <div class="pop__existing">
          <div class="pop__meta"><b>${esc(typeLabel(n.type))}</b>
            <span>${n.who ? esc(n.who) + ' · ' : ''}${new Date(n.at).toLocaleDateString()}</span></div>
          <div class="pop__text">${esc(n.text)}</div>
        </div>
        <div class="pop__row">
          <span class="pop__hint"></span>
          <button class="btn-quiet" data-del>Delete</button>
          <button class="btn-quiet" data-cancel>Close</button>
        </div>`;

      $('#stagewrap').appendChild(el);
      this.place(el, n.x, n.y);

      $('[data-cancel]', el).onclick = () => this.closePop();
      $('[data-del]', el).onclick = () => {
        this.items = this.items.filter(z => z.id !== noteId);
        this.persist();
        this.closePop();
        this.mount();
        $('#top').innerHTML = global.App.topbar();
        global.App.wireTop();
      };
    },

    add(n) {
      n.id = 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      n.at = new Date().toISOString();
      n.who = this.who;
      this.items.push(n);
      this.persist();
    },

    /* ---------------------------- NOTES VIEW ------------------------- */

    render() {
      const S = global.CONTENT.SCREENS, ST = global.CONTENT.STAGES;
      const rows = this.items
        .filter(n => this.filter === 'all' || n.type === this.filter)
        .sort((a, b) => S.findIndex(s => s.id === a.screen) - S.findIndex(s => s.id === b.screen));

      const counts = {};
      TYPES.forEach(t => counts[t.k] = this.items.filter(n => n.type === t.k).length);

      return `<div class="notes">
        <div class="notes__bar">
          <div class="notes__filters">
            <button data-f="all" aria-pressed="${this.filter === 'all'}">All ${this.items.length}</button>
            ${TYPES.map(t => `<button data-f="${t.k}" aria-pressed="${this.filter === t.k}">${t.label} ${counts[t.k]}</button>`).join('')}
          </div>
          <span class="topbar__spacer"></span>
          <button class="btn-out" data-sheet="export">Export</button>
        </div>
        ${rows.length ? rows.map(n => {
          const s = S.find(z => z.id === n.screen);
          const idx = S.findIndex(z => z.id === n.screen);
          return `<div class="note">
            <div class="note__where">
              <b>${idx + 1} · ${esc(s ? ST[s.stage].name : '')}</b>
              ${esc(s ? s.intent : n.screen)}
            </div>
            <div class="note__type">${esc(typeLabel(n.type))}</div>
            <div class="note__text">${esc(n.text)}</div>
            <div class="note__act">
              <button data-jump="${n.screen}">Go</button>
              <button data-del="${n.id}">Delete</button>
            </div>
          </div>`;
        }).join('') : `<div class="empty">No notes yet. Turn on Comment in the top bar, then click anywhere on a screen.</div>`}
      </div>`;
    },

    wire() {
      $$('[data-f]').forEach(b => b.onclick = () => { this.filter = b.dataset.f; global.App.render(); });
      $$('[data-jump]').forEach(b => b.onclick = () => global.App.jump(b.dataset.jump));
      $$('[data-del]').forEach(b => b.onclick = () => {
        this.items = this.items.filter(z => z.id !== b.dataset.del);
        this.persist(); global.App.render();
      });
      $$('[data-sheet]').forEach(b => b.onclick = () => global.App.sheet(b.dataset.sheet));
    },

    /* ----------------------------- EXPORT ---------------------------- */

    exportSheet() {
      const n = this.items.length;
      return `<h2>Export</h2>
        <p>${n} note${n === 1 ? '' : 's'} in this browser. Nothing is sent anywhere.</p>
        <div class="field">
          <label>Your name — optional, so notes are attributable</label>
          <input type="text" data-who value="${esc(this.who)}" placeholder="Leave blank to stay anonymous">
        </div>
        <div class="btn-row">
          <button class="btn-out" data-dl="csv">CSV</button>
          <button class="btn-out" data-dl="md">Markdown</button>
          <button class="btn-out" data-dl="json">JSON</button>
        </div>

        <h3>Reconcile several reviewers</h3>
        <p>Drop the JSON files people send back. They combine into one CSV, sorted by screen.</p>
        <div class="drop" data-drop>Drop JSON files, or click to choose
          <input type="file" accept=".json,application/json" multiple hidden data-file></div>
        <div data-mergeout style="margin-top:12px"></div>

        <h3>Clear</h3>
        <div class="btn-row"><button class="btn-out" data-clear>Delete all notes in this browser</button></div>`;
    },

    wireExport(root) {
      const who = $('[data-who]', root);
      if (who) who.oninput = () => {
        this.who = who.value.trim();
        try { localStorage.setItem(WHO, this.who); } catch (e) {}
      };

      $$('[data-dl]', root).forEach(b => b.onclick = () => this.download(b.dataset.dl));

      const drop = $('[data-drop]', root);
      const file = $('[data-file]', root);
      if (drop) {
        drop.onclick = () => file.click();
        drop.ondragover = e => { e.preventDefault(); drop.classList.add('over'); };
        drop.ondragleave = () => drop.classList.remove('over');
        drop.ondrop = e => {
          e.preventDefault(); drop.classList.remove('over');
          this.ingest(Array.from(e.dataTransfer.files), root);
        };
        file.onchange = () => this.ingest(Array.from(file.files), root);
      }

      const clear = $('[data-clear]', root);
      if (clear) clear.onclick = () => {
        if (!confirm('Delete all notes stored in this browser? This cannot be undone.')) return;
        this.items = []; this.persist(); global.App.closeSheet(); global.App.render();
      };
    },

    ingest(files, root) {
      let added = 0, names = [];
      let pending = files.length;
      if (!pending) return;
      files.forEach(f => {
        const r = new FileReader();
        r.onload = () => {
          try {
            const parsed = JSON.parse(r.result);
            const arr = Array.isArray(parsed) ? parsed : (parsed.notes || []);
            arr.forEach(n => { this.merged.push(n); added++; });
            names.push(f.name);
          } catch (e) { names.push(f.name + ' (unreadable)'); }
          if (--pending === 0) this.mergeOut(root, added, names);
        };
        r.readAsText(f);
      });
    },

    mergeOut(root, added, names) {
      const out = $('[data-mergeout]', root);
      if (!out) return;
      const people = new Set(this.merged.map(n => n.who || 'anonymous'));
      out.innerHTML = `<p style="font-size:12px;color:var(--mute);margin-bottom:8px">
          ${this.merged.length} notes from ${people.size} reviewer${people.size === 1 ? '' : 's'} · ${esc(names.join(', '))}</p>
        <div class="btn-row">
          <button class="btn-out" data-mdl>Download combined CSV</button>
          <button class="btn-quiet" data-mclear>Reset</button>
        </div>`;
      $('[data-mdl]', out).onclick = () => {
        const withMine = this.merged.concat(this.items.map(n => Object.assign({}, n, { who: n.who || this.who })));
        blob(csv(withMine), 'day1-wireframe-combined.csv', 'text/csv');
      };
      $('[data-mclear]', out).onclick = () => { this.merged = []; out.innerHTML = ''; };
    },

    download(fmt) {
      const items = this.items.map(n => Object.assign({}, n, { who: n.who || this.who }));
      const stamp = new Date().toISOString().slice(0, 10);
      const tag = (this.who || 'notes').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
      if (fmt === 'csv')  blob(csv(items), `day1-wireframe-${tag}-${stamp}.csv`, 'text/csv');
      if (fmt === 'json') blob(JSON.stringify(items, null, 2), `day1-wireframe-${tag}-${stamp}.json`, 'application/json');
      if (fmt === 'md')   blob(md(items), `day1-wireframe-${tag}-${stamp}.md`, 'text/markdown');
    }
  };

  /* ------------------------------ formats ---------------------------- */

  function meta(n) {
    const S = global.CONTENT.SCREENS, ST = global.CONTENT.STAGES;
    const i = S.findIndex(s => s.id === n.screen);
    const s = S[i];
    return {
      no: i + 1,
      stage: s ? ST[s.stage].name : '',
      intent: s ? s.intent : '',
      verb: s ? s.verb : '',
      link: location.origin + location.pathname + '#' + n.screen
    };
  }

  function csv(items) {
    const head = ['Reviewer', 'Screen no', 'Stage', 'Screen id', 'Screen intent', 'Interaction',
                  'Comment type', 'Comment', 'Anchor x%', 'Anchor y%', 'Added', 'Link'];
    const q = v => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
    const rows = items
      .slice()
      .sort((a, b) => meta(a).no - meta(b).no)
      .map(n => {
        const m = meta(n);
        return [n.who || 'anonymous', m.no, m.stage, n.screen, m.intent, m.verb,
                typeLabel(n.type), n.text, Math.round(n.x), Math.round(n.y), n.at, m.link].map(q).join(',');
      });
    return '﻿' + [head.map(q).join(','), ...rows].join('\r\n');
  }

  function md(items) {
    const byStage = {};
    items.slice().sort((a, b) => meta(a).no - meta(b).no).forEach(n => {
      const m = meta(n);
      (byStage[m.stage] = byStage[m.stage] || []).push({ n, m });
    });
    let out = `# Day 1 wireframe — review notes\n\n${items.length} notes`;
    if (Notes.who) out += ` from ${Notes.who}`;
    out += `\n`;
    Object.keys(byStage).forEach(stage => {
      out += `\n## ${stage}\n`;
      byStage[stage].forEach(({ n, m }) => {
        out += `\n**${m.no}. ${m.intent}**  \n`;
        out += `\`${typeLabel(n.type)}\` · ${n.screen}${n.who ? ' · ' + n.who : ''}\n\n`;
        out += `${n.text}\n`;
      });
    });
    return out;
  }

  function typeLabel(k) {
    const t = TYPES.find(x => x.k === k);
    return t ? t.label : k;
  }

  function blob(text, name, mime) {
    const b = new Blob([text], { type: mime + ';charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(b);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 400);
  }

  global.Notes = Notes;

})(window);

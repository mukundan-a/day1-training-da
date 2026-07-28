/* ============================================================================
   comments.js — in-place review notes

   No login, no backend. Notes live in this browser.

   The JSON export is the round-trip format. Every note carries the screen id
   it is anchored to plus its position as a percentage of the screen box, so
   dropping the file back in re-attaches every pin exactly where it was — on
   any machine, at any window size. CSV and Markdown are for reading, not for
   re-importing.
   ========================================================================= */

(function (global) {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const KEY  = 'day1wf.notes.v2';
  const IMP  = 'day1wf.imported.v2';
  const WHO  = 'day1wf.who.v2';
  const SCHEMA = 'day1-wireframe-notes/2';

  const TYPES = [
    { k: 'concept', label: 'Concept' },
    { k: 'flow',    label: 'Flow & state' },
    { k: 'screen',  label: 'Screen' },
    { k: 'copy',    label: 'Copy' }
  ];

  const Notes = {
    items: [], imported: [], mode: false, who: '', filter: 'all', draft: null,

    init() {
      try {
        this.items = JSON.parse(localStorage.getItem(KEY) || '[]');
        this.imported = JSON.parse(localStorage.getItem(IMP) || '[]');
        this.who = localStorage.getItem(WHO) || '';
      } catch (e) { this.items = []; this.imported = []; }
    },

    persist() {
      try {
        localStorage.setItem(KEY, JSON.stringify(this.items));
        localStorage.setItem(IMP, JSON.stringify(this.imported));
      } catch (e) {}
    },

    all() { return this.items.concat(this.imported); },
    forScreen(id) { return this.all().filter(n => n.screen === id); },

    toggleMode() {
      this.mode = !this.mode;
      document.body.classList.toggle('commenting-mode', this.mode);
      const b = $('[data-cmt]'); if (b) b.setAttribute('aria-pressed', String(this.mode));
      const s = $('#screen'); if (s) s.classList.toggle('commenting', this.mode);
      this.closePop();
      global.App.render();
    },

    /* ------------------------- pins on the screen -------------------- */

    mount() {
      const screen = $('#screen'), host = $('#pins'), wrap = $('#stagewrap');
      if (!screen || !host || !wrap) return;

      host.style.cssText = 'position:absolute;inset:0;pointer-events:none';
      screen.classList.toggle('commenting', this.mode);

      const id = screen.dataset.screen;
      host.innerHTML = this.forScreen(id).map((n, i) =>
        `<button class="pin ${n.mine === false ? 'pin--imported' : ''}" data-pin-id="${n.id}"
           style="left:${n.x}%;top:${n.y}%;pointer-events:auto"
           title="${esc(n.who || 'anonymous')}">${i + 1}</button>`).join('');

      $$('[data-pin-id]', host).forEach(b => b.onclick = e => {
        e.stopPropagation(); this.openThread(b.dataset.pinId);
      });

      screen.onclick = e => {
        if (!this.mode) return;
        if (e.target.closest('.pin') || e.target.closest('.pop')) return;
        const r = screen.getBoundingClientRect();
        this.openComposer(id,
          +(((e.clientX - r.left) / r.width) * 100).toFixed(2),
          +(((e.clientY - r.top) / r.height) * 100).toFixed(2));
      };
    },

    closePop() {
      const p = $('#pop'); if (p) p.remove();
      const g = $('#ghostpin'); if (g) g.remove();
      this.draft = null;
    },

    place(el, x, y) {
      const wrap = $('#stagewrap');
      const r = wrap.getBoundingClientRect();
      el.style.left = Math.min(Math.max((x / 100) * r.width - 136, 8), Math.max(8, r.width - 280)) + 'px';
      el.style.top = Math.min((y / 100) * r.height + 12, r.height - 40) + 'px';
    },

    openComposer(screenId, x, y) {
      this.closePop();
      const host = $('#pins');
      if (host) {
        const g = document.createElement('span');
        g.className = 'pin'; g.id = 'ghostpin';
        g.style.cssText = `left:${x}%;top:${y}%;background:var(--mute-2)`;
        g.textContent = '+';
        host.appendChild(g);
      }
      this.draft = { type: 'concept' };

      const el = document.createElement('div');
      el.className = 'pop'; el.id = 'pop';
      el.innerHTML = `
        <div class="pop__types">
          ${TYPES.map(t => `<button data-type="${t.k}" aria-pressed="${t.k === 'concept'}">${t.label}</button>`).join('')}
        </div>
        <textarea placeholder="What do you want to say about this screen?"></textarea>
        <div class="pop__row">
          <span class="pop__hint">${esc(screenId)}</span>
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
        if (text) this.add({ screen: screenId, x, y, type: this.draft.type, text });
        this.closePop(); this.mount(); this.refreshTop();
      };
      $('[data-save]', el).onclick = save;
      $('[data-cancel]', el).onclick = () => this.closePop();
      ta.onkeydown = e => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) save();
        if (e.key === 'Escape') this.closePop();
      };
    },

    openThread(noteId) {
      this.closePop();
      const n = this.all().find(z => z.id === noteId);
      if (!n) return;
      const own = n.mine !== false;

      const el = document.createElement('div');
      el.className = 'pop'; el.id = 'pop';
      el.innerHTML = `
        <div class="pop__existing">
          <div class="pop__meta"><b>${esc(typeLabel(n.type))}</b>
            <span>${esc(n.who || 'anonymous')} · ${new Date(n.at).toLocaleDateString()}</span></div>
          <div class="pop__text">${esc(n.text)}</div>
        </div>
        <div class="pop__row"><span class="pop__hint"></span>
          ${own ? '<button class="btn-quiet" data-del>Delete</button>' : ''}
          <button class="btn-quiet" data-cancel>Close</button></div>`;
      $('#stagewrap').appendChild(el);
      this.place(el, n.x, n.y);

      $('[data-cancel]', el).onclick = () => this.closePop();
      const d = $('[data-del]', el);
      if (d) d.onclick = () => {
        this.items = this.items.filter(z => z.id !== noteId);
        this.persist(); this.closePop(); this.mount(); this.refreshTop();
      };
    },

    add(n) {
      n.id = 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      n.at = new Date().toISOString();
      n.who = this.who;
      n.mine = true;
      this.items.push(n);
      this.persist();
    },

    refreshTop() {
      $('#top').innerHTML = global.App.topbar();
      global.App.wireTop();
    },

    /* ---------------------------- NOTES VIEW ------------------------- */

    render() {
      const S = global.CONTENT.SCREENS, ST = global.CONTENT.STAGES;
      const all = this.all();
      const rows = all
        .filter(n => this.filter === 'all' || n.type === this.filter)
        .sort((a, b) => S.findIndex(s => s.id === a.screen) - S.findIndex(s => s.id === b.screen));

      const counts = {};
      TYPES.forEach(t => counts[t.k] = all.filter(n => n.type === t.k).length);
      const people = new Set(all.map(n => n.who || 'anonymous'));

      return `<div class="notes">
        <div class="notes__bar">
          <div class="notes__filters">
            <button data-f="all" aria-pressed="${this.filter === 'all'}">All ${all.length}</button>
            ${TYPES.map(t => `<button data-f="${t.k}" aria-pressed="${this.filter === t.k}">${t.label} ${counts[t.k]}</button>`).join('')}
          </div>
          <span class="topbar__spacer"></span>
          ${this.imported.length ? `<span class="label">${people.size} reviewer${people.size > 1 ? 's' : ''}</span>` : ''}
          <button class="btn-out" data-sheet="export">Export &amp; import</button>
        </div>
        ${rows.length ? rows.map(n => {
          const idx = S.findIndex(z => z.id === n.screen);
          const s = S[idx];
          return `<div class="note">
            <div class="note__where">
              <b>${idx + 1} · ${esc(s ? ST[s.stage].name : '')}</b>
              ${esc(s ? s.label : n.screen)}
              ${n.mine === false ? `<br><span style="color:var(--maroon)">${esc(n.who || 'anonymous')}</span>` : ''}
            </div>
            <div class="note__type">${esc(typeLabel(n.type))}</div>
            <div class="note__text">${esc(n.text)}</div>
            <div class="note__act">
              <button data-jump="${n.screen}">Go</button>
              ${n.mine !== false ? `<button data-del="${n.id}">Delete</button>` : ''}
            </div>
          </div>`;
        }).join('') : `<div class="empty">No notes yet. Switch on Comment in the top bar, then click anywhere on a screen to leave one.</div>`}
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

    /* ----------------------- EXPORT AND IMPORT ----------------------- */

    exportSheet() {
      const mine = this.items.length, imp = this.imported.length;
      return `<h2>Export and import</h2>
        <p>${mine} note${mine === 1 ? '' : 's'} of your own${imp ? `, plus ${imp} imported from other people` : ''}.
           Everything stays in this browser — nothing is sent anywhere.</p>

        <div class="field">
          <label>Your name, so your notes can be told apart. Optional.</label>
          <input type="text" data-who value="${esc(this.who)}" placeholder="Leave blank to stay anonymous">
        </div>

        <h3>Send your notes back</h3>
        <p>JSON is the one to send. It carries the screen each note is pinned to and where on that
           screen, so dropping it back in puts every pin exactly where you left it. CSV and Markdown
           are for reading.</p>
        <div class="btn-row">
          <button class="btn-out btn-out--primary" data-dl="json">JSON</button>
          <button class="btn-out" data-dl="csv">CSV</button>
          <button class="btn-out" data-dl="md">Markdown</button>
        </div>

        <h3>Load notes back in</h3>
        <p>Drop the JSON files people send you. Their pins appear on the screens, in maroon, alongside
           your own. Duplicates are ignored, so re-dropping the same file is safe.</p>
        <div class="drop" data-drop>Drop JSON files, or click to choose
          <input type="file" accept=".json,application/json" multiple hidden data-file></div>
        <div data-mergeout style="margin-top:12px"></div>

        <h3>Clear</h3>
        <div class="btn-row">
          <button class="btn-out" data-clear="mine">Delete my notes</button>
          ${imp ? `<button class="btn-out" data-clear="imported">Remove imported</button>` : ''}
        </div>`;
    },

    wireExport(root) {
      const who = $('[data-who]', root);
      if (who) who.oninput = () => {
        this.who = who.value.trim();
        try { localStorage.setItem(WHO, this.who); } catch (e) {}
      };

      $$('[data-dl]', root).forEach(b => b.onclick = () => this.download(b.dataset.dl));

      const drop = $('[data-drop]', root), file = $('[data-file]', root);
      if (drop) {
        drop.onclick = () => file.click();
        drop.ondragover = e => { e.preventDefault(); drop.classList.add('over'); };
        drop.ondragleave = () => drop.classList.remove('over');
        drop.ondrop = e => { e.preventDefault(); drop.classList.remove('over'); this.ingest(Array.from(e.dataTransfer.files), root); };
        file.onchange = () => this.ingest(Array.from(file.files), root);
      }

      $$('[data-clear]', root).forEach(b => b.onclick = () => {
        const what = b.dataset.clear;
        if (!confirm(what === 'mine' ? 'Delete all of your own notes?' : 'Remove all imported notes?')) return;
        if (what === 'mine') this.items = []; else this.imported = [];
        this.persist(); global.App.closeSheet(); global.App.render();
      });
    },

    ingest(files, root) {
      const known = new Set(this.all().map(n => n.id));
      const valid = new Set(global.CONTENT.SCREENS.map(s => s.id));
      let added = 0, skipped = 0, orphan = 0, names = [], pending = files.length;
      if (!pending) return;

      files.forEach(f => {
        const r = new FileReader();
        r.onload = () => {
          try {
            const parsed = JSON.parse(r.result);
            const arr = Array.isArray(parsed) ? parsed : (parsed.notes || []);
            arr.forEach(n => {
              if (!n || !n.screen || !n.text) return;
              if (!valid.has(n.screen)) { orphan++; return; }
              const id = n.id || ('i' + Math.random().toString(36).slice(2, 10));
              if (known.has(id)) { skipped++; return; }
              known.add(id);
              this.imported.push({
                id, screen: n.screen,
                x: typeof n.x === 'number' ? n.x : 50,
                y: typeof n.y === 'number' ? n.y : 50,
                type: n.type || 'concept',
                text: n.text,
                who: n.who || (parsed.reviewer || 'anonymous'),
                at: n.at || new Date().toISOString(),
                mine: false
              });
              added++;
            });
            names.push(f.name);
          } catch (e) { names.push(f.name + ' — could not be read'); }
          if (--pending === 0) { this.persist(); this.mergeOut(root, added, skipped, orphan, names); }
        };
        r.readAsText(f);
      });
    },

    mergeOut(root, added, skipped, orphan, names) {
      const out = $('[data-mergeout]', root);
      if (!out) return;
      const people = new Set(this.all().map(n => n.who || 'anonymous'));
      const bits = [`${added} note${added === 1 ? '' : 's'} loaded`];
      if (skipped) bits.push(`${skipped} already here`);
      if (orphan) bits.push(`${orphan} pointed at screens that no longer exist`);

      out.innerHTML = `<p style="font-size:12px;color:var(--mute);margin-bottom:8px">
          ${bits.join(' · ')}. ${this.all().length} in total, from ${people.size} reviewer${people.size === 1 ? '' : 's'}.
          <br><span style="color:var(--mute-2)">${esc(names.join(', '))}</span></p>
        <div class="btn-row">
          <button class="btn-out btn-out--primary" data-see>See them on the screens</button>
          <button class="btn-out" data-mdl>Download everything as CSV</button>
        </div>`;
      $('[data-see]', out).onclick = () => { global.App.closeSheet(); global.App.setView('notes'); };
      $('[data-mdl]', out).onclick = () => blob(csv(this.all()), 'day1-wireframe-all-notes.csv', 'text/csv');
    },

    download(fmt) {
      const stamp = new Date().toISOString().slice(0, 10);
      const tag = (this.who || 'notes').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
      const mine = this.items.map(n => Object.assign({}, n, { who: n.who || this.who }));

      if (fmt === 'json') {
        const payload = {
          schema: SCHEMA,
          exported: new Date().toISOString(),
          reviewer: this.who || 'anonymous',
          screens: global.CONTENT.SCREENS.length,
          note: 'Drop this file into the wireframe’s Export and import panel to put every pin back where it was.',
          notes: mine.map(n => {
            const m = meta(n);
            return {
              id: n.id, screen: n.screen, screenIndex: m.no, stage: m.stage, screenLabel: m.label,
              x: n.x, y: n.y, anchor: 'percent-of-screen-box',
              type: n.type, text: n.text, who: n.who || 'anonymous', at: n.at
            };
          })
        };
        blob(JSON.stringify(payload, null, 2), `day1-wireframe-${tag}-${stamp}.json`, 'application/json');
      }
      if (fmt === 'csv') blob(csv(mine), `day1-wireframe-${tag}-${stamp}.csv`, 'text/csv');
      if (fmt === 'md')  blob(md(mine), `day1-wireframe-${tag}-${stamp}.md`, 'text/markdown');
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
      label: s ? s.label : '',
      summary: s ? s.summary : '',
      verb: s ? s.verb : '',
      link: location.origin + location.pathname + '#' + n.screen
    };
  }

  function csv(items) {
    const head = ['Reviewer', 'Screen no', 'Stage', 'Screen id', 'Screen', 'What the screen does',
                  'Interaction', 'Comment type', 'Comment', 'x%', 'y%', 'Added', 'Link'];
    const q = v => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
    const rows = items.slice().sort((a, b) => meta(a).no - meta(b).no).map(n => {
      const m = meta(n);
      return [n.who || 'anonymous', m.no, m.stage, n.screen, m.label, m.summary, m.verb,
              typeLabel(n.type), n.text, n.x, n.y, n.at, m.link].map(q).join(',');
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
    out += '\n';
    Object.keys(byStage).forEach(stage => {
      out += `\n## ${stage}\n`;
      byStage[stage].forEach(({ n, m }) => {
        out += `\n**${m.no}. ${m.label}**  \n\`${typeLabel(n.type)}\` · ${n.screen}${n.who ? ' · ' + n.who : ''}\n\n${n.text}\n`;
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

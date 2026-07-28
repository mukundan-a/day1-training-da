/* ============================================================================
   comments.js — shared review notes

   Comments live on a shared Firestore board, so everyone sees everyone else's
   as they arrive. No login: reviewers type their name once a session.

   If the shared board is unreachable, everything falls back to this browser's
   local storage and the export file still carries the work out.

   The JSON export is the round-trip format. Every note carries the screen id
   it is pinned to plus its position as a percentage of the screen box, so
   dropping the file back in re-attaches every pin exactly where it was.
   ========================================================================= */

(function (global) {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const LOCAL = 'day1wf.local.v3';
  const NAME  = 'day1wf.name';
  const SCHEMA = 'day1-wireframe-notes/3';

  /* The stored keys stay as they are so the Firestore rules need no change.
     Only the labels the team reads have moved. */
  const TYPES = [
    { k: 'concept', label: 'Underlying Day 1 step' },
    { k: 'screen',  label: 'Training app design' },
    { k: 'copy',    label: 'Actual text I see' },
    { k: 'flow',    label: 'Other' }
  ];
  const NO_CATEGORY = 'flow';   // what an unanswered category falls back to

  const Notes = {
    items: [], mode: false, who: '', filter: 'all', showResolved: true,
    source: 'connecting', unsub: null, draft: null,

    init() {
      try { this.who = sessionStorage.getItem(NAME) || ''; } catch (e) {}
      this.loadLocal();

      window.addEventListener('live-ready', e => {
        if (e.detail.ok) {
          this.source = 'live';
          this.unsub = global.Live.watch((rows, err) => {
            if (err) { this.source = 'local'; this.loadLocal(); global.App.render(); return; }
            this.items = rows.map(r => Object.assign({}, r, { mine: r.uid === global.Live.uid }));
            global.App.render();
          });
        } else {
          this.source = 'local';
        }
        global.App.render();
      });
    },

    live() { return this.source === 'live' && global.Live && global.Live.ok; },

    loadLocal() {
      try { this.items = JSON.parse(localStorage.getItem(LOCAL) || '[]'); } catch (e) { this.items = []; }
    },
    saveLocal() {
      if (this.live()) return;
      try { localStorage.setItem(LOCAL, JSON.stringify(this.items)); } catch (e) {}
    },

    all() { return this.items; },
    forScreen(id) { return this.items.filter(n => n.screen === id); },
    forView(v) { return this.items.filter(n => (n.view || 'walk') === v); },
    openOn(id) { return this.items.filter(n => n.screen === id && !n.resolved).length; },
    openInStage(stage) {
      const ids = new Set(global.CONTENT.SCREENS.filter(s => s.stage === stage).map(s => s.id));
      return this.items.filter(n => ids.has(n.screen) && !n.resolved).length;
    },

    /* --------------------------- name per session -------------------- */

    /* no browser prompt — the name is asked for inline, in the comment bar */
    askName() { return !!this.who; },

    setName(v) {
      this.who = String(v || '').trim().slice(0, 60);
      try { sessionStorage.setItem(NAME, this.who); } catch (e) {}
      global.App.render();
    },

    toggleMode() {
      this.mode = !this.mode;
      document.body.classList.toggle('commenting-mode', this.mode);
      this.closePop();
      global.App.render();
    },

    /* ------------------------- pins on the screen -------------------- */

    mount() {
      const host = $('#pins');
      if (!host) return;
      const view = global.App.view;
      const wrap = host.parentElement;
      host.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:18';

      // every pin hangs off a keyed element, so it survives reflow and resizing
      const mine = this.items.filter(n => (n.view || 'walk') === view);
      host.innerHTML = mine.map((n, i) => {
        const el = wrap.querySelector('[data-anchor="' + cssEsc(n.anchor || n.screen) + '"]');
        if (!el) return '';
        const a = el.getBoundingClientRect(), w = wrap.getBoundingClientRect();
        const left = (a.left - w.left) + (n.x / 100) * a.width;
        const top = (a.top - w.top) + (n.y / 100) * a.height;
        return `<button class="pin ${n.resolved ? 'pin--done' : ''}" data-pin-id="${n.id}"
           style="left:${left}px;top:${top}px;pointer-events:auto"
           title="${esc(n.who || 'anonymous')}${n.resolved ? ' · resolved' : ''}">${
             n.resolved ? '✓' : (i + 1)}${
             (n.replies && n.replies.length) ? `<em>${n.replies.length}</em>` : ''}</button>`;
      }).join('');

      $$('[data-pin-id]', host).forEach(b => b.onclick = e => {
        e.stopPropagation(); this.openThread(b.dataset.pinId);
      });

      // capture phase: in comment mode a click drops a pin and never navigates,
      // because most anchors are themselves buttons
      if (this._grab) this._grab.el.removeEventListener('click', this._grab.fn, true);
      const fn = e => {
        if (!this.mode) return;
        if (e.target.closest('.pop')) return;
        if (e.target.closest('.pin')) return;
        const el = e.target.closest('[data-anchor]');
        if (!el) return;
        e.preventDefault(); e.stopPropagation();
        const a = el.getBoundingClientRect();
        this.openComposer(el.dataset.anchor, view,
          +(((e.clientX - a.left) / a.width) * 100).toFixed(2),
          +(((e.clientY - a.top) / a.height) * 100).toFixed(2));
      };
      wrap.addEventListener('click', fn, true);
      this._grab = { el: wrap, fn };
    },

    closePop() {
      const p = $('#pop'); if (p) p.remove();
      const g = $('#ghostpin'); if (g) g.remove();
      this.draft = null;
    },

    place(el, anchorKey, x, y) {
      const host = $('#pins'); if (!host) return;
      const wrap = host.parentElement;
      const a = wrap.querySelector('[data-anchor="' + cssEsc(anchorKey) + '"]');
      const w = wrap.getBoundingClientRect();
      const r = a ? a.getBoundingClientRect() : w;
      const left = (r.left - w.left) + (x / 100) * r.width - 140;
      const top = (r.top - w.top) + (y / 100) * r.height + 14;
      el.style.left = Math.min(Math.max(left, 8), Math.max(8, w.width - 292)) + 'px';
      el.style.top = Math.max(8, top) + 'px';
    },

    openComposer(anchorKey, view, x, y) {
      this.closePop();
      this.draft = { type: null };

      const el = document.createElement('div');
      el.className = 'pop'; el.id = 'pop';
      el.innerHTML = `
        <textarea placeholder="What do you want to say about this screen?"></textarea>
        <div class="pop__cat">
          <span class="pop__q">Which category is your comment about? <em>Optional</em></span>
          <div class="pop__types">
            ${TYPES.map(t => `<button data-type="${t.k}" aria-pressed="false">${t.label}</button>`).join('')}
          </div>
        </div>
        <div class="pop__row">
          <span class="pop__hint">${esc(this.who || 'anonymous')}</span>
          <button class="btn-quiet" data-cancel>Cancel</button>
          <button class="btn-pink" data-save>Add</button>
        </div>`;
      $('#pins').parentElement.appendChild(el);
      this.place(el, anchorKey, x, y);

      $$('[data-type]', el).forEach(b => b.onclick = () => {
        const already = b.getAttribute('aria-pressed') === 'true';
        $$('[data-type]', el).forEach(x2 => x2.setAttribute('aria-pressed', 'false'));
        if (!already) { b.setAttribute('aria-pressed', 'true'); this.draft.type = b.dataset.type; }
        else this.draft.type = null;
      });

      const ta = $('textarea', el);
      setTimeout(() => ta.focus(), 20);

      const save = async () => {
        const text = ta.value.trim();
        const type = (this.draft && this.draft.type) || NO_CATEGORY;
        this.closePop();
        if (!text) return;
        await this.add({ screen: anchorKey, anchor: anchorKey, view, x, y, type, text });
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
      const n = this.items.find(z => z.id === noteId);
      if (!n) return;
      const replies = n.replies || [];

      const el = document.createElement('div');
      el.className = 'pop pop--thread'; el.id = 'pop';
      el.innerHTML = `
        <div class="pop__existing ${n.resolved ? 'is-done' : ''}">
          <div class="pop__meta"><span class="ava ava--sm">${initials(n.who)}</span>
            <b class="pop__name">${esc(n.who || 'anonymous')}</b>
            <span>${esc(typeLabel(n.type))} · ${when(n.at)}</span>
            ${n.resolved ? `<span class="pop__done">Resolved${n.resolvedBy ? ' by ' + esc(n.resolvedBy) : ''}</span>` : ''}</div>
          <div class="pop__text">${esc(n.text)}</div>
        </div>

        ${replies.length ? `<div class="pop__replies">${replies.map(r => `
          <div class="pop__reply"><span class="pop__meta"><span class="ava ava--sm">${initials(r.who)}</span>
            <b class="pop__name">${esc(r.who || 'anonymous')}</b><span>${when(r.at)}</span></span>
            <div class="pop__text">${esc(r.text)}</div></div>`).join('')}</div>` : ''}

        <textarea data-reply placeholder="Reply…"></textarea>
        <div class="pop__row">
          <button class="btn-quiet" data-resolve>${n.resolved ? 'Reopen' : 'Resolve'}</button>
          ${n.mine ? `<button class="btn-quiet" data-del>Delete</button>` : ''}
          <span style="flex:1"></span>
          <button class="btn-quiet" data-cancel>Close</button>
          <button class="btn-pink" data-send>Reply</button>
        </div>`;
      $('#pins').parentElement.appendChild(el);
      this.place(el, n.anchor || n.screen, n.x, n.y);

      $('[data-cancel]', el).onclick = () => this.closePop();

      $('[data-resolve]', el).onclick = async () => {
        if (!this.askName()) return;
        this.closePop();
        await this.setResolved(noteId, !n.resolved);
      };

      const d = $('[data-del]', el);
      if (d) d.onclick = async () => {
        if (!confirm('Delete this comment and its replies?')) return;
        this.closePop();
        await this.remove(noteId);
      };

      const ta = $('[data-reply]', el);
      const send = async () => {
        const t = ta.value.trim();
        if (!t) return;
        if (!this.askName()) return;
        this.closePop();
        await this.reply(noteId, t);
      };
      $('[data-send]', el).onclick = send;
      ta.onkeydown = e => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send();
        if (e.key === 'Escape') this.closePop();
      };
    },

    /* ------------------------------ writes --------------------------- */

    async add(note) {
      note.who = this.who || 'anonymous';
      if (this.live()) {
        try { await global.Live.add(note); return; }
        catch (e) { this.flash('Could not save to the shared board — kept locally.'); }
      }
      note.id = 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      note.at = new Date().toISOString();
      note.resolved = false; note.replies = []; note.mine = true;
      note.anchor = note.anchor || note.screen;
      this.items.push(note); this.saveLocal(); global.App.render();
    },

    async reply(id, text) {
      if (this.live()) {
        try { await global.Live.reply(id, this.who, text); return; } catch (e) {}
      }
      const n = this.items.find(z => z.id === id);
      if (n) { (n.replies = n.replies || []).push({ who: this.who || 'anonymous', text, at: new Date().toISOString() }); }
      this.saveLocal(); global.App.render();
    },

    async setResolved(id, on) {
      if (this.live()) {
        try { await global.Live.setResolved(id, on, this.who); return; } catch (e) {}
      }
      const n = this.items.find(z => z.id === id);
      if (n) { n.resolved = on; n.resolvedBy = on ? this.who : ''; }
      this.saveLocal(); global.App.render();
    },

    async remove(id) {
      if (this.live()) {
        try { await global.Live.remove(id); return; } catch (e) {}
      }
      this.items = this.items.filter(z => z.id !== id);
      this.saveLocal(); global.App.render();
    },

    flash(msg) {
      const el = document.createElement('div');
      el.className = 'flash'; el.textContent = msg;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 4000);
    },

    refreshTop() {
      $('#top').innerHTML = global.App.topbar();
      global.App.wireTop();
    },

    statusLabel() {
      if (this.source === 'connecting') return { t: 'Connecting…', cls: '' };
      if (this.source === 'live') return { t: 'Shared', cls: 'is-live' };
      return { t: 'This browser only', cls: 'is-local' };
    },

    /* ---------------------------- NOTES VIEW ------------------------- */

    render() {
      const S = global.CONTENT.SCREENS, ST = global.CONTENT.STAGES;
      const rows = this.items
        .filter(n => this.filter === 'all' || n.type === this.filter)
        .filter(n => this.showResolved || !n.resolved)
        .sort((a, b) => S.findIndex(s => s.id === a.screen) - S.findIndex(s => s.id === b.screen));

      const counts = {};
      TYPES.forEach(t => counts[t.k] = this.items.filter(n => n.type === t.k).length);
      const open = this.items.filter(n => !n.resolved).length;
      const people = new Set(this.items.map(n => n.who || 'anonymous'));
      const st = this.statusLabel();

      return `<div class="notes">
        <div class="notes__bar">
          <div class="notes__filters">
            <button data-f="all" aria-pressed="${this.filter === 'all'}">All ${this.items.length}</button>
            ${TYPES.map(t => `<button data-f="${t.k}" aria-pressed="${this.filter === t.k}">${t.label} ${counts[t.k]}</button>`).join('')}
          </div>
          <button class="notes__toggle" data-showres aria-pressed="${this.showResolved}">
            ${this.showResolved ? 'Hiding nothing' : 'Open only'}</button>
          <span class="topbar__spacer"></span>
          <span class="label">${open} open · ${people.size} reviewer${people.size === 1 ? '' : 's'}</span>
          <span class="conn ${st.cls}">${st.t}</span>
          <button class="btn-out" data-sheet="export">Export</button>
        </div>
        ${rows.length ? rows.map(n => {
          const idx = S.findIndex(z => z.id === n.screen);
          const s = S[idx];
          const reps = (n.replies || []).length;
          return `<div class="note ${n.resolved ? 'is-done' : ''}">
            <div class="note__where">
              <b>${idx + 1} · ${esc(s ? ST[s.stage].name : '')}</b>
              ${esc(s ? s.label : n.screen)}
            </div>
            <div class="note__who"><span class="ava">${initials(n.who)}</span><b>${esc(n.who || 'anonymous')}</b></div>
            <div class="note__type">${esc(typeLabel(n.type))}${n.resolved ? '<br><span style="color:var(--mute-2)">Resolved</span>' : ''}</div>
            <div>
              <div class="note__text">${esc(n.text)}</div>
              ${reps ? `<div class="note__replies">${(n.replies || []).map(r =>
                `<div><b>${esc(r.who || 'anonymous')}</b> ${esc(r.text)}</div>`).join('')}</div>` : ''}
            </div>
            <div class="note__act">
              <button data-jump="${n.screen}">Go</button>
              <button data-res="${n.id}">${n.resolved ? 'Reopen' : 'Resolve'}</button>
              ${n.mine ? `<button data-del="${n.id}">Delete</button>` : ''}
            </div>
          </div>`;
        }).join('') : `<div class="empty">No notes yet. Switch on Comment in the top bar, then click anywhere on a screen to leave one.</div>`}
      </div>`;
    },

    wire() {
      $$('[data-f]').forEach(b => b.onclick = () => { this.filter = b.dataset.f; global.App.render(); });
      $$('[data-showres]').forEach(b => b.onclick = () => { this.showResolved = !this.showResolved; global.App.render(); });
      $$('[data-jump]').forEach(b => b.onclick = () => global.App.jump(b.dataset.jump));
      $$('[data-res]').forEach(b => b.onclick = () => {
        const n = this.items.find(z => z.id === b.dataset.res);
        if (this.askName()) this.setResolved(b.dataset.res, !(n && n.resolved));
      });
      $$('[data-del]').forEach(b => b.onclick = () => {
        if (confirm('Delete this comment and its replies?')) this.remove(b.dataset.del);
      });
      $$('[data-sheet]').forEach(b => b.onclick = () => global.App.sheet(b.dataset.sheet));
    },

    /* ----------------------- EXPORT AND IMPORT ----------------------- */

    exportSheet() {
      const st = this.statusLabel();
      const open = this.items.filter(n => !n.resolved).length;
      return `<h2>Export</h2>
        <p><span class="conn ${st.cls}">${st.t}</span></p>
        ${this.live()
          ? `<p>Comments are shared. Everyone sees everyone else's as they arrive, and replies appear
             without anyone refreshing. The export below is a snapshot for your own records.</p>`
          : `<p>The shared board could not be reached, so comments are being kept in this browser only.
             Export the JSON and send it on — anyone can load it back in.</p>`}
        <p>${this.items.length} comment${this.items.length === 1 ? '' : 's'}, ${open} still open.</p>

        <div class="field">
          <label>Your name this session</label>
          <input type="text" data-who value="${esc(this.who)}" placeholder="Type your name">
        </div>

        <h3>Take a snapshot</h3>
        <p>JSON carries the screen each comment is pinned to and where on that screen, so loading it
           back in puts every pin exactly where it was. CSV and Markdown are for reading.</p>
        <div class="btn-row">
          <button class="btn-out btn-out--primary" data-dl="json">JSON</button>
          <button class="btn-out" data-dl="csv">CSV</button>
          <button class="btn-out" data-dl="md">Markdown</button>
        </div>

        <h3>Load comments back in</h3>
        <p>Drop a JSON file exported from here.${this.live()
          ? ' They are added to the shared board, so everyone gets them.'
          : ' They are added to this browser.'} Duplicates are skipped.</p>
        <div class="drop" data-drop>Drop JSON files, or click to choose
          <input type="file" accept=".json,application/json" multiple hidden data-file></div>
        <div data-mergeout style="margin-top:12px"></div>`;
    },

    wireExport(root) {
      const who = $('[data-who]', root);
      if (who) who.oninput = () => {
        this.who = who.value.trim().slice(0, 60);
        try { sessionStorage.setItem(NAME, this.who); } catch (e) {}
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
    },

    ingest(files, root) {
      const seen = new Set(this.items.map(n => (n.who || '') + '|' + n.screen + '|' + n.text));
      const valid = new Set(global.CONTENT.SCREENS.map(s => s.id));
      let queue = [], skipped = 0, orphan = 0, names = [], pending = files.length;
      if (!pending) return;

      files.forEach(f => {
        const r = new FileReader();
        r.onload = async () => {
          try {
            const parsed = JSON.parse(r.result);
            const arr = Array.isArray(parsed) ? parsed : (parsed.notes || []);
            arr.forEach(n => {
              if (!n || !n.screen || !n.text) return;
              if (!valid.has(n.screen)) { orphan++; return; }
              const key = (n.who || '') + '|' + n.screen + '|' + n.text;
              if (seen.has(key)) { skipped++; return; }
              seen.add(key);
              queue.push({
                screen: n.screen,
                x: typeof n.x === 'number' ? n.x : 50,
                y: typeof n.y === 'number' ? n.y : 50,
                type: TYPES.some(t => t.k === n.type) ? n.type : 'concept',
                text: String(n.text).slice(0, 3900),
                who: (n.who || parsed.reviewer || 'anonymous')
              });
            });
            names.push(f.name);
          } catch (e) { names.push(f.name + ' — could not be read'); }

          if (--pending === 0) {
            let added = 0;
            if (this.live()) {
              for (const q of queue) { try { await global.Live.add(q); added++; } catch (e) {} }
            } else {
              queue.forEach(q => {
                q.id = 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
                q.at = new Date().toISOString(); q.resolved = false; q.replies = []; q.mine = true;
                this.items.push(q); added++;
              });
              this.saveLocal();
            }
            this.mergeOut(root, added, skipped, orphan, names);
            global.App.render();
          }
        };
        r.readAsText(f);
      });
    },

    mergeOut(root, added, skipped, orphan, names) {
      const out = $('[data-mergeout]', root);
      if (!out) return;
      const bits = [`${added} comment${added === 1 ? '' : 's'} loaded`];
      if (skipped) bits.push(`${skipped} already here`);
      if (orphan) bits.push(`${orphan} pointed at screens that no longer exist`);
      out.innerHTML = `<p style="font-size:12px;color:var(--mute)">${bits.join(' · ')}.
        <br><span style="color:var(--mute-2)">${esc(names.join(', '))}</span></p>
        <div class="btn-row"><button class="btn-out btn-out--primary" data-see>See them</button></div>`;
      $('[data-see]', out).onclick = () => { global.App.closeSheet(); global.App.setView('notes'); };
    },

    download(fmt) {
      const stamp = new Date().toISOString().slice(0, 10);
      const tag = (this.who || 'notes').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
      const items = this.items;

      if (fmt === 'json') {
        blob(JSON.stringify({
          schema: SCHEMA,
          exported: new Date().toISOString(),
          board: this.live() ? 'shared' : 'local',
          note: 'Drop this file into the wireframe’s Export panel to put every pin back where it was.',
          notes: items.map(n => {
            const m = meta(n);
            return {
              screen: n.screen, screenIndex: m.no, stage: m.stage, screenLabel: m.label,
              x: n.x, y: n.y, anchor: 'percent-of-screen-box',
              type: n.type, text: n.text, who: n.who || 'anonymous', at: n.at,
              resolved: !!n.resolved, replies: n.replies || []
            };
          })
        }, null, 2), `day1-wireframe-${tag}-${stamp}.json`, 'application/json');
      }
      if (fmt === 'csv') blob(csv(items), `day1-wireframe-${tag}-${stamp}.csv`, 'text/csv');
      if (fmt === 'md')  blob(md(items), `day1-wireframe-${tag}-${stamp}.md`, 'text/markdown');
    }
  };

  /* ------------------------------ formats ---------------------------- */

  function cssEsc(v) { return String(v == null ? '' : v).replace(/["\\]/g, '\\$&'); }

  function initials(name) {
    const n = String(name || 'anonymous').trim();
    const parts = n.split(/\s+/).filter(Boolean);
    const s2 = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : n.slice(0, 2);
    return esc(s2.toUpperCase());
  }

  function when(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return isNaN(d) ? '' : d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  }

  function meta(n) {
    const S = global.CONTENT.SCREENS, ST = global.CONTENT.STAGES;
    const i = S.findIndex(s => s.id === n.screen);
    const s = S[i];
    return {
      no: i + 1, stage: s ? ST[s.stage].name : '', label: s ? s.label : '',
      summary: s ? s.summary : '', verb: s ? s.verb : '',
      link: location.origin + location.pathname + '#' + n.screen
    };
  }

  function csv(items) {
    const head = ['Reviewer', 'Screen no', 'Stage', 'Screen id', 'Screen', 'What the screen does',
                  'Interaction', 'Comment type', 'Comment', 'Replies', 'Status', 'x%', 'y%', 'Added', 'Link'];
    const q = v => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
    const rows = items.slice().sort((a, b) => meta(a).no - meta(b).no).map(n => {
      const m = meta(n);
      const reps = (n.replies || []).map(r => `${r.who}: ${r.text}`).join(' | ');
      return [n.who || 'anonymous', m.no, m.stage, n.screen, m.label, m.summary, m.verb,
              typeLabel(n.type), n.text, reps, n.resolved ? 'Resolved' : 'Open',
              n.x, n.y, n.at, m.link].map(q).join(',');
    });
    return '﻿' + [head.map(q).join(','), ...rows].join('\r\n');
  }

  function md(items) {
    const byStage = {};
    items.slice().sort((a, b) => meta(a).no - meta(b).no).forEach(n => {
      const m = meta(n);
      (byStage[m.stage] = byStage[m.stage] || []).push({ n, m });
    });
    let out = `# Day 1 wireframe — review notes\n\n${items.length} comments, ` +
              `${items.filter(n => !n.resolved).length} open\n`;
    Object.keys(byStage).forEach(stage => {
      out += `\n## ${stage}\n`;
      byStage[stage].forEach(({ n, m }) => {
        out += `\n**${m.no}. ${m.label}** — \`${typeLabel(n.type)}\`${n.resolved ? ' · resolved' : ''}\n\n`;
        out += `${n.who || 'anonymous'}: ${n.text}\n`;
        (n.replies || []).forEach(r => { out += `\n> ${r.who}: ${r.text}\n`; });
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

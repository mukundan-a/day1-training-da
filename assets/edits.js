/* ============================================================================
   edits.js — direct edits to the wording, shared with everyone

   Any text carrying a data-edit path can be overwritten in place. The override
   is stored against that path and applied over the built-in wording on every
   render, so a change one person makes is what everyone else sees.

   Deliberately quiet: the toggle is an unlabelled icon, and turning it on
   warns that comments are preferred because nothing here tracks changes.
   ========================================================================= */

(function (global) {
  'use strict';

  const LOCAL = 'day1wf.edits.v1';
  const HIST  = 'day1wf.edithist.v1';
  const KEEP  = 12;               // how many previous versions to hold per string

  const Edits = {
    /* map    — what is on screen: the shared board with this browser's own
                unshared edits laid on top
       local  — everything this browser has written, kept whatever happens, so
                an edit can never exist only in memory
       remote — the shared board as last seen */
    map: {}, local: {}, remote: {}, hist: {}, orig: {},
    mode: false, warned: false, source: 'connecting', why: '', pushed: false,

    init() {
      try { this.local = JSON.parse(localStorage.getItem(LOCAL) || '{}'); } catch (e) { this.local = {}; }
      try { this.hist = JSON.parse(localStorage.getItem(HIST) || '{}'); } catch (e) { this.hist = {}; }
      try { this.warned = sessionStorage.getItem('day1wf.editwarn') === '1'; } catch (e) {}
      this.scrub();
      this.map = Object.assign({}, this.local);

      window.addEventListener('live-ready', e => {
        if (!e.detail.ok || !global.Live.watchEdits) return this.offline(
          (global.Live && global.Live.error) || 'The shared board could not be reached.');

        global.Live.watchEdits((rows, err) => {
          /* A denied read here is why edits used to go quiet: the mode still
             said "for everyone" while every change stayed in one browser. */
          if (err) return this.offline(err.message || String(err));

          this.source = 'live';
          this.why = '';
          const remote = {};
          rows.forEach(r => {
            if (!r.path || typeof r.text !== 'string') return;
            remote[r.path] = r.text;
            if (Array.isArray(r.history)) this.hist[r.path] = r.history;
          });
          this.remote = remote;
          /* the board wins wherever both hold a path, so nobody's wording is
             ever replaced by a stale copy sitting in someone else's browser */
          this.map = Object.assign({}, this.local, remote);
          this.migrate();

          if (document.activeElement && document.activeElement.isContentEditable) {
            Object.keys(this.map).forEach(k => {
              if (k !== document.activeElement.dataset.edit) this.paint(k, this.map[k]);
            });
          } else this.rerender();
          this.refreshBar();
        });
      });
    },

    /* repair the stray × the list rows used to swallow, once, on load */
    scrub() {
      let fixed = 0;
      Object.keys(this.local).forEach(p => {
        if (/\.count$/.test(p)) return;
        const was = this.local[p], now = clean(was);
        if (typeof was === 'string' && now && now !== was) { this.local[p] = now; fixed++; }
      });
      if (fixed) this.saveLocal();
      return fixed;
    },

    offline(why) {
      this.source = 'local';
      this.why = why || '';
      this.refreshBar();
    },

    /* Anything written while the board was unreachable goes up the first time
       it is reachable. Only paths the board does not already hold are sent, so
       this can never overwrite someone else's newer wording. */
    async migrate() {
      if (this.pushed || !this.live()) return;
      this.pushed = true;
      const mine = Object.keys(this.local).filter(p => !(p in this.remote));
      if (!mine.length) return;
      let n = 0;
      for (const p of mine) {
        try {
          await global.Live.setEdit(p, this.local[p], global.Notes.who || 'anonymous', this.hist[p] || []);
          n++;
        } catch (err) {
          this.pushed = false;
          this.offline((err && err.message) || String(err));
          global.Notes.flash('Could not share ' + (mine.length - n) + ' edit(s) from this browser.');
          return;
        }
      }
      if (n) global.Notes.flash(n + ' edit' + (n === 1 ? '' : 's') + ' from this browser ' +
        (n === 1 ? 'is' : 'are') + ' now shared with everyone.');
    },

    live() { return this.source === 'live' && global.Live && global.Live.ok; },

    status() {
      if (this.source === 'connecting') return { t: 'Connecting…', cls: '' };
      if (this.source === 'live') return { t: 'Edits are shared', cls: 'is-live' };
      return { t: 'This browser only — not shared', cls: 'is-local' };
    },

    /* edits this browser holds that the shared board has not got */
    unshared() {
      return Object.keys(this.local).filter(p => !(p in this.remote) && !/\.count$/.test(p)).length;
    },

    saveLocal() {
      try { localStorage.setItem(LOCAL, JSON.stringify(this.local)); } catch (e) {}
    },

    refreshBar() { if (this.mode && global.App && global.App.editBar) global.App.editBar(); },

    /* the current wording for a path, falling back to what was built in */
    t(path, fallback) {
      if (typeof fallback === 'string' && !(path in this.orig)) this.orig[path] = fallback;
      const v = this.map[path];
      return (typeof v === 'string' && v.length) ? v : fallback;
    },

    async set(path, text) {
      const now = clean(text);
      if (!now) return;
      const was = (typeof this.map[path] === 'string') ? this.map[path] : this.orig[path];
      if (typeof was === 'string' && was !== now) {
        const h = (this.hist[path] = this.hist[path] || []);
        h.push({ text: was, who: global.Notes.who || 'anonymous', at: new Date().toISOString() });
        if (h.length > KEEP) h.splice(0, h.length - KEEP);
        try { localStorage.setItem(HIST, JSON.stringify(this.hist)); } catch (e) {}
      }
      this.map[path] = now;
      /* written locally first, always. Sharing can fail; this must not lose
         the words either way. */
      this.local[path] = now;
      this.saveLocal();
      if (this.live()) {
        try {
          await global.Live.setEdit(path, now, global.Notes.who || 'anonymous', this.hist[path] || []);
          this.remote[path] = now;
          this.paint(path, now);
          return;
        } catch (err) {
          this.offline((err && err.message) || String(err));
          global.Notes.flash('Could not share that edit — kept in this browser.');
        }
      }
      this.paint(path, now);
    },

    /* update every element on this path without a full re-render, so clicking
       straight from one editable string to the next does not lose the caret */
    paint(path, text) {
      Array.from(document.querySelectorAll('[data-edit]')).forEach(el => {
        if (el.dataset.edit !== path) return;
        if (el !== document.activeElement) el.textContent = text;
        el.setAttribute('data-edited', '1');
      });
      const bar = document.getElementById('edbar');
      if (bar) {
        const b = bar.querySelector('.cmtbar__who');
        if (b) b.textContent = this.count() + ' edited';
        else bar.querySelector('button').insertAdjacentHTML('beforebegin',
          '<b class="cmtbar__who">' + this.count() + ' edited</b>');
      }
    },

    rerender() { setTimeout(() => global.App.render(), 0); },

    async reset(path) {
      delete this.map[path];
      delete this.local[path];
      this.saveLocal();
      if (this.live()) {
        try { await global.Live.clearEdit(path); delete this.remote[path]; return; }
        catch (err) { this.offline((err && err.message) || String(err)); }
      }
      this.rerender();
    },

    /* everything that has been changed, newest first */
    changed() {
      return Object.keys(this.map)
        .filter(k => !/\.count$/.test(k))
        .map(k => ({
          path: k,
          now: this.map[k],
          original: this.orig[k],
          versions: (this.hist[k] || []).slice().reverse()
        }));
    },

    async revert(path, text) {
      if (text === undefined || text === null) return this.reset(path);
      return this.set(path, text);
    },

    count() { return Object.keys(this.map).filter(k => !/\.count$/.test(k)).length; },

    /* a list's current contents, honouring any added or removed lines */
    list(base, defaults) {
      const raw = parseInt(this.map[base + '.count'], 10);
      const len = isNaN(raw) ? defaults.length : Math.max(0, Math.min(24, raw));
      const out = [];
      for (let k = 0; k < len; k++) out.push(this.t(base + '.' + k, defaults[k] || 'New line'));
      return out;
    },

    async _put(path, text) {
      this.map[path] = text;
      this.local[path] = text;
      this.saveLocal();
      if (this.live()) {
        try { await global.Live.setEdit(path, text, global.Notes.who || 'anonymous'); this.remote[path] = text; return; }
        catch (err) { this.offline((err && err.message) || String(err)); }
      }
    },

    /* ---- moving edits between browsers -------------------------------
       A safety net for when the shared board is unreachable: without it,
       whatever one person has written is stranded where nobody can get at it. */

    exportFile() {
      const stamp = new Date().toISOString().slice(0, 10);
      const body = JSON.stringify({
        kind: 'day1wf.edits', at: new Date().toISOString(),
        who: (global.Notes && global.Notes.who) || 'anonymous',
        edits: this.local, history: this.hist
      }, null, 2);
      const b = new Blob([body], { type: 'application/json;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(b);
      a.download = 'day1-edits-' + stamp + '.json';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 400);
    },

    /* Load a file another browser exported. Anything already on the shared
       board is left alone, so importing can only ever add. */
    async importText(text) {
      let parsed;
      try { parsed = JSON.parse(text); } catch (e) { return { error: 'That is not a JSON file.' }; }
      const incoming = parsed && (parsed.edits || (parsed.kind ? null : parsed));
      if (!incoming || typeof incoming !== 'object') return { error: 'No edits found in that file.' };
      if (parsed.history && typeof parsed.history === 'object') {
        Object.keys(parsed.history).forEach(p => { if (!this.hist[p]) this.hist[p] = parsed.history[p]; });
        try { localStorage.setItem(HIST, JSON.stringify(this.hist)); } catch (e) {}
      }

      let added = 0, skipped = 0;
      for (const p of Object.keys(incoming)) {
        const v = incoming[p];
        if (typeof v !== 'string' || !v.length) continue;
        if (this.map[p] === v) { skipped++; continue; }
        await this._put(p, v);
        added++;
      }
      this.rerender();
      return { added, skipped, shared: this.live() };
    },

    async addItem(base, defaults) {
      const cur = this.list(base, defaults);
      await this._put(base + '.' + cur.length, 'New line');
      await this._put(base + '.count', String(cur.length + 1));
      this.rerender();
    },

    async removeItem(base, defaults, k) {
      const cur = this.list(base, defaults);
      cur.splice(k, 1);
      for (let i = 0; i < cur.length; i++) await this._put(base + '.' + i, cur[i]);
      await this._put(base + '.count', String(cur.length));
      this.rerender();
    },

    toggleMode() {
      if (!this.mode && !this.warned) { this.warn(); return; }
      this.mode = !this.mode;
      if (this.mode && global.Notes.mode) global.Notes.mode = false;
      document.body.classList.toggle('editing-mode', this.mode);
      global.App.render();
    },

    warn() {
      const el = document.createElement('div');
      el.id = 'editwarn';
      el.innerHTML = `<div class="scrim" data-no></div>
        <div class="warn" role="dialog" aria-modal="true">
          <h2>Are you sure?</h2>
          <p>We would prefer you left a comment, since we cannot track changes in this set-up.
             Direct edit is reserved for Mukundan and Tiara.</p>
          <p>But if you feel it is a super tiny language change, go ahead and make it.</p>
          ${this.live() ? '' : `<p class="warn__alert">The shared board cannot be reached, so anything you
             change now stays in this browser and nobody else will see it. Export your edits from the bar
             at the bottom before you clear your browser data.</p>`}
          <p class="warn__note">Note that not everything is editable.</p>
          <div class="warn__row">
            <button class="btn-quiet" data-no>Leave a comment instead</button>
            <button class="btn-out btn-out--primary" data-yes>Edit anyway</button>
          </div>
        </div>`;
      document.body.appendChild(el);
      el.querySelectorAll('[data-no]').forEach(b => b.onclick = () => {
        el.remove();
        if (!global.Notes.mode) global.Notes.toggleMode();
      });
      el.querySelector('[data-yes]').onclick = () => {
        el.remove();
        this.warned = true;
        try { sessionStorage.setItem('day1wf.editwarn', '1'); } catch (e) {}
        this.mode = true;
        if (global.Notes.mode) global.Notes.mode = false;
        document.body.classList.add('editing-mode');
        global.App.render();
      };
    },

    /* make every data-edit target writable while the mode is on */
    mount(root) {
      if (!this.mode) return;
      Array.from((root || document).querySelectorAll('[data-edit]')).forEach(el => {
        el.setAttribute('contenteditable', 'plaintext-only');
        if (el.contentEditable !== 'plaintext-only') {
          el.setAttribute('contenteditable', 'true');
          el.onpaste = ev => {
            ev.preventDefault();
            const t = (ev.clipboardData || window.clipboardData).getData('text/plain');
            document.execCommand('insertText', false, t.replace(/\s+/g, ' '));
          };
        }
        /* off: the browser's red squiggles under names and house wording
           looked like the wireframe flagging a mistake */
        el.spellcheck = false;
        const path = el.dataset.edit;
        const before = read(el);
        el.onblur = () => {
          const now = clean(read(el));
          if (now && now !== clean(before)) this.set(path, now);
          else if (!now) el.textContent = before;
        };
        el.onkeydown = e => {
          if (e.key === 'Enter') { e.preventDefault(); el.blur(); }
          if (e.key === 'Escape') { el.textContent = before; el.blur(); }
        };
        el.onclick = e => e.stopPropagation();
      });
    },

    /* attributes for an editable string, used inline by the renderers */
    attr(path) { return `data-edit="${path}"${this.map[path] ? ' data-edited="1"' : ''}`; }
  };

  /* An editable list row carries its own remove button. The row is what is
     made contenteditable, so its textContent included that button's × and
     every line edited through a list picked up a stray × on the end. Read the
     row without it, and strip any that earlier edits already swallowed. */
  function read(el) {
    if (!el.querySelector || !el.querySelector('.li-x')) return el.textContent;
    const copy = el.cloneNode(true);
    Array.from(copy.querySelectorAll('.li-x')).forEach(b => b.remove());
    return copy.textContent;
  }

  function clean(text) {
    return String(text == null ? '' : text)
      .replace(/[\s.]*×[\s.]*$/, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 3800);
  }

  global.Edits = Edits;

})(window);

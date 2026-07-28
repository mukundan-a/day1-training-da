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

  const Edits = {
    map: {}, mode: false, warned: false, source: 'local',

    init() {
      try { this.map = JSON.parse(localStorage.getItem(LOCAL) || '{}'); } catch (e) { this.map = {}; }
      try { this.warned = sessionStorage.getItem('day1wf.editwarn') === '1'; } catch (e) {}

      window.addEventListener('live-ready', e => {
        if (!e.detail.ok || !global.Live.watchEdits) return;
        this.source = 'live';
        global.Live.watchEdits((rows, err) => {
          if (err) { this.source = 'local'; return; }
          const m = {};
          rows.forEach(r => { if (r.path && typeof r.text === 'string') m[r.path] = r.text; });
          this.map = m;
          if (document.activeElement && document.activeElement.isContentEditable) {
            Object.keys(m).forEach(k => { if (k !== document.activeElement.dataset.edit) this.paint(k, m[k]); });
          } else this.rerender();
        });
      });
    },

    live() { return this.source === 'live' && global.Live && global.Live.ok; },

    /* the current wording for a path, falling back to what was built in */
    t(path, fallback) {
      const v = this.map[path];
      return (typeof v === 'string' && v.length) ? v : fallback;
    },

    async set(path, text) {
      const clean = String(text || '').replace(/\s+/g, ' ').trim().slice(0, 3800);
      if (!clean) return;
      this.map[path] = clean;
      if (this.live()) {
        try { await global.Live.setEdit(path, clean, global.Notes.who || 'anonymous'); this.paint(path, clean); return; }
        catch (e) { global.Notes.flash('Could not share that edit — kept in this browser.'); }
      }
      try { localStorage.setItem(LOCAL, JSON.stringify(this.map)); } catch (e) {}
      this.paint(path, clean);
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
      if (this.live()) { try { await global.Live.clearEdit(path); return; } catch (e) {} }
      try { localStorage.setItem(LOCAL, JSON.stringify(this.map)); } catch (e) {}
      this.rerender();
    },

    count() { return Object.keys(this.map).length; },

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
        el.spellcheck = true;
        const path = el.dataset.edit;
        const before = el.textContent;
        el.onblur = () => {
          const now = el.textContent.replace(/\s+/g, ' ').trim();
          if (now && now !== before.replace(/\s+/g, ' ').trim()) this.set(path, now);
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

  global.Edits = Edits;

})(window);

/* ============================================================================
   app.js — render, navigate, animate

   Views: Walk (one screen), Map (stage tracker), Storyboard (one stage in
   full), Notes (every comment).

   Nothing inside the panel is clickable. Navigation is the two buttons and
   the faded edges of the screen. Anything that would be interactive loops.
   ========================================================================= */

(function (global) {
  'use strict';

  const { SCREENS, STAGES, PROGRESS, CARRY } = global.CONTENT;
  const W = global.WIN;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const ARROW_L = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3L5 8l5 5"/></svg>';
  const ARROW_R = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3l5 5-5 5"/></svg>';

  const App = {
    i: 0,
    view: 'walk',
    sbStage: null,
    stopAnim: null,

    init() {
      const h = location.hash.slice(1);
      const n = SCREENS.findIndex(s => s.id === h);
      if (n > -1) this.i = n;

      window.addEventListener('hashchange', () => {
        const k = SCREENS.findIndex(s => s.id === location.hash.slice(1));
        if (k > -1 && k !== this.i) { this.i = k; this.view = 'walk'; this.render(); }
      });

      document.addEventListener('keydown', e => {
        if (/^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        if (e.key === 'ArrowRight') { e.preventDefault(); this.go(1); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); this.go(-1); }
        else if (e.key === 'm') this.setView(this.view === 'walk' ? 'map' : 'walk');
        else if (e.key === 'n') this.setView(this.view === 'notes' ? 'walk' : 'notes');
        else if (e.key === 'c') global.Notes.toggleMode();
        else if (e.key === '?') this.sheet('legend');
        else if (e.key === 'Escape') this.closeSheet();
      });

      this.render();
    },

    cur() { return SCREENS[this.i]; },

    go(d) {
      const n = Math.min(SCREENS.length - 1, Math.max(0, this.i + d));
      if (n === this.i) { if (this.view !== 'walk') { this.view = 'walk'; this.render(); } return; }
      this.i = n;
      this.view = 'walk';
      history.replaceState(null, '', '#' + SCREENS[n].id);
      this.render();
    },

    jump(id) {
      const n = SCREENS.findIndex(s => s.id === id);
      if (n < 0) return;
      this.i = n;
      this.view = 'walk';
      history.replaceState(null, '', '#' + id);
      this.render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    setView(v, stage) {
      this.view = v;
      if (stage !== undefined) this.sbStage = stage;
      this.render();
      window.scrollTo({ top: 0 });
    },

    /* ---------------------------------------------------------------- */

    render() {
      if (this.stopAnim) { this.stopAnim(); this.stopAnim = null; }
      $('#top').innerHTML = this.topbar();
      const root = $('#root');
      document.body.classList.toggle('commenting-mode', global.Notes.mode);

      if (this.view === 'walk')      { root.innerHTML = this.walk();  this.wireWalk(); }
      else if (this.view === 'map')  { root.innerHTML = this.map();   this.wireLinks(); }
      else if (this.view === 'sb')   { root.innerHTML = this.board();  this.wireLinks(); }
      else                           { root.innerHTML = global.Notes.render(); global.Notes.wire(); }
      this.wireTop();
    },

    topbar() {
      const n = global.Notes.all().length;
      const onMap = this.view === 'map' || this.view === 'sb';
      return `
        <div class="topbar__id">
          <span class="topbar__title">Day 1</span>
          <span class="topbar__sub">wireframe</span>
        </div>
        <div class="views" role="tablist">
          <button role="tab" data-view="walk"  aria-selected="${this.view === 'walk'}">Walk</button>
          <button role="tab" data-view="map"   aria-selected="${onMap}">Storyboard</button>
          <button role="tab" data-view="notes" aria-selected="${this.view === 'notes'}">Notes${n ? `<span class="count">${n}</span>` : ''}</button>
        </div>
        <span class="topbar__spacer"></span>
        <div class="topbar__tools">
          <button class="tool" data-cmt aria-pressed="${global.Notes.mode}">${W.glyph('pin')}Comment</button>
          <button class="tool" data-sheet="export">Export</button>
          <button class="tool" data-sheet="legend" title="Legend and shortcuts">?</button>
          <svg class="notch" viewBox="0 0 26 13" fill="none" aria-hidden="true">
            <path d="M0 13h8.7V8.7h8.6V4.3H26V0" stroke="currentColor" stroke-width="2.4"/></svg>
        </div>`;
    },

    wireTop() {
      $$('[data-view]').forEach(b => b.onclick = () => this.setView(b.dataset.view));
      const c = $('[data-cmt]'); if (c) c.onclick = () => global.Notes.toggleMode();
      $$('[data-sheet]').forEach(b => b.onclick = () => this.sheet(b.dataset.sheet));
    },

    wireLinks() {
      $$('[data-jump]').forEach(b => b.onclick = () => this.jump(b.dataset.jump));
      $$('[data-stage]').forEach(b => b.onclick = () => this.setView('sb', +b.dataset.stage));
      $$('[data-back]').forEach(b => b.onclick = () => this.setView('map'));
      $$('[data-sheet]').forEach(b => b.onclick = () => this.sheet(b.dataset.sheet));
    },

    /* ------------------------------ WALK ----------------------------- */

    walk() {
      const s = this.cur();
      const stage = STAGES[s.stage];
      const inStage = SCREENS.filter(x => x.stage === s.stage);
      const pos = inStage.indexOf(s);
      const first = this.i === 0, last = this.i === SCREENS.length - 1;

      return `
        <div class="walk">
          <div class="walk__head">
            <div>
              <div class="walk__eyebrow">
                <span class="verb">${s.verb}</span><span class="sep">·</span>
                <span class="label">${esc(stage.name)}</span>
              </div>
              <h1 class="summary">${esc(s.summary)}</h1>
              ${(s.beats && s.beats.length) ? `<ul class="beats">${s.beats.map(b => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}
            </div>
            <div class="walk__marks">
              ${s.decision ? `<button class="decision" data-sheet="decisions"><i class="dot"></i>Open decision</button>` : ''}
            </div>
          </div>

          <div class="stage-wrap">
            <div class="stage-frame" id="stagewrap">
              ${this.screen(s)}
              <button class="edge edge--l" data-go="-1" ${first ? 'disabled' : ''} aria-label="Previous">${first ? '' : ARROW_L}</button>
              <button class="edge edge--r" data-go="1" ${last ? 'disabled' : ''} aria-label="Next">${last ? '' : ARROW_R}</button>
              <div id="pins"></div>
            </div>
            <aside class="specs">${s.notes ? s.notes() : ''}</aside>
          </div>

          <div class="walk__foot">
            <button class="nav-btn" data-go="-1" ${first ? 'disabled' : ''}>${ARROW_L}Back</button>
            <div class="dots">
              ${inStage.map((x, k) => {
                const gi = SCREENS.indexOf(x);
                const notes = global.Notes.forScreen(x.id).length;
                return `<button data-jump="${x.id}" title="${esc(x.label)}"
                  class="${gi < this.i ? 'done' : ''} ${k === pos ? 'here' : ''} ${notes ? 'has-notes' : ''}"></button>`;
              }).join('')}
            </div>
            <span class="walk__where">${this.i + 1} / ${SCREENS.length}</span>
            <button class="nav-btn" data-go="1" ${last ? 'disabled' : ''}>Next${ARROW_R}</button>
          </div>
        </div>`;
    },

    screen(s) {
      const at = PROGRESS[s.stage];
      const prog = Array.from({ length: 5 }, (_, k) =>
        `<i class="${k < at ? 'done' : k === at ? 'here' : ''}"></i>`).join('');

      const reads = (s.carry && s.carry.read) || [];
      const writes = (s.carry && s.carry.write) || [];
      const upto = new Set();
      SCREENS.slice(0, this.i + 1).forEach(x => ((x.carry && x.carry.write) || []).forEach(k => upto.add(k)));

      const carry = CARRY.map(c => {
        const held = upto.has(c.k);
        const used = reads.indexOf(c.k) > -1 && held;
        const writing = writes.indexOf(c.k) > -1;
        return `<span class="carry__item ${used ? 'used' : held || writing ? 'held' : ''}"><i></i>${c.label}</span>`;
      }).join('');

      let inner, wellCls = 'app-well';
      if (s.kind === 'sim') { wellCls = 'app-well app-well--flush'; inner = s.body(); }
      else if (s.tabsData) {
        const t = s.tabsData();
        inner = `<div class="tabs">${t.map((x, k) => `<span class="${k === 0 ? 'on' : ''}">${x.label}</span>`).join('')}</div>
          <div class="scrollzone"><div data-tabbody>${t[0].html}</div></div>`;
      } else inner = s.body();

      return `
        <div class="screen" id="screen" data-screen="${s.id}">
          <div class="app-top">
            <span class="app-top__name">${esc(STAGES[s.stage].name)}</span>
            <span class="app-top__prog">${prog}</span>
          </div>
          <div class="${wellCls}">${inner}</div>
          <div class="app-foot">
            <span class="carry">${carry}</span>
            <span class="act">${s.action || 'Next'}</span>
          </div>
        </div>`;
    },

    wireWalk() {
      $$('[data-go]').forEach(b => { if (!b.disabled) b.onclick = () => this.go(+b.dataset.go); });
      $$('[data-jump]').forEach(b => b.onclick = () => this.jump(b.dataset.jump));
      $$('[data-sheet]').forEach(b => b.onclick = () => this.sheet(b.dataset.sheet));

      const s = this.cur(), el = $('#screen');
      if (s.anim && el) this.stopAnim = s.anim(el);
      global.Notes.mount();
    },

    /* --------------------------- MAP: TRACKER ------------------------ */

    map() {
      const rows = STAGES.map(st => {
        const items = SCREENS.filter(x => x.stage === st.n);
        const notes = items.reduce((a, x) => a + global.Notes.forScreen(x.id).length, 0);
        const dec = items.filter(x => x.decision).length;
        return `<button class="track__row" data-stage="${st.n}">
          <span class="track__n">${st.n === 0 ? '—' : st.n}</span>
          <span>
            <span class="track__name">${esc(st.name)}</span>
            <p class="track__sub">${esc(st.short)}</p>
          </span>
          <span class="track__meta">
            <span><b>${items.length}</b> screens</span>
            <span>${dec ? `<b>${dec}</b> open decision${dec > 1 ? 's' : ''}` : 'No open decisions'}</span>
            ${notes ? `<span class="track__notes" style="align-self:flex-start">${notes} note${notes > 1 ? 's' : ''}</span>` : ''}
          </span>
          <span class="track__bar">${items.map(x =>
            `<i class="${SCREENS.indexOf(x) <= this.i ? 'on' : ''}"></i>`).join('')}</span>
          <span class="track__go">&rarr;</span>
        </button>`;
      }).join('');

      const dec = SCREENS.filter(s => s.decision).length;
      return `<div class="map">
        <div class="map__intro">
          <h1>The whole experience, in ${STAGES.length} parts and ${SCREENS.length} screens.</h1>
          <p>Open a stage to read what actually happens in it, what the user puts in, what comes out,
             and every screen in order. ${dec} decisions are still open.</p>
        </div>
        <div class="track">${rows}</div>
      </div>`;
    },

    /* ------------------------ MAP: ONE STAGE ------------------------- */

    board() {
      const st = STAGES[this.sbStage || 0];
      const items = SCREENS.filter(x => x.stage === st.n);

      return `<div class="sb">
        <button class="sb__back" data-back>${ARROW_L}All stages</button>

        <div class="sb__head">
          <div>
            <h1 class="sb__title">${esc(st.name)}</h1>
            <p class="sb__about">${esc(st.about)}</p>
          </div>
          <div class="io">
            <div class="io__panel">
              <h4>What the user puts in</h4>
              <ul>${st.inputs.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
            </div>
            <div class="io__panel io__panel--out">
              <h4>What comes out</h4>
              <ul>${st.outputs.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
            </div>
          </div>
        </div>

        <div class="sb__steps">
          ${items.map((s, k) => {
            const notes = global.Notes.forScreen(s.id).length;
            return `<button class="sb__step" data-jump="${s.id}">
              <span class="sb__n">${k + 1}</span>
              <span class="sb__thumb">${this.mini(s)}</span>
              <span class="sb__desc">${esc(s.summary)}</span>
              <span style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">
                <span class="sb__verb">${s.verb}</span>
                ${notes ? `<span class="sb__pin">${notes}</span>` : ''}
                ${s.decision ? `<span class="sb__verb" style="color:var(--maroon)">Decision open</span>` : ''}
              </span>
            </button>`;
          }).join('')}
        </div>
      </div>`;
    },


    /* each simulated app reads differently even at 250px wide */
    simMini(app) {
      const col = (w, n, extra) => `<div style="width:${w};display:flex;flex-direction:column;gap:2px;${extra || ''}">${
        W.bars(Array.from({ length: n }, (_, i) => [(62 + (i * 13) % 32) + '%', 'faint']))}</div>`;
      return {
        outlook: `<div style="flex:1;display:flex;gap:2px">
          <div style="width:8%;background:var(--fill)"></div>${col('20%', 4, 'border-right:1px solid var(--rule-soft);padding-right:2px')}
          ${col('30%', 5, 'border-right:1px solid var(--rule-soft);padding-right:2px')}
          <div style="flex:1;display:flex;flex-direction:column;gap:2px;padding-left:2px">${
            W.bars([['70%','strong'],['92%','faint'],['86%','faint'],['58%','faint']])}</div></div>`,
        teams: `<div style="flex:1;display:flex;gap:2px">
          <div style="width:8%;background:var(--fill)"></div>${col('24%', 6, 'border-right:1px solid var(--rule-soft);padding-right:2px')}
          <div style="flex:1;display:flex;flex-direction:column;gap:3px;padding-left:2px">
            ${[0,1,2].map(() => `<div style="display:flex;gap:3px"><i style="width:6px;height:6px;border-radius:50%;background:var(--fill-2);flex-shrink:0"></i>
              <span style="flex:1;display:flex;flex-direction:column;gap:2px">${W.bars([['54%','faint'],['84%','faint']])}</span></div>`).join('')}
            <div style="margin-top:auto;height:8px;border:1px solid var(--rule-soft);border-radius:1px"></div></div></div>`,
        meeting: `<div style="flex:1;display:flex;flex-direction:column;gap:2px">
          <div style="flex:1;display:flex;gap:2px">
            <div style="flex:1;background:var(--fill);border:1px solid var(--rule-soft);border-radius:1px"></div>
            <div style="width:26%;display:flex;flex-direction:column;gap:2px;border-left:1px solid var(--rule-soft);padding-left:2px">${
              W.bars([['80%','faint'],['70%','faint'],['86%','faint']])}</div></div>
          <div style="display:flex;gap:2px;height:12px;flex-shrink:0">${[0,1,2,3].map(k =>
            `<div style="flex:1;border:1px solid ${k===3?'var(--mute-2)':'var(--rule-soft)'};background:var(--fill);border-radius:1px"></div>`).join('')}</div></div>`,
        sharepoint: `<div style="flex:1;display:flex;flex-direction:column;gap:2px">
          <div style="height:5px;background:var(--fill);flex-shrink:0"></div>
          <div style="flex:1;display:flex;gap:2px">
            <div style="width:38%;display:flex;flex-direction:column;gap:2px;border-right:1px solid var(--rule-soft);padding-right:2px">
              ${[0,1,2,3,4].map(k => `<div style="display:flex;gap:2px;padding-left:${k?4:0}px">
                <i style="width:5px;height:5px;background:${k===3?'var(--soft-deep)':'var(--fill-2)'};flex-shrink:0"></i>
                ${W.bar((54 + k * 7) + '%', 'faint')}</div>`).join('')}</div>
            <div style="flex:1;display:flex;flex-direction:column;gap:2px">${
              W.bars([['88%','faint'],['76%','faint'],['84%','faint'],['66%','faint'],['80%','faint']])}</div></div></div>`,
        ppt: `<div style="flex:1;display:flex;gap:3px">
          <div style="width:16%;display:flex;flex-direction:column;gap:2px;border-right:1px solid var(--rule-soft);padding-right:2px">
            ${[0,1,2,3].map(k => `<div style="aspect-ratio:16/9;border:1px solid ${k===2?'var(--maroon)':'var(--rule-soft)'};border-radius:1px"></div>`).join('')}</div>
          <div style="flex:1;background:var(--fill);display:flex;align-items:center;padding:3px">
            <div style="width:100%;aspect-ratio:16/9;background:var(--paper);border:1px solid var(--rule-soft);display:flex;flex-direction:column;gap:2px;padding:3px">${
              W.bars([['66%','strong'],['90%','faint'],['82%','faint']])}</div></div></div>`,
        excel: `<div style="flex:1;display:flex;flex-direction:column">
          ${[0,1,2,3,4,5].map(r => `<div style="flex:1;display:flex;border-bottom:1px solid var(--rule-soft)">
            <div style="width:9px;background:var(--fill);border-right:1px solid var(--rule-soft)"></div>
            ${[0,1,2].map(c => `<div style="flex:1;border-right:1px solid var(--rule-soft);display:flex;align-items:center;padding:0 2px;${
              (r===3||r===5)?'background:repeating-linear-gradient(45deg,transparent 0 2px,var(--fill) 2px 4px)':''}">${
              (r && r!==3 && r!==5) ? W.bar('70%','faint') : ''}</div>`).join('')}</div>`).join('')}</div>`,
        forms: `<div style="flex:1;display:flex;flex-direction:column;gap:3px;padding:2px 6px">
          <div style="height:3px;background:var(--fill-2);border-radius:2px;flex-shrink:0"><div style="width:40%;height:100%;background:var(--maroon)"></div></div>
          ${[0,1,2].map(k => `<div style="flex:1;border:1px solid var(--rule-soft);border-left:2px solid ${k===0?'var(--maroon)':'var(--rule)'};border-radius:1px;background:${k===0?'var(--soft)':'transparent'};padding:3px;display:flex;flex-direction:column;gap:2px">${
            W.bars([['56%','strong'],['76%','faint']])}</div>`).join('')}</div>`
      }[app] || `<div style="flex:1;background:var(--fill);border-radius:1px"></div>`;
    },

    /* a cheap abstract of each screen kind — never a full render */
    mini(s) {
      const b = (w, m) => W.bar(w, m);
      const inner = {
        splash:   `${b('54%', 'strong')}<div style="flex:1"></div>
                   <div style="display:flex;gap:4px">${[0,1].map(() => `<div style="flex:1;height:14px;background:var(--fill);border-radius:1px"></div>`).join('')}</div>`,
        argument: `${b('62%', 'strong')}<div style="display:flex;flex-direction:column;gap:3px;margin-top:3px">${
                   W.bars([['90%','faint'],['82%','faint'],['86%','faint'],['58%','faint']])}</div>`,
        map:      `<div style="display:flex;gap:2px;flex:1">${Array.from({ length: 5 }, (_, k) =>
                   `<div style="flex:1;border:1px solid var(--rule-soft);border-radius:1px;background:${
                     k < PROGRESS[s.stage] ? 'var(--fill)' : k === PROGRESS[s.stage] ? 'var(--soft)' : 'transparent'}"></div>`).join('')}</div>`,
        intro:    `${b('50%', 'strong')}<div style="display:flex;gap:4px;flex:1;margin-top:3px">
                   <div style="flex:1;background:var(--soft);border-radius:1px"></div>
                   <div style="flex:1;background:var(--fill);border-radius:1px"></div></div>`,
        sim: this.simMini(s.app),
        exercise: `<div style="flex:1;display:flex;gap:3px">${Array.from({ length: 3 }, (_, k) =>
                   `<div style="flex:1;border:1px solid var(--rule-soft);border-radius:1px;background:${k === 2 ? 'var(--soft)' : 'transparent'};padding:3px;display:flex;flex-direction:column;gap:2px">${
                     W.bars([[(72 - k * 8) + '%','faint'],[(86 - k * 6) + '%','faint']])}</div>`).join('')}</div>`,
        check:    `<div style="flex:1;display:flex;flex-direction:column;gap:3px">${Array.from({ length: 4 }, () =>
                   `<div style="display:flex;gap:4px"><div style="width:20%">${b('80%','strong')}</div><div style="flex:1">${b('92%','faint')}</div></div>`).join('')}</div>`,
        vault:    `<div style="flex:1;display:grid;grid-template-columns:repeat(4,1fr);gap:2px">${Array.from({ length: 8 }, (_, k) =>
                   `<div style="border:1px solid var(--rule-soft);border-radius:1px;background:${k % 4 === 0 ? 'var(--soft)' : 'transparent'}"></div>`).join('')}</div>`
      }[s.kind] || '';

      return `<span class="thumb__strip"></span><span class="thumb__mini">${inner}</span><span class="thumb__foot"></span>`;
    },

    /* ----------------------------- SHEETS ---------------------------- */

    sheet(which) {
      this.closeSheet();
      const body = which === 'legend' ? this.legendSheet()
                 : which === 'decisions' ? this.decisionSheet()
                 : global.Notes.exportSheet();
      const el = document.createElement('div');
      el.id = 'sheetwrap';
      el.innerHTML = `<div class="scrim" data-close></div>
        <aside class="sheet" role="dialog" aria-modal="true">
          <button class="sheet__close" data-close>&times;</button>${body}</aside>`;
      document.body.appendChild(el);
      $$('[data-close]', el).forEach(b => b.onclick = () => this.closeSheet());
      $$('[data-jump]', el).forEach(b => b.onclick = () => { this.closeSheet(); this.jump(b.dataset.jump); });
      global.Notes.wireExport(el);
    },

    closeSheet() { const s = $('#sheetwrap'); if (s) s.remove(); },

    legendSheet() {
      return `<h2>How to read this</h2>
        <p>Each screen does one thing. The bold line above it says what the user gets from that screen;
           the bullets under it say how it plays out. That is the level of feedback this is for.</p>
        <p>Nothing inside the panel is clickable. Anything that would be interactive plays as a loop,
           so you see the whole thing without having to work it. Move with the two buttons, the arrow
           keys, or by clicking either faded edge of the screen.</p>

        <h3>Interaction</h3>
        <dl class="legend">
          ${[['Read', 'There is nothing to do. The user reads it and moves on.'],
             ['Watch', 'Something plays out. No input from the user.'],
             ['Explore', 'The user can move around freely. Nothing to complete.'],
             ['Do', 'The user produces something the app carries forward.'],
             ['Decide', 'The user chooses. Nothing is carried forward.']].map(([d, t]) =>
            `<div class="legend__row"><dt>${d}</dt><dd>${t}</dd></div>`).join('')}
        </dl>

        <h3>Colour</h3>
        <dl class="legend">
          <div class="legend__row"><dt><span class="swatch" style="background:var(--soft)"></span></dt>
            <dd>The focal element — the one thing a screen is really about. One per screen.</dd></div>
          <div class="legend__row"><dt><span class="swatch" style="background:var(--maroon)"></span></dt>
            <dd>Whatever is live or moving right now.</dd></div>
          <div class="legend__row"><dt><span class="swatch" style="background:var(--pink)"></span></dt>
            <dd>Reviewer comments, and nothing else.</dd></div>
        </dl>

        <h3>Copy</h3>
        <p>There is no written copy anywhere. Every email, message, definition and annotation is
           replaced by a description of what it will need to say, in the column to the right.
           Choreography lives there too, tagged Beat.</p>

        <h3>Carried forward</h3>
        <p>The row at the bottom-left of every screen shows what the app is holding for the user.
           It turns maroon on the screen that uses it.</p>

        <h3>Keys</h3>
        <p><span class="kbd">←</span> <span class="kbd">→</span> move &nbsp;
           <span class="kbd">m</span> storyboard &nbsp; <span class="kbd">n</span> notes &nbsp;
           <span class="kbd">c</span> comment &nbsp; <span class="kbd">esc</span> close</p>`;
    },

    decisionSheet() {
      const items = SCREENS.filter(s => s.decision);
      return `<h2>Open decisions</h2>
        <p>These come from the build notes and content notes in the storyboard deck.
           None are resolved, and each links to the screen it affects.</p>
        <div>${items.map(s => `<div class="decisions__item">
          <b>${esc(STAGES[s.stage].name)} — ${esc(s.label)}</b>
          <p>${esc(s.decision)}</p>
          <a data-jump="${s.id}">Go to screen &rarr;</a>
        </div>`).join('')}</div>`;
    }
  };

  global.App = App;
  document.addEventListener('DOMContentLoaded', () => { global.Notes.init(); App.init(); });

})(window);

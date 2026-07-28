/* ============================================================================
   app.js — render, navigate, animate

   Views: Home, Recap, Storyboard (all stages, then one stage), Walkthrough,
   Notes.

   Nothing inside the panel is clickable. Navigation is the two buttons and the
   faded edges of the screen. Anything interactive plays as a loop.
   ========================================================================= */

(function (global) {
  'use strict';

  const { SCREENS, STAGES, PROGRESS, CARRY, RECAP } = global.CONTENT;
  const W = global.WIN;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const A_L = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3L5 8l5 5"/></svg>';
  const A_R = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3l5 5-5 5"/></svg>';

  const VIEWS = [
    { k: 'home',  label: 'Home' },
    { k: 'recap', label: 'Recap' },
    { k: 'map',   label: 'Storyboard' },
    { k: 'walk',  label: 'Walkthrough' },
    { k: 'notes', label: 'Notes' }
  ];

  const App = {
    i: 0, view: 'home', sbStage: null, stopAnim: null,

    init() {
      const h = location.hash.slice(1);
      const n = SCREENS.findIndex(s => s.id === h);
      if (n > -1) { this.i = n; this.view = 'walk'; }

      window.addEventListener('hashchange', () => {
        const k = SCREENS.findIndex(s => s.id === location.hash.slice(1));
        if (k > -1 && (k !== this.i || this.view !== 'walk')) { this.i = k; this.view = 'walk'; this.render(); }
      });

      document.addEventListener('keydown', e => {
        if (/^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        if (this.view === 'walk' && e.key === 'ArrowRight') { e.preventDefault(); this.go(1); }
        else if (this.view === 'walk' && e.key === 'ArrowLeft') { e.preventDefault(); this.go(-1); }
        else if (e.key === 'c') global.Notes.toggleMode();
        else if (e.key === '?') this.sheet('legend');
        else if (e.key === 'Escape') { this.closeSheet(); global.Notes.closePop(); }
      });

      this.render();
    },

    cur() { return SCREENS[this.i]; },

    go(d) {
      const n = Math.min(SCREENS.length - 1, Math.max(0, this.i + d));
      if (n === this.i && this.view === 'walk') return;
      this.i = n; this.view = 'walk';
      history.replaceState(null, '', '#' + SCREENS[n].id);
      this.render();
    },

    jump(id) {
      const n = SCREENS.findIndex(s => s.id === id);
      if (n < 0) return;
      this.i = n; this.view = 'walk';
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

    render() {
      if (this.stopAnim) { this.stopAnim(); this.stopAnim = null; }
      $('#top').innerHTML = this.topbar();
      const root = $('#root');
      document.body.classList.toggle('commenting-mode', global.Notes.mode);

      if (this.view === 'walk')       { root.innerHTML = this.walk();  this.wireWalk(); }
      else if (this.view === 'home')  { root.innerHTML = this.home();  this.wireLinks(); }
      else if (this.view === 'recap') { root.innerHTML = this.recap(); this.wireLinks(); }
      else if (this.view === 'map')   { root.innerHTML = this.map();   this.wireLinks(); }
      else if (this.view === 'sb')    { root.innerHTML = this.board(); this.wireLinks(); }
      else                            { root.innerHTML = global.Notes.render(); global.Notes.wire(); }
      this.wireTop();
    },

    topbar() {
      const open = global.Notes.all().filter(n => !n.resolved).length;
      const here = this.view === 'sb' ? 'map' : this.view;
      const st = global.Notes.statusLabel();
      return `
        <div class="topbar__id">
          <span class="topbar__title">Day 1</span>
          <span class="topbar__sub">wireframe</span>
        </div>
        <div class="views" role="tablist">
          ${VIEWS.map(v => `<button role="tab" data-view="${v.k}" aria-selected="${here === v.k}">${v.label}${
            v.k === 'notes' && open ? `<span class="count">${open}</span>` : ''}</button>`).join('')}
        </div>
        <span class="topbar__spacer"></span>
        <div class="topbar__tools">
          <span class="conn ${st.cls}" title="${global.Notes.who ? 'Signed as ' + esc(global.Notes.who) : ''}">${st.t}</span>
          <button class="tool tool--cmt" data-cmt aria-pressed="${global.Notes.mode}">${W.glyph('pin')}Comment</button>
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
      $$('[data-view]').forEach(b => b.onclick = () => this.setView(b.dataset.view));
      $$('[data-sheet]').forEach(b => b.onclick = () => this.sheet(b.dataset.sheet));
    },

    /* ------------------------------ HOME ----------------------------- */

    home() {
      const open = global.Notes.all().filter(n => !n.resolved).length;
      return `<div class="home">
        <h1 class="home__title">Day 1 training — proposed design</h1>
        <p class="home__lede">${SCREENS.length} screens across ${STAGES.length} parts. Four ways in.</p>

        <div class="home__grid">
          ${[['recap', 'Recap', 'The codified Day 1 — stage by stage, in one table.'],
             ['map', 'Storyboard', 'See storyboard of whole proposed training.'],
             ['walk', 'Walkthrough', 'Step through each screen in the training as the user would (you can also enter this by clicking on thumbnails inside storyboard view).'],
             ['notes', 'Notes', 'Your notes, collated.']].map(([k, name, text]) => `
            <button class="home__card" data-view="${k}">
              <span class="home__mini">${this.homeMini(k)}</span>
              <span class="home__name">${name}</span>
              <span class="home__text">${text}</span>
            </button>`).join('')}
        </div>

        <div class="home__cmt">
          <div class="home__cmtcopy">
            <h2>You can add comments anywhere!</h2>
            <p>Just click on “Comment” tab above to turn your cursor into a pin you can drop anywhere.</p>
            <p class="home__cmtsub">Everyone’s comments are shared as they are written. You can reply to
               anyone’s, and mark one resolved once it is dealt with — it stays visible.
               ${open ? `<b>${open} open right now.</b>` : ''}</p>
          </div>
          <div class="home__demo" aria-hidden="true">
            <div class="home__demobar"><span>${W.glyph('pin')}Comment</span></div>
            <div class="home__demoscreen">
              ${W.bars([['46%', 'strong'], ['86%', 'faint'], ['72%', 'faint']])}
              <span class="home__cursor">${W.glyph('pin')}</span>
              <span class="home__pin">1</span>
            </div>
          </div>
        </div>
      </div>`;
    },

    homeMini(k) {
      if (k === 'recap') return `<span class="hm hm--recap">${Array.from({ length: 5 }, (_, r) =>
        `<i>${Array.from({ length: 4 }, () => '<b></b>').join('')}</i>`).join('')}</span>`;
      if (k === 'map') return `<span class="hm hm--map">${Array.from({ length: 4 }, (_, r) =>
        `<i class="${r === 1 ? 'on' : ''}"></i>`).join('')}</span>`;
      if (k === 'walk') return `<span class="hm hm--walk"><i></i><b></b></span>`;
      return `<span class="hm hm--notes">${Array.from({ length: 3 }, (_, r) =>
        `<i class="${r === 0 ? 'on' : ''}"></i>`).join('')}</span>`;
    },

    /* ------------------------------ RECAP ---------------------------- */

    recap() {
      return `<div class="recap">
        <div class="recap__head">
          <h1>What does a codified “day 1” consist of?</h1>
          <p>The agreed table, kept as written. Small flags mark the few places where the
             walkthrough differs from it.</p>
        </div>

        <div class="recap__scroll">
          <table class="rt">
            <thead><tr>
              <th>Stage</th><th>Activity</th><th>Key outputs</th>
              <th>Process checklist</th><th>Content checklist</th><th>Why this is important</th>
            </tr></thead>
            <tbody>
              ${RECAP.map(r => `<tr>
                <td class="rt__stage">${esc(r.stage)}</td>
                <td class="rt__act">${esc(r.activity)}</td>
                <td>${cell(r.outputs)}</td>
                <td>${cell(r.process)}</td>
                <td>${groups(r.content)}</td>
                <td>${cell(r.why)}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>

        <div class="recap__diffs">
          <h3>Where the walkthrough differs</h3>
          <ol>${RECAP.flatMap(r => (r.flags || []).map(f =>
            `<li><b>${esc(r.stage)} · ${esc(r.activity)}</b>${esc(f)}</li>`)).join('')}</ol>
        </div>

        <p class="recap__link">Link to notion with compiled resources + detailed steps per stage:
          <a href="https://app.notion.com/p/Craft-Day-1-Draft-17-Jul-3a3913a77fdf8109af5fce33b30d10b1"
             target="_blank" rel="noopener">app.notion.com/p/Craft-Day-1-Draft-17-Jul</a></p>
      </div>`;

      function cell(items) {
        if (!items || !items.length) return '<span class="rt__na">N/A</span>';
        return `<ul>${items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>`;
      }
      function groups(g) {
        if (!g) return '';
        return Object.keys(g).map(k =>
          `<div class="rt__grp"><b>${esc(k)}</b>${cell(g[k])}</div>`).join('');
      }
    },

    /* ------------------------------ WALK ----------------------------- */

    walk() {
      const s = this.cur();
      const stage = STAGES[s.stage];
      const inStage = SCREENS.filter(x => x.stage === s.stage);
      const pos = inStage.indexOf(s);
      const first = this.i === 0, last = this.i === SCREENS.length - 1;
      const open = global.Notes.openOn(s.id);

      return `
        <div class="walk">
          <div class="walk__head">
            <div>
              <div class="walk__eyebrow">
                <span class="verb">${s.verb}</span><span class="sep">·</span>
                <span class="label">${esc(stage.name)}</span>
                ${open ? `<span class="sep">·</span><button class="openflag" data-view="notes">${open} open comment${open > 1 ? 's' : ''}</button>` : ''}
              </div>
              <h1 class="summary">${esc(s.summary)}</h1>
              ${(s.beats && s.beats.length) ? `<ul class="beats">${s.beats.map(b => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}
            </div>
          </div>

          <div class="stage-wrap">
            <div class="stage-frame" id="stagewrap">
              ${this.screen(s)}
              <button class="edge edge--l" data-go="-1" ${first ? 'disabled' : ''} aria-label="Previous">${first ? '' : A_L}</button>
              <button class="edge edge--r" data-go="1" ${last ? 'disabled' : ''} aria-label="Next">${last ? '' : A_R}</button>
              <div id="pins"></div>
            </div>
            <aside class="specs">${s.notes ? s.notes() : ''}</aside>
          </div>

          <div class="walk__foot">
            <button class="nav-btn" data-go="-1" ${first ? 'disabled' : ''}>${A_L}Back</button>
            <div class="dots">
              ${inStage.map((x, k) => {
                const gi = SCREENS.indexOf(x);
                return `<button data-jump="${x.id}" title="${esc(x.label)}"
                  class="${gi < this.i ? 'done' : ''} ${k === pos ? 'here' : ''} ${global.Notes.openOn(x.id) ? 'has-notes' : ''}"></button>`;
              }).join('')}
            </div>
            <span class="walk__where">${this.i + 1} / ${SCREENS.length}</span>
            <button class="nav-btn" data-go="1" ${last ? 'disabled' : ''}>Next${A_R}</button>
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
        return `<span class="carry__item ${used ? 'used' : held || writes.indexOf(c.k) > -1 ? 'held' : ''}"><i></i>${c.label}</span>`;
      }).join('');

      // An activity says so, and puts its action where the eye lands first.
      const isActivity = s.verb === 'DO' || s.verb === 'DECIDE';

      let inner, wellCls = 'app-well';
      if (s.kind === 'sim') { wellCls = 'app-well app-well--flush'; inner = s.body(); }
      else if (s.tabsData) {
        const t = s.tabsData();
        inner = `<div class="tabs">${t.map((x, k) => `<span class="${k === 0 ? 'on' : ''}">${x.label}</span>`).join('')}</div>
          <div class="scrollzone"><div data-tabbody>${t[0].html}</div></div>`;
      } else inner = s.body();

      return `
        <div class="screen ${isActivity ? 'is-activity' : ''}" id="screen" data-screen="${s.id}">
          <div class="app-top">
            ${isActivity
              ? `<span class="app-top__act">${W.glyph('pin')}Your turn</span>`
              : `<span class="app-top__name">${esc(STAGES[s.stage].name)}</span>`}
            <span class="app-top__prog">${prog}</span>
            ${isActivity ? `<span class="act act--top">${esc(s.action || 'Check')}</span>` : ''}
          </div>
          <div class="${wellCls}">${inner}</div>
          <div class="app-foot">
            <span class="carry">${carry}</span>
            ${isActivity
              ? `<span class="app-foot__hint">${esc(STAGES[s.stage].name)}</span>`
              : `<span class="act">${esc(s.action || 'Next')}</span>`}
          </div>
        </div>`;
    },

    wireWalk() {
      $$('[data-go]').forEach(b => { if (!b.disabled) b.onclick = () => this.go(+b.dataset.go); });
      $$('[data-jump]').forEach(b => b.onclick = () => this.jump(b.dataset.jump));
      $$('[data-view]').forEach(b => b.onclick = () => this.setView(b.dataset.view));
      $$('[data-sheet]').forEach(b => b.onclick = () => this.sheet(b.dataset.sheet));

      const s = this.cur(), el = $('#screen');
      if (s.anim && el) this.stopAnim = s.anim(el);
      global.Notes.mount();
    },

    /* ------------------------ STORYBOARD: STAGES --------------------- */

    map() {
      const rows = STAGES.map(st => {
        const items = SCREENS.filter(x => x.stage === st.n);
        const open = global.Notes.openInStage(st.n);
        return `<button class="track__row" data-stage="${st.n}">
          <span class="track__n">${st.n === 0 ? '—' : st.n}</span>
          <span>
            <span class="track__name">${esc(st.name)}</span>
            <p class="track__sub">${esc(st.short)}</p>
          </span>
          <span class="track__meta">
            <span><b>${items.length}</b> screens</span>
            ${open ? `<span class="track__notes">${open} open comment${open > 1 ? 's' : ''}</span>` : ''}
          </span>
          <span class="track__bar">${items.map(x =>
            `<i class="${global.Notes.openOn(x.id) ? 'note' : SCREENS.indexOf(x) <= this.i ? 'on' : ''}"></i>`).join('')}</span>
          <span class="track__go">&rarr;</span>
        </button>`;
      }).join('');

      return `<div class="map">
        <div class="map__intro">
          <h1>The whole training, in ${STAGES.length} parts and ${SCREENS.length} screens.</h1>
          <p>Open a stage to read what happens in it, what the user puts in, what comes out,
             and every screen in order.</p>
        </div>
        <div class="track">${rows}</div>
      </div>`;
    },

    /* ------------------------ STORYBOARD: ONE ------------------------ */

    board() {
      const st = STAGES[this.sbStage || 0];
      const items = SCREENS.filter(x => x.stage === st.n);

      return `<div class="sb">
        <button class="sb__back" data-back>${A_L}All stages</button>
        <div class="sb__head">
          <div>
            <h1 class="sb__title">${esc(st.name)}</h1>
            <p class="sb__about">${esc(st.about)}</p>
          </div>
          <div class="io">
            <div class="io__panel"><h4>What the user puts in</h4>
              <ul>${st.inputs.map(i => `<li>${esc(i)}</li>`).join('')}</ul></div>
            <div class="io__panel io__panel--out"><h4>What comes out</h4>
              <ul>${st.outputs.map(i => `<li>${esc(i)}</li>`).join('')}</ul></div>
          </div>
        </div>

        <div class="sb__steps">
          ${items.map((s, k) => {
            const open = global.Notes.openOn(s.id);
            return `<button class="sb__step" data-jump="${s.id}">
              <span class="sb__n">${k + 1}</span>
              <span class="sb__thumb">${this.mini(s)}</span>
              <span class="sb__desc">${esc(s.summary)}</span>
              <span class="sb__side">
                <span class="sb__verb">${s.verb}</span>
                ${open ? `<span class="sb__pin">${open}</span>` : ''}
              </span>
            </button>`;
          }).join('')}
        </div>
      </div>`;
    },

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
        sim:      this.simMini(s.app),
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
      const body = which === 'legend' ? this.legendSheet() : global.Notes.exportSheet();
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
        <p>Each screen does one thing. The bold line above it says what the user gets from that
           screen; the bullets say how it plays out.</p>
        <p>Nothing inside the panel is clickable. Anything the user would interact with plays as a
           loop instead, so you see it without having to work it. Move with the two buttons, the
           arrow keys, or by clicking either faded edge of the screen.</p>

        <h3>Interaction</h3>
        <dl class="legend">
          ${[['Read', 'Nothing to do. The user reads it and moves on.'],
             ['Watch', 'Something plays out. No input from the user.'],
             ['Explore', 'The user can move around freely. Nothing to complete.'],
             ['Do', 'An activity. The screen says “Your turn” and the action sits at the top.'],
             ['Decide', 'An activity where the user chooses. Nothing is carried forward.']].map(([d, t]) =>
            `<div class="legend__row"><dt>${d}</dt><dd>${t}</dd></div>`).join('')}
        </dl>

        <h3>Colour</h3>
        <dl class="legend">
          <div class="legend__row"><dt><span class="swatch" style="background:var(--soft)"></span></dt>
            <dd>The focal element — the one thing a screen is really about.</dd></div>
          <div class="legend__row"><dt><span class="swatch" style="background:var(--maroon)"></span></dt>
            <dd>Whatever is live or moving right now.</dd></div>
          <div class="legend__row"><dt><span class="swatch" style="background:var(--pink)"></span></dt>
            <dd>Comments.</dd></div>
        </dl>

        <h3>Copy</h3>
        <p>There is no written copy anywhere. Every email, message, definition and annotation is
           replaced by a description of what it will need to say, in the column to the right.
           Choreography lives there too, tagged Beat.</p>

        <h3>Keys</h3>
        <p><span class="kbd">←</span> <span class="kbd">→</span> move &nbsp;
           <span class="kbd">c</span> comment &nbsp; <span class="kbd">esc</span> close</p>`;
    }
  };

  global.App = App;
  document.addEventListener('DOMContentLoaded', () => { global.Notes.init(); App.init(); });

})(window);

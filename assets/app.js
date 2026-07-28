/* ============================================================================
   app.js — render, navigate, and carry state across screens

   Three views: Walk (one screen), Map (all 55), Notes (all comments).
   State threads are real: what you type in Stage 1 returns in Stage 2.
   ========================================================================= */

(function (global) {
  'use strict';

  const { SCREENS, STAGES, PROGRESS, CARRY } = global.CONTENT;
  const W = global.WIN;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const STORE = 'day1wf.state.v1';

  const App = {
    i: 0,
    view: 'walk',
    learner: { scq: {}, tree: [null, null, null], prefs: {}, facts: 0 },

    /* ---------------------------------------------------------------- */

    init() {
      try {
        const raw = localStorage.getItem(STORE);
        if (raw) Object.assign(this.learner, JSON.parse(raw));
      } catch (e) { /* private mode — carry on in memory */ }

      const fromHash = SCREENS.findIndex(s => s.id === location.hash.slice(1));
      if (fromHash > -1) this.i = fromHash;

      window.addEventListener('hashchange', () => {
        const n = SCREENS.findIndex(s => s.id === location.hash.slice(1));
        if (n > -1 && n !== this.i) { this.i = n; this.render(); }
      });

      document.addEventListener('keydown', e => {
        if (/^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        if (e.key === 'ArrowRight') { e.preventDefault(); this.go(1); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); this.go(-1); }
        else if (e.key === 'm') this.setView(this.view === 'map' ? 'walk' : 'map');
        else if (e.key === 'n') this.setView(this.view === 'notes' ? 'walk' : 'notes');
        else if (e.key === 'c') global.Notes.toggleMode();
        else if (e.key === '?') this.sheet('legend');
        else if (e.key === 'Escape') this.closeSheet();
      });

      this.render();
    },

    save() {
      try { localStorage.setItem(STORE, JSON.stringify(this.learner)); } catch (e) {}
    },

    cur() { return SCREENS[this.i]; },

    go(d) {
      const n = Math.min(SCREENS.length - 1, Math.max(0, this.i + d));
      if (n === this.i) return;
      this.i = n;
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

    setView(v) { this.view = v; this.render(); },

    /* ---------------------------------------------------------------- */

    render() {
      $('#top').innerHTML = this.topbar();
      const root = $('#root');
      if (this.view === 'walk') { root.innerHTML = this.walk(); this.wire(); }
      else if (this.view === 'map') { root.innerHTML = this.map(); this.wireMap(); }
      else { root.innerHTML = global.Notes.render(); global.Notes.wire(); }
      this.wireTop();
    },

    topbar() {
      const n = global.Notes.all().length;
      return `
        <div class="topbar__id">
          <span class="topbar__title">Day 1</span>
          <span class="topbar__sub">wireframe</span>
        </div>
        <div class="views" role="tablist">
          <button role="tab" data-view="walk"  aria-selected="${this.view === 'walk'}">Walk</button>
          <button role="tab" data-view="map"   aria-selected="${this.view === 'map'}">Map</button>
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

    /* ------------------------------ WALK ----------------------------- */

    walk() {
      const s = this.cur();
      const stage = STAGES[s.stage];
      const inStage = SCREENS.filter(x => x.stage === s.stage);
      const posInStage = inStage.indexOf(s);

      return `
        <div class="walk">
          <div class="walk__head">
            <div class="walk__headline">
              <div class="walk__eyebrow">
                <span class="verb">${s.verb}</span>
                <span class="sep">·</span>
                <span class="label">${esc(stage.name)}</span>
              </div>
              <h1 class="intent">${s.intent}</h1>
            </div>
            <div class="walk__marks">
              ${s.decision ? `<button class="decision" data-sheet="decisions"><i class="dot"></i>Open decision</button>` : ''}
            </div>
          </div>

          <div class="stage-wrap">
            <div class="stage-frame" id="stagewrap">
              ${this.screen(s)}
            </div>
            ${s.notes ? `<aside class="specs">${s.notes()}</aside>` : '<aside class="specs"></aside>'}
          </div>

          <div class="walk__foot">
            <button class="nav-btn" data-go="-1" ${this.i === 0 ? 'disabled' : ''}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 3L5 8l5 5"/></svg>Back</button>
            <div class="dots">
              ${inStage.map((x, k) => {
                const gi = SCREENS.indexOf(x);
                const notes = global.Notes.forScreen(x.id).length;
                return `<button data-jump="${x.id}" title="${esc(x.label || x.intent)}"
                  class="${gi < this.i ? 'done' : ''} ${k === posInStage ? 'here' : ''} ${notes ? 'has-notes' : ''}"></button>`;
              }).join('')}
            </div>
            <span class="walk__where">${this.i + 1} / ${SCREENS.length}</span>
            <button class="nav-btn" data-go="1" ${this.i === SCREENS.length - 1 ? 'disabled' : ''}>Next
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 3l5 5-5 5"/></svg></button>
          </div>
        </div>`;
    },

    /* the product frame — identical on all 55 screens */
    screen(s) {
      const at = PROGRESS[s.stage];
      const prog = Array.from({ length: 5 }, (_, k) =>
        `<i class="${k < at ? 'done' : k === at ? 'here' : ''}"></i>`).join('');

      const held = this.heldSet();
      const reads = (s.carry && s.carry.read) || [];
      const carry = CARRY.map(c => {
        const isHeld = held.has(c.k);
        const isUsed = reads.indexOf(c.k) > -1 && isHeld;
        return `<span class="carry__item ${isUsed ? 'used' : isHeld ? 'held' : ''}"><i></i>${c.label}</span>`;
      }).join('');

      const body = s.body();
      const wellCls = s.kind === 'sim' ? 'app-well app-well--tight' : 'app-well';

      let inner;
      if (body && body.tabs) {
        inner = `<div class="tabs" data-tabs>${body.tabs.map((t, k) =>
          `<button data-tab="${k}" aria-selected="${k === 0}">${t.label}</button>`).join('')}</div>
          <div class="scrollzone"><div data-tabbody>${body.tabs[0].html}</div></div>`;
      } else {
        inner = body;
      }

      return `
        <div class="screen" id="screen" data-screen="${s.id}">
          <div class="app-top">
            <span class="app-top__name">${esc(STAGES[s.stage].name)}</span>
            <span class="app-top__prog">${prog}</span>
          </div>
          <div class="${wellCls}">${inner}</div>
          <div class="app-foot">
            <span class="carry">${carry}</span>
            <button class="act" data-act>${s.action || 'Next'}</button>
          </div>
        </div>
        <div id="pins"></div>`;
    },

    heldSet() {
      const h = new Set();
      const L = this.learner;
      if (L.scq && Object.keys(L.scq).some(k => (L.scq[k] || '').trim())) h.add('scq');
      if (L.tree && L.tree.some(Boolean)) h.add('tree');
      if (L.prefs && Object.keys(L.prefs).length) h.add('prefs');
      if (L.facts > 0) h.add('facts');
      return h;
    },

    /* ------------------------------- MAP ----------------------------- */

    map() {
      const groups = STAGES.map(st => {
        const items = SCREENS.filter(s => s.stage === st.n);
        if (!items.length) return '';
        return `<section class="map__stage">
          <div class="map__stagehead">
            <h3>${esc(st.name)}</h3>
            <span class="label">${items.length} screens</span>
          </div>
          <div class="map__grid">
            ${items.map(s => this.thumb(s)).join('')}
          </div>
        </section>`;
      }).join('');

      const dec = SCREENS.filter(s => s.decision).length;
      return `<div class="map">
        <div class="map__intro">
          <div>
            <h1 class="intent" style="font-size:22px">All ${SCREENS.length} screens, grouped into six parts.</h1>
            <p>Every screen in the walkthrough, in order. A pink number is the count of comments left on that screen. A maroon dot means the screen has a decision still open — there are ${dec} of them.</p>
          </div>
          <button class="btn-out" data-sheet="decisions">Open decisions</button>
        </div>
        ${groups}
      </div>`;
    },

    thumb(s) {
      const n = global.Notes.forScreen(s.id).length;
      const gi = SCREENS.indexOf(s);
      // cheap abstract of each screen kind — never a full render
      const mini = {
        splash:   `${W.bar('54%', 'strong')}<div style="flex:1"></div>${W.bars([['70%', 'faint'], ['62%', 'faint']])}`,
        argument: `${W.bar('62%', 'strong')}${W.bars(['88%', '80%', '84%'])}`,
        map:      `<div style="display:flex;gap:2px;flex:1">${Array.from({ length: 5 }, (_, k) =>
                    `<div style="flex:1;border:1px solid var(--rule-soft);border-radius:1px;background:${k < PROGRESS[s.stage] ? 'var(--fill)' : 'transparent'}"></div>`).join('')}</div>`,
        intro:    `${W.bar('50%', 'strong')}<div style="display:flex;gap:4px;flex:1">
                    <div style="flex:1;display:flex;flex-direction:column;gap:2px">${W.bars([['90%', 'faint'], ['76%', 'faint'], ['84%', 'faint']])}</div>
                    <div style="flex:1;display:flex;flex-direction:column;gap:2px">${W.bars([['82%', 'faint'], ['68%', 'faint']])}</div></div>`,
        sim:      `<div style="flex:1;display:flex;gap:2px"><div style="width:14%;background:var(--fill)"></div>
                    <div style="width:28%;border-right:1px solid var(--rule-soft);display:flex;flex-direction:column;gap:2px;padding-right:2px">${W.bars([['90%', 'faint'], ['80%', 'faint'], ['86%', 'faint']])}</div>
                    <div style="flex:1;display:flex;flex-direction:column;gap:2px">${W.bars([['70%'], ['92%', 'faint'], ['84%', 'faint']])}</div></div>`,
        exercise: `<div style="flex:1;display:flex;gap:3px">${Array.from({ length: 3 }, (_, k) =>
                    `<div style="flex:1;border:1px solid var(--rule-soft);border-radius:1px;padding:3px;display:flex;flex-direction:column;gap:2px">
                      ${W.bars([[(70 - k * 8) + '%', 'faint'], [(88 - k * 6) + '%', 'faint']])}</div>`).join('')}</div>
                    <div style="display:flex;gap:3px;align-items:center;flex-shrink:0">
                      <div style="flex:1;height:2px;background:var(--fill-2)"></div>
                      <div style="flex:1;height:2px;background:var(--fill-2)"></div></div>`,
        check:    `<div style="flex:1;display:flex;flex-direction:column;gap:3px">${Array.from({ length: 4 }, () =>
                    `<div style="display:flex;gap:4px"><div style="width:22%">${W.bar('80%', 'strong')}</div><div style="flex:1">${W.bar('92%', 'faint')}</div></div>`).join('')}</div>`,
        vault:    `<div style="flex:1;display:grid;grid-template-columns:repeat(4,1fr);gap:2px">${Array.from({ length: 8 }, () =>
                    `<div style="border:1px solid var(--rule-soft);border-radius:1px"></div>`).join('')}</div>`
      }[s.kind] || '';

      return `<button class="thumb ${gi === this.i ? 'is-here' : ''}" data-jump="${s.id}">
        <div class="thumb__box">
          <span class="thumb__n">${gi + 1}</span>
          ${n ? `<span class="thumb__notes">${n}</span>` : ''}
          ${s.decision ? `<span class="thumb__decision" title="Open decision"></span>` : ''}
          <div class="thumb__strip"></div>
          <div class="thumb__mini">${mini}</div>
          <div class="thumb__foot"></div>
        </div>
        <span class="thumb__verb">${s.verb}</span>
        <span class="thumb__cap">${esc(s.label || s.intent)}</span>
      </button>`;
    },

    wireMap() {
      $$('[data-jump]').forEach(b => b.onclick = () => this.jump(b.dataset.jump));
      $$('[data-sheet]').forEach(b => b.onclick = () => this.sheet(b.dataset.sheet));
    },

    /* ----------------------------- SHEETS ---------------------------- */

    sheet(which) {
      this.closeSheet();
      const body = which === 'legend' ? this.legendSheet()
                 : which === 'decisions' ? this.decisionSheet()
                 : global.Notes.exportSheet();

      const el = document.createElement('div');
      el.innerHTML = `<div class="scrim" data-close></div>
        <aside class="sheet" role="dialog" aria-modal="true">
          <button class="sheet__close" data-close>&times;</button>${body}</aside>`;
      el.id = 'sheetwrap';
      document.body.appendChild(el);
      $$('[data-close]', el).forEach(b => b.onclick = () => this.closeSheet());
      $$('[data-jump]', el).forEach(b => b.onclick = () => { this.closeSheet(); this.jump(b.dataset.jump); });
      global.Notes.wireExport(el);
    },

    closeSheet() { const s = $('#sheetwrap'); if (s) s.remove(); },

    legendSheet() {
      return `<h2>How to read this</h2>
        <p>Every screen does one thing. The description above each screen says plainly what you will see and what you will do there, so you can respond to whether that is the right thing to be happening at that point.</p>

        <h3>Interaction</h3>
        <dl class="legend">
          ${[['Read', 'There is nothing to do on this screen. You read it and move on.'],
             ['Watch', 'Something animates on screen. You watch it and give no input.'],
             ['Explore', 'You can move around freely. There is nothing to complete and nothing is locked.'],
             ['Do', 'You produce something, and the app carries it forward to a later screen.'],
             ['Decide', 'You make a choice. Nothing you choose here is carried forward.']].map(([d, t]) =>
            `<div class="legend__row"><dt>${d}</dt><dd>${t}</dd></div>`).join('')}
        </dl>

        <h3>Colour</h3>
        <dl class="legend">
          <div class="legend__row"><dt><span class="swatch" style="background:var(--maroon)"></span></dt>
            <dd>Marks the one thing on a screen you can act on. If you see two maroon marks, the screen is doing too much.</dd></div>
          <div class="legend__row"><dt><span class="swatch" style="background:var(--pink)"></span></dt>
            <dd>Reviewer comments, and nothing else.</dd></div>
          <div class="legend__row"><dt><span class="swatch" style="background:#FBEA9B"></span></dt>
            <dd>Used once only, on the real Day 1 slide, because the yellow highlight is part of the artefact itself.</dd></div>
        </dl>

        <h3>Copy</h3>
        <p>There is no written copy anywhere. Every email, message, definition and annotation is replaced by a description of what that copy will need to say, in the column to the right of the screen. Structural lists — checklist items, agendas, folder names — are kept as they are.</p>

        <h3>Carried forward</h3>
        <p>The row at the bottom-left of every screen shows what the app is currently holding for you. It turns maroon on the screen that uses it. What you type in Day 0 really does come back in the kick-off.</p>

        <h3>Keys</h3>
        <p><span class="kbd">←</span> <span class="kbd">→</span> move &nbsp; <span class="kbd">m</span> map &nbsp;
           <span class="kbd">n</span> notes &nbsp; <span class="kbd">c</span> comment &nbsp; <span class="kbd">esc</span> close</p>`;
    },

    decisionSheet() {
      const items = SCREENS.filter(s => s.decision);
      return `<h2>Open decisions</h2>
        <p>These come from the build notes and content notes in the storyboard deck. None of them are resolved, and each one links to the screen it affects.</p>
        <div>${items.map(s => `<div class="decisions__item">
          <b>${esc(STAGES[s.stage].name)}</b>
          <p>${esc(s.decision)}</p>
          <a data-jump="${s.id}">Go to screen &rarr;</a>
        </div>`).join('')}</div>`;
    },

    /* --------------------------- SCREEN WIRING ----------------------- */

    wire() {
      $$('[data-go]').forEach(b => b.onclick = () => this.go(+b.dataset.go));
      $$('[data-jump]').forEach(b => b.onclick = () => this.jump(b.dataset.jump));
      $$('[data-sheet]').forEach(b => b.onclick = () => this.sheet(b.dataset.sheet));

      const act = $('[data-act]');
      if (act) act.onclick = () => { if (!this._act || !this._act()) this.go(1); };
      this._act = null;

      // tabbed screens (checklists)
      const tabs = $('[data-tabs]');
      if (tabs) {
        const body = this.cur().body();
        $$('[data-tab]', tabs).forEach(b => b.onclick = () => {
          $$('[data-tab]', tabs).forEach(x => x.setAttribute('aria-selected', x === b));
          $('[data-tabbody]').innerHTML = body.tabs[+b.dataset.tab].html;
        });
      }

      const fn = this.behaviour[this.cur().id];
      if (fn) fn.call(this, $('#screen'));

      global.Notes.mount();
    },

    /* per-screen behaviour. Each one is small on purpose. */
    behaviour: {

      /* pin facts into the fact pack */
      s1f3(el) {
        $$('[data-pin]', el).forEach(b => b.onclick = () => {
          if (b.dataset.done) return;
          b.dataset.done = '1';
          b.style.color = 'var(--maroon)';
          App.learner.facts = (App.learner.facts || 0) + 1;
          App.save();
          const c = $$('.carry__item', el)[3];
          if (c) { c.classList.add('held'); }
        });
      },

      /* the SCQ — typed here, returned in Stage 2 */
      s1f5(el) {
        $$('[data-scq]', el).forEach(t => {
          t.value = App.learner.scq[t.dataset.scq] || '';
          t.oninput = () => { App.learner.scq[t.dataset.scq] = t.value; App.save(); };
        });
        let pass = 0;
        const seq = [[48, 41], [71, 66], [86, 84], [93, 90]];
        App._act = () => {
          const [a, b] = seq[Math.min(pass, seq.length - 1)];
          pass++;
          setScore(el, { a, b });
          const btn = $('[data-act]');
          if (a >= 80) { btn.textContent = 'Next'; App._act = null;
            $$('.carry__item', el)[0].classList.add('held'); }
          return true;
        };
      },

      /* three SCQ cards — yours loads first, exactly as written */
      s2f2(el) {
        const mine = App.learner.scq || {};
        const has = ['S', 'C', 'Q'].some(k => (mine[k] || '').trim());
        const box = $('[data-scqcards]', el);
        const card = (title, own, vals) => `
          <div style="border:1px solid ${own ? 'var(--maroon)' : 'var(--rule)'};border-radius:3px;padding:12px;display:flex;flex-direction:column;gap:9px;min-height:0;overflow:hidden">
            <span class="s-eyebrow" style="margin:0;color:${own ? 'var(--maroon)' : 'var(--mute-2)'}">${title}</span>
            ${['S', 'C', 'Q'].map(k => `<div style="display:flex;flex-direction:column;gap:3px">
              <span style="font-size:9px;color:var(--mute-2);font-weight:700">${k}</span>
              ${vals ? `<span style="font-size:11px;line-height:1.4;color:var(--ink)">${esc(vals[k] || '—')}</span>`
                     : `<span style="display:flex;flex-direction:column;gap:3px">${W.bars([['92%', k === 'Q' ? '' : 'faint'], ['64%', 'faint']])}</span>`}
            </div>`).join('')}
          </div>`;
        box.innerHTML = card('Yours', true, has ? mine : null) + card('H', false, null) + card('T', false, null);
        if (!has) {
          box.insertAdjacentHTML('afterend',
            `<p class="s-note" style="margin:8px 0 0">Nothing has carried through, because the Day 0 exercise was skipped. If you go back and write an SCQ there, your own words load into the first card here.</p>`);
        }
      },

      /* find the undefined words */
      s2f3(el) {
        let found = 0;
        const total = $$('[data-w]', el).length;
        $$('[data-w]', el).forEach(m => m.onclick = () => {
          if (m.classList.contains('found')) return;
          m.classList.add('found');
          found++;
          const btn = $('[data-act]');
          btn.textContent = found >= total ? 'Next' : `${found} of ${total} found`;
        });
        App._act = () => found < total;
      },

      /* the claim, alone — definition offers itself after a beat */
      s2f4a(el) {
        App._act = () => {
          const d = $('[data-defn]', el);
          if (d.style.display === 'none') {
            d.style.display = 'block';
            d.style.animation = 'arrive .42s both';
            $('[data-act]').textContent = 'Next';
            return true;
          }
          return false;
        };
      },

      /* four objections, face down */
      s2f4b(el) {
        const replies = [
          'The PM answers that the team is deciding what to test first, not deciding the answer today. The alternative is starting Monday with a blank page.',
          'The Partner answers that finding out quickly is a good week’s work, and that a claim specific enough to be wrong is more useful than a summary that cannot be.',
          'The SPM answers that you know the proposal and the brief, which is roughly what everyone in the room knows today, and that rough is the expected standard on Day 1.',
          'The Partner answers that the team writes the claim down where everyone can see it and then spends four weeks trying to break it, which makes it easier to attack rather than harder.'
        ];
        $$('[data-card]', el).forEach(b => b.onclick = () => {
          $$('[data-card]', el).forEach(x => x.classList.toggle('turned', x === b));
          const i = +b.dataset.card;
          $('[data-reply]', el).innerHTML =
            `<div class="copy copy--inline"><span class="copy__tag">Reply</span>
              <span class="copy__spec">${esc(replies[i])}</span></div>`;
        });
      },

      /* the field of research topics narrows */
      s2f4c(el) {
        const field = $('[data-field]', el);
        const N = 48;
        field.innerHTML = Array.from({ length: N }, (_, k) =>
          `<div data-topic="${k}" style="height:15px;border-radius:2px;background:var(--fill-2);transition:opacity .5s,background .5s"></div>`).join('');
        const keep = new Set([3, 7, 11, 14, 19, 22, 26, 31, 35, 38, 41, 45]);
        App._act = () => {
          $$('[data-topic]', field).forEach((d, k) => {
            if (!keep.has(k)) { d.style.opacity = '.18'; }
            else { d.style.background = 'var(--maroon)'; d.style.opacity = '.8'; }
          });
          $('[data-act]').textContent = 'Next';
          App._act = null;
          return true;
        };
      },

      /* the hunch that held, and the finding nobody predicted */
      s2f4d(el) {
        const pairs = [
          ['The team guessed on Day 1 that the later stages of the value chain were under-explored.',
           'Four weeks of research found that processing, packaging, retail, consumption and waste account for about 80 per cent of fossil fuel use in food systems. The hunch held.'],
          ['This argument was not on the Day 1 slide anywhere.',
           'The published report devoted a whole section to the concentration of corporate power in food and energy systems. It came out of the interviews.']
        ];
        const draw = i => {
          $('[data-pl]', el).innerHTML = `<div class="copy copy--inline"><span class="copy__spec">${esc(pairs[i][0])}</span></div>`;
          $('[data-pr]', el).innerHTML = `<div class="copy copy--inline"><span class="copy__spec">${esc(pairs[i][1])}</span></div>`;
        };
        draw(0);
        $$('[data-p]', el).forEach(b => b.onclick = () => {
          $$('[data-p]', el).forEach(x => x.setAttribute('aria-selected', x === b));
          draw(+b.dataset.p);
        });
      },

      /* build the L2 branches — decoys teach */
      s2f5(el) {
        const bank = [
          { id: 0, ok: true,  why: 'claim · testable · in scope' },
          { id: 1, ok: false, why: 'out of scope' },
          { id: 2, ok: true,  why: 'claim · testable · in scope' },
          { id: 3, ok: false, why: 'activity, not a claim' },
          { id: 4, ok: true,  why: 'claim · testable · in scope' },
          { id: 5, ok: false, why: 'true, but tests nothing' }
        ];
        const bankEl = $('[data-bank]', el);
        const paint = () => {
          bankEl.innerHTML = bank.map(b => `
            <button class="bank__item ${App.learner.tree.indexOf(b.id) > -1 ? 'used' : ''} ${b.revealed ? 'revealed' : ''}"
              data-b="${b.id}">Candidate ${b.id + 1}<em>${b.revealed ? b.why : '—'}</em></button>`).join('');
          $$('[data-b]', bankEl).forEach(x => x.onclick = () => {
            const id = +x.dataset.b;
            if (App.learner.tree.indexOf(id) > -1) return;
            const slot = App.learner.tree.indexOf(null);
            if (slot < 0) return;
            App.learner.tree[slot] = id;
            App.save(); paint(); paintSlots();
          });
        };
        const paintSlots = () => {
          $$('[data-slot]', el).forEach((s, k) => {
            const v = App.learner.tree[k];
            s.className = 'tree__slot' + (v === null || v === undefined ? '' : ' filled');
            s.textContent = (v === null || v === undefined) ? `Branch ${k + 1}` : `Candidate ${v + 1}`;
            s.onclick = () => { App.learner.tree[k] = null; App.save(); paint(); paintSlots(); };
          });
        };
        if (!Array.isArray(App.learner.tree) || App.learner.tree.length !== 3) App.learner.tree = [null, null, null];
        paint(); paintSlots();

        let pass = 0;
        App._act = () => {
          const placed = App.learner.tree.filter(v => v !== null && v !== undefined);
          if (!placed.length) return true;
          bank.forEach(b => { if (placed.indexOf(b.id) > -1) b.revealed = true; });
          const good = placed.filter(id => bank[id].ok).length;
          const pct = Math.round((good / 3) * 100);
          setScore(el, { a: pct, b: Math.max(0, pct - 7), c: Math.min(100, pct + 4) });
          paint();
          pass++;
          if (good === 3) { $('[data-act]').textContent = 'Next'; App._act = null; }
          else { $('[data-act]').textContent = 'Check again'; }
          return true;
        };
      },

      /* preferences form — persists to Frame 7 */
      s3f2(el) {
        $('[data-prefs]', el).innerHTML = W.forms({
          groups: [
            { q: 'Working times', opts: ['Standard hours', 'Early', 'Late'], free: true },
            { q: 'Feedback preferences', opts: ['In writing first', 'Live conversation'], free: true },
            { q: 'Meeting cadence', opts: ['Daily check-in', 'Twice weekly', 'Weekly'] }
          ]
        });
        $$('label', el).forEach((l, k) => l.onclick = () => {
          const g = Math.floor(k / 3);
          App.learner.prefs['g' + g] = k;
          l.querySelector('i').style.background = 'var(--maroon)';
          l.querySelector('i').style.borderColor = 'var(--maroon)';
          App.save();
          $$('.carry__item', el)[2].classList.add('held');
        });
      },

      /* scrub the tree into the storyline */
      s3f4(el) {
        const L = $('[data-scrubL]', el), R = $('[data-scrubR]', el), s = $('[data-scrub]', el);
        const draw = v => {
          const t = v / 100;
          L.style.opacity = String(1 - t * .78);
          L.innerHTML = `<div style="display:flex;flex-direction:column;gap:7px">
            ${[0, 1, 2].map(i => `<div style="padding-left:${i === 0 ? 0 : 12}px;display:flex;flex-direction:column;gap:4px">
              ${W.bar(i === 0 ? '72%' : '56%', i === 0 ? 'strong' : '')}
              <span style="display:flex;flex-direction:column;gap:3px;padding-left:12px">${W.bars([['64%', 'faint'], ['52%', 'faint']])}</span>
            </div>`).join('')}</div>`;
          R.style.opacity = String(.22 + t * .78);
          R.innerHTML = `<div style="display:flex;flex-direction:column;gap:9px">
            ${[0, 1, 2].map(() => `<div style="display:flex;flex-direction:column;gap:4px">
              <div style="display:flex;gap:6px;align-items:center">
                <i style="width:9px;height:1.5px;background:var(--maroon);display:block"></i>${W.bar('58%', 'strong')}</div>
              ${[0, 1].map(() => `<div style="display:flex;gap:6px;align-items:center;padding-left:15px">
                <i style="width:3px;height:3px;border-radius:50%;background:var(--mute-2);display:block"></i>${W.bar('50%', 'faint')}</div>`).join('')}
            </div>`).join('')}</div>`;
        };
        draw(0);
        s.oninput = () => draw(+s.value);
        App._act = () => { if (+s.value < 90) { s.value = 100; draw(100); return true; } return false; };
      },

      /* planned against actual */
      s3f6(el) {
        const rows = [
          [['Pre-project alignment', 4, 14], ['Research sprint', 18, 30], ['Test and revise', 50, 64]],
          [['Pre-project alignment', 4, 16], ['Interviews — 24 Apr to 30 May', 18, 46], ['Test and revise', 50, 88]]
        ];
        const draw = i => {
          $('[data-timeline]', el).innerHTML = rows[i].map(([n, a, b]) => `
            <div style="display:flex;align-items:center;gap:12px">
              <span style="width:170px;flex-shrink:0;font-size:11px;color:var(--ink)">${n}</span>
              <div style="flex:1;height:14px;background:var(--fill);border-radius:2px;position:relative">
                <div style="position:absolute;left:${a}%;width:${b - a}%;top:0;bottom:0;background:${i ? 'var(--maroon)' : 'var(--fill-3)'};opacity:${i ? .75 : 1};border-radius:2px;transition:all .42s"></div>
              </div>
            </div>`).join('');
        };
        draw(0);
        $$('[data-t]', el).forEach(b => b.onclick = () => {
          $$('[data-t]', el).forEach(x => x.setAttribute('aria-selected', x === b));
          draw(+b.dataset.t);
        });
      },

      /* everyone's preferences, yours among them */
      s3f7(el) {
        const has = Object.keys(App.learner.prefs || {}).length > 0;
        $('[data-prefcards]', el).innerHTML = ['Yours', 'T', 'H', 'A2'].map((who, i) => `
          <div style="border:1px solid ${i === 0 ? 'var(--maroon)' : 'var(--rule)'};border-radius:3px;padding:11px;display:flex;flex-direction:column;gap:8px">
            <span class="s-eyebrow" style="margin:0;color:${i === 0 ? 'var(--maroon)' : 'var(--mute-2)'}">${who}</span>
            ${['Hours', 'Feedback', 'Cadence'].map(f => `<div style="display:flex;flex-direction:column;gap:2px">
              <span style="font-size:9px;color:var(--mute-2)">${f}</span>
              ${i === 0 && has ? `<span style="font-size:11px;color:var(--ink)">Your answer</span>` : W.bar('72%', 'faint')}
            </div>`).join('')}
            ${i > 0 ? `<div class="copy copy--inline" style="margin-top:2px"><span class="copy__spec" style="font-size:11px">The spoken context behind this person’s answers, which the form could not ask for.</span></div>` : ''}
          </div>`).join('');
        if (has) $$('.carry__item', el)[2].classList.add('used');
      },

      /* norms specific enough to be broken */
      s3f8(el) {
        const cats = ['Working hours and response times', 'How we give and take feedback', 'Meeting cadence and who runs what', 'Document conventions and version control'];
        $('[data-norms]', el).innerHTML = cats.map((c, i) => `
          <div style="display:flex;gap:12px;align-items:center;padding:9px 0;border-bottom:1px solid var(--rule-soft)">
            <span style="width:210px;flex-shrink:0;font-size:11px;color:var(--ink-strong)">${c}</span>
            <div style="flex:1;border:1px dashed var(--rule);border-radius:3px;height:26px"></div>
            <button class="ex__ref" data-agree="${i}" style="border-radius:3px;border-bottom:1px solid var(--rule);flex-shrink:0">Agree</button>
          </div>`).join('');
        $$('[data-agree]', el).forEach(b => b.onclick = () => {
          b.style.borderColor = 'var(--maroon)'; b.style.color = 'var(--maroon)'; b.textContent = 'Agreed';
        });
      },

      /* the four artefacts expand across the week */
      s5f1(el) {
        const cols = ['Storyline', 'Research plan', 'Fact pack', 'Hypothesis tree'];
        const run = () => {
          $('[data-week]', el).innerHTML = cols.map((c, i) => `
            <div style="border:1px solid var(--rule);border-radius:3px;padding:11px;display:flex;flex-direction:column;gap:7px;overflow:hidden">
              <span class="s-eyebrow" style="margin:0">${c}</span>
              <div data-col="${i}" style="display:flex;flex-direction:column;gap:4px;flex:1"></div>
            </div>`).join('');
          cols.forEach((_, i) => {
            const host = $(`[data-col="${i}"]`, el);
            let n = 0;
            const iv = setInterval(() => {
              n++;
              const isRed = (i === 3 && n === 4);
              const b = document.createElement('i');
              b.className = 'bar' + (isRed ? '' : ' bar--faint');
              b.style.width = (46 + ((n * 13) % 42)) + '%';
              if (isRed) { b.style.background = 'var(--maroon)'; }
              b.style.animation = 'arrive .3s both';
              host.appendChild(b);
              $$('[data-day]', el).forEach((d, k) => d.style.color = k <= n - 1 ? 'var(--ink)' : 'var(--mute-2)');
              if (n >= 5) clearInterval(iv);
            }, 460 + i * 90);
          });
        };
        run();
        const r = $('[data-replay]', el); if (r) r.onclick = run;
      },

      /* the vault */
      fin1(el) {
        const held = App.heldSet();
        const trail = `<div class="trail">
          ${[['Day 0', ['Project folder', 'Context brief', 'Fact pack', 'Your SCQ and problem statement']],
             ['Full-team kick-off', ['Problem statement', 'Hypothesis tree to L2']],
             ['Core team kick-off', ['Dot-dash storyline', 'Research plan', 'Workplan', 'Agreed norms']],
             ['PD alignment', ['Responsibilities note']]].map(([h, items]) => `
            <div class="trail__col"><h4>${h}</h4>
              ${items.map(i => `<div class="trail__item ${/your/i.test(i) ? 'yours' : ''}">${i}</div>`).join('')}</div>`).join('')}
        </div>`;

        const vault = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          ${['Process and output checklists by stage and role', 'Context brief format', 'Fact pack template',
             'SCQ and problem statement guide', 'Dot-dash storyline template', 'Research plan template',
             'Core team kick-off deck', 'PD responsibilities note template'].map(i =>
            `<div class="trail__item">${i}</div>`).join('')}</div>`;

        const went = `<div style="display:flex;flex-direction:column;gap:8px">
          ${[['Your SCQ and problem statement, and how many passes it took', held.has('scq')],
             ['Your hypothesis tree against the team’s', held.has('tree')],
             ['What you contributed to the research plan', false],
             ['Where your preferences landed against the agreed norms', held.has('prefs')]].map(([t, on]) =>
            `<div class="trail__item ${on ? 'yours' : ''}" style="display:flex;justify-content:space-between;gap:12px">
              <span>${t}</span><span style="font-size:10px;color:${on ? 'var(--maroon)' : 'var(--mute-2)'}">${on ? 'carried' : 'not captured'}</span></div>`).join('')}</div>`;

        const views = [trail, vault, went];
        const draw = i => { $('[data-vaultbody]', el).innerHTML = views[i]; };
        draw(0);
        $$('[data-v]', el).forEach(b => b.onclick = () => {
          $$('[data-v]', el).forEach(x => x.setAttribute('aria-selected', x === b));
          draw(+b.dataset.v);
        });
      }
    }
  };

  function setScore(el, vals) {
    Object.keys(vals).forEach(k => {
      const f = $(`[data-fill="${k}"]`, el), p = $(`[data-pct="${k}"]`, el);
      if (!f) return;
      f.style.width = vals[k] + '%';
      f.classList.toggle('pass', vals[k] >= 80);
      if (p) p.textContent = vals[k] + '%';
    });
  }

  global.App = App;
  document.addEventListener('DOMContentLoaded', () => { global.Notes.init(); App.init(); });

})(window);

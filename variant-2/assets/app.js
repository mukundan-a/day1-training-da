/* ============================================================================
   app.js — Variant 2. Cover, then scene-by-scene. Info scenes club several
   beats into one scannable scroll; activities and end-of-stage checklists are
   their own screens. Motion auto-plays on arrival. Comments work on any scene.
   Vanilla JS, no build. Placeholders only, never invented content.
   ========================================================================= */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const node = (h) => { const t = document.createElement('template'); t.innerHTML = h.trim(); return t.content.firstElementChild; };

  /* placeholders — never real content */
  const PH = {
    problem: '[Shared problem statement]',
    l1: "[PD's L1 hypothesis]",
    branches: ['[Branch 1]', '[Branch 2]', '[Branch 3]'],
    mine: 1,
    norms: ['Meeting cadence', 'Review and feedback', 'Response times', 'WLB'],
  };

  /* state */
  const SKEY = 'day1-v2';
  const Store = (() => {
    const def = { idx: 0, seen: 0, notes: [], scq: { s: [], c: [], q: [], problem: '' }, scqPassed: false, tree: { subclaims: [] }, treePassed: false };
    let s; try { s = Object.assign({}, def, JSON.parse(localStorage.getItem(SKEY)) || {}); } catch { s = Object.assign({}, def); }
    const save = () => { try { localStorage.setItem(SKEY, JSON.stringify(s)); } catch {} };
    return { get: () => s, set: (p) => { Object.assign(s, p); save(); }, mut: (f) => { f(s); save(); } };
  })();

  let COMMENTING = false;
  let io; // IntersectionObserver for reveal + autoplay

  /* ============================== RENDER ================================ */
  function render() {
    if (io) io.disconnect();
    const scene = SCENES[Store.get().idx];
    if (scene.stage > Store.get().seen) Store.set({ seen: scene.stage });

    document.body.innerHTML = '';
    document.body.className = COMMENTING ? 'commenting' : '';
    document.body.appendChild(node('<div class="scroll-progress" id="sp"></div>'));
    document.body.appendChild(header());
    if (scene.kind !== 'cover') document.body.appendChild(stepper(scene.stage));

    const main = node('<main></main>');
    if (scene.kind === 'cover') main.appendChild(coverView());
    else main.appendChild(sceneEl(scene));
    document.body.appendChild(main);
    document.body.appendChild(drawers());

    setupObserver();
    if (scene.kind !== 'cover') paintPins(scene);
    window.scrollTo(0, 0);
    window.onscroll = () => { const sp = $('#sp'); if (sp) { const h = document.documentElement; sp.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100 || 0) + '%'; } };
  }

  /* header */
  function header() {
    const notes = Store.get().notes.length, open = Comments.openCount();
    const h = node(`<header class="header">
      <div class="brand" data-home><span class="brand__mark notch">${ICON.notch}</span><span class="brand__t">Day 1 Craft</span><span class="brand__s">storyline mockup</span></div>
      <div class="header__sp"></div>
      <div class="tools">
        <button class="tool" data-t="docs">${ICON.doc}<span class="t">Docs</span></button>
        <button class="tool" data-t="notes">${ICON.notes}<span class="t">Notes</span>${notes ? `<span class="badge">${notes}</span>` : ''}</button>
        <button class="tool" data-t="cmts">${ICON.chat}<span class="t">Comments</span>${open ? `<span class="badge">${open}</span>` : ''}</button>
        <button class="tool" data-t="cmode" aria-pressed="${COMMENTING}">${ICON.pin}<span class="t">Comment</span></button>
      </div></header>`);
    h.querySelector('[data-home]').onclick = () => go(0);
    h.querySelector('[data-t="docs"]').onclick = () => openDrawer('docs');
    h.querySelector('[data-t="notes"]').onclick = () => openDrawer('notes');
    h.querySelector('[data-t="cmts"]').onclick = () => openDrawer('cmts');
    h.querySelector('[data-t="cmode"]').onclick = () => { COMMENTING = !COMMENTING; render(); };
    return h;
  }

  /* stepper (5 stages) */
  function stepper(current) {
    const seen = Store.get().seen;
    const el = node('<div class="stepper"></div>');
    STAGES.forEach((s, i) => {
      if (i) el.appendChild(node('<span class="step__line"></span>'));
      const state = s.n < current ? 'done' : s.n === current ? 'current' : '';
      const locked = s.n > seen;
      const b = node(`<button class="step ${state}" ${locked ? 'disabled' : ''}>
        <span class="step__dot">${s.n < current ? ICON.check : s.n + 1}</span><span class="step__nm">${esc(s.name)}</span></button>`);
      if (!locked) b.onclick = () => jump(s.n);
      el.appendChild(b);
    });
    return el;
  }

  /* ============================== COVER ================================= */
  function coverView() {
    const c = node(`<section class="cover">
      <div class="cover__notch notch notch--lg">${ICON.notch}</div>
      <div class="cover__wrap">
        <div class="cover__ey reveal">Storyline mockup</div>
        <h1 class="reveal">Day 1 Craft</h1>
        <p class="cover__sub reveal">A click-through of the training we are proposing, so the team can react to the concept before we build it.</p>
        <div class="cover__cards stagger">
          ${ocard('You', 'The analyst on a real project, the Food-Energy Nexus.')}
          ${ocard('Five stages', 'Welcome, Day 0, two kick-offs, close. About XX minutes.')}
          ${ocard('Two activities', 'Draft an SCQ, build a hypothesis branch. A coach reacts.')}
        </div>
        <div class="cover__go reveal">
          <button class="btn btn--primary" data-begin>Begin ${ICON.right}</button>
          <button class="btn btn--ghost" data-cmode>Or leave comments as you go</button>
        </div>
      </div></section>`);
    c.querySelector('[data-begin]').onclick = () => go(1);
    c.querySelector('[data-cmode]').onclick = () => { COMMENTING = true; go(1); };
    return c;
  }
  const ocard = (k, v) => `<div class="ocard"><div class="k">${esc(k)}</div><div class="v">${esc(v)}</div></div>`;

  /* ============================== SCENE ================================ */
  function sceneEl(scene) {
    const inStage = SCENES.filter(s => s.stage === scene.stage && s.kind !== 'cover');
    const pos = inStage.findIndex(s => s.id === scene.id) + 1;
    const wrap = node('<div class="scene"></div>');

    // stage cover appears on the first scene of each stage
    if (pos === 1) {
      const st = STAGES[scene.stage];
      wrap.appendChild(node(`<div class="stage-cover reveal">
        <div class="stage-cover__n">Stage ${st.n + 1} of 5</div>
        <h2>${esc(st.name)}</h2>
        <p class="stage-cover__sub">${esc(st.sub)}</p>
        <div class="stage-cover__time">${ICON.notes} ${esc(st.time)}</div></div>`));
    }

    const beat = node(`<div class="beat" data-beat="${esc(scene.id)}"></div>`);
    beat.appendChild(signpost(scene, pos, inStage.length));
    const content = node('<div class="beat__content"></div>');
    content.appendChild(node(`<div class="beat__lead reveal">${esc(scene.title)}</div>`));
    (VIEWS[scene.view] || VIEWS.stub)(scene, content);
    beat.appendChild(content);
    beat.addEventListener('click', (e) => {
      if (!COMMENTING || e.target.closest('.pin') || e.target.closest('.pop')) return;
      const r = beat.getBoundingClientRect();
      newComment(scene, beat, (e.clientX - r.left) / r.width * 100, (e.clientY - r.top) / r.height * 100);
    });
    wrap.appendChild(beat);
    wrap.appendChild(sceneNav(scene, pos, inStage.length));
    return wrap;
  }

  function signpost(scene, pos, total) {
    const tags = [scene.tag && `<span class="tag tag--type">${esc(scene.tag)}</span>`, scene.surface && `<span class="tag tag--surface">${esc(scene.surface)}</span>`].filter(Boolean).join('');
    return node(`<div class="sign reveal">
      <div class="sign__num">${esc(scene.id)} · ${pos}/${total}</div>
      <div class="sign__tags">${tags}</div>
      <p class="sign__what">${esc(scene.what || '')}</p>
      ${scene.note ? `<span class="sign__q"><b>Open</b>${esc(scene.note)}</span>` : ''}
    </div>`);
  }

  function sceneNav(scene, pos, total) {
    const st = Store.get();
    const n = node(`<div class="stagenav">
      <button class="navbtn" data-b ${st.idx <= 1 ? 'disabled' : ''}>${ICON.left} Back</button>
      <div class="stagenav__sp"></div>
      <button class="navbtn navbtn--next" data-n ${st.idx === SCENES.length - 1 ? 'disabled' : ''}>${st.idx === SCENES.length - 1 ? 'Done' : 'Next'} ${ICON.right}</button>
    </div>`);
    n.querySelector('[data-b]').onclick = () => go(st.idx - 1);
    n.querySelector('[data-n]').onclick = () => go(Math.min(st.idx + 1, SCENES.length - 1));
    return n;
  }

  function go(i) { if (i < 0 || i >= SCENES.length) return; Store.set({ idx: i }); render(); }
  function jump(stage) { const i = SCENES.findIndex(s => s.stage === stage && s.kind !== 'cover'); if (i >= 0) go(i); }
  document.addEventListener('keydown', (e) => {
    if (e.target.matches('input, textarea')) return;
    if (e.key === 'ArrowRight') go(Store.get().idx + 1);
    if (e.key === 'ArrowLeft') go(Store.get().idx - 1);
  });

  /* ============================== VIEWS ================================ */
  const VIEWS = {};
  VIEWS.stub = (s, c) => c.appendChild(node('<p class="ph">[placeholder]</p>'));

  /* 0.1 objectives */
  VIEWS.objectives = (s, c) => {
    c.appendChild(node(`<div class="grid-3 stagger">
      ${card('What this is', ['A guided walk through a real Day 1', 'Two activities you do yourself', 'Built on one live project'])}
      ${card('What this is not', ['A test or an assessment', 'A stand-in for your PDs', 'The whole craft, just Day 1'])}
      ${card('By the end', ['A draft SCQ', 'A hypothesis branch', 'How a tree becomes a workplan'], true)}
    </div>`));
  };

  /* 0.2 why + stages */
  VIEWS.why = (s, c) => {
    c.appendChild(node(`<div class="grid-3 stagger" style="margin-bottom:var(--s5)">
      ${quote('Expertise in the room')}
      ${quote('Faster, sharper research')}
      ${quote('Systems for the team')}
    </div>`));
    const rail = node('<div class="grid-3 stagger"></div>');
    STAGES.forEach(st => rail.appendChild(node(`<div class="card card--hover"><h4>${esc(st.name)}</h4><p style="font-size:13px;color:var(--grey-2);margin-top:6px">${esc(st.sub)}</p><div style="font-size:11px;color:var(--mute);margin-top:10px">${esc(st.time)}</div></div>`)));
    c.appendChild(node('<p class="why reveal" style="margin-top:var(--s5)">Come back to this anytime. Vary the pace if you run it live with the team.</p>'));
    c.appendChild(rail);
  };

  /* 1.1 setup: overview + docs + PD split */
  VIEWS.setup = (s, c) => {
    c.appendChild(node(`<div class="overview stagger" style="margin-bottom:var(--s5)">
      ${card("What you'll do", ['Read into the project', 'Keep notes as you go', 'Draft your own SCQ'])}
      ${card("What you'll have", ['A draft SCQ', 'A feel for the docs', 'Questions for the kick-off'], true)}
    </div>`));
    c.appendChild(node('<p class="why reveal">What lands in your lap before a project starts.</p>'));
    const dl = node('<div class="reveal" style="display:flex;flex-direction:column;gap:8px;margin-bottom:var(--s5)"></div>');
    ['proposal', 'brief'].forEach(id => { const d = DOCS.find(x => x.id === id); const r = docRow(d); r.onclick = () => openDoc(id); dl.appendChild(r); });
    c.appendChild(dl);
    c.appendChild(node(`<div class="overview stagger">
      ${card('PD 1 leads', ['[content review]', '[coaching]', '[hypothesis]'])}
      ${card('PD 2 leads', ['[client]', '[coaching]', '[scope]'])}
    </div>`));
    c.appendChild(node('<p class="why reveal" style="margin-top:var(--s3)">How the two PDs split the project. Most teams are not in that meeting, so we do not simulate it.</p>'));
  };

  /* 1.2 reading: proposal + brief readers */
  VIEWS.reading = (s, c) => { c.appendChild(readerEl('proposal')); c.appendChild(node('<div style="height:var(--s4)"></div>')); c.appendChild(readerEl('brief')); };

  /* 1.3 SCQ activity */
  VIEWS.scq = (s, c) => exSCQ(c);

  /* 1.4 / 2.3 / 3.3 checklist (+ optional zoom) */
  VIEWS.checklist = (s, c) => {
    if (s.payload && s.payload.zoom === 'tree') { c.appendChild(pptEl('zoom')); c.appendChild(node('<p class="why reveal" style="margin-top:var(--s3)">What a real Day 1 tree looks like. Preliminary, nothing like the polished version later.</p>')); c.appendChild(node('<div style="height:var(--s5)"></div>')); }
    c.appendChild(checklistEl(s.payload.set));
  };

  /* 2.1 into the room */
  VIEWS.intoroom = (s, c) => {
    c.appendChild(node(`<div class="grid-3 stagger" style="margin-bottom:var(--s5)">
      ${card('Why it matters', ['The thinking starts here', 'Expertise meets in one room'])}
      ${card('What to expect', ['Different PD styles', 'In person, hybrid or virtual'])}
      ${card('Get one thing right', ['Build the tree out'], true)}
    </div>`));
    const st = Store.get();
    const mine = [...st.scq.s.slice(0, 1), ...st.scq.c.slice(0, 1), ...st.scq.q.slice(0, 1)].filter(Boolean);
    c.appendChild(node('<p class="why reveal">Three SCQs, side by side. The small differences are the point.</p>'));
    c.appendChild(node(`<div class="grid-3 stagger" style="margin-bottom:var(--s5)">
      ${mine.length ? card('Yours', mine, true) : scqPlaceholder('Yours (skipped)')}
      ${scqPlaceholder('Colleague B')}
      ${scqPlaceholder('Colleague C')}
    </div>`));
    c.appendChild(node(`<div class="card card--soft reveal" style="text-align:center"><div style="font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--maroon)">Shared problem</div><div style="font-family:var(--display);font-size:18px;color:var(--grey);margin-top:8px" class="ph">${esc(PH.problem)}</div></div>`));
  };

  /* 2.2 build a branch (morph L1 auto, then exercise) */
  VIEWS.branch = (s, c) => { c.appendChild(morphEl()); c.appendChild(node('<div style="height:var(--s5)"></div>')); exTree(c); };

  /* 3.1 deck */
  VIEWS.deck = (s, c) => {
    c.appendChild(node(`<div class="overview stagger" style="margin-bottom:var(--s5)">
      ${card("What you'll do", ['See the tree become a workplan and contents', 'See how the team sets norms'])}
      ${card("What you'll have", ['A workplan with owners', 'A deliverable table of contents', 'Shared norms'], true)}
    </div>`));
    c.appendChild(node('<p class="why reveal">Run by the PM, without the PDs. The standard kick-off deck sets the team rules.</p>'));
    c.appendChild(pptEl('iko'));
  };

  /* 3.2 one object, three ways (+ norms + conclusion) */
  VIEWS.threeways = (s, c) => {
    c.appendChild(threewaysEl());
    c.appendChild(node('<div style="height:var(--s6)"></div>'));
    c.appendChild(node('<p class="why reveal">The norms a team lands on together. Named on Day 1, you can point to them in week four.</p>'));
    const g = node('<div class="norms stagger"></div>');
    PH.norms.forEach(k => g.appendChild(node(`<div class="norm"><div class="k">${esc(k)}</div><div class="v ph">[placeholder]</div></div>`)));
    c.appendChild(g);
  };

  /* 6.1 what you made + vault */
  VIEWS.made = (s, c) => {
    const st = Store.get();
    const notesN = st.notes.length, scqN = [...st.scq.s, ...st.scq.c, ...st.scq.q].filter(Boolean).length, cl = st.tree.subclaims.filter(Boolean).length;
    c.appendChild(node(`<div class="trail reveal" style="margin-bottom:var(--s5)">
      ${trow('Notes', notesN ? `${notesN} kept` : 'None', notesN)}
      ${trow('SCQ', scqN ? `${scqN} bullets` : 'Not drafted', scqN)}
      ${trow('Tree branch', cl ? `${cl} sub-claims` : 'Not built', cl)}
    </div>`));
    c.appendChild(node('<p class="why reveal">Your vault. Every template and checklist, by stage and role, downloadable.</p>'));
    c.appendChild(node(`<div class="vault stagger">
      ${vgrp('Day 0', 3)}${vgrp('Kick-off', 2)}${vgrp('Core team', 4)}${vgrp('By role', 3)}
    </div>`));
  };

  /* 6.2 where it landed + done */
  VIEWS.landed = (s, c) => {
    c.appendChild(node(`<div class="reports stagger" style="margin-bottom:var(--s5)">
      ${report('[Published report 1]')}${report('[Published report 2]')}
    </div>`));
    c.appendChild(node(`<div class="card card--soft reveal" style="text-align:center;padding:var(--s6)">
      <div style="font-family:var(--display);font-size:24px;color:var(--maroon)">You're done.</div>
      <p style="color:var(--grey-2);margin-top:8px">Everything you made stays. No score, no badge. None were promised.</p></div>`));
  };

  /* ============================ COMPONENTS ============================= */
  function card(title, items, soft) {
    return `<div class="card ${soft ? 'card--soft' : 'card--hover'}"><h4>${esc(title)}</h4><ul>${items.map(i => `<li>${esc(i)}</li>`).join('')}</ul></div>`;
  }
  const quote = (t) => `<div class="card"><h4>${esc(t)}</h4><div class="ph-chip" style="margin-top:12px;width:100%">[staff quote]</div></div>`;
  const scqPlaceholder = (label) => `<div class="card"><h4>${esc(label)}</h4><ul><li class="ph">[Situation]</li><li class="ph">[Complication]</li><li class="ph">[Question]</li></ul></div>`;
  const trow = (what, val, has) => `<div class="trow"><span class="what">${esc(what)}</span><span class="val">${esc(val)}</span><span class="stat ${has ? 'kept' : 'skip'}">${has ? 'kept' : 'skipped'}</span></div>`;
  const vgrp = (t, n) => `<div class="vgrp"><h4>${esc(t)}</h4>${Array.from({ length: n }, () => `<button>${ICON.down}<span class="ph" style="flex:1"><span class="ph-line" style="width:60%;display:inline-block;height:8px"></span></span></button>`).join('')}</div>`;
  const report = (t) => `<div><div class="report__cov">${esc(t)}</div><div class="report__t ph">${esc(t)}</div><span class="report__lk">${ICON.ext} Open</span></div>`;
  function docRow(d) { return node(`<button class="docrow"><span class="docrow__ic ${d.kind}">${d.kind.toUpperCase()}</span><span><span class="docrow__nm">${esc(d.name)}</span><span class="docrow__m">${esc(d.meta)}</span></span></button>`); }

  /* PDF reader */
  function readerEl(id) {
    const d = DOCS.find(x => x.id === id);
    const el = node(`<div class="frame reveal">
      <div class="frame__bar"><span class="frame__dots"><i></i><i></i><i></i></span><span class="frame__fn">${esc(d.name)}</span><span class="frame__meta">1 / 12</span></div>
      <div class="reader">
        <div class="reader__pages">${page(1)}${page(2)}</div>
        <div class="reader__notes"><span class="k">Notes</span>
          <textarea placeholder="Jot as you read"></textarea>
          <button class="btn btn--primary btn--sm" style="justify-content:center">Save</button>
          <div class="rlist"></div>
        </div></div></div>`);
    const list = el.querySelector('.rlist');
    const paint = () => { const ns = Store.get().notes.filter(n => n.src === d.name); list.innerHTML = ns.map(n => `<div class="mini-note">${esc(n.text)}</div>`).join(''); };
    el.querySelector('button').onclick = () => { const ta = el.querySelector('textarea'), v = ta.value.trim(); if (!v) return; Store.mut(st => st.notes.push({ text: v, ts: Date.now(), src: d.name })); ta.value = ''; paint(); refreshHeader(); };
    paint();
    return el;
  }
  function page(n) {
    const lines = Array.from({ length: 6 }, (_, i) => `<div class="ph-line ${i === 1 ? 'hl mark' : i === 3 ? 'hl' : ''}" style="width:${[100, 90, 70, 85, 60, 78][i]}%"></div>`).join('');
    return `<div class="page"><h5 class="ph">[section ${n}]</h5>${lines}</div>`;
  }

  /* PowerPoint */
  function pptEl(kind) {
    const decks = { iko: { fn: 'Kick-off deck', slides: 6, zoom: false }, zoom: { fn: 'Real Day 1 output', slides: 3, zoom: true } };
    const d = decks[kind]; let cur = d.zoom ? 1 : 0;
    const el = node(`<div class="frame reveal">
      <div class="frame__bar"><span class="frame__dots"><i></i><i></i><i></i></span><span class="frame__fn">${esc(d.fn)}</span></div>
      <div class="ppt__body"><div class="ppt__rail"></div><div class="ppt__stage"></div></div>
      <div class="ppt__nav"><button class="icon-btn" data-p="-1">${ICON.left}</button><span class="ppt__count"></span><button class="icon-btn" data-p="1">${ICON.right}</button></div>
    </div>`);
    const rail = el.querySelector('.ppt__rail'), stage = el.querySelector('.ppt__stage'), count = el.querySelector('.ppt__count');
    const draw = () => {
      rail.innerHTML = Array.from({ length: d.slides }, (_, i) => `<div class="ppt__thumb ${i === cur ? 'active' : ''}" data-i="${i}"><span>${i + 1}</span></div>`).join('');
      $$('.ppt__thumb', rail).forEach(t => t.onclick = () => { cur = +t.dataset.i; draw(); });
      const isTree = d.zoom && cur === 1;
      stage.innerHTML = `<div class="slide"><span class="slide__n notch">${ICON.notch}</span><div class="slide__k">${esc(d.fn)}</div><div class="slide__h ph">[slide ${cur + 1}]</div>${isTree ? treeMini() : `<div style="margin-top:16px;display:flex;flex-direction:column;gap:9px">${Array.from({ length: 4 }, (_, i) => `<div class="ph-line" style="width:${[90, 70, 80, 55][i]}%"></div>`).join('')}</div>`}</div>`;
      count.textContent = `${cur + 1} / ${d.slides}`;
    };
    el.querySelector('[data-p="-1"]').onclick = () => { cur = Math.max(0, cur - 1); draw(); };
    el.querySelector('[data-p="1"]').onclick = () => { cur = Math.min(d.slides - 1, cur + 1); draw(); };
    draw();
    return el;
  }
  function treeMini() {
    return `<div style="margin-top:10px;display:flex;flex-direction:column;align-items:center;gap:7px">
      <div style="background:var(--maroon);color:#fff;font-size:8px;padding:3px 10px;border-radius:3px">L1</div>
      <div style="display:flex;gap:14px">${[0, 1, 2].map(() => `<div style="display:flex;flex-direction:column;gap:3px;align-items:center"><div style="border:1px solid var(--divider);font-size:7px;padding:2px 7px;border-radius:2px">L2</div><div class="ph-line" style="width:34px;height:5px"></div><div class="ph-line" style="width:34px;height:5px"></div></div>`).join('')}</div>
      <div style="font-size:7px;color:var(--maroon);background:#FBF0B8;padding:2px 7px;border-radius:2px;margin-top:3px">working draft</div></div>`;
  }

  /* checklist */
  function checklistEl(setKey) {
    const rows = CHECKLISTS[setKey]; let role = 'All';
    const el = node('<div class="reveal"></div>');
    const filter = node('<div class="filter"><span class="k">Role</span></div>');
    ROLES.forEach(r => { const ch = node(`<button class="chip" aria-pressed="${r === role}">${r}</button>`); ch.onclick = () => { role = r; paint(); }; filter.appendChild(ch); });
    const dl = node(`<button class="chip" style="margin-left:auto" title="Download">${ICON.down}</button>`);
    filter.appendChild(dl);
    const table = node('<div class="checklist"></div>');
    const paint = () => {
      $$('.chip', filter).forEach(ch => { if (ROLES.includes(ch.textContent)) ch.setAttribute('aria-pressed', ch.textContent === role); });
      const shown = rows.filter(r => role === 'All' || r.r === role || r.r === 'All');
      table.innerHTML = `<div class="crow head"><span>Role</span><span>Type</span><span>Item</span></div>` +
        shown.map(r => `<div class="crow ${r.sim ? 'sim' : ''}"><span class="role">${r.r}</span><span class="kind">${r.k}</span><span class="item"><span class="ph-line" style="width:${Math.round(r.w * 100)}%"></span></span></div>`).join('');
    };
    el.appendChild(node('<p class="why" style="margin-bottom:var(--s3)">Everything the stage really involves, including the long tail we did not build. Tagged rows were shown here.</p>'));
    el.appendChild(filter); el.appendChild(table);
    paint();
    return el;
  }

  /* SCQ exercise */
  function exSCQ(c) {
    const key = { S: 's', C: 'c', Q: 'q' };
    const el = node(`<div class="ex reveal">
      <div>
        <span class="turn"><span class="p"></span>Your turn</span>
        <div class="scq">${['S', 'C', 'Q'].map(L => scqCell(L)).join('')}</div>
        <div class="problem"><div class="k">Problem</div><textarea id="pst" placeholder="One answerable question"></textarea></div>
        <div class="exbar"><button class="btn btn--primary" id="chk">${ICON.check} Check</button></div>
        <div id="slot"></div>
      </div>
      <div class="ex__side"><span class="k">Sources</span>
        <button class="srcbtn" data-s="proposal">${ICON.doc} Proposal</button>
        <button class="srcbtn" data-s="brief">${ICON.doc} Brief</button>
        <button class="srcbtn" data-s="notes">${ICON.notes} Notes</button>
      </div></div>`);
    const paint = () => ['S', 'C', 'Q'].forEach(L => {
      const list = el.querySelector(`.scq-list[data-k="${L}"]`), arr = Store.get().scq[key[L]];
      list.innerHTML = arr.length ? arr.map((v, i) => `<li>${esc(v)}<span class="x" data-i="${i}">×</span></li>`).join('') : '<li class="ghost">[pre-filled example]</li>';
      $$('.x', list).forEach(x => x.onclick = () => { Store.mut(st => st.scq[key[L]].splice(+x.dataset.i, 1)); paint(); });
    });
    $$('.scq-add', el).forEach(a => { const L = a.dataset.k, inp = a.querySelector('input'); const add = () => { const v = inp.value.trim(); if (!v) return; Store.mut(st => st.scq[key[L]].push(v)); inp.value = ''; paint(); }; a.querySelector('button').onclick = add; inp.onkeydown = e => e.key === 'Enter' && add(); });
    const pst = el.querySelector('#pst'); pst.value = Store.get().scq.problem || ''; pst.oninput = e => Store.set({ scq: Object.assign(Store.get().scq, { problem: e.target.value }) });
    el.querySelector('[data-s="notes"]').onclick = () => openDrawer('notes');
    el.querySelector('[data-s="proposal"]').onclick = () => openDoc('proposal');
    el.querySelector('[data-s="brief"]').onclick = () => openDoc('brief');
    let attempt = 0;
    el.querySelector('#chk').onclick = () => { attempt++; runCoach(el.querySelector('#slot'), () => Coach.reviewSCQ(Store.get().scq, attempt), p => p && Store.set({ scqPassed: true })); };
    paint();
    c.appendChild(el);
    // reveal yours-vs-real once passed
    const tail = node('<div style="margin-top:var(--s5)"></div>');
    c.appendChild(tail);
    const paintTail = () => {
      const st = Store.get(); if (!st.scqPassed) { tail.innerHTML = ''; return; }
      const yours = [...st.scq.s, ...st.scq.c, ...st.scq.q].filter(Boolean);
      tail.innerHTML = `<p class="why">Your draft, beside the real one.</p><div class="grid-2">
        ${yours.length ? card('Yours', yours.slice(0, 5), true) : scqPlaceholder('Yours')}
        <div class="card"><h4>Real SCQ</h4><div class="ph-chip" style="margin-top:12px;width:100%">[the real project SCQ]</div></div></div>`;
    };
    el.querySelector('#chk').addEventListener('click', () => setTimeout(paintTail, 800));
    paintTail();
  }
  const scqCell = (L) => `<div class="scq-cell"><div class="scq-cell__h"><span class="L">${L}</span><span class="w">${{ S: 'Situation', C: 'Complication', Q: 'Question' }[L]}</span></div><ul class="scq-list" data-k="${L}"></ul><div class="scq-add" data-k="${L}"><input placeholder="Add"><button>${ICON.plus}</button></div></div>`;

  /* tree branch exercise */
  function exTree(c) {
    const el = node(`<div class="ex reveal">
      <div>
        <span class="turn"><span class="p"></span>Your branch: ${esc(PH.branches[PH.mine])}</span>
        <p class="why" style="margin:var(--s3) 0">For this to be true, what would have to be true?</p>
        <ul class="scq-list" data-k="T" style="min-height:auto;border:1px solid var(--rule);border-radius:var(--r-sm);margin-bottom:8px"></ul>
        <div class="scq-add" data-k="T" style="padding:0"><input placeholder="Add a sub-claim" style="max-width:380px"><button>${ICON.plus}</button></div>
        <div class="exbar"><button class="btn btn--primary" id="chk">${ICON.check} Check</button></div>
        <div id="slot"></div>
      </div>
      <div class="ex__side"><span class="k">Sources</span>
        <button class="srcbtn" data-s="proposal">${ICON.doc} Proposal</button>
        <button class="srcbtn" data-s="brief">${ICON.doc} Brief</button>
        <button class="srcbtn" data-s="notes">${ICON.notes} Notes</button>
      </div></div>`);
    const list = el.querySelector('.scq-list'), inp = el.querySelector('input');
    const paint = () => { const arr = Store.get().tree.subclaims; list.innerHTML = arr.length ? arr.map((v, i) => `<li>${esc(v)}<span class="x" data-i="${i}">×</span></li>`).join('') : '<li class="ghost">[no sub-claims yet]</li>'; $$('.x', list).forEach(x => x.onclick = () => { Store.mut(st => st.tree.subclaims.splice(+x.dataset.i, 1)); paint(); }); };
    const add = () => { const v = inp.value.trim(); if (!v) return; Store.mut(st => st.tree.subclaims.push(v)); inp.value = ''; paint(); };
    el.querySelector('.scq-add button').onclick = add; inp.onkeydown = e => e.key === 'Enter' && add();
    el.querySelector('[data-s="notes"]').onclick = () => openDrawer('notes');
    el.querySelector('[data-s="proposal"]').onclick = () => openDoc('proposal');
    el.querySelector('[data-s="brief"]').onclick = () => openDoc('brief');
    let attempt = 0;
    el.querySelector('#chk').onclick = () => { attempt++; runCoach(el.querySelector('#slot'), () => Coach.reviewTree(Store.get().tree.subclaims, attempt), p => p && Store.set({ treePassed: true })); };
    paint();
    c.appendChild(el);
  }

  function runCoach(slot, review, done) {
    slot.innerHTML = `<div class="coach"><div class="coach__h"><span class="coach__av">AI</span><span class="coach__nm">Coach</span><span class="coach__fake">faked</span></div><div class="coach__b"><span class="typing"><i></i><i></i><i></i></span></div></div>`;
    setTimeout(() => { const r = review(); const b = slot.querySelector('.coach__b'); b.innerHTML = `<span class="verdict ${r.pass ? 'pass' : 'revise'}">${r.pass ? ICON.check + ' Pass' : 'Revise'}</span><div class="msg">${r.html}</div>`; done(r.pass); }, 650);
  }

  /* ======================= AUTO-PLAY ANIMATIONS ======================= */
  /* 2.2 problem morphs into L1, stubs draw in */
  function morphEl() {
    const el = node(`<div class="stagebox" data-auto="morph">
      <button class="icon-btn replay" title="Replay">${ICON.replay}</button>
      <div class="claim" data-claim><div class="k">Shared problem</div><div class="tx ph">${esc(PH.problem)}</div></div>
      <div class="stubs" data-stubs>${PH.branches.map(b => `<div class="stub ph">${esc(b)}</div>`).join('')}</div>
      <p class="defn">A hypothesis is our best answer, written before the research, specific enough that evidence could prove it wrong.</p>
    </div>`);
    const claim = el.querySelector('[data-claim]');
    const run = () => {
      claim.classList.remove('hyp'); claim.querySelector('.k').textContent = 'Shared problem'; claim.querySelector('.tx').textContent = PH.problem;
      $$('.stub', el).forEach(s => s.classList.remove('in'));
      setTimeout(() => { claim.classList.add('hyp'); claim.querySelector('.k').textContent = "PD's L1 hypothesis"; claim.querySelector('.tx').textContent = PH.l1; }, 700);
      $$('.stub', el).forEach((s, i) => setTimeout(() => s.classList.add('in'), 1400 + i * 240));
    };
    el.querySelector('.replay').onclick = run;
    el._auto = run;
    return el;
  }

  /* 3.2 tree -> workplan -> TOC, continuous */
  function threewaysEl() {
    const el = node(`<div class="stagebox" data-auto="three" style="align-items:stretch">
      <button class="icon-btn replay" title="Replay">${ICON.replay}</button>
      <div data-scene style="width:100%"></div>
    </div>`);
    const scene = el.querySelector('[data-scene]');
    const treeHTML = `<div class="tree"><div class="tree__l1 ph">${esc(PH.l1)}</div><div class="tree__b">${PH.branches.map((b, i) => `<div class="tbranch ${i === PH.mine ? 'mine' : ''}"><div class="tbranch__h ph">${esc(b)}</div><ul><li class="ghost">[sub-claim]</li></ul></div>`).join('')}</div></div>`;
    const showTree = () => { scene.innerHTML = treeHTML; };
    const run = () => {
      showTree();
      setTimeout(() => { // to workplan
        scene.innerHTML = `<div class="wp wp--plan"><div class="wp__row head"><span>Workstream</span><span>Owner</span><span>Wk 1</span></div></div>`;
        const wp = scene.querySelector('.wp');
        PH.branches.forEach((b, i) => setTimeout(() => wp.appendChild(node(`<div class="wp__row land"><span class="ph">[workstream]</span><span class="owner"><span class="av">${i === PH.mine ? 'Y' : ''}</span><span class="ph">[owner]</span></span><span class="ph">[wk]</span></div>`)), i * 380));
        setTimeout(() => $$('.owner', wp).forEach((o, i) => setTimeout(() => o.classList.add('fill'), i * 220)), PH.branches.length * 380 + 200);
      }, 1300);
      setTimeout(() => { // to TOC
        scene.innerHTML = `<div class="wp wp--toc"><div class="wp__row head"><span>§</span><span>Section</span><span>Shows</span></div></div>`;
        const wp = scene.querySelector('.wp');
        PH.branches.forEach((b, i) => setTimeout(() => wp.appendChild(node(`<div class="wp__row land"><span class="sec">${i + 1}</span><span class="ph">[section]</span><span class="ph">[what it shows]</span></div>`)), i * 380));
        setTimeout(() => scene.insertAdjacentHTML('beforeend', `<div class="closing" style="margin-top:16px">The tree, the workplan and the contents are <strong>one object, three ways</strong>.</div><div class="fold" style="margin-top:12px">${ICON.arrow} Turning the workplan into an <b>exec summary, then slides</b>, is what week one looks like.</div>`), PH.branches.length * 380 + 300);
      }, 3600);
    };
    el.querySelector('.replay').onclick = run;
    el._auto = run;
    showTree();
    return el;
  }

  /* ========================= OBSERVER (reveal + autoplay) ============== */
  function setupObserver() {
    io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        if (e.target._auto && !e.target._played) { e.target._played = true; e.target._auto(); }
        io.unobserve(e.target);
      });
    }, { threshold: 0.28 });
    $$('.reveal, .stagger').forEach(el => io.observe(el));
    $$('[data-auto]').forEach(el => io.observe(el));
  }

  /* ============================== DRAWERS ============================= */
  function drawers() { const l = node('<div><div class="scrim" id="scrim"></div><aside class="drawer" id="drawer"></aside></div>'); l.querySelector('#scrim').onclick = closeDrawer; return l; }
  function openDrawer(kind) {
    const d = $('#drawer'); d.innerHTML = kind === 'docs' ? docsDr() : kind === 'notes' ? notesDr() : cmtsDr();
    d.querySelector('[data-x]').onclick = closeDrawer;
    if (kind === 'docs') $$('[data-doc]', d).forEach(b => b.onclick = () => { closeDrawer(); openDoc(b.dataset.doc); });
    if (kind === 'notes') d.querySelector('#nadd').onclick = () => { const ta = d.querySelector('#nt'), v = ta.value.trim(); if (!v) return; Store.mut(st => st.notes.push({ text: v, ts: Date.now(), src: 'note' })); openDrawer('notes'); refreshHeader(); };
    if (kind === 'cmts') {
      d.querySelector('#rev').onchange = e => Comments.setReviewer(e.target.value.trim());
      d.querySelector('[data-e="json"]').onclick = Comments.exportJSON; d.querySelector('[data-e="csv"]').onclick = Comments.exportCSV; d.querySelector('[data-e="md"]').onclick = Comments.exportMD;
      $$('[data-go]', d).forEach(b => b.onclick = () => { const i = SCENES.findIndex(s => s.id === b.dataset.go); if (i >= 0) { closeDrawer(); go(i); } });
    }
    d.classList.add('open'); $('#scrim').classList.add('open');
  }
  function closeDrawer() { const d = $('#drawer'); if (d) d.classList.remove('open'); const s = $('#scrim'); if (s) s.classList.remove('open'); }
  function docsDr() { return `<div class="drawer__h"><h3>Docs</h3><button class="drawer__x" data-x>×</button></div><div class="drawer__b"><p class="drawer__hint">Reachable anywhere.</p>${DOCS.map(d => `<button class="docrow" data-doc="${d.id}"><span class="docrow__ic ${d.kind}">${d.kind.toUpperCase()}</span><span><span class="docrow__nm">${esc(d.name)}</span><span class="docrow__m">${esc(d.meta)}</span></span></button>`).join('')}</div>`; }
  function notesDr() { const ns = Store.get().notes; return `<div class="drawer__h"><h3>Notes</h3><button class="drawer__x" data-x>×</button></div><div class="drawer__b"><p class="drawer__hint">Notes you take reading come back in the SCQ.</p><div class="note-add"><textarea id="nt" placeholder="Write a note"></textarea><button class="btn btn--primary btn--sm" id="nadd" style="width:100%;justify-content:center;margin-top:8px">Add</button></div>${ns.length ? ns.map(n => `<div class="noteitem"><div class="tx">${esc(n.text)}</div><div class="src">${esc(n.src || 'note')}</div></div>`).join('') : '<div class="empty">No notes yet.</div>'}</div>`; }
  function cmtsDr() { const l = Comments.all(); return `<div class="drawer__h"><h3>Comments</h3><button class="drawer__x" data-x>×</button></div><div class="drawer__b"><div class="namebar">You <input id="rev" value="${esc(Comments.reviewer())}" placeholder="name"></div><div class="exports"><button class="chip" data-e="json">${ICON.down} JSON</button><button class="chip" data-e="csv">${ICON.down} CSV</button><button class="chip" data-e="md">${ICON.down} MD</button></div>${l.length ? l.map(c => `<div class="cmtitem ${c.resolved ? 'resolved' : ''}"><div class="where">${esc(c.screenId)} · ${esc(c.type)}</div><div class="tx">${esc(c.text)}</div><button class="go" data-go="${esc(c.screenId)}">Go →</button></div>`).join('') : '<div class="empty">No comments yet. Turn on Comment and click a screen.</div>'}</div>`; }

  function openDoc(id) { const map = { proposal: '1.2', brief: '1.2', iko: '3.1', pdsplit: '1.1' }; const i = SCENES.findIndex(s => s.id === map[id]); if (i >= 0) go(i); }
  function refreshHeader() { const old = $('.header'); if (old) old.replaceWith(header()); }

  /* ============================== COMMENTS ============================ */
  function paintPins(scene) {
    const beat = $('[data-beat]'); if (!beat) return;
    Comments.forScreen(scene.id).forEach((c, i) => {
      const pin = node(`<button class="pin ${c.resolved ? 'resolved' : ''}" style="left:${c.x}%;top:${c.y}%" title="${esc(c.text)}">${ICON.pin}<span class="pin__n">${i + 1}</span></button>`);
      pin.onclick = (e) => { e.stopPropagation(); openPop(scene, beat, c); };
      beat.appendChild(pin);
    });
  }
  function newComment(scene, beat, x, y) {
    closePops(); let type = Comments.TYPES[0];
    const pop = node(`<div class="pop" style="left:${x}%;top:${y}%"><div class="pop__h">New<span class="x" data-x>×</span></div><div class="pop__b"><textarea placeholder="What about this?"></textarea><div class="pop__types">${Comments.TYPES.map(t => `<button data-t="${esc(t)}" aria-pressed="${t === type}">${esc(t)}</button>`).join('')}</div><div class="pop__act"><button class="save">Save</button><button class="cancel" data-x>Cancel</button></div></div></div>`);
    $$('[data-t]', pop).forEach(b => b.onclick = () => { type = b.dataset.t; $$('[data-t]', pop).forEach(x => x.setAttribute('aria-pressed', x.dataset.t === type)); });
    $$('[data-x]', pop).forEach(b => b.onclick = closePops);
    pop.querySelector('.save').onclick = () => { const text = pop.querySelector('textarea').value.trim(); if (!text) return; Comments.add({ screenId: scene.id, screenName: scene.title, x, y, text, type }); closePops(); render(); };
    beat.appendChild(pop); pop.querySelector('textarea').focus();
  }
  function openPop(scene, beat, c) {
    closePops();
    const pop = node(`<div class="pop" style="left:${c.x}%;top:${c.y}%"><div class="pop__h">${esc(c.type)}<span class="x" data-x>×</span></div><div class="pop__b"><div class="cmt-tx">${esc(c.text)}</div><div class="cmt-mt"><span class="who">${esc(c.who)}</span> · ${new Date(c.ts).toLocaleDateString()}</div>${c.replies.map(r => `<div class="reply"><b>${esc(r.who)}:</b> ${esc(r.text)}</div>`).join('')}<input class="cmt-reply" placeholder="Reply"><div class="cmt-act"><button data-a="reply">Reply</button><button data-a="resolve">${c.resolved ? 'Reopen' : 'Resolve'}</button><button data-a="del">Delete</button></div></div></div>`);
    pop.querySelector('[data-x]').onclick = closePops;
    pop.querySelector('[data-a="reply"]').onclick = () => { const v = pop.querySelector('.cmt-reply').value.trim(); if (!v) return; Comments.reply(c.id, v); render(); };
    pop.querySelector('[data-a="resolve"]').onclick = () => { Comments.toggleResolve(c.id); render(); };
    pop.querySelector('[data-a="del"]').onclick = () => { Comments.remove(c.id); render(); };
    beat.appendChild(pop);
  }
  function closePops() { $$('.pop').forEach(p => p.remove()); }

  render();
})();

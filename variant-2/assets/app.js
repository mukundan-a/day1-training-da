/* ============================================================================
   app.js — render, navigate, animate, and the recurring shell for Variant 2.

   Load order (see index.html): data.js, coach.js, comments.js, then this.
   Everything is vanilla JS + one stylesheet, matching variant 1's no-build,
   no-dependency stack. State persists in localStorage so the SCQ, tree and
   notes carry across screens the way the README asks.
   ========================================================================= */
(() => {
  'use strict';

  /* ---- tiny DOM helpers ------------------------------------------------ */
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const node = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };

  /* ---- persistent state ------------------------------------------------ */
  const SKEY = 'day1-v2-state';
  const Store = (() => {
    const def = {
      idx: 0, maxStage: 0,
      notes: [],
      scq: { s: [], c: [], q: [], problem: '' }, scqPassed: false, scqPrefilled: false,
      tree: { branch: 'The economics work at target scale', subclaims: [] }, treePassed: false,
    };
    let s;
    try { s = Object.assign({}, def, JSON.parse(localStorage.getItem(SKEY)) || {}); }
    catch { s = Object.assign({}, def); }
    const save = () => { try { localStorage.setItem(SKEY, JSON.stringify(s)); } catch {} };
    return {
      get: () => s,
      set: (patch) => { Object.assign(s, patch); save(); },
      mutate: (fn) => { fn(s); save(); },
      reset: () => { s = JSON.parse(JSON.stringify(def)); save(); },
    };
  })();

  /* ---- shared placeholder artefacts (the "one object, three views") ---- */
  const L1 = 'The client can profitably close its energy–water gap within five years.';
  const BRANCHES = [
    'Unmet demand is large enough to matter',
    'The economics work at target scale',
    'Delivery is feasible given the constraints',
  ];
  // tree -> workplan -> TOC, kept consistent so the animations read as one object
  const STREAMS = [
    { branch: BRANCHES[0], work: 'Size the unmet demand by segment', owner: 'PM',      section: 'Demand',   shows: 'Segment-level demand and gap sizing' },
    { branch: BRANCHES[1], work: 'Model unit economics at scale',    owner: 'You',     section: 'Economics', shows: 'Unit economics, break-even, sensitivities', mine: true },
    { branch: BRANCHES[2], work: 'Map delivery constraints & partners', owner: 'Analyst', section: 'Delivery', shows: 'Constraints, partner model, roadmap' },
  ];

  /* ============================================================================
     RENDER — top bar + rail + current screen + nav
     ========================================================================= */
  function render() {
    const st = Store.get();
    const screen = SCREENS[st.idx];
    // keep maxStage in step with how far we've navigated (unlocks the rail)
    if (screen.stage > st.maxStage) Store.set({ maxStage: screen.stage });

    document.body.innerHTML = '';
    document.body.className = COMMENT_MODE ? 'commenting' : '';
    document.body.appendChild(topbar());
    const area = node('<div class="stage-area"></div>');
    area.appendChild(rail(screen.stage));
    area.appendChild(screenWrap(screen));
    area.appendChild(nav());
    document.body.appendChild(area);
    document.body.appendChild(drawersLayer());

    // draw existing comment pins once the screen box exists in the DOM
    paintPins(screen);
    window.scrollTo(0, 0);
  }

  /* ---- top bar --------------------------------------------------------- */
  function topbar() {
    const open = Comments.openCount();
    const notes = Store.get().notes.length;
    const bar = node(`
      <header class="topbar">
        <div class="brand">
          <span class="brand__notch">${ICON.notch}</span>
          <span class="brand__title">Day 1 Craft</span>
          <span class="brand__sub">storyline mockup · Variant 2</span>
        </div>
        <div class="topbar__spacer"></div>
        <div class="topbar__tools">
          <button class="tool" data-t="docs">${ICON.doc}<span class="t">Docs</span></button>
          <button class="tool" data-t="notes">${ICON.notes}<span class="t">Notes</span>${notes ? `<span class="badge">${notes}</span>` : ''}</button>
          <button class="tool" data-t="cmtlist">${ICON.chat}<span class="t">Comments</span>${open ? `<span class="badge">${open}</span>` : ''}</button>
          <button class="tool" data-t="comment" aria-pressed="${COMMENT_MODE}">${ICON.pin}<span class="t">Comment</span></button>
        </div>
      </header>`);
    bar.querySelector('[data-t="docs"]').onclick = () => openDrawer('docs');
    bar.querySelector('[data-t="notes"]').onclick = () => openDrawer('notes');
    bar.querySelector('[data-t="cmtlist"]').onclick = () => openDrawer('cmtlist');
    bar.querySelector('[data-t="comment"]').onclick = () => { COMMENT_MODE = !COMMENT_MODE; render(); };
    return bar;
  }

  /* ---- journey rail ---------------------------------------------------- */
  function rail(current) {
    const { maxStage } = Store.get();
    const r = node('<div class="rail"></div>');
    STAGES.forEach((s) => {
      const state = s.n < current ? 'done' : s.n === current ? 'current' : '';
      const locked = s.n > maxStage;
      const b = node(`
        <button class="rail__stage ${state}" ${locked ? 'disabled' : ''}>
          <div class="n">STAGE ${s.n}</div>
          <div class="nm">${esc(s.name)}</div>
          <div class="tm">${esc(s.time)}</div>
          ${s.n < current ? `<span class="check">${ICON.check}</span>` : locked ? `<span class="lock">${ICON.lock}</span>` : ''}
          ${s.n === current ? '<span class="rail__bar" style="width:100%"></span>' : ''}
        </button>`);
      if (!locked) b.onclick = () => jumpToStage(s.n);
      r.appendChild(b);
    });
    return r;
  }

  /* ---- the screen frame ------------------------------------------------ */
  function screenWrap(screen) {
    const wrap = node('<div class="screen-wrap"></div>');
    wrap.appendChild(node(`
      <div class="eyebrow">
        <span class="tag">${esc(screen.tag)}</span>
        <span class="tag tag--surface">${esc(screen.surface)}</span>
        <span class="sep">·</span>
        <span class="sid">${esc(screen.id)}</span>
      </div>`));
    wrap.appendChild(node(`<h2 class="lead">${screen.title}</h2>`));

    const box = node('<div class="screen"></div>');
    const build = VIEWS[screen.view] || VIEWS.stub;
    box.appendChild(build(screen));
    // comment mode: clicking the screen drops a pin
    box.addEventListener('click', (e) => {
      if (!COMMENT_MODE) return;
      if (e.target.closest('.pin') || e.target.closest('.popover')) return;
      const rect = box.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      openNewComment(screen, box, x, y);
    });
    wrap.appendChild(box);
    return wrap;
  }

  /* app frame shared by most screens */
  function frame(screen, innerHTML, opts = {}) {
    const inStage = SCREENS.filter(s => s.stage === screen.stage);
    const here = inStage.findIndex(s => s.id === screen.id);
    const dots = inStage.map((_, i) => `<i class="${i < here ? 'done' : i === here ? 'here' : ''}"></i>`).join('');
    return `
      <div class="app-top">
        <span class="app-top__name">${esc(opts.appName || 'Day 1 Craft training')}</span>
        <span class="app-top__prog">${dots}</span>
      </div>
      <div class="app-well ${opts.flush ? 'app-well--flush' : ''}">${innerHTML}</div>`;
  }

  /* ---- nav footer ------------------------------------------------------ */
  function nav() {
    const st = Store.get();
    const n = node(`
      <div class="nav">
        <button class="nav__btn" data-n="back" ${st.idx === 0 ? 'disabled' : ''}>${ICON.arrowL} Back</button>
        <button class="nav__btn" data-n="next" ${st.idx === SCREENS.length - 1 ? 'disabled' : ''}>Next ${ICON.arrowR}</button>
        <div class="nav__spacer"></div>
        <span class="nav__count">${st.idx + 1} / ${SCREENS.length}</span>
        <div class="nav__dots"></div>
      </div>`);
    const dots = n.querySelector('.nav__dots');
    SCREENS.forEach((s, i) => {
      const d = node(`<i class="${i === st.idx ? 'here' : i < st.idx ? 'done' : ''}" title="${esc(s.id)}"></i>`);
      d.onclick = () => go(i);
      dots.appendChild(d);
    });
    n.querySelector('[data-n="back"]').onclick = () => go(st.idx - 1);
    n.querySelector('[data-n="next"]').onclick = () => go(st.idx + 1);
    return n;
  }

  function go(i) { if (i < 0 || i >= SCREENS.length) return; Store.set({ idx: i }); render(); }
  function jumpToStage(n) { const i = SCREENS.findIndex(s => s.stage === n); if (i >= 0) go(i); }

  document.addEventListener('keydown', (e) => {
    if (e.target.matches('input, textarea')) return;
    if (e.key === 'ArrowRight') go(Store.get().idx + 1);
    if (e.key === 'ArrowLeft') go(Store.get().idx - 1);
  });

  /* ============================================================================
     VIEWS — one builder per screen kind. Each returns an element for the
     inside of .screen. Show, don't tell: structure + short labels.
     ========================================================================= */
  const VIEWS = {};
  const frag = (screen, html, opts) => node(`<div>${frame(screen, html, opts)}</div>`).firstElementChild
    ? node(`<div class="app-frame">${frame(screen, html, opts)}</div>`) : null;
  // simpler wrapper: return a fragment element holding app-top + app-well
  function appFrame(screen, html, opts) {
    const f = document.createDocumentFragment();
    const w = node(`<div style="display:contents"></div>`);
    w.innerHTML = frame(screen, html, opts);
    return w;
  }

  VIEWS.stub = (s) => appFrame(s, `<p class="ph center mt4">[Placeholder screen: ${esc(s.id)}]</p>`);

  /* --- 0.1 welcome: three panels --------------------------------------- */
  VIEWS.welcome = (s) => appFrame(s, `
    <div class="splash-hero">
      <div class="kicker">Welcome to Day 1 Craft</div>
      <h1>Get your expertise into the room from the very first day of a project.</h1>
    </div>
    <div class="grid-3 mt3">
      ${panel('What this is', ['A guided walk through a real Day 1', 'Two exercises you actually do', 'Built around one live project (FEN)'])}
      ${panel('What this is not', ['A test or an assessment', 'A substitute for your PDs', 'The full craft — just Day 1'], false)}
      ${panel('What you will be able to do', ['Draft an SCQ and problem statement', 'Build out a hypothesis tree', 'See how a tree becomes a workplan'], true)}
    </div>`);

  /* --- 0.2 why Day 1 matters, with staff quotes ------------------------ */
  VIEWS.whyday1 = (s) => appFrame(s, `
    <div class="grid-3">
      ${whyCard('Expertise in the room', 'We get our thinking in early, not after the fact.', 'Staff member A')}
      ${whyCard('Faster, more intentional research', 'We point the work at the right question from day one.', 'Staff member B')}
      ${whyCard("Systems for the team's development", 'We set up how we work before the pace picks up.', 'Staff member C')}
    </div>
    <p class="sim-note">Quotes are placeholders. Video is a nice-to-have, not needed for v1.</p>`);

  /* --- 0.3 intro to the stages ----------------------------------------- */
  VIEWS['stages-intro'] = (s) => appFrame(s, `
    ${stageCards(-1)}
    <div class="why mt4">You can come back to this overview later, and you may want to <b>vary the pace</b> if you are doing it live with the team.</div>`);

  /* --- splash screens (1.1 / 2.1 / 3.1): current unlocks --------------- */
  VIEWS.splash = (s) => appFrame(s, stageCards(s.stage), { appName: `${STAGES[s.stage].name} · unlocked` });

  /* --- overview two-panel (1.2 / 3.2) ---------------------------------- */
  VIEWS.overview = (s) => {
    const p = s.payload;
    return appFrame(s, `
      <div class="why">${p.why}</div>
      <div class="grid-2">
        ${panel(p.doLabel, p.doItems)}
        ${panel(p.haveLabel, p.haveItems, true)}
      </div>`);
  };

  /* --- 1.3 document list ------------------------------------------------ */
  VIEWS.doclist = (s) => {
    const w = appFrame(s, `
      <p class="mute" style="font-size:13.5px;margin-bottom:16px">This is what lands in your lap before the project starts. Open one to read it.</p>
      <div class="doclist" id="dl"></div>`);
    const dl = w.querySelector('#dl');
    ['proposal', 'brief'].forEach(id => {
      const d = DOCS.find(x => x.id === id);
      const row = node(`
        <button class="docrow">
          <span class="docrow__ic ${d.kind}">${d.kind.toUpperCase()}</span>
          <span><span class="docrow__nm">${esc(d.name)}</span><span class="docrow__meta">${esc(d.meta)}</span></span>
          <span class="docrow__when">${esc(d.when)}</span>
        </button>`);
      row.onclick = () => openReaderDoc(id);
      dl.appendChild(row);
    });
    return w;
  };

  /* --- 1.4 / 1.5 / 3.3 readers ----------------------------------------- */
  VIEWS.reader = (s) => readerEl(s, s.payload.doc);

  /* --- 1.6 SCQ intro ---------------------------------------------------- */
  VIEWS['scq-intro'] = (s) => appFrame(s, `
    <div class="panel panel--focal" style="max-width:640px;margin:0 auto">
      <h3><span class="dot"></span>What is an SCQ?</h3>
      <div class="grid-3 mt3" style="gap:8px">
        ${miniDef('S', 'Situation', 'The stable context the client already accepts')}
        ${miniDef('C', 'Complication', 'What changed, or what is now at stake')}
        ${miniDef('Q', 'Question', 'The question that falls out of the complication')}
      </div>
    </div>
    <div class="why mt4">Everyone drafts their <b>own rough SCQ</b> before the kick-off. This is about doing the thinking and generating questions — <b>not getting it perfect</b>.</div>
    <p class="sim-note">Points to examples from past trainings. No Teams mockup in v1 — just a clean setup for the exercise that follows.</p>`);

  /* --- 1.7 AI EXERCISE: SCQ --------------------------------------------- */
  VIEWS['ex-scq'] = (s) => exerciseSCQ(s);

  /* --- 1.8 SCQ conclusion ---------------------------------------------- */
  VIEWS['scq-conclusion'] = (s) => {
    const st = Store.get();
    const yours = [...st.scq.s, ...st.scq.c, ...st.scq.q].filter(Boolean);
    const feedback = st.scqPassed
      ? 'Your draft got to a real starting position — a question that follows from the complication.'
      : (yours.length ? 'You made a start; the coach would push you to sharpen the question before the kick-off.' : 'You skipped the exercise, so the real FEN SCQ stands in for yours.');
    return appFrame(s, `
      <div class="grid-2">
        <div class="panel">
          <h3><span class="dot"></span>Your draft SCQ</h3>
          ${yours.length ? `<ul>${yours.slice(0, 5).map(x => `<li>${esc(x)}</li>`).join('')}</ul>
            <div style="margin-top:12px;font-size:12.5px;color:var(--ink)"><b>Problem:</b> ${esc(st.scq.problem || '—')}</div>`
            : '<p class="empty">Skipped — nothing drafted.</p>'}
        </div>
        <div class="panel panel--focal">
          <h3><span class="dot"></span>The real FEN SCQ</h3>
          <p class="ph" style="margin-top:12px">[Placeholder: the actual SCQ from the FEN project, shown for comparison]</p>
          <div class="lines mt3"><i></i><i class="mid"></i><i class="short"></i></div>
        </div>
      </div>
      <div class="coach" style="margin-top:16px">
        <div class="coach__h"><span class="av">AI</span><span class="nm">Coach — read of your draft</span><span class="fake">faked for mockup</span></div>
        <div class="coach__body"><div class="msg msg--coach">${esc(feedback)}</div></div>
      </div>
      <div class="why mt4">Day 0 gets you up to speed and sets you up to <b>brainstorm with the PDs productively</b> — rather than being brought up to speed in the room.</div>`);
  };

  /* --- checklists (1.9 / 2.9 / 3.8) ------------------------------------ */
  VIEWS.checklist = (s) => checklistEl(s, s.payload.set);

  /* --- 1.10 PD split note ---------------------------------------------- */
  VIEWS.pdsplit = (s) => appFrame(s, `
    <div class="why">This replaces the old standalone PD-alignment stage. Most teams are not in that conversation, so we <b>don't simulate it</b> — we just make sure you know the split.</div>
    <div class="grid-2">
      ${panel('PD 1 leads', ['Content review and analysis', 'Coaching two of the team', 'The hypothesis and deliverable'])}
      ${panel('PD 2 leads', ['The client relationship', 'Coaching the other two', 'Scope and expectations'], true)}
    </div>
    <p class="sim-note">A simple note, reachable any time from the Docs tab.</p>`);

  /* --- 2.2 why kick-off matters ---------------------------------------- */
  VIEWS['why-kickoff'] = (s) => appFrame(s, `
    <div class="grid-3">
      ${panel('Why it matters', ['The project’s thinking actually starts here', 'Expertise meets in one room', 'Direction is set for the weeks ahead'])}
      ${panel('What to expect', ['PDs may bring different styles', 'In-person, hybrid or virtual', 'Expect XX going in, YY coming out'])}
      ${panel('The one thing to get right', ['Build the hypothesis tree out'], true)}
    </div>
    <div class="why mt4">This is also where the framing lives for <b>why we work hypothesis-led</b> — up front, rather than justified mid-flow later.</div>`);

  /* --- 2.3 SCQs side by side ------------------------------------------- */
  VIEWS['scqs-side'] = (s) => {
    const st = Store.get();
    const mine = [...st.scq.s.slice(0, 1), ...st.scq.c.slice(0, 1), ...st.scq.q.slice(0, 1)].filter(Boolean);
    const mineCard = mine.length
      ? `${panel('Your SCQ', mine, true)}`
      : `<div class="panel panel--focal"><h3><span class="dot"></span>Your SCQ</h3><p class="ph" style="margin-top:12px">[You skipped the exercise — a real FEN SCQ is shown in its place]</p></div>`;
    return appFrame(s, `
      <div class="grid-3">
        ${mineCard}
        ${panel('Colleague B', ['Situation — framed slightly wider', 'Complication — same shift', 'Question — narrower scope'])}
        ${panel('Colleague C', ['Situation — same', 'Complication — emphasises cost', 'Question — asks “how”, not “whether”'])}
      </div>
      <div class="why mt4">The <b>small differences</b> are the point — three people read the same docs and land in slightly different places. The team works from there.</div>
      <p class="sim-note">v1 shows the content plainly, without the dialogue-bubble animation. Meeting texture can be added later.</p>`);
  };

  /* --- 2.4 shared problem statement ------------------------------------ */
  VIEWS['shared-problem'] = (s) => appFrame(s, `
    <div class="panel panel--focal center" style="max-width:640px;margin:32px auto">
      <div class="label" style="color:var(--maroon)">The shared problem statement</div>
      <p style="font-family:var(--font-display);font-size:18px;color:var(--ink-strong);margin-top:12px;line-height:1.4">
        [Placeholder] How can the client close its energy–water gap in a way that is affordable, deliverable and durable?
      </p>
    </div>
    <p class="sim-note center">Three SCQs resolve into one shared problem statement. v1 is the statement itself, cleanly presented — not a simulated partner back-and-forth.</p>`);

  /* --- 2.5 ANIMATION: problem statement morphs into L1 ----------------- */
  VIEWS['morph-l1'] = (s) => morphL1(s);

  /* --- 2.6 AI EXERCISE: build an L2 branch ----------------------------- */
  VIEWS['ex-tree'] = (s) => exerciseTree(s);

  /* --- 2.7 ZOOM-OUT: real Day 1 tree ----------------------------------- */
  VIEWS['zoom-tree'] = (s) => pptEl(s, 'zoom-tree');

  /* --- 2.8 kick-off conclusion ----------------------------------------- */
  VIEWS['kickoff-conclusion'] = (s) => {
    const st = Store.get();
    const claims = st.tree.subclaims.filter(Boolean);
    const fb = st.treePassed
      ? 'Your branch held up: the sub-claims are statements, not questions, and at least one is testable.'
      : (claims.length ? 'You started the branch; the coach would push one claim to be testable before you rely on it.' : 'You skipped the exercise, so the project’s own branch stands in.');
    return appFrame(s, `
      <div class="tree" style="margin-bottom:16px">
        <div class="tree__l1">${esc(L1)}</div>
        <div class="tree__branches">
          ${BRANCHES.map((b, i) => `
            <div class="tbranch ${STREAMS[i].mine ? 'mine' : ''}">
              <div class="tbranch__h">${esc(b)}</div>
              <ul>${STREAMS[i].mine
                ? (claims.length ? claims.slice(0, 3).map(c => `<li>${esc(c)}</li>`).join('') : '<li class="stub-txt">[your branch]</li>')
                : '<li class="stub-txt">[sub-claims]</li><li class="stub-txt">[sub-claims]</li>'}</ul>
            </div>`).join('')}
        </div>
      </div>
      <div class="coach"><div class="coach__h"><span class="av">AI</span><span class="nm">Coach — read of the branch you built</span><span class="fake">faked for mockup</span></div>
        <div class="coach__body"><div class="msg msg--coach">${esc(fb)}</div></div></div>
      <div class="why mt4">You should walk away clear on <b>what the deliverable looks like</b> — some people anchor on the tree, some on the deliverable.</div>`);
  };

  /* --- 3.4 ANIMATION: tree -> owned workplan --------------------------- */
  VIEWS['anim-workplan'] = (s) => animWorkplan(s);

  /* --- 3.5 ANIMATION: workplan -> TOC ---------------------------------- */
  VIEWS['anim-toc'] = (s) => animTOC(s);

  /* --- 3.6 norms example ----------------------------------------------- */
  VIEWS.norms = (s) => appFrame(s, `
    <div class="norms">
      ${norm('Meeting cadence', 'Daily 15-min stand-up; weekly review with PDs')}
      ${norm('Review & feedback', 'Comments in the doc; verbal for anything structural')}
      ${norm('Response times', 'Within the working day; no expectation after hours')}
      ${norm('WLB commitments', 'Protected evenings; flag early if a night is needed')}
    </div>
    <div class="why mt4">Norms named on Day 1 are norms you can <b>point to in week four</b>. Norms that were never named don't exist.</div>
    <p class="sim-note">A worked example, downloadable — not a simulated round-robin. Minimizes to the Docs tab.</p>`);

  /* --- 3.7 core conclusion --------------------------------------------- */
  VIEWS['core-conclusion'] = (s) => appFrame(s, `
    <div class="grid-3">
      ${panel('A workplan with owners', ['Every branch has a home', 'The PM took some streams herself'])}
      ${panel('A deliverable TOC', ['Sections map to workstreams', 'Each section knows what it must show'])}
      ${panel('Shared norms', ['How the team works together', 'Named, so they can be pointed to'], true)}
    </div>
    <div class="why mt4">The session turned Day 1 thinking into <b>something you can start on tomorrow</b>.</div>`);

  /* --- 6.1 trail -------------------------------------------------------- */
  VIEWS.trail = (s) => {
    const st = Store.get();
    const notesN = st.notes.length;
    const scqN = [...st.scq.s, ...st.scq.c, ...st.scq.q].filter(Boolean).length;
    const claimN = st.tree.subclaims.filter(Boolean).length;
    return appFrame(s, `
      <div class="trail">
        ${trailRow('Notes you kept', notesN ? `${notesN} note${notesN > 1 ? 's' : ''} across the reading` : 'None kept', notesN)}
        ${trailRow('Your SCQ', scqN ? `${scqN} bullets + problem statement` : 'Not drafted', scqN)}
        ${trailRow('Hypothesis-tree branch', claimN ? `${claimN} sub-claim${claimN > 1 ? 's' : ''} on “${esc(st.tree.branch)}”` : 'Not built', claimN)}
      </div>
      <p class="sim-note">Everything is pulled from what you did across the stages. Anything skipped is shown as skipped, not left blank.</p>`);
  };

  /* --- 6.2 vault ------------------------------------------------------- */
  VIEWS.vault = (s) => appFrame(s, `
    <div class="vault">
      ${vaultGrp('Day 0', ['SCQ template', 'Proposal reading guide', 'Day 0 checklist'])}
      ${vaultGrp('Full-team kick-off', ['Hypothesis-tree template', 'Kick-off checklist'])}
      ${vaultGrp('Core-team kick-off', ['Workplan template', 'Deliverable TOC template', 'Norms template', 'IKO deck'])}
      ${vaultGrp('By role', ['PD checklist', 'PM checklist', 'Analyst checklist'])}
    </div>
    <p class="open-q">${ICON.info} Open question: confirm where the vault actually lives before we promise it stays available.</p>`);

  /* --- 6.3 close ------------------------------------------------------- */
  VIEWS.close = (s) => appFrame(s, `
    <div class="splash-hero" style="padding-bottom:16px">
      <div class="kicker">You’re done</div>
      <h1>Where the Day 1 thinking you spent this training inside actually landed.</h1>
    </div>
    <div class="reports">
      ${reportCard('Published FEN report — Part I')}
      ${reportCard('Published FEN report — Part II')}
    </div>
    <p class="sim-note center">Everything you made stays available. No score, no certificate, no badge — none were promised on the first screen.</p>`);

  /* ============================================================================
     COMPONENT BUILDERS
     ========================================================================= */
  function panel(title, items, focal) {
    return `<div class="panel ${focal ? 'panel--focal' : ''}">
      <h3><span class="dot"></span>${esc(title)}</h3>
      <ul>${items.map(i => `<li>${esc(i)}</li>`).join('')}</ul></div>`;
  }
  function whyCard(title, quote, who) {
    return `<div class="panel"><h3><span class="dot"></span>${esc(title)}</h3>
      <div class="quote mt3"><p>“${esc(quote)}”</p><div class="who"><b>${esc(who)}</b> · placeholder</div></div></div>`;
  }
  function miniDef(letter, name, desc) {
    return `<div style="border:1px solid var(--soft-deep);border-radius:4px;padding:10px;background:#fff">
      <div style="font-family:var(--font-display);font-size:20px;font-weight:700;color:var(--maroon)">${letter}</div>
      <div style="font-size:12px;font-weight:700;color:var(--ink-strong);margin-top:2px">${esc(name)}</div>
      <div style="font-size:11px;color:var(--mute);margin-top:4px;line-height:1.35">${esc(desc)}</div></div>`;
  }
  function norm(k, v) { return `<div class="norm"><div class="k">${esc(k)}</div><div class="v">${esc(v)}</div></div>`; }
  function trailRow(what, val, has) {
    return `<div class="trailrow"><span class="what">${esc(what)}</span><span class="val">${esc(val)}</span>
      <span class="stat ${has ? 'kept' : 'skipped'}">${has ? 'kept' : 'skipped'}</span></div>`;
  }
  function vaultGrp(title, items) {
    return `<div class="vault__grp"><h4>${esc(title)}</h4>${items.map(i => `<button>${ICON.down}${esc(i)}</button>`).join('')}</div>`;
  }
  function reportCard(t) {
    return `<div class="report"><div class="report__cover">[Placeholder cover]</div>
      <div class="report__ft"><div class="t">${esc(t)}</div><span class="lk">${ICON.ext} Open published report</span></div></div>`;
  }

  /* stage cards: highlightStage current unlocked, earlier done, later locked.
     pass -1 for the plain intro (all shown, none locked) */
  function stageCards(highlight) {
    const cards = STAGES.map(s => {
      let cls = '';
      if (highlight >= 0) cls = s.n < highlight ? 'done' : s.n === highlight ? 'unlocked' : 'locked';
      const flag = highlight >= 0 && s.n < highlight ? ICON.check : (cls === 'locked' ? ICON.lock : '');
      return `<div class="scard ${cls}">
        <div class="n">STAGE ${s.n}</div>
        <div class="nm">${esc(s.name)}</div>
        <div class="ds">${esc(s.sub)}</div>
        <div class="tm">${esc(s.time)}</div>
        ${flag ? `<span class="flag">${flag}</span>` : ''}
      </div>`;
    }).join('');
    return `<div class="stage-cards">${cards}</div>`;
  }

  /* ---- reader (PDF / PPT) --------------------------------------------- */
  function readerEl(screen, docId) {
    const doc = DOCS.find(d => d.id === docId);
    if (doc.kind === 'ppt') return pptEl(screen, docId);
    // PDF reader with highlighted passages + notes side panel
    const w = appFrame(screen, '', { flush: true, appName: `${doc.name} · reader` });
    const reader = node(`
      <div class="reader">
        <div class="reader__main">
          <div class="reader__bar"><span class="fn">${esc(doc.name)}.pdf</span>
            <span class="zoom"><b>−</b><b>+</b></span><span class="pg">1 / 12</span></div>
          <div class="reader__page-wrap">
            ${pdfPage('Executive summary', [0, 2], true)}
            ${pdfPage('Context and mandate', [1], false)}
          </div>
        </div>
        <div class="reader__side" style="padding:16px;background:var(--fill);display:flex;flex-direction:column;gap:8px">
          <div class="label">Your notes</div>
          <div class="drawer__hint" style="margin:0">Anything you jot here is kept and shows up when you draft your SCQ.</div>
          <textarea id="rnote" placeholder="Jot a note as you read…" style="width:100%;border:1px solid var(--rule);border-radius:4px;padding:8px;font-size:13px;resize:vertical;min-height:70px"></textarea>
          <button class="btn btn--primary" id="rsave" style="justify-content:center">Save note</button>
          <div id="rlist" style="display:flex;flex-direction:column;gap:6px;margin-top:6px"></div>
        </div>
      </div>`);
    const list = reader.querySelector('#rlist');
    const paint = () => {
      const notes = Store.get().notes.filter(n => n.source === doc.name);
      list.innerHTML = notes.length ? notes.map(n => `<div class="noteitem"><div class="tx">${esc(n.text)}</div></div>`).join('')
        : '<div class="empty" style="padding:12px 0">No notes yet on this doc.</div>';
    };
    reader.querySelector('#rsave').onclick = () => {
      const ta = reader.querySelector('#rnote'); const v = ta.value.trim(); if (!v) return;
      Store.mutate(st => st.notes.push({ text: v, ts: Date.now(), source: doc.name }));
      ta.value = ''; paint(); refreshBadges();
    };
    paint();
    w.appendChild(reader);
    return w;
  }
  function pdfPage(title, hlLines, mark) {
    const lines = [];
    for (let i = 0; i < 7; i++) {
      const cls = (i === 0 ? '' : i % 3 === 0 ? 'short' : 'mid');
      const hl = hlLines.includes(i) ? `hl ${mark && i === hlLines[0] ? 'mark' : ''}` : '';
      lines.push(`<i class="${cls} ${hl}"></i>`);
    }
    return `<div class="pdfpage"><h4>${esc(title)}</h4><div class="lines">${lines.join('')}</div>
      ${mark ? `<div class="pdf-note">${ICON.info} Highlighted: the passages we think matter most</div>` : ''}</div>`;
  }

  /* ---- PowerPoint frame (iko deck, zoom-out tree) --------------------- */
  function pptEl(screen, kind) {
    const decks = {
      iko: { name: 'Core-team kick-off deck', slides: ['Agenda', 'Why norms', 'Ways of working', 'Review & feedback', 'WLB', 'Next steps'], caption: '[Placeholder: the standard Dalberg IKO / norms deck]' },
      brief: { name: "PD's context brief", slides: ['Overview', 'Practice area', 'The topic', 'Client & people', 'Trends'], caption: '[Placeholder: the PD context brief]' },
      'zoom-tree': { name: 'FEN Day 1 — exec summary', slides: ['Cover', 'Hypothesis tree', 'Next steps'], caption: '[Placeholder: the real, preliminary FEN Day 1 hypothesis tree — as it was left]', zoom: true },
    };
    const d = decks[kind] || decks.iko;
    let cur = d.zoom ? 1 : 0;
    const w = appFrame(screen, '', { flush: true, appName: `${d.name} · deck` });
    const ppt = node(`<div class="ppt">
      <div class="ppt__bar"><span class="fn">${esc(d.name)}.pptx</span></div>
      <div class="ppt__body">
        <div class="ppt__rail"></div>
        <div class="ppt__stage"></div>
      </div>
      <div class="ppt__nav">
        <button class="nav__btn" data-p="prev">${ICON.arrowL}</button>
        <span class="nav__count" id="ppn"></span>
        <button class="nav__btn" data-p="next">${ICON.arrowR}</button>
      </div>
    </div>`);
    const railEl = ppt.querySelector('.ppt__rail');
    const stageEl = ppt.querySelector('.ppt__stage');
    const draw = () => {
      railEl.innerHTML = d.slides.map((t, i) =>
        `<div class="ppt__thumb ${i === cur ? 'active' : ''}" data-i="${i}"><span class="tn">${i + 1}</span></div>`).join('');
      $$('.ppt__thumb', railEl).forEach(t => t.onclick = () => { cur = +t.dataset.i; draw(); });
      const isTree = d.zoom && d.slides[cur] === 'Hypothesis tree';
      stageEl.innerHTML = `<div class="slide">
        <div class="slide__k">${esc(d.name)}</div>
        <div class="slide__h">${esc(d.slides[cur])}</div>
        ${isTree ? treeSlideSVG() : `<div class="lines" style="margin-top:16px;gap:10px"><i></i><i class="mid"></i><i class="short"></i><i class="mid"></i></div>`}
        <div style="margin-top:auto;padding-top:12px" class="ph">${esc(d.caption)}</div>
      </div>`;
      ppt.querySelector('#ppn').textContent = `${cur + 1} / ${d.slides.length}`;
    };
    ppt.querySelector('[data-p="prev"]').onclick = () => { cur = Math.max(0, cur - 1); draw(); };
    ppt.querySelector('[data-p="next"]').onclick = () => { cur = Math.min(d.slides.length - 1, cur + 1); draw(); };
    draw();
    if (kind === 'zoom-tree') w.appendChild(node(`<div style="padding:0 32px 16px"><p class="ph center">This is what the end of a real Day 1 looks like — nothing like the polished version that circulates later.</p></div>`));
    w.insertBefore(ppt, w.firstChild.nextSibling);
    return w;
  }
  function treeSlideSVG() {
    return `<div style="margin-top:12px;display:flex;flex-direction:column;align-items:center;gap:8px">
      <div style="background:var(--maroon);color:#fff;font-size:9px;padding:4px 10px;border-radius:3px">L1 claim</div>
      <div style="display:flex;gap:16px">
        ${[0, 1, 2].map(() => `<div style="display:flex;flex-direction:column;gap:4px;align-items:center">
          <div style="border:1px solid var(--rule);font-size:8px;padding:3px 8px;border-radius:2px">L2</div>
          <div style="border:1px solid var(--rule-soft);font-size:7px;padding:2px 6px;border-radius:2px;color:var(--mute)">L3</div>
          <div style="border:1px solid var(--rule-soft);font-size:7px;padding:2px 6px;border-radius:2px;color:var(--mute)">L3</div>
        </div>`).join('')}
      </div>
      <div style="font-size:8px;color:var(--gold);background:#FBF0B8;padding:2px 6px;border-radius:2px;margin-top:4px">left as a working draft</div>
    </div>`;
  }

  /* ---- checklist ------------------------------------------------------ */
  function checklistEl(screen, setKey) {
    const rows = CHECKLISTS[setKey];
    let role = 'All';
    const w = appFrame(screen, '', {});
    const well = w.querySelector('.app-well');
    const bar = node(`<div class="filterbar"><span class="lb">Filter to your role</span></div>`);
    ROLES.forEach(r => {
      const c = node(`<button class="chip" aria-pressed="${r === role}">${r}</button>`);
      c.onclick = () => { role = r; paint(); };
      bar.appendChild(c);
    });
    const dl = node(`<button class="dl" style="margin-left:auto">${ICON.down} Download checklist</button>`);
    dl.onclick = () => alert('Placeholder — the checklist would download here.');
    bar.appendChild(dl);
    const table = node('<div class="checklist"></div>');
    const paint = () => {
      $$('.chip', bar).forEach(c => c.setAttribute('aria-pressed', c.textContent === role));
      const shown = rows.filter(r => role === 'All' || r.role === role || r.role === 'All');
      table.innerHTML = `<div class="checkrow head"><span>Role</span><span>Type</span><span>Item</span></div>` +
        shown.map(r => `<div class="checkrow ${r.sim ? 'sim' : ''}">
          <span class="role">${esc(r.role)}</span><span class="kind">${esc(r.kind)}</span><span class="item">${esc(r.item)}</span></div>`).join('');
    };
    well.appendChild(node('<p class="mute" style="font-size:13px;margin-bottom:12px">Everything a real ' + esc(STAGES[screen.stage].name.toLowerCase()) + ' involves — including the long tail this training didn’t simulate. Tagged items were simulated here.</p>'));
    well.appendChild(bar); well.appendChild(table);
    if (setKey === 'day0') well.appendChild(node(`<p class="open-q">${ICON.info} Open question: will the checklist live on the Hub? Confirm before we promise it.</p>`));
    paint();
    return w;
  }

  /* ---- 1.7 SCQ exercise ----------------------------------------------- */
  function exerciseSCQ(screen) {
    const st = Store.get();
    // pre-fill one or two per S/C/Q on first arrival, to give a headstart
    if (!st.scqPrefilled) {
      Store.mutate(s => {
        if (!s.scq.s.length) s.scq.s = ['Client provides energy & water to a growing region'];
        if (!s.scq.c.length) s.scq.c = ['The gap between supply and demand is widening'];
        if (!s.scq.q.length) s.scq.q = ['Can the gap be closed affordably within five years?'];
        s.scqPrefilled = true;
      });
    }
    let attempt = 0;
    const w = appFrame(screen, '', { flush: true, appName: 'Draft your SCQ' });
    const ex = node(`<div class="ex">
      <div class="ex__main">
        <span class="turnchip"><span class="pulse"></span>Your turn</span>
        <div class="scq-grid">
          ${scqCell('S', 'Situation')}
          ${scqCell('C', 'Complication')}
          ${scqCell('Q', 'Question')}
        </div>
        <div class="problem-box"><div class="label lb">Problem statement</div>
          <textarea id="pstmt" placeholder="Write it as one answerable question…"></textarea></div>
        <div class="exbar">
          <button class="btn btn--primary" id="check">${ICON.check} Check</button>
          <button class="btn btn--ghost" id="reshow">Re-show instructions</button>
        </div>
        <div id="coachSlot"></div>
      </div>
      <div class="ex__side">
        <span class="lb">Sources — one click away</span>
        <button class="sidebtn" data-src="proposal">${ICON.doc} FEN proposal</button>
        <button class="sidebtn" data-src="brief">${ICON.doc} Context brief</button>
        <button class="sidebtn" data-src="notes">${ICON.notes} Your notes</button>
        <p class="open-q" style="margin-top:auto">${ICON.info} One SCQ or several? v1 assumes one.</p>
      </div>
    </div>`);
    const key = { S: 's', C: 'c', Q: 'q' };
    const paintCells = () => {
      ['S', 'C', 'Q'].forEach(L => {
        const list = ex.querySelector(`.scq-list[data-k="${L}"]`);
        const arr = Store.get().scq[key[L]];
        list.innerHTML = arr.map((v, i) => `<li>${esc(v)}<span class="x" data-k="${L}" data-i="${i}">×</span></li>`).join('')
          || '<li class="pre">—</li>';
        $$('.x', list).forEach(x => x.onclick = () => {
          Store.mutate(s => s.scq[key[x.dataset.k]].splice(+x.dataset.i, 1)); paintCells();
        });
      });
    };
    $$('.scq-add', ex).forEach(add => {
      const L = add.dataset.k, input = add.querySelector('input'), btn = add.querySelector('button');
      const commit = () => { const v = input.value.trim(); if (!v) return; Store.mutate(s => s.scq[key[L]].push(v)); input.value = ''; paintCells(); };
      btn.onclick = commit;
      input.onkeydown = (e) => { if (e.key === 'Enter') commit(); };
    });
    ex.querySelector('#pstmt').value = Store.get().scq.problem || '';
    ex.querySelector('#pstmt').oninput = (e) => Store.set({ scq: Object.assign(Store.get().scq, { problem: e.target.value }) });
    ex.querySelector('[data-src="notes"]').onclick = () => openDrawer('notes');
    ex.querySelector('[data-src="proposal"]').onclick = () => openReaderDoc('proposal');
    ex.querySelector('[data-src="brief"]').onclick = () => openReaderDoc('brief');
    ex.querySelector('#reshow').onclick = () => go(Store.get().idx - 1);
    ex.querySelector('#check').onclick = () => {
      attempt++;
      runCoach(ex.querySelector('#coachSlot'), () => Coach.reviewSCQ(Store.get().scq, attempt), (pass) => {
        if (pass) Store.set({ scqPassed: true });
      });
    };
    paintCells();
    w.appendChild(ex);
    return w;
  }
  function scqCell(L, name) {
    return `<div class="scq-cell">
      <div class="scq-cell__h"><span class="l">${L}</span><span class="w">${esc(name)}</span></div>
      <ul class="scq-list" data-k="${L}"></ul>
      <div class="scq-add" data-k="${L}"><input placeholder="Add a bullet…"><button>+</button></div>
    </div>`;
  }

  /* ---- 2.6 tree branch exercise --------------------------------------- */
  function exerciseTree(screen) {
    const branch = Store.get().tree.branch;
    let attempt = 0;
    const w = appFrame(screen, '', { flush: true, appName: 'Build an L2 branch' });
    const ex = node(`<div class="ex">
      <div class="ex__main">
        <div class="tree__l1" style="max-width:none;margin-bottom:10px">${esc(L1)}</div>
        <div class="tree__branches" style="grid-template-columns:1fr 1fr 1fr;margin-bottom:16px">
          ${BRANCHES.map(b => `<div class="tbranch ${b === branch ? 'mine' : ''}" style="${b === branch ? '' : 'opacity:.5'}">
            <div class="tbranch__h">${esc(b)}</div></div>`).join('')}
        </div>
        <span class="turnchip"><span class="pulse"></span>Your branch: ${esc(branch)}</span>
        <p class="mute mt3" style="font-size:13px">For this to be true, what would have to be true? Add as many sub-claims as you like.</p>
        <ul class="scq-list" data-k="T" style="min-height:auto"></ul>
        <div class="scq-add" data-k="T" style="padding:8px 0 0"><input placeholder="Add a sub-claim…" style="max-width:420px"><button>+</button></div>
        <div class="exbar">
          <button class="btn btn--primary" id="check">${ICON.check} Check</button>
        </div>
        <div id="coachSlot"></div>
      </div>
      <div class="ex__side">
        <span class="lb">Sources — one click away</span>
        <button class="sidebtn" data-src="proposal">${ICON.doc} FEN proposal</button>
        <button class="sidebtn" data-src="brief">${ICON.doc} Context brief</button>
        <button class="sidebtn" data-src="notes">${ICON.notes} Your notes</button>
        <p class="mute" style="font-size:11px;margin-top:auto">The coach checks <b>logic and testability</b>, not whether the content is right.</p>
      </div>
    </div>`);
    const list = ex.querySelector('.scq-list[data-k="T"]');
    const paint = () => {
      const arr = Store.get().tree.subclaims;
      list.innerHTML = arr.map((v, i) => `<li>${esc(v)}<span class="x" data-i="${i}">×</span></li>`).join('') || '<li class="pre">— no sub-claims yet</li>';
      $$('.x', list).forEach(x => x.onclick = () => { Store.mutate(s => s.tree.subclaims.splice(+x.dataset.i, 1)); paint(); });
    };
    const add = ex.querySelector('.scq-add'), input = add.querySelector('input');
    const commit = () => { const v = input.value.trim(); if (!v) return; Store.mutate(s => s.tree.subclaims.push(v)); input.value = ''; paint(); };
    add.querySelector('button').onclick = commit;
    input.onkeydown = (e) => { if (e.key === 'Enter') commit(); };
    ex.querySelector('[data-src="notes"]').onclick = () => openDrawer('notes');
    ex.querySelector('[data-src="proposal"]').onclick = () => openReaderDoc('proposal');
    ex.querySelector('[data-src="brief"]').onclick = () => openReaderDoc('brief');
    ex.querySelector('#check').onclick = () => {
      attempt++;
      runCoach(ex.querySelector('#coachSlot'), () => Coach.reviewTree(Store.get().tree.subclaims, branch, attempt), (pass) => {
        if (pass) Store.set({ treePassed: true });
      });
    };
    paint();
    w.appendChild(ex);
    return w;
  }

  /* coach: show typing, then the verdict + feedback */
  function runCoach(slot, review, done) {
    slot.innerHTML = `<div class="coach"><div class="coach__h"><span class="av">AI</span><span class="nm">Coach</span><span class="fake">faked for mockup</span></div>
      <div class="coach__body"><div class="typing"><i></i><i></i><i></i></div></div></div>`;
    setTimeout(() => {
      const r = review();
      const body = slot.querySelector('.coach__body');
      body.innerHTML = `<div class="verdict ${r.pass ? 'pass' : 'revise'}">${r.pass ? ICON.check + ' Pass — move on' : 'Revise'}</div>
        <div class="msg msg--coach">${r.html}</div>`;
      done(r.pass);
    }, 700);
  }

  /* ============================================================================
     ANIMATIONS — the transitions that carry teaching weight
     ========================================================================= */

  /* 2.5 problem statement -> L1 hypothesis, then branch stubs animate in */
  function morphL1(screen) {
    const w = appFrame(screen, '', { flush: true });
    const stage = node(`<div class="morph">
      <div class="morph__stage">
        <div style="width:100%">
          <div class="claim-card" id="claim">
            <div class="label lb">Shared problem statement</div>
            <div class="tx">[Placeholder] How can the client close its energy–water gap affordably, deliverably and durably?</div>
          </div>
          <div class="stubs" id="stubs">${BRANCHES.map(b => `<div class="stub">${esc(b)}</div>`).join('')}</div>
        </div>
      </div>
      <div class="morph__ctrl">
        <button class="btn btn--primary" id="play">${ICON.play} Play the morph</button>
        <span class="mute" style="font-size:12px">A hypothesis: our best answer to the question, written before the research, specific enough that evidence could prove it wrong.</span>
      </div>
    </div>`);
    const claim = stage.querySelector('#claim');
    const play = () => {
      claim.classList.remove('is-hyp'); $$('.stub', stage).forEach(s => s.classList.remove('in'));
      claim.querySelector('.lb').textContent = 'Shared problem statement';
      claim.querySelector('.tx').textContent = '[Placeholder] How can the client close its energy–water gap affordably, deliverably and durably?';
      setTimeout(() => {
        claim.classList.add('is-hyp');
        claim.querySelector('.lb').textContent = "The PD's L1 hypothesis";
        claim.querySelector('.tx').textContent = '[Placeholder] ' + L1;
      }, 500);
      $$('.stub', stage).forEach((s, i) => setTimeout(() => s.classList.add('in'), 1100 + i * 300));
    };
    stage.querySelector('#play').onclick = play;
    w.appendChild(stage);
    setTimeout(play, 300);
    return w;
  }

  /* 3.4 tree tips over into an owned workplan */
  function animWorkplan(screen) {
    const w = appFrame(screen, '', { flush: true });
    const stage = node(`<div class="morph">
      <div class="morph__stage"><div style="width:100%" id="scene"></div></div>
      <div class="morph__ctrl">
        <button class="btn btn--primary" id="play">${ICON.play} Play</button>
        <button class="btn btn--ghost" id="replay">Replay</button>
      </div>
    </div>`);
    const scene = stage.querySelector('#scene');
    const treeHTML = `<div class="tree" id="tree">
      <div class="tree__l1">${esc(L1)}</div>
      <div class="tree__branches">${STREAMS.map(s => `<div class="tbranch ${s.mine ? 'mine' : ''}">
        <div class="tbranch__h">${esc(s.branch)}</div><ul><li>${esc(s.work)}</li></ul></div>`).join('')}</div></div>`;
    const showTree = () => { scene.innerHTML = treeHTML; };
    const play = () => {
      scene.innerHTML = `<div class="wp wp--plan" id="wp">
        <div class="wp__row head"><span>Workstream (from branch)</span><span>Owner</span><span>Week 1</span></div></div>`;
      const wp = scene.querySelector('#wp');
      STREAMS.forEach((s, i) => setTimeout(() => {
        const row = node(`<div class="wp__row landing"><span>${esc(s.work)}</span>
          <span class="owner"><span class="av">${s.owner === 'You' ? 'Y' : s.owner[0]}</span>${esc(s.owner)}</span>
          <span class="mute">${esc(['W1', 'W1', 'W1'][i] || 'W1')}</span></div>`);
        wp.appendChild(row);
      }, 300 + i * 450));
      // owner column "fills in" after rows land
      setTimeout(() => $$('.owner', wp).forEach((o, i) => setTimeout(() => o.classList.add('filling'), i * 300)), 300 + STREAMS.length * 450 + 200);
      setTimeout(() => scene.insertAdjacentHTML('beforeend',
        `<div class="fold-note">${ICON.info} The PM takes some workstreams herself, alongside managing — and tries, within project constraints, to <b>match workstreams to people's development goals</b>.</div>`), 300 + STREAMS.length * 450 + 700);
    };
    stage.querySelector('#play').onclick = play;
    stage.querySelector('#replay').onclick = () => { showTree(); setTimeout(play, 500); };
    showTree();
    w.appendChild(stage);
    setTimeout(play, 400);
    return w;
  }

  /* 3.5 workplan -> deliverable TOC */
  function animTOC(screen) {
    const w = appFrame(screen, '', { flush: true });
    const stage = node(`<div class="morph">
      <div class="morph__stage"><div style="width:100%" id="scene"></div></div>
      <div class="morph__ctrl"><button class="btn btn--primary" id="play">${ICON.play} Play the conversion</button>
        <button class="btn btn--ghost" id="replay">Replay</button></div>
    </div>`);
    const scene = stage.querySelector('#scene');
    const planHTML = () => `<div class="wp wp--plan" id="wp">
      <div class="wp__row head"><span>Workstream</span><span>Owner</span><span>Week 1</span></div>
      ${STREAMS.map(s => `<div class="wp__row"><span>${esc(s.work)}</span>
        <span class="owner filling"><span class="av">${s.owner === 'You' ? 'Y' : s.owner[0]}</span>${esc(s.owner)}</span>
        <span class="mute">W1</span></div>`).join('')}</div>`;
    const showPlan = () => { scene.innerHTML = planHTML(); };
    const play = () => {
      scene.innerHTML = `<div class="wp wp--toc" id="wp">
        <div class="wp__row head"><span>§</span><span>Section (from workstream)</span><span>What it must show</span></div></div>`;
      const wp = scene.querySelector('#wp');
      STREAMS.forEach((s, i) => setTimeout(() => {
        wp.appendChild(node(`<div class="wp__row landing"><span class="sec-n">${i + 1}</span>
          <span>${esc(s.section)}</span><span class="mute">${esc(s.shows)}</span></div>`));
      }, 300 + i * 450));
      setTimeout(() => scene.insertAdjacentHTML('beforeend', `
        <div class="closing-line">The tree, the workplan and the TOC are <b>one object drawn three ways</b> — the claim argued about in the kick-off is now a section heading.</div>
        <div class="fold-note">${ICON.info} Turning the workplan into an <b>executive summary and then slides</b> is what the first week looks like.</div>`),
        300 + STREAMS.length * 450 + 300);
    };
    stage.querySelector('#play').onclick = play;
    stage.querySelector('#replay').onclick = () => { showPlan(); setTimeout(play, 500); };
    showPlan();
    w.appendChild(stage);
    setTimeout(play, 400);
    return w;
  }

  /* ============================================================================
     DRAWERS — Docs + Notes + Comments list
     ========================================================================= */
  let DRAWER = null;
  function drawersLayer() {
    const layer = node(`<div id="layer">
      <div class="scrim" id="scrim"></div>
      <aside class="drawer" id="drawer"></aside>
    </div>`);
    layer.querySelector('#scrim').onclick = closeDrawer;
    return layer;
  }
  function openDrawer(kind) {
    DRAWER = kind;
    const d = $('#drawer'), scrim = $('#scrim');
    d.innerHTML = kind === 'docs' ? docsDrawer() : kind === 'notes' ? notesDrawer() : cmtDrawer();
    wireDrawer(kind, d);
    d.classList.add('open'); scrim.classList.add('open');
  }
  function closeDrawer() { $('#drawer') && $('#drawer').classList.remove('open'); $('#scrim') && $('#scrim').classList.remove('open'); DRAWER = null; }

  function docsDrawer() {
    return `<div class="drawer__h"><h3>Docs</h3><button class="x" data-x>×</button></div>
      <div class="drawer__body">
        <div class="drawer__hint">Everything reachable from anywhere in the training.</div>
        <div class="doclist">${DOCS.map(d => `<button class="docrow" data-doc="${d.id}">
          <span class="docrow__ic ${d.kind}">${d.kind.toUpperCase()}</span>
          <span><span class="docrow__nm">${esc(d.name)}</span><span class="docrow__meta">${esc(d.meta)}</span></span>
          <span class="docrow__when">${esc(d.when)}</span></button>`).join('')}</div>
      </div>`;
  }
  function notesDrawer() {
    const notes = Store.get().notes;
    return `<div class="drawer__h"><h3>Notes</h3><button class="x" data-x>×</button></div>
      <div class="drawer__body">
        <div class="drawer__hint">Notes you take while reading resurface when you draft your SCQ.</div>
        <div class="note-add"><textarea id="ntext" placeholder="Write a note…"></textarea>
          <button class="btn btn--primary" id="nadd" style="justify-content:center;width:100%;margin-top:8px">Add note</button></div>
        <div class="note-list">${notes.length ? notes.map(n => `<div class="noteitem"><div class="tx">${esc(n.text)}</div>
          <div class="mt"><span class="src">${esc(n.source || 'note')}</span></div></div>`).join('')
          : '<div class="empty">No notes yet.</div>'}</div>
      </div>`;
  }
  function cmtDrawer() {
    const list = Comments.all();
    return `<div class="drawer__h"><h3>Comments</h3><button class="x" data-x>×</button></div>
      <div class="drawer__body">
        <div class="namebar" style="margin-bottom:12px">Your name <input id="rev" value="${esc(Comments.reviewer())}" placeholder="type once"></div>
        <div style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap">
          <button class="dl" data-exp="json">${ICON.down} JSON</button>
          <button class="dl" data-exp="csv">${ICON.down} CSV</button>
          <button class="dl" data-exp="md">${ICON.down} Markdown</button>
        </div>
        <div class="note-list">${list.length ? list.map(c => `<div class="cmtitem ${c.resolved ? 'resolved' : ''}">
          <div class="where">${esc(c.screenId)} · ${esc(c.type)}</div>
          <div class="tx">${esc(c.text)}</div>
          <button class="go" data-go="${esc(c.screenId)}">Go to screen →</button></div>`).join('')
          : '<div class="empty">No comments yet. Turn on Comment mode and click a screen.</div>'}</div>
      </div>`;
  }
  function wireDrawer(kind, d) {
    d.querySelector('[data-x]').onclick = closeDrawer;
    if (kind === 'docs') $$('[data-doc]', d).forEach(b => b.onclick = () => { closeDrawer(); openReaderDoc(b.dataset.doc); });
    if (kind === 'notes') {
      d.querySelector('#nadd').onclick = () => {
        const ta = d.querySelector('#ntext'), v = ta.value.trim(); if (!v) return;
        Store.mutate(s => s.notes.push({ text: v, ts: Date.now(), source: 'note' }));
        openDrawer('notes'); refreshBadges();
      };
    }
    if (kind === 'cmtlist') {
      d.querySelector('#rev').onchange = (e) => Comments.setReviewer(e.target.value.trim());
      d.querySelector('[data-exp="json"]').onclick = Comments.exportJSON;
      d.querySelector('[data-exp="csv"]').onclick = Comments.exportCSV;
      d.querySelector('[data-exp="md"]').onclick = Comments.exportMD;
      $$('[data-go]', d).forEach(b => b.onclick = () => {
        const i = SCREENS.findIndex(s => s.id === b.dataset.go); if (i >= 0) { closeDrawer(); go(i); }
      });
    }
  }

  /* open a doc in its reader by jumping to the matching reader screen, or a
     lightweight overlay if none exists in the flow */
  function openReaderDoc(id) {
    const map = { proposal: '1.4', brief: '1.5', iko: '3.3', pdsplit: '1.10' };
    const target = map[id];
    const i = SCREENS.findIndex(s => s.id === target);
    if (i >= 0) go(i);
  }

  function refreshBadges() {
    // cheap: re-render top bar only
    const old = $('.topbar'); if (old) old.replaceWith(topbar());
  }

  /* ============================================================================
     COMMENT PINS + POPOVERS on the current screen
     ========================================================================= */
  let COMMENT_MODE = false;

  function paintPins(screen) {
    const box = $('.screen'); if (!box) return;
    Comments.forScreen(screen.id).forEach((c, i) => {
      const pin = node(`<button class="pin ${c.resolved ? 'resolved' : ''}" style="left:${c.x}%;top:${c.y}%" title="${esc(c.text)}">
        ${ICON.pin}<span class="pin__n">${i + 1}</span></button>`);
      pin.onclick = (e) => { e.stopPropagation(); openCommentPop(screen, box, c, pin); };
      box.appendChild(pin);
    });
  }

  function openNewComment(screen, box, x, y) {
    closePops();
    let type = 'Other';
    const pop = node(`<div class="popover" style="left:${x}%;top:${y}%">
      <div class="popover__h">New comment<button class="x" data-x>×</button></div>
      <div class="popover__b">
        <textarea placeholder="What about this?"></textarea>
        <div class="popover__types">${Comments.TYPES.map(t => `<button data-t="${esc(t)}" aria-pressed="${t === type}">${esc(t)}</button>`).join('')}</div>
        <div class="popover__act"><button class="save">Save</button><button class="cancel" data-x>Cancel</button></div>
      </div>
    </div>`);
    $$('[data-t]', pop).forEach(b => b.onclick = () => { type = b.dataset.t; $$('[data-t]', pop).forEach(x => x.setAttribute('aria-pressed', x.dataset.t === type)); });
    $$('[data-x]', pop).forEach(b => b.onclick = closePops);
    pop.querySelector('.save').onclick = () => {
      const text = pop.querySelector('textarea').value.trim(); if (!text) return;
      Comments.add({ screenId: screen.id, screenName: shortName(screen), x, y, text, type });
      closePops(); render();
    };
    box.appendChild(pop);
    pop.querySelector('textarea').focus();
  }

  function openCommentPop(screen, box, c, pin) {
    closePops();
    const pop = node(`<div class="popover" style="left:${c.x}%;top:${c.y}%">
      <div class="popover__h">${esc(c.type)}<button class="x" data-x>×</button></div>
      <div class="popover__b">
        <div class="cmt-body">${esc(c.text)}</div>
        <div class="cmt-meta"><span class="who">${esc(c.who)}</span> · ${new Date(c.ts).toLocaleDateString()}</div>
        ${c.replies.map(r => `<div class="reply"><b>${esc(r.who)}:</b> ${esc(r.text)}</div>`).join('')}
        <input class="cmt-reply" placeholder="Reply…">
        <div class="cmt-actions">
          <button data-act="reply">Reply</button>
          <button data-act="resolve">${c.resolved ? 'Reopen' : 'Resolve'}</button>
          <button data-act="delete">Delete</button>
        </div>
      </div>
    </div>`);
    pop.querySelector('[data-x]').onclick = closePops;
    pop.querySelector('[data-act="reply"]').onclick = () => {
      const v = pop.querySelector('.cmt-reply').value.trim(); if (!v) return;
      Comments.reply(c.id, v); render();
    };
    pop.querySelector('[data-act="resolve"]').onclick = () => { Comments.toggleResolve(c.id); render(); };
    pop.querySelector('[data-act="delete"]').onclick = () => { Comments.remove(c.id); render(); };
    box.appendChild(pop);
  }
  function closePops() { $$('.popover').forEach(p => p.remove()); }

  function shortName(screen) { return screen.title.split('.')[0].split(',')[0].slice(0, 60); }

  /* ============================================================================
     BOOT
     ========================================================================= */
  render();
})();

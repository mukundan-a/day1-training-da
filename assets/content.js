/* ============================================================================
   content.js — the 55 screens

   VOICE
   `summary` and `beats` describe the experience: what the user gets from the
   screen and why it is there. Never the choreography. "User sees their own SCQ
   beside their colleagues' and clocks that all three differ" — not "the card
   loads first, then two others animate in".

   Choreography belongs in the quiet side tags, where it does not compete.

   COPY
   No written copy anywhere. Emails, messages, definitions and annotations are
   replaced by a description of what that copy will need to say, beside the
   screen. Structural lists are kept, compressed.

   INTERACTION
   Nothing inside the panel is clickable. Anything interactive plays as a loop.
   ========================================================================= */

(function (global) {
  'use strict';

  const W = global.WIN;

  const list = items => `<ul class="s-list">${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
  const claims = items => `<ol class="claims">${items.map((c, i) =>
    `<li><span class="n">${i + 1}</span><p>${c}</p></li>`).join('')}</ol>`;

  const objectives = (doing, able) => `<div class="s-cols" style="flex:1;min-height:0;align-content:start">
    <div class="panel" style="background:var(--soft)">
      <div class="s-eyebrow" style="color:var(--maroon);opacity:.75">In this stage you will</div>${list(doing)}</div>
    <div class="panel">
      <div class="s-eyebrow">By the end you will be able to</div>${list(able)}</div>
  </div>`;

  const tabs = (items, on) => `<div class="tabs">${items.map((t, i) =>
    `<span class="${i === on ? 'on' : ''}">${t}</span>`).join('')}</div>`;

  /* loop runner: returns a starter that yields its own cleanup */
  const anim = (total, steps) => {
    const start = el => {
      let timers = [];
      const run = () => steps.forEach(s => timers.push(setTimeout(() => { try { s.do(el); } catch (e) {} }, s.at)));
      run();
      const iv = setInterval(() => { timers.forEach(clearTimeout); timers = []; run(); }, total);
      return () => { clearInterval(iv); timers.forEach(clearTimeout); };
    };
    /* A thumbnail never runs the loop, so it would show the screen before
       anything has appeared on it. This puts it straight into the state the
       loop reaches just before it clears itself down and starts again. */
    start.settle = el => steps
      .filter(s => s.at < total * 0.9)
      .forEach(s => { try { s.do(el); } catch (e) {} });
    return start;
  };

  const $ = (sel, el) => el.querySelector(sel);
  const $$ = (sel, el) => Array.from(el.querySelectorAll(sel));
  const cls = (el, sel, c, on) => $$(sel, el).forEach((n, i) => n.classList.toggle(c, on === true || on === i));

  /* --- the five product stages, as the learner sees them ---------------- */

  /* Durations are placeholders. Nobody has timed the real thing yet, and a
     number on screen would be read as a commitment. */
  const MAP5 = [
    { n: 'Day 0',              why: 'You get set up and take on the context before the project starts', mins: 'XX min' },
    { n: 'Full-team kick-off', why: 'You build a hypothesis tree and agree on what the team is delivering', mins: 'XX min' },
    { n: 'Core team kick-off', why: 'You agree how the team will work, and who owns which claim', mins: 'XX min' },
    { n: 'PD alignment',       why: 'You see how the two Partner Directors split the project between them', mins: 'XX min' },
    { n: 'Week 1',             why: 'You see where the things you made today actually end up', mins: 'XX min' }
  ];

  function map5(at) {
    const nodes = MAP5.map((s, i) => {
      const done = i < at, here = i === at;
      return `<div class="map5__node ${done ? 'is-done' : ''} ${here ? 'is-here' : ''}">
        <span class="map5__state">${done ? 'Complete' : here ? 'Begin' : ''}</span>
        <b>${s.n}</b><span class="why">${s.why}</span><span class="mins">${s.mins}</span></div>`;
    }).join('');
    return `<div class="map5">${nodes}</div>
      <div class="map5__band">
        <div style="flex:0 0 calc(20% - 5px)">After the staffing note</div>
        <div style="flex:1">The first couple of days of the project</div>
        <div style="flex:0 0 calc(20% - 5px)">What comes after Day 1</div>
      </div>`;
  }

  const roles = r => `<table class="roles"><thead><tr><th>Role</th><th>${r.head}</th></tr></thead><tbody>
    ${r.body.map(x => `<tr><td>${x[0]}</td><td>${list(x[1])}</td></tr>`).join('')}</tbody></table>`;

  const scqCard = (who, own, qw) => `
    <div class="card ${own ? 'card--yours' : ''}" style="min-height:0;justify-content:space-between;gap:0">
      <span class="tag ${own ? 'tag--maroon' : ''}" style="margin-bottom:10px">${who}</span>
      ${[['S', 'Situation'], ['C', 'Complication'], ['Q', 'Question']].map(([k, n], i) => `
        <div style="display:flex;flex-direction:column;gap:8px;padding:14px 0;flex:1;justify-content:center;${i ? 'border-top:1px solid var(--rule-soft);' : ''}">
          <span style="font-size:8.5px;font-weight:700;letter-spacing:.09em;color:var(--mute-2)">${k} · ${n.toUpperCase()}</span>
          ${k === 'Q'
            ? `<span class="q-row" style="display:flex;flex-direction:column;gap:4px">${W.bars([[qw, 'strong'], [(parseInt(qw) - 26) + '%', 'strong']])}</span>`
            : `<span style="display:flex;flex-direction:column;gap:4px">${W.bars([['92%', 'faint'], ['74%', 'faint'], ['58%', 'faint']])}</span>`}
        </div>`).join('')}
    </div>`;

  /* ==========================================================================
     SCREENS
     ======================================================================= */

  const SCREENS = [

  /* ----------------------------- WELCOME -------------------------------- */
  {
    id: 's0a', stage: 0, kind: 'splash', verb: 'READ', action: 'Start',
    label: 'The opening screen',
    summary: 'User arrives and learns what the experience is, what it will leave them able to do, roughly how long it takes, and that nothing here is assessed.',
    beats: [
      'Sets the frame before anything is asked of them.',
      'Makes clear this is a benchmark to observe, not an exercise to pass.',
      'The objectives are the whole training’s, so the promise is visible before the commitment.',
      'Says it can be left and picked up again, so nobody feels locked in.'
    ],
    notes: [
      ['Copy', 'Welcome text: what the experience is, roughly how long, and that it is resumable.'],
      ['Note', 'The six objectives are the stage-level ones rolled up. Each stage restates its own on its intro screen.']
    ],
    body: () => `
      <div class="stack">
        <div><h1 class="s-display">Day 1</h1></div>
        <div class="s-cols" style="align-content:start">
          <div class="panel">
            <div class="s-eyebrow">What this is</div>
            ${list(['An annotated view of what happens, not an exercise',
                    'One successful instance, as a benchmark',
                    'Not assessed, and returnable at any time'])}</div>
          <div class="panel">
            <div class="s-eyebrow">What this is not</div>
            ${list(['Not a rulebook — projects vary',
                    'Not a substitute for the Craft document',
                    'Not the only training you will get'])}</div>
        </div>
        <div class="focus" style="flex:1;min-height:0;justify-content:center">
          <div class="s-eyebrow">By the end you will be able to</div>
          <ul class="s-list s-list--split">${
            ['Say what is expected of you before Day 1 starts',
             'Turn a hypothesis tree into a dot-dash storyline and a research plan',
             'Write an SCQ and a problem statement from a proposal and a brief',
             'Recognise what a finished Day 1 output actually looks like',
             'Explain what a hypothesis is, and drill a claim into what would have to be true',
             'Say who to go to for what, and where today’s outputs end up in week one'
            ].map(i => `<li>${i}</li>`).join('')}</ul>
        </div>
      </div>`
  },

  {
    id: 's0b', stage: 0, kind: 'argument', verb: 'READ', action: 'Next',
    label: 'Why the first day matters',
    summary: 'User is given four reasons why the first day of a project matters more than any other.',
    beats: [
      'Four reasons, each one a claim they could argue with.',
      'Establishes that the first day shapes the ten weeks after it.'
    ],
    notes: [
      ['Note', 'Day 1 does not have to be a single day. It can spread across several. However it runs, this is the start the learner should expect to get.']
    ],
    body: () => `
      <div class="stack">
        <h2 class="s-h1">Day 1 is the highest-leverage day of the project</h2>
        <div style="flex:1;min-height:0">${claims([
          'It sets the tone. How the first day runs shapes how the next ten weeks run.',
          'It brings the firm’s expertise into the room early, and gives you access to it.',
          'It makes the team faster, because a hypothesis tells you what to test and what to ignore.',
          'It gives everyone the same start, whatever the project and whoever the team.'
        ])}</div>
      </div>`
  },

  {
    id: 's0c', stage: 0, kind: 'map', verb: 'READ', action: 'Begin',
    label: 'A map of the five stages',
    summary: 'User sees the whole shape of what is ahead — five stages and how long each takes — so they can judge the commitment before starting.',
    beats: ['Nothing is open yet; this is orientation only.',
            'The same map reappears between stages so progress stays visible.'],
    body: () => `<div class="stack"><div class="maphead"><h2 class="s-h1">Welcome to the Day 1 training. You will go through five stages, and together they should take you about XX minutes.</h2>
      <p class="s-cap" style="margin:0">Day 0 happens in your own time before the project starts. The four stages after it are the first couple of days of the project itself.</p></div>${map5(-1)}</div>`
  },

  /* ------------------------------- DAY 0 -------------------------------- */
  {
    id: 's1map', stage: 1, kind: 'map', verb: 'READ', action: 'Begin',
    label: 'Day 0 opens',
    summary: 'User sees the first stage unlock and the remaining four still closed, so progress through the whole experience stays legible.',
    beats: ['A version of this screen sits between every stage.'],
    body: () => `<div class="stack"><div class="maphead"><h2 class="s-h1">Day 0 is now open to you. The four stages after it stay closed until you reach them.</h2></div>${map5(0)}</div>`
  },

  {
    id: 's1intro', stage: 1, kind: 'intro', verb: 'READ', action: 'Begin',
    label: 'What Day 0 covers',
    summary: 'User learns that Day 0 is everything between being staffed and walking in prepared, and what they will personally have to produce.',
    beats: [
      'Sets the expectation of a set amount of work spread over a few days, with the figure still to be filled in.',
      'Names the outputs they own before the kick-off: an SCQ and a problem statement.'
    ],
    notes: [
      ['Copy', 'A line saying Day 0 happens in the learner’s own time across a few days, and adds up to about XX minutes of real work. The real figure goes in once someone has timed it.']
    ],
    body: () => `
      <div class="stack">
        <div><h2 class="s-h1">Day 0</h2><p class="s-cap" style="margin:0">Everything that happens between being staffed on the project and walking into the kick-off prepared. It runs in your own time across a few days, and adds up to about XX minutes of real work.</p></div>
        ${objectives(
          ['Get staffed, and read what came before you',
           'Explore how a project folder is set up',
           'Read the context brief and pin facts to the fact pack',
           'Draft your own SCQ and problem statement'],
          ['Say what is expected of you before Day 1 starts',
           'Write an SCQ from a proposal and a context brief',
           'Explain why everyone drafts their own version separately'])}
      </div>`
  },

  {
    app: 'outlook',
    id: 's1f1', stage: 1, kind: 'sim', verb: 'READ', action: 'Next',
    label: 'The staffing note arrives',
    summary: 'User sees the staffing note and a follow-up from the PM arrive. The only thing asked of them is to skim the proposal.',
    beats: [
      'The staffing note is the entire brief at this point — project, client, dates, team.',
      'A second email from the PM takes the setup work off the team.',
      'Nothing heavy is demanded, which is the reassurance a new joiner needs.'
    ],
    notes: [
      ['Email 1', 'The staffing note. Names the project, the client, the start and end dates and who else is on the team, with the proposal attached.'],
      ['Email 2', 'From the PM. Welcomes the team and names one action — scan the proposal. She takes the setup onto herself.'],
      ['Beat', 'The staffing note is open on arrival. The PM’s email drops in below it a few seconds later.']
    ],
    anim: anim(5200, [
      { at: 200,  do: el => cls(el, '.ol-msg', 'is-live', 0) },
      { at: 1600, do: el => { const r = $$('.ol-msg', el)[1]; if (r) { r.style.animation = 'none'; void r.offsetWidth; r.style.animation = 'arrive .42s both'; } } },
      { at: 3000, do: el => cls(el, '.ol-msg', 'is-live', 1) },
      { at: 4600, do: el => cls(el, '.ol-msg', 'is-live', false) }
    ]),
    body: () => W.outlook({
      rows: [
        { from: '58%', subject: '86%', preview: '92%', attach: true },
        { from: '44%', subject: '64%', preview: '78%' },
        { from: '38%', subject: '72%', preview: '58%' }
      ],
      attach: true
    })
  },

  {
    app: 'sharepoint',
    id: 's1f2', stage: 1, kind: 'sim', verb: 'EXPLORE', action: 'Next',
    label: 'The project folder',
    summary: 'Having read the staffing note, user opens the project folder and can look around any part of it.',
    beats: [
      'Every folder is open — this is about recognition, not hunting for something.',
      'Two folders are drawn out because the next two screens happen in them.'
    ],
    notes: [
      ['Teams', 'A message from the PM confirming she has set the folder up, and inviting anyone to add what is missing.'],
      ['Beat', 'The two folders that matter take the highlight in turn, gently.'],
      ['Note', 'When the learner is staffed for real, this structure should already look familiar rather than being one more new thing to work out.']
    ],
    anim: anim(6000, [
      { at: 400,  do: el => cls(el, '.sp-node', 'is-flagged', 3) },
      { at: 2200, do: el => cls(el, '.sp-node', 'is-flagged', 6) },
      { at: 4000, do: el => $$('.sp-node', el).forEach((n, i) => n.classList.toggle('is-flagged', i === 3 || i === 6)) }
    ]),
    body: () => W.sharepoint({
      tree: [
        { n: '3. YYMM Project Name' },
        { n: 'Admin', d: 1 },
        { n: 'Past project quals', d: 1 },
        { n: 'Context briefs and fact pack', d: 1, flag: true, open: true },
        { n: 'Context brief', d: 2 },
        { n: 'Fact pack', d: 2 },
        { n: 'Files received from proposal team', d: 1, flag: true },
        { n: 'Files received from client', d: 1 },
        { n: 'Deliverables', d: 1 },
        { n: 'Workspaces', d: 1 }
      ]
    })
  },

  {
    app: 'ppt',
    id: 's1f2b', stage: 1, kind: 'sim', verb: 'WATCH', action: 'Next',
    label: 'The documents get skimmed',
    summary: 'Acting on the PM’s one ask, user watches the proposal and a past qual deck being skimmed rather than studied.',
    beats: ['Models the pace: fast, and looking for what already exists.'],
    notes: [
      ['Beat', 'Two documents open and scroll past quickly, over a few seconds.'],
      ['Note', 'The previous screen told the learner to read the proposal. This one shows it being read, because showing the pace works better than describing it.']
    ],
    anim: anim(4000, [
      { at: 0,    do: el => { const s = $('.pp-scan', el); if (s) s.style.transform = 'translateY(0)'; } },
      { at: 300,  do: el => { const s = $('.pp-scan', el); if (s) s.style.transform = 'translateY(-46%)'; } },
      { at: 1900, do: el => { const s = $('.pp-scan', el); if (s) s.style.transform = 'translateY(-8%)'; } },
      { at: 2600, do: el => { const s = $('.pp-scan', el); if (s) s.style.transform = 'translateY(-52%)'; } }
    ]),
    body: () => W.powerpoint({
      thumbs: 11, at: 2, notes: false,
      slide: `<div style="overflow:hidden;height:100%">
        <div class="pp-scan" style="display:flex;flex-direction:column;gap:7px;transition:transform 1.4s cubic-bezier(.4,0,.2,1)">
          ${W.bar('58%', 'strong')}${W.bars(['94%','90%','86%','92%','74%','88%','66%','91%','83%','77%','95%','69%'])}
        </div></div>`
    })
  },

  {
    app: 'ppt',
    id: 's1f3', stage: 1, kind: 'sim', verb: 'DO', action: 'Next',
    label: 'Pinning facts from the brief',
    summary: 'A day or two before the kick-off the Partner posts a context brief. User reads it and pins facts into the team’s shared fact pack.',
    beats: [
      'The brief lands before the meeting, so senior input is already in play.',
      'Its third section, key tensions, is the part a proposal never contains.',
      'Anything pinned is carried forward and visible to everyone.'
    ],
    carry: { write: ['facts'] },
    notes: [
      ['Teams', 'A message from the Partner posting the brief, listing its three parts: sector and project context, client notes, and key tensions.'],
      ['Callout', 'A note explaining Partners generate these briefs from a standard skill, and that the learner will get one.'],
      ['Beat', 'A pin control sits beside each fact and lights as it is pinned.']
    ],
    anim: anim(5400, [
      { at: 600,  do: el => cls(el, '.pinrow', 'on', 0) },
      { at: 2000, do: el => cls(el, '.pinrow', 'on', 1) },
      { at: 3400, do: el => cls(el, '.pinrow', 'on', 2) },
      { at: 4800, do: el => cls(el, '.pinrow', 'on', false) }
    ]),
    body: () => W.powerpoint({
      thumbs: 9, at: 2, notes: false,
      slide: `<div style="display:flex;flex-direction:column;gap:9px;height:100%;justify-content:center">
        ${['Sector and project context', 'Client notes', 'Key tensions'].map((s, i) => `
          <div class="pinrow" style="display:flex;flex-direction:column;gap:5px;padding:6px 8px;border-radius:2px;transition:background .3s">
            <span style="font-size:9px;font-weight:700;color:${i === 2 ? 'var(--maroon)' : 'var(--mute-2)'}">${s}</span>
            <div style="display:flex;gap:8px;align-items:center">
              <span style="flex:1;display:flex;flex-direction:column;gap:4px">${W.bars([['92%', 'faint'], ['78%', 'faint']])}</span>
              <span class="pinbtn" style="flex-shrink:0;color:var(--mute-2);display:flex">${W.glyph('pin')}</span>
            </div>
          </div>`).join('')}
      </div>
      <style>.pinrow.on{background:var(--soft)}.pinrow.on .pinbtn{color:var(--maroon)}</style>`
    })
  },

  {
    app: 'ppt',
    id: 's1f4', stage: 1, kind: 'sim', verb: 'DECIDE', action: 'Accept task',
    label: 'The prep task is set',
    summary: 'Still reading the brief, user is asked — along with everyone else including the PM — to draft their own SCQ before the meeting.',
    beats: [
      'The task arrives while they are still reading, so it lands in context.',
      'Framed as everyone drafting separately, not one person being assigned it.'
    ],
    notes: [
      ['Teams', 'A message from the PM asking everyone to write their own SCQ and their own reading of the problem statement before the meeting.'],
      ['Beat', 'A desktop notification slides in over the brief, carrying an accept control.']
    ],
    anim: anim(5000, [
      { at: 900, do: el => { const t = $('.w-toast', el); if (t) { t.style.animation = 'none'; void t.offsetWidth; t.style.animation = 'toastin .42s both'; } } }
    ]),
    body: () => `<div style="display:flex;height:100%;position:relative">${W.powerpoint({
      thumbs: 9, at: 2, notes: false,
      slide: `<div style="display:flex;flex-direction:column;gap:7px;opacity:.45;justify-content:center;height:100%">
        ${W.bar('50%', 'strong')}${W.bars(['92%', '86%', '78%', '88%'])}</div>`
    })}${W.toast({ action: 'Accept', delay: 900 })}</div>`
  },

  {
    id: 's1f5', stage: 1, kind: 'exercise', verb: 'DO', action: 'Check',
    label: 'Writing your own SCQ',
    summary: 'Taking up that task, user enters their own SCQ and problem statement, then presses Check for feedback from an AI coach.',
    beats: [
      'The coach points at a specific line and says what to do about it, rather than returning a mark.',
      'Every source they need sits along the bottom and opens without leaving the screen.',
      'What they write is kept and comes back in the kick-off.'
    ],
    carry: { write: ['scq'] },
    notes: [
      ['Prompt', 'The task from the PM repeated here as context for what the learner is now doing.'],
      ['Coach', 'Names the weak line and asks one question that would fix it. Never a grade on its own.'],
      ['Beat', 'Two passes: the coach flags the complication, the learner revises, the coach confirms and moves to the question.'],
      ['Note', 'Iteration is how quality gets driven everywhere else at the firm. The coach is there to be argued with on the second or third pass, not obeyed on the first.']
    ],
    anim: anim(11000, [
      { at: 300,  do: el => $$('.scq-fill', el).forEach((n, i) => setTimeout(() => n.style.width = n.dataset.w, i * 200)) },
      { at: 2600, do: el => coach(el, 'c', 'Points at the complication: it restates the situation rather than saying what has changed.', 1) },
      { at: 5600, do: el => { const b = $('[data-fix]', el); if (b) b.style.width = '78%'; coach(el, '', '', 0); } },
      { at: 6400, do: el => coach(el, 'q', 'Confirms the complication now holds, and asks whether the question is answerable in four weeks.', 2) },
      { at: 10200, do: el => { coach(el, '', '', 0); $$('.scq-fill', el).forEach(n => n.style.width = '0%'); const b = $('[data-fix]', el); if (b) b.style.width = '52%'; } }
    ]),
    body: () => `
      <div class="stack" style="gap:var(--s3)">
        <div class="grid3" style="flex:0 0 auto;height:34%">
          ${[['S', 'Situation', '86%', 's'], ['C', 'Complication', '78%', 'c'], ['Q', 'Question', '92%', 'q']].map(([k, n, w, id]) => `
            <div class="card" data-fld="${id}"><span class="tag">${k} · ${n}</span>
              <div style="flex:1;display:flex;flex-direction:column;gap:6px;padding-top:2px">
                <i class="bar scq-fill" data-w="${w}" style="width:0;transition:width .8s ease-out"></i>
                <i class="bar scq-fill${id === 'c' ? '' : ''}" ${id === 'c' ? 'data-fix' : ''} data-w="${parseInt(w) - 26}%" style="width:0;transition:width .8s ease-out .1s"></i>
                <i class="bar scq-fill bar--faint" data-w="${parseInt(w) - 42}%" style="width:0;transition:width .8s ease-out .2s"></i>
              </div></div>`).join('')}
        </div>

        <div class="card card--focus" style="flex:0 0 auto">
          <span class="tag tag--maroon">Problem statement</span>
          <div style="display:flex;flex-direction:column;gap:6px">
            <i class="bar scq-fill" data-w="94%" style="width:0;background:var(--maroon);opacity:.7;transition:width .8s ease-out .3s"></i>
            <i class="bar scq-fill" data-w="62%" style="width:0;background:var(--maroon);opacity:.7;transition:width .8s ease-out .4s"></i>
          </div>
        </div>

        <div class="coach" data-coach>
          <span class="coach__who">${W.glyph('chat')}AI coach</span>
          <span class="coach__msg">Waiting for a first draft.</span>
          <span class="coach__pass" data-pass></span>
        </div>

        <div style="display:flex;gap:5px;flex-shrink:0">
          ${['Context brief', 'Proposal', 'Past quals', 'Fact pack'].map(r =>
            `<span class="reftab">${W.glyph('doc')}${r}</span>`).join('')}
        </div>
      </div>`
  },

  {
    id: 's1f6a', stage: 1, kind: 'argument', verb: 'READ', action: 'Next',
    label: 'Why Day 0 mattered',
    summary: 'User is shown what their Day 0 preparation bought the team.',
    beats: ['Three claims, each one arguable.'],
    body: () => `
      <div class="stack">
        <h2 class="s-h1">Why Day 0 mattered</h2>
        <div style="flex:1;min-height:0">${claims([
          'The kick-off can only do deep thinking if the context is already in people’s heads. Every hour spent on context now is an hour the meeting does not spend on it.',
          'Your rough SCQ is what gives the kick-off three framings in it instead of one.',
          'Most of Day 0 is finding material the firm already has, rather than making something new.'
        ])}</div>
      </div>`
  },

  {
    id: 's1check', stage: 1, kind: 'check', verb: 'READ', action: 'Next',
    label: 'The Day 0 checklist',
    summary: 'User can see exactly what their role owes before Day 1 starts, and what should exist by the time it does.',
    beats: ['Split by role, so an analyst is not reading the Partner’s list.',
            'A second tab turns the same thing into a completion check.'],
    anim: anim(7000, [{ at: 300, do: el => tabCycle(el, 0) }, { at: 3600, do: el => tabCycle(el, 1) }]),
    tabsData: () => [
      { label: 'Process · has this happened?', html: roles({ head: 'Checklist items', body: [
        ['P/AP', ['Shared what you know about client, sector and problem', 'Drafted and signed off the context brief', 'Flagged the key tensions you already know']],
        ['SPM/PM', ['Created the project folder and Teams channel', 'Asked the proposal team for anything beyond the proposal', 'Confirmed dates, roles and cadence', 'Set the SCQ prep task before the kick-off']],
        ['SC/C', ['Read the proposal and context brief', 'Pinned useful facts to the fact pack', 'Drafted your own SCQ and problem statement', 'Noted your questions for the kick-off']],
        ['AC/AN', ['Read the proposal and context brief', 'Skimmed past quals for adjacent work', 'Pinned facts to the fact pack', 'Drafted your own SCQ and problem statement']]
      ]})},
      { label: 'Output · this is complete', html: roles({ head: 'This is complete', body: [
        ['P/AP', ['Context brief written, curated, shared', 'Key tensions are named']],
        ['SPM/PM', ['Project folder follows the standard structure', 'Fact pack is open and receiving pins', 'Meeting cadence is set']],
        ['SC/C and AC/AN', ['Your SCQ is drafted', 'Your draft problem statement is written', 'Your kick-off questions are listed']]
      ]})}
    ]
  },

  /* ------------------------ FULL-TEAM KICK-OFF -------------------------- */
  {
    id: 's2map', stage: 2, kind: 'map', verb: 'READ', action: 'Begin',
    label: 'Day 0 complete',
    summary: 'User sees the first stage close and the kick-off open, so the sense of progression is maintained.',
    beats: [],
    body: () => `<div class="stack"><div class="maphead"><h2 class="s-h1">You have finished Day 0. The full-team kick-off is where the project’s thinking actually starts.</h2></div>${map5(1)}</div>`
  },

  {
    id: 's2intro', stage: 2, kind: 'intro', verb: 'READ', action: 'Begin',
    label: 'What the kick-off covers',
    summary: 'User learns this is the first time the whole team is together, that it runs at least two hours, and that it always happens before the client sees anything.',
    beats: ['Names the four things they will personally do in the session.'],
    notes: [
      ['Copy', 'A line explaining this is the first time the whole team is in a room, and that it is where the project’s thinking starts.']
    ],
    body: () => `
      <div class="stack">
        <div><h2 class="s-h1">Full-team kick-off</h2><p class="s-cap" style="margin:0">The session runs for at least XX minutes, and it always happens before any kick-off with the client.</p></div>
        ${objectives(
          ['See your SCQ next to your colleagues’ and find they do not match',
           'Find the words in a problem statement nobody has defined',
           'Work out why we commit to an answer before the research',
           'Build a hypothesis tree, then see the real one'],
          ['Explain what a hypothesis is and why we write one on Day 1',
           'Drill a claim into what would have to be true for it to hold',
           'Recognise what a finished Day 1 output actually looks like'])}
      </div>`
  },

  {
    app: 'meeting',
    id: 's2f1', stage: 2, kind: 'sim', verb: 'WATCH', action: 'Next',
    label: 'The meeting opens',
    summary: 'User sees the whole team together for the first time and gets the shape of the next two hours before any of it starts.',
    beats: [
      'A three-item agenda, so the session has a visible spine.',
      'The PM opens by saying context is already done, which pays off Day 0 immediately.'
    ],
    notes: [
      ['Opening', 'Everyone has read the brief, so no hour is spent on context. The meeting starts with where each person landed.'],
      ['Beat', 'The calendar invite dissolves into the meeting; the agenda writes itself in one line at a time.'],
      ['Note', 'The meeting runs at least two hours, can split across two sittings, and always happens before any client kick-off.']
    ],
    anim: anim(5600, [
      { at: 500,  do: el => $$('.tm-panel__row', el).forEach((n, i) => n.classList.toggle('in', i === 0)) },
      { at: 1300, do: el => $$('.tm-panel__row', el).forEach((n, i) => n.classList.toggle('in', i <= 1)) },
      { at: 2100, do: el => $$('.tm-panel__row', el).forEach(n => n.classList.add('in')) },
      { at: 3000, do: el => cls(el, '.w-tile', 'is-speaking', 1) },
      { at: 5200, do: el => { cls(el, '.w-tile', 'is-speaking', false); $$('.tm-panel__row', el).forEach(n => n.classList.remove('in')); } }
    ]),
    body: () => W.teamsMeeting({
      tiles: [{ id: 'A' }, { id: 'T' }, { id: 'H' }, { id: 'You', you: true }],
      side: { title: 'Agenda', items: ['Agree on the problem', 'Build the starting answer', 'Agree on the deliverable'] },
      stage: `<div style="display:flex;flex-direction:column;gap:8px;opacity:.5">${W.bars(['72%', '88%', '64%', '80%'])}</div>
        <style>.tm-panel__row{opacity:0;transform:translateY(-4px);transition:all .35s}.tm-panel__row.in{opacity:1;transform:none}</style>`
    })
  },

  {
    id: 's2f2', stage: 2, kind: 'exercise', verb: 'READ', action: 'Next',
    label: 'Your SCQ against theirs',
    summary: 'The kick-off opens with the SCQs everyone wrote in Day 0 side by side. All three differ, mostly in the question, and the team works from there towards one shared problem statement.',
    beats: [
      'Their own draft is marked as theirs, so the earlier prep visibly pays off.',
      'The differences are surfaced rather than left to be hunted for.',
      'The point lands on its own: drafting alone first is what put three ideas in the room.'
    ],
    carry: { read: ['scq'] },
    notes: [
      ['Cards', 'Each card carries one person’s situation, complication and question, in their own words.'],
      ['Beat', 'The learner’s card loads first; the other two arrive beside it, then the diverging Q rows take a highlight.'],
      ['Note', 'All three SCQs are defensible, and the question is different in each one. If everyone had waited to hear the Partner’s version first, this meeting would have one idea in it instead of three.']
    ],
    anim: anim(5800, [
      { at: 400,  do: el => $$('.card', el).forEach((n, i) => n.classList.toggle('in', i === 0)) },
      { at: 1200, do: el => $$('.card', el).forEach((n, i) => n.classList.toggle('in', i <= 1)) },
      { at: 1900, do: el => $$('.card', el).forEach(n => n.classList.add('in')) },
      { at: 3000, do: el => $$('.q-row', el).forEach(n => n.classList.add('flag')) },
      { at: 5400, do: el => { $$('.card', el).forEach(n => n.classList.remove('in')); $$('.q-row', el).forEach(n => n.classList.remove('flag')); } }
    ]),
    body: () => `
      <div class="stack">
        <div class="grid3">
          ${scqCard('Yours', true, '88%')}${scqCard('H', false, '62%')}${scqCard('T', false, '74%')}
        </div>
      </div>
      <style>
        .card{opacity:0;transform:translateY(6px);transition:all .4s}
        .card.in{opacity:1;transform:none}
        .q-row{border-radius:2px;transition:background .4s;padding:5px 6px;margin:-5px -6px}
        .q-row.flag{background:var(--soft)}
        .q-row.flag .bar{background:var(--maroon);opacity:.8}
      </style>`
  },

  {
    id: 's2f3', stage: 2, kind: 'exercise', verb: 'DECIDE', action: 'Next',
    label: 'Finding the undefined words',
    summary: 'With the three SCQs merged into one problem statement, user finds the four words in it that nobody has actually defined.',
    beats: [
      'The sentence looks settled, which is what makes the exercise land.',
      'Each word opens the question hiding inside it.',
      'Half are resolvable in the room; half go to the client that week.'
    ],
    notes: [
      ['Prompt', 'Says the sentence looks agreed, that four things in it are not defined, and asks the learner to find them.'],
      ['Beat', 'The four phrases resolve one at a time, with a counter of how many are found.'],
      ['Note', 'Two of the four were resolvable by the team. Two went to the client as questions that week.']
    ],
    anim: anim(6800, [
      { at: 900,  do: el => $$('.hw', el).forEach((n, i) => n.classList.toggle('found', i === 0)) },
      { at: 2100, do: el => $$('.hw', el).forEach((n, i) => n.classList.toggle('found', i <= 1)) },
      { at: 3300, do: el => $$('.hw', el).forEach((n, i) => n.classList.toggle('found', i <= 2)) },
      { at: 4500, do: el => $$('.hw', el).forEach(n => n.classList.add('found')) },
      { at: 6400, do: el => $$('.hw', el).forEach(n => n.classList.remove('found')) }
    ]),
    body: () => `
      <div class="stack" style="justify-content:center;gap:var(--s5)">
        <p class="s-display" style="text-align:center;max-width:38ch;margin:0 auto">
          How might <span class="hw">smallholder</span> systems shift away from
          <span class="hw">fossil-dependent</span> inputs at <span class="hw">scale</span>,
          and what would make that <span class="hw">viable</span>?
        </p>
        <div class="focus" style="max-width:52ch;margin:0 auto;width:100%">
          <span class="s-micro">Prompt</span>
          <span class="s-cap" style="font-style:italic">Four things in this sentence are not defined yet.</span>
        </div>
      </div>
      <style>.hw{border-bottom:1px dotted var(--mute-2);transition:all .4s;padding-bottom:1px}
        .hw.found{color:var(--maroon);border-bottom:1.5px solid var(--maroon)}</style>`
  },

  {
    id: 's2f4a', stage: 2, kind: 'exercise', verb: 'READ', action: 'Next',
    label: 'The hypothesis, stated flat',
    summary: 'With the problem agreed, the Partner states a hypothesis as one flat claim. That claim becomes the top of the tree the team is about to build.',
    beats: [
      'The claim sits alone first, with nothing to soften it.',
      'Branch stubs then sprout from it, showing where the next exercise goes.'
    ],
    notes: [
      ['Claim', 'The top-level hypothesis, stated flat as a claim, with no hedging.'],
      ['Definition', 'Best answer to the client’s question, written before the research, specific enough that evidence can prove it wrong.'],
      ['Beat', 'The frame holds on the claim a beat longer than is comfortable, then the definition offers itself and the branch stubs appear.']
    ],
    anim: anim(8000, [
      { at: 400,  do: el => { const c = $('.tnode--l1', el); if (c) c.classList.add('in'); } },
      { at: 3200, do: el => { const d = $('.defn-box', el); if (d) d.classList.add('in'); } },
      { at: 5000, do: el => { const g = $('.tlegs', el); if (g) g.classList.add('in');
        $$('.tnode--stub', el).forEach((n, i) => setTimeout(() => n.classList.add('in'), i * 180)); } },
      { at: 7600, do: el => $$('.in', el).forEach(n => n.classList.remove('in')) }
    ]),
    body: () => `
      <div class="stack" style="justify-content:center;gap:0">
        <div class="ttree">
          <div class="tnode tnode--l1"><span class="tnode__tag">L1 · the claim</span>
            <span class="tnode__body">${W.bars([['92%', 'live'], ['64%', 'live']])}</span></div>
          <div class="tlegs" data-n="3"></div>
          <div class="trow">
            ${[0,1,2].map(() => `<div class="tnode tnode--stub"><span class="tnode__tag">L2</span>
              <span class="tnode__body">${W.bars([['80%','faint'],['52%','faint']])}</span></div>`).join('')}
          </div>
        </div>
        <div class="defn-box panel" style="max-width:60ch;margin:var(--s4) auto 0;width:100%">
          <span class="s-eyebrow">What a hypothesis is</span>
          <span class="s-cap" style="font-style:italic">Best answer to the client’s question, written before the research, specific enough that evidence can prove it wrong.</span>
        </div>
      </div>`
  },

  {
    id: 's2f4b', stage: 2, kind: 'exercise', verb: 'DECIDE', action: 'Next',
    label: 'Answering the real objection',
    summary: 'Before anyone builds on that claim, user turns over whichever objection to committing early they actually hold, and gets an answer to that one.',
    beats: [
      'Four objections, phrased the way someone would really think them.',
      'The replies come from different people, because the honest answers differ in kind.'
    ],
    notes: [
      ['Prompt', 'Says most people have at least one of these in their head, and invites the learner to turn over the ones they are thinking.'],
      ['Beat', 'Cards start face down. Turning one opens a reply panel beneath it.']
    ],
    anim: anim(9200, [
      { at: 600,  do: el => flip(el, 0) }, { at: 2700, do: el => flip(el, 1) },
      { at: 4800, do: el => flip(el, 2) }, { at: 6900, do: el => flip(el, 3) },
      { at: 8900, do: el => flip(el, -1) }
    ]),
    body: () => `
      <div class="stack">
        <div class="grid4" style="flex:0 0 auto;height:36%">
          ${[['Sequencing', 'PM'], ['Value of being wrong', 'Partner'], ['Permission', 'SPM'], ['Intellectual honesty', 'Partner']]
            .map(([k, who], i) => `<div class="card obj" data-i="${i}">
              <span class="tag">${k}</span><span class="s-cap" style="margin-top:auto">${who} answers</span></div>`).join('')}
        </div>
        <div class="focus" style="flex:1;min-height:0;justify-content:center">
          <span class="s-micro">Reply</span>
          <span class="s-body reply-txt" style="font-style:italic">—</span>
        </div>
      </div>
      <style>.obj{transition:all .3s}.obj.on{background:var(--soft);border-color:var(--maroon)}.obj.on .tag{color:var(--maroon)}</style>`
  },

  {
    id: 's2f4c', stage: 2, kind: 'exercise', verb: 'DECIDE', action: 'Next',
    label: 'The field narrows',
    summary: 'To show what the claim is for, user sees the full field of research topics, then sees the hypothesis cut it to a shortlist three people could work through.',
    beats: [
      'Every topic on the field is legitimately worth studying.',
      'Applying the claims fades out everything that would not test one.',
      'What is left is small enough to attach names and calls to.'
    ],
    notes: [
      ['Constraint', 'Four weeks, three people, 28 conversations if you choose well.'],
      ['Beat', 'The full field renders first. Applying the hypothesis fades back everything that tests nothing.'],
      ['Note', 'The hypothesis is not what the team believed. It is what the team decided to spend four weeks testing.']
    ],
    anim: anim(6600, [
      { at: 1200, do: el => $$('.topic', el).forEach(n => n.classList.add('faded')) },
      { at: 1500, do: el => $$('.topic.keep', el).forEach(n => { n.classList.remove('faded'); n.classList.add('kept'); }) },
      { at: 6200, do: el => $$('.topic', el).forEach(n => n.classList.remove('faded', 'kept')) }
    ]),
    body: () => {
      const keep = new Set([3, 9, 14, 19, 25, 30, 34, 41, 46, 52, 57, 61]);
      return `
      <div class="stack">
        <div class="focus focus--tight" style="flex-direction:row;align-items:center;gap:var(--s4);flex-shrink:0">
          <span class="s-micro">Constraint</span>
          <span class="s-body" style="color:var(--maroon);font-weight:700">4 weeks · 3 people · 28 conversations</span>
        </div>
        <div style="flex:1;min-height:0;display:grid;grid-template-columns:repeat(9,1fr);gap:7px;align-content:start;padding-top:4px">
          ${Array.from({ length: 63 }, (_, k) =>
            `<div class="topic ${keep.has(k) ? 'keep' : ''}" style="height:17px;border-radius:2px;background:var(--fill-2);transition:all .6s"></div>`).join('')}
        </div>
      </div>
      <style>.topic.faded{opacity:.16}.topic.kept{background:var(--maroon);opacity:.85}</style>`;
    }
  },

  {
    id: 's2f4d', stage: 2, kind: 'exercise', verb: 'EXPLORE', action: 'Next',
    label: 'What the hypothesis did and did not do',
    summary: 'User sees one Day 1 guess that the research confirmed and one major finding nobody predicted, and takes away that a hypothesis points the work without deciding the answer.',
    beats: [
      'Two pairings, shown one after the other.',
      'The second matters more, because it keeps the hypothesis honest.'
    ],
    notes: [
      ['Pair 1', 'The Day 1 guess about later value-chain stages, against the figure four weeks of research produced. The hunch held.'],
      ['Pair 2', 'The strongest argument in the published report, which was not on the Day 1 slide at all. It came out of the interviews.'],
      ['Beat', 'A toggle moves between the two pairings, left claim to right finding.']
    ],
    anim: anim(8000, [{ at: 200, do: el => pair(el, 0) }, { at: 4000, do: el => pair(el, 1) }]),
    body: () => `
      <div class="stack">
        ${tabs(['The hunch that held', 'The finding nobody predicted'], 0)}
        <div class="row" style="align-items:stretch">
          <div class="card" style="flex:1"><span class="tag">Day 1 claim</span>
            <div class="pair-l" style="display:flex;flex-direction:column;gap:7px;flex:1;justify-content:center"></div></div>
          <div style="display:flex;align-items:center;color:var(--soft-deep);font-size:24px">&rarr;</div>
          <div class="card card--focus" style="flex:1"><span class="tag tag--maroon">Published finding</span>
            <div class="pair-r" style="display:flex;flex-direction:column;gap:7px;flex:1;justify-content:center"></div></div>
        </div>
      </div>`
  },

  {
    id: 's2f5', stage: 2, kind: 'exercise', verb: 'DO', action: 'Check',
    label: 'Building the hypothesis tree',
    summary: 'Now user builds the tree out: typing their own sub-claims under the top claim, adding branches and drilling one down, then pressing Check for feedback from an AI coach.',
    beats: [
      'The tree is drawn as a tree: the claim on top, branches beneath it, connected.',
      'Branches are typed in freely — nothing is chosen from a list.',
      'Any branch can be added, edited, removed or drilled a level further down.'
    ],
    carry: { write: ['tree'] },
    notes: [
      ['Prompt', 'The question that drives every hypothesis tree: for this claim to be true, what would have to be true?'],
      ['Controls', 'Per branch: edit the wording, drill down a level, remove. Plus add branch on the row itself.'],
      ['Coach', 'Reads what the learner wrote and says which branch is not yet a testable claim, and why.'],
      ['Beat', 'Three branches typed in, a fourth added, one drilled to L3, then the coach responds.']
    ],
    anim: anim(14000, [
      { at: 600,  do: el => ttype(el, 0) },
      { at: 2100, do: el => ttype(el, 1) },
      { at: 3600, do: el => { ttype(el, 2); coach(el, '', 'Reads branch two and says it is an activity rather than something evidence could prove wrong.', 1); } },
      { at: 6000, do: el => tfix(el, 1) },
      { at: 7400, do: el => { const r = $('.trow', el); if (r) r.classList.add('four'); ttype(el, 3); } },
      { at: 9000, do: el => { const d = $('.tdrill', el); if (d) d.classList.add('in'); } },
      { at: 10600, do: el => coach(el, '', 'Confirms all four branches are claims, testable and in scope.', 2) },
      { at: 13400, do: el => treset(el) }
    ]),
    body: () => `
      <div class="stack" style="gap:var(--s3)">
        <div class="focus focus--tight" style="flex-shrink:0">
          <span class="s-micro">For this claim to be true, what would have to be true?</span>
        </div>

        <div class="ttree" style="flex:1;min-height:0">
          <div class="tnode tnode--l1 in"><span class="tnode__tag">L1 · the claim</span>
            <span class="tnode__body">${W.bars([['88%', 'live'], ['56%', 'live']])}</span></div>
          <div class="tlegs in" data-n="3"></div>
          <div class="trow">
            ${[0, 1, 2, 3].map(i => `<div class="tnode tnode--slot" data-s="${i}">
              <span class="tnode__tag">L2</span>
              <span class="tnode__body tnode__empty">Type a sub-claim…<i class="caret"></i></span>
              <span class="tnode__ctrls">
                <i title="Edit">${W.glyph('doc')}</i><i title="Drill down">${W.glyph('down')}</i><i title="Remove">×</i>
              </span></div>`).join('')}
          </div>
          <button class="tadd">+ Add branch</button>
          <div class="tdrill">
            <div class="tlegs in" data-n="2" style="height:14px"></div>
            <div class="trow trow--l3">
              ${[0, 1].map(() => `<div class="tnode tnode--l3"><span class="tnode__tag">L3</span>
                <span class="tnode__body">${W.bars([['76%', 'faint']])}</span></div>`).join('')}
            </div>
          </div>
        </div>

        <div class="coach" data-coach>
          <span class="coach__who">${W.glyph('chat')}AI coach</span>
          <span class="coach__msg">Waiting for your first branch.</span>
          <span class="coach__pass" data-pass></span>
        </div>
      </div>`
  },

  {
    id: 's2f6', stage: 2, kind: 'sim', verb: 'READ', action: 'Next',
    label: 'What a real Day 1 output looks like',
    summary: 'Once the tree is drilled, user sees the real Day 1 output from this project — the hypothesis-driven executive summary, left exactly as it was, unfinished.',
    beats: [
      'Shown exactly as it was left, because the imperfections are the teaching.',
      'Two flaws are called out rather than quietly fixed.',
      'The team stopped because the meeting ended, not because the thinking was done.'
    ],
    notes: [
      ['Annotation 1', 'Points at a sentence in the tensions section that does not parse.'],
      ['Annotation 2', 'Points at a yellow placeholder the team had not filled in.'],
      ['Note', 'This is the most useful artefact in the archive, because it shows what the end of a real Day 1 actually looks like, which is nothing like the polished version that circulates later.']
    ],
    anim: anim(7000, [
      { at: 1400, do: el => { const f = $$('.flaw', el)[0]; if (f) f.classList.add('ring'); } },
      { at: 3600, do: el => { $$('.flaw', el).forEach(n => n.classList.remove('ring')); const f = $$('.flaw', el)[1]; if (f) f.classList.add('ring'); } },
      { at: 6400, do: el => $$('.flaw', el).forEach(n => n.classList.remove('ring')) }
    ]),
    body: () => W.powerpoint({
      thumbs: 12, at: 3, notes: false,
      slide: `<div class="real" style="display:flex;flex-direction:column;gap:5px;height:100%;overflow:hidden">
        <span style="font-size:9px;color:var(--maroon);font-weight:700;flex-shrink:0">Day 1 — hypothesis-driven executive summary</span>
        <div style="height:1px;background:var(--maroon);opacity:.4;flex-shrink:0"></div>
        ${[['There is a limited focus on the food energy nexus', 3],
           ['Existing efforts centre on fossil fuel reduction and renewables', 2],
           ['Yet a broader set of opportunities for collaboration exists', 3]].map(([t, n]) => `
          <div style="flex-shrink:0"><span style="font-size:7.5px;color:var(--maroon);font-weight:700;line-height:1.3;display:block">${t}</span>
          <span style="display:flex;flex-direction:column;gap:3px;padding-left:10px;margin-top:3px">${
            W.bars(Array.from({ length: n }, (_, k) => [(92 - k * 11) + '%', 'faint']))}</span></div>`).join('')}
        <div style="flex-shrink:0"><span style="font-size:7.5px;color:var(--maroon);font-weight:700;display:block">However, several tensions have emerged</span>
          <span style="display:block;padding-left:10px;margin-top:3px;font-size:7px;color:var(--ink);line-height:1.4">…decarbonizing fertilizer has negative impacts on not be good for ecosystem health<i class="flaw">1</i></span>
          <span style="display:flex;flex-direction:column;gap:3px;padding-left:10px;margin-top:3px">${W.bars([['74%', 'faint']])}</span></div>
        <div style="flex-shrink:0"><span style="font-size:7.5px;color:var(--maroon);font-weight:700;display:block">Recommendations</span>
          <span style="display:flex;flex-direction:column;gap:3px;padding-left:10px;margin-top:3px">${W.bars([['88%', 'faint']])}</span>
          <span style="display:block;padding-left:10px;margin-top:3px;font-size:7px;color:var(--ink);line-height:1.4">Potential areas for research include energy intensity of processed foods and alternative proteins <mark style="background:#FBEA9B;color:var(--ink);padding:0 2px">XYZ</mark><i class="flaw">2</i></span></div>
      </div>
      <style>.flaw.ring{box-shadow:0 0 0 3px rgba(136,25,70,.22)}</style>`
    })
  },

  {
    app: 'teams',
    id: 's2f7', stage: 2, kind: 'sim', verb: 'WATCH', action: 'Next',
    label: 'Agreeing the deliverable',
    summary: 'With the tree done, user watches the team agree in about two minutes what the deliverable is and who reads it.',
    beats: [
      'Deliberately anticlimactic after the hypothesis work.',
      'A deck and a report are different arguments, not the same one in different clothes.'
    ],
    notes: [
      ['Exchange', 'Three or four messages in which the team agrees what the deliverable is and who its primary reader will be.'],
      ['Beat', 'The messages resolve into a single agreed format card below them.'],
      ['Note', 'Two minutes spent here saves a rebuild in week three.']
    ],
    anim: anim(6400, [
      { at: 400,  do: el => $$('.tm-msg', el).forEach((n, i) => setTimeout(() => n.classList.add('in'), i * 550)) },
      { at: 3000, do: el => { const c = $('.fmt-card', el); if (c) c.classList.add('in'); } },
      { at: 6100, do: el => $$('.tm-msg,.fmt-card', el).forEach(n => n.classList.remove('in')) }
    ]),
    body: () => W.teamsChat({
      messages: [
        { from: '30%', lines: ['72%'] }, { from: '26%', lines: ['58%'] },
        { from: '34%', lines: ['64%', '44%'] }, { from: '24%', lines: ['46%'] }
      ],
      attached: `<div class="fmt-card" style="margin:6px 0 0;border:1px solid var(--maroon);background:var(--soft);border-radius:3px;padding:10px 12px;display:flex;flex-direction:column;gap:6px">
        <span class="tag tag--maroon">Agreed format</span>${W.bars([['62%', ''], ['40%', '']])}</div>
      <style>.tm-msg{opacity:0;transition:opacity .4s}.tm-msg.in{opacity:1}
      .fmt-card{opacity:0;transform:translateY(6px);transition:all .45s}.fmt-card.in{opacity:1;transform:none}</style>`
    })
  },

  {
    id: 's2f8a', stage: 2, kind: 'argument', verb: 'READ', action: 'Next',
    label: 'Why the kick-off mattered',
    summary: 'User is shown what the two-hour kick-off produced, including the reframe that changed the project.',
    beats: ['Three claims, and a recap of what they personally did in the session.'],
    notes: [
      ['Note', 'The recap covers which branches the learner placed first, which decoys they picked up and put back, and how many passes it took.']
    ],
    body: () => `
      <div class="stack">
        <h2 class="s-h1">Why the full-team kick-off mattered</h2>
        <div style="flex:1;min-height:0">${claims([
          'The proposal was written about fossil fuel in agriculture, an emissions problem. The published report was about the food-energy nexus and collaboration, a coordination problem. That reframe happened in this room.',
          'A hypothesis lets a three-person team choose 28 conversations out of hundreds.',
          'This is the moment with the most senior attention and the least work committed. Changing the argument costs an afternoon today; in week six it costs a fortnight.'
        ])}</div>
      </div>`
  },

  {
    id: 's2check', stage: 2, kind: 'check', verb: 'READ', action: 'Next',
    label: 'The kick-off checklist',
    summary: 'User can check what their role owed the session and what should exist by the time it ends.',
    beats: [],
    anim: anim(7000, [{ at: 300, do: el => tabCycle(el, 0) }, { at: 3600, do: el => tabCycle(el, 1) }]),
    tabsData: () => [
      { label: 'Process · has this happened?', html: roles({ head: 'Checklist items', body: [
        ['P/AP', ['Presented the L1 hypothesis as a claim, not a question', 'Facilitated the drilldown rather than dictating it', 'Left room for pushback']],
        ['SPM/PM', ['Ran the meeting to a three-item agenda', 'Surfaced differences between SCQs rather than smoothing them', 'Captured the tree as built']],
        ['SC/C', ['Brought your own SCQ and problem statement', 'Challenged at least one branch', 'Flagged undefined terms in the problem statement']],
        ['AC/AN', ['Brought your own SCQ and problem statement', 'Asked your kick-off questions', 'Noted the parts of the tree not yet understood']]
      ]})},
      { label: 'Output · this is complete', html: roles({ head: 'This is complete', body: [
        ['P/AP', ['L1 hypothesis is stated and agreed']],
        ['SPM/PM', ['Problem statement written in one sentence', 'Every key term defined, or logged as a client question', 'Hypothesis tree drilled to L2', 'Deliverable format and primary reader agreed']],
        ['SC/C and AC/AN', ['You can state the L1 hypothesis without looking', 'You know which branch you are likely to own', 'Your open questions are logged']]
      ]})}
    ]
  },

  /* ------------------------ CORE TEAM KICK-OFF -------------------------- */
  {
    id: 's3map', stage: 3, kind: 'map', verb: 'READ', action: 'Begin',
    label: 'Two stages complete',
    summary: 'User sees the morning close and the afternoon session open.',
    beats: [],
    body: () => `<div class="stack"><div class="maphead"><h2 class="s-h1">Two stages behind you. The afternoon session belongs to the core team, and the Partner is not in the room for it.</h2></div>${map5(2)}</div>`
  },

  {
    id: 's3intro', stage: 3, kind: 'intro', verb: 'READ', action: 'Begin',
    label: 'What the core team kick-off covers',
    summary: 'User learns the afternoon session is run by the PM, without the Partner, and is mostly about how the team will work together.',
    beats: ['Most of the time goes on agreeing how the team will work together.'],
    notes: [
      ['Copy', 'A line explaining this is a smaller session later the same day, run by the PM, with the Partner not in the room.']
    ],
    body: () => `
      <div class="stack">
        <div><h2 class="s-h1">Core team kick-off</h2><p class="s-cap" style="margin:0">This one runs later the same day in a smaller room, and the Partner is not in it. It takes about XX minutes.</p></div>
        ${objectives(
          ['Fill in your working preferences before the session',
           'Watch the hypothesis tree become a dot-dash storyline',
           'Flag your experience against the research plan',
           'Agree on the team’s norms — where most of your time goes'],
          ['Explain what a dot-dash storyline is and where it comes from',
           'Say what would prove and what would kill your own branch',
           'Hold a norms conversation specific enough to point to later'])}
      </div>`
  },

  {
    app: 'outlook',
    id: 's3f1', stage: 3, kind: 'sim', verb: 'READ', action: 'Next',
    label: 'The deck and the form arrive',
    summary: 'Straight after the morning session, user receives the core team kick-off deck and a request to fill in a preferences form before the afternoon.',
    beats: [
      'Sets the expectation that the team is reacting to a draft, not building from nothing.',
      'The single ask takes five minutes and is deliberately made in writing.'
    ],
    notes: [
      ['Email', 'Attaches the core team kick-off deck and asks the learner to fill in the preferences form before the session.'],
      ['Also', 'Says her storyline and workplan drafts are rough and meant to be argued with.'],
      ['Note', 'Preferences are collected in writing on purpose. In a live conversation the first person to speak sets the range and everyone else adjusts towards it.']
    ],
    anim: anim(4800, [
      { at: 400,  do: el => cls(el, '.ol-msg', 'is-live', 0) },
      { at: 4400, do: el => cls(el, '.ol-msg', 'is-live', false) }
    ]),
    body: () => W.outlook({
      rows: [
        { from: '46%', subject: '78%', preview: '88%', attach: true },
        { from: '52%', subject: '64%', preview: '70%' },
        { from: '40%', subject: '58%', preview: '62%' }
      ],
      attach: true
    })
  },

  {
    app: 'forms',
    id: 's3f2', stage: 3, kind: 'sim', verb: 'DO', action: 'Submit',
    label: 'Filling in your preferences',
    summary: 'User answers three questions about how they work. The answers go to the whole team later in this stage.',
    beats: [
      'No scoring and no right answer — the prompt says so explicitly.',
      'Takes about five minutes, and the answers come back later in this stage.'
    ],
    carry: { write: ['prefs'] },
    notes: [
      ['Prompt', 'Asks the learner to answer for themselves rather than for the version a new team might want, and notes that everyone’s answers go up on screen.'],
      ['Beat', 'Three question groups, answered in turn, with the progress bar filling.']
    ],
    anim: anim(7200, [
      { at: 600,  do: el => pick(el, 0, 0, 33) },
      { at: 2400, do: el => pick(el, 1, 1, 66) },
      { at: 4200, do: el => pick(el, 2, 2, 100) },
      { at: 6800, do: el => pick(el, -1, 0, 0) }
    ]),
    body: () => W.forms({
      progress: 0,
      groups: [
        { q: 'Working times', opts: ['Standard hours', 'Early start', 'Late finish'], free: true },
        { q: 'How you like feedback', opts: ['In writing first', 'Live conversation'], free: true },
        { q: 'Meeting cadence', opts: ['Daily check-in', 'Twice weekly', 'Weekly'] }
      ]
    })
  },

  {
    app: 'meeting',
    id: 's3f3', stage: 3, kind: 'sim', verb: 'READ', action: 'Next',
    label: 'A smaller room, without the Partner',
    summary: 'User joins a smaller meeting without the Partner, and hears the three things the PM wants by the end of it.',
    beats: [
      'The absence is explained, which matters more than it sounds.',
      'The last item is flagged as the one to leave most time for.'
    ],
    notes: [
      ['Opening', 'The Partner is not in this session, and the hypothesis is now the team’s to work with.'],
      ['Note', 'The deck reuses the morning’s three-item agenda here, which contradicts the three outcomes the PM names in the same frame. Shown as the PM states them.']
    ],
    anim: anim(6000, [
      { at: 700,  do: el => cls(el, '.w-tile', 'is-speaking', 1) },
      { at: 3400, do: el => { cls(el, '.w-tile', 'is-speaking', false); const r = $$('.tm-panel__row', el)[2]; if (r) r.classList.add('hot'); } },
      { at: 5700, do: el => $$('.tm-panel__row', el).forEach(n => n.classList.remove('hot')) }
    ]),
    body: () => W.teamsMeeting({
      tiles: [{ id: 'A', absent: true }, { id: 'T' }, { id: 'H' }, { id: 'You', you: true }],
      side: { title: 'By the end', items: ['A storyline we could show someone tomorrow', 'Who is chasing what, and how', 'How we work together'] },
      stage: `<div style="display:flex;flex-direction:column;gap:8px;opacity:.5">${W.bars(['66%', '84%', '58%'])}</div>
        <style>.tm-panel__row.hot{color:var(--maroon);font-weight:700}</style>`
    })
  },

  {
    id: 's3f4', stage: 3, kind: 'exercise', verb: 'EXPLORE', action: 'Next',
    label: 'The tree becomes the storyline',
    summary: 'After agreeing on the hypothesis tree, user sees how that tree turns into a dot-dash storyline — the outline of the final deliverable, section by section.',
    beats: [
      'Each top-level claim becomes a section heading.',
      'The sub-claims line up as the points that section has to make.',
      'This is the conceptual move people most consistently miss, so it repeats.'
    ],
    carry: { read: ['tree'] },
    notes: [
      ['Definition', 'A dot-dash storyline: dashes are sections, dots are the claims each section has to make for the argument to hold.'],
      ['Beat', 'A scrub control runs between the two views and back, so the relationship can be watched several times.'],
      ['Note', 'This is why the drilldown was worth two hours. The structure of the deliverable comes directly out of it, rather than being invented in week three.']
    ],
    anim: anim(7000, [{ at: 500, do: el => scrub(el, 100) }, { at: 3800, do: el => scrub(el, 0) }]),
    body: () => `
      <div class="stack">
        <div class="row">
          <div class="card" style="flex:1"><span class="tag">Hypothesis tree</span>
            <div class="scrub-l" style="flex:1;display:flex;flex-direction:column;gap:9px;justify-content:center;transition:opacity .9s">
              ${[0, 1, 2].map(i => `<div style="padding-left:${i ? 14 : 0}px;display:flex;flex-direction:column;gap:5px">
                ${W.bar(i ? '58%' : '74%', i ? '' : 'strong')}
                <span style="display:flex;flex-direction:column;gap:4px;padding-left:14px">${W.bars([['62%', 'faint'], ['50%', 'faint']])}</span></div>`).join('')}
            </div></div>
          <div class="card card--focus" style="flex:1"><span class="tag tag--maroon">Dot-dash storyline</span>
            <div class="scrub-r" style="flex:1;display:flex;flex-direction:column;gap:11px;justify-content:center;opacity:.2;transition:opacity .9s">
              ${[0, 1, 2].map(() => `<div style="display:flex;flex-direction:column;gap:5px">
                <div style="display:flex;gap:7px;align-items:center"><i style="width:10px;height:2px;background:var(--maroon);display:block"></i>${W.bar('58%', 'strong')}</div>
                ${[0, 1].map(() => `<div style="display:flex;gap:7px;align-items:center;padding-left:17px"><i style="width:3px;height:3px;border-radius:50%;background:var(--maroon);opacity:.5;display:block"></i>${W.bar('50%', 'faint')}</div>`).join('')}
              </div>`).join('')}
            </div></div>
        </div>
        <div style="display:flex;align-items:center;gap:12px;flex-shrink:0">
          <span class="s-micro">Tree</span>
          <div style="flex:1;height:3px;background:var(--fill-2);border-radius:2px;position:relative">
            <div class="scrub-knob" style="position:absolute;top:-4px;left:0;width:11px;height:11px;border-radius:50%;background:var(--maroon);transition:left 3s cubic-bezier(.4,0,.2,1)"></div></div>
          <span class="s-micro">Storyline</span>
        </div>
      </div>`
  },

  {
    app: 'excel',
    id: 's3f5', stage: 3, kind: 'sim', verb: 'DECIDE', action: 'Next',
    label: 'Flagging what you already know',
    summary: 'With the storyline set, user can flag relevant experience or suggest a source against each row of the PM’s half-empty research plan.',
    beats: [
      'The plan is visibly half-empty, and the gaps are stated to be real gaps.',
      'Flagging experience is modelled as normal for a junior person, not showing off.'
    ],
    notes: [
      ['Copy', 'The PM saying the gaps are real gaps rather than a test, and asking people to speak up now rather than three weeks in.'],
      ['Beat', 'Empty rows take the highlight in turn, each offering two controls.'],
      ['Note', 'Teams routinely find out in week three that someone had done a near-identical piece of work two projects ago. The cost of not saying it falls on the person who stayed quiet.']
    ],
    anim: anim(6800, [
      { at: 900,  do: el => cls(el, '.xl-r--empty', 'hot', 0) },
      { at: 2600, do: el => cls(el, '.xl-r--empty', 'hot', 1) },
      { at: 4300, do: el => cls(el, '.xl-r--empty', 'hot', 2) },
      { at: 6200, do: el => cls(el, '.xl-r--empty', 'hot', false) }
    ]),
    body: () => `${W.excel({
      cols: 4,
      rows: ['title', ['68%', '54%', '72%', '46%'], ['52%', '70%', '48%', '60%'], 'empty',
             ['60%', '44%', '66%', '52%'], 'empty', ['48%', '62%', '', '58%'], 'empty']
    })}<style>.xl-r--empty.hot .xl-c:not(.xl-c--n){background:var(--soft)}</style>`
  },

  {
    id: 's3f5r', stage: 3, kind: 'argument', verb: 'READ', action: 'Next',
    label: 'How the interview list was really built',
    summary: 'User sees that the 28 interviews on this project were chosen against stated criteria rather than by who the team happened to know.',
    beats: ['The criteria came out of the claims, and the list was built against the criteria.'],
    body: () => `
      <div class="stack">
        <h2 class="s-h1">The 28 interviews were chosen against three stated parameters, not by who the team already knew.</h2>
        <div style="flex:1;min-height:0">${claims([
          'Equal representation of Global North and Global South, with perspectives from each continent.',
          'A broad set of stakeholder types — public policy, government, multilaterals, philanthropic funders, NGOs and industry.',
          'Stakeholders already focused on the food-energy nexus, or likely to become interested in it.'
        ])}</div>
      </div>`
  },

  {
    id: 's3f6', stage: 3, kind: 'exercise', verb: 'EXPLORE', action: 'Next',
    label: 'Planned against what happened',
    summary: 'User compares the workplan written on Day 1 with what the project actually did.',
    beats: [
      'The research phase ran closer to six weeks than four.',
      'The project closed in September, not July.',
      'The sequence and the milestones held; the durations did not.'
    ],
    notes: [
      ['Beat', 'A toggle overlays the actual timeline on the planned one.'],
      ['Note', 'The workplan written on Day 1 will be wrong in its details, and writing it is still what lets you notice you are running long while there is time to act.']
    ],
    anim: anim(7000, [{ at: 600, do: el => plan(el, 0) }, { at: 3600, do: el => plan(el, 1) }]),
    body: () => `
      <div class="stack">
        ${tabs(['Planned', 'What happened'], 0)}
        <div style="flex:1;min-height:0;display:flex;flex-direction:column;justify-content:center;gap:var(--s4)">
          <div class="tl" style="display:flex;flex-direction:column;gap:16px"></div>
          <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--mute-2);letter-spacing:.06em;text-transform:uppercase;padding-left:186px">
            <span>April</span><span>June</span><span>September</span>
          </div>
        </div>
      </div>`
  },

  {
    id: 's3f7', stage: 3, kind: 'exercise', verb: 'DO', action: 'Add context',
    label: 'Everyone’s preferences, together',
    summary: 'Later in the same session, everyone’s submitted preferences go up at once, including user’s own, and each person talks through theirs.',
    beats: [
      'The spread is visible before anyone speaks, which is why it was collected in writing.',
      'Some of the context is specific and inconvenient, which is the point.',
      'They are prompted to add the reason behind one of their own answers.'
    ],
    carry: { read: ['prefs'] },
    notes: [
      ['Prompt', 'Asks the learner to add the context behind one of their own answers — the part the form could not ask for.'],
      ['Beat', 'Each card expands in turn as that person talks through their answers.'],
      ['Note', 'Everyone’s stated hours were reasonable, and none of them told you what was actually behind them. The writing gets you the spread; the conversation gets you the meaning.']
    ],
    anim: anim(8400, [
      { at: 600,  do: el => cls(el, '.pref', 'on', 0) },
      { at: 2400, do: el => cls(el, '.pref', 'on', 1) },
      { at: 4200, do: el => cls(el, '.pref', 'on', 2) },
      { at: 6000, do: el => cls(el, '.pref', 'on', 3) },
      { at: 8000, do: el => cls(el, '.pref', 'on', false) }
    ]),
    body: () => `
      <div class="stack">
        <div class="grid4">
          ${['Yours', 'T', 'H', 'A2'].map((who, i) => `
            <div class="card pref ${i === 0 ? 'card--yours' : ''}" data-i="${i}">
              <span class="tag ${i === 0 ? 'tag--maroon' : ''}">${who}</span>
              ${['Hours', 'Feedback', 'Cadence'].map(f => `<div style="display:flex;flex-direction:column;gap:3px">
                <span style="font-size:9px;color:var(--mute-2)">${f}</span>${W.bar('72%', 'faint')}</div>`).join('')}
              <div class="ctx" style="margin-top:auto;opacity:0;transition:opacity .4s">
                <span class="s-cap" style="font-style:italic;font-size:10.5px">The context behind the answer</span></div>
            </div>`).join('')}
        </div>
      </div>
      <style>.pref.on{background:var(--soft);border-color:var(--soft-deep)}.pref.on .ctx{opacity:1}</style>`
  },

  {
    id: 's3f8', stage: 3, kind: 'exercise', verb: 'DO', action: 'Agree',
    label: 'Agreeing on the norms',
    summary: 'With the preferences on the table, user takes part in turning a generic norms template into specific commitments for this team.',
    beats: [
      'This is the live activity of the stage and where most of the time should go.',
      'Where submitted preferences conflict, the conflict is on screen and gets resolved with them in the room.'
    ],
    notes: [
      ['Prompt', 'Says the template only supplies categories, and that what is needed is the specific version for this team on this project.'],
      ['Beat', 'Each line fills and is agreed in turn.'],
      ['Note', 'Norms named on Day 1 are norms you can point to in week four. Norms that were never named do not exist, and the person who suffers most is usually the most junior person on the team.']
    ],
    anim: anim(8000, [
      { at: 700,  do: el => $$('.norm', el).forEach((n, i) => n.classList.toggle('on', i === 0)) },
      { at: 2400, do: el => $$('.norm', el).forEach((n, i) => n.classList.toggle('on', i <= 1)) },
      { at: 4100, do: el => $$('.norm', el).forEach((n, i) => n.classList.toggle('on', i <= 2)) },
      { at: 5800, do: el => $$('.norm', el).forEach(n => n.classList.add('on')) },
      { at: 7700, do: el => $$('.norm', el).forEach(n => n.classList.remove('on')) }
    ]),
    body: () => `
      <div class="stack">
        <div style="flex:1;min-height:0;display:flex;flex-direction:column;gap:12px;justify-content:center">
          ${['Working hours and response times', 'How we give and take feedback',
             'Meeting cadence and who runs what', 'Document conventions and version control'].map((c, i) => `
            <div class="norm" data-i="${i}" style="display:flex;gap:16px;align-items:center;padding:11px 12px;border-radius:3px;transition:background .35s">
              <span style="width:236px;flex-shrink:0;font-size:12.5px;color:var(--ink-strong);font-weight:700">${c}</span>
              <div class="norm-fill" style="flex:1;border:1px dashed var(--rule);border-radius:3px;height:26px;transition:all .35s"></div>
              <span class="norm-ok s-micro" style="flex-shrink:0;opacity:0;transition:opacity .35s;color:var(--maroon)">Agreed</span>
            </div>`).join('')}
        </div>
      </div>
      <style>.norm.on{background:var(--soft)}.norm.on .norm-fill{border-style:solid;border-color:var(--maroon);background:var(--paper)}
        .norm.on .norm-ok{opacity:1}</style>`
  },

  {
    id: 's3f9a', stage: 3, kind: 'argument', verb: 'READ', action: 'Next',
    label: 'Why the afternoon mattered',
    summary: 'User is shown what the afternoon session produced and why each part of it matters.',
    beats: [],
    body: () => `
      <div class="stack">
        <h2 class="s-h1">Why the core team kick-off mattered</h2>
        <div style="flex:1;min-height:0">${claims([
          'The storyline is the skeleton of the final deliverable, not a document invented later. On this project the claims agreed in the morning became the sections of a published report.',
          'Norms named on Day 1 are norms you can point to in week four. The alternative is everyone guessing, and the most junior person guessing hardest.',
          'This is the one session of Day 1 that belongs entirely to the team, and it works better without the Partner, because a plan the team built is a plan the team owns.'
        ])}</div>
      </div>`
  },

  {
    id: 's3check', stage: 3, kind: 'check', verb: 'READ', action: 'Next',
    label: 'The afternoon checklist',
    summary: 'User can check what their role owed the afternoon session and what should exist when it ends.',
    beats: [],
    anim: anim(7000, [{ at: 300, do: el => tabCycle(el, 0) }, { at: 3600, do: el => tabCycle(el, 1) }]),
    tabsData: () => [
      { label: 'Process · has this happened?', html: roles({ head: 'Checklist items', body: [
        ['P/AP', ['Stepped out and let the core team build the plan', 'Agreed on when you will review the storyline and workplan']],
        ['SPM/PM', ['Sent the deck and collected preferences beforehand', 'Drafted a first-cut storyline from the tree', 'Drafted a research plan and workplan with gaps left visible', 'Ran the norms conversation', 'Said your own preferences out loud']],
        ['SC/C', ['Filled in your preferences honestly beforehand', 'Flagged relevant past experience', 'Suggested sources or activities', 'Added the context behind your own preferences']],
        ['AC/AN', ['Filled in your preferences honestly beforehand', 'Flagged experience, including from before Dalberg', 'Understood which part of the storyline you are on', 'Added the context behind your own preferences']]
      ]})},
      { label: 'Output · this is complete', html: roles({ head: 'This is complete', body: [
        ['P/AP', ['Review points are in the calendar']],
        ['SPM/PM', ['Dot-dash storyline exists, written by one person', 'Research plan exists with sources against each section', 'Workplan exists with milestones and a client cadence', 'Agreed norms are written where the team can see them']],
        ['SC/C and AC/AN', ['You know which part of the storyline you are likely to own', 'You can name three agreed norms without looking']]
      ]})}
    ]
  },

  /* --------------------------- PD ALIGNMENT ----------------------------- */
  {
    id: 's4map', stage: 4, kind: 'map', verb: 'READ', action: 'Begin',
    label: 'Three stages complete',
    summary: 'User sees the next stage open, and that it is the one they are not in.',
    beats: [],
    body: () => `<div class="stack"><div class="maphead"><h2 class="s-h1">Three stages behind you. The next one happens without you in the room, between the two Partner Directors.</h2></div>${map5(3)}</div>`
  },

  {
    id: 's4intro', stage: 4, kind: 'intro', verb: 'READ', action: 'Begin',
    label: 'What PD alignment covers',
    summary: 'User learns the two Partners meet without them to agree how they will run the project, and that the note they produce is written for the team.',
    beats: ['The only stage the learner is not in the room for.'],
    notes: [
      ['Copy', 'A line explaining the two Partners meet at the end of the day, and that the note they produce is for the learner.']
    ],
    body: () => `
      <div class="stack">
        <div><h2 class="s-h1">PD alignment on responsibilities</h2><p class="s-cap" style="margin:0">About XX minutes between two people at the end of the day. It is the only part of Day 1 you are not in the room for.</p></div>
        ${objectives(
          ['Tell the PDs what you need from the split before they meet',
           'Read the note they send afterwards',
           'Work out what each line means for your week'],
          ['Say who to go to for what on your project',
           'Know when to expect feedback, and that you can ask sooner'])}
      </div>`
  },

  {
    app: 'outlook',
    id: 's4f1', stage: 4, kind: 'sim', verb: 'DECIDE', action: 'Reply or skip',
    label: 'Asked before the meeting',
    summary: 'At the end of the day the two Partners meet without the team. Beforehand, user is asked whether they need anything built into how they split the work.',
    beats: [
      'The exclusion is explained rather than glossed over.',
      'Replying is genuinely optional, and skipping costs nothing.'
    ],
    notes: [
      ['Calendar', 'A greyed-out block at the end of the day showing only the two Partners.'],
      ['Teams', 'A Partner asking whether anyone needs anything built into the split before the two of them meet.'],
      ['Note', 'This stage was added to Day 1 because of the 2025 Pulse survey: people could not tell when their PD would be involved, and feedback arrived too late to act on.']
    ],
    anim: anim(5400, [
      { at: 900, do: el => { const t = $('.w-toast', el); if (t) { t.style.animation = 'none'; void t.offsetWidth; t.style.animation = 'toastin .42s both'; } } }
    ]),
    body: () => `<div style="display:flex;height:100%;position:relative">${W.outlook({
      rows: [{ from: '40%', subject: '58%', preview: '62%' }, { from: '34%', subject: '48%', preview: '54%' }],
      pane: false
    })}${W.toast({ action: 'Reply', delay: 900 })}</div>`
  },

  {
    app: 'teams',
    id: 's4f2', stage: 4, kind: 'sim', verb: 'READ', action: 'Next',
    label: 'The responsibilities note',
    summary: 'User reads the one artefact this stage produces: five lines telling them who leads what, how location affects reviews, and when feedback will come.',
    beats: [
      'Short enough to read without scrolling, and specific enough to hold someone to.',
      'The clearest statement they will get of what to expect from the two most senior people on the project.'
    ],
    notes: [
      ['Note', 'How the two Partners are splitting the project, so nobody has to guess.'],
      ['Beat', 'The note arrives in the channel and its lines resolve one at a time.']
    ],
    anim: anim(7600, [
      { at: 600,  do: el => $$('.nl', el).forEach((n, i) => setTimeout(() => n.classList.add('in'), i * 420)) },
      { at: 7200, do: el => $$('.nl', el).forEach(n => n.classList.remove('in')) }
    ]),
    body: () => W.teamsChat({
      messages: [{ from: '32%', lines: ['92%'], live: true }],
      attached: `<div style="margin:8px 0 0;border:1px solid var(--soft-deep);background:var(--soft);border-radius:3px;padding:12px 14px;display:flex;flex-direction:column;gap:9px">
        ${['Who leads the hypothesis and the content',
           'Who leads the client and the energy-side analysis',
           'Location, and what it means for review style',
           'How coaching splits between the two',
           'Feedback within a day of each checkpoint'].map((l, i) =>
          `<div class="nl" style="display:flex;gap:9px;align-items:baseline;opacity:0;transform:translateX(-4px);transition:all .35s">
            <span style="font-size:9px;color:var(--maroon);font-weight:700">${i + 1}</span>
            <span style="font-size:11px;color:var(--ink);line-height:1.4">${l}</span></div>`).join('')}
      </div><style>.nl.in{opacity:1;transform:none}</style>`
    })
  },

  {
    id: 's4f2b', stage: 4, kind: 'exercise', verb: 'EXPLORE', action: 'Next',
    label: 'What it means for your week',
    summary: 'User is walked from each line of the note to what it actually changes about how they work next week.',
    beats: [
      'Two senior people, and routing a question to the wrong one costs time.',
      'Offline reviews change how you have to write things up.',
      'Feedback within a day is an entitlement, so asking for it is not chasing.'
    ],
    notes: [
      ['Translation', 'Each line of the note set against what it changes about the learner’s week.'],
      ['Beat', 'The rows open one at a time as the learner taps through them.']
    ],
    anim: anim(8400, [
      { at: 700,  do: el => cls(el, '.trow', 'on', 0) },
      { at: 3200, do: el => cls(el, '.trow', 'on', 1) },
      { at: 5700, do: el => cls(el, '.trow', 'on', 2) },
      { at: 8100, do: el => cls(el, '.trow', 'on', false) }
    ]),
    body: () => `
      <div class="stack" style="justify-content:center;gap:0">
        ${[['On the workstream split', 'Content questions to one, client questions to the other. Crossing over gets a slower and less useful answer.'],
           ['On location', 'Reviews will be offline more often than live, so a document has to make sense without you talking over it.'],
           ['On feedback', 'You are entitled to it within a day of each checkpoint. Asking for it is following the note, not chasing.']]
          .map(([k, v], i) => `
          <div class="trow" data-i="${i}" style="display:grid;grid-template-columns:200px 1fr;gap:var(--s4);padding:18px 12px;border-top:1px solid ${i ? 'var(--rule-soft)' : 'var(--rule)'};transition:background .35s">
            <span style="font-size:12.5px;font-weight:700;color:var(--ink-strong)">${k}</span>
            <span class="s-body" style="color:var(--mute)">${v}</span>
          </div>`).join('')}
      </div>
      <style>.trow.on{background:var(--soft)}.trow.on span:first-child{color:var(--maroon)}</style>`
  },

  {
    id: 's4f3a', stage: 4, kind: 'argument', verb: 'READ', action: 'Next',
    label: 'Why PD alignment mattered',
    summary: 'User learns why this stage was added, and what twenty minutes of written agreement prevents.',
    beats: [],
    body: () => `
      <div class="stack">
        <h2 class="s-h1">Why PD alignment mattered</h2>
        <div style="flex:1;min-height:0">${claims([
          'The 2025 Pulse survey found that people could not tell when their PD would be involved in the work.',
          'It also found that feedback arrived at the end of the project, when it was too late to act on.',
          'Both point at the same gap: nobody had written down how the PDs would show up, so everyone was guessing.'
        ])}</div>
      </div>`
  },

  {
    id: 's4check', stage: 4, kind: 'check', verb: 'READ', action: 'Next',
    label: 'The PD alignment checklist',
    summary: 'User can check what the split had to cover and what should exist afterwards.',
    beats: [],
    anim: anim(7000, [{ at: 300, do: el => tabCycle(el, 0) }, { at: 3600, do: el => tabCycle(el, 1) }]),
    tabsData: () => [
      { label: 'Process · has this happened?', html: roles({ head: 'Checklist items', body: [
        ['P/AP', ['Asked the team what they need from the split', 'Agreed on who leads the hypothesis and who leads the client', 'Agreed on how coaching splits and how location affects review', 'Agreed on a feedback cadence tied to checkpoints', 'Written it down and sent it']],
        ['SPM/PM', ['Received the note and know what to route where', 'Put the agreed feedback points in the calendar']],
        ['SC/C and AC/AN', ['Read the note', 'Know who to go to on content and who on client work', 'Know when to expect feedback, and that you can ask sooner']]
      ]})},
      { label: 'Output · this is complete', html: roles({ head: 'This is complete', body: [
        ['P/AP', ['A written note covering hypothesis lead, client lead, coaching split, review style and feedback cadence']],
        ['SPM/PM', ['Checkpoints and feedback points are in the calendar']],
        ['SC/C and AC/AN', ['You could answer, without asking anyone, who signs off your work']]
      ]})}
    ]
  },

  /* --------------------------- WEEK 1 PREVIEW --------------------------- */
  {
    id: 's5map', stage: 5, kind: 'map', verb: 'READ', action: 'Begin',
    label: 'Four stages complete',
    summary: 'User sees the last item open, and that it is a preview rather than a stage.',
    beats: [],
    body: () => `<div class="stack"><div class="maphead"><h2 class="s-h1">Four stages behind you. What is left is a preview of the week that follows, rather than a part of Day 1 itself.</h2></div>${map5(4)}</div>`
  },

  {
    id: 's5intro', stage: 5, kind: 'intro', verb: 'READ', action: 'Begin',
    label: 'What the Week 1 preview covers',
    summary: 'User is told this is not part of Day 1 and is not being standardised, and that it exists only to show where today’s outputs end up.',
    beats: [],
    notes: [
      ['Copy', 'A line explaining Week 1 is included only so the learner can see where today’s outputs go.']
    ],
    body: () => `
      <div class="stack">
        <div><h2 class="s-h1">Week 1</h2><p class="s-cap" style="margin:0">This is out of scope for Day 1, and it is included only so you can see where the things you made today actually end up.</p></div>
        ${objectives(
          ['Watch the hypothesis tree become the workplan, the storyline and then the deck',
           'Watch the four Day 1 artefacts expand across the first week',
           'See what happens when evidence contradicts a claim'],
          ['Explain how the four Day 1 outputs are one object drawn four ways',
           'Explain why a hypothesis changing is the process working rather than failing'])}
      </div>`
  },

  {
    id: 's5f0', stage: 5, kind: 'exercise', verb: 'WATCH', action: 'Next',
    label: 'The four artefacts are one object',
    summary: 'Before the week starts, user watches the hypothesis tree tilt over — every branch becoming a row of the workplan, every row a section of the dot-dash storyline, and every section the lead line at the top of a page of the deck.',
    beats: [
      'One object the whole way through, redrawn four times, rather than four separate documents.',
      'The claim argued about in the morning is the line at the top of the page in week one.',
      'It runs as a loop, because this is the move people most consistently miss.'
    ],
    carry: { read: ['tree'] },
    notes: [
      ['Beat', 'The tree stands upright, tips over, and the branches land as workplan rows. Those rows pick up dashes and dots, then open out into pages.'],
      ['Definition', 'A line naming what stays constant across all four: the claim. The artefact changes around it; the claim does not.'],
      ['Note', 'This answers the question people ask at the end of Day 1 — why they made four things instead of one. They did not. They made one thing and drew it four ways.']
    ],
    anim: anim(12000, [
      { at: 200,  do: el => mstage(el, 0) },
      { at: 2600, do: el => mstage(el, 1) },
      { at: 3900, do: el => mstage(el, 2) },
      { at: 6600, do: el => mstage(el, 3) },
      { at: 9200, do: el => mstage(el, 4) }
    ]),
    body: () => `
      <div class="stack">
        <div class="mrail">
          ${['Hypothesis tree', 'Workplan', 'Dot-dash storyline', 'Lead lines on the deck'].map((s, i) =>
            `${i ? '<i class="mrail__a">&rarr;</i>' : ''}<span class="mrail__s">${s}</span>`).join('')}
        </div>
        <div class="focus morph" data-phase="0" style="flex:1;min-height:0">
          <div class="morph__claim">${W.bar('58%', 'strong')}</div>
          <div class="morph__rows">
            ${[['72%', '56%', '46%'], ['66%', '52%', '42%'], ['78%', '60%', '48%']].map(w => `
              <div class="mrow">
                <span class="mrow__mark"></span>
                <span class="mrow__main">
                  ${W.bar(w[0], 'strong')}
                  <span class="mrow__kids">
                    <span class="mkid"><i class="mkid__dot"></i>${W.bar(w[1], 'faint')}</span>
                    <span class="mkid"><i class="mkid__dot"></i>${W.bar(w[2], 'faint')}</span>
                  </span>
                </span>
                <span class="mrow__meta"><i class="mchip"></i><i class="mchip"></i><i class="mspan" style="width:46px"></i></span>
                <i class="mslide"></i>
              </div>`).join('')}
          </div>
          <div class="mfilm">${Array.from({ length: 10 }, (_, i) =>
            `<i class="${[1, 4, 7].indexOf(i) > -1 ? 'on' : ''}"></i>`).join('')}</div>
        </div>
      </div>`
  },

  {
    id: 's5f1', stage: 5, kind: 'exercise', verb: 'WATCH', action: 'Next',
    label: 'The artefacts grow, one claim fails',
    summary: 'Having seen the four artefacts as one object, user jumps forward a week and watches each of them fill out day by day, and one branch of the hypothesis tree fail.',
    beats: [
      'The storyline becomes a deck with a page count; the plan gets names and dates.',
      'The fact pack thickens as colleagues drop things into it.',
      'The claim that did not survive is the one that saved the most time.'
    ],
    carry: { read: ['tree', 'facts'] },
    notes: [
      ['Beat', 'A day counter runs Monday to Friday while all four artefacts expand in sequence.'],
      ['Note', 'By Friday the tree has already changed. The claim that did not survive is the one that saved the team the most time, because it stopped four weeks of research pointing the wrong way.']
    ],
    anim: anim(9000, [{ at: 300, do: el => week(el) }]),
    body: () => `
      <div class="stack">
        <div style="display:flex;gap:24px;flex-shrink:0">
          ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d, i) =>
            `<span class="day s-micro" data-i="${i}" style="transition:color .3s">${d}</span>`).join('')}
        </div>
        <div class="grid4">
          ${['Storyline', 'Research plan', 'Fact pack', 'Hypothesis tree'].map((c, i) => `
            <div class="card ${i === 3 ? 'card--focus' : ''}">
              <span class="tag ${i === 3 ? 'tag--maroon' : ''}">${c}</span>
              <div class="wk" data-i="${i}" style="display:flex;flex-direction:column;gap:6px;flex:1"></div>
            </div>`).join('')}
        </div>
      </div>`
  },

  {
    app: 'ppt',
    id: 's5f2', stage: 5, kind: 'sim', verb: 'READ', action: 'Next',
    label: 'Reviewing the deck while it is empty',
    summary: 'As the storyline becomes a deck, user sees the first review land on it while it is still empty, aimed at argument and structure.',
    beats: [
      'There is no prose yet, so there is nothing to comment on but the argument.',
      'The review markers match the responsibilities note exactly — the first proof it is being kept.'
    ],
    notes: [
      ['Copy', 'Explains the comments land on argument and structure, because there is no prose in the deck yet.'],
      ['Note', 'Fixing an argument costs an afternoon at this stage and a fortnight once the slides are full.']
    ],
    anim: anim(6600, [
      { at: 900,  do: el => $$('.rvw', el).forEach((n, i) => n.classList.toggle('in', i === 0)) },
      { at: 3000, do: el => $$('.rvw', el).forEach(n => n.classList.add('in')) },
      { at: 6200, do: el => $$('.rvw', el).forEach(n => n.classList.remove('in')) }
    ]),
    body: () => W.powerpoint({
      thumbs: 10, at: 2, notes: false,
      slide: `<div style="display:flex;flex-direction:column;gap:10px;height:100%;position:relative">
        ${W.bar('64%', 'strong')}
        <div style="flex:1;border:1px dashed var(--rule);border-radius:2px"></div>
        <div style="position:absolute;top:0;right:0;display:flex;flex-direction:column;gap:6px;align-items:flex-end">
          <span class="rvw" style="opacity:0;transform:translateX(6px);transition:all .4s;font-size:7.5px;background:var(--soft);color:var(--maroon);padding:3px 7px;border-radius:2px;font-weight:700">live · content</span>
          <span class="rvw" style="opacity:0;transform:translateX(6px);transition:all .4s;font-size:7.5px;background:var(--fill-2);color:var(--mute);padding:3px 7px;border-radius:2px;font-weight:700">offline · client</span>
        </div></div>
      <style>.rvw.in{opacity:1;transform:none}</style>`
    })
  },

  {
    id: 's5f3', stage: 5, kind: 'argument', verb: 'READ', action: 'Next',
    label: 'Why the preview was worth showing',
    summary: 'User is shown why finding a claim wrong in week one is the cheap outcome.',
    beats: [],
    notes: [
      ['Note', 'This stage has no checklists, because it is a preview rather than a part of Day 1.']
    ],
    body: () => `
      <div class="stack">
        <h2 class="s-h1">Why Week 1 was worth showing</h2>
        <div style="flex:1;min-height:0">${claims([
          'The tree changing in week one is exactly what a Day 1 hypothesis is for. Getting it wrong early is cheap; getting it wrong late is not.',
          'Reviewing a ghost deck costs an afternoon. Reviewing a full deck costs a fortnight.',
          'Day 1 is what makes the early review possible, because it produces something reviewable.'
        ])}</div>
      </div>`
  },

  /* ------------------------------- CLOSE -------------------------------- */
  {
    id: 'fin1', stage: 6, kind: 'vault', verb: 'EXPLORE', action: 'Next',
    label: 'Everything you made, and what stays',
    summary: 'User gets the full trail of what Day 1 produced, the templates that stay available afterwards, and a record of what they personally contributed.',
    beats: ['Three views of the same thing: the artefacts, the vault, and their own record.'],
    carry: { read: ['scq', 'tree', 'prefs', 'facts'] },
    anim: anim(9000, [
      { at: 200,  do: el => vault(el, 0) },
      { at: 3200, do: el => vault(el, 1) },
      { at: 6200, do: el => vault(el, 2) }
    ]),
    body: () => `
      <div class="stack">
        ${tabs(['Artefact trail', 'Your vault', 'How it went'], 0)}
        <div class="vault-body" style="flex:1;min-height:0;overflow:hidden"></div>
      </div>`
  },

  {
    id: 'fin2', stage: 6, kind: 'argument', verb: 'READ', action: 'Next',
    label: 'What happened to the real hypothesis',
    summary: 'To close, user finds out what became of the five claims the team committed to on Day 1.',
    beats: [],
    body: () => `
      <div class="stack">
        <h2 class="s-h1">One last look at the real hypothesis</h2>
        <div style="flex:1;min-height:0">${claims([
          'The team committed to five claims, written before any evidence existed, with a placeholder still sitting in the recommendations.',
          'Four of those five made it into the published report. One did not survive the interviews.',
          'The strongest argument in the final report was not on the Day 1 slide at all.'
        ])}</div>
        <div class="focus focus--tight" style="flex-shrink:0">
          <span class="s-cap" style="font-style:italic">Not right, but specific enough to be tested, and clear enough that four weeks of research knew where to point.</span>
        </div>
      </div>`
  },

  {
    id: 'fin3', stage: 6, kind: 'splash', verb: 'READ', action: 'Close',
    label: 'The training is complete',
    summary: 'User is told they are done and that everything stays available if they want to come back to it.',
    beats: [],
    notes: [
      ['Copy', 'Confirms everything stays available here and on the Hub, and that the learner can come back at any time.']
    ],
    body: () => `
      <div class="stack" style="justify-content:center;align-items:center;text-align:center;gap:var(--s3)">
        <h1 class="s-display">You have reached the end of the Day 1 training.</h1>
        <p class="s-cap" style="max-width:52ch;margin:0">Your checklists, your templates and your own record of the day stay available here and on the Hub, and you can come back to any of it whenever you want.</p>
      </div>`
  }

  ];

  /* ==========================================================================
     ANIMATION HELPERS
     ======================================================================= */

  /* the coach points at a field and says one useful thing about it */
  function coach(el, field, msg, pass) {
    $$('[data-fld]', el).forEach(n => n.classList.toggle('flagged', !!field && n.dataset.fld === field));
    const box = $('[data-coach]', el);
    const m = $('.coach__msg', el);
    const p = $('[data-pass]', el);
    if (box) box.classList.toggle('on', !!pass);
    if (m && msg) m.textContent = msg;
    if (p) p.textContent = pass ? 'Pass ' + pass : '';
  }

  function setScore(el, a, b, c) {
    [a, b, c].forEach((v, k) => {
      if (v === undefined) return;
      const f = el.querySelector('.sc-fill[data-k="' + k + '"]');
      const p = el.querySelector('.sc-pct[data-k="' + k + '"]');
      if (f) { f.style.width = v + '%'; f.style.background = v >= 80 ? 'var(--maroon)' : 'var(--mute-2)'; }
      if (p) p.textContent = v ? v + '%' : '—';
    });
  }

  const OBJ = [
    'The PM: we are deciding what to test first, not deciding the answer today.',
    'The Partner: a claim specific enough to be wrong is more useful than a summary that cannot be.',
    'The SPM: your view will be rough, and rough is the expected standard on Day 1.',
    'The Partner: we write it down where everyone can see it, then spend four weeks trying to break it.'
  ];

  function flip(el, i) {
    $$('.obj', el).forEach((n, k) => n.classList.toggle('on', k === i));
    const t = $('.reply-txt', el);
    if (t) t.textContent = i < 0 ? '—' : OBJ[i];
  }

  const PAIRS = [
    [[['88%', 'faint'], ['72%', 'faint']], [['94%', ''], ['86%', ''], ['58%', '']]],
    [[['54%', 'faint']], [['92%', ''], ['88%', ''], ['76%', ''], ['46%', '']]]
  ];

  function pair(el, i) {
    $$('.tabs span', el).forEach((n, k) => n.classList.toggle('on', k === i));
    const l = $('.pair-l', el), r = $('.pair-r', el);
    if (l) l.innerHTML = W.bars(PAIRS[i][0]);
    if (r) r.innerHTML = W.bars(PAIRS[i][1]);
  }

  /* a branch fills in as if it were being typed */
  function ttype(el, slot) {
    const n = el.querySelector('.tnode--slot[data-s="' + slot + '"]');
    if (!n) return;
    n.classList.add('typing');
    const body = n.querySelector('.tnode__body');
    body.classList.remove('tnode__empty');
    body.innerHTML = '<i class="bar grow" style="width:0"></i><i class="bar grow bar--faint" style="width:0"></i>';
    const bars = body.querySelectorAll('.grow');
    setTimeout(() => { bars[0].style.width = '86%'; }, 40);
    setTimeout(() => { bars[1].style.width = '54%'; }, 380);
    setTimeout(() => { n.classList.remove('typing'); n.classList.add('filled'); }, 800);
  }
  function tfix(el, slot) {
    const n = el.querySelector('.tnode--slot[data-s="' + slot + '"]');
    if (!n) return;
    n.classList.add('flagged');
    setTimeout(() => {
      n.classList.remove('flagged');
      const b = n.querySelectorAll('.grow');
      if (b[0]) b[0].style.width = '94%';
      if (b[1]) b[1].style.width = '68%';
    }, 900);
  }
  function tclear(el, slot) {
    const n = el.querySelector('.tnode--slot[data-s="' + slot + '"]');
    if (!n) return;
    n.classList.remove('filled', 'flagged', 'typing');
    const body = n.querySelector('.tnode__body');
    body.classList.add('tnode__empty');
    body.innerHTML = 'Type a sub-claim…<i class="caret"></i>';
  }
  function treset(el) {
    [0, 1, 2, 3].forEach(i => tclear(el, i));
    const r = $('.trow', el); if (r) r.classList.remove('four');
    const d = $('.tdrill', el); if (d) d.classList.remove('in');
    coach(el, '', 'Waiting for your first branch.', 0);
  }

  function drop(el, slot, b) {
    const s = el.querySelector('.slot[data-s="' + slot + '"]');
    const n = el.querySelector('.bnk[data-b="' + b + '"]');
    if (s) { s.classList.add('filled'); s.textContent = 'Candidate ' + (b + 1); }
    if (n) n.classList.add('used');
  }
  function unfill(el, slot) {
    const s = el.querySelector('.slot[data-s="' + slot + '"]');
    if (s) { s.classList.remove('filled'); s.textContent = 'Branch ' + (slot + 1); }
  }
  function mark(el, b, why) {
    const n = el.querySelector('.bnk[data-b="' + b + '"]');
    if (n) { n.classList.remove('used'); n.classList.add('bad'); const w = $('.why', n); if (w) w.textContent = why; }
  }
  function reset(el) {
    $$('.slot', el).forEach((s, i) => { s.classList.remove('filled'); s.textContent = 'Branch ' + (i + 1); });
    $$('.bnk', el).forEach(n => { n.classList.remove('used', 'bad'); const w = $('.why', n); if (w) w.textContent = '—'; });
    setScore(el, 0, 0, 0);
  }

  function pick(el, card, opt, prog) {
    $$('.fm-card', el).forEach((n, i) => {
      n.classList.toggle('is-active', i === card);
      if (card < 0) $$('.fm-opt', n).forEach(o => o.classList.remove('picked'));
      else if (i === card) $$('.fm-opt', n).forEach((o, k) => o.classList.toggle('picked', k === opt));
    });
    const p = $('.fm-prog i', el);
    if (p) p.style.width = prog + '%';
  }

  function scrub(el, v) {
    const k = $('.scrub-knob', el), l = $('.scrub-l', el), r = $('.scrub-r', el);
    if (k) k.style.left = 'calc(' + v + '% - ' + (v / 100 * 11) + 'px)';
    if (l) l.style.opacity = String(1 - (v / 100) * 0.78);
    if (r) r.style.opacity = String(0.2 + (v / 100) * 0.8);
  }

  const PLAN = [
    [['Pre-project alignment', 4, 15], ['Research sprint', 18, 32], ['Test and revise', 52, 66]],
    [['Pre-project alignment', 4, 17], ['Interviews — 24 Apr to 30 May', 18, 48], ['Test and revise', 52, 90]]
  ];

  function plan(el, i) {
    $$('.tabs span', el).forEach((n, k) => n.classList.toggle('on', k === i));
    const t = $('.tl', el);
    if (!t) return;
    t.innerHTML = PLAN[i].map(([n, a, b]) => `
      <div style="display:flex;align-items:center;gap:16px">
        <span style="width:170px;flex-shrink:0;font-size:12px;color:var(--ink)">${n}</span>
        <div style="flex:1;height:18px;background:var(--fill);border-radius:2px;position:relative">
          <div style="position:absolute;left:${a}%;width:${b - a}%;top:0;bottom:0;background:${i ? 'var(--maroon)' : 'var(--fill-3)'};opacity:${i ? .8 : 1};border-radius:2px;transition:all .6s"></div>
        </div></div>`).join('');
  }

  /* the same three claims, redrawn as each of the four artefacts in turn.
     Every phase is a data-phase value; the CSS does the moving. */
  function mstage(el, p) {
    const w = $('.morph', el);
    if (w) w.setAttribute('data-phase', String(p));
    cls(el, '.mrail__s', 'on', [0, 0, 1, 2, 3][p]);
  }

  function week(el) {
    $$('.wk', el).forEach(c => c.innerHTML = '');
    for (let d = 0; d < 5; d++) {
      setTimeout(() => {
        $$('.day', el).forEach((n, i) => n.style.color = i <= d ? 'var(--ink-strong)' : 'var(--mute-2)');
        $$('.wk', el).forEach((c, ci) => {
          const b = document.createElement('i');
          const red = (ci === 3 && d === 3);
          b.className = 'bar' + (red ? '' : ' bar--faint');
          b.style.width = (48 + ((d * 13 + ci * 7) % 44)) + '%';
          if (red) { b.style.background = 'var(--maroon)'; b.style.height = '6px'; }
          b.style.animation = 'arrive .3s both';
          c.appendChild(b);
        });
      }, d * 1500);
    }
  }

  const VAULT = [
    () => `<div class="trail">
      ${[['Day 0', ['Project folder', 'Context brief', 'Fact pack', 'Your SCQ and problem statement']],
         ['Full-team kick-off', ['Problem statement', 'Hypothesis tree to L2']],
         ['Core team kick-off', ['Dot-dash storyline', 'Research plan', 'Workplan', 'Agreed norms']],
         ['PD alignment', ['Responsibilities note']]].map(([h, items]) => `
        <div class="trail__col"><h4>${h}</h4>
          ${items.map(i => `<div class="trail__item ${/^your/i.test(i) ? 'yours' : ''}">${i}</div>`).join('')}</div>`).join('')}
    </div>`,
    () => `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      ${['Process and output checklists by stage and role', 'Context brief format', 'Fact pack template',
         'SCQ and problem statement guide', 'Dot-dash storyline template', 'Research plan template',
         'Core team kick-off deck', 'PD responsibilities note template'].map(i =>
        `<div class="trail__item">${i}</div>`).join('')}</div>`,
    () => `<div style="display:flex;flex-direction:column;gap:8px">
      ${['Your SCQ and problem statement, and how many passes it took',
         'Your hypothesis tree against the team’s',
         'What you contributed to the research plan',
         'Where your preferences landed against the agreed norms'].map(t =>
        `<div class="trail__item yours">${t}</div>`).join('')}</div>`
  ];

  function vault(el, i) {
    $$('.tabs span', el).forEach((n, k) => n.classList.toggle('on', k === i));
    const b = $('.vault-body', el);
    if (b) b.innerHTML = VAULT[i]();
  }

  function tabCycle(el, i) {
    $$('.tabs button, .tabs span', el).forEach((n, k) => {
      n.classList.toggle('on', k === i);
      n.setAttribute('aria-selected', String(k === i));
    });
    const body = el.querySelector('[data-tabbody]');
    const s = global.CONTENT.SCREENS.find(x => x.id === el.dataset.screen);
    if (body && s && s.tabsData) body.innerHTML = s.tabsData()[i].html;
  }

  /* ==========================================================================
     STAGES — for the map's storyboard view
     ======================================================================= */

  const STAGES = [
    {
      n: 0, name: 'Welcome', short: 'Setting expectations before anything starts',
      about: 'Three screens before the walkthrough proper. They say what the training is and is not, make the case for why the first day of a project deserves this much attention, and lay out the five stages ahead with rough timings. Nothing is asked of the learner here — the point is that they can see the whole shape and the commitment before deciding to start.',
      inputs: ['Nothing. This part is read.'],
      outputs: ['A clear sense of the shape and length of what is coming', 'Permission to leave and come back']
    },
    {
      n: 1, name: 'Day 0', short: 'Getting set up before the project officially starts',
      about: 'This is the set-up part of the project and it happens before the official start. It is supercharged by the Partner sharing a context brief in some format, which the team reads before anyone meets. Everyone then writes their own SCQ and their own reading of the problem statement, separately. Apart from that, the PM runs point on setup: the folder, the Teams channel, the cadence, and chasing the proposal team for anything they already hold.',
      inputs: ['Your own SCQ, drafted from the proposal and the brief', 'Your own reading of the problem statement', 'Facts you pin into the shared fact pack', 'Questions you want to ask at the kick-off'],
      outputs: ['A drafted SCQ that comes back in the kick-off', 'A fact pack the whole team keeps adding to', 'Familiarity with the standard project folder']
    },
    {
      n: 2, name: 'Full-team kick-off', short: 'Where the project’s thinking actually starts',
      about: 'The first time the whole team is in a room, for at least two hours, and always before any client kick-off. The team compares the SCQs they each wrote and finds they do not match, agrees a single problem statement, then hunts for the words in it nobody has defined. The Partner states a hypothesis as a flat claim, the team argues with it, and then drills it down into branches that could actually be tested. It closes with two minutes on what the deliverable is and who reads it.',
      inputs: ['Your SCQ, brought into the room', 'Whichever objection to committing early you actually hold', 'Three sub-claims you place under the top-level claim'],
      outputs: ['An agreed problem statement, with every term defined or logged as a client question', 'A hypothesis tree drilled to L2', 'An agreed deliverable format and primary reader']
    },
    {
      n: 3, name: 'Core team kick-off', short: 'Turning Day 1 into something you can start on tomorrow',
      about: 'A smaller session later the same day, run by the PM, with the Partner deliberately not in it. Most of what the PM brings is already drafted, so the team is reacting to something rather than building from nothing. The hypothesis tree becomes a dot-dash storyline, the research plan gets filled in against it with people flagging what they already know, and the last and longest part is agreeing how the team will actually work together.',
      inputs: ['Your working preferences, submitted in writing beforehand', 'Experience and sources you flag against the research plan', 'The context behind your own preferences, said out loud'],
      outputs: ['A dot-dash storyline that is the skeleton of the deliverable', 'A research plan and a workplan with milestones', 'Written norms specific enough to point to in week four']
    },
    {
      n: 4, name: 'PD alignment', short: 'The two Partners agree how they will run the project',
      about: 'The two Partners meet at the end of the day, without the team, to agree how they split the project between them. Before they do, they ask the team whether anyone needs anything built into that split. What comes out is a short written note: who leads the content, who leads the client, how location affects whether reviews are live or offline, how coaching divides, and when feedback arrives. It exists because the 2025 Pulse survey found people could not tell when their PD would be involved.',
      inputs: ['Anything you need built into the split, said before they meet'],
      outputs: ['A written responsibilities note, short enough to read without scrolling', 'Knowing who signs off your work and when feedback comes']
    },
    {
      n: 5, name: 'Week 1 preview', short: 'Where the Day 1 outputs actually end up',
      about: 'Not part of Day 1 and not what is being standardised. It is here so the learner can see where the four things they built end up. It opens by showing that they are not four things at all: the hypothesis tree tilts over, each branch lands as a row of the workplan, each row becomes a section of the dot-dash storyline, and each section becomes the lead line at the top of a page of the deck. The week then runs, and the artefacts grow — the storyline becomes a ghost deck with a page count, the research plan fills with names and dates, the fact pack thickens as colleagues drop things in, and one branch of the hypothesis tree turns out to be wrong and gets restructured. The first review lands while the deck is still empty.',
      inputs: ['Nothing. This stage is watched.'],
      outputs: ['An understanding of how the four Day 1 outputs are one object drawn four ways', 'An understanding of why a hypothesis changing is the process working', 'A sense of what an early, cheap review looks like']
    },
    {
      n: 6, name: 'Close', short: 'The trail, the vault, and what happened next',
      about: 'The last three screens. The learner sees every artefact Day 1 produced laid out in order, the templates and checklists that stay available afterwards, and a record of what they personally contributed on the way through. It ends on the real project’s hypothesis and what became of it — four of five claims surviving, one not, and the report’s best argument never having been on the Day 1 slide at all.',
      inputs: ['Nothing. This part is read.'],
      outputs: ['Your vault: checklists, templates and formats by stage and role', 'A record of what you contributed']
    }
  ];


  /* ==========================================================================
     RECAP — the agreed table, kept as written. Flags mark where the
     walkthrough differs from it.
     ======================================================================= */

  const RECAP = [
    {
      stage: 'Day 0', activity: 'Preparation',
      outputs: ['Project folder',
                'A sense of client context, problem statement, proposed approach, and key stakeholders'],
      process: ['Set up project folder on OneDrive',
                'Download relevant client documents (e.g. proposal), quick literature review (AI-driven+direct)',
                'Set up initial set of meetings (e.g. IKO Day 1 Problem solving)'],
      content: {
        'PDs': ['Prep Day 0 brief with context, client notes, tensions'],
        'Core team': ['Read the proposal/additional client materials',
                      'Read day 0 brief from PDs',
                      'Review KM to see if similar Dalberg projects exist, consider speaking with teams that have worked in the same sector/clients',
                      'Come up with early questions (e.g., use issue trees, day 1 bot)',
                      'Develop individual hypo trees',
                      'Collate a fact pack for the project']
      },
      why: ['Understanding of client context',
            'Quickly gets teams up to speed',
            'Ensures that IKO is content and brainstorm focused, vs process/PDs talking at teams to get them up to speed'],
      flags: ['The walkthrough shows the project site in SharePoint rather than OneDrive.',
              'The AI-driven literature review and the day 1 bot are not shown anywhere in the walkthrough.',
              'Here each person develops an individual hypo tree. In the walkthrough they draft an SCQ and problem statement, and the tree is built together in the kick-off.']
    },
    {
      stage: 'Day 1', activity: 'IKO',
      outputs: ['Clearly articulated problem statement',
                'Day 1 hypothesis tree',
                'A sense of workstreams and final deliverable Table of Contents (TOC)'],
      process: [],
      content: {
        'PDs': ['Lead content brainstorm, either by (1) coming with exec summary/hypo tree for team, (2) building with the team during IKO, or (3) review PM + team first hypo tree',
                'Communicate additional client contexts/early thoughts to the team'],
        'Core team': ['Discuss and align on day 1 hypo tree/exec summary',
                      'Refine and articulate clear problem statement.',
                      'Align with PD on deliverable format + TOC']
      },
      why: ['Alignment across the team on what we’re aiming for',
            'Help identify what analyses can be prioritized vs deprioritized',
            'Avoid churn and wasted time by establishing what workstreams look like and the type of analyses expected'],
      flags: ['The walkthrough calls this the full-team kick-off, with the content jam.']
    },
    {
      stage: 'Day 1', activity: 'Core team kick-off',
      outputs: ['Dot-dash storyline/exec summary', 'A preliminary research plan',
                'Ownership of workstreams', 'PM-team working and WLB norms'],
      process: ['Schedule 1 hour KO', 'Schedule daily check ins',
                'Fill out WLB norms, working styles, personal development goals'],
      content: {
        'Core team': ['Based on aligned hypo tree, layout what we need to prove, how, and by whom',
                      'Discussion on working and WLB norms (PDs may join for these too)']
      },
      why: ['Clarity over workstreams and research plan',
            'Outlines expectations and preferences across the team'],
      flags: ['Personal development goals are listed here but are not covered in the walkthrough’s norms conversation.']
    },
    {
      stage: 'Day 1', activity: 'PD alignment on responsibilities',
      outputs: ['Note from PDs explaining how they intend to engage with team and split responsibilities'],
      process: ['30min call between co-PDs'],
      content: {
        'PDs': ['Agree on what role each PD will play (e.g., content review vs client lead)',
                'Communicate expectations to the team']
      },
      why: ['Clarity across team on which PD to go to for what'],
      flags: ['The walkthrough adds a step before the call, where the team is asked what they need built into the split.']
    },
    {
      stage: 'Week 1', activity: 'Storylining',
      outputs: ['Storyline of final deliverable'],
      process: [],
      content: {
        'PM': ['Build skeleton deck - executive summary forms lead line, workplan forms body of the slide']
      },
      why: ['Provides proposed ‘final answer’ for team to fill out'],
      flags: ['The walkthrough treats Week 1 as a preview the learner watches, not a stage they go through.']
    }
  ];

  const PROGRESS = { 0: -1, 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5 };

  const CARRY = [
    { k: 'scq',   label: 'SCQ' },
    { k: 'tree',  label: 'Tree' },
    { k: 'prefs', label: 'Preferences' },
    { k: 'facts', label: 'Facts' }
  ];

  global.CONTENT = { SCREENS, STAGES, MAP5, PROGRESS, CARRY, RECAP };

})(window);

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

  const copy = (tag, spec) =>
    `<div class="copy"><span class="copy__tag">${tag}</span><span class="copy__spec">${spec}</span></div>`;
  const anno = spec => `<div class="anno"><span class="anno__tag">Note</span><span class="anno__body">${spec}</span></div>`;
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
  const anim = (total, steps) => el => {
    let timers = [];
    const run = () => steps.forEach(s => timers.push(setTimeout(() => { try { s.do(el); } catch (e) {} }, s.at)));
    run();
    const iv = setInterval(() => { timers.forEach(clearTimeout); timers = []; run(); }, total);
    return () => { clearInterval(iv); timers.forEach(clearTimeout); };
  };

  const $ = (sel, el) => el.querySelector(sel);
  const $$ = (sel, el) => Array.from(el.querySelectorAll(sel));
  const cls = (el, sel, c, on) => $$(sel, el).forEach((n, i) => n.classList.toggle(c, on === true || on === i));

  /* --- the five product stages, as the learner sees them ---------------- */

  const MAP5 = [
    { n: 'Day 0',              why: 'Get set up and take on the context',             mins: '6 min'  },
    { n: 'Full-team kick-off', why: 'Build a hypothesis tree, agree the deliverable', mins: '10 min' },
    { n: 'Core team kick-off', why: 'Ways of working, and early ownership',           mins: '10 min' },
    { n: 'PD alignment',       why: 'How the two PDs split the project',              mins: '3 min'  },
    { n: 'Week 1',             why: 'Where today’s outputs end up',                   mins: '2 min'  }
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
        <div style="flex:0 0 calc(20% - 5px)">After staffing note</div>
        <div style="flex:1">The first couple of days of the project</div>
        <div style="flex:0 0 calc(20% - 5px)">What comes after</div>
      </div>`;
  }

  const roles = r => `<table class="roles"><thead><tr><th>Role</th><th>${r.head}</th></tr></thead><tbody>
    ${r.body.map(x => `<tr><td>${x[0]}</td><td>${list(x[1])}</td></tr>`).join('')}</tbody></table>`;

  const scqCard = (who, own, qw) => `
    <div class="card ${own ? 'card--yours' : ''}" style="min-height:0;justify-content:flex-start;gap:0">
      <span class="tag ${own ? 'tag--maroon' : ''}" style="margin-bottom:10px">${who}</span>
      ${[['S', 'Situation'], ['C', 'Complication'], ['Q', 'Question']].map(([k, n], i) => `
        <div style="display:flex;flex-direction:column;gap:6px;padding:11px 0;${i ? 'border-top:1px solid var(--rule-soft);' : ''}">
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
    summary: 'User arrives, learns what they are about to go through and roughly how long it takes, and is told up front that nothing here is assessed.',
    beats: [
      'Sets the frame before anything is asked of them.',
      'Makes clear this is a benchmark to observe, not an exercise to pass.',
      'Says it can be left and picked up again, so nobody feels locked in.'
    ],
    notes: () => copy('Copy', 'Welcome text: what the experience is, roughly how long, and that it is resumable.'),
    body: () => `
      <div class="stack">
        <div><h1 class="s-display">Day 1</h1></div>
        <div class="s-cols" style="flex:1;min-height:0;align-content:start">
          <div class="panel" style="background:var(--soft)">
            <div class="s-eyebrow" style="color:var(--maroon);opacity:.75">What this is</div>
            ${list(['An annotated view of what happens, not an exercise',
                    'One successful instance, as a benchmark',
                    'Not assessed, and returnable at any time'])}</div>
          <div class="panel">
            <div class="s-eyebrow">What this is not</div>
            ${list(['Not a rulebook — projects vary',
                    'Not a substitute for the Craft document',
                    'Not the only training you will get'])}</div>
        </div>
      </div>`
  },

  {
    id: 's0b', stage: 0, kind: 'argument', verb: 'READ', action: 'Next',
    label: 'Why the first day matters',
    summary: 'User is given the case for why Day 1 deserves this much attention, before being asked to spend time on it.',
    beats: [
      'Four reasons, each one a claim they could argue with.',
      'Establishes that the first day shapes the ten weeks after it.'
    ],
    notes: () => anno('Day 1 does not have to be a single day. It can spread across several. However it runs, this is the start the learner should expect to get.'),
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
    decision: 'The deck’s stage map repeats one description across Core team KO, PD alignment and Week 1, and every duration reads “X mins”. Durations here are taken from each stage intro.',
    body: () => `<div class="stack"><h2 class="s-h2">Five stages, about half an hour</h2>${map5(-1)}</div>`
  },

  /* ------------------------------- DAY 0 -------------------------------- */
  {
    id: 's1map', stage: 1, kind: 'map', verb: 'READ', action: 'Begin',
    label: 'Day 0 opens',
    summary: 'User sees the first stage unlock and the remaining four still closed, so progress through the whole experience stays legible.',
    beats: ['A version of this screen sits between every stage.'],
    body: () => `<div class="stack">${map5(0)}</div>`
  },

  {
    id: 's1intro', stage: 1, kind: 'intro', verb: 'READ', action: 'Begin',
    label: 'What Day 0 covers',
    summary: 'User learns that Day 0 is everything between being staffed and walking in prepared, and what they will personally have to produce.',
    beats: [
      'Sets the expectation of about an hour of work spread over a few days.',
      'Names the outputs they own before the kick-off: an SCQ and a problem statement.'
    ],
    notes: () => copy('Copy', 'A line saying Day 0 happens in the learner’s own time across a few days, and adds up to about an hour of real work.'),
    body: () => `
      <div class="stack">
        <div><h2 class="s-h1">Day 0</h2><p class="s-cap" style="margin:0">Between being staffed and walking into the kick-off prepared.</p></div>
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
    summary: 'User watches the project land in their inbox and clocks that the only thing asked of them before the kick-off is to skim the proposal.',
    beats: [
      'The staffing note is the entire brief at this point — project, client, dates, team.',
      'A second email from the PM takes the setup work off the team.',
      'Nothing heavy is demanded, which is the reassurance a new joiner needs.'
    ],
    notes: () => copy('Email 1', 'The staffing note. Names the project, the client, the start and end dates and who else is on the team, with the proposal attached.')
      + copy('Email 2', 'From the PM. Welcomes the team and names one action — scan the proposal. She takes the setup onto herself.')
      + copy('Beat', 'The staffing note is open on arrival. The PM’s email drops in below it a few seconds later.'),
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
    summary: 'User is walked through the standard project folder so it already looks familiar the first time they are staffed for real.',
    beats: [
      'Every folder is open — this is about recognition, not hunting for something.',
      'Two folders are drawn out because the next two screens happen in them.'
    ],
    notes: () => copy('Teams', 'A message from the PM confirming she has set the folder up, and inviting anyone to add what is missing.')
      + copy('Beat', 'The two folders that matter take the highlight in turn, gently.')
      + anno('When the learner is staffed for real, this structure should already look familiar rather than being one more new thing to work out.'),
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
    summary: 'User sees the proposal and a past qual being skimmed rather than studied, which sets the expected effort for Day 0.',
    beats: ['Models the pace: fast, and looking for what already exists.'],
    notes: () => copy('Beat', 'Two documents open and scroll past quickly, over a few seconds.')
      + anno('The previous screen told the learner to read the proposal. This one shows it being read, because showing the pace works better than describing it.'),
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
    summary: 'User reads the Partner’s context brief and pins the facts worth keeping, which builds a shared fact pack the whole team draws on.',
    beats: [
      'The brief lands before the meeting, so senior input is already in play.',
      'Its third section, key tensions, is the part a proposal never contains.',
      'Anything pinned is carried forward and visible to everyone.'
    ],
    carry: { write: ['facts'] },
    notes: () => copy('Teams', 'A message from the Partner posting the brief, listing its three parts: sector and project context, client notes, and key tensions.')
      + copy('Callout', 'A note explaining Partners generate these briefs from a standard skill, and that the learner will get one.')
      + copy('Beat', 'A pin control sits beside each fact and lights as it is pinned.'),
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
    summary: 'User is asked, along with everyone else including the PM, to draft their own SCQ before the meeting — nobody is handed the answer.',
    beats: [
      'The task arrives while they are still reading, so it lands in context.',
      'Framed as everyone drafting separately, not one person being assigned it.'
    ],
    notes: () => copy('Teams', 'A message from the PM asking everyone to write their own SCQ and their own reading of the problem statement before the meeting.')
      + copy('Beat', 'A desktop notification slides in over the brief, carrying an accept control.'),
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
    summary: 'User drafts their own SCQ and problem statement and gets a score they can improve on, so iterating feels normal rather than like failing.',
    beats: [
      'Every source they need sits along the bottom and opens without leaving the screen.',
      'The score is formative — it rises as they revise, and never blocks them.',
      'What they write is kept and comes back in the kick-off.'
    ],
    carry: { write: ['scq'] },
    decision: 'Load-bearing. The SCQ must persist — it returns in the full-team kick-off, and that continuity is what makes the next stage land.',
    notes: () => copy('Prompt', 'The task from the PM repeated here as context for what the learner is now doing.')
      + copy('Beat', 'Three passes at the bar: the score climbs, then clears.')
      + anno('Iteration is how quality gets driven everywhere else at the firm. The bar is there to be cleared on the second or third pass, not the first.'),
    anim: anim(6400, [
      { at: 300,  do: el => $$('.scq-fill', el).forEach((n, i) => setTimeout(() => n.style.width = n.dataset.w, i * 220)) },
      { at: 2200, do: el => setScore(el, 48, 41) },
      { at: 3600, do: el => setScore(el, 71, 66) },
      { at: 5000, do: el => setScore(el, 86, 84) },
      { at: 6200, do: el => { setScore(el, 0, 0); $$('.scq-fill', el).forEach(n => n.style.width = '0%'); } }
    ]),
    body: () => `
      <div class="stack">
        <div class="grid3" style="flex:0 0 auto;height:42%">
          ${[['S', 'Situation', '86%'], ['C', 'Complication', '78%'], ['Q', 'Question', '92%']].map(([k, n, w]) => `
            <div class="card"><span class="tag">${k} · ${n}</span>
              <div style="flex:1;display:flex;flex-direction:column;gap:6px;padding-top:2px">
                <i class="bar scq-fill" data-w="${w}" style="width:0;transition:width .9s ease-out"></i>
                <i class="bar scq-fill" data-w="${parseInt(w) - 22}%" style="width:0;transition:width .9s ease-out .1s"></i>
                <i class="bar scq-fill bar--faint" data-w="${parseInt(w) - 40}%" style="width:0;transition:width .9s ease-out .2s"></i>
              </div></div>`).join('')}
        </div>
        <div class="card card--focus" style="flex:0 0 auto">
          <span class="tag tag--maroon">Problem statement</span>
          <div style="display:flex;flex-direction:column;gap:6px">
            <i class="bar scq-fill" data-w="94%" style="width:0;background:var(--maroon);opacity:.7;transition:width .9s ease-out .3s"></i>
            <i class="bar scq-fill" data-w="62%" style="width:0;background:var(--maroon);opacity:.7;transition:width .9s ease-out .4s"></i>
          </div>
        </div>
        <div style="display:flex;gap:var(--s5);align-items:center;flex-shrink:0">
          ${['SCQ holds up', 'Statement follows'].map((n, i) => `
            <div style="flex:1;display:flex;align-items:center;gap:10px">
              <span class="s-micro" style="white-space:nowrap">${n}</span>
              <div style="flex:1;height:4px;background:var(--fill-2);border-radius:2px;overflow:hidden">
                <div class="sc-fill" data-k="${i}" style="height:100%;width:0;background:var(--mute-2);transition:width .5s"></div></div>
              <b class="sc-pct" data-k="${i}" style="font-size:12px;color:var(--ink);min-width:32px;text-align:right;font-variant-numeric:tabular-nums">—</b>
            </div>`).join('')}
        </div>
        <div style="display:flex;gap:5px;flex-shrink:0">
          ${['Context brief', 'Proposal', 'Past quals', 'Fact pack'].map(r =>
            `<span style="font-size:10px;color:var(--mute);border:1px solid var(--rule);border-bottom:none;border-radius:3px 3px 0 0;padding:5px 10px;background:var(--fill);display:inline-flex;gap:5px;align-items:center">${W.glyph('doc')}${r}</span>`).join('')}
        </div>
      </div>`
  },

  {
    id: 's1f6a', stage: 1, kind: 'argument', verb: 'READ', action: 'Next',
    label: 'Why Day 0 mattered',
    summary: 'User is shown what their preparation bought the team, so the effort reads as leverage rather than homework.',
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
    body: () => `<div class="stack">${map5(1)}</div>`
  },

  {
    id: 's2intro', stage: 2, kind: 'intro', verb: 'READ', action: 'Begin',
    label: 'What the kick-off covers',
    summary: 'User learns this is the first time the whole team is together, that it runs at least two hours, and that it always happens before the client sees anything.',
    beats: ['Names the four things they will personally do in the session.'],
    notes: () => copy('Copy', 'A line explaining this is the first time the whole team is in a room, and that it is where the project’s thinking starts.'),
    body: () => `
      <div class="stack">
        <div><h2 class="s-h1">Full-team kick-off</h2><p class="s-cap" style="margin:0">Two hours minimum. Always before any client kick-off.</p></div>
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
    notes: () => copy('Opening', 'Everyone has read the brief, so no hour is spent on context. The meeting starts with where each person landed.')
      + copy('Beat', 'The calendar invite dissolves into the meeting; the agenda writes itself in one line at a time.')
      + anno('The meeting runs at least two hours, can split across two sittings, and always happens before any client kick-off.'),
    anim: anim(5600, [
      { at: 500,  do: el => $$('.tm-panel__row', el).forEach((n, i) => n.classList.toggle('in', i === 0)) },
      { at: 1300, do: el => $$('.tm-panel__row', el).forEach((n, i) => n.classList.toggle('in', i <= 1)) },
      { at: 2100, do: el => $$('.tm-panel__row', el).forEach(n => n.classList.add('in')) },
      { at: 3000, do: el => cls(el, '.w-tile', 'is-speaking', 1) },
      { at: 5200, do: el => { cls(el, '.w-tile', 'is-speaking', false); $$('.tm-panel__row', el).forEach(n => n.classList.remove('in')); } }
    ]),
    body: () => W.teamsMeeting({
      tiles: [{ id: 'A' }, { id: 'T' }, { id: 'H' }, { id: 'You', you: true }],
      side: { title: 'Agenda', items: ['Agree the problem', 'Build the starting answer', 'Agree the deliverable'] },
      stage: `<div style="display:flex;flex-direction:column;gap:8px;opacity:.5">${W.bars(['72%', '88%', '64%', '80%'])}</div>
        <style>.tm-panel__row{opacity:0;transform:translateY(-4px);transition:all .35s}.tm-panel__row.in{opacity:1;transform:none}</style>`
    })
  },

  {
    id: 's2f2', stage: 2, kind: 'exercise', verb: 'READ', action: 'Next',
    label: 'Your SCQ against theirs',
    summary: 'User sees the SCQ they wrote in Day 0 side by side with their colleagues’, clocks that all three differ — mostly in the question — and the team works from there towards one shared problem statement.',
    beats: [
      'Their own draft is marked as theirs, so the earlier prep visibly pays off.',
      'The differences are surfaced rather than left to be hunted for.',
      'The point lands on its own: drafting alone first is what put three ideas in the room.'
    ],
    carry: { read: ['scq'] },
    decision: 'Depends on the Day 0 input persisting. Without it this still works with three pre-written cards, but loses most of its force.',
    notes: () => copy('Cards', 'Each card carries one person’s situation, complication and question, in their own words.')
      + copy('Beat', 'The learner’s card loads first; the other two arrive beside it, then the diverging Q rows take a highlight.')
      + anno('All three SCQs are defensible, and the question is different in each one. If everyone had waited to hear the Partner’s version first, this meeting would have one idea in it instead of three.'),
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
    summary: 'User discovers that a problem statement everyone just agreed to contains four words nobody has actually defined, and that two of them become client questions.',
    beats: [
      'The sentence looks settled, which is what makes the exercise land.',
      'Each word opens the question hiding inside it.',
      'Half are resolvable in the room; half go to the client that week.'
    ],
    notes: () => copy('Prompt', 'Says the sentence looks agreed, that four things in it are not defined, and asks the learner to find them.')
      + copy('Beat', 'The four phrases resolve one at a time, with a counter of how many are found.')
      + anno('Two of the four were resolvable by the team. Two went to the client as questions that week.'),
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
    summary: 'User watches the Partner commit to an answer before any research exists, and sits with the discomfort of that for a moment before it gets explained.',
    beats: [
      'The claim is alone on the screen with nothing to soften it.',
      'The definition only arrives after the pause has done its work.'
    ],
    notes: () => copy('Claim', 'The top-level hypothesis, stated flat as a claim, with no hedging.')
      + copy('Definition', 'Best answer to the client’s question, written before the research, specific enough that evidence can prove it wrong.')
      + copy('Beat', 'The frame holds on the claim a beat longer than is comfortable. The definition panel then offers itself.'),
    anim: anim(6000, [
      { at: 500,  do: el => { const c = $('.claim-box', el); if (c) c.classList.add('in'); } },
      { at: 3400, do: el => { const d = $('.defn-box', el); if (d) d.classList.add('in'); } },
      { at: 5700, do: el => $$('.claim-box,.defn-box', el).forEach(n => n.classList.remove('in')) }
    ]),
    body: () => `
      <div class="stack" style="justify-content:center;align-items:center;gap:var(--s5)">
        <div class="focus claim-box" style="max-width:56ch;width:100%;text-align:center;align-items:center">
          <span class="s-micro">The claim</span>
          <span style="display:flex;flex-direction:column;gap:8px;width:100%;align-items:center">
            ${W.bars([['86%', 'live'], ['94%', 'live'], ['48%', 'live']])}</span>
        </div>
        <div class="defn-box panel" style="max-width:56ch;width:100%">
          <span class="s-eyebrow">What a hypothesis is</span>
          <span class="s-cap" style="font-style:italic">Best answer to the client’s question, written before the research, specific enough that evidence can prove it wrong.</span>
        </div>
      </div>
      <style>.claim-box,.defn-box{opacity:0;transform:translateY(8px);transition:all .5s}
        .claim-box.in,.defn-box.in{opacity:1;transform:none}</style>`
  },

  {
    id: 's2f4b', stage: 2, kind: 'exercise', verb: 'DECIDE', action: 'Next',
    label: 'Answering the real objection',
    summary: 'User picks whichever doubt they actually hold about committing early, and gets a straight answer to that one rather than a generic reassurance.',
    beats: [
      'Four objections, phrased the way someone would really think them.',
      'The replies come from different people, because the honest answers differ in kind.'
    ],
    notes: () => copy('Prompt', 'Says most people have at least one of these in their head, and invites the learner to turn over the ones they are thinking.')
      + copy('Beat', 'Cards start face down. Turning one opens a reply panel beneath it.'),
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
    summary: 'User is shown the honest scale of the question, realises three people cannot cover it, and then sees the hypothesis cut it to a shortlist they could actually work through.',
    beats: [
      'Every topic on the field is legitimately worth studying.',
      'Applying the claims fades out everything that would not test one.',
      'What is left is small enough to attach names and calls to.'
    ],
    notes: () => copy('Constraint', 'Four weeks, three people, 28 conversations if you choose well.')
      + copy('Beat', 'The full field renders first. Applying the hypothesis fades back everything that tests nothing.')
      + anno('The hypothesis is not what the team believed. It is what the team decided to spend four weeks testing.'),
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
    notes: () => copy('Pair 1', 'The Day 1 guess about later value-chain stages, against the figure four weeks of research produced. The hunch held.')
      + copy('Pair 2', 'The strongest argument in the published report, which was not on the Day 1 slide at all. It came out of the interviews.')
      + copy('Beat', 'A toggle moves between the two pairings, left claim to right finding.'),
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
    label: 'Building the branches',
    summary: 'User breaks the top claim into what would have to be true for it to hold, and learns as much from the wrong options as the right ones.',
    beats: [
      'The bank contains decoys: one out of scope, one an activity rather than a claim, one true but untestable.',
      'Picking one up and putting it back is part of the learning, not a mistake.',
      'Clearing the bar turns their rough tree into the team’s real one.'
    ],
    carry: { write: ['tree'] },
    notes: () => copy('Prompt', 'The question that drives every hypothesis tree: for this claim to be true, what would have to be true?')
      + copy('Beat', 'Candidates drag into three slots. A decoy gets placed, then withdrawn with its reason shown.'),
    anim: anim(8600, [
      { at: 800,  do: el => drop(el, 0, 0) },
      { at: 2000, do: el => drop(el, 1, 3) },
      { at: 3200, do: el => { unfill(el, 1); mark(el, 3, 'activity, not a claim'); } },
      { at: 4400, do: el => drop(el, 1, 2) },
      { at: 5600, do: el => drop(el, 2, 4) },
      { at: 6600, do: el => setScore(el, 92, 88, 96) },
      { at: 8300, do: el => reset(el) }
    ]),
    body: () => `
      <div class="stack">
        <div class="focus focus--tight" style="flex-shrink:0">
          <span class="s-micro">For this claim to be true, what would have to be true?</span>
          <span style="display:flex;flex-direction:column;gap:6px">${W.bars([['82%', 'live'], ['54%', 'live']])}</span>
        </div>
        <div class="row">
          <div style="flex:1.4;display:flex;flex-direction:column;gap:9px;min-height:0">
            ${[0, 1, 2].map(i => `<div class="slot" data-s="${i}" style="flex:1;border:1px dashed var(--mute-2);border-radius:3px;display:flex;align-items:center;padding:0 14px;font-size:11.5px;color:var(--mute-2);transition:all .3s">Branch ${i + 1}</div>`).join('')}
          </div>
          <div style="flex:1;display:flex;flex-direction:column;gap:6px;min-height:0">
            <span class="s-micro">Candidates</span>
            <div style="display:flex;flex-direction:column;gap:5px;flex:1;justify-content:space-between">
              ${[0, 1, 2, 3, 4, 5].map(i => `<div class="bnk" data-b="${i}" style="border:1px solid var(--rule);border-radius:3px;padding:6px 9px;font-size:11px;color:var(--ink);display:flex;justify-content:space-between;gap:8px;transition:all .3s">
                <span>Candidate ${i + 1}</span><em class="why" style="font-style:normal;font-size:9px;letter-spacing:.06em;text-transform:uppercase;color:var(--mute-2)">—</em></div>`).join('')}
            </div>
          </div>
        </div>
        <div style="display:flex;gap:var(--s4);align-items:center;flex-shrink:0">
          ${['Is a claim', 'Testable', 'In scope'].map((n, i) => `
            <div style="flex:1;display:flex;align-items:center;gap:9px">
              <span class="s-micro" style="white-space:nowrap">${n}</span>
              <div style="flex:1;height:4px;background:var(--fill-2);border-radius:2px;overflow:hidden">
                <div class="sc-fill" data-k="${i}" style="height:100%;width:0;background:var(--mute-2);transition:width .5s"></div></div>
              <b class="sc-pct" data-k="${i}" style="font-size:12px;min-width:32px;text-align:right;font-variant-numeric:tabular-nums">—</b>
            </div>`).join('')}
        </div>
      </div>
      <style>.slot.filled{border-style:solid;border-color:var(--maroon);background:var(--soft);color:var(--maroon)}
        .bnk.used{opacity:.3}.bnk.bad .why{color:var(--maroon)}</style>`
  },

  {
    app: 'ppt',
    id: 's2f6', stage: 2, kind: 'sim', verb: 'READ', action: 'Next',
    label: 'What a real Day 1 output looks like',
    summary: 'User sees the genuine artefact this project ended Day 1 with — unfinished, with a broken sentence and an unfilled placeholder still in it — and clocks that this is the standard, not a polished version.',
    beats: [
      'Shown exactly as it was left, because the imperfections are the teaching.',
      'Two flaws are called out rather than quietly fixed.',
      'The team stopped because the meeting ended, not because the thinking was done.'
    ],
    decision: 'The real slide is in the previous Dalberg template. Show it as it was, or re-render in the current one?',
    notes: () => copy('Annotation 1', 'Points at a sentence in the tensions section that does not parse.')
      + copy('Annotation 2', 'Points at a yellow placeholder the team had not filled in.')
      + anno('This is the most useful artefact in the archive, because it shows what the end of a real Day 1 actually looks like, which is nothing like the polished version that circulates later.'),
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
    summary: 'User watches the team settle what they are producing and who reads it in about two minutes, and clocks that this cheap decision is the expensive one to defer.',
    beats: [
      'Deliberately anticlimactic after the hypothesis work.',
      'A deck and a report are different arguments, not the same one in different clothes.'
    ],
    notes: () => copy('Exchange', 'Three or four messages in which the team agrees what the deliverable is and who its primary reader will be.')
      + copy('Beat', 'The messages resolve into a single agreed format card below them.')
      + anno('Two minutes spent here saves a rebuild in week three.'),
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
    summary: 'User is shown what those two hours actually bought, including the reframe that changed what the project was about.',
    beats: ['Three claims, and a recap of what they personally did in the session.'],
    notes: () => anno('The recap covers which branches the learner placed first, which decoys they picked up and put back, and how many passes it took.'),
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
    body: () => `<div class="stack">${map5(2)}</div>`
  },

  {
    id: 's3intro', stage: 3, kind: 'intro', verb: 'READ', action: 'Begin',
    label: 'What the core team kick-off covers',
    summary: 'User learns this smaller session is the one that belongs to the team, run by the PM without the Partner in the room.',
    beats: ['Most of the time goes on agreeing how the team will work together.'],
    notes: () => copy('Copy', 'A line explaining this is a smaller session later the same day, run by the PM, with the Partner not in the room.'),
    body: () => `
      <div class="stack">
        <div><h2 class="s-h1">Core team kick-off</h2><p class="s-cap" style="margin:0">Later the same day. Smaller room. No Partner.</p></div>
        ${objectives(
          ['Fill in your working preferences before the session',
           'Watch the hypothesis tree become a dot-dash storyline',
           'Flag your experience against the research plan',
           'Agree the team’s norms — where most of your time goes'],
          ['Explain what a dot-dash storyline is and where it comes from',
           'Say what would prove and what would kill your own branch',
           'Hold a norms conversation specific enough to point to later'])}
      </div>`
  },

  {
    app: 'outlook',
    id: 's3f1', stage: 3, kind: 'sim', verb: 'READ', action: 'Next',
    label: 'The deck and the form arrive',
    summary: 'User gets the kick-off deck and one small ask before the afternoon, and learns the PM has already drafted the storyline and workplan for them to argue with.',
    beats: [
      'Sets the expectation that the team is reacting to a draft, not building from nothing.',
      'The single ask takes five minutes and is deliberately made in writing.'
    ],
    notes: () => copy('Email', 'Attaches the core team kick-off deck and asks the learner to fill in the preferences form before the session.')
      + copy('Also', 'Says her storyline and workplan drafts are rough and meant to be argued with.')
      + anno('Preferences are collected in writing on purpose. In a live conversation the first person to speak sets the range and everyone else adjusts towards it.'),
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
    summary: 'User answers three honest questions about how they work, knowing the whole team will see the answers, which is what makes the later conversation useful.',
    beats: [
      'No scoring and no right answer — the prompt says so explicitly.',
      'Takes about five minutes, and the answers come back later in this stage.'
    ],
    carry: { write: ['prefs'] },
    decision: 'Second persistence requirement — answers must return in Frame 7. Question set and wording come from the core team kick-off deck, still to be uploaded.',
    notes: () => copy('Prompt', 'Asks the learner to answer for themselves rather than for the version a new team might want, and notes that everyone’s answers go up on screen.')
      + copy('Beat', 'Three question groups, answered in turn, with the progress bar filling.'),
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
    summary: 'User sees a visibly smaller meeting and is told why the Partner is absent rather than left to wonder, and hears the three things the PM wants by the end.',
    beats: [
      'The absence is explained, which matters more than it sounds.',
      'The last item is flagged as the one to leave most time for.'
    ],
    notes: () => copy('Opening', 'The Partner is not in this session, and the hypothesis is now the team’s to work with.')
      + anno('The deck reuses the morning’s three-item agenda here, which contradicts the three outcomes the PM names in the same frame. Shown as the PM states them.'),
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
    summary: 'User watches the morning’s hypothesis tree rotate into the storyline of the final deliverable, and clocks that the storyline is not a new document at all.',
    beats: [
      'Each top-level claim becomes a section heading.',
      'The sub-claims line up as the points that section has to make.',
      'This is the conceptual move people most consistently miss, so it repeats.'
    ],
    carry: { read: ['tree'] },
    notes: () => copy('Definition', 'A dot-dash storyline: dashes are sections, dots are the claims each section has to make for the argument to hold.')
      + copy('Beat', 'A scrub control runs between the two views and back, so the relationship can be watched several times.')
      + anno('This is why the drilldown was worth two hours. The structure of the deliverable comes directly out of it, rather than being invented in week three.'),
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
    summary: 'User is invited to say where they have relevant experience or know a source, at the point where it can still change who does what.',
    beats: [
      'The plan is visibly half-empty, and the gaps are stated to be real gaps.',
      'Flagging experience is modelled as normal for a junior person, not showing off.'
    ],
    notes: () => copy('Copy', 'The PM saying the gaps are real gaps rather than a test, and asking people to speak up now rather than three weeks in.')
      + copy('Beat', 'Empty rows take the highlight in turn, each offering two controls.')
      + anno('Teams routinely find out in week three that someone had done a near-identical piece of work two projects ago. The cost of not saying it falls on the person who stayed quiet.'),
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
        <h2 class="s-h1">28 interviews, three parameters</h2>
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
    summary: 'User compares the workplan written on Day 1 with what the project actually did, and takes away that getting the order right matters more than getting the dates right.',
    beats: [
      'The research phase ran closer to six weeks than four.',
      'The project closed in September, not July.',
      'The sequence and the milestones held; the durations did not.'
    ],
    notes: () => copy('Beat', 'A toggle overlays the actual timeline on the planned one.')
      + anno('The workplan written on Day 1 will be wrong in its details, and writing it is still what lets you notice you are running long while there is time to act.'),
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
    summary: 'User sees the whole team’s submitted answers at once, including their own, then hears the context behind each — which is the part the form could not capture.',
    beats: [
      'The spread is visible before anyone speaks, which is why it was collected in writing.',
      'Some of the context is specific and inconvenient, which is the point.',
      'They are prompted to add the reason behind one of their own answers.'
    ],
    carry: { read: ['prefs'] },
    notes: () => copy('Prompt', 'Asks the learner to add the context behind one of their own answers — the part the form could not ask for.')
      + copy('Beat', 'Each card expands in turn as that person talks through their answers.')
      + anno('Everyone’s stated hours were reasonable, and none of them told you what was actually behind them. The writing gets you the spread; the conversation gets you the meaning.'),
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
    label: 'Agreeing the norms',
    summary: 'User takes part in turning a generic norms template into commitments specific enough that someone could actually be found to have broken them.',
    beats: [
      'This is the live activity of the stage and where most of the time should go.',
      'Where submitted preferences conflict, the conflict is on screen and gets resolved with them in the room.'
    ],
    notes: () => copy('Prompt', 'Says the template only supplies categories, and that what is needed is the specific version for this team on this project.')
      + copy('Beat', 'Each line fills and is agreed in turn.')
      + anno('Norms named on Day 1 are norms you can point to in week four. Norms that were never named do not exist, and the person who suffers most is usually the most junior person on the team.'),
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
    summary: 'User is shown that the storyline they just watched being built is the skeleton of the published deliverable, and that named norms are the ones you can hold people to.',
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
        ['P/AP', ['Stepped out and let the core team build the plan', 'Agreed when you will review the storyline and workplan']],
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
    body: () => `<div class="stack">${map5(3)}</div>`
  },

  {
    id: 's4intro', stage: 4, kind: 'intro', verb: 'READ', action: 'Begin',
    label: 'What PD alignment covers',
    summary: 'User learns the two Partners meet without them to agree how they will run the project, and that the note they produce is written for the team.',
    beats: ['The only stage the learner is not in the room for.'],
    notes: () => copy('Copy', 'A line explaining the two Partners meet at the end of the day, and that the note they produce is for the learner.'),
    body: () => `
      <div class="stack">
        <div><h2 class="s-h1">PD alignment on responsibilities</h2><p class="s-cap" style="margin:0">Twenty minutes between two people, at the end of the day.</p></div>
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
    summary: 'User sees a meeting on the calendar they are not part of, and is asked in advance whether they need anything built into how the Partners split the work.',
    beats: [
      'The exclusion is explained rather than glossed over.',
      'Replying is genuinely optional, and skipping costs nothing.'
    ],
    notes: () => copy('Calendar', 'A greyed-out block at the end of the day showing only the two Partners.')
      + copy('Teams', 'A Partner asking whether anyone needs anything built into the split before the two of them meet.')
      + anno('This stage was added to Day 1 because of the 2025 Pulse survey: people could not tell when their PD would be involved, and feedback arrived too late to act on.'),
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
    notes: () => copy('Note', 'How the two Partners are splitting the project, so nobody has to guess.')
      + copy('Beat', 'The note arrives in the channel and its lines resolve one at a time.'),
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
    notes: () => copy('Translation', 'Each line of the note set against what it changes about the learner’s week.')
      + copy('Beat', 'The rows open one at a time as the learner taps through them.'),
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
    summary: 'User learns this stage exists because of what people said in the Pulse survey, and what twenty minutes of written agreement prevents.',
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
        ['P/AP', ['Asked the team what they need from the split', 'Agreed who leads the hypothesis and who leads the client', 'Agreed how coaching splits and how location affects review', 'Agreed a feedback cadence tied to checkpoints', 'Written it down and sent it']],
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
    body: () => `<div class="stack">${map5(4)}</div>`
  },

  {
    id: 's5intro', stage: 5, kind: 'intro', verb: 'READ', action: 'Begin',
    label: 'What the Week 1 preview covers',
    summary: 'User is told this is not part of Day 1 and is not being standardised, and that it exists only to show where today’s outputs end up.',
    beats: [],
    notes: () => copy('Copy', 'A line explaining Week 1 is included only so the learner can see where today’s outputs go.'),
    body: () => `
      <div class="stack">
        <div><h2 class="s-h1">Week 1</h2><p class="s-cap" style="margin:0">Out of scope for Day 1. Included for context.</p></div>
        ${objectives(
          ['Watch the four Day 1 artefacts expand across the first week',
           'See what happens when evidence contradicts a claim'],
          ['Explain why a hypothesis changing is the process working rather than failing'])}
      </div>`
  },

  {
    id: 's5f1', stage: 5, kind: 'exercise', verb: 'WATCH', action: 'Next',
    label: 'The artefacts grow, one claim fails',
    summary: 'User watches the four things they built on Day 1 fill out across the week, and sees one branch of the tree fail — which is the process working, not breaking.',
    beats: [
      'The storyline becomes a deck with a page count; the plan gets names and dates.',
      'The fact pack thickens as colleagues drop things into it.',
      'The claim that did not survive is the one that saved the most time.'
    ],
    carry: { read: ['tree', 'facts'] },
    notes: () => copy('Beat', 'A day counter runs Monday to Friday while all four artefacts expand in sequence.')
      + anno('By Friday the tree has already changed. The claim that did not survive is the one that saved the team the most time, because it stopped four weeks of research pointing the wrong way.'),
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
    summary: 'User sees the first review land on an empty deck, aimed at argument and structure, and clocks how much cheaper a structural fix is now than in week four.',
    beats: [
      'There is no prose yet, so there is nothing to comment on but the argument.',
      'The review markers match the responsibilities note exactly — the first proof it is being kept.'
    ],
    notes: () => copy('Copy', 'Explains the comments land on argument and structure, because there is no prose in the deck yet.')
      + anno('Fixing an argument costs an afternoon at this stage and a fortnight once the slides are full.'),
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
    summary: 'User takes away that being wrong early is cheap, and that Day 1 is what makes an early review possible at all.',
    beats: [],
    notes: () => anno('This stage has no checklists, because it is a preview rather than a part of Day 1.'),
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
    summary: 'User finds out what became of the five claims they watched the team commit to, and that being unfinished but specific is what a good Day 1 looks like.',
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
    notes: () => copy('Copy', 'Confirms everything stays available here and on the Hub, and that the learner can come back at any time.'),
    body: () => `
      <div class="stack" style="justify-content:center;align-items:center;text-align:center;gap:var(--s3)">
        <h1 class="s-display">Day 1 complete</h1>
        <p class="s-cap" style="max-width:44ch;margin:0">Your checklists, templates and record stay available here and on the Hub.</p>
      </div>`
  }

  ];

  /* ==========================================================================
     ANIMATION HELPERS
     ======================================================================= */

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
      about: 'Not part of Day 1 and not what is being standardised. It is here so the learner can see where the four things they built end up: the storyline becomes a ghost deck with a page count, the research plan fills with names and dates, the fact pack thickens as colleagues drop things in, and one branch of the hypothesis tree turns out to be wrong and gets restructured. The first review lands while the deck is still empty.',
      inputs: ['Nothing. This stage is watched.'],
      outputs: ['An understanding of why a hypothesis changing is the process working', 'A sense of what an early, cheap review looks like']
    },
    {
      n: 6, name: 'Close', short: 'The trail, the vault, and what happened next',
      about: 'The last three screens. The learner sees every artefact Day 1 produced laid out in order, the templates and checklists that stay available afterwards, and a record of what they personally contributed on the way through. It ends on the real project’s hypothesis and what became of it — four of five claims surviving, one not, and the report’s best argument never having been on the Day 1 slide at all.',
      inputs: ['Nothing. This part is read.'],
      outputs: ['Your vault: checklists, templates and formats by stage and role', 'A record of what you contributed']
    }
  ];

  const PROGRESS = { 0: -1, 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5 };

  const CARRY = [
    { k: 'scq',   label: 'SCQ' },
    { k: 'tree',  label: 'Tree' },
    { k: 'prefs', label: 'Preferences' },
    { k: 'facts', label: 'Facts' }
  ];

  global.CONTENT = { SCREENS, STAGES, MAP5, PROGRESS, CARRY };

})(window);

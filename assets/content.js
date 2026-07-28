/* ============================================================================
   content.js — the 55 screens

   COPY RULE
   No prose anywhere. Every message, email, definition and annotation is a
   spec of what the copy must do, in twelve words or fewer.
   Structural lists — checklist items, agenda lines, folder names, learning
   objectives — survive, compressed to their shortest correct form. Replacing
   those with placeholders would leave the screen empty and un-reviewable.

   INTENT RULE
   Every screen's intent line is a claim, not a title. It is the layer a
   reviewer should be able to disagree with.
   ========================================================================= */

(function (global) {
  'use strict';

  const W = global.WIN;

  /* --- in-screen helpers ----------------------------------------------- */

  const copy = (tag, spec) =>
    `<div class="copy"><span class="copy__tag">${tag}</span><span class="copy__spec">${spec}</span></div>`;

  const list = items => `<ul class="s-list">${items.map(i => `<li>${i}</li>`).join('')}</ul>`;

  const anno = spec => `<div class="anno"><span class="anno__tag">Note</span><span class="anno__body">${spec}</span></div>`;

  const eyebrow = t => `<div class="s-eyebrow">${t}</div>`;

  const claims = items => `<ol style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:14px">
    ${items.map((c, i) => `<li style="display:flex;gap:14px;align-items:baseline">
      <span style="font-size:11px;color:var(--mute-2);font-variant-numeric:tabular-nums;flex-shrink:0">${i + 1}</span>
      <span style="font-size:14.5px;line-height:1.45;color:var(--ink-strong);max-width:62ch">${c}</span>
    </li>`).join('')}</ol>`;

  const objectives = (doing, able) => `<div class="s-cols" style="margin-top:auto">
    <div>${eyebrow('In this stage you will')}${list(doing)}</div>
    <div>${eyebrow('By the end you will be able to')}${list(able)}</div>
  </div>`;

  /* --- the five product stages, as they appear on the map --------------- */

  const MAP5 = [
    { n: 'Day 0',              why: 'Get set up and take on the context',        mins: '6 min'  },
    { n: 'Full-team kick-off', why: 'Build a hypothesis tree, agree the deliverable', mins: '10 min' },
    { n: 'Core team kick-off', why: 'Ways of working, and early ownership',      mins: '10 min' },
    { n: 'PD alignment',       why: 'How the two PDs split the project',         mins: '3 min'  },
    { n: 'Week 1',             why: 'Where today’s outputs end up',         mins: '2 min'  }
  ];

  /* at = index of the stage you are about to enter; -1 = none entered yet */
  function map5(at) {
    const nodes = MAP5.map((s, i) => {
      const done = i < at, here = i === at;
      return `<div class="map5__node ${done ? 'is-done' : ''} ${here ? 'is-here' : ''}">
        <span class="map5__state">${done ? 'Complete' : here ? 'Begin' : ''}</span>
        <b>${s.n}</b><span class="why">${s.why}</span><span class="mins">${s.mins}</span>
      </div>`;
    }).join('');
    return `<div class="map5">${nodes}</div>
      <div class="map5__band">
        <div style="flex:0 0 calc(20% - 6px)">After staffing note</div>
        <div style="flex:1">The first couple of days of the project</div>
        <div style="flex:0 0 calc(20% - 6px)">What comes after</div>
      </div>`;
  }

  /* --- role checklists -------------------------------------------------- */

  function roles(rows) {
    return `<table class="roles"><thead><tr><th>Role</th><th>${rows.head}</th></tr></thead><tbody>
      ${rows.body.map(r => `<tr><td>${r[0]}</td><td>${list(r[1])}</td></tr>`).join('')}
    </tbody></table>`;
  }

  /* ==========================================================================
     SCREENS
     ======================================================================= */

  const SCREENS = [

  /* ------------------------------ STAGE 0 ------------------------------- */

  {
    id: 's0a', stage: 0, kind: 'splash', verb: 'READ', action: 'Start',
    intent: 'Expectations first: what this is, what it is not, and that nothing here is assessed.',
    body: () => `
      <div style="display:flex;flex-direction:column;height:100%">
        <div style="margin-bottom:auto">
          <h1 class="s-h1">Day 1</h1>
          ${copy('Copy', 'Welcome. What the experience is, roughly how long, resumable at your own pace.')}
        </div>
        <div class="s-cols" style="align-items:start">
          <div>${eyebrow('What this is')}${list([
            'An annotated view of what happens, not an exercise',
            'One successful instance, as a benchmark',
            'Not assessed, and returnable at any time'
          ])}</div>
          <div>${eyebrow('What this is not')}${list([
            'Not a rulebook — projects vary',
            'Not a substitute for the Craft document',
            'Not the only training you will get'
          ])}</div>
        </div>
      </div>`
  },

  {
    id: 's0b', stage: 0, kind: 'argument', verb: 'READ', action: 'Next',
    intent: 'Four reasons the first day carries more weight than any other.',
    body: () => `
      <h2 class="s-h2">Day 1 is the highest-leverage day of the project</h2>
      <div style="margin-top:20px">${claims([
        'It sets the tone. How the first day runs shapes how the next ten weeks run.',
        'It brings the firm’s expertise into the room early, and gives you access to it.',
        'It makes us faster. A hypothesis tells you what to test and what to ignore.',
        'It gives everyone the same start, whatever the project and whoever the team.'
      ])}</div>
      ${anno('Day 1 is not literally one day. However varied, this is the start you are entitled to.')}`
  },

  {
    id: 's0c', stage: 0, kind: 'map', verb: 'READ', action: 'Begin',
    intent: 'The shape of the next half hour, before you enter it.',
    decision: 'Stage map in the deck repeats one description across Core team KO, PD alignment and Week 1. Durations here are reconciled from each stage intro; the map itself still reads “X mins”.',
    body: () => `<h2 class="s-h2">Five stages</h2>${map5(-1)}`
  },

  /* ------------------------------ STAGE 1 ------------------------------- */

  {
    id: 's1map', stage: 1, kind: 'map', verb: 'READ', action: 'Begin',
    intent: 'Where you are, and what is still closed.',
    body: () => map5(0)
  },

  {
    id: 's1intro', stage: 1, kind: 'intro', verb: 'READ', action: 'Begin',
    intent: 'Everything between being staffed and walking into the kick-off prepared.',
    body: () => `
      <h2 class="s-h2">Day 0</h2>
      ${copy('Copy', 'Own time, across a few days. About an hour of actual work.')}
      ${objectives([
        'Get staffed, and read what came before you',
        'Explore how a project folder is set up',
        'Read the context brief and pin facts to the fact pack',
        'Draft your own SCQ and problem statement'
      ], [
        'Say what is expected of you before Day 1 starts',
        'Write an SCQ from a proposal and a context brief',
        'Explain why everyone drafts their own version separately'
      ])}`
  },

  {
    id: 's1f1', stage: 1, kind: 'sim', verb: 'READ', action: 'Next',
    intent: 'Nothing is expected of you yet, and that is the message.',
    notes: () => copy('Email 1', 'The staffing note: project, client, dates, team, proposal attached.')
      + copy('Email 2', 'From the PM. Welcome; one action — scan the proposal; setup is hers.')
      + anno('You read and do nothing. The first thing a new joiner needs to know is that nothing heavy is expected yet.'),
    body: () => `<div style="display:flex;height:100%">${W.outlook({
          rows: [
            { from: '58%', lines: ['92%', '70%'], live: true },
            { from: '44%', lines: ['86%'], isNew: true, delay: 900 },
            { from: '38%', lines: ['64%'] },
            { from: '50%', lines: ['72%'] }
          ],
          attach: true
        })}</div>`
  },

  {
    id: 's1f2', stage: 1, kind: 'sim', verb: 'EXPLORE', action: 'Next',
    intent: 'Recognition, not completion. Nothing is locked and nothing has to be found.',
    notes: () => copy('Teams', 'PM confirms setup is done, invites additions.')
      + anno('Two folders are drawn out gently. Every folder opens, in any order.'),
    body: () => `<div style="display:flex;height:100%">${W.sharepoint({
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
        })}</div>`
  },

  {
    id: 's1f2b', stage: 1, kind: 'sim', verb: 'WATCH', action: 'Next',
    intent: 'Skimming, not studying. The pace is the teaching.',
    notes: () => copy('Beat', 'Proposal and a past qual deck open and scroll fast. A few seconds.')
      + anno('Telling someone to read something is weaker than showing it happen.'),
    body: () => `<div style="display:flex;height:100%">${W.powerpoint({
          thumbs: 11, at: 2,
          slide: `<div data-scan="1" style="display:flex;flex-direction:column;gap:7px;height:100%">
            ${W.bar('58%', 'strong')}${W.bars(['94%', '90%', '86%', '92%', '74%', '88%', '66%'])}
          </div>`
        })}</div>`
  },

  {
    id: 's1f3', stage: 1, kind: 'sim', verb: 'DO', action: 'Next',
    carry: { write: ['facts'] },
    intent: 'The first senior input lands before the meeting, not inside it.',
    notes: () => copy('Teams', 'Partner posts the brief: context, client notes, key tensions.')
      + copy('Callout', 'Partners generate these from a standard skill. Yours is coming.')
      + anno('Key tensions is the section a proposal never contains, because a proposal is written to win work.'),
    body: () => `<div style="display:flex;height:100%">${W.powerpoint({
          thumbs: 9, at: 2,
          slide: `<div style="display:flex;flex-direction:column;gap:9px;height:100%">
            ${['Sector and project context', 'Client notes', 'Key tensions'].map((s, i) => `
              <div style="display:flex;flex-direction:column;gap:5px">
                <span style="font-size:10px;font-weight:700;color:${i === 2 ? 'var(--maroon)' : 'var(--mute-2)'}">${s}</span>
                <div style="display:flex;gap:7px;align-items:center">
                  <span style="flex:1;display:flex;flex-direction:column;gap:4px">${W.bars(['92%', '78%'])}</span>
                  <button class="pinbtn" data-pin="${i}" title="Pin to fact pack"
                    style="flex-shrink:0;color:var(--mute-2);display:flex">${W.glyph('pin')}</button>
                </div>
              </div>`).join('')}
          </div>`
        })}</div>`
  },

  {
    id: 's1f4', stage: 1, kind: 'sim', verb: 'DECIDE', action: 'Accept task',
    intent: 'Everyone drafts separately, including the person asking.',
    notes: () => copy('Teams', 'Everyone writes their own SCQ and problem statement before the meeting.')
      + anno('Not the right answer, and not assigned to one person. Accepting opens a focused exercise.'),
    body: () => `<div style="display:flex;height:100%;position:relative">${W.powerpoint({
          thumbs: 9, at: 2,
          slide: `<div style="display:flex;flex-direction:column;gap:7px;opacity:.5">
            ${W.bar('50%', 'strong')}${W.bars(['92%', '86%', '78%'])}</div>`
        })}
        ${W.toast({ action: 'Accept', delay: 500 })}</div>`
  },

  {
    id: 's1f5', stage: 1, kind: 'exercise', verb: 'DO', action: 'Check',
    carry: { write: ['scq'] },
    decision: 'Load-bearing. The SCQ must persist — it returns in the full-team kick-off, and that continuity is what makes the next stage land.',
    intent: 'You iterate against a bar. Iterating is the expected behaviour, not a sign of struggling.',
    body: () => `
      <div class="ex">
        <div class="ex__cols">
          ${[['S', 'Situation'], ['C', 'Complication'], ['Q', 'Question']].map(([k, n]) => `
            <div class="ex__col"><label>${k} · ${n}</label>
              <textarea data-scq="${k}" placeholder="Write your own"></textarea></div>`).join('')}
        </div>
        <div class="ex__field"><label>Problem statement</label>
          <textarea data-scq="P" placeholder="One sentence, following from the above"></textarea></div>
        <div class="score">
          <div class="score__item"><span>SCQ holds up</span><div class="score__track"><div class="score__fill" data-fill="a"></div></div><b class="score__pct" data-pct="a">—</b></div>
          <div class="score__item"><span>Statement follows</span><div class="score__track"><div class="score__fill" data-fill="b"></div></div><b class="score__pct" data-pct="b">—</b></div>
        </div>
        <div class="ex__refs">
          ${['Context brief', 'Proposal', 'Past quals', 'Fact pack'].map(r =>
            `<button class="ex__ref">${W.glyph('doc')}${r}</button>`).join('')}
        </div>
      </div>`
  },

  {
    id: 's1f6a', stage: 1, kind: 'argument', verb: 'READ', action: 'Next',
    intent: 'Three framings in the room instead of one, because you drafted alone.',
    body: () => `
      <h2 class="s-h2">Why Day 0 mattered</h2>
      <div style="margin-top:18px">${claims([
        'Context already in people’s heads is what lets the kick-off do deep thinking.',
        'Your rough SCQ is what makes the kick-off have three framings in it instead of one.',
        'Most of Day 0 is finding what the firm already has, not making something new.'
      ])}</div>`
  },

  {
    id: 's1check', stage: 1, kind: 'check', verb: 'READ', action: 'Next',
    intent: 'Who owes what before Day 1 has even started.',
    body: () => ({
      tabs: [
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
    })
  },

  /* ------------------------------ STAGE 2 ------------------------------- */

  {
    id: 's2map', stage: 2, kind: 'map', verb: 'READ', action: 'Begin',
    intent: 'One stage closed, four open.',
    body: () => map5(1)
  },

  {
    id: 's2intro', stage: 2, kind: 'intro', verb: 'READ', action: 'Begin',
    intent: 'Two hours minimum, and always before the client sees anything.',
    body: () => `
      <h2 class="s-h2">Full-team kick-off, with the content jam</h2>
      ${copy('Copy', 'First time the whole team is in a room. Where the thinking starts.')}
      ${objectives([
        'See your SCQ next to your colleagues’ and find they do not match',
        'Find the words in a problem statement nobody has defined',
        'Work out why we commit to an answer before the research',
        'Build a hypothesis tree, then see the real one'
      ], [
        'Explain what a hypothesis is and why we write one on Day 1',
        'Drill a claim into what would have to be true for it to hold',
        'Recognise what a finished Day 1 output actually looks like'
      ])}`
  },

  {
    id: 's2f1', stage: 2, kind: 'sim', verb: 'WATCH', action: 'Next',
    intent: 'You see the shape of two hours before any of it starts.',
    notes: () => copy('Beat', 'Calendar invite dissolves into the meeting. Agenda writes itself in, one line at a time.')
      + copy('Opening', 'Everyone read the brief, so no hour on context. Start with where each of us landed.')
      + anno('Two hours minimum, splittable across two sittings, always before any client kick-off.'),
    body: () => `<div style="display:flex;height:100%">${W.teamsMeeting({
          tiles: [{ id: 'A' }, { id: 'T' }, { id: 'H' }, { id: 'You', you: true }],
          side: { title: 'Agenda', items: ['Agree the problem', 'Build the starting answer', 'Agree the deliverable'] },
          stage: `<div style="display:flex;flex-direction:column;gap:6px;opacity:.55">${W.bars(['72%', '88%', '64%'])}</div>`
        })}</div>`
  },

  {
    id: 's2f2', stage: 2, kind: 'exercise', verb: 'READ', action: 'Next',
    carry: { read: ['scq'] },
    decision: 'Depends on the Day 0 input persisting. Without it this still works with three pre-written cards, but loses most of its force.',
    intent: 'Three competent people wrote three different questions.',
    body: () => `
      <div class="ex">
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;flex:1;min-height:0" data-scqcards></div>
        ${anno('All three are defensible, and the Q differs in each. Had everyone waited to hear the Partner first, this meeting would have one idea in it instead of three.')}
      </div>`
  },

  {
    id: 's2f3', stage: 2, kind: 'exercise', verb: 'DECIDE', action: 'Next',
    intent: 'The sentence looks agreed. Four words in it are not defined.',
    body: () => `
      <div class="ex" style="justify-content:center;gap:26px">
        <div class="hunt" data-hunt>
          How might <mark data-w="0">smallholder</mark> systems shift away from
          <mark data-w="1">fossil-dependent</mark> inputs at
          <mark data-w="2">scale</mark>, and what would make that
          <mark data-w="3">viable</mark>?
        </div>
        <div style="text-align:center">${copy('Prompt', 'This looks agreed. Four things in it are not defined. Find them.')}</div>
        ${anno('Two of the four were resolvable by the team. Two went to the client as questions that week.')}
      </div>`
  },

  {
    id: 's2f4a', stage: 2, kind: 'exercise', verb: 'READ', action: 'What is a hypothesis?',
    intent: 'The claim sits alone, and the pause is deliberate.',
    body: () => `
      <div class="ex" style="justify-content:center;align-items:center;text-align:center">
        <div style="max-width:44ch">
          ${copy('Claim', 'The L1 hypothesis, stated flat, with no hedging.')}
        </div>
        <div data-defn style="max-width:56ch;margin-top:26px;display:none">
          ${copy('Definition panel', 'Best answer to the client’s question, written before the research. Specific enough that evidence can prove it wrong.')}
        </div>
      </div>`
  },

  {
    id: 's2f4b', stage: 2, kind: 'exercise', verb: 'DECIDE', action: 'Next',
    intent: 'You pick the doubt you actually have, rather than being told which one you have.',
    body: () => `
      <div class="ex">
        ${copy('Prompt', 'Most people have one of these in their head. Turn over the ones you are thinking.')}
        <div class="cards" data-cards>
          ${[
            ['Sequencing', 'Answered by the PM'],
            ['Value of being wrong', 'Answered by the Partner'],
            ['Permission', 'Answered by the SPM'],
            ['Intellectual honesty', 'Answered by the Partner']
          ].map(([k, who], i) => `
            <button class="card" data-card="${i}">
              <span class="card__kind">${k}</span>
              <span class="card__who">${who}</span>
            </button>`).join('')}
        </div>
        <div data-reply style="flex:1;min-height:0;border:1px solid var(--rule);border-radius:3px;padding:14px;display:flex;align-items:center">
          <span class="s-note">Turn a card.</span>
        </div>
      </div>`
  },

  {
    id: 's2f4c', stage: 2, kind: 'exercise', verb: 'DECIDE', action: 'Apply hypothesis',
    intent: 'Every topic is worth studying. You have four weeks and three people.',
    body: () => `
      <div class="ex">
        <div style="display:flex;justify-content:space-between;align-items:baseline;gap:16px">
          ${copy('Constraint bar', '4 weeks. 3 people. 28 conversations, if you choose well.')}
        </div>
        <div data-field style="flex:1;min-height:0;display:grid;grid-template-columns:repeat(8,1fr);gap:6px;align-content:start"></div>
        ${anno('The hypothesis is not what the team believed. It is what the team decided to spend four weeks testing.')}
      </div>`
  },

  {
    id: 's2f4d', stage: 2, kind: 'exercise', verb: 'EXPLORE', action: 'Next',
    intent: 'It tells you where to point the research. It does not tell you what you will find.',
    body: () => `
      <div class="ex">
        <div class="tabs" data-pair>
          <button aria-selected="true" data-p="0">The hunch that held</button>
          <button aria-selected="false" data-p="1">The finding nobody predicted</button>
        </div>
        <div style="display:grid;grid-template-columns:1fr 20px 1fr;gap:12px;align-items:center;flex:1;min-height:0">
          <div style="border:1px solid var(--rule);border-radius:3px;padding:14px;height:100%;display:flex;flex-direction:column;gap:7px">
            ${eyebrow('Day 1 claim')}<div data-pl></div>
          </div>
          <div style="color:var(--mute-2);text-align:center;font-size:16px">→</div>
          <div style="border:1px solid var(--rule);border-radius:3px;padding:14px;height:100%;display:flex;flex-direction:column;gap:7px">
            ${eyebrow('Published finding')}<div data-pr></div>
          </div>
        </div>
      </div>`
  },

  {
    id: 's2f5', stage: 2, kind: 'exercise', verb: 'DO', action: 'Check',
    carry: { write: ['tree'] },
    intent: 'For this claim to be true, what would have to be true?',
    body: () => `
      <div class="ex">
        <div class="tree">
          <div style="display:flex;flex-direction:column;min-height:0">
            <div class="tree__anchor">${eyebrow('L1 claim · fixed')}${W.bars(['84%', '52%'])}</div>
            <div class="tree__slots">
              ${[0, 1, 2].map(i => `<div class="tree__slot" data-slot="${i}">Branch ${i + 1}</div>`).join('')}
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:7px;min-height:0">
            ${eyebrow('Candidates')}
            <div class="bank" data-bank></div>
          </div>
        </div>
        <div class="score">
          <div class="score__item"><span>Is a claim</span><div class="score__track"><div class="score__fill" data-fill="a"></div></div><b class="score__pct" data-pct="a">—</b></div>
          <div class="score__item"><span>Testable</span><div class="score__track"><div class="score__fill" data-fill="b"></div></div><b class="score__pct" data-pct="b">—</b></div>
          <div class="score__item"><span>In scope</span><div class="score__track"><div class="score__fill" data-fill="c"></div></div><b class="score__pct" data-pct="c">—</b></div>
        </div>
        <div class="ex__refs">
          ${['Context brief', 'Fact pack', 'Proposal', 'Your SCQ'].map(r =>
            `<button class="ex__ref">${W.glyph('doc')}${r}</button>`).join('')}
        </div>
      </div>`
  },

  {
    id: 's2f6', stage: 2, kind: 'sim', verb: 'READ', action: 'Next',
    decision: 'The real slide is in the previous Dalberg template. Show it as it was, or re-render in the current one?',
    intent: 'A real Day 1 ends unfinished. This one still has a placeholder in it.',
    notes: () => eyebrow('Real artefact')
      + copy('Annotation 1', 'A sentence in tensions that does not parse.')
      + copy('Annotation 2', 'A yellow placeholder they had not filled.')
      + anno('Nobody cleaned it up, because it was not finished and was not supposed to be. The team stopped because the meeting ended, not because the thinking did.'),
    body: () => `<div style="display:flex;height:100%">${W.powerpoint({
          thumbs: 12, at: 3,
          slide: `<div class="real" style="display:flex;flex-direction:column;gap:6px;height:100%;overflow:hidden">
            <span style="font-size:9.5px;color:var(--maroon);font-weight:700;flex-shrink:0">Day 1 — hypothesis-driven executive summary</span>
            <div style="height:1px;background:var(--maroon);opacity:.4;flex-shrink:0"></div>
            ${[
              ['There is a limited focus on the food energy nexus', 3],
              ['Existing efforts centre on fossil fuel reduction and renewables', 2],
              ['Yet a broader set of opportunities for collaboration exists', 3]
            ].map(([t, n]) => `<div style="flex-shrink:0"><span style="font-size:8px;color:var(--maroon);font-weight:700;line-height:1.3;display:block">${t}</span>
              <span style="display:flex;flex-direction:column;gap:3px;padding-left:10px;margin-top:3px">${
                W.bars(Array.from({ length: n }, (_, k) => [(92 - k * 11) + '%', 'faint']))}</span></div>`).join('')}
            <div style="flex-shrink:0"><span style="font-size:8px;color:var(--maroon);font-weight:700;display:block">However, several tensions have emerged</span>
              <span style="display:block;padding-left:10px;margin-top:3px;font-size:7.5px;color:var(--ink);line-height:1.4">…decarbonizing fertilizer has negative impacts on not be good for ecosystem health<i class="flaw">1</i></span>
              <span style="display:flex;flex-direction:column;gap:3px;padding-left:10px;margin-top:3px">${W.bars([['74%', 'faint']])}</span></div>
            <div style="flex-shrink:0"><span style="font-size:8px;color:var(--maroon);font-weight:700;display:block">Recommendations</span>
              <span style="display:flex;flex-direction:column;gap:3px;padding-left:10px;margin-top:3px">${W.bars([['88%', 'faint']])}</span>
              <span style="display:block;padding-left:10px;margin-top:3px;font-size:7.5px;color:var(--ink);line-height:1.4">Potential areas for research include energy intensity of processed foods and alternative proteins <mark style="background:#FBEA9B;color:var(--ink);padding:0 2px">XYZ</mark><i class="flaw">2</i></span></div>
          </div>`
        })}</div>`
  },

  {
    id: 's2f7', stage: 2, kind: 'sim', verb: 'WATCH', action: 'Next',
    intent: 'The cheapest decision on the agenda, and the most expensive one to defer.',
    notes: () => copy('Exchange', 'Three or four messages agreeing what the deliverable is and who reads it.')
      + anno('Deliberately anticlimactic. The brevity is the teaching. Two minutes here saves a rebuild in week three.'),
    body: () => `<div style="display:flex;height:100%">${W.teamsChat({
          messages: [
            { from: '34%', lines: ['72%'] },
            { from: '30%', lines: ['58%'], isNew: true, delay: 300 },
            { from: '38%', lines: ['64%'], isNew: true, delay: 700 },
            { from: '28%', lines: ['46%'], isNew: true, delay: 1100 }
          ],
          attached: `<div style="margin:10px;border:1px solid var(--maroon);border-radius:3px;padding:10px;display:flex;flex-direction:column;gap:5px;animation:arrive var(--t-slow) 1500ms both">
            <span class="s-eyebrow" style="margin:0;color:var(--maroon)">Agreed format</span>
            ${W.bars(['62%', '40%'])}</div>`
        })}</div>`
  },

  {
    id: 's2f8a', stage: 2, kind: 'argument', verb: 'READ', action: 'Next',
    intent: 'The reframe that changed the whole project happened in this room.',
    body: () => `
      <h2 class="s-h2">Why the full-team kick-off mattered</h2>
      <div style="margin-top:18px">${claims([
        'The proposal was about emissions. The published report was about coordination. The reframe happened here.',
        'A hypothesis lets a three-person team choose 28 conversations out of hundreds.',
        'Most senior attention, least work committed. Changing the argument costs an afternoon today, a fortnight in week six.'
      ])}</div>
      ${anno('Your recap: which branches you placed first, which decoys you picked up, and how many passes it took.')}`
  },

  {
    id: 's2check', stage: 2, kind: 'check', verb: 'READ', action: 'Next',
    intent: 'What each role owes the kick-off, and what exists when it ends.',
    body: () => ({
      tabs: [
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
    })
  },

  /* ------------------------------ STAGE 3 ------------------------------- */

  {
    id: 's3map', stage: 3, kind: 'map', verb: 'READ', action: 'Begin',
    intent: 'Two closed. The afternoon session is next.',
    body: () => map5(2)
  },

  {
    id: 's3intro', stage: 3, kind: 'intro', verb: 'READ', action: 'Begin',
    intent: 'The one session of Day 1 that belongs entirely to the team.',
    body: () => `
      <h2 class="s-h2">Core team kick-off</h2>
      ${copy('Copy', 'Smaller session, later the same day. PM runs it, Partner is not in it.')}
      ${objectives([
        'Fill in your working preferences before the session',
        'Watch the hypothesis tree become a dot-dash storyline',
        'Flag your experience against the research plan',
        'Agree the team’s norms — where most of your time goes'
      ], [
        'Explain what a dot-dash storyline is and where it comes from',
        'Say what would prove and what would kill your own branch',
        'Hold a norms conversation specific enough to point to later'
      ])}`
  },

  {
    id: 's3f1', stage: 3, kind: 'sim', verb: 'READ', action: 'Fill in preferences',
    intent: 'You are reacting to a draft, not building from nothing.',
    notes: () => copy('Email', 'Kick-off deck attached. Fill the preferences form before we meet.')
      + copy('Also', 'First pass at storyline and workplan done. Both rough, both meant to be argued with.')
      + anno('Collected in writing on purpose. In a live conversation the first person to speak sets the range and everyone adjusts towards it.'),
    body: () => `<div style="display:flex;height:100%">${W.outlook({
          rows: [
            { from: '46%', lines: ['88%', '62%'], live: true },
            { from: '52%', lines: ['70%'] },
            { from: '40%', lines: ['58%'] }
          ],
          attach: true
        })}</div>`
  },

  {
    id: 's3f2', stage: 3, kind: 'sim', verb: 'DO', action: 'Submit',
    carry: { write: ['prefs'] },
    decision: 'Second persistence requirement. Answers must return in Frame 7. Question set and wording come from the core team kick-off deck, still to be uploaded.',
    intent: 'Answer for yourself, not for the version of yourself a new team wants.',
    notes: () => copy('Prompt', 'Answer for yourself. Everyone’s answers come up on screen, including yours.')
      + anno('About five minutes. No scoring, no right answer.'),
    body: () => `<div style="display:flex;height:100%" data-prefs></div>`
  },

  {
    id: 's3f3', stage: 3, kind: 'sim', verb: 'READ', action: 'Next',
    intent: 'The room is smaller, and the absence is explained rather than left to wonder about.',
    notes: () => copy('Opening', 'Partner is not in this one. The hypothesis is ours to work with now.')
      + anno('The deck reuses the morning’s three-item agenda here, which contradicts the three outcomes the PM names in the same frame. Shown as the PM states them.'),
    body: () => `<div style="display:flex;height:100%">${W.teamsMeeting({
          tiles: [{ id: 'A', absent: true }, { id: 'T' }, { id: 'H' }, { id: 'You', you: true }],
          side: { title: 'Agenda', items: ['A storyline we could show someone tomorrow', 'Who is chasing what, and how', 'How we work together — most of the time here'] },
          stage: `<div style="display:flex;flex-direction:column;gap:6px;opacity:.55">${W.bars(['66%', '84%'])}</div>`
        })}</div>`
  },

  {
    id: 's3f4', stage: 3, kind: 'exercise', verb: 'EXPLORE', action: 'Next',
    carry: { read: ['tree'] },
    intent: 'The storyline is not a new document. It is the tree, rotated.',
    body: () => `
      <div class="ex">
        ${copy('Definition panel', 'Dashes are sections. Dots are the claims each section must make.')}
        <div style="flex:1;min-height:0;display:flex;gap:18px;align-items:stretch">
          <div style="flex:1;min-width:0;border:1px solid var(--rule);border-radius:3px;padding:12px;display:flex;flex-direction:column;gap:8px">
            ${eyebrow('Tree')}<div data-scrubL style="flex:1"></div>
          </div>
          <div style="flex:1;min-width:0;border:1px solid var(--rule);border-radius:3px;padding:12px;display:flex;flex-direction:column;gap:8px">
            ${eyebrow('Storyline')}<div data-scrubR style="flex:1"></div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:12px">
          <span class="s-note" style="white-space:nowrap">Tree</span>
          <input type="range" min="0" max="100" value="0" data-scrub style="flex:1;accent-color:var(--maroon)">
          <span class="s-note" style="white-space:nowrap">Storyline</span>
        </div>
      </div>`
  },

  {
    id: 's3f5', stage: 3, kind: 'sim', verb: 'DECIDE', action: 'Next',
    intent: 'The gaps are real gaps, not a test.',
    notes: () => copy('Copy', 'The gaps are real gaps, not a test. Say it now, not three weeks in.')
      + anno('Suggestions are added to the plan, not marked right or wrong.'),
    body: () => `<div style="display:flex;height:100%">${W.excel({
          controls: true,
          rows: ['head', ['68%', '54%', '72%'], ['52%', '70%', '48%'], 'empty', ['60%', '44%', '66%'], 'empty', 'empty']
        })}</div>`
  },

  {
    id: 's3f5r', stage: 3, kind: 'argument', verb: 'READ', action: 'Next',
    intent: 'The interview list was built against criteria, not against who the team happened to know.',
    body: () => `
      <h2 class="s-h2">28 interviews, three parameters</h2>
      <div style="margin-top:18px">${claims([
        'Equal representation of Global North and Global South, with perspectives from each continent.',
        'A broad set of stakeholder types — public policy, government, multilaterals, funders, NGOs, industry.',
        'Stakeholders already focused on the food-energy nexus, or likely to become interested.'
      ])}</div>
      ${anno('The criteria came out of the claims, and the list was built against the criteria.')}`
  },

  {
    id: 's3f6', stage: 3, kind: 'exercise', verb: 'EXPLORE', action: 'Next',
    intent: 'The sequence held. The durations did not.',
    body: () => `
      <div class="ex">
        <div class="tabs" data-plan>
          <button aria-selected="true" data-t="0">Planned</button>
          <button aria-selected="false" data-t="1">What happened</button>
        </div>
        <div style="flex:1;min-height:0;display:flex;flex-direction:column;justify-content:center;gap:16px">
          <div data-timeline style="display:flex;flex-direction:column;gap:10px"></div>
          <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--mute-2);letter-spacing:.05em">
            <span>April</span><span>June</span><span>September</span>
          </div>
        </div>
        ${anno('The workplan you write on Day 1 will be wrong in its details, and writing it is still what lets you notice you are running long.')}
      </div>`
  },

  {
    id: 's3f7', stage: 3, kind: 'exercise', verb: 'DO', action: 'Add context',
    carry: { read: ['prefs'] },
    intent: 'The form gets you the spread. The conversation gets you the meaning.',
    body: () => `
      <div class="ex">
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;flex:1;min-height:0" data-prefcards></div>
        ${anno('Everyone’s stated hours were reasonable, and none of them told you what was behind them.')}
      </div>`
  },

  {
    id: 's3f8', stage: 3, kind: 'exercise', verb: 'DO', action: 'Agree',
    intent: 'A norm nobody could ever be found to have broken is not doing any work.',
    body: () => `
      <div class="ex">
        ${copy('Prompt', 'The template has categories. We need the specific version for this team.')}
        <div style="flex:1;min-height:0;display:flex;flex-direction:column;gap:8px;overflow:auto" data-norms></div>
        ${anno('Where the submitted preferences conflict, the conflict is visible on screen and you help resolve it rather than watching it get resolved.')}
      </div>`
  },

  {
    id: 's3f9a', stage: 3, kind: 'argument', verb: 'READ', action: 'Next',
    intent: 'A plan the team built is a plan the team owns.',
    body: () => `
      <h2 class="s-h2">Why the core team kick-off mattered</h2>
      <div style="margin-top:18px">${claims([
        'The storyline is the skeleton of the final deliverable, not a document invented later.',
        'Norms named on Day 1 are norms you can point to in week four. The alternative is everyone guessing, and the most junior person guessing hardest.',
        'This is the one session that belongs to the team. It works better without the Partner in it.'
      ])}</div>`
  },

  {
    id: 's3check', stage: 3, kind: 'check', verb: 'READ', action: 'Next',
    intent: 'What the afternoon owes, and what exists when it ends.',
    body: () => ({
      tabs: [
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
    })
  },

  /* ------------------------------ STAGE 4 ------------------------------- */

  {
    id: 's4map', stage: 4, kind: 'map', verb: 'READ', action: 'Begin',
    intent: 'Three closed. The next one happens without you.',
    body: () => map5(3)
  },

  {
    id: 's4intro', stage: 4, kind: 'intro', verb: 'READ', action: 'Begin',
    intent: 'The only stage you are not in the room for.',
    body: () => `
      <h2 class="s-h2">PD alignment on responsibilities</h2>
      ${copy('Copy', 'The PDs meet at the end of the day. The note that comes out is for you.')}
      ${objectives([
        'Tell the PDs what you need from the split before they meet',
        'Read the note they send afterwards',
        'Work out what each line means for your week'
      ], [
        'Say who to go to for what on your project',
        'Know when to expect feedback, and that you can ask sooner'
      ])}`
  },

  {
    id: 's4f1', stage: 4, kind: 'sim', verb: 'DECIDE', action: 'Reply or skip',
    intent: 'You are asked before the meeting, not told after it.',
    notes: () => copy('Calendar', 'End-of-day block, greyed out, two Partners only.')
      + copy('Teams', 'Anything you need built into the split? Say it now.')
      + anno('Added to Day 1 because of the 2025 Pulse survey: people could not tell when their PD would be involved, and feedback arrived too late to act on.'),
    body: () => `<div style="display:flex;height:100%;position:relative">${W.outlook({
          rows: [
            { from: '40%', lines: ['62%'] },
            { from: '34%', lines: ['54%'] },
            { from: '46%', lines: ['58%'] }
          ],
          pane: false
        })}
        ${W.toast({ action: 'Reply', delay: 400 })}</div>`
  },

  {
    id: 's4f2', stage: 4, kind: 'sim', verb: 'READ', action: 'Next',
    intent: 'Five lines, short enough to read without scrolling.',
    notes: () => copy('Note', 'How the two Partners split the project, so nobody is guessing.')
      + anno('The only artefact of this stage, and the only part of it the team ever sees.'),
    body: () => `<div style="display:flex;height:100%">${W.teamsChat({
          messages: [{ from: '32%', lines: ['92%'], live: true }],
          attached: `<div style="margin:10px;border:1px solid var(--rule);border-radius:3px;padding:12px;display:flex;flex-direction:column;gap:8px">
            ${['Who leads the hypothesis and the content',
               'Who leads the client and the energy-side analysis',
               'Location, and what it means for review style',
               'How coaching splits between the two',
               'Feedback within a day of each checkpoint'].map((l, i) =>
              `<div style="display:flex;gap:8px;align-items:baseline">
                <span style="font-size:9px;color:var(--mute-2)">${i + 1}</span>
                <span style="font-size:11px;color:var(--ink);line-height:1.35">${l}</span></div>`).join('')}
          </div>`
        })}</div>`
  },

  {
    id: 's4f2b', stage: 4, kind: 'exercise', verb: 'EXPLORE', action: 'Next',
    intent: 'Two senior people, and they are not interchangeable.',
    body: () => `
      <div class="ex">
        <div style="display:grid;grid-template-columns:150px 1fr;gap:0;flex:1;min-height:0;align-content:start">
          ${[
            ['On the workstream split', 'Content questions to one, client questions to the other. Crossing over gets a slower answer.'],
            ['On location', 'Reviews will be offline more often than live. That changes how you write things up.'],
            ['On feedback', 'You are entitled to it within a day. Asking is following the note, not chasing.']
          ].map(([k, v], i) => `
            <div style="padding:12px 14px 12px 0;border-top:1px solid ${i ? 'var(--rule-soft)' : 'var(--rule)'};font-size:11px;font-weight:700;color:var(--ink-strong)">${k}</div>
            <div style="padding:12px 0;border-top:1px solid ${i ? 'var(--rule-soft)' : 'var(--rule)'}">
              ${copy('What it means for your week', v)}</div>`).join('')}
        </div>
      </div>`
  },

  {
    id: 's4f3a', stage: 4, kind: 'argument', verb: 'READ', action: 'Next',
    intent: 'Twenty minutes between two people, written down, prevents a fortnight of guessing.',
    body: () => `
      <h2 class="s-h2">Why PD alignment mattered</h2>
      <div style="margin-top:18px">${claims([
        '2025 Pulse: people could not tell when their PD would be involved.',
        '2025 Pulse: feedback arrived at the end of the project, too late to act on.',
        'Both point at the same gap — nobody had written down how the PDs would show up.'
      ])}</div>
      ${anno('The note is the clearest statement you will get of what to expect from the most senior people on your project.')}`
  },

  {
    id: 's4check', stage: 4, kind: 'check', verb: 'READ', action: 'Next',
    intent: 'Twenty minutes of agreement, and what it has to produce.',
    body: () => ({
      tabs: [
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
    })
  },

  /* ------------------------------ STAGE 5 ------------------------------- */

  {
    id: 's5map', stage: 5, kind: 'map', verb: 'READ', action: 'Begin',
    intent: 'Four closed. The last one is a preview, not a stage.',
    body: () => map5(4)
  },

  {
    id: 's5intro', stage: 5, kind: 'intro', verb: 'READ', action: 'Begin',
    intent: 'Not part of Day 1, and not what we are standardising.',
    body: () => `
      <h2 class="s-h2">Week 1</h2>
      ${copy('Copy', 'Included so you can see where today’s outputs end up.')}
      ${objectives([
        'Watch the four Day 1 artefacts expand across the first week',
        'See what happens when evidence contradicts a claim'
      ], [
        'Explain why a hypothesis changing is the process working rather than failing'
      ])}`
  },

  {
    id: 's5f1', stage: 5, kind: 'exercise', verb: 'WATCH', action: 'Next',
    carry: { read: ['tree', 'facts'] },
    intent: 'By Friday the tree has already changed. That is it working, not failing.',
    body: () => `
      <div class="ex">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div style="display:flex;gap:18px" data-days>
            ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d, i) =>
              `<span class="s-note" data-day="${i}" style="letter-spacing:.06em">${d}</span>`).join('')}
          </div>
          <button class="ex__ref" data-replay style="border-radius:3px;border-bottom:1px solid var(--rule)">${W.glyph('play')}Replay</button>
        </div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;flex:1;min-height:0" data-week></div>
        ${anno('The claim that did not survive is the one that saved the most time, because it stopped four weeks of research pointing the wrong way.')}
      </div>`
  },

  {
    id: 's5f2', stage: 5, kind: 'sim', verb: 'READ', action: 'Next',
    intent: 'A structural comment now moves a heading. In week four it rewrites ten slides.',
    notes: () => copy('Copy', 'Comments land on argument and structure, because there is no prose yet.')
      + anno('Review markers match the responsibilities note exactly. This is the first time you see that note being kept.'),
    body: () => `<div style="display:flex;height:100%">${W.powerpoint({
          thumbs: 10, at: 2,
          slide: `<div style="display:flex;flex-direction:column;gap:9px;height:100%;position:relative">
            ${W.bar('64%', 'strong')}
            <div style="flex:1;border:1px dashed var(--rule);border-radius:2px"></div>
            <div style="position:absolute;top:-2px;right:-2px;display:flex;flex-direction:column;gap:5px;align-items:flex-end">
              <span style="font-size:8px;background:var(--fill-2);color:var(--mute);padding:2px 6px;border-radius:2px">live · content</span>
              <span style="font-size:8px;background:var(--fill-2);color:var(--mute);padding:2px 6px;border-radius:2px">offline · client</span>
            </div>
          </div>`
        })}</div>`
  },

  {
    id: 's5f3', stage: 5, kind: 'argument', verb: 'READ', action: 'Next',
    intent: 'Getting it wrong early is cheap. Getting it wrong late is not.',
    body: () => `
      <h2 class="s-h2">Why Week 1 was worth showing</h2>
      <div style="margin-top:18px">${claims([
        'The tree changing in week one is exactly what a Day 1 hypothesis is for.',
        'Reviewing a ghost deck costs an afternoon. Reviewing a full deck costs a fortnight.',
        'Day 1 is what makes the early review possible, because it produces something reviewable.'
      ])}</div>
      ${anno('No checklists for this stage.')}`
  },

  /* ------------------------------- CLOSE -------------------------------- */

  {
    id: 'fin1', stage: 6, kind: 'vault', verb: 'EXPLORE', action: 'Next',
    carry: { read: ['scq', 'tree', 'prefs', 'facts'] },
    intent: 'Everything you made, and everything that stays available.',
    body: () => `
      <div class="tabs" data-vault>
        <button aria-selected="true" data-v="0">Artefact trail</button>
        <button aria-selected="false" data-v="1">Your vault</button>
        <button aria-selected="false" data-v="2">How it went</button>
      </div>
      <div class="scrollzone"><div data-vaultbody></div></div>`
  },

  {
    id: 'fin2', stage: 6, kind: 'argument', verb: 'READ', action: 'Next',
    intent: 'Not right, but specific enough to be tested.',
    body: () => `
      <h2 class="s-h2">One last look at the real hypothesis</h2>
      <div style="margin-top:18px">${claims([
        'Five claims, written before the evidence existed, with a placeholder still in the recommendations.',
        'Four of the five made it into the published report. One did not survive the interviews.',
        'The strongest argument in the final report was not on the Day 1 slide at all.'
      ])}</div>
      ${anno('That is what a good Day 1 looks like. Clear enough that four weeks of research knew where to point.')}`
  },

  {
    id: 'fin3', stage: 6, kind: 'splash', verb: 'READ', action: 'Close',
    intent: 'Complete, and returnable at any time.',
    body: () => `
      <div style="display:flex;flex-direction:column;height:100%;justify-content:center;align-items:center;text-align:center;gap:14px">
        <h1 class="s-h1" style="margin:0">Day 1 complete</h1>
        ${copy('Copy', 'Everything stays available here and on the Hub. Come back any time.')}
      </div>`
  }

  ];

  /* --- stage labels for grouping ---------------------------------------- */

  const STAGES = [
    { n: 0, name: 'Welcome' },
    { n: 1, name: 'Day 0' },
    { n: 2, name: 'Full-team kick-off' },
    { n: 3, name: 'Core team kick-off' },
    { n: 4, name: 'PD alignment' },
    { n: 5, name: 'Week 1 preview' },
    { n: 6, name: 'Close' }
  ];

  /* stage n -> which of the five product stages is lit in the top strip */
  const PROGRESS = { 0: -1, 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5 };

  const CARRY = [
    { k: 'scq',   label: 'SCQ' },
    { k: 'tree',  label: 'Tree' },
    { k: 'prefs', label: 'Preferences' },
    { k: 'facts', label: 'Facts' }
  ];

  global.CONTENT = { SCREENS, STAGES, MAP5, PROGRESS, CARRY, helpers: { copy, list, anno, eyebrow, claims, map5, roles } };

})(window);

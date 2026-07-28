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
    label: "The opening screen",
    intent: "The first screen of the training. It says what the experience is, roughly how long it takes, that you can stop and come back to it, and that nothing here is assessed.",
    body: () => `
      <div style="display:flex;flex-direction:column;height:100%">
        <div style="margin-bottom:auto">
          <h1 class="s-h1">Day 1</h1>
          ${copy('Copy', 'Welcome text explaining what the experience is, roughly how long it takes, and that you can leave it and pick it up again later.')}
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
    label: "Why the first day matters",
    intent: "A short argument for why the first day of a project carries more weight than any other. Four numbered reasons, which you read and move past.",
    body: () => `
      <h2 class="s-h2">Day 1 is the highest-leverage day of the project</h2>
      <div style="margin-top:20px">${claims([
        'It sets the tone. How the first day runs shapes how the next ten weeks run.',
        'It brings the firm’s expertise into the room early, and gives you access to it.',
        'It makes the team faster. A hypothesis on Day 1 tells you what to test and what to ignore, so week one is not spent reading.',
        'It gives everyone the same start, whatever the project and whoever the team.'
      ])}</div>
      ${anno('Day 1 does not have to be a single day. It can spread across several. However it runs, this is the start you should expect to get.')}`
  },

  {
    id: 's0c', stage: 0, kind: 'map', verb: 'READ', action: 'Begin',
    label: "A map of the five stages ahead",
    intent: "A map of the five stages you are about to go through, with an estimate of how long each one takes. None of them are open yet — this screen exists only to show you the shape of what is coming.",
    decision: 'Stage map in the deck repeats one description across Core team KO, PD alignment and Week 1. Durations here are reconciled from each stage intro; the map itself still reads “X mins”.',
    body: () => `<h2 class="s-h2">Five stages</h2>${map5(-1)}`
  },

  /* ------------------------------ STAGE 1 ------------------------------- */

  {
    id: 's1map', stage: 1, kind: 'map', verb: 'READ', action: 'Begin',
    label: "Day 0 opens, four stages still closed",
    intent: "The map returns, with Day 0 now open and the other four stages still closed. A version of this screen sits between every stage, so you always know how far along you are.",
    body: () => map5(0)
  },

  {
    id: 's1intro', stage: 1, kind: 'intro', verb: 'READ', action: 'Begin',
    label: "What Day 0 covers",
    intent: "An introduction to Day 0, which is everything between being staffed on the project and walking into the kick-off prepared. It lists what you will do in this stage and what you should be able to do by the end of it.",
    body: () => `
      <h2 class="s-h2">Day 0</h2>
      ${copy('Copy', 'A line saying that Day 0 happens in your own time across a few days, and adds up to about an hour of actual work.')}
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
    label: "The staffing note arrives in your inbox",
    intent: "You arrive at an inbox where nothing has happened yet. The staffing note is already open, and a second email from the PM arrives while you are reading it. You do nothing on this screen except read, which is deliberate: nothing heavy is expected of you before the kick-off.",
    notes: () => copy('Email 1', 'The staffing note. It names the project, the client, the start and end dates and who else is on the team, with the proposal attached.')
      + copy('Email 2', 'An email from the PM welcoming the team and naming one action: scan the proposal. She takes the setup work onto herself.'),
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
    label: "You click around the project folder",
    intent: "The project folder opens as a tree you can click around in any order. Nothing is locked and nothing has to be hunted for. Two folders carry a small mark, because the next two screens happen inside them.",
    notes: () => copy('Teams', 'A message from the PM confirming she has set the folder up, and inviting anyone to add what is missing.')
      + anno('When you are staffed for real, this structure should already look familiar rather than being one more new thing to work out.'),
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
    label: "Two documents open and are skimmed",
    intent: "A few seconds of animation rather than something you do. Two documents — the proposal and a past qual deck — open and scroll past quickly, to show that the expected pace here is skimming rather than studying.",
    notes: () => copy('Beat', 'The proposal and a past qual deck open and scroll past quickly, over a few seconds.')
      + anno('The previous screen told you to read the proposal. This one shows it being read, because showing the pace works better than describing it.'),
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
    label: "You pin facts from the context brief",
    intent: "The Partner posts the context brief a day or two before the kick-off. You scroll through its three sections and pin facts as you go, which sends them to the team fact pack. Whatever you pin is carried with you through the rest of the walkthrough.",
    notes: () => copy('Teams', 'A message from the Partner posting the brief, listing its three parts: sector and project context, client notes, and key tensions.')
      + copy('Callout', 'A note explaining that Partners generate these briefs from a standard skill, and that you will receive one on your project.')
      + anno('The third section, key tensions, is the part a proposal never contains, because a proposal is written to win the work.'),
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
    label: "The PM asks everyone to draft an SCQ",
    intent: "A notification from the PM arrives while you are still reading the brief. She asks everyone, herself included, to write their own SCQ and problem statement before the meeting. Accepting the task takes you into the exercise on the next screen.",
    notes: () => copy('Teams', 'A message from the PM asking everyone to write their own SCQ and their own reading of the problem statement before the meeting.')
      + anno('The PM is not asking for the right answer, and she is not assigning it to one person. Everyone drafts their own version, including her.'),
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
    label: "You write your own SCQ and check it",
    intent: "You write your own SCQ across three fields, and a problem statement below them. Pressing Check returns a score on each, and you keep revising and checking until you clear the bar. What you write here is saved, and it comes back in the kick-off.",
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
    label: "Why Day 0 mattered",
    intent: "A closing screen for Day 0. It sets out, in three points, why the preparation you have just done was worth doing.",
    body: () => `
      <h2 class="s-h2">Why Day 0 mattered</h2>
      <div style="margin-top:18px">${claims([
        'The kick-off can only do deep thinking if the context is already in people’s heads. Every hour of context-setting done now is an hour the meeting does not spend on it.',
        'Your rough SCQ is what makes the kick-off have three framings in it instead of one.',
        'Most of Day 0 is finding material the firm already has, rather than making something new. The proposal team has some, and past quals have adjacent work.'
      ])}</div>`
  },

  {
    id: 's1check', stage: 1, kind: 'check', verb: 'READ', action: 'Next',
    label: "What each role owes before Day 1",
    intent: "A checklist of what each role should have done before Day 1 starts. The second tab shows what should exist by the time Day 0 is over.",
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
    label: "Day 0 complete, the kick-off opens",
    intent: "The map again. Day 0 is now marked complete, and the full-team kick-off is open.",
    body: () => map5(1)
  },

  {
    id: 's2intro', stage: 2, kind: 'intro', verb: 'READ', action: 'Begin',
    label: "What the full-team kick-off covers",
    intent: "An introduction to the full-team kick-off: the first time the whole team is in a room, at least two hours long, and always held before any client kick-off. It lists what you will do here and what you should be able to do afterwards.",
    body: () => `
      <h2 class="s-h2">Full-team kick-off, with the content jam</h2>
      ${copy('Copy', 'A line explaining that this is the first time the whole team is in a room, and that it is where the project’s thinking starts.')}
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
    label: "The meeting opens and the agenda appears",
    intent: "A calendar invite dissolves into the meeting, and the agenda writes itself in one line at a time. You only watch, so that you can see the shape of the next two hours before any of it begins.",
    notes: () => copy('Beat', 'The calendar invite dissolves into the meeting, and the agenda then writes itself in one line at a time.')
      + copy('Opening', 'The PM’s opening line: everyone has read the brief, so no hour will be spent on context, and the meeting starts with where each person landed.')
      + anno('The meeting runs for at least two hours. It can be split across two sittings, and it always happens before any client kick-off.'),
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
    label: "Your SCQ, next to two colleagues’",
    intent: "Your own SCQ from Day 0 loads first, marked as yours. Two colleagues’ versions then appear beside it, and you see that all three are different — most sharply in the question. This is the screen that pays off having drafted separately.",
    body: () => `
      <div class="ex">
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;flex:1;min-height:0" data-scqcards></div>
        ${anno('All three SCQs are defensible, and the question is different in each one. If everyone had waited to hear the Partner’s version first, this meeting would have one idea in it instead of three.')}
      </div>`
  },

  {
    id: 's2f3', stage: 2, kind: 'exercise', verb: 'DECIDE', action: 'Next',
    label: "You find four undefined words",
    intent: "One agreed problem statement, centred and large. Four ordinary-looking words in it have never actually been defined. You click to find them, and each one opens the question hiding inside it. You have to find all four before moving on.",
    body: () => `
      <div class="ex" style="justify-content:center;gap:26px">
        <div class="hunt" data-hunt>
          How might <mark data-w="0">smallholder</mark> systems shift away from
          <mark data-w="1">fossil-dependent</mark> inputs at
          <mark data-w="2">scale</mark>, and what would make that
          <mark data-w="3">viable</mark>?
        </div>
        <div style="text-align:center">${copy('Prompt', 'A prompt saying the sentence looks agreed, that four things in it are not yet defined, and asking you to find them.')}</div>
        ${anno('Two of the four were resolvable by the team. Two went to the client as questions that week.')}
      </div>`
  },

  {
    id: 's2f4a', stage: 2, kind: 'exercise', verb: 'READ', action: 'What is a hypothesis?',
    label: "The Partner states the hypothesis",
    intent: "The Partner states the hypothesis as a flat claim, alone on the screen with nothing else on it. The screen holds there a beat longer than is comfortable, and then offers you a definition of what a hypothesis is.",
    body: () => `
      <div class="ex" style="justify-content:center;align-items:center;text-align:center">
        <div style="max-width:44ch">
          ${copy('Claim', 'The top-level hypothesis, stated flat as a claim, with no hedging.')}
        </div>
        <div data-defn style="max-width:56ch;margin-top:26px;display:none">
          ${copy('Definition panel', 'A definition of a hypothesis: the team’s best answer to the client’s question, written down before the research is done, and specific enough that evidence could prove it wrong.')}
        </div>
      </div>`
  },

  {
    id: 's2f4b', stage: 2, kind: 'exercise', verb: 'DECIDE', action: 'Next',
    label: "You turn over the objection you have",
    intent: "Four cards lie face down, each carrying an objection someone might genuinely be thinking at this point. You turn over whichever ones apply to you, and each one opens a reply from a different member of the team.",
    body: () => `
      <div class="ex">
        ${copy('Prompt', 'A prompt saying most people have at least one of these objections in their head, and inviting you to turn over the ones you are thinking.')}
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
          <span class="s-note">Turn over a card to see how that objection gets answered.</span>
        </div>
      </div>`
  },

  {
    id: 's2f4c', stage: 2, kind: 'exercise', verb: 'DECIDE', action: 'Apply hypothesis',
    label: "The hypothesis narrows the research field",
    intent: "The whole research field appears as a wide grid of topics, every one of them worth studying and far more than three people could cover in four weeks. Applying the hypothesis fades most of them out and leaves a shortlist.",
    body: () => `
      <div class="ex">
        <div style="display:flex;justify-content:space-between;align-items:baseline;gap:16px">
          ${copy('Constraint bar', 'A constraint line reading: four weeks, three people, and 28 conversations if you choose well.')}
        </div>
        <div data-field style="flex:1;min-height:0;display:grid;grid-template-columns:repeat(8,1fr);gap:6px;align-content:start"></div>
        ${anno('The hypothesis is not what the team believed. It is what the team decided to spend four weeks testing.')}
      </div>`
  },

  {
    id: 's2f4d', stage: 2, kind: 'exercise', verb: 'EXPLORE', action: 'Next',
    label: "One hunch held; one finding was a surprise",
    intent: "Two pairings you toggle between. The first shows a Day 1 hunch that four weeks of research went on to confirm. The second shows the strongest argument in the final report, which was not on the Day 1 slide at all.",
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
    label: "You build three branches from the claim",
    intent: "You drag candidate sub-claims into three branch slots beneath a fixed top-level claim. Some of the candidates are decoys, and Check tells you which ones and why. You keep revising until all three branches hold.",
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
    label: "The real Day 1 slide, left as it was",
    intent: "The real slide from the end of Day 1 on this project, shown exactly as it was left. Two things on it are marked: a sentence in the tensions section that does not parse, and a yellow placeholder nobody had filled in. Neither was tidied up, because the meeting ended before the thinking was finished.",
    notes: () => eyebrow('Real artefact')
      + copy('Annotation 1', 'An annotation pointing at a sentence in the tensions section that does not parse.')
      + copy('Annotation 2', 'An annotation pointing at a yellow placeholder the team had not filled in.')
      + anno('This is the most useful artefact in the archive, because it shows what the end of a real Day 1 actually looks like, which is nothing like the polished version that circulates later.'),
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
    label: "The team agrees the deliverable format",
    intent: "A short Teams exchange, three or four messages long, in which the team agrees what the deliverable is and who reads it. It is deliberately brief, and the brevity is the teaching.",
    notes: () => copy('Exchange', 'Three or four messages in which the team agrees what the deliverable is and who its primary reader will be.')
      + anno('This is deliberately anticlimactic after the previous screen, and the brevity is the point. Two minutes spent here saves a rebuild in week three.'),
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
    label: "Why the full-team kick-off mattered",
    intent: "A closing screen for the full-team kick-off. It sets out in three points why the session was worth two hours.",
    body: () => `
      <h2 class="s-h2">Why the full-team kick-off mattered</h2>
      <div style="margin-top:18px">${claims([
        'The proposal was written about fossil fuel in agriculture, which is an emissions problem. The published report was about the food-energy nexus and collaboration, which is a coordination problem. That reframe happened in this room.',
        'A hypothesis lets a three-person team choose 28 conversations out of hundreds.',
        'This is the moment with the most senior attention on the project and the least work already committed. Changing the argument costs an afternoon today. In week six it costs a fortnight.'
      ])}</div>
      ${anno('You get a recap here: which branches you placed first, which decoys you picked up and put back, and how many passes it took to clear the bar.')}`
  },

  {
    id: 's2check', stage: 2, kind: 'check', verb: 'READ', action: 'Next',
    label: "What each role owes the kick-off",
    intent: "A checklist of what each role should have done during the kick-off. The second tab shows what should exist by the time it ends.",
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
    label: "Two complete, the afternoon session opens",
    intent: "The map again. Two stages are complete, and the afternoon session is now open.",
    body: () => map5(2)
  },

  {
    id: 's3intro', stage: 3, kind: 'intro', verb: 'READ', action: 'Begin',
    label: "What the core team kick-off covers",
    intent: "An introduction to the core team kick-off: a smaller session later the same day, run by the PM, with the Partner not in the room. It lists what you will do here and what you should be able to do afterwards.",
    body: () => `
      <h2 class="s-h2">Core team kick-off</h2>
      ${copy('Copy', 'A line explaining that this is a smaller session later the same day, run by the PM, with the Partner not in the room.')}
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
    label: "The PM emails the deck and a form",
    intent: "An email from the PM arrives straight after the morning session. It attaches the kick-off deck and asks you to fill in a short preferences form before the afternoon. She also says her storyline and workplan drafts are rough and meant to be argued with.",
    notes: () => copy('Email', 'An email attaching the core team kick-off deck and asking you to fill in the preferences form before the session.')
      + copy('Also', 'The rest of the same email, saying she has taken a first pass at the storyline and the workplan, and that both are rough and meant to be argued with.')
      + anno('The preferences are collected in writing on purpose. In a live conversation, the first person to speak sets the range and everyone else adjusts towards it.'),
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
    label: "You fill in your working preferences",
    intent: "You fill in a short form about your working hours, how you like to receive feedback, and what meeting cadence suits you. There is no scoring and no right answer. Your answers are saved, and the whole team sees them later in this stage.",
    notes: () => copy('Prompt', 'A prompt asking you to answer for yourself rather than for the version of yourself a new team might want, and noting that everyone’s answers go up on screen, including yours.')
      + anno('The form takes about five minutes. There is no scoring and no right answer.'),
    body: () => `<div style="display:flex;height:100%" data-prefs></div>`
  },

  {
    id: 's3f3', stage: 3, kind: 'sim', verb: 'READ', action: 'Next',
    label: "A smaller meeting, without the Partner",
    intent: "The team reconvenes in a visibly smaller meeting, with the Partner’s tile empty. The PM explains the absence rather than leaving you to wonder about it, and sets out the three things she wants by the end of the session.",
    notes: () => copy('Opening', 'The PM’s opening: the Partner is not in this session, and the hypothesis is now the team’s to work with.')
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
    label: "You drag the tree into a storyline",
    intent: "A slider you drag between two views. Dragging one way rotates the morning’s hypothesis tree into a dot-dash storyline; dragging back reverses it. You are not building anything here — you are checking where the PM’s draft came from.",
    body: () => `
      <div class="ex">
        ${copy('Definition panel', 'A definition of a dot-dash storyline: the dashes are the sections, and the dots are the claims each section has to make for the argument to hold.')}
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
    label: "You flag experience against the research plan",
    intent: "The PM’s first-cut research plan, shown as a grid with some rows filled in and some deliberately left empty. Two controls on each row let you flag relevant experience or suggest a source. The empty rows are real gaps, not a test.",
    notes: () => copy('Copy', 'A line from the PM saying the gaps in the plan are real gaps rather than a test, and asking people to speak up now rather than three weeks in.')
      + anno('Anything you suggest is added to the plan. It is not marked right or wrong.'),
    body: () => `<div style="display:flex;height:100%">${W.excel({
          controls: true,
          rows: ['head', ['68%', '54%', '72%'], ['52%', '70%', '48%'], 'empty', ['60%', '44%', '66%'], 'empty', 'empty']
        })}</div>`
  },

  {
    id: 's3f5r', stage: 3, kind: 'argument', verb: 'READ', action: 'Next',
    label: "How the real interview list was built",
    intent: "After you have contributed, the screen shows how the interview list on this project was actually built: 28 people chosen against three stated criteria, rather than by who the team happened to know.",
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
    label: "Planned workplan against what happened",
    intent: "A timeline of the workplan, with a toggle between what was planned and what actually happened. The order of the phases held. The durations did not.",
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
    label: "Everyone’s preferences go up at once",
    intent: "Everyone’s submitted preferences appear on screen at the same time, yours among them. Each person then talks through their own answers, adding the context a form cannot ask for, and you are prompted to add yours.",
    body: () => `
      <div class="ex">
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;flex:1;min-height:0" data-prefcards></div>
        ${anno('Everyone’s stated hours were reasonable, and none of them told you what was actually behind them. The form gets the spread; the conversation gets the meaning.')}
      </div>`
  },

  {
    id: 's3f8', stage: 3, kind: 'exercise', verb: 'DO', action: 'Agree',
    label: "The team agrees its working norms",
    intent: "The team works down a mostly empty norms template, agreeing a specific version of each line. Where people’s submitted preferences conflict, the conflict is visible on screen, and you take part in resolving it rather than watching it get resolved.",
    body: () => `
      <div class="ex">
        ${copy('Prompt', 'A prompt saying the template only supplies categories, and that what is needed is the specific version for this team on this project.')}
        <div style="flex:1;min-height:0;display:flex;flex-direction:column;gap:8px;overflow:auto" data-norms></div>
        ${anno('Norms named on Day 1 are norms you can point to in week four. Norms that were never named do not exist, and the person who suffers most from that is usually the most junior person on the team.')}
      </div>`
  },

  {
    id: 's3f9a', stage: 3, kind: 'argument', verb: 'READ', action: 'Next',
    label: "Why the core team kick-off mattered",
    intent: "A closing screen for the core team kick-off. It sets out in three points why this session belongs to the team.",
    body: () => `
      <h2 class="s-h2">Why the core team kick-off mattered</h2>
      <div style="margin-top:18px">${claims([
        'The storyline is the skeleton of the final deliverable, not a document invented later.',
        'Norms named on Day 1 are norms you can point to in week four. The alternative is everyone guessing, and the most junior person guessing hardest.',
        'This is the one session of Day 1 that belongs entirely to the team. It works better without the Partner in it, because a plan the team built is a plan the team owns.'
      ])}</div>`
  },

  {
    id: 's3check', stage: 3, kind: 'check', verb: 'READ', action: 'Next',
    label: "What each role owes the afternoon",
    intent: "A checklist of what each role should have done during the afternoon session. The second tab shows what should exist by the time it ends.",
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
    label: "Three complete; the next is without you",
    intent: "The map again. Three stages are complete, and the next one happens without you in the room.",
    body: () => map5(3)
  },

  {
    id: 's4intro', stage: 4, kind: 'intro', verb: 'READ', action: 'Begin',
    label: "What PD alignment covers",
    intent: "An introduction to PD alignment. The two Partners meet at the end of the day to agree how they will run the project between them. You are not in this meeting, but the note that comes out of it is written for you.",
    body: () => `
      <h2 class="s-h2">PD alignment on responsibilities</h2>
      ${copy('Copy', 'A line explaining that the two Partners meet at the end of the day, and that the note they produce is written for you.')}
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
    label: "You are asked before the meeting happens",
    intent: "A calendar block at the end of the day shows a meeting with only the two Partners in it. Before it happens, one of them messages the team asking whether anyone needs anything built into the split. You can reply or skip — either is fine.",
    notes: () => copy('Calendar', 'A greyed-out calendar block at the end of the day, showing only the two Partners as participants.')
      + copy('Teams', 'A message from one Partner asking whether anyone needs anything built into the split before the two of them meet.')
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
    label: "The responsibilities note arrives",
    intent: "The note arrives in the team channel. It is five lines long, short enough to read without scrolling, and it is the only thing this stage produces.",
    notes: () => copy('Note', 'The responsibilities note, setting out how the two Partners are splitting the project so that nobody has to guess.')
      + anno('This note is the only thing the stage produces, and the only part of the meeting the team ever sees.'),
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
    label: "What each line means for your week",
    intent: "Each line of the note set against what it actually changes about your week. You click through them one at a time.",
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
    label: "Why PD alignment mattered",
    intent: "A closing screen for PD alignment. It explains why the stage was added and what twenty minutes of agreement prevents.",
    body: () => `
      <h2 class="s-h2">Why PD alignment mattered</h2>
      <div style="margin-top:18px">${claims([
        'The 2025 Pulse survey found that people could not tell when their PD would be involved in the work.',
        'It also found that feedback arrived at the end of the project, when it was too late to act on.',
        'Both findings point at the same gap: nobody had written down how the PDs would show up, so everyone was guessing.'
      ])}</div>
      ${anno('The note is the clearest statement you will get of what to expect from the most senior people on your project.')}`
  },

  {
    id: 's4check', stage: 4, kind: 'check', verb: 'READ', action: 'Next',
    label: "What the split has to produce",
    intent: "A checklist of what the Partners and the team should have done. The second tab shows what should exist afterwards.",
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
    label: "Four complete; a preview remains",
    intent: "The map one last time. Four stages are complete, and what remains is a preview rather than a stage.",
    body: () => map5(4)
  },

  {
    id: 's5intro', stage: 5, kind: 'intro', verb: 'READ', action: 'Begin',
    label: "What the Week 1 preview covers",
    intent: "An introduction to the Week 1 preview. This is not part of Day 1 and is not what is being standardised. It is here so you can see where the things you made today end up.",
    body: () => `
      <h2 class="s-h2">Week 1</h2>
      ${copy('Copy', 'A line explaining that Week 1 is included only so you can see where the things you made today end up.')}
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
    label: "The artefacts grow; one branch turns red",
    intent: "An animation running Monday to Friday. The four Day 1 artefacts fill out across the week, and one branch of the hypothesis tree turns red as evidence comes back that does not support it. You can replay it.",
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
    label: "The empty deck is reviewed early",
    intent: "A first review lands on the deck while it is still empty. The comments are about argument and structure, because there is no prose yet, and the review markers match the responsibilities note exactly.",
    notes: () => copy('Copy', 'A line explaining that the comments land on argument and structure, because there is no prose in the deck yet.')
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
    label: "Why the preview was worth showing",
    intent: "A closing screen for the preview. It explains why an early, cheap review is the thing Day 1 makes possible.",
    body: () => `
      <h2 class="s-h2">Why Week 1 was worth showing</h2>
      <div style="margin-top:18px">${claims([
        'The tree changing in week one is exactly what a Day 1 hypothesis is for.',
        'Reviewing a ghost deck costs an afternoon. Reviewing a full deck costs a fortnight.',
        'Day 1 is what makes the early review possible, because it produces something reviewable.'
      ])}</div>
      ${anno('This stage has no checklists, because it is a preview rather than a part of Day 1.')}`
  },

  /* ------------------------------- CLOSE -------------------------------- */

  {
    id: 'fin1', stage: 6, kind: 'vault', verb: 'EXPLORE', action: 'Next',
    carry: { read: ['scq', 'tree', 'prefs', 'facts'] },
    label: "Everything you made, and what stays",
    intent: "The final summary, in three tabs: every artefact Day 1 produced, the templates and checklists that stay available to you afterwards, and a record of what you personally contributed on the way through.",
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
    label: "What happened to the real hypothesis",
    intent: "A last look at the real hypothesis from this project. Four of its five claims made it into the published report, one did not survive the interviews, and the report’s strongest argument was never on the Day 1 slide at all.",
    body: () => `
      <h2 class="s-h2">One last look at the real hypothesis</h2>
      <div style="margin-top:18px">${claims([
        'The team committed to five claims, written before any evidence existed, with a placeholder still sitting in the recommendations.',
        'Four of those five claims made it into the published report. One did not survive the interviews.',
        'The strongest argument in the final report was not on the Day 1 slide at all.'
      ])}</div>
      ${anno('That is what a good Day 1 looks like: not right, but specific enough to be tested, and clear enough that four weeks of research knew where to point.')}`
  },

  {
    id: 'fin3', stage: 6, kind: 'splash', verb: 'READ', action: 'Close',
    label: "The training is complete",
    intent: "The closing screen. It confirms the training is finished and that everything stays available if you want to come back to it.",
    body: () => `
      <div style="display:flex;flex-direction:column;height:100%;justify-content:center;align-items:center;text-align:center;gap:14px">
        <h1 class="s-h1" style="margin:0">Day 1 complete</h1>
        ${copy('Copy', 'A line confirming that everything stays available here and on the Hub, and that you can come back to it at any time.')}
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

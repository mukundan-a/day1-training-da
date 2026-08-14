/* ============================================================================
   data.js — the content model for Variant 2.
   Everything shown on screen is a placeholder. No real FEN content is sourced;
   the "what we need to collect" notes in the README are for the real build, not
   this mockup. Captions name each artefact as a placeholder.
   ========================================================================= */

/* ---- inline icons (single source, referenced by name) -------------------- */
const ICON = {
  notch: '<svg viewBox="0 0 26 13" fill="none"><path d="M0 11h9V4h9V0h8" stroke="currentColor" stroke-width="2.5"/></svg>',
  doc:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>',
  notes: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 5h16M4 12h16M4 19h10"/></svg>',
  chat:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>',
  lock:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
  arrowL:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>',
  arrowR:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
  down:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v14M6 11l6 6 6-6M4 21h16"/></svg>',
  plus:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>',
  star:  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3 6.5 7 .7-5.2 4.7 1.5 6.9L12 17.8 5.2 20.8l1.5-6.9L1.5 9.2l7-.7z"/></svg>',
  info:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>',
  ext:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>',
  pin:   '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C7.6 2 4 5.6 4 10c0 5.4 7 11.5 7.3 11.8.4.3 1 .3 1.4 0C13 21.5 20 15.4 20 10c0-4.4-3.6-8-8-8z"/></svg>',
  play:  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
};

/* ---- the five stages (the recurring journey rail) ------------------------ */
const STAGES = [
  { n: 0, name: 'Welcome',            sub: 'Setting expectations before anything starts',        time: 'XX min' },
  { n: 1, name: 'Day 0',              sub: 'Getting set up before the project starts',            time: 'XX min' },
  { n: 2, name: 'Full-team kick-off', sub: "Where the project's thinking starts",                 time: 'XX min' },
  { n: 3, name: 'Core-team kick-off', sub: 'Turning Day 1 into something you can start tomorrow',  time: 'XX min' },
  { n: 4, name: 'Close',              sub: 'Conclusion',                                           time: 'XX min' },
];

/* ---- persistent Docs tab contents (all placeholder artefacts) ------------ */
const DOCS = [
  { id: 'proposal', name: 'FEN proposal',        kind: 'pdf', meta: 'PDF · lands when you are staffed',        when: 'Day 0' },
  { id: 'brief',    name: "PD's context brief",  kind: 'pdf', meta: 'PDF · a couple of days before kick-off',  when: 'Day 0' },
  { id: 'iko',      name: 'Core-team kick-off deck', kind: 'ppt', meta: 'Deck · the standard IKO / norms deck', when: 'Core-team' },
  { id: 'pdsplit',  name: 'Note: how the PDs split the project', kind: 'doc', meta: 'Note · who leads what',    when: 'Day 0' },
];

/* ---- role-split checklists (long tail we did not simulate) --------------- *
   kind: 'process' | 'content';  sim: true means a screen in this mockup did it */
const CHECKLISTS = {
  day0: [
    { role: 'All',     kind: 'process', item: 'Receive and open the project documents',            sim: true  },
    { role: 'All',     kind: 'process', item: 'Read the proposal and keep notes',                  sim: true  },
    { role: 'All',     kind: 'content', item: 'Draft your own SCQ and problem statement',          sim: true  },
    { role: 'PM',      kind: 'process', item: 'Set up the project folder and channels',            sim: false },
    { role: 'PM',      kind: 'process', item: 'Circulate the SCQ activity and deadline',           sim: true  },
    { role: 'PD',      kind: 'content', item: 'Write and share the context brief',                 sim: true  },
    { role: 'PD',      kind: 'process', item: 'Agree the PD split of roles',                        sim: true  },
    { role: 'Analyst', kind: 'process', item: 'Confirm access to shared drives and tools',         sim: false },
    { role: 'Analyst', kind: 'content', item: 'Note open questions for the kick-off',              sim: false },
    { role: 'PM',      kind: 'process', item: 'Book the full-team kick-off',                        sim: false },
  ],
  kickoff: [
    { role: 'All',     kind: 'content', item: 'Bring your draft SCQ to the room',                  sim: true  },
    { role: 'All',     kind: 'content', item: 'Agree one shared problem statement',                sim: true  },
    { role: 'PD',      kind: 'content', item: 'Lay out the L1 hypothesis as a flat claim',         sim: true  },
    { role: 'All',     kind: 'content', item: 'Build the hypothesis tree out to L2',               sim: true  },
    { role: 'All',     kind: 'content', item: 'Walk away clear on the deliverable and audience',   sim: false },
    { role: 'PD',      kind: 'process', item: 'Name what "done" looks like for Day 1',             sim: false },
    { role: 'PM',      kind: 'process', item: 'Capture the tree and open questions',               sim: false },
    { role: 'Analyst', kind: 'content', item: 'Flag evidence needed to test each branch',          sim: false },
  ],
  core: [
    { role: 'PM',      kind: 'process', item: 'Run the core-team kick-off (without PDs)',          sim: true  },
    { role: 'All',     kind: 'content', item: 'Turn the tree into a workplan with owners',         sim: true  },
    { role: 'All',     kind: 'content', item: 'Turn the workplan into a deliverable TOC',          sim: true  },
    { role: 'All',     kind: 'process', item: 'Agree working and WLB norms',                       sim: true  },
    { role: 'PM',      kind: 'content', item: 'Match workstreams to development goals where able',  sim: true  },
    { role: 'PM',      kind: 'process', item: 'Set meeting cadence and review style',              sim: true  },
    { role: 'Analyst', kind: 'process', item: 'Confirm your workstream and first analyses',        sim: false },
    { role: 'All',     kind: 'process', item: 'Agree response times and availability',             sim: true  },
  ],
};

/* every checklist role that appears, for the filter chips */
const ROLES = ['All', 'PD', 'PM', 'Analyst'];

/* ---- the 33 screens, in order ------------------------------------------- *
   `view` selects the renderer in app.js. `stage` is the STAGES index.
   Titles are lead lines: what the user gets out of the screen. */
const SCREENS = [
  /* Stage 0 — Welcome */
  { id: '0.1', stage: 0, tag: 'STATIC',    surface: 'Training UI', view: 'welcome',
    title: 'You land on the training and see, in three panels, what it is, what it is not, and what you will be able to do by the end.' },
  { id: '0.2', stage: 0, tag: 'STATIC',    surface: 'Training UI', view: 'whyday1',
    title: 'You see the case for Day 1 — expertise in the room, faster and more intentional research, systems for the team — each backed by a short staff quote.' },
  { id: '0.3', stage: 0, tag: 'STATIC',    surface: 'Training UI', view: 'stages-intro',
    title: 'You see the five stages laid out with rough times, and that you can come back or vary the pace if you run it live with the team.' },

  /* Stage 1 — Day 0 */
  { id: '1.1', stage: 1, tag: 'STATIC',    surface: 'Training UI', view: 'splash',
    title: 'Day 0 unlocks. The other stages stay greyed out.' },
  { id: '1.2', stage: 1, tag: 'STATIC',    surface: 'Training UI', view: 'overview',
    title: 'You see what you will do in Day 0 and what you will have by the end — a draft SCQ, familiarity with the docs, questions for the kick-off.',
    payload: {
      why: 'Day 0 gets you up to speed so you can <b>brainstorm with the PDs productively</b>, rather than being brought up to speed in the room.',
      doLabel: 'What you will do in Day 0',
      doItems: ['Read into the project', 'Keep notes as you go', 'Draft your own SCQ'],
      haveLabel: 'What you will have by the end',
      haveItems: ['A draft SCQ', 'Familiarity with the proposal and context brief', 'Questions for the kick-off'] } },
  { id: '1.3', stage: 1, tag: 'LIGHT READING', surface: 'Training UI', view: 'doclist',
    title: 'The documents that land in your lap before the project starts show up as a short list you can open — the proposal, and a couple of days later the context brief.' },
  { id: '1.4', stage: 1, tag: 'LIGHT READING', surface: 'PDF reader', view: 'reader', payload: { doc: 'proposal' },
    title: 'The proposal opens in a reader with the passages that matter already highlighted, and a notes panel that keeps anything you jot for later.' },
  { id: '1.5', stage: 1, tag: 'LIGHT READING', surface: 'PDF reader', view: 'reader', payload: { doc: 'brief' },
    title: "The PD's context brief opens in the same reader — practice area, topic, client organisation and its people — and your notes are kept alongside." },
  { id: '1.6', stage: 1, tag: 'STATIC',    surface: 'Training UI', view: 'scq-intro',
    title: 'Before the kick-off you are asked to draft your own rough SCQ and problem statement — this is about doing the thinking and generating questions, not getting it perfect.' },
  { id: '1.7', stage: 1, tag: 'AI EXERCISE', surface: 'Training UI + sources', view: 'ex-scq',
    title: 'You draft your SCQ across three panels and a problem statement below, hit Check, and a coach reads it and tells you when it is good enough to pass.' },
  { id: '1.8', stage: 1, tag: 'STATIC',    surface: 'Training UI', view: 'scq-conclusion',
    title: 'Your draft SCQ sits beside the real FEN one, with the coach’s read of what you wrote, and a closing line on why Day 0 matters.' },
  { id: '1.9', stage: 1, tag: 'STATIC',    surface: 'Training UI', view: 'checklist', payload: { set: 'day0' },
    title: 'The full Day 0 process and content checklist, split by role and filterable — including everything this simplified training did not simulate.' },
  { id: '1.10', stage: 1, tag: 'STATIC',   surface: 'Training UI', view: 'pdsplit',
    title: 'A short note tells you how the two PDs are expected to divide the project — content review, client, and coaching the team.' },

  /* Stage 2 — Full-team kick-off */
  { id: '2.1', stage: 2, tag: 'STATIC',    surface: 'Training UI', view: 'splash',
    title: 'Day 0 is complete. The full-team kick-off unlocks; the rest stay greyed out.' },
  { id: '2.2', stage: 2, tag: 'STATIC',    surface: 'Training UI', view: 'why-kickoff',
    title: 'You see why the kick-off matters, what to expect going in and out of it, and the one thing to get right here — building the hypothesis tree out.' },
  { id: '2.3', stage: 2, tag: 'STATIC',    surface: 'Training UI', view: 'scqs-side',
    title: "The team's SCQs and problem statements go up side by side, yours among them, with the small differences highlighted." },
  { id: '2.4', stage: 2, tag: 'STATIC',    surface: 'Training UI', view: 'shared-problem',
    title: 'The three SCQs resolve into a single shared problem statement, shown plainly.' },
  { id: '2.5', stage: 2, tag: 'ANIMATION', surface: 'Training UI', view: 'morph-l1',
    title: "The shared problem statement morphs into the PD's top-level hypothesis — a flat claim, no hedging — and branch stubs appear beneath it." },
  { id: '2.6', stage: 2, tag: 'AI EXERCISE', surface: 'Training UI + sources', view: 'ex-tree',
    title: 'You are handed one L2 branch and asked what would have to be true for it, type sub-claims freely, and a coach checks them on logic and testability.' },
  { id: '2.7', stage: 2, tag: 'ZOOM-OUT',  surface: 'PowerPoint', view: 'zoom-tree',
    title: 'You step out of the simulation to see the actual, preliminary hypothesis tree the FEN team left at the end of a real Day 1 — nothing like the polished version that circulates later.' },
  { id: '2.8', stage: 2, tag: 'STATIC',    surface: 'Training UI', view: 'kickoff-conclusion',
    title: 'A recap of why the kick-off matters, with your own tree on screen and the coach’s read of the branch you built, plus the note that you should leave clear on the deliverable.' },
  { id: '2.9', stage: 2, tag: 'STATIC',    surface: 'Training UI', view: 'checklist', payload: { set: 'kickoff' },
    title: 'The full-team kick-off process and content checklist, split by role and filterable — carrying the items we did not simulate.' },

  /* Stage 3 — Core-team kick-off */
  { id: '3.1', stage: 3, tag: 'STATIC',    surface: 'Training UI', view: 'splash',
    title: 'The full-team kick-off is complete. The core-team kick-off unlocks; the last stage stays greyed out.' },
  { id: '3.2', stage: 3, tag: 'STATIC',    surface: 'Training UI', view: 'overview',
    title: 'You see what you will do and have by the end — a workplan with owners, a deliverable TOC, and a shared set of working and WLB norms. This session is run by the PM without the PDs.',
    payload: {
      why: 'This session is run by the <b>PM without the PDs</b>. It turns Day 1 thinking into something the team can start on tomorrow.',
      doLabel: 'What you will do',
      doItems: ['See the tree become a workplan and a deliverable TOC', 'Understand how the team sets its norms'],
      haveLabel: 'What you will have by the end',
      haveItems: ['A workplan with named owners', 'A deliverable table of contents', 'A shared set of working and WLB norms'] } },
  { id: '3.3', stage: 3, tag: 'LIGHT READING', surface: 'PowerPoint', view: 'reader', payload: { doc: 'iko' },
    title: 'You flip through the standard core-team kick-off deck — the format that establishes the team’s rules and how people work with each other.' },
  { id: '3.4', stage: 3, tag: 'ANIMATION', surface: 'Training UI → PowerPoint', view: 'anim-workplan',
    title: 'You watch the hypothesis tree tip over into a week-1 workplan — each branch lands as a row — and an owner column fill in as the PM assigns who does what.' },
  { id: '3.5', stage: 3, tag: 'ANIMATION', surface: 'Training UI → PowerPoint', view: 'anim-toc',
    title: 'The workplan then converts into a deliverable table of contents — each workstream a section, its analyses what that section must show. Tree, workplan and TOC are one object drawn three ways.' },
  { id: '3.6', stage: 3, tag: 'STATIC',    surface: 'Training UI', view: 'norms',
    title: 'A worked example of the norms a team lands on together — cadence, review style, response times, WLB. Norms named on Day 1 are norms you can point to in week four.' },
  { id: '3.7', stage: 3, tag: 'STATIC',    surface: 'Training UI', view: 'core-conclusion',
    title: 'A recap of what the session produced — workplan, TOC, norms — and why each part mattered.' },
  { id: '3.8', stage: 3, tag: 'STATIC',    surface: 'Training UI', view: 'checklist', payload: { set: 'core' },
    title: 'The core-team kick-off process and content checklist, split by role and filterable.' },

  /* Stage 4 — Close */
  { id: '6.1', stage: 4, tag: 'STATIC',    surface: 'Training UI', view: 'trail',
    title: 'The trail of what you made across Day 1 — the notes you kept, the SCQ you drafted, the hypothesis-tree branch you built. Anything you skipped is shown as skipped.' },
  { id: '6.2', stage: 4, tag: 'STATIC',    surface: 'Training UI', view: 'vault',
    title: 'Your vault — every template, format and checklist used across the training, organised by stage and role, all downloadable so it is usable on a real project.' },
  { id: '6.3', stage: 4, tag: 'ZOOM-OUT',  surface: 'Training UI', view: 'close',
    title: 'You close on where the FEN thinking landed — links to both published reports — and are told you are done and everything stays available. No score, no certificate, no badge.' },
];

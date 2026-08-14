/* ============================================================================
   data.js — content model for Variant 2.
   NOTHING substantive is invented. Every problem statement, SCQ bullet, L1
   hypothesis, branch, workplan row, norm and checklist item is a placeholder.
   The mockup shows the SHAPE; real content comes from the FEN project later.
   Copy is terse. No em dashes.
   ========================================================================= */

const ICON = {
  notch: '<svg viewBox="0 0 45 22" fill="currentColor"><path d="M3.0832 0 L0 10.2844 L35.01766 10.2844 L35.01767 22 L45 22 L45 0 Z"/></svg>',
  doc:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>',
  notes: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 6h16M4 12h16M4 18h10"/></svg>',
  chat:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  pin:   '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C7.6 2 4 5.6 4 10c0 5.4 7 11.5 7.3 11.8.4.3 1 .3 1.4 0C13 21.5 20 15.4 20 10c0-4.4-3.6-8-8-8z"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M20 6 9 17l-5-5"/></svg>',
  left:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M15 18l-6-6 6-6"/></svg>',
  right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M9 6l6 6-6 6"/></svg>',
  down:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 4v12M7 12l5 5 5-5M5 20h14"/></svg>',
  plus:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M12 5v14M5 12h14"/></svg>',
  play:  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
  replay:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 4v4h4"/></svg>',
  ext:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
};

const STAGES = [
  { n: 0, name: 'Welcome',    sub: 'Setting expectations before anything starts',   time: 'XX min' },
  { n: 1, name: 'Day 0',      sub: 'Getting set up before the project starts',       time: 'XX min' },
  { n: 2, name: 'Kick-off',   sub: "Where the project's thinking starts",            time: 'XX min' },
  { n: 3, name: 'Core team',  sub: 'Turning Day 1 into work you can start tomorrow', time: 'XX min' },
  { n: 4, name: 'Close',      sub: 'Conclusion',                                     time: 'XX min' },
];

const DOCS = [
  { id: 'proposal', name: 'Proposal',      kind: 'pdf', meta: 'Lands when you are staffed' },
  { id: 'brief',    name: 'Context brief', kind: 'pdf', meta: 'A few days before kick-off' },
  { id: 'iko',      name: 'Kick-off deck', kind: 'ppt', meta: 'Standard norms deck' },
  { id: 'pdsplit',  name: 'PD split note', kind: 'doc', meta: 'Who leads what' },
];

/* checklists: structure is real (role, process/content, was-it-shown); the item
   text is a placeholder bar, since we do not have the real checklists yet */
const CHECKLISTS = {
  day0:    [{r:'All',k:'process',w:.9,sim:1},{r:'All',k:'process',w:.7,sim:1},{r:'All',k:'content',w:.8,sim:1},{r:'PM',k:'process',w:.6},{r:'PM',k:'process',w:.75,sim:1},{r:'PD',k:'content',w:.7,sim:1},{r:'PD',k:'process',w:.55,sim:1},{r:'AN',k:'process',w:.65},{r:'AN',k:'content',w:.5},{r:'PM',k:'process',w:.7}],
  kickoff: [{r:'All',k:'content',w:.8,sim:1},{r:'All',k:'content',w:.6,sim:1},{r:'PD',k:'content',w:.7,sim:1},{r:'All',k:'content',w:.75,sim:1},{r:'All',k:'content',w:.6},{r:'PD',k:'process',w:.5},{r:'PM',k:'process',w:.65},{r:'AN',k:'content',w:.7}],
  core:    [{r:'PM',k:'process',w:.7,sim:1},{r:'All',k:'content',w:.8,sim:1},{r:'All',k:'content',w:.75,sim:1},{r:'All',k:'process',w:.6,sim:1},{r:'PM',k:'content',w:.65,sim:1},{r:'PM',k:'process',w:.55},{r:'AN',k:'process',w:.7},{r:'All',k:'process',w:.5,sim:1}],
};
const ROLES = ['All', 'PD', 'PM', 'AN'];

/* ---- the scenes, in order. Fewer, richer than one-beat-per-screen. --------
   kind: cover | objectives | info | activity | checklist | close
   Info scenes club several beats into one scannable scroll. Activities and the
   end-of-stage checklist stay their own screens. Signpost copy is terse. */
const SCENES = [
  { id: 'cover', stage: 0, kind: 'cover', view: 'cover' },

  { id: '0.1', stage: 0, kind: 'objectives', view: 'objectives', title: 'What this is',
    tag: 'Welcome', what: "What the training is, what it isn't, and what you'll be able to do." },
  { id: '0.2', stage: 0, kind: 'info', view: 'why', title: 'Why Day 1',
    tag: 'Welcome', what: 'Why Day 1 matters, then the five stages and rough times.' },

  { id: '1.1', stage: 1, kind: 'info', view: 'setup', title: 'Getting set up',
    tag: 'Day 0', what: "What you'll do and have, the documents you get, and how the PDs split the project." },
  { id: '1.2', stage: 1, kind: 'info', view: 'reading', title: 'Reading in',
    tag: 'Reading', surface: 'PDF', what: 'The proposal and brief, key passages flagged. Notes here come back later.' },
  { id: '1.3', stage: 1, kind: 'activity', view: 'scq', title: 'Draft your SCQ',
    tag: 'Activity', surface: 'Coach', what: 'Draft your own rough SCQ. A coach reads it. Not about getting it perfect.',
    note: 'One SCQ, or several? Assuming one.' },
  { id: '1.4', stage: 1, kind: 'checklist', view: 'checklist', title: 'What Day 0 covers', payload: { set: 'day0' },
    tag: 'Checklist', what: 'The full Day 0 checklist by role. Carries the long tail we did not build.',
    note: 'Will the checklist live on the Hub?' },

  { id: '2.1', stage: 2, kind: 'info', view: 'intoroom', title: 'Into the room',
    tag: 'Kick-off', what: "Why the kick-off matters, the team's SCQs side by side, and the shared problem." },
  { id: '2.2', stage: 2, kind: 'activity', view: 'branch', title: 'Build a branch',
    tag: 'Activity', surface: 'Coach', what: "The PD's L1 hypothesis. You drill one branch. A coach checks logic, not content." },
  { id: '2.3', stage: 2, kind: 'checklist', view: 'checklist', title: 'What the kick-off covers', payload: { set: 'kickoff', zoom: 'tree' },
    tag: 'Checklist', surface: 'Zoom-out', what: 'A real Day 1 tree, then the full checklist by role.' },

  { id: '3.1', stage: 3, kind: 'info', view: 'deck', title: 'The kick-off, and the deck',
    tag: 'Core team', surface: 'Deck', what: "What you'll do and have, and the standard kick-off deck." },
  { id: '3.2', stage: 3, kind: 'info', view: 'threeways', title: 'One object, three ways',
    tag: 'Core team', what: 'The tree becomes a workplan, then contents. Plus the team norms.' },
  { id: '3.3', stage: 3, kind: 'checklist', view: 'checklist', title: 'What the core team covers', payload: { set: 'core' },
    tag: 'Checklist', what: 'The core-team kick-off checklist by role.' },

  { id: '6.1', stage: 4, kind: 'close', view: 'made', title: 'What you made',
    tag: 'Close', what: 'Everything you made, and the vault that stays.',
    note: 'Where does the vault actually live?' },
  { id: '6.2', stage: 4, kind: 'close', view: 'landed', title: 'Where it landed',
    tag: 'Close', surface: 'Zoom-out', what: 'Where the real project landed. Then you are done.' },
];

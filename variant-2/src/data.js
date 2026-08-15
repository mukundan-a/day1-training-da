// Scene registry + shared data (build spec §1, §3.6). Copy lives in the scene
// components; this is the ordered spine, stage metadata, docs, and checklist rows.

export const STAGES = [
  { key: 'welcome', name: 'Welcome', railName: 'Welcome', purpose: 'What this is and what you will get.', time: '~3 min' },
  { key: 'day0', name: 'Day 0', railName: 'Day 0', purpose: 'Getting set up before the project starts. You draft your first SCQ.', time: '~8 min' },
  { key: 'kickoff', name: 'Full-team kick-off', railName: 'Full-team', purpose: 'Where the thinking starts. You build out a branch of the hypothesis tree.', time: '~7 min' },
  { key: 'coreteam', name: 'Core-team kick-off', railName: 'Core-team', purpose: 'Turning Day 1 into a plan you can start on tomorrow.', time: '~5 min' },
  { key: 'close', name: 'Close', railName: 'Close', purpose: 'Everything you made, and where the real project ended up.', time: '~2 min' },
];

// chip: 'Watch' | 'Read' | 'Hands-on' | 'Recap'
export const SCENES = [
  { id: 'W1', stageKey: 'welcome', chip: 'Watch', title: 'Your first day on FEN' },
  { id: 'W2', stageKey: 'welcome', chip: 'Read', title: 'Why Day 1, and what you’ll get' },
  { id: 'W3', stageKey: 'welcome', chip: 'Read', title: 'The five stages' },

  { id: 'D1', stageKey: 'day0', chip: 'Read', title: 'Day 0 overview' },
  { id: 'D2', stageKey: 'day0', chip: 'Read', title: 'The reading room' },
  { id: 'D3', stageKey: 'day0', chip: 'Read', title: 'What an SCQ is' },
  { id: 'D4', stageKey: 'day0', chip: 'Hands-on', title: 'Draft your SCQ' },
  { id: 'D5', stageKey: 'day0', chip: 'Recap', title: 'Day 0 close' },

  { id: 'F1', stageKey: 'kickoff', chip: 'Read', title: 'Why the kick-off matters' },
  { id: 'F2', stageKey: 'kickoff', chip: 'Watch', title: 'The team’s SCQs converge' },
  { id: 'F3', stageKey: 'kickoff', chip: 'Watch', title: 'Problem becomes hypothesis' },
  { id: 'F4', stageKey: 'kickoff', chip: 'Hands-on', title: 'Build out a branch' },
  { id: 'F5', stageKey: 'kickoff', chip: 'Watch', title: 'A real Day 1 tree' },
  { id: 'F6', stageKey: 'kickoff', chip: 'Recap', title: 'Kick-off close' },

  { id: 'C1', stageKey: 'coreteam', chip: 'Read', title: 'Core-team overview' },
  { id: 'C2', stageKey: 'coreteam', chip: 'Read', title: 'The kick-off deck' },
  { id: 'C3', stageKey: 'coreteam', chip: 'Watch', title: 'One object, three ways' },
  { id: 'C4', stageKey: 'coreteam', chip: 'Read', title: 'How the team sets its norms' },
  { id: 'C5', stageKey: 'coreteam', chip: 'Recap', title: 'Core-team close' },

  { id: 'X1', stageKey: 'close', chip: 'Recap', title: 'Close' },
];

export const sceneIndex = (id) => SCENES.findIndex(s => s.id === id);
export const stageOf = (id) => STAGES.find(s => s.key === SCENES[sceneIndex(id)]?.stageKey);

export const DOCS = [
  { id: 'proposal', name: 'Proposal', kind: 'pdf', desc: 'The pitch the client signed off on.' },
  { id: 'brief', name: 'Context brief', kind: 'pdf', desc: 'The PD’s read on the topic, client and people.' },
  { id: 'iko', name: 'Kick-off deck', kind: 'ppt', desc: 'The standard norms deck.' },
  { id: 'pdsplit', name: 'PD split note', kind: 'doc', desc: 'Who leads what.' },
];

export const ROLES = ['Everyone', 'AN', 'Consultant', 'PM', 'AP/P'];

// checklist structure is real (role, process/content, whether we showed it);
// item text is a scaffold line (we do not have the real checklists yet).
export const CHECKLISTS = {
  day0: {
    process: [
      { role: 'Everyone', w: 90, shown: true }, { role: 'Everyone', w: 70, shown: true },
      { role: 'PM', w: 80 }, { role: 'PM', w: 65, shown: true }, { role: 'AN', w: 75 },
      { role: 'PD', w: 60, shown: true }, { role: 'PM', w: 70 },
    ],
    content: [
      { role: 'Everyone', w: 85, shown: true }, { role: 'AN', w: 60 },
      { role: 'PD', w: 78, shown: true }, { role: 'Consultant', w: 66 },
    ],
  },
  kickoff: {
    process: [{ role: 'PD', w: 70 }, { role: 'PM', w: 62 }, { role: 'AN', w: 75, shown: true }],
    content: [{ role: 'Everyone', w: 88, shown: true }, { role: 'Everyone', w: 64, shown: true }, { role: 'PD', w: 72, shown: true }, { role: 'AN', w: 58 }],
  },
  core: {
    process: [{ role: 'PM', w: 72, shown: true }, { role: 'Everyone', w: 60, shown: true }, { role: 'AN', w: 68 }],
    content: [{ role: 'Everyone', w: 82, shown: true }, { role: 'Everyone', w: 76, shown: true }, { role: 'PM', w: 64, shown: true }, { role: 'AN', w: 55 }],
  },
};

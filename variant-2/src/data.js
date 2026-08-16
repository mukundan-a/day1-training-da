// Scene registry + shared data (build spec §1, §3.6). Copy lives in the scene
// components; this is the ordered spine, stage metadata, docs, and checklist rows.

export const STAGES = [
  { key: 'welcome', name: 'Welcome', railName: 'Welcome', purpose: 'What this is and what you will get.', time: '2 min' },
  { key: 'day0', name: 'Day 0', railName: 'Day 0', purpose: 'Getting set up before the project starts. You draft your first SCQ.', time: '9 min' },
  { key: 'kickoff', name: 'Full-team kick-off', railName: 'Full-team', purpose: 'Where the thinking starts. You build out a branch of the hypothesis tree.', time: '8 min' },
  { key: 'coreteam', name: 'Core-team kick-off', railName: 'Core-team', purpose: 'Turning Day 1 into a plan you can start on tomorrow.', time: '6 min' },
  { key: 'close', name: 'Close', railName: 'Close', purpose: 'Everything you made, and where the real project ended up.', time: '2 min' },
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

export const ROLES = ['All', 'Core team', 'PM', 'PD'];

// The real Day 1 codification checklists, from the codification deck (2607
// Mission Day). Split by role and by process / content, with the items this
// training actually walks through flagged `shown`. Each stage also carries its
// real key outputs and the reason it matters.
export const CHECKLISTS = {
  day0: {
    outputs: ['The project folder', 'A sense of the client context, the problem statement, the proposed approach and the key stakeholders'],
    why: 'It gets the team up to speed quickly, and it lets the kick-off stay focused on content and brainstorming, rather than the PDs talking the team up to speed in the room.',
    process: [
      { role: 'PM', t: 'Set up the project folder on OneDrive.' },
      { role: 'PM', t: 'Download the relevant client documents, such as the proposal and previous deliverables.', shown: true },
      { role: 'PM', t: 'Run a quick literature review, both AI-driven and direct.' },
      { role: 'PM', t: 'Set up the initial meetings, such as the kick-off and the Day 1 problem-solving session.' },
      { role: 'PD', t: 'Prepare the Day 0 brief, with the context, client notes and tensions.', shown: true },
      { role: 'PD', t: 'Hold a 30-minute call between the co-PDs to divide the project.', shown: true },
      { role: 'PD', t: 'Agree what role each PD will play, such as content review or client lead.', shown: true },
      { role: 'PD', t: 'Communicate those expectations to the team.' },
      { role: 'Core team', t: 'Read the proposal and any additional client materials.', shown: true },
      { role: 'Core team', t: 'Read the Day 0 brief from the PDs.', shown: true },
      { role: 'Core team', t: 'Review the knowledge base for similar Dalberg projects, and consider speaking with teams that have worked in the same sector or with the same client.' },
      { role: 'Core team', t: 'Come up with early questions, using issue trees or the Day 1 bot.' },
      { role: 'Core team', t: 'Develop your individual hypothesis tree.' },
      { role: 'Core team', t: 'Collate a fact pack for the project.' },
    ],
    content: [
      { role: 'Core team', t: 'Build an understanding of the client context, and draft your own SCQ.', shown: true },
    ],
  },
  kickoff: {
    outputs: ['A clearly articulated problem statement', 'The Day 1 hypothesis tree', 'A sense of the workstreams and the final deliverable, as a table of contents'],
    why: 'It helps the team decide which analyses to prioritise or set aside, and it avoids churn by establishing early what the workstreams look like and what kind of analysis is expected.',
    process: [
      { role: 'PD', t: 'Lead the content brainstorm, by bringing an exec summary or hypothesis tree, building one with the team in the room, or reviewing the PM and team’s first tree.', shown: true },
      { role: 'PD', t: 'Communicate any additional client context and early thoughts to the team.' },
      { role: 'Core team', t: 'Discuss and align on the Day 1 hypothesis tree.', shown: true },
      { role: 'Core team', t: 'Refine and articulate a clear problem statement.', shown: true },
      { role: 'Core team', t: 'Align with the PD on the deliverable format and table of contents.' },
    ],
    content: [
      { role: 'All', t: 'Reach alignment across the team on the deliverable.', shown: true },
    ],
  },
  core: {
    outputs: ['A dot-dash storyline, or exec summary', 'A preliminary research plan', 'Ownership of the workstreams', 'The team’s working and work-life-balance norms'],
    why: 'It sets out the expectations and preferences across the team, so everyone knows what they own, what the deliverable is, and how the team will work.',
    process: [
      { role: 'PM', t: 'Schedule the one-hour kick-off.', shown: true },
      { role: 'PM', t: 'Schedule the daily check-ins.' },
      { role: 'PM', t: 'Fill out the work-life-balance norms, working styles and personal development goals.', shown: true },
      { role: 'Core team', t: 'Based on the aligned hypothesis tree, lay out what needs proving, how, and by whom.', shown: true },
      { role: 'Core team', t: 'Discuss the working and work-life-balance norms; the PDs may join for these.', shown: true },
      { role: 'PM', t: 'Begin the week-1 storyline: a skeleton deck where the exec summary forms the lead line and the workplan forms the body of each slide.' },
    ],
    content: [
      { role: 'All', t: 'Reach clarity over the workstreams and the research plan.', shown: true },
    ],
  },
};

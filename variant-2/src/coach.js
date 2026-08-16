// Faked, deterministic coach (build spec §7.3). Reacts to the user's own words,
// never injects project content, and always passes by the second Check.
const tokens = (s) => (s || '').toLowerCase().replace(/[^a-z0-9%\s]/g, ' ').split(/\s+/).filter(Boolean);
const jaccard = (a, b) => {
  const A = new Set(tokens(a.join ? a.join(' ') : a)), B = new Set(tokens(b.join ? b.join(' ') : b));
  if (!A.size || !B.size) return 0;
  let inter = 0; A.forEach(t => B.has(t) && inter++);
  return inter / (A.size + B.size - inter);
};
const sentences = (s) => (s || '').split(/[.!?]+/).map(x => x.trim()).filter(Boolean);

const QUESTION_STARTERS = ['should', 'how', 'which', 'what', 'why', 'when', 'does', 'do', 'can', 'will', 'is', 'are'];
const IMPERATIVE_VERBS = ['build', 'do', 'run', 'gather', 'interview', 'collect', 'analyse', 'analyze', 'map', 'review', 'draft', 'write', 'call', 'schedule', 'set', 'create', 'make'];
const HEDGE_WORDS = ['might', 'could', 'may', 'possibly', 'generally', 'often', 'tends', 'some', 'maybe'];
const COMPARATORS = ['more', 'less', 'greater', 'higher', 'lower', 'than', '%', 'percent', 'x', 'increase', 'decrease'];
const hasNum = (s) => /\d/.test(s) || COMPARATORS.some(c => tokens(s).includes(c));

export function reviewSCQ(scq) {
  const S = scq.S.filter(Boolean), C = scq.C.filter(Boolean), Q = scq.Q.filter(Boolean);
  const q = Q[0] || '';
  const nudges = [];
  if (!scq.problem.trim()) nudges.push('You have drafted S, C and Q but not the problem statement. Say the problem in one sentence, as if telling a colleague in the hallway.');
  if (q && !/\?\s*$/.test(q) && !QUESTION_STARTERS.includes(tokens(q)[0])) nudges.push('That reads like a topic, not a question. What does the client actually need decided? Try starting with "Should", "How much", or "Which".');
  if (q && ((q.match(/\?/g) || []).length > 1 || / and /.test(q.split('?')[0]))) nudges.push('You have two questions in there. Pick the one the client would pay to answer.');
  if (S.length <= 1) nudges.push('Thin on Situation. Give me one more thing that is true and nobody would argue with.');
  if (C.length && (jaccard(C, S) >= 0.6 || C.length <= 1)) nudges.push('Your Complication reads like more Situation. What changed, or what is now at risk, that makes this urgent?');
  if (sentences(scq.problem).length >= 3) nudges.push('The problem statement is doing too much. Cut it to one sentence.');

  const thin = S.length + C.length + Q.length <= 1;
  const reflect = q ? `Your question, as written, is: "${q}". Everything else has to earn its place around that.` : 'Read it top to bottom once: does your question fall out of your situation and complication?';
  return { nudges: nudges.slice(0, 2), reflect, thin, q };
}

export function reviewBranch(branch, branchLabel) {
  const subs = branch.subclaims.filter(Boolean);
  const nudges = [];
  let flagged = subs[0] || '';
  if (subs.length <= 1) nudges.push('One sub-claim rarely carries a branch. What is the second thing that would have to be true?');
  const task = subs.find(s => IMPERATIVE_VERBS.includes(tokens(s)[0]));
  if (task) { nudges.push(`"${task}" is a thing to do, not a claim to test. Rewrite it as something that is either true or false.`); flagged = task; }
  const soft = subs.find(s => HEDGE_WORDS.some(h => tokens(s).includes(h)) && !hasNum(s));
  if (soft) { nudges.push(`"${soft}" cannot be proven wrong as written. What would we measure or find that would make it false?`); }
  for (let i = 0; i < subs.length; i++) for (let j = i + 1; j < subs.length; j++) if (jaccard(subs[i], subs[j]) >= 0.6) { nudges.push(`"${subs[i]}" and "${subs[j]}" are the same claim twice. Merge them and use the space for a new one.`); break; }
  const restate = subs.find(s => branchLabel && jaccard(s, branchLabel) >= 0.6);
  if (restate) nudges.push('That one just says the branch again. Go one level down: why would the branch be true?');

  const thin = subs.length <= 1;
  const reflect = subs[0] ? `You have said, for a start: "${subs[0]}". Let us see if the set holds.` : '';
  return { nudges: nudges.slice(0, 2), reflect, thin, flagged };
}

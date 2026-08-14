/* ============================================================================
   coach.js — the FAKED coach. No model. It reacts to what the user typed
   (their own words), never injects project content. Terse. No em dashes.
   Passes once the draft is good enough, usually the second Check.
   ========================================================================= */
const Coach = (() => {
  const pick = (a) => a[Math.floor(Math.random() * a.length)];

  function reviewSCQ(scq, attempt) {
    const s = scq.s.filter(Boolean), c = scq.c.filter(Boolean), q = scq.q.filter(Boolean);
    const p = (scq.problem || '').trim();
    const gaps = [];
    if (!s.length) gaps.push('Situation is empty');
    if (!c.length) gaps.push('Complication is empty');
    if (!q.length) gaps.push('Question is empty');
    if (!p) gaps.push('problem statement is blank');
    if (gaps.length) return { pass: false, html: `<p class="fb">A few gaps.</p><ul>${gaps.map(g => `<li>${g}</li>`).join('')}</ul>` };

    if (attempt >= 2 || (s.length && c.length && q.length && p.length > 10)) {
      return { pass: true, html: `<p class="fb">Good enough.</p><p>${pick(['Your question follows from the complication. That is the starting point Day 0 is for.', 'Not final wording, but a real position to argue from in the room.', 'The thinking is there. The team converges from three drafts like this.'])}</p>` };
    }
    return { pass: false, html: `<p class="fb">Close. One thing.</p><ul><li>${pick(['Can the question be answered yes or no, or with a number?', 'Is the problem specific enough that evidence could settle it?', 'Does the question feel forced by the complication?'])}</li></ul>` };
  }

  function reviewTree(subclaims, attempt) {
    const claims = subclaims.map(x => (x || '').trim()).filter(Boolean);
    if (claims.length < 2) return { pass: false, html: `<p class="fb">Add more.</p><p>For the branch to hold, two or three things would each have to be true. You have ${claims.length}.</p>` };
    const questiony = claims.filter(x => /\?$/.test(x)).length;
    if (attempt >= 2 && !questiony) return { pass: true, html: `<p class="fb">This holds up.</p><p>${pick(['Statements, not questions, and at least one could be proven wrong. That is the test.', 'Whether each is true is for the research. The logic and testability are what matter here.', 'A PD might reorder them, but the branch is a real chain now.'])}</p>` };
    if (questiony) return { pass: false, html: `<p class="fb">Nearly.</p><ul><li>${questiony === 1 ? 'One sub-claim is a question. Make it a flat claim that could be proven wrong.' : 'Some sub-claims are questions. Make them flat claims.'}</li></ul>` };
    return { pass: false, html: `<p class="fb">Good logic.</p><ul><li>Make one claim specific enough to test, then check again.</li></ul>` };
  }

  return { reviewSCQ, reviewTree };
})();

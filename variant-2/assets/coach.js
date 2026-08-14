/* ============================================================================
   coach.js — the FAKED AI coach for the two exercises.

   Per PROMPT.md: do NOT wire a real model. This reads the user's draft with a
   few cheap heuristics, references what they actually typed, and lets them pass
   once it is "good enough" (not perfect) — usually on the second Check, or the
   first if the draft is already substantial. Phrasing is lightly randomised so
   two runs don't read identically. The interaction SHAPE is the point:
   type -> Check -> specific feedback -> pass.
   ========================================================================= */

const Coach = (() => {
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const esc = (s) => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

  /* --- SCQ review ------------------------------------------------------- */
  function reviewSCQ(scq, attempt) {
    const s = scq.s.filter(Boolean), c = scq.c.filter(Boolean), q = scq.q.filter(Boolean);
    const problem = (scq.problem || '').trim();
    const thin = [];
    if (s.length < 1) thin.push('the Situation is empty — set the stable context the client already accepts');
    if (c.length < 1) thin.push('the Complication is empty — name what changed or what is now at stake');
    if (q.length < 1) thin.push('the Question is empty — it should fall straight out of the complication');
    if (!problem) thin.push('the problem statement is blank — write it as one answerable question');

    // "good enough": something in each of S/C/Q and a problem statement, or a
    // second honest attempt. Not perfection.
    const substantial = s.length && c.length && q.length && problem.length > 12;
    const pass = thin.length === 0 && (substantial || attempt >= 2);

    if (pass) {
      const qref = q[0] ? `“${esc(q[0].slice(0, 60))}${q[0].length > 60 ? '…' : ''}”` : 'your question';
      return {
        pass: true,
        html: `<p class="fb-line">Good enough to move on.</p>
          <p>Your Question ${qref} follows from the Complication you set, and the problem statement is answerable rather than a topic. `
          + pick([
            'A PD would push on scope in the room, and that is exactly the conversation Day 0 is meant to tee up.',
            'It is not the final wording — it is not meant to be — but it is a real starting position to argue from.',
            'You have done the thinking; the kick-off is where the team converges from three drafts like this one.'
          ]) + `</p>`
      };
    }

    if (thin.length) {
      return {
        pass: false,
        html: `<p class="fb-line">Not there yet — a couple of gaps:</p><ul>${thin.map(t => `<li>${t}</li>`).join('')}</ul>`
          + `<p>${pick(['Fill those and hit Check again.', 'Add a line to each and re-check — rough is fine.'])}</p>`
      };
    }

    // has content in all three but first pass — one specific push
    const pushes = [];
    if (q.length && !/\?$/.test(q[0].trim())) pushes.push('your Question reads as a topic, not a question — can it be phrased so a yes/no or a number would answer it?');
    if (problem && problem.split(' ').length < 5) pushes.push('the problem statement is very short — is it specific enough that evidence could settle it?');
    if (c.length && s.length && c[0].length < 15) pushes.push('the Complication is thin — what specifically makes this urgent for the client now?');
    if (!pushes.length) pushes.push('tighten the link between the Complication and the Question — the Question should feel forced by the Complication, not chosen freely.');

    return {
      pass: false,
      html: `<p class="fb-line">Close. One thing to sharpen:</p><ul><li>${pick(pushes)}</li></ul>`
        + `<p>${pick(['Revise that line and Check again.', 'Small edit, then re-check — you are nearly there.'])}</p>`
    };
  }

  /* --- hypothesis-tree branch review ------------------------------------ */
  function reviewTree(subclaims, branchName, attempt) {
    const claims = subclaims.map(x => (x || '').trim()).filter(Boolean);
    if (claims.length < 2) {
      return {
        pass: false,
        html: `<p class="fb-line">Add more sub-claims first.</p><p>For “${esc(branchName)}” to be true, at least two or three things would each have to hold. You have ${claims.length}. What else would have to be true?</p>`
      };
    }

    // heuristic: testable claims tend to be assertive, not questions, and carry
    // a comparator / quantity. This is theatre, not real evaluation.
    const questiony = claims.filter(x => /\?$/.test(x)).length;
    const testableish = claims.filter(x => /\b(more|less|higher|lower|most|majority|%|percent|than|enough|cost|price|demand|supply|can|will|does|is)\b/i.test(x)).length;
    const good = claims.length >= 2 && questiony === 0 && (testableish >= 1 || attempt >= 2);

    if (good) {
      return {
        pass: true,
        html: `<p class="fb-line">This branch holds up.</p>
          <p>Your ${claims.length} sub-claims sit under “${esc(branchName)}” as statements, not questions, and at least one is specific enough that evidence could prove it wrong — which is the test. `
          + pick([
            'I am not judging whether they are right; that is what the research is for. The logic and the testability are what matter here.',
            'Whether each turns out true is for week one to find out — the shape is sound.',
            'A PD might reorder them, but the branch is a real chain of claims now.'
          ]) + `</p>`
      };
    }

    const issues = [];
    if (questiony) issues.push(`${questiony === 1 ? 'one sub-claim is' : `${questiony} sub-claims are`} phrased as a question — rewrite as a flat claim that could be proven wrong`);
    if (testableish === 0) issues.push('none of them are specific enough to test yet — could you add a comparator or a magnitude (more/less, a share, a threshold)?');
    if (!issues.length) issues.push('tighten one claim so evidence could settle it, then re-check');

    return {
      pass: false,
      html: `<p class="fb-line">Good logic — not quite testable yet:</p><ul>${issues.map(i => `<li>${i}</li>`).join('')}</ul>`
        + `<p>${pick(['Adjust and Check again.', 'One edit, then re-check.'])}</p>`
    };
  }

  return { reviewSCQ, reviewTree };
})();

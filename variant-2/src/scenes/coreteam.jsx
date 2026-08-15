import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Reveal, StaggerGroup, StaggerItem, BeatHead, FenSlot, ArtefactFrame, Icon } from '../components/ui.jsx';
import { Scene } from '../components/frame.jsx';
import { StageOverview, ChecklistStrip } from '../components/templates.jsx';
import { HeroA } from '../components/heroes.jsx';
import { useStore } from '../store.jsx';
import { spring, dur, ease } from '../motion.js';

export function C1() {
  return (
    <Scene id="C1">
      <StageOverview
        name="Core-team kick-off"
        note="Run by the PM, without the PDs."
        why="Same thinking, now turned into a plan with names on it."
        doItems={['Watch the hypothesis tree become a workplan, then a table of contents.', 'See how the team sets its norms.']}
        haveItems={['A workplan with a named owner on every line.', 'A table of contents for the deliverable.', 'A shared set of working and work-life-balance commitments.']}
      />
    </Scene>
  );
}

/* C2 — the kick-off deck (flippable) */
export function C2() {
  const [i, setI] = useState(0);
  const slides = ['Agenda', 'Why norms', 'Ways of working', 'Review & feedback', 'Work-life balance', 'Next steps'];
  return (
    <Scene id="C2">
      <Reveal><h2 className="lead" style={{ maxWidth: '24ch', marginTop: 24 }}>This is the deck the team runs the session from.</h2></Reveal>
      <Reveal><p className="body mt16">Flip through it. This is the standard core-team kick-off deck, where the team sets its rules and works out how to work with each other. We’ve kept it simple: no live fill-in, just the format so you know it when you see it.</p></Reveal>
      <Reveal className="mt32" style={{ maxWidth: 760, margin: '32px auto 0' }}>
        <ArtefactFrame name="Kick-off deck" cap="Placeholder: the Dalberg IKO norms deck, with a filled-in example.">
          <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 16, minHeight: 220 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {slides.map((s, k) => (
                <button key={k} onClick={() => setI(k)} style={{ aspectRatio: '16/9', border: '1.5px solid ' + (k === i ? 'var(--maroon)' : 'var(--hair)'), borderRadius: 4, background: '#fff', fontSize: 8, color: 'var(--grey-3)', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: 2, left: 4 }}>{k + 1}</span>
                </button>
              ))}
            </div>
            <div style={{ background: 'var(--soft-wash)', borderRadius: 8, display: 'grid', placeItems: 'center', padding: 20 }}>
              <AnimatePresence mode="wait">
                <motion.div key={i} initial={{ opacity: 0, x: 20, rotateY: 6 }} animate={{ opacity: 1, x: 0, rotateY: 0 }} exit={{ opacity: 0, x: -20 }} transition={spring.ui}
                  style={{ width: '100%', maxWidth: 420, aspectRatio: '16/9', background: '#fff', borderRadius: 6, boxShadow: 'var(--shadow-lift)', padding: 24, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--pink)' }}>Kick-off deck</div>
                  <div style={{ fontFamily: 'var(--display)', fontSize: 18, color: 'var(--maroon)', marginTop: 6 }}>{slides[i]}</div>
                  <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>{[90, 70, 80].map((w, k) => <div key={k} style={{ height: 8, width: w + '%', background: 'var(--hair-2)', borderRadius: 3 }} />)}</div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 12 }}>
            <button className="back" onClick={() => setI(Math.max(0, i - 1))}><Icon n="left" size={16} /></button>
            <span className="muted" style={{ fontSize: 13 }}>{i + 1} / {slides.length}</span>
            <button className="back" onClick={() => setI(Math.min(slides.length - 1, i + 1))}><Icon n="right" size={16} /></button>
          </div>
        </ArtefactFrame>
      </Reveal>
    </Scene>
  );
}

/* C3 — one object, three ways (Hero A) */
export function C3() {
  const { state } = useStore();
  const hasBranch = state.branch.subclaims.filter(Boolean).length > 0 && !state.branch.skipped;
  return (
    <Scene id="C3" variant="hero">
      <Reveal><h2 className="lead center" style={{ margin: '24px auto 0', maxWidth: '22ch' }}>Tip the tree on its side and it’s a workplan.</h2></Reveal>
      <Reveal><p className="body center" style={{ margin: '16px auto 0', maxWidth: '56ch' }}>
        Watch it happen. Each branch of the hypothesis tree lands as a row. Then an owner column fills in as the PM assigns who does what, taking two workstreams herself alongside running the team.
      </p></Reveal>

      <HeroA userBranchLabel={hasBranch ? 'Your branch' : null} />

      <Reveal><p className="body center" style={{ margin: '0 auto', maxWidth: '56ch' }}>
        Then read the same object as a document. Each workstream becomes a section. The analyses under it become what that section has to show. Same object, drawn a third way.
      </p></Reveal>
      <Reveal className="center" style={{ maxWidth: 640, margin: '24px auto 0' }}>
        <p className="body-lg" style={{ color: 'var(--maroon)', fontFamily: 'var(--display)' }}>
          The tree, the workplan and the table of contents are one object drawn three ways. The claim you argued about in the kick-off is now a section heading in the report.
        </p>
      </Reveal>
      <Reveal className="foldnote" style={{ margin: '24px auto 0' }}>
        <strong>What’s week one?</strong> Turning this workplan into an executive summary, and then into slides. That’s the shape of the first week. Same object again, one more time.
      </Reveal>
    </Scene>
  );
}

/* C4 — norms */
export function C4() {
  const norms = [
    ['Meeting cadence', 'How often you meet, when, and what each meeting is for.'],
    ['Review and feedback', 'How work gets reviewed, and how feedback gets given and taken.'],
    ['Response times', 'What’s a reasonable time to reply, and what counts as urgent.'],
    ['Work-life balance', 'Protected time, no-go hours, and how you cover for each other.'],
  ];
  return (
    <Scene id="C4">
      <div className="beat" style={{ paddingTop: 24 }}>
        <BeatHead n="1" eyebrow="Worked example" title="The norms the team agrees to, out loud, on Day 1" maroon />
        <Reveal><p className="body">Not a personality exercise. A short, concrete set of agreements about how you’ll work together, so nobody’s guessing in week three. Here’s the kind of thing a team lands on.</p></Reveal>
        <StaggerGroup className="norms mt32" s={0.1}>
          {norms.map(([h, d]) => (
            <StaggerItem key={h} className="norm"><h4>{h}</h4><p>{d}</p><div style={{ marginTop: 10 }}><FenSlot tag="example">a realistic filled-in example</FenSlot></div></StaggerItem>
          ))}
        </StaggerGroup>
      </div>
      <Reveal className="center" style={{ maxWidth: 640, margin: '0 auto' }}>
        <p className="body-lg" style={{ color: 'var(--maroon)', fontFamily: 'var(--display)' }}>Norms you name on Day 1 are norms you can point to in week four. Norms nobody named don’t exist.</p>
      </Reveal>
    </Scene>
  );
}

/* C5 — core-team close */
export function C5() {
  const items = [['Workplan', 'a plan with owners'], ['Table of contents', 'the shape of the deliverable'], ['Norms', 'how the team runs']];
  return (
    <Scene id="C5">
      <div className="beat" style={{ paddingTop: 24 }}>
        <BeatHead n="1" eyebrow="Conclusion" title="Day 1 is now a plan you could start tomorrow" maroon />
        <Reveal><p className="body">In one session, the tree turned into a workplan with owners, the workplan turned into a table of contents, and the team agreed how it would work. Nobody leaves wondering what they own, what the deliverable is, or how the team runs. Each one came from the same tree.</p></Reveal>
        <StaggerGroup className="panels" style={{ gridTemplateColumns: '1fr 1fr 1fr', marginTop: 24 }} s={0.1}>
          {items.map(([h, s]) => <StaggerItem key={h} className="panel" style={{ background: '#fff', border: '1px solid var(--hair)' }}><h3 style={{ fontSize: 18 }}>{h}</h3><p className="body" style={{ fontSize: 15 }}>{s}</p></StaggerItem>)}
        </StaggerGroup>
      </div>
      <div className="beat">
        <ChecklistStrip setKey="core" label="See everything the core-team kick-off covers, by role" />
      </div>
    </Scene>
  );
}

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
        why="The core-team kick-off turns the hypothesis tree into a plan the team can start on, with an owner on every line. It is where the thinking from the morning becomes work the team can begin the next day."
        doItems={['See the hypothesis tree become a workplan, and then a table of contents.', 'See how the team agrees its working norms.']}
        haveItems={['A workplan with a named owner on every line.', 'A table of contents for the deliverable.', 'A shared set of working and work-life-balance norms.']}
      />
    </Scene>
  );
}

/* C2 — the kick-off deck, playing itself through */
export function C2() {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const slides = [
    { t: 'Agenda', rows: ['w80', 'w60', 'w70', 'w50'] },
    { t: 'Why norms', rows: ['w90', 'w70'] },
    { t: 'Ways of working', rows: ['w60', 'w80', 'w55'] },
    { t: 'Review and feedback', rows: ['w75', 'w65'] },
    { t: 'Work-life balance', rows: ['w70', 'w85', 'w50'] },
    { t: 'Next steps', rows: ['w60', 'w45'] },
  ];
  React.useEffect(() => {
    if (!playing) return;
    const id = setTimeout(() => setI(k => (k + 1) % slides.length), i === 0 ? 1400 : 1900);
    return () => clearTimeout(id);
  }, [i, playing]);
  const wpct = { w45: '45%', w50: '50%', w55: '55%', w60: '60%', w65: '65%', w70: '70%', w75: '75%', w80: '80%', w85: '85%', w90: '90%' };

  return (
    <Scene id="C2">
      <Reveal><h2 className="lead">The team runs the session from a standard kick-off deck.</h2></Reveal>
      <Reveal><p className="body mt16">The deck sets out how the team will work together and how people will work with one another. This training shows the format rather than filling it in live, so that you recognise the deck when you see it on a project. It plays through below.</p></Reveal>
      <Reveal className="mt24" style={{ width: '100%' }}>
        <div className="deckfilm">
          <div className="deckfilm__bar"><span className="artefact__dots"><i /><i /><i /></span><span className="artefact__fn">Kick-off deck</span>
            <button className="replay" style={{ position: 'static', marginLeft: 'auto' }} onClick={() => { setPlaying(p => !p); }}>
              <Icon n={playing ? 'pause' : 'play'} size={13} /> {playing ? 'Pause' : 'Play'}
            </button>
          </div>
          <div className="deckfilm__body">
            <div className="deckfilm__strip">
              {slides.map((s, k) => (
                <button key={k} className={'deckfilm__thumb' + (k === i ? ' on' : '')} onClick={() => { setI(k); setPlaying(false); }}>
                  <span className="deckfilm__n">{k + 1}</span>
                  <span className="deckfilm__tbar" />
                </button>
              ))}
            </div>
            <div className="deckfilm__stage">
              <AnimatePresence mode="wait">
                <motion.div key={i} className="deckfilm__slide"
                  initial={{ opacity: 0, x: 26, scale: 0.98 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: -26, scale: 0.98 }} transition={spring.ui}>
                  <div className="deckfilm__eyebrow">Kick-off deck · {i + 1} of {slides.length}</div>
                  <div className="deckfilm__title">{slides[i].t}</div>
                  <div className="deckfilm__rows">
                    {slides[i].rows.map((w, k) => (
                      <motion.div key={k} className="deckfilm__row" style={{ width: wpct[w] }}
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring.land, delay: 0.12 + k * 0.08 }} />
                    ))}
                  </div>
                  <div className="deckfilm__foot"><FenSlot inline tag="example">a filled-in example</FenSlot></div>
                </motion.div>
              </AnimatePresence>
              <div className="deckfilm__dots">
                {slides.map((_, k) => <span key={k} className={k === i ? 'on' : ''} />)}
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </Scene>
  );
}

/* C3 — tree becomes workplan becomes contents */
export function C3() {
  const { state } = useStore();
  const hasBranch = state.branch.subclaims.filter(Boolean).length > 0 && !state.branch.skipped;
  return (
    <Scene id="C3" variant="hero">
      <Reveal><h2 className="lead" style={{ marginTop: 24 }}>Turned on its side, the hypothesis tree becomes the week-1 workplan.</h2></Reveal>
      <Reveal><p className="body mt16">
        Each branch of the tree lands as a row of the workplan. The PM then fills in who owns each workstream and where its evidence will come from, taking a workstream or two herself alongside running the team.
      </p></Reveal>

      <HeroA userBranchLabel={hasBranch ? 'Your branch' : null} />

      <Reveal><p className="body">
        The same rows then read as the deliverable’s table of contents. Each workstream becomes a section, and what its evidence has to show becomes what that section has to say.
      </p></Reveal>
      <Reveal style={{ marginTop: 24 }}>
        <p className="body-lg" style={{ color: 'var(--maroon)', fontFamily: 'var(--display)', fontWeight: 700 }}>
          Tree, workplan and contents are the same thinking in three forms. The claim the team argued about in the kick-off is now a section heading in the report.
        </p>
      </Reveal>
      <Reveal className="foldnote" style={{ marginTop: 24 }}>
        The first week carries it one step further. The workplan becomes an executive summary, and then a set of slides, which is the shape of week one.
      </Reveal>
    </Scene>
  );
}

/* C4 — norms */
export function C4() {
  const norms = [
    ['Meeting cadence', 'How often the team meets, when, and what each meeting is for.'],
    ['Review and feedback', 'How work is reviewed, and how feedback is given and taken.'],
    ['Response times', 'What counts as a reasonable time to reply, and what counts as urgent.'],
    ['Work-life balance', 'Protected time, hours that are off-limits, and how people cover for each other.'],
  ];
  return (
    <Scene id="C4">
      <div className="beat" style={{ paddingTop: 24 }}>
        <BeatHead n="1" title="The team agrees its working norms, out loud, on the first day" maroon />
        <Reveal><p className="body">The team agrees a short, concrete set of norms for how it will work together, so that nobody is guessing in week three. The example below shows the kind of norms a team settles on.</p></Reveal>
        <StaggerGroup className="norms mt32" s={0.1}>
          {norms.map(([h, d]) => (
            <StaggerItem key={h} className="norm"><h4>{h}</h4><p>{d}</p><div style={{ marginTop: 10 }}><FenSlot tag="example">a realistic filled-in example</FenSlot></div></StaggerItem>
          ))}
        </StaggerGroup>
      </div>
      <Reveal style={{ marginTop: 8 }}>
        <p className="body-lg" style={{ color: 'var(--maroon)', fontFamily: 'var(--display)', fontWeight: 700 }}>When the team names its norms on the first day, it can hold itself to them later. Norms that are never named tend not to hold.</p>
      </Reveal>
    </Scene>
  );
}

/* C5 — core-team close */
export function C5() {
  const items = [['A workplan', 'with a named owner on every line'], ['A table of contents', 'that sets the shape of the deliverable'], ['Working norms', 'that say how the team will run']];
  return (
    <Scene id="C5">
      <div className="beat" style={{ paddingTop: 24 }}>
        <BeatHead n="1" title="By the end of the session, Day 1 has become a plan the team could start on the next morning" maroon />
        <Reveal><p className="body">In a single session, the tree became a workplan with owners, the workplan became a table of contents, and the team agreed how it would work. Nobody leaves wondering what they own, what the deliverable is, or how the team runs, and each of those came from the same tree.</p></Reveal>
        <StaggerGroup className="panels" style={{ gridTemplateColumns: '1fr 1fr 1fr', marginTop: 24 }} s={0.1}>
          {items.map(([h, s]) => <StaggerItem key={h} className="panel"><h3>{h}</h3><p className="body-sm">{s}</p></StaggerItem>)}
        </StaggerGroup>
      </div>
      <div className="beat">
        <ChecklistStrip setKey="core" label="See everything the core-team kick-off covers, by role" />
      </div>
    </Scene>
  );
}

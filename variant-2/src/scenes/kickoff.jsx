import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Reveal, StaggerGroup, StaggerItem, BeatHead, FenSlot, ScaffoldSlot } from '../components/ui.jsx';
import { Scene, useUI } from '../components/frame.jsx';
import { StageOverview, ChecklistStrip, ZoomOut } from '../components/templates.jsx';
import { BranchExercise } from '../components/exercise.jsx';
import { HeroB, HypTree } from '../components/heroes.jsx';
import { useStore } from '../store.jsx';
import { spring, dur, ease } from '../motion.js';

export function F1() {
  return (
    <Scene id="F1">
      <StageOverview
        name="Full-team kick-off"
        why="The full-team kick-off is where the team turns its separate reading into a single claim it can test. Its main task is to build the hypothesis tree out; the rest of the stage serves that."
        doItems={['Put your SCQ up beside everyone else’s.', 'Agree on one shared problem statement.', 'Build out a branch of the hypothesis tree.']}
        haveItems={['A shared problem the whole team commits to.', 'A branch of the tree drilled down into testable claims.', 'Clarity on what the deliverable is, not only the tree.']}
      />
      <div className="beat band band--pink" style={{ padding: '36px 0', marginTop: 52 }}>
        <BeatHead n="1" title="Why the team works hypothesis-led" maroon />
        <Reveal><p className="body">A hypothesis is a claim the team can be wrong about. Stating one at the start gives the research a target, so the following weeks test a specific claim rather than gathering everything. It is faster, and it is honest, because the team has said in advance what would change its mind.</p></Reveal>
      </div>
    </Scene>
  );
}

/* F2 — SCQs converge */
export function F2() {
  const { state } = useStore();
  const mine = [...state.scq.S.slice(0, 1), ...state.scq.C.slice(0, 1), ...state.scq.Q.slice(0, 1)].filter(Boolean);
  return (
    <Scene id="F2">
      <div className="beat" style={{ paddingTop: 24 }}>
        <BeatHead n="1" title="The team’s separate SCQs, placed side by side" maroon />
        <Reveal><p className="body">Everyone read the same proposal and brief, and each person framed the problem a little differently. The interesting part is where the framings disagree, because those gaps are what the meeting works through.</p></Reveal>
        <StaggerGroup className="panels" style={{ gridTemplateColumns: '1fr 1fr 1fr', marginTop: 24 }} s={0.12}>
          <StaggerItem className="panel" style={{ borderColor: 'var(--pink)', borderWidth: 2 }}>
            <h3 style={{ fontSize: 17 }}>Yours</h3>
            {mine.length ? <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>{mine.map((t, i) => <li key={i} className="body" style={{ fontSize: 14 }}>• {t}</li>)}</ul>
              : <FenSlot tag="yours">you skipped, so a real one stands in</FenSlot>}
          </StaggerItem>
          <StaggerItem className="panel"><h3 style={{ fontSize: 17 }}>A teammate</h3><ScaffoldSlot lines={['w90', 'w70', 'w80']} /></StaggerItem>
          <StaggerItem className="panel"><h3 style={{ fontSize: 17 }}>A teammate</h3><ScaffoldSlot lines={['w80', 'w90', 'w60']} /></StaggerItem>
        </StaggerGroup>
      </div>

      <div className="beat band band--pink" style={{ padding: '48px 0' }}>
        <BeatHead n="2" title="The team settles on a single problem statement" maroon />
        <Reveal><p className="body">The differences are talked through, and the team commits to one framing. That shared problem statement is what the rest of the day builds on.</p></Reveal>
        <Reveal className="mt24" style={{ display: 'flex', justifyContent: 'center' }}>
          <motion.div className="claim" style={{ maxWidth: 640 }} initial={{ scale: 0.94, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={spring.hero}>
            <div className="k">Shared problem statement</div>
            <div className="tx"><FenSlot inline tag="scaffold">the final shared problem statement</FenSlot></div>
          </motion.div>
        </Reveal>
      </div>
    </Scene>
  );
}

/* F3 — problem becomes hypothesis */
export function F3() {
  return (
    <Scene id="F3" variant="hero">
      <Reveal><h2 className="lead center" style={{ margin: '24px auto 0', maxWidth: '26ch' }}>The PD restates the shared problem as a top-level hypothesis.</h2></Reveal>
      <Reveal><p className="body center" style={{ margin: '16px auto 0', maxWidth: '58ch' }}>In the sequence below, the problem statement becomes the hypothesis. It is stated as a flat claim, with no hedging, so that evidence could later prove it wrong.</p></Reveal>
      <HeroB />
    </Scene>
  );
}

/* F4 — build a branch */
export function F4() {
  const { openSource } = useUI();
  return (
    <Scene id="F4">
      <Reveal><h2 className="lead" style={{ marginTop: 24, maxWidth: '30ch' }}>You take one branch of the tree and drill it down into testable claims.</h2></Reveal>
      <Reveal><p className="body mt16" style={{ maxWidth: '62ch' }}>
        For the branch to be true, some things underneath it have to be true as well. Each of those is a sub-claim. The coach checks whether the sub-claims are testable and whether together they would make the branch hold, rather than whether they are right. The exercise below plays that through.
      </p></Reveal>
      <div style={{ marginTop: 24 }}><BranchExercise onOpenSource={openSource} /></div>
    </Scene>
  );
}

/* F5 — real Day 1 tree */
export function F5() {
  return (
    <Scene id="F5">
      <ZoomOut
        heading="The hypothesis tree the FEN team actually had at the end of Day 1."
        body="This is the tree as the team left it on the first day, not the tidy version that circulates weeks later. It is preliminary and rough in places, which is what a real Day 1 output looks like."
        name="Day 1 exec summary" flag="As left on Day 1"
        cap="Placeholder: the real FEN Day 1 hypothesis tree, unedited."
      />
    </Scene>
  );
}

/* F6 — kick-off close */
export function F6() {
  const { state } = useStore();
  const br = state.branch;
  const subs = br.subclaims.filter(Boolean);
  return (
    <Scene id="F6">
      <div className="beat" style={{ paddingTop: 24 }}>
        <BeatHead n="1" title="By the end of the kick-off, the team has a tree, and you have drilled one branch of it" maroon />
        <Reveal><p className="body">The kick-off turned a stack of separate reading into one claim the team can test. The tree the team built is the target for everything that follows, and the branch you drilled is your part of it.</p></Reveal>
        <Reveal className="mt24">
          <div className="def" style={{ maxWidth: '100%' }}>
            <h4>Your branch</h4>
            {br.skipped ? <p className="muted">You skipped the exercise. You can return to it at any time.</p>
              : subs.length ? <ul style={{ margin: 0, paddingLeft: 18 }}>{subs.map((t, i) => <li key={i} className="body" style={{ fontSize: 15 }}>{t}</li>)}</ul>
                : <FenSlot tag="yours">not built</FenSlot>}
          </div>
        </Reveal>
        <Reveal><p className="body mt24">One point to carry out of the room: be clear on what the deliverable is, not only on the tree. Some people anchor on the argument and some on the document, and the team needs both.</p></Reveal>
      </div>
      <div className="beat">
        <ChecklistStrip setKey="kickoff" label="See everything the full-team kick-off covers, by role" />
      </div>
    </Scene>
  );
}

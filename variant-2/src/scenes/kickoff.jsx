import React from 'react';
import { motion } from 'framer-motion';
import { Reveal, StaggerGroup, StaggerItem, BeatHead, FenSlot, ScaffoldSlot } from '../components/ui.jsx';
import { Scene, useUI } from '../components/frame.jsx';
import { StageOverview, ChecklistStrip, ZoomOut } from '../components/templates.jsx';
import { BranchActivity } from '../components/activities.jsx';
import { HeroB } from '../components/heroes.jsx';
import { useStore } from '../store.jsx';
import { spring, dur, ease } from '../motion.js';

export function F1() {
  return (
    <Scene id="F1">
      <StageOverview
        name="Full-team kick-off"
        why="This is the meeting where a pile of reading becomes a shared claim."
        doItems={['Put your SCQ up beside everyone else’s.', 'Agree on one shared problem statement.', 'Build out a branch of the hypothesis tree.']}
        haveItems={['A shared problem the team commits to.', 'A branch you drilled down to testable claims.', 'Clarity on what the deliverable is, not just the tree.']}
      />
      <div className="beat band band--pink" style={{ padding: '48px 0', marginTop: 64 }}>
        <BeatHead n="1" eyebrow="The one thing to get right" title="Everything else in this stage serves this" />
        <Reveal className="callout">
          <div className="t">Build the hypothesis tree out.</div>
        </Reveal>
        <Reveal><p className="body mt24"><strong>Why hypothesis-led?</strong> A hypothesis is a claim you can be wrong about. Stating one up front means the research has a target: you’re testing something, not collecting everything. It’s faster, and it’s honest, because you’ve said in advance what would change your mind.</p></Reveal>
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
        <BeatHead n="1" eyebrow="The team’s drafts" title="Everyone drafted one. Here they are together." maroon />
        <Reveal><p className="body">Same proposal, same brief, different framings. The interesting part is where they disagree. Those gaps are what the meeting resolves.</p></Reveal>
        <StaggerGroup className="panels" style={{ gridTemplateColumns: '1fr 1fr 1fr', marginTop: 24 }} s={0.12}>
          <StaggerItem className="panel" style={{ background: '#fff', border: '2px solid var(--pink)' }}>
            <h3 style={{ fontSize: 17 }}>Yours</h3>
            {mine.length ? <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>{mine.map((t, i) => <li key={i} className="body" style={{ fontSize: 14 }}>• {t}</li>)}</ul>
              : <FenSlot tag="yours">you skipped, so a real one stands in</FenSlot>}
          </StaggerItem>
          <StaggerItem className="panel"><h3 style={{ fontSize: 17 }}>Teammate</h3><ScaffoldSlot lines={['w90', 'w70', 'w80']} /></StaggerItem>
          <StaggerItem className="panel"><h3 style={{ fontSize: 17 }}>Teammate</h3><ScaffoldSlot lines={['w80', 'w90', 'w60']} /></StaggerItem>
        </StaggerGroup>
      </div>

      <div className="beat band band--pink" style={{ padding: '64px 0' }}>
        <BeatHead n="2" eyebrow="The shared problem" title="The team lands on one problem statement" maroon />
        <Reveal><p className="body">The differences get talked out, and the team commits to a single framing. This is it.</p></Reveal>
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
      <Reveal><h2 className="lead center" style={{ margin: '24px auto 0', maxWidth: '22ch' }}>The PD turns the problem into a claim.</h2></Reveal>
      <Reveal><p className="body center" style={{ margin: '16px auto 0', maxWidth: '54ch' }}>Watch the problem statement become the top-level hypothesis. Notice there’s no hedging in it. It’s stated flat, as a thing that’s either true or not.</p></Reveal>
      <HeroB />
    </Scene>
  );
}

/* F4 — build a branch */
export function F4() {
  const { openSource } = useUI();
  return (
    <Scene id="F4">
      <div style={{ marginTop: 24 }}><BranchActivity onOpenSource={openSource} /></div>
    </Scene>
  );
}

/* F5 — real Day 1 tree */
export function F5() {
  return (
    <Scene id="F5">
      <ZoomOut
        heading="This is what the real team had at the end of Day 1."
        body="Not the clean version that circulates weeks later. This is the tree as they left it that first day: preliminary, rough in places, and that’s fine. That’s what a real Day 1 output looks like."
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
        <BeatHead n="1" eyebrow="Conclusion" title="You built a branch of the thing the whole project hangs on" maroon />
        <Reveal><p className="body">The kick-off took a stack of reading and turned it into one claim the team can test. The tree you helped build is the target for everything that follows.</p></Reveal>
        <Reveal className="mt24">
          <div className="def" style={{ maxWidth: '100%' }}>
            <h4>Your branch</h4>
            {br.skipped ? <p className="muted">Skipped. You can go back any time and build it.</p>
              : subs.length ? <ul style={{ margin: 0, paddingLeft: 18 }}>{subs.map((t, i) => <li key={i} className="body" style={{ fontSize: 15 }}>{t}</li>)}</ul>
                : <FenSlot tag="yours">not built</FenSlot>}
          </div>
        </Reveal>
        {!br.skipped && <Reveal className="coach" style={{ marginTop: 16 }}>
          <div className="coach__h"><span className="coach__av">AI</span><span className="coach__nm">Coach, on what you did</span><span className="coach__fake">faked</span></div>
          <div className="coach__b"><div className="msg">{br.coachRead || 'You started the branch. The coach would push one claim to be testable before you rely on it.'}</div></div>
        </Reveal>}
        <Reveal><p className="body mt24">One thing to carry out of this room: be clear on what the deliverable is, not just the tree. Some people anchor on the argument, some on the document. You want both.</p></Reveal>
      </div>
      <div className="beat">
        <ChecklistStrip setKey="kickoff" label="See everything the full-team kick-off covers, by role" />
      </div>
    </Scene>
  );
}

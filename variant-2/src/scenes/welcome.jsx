import React from 'react';
import { motion } from 'framer-motion';
import { Reveal, StaggerGroup, StaggerItem, BeatHead, FenSlot, ArtefactFrame } from '../components/ui.jsx';
import { Scene } from '../components/frame.jsx';
import { HeroA } from '../components/heroes.jsx';
import { STAGES } from '../data.js';
import { spring, ease, dur } from '../motion.js';

/* W1 — cold open (no header; opens like a film) */
export function W1() {
  return (
    <Scene id="W1" variant="wide" hideHeader>
      <div style={{ paddingTop: 48 }}>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 44, flexWrap: 'wrap' }}>
          {['Proposal', 'Context brief', 'The question'].map((t, i) => (
            <motion.div key={i} initial={{ y: -50, opacity: 0, rotate: (i - 1) * 3 }} animate={{ y: 0, opacity: 1, rotate: (i - 1) * 2 }}
              transition={{ ...spring.land, delay: 0.2 + i * 0.18 }} style={{ width: 150 }}>
              <ArtefactFrame name={t}><div style={{ height: 60 }}><div className="line" style={{ height: 8, background: 'var(--hair-2)', borderRadius: 3, marginBottom: 8 }} /><div className="line" style={{ height: 8, width: '70%', background: 'var(--hair-2)', borderRadius: 3 }} /></div></ArtefactFrame>
            </motion.div>
          ))}
        </div>

        <motion.h1 className="display center" style={{ margin: '12px auto 0', maxWidth: '16ch' }}
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: dur.slow, ease: ease.entrance }}>
          It’s your first day on the Food-Energy Nexus project.
        </motion.h1>
        <Reveal amount={0.2}><p className="body center" style={{ margin: '20px auto 0', maxWidth: '52ch' }}>
          This is what’s on your desk. A proposal, a brief, and a question the client is paying to answer.
        </p></Reveal>

        <Reveal amount={0.2} className="mt32" style={{ maxWidth: 620, margin: '32px auto 0' }}>
          <div className="claim" style={{ margin: '0 auto' }}>
            <div className="k">The question on the table</div>
            <div className="tx"><FenSlot inline tag="FEN">the core question the FEN project had to answer</FenSlot></div>
          </div>
        </Reveal>

        <Reveal amount={0.2}><p className="body center" style={{ margin: '32px auto 0', maxWidth: '54ch' }}>
          Over the next 25 minutes you’ll take that question and turn it into a claim, a plan, and a deliverable. It’s all one piece of work. Watch.
        </p></Reveal>

        <div className="mt24">
          <HeroA compact silent />
          <p className="muted center" style={{ fontSize: 15, marginTop: 4 }}>One shape, three forms. You’ll build it yourself.</p>
        </div>
      </div>
    </Scene>
  );
}

/* W2 — why Day 1, and what you'll get */
export function W2() {
  const reasons = [
    ['Get your expertise into the room.', 'The people who know the most walk in on Day 1. If your thinking isn’t in the room then, it’s harder to get in later.', 'staff quote on expertise in the room'],
    ['Be faster, and more deliberate, in the research.', 'A sharp hypothesis on Day 1 tells you what to look for and what to ignore. You spend the weeks that follow testing a claim, not wandering.', 'staff quote on sharper research'],
    ['Set the team up to work well, and to grow.', 'Owners, norms and development goals get set on Day 1 or they drift. The team you name on the first day is the team you actually run in week four.', 'staff quote on team and development'],
  ];
  return (
    <Scene id="W2" variant="read">
      <Reveal><h2 className="lead" style={{ maxWidth: '20ch', marginTop: 24 }}>A good first day pays for itself for the rest of the project.</h2></Reveal>

      <div className="beat">
        <BeatHead n="1" eyebrow="Why Day 1 matters" title="Three reasons teams treat Day 1 as its own craft" />
        {reasons.map(([claim, body, quote], i) => (
          <Reveal key={i} className="reason">
            <div className="reason__claim">{claim}</div>
            <div className="reason__body">{body}</div>
            <div className="reason__quote">
              <div className="q"><FenSlot inline tag="FEN">{quote}, from the call notes</FenSlot></div>
              <div className="who"><FenSlot inline tag="FEN">Alex or Audrey</FenSlot></div>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="beat">
        <BeatHead n="2" eyebrow="What this is, and isn’t" title="Set your expectations" />
        <Reveal className="twocol">
          <div><h4>What this is</h4><ul>
            <li>A guided walk through the first day of a real Dalberg project.</li>
            <li>Two hands-on exercises where you do the thinking and get feedback.</li>
            <li>Templates and checklists you keep and use on your own projects.</li>
          </ul></div>
          <div><h4>What it isn’t</h4><ul>
            <li>A simulation of every meeting and message. We cut the staffing back-and-forth to what matters.</li>
            <li>A test. No score, no badge, no pass mark.</li>
            <li>The polished final version. You’ll see the real Day 1 output with its rough edges left in.</li>
          </ul></div>
        </Reveal>
      </div>

      <div className="beat">
        <BeatHead n="3" eyebrow="What you’ll be able to do" title="By the end" maroon />
        <Reveal><span className="draft-tag">Working draft</span></Reveal>
        <StaggerGroup>
          <ol className="objectives">
            {[
              'Draft a rough SCQ and problem statement from a proposal, before the kick-off.',
              'Take a top-level hypothesis and break it into claims that evidence could prove wrong.',
              'Read a hypothesis tree as a workplan and a deliverable, and see they’re the same object.',
              'Walk into a core-team kick-off knowing what to set: owners, a table of contents, and team norms.',
            ].map((t, i) => <StaggerItem as="li" key={i}>{t}</StaggerItem>)}
          </ol>
        </StaggerGroup>
        <Reveal><div style={{ marginTop: 16 }}><FenSlot tag="FEN">final objectives, signed off by the Craft group</FenSlot></div></Reveal>
      </div>
    </Scene>
  );
}

/* W3 — the five stages */
export function W3() {
  return (
    <Scene id="W3" variant="wide">
      <Reveal><h2 className="lead" style={{ maxWidth: '22ch', marginTop: 24 }}>Five stages. About 25 minutes, at your pace.</h2></Reveal>
      <Reveal><p className="body mt16" style={{ maxWidth: '60ch' }}>
        You can stop and come back to any of this. If you’re running it live with your team, slow down on the two exercises. That’s where most of the value is.
      </p></Reveal>
      <StaggerGroup className="mt32" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }} s={0.08}>
        {STAGES.map((s, i) => (
          <StaggerItem key={s.key} className="mapstage" style={{ minHeight: 168 }}>
            <div className="mn">Stage {i + 1}</div>
            <div className="mt">{s.name}</div>
            <div className="mp">{s.purpose}</div>
            <div className="mtime">{s.time}</div>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </Scene>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import { Reveal, StaggerGroup, StaggerItem, BeatHead, FenSlot, ArtefactFrame } from '../components/ui.jsx';
import { Scene } from '../components/frame.jsx';
import { HeroA } from '../components/heroes.jsx';
import { STAGES } from '../data.js';
import { spring, ease, dur } from '../motion.js';

/* W1 — cold open */
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

        <motion.h1 className="display center" style={{ margin: '12px auto 0', maxWidth: '20ch' }}
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: dur.slow, ease: ease.entrance }}>
          You are the analyst joining the Food-Energy Nexus project on its first day.
        </motion.h1>
        <Reveal amount={0.2}><p className="body center" style={{ margin: '20px auto 0', maxWidth: '54ch' }}>
          The proposal, the context brief, and the question the client has asked are already on your desk. The training follows that question through the first day of the project.
        </p></Reveal>

        <Reveal amount={0.2} className="mt32" style={{ maxWidth: 620, margin: '32px auto 0' }}>
          <div className="claim" style={{ margin: '0 auto' }}>
            <div className="k">The question the client has asked</div>
            <div className="tx"><FenSlot inline tag="FEN">the core question the FEN project had to answer</FenSlot></div>
          </div>
        </Reveal>

        <Reveal amount={0.2}><p className="body center" style={{ margin: '32px auto 0', maxWidth: '56ch' }}>
          Over the next half hour, you will watch that question become a claim, a plan, and a deliverable. The short sequence below shows the shape of what you will build. It is one object, and it takes several forms across the day.
        </p></Reveal>

        <div className="mt24">
          <HeroA compact silent />
        </div>
      </div>
    </Scene>
  );
}

/* W2 — why Day 1, and the objectives (real, from the codification deck) */
export function W2() {
  const reasons = [
    ['The team’s expertise belongs in the room on the first day.', 'The people who know the most are there at the start. If their thinking is not in the room then, it is harder to bring in later.', 'staff quote on expertise in the room'],
    ['A hypothesis set early makes the research faster and more deliberate.', 'A sharp hypothesis tells the team what to look for and what to set aside, so the following weeks test a claim rather than gather everything.', 'staff quote on sharper research'],
    ['The first day sets up how the team works, and how it develops.', 'Owners, norms and development goals are agreed on the first day, or they drift. The team named on the first day is the team the project actually runs on.', 'staff quote on team and development'],
  ];
  return (
    <Scene id="W2" variant="read">
      <Reveal><h2 className="lead" style={{ maxWidth: '22ch', marginTop: 24 }}>A well-run first day sets up the whole project, so the training treats it as its own piece of craft.</h2></Reveal>

      <div className="beat">
        <BeatHead n="1" title="Why the first day matters" />
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
        <BeatHead n="2" title="What the training is, and what it is not" />
        <Reveal className="twocol">
          <div><h4>What it is</h4><ul>
            <li>A guided walk through the first day of a real Dalberg project.</li>
            <li>Two exercises where you do the thinking and receive feedback.</li>
            <li>Templates and checklists you keep and reuse on your own projects.</li>
          </ul></div>
          <div><h4>What it is not</h4><ul>
            <li>A competence-specific training.</li>
            <li>A scored assessment. There is no mark and no badge.</li>
            <li>A simulation of every meeting and message; the staffing back-and-forth is left out.</li>
          </ul></div>
        </Reveal>
      </div>

      <div className="beat">
        <BeatHead n="3" title="What you will be able to do by the end" maroon />
        <StaggerGroup>
          <ol className="objectives">
            {[
              'Experience the Day 1 process from end to end, and see how it sets a project up for success.',
              'Understand what is expected of you at each stage of the first day.',
              'Understand what you should expect from your PDs and PMs at each stage.',
            ].map((t, i) => <StaggerItem as="li" key={i}>{t}</StaggerItem>)}
          </ol>
        </StaggerGroup>
      </div>
    </Scene>
  );
}

/* W3 — the five stages */
export function W3() {
  return (
    <Scene id="W3" variant="wide">
      <Reveal><h2 className="lead" style={{ maxWidth: '24ch', marginTop: 24 }}>The training runs across five stages, and takes about half an hour at your own pace.</h2></Reveal>
      <Reveal><p className="body mt16" style={{ maxWidth: '62ch' }}>
        You can stop and return to any stage. If you are running it live with your team, it is worth slowing down on the two exercises, which is where most of the value sits.
      </p></Reveal>
      <StaggerGroup className="mt32" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }} s={0.09}>
        {STAGES.map((s, i) => (
          <StaggerItem key={s.key} className="mapstage" style={{ minHeight: 176 }}>
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

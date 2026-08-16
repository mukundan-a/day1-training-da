import React from 'react';
import { motion } from 'framer-motion';
import { Reveal, StaggerGroup, StaggerItem, BeatHead, FenSlot, FilmFrame } from '../components/ui.jsx';
import { Scene } from '../components/frame.jsx';
import { HeroA } from '../components/heroes.jsx';
import { STAGES } from '../data.js';
import { spring, ease, dur } from '../motion.js';

/* W1 — cold open */
export function W1() {
  return (
    <Scene id="W1" variant="wide" hideHeader>
      <div style={{ paddingTop: 40, maxWidth: 660 }}>
        <motion.h1 className="display"
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: dur.base, ease: ease.entrance }}>
          You are about to enter a guided simulation of Day 1 of a project.
        </motion.h1>
        <Reveal amount={0.2}><p className="body mt16" style={{ maxWidth: '60ch' }}>
          You take the analyst’s seat and go through the first day as it actually happened: the same documents, the same meetings, the same thinking, in order. The project you are working on is named the moment you are staffed onto it.
        </p></Reveal>
      </div>

      <Reveal amount={0.15} style={{ marginTop: 28 }}>
        <FilmFrame label="Day 1, in fast-forward" caption="Watch one starting question become a claim, then a plan, then the deliverable. You will build each of these yourself as the day goes on.">
          <HeroA compact silent />
        </FilmFrame>
      </Reveal>
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

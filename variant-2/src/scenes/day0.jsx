import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Reveal, StaggerGroup, StaggerItem, BeatHead, FenSlot, ScaffoldSlot, ArtefactFrame, Icon } from '../components/ui.jsx';
import { Scene, useUI } from '../components/frame.jsx';
import { StageOverview, Checklist } from '../components/templates.jsx';
import { SCQExercise } from '../components/exercise.jsx';
import { useStore } from '../store.jsx';

export function D1() {
  return (
    <Scene id="D1">
      <StageOverview
        name="Day 0"
        note="The reading-in stage, before the project officially starts."
        why="Day 0 is where you get up to speed before the kick-off, rather than during it. By the time the team meets, you have read the same material and formed your own first view."
        doItems={['Read into the project, starting with the proposal and then the PD’s context brief.', 'Keep notes as you read. They return to you in the exercise.', 'Draft your own SCQ and problem statement.']}
        haveItems={['A rough SCQ, in your own words.', 'A working grip on the proposal and the context brief.', 'A short list of questions for the kick-off.']}
      />
    </Scene>
  );
}

/* D2 — reading room */
export function D2() {
  const { state, dispatch } = useStore();
  const [doc, setDoc] = useState('proposal');
  const [note, setNote] = useState('');
  const notes = state.notes;
  return (
    <Scene id="D2">
      <div className="beat" style={{ paddingTop: 24 }}>
        <BeatHead n="1" title="The documents that arrive before the project starts" maroon />
        <Reveal><p className="body">Before a project begins, a small set of documents lands with you. Here that is the proposal, and a couple of days later the PD’s context brief. Each opens in a reader with the passages that matter already highlighted, so your attention goes to the right places. Anything you note here returns when you draft your SCQ.</p></Reveal>
      </div>

      <Reveal style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[['proposal', 'Proposal'], ['brief', 'Context brief']].map(([k, l]) => (
          <button key={k} className="chip" aria-pressed={doc === k} onClick={() => setDoc(k)}
            style={doc === k ? { background: 'var(--maroon)', color: '#fff', borderColor: 'var(--maroon)' } : null}>{l}</button>
        ))}
      </Reveal>

      <div className="reading">
        <div className="page">
          <h5>{doc === 'proposal' ? 'Proposal' : 'Context brief'}<FenSlot inline tag="FEN"> real PDF, key passages highlighted</FenSlot></h5>
          {[100, 90, 70, 85, 60, 78, 92, 66].map((w, i) => (
            <div key={i} className={'line' + (i === 1 ? ' mark' : i === 4 ? ' hl' : '')} style={{ width: w + '%' }} />
          ))}
          <p className="muted" style={{ fontSize: 14, marginTop: 14 }}>The highlights mark what the PDs think matters most. If a line reads like a Situation, a Complication or a Question, it is worth a note.</p>
        </div>
        <div className="notescol">
          <h4>Your notes</h4>
          <div className="hint">Notes you take here are kept, and appear as sources when you draft your SCQ.</div>
          <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Type a note" />
          <button className="continue" style={{ width: '100%', justifyContent: 'center', marginTop: 8, borderRadius: 10 }}
            onClick={() => { if (note.trim()) { dispatch({ type: 'addNote', sceneTag: 'D2', text: note.trim() }); setNote(''); } }}>Save note</button>
          <div style={{ marginTop: 14 }}>
            {notes.length === 0 && <p className="muted" style={{ fontSize: 13, fontStyle: 'italic' }}>No notes yet.</p>}
            {notes.map(n => <div key={n.id} className="notechip"><span>{n.text}</span></div>)}
          </div>
        </div>
      </div>
      <Reveal><p className="muted" style={{ fontSize: 15, marginTop: 20 }}>The staffing emails and calendar invites are left out. What matters is that these documents are in front of you before the project starts.</p></Reveal>
    </Scene>
  );
}

/* D3 — what an SCQ is */
export function D3() {
  const parts = [['S', 'Situation', 'What is true and not in dispute. The stable backdrop everyone already accepts.'],
    ['C', 'Complication', 'What has changed, or what is now at stake, that makes the situation worth acting on.'],
    ['Q', 'Question', 'The single question the client needs answered, which follows from the situation and the complication.']];
  return (
    <Scene id="D3" variant="read">
      <div className="beat" style={{ paddingTop: 24 }}>
        <BeatHead n="1" title="Before the kick-off, everyone drafts their own SCQ" maroon />
        <Reveal><p className="body">On a real project, each person writes a rough SCQ and problem statement on their own, before the team meets. The aim is not a finished answer. It is to do the thinking, and to arrive with questions.</p></Reveal>
      </div>
      <div className="beat">
        <BeatHead n="2" title="The SCQ frame, in three parts" />
        <Reveal><p className="body">An SCQ is a simple frame for setting out a problem, so that everyone agrees what the problem is before anyone tries to solve it.</p></Reveal>
        <StaggerGroup className="flow mt24" s={0.16}>
          {parts.map(([L, name, desc], i) => (
            <React.Fragment key={L}>
              <motion.div className="flow__card" variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } }}>
                <div className="flow__L">{L}</div><div className="flow__nm">{name}</div><div className="flow__d">{desc}</div>
              </motion.div>
              {i < 2 && <motion.span className="flow__arrow" style={{ display: 'inline-flex' }} variants={{ hidden: { opacity: 0, scaleX: 0 }, show: { opacity: 1, scaleX: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } } }}><Icon n="right" size={22} /></motion.span>}
            </React.Fragment>
          ))}
        </StaggerGroup>
        <Reveal className="flow__eq" style={{ marginTop: 14 }}>
          <span className="lab">Problem statement</span>
          <span className="body" style={{ fontSize: 15, margin: 0 }}>The three parts resolve into one or two sentences naming the problem the work exists to solve. Everything that follows points back to it.</span>
        </Reveal>
      </div>
    </Scene>
  );
}

/* D4 — draft your SCQ (immersive exercise) */
export function D4() {
  const { openSource } = useUI();
  return (
    <Scene id="D4">
      <Reveal><h2 className="lead" style={{ marginTop: 24, maxWidth: '30ch' }}>On this screen you draft your own SCQ, and a coach reads it back.</h2></Reveal>
      <Reveal><p className="body mt16" style={{ maxWidth: '62ch' }}>
        You add a few bullets under Situation, Complication and Question, then write a short problem statement. When you check it, the coach reads your draft and suggests where to sharpen it. The panels below show that exchange as it plays out.
      </p></Reveal>
      <div style={{ marginTop: 24 }}><SCQExercise onOpenSource={openSource} /></div>
    </Scene>
  );
}

/* D5 — Day 0 close */
export function D5() {
  const { state } = useStore();
  const scq = state.scq;
  const yours = [...scq.S, ...scq.C, ...scq.Q].filter(Boolean);
  return (
    <Scene id="D5">
      <div className="beat" style={{ paddingTop: 24 }}>
        <BeatHead n="1" title="Your draft, beside the one the FEN team settled on" maroon />
        <div className="panels" style={{ marginTop: 8 }}>
          <Reveal className="panel">
            <h3 style={{ fontSize: 19 }}>What you wrote</h3>
            {scq.skipped
              ? <p className="muted">You skipped the exercise, so a real teammate’s draft stands in its place.</p>
              : yours.length
                ? <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>{yours.slice(0, 6).map((t, i) => <li key={i} className="body" style={{ fontSize: 15 }}>• {t}</li>)}
                    <li style={{ marginTop: 6 }} className="body"><strong>Problem:</strong> {scq.problem || <FenSlot inline tag="yours">not written</FenSlot>}</li></ul>
                : <FenSlot tag="yours">nothing drafted</FenSlot>}
          </Reveal>
          <Reveal className="panel panel--soft">
            <h3 style={{ fontSize: 19 }}>What the FEN team landed on</h3>
            <ScaffoldSlot lines={['w100', 'w80', 'w90', 'w55']} />
          </Reveal>
        </div>
        <Reveal><p className="body mt24">These are not a right answer and a wrong one. They are two drafts that framed the same problem differently. That is what Day 0 gives you: a point of view to walk in with, rather than a blank one to fill in the room.</p></Reveal>
      </div>

      <div className="beat band band--pink" style={{ padding: '40px 0' }}>
        <BeatHead n="2" title="How the two PDs divide the project" maroon />
        <Reveal><p className="body">Most of the time you are not in the room when the two Project Directors divide the work. It still helps to know the split, so you know who to go to for what. On the FEN project it was agreed like this.</p></Reveal>
        <StaggerGroup className="panels" style={{ marginTop: 24 }}>
          {[['Content lead', 'who leads content review'], ['Client lead', 'who leads the client relationship'], ['Coaching and development', 'how the PDs split coaching the team']].map(([h, s]) => (
            <StaggerItem key={h} className="panel">
              <h3 style={{ fontSize: 19 }}>{h}</h3><FenSlot tag="FEN">{s}</FenSlot>
            </StaggerItem>
          ))}
        </StaggerGroup>
        <Reveal><p className="muted" style={{ fontSize: 15, marginTop: 16 }}>Every project divides this differently. It is worth finding out early who owns what on yours.</p></Reveal>
      </div>

      <div className="beat">
        <Checklist setKey="day0" title="Everything a full Day 0 involves"
          framing="You have done the part that teaches best. This is the whole of Day 0, including the steps this training does not walk through, so that nothing important is dropped quietly. Use the filter to see the items for your own role." />
      </div>
    </Scene>
  );
}

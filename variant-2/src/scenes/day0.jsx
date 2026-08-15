import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Reveal, StaggerGroup, StaggerItem, BeatHead, FenSlot, ScaffoldSlot, ArtefactFrame, Icon } from '../components/ui.jsx';
import { Scene, useUI } from '../components/frame.jsx';
import { StageOverview, Checklist } from '../components/templates.jsx';
import { SCQActivity } from '../components/activities.jsx';
import { useStore } from '../store.jsx';

export function D1() {
  return (
    <Scene id="D1">
      <StageOverview
        name="Day 0"
        note="Getting set up before the project officially starts."
        why="Show up to the kick-off already up to speed, not getting up to speed in the room."
        doItems={['Read into the project: the proposal, then the PD’s context brief.', 'Keep notes as you go. They come back to you later.', 'Draft your own SCQ and problem statement.']}
        haveItems={['A rough SCQ, in your own words.', 'A working grip on the proposal and the context brief.', 'A short list of questions to bring to the kick-off.']}
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
        <BeatHead n="1" eyebrow="What lands in your lap" title="This is what you get before a project starts" maroon />
        <Reveal><p className="body">At minimum: the proposal, and a couple of days later, the PD’s context brief. Open each one. Highlighting is already done for you, so your eye goes to what matters. Anything you note here comes back when you draft your SCQ.</p></Reveal>
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
          <p className="muted" style={{ fontSize: 13, marginTop: 12, fontStyle: 'italic' }}>Worth noticing: the highlighted passages. Seeing a Situation, Complication or Question? Note it now.</p>
        </div>
        <div className="notescol">
          <h4>Your notes</h4>
          <div className="hint">Jot anything that might shape the question. It’ll be waiting in the exercise.</div>
          <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Type a note" />
          <button className="continue" style={{ width: '100%', justifyContent: 'center', marginTop: 8, borderRadius: 10 }}
            onClick={() => { if (note.trim()) { dispatch({ type: 'addNote', sceneTag: 'D2', text: note.trim() }); setNote(''); } }}>Save note</button>
          <div style={{ marginTop: 14 }}>
            {notes.length === 0 && <p className="muted" style={{ fontSize: 13, fontStyle: 'italic' }}>Nothing yet.</p>}
            {notes.map(n => <div key={n.id} className="notechip"><span>{n.text}</span></div>)}
          </div>
        </div>
      </div>
      <Reveal><p className="muted" style={{ fontSize: 15, marginTop: 20 }}>We’ve cut the staffing emails and calendar invites. This is the part that matters: getting these in front of you.</p></Reveal>
    </Scene>
  );
}

/* D3 — what an SCQ is */
export function D3() {
  const parts = [['S', 'Situation', 'What’s true and not in dispute. The stable backdrop.'],
    ['C', 'Complication', 'What changed, or what’s now at stake, that makes this worth solving.'],
    ['Q', 'Question', 'The one question the client needs answered, that follows from the two above.']];
  return (
    <Scene id="D3" variant="read">
      <div className="beat" style={{ paddingTop: 24 }}>
        <BeatHead n="1" eyebrow="Definition" title="Before the kick-off, everyone drafts their own SCQ" maroon />
        <Reveal><p className="body">On a real project, each person writes a rough SCQ and problem statement on their own, before anyone meets. Not to get it right. To do the thinking, and to arrive with questions.</p></Reveal>
      </div>
      <div className="beat">
        <BeatHead n="2" eyebrow="The three parts" title="What’s an SCQ?" />
        <Reveal><p className="body">A three-part frame for stating a problem so everyone agrees what it is before anyone tries to solve it.</p></Reveal>
        <StaggerGroup style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 20 }} s={0.14}>
          {parts.map(([L, name, desc]) => (
            <StaggerItem key={L} style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
              <span style={{ fontFamily: 'var(--display)', fontSize: 40, color: 'var(--maroon)', lineHeight: 1, width: 44, flexShrink: 0 }}>{L}</span>
              <div><div style={{ fontSize: 19, fontWeight: 700, color: 'var(--grey)' }}>{name}</div><div className="body" style={{ marginTop: 4 }}>{desc}</div></div>
            </StaggerItem>
          ))}
        </StaggerGroup>
        <Reveal><p className="body mt24">Together they resolve into a <strong>problem statement</strong>: one or two sentences naming the problem the work exists to solve.</p></Reveal>
      </div>
      <Reveal><p className="muted" style={{ fontSize: 15 }}>This is about generating thinking, not polish. Rough is the point. <FenSlot inline tag="FEN">links to past SCQ trainings</FenSlot></p></Reveal>
    </Scene>
  );
}

/* D4 — draft your SCQ */
export function D4() {
  const { openSource } = useUI();
  return (
    <Scene id="D4">
      <div style={{ marginTop: 24 }}><SCQActivity onOpenSource={openSource} /></div>
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
        <BeatHead n="1" eyebrow="Conclusion" title="Here’s yours, next to the real one" maroon />
        <div className="panels" style={{ marginTop: 8 }}>
          <Reveal className="panel" style={{ background: '#fff', border: '1px solid var(--hair)' }}>
            <h3 style={{ fontSize: 19 }}>What you wrote</h3>
            {scq.skipped
              ? <p className="muted">Skipped. Here’s a real teammate’s draft in its place.</p>
              : yours.length
                ? <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>{yours.slice(0, 6).map((t, i) => <li key={i} className="body" style={{ fontSize: 15 }}>• {t}</li>)}
                    <li style={{ marginTop: 6 }} className="body"><strong>Problem:</strong> {scq.problem || <FenSlot inline tag="yours">not written</FenSlot>}</li></ul>
                : <FenSlot tag="yours">nothing drafted</FenSlot>}
          </Reveal>
          <Reveal className="panel">
            <h3 style={{ fontSize: 19 }}>What the FEN team landed on</h3>
            <ScaffoldSlot lines={['w100', 'w80', 'w90', 'w55']} />
          </Reveal>
        </div>
        {!scq.skipped && <Reveal className="coach" style={{ marginTop: 20 }}>
          <div className="coach__h"><span className="coach__av">AI</span><span className="coach__nm">Coach, on your draft</span><span className="coach__fake">faked</span></div>
          <div className="coach__b"><div className="msg">{scq.coachRead || 'You made a start. The coach would push you to sharpen the question before the kick-off.'}</div></div>
        </Reveal>}
        <Reveal><p className="body mt24">You’re not looking at a right answer and a wrong one. You’re looking at two drafts that framed the same problem. That’s what Day 0 buys you: a point of view to walk in with, instead of a blank one to fill in the room.</p></Reveal>
      </div>

      <div className="beat band band--pink" style={{ padding: '56px 0' }}>
        <BeatHead n="2" eyebrow="How the PDs split the project" title="Two PDs, one project. Here’s who does what." maroon />
        <Reveal><p className="body">Most of the time you’re not in the room when the two Project Directors carve up the work. You should still know the split, so you know who to go to.</p></Reveal>
        <StaggerGroup className="panels" style={{ marginTop: 24 }}>
          {[['Content lead', 'who leads content review'], ['Client lead', 'who leads the client'], ['Coaching & development', 'how the PDs split coaching']].map(([h, s]) => (
            <StaggerItem key={h} className="panel" style={{ background: '#fff', border: '1px solid var(--hair)' }}>
              <h3 style={{ fontSize: 19 }}>{h}</h3><FenSlot tag="FEN">{s}</FenSlot>
            </StaggerItem>
          ))}
        </StaggerGroup>
        <Reveal><p className="muted" style={{ fontSize: 15, marginTop: 16 }}>Every project splits this differently. Find out early who owns what on yours.</p></Reveal>
      </div>

      <div className="beat">
        <Checklist setKey="day0" title="Everything a real Day 0 involves"
          framing="You did the part that teaches best. This is the whole of it, including the pieces we didn’t walk through, so nothing important gets dropped quietly. Filter to your role." />
      </div>
    </Scene>
  );
}

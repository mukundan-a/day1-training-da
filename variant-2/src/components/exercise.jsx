// The two exercises. The audience is reviewers, so each one quietly plays
// itself once on view (focus moves field to field, text appears, the coach
// responds), marked only by a small "Exercise demo" sticker. Immersion is kept:
// no foreign cursor, no "watch someone" framing. The fields stay live
// afterward, and everything is written to real state so the draft carries to
// the close. Generic method text is used in the demo, never FEN content.
import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Icon, Reveal, FenSlot } from './ui.jsx';
import { useStore } from '../store.jsx';
import { reviewSCQ, reviewBranch } from '../coach.js';
import { spring } from '../motion.js';

const Sticker = ({ playing, onReplay }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--grey-3)', border: '1px solid var(--hair)', borderRadius: 20, padding: '5px 12px' }}>
      <span style={{ width: 6, height: 6, borderRadius: 3, background: playing ? 'var(--pink)' : 'var(--grey-3)' }} /> Exercise demo
    </span>
    {!playing && <button className="back" onClick={onReplay}><Icon n="replay" size={15} /> Play again</button>}
  </div>
);

function Coach({ state }) {
  if (!state) return null;
  return (
    <motion.div className="coach" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={spring.hero}>
      <div className="coach__h"><span className="coach__av">AI</span><span className="coach__nm">Coach</span><span className="coach__fake">faked for the mockup</span></div>
      <div className="coach__b">
        {state === 'thinking'
          ? <span className="typing"><motion.i animate={{ opacity: [.3, 1, .3] }} transition={{ duration: 1, repeat: Infinity }} /><motion.i animate={{ opacity: [.3, 1, .3] }} transition={{ duration: 1, repeat: Infinity, delay: .2 }} /><motion.i animate={{ opacity: [.3, 1, .3] }} transition={{ duration: 1, repeat: Infinity, delay: .4 }} /></span>
          : <>
              <motion.div className={'verdict ' + (state.pass ? 'pass' : 'iterate')} initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={spring.land}>
                {state.pass ? <><Icon n="check" size={14} /> Good enough to take forward</> : 'Worth another pass'}
              </motion.div>
              {state.msg.map((m, i) => <div className="msg" key={i}>{m}</div>)}
            </>}
      </div>
    </motion.div>
  );
}

const wait = (ms) => new Promise(r => setTimeout(r, ms));

/* ------------------------------------------------------------------ SCQ */
export function SCQExercise({ onOpenSource }) {
  const wrap = useRef(null);
  const inView = useInView(wrap, { once: true, amount: 0.3 });
  const { state, dispatch } = useStore();
  const scq = state.scq;
  const [playing, setPlaying] = useState(false);
  const [glow, setGlow] = useState(null);
  const [typing, setTyping] = useState({ f: null, t: '' });
  const [coach, setCoach] = useState(null);
  const [drafts, setDrafts] = useState({ S: '', C: '', Q: '' });
  const ran = useRef(false);

  const setField = (f, arr) => dispatch({ type: 'scq', patch: { [f]: arr } });
  const typeInto = async (f, text) => { setGlow(f); for (let i = 1; i <= text.length; i++) { setTyping({ f, t: text.slice(0, i) }); await wait(26); } await wait(220); };

  const demo = async () => {
    setPlaying(true); setCoach(null);
    dispatch({ type: 'scq', patch: { S: [], C: [], Q: [], problem: '', coachRead: '', checkCount: 0, skipped: false } });
    await wait(500);
    await typeInto('S', 'What everyone already agrees on'); setField('S', ['What everyone already agrees on']); setTyping({ f: null, t: '' }); await wait(250);
    await typeInto('C', 'What has recently changed'); setField('C', ['What has recently changed']); setTyping({ f: null, t: '' }); await wait(250);
    await typeInto('Q', 'Look into the market'); setField('Q', ['Look into the market']); setTyping({ f: null, t: '' }); await wait(200);
    setGlow('P'); for (let i = 1; i <= 42; i++) { dispatch({ type: 'scq', patch: { problem: 'How should the client respond to the change?'.slice(0, i) } }); await wait(22); }
    setGlow('check'); await wait(500); setGlow(null);
    setCoach('thinking'); await wait(1000);
    setCoach({ pass: false, msg: ['The situation and complication are in place, and the problem statement reads well.', 'The question, as written, is closer to a topic than a question. It helps to phrase it so that a decision would answer it, starting with a word like "Should", "How much", or "Which".'] });
    await wait(2600);
    setGlow('Q'); setField('Q', []); await wait(300);
    await typeInto('Q', 'Should the client change course?'); setField('Q', ['Should the client change course?']); setTyping({ f: null, t: '' }); setGlow(null); await wait(300);
    setGlow('check'); await wait(500); setGlow(null);
    setCoach('thinking'); await wait(1000);
    setCoach({ pass: true, msg: ['The situation sets the ground, the complication names the tension, and the question now follows from them.', 'This is a solid draft to bring into the kick-off.'] });
    dispatch({ type: 'scq', patch: { coachRead: 'The situation sets the ground, the complication names the tension, and the question follows from them.' } });
    await wait(600); setPlaying(false);
  };
  useEffect(() => { if (inView && !ran.current) { ran.current = true; demo(); } }, [inView]);

  // interactive (after the demo)
  const add = (f) => { const v = drafts[f].trim(); if (!v) return; setField(f, [...scq[f], v]); setDrafts(d => ({ ...d, [f]: '' })); };
  const del = (f, i) => setField(f, scq[f].filter((_, x) => x !== i));
  const check = () => {
    setCoach('thinking');
    setTimeout(() => {
      const r = reviewSCQ(scq); const pass = r.nudges.length === 0 && !r.thin || scq.checkCount >= 1;
      dispatch({ type: 'scq', patch: { checkCount: scq.checkCount + 1, coachRead: pass ? 'The question follows from the situation and complication.' : scq.coachRead } });
      setCoach(pass ? { pass: true, msg: ['The situation sets the ground, the complication names the tension, and the question follows from them.'] } : { pass: false, msg: [r.reflect, ...r.nudges] });
    }, 800);
  };

  const Cell = ({ f, word }) => (
    <div className={'scqcell' + (glow === f ? ' glow' : '')}>
      <div className="scqcell__h"><span className="scqcell__L">{f}</span><span className="scqcell__w">{word}</span></div>
      <ul className="scqlist">
        <AnimatePresence>
          {scq[f].map((t, i) => <motion.li key={t + i} initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={spring.land}>{t}{!playing && <span className="del" onClick={() => del(f, i)}>×</span>}</motion.li>)}
        </AnimatePresence>
      </ul>
      <div className="scqadd">
        <input value={typing.f === f ? typing.t : drafts[f]} readOnly={playing} placeholder="Add a bullet"
          onChange={e => setDrafts(d => ({ ...d, [f]: e.target.value }))} onKeyDown={e => e.key === 'Enter' && add(f)} />
        <button onClick={() => !playing && add(f)}><Icon n="plus" size={16} /></button>
      </div>
    </div>
  );

  return (
    <div ref={wrap} style={{ position: 'relative' }}>
      <Sticker playing={playing} onReplay={demo} />
      <div className="reading" style={{ gridTemplateColumns: '1fr 210px', alignItems: 'start' }}>
        <div>
          <div className="scqgrid"><Cell f="S" word="Situation" /><Cell f="C" word="Complication" /><Cell f="Q" word="Question" /></div>
          <div className={'problem' + (glow === 'P' ? ' glow' : '')}>
            <h4>Problem statement</h4>
            <textarea value={scq.problem} readOnly={playing} placeholder="In a sentence or two, what problem does this work solve?" onChange={e => dispatch({ type: 'scq', patch: { problem: e.target.value } })} />
          </div>
          <div className="actionbar" style={{ justifyContent: 'flex-start' }}>
            <button className={'continue' + (glow === 'check' ? ' glow' : '')} style={{ borderRadius: 26 }} onClick={() => !playing && check()}><Icon n="check" size={18} /> Check the draft</button>
          </div>
          <AnimatePresence>{coach && <Coach state={coach} />}</AnimatePresence>
        </div>
        <div className="sources">
          <h4>Everything you need</h4>
          <button onClick={() => onOpenSource('proposal')}><Icon n="doc" size={16} /> Proposal</button>
          <button onClick={() => onOpenSource('brief')}><Icon n="doc" size={16} /> Context brief</button>
          <button onClick={() => onOpenSource('notes')}><Icon n="notes" size={16} /> Your notes</button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- Branch */
export function BranchExercise({ onOpenSource }) {
  const wrap = useRef(null);
  const inView = useInView(wrap, { once: true, amount: 0.3 });
  const { state, dispatch } = useStore();
  const br = state.branch;
  const [playing, setPlaying] = useState(false);
  const [glow, setGlow] = useState(false);
  const [typing, setTyping] = useState('');
  const [coach, setCoach] = useState(null);
  const [draft, setDraft] = useState('');
  const ran = useRef(false);

  const setSubs = (arr) => dispatch({ type: 'branch', patch: { subclaims: arr } });
  const typeSub = async (text) => { setGlow(true); for (let i = 1; i <= text.length; i++) { setTyping(text.slice(0, i)); await wait(24); } await wait(200); };

  const demo = async () => {
    setPlaying(true); setCoach(null);
    dispatch({ type: 'branch', patch: { subclaims: [], coachRead: '', checkCount: 0, skipped: false } });
    await wait(500);
    await typeSub('Build a model of the whole system'); setSubs(['Build a model of the whole system']); setTyping(''); setGlow(false); await wait(400);
    setCoach('thinking'); await wait(1000);
    setCoach({ pass: false, msg: ['That first one is a task, not a claim. A sub-claim should be something that is either true or false, so that evidence could test it.', 'It also helps to have two or three sub-claims, so that together they would make the branch true.'] });
    await wait(2800);
    setSubs([]); await wait(300);
    await typeSub('Demand is large enough to matter'); setSubs(['Demand is large enough to matter']); setTyping(''); await wait(300);
    await typeSub('The economics hold at the scale required'); setSubs(['Demand is large enough to matter', 'The economics hold at the scale required']); setTyping(''); await wait(300);
    await typeSub('The plan is deliverable within the timeframe'); setSubs(['Demand is large enough to matter', 'The economics hold at the scale required', 'The plan is deliverable within the timeframe']); setTyping(''); setGlow(false); await wait(400);
    setCoach('thinking'); await wait(1000);
    setCoach({ pass: true, msg: ['Each of these is a claim that could be proven wrong, and if all three held, the branch above would hold too.', 'That is a testable branch.'] });
    dispatch({ type: 'branch', patch: { coachRead: 'The sub-claims are statements, not questions, and at least one could be proven wrong.' } });
    await wait(600); setPlaying(false);
  };
  useEffect(() => { if (inView && !ran.current) { ran.current = true; demo(); } }, [inView]);

  const add = () => { const v = draft.trim(); if (!v) return; setSubs([...br.subclaims, v]); setDraft(''); };
  const del = (i) => setSubs(br.subclaims.filter((_, x) => x !== i));
  const check = () => {
    setCoach('thinking');
    setTimeout(() => {
      const r = reviewBranch(br, ''); const pass = r.nudges.length === 0 && !r.thin || br.checkCount >= 1;
      dispatch({ type: 'branch', patch: { checkCount: br.checkCount + 1, coachRead: pass ? 'The sub-claims are testable.' : br.coachRead } });
      setCoach(pass ? { pass: true, msg: ['Each of these could be proven wrong, and together they would make the branch hold.'] } : { pass: false, msg: [r.reflect, ...r.nudges] });
    }, 800);
  };

  return (
    <div ref={wrap} style={{ position: 'relative' }}>
      <Sticker playing={playing} onReplay={demo} />
      <div className="claim" style={{ margin: '0 auto 16px', maxWidth: 560 }}>
        <div className="k">L1 hypothesis</div>
        <div className="tx"><FenSlot inline tag="scaffold">the PD’s top-level claim</FenSlot></div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 20 }}>
        {[0, 1, 2].map(i => <div key={i} className={'branchcard' + (i === 1 ? ' mine' : '')} style={{ width: 180, opacity: i === 1 ? 1 : 0.4 }}><div className="branchcard__h">Branch {i + 1}</div></div>)}
      </div>
      <ul className={'scqlist' + (glow ? ' glow' : '')} style={{ border: '1px solid var(--hair)', borderRadius: 10, padding: 12, minHeight: 60, maxWidth: 560, margin: '0 auto' }}>
        <AnimatePresence>
          {br.subclaims.length === 0 && !typing && <li className="seed">For the branch to be true, what has to be true underneath it?</li>}
          {br.subclaims.map((t, i) => <motion.li key={t + i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={spring.land}>{t}{!playing && <span className="del" onClick={() => del(i)}>×</span>}</motion.li>)}
        </AnimatePresence>
      </ul>
      <div className="scqadd" style={{ maxWidth: 560, margin: '0 auto', padding: '10px 0' }}>
        <input value={playing ? typing : draft} readOnly={playing} placeholder="Add a sub-claim" style={{ maxWidth: 420 }} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} /><button onClick={() => !playing && add()}><Icon n="plus" size={16} /></button>
      </div>
      <div className="actionbar" style={{ justifyContent: 'center' }}>
        <button className="continue" style={{ borderRadius: 26 }} onClick={() => !playing && check()}><Icon n="check" size={18} /> Check the branch</button>
      </div>
      <AnimatePresence>{coach && <Coach state={coach} />}</AnimatePresence>
    </div>
  );
}

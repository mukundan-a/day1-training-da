// The two exercises. The audience is reviewers, so each one quietly plays
// itself once on view (focus moves field to field, text appears, the coach
// replies), marked only by a small "Exercise demo" sticker. Immersion is kept:
// no foreign cursor, no "watch someone" framing. The fields stay live
// afterward, and everything is written to real state so the draft carries to
// the close. The coach is a floating chat panel, so a reviewer sees it react
// without scrolling. Generic method text is used in the demo, never FEN content.
import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Icon, Reveal, FenSlot } from './ui.jsx';
import { HypTree } from './heroes.jsx';
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

const wait = (ms) => new Promise(r => setTimeout(r, ms));

/* Floating coach chat panel. Shows a running conversation of coach turns; a
   thinking bubble while it "reads". Minimises to a pill the reviewer can reopen. */
function CoachChat({ log, thinking, open, setOpen }) {
  const bodyRef = useRef(null);
  const active = thinking || log.length > 0;
  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; }, [log, thinking]);
  if (!active) return null;
  return (
    <div className="coachdock">
      <AnimatePresence>
        {open ? (
          <motion.div className="coachchat" key="panel" initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.96 }} transition={spring.hero}>
            <div className="coachchat__h">
              <span className="coachchat__av">AI</span>
              <div className="coachchat__id"><div className="coachchat__nm">Coach</div><div className="coachchat__sub">faked for the mockup</div></div>
              <button className="coachchat__x" onClick={() => setOpen(false)} aria-label="Minimise coach"><Icon n="close" size={16} /></button>
            </div>
            <div className="coachchat__body" ref={bodyRef}>
              {log.map((turn, i) => (
                <motion.div className="cbub" key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={spring.land}>
                  {turn.verdict && (
                    <div className={'verdict ' + (turn.verdict === 'pass' ? 'pass' : 'iterate')}>
                      {turn.verdict === 'pass' ? <><Icon n="check" size={13} /> Good enough to take forward</> : 'Worth another pass'}
                    </div>
                  )}
                  {turn.lines.map((m, k) => <p className="cbub__t" key={k}>{m}</p>)}
                </motion.div>
              ))}
              {thinking && (
                <div className="cbub">
                  <span className="typing">
                    <motion.i animate={{ opacity: [.3, 1, .3] }} transition={{ duration: 1, repeat: Infinity }} />
                    <motion.i animate={{ opacity: [.3, 1, .3] }} transition={{ duration: 1, repeat: Infinity, delay: .2 }} />
                    <motion.i animate={{ opacity: [.3, 1, .3] }} transition={{ duration: 1, repeat: Infinity, delay: .4 }} />
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.button className="coachpill" key="pill" onClick={() => setOpen(true)} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
            <span className="coachchat__av">AI</span> Coach
            {(thinking || log.length) ? <span className="coachpill__dot" /> : null}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ SCQ */
export function SCQExercise({ onOpenSource }) {
  const wrap = useRef(null);
  const inView = useInView(wrap, { once: true, amount: 0.3 });
  const { state, dispatch } = useStore();
  const scq = state.scq;
  const [playing, setPlaying] = useState(false);
  const [glow, setGlow] = useState(null);
  const [typing, setTyping] = useState({ f: null, t: '' });
  const [log, setLog] = useState([]);
  const [thinking, setThinking] = useState(false);
  const [coachOpen, setCoachOpen] = useState(true);
  const [drafts, setDrafts] = useState({ S: '', C: '', Q: '' });
  const ran = useRef(false);

  const setField = (f, arr) => dispatch({ type: 'scq', patch: { [f]: arr } });
  const say = (verdict, lines) => setLog(l => [...l, { verdict, lines }]);
  const typeInto = async (f, text) => { setGlow(f); for (let i = 1; i <= text.length; i++) { setTyping({ f, t: text.slice(0, i) }); await wait(13); } await wait(90); };
  const addBullet = async (f, cur, text) => { await typeInto(f, text); setField(f, [...cur, text]); setTyping({ f: null, t: '' }); await wait(100); };

  const demo = async () => {
    setPlaying(true); setLog([]); setThinking(false); setCoachOpen(true);
    dispatch({ type: 'scq', patch: { S: [], C: [], Q: [], problem: '', coachRead: '', checkCount: 0, skipped: false } });
    await wait(500);
    let S = []; S = [...S, 'Where the client and the field already agree today']; await addBullet('S', [], S[0]);
    S = [...S, 'The baseline nobody in the room is disputing']; await addBullet('S', [S[0]], S[1]);
    let C = []; C = [...C, 'What has recently changed on the ground']; await addBullet('C', [], C[0]);
    C = [...C, 'Why the current approach no longer holds']; await addBullet('C', [C[0]], C[1]);
    await addBullet('Q', [], 'Look into the market and the options');
    // problem statement, written straight off the SCQ
    setGlow('P'); await wait(250);
    const P = 'How should the client respond to what has changed?';
    for (let i = 1; i <= P.length; i++) { dispatch({ type: 'scq', patch: { problem: P.slice(0, i) } }); await wait(12); }
    setGlow('check'); await wait(500); setGlow(null);
    setThinking(true); await wait(650); setThinking(false);
    say('iterate', [
      'The situation and complication read well, and the problem statement follows from them.',
      'The question, though, is closer to a topic than a question. Phrase it so a decision would answer it, starting with a word like "Should", "How much", or "Which".',
    ]);
    await wait(1400);
    setGlow('Q'); setField('Q', []); await wait(300);
    await addBullet('Q', [], 'Should the client change course?');
    await addBullet('Q', ['Should the client change course?'], 'If so, on what basis should it decide?');
    setGlow('check'); await wait(500); setGlow(null);
    setThinking(true); await wait(650); setThinking(false);
    say('pass', [
      'The situation sets the ground, the complication names the tension, and the question now follows from both.',
      'This is a solid draft to bring into the kick-off.',
    ]);
    dispatch({ type: 'scq', patch: { coachRead: 'The situation sets the ground, the complication names the tension, and the question follows from them.' } });
    await wait(500); setPlaying(false);
  };
  // On revisit the draft is already made, so skip the slow demo and land on the
  // finished state with the coach's verdict already shown.
  useEffect(() => {
    if (!inView || ran.current) return;
    ran.current = true;
    if (scq.coachRead && (scq.S.length || scq.problem)) {
      setLog([{ verdict: 'pass', lines: ['The situation sets the ground, the complication names the tension, and the question follows from them.', 'This is a solid draft to bring into the kick-off.'] }]);
    } else demo();
  }, [inView]);

  const add = (f) => { const v = drafts[f].trim(); if (!v) return; setField(f, [...scq[f], v]); setDrafts(d => ({ ...d, [f]: '' })); };
  const del = (f, i) => setField(f, scq[f].filter((_, x) => x !== i));
  const check = () => {
    setThinking(true); setCoachOpen(true);
    setTimeout(() => {
      setThinking(false);
      const r = reviewSCQ(scq); const pass = (r.nudges.length === 0 && !r.thin) || scq.checkCount >= 1;
      dispatch({ type: 'scq', patch: { checkCount: scq.checkCount + 1, coachRead: pass ? 'The question follows from the situation and complication.' : scq.coachRead } });
      if (pass) say('pass', ['The situation sets the ground, the complication names the tension, and the question follows from them.']);
      else say('iterate', [r.reflect, ...r.nudges]);
    }, 900);
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
      <div className="exlayout">
        <div>
          <div className="scqgrid"><Cell f="S" word="Situation" /><Cell f="C" word="Complication" /><Cell f="Q" word="Question" /></div>
          <div className="derive"><Icon n="down" size={15} /> The problem statement is written straight from the SCQ above.</div>
          <div className={'problem' + (glow === 'P' ? ' glow' : '')}>
            <h4>Problem statement</h4>
            <textarea value={scq.problem} readOnly={playing} placeholder="In a sentence or two, what problem does this work solve?" onChange={e => dispatch({ type: 'scq', patch: { problem: e.target.value } })} />
          </div>
          <div className="actionbar" style={{ justifyContent: 'flex-start' }}>
            <button className={'continue' + (glow === 'check' ? ' glow' : '')} style={{ borderRadius: 26 }} onClick={() => !playing && check()}><Icon n="check" size={18} /> Check the draft</button>
          </div>
        </div>
        <div className="sources">
          <h4>Everything you need</h4>
          <button onClick={() => onOpenSource('proposal')}><Icon n="doc" size={16} /> Proposal</button>
          <button onClick={() => onOpenSource('brief')}><Icon n="doc" size={16} /> Context brief</button>
          <button onClick={() => onOpenSource('notes')}><Icon n="notes" size={16} /> Your notes</button>
        </div>
      </div>
      <CoachChat log={log} thinking={thinking} open={coachOpen} setOpen={setCoachOpen} />
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
  const [log, setLog] = useState([]);
  const [thinking, setThinking] = useState(false);
  const [coachOpen, setCoachOpen] = useState(true);
  const [draft, setDraft] = useState('');
  const ran = useRef(false);

  const setSubs = (arr) => dispatch({ type: 'branch', patch: { subclaims: arr } });
  const say = (verdict, lines) => setLog(l => [...l, { verdict, lines }]);
  const typeSub = async (text) => { setGlow(true); for (let i = 1; i <= text.length; i++) { setTyping(text.slice(0, i)); await wait(13); } await wait(90); };

  const demo = async () => {
    setPlaying(true); setLog([]); setThinking(false); setCoachOpen(true);
    dispatch({ type: 'branch', patch: { subclaims: [], coachRead: '', checkCount: 0, skipped: false } });
    await wait(500);
    await typeSub('Build a model of the whole system'); setSubs(['Build a model of the whole system']); setTyping(''); setGlow(false); await wait(400);
    setThinking(true); await wait(650); setThinking(false);
    say('iterate', [
      'That first one is a task, not a claim. A sub-claim should be something that is either true or false, so that evidence could test it.',
      'It also helps to have two or three, so that together they would make the branch hold.',
    ]);
    await wait(1400);
    setSubs([]); await wait(300);
    await typeSub('Demand is large enough to matter'); setSubs(['Demand is large enough to matter']); setTyping(''); await wait(300);
    await typeSub('The economics hold at the scale required'); setSubs(['Demand is large enough to matter', 'The economics hold at the scale required']); setTyping(''); await wait(300);
    await typeSub('The plan is deliverable within the timeframe'); setSubs(['Demand is large enough to matter', 'The economics hold at the scale required', 'The plan is deliverable within the timeframe']); setTyping(''); setGlow(false); await wait(400);
    setThinking(true); await wait(650); setThinking(false);
    say('pass', [
      'Each of these is a claim that could be proven wrong, and if all three held, the branch above would hold too.',
      'That is a testable branch.',
    ]);
    dispatch({ type: 'branch', patch: { coachRead: 'The sub-claims are statements, not questions, and at least one could be proven wrong.' } });
    await wait(500); setPlaying(false);
  };
  useEffect(() => {
    if (!inView || ran.current) return;
    ran.current = true;
    if (br.coachRead && br.subclaims.length) {
      setLog([{ verdict: 'pass', lines: ['Each of these is a claim that could be proven wrong, and if all three held, the branch above would hold too.', 'That is a testable branch.'] }]);
    } else demo();
  }, [inView]);

  const add = () => { const v = draft.trim(); if (!v) return; setSubs([...br.subclaims, v]); setDraft(''); };
  const del = (i) => setSubs(br.subclaims.filter((_, x) => x !== i));
  const check = () => {
    setThinking(true); setCoachOpen(true);
    setTimeout(() => {
      setThinking(false);
      const r = reviewBranch(br, ''); const pass = (r.nudges.length === 0 && !r.thin) || br.checkCount >= 1;
      dispatch({ type: 'branch', patch: { checkCount: br.checkCount + 1, coachRead: pass ? 'The sub-claims are testable.' : br.coachRead } });
      if (pass) say('pass', ['Each of these could be proven wrong, and together they would make the branch hold.']);
      else say('iterate', [r.reflect, ...r.nudges]);
    }, 900);
  };

  const branches = ['Branch 1', 'Your branch', 'Branch 3'];
  return (
    <div ref={wrap} style={{ position: 'relative' }}>
      <Sticker playing={playing} onReplay={demo} />
      <div className="branchex">
        {/* left: which branch you own */}
        <div className="branchex__tree">
          <div className="branchex__root">L1 hypothesis</div>
          <div className="branchex__stems">
            {branches.map((b, i) => (
              <div key={i} className={'branchex__chip' + (i === 1 ? ' mine' : '')}>
                {b}{i === 1 && <span className="branchex__arrow"><Icon n="right" size={16} /></span>}
              </div>
            ))}
          </div>
        </div>
        {/* right: the sub-claims that make your branch hold — these are its leaves */}
        <div className={'branchex__panel' + (glow ? ' glow' : '')}>
          <div className="branchex__h">Sub-claims under your branch</div>
          <p className="branchex__hint">For the branch to be true, what has to be true underneath it?</p>
          <ul className="branchex__list">
            <AnimatePresence>
              {br.subclaims.map((t, i) => <motion.li key={t + i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={spring.land}><span className="branchex__dot" />{t}{!playing && <span className="del" onClick={() => del(i)}>×</span>}</motion.li>)}
            </AnimatePresence>
          </ul>
          <div className="scqadd" style={{ padding: '6px 0 0' }}>
            <input value={playing ? typing : draft} readOnly={playing} placeholder="Add a sub-claim" onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} /><button onClick={() => !playing && add()}><Icon n="plus" size={16} /></button>
          </div>
          <button className="continue branchex__check" onClick={() => !playing && check()}><Icon n="check" size={17} /> Check the branch</button>
        </div>
      </div>
      <CoachChat log={log} thinking={thinking} open={coachOpen} setOpen={setCoachOpen} />
    </div>
  );
}

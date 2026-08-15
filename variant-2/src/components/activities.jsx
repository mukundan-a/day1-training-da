// The two hands-on exercises + the faked coach (build spec §5 D4/F4, §2.9, §7.3).
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon, Reveal, FenSlot } from './ui.jsx';
import { useStore } from '../store.jsx';
import { reviewSCQ, reviewBranch } from '../coach.js';
import { spring, dur } from '../motion.js';

function Sources({ onOpen }) {
  return (
    <div className="sources">
      <h4>Everything you need</h4>
      <button onClick={() => onOpen('proposal')}><Icon n="doc" size={16} /> Proposal</button>
      <button onClick={() => onOpen('brief')}><Icon n="doc" size={16} /> Context brief</button>
      <button onClick={() => onOpen('notes')}><Icon n="notes" size={16} /> Your notes</button>
    </div>
  );
}

function Coach({ result, passed }) {
  return (
    <Reveal className="coach">
      <div className="coach__h">
        <span className="coach__av">AI</span><span className="coach__nm">Coach</span>
        <span className="coach__fake">faked for the mockup</span>
      </div>
      <div className="coach__b">
        {result === 'thinking'
          ? <span className="typing"><motion.i animate={{ opacity: [.3, 1, .3] }} transition={{ duration: 1, repeat: Infinity }} /><motion.i animate={{ opacity: [.3, 1, .3] }} transition={{ duration: 1, repeat: Infinity, delay: .2 }} /><motion.i animate={{ opacity: [.3, 1, .3] }} transition={{ duration: 1, repeat: Infinity, delay: .4 }} /></span>
          : <>
              <motion.div className={'verdict ' + (passed ? 'pass' : 'iterate')} initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={spring.land}>
                {passed ? <><Icon n="check" size={14} /> Pass</> : 'One more pass'}
              </motion.div>
              <div className="msg">{result.open}</div>
              {result.reflect && <div className="msg refl">{result.reflect}</div>}
              {result.nudges && result.nudges.length > 0 && <div className="msg"><ul>{result.nudges.map((t, i) => <li key={i}>{t}</li>)}</ul></div>}
              <div className="msg" style={{ fontWeight: 600, color: passed ? '#1f7a3f' : 'var(--maroon)' }}>{result.close}</div>
            </>}
      </div>
    </Reveal>
  );
}

/* ---------------------------------------------------------------- SCQ (D4) */
export function SCQActivity({ onOpenSource, onPass }) {
  const { state, dispatch } = useStore();
  const scq = state.scq;
  const [drafts, setDrafts] = useState({ S: '', C: '', Q: '' });
  const [phase, setPhase] = useState('edit');
  const [result, setResult] = useState(null);
  const [passed, setPassed] = useState(scq.skipped ? false : scq.checkCount > 0 && !!scq.coachRead);

  const add = (k) => { const v = drafts[k].trim(); if (!v) return; dispatch({ type: 'scq', patch: { [k]: [...scq[k], v] } }); setDrafts(d => ({ ...d, [k]: '' })); };
  const del = (k, i) => dispatch({ type: 'scq', patch: { [k]: scq[k].filter((_, x) => x !== i) } });

  const check = () => {
    const count = scq.checkCount + 1;
    dispatch({ type: 'scq', patch: { checkCount: count } });
    setPhase('checking'); setResult('thinking');
    setTimeout(() => {
      const r = reviewSCQ(scq);
      const pass = r.nudges.length === 0 && !r.thin ? true : count >= 2;
      const open = 'Read it. Here’s what I’ve got.';
      const close = pass
        ? `Good enough to argue about, which is what a draft is for. Bring it to the kick-off.`
        : 'Closer. Fix that one thing and check it again.';
      const nudges = pass ? [] : (r.nudges.length ? r.nudges : (r.thin ? ['Does your Question fall out of your Situation and Complication, or is it arriving from somewhere else? Read it top to bottom once and check again.'] : []));
      setResult({ open, reflect: r.reflect, nudges, close });
      setPassed(pass); setPhase('feedback');
      if (pass) { dispatch({ type: 'scq', patch: { coachRead: 'Your situation sets the ground, the complication names the tension, and the question is real.' } }); onPass && onPass(); }
    }, 850);
  };

  const skip = () => { dispatch({ type: 'scq', patch: { skipped: true } }); onPass && onPass(); };
  const Cell = ({ k, word }) => (
    <div className="scqcell">
      <div className="scqcell__h"><span className="scqcell__L">{k}</span><span className="scqcell__w">{word}</span></div>
      <ul className="scqlist">
        {scq[k].length === 0 && <li className="seed"><FenSlot inline tag="seed">seeded from the proposal</FenSlot></li>}
        {scq[k].map((t, i) => <li key={i}>{t}<span className="del" onClick={() => del(k, i)}>×</span></li>)}
      </ul>
      <div className="scqadd">
        <input value={drafts[k]} placeholder="Add a bullet" onChange={e => setDrafts(d => ({ ...d, [k]: e.target.value }))} onKeyDown={e => e.key === 'Enter' && add(k)} />
        <button onClick={() => add(k)}><Icon n="plus" size={16} /></button>
      </div>
    </div>
  );

  return (
    <div>
      <Reveal><span className="turn"><motion.span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--maroon)' }} animate={{ opacity: [1, .3, 1] }} transition={{ duration: 1.6, repeat: Infinity }} /> Your turn</span></Reveal>
      <Reveal><p className="body mt16">Put bullets under each heading. A couple are filled in to get you moving. Add, change or delete anything. When it feels close enough to talk about, check it. Pull from your notes on the right if you want.</p></Reveal>
      <div className="reading" style={{ gridTemplateColumns: '1fr 210px', alignItems: 'start', marginTop: 24 }}>
        <div>
          <div className="scqgrid">
            <Cell k="S" word="Situation" /><Cell k="C" word="Complication" /><Cell k="Q" word="Question" />
          </div>
          <div className="problem">
            <h4>Problem statement</h4>
            <textarea value={scq.problem} placeholder="In a sentence or two, what problem does this work solve?" onChange={e => dispatch({ type: 'scq', patch: { problem: e.target.value } })} />
          </div>
          <div className="actionbar" style={{ justifyContent: 'flex-start' }}>
            <button className="continue" style={{ borderRadius: 26 }} onClick={check}><Icon n="check" size={18} /> Check my draft</button>
            {!passed && !scq.skipped && <button className="back" onClick={skip}>Skip for now</button>}
          </div>
          <AnimatePresence>{phase !== 'edit' && <Coach result={result} passed={passed} />}</AnimatePresence>
        </div>
        <Sources onOpen={onOpenSource} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- Branch (F4) */
export function BranchActivity({ onOpenSource, onPass }) {
  const { state, dispatch } = useStore();
  const br = state.branch;
  const [draft, setDraft] = useState('');
  const [phase, setPhase] = useState('edit');
  const [result, setResult] = useState(null);
  const [passed, setPassed] = useState(br.skipped ? false : !!br.coachRead);

  const add = () => { const v = draft.trim(); if (!v) return; dispatch({ type: 'branch', patch: { subclaims: [...br.subclaims, v] } }); setDraft(''); };
  const del = (i) => dispatch({ type: 'branch', patch: { subclaims: br.subclaims.filter((_, x) => x !== i) } });

  const check = () => {
    const count = br.checkCount + 1;
    dispatch({ type: 'branch', patch: { checkCount: count } });
    setPhase('checking'); setResult('thinking');
    setTimeout(() => {
      const r = reviewBranch(br, '');
      const pass = r.nudges.length === 0 && !r.thin ? true : count >= 2;
      setResult({
        open: 'I’m not checking whether these are right. I’m checking whether they’re claims we could test, and whether together they’d make the branch true.',
        reflect: r.reflect,
        nudges: pass ? [] : (r.nudges.length ? r.nudges : ['If every one of these were true, would the branch above have to be true? If there’s a gap, name the missing piece and check again.']),
        close: pass ? 'These hold together. Each one could be proven wrong, and if they all held, the branch would too. That’s a testable branch.' : 'Better. Tighten that and check again.',
      });
      setPassed(pass); setPhase('feedback');
      if (pass) { dispatch({ type: 'branch', patch: { coachRead: 'Your sub-claims are statements, not questions, and at least one could be proven wrong.' } }); onPass && onPass(); }
    }, 850);
  };
  const skip = () => { dispatch({ type: 'branch', patch: { skipped: true } }); onPass && onPass(); };

  return (
    <div>
      <Reveal className="claim" style={{ margin: '0 auto', maxWidth: 640 }}>
        <div className="k">L1 hypothesis</div>
        <div className="tx"><FenSlot inline tag="scaffold">the PD’s top-level claim</FenSlot></div>
      </Reveal>
      <Reveal style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 16 }}>
        {[0, 1, 2].map(i => <div key={i} className={'branchcard' + (i === 1 ? ' mine' : '')} style={{ width: 180, opacity: i === 1 ? 1 : 0.45 }}><div className="branchcard__h">Branch {i + 1}</div></div>)}
      </Reveal>
      <Reveal><span className="turn" style={{ marginTop: 20 }}><motion.span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--maroon)' }} animate={{ opacity: [1, .3, 1] }} transition={{ duration: 1.6, repeat: Infinity }} /> Your branch</span></Reveal>
      <Reveal><p className="body mt16">This branch is yours. Ask one question of it: for the branch to be true, what would have to be true underneath? Write each answer as a sub-claim. Add as many as you need. When you’ve got a set that holds together, check it.</p></Reveal>

      <div className="reading" style={{ gridTemplateColumns: '1fr 210px', alignItems: 'start', marginTop: 20 }}>
        <div>
          <ul className="scqlist" style={{ border: '1px solid var(--hair)', borderRadius: 10, padding: 12, minHeight: 60 }}>
            {br.subclaims.length === 0 && <li className="seed">No sub-claims yet. Add the first one below.</li>}
            {br.subclaims.map((t, i) => <li key={i}>{t}<span className="del" onClick={() => del(i)}>×</span></li>)}
          </ul>
          <div className="scqadd" style={{ padding: '10px 0' }}>
            <input style={{ maxWidth: 420 }} value={draft} placeholder="For the branch to be true, what has to be true?" onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
            <button onClick={add}><Icon n="plus" size={16} /></button>
          </div>
          <p className="muted" style={{ fontSize: 14 }}>Test each one: could evidence prove it wrong? If not, sharpen it.</p>
          <div className="actionbar" style={{ justifyContent: 'flex-start' }}>
            <button className="continue" style={{ borderRadius: 26 }} onClick={check}><Icon n="check" size={18} /> Check my branch</button>
            {!passed && !br.skipped && <button className="back" onClick={skip}>Skip for now</button>}
          </div>
          <AnimatePresence>{phase !== 'edit' && <Coach result={result} passed={passed} />}</AnimatePresence>
        </div>
        <Sources onOpenSource onOpen={onOpenSource} />
      </div>
    </div>
  );
}

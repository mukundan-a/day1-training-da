// Ghost-user simulations for the two exercises. A simulated cursor plays the
// whole interaction as a film: it types, hits Check, reads the coach, corrects,
// and passes. Then the real, seeded exercise is handed to the user.
// The typed text is generic method illustration (clearly a demo), never FEN
// content. Marked "Watch how it works".
import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Icon } from './ui.jsx';
import { spring, ease } from '../motion.js';

function Cursor({ p }) {
  return (
    <motion.div style={{ position: 'absolute', left: 0, top: 0, zIndex: 40, pointerEvents: 'none' }}
      animate={{ x: p.x, y: p.y }} transition={{ type: 'spring', stiffness: 170, damping: 20 }}>
      <motion.div key={p.click} initial={{ scale: 0.6, opacity: 0.5 }} animate={{ scale: 2.4, opacity: 0 }} transition={{ duration: 0.4 }}
        style={{ position: 'absolute', left: -10, top: -10, width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--pink)' }} />
      <svg width="22" height="22" viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 2px 3px rgba(65,2,30,.4))' }}>
        <path d="M5 3l14 7-6 2-2 6z" fill="#fff" stroke="var(--maroon)" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    </motion.div>
  );
}

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
                {state.pass ? <><Icon n="check" size={14} /> Pass</> : 'One more pass'}
              </motion.div>
              <div className="msg">{state.msg}</div>
            </>}
      </div>
    </motion.div>
  );
}

const DemoTag = () => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--pink)', background: 'var(--soft-wash)', border: '1px solid var(--soft)', borderRadius: 20, padding: '5px 14px' }}>
    <motion.span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--pink)' }} animate={{ opacity: [1, .3, 1] }} transition={{ duration: 1.4, repeat: Infinity }} /> Watch how it works
  </div>
);

/* shared driver */
function useDriver(wrapRef) {
  const [cursor, setCursor] = useState({ x: 40, y: 40, click: 0 });
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  const center = (ref, yCap = 26) => {
    const w = wrapRef.current.getBoundingClientRect(), r = ref.current.getBoundingClientRect();
    return { x: r.left - w.left + Math.min(r.width / 2, 120), y: r.top - w.top + Math.min(r.height / 2, yCap) };
  };
  const moveTo = async (ref) => { const t = center(ref); setCursor(c => ({ ...c, x: t.x, y: t.y })); await wait(680); };
  const click = async () => { setCursor(c => ({ ...c, click: c.click + 1 })); await wait(300); };
  return { cursor, wait, moveTo, click };
}

/* ------------------------------------------------------------------ SCQ sim */
export function GhostSCQ({ onTryIt }) {
  const wrap = useRef(null);
  const inView = useInView(wrap, { once: true, amount: 0.3 });
  const refs = { S: useRef(), C: useRef(), Q: useRef(), P: useRef(), check: useRef() };
  const { cursor, wait, moveTo, click } = useDriver(wrap);
  const [bul, setBul] = useState({ S: [], C: [], Q: [] });
  const [prob, setProb] = useState('');
  const [typing, setTyping] = useState({ f: null, t: '' });
  const [coach, setCoach] = useState(null);
  const [done, setDone] = useState(false);
  const started = useRef(false);

  const type = async (f, text) => { for (let i = 1; i <= text.length; i++) { setTyping({ f, t: text.slice(0, i) }); await wait(26); } await wait(220); };
  const add = async (f, text) => { await moveTo(refs[f]); await type(f, text); setBul(b => ({ ...b, [f]: [...b[f], text] })); setTyping({ f: null, t: '' }); await wait(260); };

  const run = async () => {
    setBul({ S: [], C: [], Q: [] }); setProb(''); setCoach(null); setDone(false);
    await wait(700);
    await add('S', 'What everyone already agrees on');
    await add('C', 'What just changed, and why it matters now');
    await add('Q', 'Look into the whole market');            // deliberately a topic
    await moveTo(refs.P); for (let i = 1; i <= 34; i++) { setProb('How should the client respond to the change?'.slice(0, i)); await wait(24); } await wait(300);
    await moveTo(refs.check); await click();
    setCoach('thinking'); await wait(1000);
    setCoach({ pass: false, msg: 'That last one is a topic, not a question. What does the client actually need decided? Try starting with "Should", "How much", or "Which".' });
    await wait(2200);
    // correct the Q
    await moveTo(refs.Q); await click(); setBul(b => ({ ...b, Q: [] })); await wait(300);
    await add('Q', 'Should the client change course?');
    await moveTo(refs.check); await click();
    setCoach('thinking'); await wait(1000);
    setCoach({ pass: true, msg: 'Good enough to argue about, which is what a draft is for. Your situation sets the ground, the complication names the tension, and that is a real question. Bring it to the kick-off.' });
    await wait(1200); setDone(true);
  };
  useEffect(() => { if (inView && !started.current) { started.current = true; run(); } }, [inView]);

  const Cell = ({ f, word }) => (
    <div className="scqcell" ref={refs[f]}>
      <div className="scqcell__h"><span className="scqcell__L">{f}</span><span className="scqcell__w">{word}</span></div>
      <ul className="scqlist">
        <AnimatePresence>
          {bul[f].map((t, i) => <motion.li key={i} initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={spring.land}>{t}</motion.li>)}
        </AnimatePresence>
      </ul>
      <div className="scqadd"><input readOnly value={typing.f === f ? typing.t : ''} placeholder="Add a bullet" /><button><Icon n="plus" size={16} /></button></div>
    </div>
  );

  return (
    <div ref={wrap} style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <DemoTag />
        {!done && <button className="back" onClick={() => setDone(true)}>Skip demo</button>}
      </div>
      <div className="scqgrid"><Cell f="S" word="Situation" /><Cell f="C" word="Complication" /><Cell f="Q" word="Question" /></div>
      <div className="problem" ref={refs.P}>
        <h4>Problem statement</h4>
        <div style={{ minHeight: 56, border: '1px solid var(--soft)', borderRadius: 6, padding: 12, fontSize: 16, background: '#fff', color: prob ? 'var(--grey)' : 'var(--grey-3)' }}>{prob || 'In a sentence or two, what problem does this work solve?'}</div>
      </div>
      <div className="actionbar" style={{ justifyContent: 'flex-start' }}>
        <button className="continue" style={{ borderRadius: 26 }} ref={refs.check}><Icon n="check" size={18} /> Check my draft</button>
      </div>
      <AnimatePresence>{coach && <Coach state={coach} />}</AnimatePresence>

      {!done && <Cursor p={cursor} />}

      <AnimatePresence>
        {done && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', gap: 14, alignItems: 'center', marginTop: 24 }}>
            <button className="continue" style={{ borderRadius: 26 }} onClick={onTryIt}>Now you try<Icon n="right" size={18} /></button>
            <button className="back" onClick={run}><Icon n="replay" size={16} /> Replay</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* --------------------------------------------------------------- Branch sim */
export function GhostBranch({ onTryIt }) {
  const wrap = useRef(null);
  const inView = useInView(wrap, { once: true, amount: 0.3 });
  const refs = { list: useRef(), add: useRef(), check: useRef() };
  const { cursor, wait, moveTo, click } = useDriver(wrap);
  const [subs, setSubs] = useState([]);
  const [typing, setTyping] = useState('');
  const [coach, setCoach] = useState(null);
  const [done, setDone] = useState(false);
  const started = useRef(false);

  const type = async (text) => { for (let i = 1; i <= text.length; i++) { setTyping(text.slice(0, i)); await wait(24); } await wait(200); };
  const add = async (text) => { await moveTo(refs.add); await type(text); setSubs(s => [...s, text]); setTyping(''); await wait(260); };

  const run = async () => {
    setSubs([]); setCoach(null); setDone(false);
    await wait(700);
    await add('Build a model of the whole system');        // a task, not a claim -> nudge
    await moveTo(refs.check); await click();
    setCoach('thinking'); await wait(1000);
    setCoach({ pass: false, msg: 'That is a thing to do, not a claim to test. Rewrite it as something that is either true or false, and add the other things that would have to hold.' });
    await wait(2400);
    await moveTo(refs.list); await click(); setSubs([]); await wait(300);
    await add('Demand is large enough to matter');
    await add('The economics hold at the scale required');
    await add('The plan is deliverable within the timeframe');
    await moveTo(refs.check); await click();
    setCoach('thinking'); await wait(1000);
    setCoach({ pass: true, msg: 'These hold together. Each one could be proven wrong, and if they all held, the branch would too. That is a testable branch.' });
    await wait(1200); setDone(true);
  };
  useEffect(() => { if (inView && !started.current) { started.current = true; run(); } }, [inView]);

  return (
    <div ref={wrap} style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <DemoTag />
        {!done && <button className="back" onClick={() => setDone(true)}>Skip demo</button>}
      </div>
      <div className="claim" style={{ margin: '0 auto 16px', maxWidth: 560 }}>
        <div className="k">L1 hypothesis</div>
        <div className="tx"><span className="inline-slot">the PD’s top-level claim</span></div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 20 }}>
        {[0, 1, 2].map(i => <div key={i} className={'branchcard' + (i === 1 ? ' mine' : '')} style={{ width: 180, opacity: i === 1 ? 1 : 0.4 }}><div className="branchcard__h">Branch {i + 1}</div></div>)}
      </div>
      <ul className="scqlist" ref={refs.list} style={{ border: '1px solid var(--hair)', borderRadius: 10, padding: 12, minHeight: 60, maxWidth: 560, margin: '0 auto' }}>
        <AnimatePresence>
          {subs.length === 0 && !typing && <li className="seed">For the branch to be true, what has to be true?</li>}
          {subs.map((t, i) => <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={spring.land}>{t}</motion.li>)}
        </AnimatePresence>
      </ul>
      <div className="scqadd" ref={refs.add} style={{ maxWidth: 560, margin: '0 auto', padding: '10px 0' }}>
        <input readOnly value={typing} placeholder="Add a sub-claim" style={{ maxWidth: 420 }} /><button><Icon n="plus" size={16} /></button>
      </div>
      <div className="actionbar" style={{ justifyContent: 'center' }}>
        <button className="continue" style={{ borderRadius: 26 }} ref={refs.check}><Icon n="check" size={18} /> Check my branch</button>
      </div>
      <AnimatePresence>{coach && <Coach state={coach} />}</AnimatePresence>

      {!done && <Cursor p={cursor} />}

      <AnimatePresence>
        {done && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', gap: 14, alignItems: 'center', justifyContent: 'center', marginTop: 24 }}>
            <button className="continue" style={{ borderRadius: 26 }} onClick={onTryIt}>Now you try<Icon n="right" size={18} /></button>
            <button className="back" onClick={run}><Icon n="replay" size={16} /> Replay</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

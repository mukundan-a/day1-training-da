// The two hero films (build spec §2.6, §2.7). Auto-play once on view.
// HeroA: the tree tips over into a workplan, then reads as a table of contents.
// HeroB: the problem statement transforms into the L1 hypothesis; stubs sprout.
// Content is placeholder throughout (scaffold slots, not invented FEN facts).
import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence, useInView, useReducedMotion, LayoutGroup } from 'framer-motion';
import { Icon, FenSlot } from './ui.jsx';
import { spring, ease, dur, stagger } from '../motion.js';

const Greek = ({ w = '80%', c = 'var(--soft)' }) => (
  <div style={{ height: 10, borderRadius: 4, background: c, width: w }} />
);

/* ------------------------------------------------------------------ HERO A */
export function HeroA({ compact = false, silent = false, userBranchLabel }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState('tree');   // tree | plan | toc
  const [owners, setOwners] = useState(false);
  const [pop, setPop] = useState(false);
  const timers = useRef([]);

  const run = () => {
    timers.current.forEach(clearTimeout); timers.current = [];
    setPhase('tree'); setOwners(false); setPop(false);
    const T = compact ? { plan: 1100, owners: 1500, pop: 1900, toc: 2600 } : { plan: 2000, owners: 3200, pop: 3900, toc: 4800 };
    const push = (fn, ms) => timers.current.push(setTimeout(fn, ms));
    push(() => setPhase('plan'), T.plan);
    push(() => setOwners(true), T.owners);
    if (!compact) push(() => setPop(true), T.pop);
    push(() => setPhase('toc'), T.toc);
  };
  useEffect(() => { if (inView) run(); return () => timers.current.forEach(clearTimeout); }, [inView]);

  const caption = phase === 'tree' ? 'Hypothesis tree' : phase === 'plan' ? 'Week-1 workplan' : 'Deliverable contents';
  const branches = [0, 1, 2];

  // reduced motion: stacked simultaneous view proving identity by layout
  if (reduce) return <ReducedHeroA ref={ref} userBranchLabel={userBranchLabel} />;

  return (
    <div className="herostage" ref={ref} style={{ minHeight: compact ? 300 : 500 }}>
      {!silent && <button className="replay" onClick={run}><Icon n="replay" size={14} /> Replay</button>}
      <LayoutGroup>
        <motion.div layout style={{ width: '100%', maxWidth: 900, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}
          animate={{ scale: phase === 'plan' ? [1, 1.04, 1] : 1 }} transition={{ duration: dur.slow, ease: ease.standard }}>

          {/* L1 claim: sits atop the tree, becomes the caption/title later */}
          <motion.div layout layoutId="heroA-l1" className="tree__l1" style={{ fontSize: phase === 'tree' ? 18 : 14, padding: phase === 'tree' ? '14px 26px' : '8px 18px' }}>
            {phase === 'toc' ? 'Report title' : userBranchLabel ? 'L1 hypothesis' : 'L1 hypothesis'}
          </motion.div>

          {phase === 'tree' && (
            <motion.div className="tree__branches" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: dur.base, ease: ease.entrance }}>
              {branches.map(i => (
                <motion.div key={i} layoutId={`ws-${i}`} className={'branchcard' + (i === 1 ? ' mine' : '')}
                  initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring.land, delay: 0.15 + i * 0.14 }}>
                  <div className="branchcard__h">{i === 1 && userBranchLabel ? userBranchLabel : `Branch ${i + 1}`}</div>
                  <ul><li><Greek w="85%" c="var(--soft-wash)" /></li><li><Greek w="60%" c="var(--soft-wash)" /></li></ul>
                </motion.div>
              ))}
            </motion.div>
          )}

          {phase === 'plan' && (
            <motion.div className="wptable wp-plan" layout>
              <div className="wprow head"><span>Workstream</span><span>Analyses</span><span>Owner</span><span>Weeks</span></div>
              {branches.map(i => (
                <motion.div key={i} className="wprow" layout initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring.land, delay: i * 0.08 }}>
                  <motion.div layoutId={`ws-${i}`} className="cell" style={{ fontWeight: 700, color: 'var(--maroon)' }}>
                    {i === 1 && userBranchLabel ? userBranchLabel : `Branch ${i + 1}`}
                  </motion.div>
                  <div className="cell"><Greek w="80%" /></div>
                  <div className="cell">
                    <AnimatePresence>
                      {owners && (
                        <motion.span className="owner" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                          transition={{ ...spring.land, delay: [0.18, 0.42, 0][i] }}>
                          <motion.span className="av" animate={i === 2 ? { boxShadow: ['0 0 0 0 rgba(211,97,143,0)', '0 0 0 6px rgba(211,97,143,.35)', '0 0 0 0 rgba(211,97,143,0)'] } : {}} transition={{ duration: 1 }}>
                            {i === 2 ? 'PM' : '?'}
                          </motion.span>
                          <span style={{ fontSize: 13, color: i === 2 ? 'var(--pink)' : 'var(--grey-3)', fontStyle: 'italic' }}>{i === 2 ? 'PM takes it' : 'owner'}</span>
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="cell"><Greek w="50%" /></div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {phase === 'toc' && (
            <motion.div className="wptable wp-toc" layout>
              <div className="wprow head"><span>§</span><span>Section</span><span>What it shows</span></div>
              {branches.map(i => (
                <motion.div key={i} className="wprow" layout initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring.land, delay: i * 0.08 }}>
                  <motion.span className="secn" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ ...spring.land, delay: i * 0.08 + 0.15 }}>{i + 1}</motion.span>
                  <motion.div layoutId={`ws-${i}`} className="cell" style={{ fontWeight: 700, color: 'var(--maroon)', fontFamily: 'var(--display)', fontSize: 18 }}>
                    {i === 1 && userBranchLabel ? userBranchLabel : `Section ${i + 1}`}
                  </motion.div>
                  <div className="cell"><Greek w="85%" /></div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </LayoutGroup>

      <AnimatePresence>
        {pop && phase === 'plan' && (
          <motion.div className="popnote" initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} transition={spring.hero}>
            Where the project allows it, the PM matches workstreams to what people want to get better at. The plan gets the work done and grows the team.
          </motion.div>
        )}
      </AnimatePresence>

      {!silent && <motion.div className="herocap" key={caption} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: dur.base, ease: ease.entrance }}>{caption}</motion.div>}
    </div>
  );
}

const ReducedHeroA = React.forwardRef(({ userBranchLabel }, ref) => (
  <div ref={ref} className="herostage">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, width: '100%' }}>
      {['Hypothesis tree', 'Week-1 workplan', 'Deliverable contents'].map((t, k) => (
        <div key={k} style={{ border: '1px solid var(--hair)', borderRadius: 10, padding: 16 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>{t}</div>
          {[0, 1, 2].map(i => <div key={i} className="branchcard" style={{ marginBottom: 8 }}><div className="branchcard__h">{k === 0 ? `Branch ${i + 1}` : k === 1 ? 'Workstream' : `Section ${i + 1}`}</div></div>)}
        </div>
      ))}
    </div>
    <div className="herocap">One object, three ways.</div>
  </div>
));

/* ------------------------------------------------------------------ HERO B */
export function HeroB() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduce = useReducedMotion();
  const [state, setState] = useState('problem'); // problem | hyp
  const [showDef, setShowDef] = useState(false);
  const [stubs, setStubs] = useState(false);
  const timers = useRef([]);

  const run = () => {
    timers.current.forEach(clearTimeout); timers.current = [];
    setState('problem'); setShowDef(false); setStubs(false);
    const push = (fn, ms) => timers.current.push(setTimeout(fn, ms));
    push(() => setState('hyp'), 1400);
    push(() => setShowDef(true), 2400);
    push(() => setStubs(true), 3000);
  };
  useEffect(() => { if (inView) run(); return () => timers.current.forEach(clearTimeout); }, [inView]);

  return (
    <div className="herostage" ref={ref} style={{ minHeight: 460 }}>
      <button className="replay" onClick={run}><Icon n="replay" size={14} /> Replay</button>

      <motion.div layout className={'claim' + (state === 'hyp' ? ' hyp' : '')} transition={reduce ? { duration: dur.fast } : spring.hero}
        animate={{ scale: state === 'hyp' ? [1, 0.97, 1] : 1 }}>
        <div className="k">{state === 'hyp' ? 'Top-level hypothesis' : 'Shared problem'}</div>
        <div className="tx">
          {state === 'problem'
            ? <FenSlot inline tag="scaffold">the shared problem statement</FenSlot>
            : <FenSlot inline tag="scaffold">the L1 hypothesis, stated as a flat claim</FenSlot>}
        </div>
      </motion.div>

      <AnimatePresence>
        {showDef && (
          <motion.div className="def" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: dur.base, ease: ease.editorial }}>
            <h4>What a hypothesis is</h4>
            <p>A hypothesis is the team’s best answer to the client’s question, written before the research and stated precisely enough that evidence could prove it wrong. If nothing could disprove it, it is an opinion rather than a hypothesis.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="tree__branches" style={{ maxWidth: 720 }}>
        {[0, 1, 2].map(i => (
          <motion.div key={i} className="branchcard" initial={{ opacity: 0, scale: 0.6, y: 10 }}
            animate={stubs ? { opacity: 0.9, scale: 1, y: 0 } : { opacity: 0, scale: 0.6, y: 10 }}
            transition={{ ...spring.sprout, delay: i * 0.14 }}>
            <div className="branchcard__h">Branch {i + 1}</div>
          </motion.div>
        ))}
      </div>
      {stubs && <motion.p className="muted center" style={{ fontSize: 15, maxWidth: 520 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        For the hypothesis to hold, the claims underneath it have to hold as well. Those claims are the branches, and the next screen drills one of them down.
      </motion.p>}
    </div>
  );
}

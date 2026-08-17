// The hero films and the real hypothesis tree (build spec §2.6, §2.7).
// HypTree: a proper left-to-right issue tree. A single root claim forks into
//   branches, and each branch forks into the sub-claims that would make it hold,
//   with elbow connectors that draw themselves like a tree growing.
// HeroA: the tree tips over into a week-1 workplan (workstream / owner / source
//   of insight), then reads as the deliverable's table of contents.
// HeroB: the shared problem statement becomes the top-level hypothesis, and the
//   tree grows out beneath it.
// Content is placeholder throughout (scaffold slots, not invented FEN facts).
import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence, useInView, useReducedMotion, LayoutGroup } from 'framer-motion';
import { Icon, FenSlot } from './ui.jsx';
import { spring, ease, dur, stagger } from '../motion.js';

const Greek = ({ w = '80%', c = 'var(--soft)' }) => (
  <div style={{ height: 9, borderRadius: 4, background: c, width: w }} />
);

/* A horizontal elbow connector: one point on the left forks to n points on the
   right. It stretches to the height of its flex row, so the right stubs land on
   the vertical centres of n equal-height sibling slots. Draws itself on view. */
function Fork({ n = 3, delay = 0, draw = true, color = 'var(--pink)', width = 46 }) {
  const ys = Array.from({ length: n }, (_, i) => ((i + 0.5) / n) * 100);
  const spine = n > 1 ? `M24,${ys[0]} V${ys[n - 1]} ` : '';
  const stubs = ys.map(y => `M24,${y} H60`).join(' ');
  const d = `M0,50 H24 ${spine}${stubs}`;
  return (
    <svg className="fork" width={width} viewBox="0 0 60 100" preserveAspectRatio="none" aria-hidden>
      <motion.path d={d} stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round"
        initial={draw ? { pathLength: 0, opacity: 0 } : false}
        whileInView={draw ? { pathLength: 1, opacity: 0.9 } : { opacity: 0.9 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, ease: ease.standard, delay }} />
    </svg>
  );
}

const box = (v, delay, extra = {}) => ({
  initial: { opacity: 0, scale: 0.9, x: -8 },
  whileInView: { opacity: 1, scale: 1, x: 0 },
  viewport: { once: true },
  transition: { ...spring.land, delay },
  ...extra,
});

/* The real hypothesis tree. Root claim -> `branches` sub-hypotheses -> `leaves`
   testable claims each. Placeholder text: the shape is the point, not the words. */
export function HypTree({ highlight = 1, compact = false, animate = true, leafLabels = null }) {
  const reduce = useReducedMotion();
  const draw = animate && !reduce;
  const branches = [0, 1, 2];
  const leaves = compact ? [0, 1] : [0, 1];
  return (
    <div className="hyptree-scroll">
      <div className="hyptree">
        {/* root */}
        <div className="htcol htcol--root">
          <motion.div className="htnode htnode--root" {...box(0, draw ? 0.1 : 0)}>
            <span className="htk">L1 hypothesis</span>
            <span className="httx">the top-level claim</span>
          </motion.div>
        </div>

        <Fork n={3} draw={draw} delay={0.35} />

        {/* branches, each with its own fork into leaves */}
        <div className="htcol htcol--branches">
          {branches.map(b => (
            <div className="htgroup" key={b}>
              <motion.div className={'htnode htnode--branch' + (b === highlight ? ' mine' : '')} {...box(0, draw ? 0.6 + b * 0.12 : 0)}>
                <span className="htk">{b === highlight ? 'your branch' : 'sub-hypothesis'}</span>
                <Greek w="82%" c="var(--soft)" />
              </motion.div>
              <Fork n={2} draw={draw} delay={0.95 + b * 0.12} width={36} />
              <div className="htcol htcol--leaves">
                {leaves.map(l => (
                  <motion.div className="htnode htnode--leaf" key={l} {...box(0, draw ? 1.25 + b * 0.12 + l * 0.08 : 0)}>
                    <span className="htk-sm">testable claim</span>
                    <Greek w={l ? '64%' : '78%'} c="var(--soft-wash)" />
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ PIPELINE FILM
   The opening loop: the day's artefacts, stylised the way they really look, one
   after another — SCQ, the hypothesis tree (a tree, not a table), the workplan,
   the deck, the executive summary. Auto-plays and loops inside the FilmFrame. */
const Bar = ({ w = '80%', c = 'var(--hair-2)', h = 8 }) => <div style={{ height: h, width: w, borderRadius: 4, background: c }} />;

const SCQMini = () => (
  <div className="pf__art" style={{ gap: 12 }}>
    {[['S', 'Situation'], ['C', 'Complication'], ['Q', 'Question']].map(([l, n], i) => (
      <motion.div key={l} style={{ display: 'flex', alignItems: 'center', gap: 12 }}
        initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring.land, delay: 0.1 + i * 0.12 }}>
        <span style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--soft)', color: 'var(--maroon)', fontFamily: 'var(--display)', fontWeight: 700, fontSize: 17, display: 'grid', placeItems: 'center', flexShrink: 0 }}>{l}</span>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}><Bar w="90%" /><Bar w={i === 2 ? '55%' : '70%'} /></div>
      </motion.div>
    ))}
  </div>
);

const TreeMini = () => (
  <div className="pf__art" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <motion.div style={{ background: 'var(--maroon)', color: '#fff', fontFamily: 'var(--display)', fontWeight: 700, fontSize: 12, padding: '8px 12px', borderRadius: 8, whiteSpace: 'nowrap' }}
        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={spring.land}>L1 hypothesis</motion.div>
      <Fork n={3} width={40} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[0, 1, 2].map(i => (
          <motion.div key={i} style={{ background: '#fff', border: '1px solid ' + (i === 1 ? 'var(--pink)' : 'var(--hair)'), borderRadius: 8, padding: '8px 12px', minWidth: 120, boxShadow: 'var(--shadow-card)' }}
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring.land, delay: 0.25 + i * 0.12 }}>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', color: i === 1 ? 'var(--maroon)' : 'var(--pink)', marginBottom: 5 }}>{i === 1 ? 'your branch' : 'sub-hypothesis'}</div>
            <Bar w="80%" c="var(--soft)" h={7} />
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

const PlanMini = () => (
  <div className="pf__art" style={{ gap: 0 }}>
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1.2fr', gap: 12, padding: '0 4px 8px', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--grey-3)' }}>
      <span>Workstream</span><span>Owner</span><span>Source</span>
    </div>
    {[0, 1, 2].map(i => (
      <motion.div key={i} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1.2fr', gap: 12, alignItems: 'center', padding: '10px 4px', borderTop: '1px solid var(--hair-2)' }}
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring.land, delay: 0.1 + i * 0.1 }}>
        <span style={{ fontWeight: 700, color: 'var(--maroon)', fontSize: 12 }}>{i === 1 ? 'Your branch' : 'Branch ' + (i + 1)}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 18, height: 18, borderRadius: '50%', background: i === 2 ? 'var(--maroon)' : 'var(--soft)', color: i === 2 ? '#fff' : 'var(--maroon)', fontSize: 8, fontWeight: 700, display: 'grid', placeItems: 'center' }}>{i === 2 ? 'PM' : '?'}</span></span>
        <Bar w="70%" />
      </motion.div>
    ))}
  </div>
);

const DeckMini = () => (
  <div className="pf__art" style={{ alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ position: 'relative', width: 200, height: 130 }}>
      {[0, 1, 2].map(i => (
        <motion.div key={i} style={{ position: 'absolute', left: i * 16, top: i * 12, width: 170, height: 106, background: '#fff', border: '1px solid var(--hair)', borderRadius: 8, boxShadow: 'var(--shadow-lift)', padding: 14 }}
          initial={{ opacity: 0, y: 14, rotate: (i - 1) * 2 }} animate={{ opacity: 1, y: 0, rotate: (i - 1) * 2 }} transition={{ ...spring.land, delay: 0.1 + i * 0.12 }}>
          {i === 2 && <><div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: 'var(--pink)', letterSpacing: '.06em' }}>Deck</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 10 }}><Bar w="80%" c="var(--soft)" /><Bar w="60%" /><Bar w="70%" /></div></>}
        </motion.div>
      ))}
    </div>
  </div>
);

const SummaryMini = () => (
  <div className="pf__art" style={{ alignItems: 'center', justifyContent: 'center' }}>
    <motion.div style={{ width: 180, background: '#fff', border: '1px solid var(--hair)', borderRadius: 8, boxShadow: 'var(--shadow-lift)', padding: 16 }}
      initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={spring.hero}>
      <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 12, color: 'var(--maroon)' }}>Executive summary</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '10px 0' }}>{['90%', '75%', '82%'].map((w, k) => <Bar key={k} w={w} />)}</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 34 }}>
        {[16, 26, 20, 32, 24].map((h, k) => <motion.div key={k} style={{ width: 14, borderRadius: 3, background: k === 3 ? 'var(--pink)' : 'var(--soft)' }} initial={{ height: 0 }} animate={{ height: h }} transition={{ ...spring.land, delay: 0.2 + k * 0.06 }} />)}
      </div>
    </motion.div>
  </div>
);

const ARTS = [
  { key: 'scq', label: 'Situation · Complication · Question', el: <SCQMini /> },
  { key: 'tree', label: 'The hypothesis tree', el: <TreeMini /> },
  { key: 'plan', label: 'The week-1 workplan', el: <PlanMini /> },
  { key: 'deck', label: 'The deck', el: <DeckMini /> },
  { key: 'summary', label: 'The executive summary', el: <SummaryMini /> },
];

export function PipelineFilm() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, amount: 0.3 });
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!inView || reduce) return;
    const t = setTimeout(() => setI(k => (k + 1) % ARTS.length), i === 0 ? 1500 : 1900);
    return () => clearTimeout(t);
  }, [i, inView, reduce]);

  return (
    <div className="pf" ref={ref}>
      <div className="pf__stage">
        <AnimatePresence mode="wait">
          <motion.div key={ARTS[i].key} className="pf__frame"
            initial={{ opacity: 0, y: 16, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -16, scale: 0.96 }}
            transition={reduce ? { duration: 0.3 } : spring.hero}>
            {ARTS[i].el}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="pf__meta">
        <AnimatePresence mode="wait">
          <motion.span key={ARTS[i].key} className="pf__label" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: dur.fast }}>{ARTS[i].label}</motion.span>
        </AnimatePresence>
        <div className="pf__dots">{ARTS.map((_, k) => <button key={k} className={k === i ? 'on' : ''} onClick={() => setI(k)} aria-label={ARTS[k].label} />)}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ HERO A
   The tree becomes the workplan becomes the table of contents. The three
   branch labels keep their identity across the morph (shared layoutId). */
export function HeroA({ compact = false, silent = false, userBranchLabel }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState('tree');   // tree | plan | toc
  const [owners, setOwners] = useState(false);
  const timers = useRef([]);

  const run = () => {
    timers.current.forEach(clearTimeout); timers.current = [];
    setPhase('tree'); setOwners(false);
    const T = compact ? { plan: 850, owners: 1350, toc: 2050 } : { plan: 1300, owners: 2000, toc: 2800 };
    const push = (fn, ms) => timers.current.push(setTimeout(fn, ms));
    push(() => setPhase('plan'), T.plan);
    push(() => setOwners(true), T.owners);
    push(() => setPhase('toc'), T.toc);
  };
  useEffect(() => { if (inView) run(); return () => timers.current.forEach(clearTimeout); }, [inView]);

  const caption = phase === 'tree' ? 'Hypothesis tree' : phase === 'plan' ? 'Week-1 workplan' : 'Deliverable contents';
  const branches = [0, 1, 2];
  const label = (i) => i === 1 && userBranchLabel ? userBranchLabel : `Branch ${i + 1}`;

  // Under reduced motion we keep the sequence but drop large transforms: the
  // phases cross-fade instead of the boxes flying and morphing. Everyone still
  // sees the film play; nobody gets a dead static grid.
  const lid = (name) => (reduce ? undefined : name);
  const soft = { duration: 0.4, ease: ease.standard };

  return (
    <div className="herostage" ref={ref} style={{ minHeight: compact ? 300 : 460 }}>
      {!silent && <button className="replay" onClick={run}><Icon n="replay" size={14} /> Replay</button>}
      <LayoutGroup>
        <motion.div layout={!reduce} style={{ width: '100%', maxWidth: 860, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}
          animate={{ scale: !reduce && phase === 'plan' ? [1, 1.03, 1] : 1 }} transition={{ duration: dur.slow, ease: ease.standard }}>

          {/* the root claim rides through every phase */}
          <motion.div layout={!reduce} layoutId={lid('heroA-l1')} className="tree__l1" style={{ fontSize: phase === 'tree' ? 15 : 13, padding: phase === 'tree' ? '11px 22px' : '7px 16px' }}>
            {phase === 'toc' ? 'Report title' : 'L1 hypothesis'}
          </motion.div>

          {phase === 'tree' && (
            <>
              <VFork n={3} reduce={reduce} />
              <motion.div className="tree__branches" style={{ maxWidth: 720 }}>
                {branches.map(i => (
                  <motion.div key={i} layoutId={lid(`ws-${i}`)} className={'branchcard' + (i === 1 ? ' mine' : '')}
                    initial={{ opacity: 0, y: reduce ? 0 : -12 }} animate={{ opacity: 1, y: 0 }} transition={reduce ? soft : { ...spring.land, delay: 0.35 + i * 0.14 }}>
                    <div className="branchcard__h">{label(i)}</div>
                    <ul><li><Greek w="85%" c="var(--soft-wash)" /></li><li><Greek w="60%" c="var(--soft-wash)" /></li></ul>
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}

          {phase === 'plan' && (
            <motion.div className="wptable wp-plan" layout={!reduce} initial={reduce ? { opacity: 0 } : false} animate={reduce ? { opacity: 1 } : {}} transition={soft}>
              <div className="wprow head"><span>Workstream</span><span>Owner</span><span>Source of insight</span></div>
              {branches.map(i => (
                <motion.div key={i} className="wprow" layout={!reduce} initial={{ opacity: 0, y: reduce ? 0 : -10 }} animate={{ opacity: 1, y: 0 }} transition={reduce ? soft : { ...spring.land, delay: i * 0.08 }}>
                  <motion.div layoutId={lid(`ws-${i}`)} className="cell" style={{ fontWeight: 700, color: 'var(--maroon)' }}>{label(i)}</motion.div>
                  <div className="cell">
                    <AnimatePresence>
                      {owners && (
                        <motion.span className="owner" initial={{ opacity: 0, scale: reduce ? 1 : 0.7 }} animate={{ opacity: 1, scale: 1 }}
                          transition={reduce ? soft : { ...spring.land, delay: [0.18, 0.42, 0][i] }}>
                          <motion.span className="av" animate={!reduce && i === 2 ? { boxShadow: ['0 0 0 0 rgba(211,97,143,0)', '0 0 0 6px rgba(211,97,143,.35)', '0 0 0 0 rgba(211,97,143,0)'] } : {}} transition={{ duration: 1 }}>
                            {i === 2 ? 'PM' : '?'}
                          </motion.span>
                          <span style={{ fontSize: 12, color: i === 2 ? 'var(--pink)' : 'var(--grey-3)', fontStyle: 'italic' }}>{i === 2 ? 'PM takes it' : 'a teammate'}</span>
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="cell"><Greek w="72%" /></div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {phase === 'toc' && (
            <motion.div className="wptable wp-toc" layout={!reduce} initial={reduce ? { opacity: 0 } : false} animate={reduce ? { opacity: 1 } : {}} transition={soft}>
              <div className="wprow head"><span>§</span><span>Section</span><span>What it shows</span></div>
              {branches.map(i => (
                <motion.div key={i} className="wprow" layout={!reduce} initial={{ opacity: 0, y: reduce ? 0 : -10 }} animate={{ opacity: 1, y: 0 }} transition={reduce ? soft : { ...spring.land, delay: i * 0.08 }}>
                  <motion.span className="secn" initial={{ scale: reduce ? 1 : 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={reduce ? soft : { ...spring.land, delay: i * 0.08 + 0.15 }}>{i + 1}</motion.span>
                  <motion.div layoutId={lid(`ws-${i}`)} className="cell" style={{ fontWeight: 700, color: 'var(--maroon)', fontFamily: 'var(--display)', fontSize: 16 }}>
                    {i === 1 && userBranchLabel ? userBranchLabel : `Section ${i + 1}`}
                  </motion.div>
                  <div className="cell"><Greek w="85%" /></div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </LayoutGroup>

      {!silent && <motion.div className="herocap" key={caption} initial={{ opacity: 0, y: reduce ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: dur.base, ease: ease.entrance }}>{caption}</motion.div>}
    </div>
  );
}

/* a small vertical fork: one point on top forks down to n points */
function VFork({ n = 3, width = 320, reduce = false }) {
  const xs = Array.from({ length: n }, (_, i) => ((i + 0.5) / n) * 100);
  const spine = n > 1 ? `M${xs[0]},24 H${xs[n - 1]} ` : '';
  const stubs = xs.map(x => `M${x},24 V60`).join(' ');
  const d = `M50,0 V24 ${spine}${stubs}`;
  return (
    <svg width={width} height="30" viewBox="0 0 100 60" preserveAspectRatio="none" style={{ maxWidth: width, margin: '-2px 0' }} aria-hidden>
      <motion.path d={d} stroke="var(--pink)" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round"
        initial={reduce ? { opacity: 0.9 } : { pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.9 }} transition={{ duration: reduce ? 0 : 0.5, ease: ease.standard }} />
    </svg>
  );
}

/* ------------------------------------------------------------------ HERO B
   The problem statement becomes the top-level hypothesis, then the tree grows. */
export function HeroB() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduce = useReducedMotion();
  const [state, setState] = useState('problem'); // problem | hyp | tree
  const [showDef, setShowDef] = useState(false);
  const timers = useRef([]);

  const run = () => {
    timers.current.forEach(clearTimeout); timers.current = [];
    setState('problem'); setShowDef(false);
    const push = (fn, ms) => timers.current.push(setTimeout(fn, ms));
    push(() => setState('hyp'), 800);
    push(() => setShowDef(true), 1500);
    push(() => setState('tree'), 2100);
  };
  useEffect(() => { if (inView) run(); return () => timers.current.forEach(clearTimeout); }, [inView]);

  return (
    <div className="herostage" ref={ref} style={{ minHeight: 480 }}>
      <button className="replay" onClick={run}><Icon n="replay" size={14} /> Replay</button>

      <AnimatePresence>
        {state !== 'tree' && (
          <motion.div layout key="claim" className={'claim' + (state !== 'problem' ? ' hyp' : '')} transition={reduce ? { duration: dur.fast } : spring.hero}
            animate={{ scale: state === 'hyp' ? [1, 0.97, 1] : 1 }} exit={{ opacity: 0, y: 12, scale: 0.9, transition: { duration: dur.fast } }}>
            <div className="k">{state !== 'problem' ? 'Top-level hypothesis' : 'Shared problem'}</div>
            <div className="tx">
              {state === 'problem'
                ? <FenSlot inline tag="scaffold">the shared problem statement</FenSlot>
                : <FenSlot inline tag="scaffold">the L1 hypothesis, stated as a flat claim</FenSlot>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDef && state === 'hyp' && (
          <motion.div className="def" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, height: 0 }} transition={{ duration: dur.base, ease: ease.editorial }}>
            <h4>What a hypothesis is</h4>
            <p>A hypothesis is the team’s best answer to the client’s question, written before the research and stated precisely enough that evidence could prove it wrong. If nothing could disprove it, it is an opinion rather than a hypothesis.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {state === 'tree' && (
          <motion.div style={{ width: '100%' }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: dur.base, ease: ease.entrance }}>
            <HypTree highlight={1} />
            <motion.p className="muted center" style={{ fontSize: 14, maxWidth: 560, margin: '18px auto 0' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}>
              For the hypothesis to hold, the claims underneath it have to hold as well. Those claims are the branches, and the next screen drills one of them down.
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

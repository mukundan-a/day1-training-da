// Boot — cinematic and fluid. The screen powers on, an orrery of rings and
// orbiting nodes spins up (the moving parts of the day), then everything
// collapses inward and blooms into the notch mark as the wordmark wipes in.
// All transform/opacity, so it stays smooth. ~2.6s to Begin, skippable, once/tab.
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Notch } from './ui.jsx';
import { ease, spring } from '../motion.js';

const W = '#F6DFE9';
const P = '#D3618F';

// a node that orbits the centre at `r` px, one full turn every `dur`s
function Orbit({ r, dur, dir = 1, size = 10, delay = 0, color = W, converge }) {
  return (
    <motion.div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}
      animate={{ rotate: dir * 360 }} transition={{ duration: dur, repeat: Infinity, ease: 'linear' }}>
      <motion.div style={{ position: 'absolute', width: size, height: size, borderRadius: '50%', background: color, boxShadow: `0 0 12px ${color}`, transform: `translateX(${r}px)` }}
        initial={{ opacity: 0, scale: 0 }}
        animate={converge ? { opacity: 0, scale: 0, transform: 'translateX(0px)' } : { opacity: 1, scale: 1, transform: `translateX(${r}px)` }}
        transition={converge ? { duration: 0.5, ease: ease.standard } : { ...spring.land, delay }} />
    </motion.div>
  );
}

function Ring({ r, dur, dir = 1, converge, delay = 0, dash = '3 8' }) {
  const c = 120;
  return (
    <motion.svg width="240" height="240" viewBox="0 0 240 240" style={{ position: 'absolute' }}
      animate={{ rotate: dir * 360, scale: converge ? 0.1 : 1, opacity: converge ? 0 : 1 }}
      transition={converge ? { duration: 0.55, ease: ease.standard } : { rotate: { duration: dur, repeat: Infinity, ease: 'linear' }, scale: { ...spring.hero, delay }, opacity: { duration: 0.4, delay } }}
      initial={{ scale: 0.6, opacity: 0 }}>
      <circle cx={c} cy={c} r={r} fill="none" stroke={W} strokeOpacity="0.4" strokeWidth="1.4" strokeDasharray={dash} strokeLinecap="round" />
    </motion.svg>
  );
}

export function Boot({ onBegin }) {
  const [phase, setPhase] = useState(0); // 0 power-on · 1 orrery · 2 converge · 3 resolve
  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 450),
      setTimeout(() => setPhase(2), 1850),
      setTimeout(() => setPhase(3), 2350),
    ];
    return () => t.forEach(clearTimeout);
  }, []);
  const converge = phase >= 2;

  return (
    <motion.div className="boot" exit={{ opacity: 0, filter: 'blur(8px)' }} transition={{ duration: 0.55 }}
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: '#000', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>

      {/* cinematic burgundy field */}
      <motion.div style={{ position: 'absolute', inset: 0 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, ease: ease.entrance }}>
        <motion.div style={{ position: 'absolute', inset: '-20%', background: 'radial-gradient(58% 48% at 50% 44%, #7a1240 0%, #4d0a28 46%, #250110 100%)' }}
          animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} />
        {/* slow rotating conic glow */}
        <motion.div style={{ position: 'absolute', left: '50%', top: '44%', width: 620, height: 620, marginLeft: -310, marginTop: -310, borderRadius: '50%', background: 'conic-gradient(from 0deg, rgba(211,97,143,.18), transparent 30%, rgba(136,25,70,.22) 55%, transparent 80%, rgba(211,97,143,.18))', filter: 'blur(24px)' }}
          animate={{ rotate: 360, opacity: converge ? 0 : 1 }} transition={{ rotate: { duration: 16, repeat: Infinity, ease: 'linear' }, opacity: { duration: 0.5 } }} />
        <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 240px 70px rgba(15,0,8,.8)' }} />
      </motion.div>

      <div style={{ position: 'relative', textAlign: 'center', width: 360 }}>
        <div style={{ height: 240, display: 'grid', placeItems: 'center', position: 'relative' }}>
          {/* power-on flash */}
          <AnimatePresence>
            {phase === 0 && (
              <motion.div key="on" initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }} exit={{ opacity: 0, scale: 1.4 }}
                transition={{ duration: 0.45, ease: ease.entrance }} style={{ width: 130, height: 2, background: W, boxShadow: '0 0 20px ' + W }} />
            )}
          </AnimatePresence>

          {/* orrery */}
          {phase >= 1 && (
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
              <Ring r={100} dur={22} dir={1} converge={converge} delay={0} dash="2 10" />
              <Ring r={72} dur={16} dir={-1} converge={converge} delay={0.06} dash="3 7" />
              <Ring r={44} dur={11} dir={1} converge={converge} delay={0.12} dash="1 6" />
              <Orbit r={100} dur={22} dir={1} size={8} delay={0.15} color={W} converge={converge} />
              <Orbit r={72} dur={16} dir={-1} size={11} delay={0.22} color={P} converge={converge} />
              <Orbit r={44} dur={11} dir={1} size={7} delay={0.29} color={W} converge={converge} />
              {/* pulsing core that becomes the mark */}
              {!converge && (
                <motion.div style={{ position: 'absolute', width: 14, height: 14, borderRadius: '50%', background: W, boxShadow: '0 0 20px ' + W }}
                  initial={{ scale: 0, opacity: 0 }} animate={{ scale: [1, 1.25, 1], opacity: 1 }} transition={{ scale: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }, opacity: { duration: 0.4 } }} />
              )}
            </div>
          )}

          {/* resolve: notch blooms from the collapsed core */}
          <AnimatePresence>
            {phase >= 3 && (
              <motion.div key="mark" initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }} transition={spring.hero} style={{ color: W, position: 'absolute' }}>
                <motion.div style={{ position: 'absolute', inset: -34, borderRadius: '50%', border: '1.5px solid rgba(246,223,233,.5)' }}
                  initial={{ scale: 0.4, opacity: 0.9 }} animate={{ scale: 1.8, opacity: 0 }} transition={{ duration: 0.9, ease: ease.entrance }} />
                <motion.div style={{ position: 'absolute', inset: -60, borderRadius: '50%', background: 'radial-gradient(circle, rgba(246,223,233,.35), transparent 70%)' }}
                  initial={{ scale: 0.2, opacity: 0.8 }} animate={{ scale: 1.4, opacity: 0 }} transition={{ duration: 1, ease: ease.entrance }} />
                <Notch style={{ transform: 'scale(2.7)', color: W }} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* wordmark — clip wipe */}
        <div style={{ height: 44, overflow: 'hidden' }}>
          <AnimatePresence>
            {phase >= 3 && (
              <motion.div key="wm" initial={{ clipPath: 'inset(0 100% 0 0)', y: 6 }} animate={{ clipPath: 'inset(0 0% 0 0)', y: 0 }} transition={{ delay: 0.2, duration: 0.6, ease: ease.standard }}
                style={{ color: '#fff', fontFamily: 'var(--display)', fontWeight: 700, fontSize: 42, letterSpacing: '-.02em' }}>Day 1 Craft</motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {phase >= 3 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.45 }} style={{ marginTop: 34 }}>
              <div style={{ color: 'rgba(246,223,233,0.72)', fontSize: 15, marginBottom: 20 }}>The first day of a project, start to finish.</div>
              <motion.button onClick={onBegin} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                style={{ background: '#fff', color: 'var(--maroon)', fontSize: 16, fontWeight: 700, padding: '14px 38px', borderRadius: 30, boxShadow: '0 8px 30px rgba(0,0,0,.35)' }}>Begin</motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {phase < 3 && <button onClick={onBegin} style={{ position: 'absolute', bottom: 28, right: 32, color: 'rgba(246,223,233,0.6)', fontSize: 13, letterSpacing: '.03em' }}>Skip</button>}
    </motion.div>
  );
}

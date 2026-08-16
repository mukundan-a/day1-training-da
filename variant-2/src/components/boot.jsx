// Boot — short and abstract (~2.4s to Begin). The screen powers on, a single
// luminous gesture draws itself (one stroke branching, the whole day compressed
// into one motion), then it resolves to the notch mark and wordmark. Skippable,
// once per tab.
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Notch } from './ui.jsx';
import { ease, spring } from '../motion.js';

const W = '#F6DFE9';

export function Boot({ onBegin }) {
  const [phase, setPhase] = useState(0); // 0 power-on · 1 gesture · 2 resolve
  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1650),
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  return (
    <motion.div className="boot" exit={{ opacity: 0, filter: 'blur(8px)' }} transition={{ duration: 0.55 }}
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: '#000', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>

      {/* breathing burgundy field */}
      <motion.div style={{ position: 'absolute', inset: 0 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, ease: ease.entrance }}>
        <motion.div style={{ position: 'absolute', inset: '-20%', background: 'radial-gradient(60% 50% at 50% 42%, #7a1240 0%, #4d0a28 45%, #2c0114 100%)' }}
          animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} />
        <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 240px 60px rgba(20,0,10,.75)' }} />
      </motion.div>

      <div style={{ position: 'relative', textAlign: 'center', width: 360 }}>
        <div style={{ height: 150, display: 'grid', placeItems: 'center' }}>
          <AnimatePresence mode="wait">
            {phase === 0 ? (
              <motion.div key="on" initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: ease.entrance }} style={{ width: 120, height: 2, background: W, boxShadow: '0 0 18px ' + W }} />
            ) : phase === 1 ? (
              <motion.svg key="gesture" width="150" height="120" viewBox="0 0 150 120" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.4 }} style={{ filter: 'drop-shadow(0 0 12px rgba(246,223,233,.45))' }}>
                {/* one continuous gesture: a stem that splits — the day, in one stroke */}
                <motion.path d="M20 100 C 40 70, 55 66, 75 60 M75 60 C 100 52, 108 34, 112 18 M75 60 C 98 62, 118 70, 132 86 M75 60 L 75 60"
                  stroke={W} strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.95 }} transition={{ duration: 1.05, ease: ease.standard }} />
                {[[112, 18], [132, 86], [20, 100]].map(([cx, cy], i) => (
                  <motion.circle key={i} cx={cx} cy={cy} r="3.4" fill={W}
                    initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ ...spring.land, delay: 0.7 + i * 0.12 }} />
                ))}
              </motion.svg>
            ) : (
              <motion.div key="mark" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={spring.hero} style={{ color: W, position: 'relative' }}>
                <motion.div style={{ position: 'absolute', inset: -28, borderRadius: '50%', border: '1px solid rgba(246,223,233,.4)' }}
                  initial={{ scale: 0.5, opacity: 0.8 }} animate={{ scale: 1.6, opacity: 0 }} transition={{ duration: 0.9, ease: ease.entrance }} />
                <Notch style={{ transform: 'scale(2.6)', color: W }} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div style={{ height: 44 }}>
          <AnimatePresence>
            {phase === 2 && (
              <motion.div key="wm" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5, ease: ease.entrance }}
                style={{ color: '#fff', fontFamily: 'var(--display)', fontWeight: 700, fontSize: 42, letterSpacing: '-.02em' }}>Day 1 Craft</motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {phase === 2 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.45 }} style={{ marginTop: 38 }}>
              <div style={{ color: 'rgba(246,223,233,0.75)', fontSize: 15, marginBottom: 20 }}>The first day of a project, start to finish.</div>
              <motion.button onClick={onBegin} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                style={{ background: '#fff', color: 'var(--maroon)', fontSize: 16, fontWeight: 700, padding: '14px 36px', borderRadius: 30, boxShadow: '0 8px 30px rgba(0,0,0,.35)' }}>Begin</motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {phase < 2 && <button onClick={onBegin} style={{ position: 'absolute', bottom: 28, right: 32, color: 'rgba(246,223,233,0.6)', fontSize: 13, letterSpacing: '.03em' }}>Skip</button>}
    </motion.div>
  );
}

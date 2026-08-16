// Cinematic boot (a "sexy laptop boot" for Day 1 Craft). The screen powers on
// from black, a core object is drawn through the whole pipeline on Dalberg
// burgundy, resolves into the notch mark and wordmark, then reveals Begin.
// Skippable. Plays once per session.
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Notch } from './ui.jsx';
import { ease, spring } from '../motion.js';

const W = '#F6DFE9';           // soft line on burgundy
const line = (props) => ({ stroke: W, strokeWidth: 2.4, fill: 'none', strokeLinecap: 'round', ...props });

// each form is a tiny white line-glyph; they are drawn in sequence
const GLYPHS = [
  { label: 'A question', el: (
    <svg width="120" height="120" viewBox="0 0 120 120"><circle cx="60" cy="60" r="40" style={line()} />
      <path d="M50 48c0-8 20-8 20 2 0 8-10 6-10 16" style={line()} /><circle cx="60" cy="82" r="2.4" fill={W} /></svg>) },
  { label: 'An SCQ', el: (
    <svg width="150" height="120" viewBox="0 0 150 120">{[30, 60, 90].map((y, i) => <g key={i}><rect x="20" y={y - 12} width="110" height="20" rx="5" style={line()} /><text x="30" y={y + 3} fill={W} fontSize="13" fontFamily="serif">{'SCQ'[i]}</text></g>)}</svg>) },
  { label: 'A problem statement', el: (
    <svg width="160" height="120" viewBox="0 0 160 120"><rect x="20" y="46" width="120" height="28" rx="8" style={line({ fill: 'rgba(246,223,233,0.12)' })} /><line x1="34" y1="60" x2="126" y2="60" style={line({ strokeWidth: 1.6 })} /></svg>) },
  { label: 'A hypothesis tree', el: (
    <svg width="170" height="120" viewBox="0 0 170 120"><rect x="55" y="16" width="60" height="20" rx="6" style={line({ fill: 'rgba(246,223,233,0.15)' })} />
      <path d="M85 36v18M85 54H40v14M85 54h45v14M85 54v14" style={line({ strokeWidth: 1.8 })} />
      {[40, 85, 130].map(x => <rect key={x} x={x - 16} y="70" width="32" height="18" rx="5" style={line()} />)}</svg>) },
  { label: 'A workplan', el: (
    <svg width="170" height="120" viewBox="0 0 170 120"><rect x="20" y="24" width="130" height="72" rx="6" style={line()} />
      {[46, 66, 86].map(y => <line key={y} x1="20" y1={y} x2="150" y2={y} style={line({ strokeWidth: 1.4 })} />)}<line x1="95" y1="24" x2="95" y2="96" style={line({ strokeWidth: 1.4 })} /></svg>) },
  { label: 'A deck', el: (
    <svg width="170" height="120" viewBox="0 0 170 120">{[0, 1, 2].map(i => <rect key={i} x={40 + i * 14} y={30 + i * 8} width="80" height="52" rx="6" style={line({ fill: i === 2 ? 'rgba(246,223,233,0.12)' : 'none' })} />)}</svg>) },
  { label: 'An exec summary', el: (
    <svg width="150" height="120" viewBox="0 0 150 120"><rect x="35" y="18" width="80" height="90" rx="6" style={line()} />
      {[36, 50, 64, 78, 92].map((y, i) => <line key={y} x1="48" y1={y} x2={i % 2 ? 96 : 104} y2={y} style={line({ strokeWidth: 1.6 })} />)}</svg>) },
];

export function Boot({ onBegin }) {
  const [step, setStep] = useState(-1);   // -1 = power-on beat
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (step === -1) { const t = setTimeout(() => setStep(0), 900); return () => clearTimeout(t); }
    if (step >= GLYPHS.length) { const t = setTimeout(() => setDone(true), 650); return () => clearTimeout(t); }
    const t = setTimeout(() => setStep(s => s + 1), 900);
    return () => clearTimeout(t);
  }, [step]);

  const gi = Math.min(Math.max(step, 0), GLYPHS.length - 1);

  return (
    <motion.div className="boot" exit={{ opacity: 0, filter: 'blur(8px)' }} transition={{ duration: 0.7 }}
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: '#000', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>

      {/* power-on: black lifts into a breathing burgundy field */}
      <motion.div style={{ position: 'absolute', inset: 0 }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.1, ease: ease.entrance }}>
        <motion.div style={{ position: 'absolute', inset: '-20%', background: 'radial-gradient(60% 50% at 50% 38%, #7a1240 0%, #4d0a28 45%, #2c0114 100%)' }}
          animate={{ scale: [1, 1.06, 1], opacity: [0.9, 1, 0.9] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
        {/* drifting orbs */}
        <motion.div style={{ position: 'absolute', width: 340, height: 340, borderRadius: '50%', left: '18%', top: '20%', background: 'radial-gradient(circle, rgba(211,97,143,.22), transparent 70%)', filter: 'blur(20px)' }}
          animate={{ x: [0, 40, 0], y: [0, -24, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', right: '14%', bottom: '16%', background: 'radial-gradient(circle, rgba(136,25,70,.30), transparent 70%)', filter: 'blur(24px)' }}
          animate={{ x: [0, -32, 0], y: [0, 26, 0] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }} />
        {/* vignette */}
        <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 240px 60px rgba(20,0,10,.75)' }} />
      </motion.div>

      <div style={{ position: 'relative', textAlign: 'center', width: 380 }}>
        <div style={{ height: 156, display: 'grid', placeItems: 'center', position: 'relative' }}>
          <AnimatePresence mode="wait">
            {step === -1 ? (
              <motion.div key="on" initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: ease.entrance }}
                style={{ width: 120, height: 2, background: W, boxShadow: '0 0 18px ' + W }} />
            ) : !done ? (
              <motion.div key={step} style={{ position: 'relative', filter: 'drop-shadow(0 0 12px rgba(246,223,233,.35))' }}
                initial={{ opacity: 0, scale: 0.9, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 1.08, y: -10 }}
                transition={{ duration: 0.5, ease: ease.standard }}>
                {/* draw-on wipe */}
                <motion.div initial={{ clipPath: 'inset(0 100% 0 0)' }} animate={{ clipPath: 'inset(0 0% 0 0)' }} transition={{ duration: 0.6, ease: ease.standard }}>
                  {GLYPHS[gi].el}
                </motion.div>
                {/* light sweep */}
                <motion.div style={{ position: 'absolute', top: 0, bottom: 0, width: 60, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.5), transparent)', mixBlendMode: 'screen' }}
                  initial={{ left: '-30%' }} animate={{ left: '120%' }} transition={{ duration: 0.9, ease: 'easeInOut', delay: 0.15 }} />
              </motion.div>
            ) : (
              <motion.div key="mark" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={spring.hero} style={{ color: W, position: 'relative' }}>
                <motion.div style={{ position: 'absolute', inset: -30, borderRadius: '50%', border: '1px solid rgba(246,223,233,.4)' }}
                  initial={{ scale: 0.4, opacity: 0.8 }} animate={{ scale: 1.6, opacity: 0 }} transition={{ duration: 1.1, ease: ease.entrance }} />
                <Notch style={{ transform: 'scale(2.6)', color: W }} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div style={{ height: 42 }}>
          <AnimatePresence mode="wait">
            {step >= 0 && !done ? (
              <motion.div key={'l' + step} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.92, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35 }}
                style={{ color: W, fontSize: 18, letterSpacing: '.02em' }}>
                {GLYPHS[gi].label}
              </motion.div>
            ) : done ? (
              <motion.div key="wm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6, ease: ease.entrance }}
                style={{ color: '#fff', fontFamily: 'var(--display)', fontSize: 44, letterSpacing: '-.02em' }}>Day 1 Craft</motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* progress ticks */}
        {!done && step >= 0 && (
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 28 }}>
            {GLYPHS.map((_, i) => <div key={i} style={{ width: 18, height: 3, borderRadius: 2, background: i <= step ? W : 'rgba(246,223,233,0.22)', transition: 'background .4s', boxShadow: i === step ? '0 0 8px ' + W : 'none' }} />)}
          </div>
        )}

        <AnimatePresence>
          {done && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5 }} style={{ marginTop: 42 }}>
              <div style={{ color: 'rgba(246,223,233,0.75)', fontSize: 15, marginBottom: 22 }}>The first day of a project, start to finish.</div>
              <motion.button onClick={onBegin} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                style={{ background: '#fff', color: 'var(--maroon)', fontSize: 16, fontWeight: 700, padding: '14px 36px', borderRadius: 30, boxShadow: '0 8px 30px rgba(0,0,0,.35)' }}>Begin</motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!done && <button onClick={onBegin} style={{ position: 'absolute', bottom: 28, right: 32, color: 'rgba(246,223,233,0.6)', fontSize: 13, letterSpacing: '.03em' }}>Skip</button>}
    </motion.div>
  );
}

// Cinematic boot (a "sexy laptop boot" for Day 1 Craft). One core object morphs
// through the whole pipeline on Dalberg burgundy, resolves into the notch mark
// and wordmark, then reveals Begin. Skippable. Plays once per session.
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Notch } from './ui.jsx';
import { ease, spring } from '../motion.js';

const W = '#F6DFE9';           // soft line on burgundy
const line = (props) => ({ stroke: W, strokeWidth: 2.4, fill: 'none', strokeLinecap: 'round', ...props });

// each form is a tiny white line-glyph; they morph in sequence
const GLYPHS = [
  { label: 'A question', el: (
    <svg width="120" height="120" viewBox="0 0 120 120"><circle cx="60" cy="60" r="40" style={line()} />
      <path d="M50 48c0-8 20-8 20 2 0 8-10 6-10 16" style={line()} /><circle cx="60" cy="82" r="2.4" fill={W} /></svg>) },
  { label: 'An SCQ', el: (
    <svg width="150" height="120" viewBox="0 0 150 120">{[30, 60, 90].map((y, i) => <g key={i}><rect x="20" y={y - 12} width="110" height="20" rx="5" style={line()} /><text x="30" y={y + 3} fill={W} fontSize="13" fontFamily="serif">{'SCQ'[i]}</text></g>)}</svg>) },
  { label: 'A problem statement', el: (
    <svg width="160" height="120" viewBox="0 0 160 120"><rect x="20" y="46" width="120" height="28" rx="8" style={line({ fill: 'rgba(246,223,233,0.12)' })} /><line x1="34" y1="60" x2="126" y2="60" style={line({ strokeWidth: 1.6 })} /></svg>) },
  { label: 'A hypothesis', el: (
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
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (step >= GLYPHS.length) { const t = setTimeout(() => setDone(true), 500); return () => clearTimeout(t); }
    const t = setTimeout(() => setStep(s => s + 1), step === 0 ? 700 : 760);
    return () => clearTimeout(t);
  }, [step]);

  return (
    <motion.div className="boot" exit={{ opacity: 0, filter: 'blur(6px)' }} transition={{ duration: 0.6 }}
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'var(--maroon-deep)', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
      {/* subtle burgundy gradient wash */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 90% at 50% 30%, #6a0f35 0%, #41021E 70%)' }} />

      <div style={{ position: 'relative', textAlign: 'center', width: 360 }}>
        <div style={{ height: 150, display: 'grid', placeItems: 'center' }}>
          <AnimatePresence mode="wait">
            {!done ? (
              <motion.div key={step} initial={{ opacity: 0, scale: 0.86, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 1.08, y: -10 }}
                transition={{ duration: 0.5, ease: ease.standard }}>
                {(GLYPHS[Math.min(step, GLYPHS.length - 1)]).el}
              </motion.div>
            ) : (
              <motion.div key="mark" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={spring.hero} style={{ color: W }}>
                <Notch style={{ transform: 'scale(2.4)', color: W }} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div style={{ height: 40 }}>
          <AnimatePresence mode="wait">
            {!done ? (
              <motion.div key={'l' + step} initial={{ opacity: 0 }} animate={{ opacity: 0.9 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}
                style={{ color: W, fontSize: 17, letterSpacing: '.02em' }}>
                {(GLYPHS[Math.min(step, GLYPHS.length - 1)]).label}
              </motion.div>
            ) : (
              <motion.div key="wm" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6, ease: ease.entrance }}
                style={{ color: '#fff', fontFamily: 'var(--display)', fontSize: 40, letterSpacing: '-.02em' }}>Day 1 Craft</motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* progress ticks */}
        {!done && (
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 28 }}>
            {GLYPHS.map((_, i) => <div key={i} style={{ width: 16, height: 3, borderRadius: 2, background: i <= step ? W : 'rgba(246,223,233,0.25)', transition: 'background .3s' }} />)}
          </div>
        )}

        <AnimatePresence>
          {done && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5 }} style={{ marginTop: 40 }}>
              <div style={{ color: 'rgba(246,223,233,0.75)', fontSize: 15, marginBottom: 20 }}>The first day of a project, start to finish.</div>
              <button onClick={onBegin} style={{ background: '#fff', color: 'var(--maroon)', fontSize: 16, fontWeight: 700, padding: '14px 34px', borderRadius: 30 }}>Begin</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!done && <button onClick={onBegin} style={{ position: 'absolute', bottom: 28, right: 32, color: 'rgba(246,223,233,0.6)', fontSize: 13, letterSpacing: '.03em' }}>Skip</button>}
    </motion.div>
  );
}

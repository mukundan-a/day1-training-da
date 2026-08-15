// App shell (build spec §3.6, §4). Deliberately quiet: hairlines and 12-13px
// labels. The only kinetic maroon is the stage notch-wipe.
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Notch, Icon, ArtefactFrame } from './ui.jsx';
import { STAGES, SCENES, DOCS, stageOf } from '../data.js';
import { spring, ease, dur } from '../motion.js';
import { useStore } from '../store.jsx';

export function TopRail({ onJump, onMap }) {
  const { state } = useStore();
  const curStage = stageOf(state.currentSceneId)?.key;
  const curIdx = STAGES.findIndex(s => s.key === curStage);
  return (
    <div className="toprail">
      <div className="toprail__brand" onClick={() => onJump('welcome')}>
        <Notch style={{ width: 22 }} />
        <span className="wm">Day 1 Craft</span>
      </div>
      <div className="track">
        {STAGES.map((s, i) => {
          const locked = !state.unlockedStages.includes(s.key);
          const cls = i < curIdx ? 'done' : i === curIdx ? 'current' : locked ? 'locked' : '';
          return (
            <React.Fragment key={s.key}>
              {i > 0 && <div className="track__line" />}
              <button className={'track__seg ' + cls} disabled={locked} onClick={() => !locked && onJump(s.key)}>
                <span className="track__node">
                  {i === curIdx && <motion.span style={{ position: 'absolute', inset: -5, borderRadius: '50%', background: 'var(--soft)', zIndex: -1 }}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }} />}
                </span>
                <span className="track__label">{s.railName}</span>
              </button>
            </React.Fragment>
          );
        })}
      </div>
      <button className="track__map" onClick={onMap}>Map</button>
    </div>
  );
}

export function SceneHeader({ scene, onMap }) {
  const stage = STAGES.find(s => s.key === scene.stageKey);
  const chipCls = scene.chip === 'Watch' ? 'chip chip--watch' : 'chip';
  return (
    <div className="scenehead">
      <div className="scenehead__row">
        <span className="scenehead__over" onClick={onMap}>{stage.name}</span>
        <span className={chipCls}>{scene.chip}</span>
      </div>
      <h1 className="scenehead__title">{scene.title}</h1>
    </div>
  );
}

export function Spine({ onBack, canBack, onNext, nextLabel, nextSub, nextDisabled, terminal, onRestart }) {
  return (
    <div className="spine">
      {canBack
        ? <button className="back" onClick={onBack}><Icon n="left" size={16} /><span className="bl">Back</span></button>
        : <span />}
      {terminal
        ? <button className="continue" onClick={onRestart} style={{ background: '#fff', color: 'var(--maroon)', border: '1px solid var(--hair)', boxShadow: 'var(--shadow)' }}>Back to start</button>
        : <button className="continue" onClick={onNext} disabled={nextDisabled}>
            <span>{nextLabel || 'Continue'}{nextSub && <><br /><small>{nextSub}</small></>}</span>
            <Icon n="right" size={18} />
          </button>}
    </div>
  );
}

export function NotchWipe({ show }) {
  // stepped notch-profile panel sweeps across; the one sanctioned kinetic maroon
  return (
    <AnimatePresence>
      {show && (
        <motion.div className="notchwipe"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
          initial={{ x: '-100%' }} animate={{ x: '0%' }} exit={{ x: '100%' }}
          transition={{ duration: 0.52, ease: ease.standard, exit: { duration: 0.42, ease: ease.exit } }} />
      )}
    </AnimatePresence>
  );
}

export function MapOverlay({ open, onClose, onJump }) {
  const { state } = useStore();
  const curStage = stageOf(state.currentSceneId)?.key;
  if (!open) return null;
  return (
    <AnimatePresence>
      <motion.div className="scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <div className="mapmodal" onClick={onClose}>
        <motion.div className="mapcard" onClick={e => e.stopPropagation()}
          initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ ...spring.hero }}>
          <h2>The five stages</h2>
          <p className="muted" style={{ fontSize: 15 }}>Jump back to anything you have seen. Forward opens as you go.</p>
          <div className="mapgrid">
            {STAGES.map((s, i) => {
              const locked = !state.unlockedStages.includes(s.key);
              const current = s.key === curStage;
              const scenes = SCENES.filter(x => x.stageKey === s.key);
              return (
                <button key={s.key} className={'mapstage' + (locked ? ' locked' : '') + (current ? ' current' : '')}
                  disabled={locked} onClick={() => { if (!locked) { onJump(s.key); onClose(); } }}>
                  <div className="mn">Stage {i + 1}{locked ? ' · locked' : current ? ' · you are here' : state.visited[scenes[scenes.length - 1].id] ? ' · done' : ''}</div>
                  <div className="mt">{s.name}</div>
                  <div className="mp">{s.purpose}</div>
                  <div className="mtime">{s.time}</div>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// Right-edge strip + drawer (Docs / Notes / Comments) — one open at a time
export function RightRail({ mode, setMode, onOpenDoc }) {
  const { state, dispatch } = useStore();
  const [note, setNote] = useState('');
  return (
    <>
      <div className="railstrip">
        {[['docs', 'doc', 'Docs', DOCS.length], ['notes', 'notes', 'Notes', state.notes.length], ['comments', 'chat', 'Talk', state.comments.length]].map(([k, ic, lbl, badge]) => (
          <button key={k} onClick={() => setMode(mode === k ? null : k)} aria-pressed={mode === k}
            style={mode === k ? { color: 'var(--maroon)', background: 'var(--soft-wash)' } : null}>
            <Icon n={ic} size={18} />
            <span className="lbl">{lbl}</span>
            {badge > 0 && <span className="badge">{badge}</span>}
          </button>
        ))}
      </div>
      <AnimatePresence>
        {mode && (
          <motion.aside className="drawer" initial={{ x: 380 }} animate={{ x: 0 }} exit={{ x: 380 }} transition={spring.ui}>
            <div className="drawer__h">
              <h3>{mode === 'docs' ? 'Docs' : mode === 'notes' ? 'Your notes' : 'Comments'}</h3>
              <button className="drawer__x" onClick={() => setMode(null)}><Icon n="close" size={16} /></button>
            </div>
            <div className="drawer__b">
              {mode === 'docs' && DOCS.map(d => (
                <button key={d.id} className="docrow" onClick={() => onOpenDoc && onOpenDoc(d.id)}>
                  <span className={'docrow__ic ' + d.kind}>{d.kind.toUpperCase()}</span>
                  <span><span className="docrow__nm">{d.name}</span><span className="docrow__desc">{d.desc}</span></span>
                </button>
              ))}
              {mode === 'notes' && (
                <>
                  <p className="muted" style={{ fontSize: 14, marginBottom: 12 }}>Notes you take while reading come back when you draft your SCQ.</p>
                  <textarea style={{ width: '100%', border: '1px solid var(--hair)', borderRadius: 8, padding: 10, minHeight: 70, fontSize: 15 }}
                    value={note} onChange={e => setNote(e.target.value)} placeholder="Jot anything that might shape the question." />
                  <button className="continue" style={{ width: '100%', justifyContent: 'center', marginTop: 8, borderRadius: 10 }}
                    onClick={() => { if (note.trim()) { dispatch({ type: 'addNote', sceneTag: state.currentSceneId, text: note.trim() }); setNote(''); } }}>Add</button>
                  <div style={{ marginTop: 16 }}>
                    {state.notes.length === 0 && <p className="muted" style={{ fontSize: 14, fontStyle: 'italic' }}>No notes yet.</p>}
                    {state.notes.map(n => <div key={n.id} className="notechip"><span>{n.text}</span></div>)}
                  </div>
                </>
              )}
              {mode === 'comments' && (
                <p className="muted" style={{ fontSize: 14 }}>Reviewer comments. Hover any block and click the pink dot to leave a note on the storyline itself. (Comment mode is off by default so it never blocks the walk-through.)</p>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

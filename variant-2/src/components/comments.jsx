// Reviewer comments, available on every scene. Each comment carries structured
// metadata (stage, scene, the nearest heading, a category, a timestamp and its
// position) so the full set can be grouped, filtered and exported to JSON/CSV
// for querying later. Click anywhere on a scene in comment mode to drop a pin.
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from './ui.jsx';
import { useStore } from '../store.jsx';
import { useUI } from './frame.jsx';
import { SCENES, STAGES } from '../data.js';
import { spring } from '../motion.js';

export const CATEGORIES = ['Day 1 step', 'Training design', 'Copy', 'Other'];

// nearest heading above the click, for a human-readable anchor label
function anchorAt(container, clientY) {
  const heads = Array.from(container.querySelectorAll('h1, h2, h3, .beathead__title, .lead, .display, .scenehead__title'));
  let best = null;
  for (const h of heads) {
    const r = h.getBoundingClientRect();
    if (r.top <= clientY + 4) { if (!best || r.top > best.top) best = { top: r.top, text: h.textContent.trim() }; }
  }
  return best ? best.text.slice(0, 80) : '';
}

export function CommentLayer({ sceneId }) {
  const { state, dispatch } = useStore();
  const { commentMode } = useUI();
  const [draft, setDraft] = useState(null);
  const [text, setText] = useState('');
  const [cat, setCat] = useState(CATEGORIES[0]);
  const [openId, setOpenId] = useState(null);
  const mine = state.comments.filter(c => c.sceneId === sceneId);
  const scene = SCENES.find(s => s.id === sceneId);

  const onClick = (e) => {
    if (!commentMode) return;
    if (e.target.closest('.cpin') || e.target.closest('.cpop')) return;
    const box = e.currentTarget.getBoundingClientRect();
    setDraft({ x: ((e.clientX - box.left) / box.width) * 100, y: ((e.clientY - box.top) / box.height) * 100, anchor: anchorAt(e.currentTarget, e.clientY) });
    setText(''); setCat(CATEGORIES[0]); setOpenId(null);
  };
  const save = () => {
    if (!text.trim() || !draft) return;
    dispatch({ type: 'addComment', comment: {
      id: 'c' + Date.now(), sceneId, sceneTitle: scene?.title || sceneId, stageKey: scene?.stageKey || '',
      category: cat, anchor: draft.anchor, x: Math.round(draft.x * 10) / 10, y: Math.round(draft.y * 10) / 10,
      text: text.trim(), resolved: false, ts: Date.now(),
    } });
    setDraft(null); setText('');
  };

  return (
    <>
      {commentMode && <div style={{ position: 'absolute', inset: 0, zIndex: 25, cursor: 'crosshair' }} onClick={onClick} />}

      {mine.map((c, idx) => (
        <button key={c.id} className="cpin" style={{ left: c.x + '%', top: c.y + '%', zIndex: 26 }} onClick={(e) => { e.stopPropagation(); setOpenId(openId === c.id ? null : c.id); setDraft(null); }}>
          <span className="cpin__n">{idx + 1}</span>
          <Icon n="pin" size={26} fill="var(--pink)" style={{ color: c.resolved ? 'var(--grey-3)' : 'var(--pink)' }} />
          {openId === c.id && (
            <div className="cpop" style={pop(c.x, c.y)} onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--pink)', marginBottom: 4 }}>{c.category}</div>
              <div style={{ fontSize: 14, color: 'var(--grey)' }}>{c.text}</div>
              <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                <button style={mini} onClick={() => dispatch({ type: 'updateComment', id: c.id, patch: { resolved: !c.resolved } })}>{c.resolved ? 'Reopen' : 'Resolve'}</button>
                <button style={mini} onClick={() => dispatch({ type: 'removeComment', id: c.id })}>Delete</button>
              </div>
            </div>
          )}
        </button>
      ))}

      <AnimatePresence>
        {draft && (
          <motion.div className="cpop" style={pop(draft.x, draft.y)} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} onClick={e => e.stopPropagation()}>
            {draft.anchor && <div style={{ fontSize: 11, color: 'var(--grey-3)', marginBottom: 6 }}>On: {draft.anchor}</div>}
            <textarea autoFocus value={text} onChange={e => setText(e.target.value)} placeholder="Leave a note on the storyline"
              style={{ width: '100%', border: '1px solid var(--hair)', borderRadius: 8, padding: 8, fontSize: 14, minHeight: 54, resize: 'vertical' }} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, margin: '8px 0' }}>
              {CATEGORIES.map(c => <button key={c} onClick={() => setCat(c)} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20, border: '1px solid ' + (cat === c ? 'var(--pink)' : 'var(--hair)'), background: cat === c ? 'var(--pink)' : '#fff', color: cat === c ? '#fff' : 'var(--grey-2)' }}>{c}</button>)}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="continue" style={{ borderRadius: 20, padding: '7px 14px', fontSize: 13, background: 'var(--pink)' }} onClick={save}>Save</button>
              <button style={mini} onClick={() => setDraft(null)}>Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const pop = (x, y) => ({ position: 'absolute', left: x + '%', top: `calc(${y}% + 14px)`, transform: 'translateX(-50%)', width: 250, background: '#fff', border: '1px solid var(--hair)', borderRadius: 12, boxShadow: 'var(--shadow-lift)', padding: 14, zIndex: 30 });
const mini = { fontSize: 12, color: 'var(--grey-3)' };

/* export helpers, used by the comments drawer */
export function exportComments(comments, fmt) {
  const rows = comments.map(c => ({ stage: (STAGES.find(s => s.key === c.stageKey) || {}).name || c.stageKey, scene: c.sceneId, sceneTitle: c.sceneTitle, category: c.category, anchor: c.anchor, comment: c.text, resolved: c.resolved, x: c.x, y: c.y, when: new Date(c.ts).toISOString() }));
  let blob, name;
  if (fmt === 'json') { blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' }); name = 'day1-comments.json'; }
  else { const head = Object.keys(rows[0] || { stage: '', scene: '', sceneTitle: '', category: '', anchor: '', comment: '', resolved: '', x: '', y: '', when: '' });
    const csv = [head.join(','), ...rows.map(r => head.map(k => `"${String(r[k]).replace(/"/g, '""')}"`).join(','))].join('\n');
    blob = new Blob([csv], { type: 'text/csv' }); name = 'day1-comments.csv'; }
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}

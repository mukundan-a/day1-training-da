// Reviewer comments. This is reviewer-only tooling, kept deliberately separate
// from Docs and Notes (which simulate what a real learner sees). A distinct
// review dock in the bottom-left corner turns comment mode on and off, lists
// every note, and exports the set. In comment mode a banner makes the state and
// the exit obvious; pins can be dragged, opened into a short thread, resolved or
// deleted. Each comment carries structured metadata (stage, scene, nearest
// heading, category, position, timestamp) so the full set can be queried later.
import React, { useState, useRef, useEffect } from 'react';
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

/* Per-scene layer: the click surface, the pins, the draft composer. */
export function CommentLayer({ sceneId }) {
  const { state, dispatch } = useStore();
  const { commentMode } = useUI();
  const layer = useRef(null);
  const [draft, setDraft] = useState(null);
  const [text, setText] = useState('');
  const [cat, setCat] = useState(CATEGORIES[0]);
  const [openId, setOpenId] = useState(null);
  const [reply, setReply] = useState('');
  const mine = state.comments.filter(c => c.sceneId === sceneId);
  const scene = SCENES.find(s => s.id === sceneId);

  useEffect(() => {
    if (!commentMode) { setDraft(null); return; }
    const h = (e) => { if (e.key === 'Escape') { setDraft(null); setOpenId(null); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [commentMode]);

  const pct = (clientX, clientY) => {
    const box = layer.current.getBoundingClientRect();
    return { x: Math.max(1, Math.min(99, ((clientX - box.left) / box.width) * 100)), y: Math.max(1, Math.min(99, ((clientY - box.top) / box.height) * 100)) };
  };

  const onClick = (e) => {
    if (!commentMode) return;
    if (e.target.closest('.cpin') || e.target.closest('.cpop')) return;
    const p = pct(e.clientX, e.clientY);
    setDraft({ ...p, anchor: anchorAt(layer.current, e.clientY) });
    setText(''); setCat(CATEGORIES[0]); setOpenId(null);
  };
  const save = () => {
    if (!text.trim() || !draft) return;
    dispatch({ type: 'addComment', comment: {
      id: 'c' + Date.now(), sceneId, sceneTitle: scene?.title || sceneId, stageKey: scene?.stageKey || '',
      category: cat, anchor: draft.anchor, x: Math.round(draft.x * 10) / 10, y: Math.round(draft.y * 10) / 10,
      text: text.trim(), resolved: false, replies: [], ts: Date.now(),
    } });
    setDraft(null); setText('');
  };
  const onDragEnd = (c) => (e, info) => {
    const p = pct(info.point.x, info.point.y);
    dispatch({ type: 'updateComment', id: c.id, patch: { x: Math.round(p.x * 10) / 10, y: Math.round(p.y * 10) / 10 } });
  };
  const addReply = (c) => {
    if (!reply.trim()) return;
    dispatch({ type: 'updateComment', id: c.id, patch: { replies: [...(c.replies || []), { text: reply.trim(), ts: Date.now() }] } });
    setReply('');
  };

  return (
    <div className="clayer" ref={layer}>
      {commentMode && <div className="clayer__catch" onClick={onClick} />}

      {mine.map((c, idx) => (
        <motion.div key={c.id} className={'cpin' + (commentMode ? ' draggable' : '') + (c.resolved ? ' resolved' : '')} style={{ left: c.x + '%', top: c.y + '%' }}
          drag={commentMode} dragMomentum={false} onDragEnd={onDragEnd(c)}
          onClick={(e) => { e.stopPropagation(); setOpenId(openId === c.id ? null : c.id); setDraft(null); setReply(''); }}>
          <span className="cpin__n">{idx + 1}</span>
          <Icon n="pin" size={26} fill={c.resolved ? 'var(--grey-3)' : 'var(--pink)'} />
          {openId === c.id && (
            <div className="cpop" style={pop(c.x, c.y)} onClick={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()}>
              <div className="cpop__cat">{c.category}{c.resolved && <span className="cpop__res">resolved</span>}</div>
              <div className="cpop__tx">{c.text}</div>
              {(c.replies || []).map((r, i) => <div key={i} className="cthread">{r.text}</div>)}
              <div className="cpop__reply">
                <input value={reply} onChange={e => setReply(e.target.value)} onKeyDown={e => e.key === 'Enter' && addReply(c)} placeholder="Reply" />
                <button onClick={() => addReply(c)}><Icon n="plus" size={14} /></button>
              </div>
              <div className="cpop__row">
                <button onClick={() => dispatch({ type: 'updateComment', id: c.id, patch: { resolved: !c.resolved } })}>{c.resolved ? 'Reopen' : 'Resolve'}</button>
                <button onClick={() => { dispatch({ type: 'removeComment', id: c.id }); setOpenId(null); }}>Delete</button>
                <button onClick={() => setOpenId(null)} style={{ marginLeft: 'auto' }}>Close</button>
              </div>
            </div>
          )}
        </motion.div>
      ))}

      <AnimatePresence>
        {draft && (
          <motion.div className="cpop" style={pop(draft.x, draft.y)} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} onClick={e => e.stopPropagation()}>
            {draft.anchor && <div className="cpop__on">On: {draft.anchor}</div>}
            <textarea autoFocus value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Escape') setDraft(null); }} placeholder="Leave a note on the storyline"
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
    </div>
  );
}

const pop = (x, y) => ({ position: 'absolute', left: x + '%', top: `calc(${y}% + 16px)`, transform: `translateX(${x > 65 ? '-85%' : x < 35 ? '-15%' : '-50%'})`, width: 250, background: '#fff', border: '1px solid var(--hair)', borderRadius: 12, boxShadow: 'var(--shadow-lift)', padding: 14, zIndex: 30, cursor: 'default' });
const mini = { fontSize: 12, color: 'var(--grey-3)' };

/* Reviewer dock — bottom-left, visually marked as tooling, not part of the
   product. Toggles comment mode, lists every note, exports the set. */
export function ReviewDock({ commentMode, setCommentMode, nav }) {
  const { state, dispatch } = useStore();
  const [open, setOpen] = useState(false);
  const n = state.comments.length;
  const openN = state.comments.filter(c => !c.resolved).length;

  return (
    <>
      {/* on-state banner: makes the mode and the exit unmistakable */}
      <AnimatePresence>
        {commentMode && (
          <motion.div className="reviewbanner" initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }} transition={spring.ui}>
            <span className="reviewbanner__dot" />
            <span>Comment mode is on. Click anywhere on a scene to leave a note. Drag a pin to move it.</span>
            <button onClick={() => setCommentMode(false)}><Icon n="close" size={14} /> Done (Esc)</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="reviewdock">
        <AnimatePresence>
          {open && (
            <motion.div className="reviewpanel" initial={{ opacity: 0, y: 12, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.97 }} transition={spring.ui}>
              <div className="reviewpanel__h">
                <span className="reviewpanel__tag">Reviewer tools</span>
                <button className="reviewpanel__x" onClick={() => setOpen(false)}><Icon n="close" size={15} /></button>
              </div>
              <p className="reviewpanel__note">Feedback lives on the storyline itself. This panel is only for reviewers; a learner never sees it.</p>
              <button className={'reviewpanel__toggle' + (commentMode ? ' on' : '')} onClick={() => setCommentMode(!commentMode)}>
                {commentMode ? 'Comment mode is ON — click Done to stop' : 'Turn on comment mode'}
              </button>
              {n > 0 && (
                <div className="reviewpanel__exp">
                  <button className="chip" onClick={() => exportComments(state.comments, 'json')}><Icon n="download" size={12} /> JSON</button>
                  <button className="chip" onClick={() => exportComments(state.comments, 'csv')}><Icon n="download" size={12} /> CSV</button>
                  <span className="muted" style={{ fontSize: 12, marginLeft: 'auto', alignSelf: 'center' }}>{openN} open · {n} total</span>
                </div>
              )}
              <div className="reviewpanel__list">
                {n === 0 && <p className="muted" style={{ fontSize: 13, fontStyle: 'italic' }}>No comments yet.</p>}
                {STAGES.filter(st => state.comments.some(c => c.stageKey === st.key)).map(st => (
                  <div key={st.key} style={{ marginBottom: 14 }}>
                    <div className="reviewpanel__stage">{st.name}</div>
                    {state.comments.filter(c => c.stageKey === st.key).map(c => (
                      <button key={c.id} className="reviewpanel__row" style={{ opacity: c.resolved ? 0.55 : 1 }}
                        onClick={() => { if (nav) nav(c.sceneId); setOpen(false); }}>
                        <span className="reviewpanel__rowcat">{c.category}</span>
                        <span className="reviewpanel__rowscene"> · {c.sceneId}</span>
                        <div className="reviewpanel__rowtx">{c.text}</div>
                        {c.anchor && <div className="reviewpanel__rowon">on: {c.anchor}</div>}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button className={'reviewfab' + (commentMode ? ' active' : '')} onClick={() => setOpen(o => !o)}>
          <Icon n="chat" size={16} /> Review
          {n > 0 && <span className="reviewfab__badge">{n}</span>}
        </button>
      </div>
    </>
  );
}

/* export helpers */
export function exportComments(comments, fmt) {
  const rows = comments.map(c => ({ stage: (STAGES.find(s => s.key === c.stageKey) || {}).name || c.stageKey, scene: c.sceneId, sceneTitle: c.sceneTitle, category: c.category, anchor: c.anchor, comment: c.text, replies: (c.replies || []).map(r => r.text).join(' | '), resolved: c.resolved, x: c.x, y: c.y, when: new Date(c.ts).toISOString() }));
  let blob, name;
  if (fmt === 'json') { blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' }); name = 'day1-comments.json'; }
  else { const head = Object.keys(rows[0] || { stage: '', scene: '', sceneTitle: '', category: '', anchor: '', comment: '', replies: '', resolved: '', x: '', y: '', when: '' });
    const csv = [head.join(','), ...rows.map(r => head.map(k => `"${String(r[k]).replace(/"/g, '""')}"`).join(','))].join('\n');
    blob = new Blob([csv], { type: 'text/csv' }); name = 'day1-comments.csv'; }
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}

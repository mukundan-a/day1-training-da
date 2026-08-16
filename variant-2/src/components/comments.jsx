// Reviewer comments. This is reviewer-only tooling, kept separate from Docs and
// Notes (which simulate what a real learner sees). Comments live on a shared
// Firestore board when reachable, so every reviewer sees everyone else's; if the
// board is unreachable they fall back to this browser's localStorage, and the
// JSON export carries the work out either way. The review control sits top-right;
// in comment mode a banner makes the state and the exit obvious, and pins can be
// dragged, opened into a thread, resolved or deleted.
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from './ui.jsx';
import { useUI } from './frame.jsx';
import { useComments } from '../comments-store.jsx';
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
  const { commentMode } = useUI();
  const { comments, addComment, replyComment, resolveComment, removeComment, moveComment } = useComments();
  const layer = useRef(null);
  const [draft, setDraft] = useState(null);
  const [text, setText] = useState('');
  const [cat, setCat] = useState(CATEGORIES[0]);
  const [openId, setOpenId] = useState(null);
  const [reply, setReply] = useState('');
  const mine = comments.filter(c => c.sceneId === sceneId);
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
    addComment({
      sceneId, sceneTitle: scene?.title || sceneId, stageKey: scene?.stageKey || '',
      category: cat, anchor: draft.anchor, x: Math.round(draft.x * 10) / 10, y: Math.round(draft.y * 10) / 10, text: text.trim(),
    });
    setDraft(null); setText('');
  };
  const onDragEnd = (c) => (e, info) => {
    const p = pct(info.point.x, info.point.y);
    moveComment(c, Math.round(p.x * 10) / 10, Math.round(p.y * 10) / 10);
  };
  const addReply = (c) => { if (!reply.trim()) return; replyComment(c.id, reply.trim()); setReply(''); };

  return (
    <div className="clayer" ref={layer}>
      {commentMode && <div className="clayer__catch" onClick={onClick} />}

      {mine.map((c, idx) => {
        const canDrag = commentMode && c.mine !== false;
        return (
          <motion.div key={c.id} className={'cpin' + (canDrag ? ' draggable' : '') + (c.resolved ? ' resolved' : '')} style={{ left: c.x + '%', top: c.y + '%' }}
            drag={canDrag} dragMomentum={false} onDragEnd={onDragEnd(c)}
            onClick={(e) => { e.stopPropagation(); setOpenId(openId === c.id ? null : c.id); setDraft(null); setReply(''); }}>
            <span className="cpin__n">{idx + 1}</span>
            <Icon n="pin" size={26} fill={c.resolved ? 'var(--grey-3)' : 'var(--pink)'} />
            {openId === c.id && (
              <div className="cpop" style={pop(c.x, c.y)} onClick={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()}>
                <div className="cpop__cat">{c.category}{c.who && c.who !== 'anonymous' && <span className="cpop__who">{c.who}</span>}{c.resolved && <span className="cpop__res">resolved</span>}</div>
                <div className="cpop__tx">{c.text}</div>
                {(c.replies || []).map((r, i) => <div key={i} className="cthread"><b>{r.who && r.who !== 'anonymous' ? r.who + ': ' : ''}</b>{r.text}</div>)}
                <div className="cpop__reply">
                  <input value={reply} onChange={e => setReply(e.target.value)} onKeyDown={e => e.key === 'Enter' && addReply(c)} placeholder="Reply" />
                  <button onClick={() => addReply(c)}><Icon n="plus" size={14} /></button>
                </div>
                <div className="cpop__row">
                  <button onClick={() => resolveComment(c.id, !c.resolved)}>{c.resolved ? 'Reopen' : 'Resolve'}</button>
                  {c.mine !== false && <button onClick={() => { removeComment(c.id); setOpenId(null); }}>Delete</button>}
                  <button onClick={() => setOpenId(null)} style={{ marginLeft: 'auto' }}>Close</button>
                </div>
              </div>
            )}
          </motion.div>
        );
      })}

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

/* Reviewer dock — top-right, marked as tooling, not part of the product. */
export function ReviewDock({ commentMode, setCommentMode, nav }) {
  const { comments, source, who, setWho, edits, editMode, setEditMode, clearEdit } = useComments();
  const [open, setOpen] = useState(false);
  const n = comments.length;
  const openN = comments.filter(c => !c.resolved).length;
  const editList = Object.entries(edits || {});

  const turnComment = (on) => { setCommentMode(on); if (on) setEditMode(false); };
  const turnEdit = (on) => { setEditMode(on); if (on) setCommentMode(false); };

  return (
    <>
      {/* on-state banners */}
      <AnimatePresence>
        {commentMode && (
          <motion.div className="reviewbanner" initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }} transition={spring.ui}>
            <span className="reviewbanner__dot" />
            <span>Comment mode is on. Click anywhere on a scene to leave a note. Drag a pin to move it.</span>
            <button onClick={() => setCommentMode(false)}><Icon n="close" size={14} /> Done (Esc)</button>
          </motion.div>
        )}
        {editMode && (
          <motion.div className="reviewbanner reviewbanner--edit" initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }} transition={spring.ui}>
            <span className="reviewbanner__dot" />
            <span>Edit mode is on. Click any text to rewrite it in place. Changes are shared with everyone.</span>
            <button onClick={() => setEditMode(false)}><Icon n="close" size={14} /> Done (Esc)</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="reviewdock">
        <button className={'reviewfab' + (commentMode || editMode ? ' active' : '')} onClick={() => setOpen(o => !o)}>
          <Icon n="chat" size={16} /> Review
          {n > 0 && <span className="reviewfab__badge">{n}</span>}
        </button>
        <AnimatePresence>
          {open && (
            <motion.div className="reviewpanel" initial={{ opacity: 0, y: -12, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -12, scale: 0.97 }} transition={spring.ui}>
              <div className="reviewpanel__h">
                <span className="reviewpanel__tag">Reviewer tools</span>
                <span className={'reviewpanel__src ' + source}>{source === 'live' ? 'Shared' : source === 'local' ? 'This device only' : 'Connecting…'}</span>
                <button className="reviewpanel__x" onClick={() => setOpen(false)}><Icon n="close" size={15} /></button>
              </div>
              <p className="reviewpanel__note">Feedback lives on the storyline itself. This panel is only for reviewers; a learner never sees it.</p>
              <input className="reviewpanel__name" value={who} onChange={e => setWho(e.target.value)} placeholder="Your name (so replies and edits are attributed)" />
              <div className="reviewpanel__modes">
                <button className={'reviewpanel__toggle' + (commentMode ? ' on' : '')} onClick={() => turnComment(!commentMode)}>
                  {commentMode ? 'Commenting — Done' : 'Comment'}
                </button>
                <button className={'reviewpanel__toggle edit' + (editMode ? ' on' : '')} onClick={() => turnEdit(!editMode)}>
                  {editMode ? 'Editing text — Done' : 'Edit text'}
                </button>
              </div>
              {editList.length > 0 && (
                <div className="reviewpanel__edits">
                  <div className="reviewpanel__stage">{editList.length} text edit{editList.length === 1 ? '' : 's'}</div>
                  {editList.slice(0, 20).map(([path, text]) => (
                    <div key={path} className="reviewpanel__erow">
                      <span className="reviewpanel__etx">{text}</span>
                      <button onClick={() => clearEdit(path)} title="Reset to original">reset</button>
                    </div>
                  ))}
                </div>
              )}

              <div className="reviewpanel__save">
                <div className="reviewpanel__saveh"><Icon n="download" size={14} /> Before you leave</div>
                <p>Cloud sync is still being hardened, so download your comments at the end of every session as a backup, just in case.</p>
                <div className="reviewpanel__exp">
                  <button className="chip" onClick={() => exportComments(comments, 'json')}><Icon n="download" size={12} /> JSON</button>
                  <button className="chip" onClick={() => exportComments(comments, 'csv')}><Icon n="download" size={12} /> CSV</button>
                  <span className="muted" style={{ fontSize: 12, marginLeft: 'auto', alignSelf: 'center' }}>{openN} open · {n} total</span>
                </div>
              </div>

              <div className="reviewpanel__list">
                {n === 0 && <p className="muted" style={{ fontSize: 13, fontStyle: 'italic' }}>No comments yet.</p>}
                {STAGES.filter(st => comments.some(c => c.stageKey === st.key)).map(st => (
                  <div key={st.key} style={{ marginBottom: 14 }}>
                    <div className="reviewpanel__stage">{st.name}</div>
                    {comments.filter(c => c.stageKey === st.key).map(c => (
                      <button key={c.id} className="reviewpanel__row" style={{ opacity: c.resolved ? 0.55 : 1 }}
                        onClick={() => { if (nav) nav(c.sceneId); setOpen(false); }}>
                        <span className="reviewpanel__rowcat">{c.category}</span>
                        <span className="reviewpanel__rowscene"> · {c.sceneId}{c.who && c.who !== 'anonymous' ? ' · ' + c.who : ''}</span>
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
      </div>
    </>
  );
}

/* export helpers */
export function exportComments(comments, fmt) {
  const rows = comments.map(c => ({ stage: (STAGES.find(s => s.key === c.stageKey) || {}).name || c.stageKey, scene: c.sceneId, sceneTitle: c.sceneTitle, category: c.category, who: c.who || '', anchor: c.anchor, comment: c.text, replies: (c.replies || []).map(r => (r.who ? r.who + ': ' : '') + r.text).join(' | '), resolved: c.resolved, x: c.x, y: c.y, when: c.ts ? new Date(c.ts).toISOString() : '' }));
  let blob, name;
  if (fmt === 'json') { blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' }); name = 'day1-comments.json'; }
  else { const head = Object.keys(rows[0] || { stage: '', scene: '', sceneTitle: '', category: '', who: '', anchor: '', comment: '', replies: '', resolved: '', x: '', y: '', when: '' });
    const csv = [head.join(','), ...rows.map(r => head.map(k => `"${String(r[k]).replace(/"/g, '""')}"`).join(','))].join('\n');
    blob = new Blob([csv], { type: 'text/csv' }); name = 'day1-comments.csv'; }
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Reviewer comments, available on every scene (build spec §3.6). When comment
// mode is on, click anywhere on the scene to drop a pin; pins persist locally.
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from './ui.jsx';
import { useStore } from '../store.jsx';
import { useUI } from './frame.jsx';
import { spring } from '../motion.js';

export function CommentLayer({ sceneId }) {
  const { state, dispatch } = useStore();
  const { commentMode } = useUI();
  const [draft, setDraft] = useState(null); // {x,y}
  const [text, setText] = useState('');
  const [openId, setOpenId] = useState(null);
  const mine = state.comments.filter(c => c.sceneId === sceneId);

  const onClick = (e) => {
    if (!commentMode) return;
    if (e.target.closest('.cpin') || e.target.closest('.cpop')) return;
    const r = e.currentTarget.getBoundingClientRect();
    setDraft({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
    setText(''); setOpenId(null);
  };
  const save = () => {
    if (!text.trim() || !draft) return;
    dispatch({ type: 'addComment', comment: { id: 'c' + Date.now(), sceneId, x: Math.round(draft.x * 10) / 10, y: Math.round(draft.y * 10) / 10, text: text.trim(), resolved: false } });
    setDraft(null); setText('');
  };

  return (
    <>
      {commentMode && <div style={{ position: 'absolute', inset: 0, zIndex: 25, cursor: 'crosshair' }} onClick={onClick} />}

      {mine.map(c => (
        <button key={c.id} className="cpin" style={{ left: c.x + '%', top: c.y + '%', zIndex: 26 }} onClick={(e) => { e.stopPropagation(); setOpenId(openId === c.id ? null : c.id); setDraft(null); }}>
          <Icon n="pin" size={26} fill="var(--pink)" style={{ color: 'var(--pink)' }} />
          {openId === c.id && (
            <div className="cpop" style={pop(c.x, c.y)} onClick={e => e.stopPropagation()}>
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
            <textarea autoFocus value={text} onChange={e => setText(e.target.value)} placeholder="Leave a note on the storyline"
              style={{ width: '100%', border: '1px solid var(--hair)', borderRadius: 8, padding: 8, fontSize: 14, minHeight: 54, resize: 'vertical' }} />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button className="continue" style={{ borderRadius: 20, padding: '7px 14px', fontSize: 13, background: 'var(--pink)' }} onClick={save}>Save</button>
              <button style={mini} onClick={() => setDraft(null)}>Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const pop = (x, y) => ({ position: 'absolute', left: x + '%', top: `calc(${y}% + 14px)`, transform: 'translateX(-50%)', width: 240, background: '#fff', border: '1px solid var(--hair)', borderRadius: 12, boxShadow: 'var(--shadow-lift)', padding: 14, zIndex: 30 });
const mini = { fontSize: 12, color: 'var(--grey-3)' };

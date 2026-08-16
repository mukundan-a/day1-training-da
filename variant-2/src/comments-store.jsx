// Comment state, shared across reviewers when Firestore is reachable and mirrored
// to localStorage otherwise. Everything the UI needs (list, mutators, reviewer
// name, connection source) comes from here, so CommentLayer and ReviewDock never
// touch Live or localStorage directly.
import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { Live } from './live.js';

const LKEY = 'day1craft.comments.v2';
const NKEY = 'day1craft.reviewer';
const EKEY = 'day1craft.edits.v1';       // this browser's own text edits
const EHKEY = 'day1craft.edithist.v1';   // per-path history for revert

// display category <-> the rule-checked `type` the Firestore rules require
export const CAT_TO_TYPE = { 'Day 1 step': 'concept', 'Training design': 'screen', Copy: 'copy', Other: 'flow' };
export const TYPE_TO_CAT = { concept: 'Day 1 step', screen: 'Training design', copy: 'Copy', flow: 'Other' };

const Ctx = createContext(null);
export const useComments = () => useContext(Ctx);

export function CommentsProvider({ children }) {
  const [comments, setComments] = useState(() => { try { return JSON.parse(localStorage.getItem(LKEY)) || []; } catch { return []; } });
  const [source, setSource] = useState('connecting'); // connecting | live | local
  const [who, setWhoState] = useState(() => { try { return localStorage.getItem(NKEY) || ''; } catch { return ''; } });
  const [editMode, setEditMode] = useState(false);
  const [edits, setEdits] = useState({});             // merged map path -> text on screen
  const localEdits = useRef((() => { try { return JSON.parse(localStorage.getItem(EKEY)) || {}; } catch { return {}; } })());
  const remoteEdits = useRef({});
  const editHist = useRef((() => { try { return JSON.parse(localStorage.getItem(EHKEY)) || {}; } catch { return {}; } })());
  const liveRef = useRef(false);

  const persistLocal = (list) => { try { localStorage.setItem(LKEY, JSON.stringify(list)); } catch {} };
  const mergeEdits = () => setEdits({ ...localEdits.current, ...remoteEdits.current });

  useEffect(() => {
    // seed the on-screen edits from this browser's own before the board answers
    setEdits({ ...localEdits.current });
    let unsub = () => {}, unsubE = () => {};
    let dead = false;
    Live.init().then(ok => {
      if (dead) return;
      if (ok) {
        liveRef.current = true;
        setSource('live');
        unsub = Live.watch((rows, err) => {
          if (err) { liveRef.current = false; setSource('local'); return; }
          setComments(rows.map(r => ({
            id: r.id, sceneId: r.screen, sceneTitle: r.sceneTitle || r.screen, stageKey: r.stageKey || '',
            category: r.category || TYPE_TO_CAT[r.type] || 'Other', anchor: r.anchor || '', x: r.x, y: r.y,
            text: r.text, resolved: !!r.resolved, replies: r.replies || [], who: r.who || 'anonymous',
            mine: r.uid === Live.uid, ts: r.at ? Date.parse(r.at) : Date.now(),
          })));
        });
        unsubE = Live.watchEdits((rows, err) => {
          if (err) return;
          const remote = {};
          rows.forEach(r => { if (r && r.path && typeof r.text === 'string') { remote[r.path] = r.text; if (Array.isArray(r.history)) editHist.current[r.path] = r.history; } });
          remoteEdits.current = remote;                 // the board wins where both hold a path
          mergeEdits();
          // push up any local edits the board has not got yet
          Object.keys(localEdits.current).forEach(p => { if (!(p in remote)) Live.setEdit(p, localEdits.current[p], who || 'anonymous', editHist.current[p] || []).catch(() => {}); });
        });
      } else {
        setSource('local');
      }
    });
    return () => { dead = true; unsub(); unsubE(); };
  }, []);

  const setWho = useCallback((n) => { setWhoState(n); try { localStorage.setItem(NKEY, n); } catch {} }, []);

  const addComment = useCallback(async (c) => {
    if (liveRef.current) {
      try { await Live.add({ ...c, who, type: CAT_TO_TYPE[c.category] || 'flow' }); return; }
      catch { liveRef.current = false; setSource('local'); }
    }
    const item = { ...c, id: 'c' + Date.now(), who: who || 'anonymous', resolved: false, replies: [], ts: Date.now(), mine: true };
    setComments(list => { const next = [...list, item]; persistLocal(next); return next; });
  }, [who]);

  const replyComment = useCallback(async (id, text) => {
    if (liveRef.current) { try { await Live.reply(id, who, text); return; } catch {} }
    setComments(list => { const next = list.map(c => c.id === id ? { ...c, replies: [...(c.replies || []), { who: who || 'anonymous', text, at: new Date().toISOString() }] } : c); persistLocal(next); return next; });
  }, [who]);

  const resolveComment = useCallback(async (id, on) => {
    if (liveRef.current) { try { await Live.setResolved(id, on, who); return; } catch {} }
    setComments(list => { const next = list.map(c => c.id === id ? { ...c, resolved: on } : c); persistLocal(next); return next; });
  }, [who]);

  const removeComment = useCallback(async (id) => {
    if (liveRef.current) { try { await Live.remove(id); return; } catch {} }
    setComments(list => { const next = list.filter(c => c.id !== id); persistLocal(next); return next; });
  }, []);

  // moving a pin: the rules forbid updating x/y, so a live move is recreate + delete
  const moveComment = useCallback(async (c, x, y) => {
    if (liveRef.current) {
      try {
        await Live.add({ sceneId: c.sceneId, sceneTitle: c.sceneTitle, stageKey: c.stageKey, category: c.category, type: CAT_TO_TYPE[c.category] || 'flow', anchor: c.anchor, x, y, text: c.text, who: c.who, resolved: c.resolved, replies: c.replies });
        await Live.remove(c.id);
        return;
      } catch {}
    }
    setComments(list => { const next = list.map(o => o.id === c.id ? { ...o, x, y } : o); persistLocal(next); return next; });
  }, []);

  // --- shared text edits ---
  const setEdit = useCallback((path, text, original) => {
    const now = String(text || '').replace(/\s+/g, ' ').trim().slice(0, 3800);
    if (!now) return;
    const was = (path in localEdits.current) ? localEdits.current[path] : original;
    if (typeof was === 'string' && was !== now) {
      const h = editHist.current[path] = editHist.current[path] || [];
      h.push({ text: was, who: who || 'anonymous', at: new Date().toISOString() });
      if (h.length > 12) h.splice(0, h.length - 12);
      try { localStorage.setItem(EHKEY, JSON.stringify(editHist.current)); } catch {}
    }
    localEdits.current = { ...localEdits.current, [path]: now };
    try { localStorage.setItem(EKEY, JSON.stringify(localEdits.current)); } catch {}
    mergeEdits();
    if (liveRef.current) Live.setEdit(path, now, who || 'anonymous', editHist.current[path] || []).catch(() => { setSource('local'); });
  }, [who]);

  const clearEdit = useCallback((path) => {
    const { [path]: _drop, ...rest } = localEdits.current;
    localEdits.current = rest;
    try { localStorage.setItem(EKEY, JSON.stringify(localEdits.current)); } catch {}
    delete remoteEdits.current[path];
    mergeEdits();
    if (liveRef.current) Live.clearEdit(path).catch(() => {});
  }, []);

  const value = { comments, source, who, setWho, addComment, replyComment, resolveComment, removeComment, moveComment, edits, editMode, setEditMode, setEdit, clearEdit };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

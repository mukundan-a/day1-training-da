// State + persistence (build spec §7.1). React Context + useReducer, mirrored
// to localStorage on every change. Cross-session, since the close promises it.
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { SCENES } from './data.js';

const KEY = 'day1craft.v1';
const ORDER = SCENES.map(s => s.id);

const initial = () => {
  const base = {
    v: 1,
    currentSceneId: 'W1',
    frontierSceneId: 'W1',
    unlockedStages: ['welcome'],
    visited: { W1: true },
    notes: [],
    scq: { S: [], C: [], Q: [], problem: '', coachRead: '', skipped: false, checkCount: 0 },
    branch: { assignedIndex: 1, subclaims: [], coachRead: '', skipped: false, checkCount: 0 },
    comments: [],
  };
  let s = base;
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved && saved.v === 1) s = { ...base, ...saved, scq: { ...base.scq, ...saved.scq }, branch: { ...base.branch, ...saved.branch } };
  } catch {}
  // the hash is authoritative for the current scene on boot (§7.2)
  const h = location.hash.match(/#\/scene\/(\w+)/);
  if (h && ORDER.includes(h[1])) {
    s.currentSceneId = h[1];
    if (ORDER.indexOf(h[1]) > ORDER.indexOf(s.frontierSceneId)) s.frontierSceneId = h[1];
    const sk = SCENES.find(x => x.id === h[1])?.stageKey;
    if (sk && !s.unlockedStages.includes(sk)) s.unlockedStages = [...s.unlockedStages, sk];
    s.visited = { ...s.visited, [h[1]]: true };
  }
  return s;
};

const STAGES_ORDER = ['welcome', 'day0', 'kickoff', 'coreteam', 'close'];
const stageOfScene = (id) => SCENES.find(s => s.id === id)?.stageKey;

function reducer(state, action) {
  switch (action.type) {
    case 'goto': {
      const id = action.id;
      if (!ORDER.includes(id)) return state;
      const fi = ORDER.indexOf(state.frontierSceneId);
      const ni = ORDER.indexOf(id);
      const frontier = ni > fi ? id : state.frontierSceneId;
      // unlock the stage we are entering
      const sk = stageOfScene(id);
      const unlocked = state.unlockedStages.includes(sk) ? state.unlockedStages : [...state.unlockedStages, sk];
      return { ...state, currentSceneId: id, frontierSceneId: frontier, visited: { ...state.visited, [id]: true }, unlockedStages: unlocked };
    }
    case 'addNote':
      return { ...state, notes: [...state.notes, { id: 'n' + Date.now(), sceneTag: action.sceneTag, text: action.text, ts: Date.now() }] };
    case 'scq':
      return { ...state, scq: { ...state.scq, ...action.patch } };
    case 'branch':
      return { ...state, branch: { ...state.branch, ...action.patch } };
    case 'addComment':
      return { ...state, comments: [...state.comments, action.comment] };
    case 'updateComment':
      return { ...state, comments: state.comments.map(c => c.id === action.id ? { ...c, ...action.patch } : c) };
    case 'reset':
      return initial();
    default:
      return state;
  }
}

const Ctx = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, initial);
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
    history.replaceState(null, '', `#/scene/${state.currentSceneId}`);
  }, [state]);
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export const useStore = () => useContext(Ctx);
export { STAGES_ORDER };

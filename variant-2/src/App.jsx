import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StoreProvider, useStore } from './store.jsx';
import { SCENES, STAGES, sceneIndex, stageOf } from './data.js';
import { TopRail, RightRail, MapOverlay, NotchWipe, Spine } from './components/shell.jsx';
import { ReviewDock } from './components/comments.jsx';
import { TextEditLayer } from './components/edits.jsx';
import { CommentsProvider, useComments } from './comments-store.jsx';
import { UI } from './components/frame.jsx';
import { Boot } from './components/boot.jsx';
import { SCENE_COMPONENTS } from './scenes/index.jsx';
import { ease, dur } from './motion.js';

function AppInner() {
  const { state, dispatch } = useStore();
  const { editMode, setEditMode } = useComments();
  const [drawer, setDrawer] = useState(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [wipe, setWipe] = useState(false);
  const [commentMode, setCommentMode] = useState(false);
  const [booted, setBooted] = useState(() => { try { return sessionStorage.getItem('day1.booted') === '1'; } catch { return false; } });
  const begin = () => { try { sessionStorage.setItem('day1.booted', '1'); } catch {}; setBooted(true); };

  const id = state.currentSceneId;
  const idx = sceneIndex(id);
  const scene = SCENES[idx];

  const nav = useCallback((targetId) => {
    const from = stageOf(state.currentSceneId)?.key;
    const to = stageOf(targetId)?.key;
    if (from !== to) {
      setWipe(true);
      setTimeout(() => dispatch({ type: 'goto', id: targetId }), 300);
      setTimeout(() => setWipe(false), 620);
    } else {
      dispatch({ type: 'goto', id: targetId });
    }
  }, [state.currentSceneId, dispatch]);

  const jumpStage = useCallback((stageKey) => {
    const first = SCENES.find(s => s.stageKey === stageKey);
    if (first) nav(first.id);
  }, [nav]);

  const openSource = useCallback((which) => {
    if (which === 'notes') setDrawer('notes');
    else setDrawer('docs');
  }, []);

  // opening a document from the Docs tab jumps to its reader scene
  const openDoc = useCallback((docId) => {
    const map = { proposal: 'D2', brief: 'D2', iko: 'C2', pdsplit: 'D2' };
    const target = map[docId];
    if (target) { setDrawer(null); nav(target); }
  }, [nav]);

  // comment mode dims/marks the whole app; expose it for cursor + banner
  useEffect(() => { document.body.classList.toggle('commenting', commentMode); }, [commentMode]);

  // keyboard (§4.6) — suppressed while typing
  useEffect(() => {
    const h = (e) => {
      if (e.target.matches('input, textarea') || e.target.isContentEditable) return;
      if (editMode && e.key === 'Escape') return setEditMode(false);
      if (commentMode && e.key === 'Escape') return setCommentMode(false);
      if (mapOpen && e.key === 'Escape') return setMapOpen(false);
      if (drawer && e.key === 'Escape') return setDrawer(null);
      if (e.key === 'ArrowRight') { const n = SCENES[idx + 1]; if (n && !nextDisabled) nav(n.id); }
      if (e.key === 'ArrowLeft') { const p = SCENES[idx - 1]; if (p) nav(p.id); }
      if (e.key.toLowerCase() === 'm') setMapOpen(o => !o);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  const nextDisabled = false; // reviewers are never blocked; the exercises demo themselves
  const next = SCENES[idx + 1];
  const crossing = next && next.stageKey !== scene.stageKey;
  const nextSub = next ? (crossing ? STAGES.find(s => s.key === next.stageKey).name : `${next.chip} next`) : null;
  const terminal = id === 'X1';

  const SceneComp = SCENE_COMPONENTS[id];
  const variantClass = scene.chip === 'Watch' ? 'scene scene--hero' : (['W2', 'D3'].includes(id) ? 'scene scene--read' : 'scene');

  return (
    <UI.Provider value={{ onMap: () => setMapOpen(true), openSource, nav, commentMode }}>
      <div className="app">
        <TopRail onJump={jumpStage} onMap={() => setMapOpen(true)} />
        <RightRail mode={drawer} setMode={setDrawer} onOpenDoc={openDoc} nav={nav} />
        <ReviewDock commentMode={commentMode} setCommentMode={setCommentMode} nav={nav} />
        <TextEditLayer sceneId={id} />

        <div className={variantClass}>
          <AnimatePresence mode="wait">
            <motion.div key={id}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              transition={{ duration: dur.fast, ease: ease.entrance }}>
              <SceneComp />
            </motion.div>
          </AnimatePresence>
        </div>

        <Spine
          canBack={idx > 0}
          onBack={() => SCENES[idx - 1] && nav(SCENES[idx - 1].id)}
          onNext={() => next && nav(next.id)}
          nextLabel="Continue" nextSub={nextSub} nextDisabled={nextDisabled}
          terminal={terminal} onRestart={() => nav('W1')}
        />

        <AnimatePresence>{mapOpen && <MapOverlay open onClose={() => setMapOpen(false)} onJump={jumpStage} />}</AnimatePresence>
        <NotchWipe show={wipe} />
        <AnimatePresence>{!booted && <Boot onBegin={begin} />}</AnimatePresence>
      </div>
    </UI.Provider>
  );
}

export default function App() {
  return <StoreProvider><CommentsProvider><AppInner /></CommentsProvider></StoreProvider>;
}

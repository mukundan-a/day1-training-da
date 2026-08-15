// Scene frame + UI context. App provides nav/drawer/map callbacks; every scene
// renders through <Scene> for a consistent header and reading width.
import React, { createContext, useContext } from 'react';
import { SceneHeader } from './shell.jsx';
import { CommentLayer } from './comments.jsx';
import { SCENES } from '../data.js';

export const UI = createContext({ onMap: () => {}, openSource: () => {}, nav: () => {}, commentMode: false });
export const useUI = () => useContext(UI);

const WIDTHS = { read: 760, stage: 960, hero: 1160, wide: 980 };

export function Scene({ id, variant = 'stage', hideHeader = false, children }) {
  const { onMap, commentMode } = useUI();
  const scene = SCENES.find(s => s.id === id);
  return (
    <div className="scene__inner" style={{ maxWidth: WIDTHS[variant], position: 'relative', opacity: commentMode ? 0.96 : 1 }}>
      {!hideHeader && <SceneHeader scene={scene} onMap={onMap} />}
      {children}
      <CommentLayer sceneId={id} />
    </div>
  );
}

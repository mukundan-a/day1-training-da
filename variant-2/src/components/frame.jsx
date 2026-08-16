// Scene frame + UI context. App provides nav/drawer/map callbacks; every scene
// renders through <Scene> for a consistent header and reading width.
import React, { createContext, useContext } from 'react';
import { CommentLayer } from './comments.jsx';

export const UI = createContext({ onMap: () => {}, openSource: () => {}, nav: () => {}, commentMode: false });
export const useUI = () => useContext(UI);

const WIDTHS = { read: 780, stage: 900, hero: 1060, wide: 900 };

// The scene owns its own single H1 (no overline, no chip, no eyebrows). Stage
// context lives only in the quiet top rail.
export function Scene({ id, variant = 'stage', children }) {
  const { commentMode } = useUI();
  return (
    <div className="scene__inner" style={{ maxWidth: WIDTHS[variant], position: 'relative', opacity: commentMode ? 0.96 : 1 }}>
      {children}
      <CommentLayer sceneId={id} />
    </div>
  );
}

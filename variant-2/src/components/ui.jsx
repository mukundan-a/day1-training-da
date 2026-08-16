// Shared atoms: icons, notch, reveal/stagger motion wrappers, beat header, and
// the three placeholder classes (§8): ScaffoldSlot, ArtefactFrame, InlineSlot.
import React, { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { fadeUp, staggerParent, riseChild, ease, dur } from '../motion.js';

const P = {
  notch: 'M3.0832 0 L0 10.2844 L35.01766 10.2844 L35.01767 22 L45 22 L45 0 Z',
};
export const Notch = ({ style }) => (
  <span className="notch" style={style} aria-hidden>
    <svg viewBox="0 0 45 22" fill="currentColor"><path d={P.notch} /></svg>
  </span>
);

const ICONS = {
  doc: <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6" />,
  notes: <path d="M4 6h16M4 12h16M4 18h10" />,
  chat: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  pin: <path d="M12 2C7.6 2 4 5.6 4 10c0 5.4 7 11.5 7.3 11.8.4.3 1 .3 1.4 0C13 21.5 20 15.4 20 10c0-4.4-3.6-8-8-8z" />,
  check: <path d="M20 6 9 17l-5-5" />,
  right: <path d="M5 12h14M13 6l6 6-6 6" />,
  left: <path d="M19 12H5M11 6l-6 6 6 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  play: <path d="M8 5v14l11-7z" />,
  replay: <path d="M3 12a9 9 0 1 0 3-6.7L3 8 M3 4v4h4" />,
  ext: <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />,
  download: <path d="M12 4v12M7 12l5 5 5-5M5 20h14" />,
  map: <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  down: <path d="M12 5v14M6 13l6 6 6-6" />,
};
export const Icon = ({ n, size = 18, fill = 'none', style, className }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={fill === 'none' ? 'currentColor' : 'none'}
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden>
    {ICONS[n]}
  </svg>
);

/* Reveal: fade+rise once on view */
export function Reveal({ children, className, style, amount = 0.35, as = 'div' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount });
  const reduce = useReducedMotion();
  const M = motion[as] || motion.div;
  return (
    <M ref={ref} className={className} style={style}
      initial="hidden" animate={inView ? 'show' : 'hidden'}
      variants={reduce ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: dur.fast } } } : fadeUp}>
      {children}
    </M>
  );
}

/* StaggerGroup + StaggerItem */
export function StaggerGroup({ children, className, style, s, delayChildren = 0.15, amount = 0.3 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount });
  return (
    <motion.div ref={ref} className={className} style={style} initial="hidden" animate={inView ? 'show' : 'hidden'}
      variants={staggerParent(s, delayChildren)}>
      {children}
    </motion.div>
  );
}
export const StaggerItem = ({ children, className, style, as = 'div' }) => {
  const M = motion[as] || motion.div;
  return <M className={className} style={style} variants={riseChild}>{children}</M>;
};

/* Beat header — a numbered divider. No eyebrow; the title carries the beat. */
export const BeatHead = ({ n, title, maroon }) => (
  <Reveal className="beathead">
    {n != null && <div className="beathead__num">{n}</div>}
    <div className="beathead__t">
      <div className={'beathead__title' + (maroon ? ' maroon' : '')}>{title}</div>
      <div className="beathead__rule" />
    </div>
  </Reveal>
);

/* Placeholder classes (§8) */
export const FenSlot = ({ children, tag = 'FEN content', inline }) => (
  inline
    ? <span className="inline-slot">{children}</span>
    : <div className="ph-fen"><span className="ph-corner">{tag}</span><span className="ph-text">{children}</span></div>
);

export const ScaffoldSlot = ({ label, lines = ['w90', 'w70', 'w80'], children }) => (
  <div className="scaffold slot">
    <span className="slot__tag">Scaffold</span>
    {label && <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--maroon)', marginBottom: 4 }}>{label}</div>}
    {children || lines.map((w, i) => <div key={i} className={'greek ' + w} />)}
  </div>
);

export const ArtefactFrame = ({ name, flag, children, cap }) => (
  <div className="artefact">
    <div className="artefact__bar">
      <span className="artefact__dots"><i /><i /><i /></span>
      <span className="artefact__fn">{name}</span>
      {flag && <span className="artefact__flag">{flag}</span>}
    </div>
    <div className="artefact__body">
      {children}
      {cap && <div className="artefact__cap">{cap}</div>}
    </div>
  </div>
);

// A "screen" the shape-shifting film plays inside, so a viewer reads it as an
// animation of the day rather than as static page furniture.
export const FilmFrame = ({ label, caption, children }) => (
  <div className="filmframe">
    <div className="filmframe__bar">
      <span className="filmframe__dots"><i /><i /><i /></span>
      <span className="filmframe__label"><span className="filmframe__live" /> {label}</span>
    </div>
    <div className="filmframe__screen">{children}</div>
    {caption && <div className="filmframe__cap">{caption}</div>}
  </div>
);

export const DownloadButton = ({ label = 'Download' }) => (
  <button className="dlbtn"><Icon n="download" size={15} /> {label} <span className="hub">Lives on the Hub</span></button>
);

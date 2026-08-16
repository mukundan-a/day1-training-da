// Recurring content templates (build spec §3.7): stage overview, checklists,
// reading room, zoom-out frame.
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Reveal, StaggerGroup, StaggerItem, BeatHead, Icon, DownloadButton, ArtefactFrame } from './ui.jsx';
import { HypTree } from './heroes.jsx';
import { CHECKLISTS, ROLES } from '../data.js';
import { spring, ease, dur } from '../motion.js';

/* T1 — stage overview two-panel */
export function StageOverview({ name, why, doItems, haveItems, note }) {
  return (
    <div style={{ minHeight: 'calc(100vh - 170px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: 24 }}>
      <Reveal><h2 className="display">{name}</h2></Reveal>
      {note && <Reveal><p className="muted" style={{ fontSize: 15, marginTop: 8 }}>{note}</p></Reveal>}
      <Reveal><p className="overview__why">{why}</p></Reveal>
      <div className="panels">
        <Reveal className="panel panel--do">
          <h3>What you’ll do</h3>
          <ol>{doItems.map((t, i) => <li key={i}>{t}</li>)}</ol>
        </Reveal>
        <Reveal className="panel panel--have">
          <h3>What you’ll have by the end</h3>
          <ul>{haveItems.map((t, i) => <li key={i}>{t}</li>)}</ul>
        </Reveal>
      </div>
    </div>
  );
}

/* T4 — full checklist, real items, filterable by role */
const inRole = (r, role) => role === 'All' || r.role === role || (role !== 'All' && r.role === 'All');

function ChecklistRows({ setKey, role }) {
  const data = CHECKLISTS[setKey];
  const Group = ({ label, rows }) => {
    const shown = rows.filter(r => inRole(r, role));
    if (!shown.length) return null;
    return (
      <div className="checkgroup">
        <h3>{label}</h3>
        <div className="checkgroup__rule" />
        <AnimatePresence mode="popLayout">
          {shown.map((r, i) => (
            <motion.div key={r.t} layout className={'checkrow' + (r.shown ? ' done' : '')}
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} transition={{ ...spring.ui, delay: Math.min(i * 0.035, 0.3) }}>
              <span className="checkrow__box" />
              <span className="checkrow__item">{r.t}</span>
              {r.shown && <span className="checkrow__cov">Shown here</span>}
              <span className="checkrow__role">{r.role}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  };
  return (<><Group label="Process" rows={data.process} /><Group label="Content" rows={data.content} /></>);
}

function Outputs({ setKey }) {
  const data = CHECKLISTS[setKey];
  return (
    <Reveal className="outputs">
      <div className="outputs__h">What this session produces</div>
      <StaggerGroup className="outputs__grid" s={0.07}>
        {data.outputs.map((o, i) => (
          <StaggerItem key={i} className="outputs__item"><span className="outputs__n">{i + 1}</span><span>{o}</span></StaggerItem>
        ))}
      </StaggerGroup>
    </Reveal>
  );
}

export function Checklist({ setKey, title, framing }) {
  const [role, setRole] = useState('All');
  return (
    <div>
      <BeatHead title={title} maroon />
      <Reveal><p className="body">{framing}</p></Reveal>
      <Outputs setKey={setKey} />
      <Reveal className="checkbar">
        <span className="checkbar__lab">Filter to your role</span>
        <div className="rolefilter">{ROLES.map(r => <button key={r} aria-pressed={role === r} onClick={() => setRole(r)}>{r}</button>)}</div>
      </Reveal>
      <ChecklistRows setKey={setKey} role={role} />
      <Reveal><p className="checkwhy">{CHECKLISTS[setKey].why}</p></Reveal>
      <div style={{ marginTop: 20 }}><DownloadButton label="Download this checklist" /></div>
    </div>
  );
}

/* T4-strip — collapsed checklist */
export function ChecklistStrip({ setKey, label }) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState('All');
  return (
    <Reveal className={'checkstrip' + (open ? ' open' : '')}>
      <button className="checkstrip__bar" onClick={() => setOpen(o => !o)}>
        {label}<Icon n="right" size={18} className="chev" style={{ marginLeft: 'auto', transition: 'transform .3s', transform: open ? 'rotate(90deg)' : 'none' }} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: dur.base, ease: ease.standard }} style={{ overflow: 'hidden' }}>
            <div className="checkstrip__body">
              <div className="checkbar">
                <span className="checkbar__lab">Filter to your role</span>
                <div className="rolefilter">{ROLES.map(r => <button key={r} aria-pressed={role === r} onClick={() => setRole(r)}>{r}</button>)}</div>
              </div>
              <ChecklistRows setKey={setKey} role={role} />
              <div style={{ marginTop: 16 }}><DownloadButton /></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Reveal>
  );
}

/* T5 — zoom-out frame */
export function ZoomOut({ heading, body, name, flag, cap }) {
  return (
    <div className="vcenter">
      <Reveal><h2 className="lead" style={{ maxWidth: '22ch' }}>{heading}</h2></Reveal>
      <Reveal><p className="body mt16">{body}</p></Reveal>
      <Reveal className="mt32" style={{ maxWidth: 760, margin: '32px auto 0' }}>
        <motion.div initial={{ scale: 0.96, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: dur.slow, ease: ease.standard }}>
          <ArtefactFrame name={name} flag={flag} cap={cap}>
            <div style={{ padding: '14px 6px 6px' }}>
              <HypTree highlight={-1} />
              <div style={{ textAlign: 'center', marginTop: 12 }}>
                <span style={{ fontSize: 11, color: 'var(--maroon)', background: '#FBF0B8', padding: '3px 10px', borderRadius: 4 }}>left as a working draft</span>
              </div>
            </div>
          </ArtefactFrame>
        </motion.div>
      </Reveal>
    </div>
  );
}

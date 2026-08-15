// Recurring content templates (build spec §3.7): stage overview, checklists,
// reading room, zoom-out frame.
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Reveal, StaggerGroup, StaggerItem, BeatHead, Icon, DownloadButton, ArtefactFrame } from './ui.jsx';
import { CHECKLISTS, ROLES } from '../data.js';
import { spring, ease, dur } from '../motion.js';

/* T1 — stage overview two-panel */
export function StageOverview({ name, why, doItems, haveItems, note }) {
  return (
    <div>
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

/* T4 — full checklist */
function ChecklistRows({ setKey, role }) {
  const data = CHECKLISTS[setKey];
  const filt = (rows) => rows.filter(r => role === 'Everyone' || r.role === role || r.role === 'Everyone');
  const Group = ({ label, rows }) => (
    <div className="checkgroup">
      <h3>{label}</h3>
      <div className="checkgroup__rule" />
      <AnimatePresence mode="popLayout">
        {filt(rows).map((r, i) => (
          <motion.div key={label + i} layout className={'checkrow' + (r.shown ? ' done' : '')}
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} transition={spring.ui}>
            <span className="checkrow__box" />
            <span className="checkrow__item"><span className="line" style={{ width: r.w + '%', display: 'inline-block', height: 12, verticalAlign: 'middle', background: 'var(--hair-2)', borderRadius: 4 }} /></span>
            {r.shown && <span className="checkrow__cov">Covered</span>}
            <span className="checkrow__role">{r.role}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
  return (<><Group label="Process" rows={data.process} /><Group label="Content" rows={data.content} /></>);
}

export function Checklist({ setKey, title, framing }) {
  const [role, setRole] = useState('Everyone');
  return (
    <div>
      <BeatHead eyebrow="What this stage covers" title={title} maroon />
      <Reveal><p className="body">{framing}</p></Reveal>
      <Reveal style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
        <div className="rolefilter">{ROLES.map(r => <button key={r} aria-pressed={role === r} onClick={() => setRole(r)}>{r}</button>)}</div>
      </Reveal>
      <ChecklistRows setKey={setKey} role={role} />
      <div style={{ marginTop: 24 }}><DownloadButton label="Download this checklist" /></div>
    </div>
  );
}

/* T4-strip — collapsed checklist */
export function ChecklistStrip({ setKey, label }) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState('Everyone');
  return (
    <Reveal className={'checkstrip' + (open ? ' open' : '')}>
      <button className="checkstrip__bar" onClick={() => setOpen(o => !o)}>
        {label}<Icon n="right" size={18} className="chev" style={{ marginLeft: 'auto', transition: 'transform .3s', transform: open ? 'rotate(90deg)' : 'none' }} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: dur.base, ease: ease.standard }} style={{ overflow: 'hidden' }}>
            <div className="checkstrip__body">
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
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
    <div>
      <Reveal><h2 className="lead" style={{ maxWidth: '22ch' }}>{heading}</h2></Reveal>
      <Reveal><p className="body mt16">{body}</p></Reveal>
      <Reveal className="mt32" style={{ maxWidth: 760, margin: '32px auto 0' }}>
        <motion.div initial={{ scale: 0.96, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: dur.slow, ease: ease.standard }}>
          <ArtefactFrame name={name} flag={flag} cap={cap}>
            {/* placeholder tree slide */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '20px 0' }}>
              <div style={{ background: 'var(--maroon)', color: '#fff', fontSize: 12, padding: '6px 16px', borderRadius: 6 }}>L1 hypothesis</div>
              <div style={{ display: 'flex', gap: 24 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
                    <div style={{ border: '1px solid var(--hair)', fontSize: 11, padding: '4px 12px', borderRadius: 4 }}>L2</div>
                    <div style={{ width: 60, height: 8, background: 'var(--hair-2)', borderRadius: 3 }} />
                    <div style={{ width: 60, height: 8, background: 'var(--hair-2)', borderRadius: 3 }} />
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, color: 'var(--maroon)', background: '#FBF0B8', padding: '3px 10px', borderRadius: 4, marginTop: 6 }}>left as a working draft</div>
            </div>
          </ArtefactFrame>
        </motion.div>
      </Reveal>
    </div>
  );
}

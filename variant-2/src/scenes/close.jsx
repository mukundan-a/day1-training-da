import React from 'react';
import { Reveal, StaggerGroup, StaggerItem, BeatHead, FenSlot, Icon, DownloadButton, Notch } from '../components/ui.jsx';
import { Scene } from '../components/frame.jsx';
import { useStore } from '../store.jsx';

export function X1() {
  const { state } = useStore();
  const notesN = state.notes.length;
  const scqN = [...state.scq.S, ...state.scq.C, ...state.scq.Q].filter(Boolean).length;
  const brN = state.branch.subclaims.filter(Boolean).length;
  const row = (what, kept, detail) => (
    <div className="trailcard">
      <span className="what">{what}</span>
      <span className="body-sm">{kept ? detail : 'Not taken this time. You can return to it at any point.'}</span>
      <span className={'stat ' + (kept ? 'kept' : 'skip')}>{kept ? 'kept' : 'skipped'}</span>
    </div>
  );
  const vault = [
    ['Day 0', ['SCQ template', 'Day 0 checklist']],
    ['Full-team kick-off', ['Hypothesis tree template', 'Kick-off checklist']],
    ['Core-team kick-off', ['Workplan template', 'Deliverable TOC template', 'Norms template', 'Checklist']],
    ['By role', ['Core-team checklist', 'PM checklist', 'PD checklist']],
  ];
  return (
    <Scene id="X1">
      <div className="beat" style={{ paddingTop: 24 }}>
        <BeatHead n="1" title="What you produced across the training" maroon />
        <Reveal><p className="body">These are the notes you kept, the SCQ you drafted, and the branch you built. Anything you skipped is marked rather than hidden.</p></Reveal>
        <StaggerGroup className="trail mt24" s={0.1}>
          <StaggerItem>{row('Your notes', notesN > 0, notesN + ' note' + (notesN === 1 ? '' : 's') + ' kept')}</StaggerItem>
          <StaggerItem>{row('Your SCQ', scqN > 0 && !state.scq.skipped, scqN + ' bullets, with a problem statement')}</StaggerItem>
          <StaggerItem>{row('Your hypothesis branch', brN > 0 && !state.branch.skipped, brN + ' sub-claim' + (brN === 1 ? '' : 's'))}</StaggerItem>
        </StaggerGroup>
      </div>

      <div className="beat band band--pink" style={{ padding: '40px 0' }}>
        <BeatHead n="2" title="The templates and checklists remain available for a real project" maroon />
        <Reveal><p className="body">Every template, format and checklist from the training is here, sorted by stage and by role. It is built for the first day of an actual project, not only for today, so you can download what is useful and take it with you.</p></Reveal>
        <StaggerGroup className="vault mt24" s={0.08}>
          {vault.map(([h, items]) => (
            <StaggerItem key={h} className="vaultgrp">
              <h4>{h}</h4>
              {items.map(it => <button key={it}><Icon n="download" size={15} /> {it}</button>)}
            </StaggerItem>
          ))}
        </StaggerGroup>
        <Reveal><div style={{ marginTop: 16 }}><DownloadButton label="Download everything" /></div></Reveal>
      </div>

      <div className="beat">
        <BeatHead n="3" title="Where the FEN project’s thinking eventually landed" maroon />
        <Reveal><p className="body">Everything in this training came from one real project. The SCQ, the hypothesis, and the tree you drilled a branch of became published work. This is where it ended up.</p></Reveal>
        <StaggerGroup className="reports mt24">
          {[1, 2].map(k => (
            <StaggerItem key={k}>
              <div className="report__cov"><FenSlot inline tag="FEN">published report {k}</FenSlot></div>
              <div className="report__t"><FenSlot inline tag="FEN">report {k} title</FenSlot></div>
              <span className="report__lk"><Icon n="ext" size={14} /> Open the report</span>
            </StaggerItem>
          ))}
        </StaggerGroup>
        <Reveal className="mt48" style={{ textAlign: 'center' }}>
          <Notch style={{ transform: 'scaleX(-1)' }} />
          <p className="body-lg" style={{ margin: '16px auto 0', maxWidth: '52ch' }}>
            That brings the training to a close. There is no score and no badge, since none were promised at the start. Everything you made, and everything in the vault, stays here for whenever a project’s first day is coming up.
          </p>
        </Reveal>
      </div>
    </Scene>
  );
}

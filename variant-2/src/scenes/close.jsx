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
      <span className="body" style={{ fontSize: 15 }}>{kept ? detail : 'Skipped. You can go back any time and do it.'}</span>
      <span className={'stat ' + (kept ? 'kept' : 'skip')}>{kept ? 'kept' : 'skipped'}</span>
    </div>
  );
  const vault = [
    ['Day 0', ['SCQ template', 'Day 0 checklist']],
    ['Full-team kick-off', ['Hypothesis tree template', 'Kick-off checklist']],
    ['Core-team kick-off', ['Workplan template', 'Deliverable TOC template', 'Norms template', 'Checklist']],
    ['By role', ['AN checklist', 'PM checklist', 'PD checklist']],
  ];
  return (
    <Scene id="X1">
      <div className="beat" style={{ paddingTop: 24 }}>
        <BeatHead n="1" eyebrow="Everything you made on Day 1" title="Here’s what you made" maroon />
        <Reveal><p className="body">Your notes, your SCQ, and the branch you built. Anything you skipped is marked, not hidden.</p></Reveal>
        <StaggerGroup className="trail mt24" s={0.1}>
          <StaggerItem>{row('Your notes', notesN > 0, notesN + ' note' + (notesN === 1 ? '' : 's') + ' kept')}</StaggerItem>
          <StaggerItem>{row('Your SCQ', scqN > 0 && !state.scq.skipped, scqN + ' bullets, plus a problem statement')}</StaggerItem>
          <StaggerItem>{row('Your hypothesis branch', brN > 0 && !state.branch.skipped, brN + ' sub-claim' + (brN === 1 ? '' : 's'))}</StaggerItem>
        </StaggerGroup>
      </div>

      <div className="beat band band--pink" style={{ padding: '56px 0' }}>
        <BeatHead n="2" eyebrow="Your vault" title="This part stays. Take it to a real project." maroon />
        <Reveal><p className="body">Every template, format and checklist you saw is here, sorted by stage and by role. Download what’s useful. It’s built for the actual first day of an actual project, not just for today.</p></Reveal>
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
        <BeatHead n="3" eyebrow="Where the project landed" title="The thinking you just walked through became this" maroon />
        <Reveal><p className="body">Everything in this training came from one real project. The SCQ, the hypothesis, the tree you built a branch of: they turned into published work. Here’s where it landed.</p></Reveal>
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
          <p className="body-lg" style={{ margin: '16px auto 0', maxWidth: '46ch' }}>
            That’s it. You’re done. No score, no badge, none of that, because we didn’t promise any. Everything you made and everything in your vault stays here. Come back to it whenever a project’s first day is coming up.
          </p>
        </Reveal>
      </div>
    </Scene>
  );
}

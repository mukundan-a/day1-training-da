/* ============================================================================
   chrome.js — simulated application surfaces

   These read as Outlook / Teams / SharePoint / PowerPoint / Excel / Forms
   through geometry alone: rail widths, column proportions, row rhythm.
   No product names, no logos, no labels inside the mocks.

   One rule: exactly one element per screen may carry .live (maroon).
   ========================================================================= */

(function (global) {
  'use strict';

  /* --- glyphs: 1px stroke, muted, and few ------------------------------ */

  const G = {
    mail:   'M2 4h12v8H2z M2 4l6 4 6-4',
    chat:   'M2 3h12v8H7l-3 3v-3H2z',
    folder: 'M2 4h4l1 2h7v7H2z',
    doc:    'M4 2h6l3 3v9H4z M10 2v3h3',
    grid:   'M2 3h12v10H2z M2 6.5h12 M2 10h12 M6 3v10 M10 3v10',
    deck:   'M2 3h12v8H2z M5 13h6',
    cal:    'M2 4h12v10H2z M2 7h12 M5 2v3 M11 2v3',
    play:   'M5 3l8 5-8 5z',
    pin:    'M8 2v6 M8 8l-3 3h6z M8 11v3',
    form:   'M3 2h10v12H3z M5 5h6 M5 8h6 M5 11h3'
  };

  function glyph(name, cls) {
    const d = G[name];
    if (!d) return '';
    return `<svg class="${cls || ''}" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
  }

  /* --- primitives ------------------------------------------------------ */

  // A stand-in for a line of text. Never actual words.
  function bar(w, mod) {
    return `<i class="bar${mod ? ' bar--' + mod : ''}" style="width:${w}"></i>`;
  }

  function bars(spec) {
    return spec.map(s => Array.isArray(s) ? bar(s[0], s[1]) : bar(s)).join('');
  }

  function navRail(n, active) {
    let s = '';
    for (let i = 0; i < n; i++) s += `<span class="${i === active ? 'on' : ''}"></span>`;
    return `<div class="w-rail">${s}</div>`;
  }

  function winBar(glyphName) {
    return `<div class="win__bar"><i></i><i></i><i></i>
      ${glyphName ? `<span class="win__glyph">${glyph(glyphName)}</span>` : ''}</div>`;
  }

  /* A message / mail row. state: '' | 'live' | 'new' | 'read' */
  function row(opts) {
    const o = opts || {};
    const cls = ['w-row', o.live ? 'is-live' : '', o.isNew ? 'is-new' : ''].filter(Boolean).join(' ');
    const delay = o.delay ? ` style="animation-delay:${o.delay}ms"` : '';
    return `<div class="${cls}"${delay}>
      <span class="w-row__av"></span>
      <span class="w-row__lines">
        ${bar(o.from || '52%', 'strong')}
        ${bars(o.lines || ['88%', '64%'])}
      </span>
    </div>`;
  }

  /* ============================ OUTLOOK ================================ */
  /* rail | message list ~30% | reading pane */

  /* Pads a list column with quiet rows so it reads as a real inbox rather
     than four items floating in white space. */
  function padRows(n) {
    const widths = [['44%', '78%'], ['36%', '86%'], ['50%', '70%'], ['40%', '82%'],
                    ['46%', '74%'], ['34%', '88%'], ['48%', '76%'], ['38%', '80%']];
    return Array.from({ length: n }, (_, i) => {
      const [f, l] = widths[i % widths.length];
      return `<div class="w-row" style="opacity:${Math.max(.32, 1 - i * .11)}">
        <span class="w-row__av"></span>
        <span class="w-row__lines">${bar(f, 'faint')}${bar(l, 'faint')}</span>
      </div>`;
    }).join('');
  }

  function outlook(o) {
    o = o || {};
    const given = (o.rows || []);
    const list = given.map(row).join('') + padRows(Math.max(0, 14 - given.length));

    const pane = o.pane === false ? '' : `<div class="w-pane" style="gap:0">
      <div style="display:flex;flex-direction:column;gap:5px;padding-bottom:9px;border-bottom:1px solid var(--rule-soft)">
        ${bar('54%', 'strong')}
        <div style="display:flex;gap:7px;align-items:center">
          <span class="w-row__av" style="width:13px;height:13px"></span>${bar('26%', 'faint')}
          <span style="flex:1"></span>${bar('14%', 'faint')}
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;padding-top:11px">
        ${bars(['96%', '92%', '88%', '94%', '70%'])}
        <div style="height:5px"></div>
        ${bars(['90%', '86%', '58%'])}
      </div>
      ${o.attach ? `<div style="margin-top:14px;display:flex;gap:7px;align-items:center;
          border:1px solid var(--rule-soft);border-radius:2px;padding:6px 8px;width:56%;color:var(--mute-2)">
        ${glyph('doc')}${bar('60%', 'faint')}</div>` : ''}
    </div>`;

    return `<div class="win">${winBar('mail')}
      <div class="win__body">${navRail(5, 0)}
        <div class="w-list w-list--n">${list}</div>${pane}
      </div>${o.toast || ''}</div>`;
  }

  /* ========================== TEAMS — CHANNEL ========================== */
  /* rail | channel list ~26% | conversation */

  function teamsChat(o) {
    o = o || {};
    const msgs = (o.messages || []).map(m => `
      <div class="w-row ${m.live ? 'is-live' : ''} ${m.isNew ? 'is-new' : ''}"
           ${m.delay ? `style="animation-delay:${m.delay}ms"` : ''}>
        <span class="w-row__av"></span>
        <span class="w-row__lines">${bar(m.from || '38%', 'strong')}${bars(m.lines || ['90%', '72%'])}</span>
      </div>`).join('');

    const chans = Array.from({ length: 12 }, (_, i) =>
      `<div class="w-row" style="padding:6px 8px;opacity:${i === 1 ? 1 : Math.max(.3, .9 - i * .09)}">
        <span class="w-row__lines">${bar(i === 1 ? '68%' : (46 + (i * 7) % 26) + '%', i === 1 ? 'strong' : 'faint')}</span>
      </div>`).join('');

    return `<div class="win">${winBar('chat')}
      <div class="win__body">${navRail(5, 1)}
        <div class="w-list" style="width:24%">${chans}</div>
        <div class="w-pane" style="padding:0;gap:0">
          <div style="flex:1;min-height:0;overflow:hidden;display:flex;flex-direction:column">
            ${msgs}${o.attached || ''}
          </div>
          <div style="flex-shrink:0;margin:8px;border:1px solid var(--rule);border-radius:3px;height:28px"></div>
        </div>
      </div>${o.toast || ''}</div>`;
  }

  /* ========================== TEAMS — MEETING ========================== */
  /* participant tiles across the top | main stage | optional side panel */

  function teamsMeeting(o) {
    o = o || {};
    const tiles = (o.tiles || []).map(t => `
      <div class="w-tile ${t.you ? 'is-you' : ''} ${t.absent ? 'is-absent' : ''}"><b>${t.id}</b></div>`).join('');

    const side = o.side ? `<div class="w-side">
      <span class="s-eyebrow" style="margin:0 0 4px">${o.side.title || ''}</span>
      ${(o.side.items || []).map((it, i) => `<div class="w-side__row" style="display:flex;gap:5px;align-items:baseline">
        <span style="font-size:9px;color:var(--mute-2)">${i + 1}</span>
        <span style="font-size:10px;color:var(--ink);line-height:1.35">${it}</span></div>`).join('')}
    </div>` : '';

    return `<div class="win">${winBar('chat')}
      <div class="win__body" style="flex-direction:column">
        <div class="w-tiles">${tiles}</div>
        <div style="flex:1;min-height:0;display:flex;border-top:1px solid var(--rule-soft)">
          <div class="w-pane" style="align-items:stretch;justify-content:center">
            <div style="flex:1;min-height:0;border:1px solid var(--rule-soft);border-radius:2px;
                        background:var(--fill);padding:14px;display:flex;flex-direction:column;gap:8px">
              ${o.stage || ''}
            </div>
          </div>${side}
        </div>
      </div>${o.toast || ''}</div>`;
  }

  /* ============================ SHAREPOINT ============================= */

  function sharepoint(o) {
    o = o || {};
    const rows = (o.tree || []).map((t, i) => `
      <div class="w-tree__row ${t.flag ? 'is-flagged' : ''} ${t.open ? 'is-open' : ''}"
           data-depth="${t.d || 0}" data-tree="${i}">
        ${glyph('folder')}<span>${t.n}</span>
      </div>`).join('');

    const files = Array.from({ length: 14 }, (_, i) =>
      `<div class="w-row" style="padding:6px 10px;opacity:${Math.max(.3, 1 - i * .1)}">
        <span style="color:var(--mute-2);display:flex;margin-right:2px">${glyph('doc')}</span>
        <span class="w-row__lines" style="justify-content:center">${bar((44 + (i * 9) % 34) + '%', 'faint')}</span>
        <span style="flex:0 0 46px">${bar('70%', 'faint')}</span>
      </div>`).join('');

    return `<div class="win">${winBar('folder')}
      <div class="win__body">${navRail(4, 2)}
        <div class="w-tree" style="width:44%;border-right:1px solid var(--rule-soft);flex-shrink:0">${rows}</div>
        <div class="w-pane" style="padding:0;gap:0" data-files>
          <div style="padding:7px 10px;border-bottom:1px solid var(--rule-soft);display:flex;gap:6px;align-items:center">
            ${bar('30%', 'faint')}</div>
          ${files}
        </div>
      </div></div>`;
  }

  /* ============================ POWERPOINT ============================= */

  function powerpoint(o) {
    o = o || {};
    const thumbs = Array.from({ length: o.thumbs || 5 }, (_, i) =>
      `<div class="w-thumb ${i === (o.at || 0) ? 'on' : ''}"></div>`).join('');

    return `<div class="win">${winBar('deck')}
      <div class="win__body">
        <div class="w-thumbs">${thumbs}</div>
        <div style="flex:1;min-width:0;display:flex;flex-direction:column">
          <div class="w-slide">${o.slide || ''}</div>
        </div>
        ${o.side || ''}
      </div></div>`;
  }

  /* ============================== EXCEL ================================ */

  function excel(o) {
    o = o || {};
    // two controls per row, sitting in a fixed trailing column
    const ctrl = n => o.controls
      ? `<div class="w-grid__c w-grid__c--ctrl">
           <button data-did="${n}" title="I have done something like this">${glyph('pin')}</button>
           <button data-sug="${n}" title="Suggest a source or activity">+</button></div>`
      : '';

    const rows = (o.rows || []).map((r, i) => {
      if (r === 'head') {
        return `<div class="w-grid__r w-grid__r--head"><div class="w-grid__c w-grid__c--n"></div>` +
          (o.cols || ['30%', '30%', '40%']).map(() => `<div class="w-grid__c">${bar('56%', 'strong')}</div>`).join('') +
          (o.controls ? `<div class="w-grid__c w-grid__c--ctrl"></div>` : '') + `</div>`;
      }
      if (r === 'empty') {
        return `<div class="w-grid__r w-grid__r--empty"><div class="w-grid__c w-grid__c--n"></div>` +
          (o.cols || ['30%', '30%', '40%']).map(() => `<div class="w-grid__c"></div>`).join('') + ctrl(i) + `</div>`;
      }
      return `<div class="w-grid__r"><div class="w-grid__c w-grid__c--n"></div>` +
        r.map(w => `<div class="w-grid__c">${w ? bar(w) : ''}</div>`).join('') + ctrl(i) + `</div>`;
    }).join('');

    return `<div class="win">${winBar('grid')}
      <div class="win__body"><div class="w-grid">${rows}</div>${o.side || ''}</div></div>`;
  }

  /* ============================= MS FORMS ============================== */

  function forms(o) {
    o = o || {};
    const groups = (o.groups || []).map(g => `
      <div style="border:1px solid var(--rule-soft);border-radius:3px;padding:10px 12px;display:flex;flex-direction:column;gap:7px">
        <span style="font-size:11px;font-weight:700;color:var(--ink-strong)">${g.q}</span>
        ${(g.opts || []).map(op => `<label style="display:flex;gap:7px;align-items:center;font-size:11px;color:var(--mute);cursor:pointer">
          <i style="width:9px;height:9px;border:1px solid var(--mute-2);border-radius:50%;display:block;flex-shrink:0"></i>${op}</label>`).join('')}
        ${g.free ? `<div style="border:1px solid var(--rule);border-radius:3px;height:26px"></div>` : ''}
      </div>`).join('');

    return `<div class="win">${winBar('form')}
      <div class="win__body"><div class="w-pane" style="gap:10px;overflow:auto">${groups}</div></div></div>`;
  }

  /* ========================= TOAST NOTIFICATION ======================== */

  function toast(o) {
    o = o || {};
    return `<div class="w-toast" style="animation-delay:${o.delay || 700}ms">
      <div style="display:flex;gap:6px;align-items:center;color:var(--mute-2)">
        ${glyph('chat')}${bar('44%', 'strong')}</div>
      ${bars(['92%', '76%'])}
      ${o.action ? `<button class="act" style="align-self:flex-start;margin:2px 0 0;padding:4px 11px;font-size:10px">${o.action}</button>` : ''}
    </div>`;
  }

  /* ---------------------------------------------------------------- */

  global.WIN = {
    glyph, bar, bars, row, navRail, winBar, toast,
    outlook, teamsChat, teamsMeeting, sharepoint, powerpoint, excel, forms
  };

})(window);

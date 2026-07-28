/* ============================================================================
   chrome.js — simulated application surfaces

   These have to read as Outlook / Teams / SharePoint / PowerPoint / Excel /
   Forms at a glance. Recognition comes from the structural furniture people
   actually navigate by — ribbons, breadcrumbs, column headers, composers,
   sheet tabs — not from labels. There is no product text anywhere.
   ========================================================================= */

(function (global) {
  'use strict';

  /* --- glyphs: 1px stroke, muted, used sparingly ----------------------- */

  const G = {
    mail:    'M2 4h12v8H2z M2 4l6 4 6-4',
    chat:    'M2 3h12v8H7l-3 3v-3H2z',
    folder:  'M2 4h4l1 2h7v7H2z',
    doc:     'M4 2h6l3 3v9H4z M10 2v3h3',
    grid:    'M2 3h12v10H2z M2 6.5h12 M2 10h12 M6 3v10 M10 3v10',
    deck:    'M2 3h12v8H2z M5 13h6',
    cal:     'M2 4h12v10H2z M2 7h12 M5 2v3 M11 2v3',
    play:    'M5 3l8 5-8 5z',
    pin:     'M8 2v6 M8 8l-3 3h6z M8 11v3',
    form:    'M3 2h10v12H3z M5 5h6 M5 8h6 M5 11h3',
    people:  'M6 7a2 2 0 100-4 2 2 0 000 4z M2 13c0-2 2-3 4-3s4 1 4 3 M12 6a1.5 1.5 0 100-3 1.5 1.5 0 000 3z',
    search:  'M7 12a5 5 0 100-10 5 5 0 000 10z M11 11l3 3',
    back:    'M10 3L5 8l5 5',
    down:    'M4 6l4 4 4-4',
    attach:  'M11 5L6 10a2 2 0 002 2l5-5a3 3 0 10-4-4L4 8a4 4 0 005 6',
    clock:   'M8 14A6 6 0 108 2a6 6 0 000 12z M8 5v3l2 1'
  };

  function glyph(name, cls) {
    const d = G[name];
    if (!d) return '';
    return `<svg class="${cls || ''}" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
  }

  /* --- primitives ------------------------------------------------------ */

  function bar(w, mod) {
    return `<i class="bar${mod ? ' bar--' + mod : ''}" style="width:${w}"></i>`;
  }

  function bars(spec) {
    return spec.map(s => Array.isArray(s) ? bar(s[0], s[1]) : bar(s)).join('');
  }

  /* deterministic pseudo-widths so nothing jitters between renders */
  function w(i, lo, hi) { return (lo + ((i * 37) % (hi - lo))) + '%'; }

  /* ---- window furniture ---- */

  function titlebar(o) {
    o = o || {};
    return `<div class="win__bar">
      <i></i><i></i><i></i>
      <span class="win__search">${glyph('search')}${bar('42%', 'faint')}</span>
      <span class="win__glyph">${glyph(o.glyph || 'doc')}</span>
    </div>`;
  }

  /* the ribbon: the single strongest Office cue */
  function ribbon(active, groups) {
    const tabs = Array.from({ length: 6 }, (_, i) =>
      `<span class="rb__tab ${i === (active || 0) ? 'on' : ''}">${bar(w(i, 46, 78), 'faint')}</span>`).join('');
    const tools = Array.from({ length: groups || 5 }, (_, i) =>
      `<span class="rb__tool"><i></i>${bar(w(i, 40, 72), 'faint')}</span>`).join('');
    return `<div class="rb"><div class="rb__tabs">${tabs}</div><div class="rb__tools">${tools}</div></div>`;
  }

  function navRail(n, active, glyphs) {
    const g = glyphs || ['mail', 'cal', 'people', 'doc', 'chat'];
    let s = '';
    for (let i = 0; i < n; i++) {
      s += `<span class="${i === active ? 'on' : ''}">${glyph(g[i % g.length])}</span>`;
    }
    return `<div class="w-rail">${s}</div>`;
  }

  /* ============================ OUTLOOK ================================ */

  function outlook(o) {
    o = o || {};

    const folders = Array.from({ length: 7 }, (_, i) =>
      `<div class="ol-folder ${i === 0 ? 'on' : ''}">${glyph('folder')}${bar(w(i, 44, 82), 'faint')}
        ${i < 2 ? `<em>${bar('100%', 'faint')}</em>` : ''}</div>`).join('');

    const given = o.rows || [];
    const listed = given.map((r, i) => {
      const cls = ['ol-msg', r.live ? 'is-live' : '', r.isNew ? 'is-new' : ''].filter(Boolean).join(' ');
      return `<div class="${cls}" ${r.delay ? `style="animation-delay:${r.delay}ms"` : ''}>
        <span class="ol-msg__top">${bar(r.from || '46%', 'strong')}<b>${bar('20%', 'faint')}</b></span>
        <span class="ol-msg__sub">${bar(r.subject || '72%', r.live ? 'live' : '')}</span>
        <span class="ol-msg__pre">${bar(r.preview || '88%', 'faint')}</span>
        ${r.attach ? `<span class="ol-msg__clip">${glyph('attach')}</span>` : ''}
      </div>`;
    }).join('');

    const filler = Array.from({ length: Math.max(0, 8 - given.length) }, (_, i) =>
      `<div class="ol-msg" style="opacity:${Math.max(.3, .85 - i * .1)}">
        <span class="ol-msg__top">${bar(w(i, 38, 60), 'faint')}<b>${bar('18%', 'faint')}</b></span>
        <span class="ol-msg__sub">${bar(w(i + 3, 56, 84), 'faint')}</span>
        <span class="ol-msg__pre">${bar(w(i + 5, 70, 94), 'faint')}</span>
      </div>`).join('');

    const pane = o.pane === false ? '' : `<div class="ol-read">
      <div class="ol-read__head">
        ${bar('62%', 'strong')}
        <div class="ol-read__from">
          <span class="av"></span>
          <span class="ol-read__who">${bar('54%', 'faint')}${bar('34%', 'faint')}</span>
          <span class="ol-read__when">${bar('100%', 'faint')}</span>
        </div>
      </div>
      <div class="ol-read__body">
        ${bars(['96%', '92%', '88%', '94%', '64%'])}
        <span class="gap"></span>
        ${bars(['90%', '86%', '93%', '48%'])}
      </div>
      ${o.attach ? `<div class="ol-att">${glyph('doc')}<span>${bar('60%', 'faint')}${bar('34%', 'faint')}</span></div>` : ''}
      <div class="ol-reply">${bar('16%', 'faint')}<i></i><i></i></div>
    </div>`;

    return `<div class="win">${titlebar({ glyph: 'mail' })}${ribbon(0, 6)}
      <div class="win__body">
        ${navRail(5, 0)}
        <div class="ol-folders">${folders}</div>
        <div class="ol-list">
          <div class="ol-list__head">${bar('34%', 'strong')}${glyph('down')}</div>
          ${listed}${filler}
        </div>
        ${pane}
      </div>${o.toast || ''}</div>`;
  }

  /* ========================== TEAMS — CHANNEL ========================== */

  function teamsChat(o) {
    o = o || {};

    const teams = Array.from({ length: 3 }, (_, t) => `
      <div class="tm-team">${glyph('people')}${bar(w(t, 52, 80), t === 0 ? 'strong' : 'faint')}</div>
      ${Array.from({ length: t === 0 ? 4 : 2 }, (_, c) =>
        `<div class="tm-chan ${t === 0 && c === 0 ? 'on' : ''}">${bar(w(c + t, 40, 74), 'faint')}</div>`).join('')}
    `).join('');

    const msgs = (o.messages || []).map(m => `
      <div class="tm-msg ${m.live ? 'is-live' : ''} ${m.isNew ? 'is-new' : ''}"
           ${m.delay ? `style="animation-delay:${m.delay}ms"` : ''}>
        <span class="av"></span>
        <span class="tm-msg__b">
          <span class="tm-msg__head">${bar(m.from || '26%', 'strong')}<em>${bar('14%', 'faint')}</em></span>
          ${bars((m.lines || ['92%', '74%']).map(l => [l, m.live ? '' : 'faint']))}
          ${m.card || ''}
        </span>
      </div>`).join('');

    return `<div class="win">${titlebar({ glyph: 'chat' })}
      <div class="win__body">
        ${navRail(5, 4)}
        <div class="tm-side">
          <div class="tm-side__head">${bar('44%', 'strong')}</div>
          ${teams}
        </div>
        <div class="tm-main">
          <div class="tm-main__head">${bar('26%', 'strong')}<span class="tm-tabs">
            ${Array.from({ length: 3 }, (_, i) => `<i class="${i === 0 ? 'on' : ''}"></i>`).join('')}</span></div>
          <div class="tm-thread">${msgs}${o.attached || ''}</div>
          <div class="tm-compose">
            <span class="tm-compose__box">${bar('30%', 'faint')}</span>
            <span class="tm-compose__tools"><i></i><i></i><i></i></span>
          </div>
        </div>
      </div>${o.toast || ''}</div>`;
  }

  /* ========================== TEAMS — MEETING ========================== */

  function teamsMeeting(o) {
    o = o || {};
    const tiles = (o.tiles || []).map(t => `
      <div class="w-tile ${t.you ? 'is-you' : ''} ${t.absent ? 'is-absent' : ''} ${t.speaking ? 'is-speaking' : ''}">
        <span class="w-tile__av">${t.absent ? '' : glyph('people')}</span>
        <b>${t.id}</b>
      </div>`).join('');

    const side = o.side ? `<div class="tm-panel">
      <div class="tm-panel__head">${o.side.title || ''}</div>
      ${(o.side.items || []).map((it, i) => `<div class="tm-panel__row">
        <span class="n">${i + 1}</span><span>${it}</span></div>`).join('')}
    </div>` : '';

    return `<div class="win">${titlebar({ glyph: 'chat' })}
      <div class="win__body" style="flex-direction:column">
        <div class="mt-bar">${bar('22%', 'faint')}<span class="mt-bar__t">${glyph('clock')}${bar('100%', 'faint')}</span></div>
        <div class="mt-body">
          <div class="mt-stage">
            <div class="mt-share">${o.stage || ''}</div>
            <div class="w-tiles">${tiles}</div>
          </div>
          ${side}
        </div>
        <div class="mt-controls">${Array.from({ length: 5 }, () => '<i></i>').join('')}<b></b></div>
      </div>${o.toast || ''}</div>`;
  }

  /* ============================ SHAREPOINT ============================= */

  function sharepoint(o) {
    o = o || {};
    const rows = (o.tree || []).map((t, i) => `
      <div class="sp-node ${t.flag ? 'is-flagged' : ''} ${t.open ? 'is-open' : ''}" data-depth="${t.d || 0}">
        <span class="sp-node__tw">${t.open ? glyph('down') : ''}</span>
        ${glyph('folder')}<span>${t.n}</span>
      </div>`).join('');

    const files = Array.from({ length: 9 }, (_, i) =>
      `<div class="sp-row" style="opacity:${Math.max(.32, 1 - i * .085)}">
        <span class="sp-row__i">${glyph(i % 3 === 0 ? 'deck' : i % 3 === 1 ? 'doc' : 'grid')}</span>
        <span class="sp-row__n">${bar(w(i, 42, 84), 'faint')}</span>
        <span class="sp-row__m">${bar(w(i + 2, 50, 80), 'faint')}</span>
        <span class="sp-row__o">${bar(w(i + 4, 40, 70), 'faint')}</span>
      </div>`).join('');

    return `<div class="win">${titlebar({ glyph: 'folder' })}
      <div class="sp-cmd">
        ${Array.from({ length: 4 }, (_, i) => `<span class="sp-cmd__b"><i></i>${bar(w(i, 42, 70), 'faint')}</span>`).join('')}
      </div>
      <div class="sp-crumb">${bar('12%', 'faint')}<span>/</span>${bar('16%', 'faint')}<span>/</span>${bar('20%', 'strong')}</div>
      <div class="win__body">
        <div class="sp-tree">${rows}</div>
        <div class="sp-files">
          <div class="sp-head"><span></span><span>${bar('40%', 'strong')}</span><span>${bar('48%', 'strong')}</span><span>${bar('44%', 'strong')}</span></div>
          ${files}
        </div>
      </div></div>`;
  }

  /* ============================ POWERPOINT ============================= */

  function powerpoint(o) {
    o = o || {};
    const at = o.at || 0;
    const thumbs = Array.from({ length: o.thumbs || 9 }, (_, i) =>
      `<div class="pp-thumb ${i === at ? 'on' : ''}"><b>${i + 1}</b><span>${
        i === at ? '' : bars([[w(i, 40, 72), 'faint'], [w(i + 2, 56, 86), 'faint']])}</span></div>`).join('');

    return `<div class="win">${titlebar({ glyph: 'deck' })}${ribbon(1, 5)}
      <div class="win__body">
        <div class="pp-rail">${thumbs}</div>
        <div class="pp-main">
          <div class="w-slide">${o.slide || ''}</div>
          ${o.notes !== false ? `<div class="pp-notes">${bars([['62%', 'faint'], ['44%', 'faint']])}</div>` : ''}
        </div>
        ${o.side || ''}
      </div>
      <div class="pp-status">${bar('14%', 'faint')}<span></span>${bar('10%', 'faint')}</div></div>`;
  }

  /* ============================== EXCEL ================================ */

  function excel(o) {
    o = o || {};
    const cols = o.cols || 4;
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

    const head = `<div class="xl-r xl-r--head"><span class="xl-c xl-c--n"></span>${
      Array.from({ length: cols }, (_, i) => `<span class="xl-c">${letters[i]}</span>`).join('')}</div>`;

    const body = (o.rows || []).map((r, i) => {
      const n = `<span class="xl-c xl-c--n">${i + 1}</span>`;
      if (r === 'title') {
        return `<div class="xl-r">${n}${Array.from({ length: cols }, (_, k) =>
          `<span class="xl-c xl-c--t">${bar(w(k, 54, 86), 'strong')}</span>`).join('')}</div>`;
      }
      if (r === 'empty') {
        return `<div class="xl-r xl-r--empty">${n}${Array.from({ length: cols }, () =>
          `<span class="xl-c"></span>`).join('')}</div>`;
      }
      return `<div class="xl-r">${n}${r.concat(Array(cols).fill('')).slice(0, cols).map(v =>
        `<span class="xl-c">${v ? bar(v, 'faint') : ''}</span>`).join('')}</div>`;
    }).join('');

    return `<div class="win">${titlebar({ glyph: 'grid' })}${ribbon(2, 5)}
      <div class="xl-formula"><span>fx</span>${bar('40%', 'faint')}</div>
      <div class="win__body"><div class="xl-grid">${head}${body}</div></div>
      <div class="xl-tabs">${Array.from({ length: 3 }, (_, i) =>
        `<span class="${i === 0 ? 'on' : ''}">${bar(w(i, 40, 70), 'faint')}</span>`).join('')}</div></div>`;
  }

  /* ============================= MS FORMS ============================== */

  function forms(o) {
    o = o || {};
    const groups = (o.groups || []).map((g, gi) => `
      <div class="fm-card ${g.active ? 'is-active' : ''}">
        <span class="fm-q"><b>${gi + 1}.</b>${g.q}</span>
        ${(g.opts || []).map((op, oi) => `<span class="fm-opt ${g.picked === oi ? 'picked' : ''}">
          <i></i>${op}</span>`).join('')}
        ${g.free ? `<span class="fm-free">${g.typed ? bar(g.typed, '') : ''}</span>` : ''}
      </div>`).join('');

    return `<div class="win">${titlebar({ glyph: 'form' })}
      <div class="fm-band"><span>${bar('34%', 'strong')}</span><span class="fm-prog"><i style="width:${o.progress || 0}%"></i></span></div>
      <div class="win__body"><div class="fm-scroll">${groups}
        <div class="fm-submit">${bar('100%', 'faint')}</div></div></div></div>`;
  }

  /* ========================= TOAST NOTIFICATION ======================== */

  function toast(o) {
    o = o || {};
    return `<div class="w-toast" style="animation-delay:${o.delay || 700}ms">
      <div class="w-toast__h"><span class="av"></span>${bar('44%', 'strong')}${glyph('chat')}</div>
      ${bars(['92%', '76%'])}
      ${o.action ? `<span class="w-toast__a">${o.action}</span>` : ''}
    </div>`;
  }

  global.WIN = {
    glyph, bar, bars, navRail, ribbon, titlebar, toast,
    outlook, teamsChat, teamsMeeting, sharepoint, powerpoint, excel, forms
  };

})(window);

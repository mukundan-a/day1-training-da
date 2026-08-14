/* ============================================================================
   comments.js — reviewer commenting, available on EVERY screen.

   This is the feature carried over from the existing mockup (variant 1), where
   reviewers leave feedback on the storyline itself. Variant 1 shares comments
   live through Firestore; for this self-contained variant we keep it simple and
   local: comments persist in this browser's localStorage and export to JSON /
   CSV / Markdown so a reviewer's notes can leave the machine. The DATA + export
   live here; app.js draws the pins, popovers and the comments drawer.

   Every comment records the screen it was pinned to (id + a human-readable
   name) and its position as a percentage of the screen box, so the Notes list
   and the exports read "1.7 · Draft your SCQ — 42%, 30%", never a raw key.
   ========================================================================= */

const Comments = (() => {
  const KEY = 'day1-v2-comments';
  const NAME = 'day1-v2-reviewer';
  const TYPES = ['Underlying Day 1 step', 'Training app design', 'Actual text I see', 'Other'];

  let list = load();

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* private mode: keep in memory */ }
  }

  function reviewer() { try { return localStorage.getItem(NAME) || ''; } catch { return ''; } }
  function setReviewer(n) { try { localStorage.setItem(NAME, n); } catch {} }

  function all() { return list.slice(); }
  function forScreen(id) { return list.filter(c => c.screenId === id); }
  function openCount() { return list.filter(c => !c.resolved).length; }

  function add({ screenId, screenName, x, y, text, type }) {
    const c = {
      id: 'c' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36),
      screenId, screenName,
      x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100,
      text: text.trim(), type: type || 'Other',
      who: reviewer() || 'Anon',
      ts: Date.now(), resolved: false, replies: []
    };
    list.push(c); save(); return c;
  }
  function reply(id, text) {
    const c = list.find(x => x.id === id); if (!c) return;
    c.replies.push({ who: reviewer() || 'Anon', text: text.trim(), ts: Date.now() }); save();
  }
  function toggleResolve(id) {
    const c = list.find(x => x.id === id); if (!c) return;
    c.resolved = !c.resolved; save();
  }
  function remove(id) { list = list.filter(x => x.id !== id); save(); }

  /* ---- exports --------------------------------------------------------- */
  function download(name, text, mime) {
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; document.body.appendChild(a); a.click();
    a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function exportJSON() { download('day1-v2-comments.json', JSON.stringify(list, null, 2), 'application/json'); }
  function exportCSV() {
    const head = ['reviewer', 'screen_id', 'screen_name', 'x_pct', 'y_pct', 'type', 'comment', 'resolved', 'timestamp'];
    const rows = list.map(c => [c.who, c.screenId, c.screenName, c.x, c.y, c.type, c.text, c.resolved, new Date(c.ts).toISOString()]
      .map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
    download('day1-v2-comments.csv', [head.join(','), ...rows].join('\n'), 'text/csv');
  }
  function exportMD() {
    const md = ['# Day 1 storyline (Variant 2) — reviewer comments', ''];
    const byScreen = {};
    list.forEach(c => (byScreen[c.screenId] = byScreen[c.screenId] || []).push(c));
    Object.keys(byScreen).forEach(sid => {
      md.push(`## ${sid} — ${byScreen[sid][0].screenName}`);
      byScreen[sid].forEach(c => {
        md.push(`- **[${c.type}]** ${c.text} — _${c.who}${c.resolved ? ', resolved' : ''}_`);
        c.replies.forEach(r => md.push(`  - ↳ ${r.text} — _${r.who}_`));
      });
      md.push('');
    });
    download('day1-v2-comments.md', md.join('\n'), 'text/markdown');
  }
  function importJSON(text) {
    try {
      const incoming = JSON.parse(text);
      if (!Array.isArray(incoming)) return { ok: false, msg: 'not a comments file' };
      const have = new Set(list.map(c => c.id));
      let added = 0;
      incoming.forEach(c => { if (c && c.id && !have.has(c.id)) { list.push(c); added++; } });
      save(); return { ok: true, added };
    } catch { return { ok: false, msg: 'could not parse' }; }
  }

  return { TYPES, all, forScreen, openCount, add, reply, toggleResolve, remove,
           reviewer, setReviewer, exportJSON, exportCSV, exportMD, importJSON };
})();

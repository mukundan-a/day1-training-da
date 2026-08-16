// Shared in-place text editing (variant 1 parity). While edit mode is on, the
// narration text on a scene becomes editable; a change is stored against a stable
// path and applied over the built-in wording on every render, so a change one
// person makes is what everyone else sees (through the same Firestore board that
// backs the comments). Paths key off a hash of the authored text, so they are
// stable across re-renders and reordering rather than fragile positional indices.
import { useEffect, useRef } from 'react';
import { useComments } from '../comments-store.jsx';

const SKIP = '.coachdock,.coachchat,.reviewdock,.reviewbanner,.cpop,.clayer,.herostage,.hyptree,.wptable,.exlayout,.checkgroup,.checkstrip,.outputs,.rolefilter,.mapstage,button,input,textarea,[data-noedit]';
const LEAF = 'h1,h2,h3,h4,p,li,blockquote';

function hash(s) { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }
const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();

export function TextEditLayer({ sceneId }) {
  const { edits, editMode, setEdit } = useComments();
  const applying = useRef(false);
  const pending = useRef(false);
  const editsRef = useRef(edits);
  editsRef.current = edits;

  useEffect(() => { document.body.classList.toggle('editing-mode', editMode); }, [editMode]);

  useEffect(() => {
    // observe a container that survives scene swaps; the per-scene .scene__inner
    // is replaced on every navigation, so binding to it would miss the next scene.
    const root = document.querySelector('.scene') || document.querySelector('.app');
    if (!root) return;

    const gather = () => {
      const scope = document.querySelector('.scene__inner');
      if (!scope) return [];
      return Array.from(scope.querySelectorAll(LEAF)).filter(el => {
        if (el.closest(SKIP)) return false;
        if (el.querySelector(LEAF)) return false;       // leaf only
        return norm(el.textContent).length > 0;
      });
    };

    const bind = (el, path) => {
      if (el._edBound) return;
      el._edBound = true;
      el.addEventListener('focus', () => { el._before = el.textContent; });
      el.addEventListener('blur', () => {
        if (!el.isContentEditable) return;
        const now = norm(el.textContent);
        if (now && now !== norm(el._before)) setEdit(path, now, el.dataset.orig);
        else if (!now) el.textContent = el._before || el.dataset.orig || '';
      });
      el.addEventListener('keydown', (e) => {
        if (!el.isContentEditable) return;
        if (e.key === 'Enter') { e.preventDefault(); el.blur(); }
        if (e.key === 'Escape') { el.textContent = el._before || el.dataset.orig || ''; el.blur(); }
      });
      el.addEventListener('click', (e) => { if (el.isContentEditable) e.stopPropagation(); });
    };

    const apply = () => {
      applying.current = true;
      const map = editsRef.current;
      gather().forEach(el => {
        // authored text (fresh React node shows it before we overwrite)
        if (!el.dataset.orig) el.dataset.orig = norm(el.textContent);
        const path = sceneId + '::' + hash(el.dataset.orig);
        el.setAttribute('data-edit', path);
        const over = map[path];
        if (over !== undefined) {
          if (el !== document.activeElement && norm(el.textContent) !== over) el.textContent = over;
          el.dataset.edited = '1';
        } else if (el.dataset.edited === '1') {
          if (el !== document.activeElement && norm(el.textContent) !== el.dataset.orig) el.textContent = el.dataset.orig;
          delete el.dataset.edited;
        }
        if (editMode) { el.setAttribute('contenteditable', 'true'); el.spellcheck = false; el.classList.add('ed-target'); bind(el, path); }
        else { el.removeAttribute('contenteditable'); el.classList.remove('ed-target'); }
      });
      requestAnimationFrame(() => { applying.current = false; });
    };

    apply();
    const obs = new MutationObserver(() => {
      if (applying.current || pending.current) return;
      pending.current = true;
      requestAnimationFrame(() => { pending.current = false; apply(); });
    });
    obs.observe(root, { childList: true, subtree: true, characterData: true });
    return () => { obs.disconnect(); document.querySelectorAll('.ed-target').forEach(el => { el.removeAttribute('contenteditable'); el.classList.remove('ed-target'); }); };
  }, [sceneId, editMode, edits]);

  return null;
}

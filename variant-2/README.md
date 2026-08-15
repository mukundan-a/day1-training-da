# Day 1 Craft — interactive training (Variant 2)

A real React + Framer Motion build of the Day 1 Craft training storyline,
built to the storyline sheet. Twenty scenes across five stages, two hands-on
exercises with a faked coach, and two hero films built on one shape-shifting
object (the hypothesis tree becomes a workplan, then a table of contents).

## Run and build

```
cd variant-2
npm install
npm run build        # bundles src/ into app.js + app.css (committed, static)
python3 -m http.server 8899   # http://localhost:8899/variant-2/
```

Netlify serves the committed bundle statically; no build runs on deploy.
`node_modules` is gitignored.

## What it is

- **Cover** that opens cold on the Analyst's desk, not an LMS splash.
- **Five stages**, 20 scenes, of two kinds: scannable reading scenes and full
  hands-on activities. Learning objectives open; each stage ends on its
  checklist; the real-project zoom-outs fold in.
- **Two hero films**, auto-playing on view: the shared problem statement
  becomes the L1 hypothesis (F3), and the tree tips into a workplan then a
  table of contents (C3), proving they are one object drawn three ways.
- **Two exercises** with a deterministic, faked coach that reacts to your own
  words and passes you by the second check (D4 SCQ, F4 branch).
- **Persistent shell**: journey rail, Docs and Notes drawers, comment mode,
  keyboard nav, and local persistence so your SCQ, branch and notes carry
  across scenes and resurface at the close.

## Content boundary

No FEN content is invented. Structural and instructional copy is written in
full; anything project-specific (the real SCQ, L1 hypothesis, problem
statement, branches, workplan, checklist items, reports) is a clearly marked
placeholder slot. The build spec lives at `docs/BUILD_SPEC.md`.

## Source layout

```
src/
  main.jsx App.jsx store.jsx        entry, shell, state + persistence
  motion.js coach.js data.js        motion tokens, faked coach, scene registry
  styles.css                        design system (type scale, dividers, Stage register)
  components/  ui shell frame templates activities heroes
  scenes/      welcome day0 kickoff coreteam close
```

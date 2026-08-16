# Day 1 Craft (Variant 2) — Handoff

An interactive, single-page web training that walks an analyst through the first
day of a Dalberg project, from the boot screen to the closing checklist. Built as
a committed static bundle; Netlify serves it, nothing builds on deploy.

This document is the entry point for the next person (or the next chat). It covers
how to run and rebuild it, how the code is laid out, the design rules the content
must obey, and the state of the most recent round of feedback.

---

## 1. Run and rebuild

```bash
cd variant-2
npm install          # first time only; node_modules is gitignored
node build.mjs       # writes app.js + app.css (committed artefacts)
```

- Open `variant-2/index.html` directly, or serve the folder. There is no dev
  server; `index.html` loads the committed `app.js` and `app.css`.
- **You must run `node build.mjs` after editing anything in `src/` and commit the
  regenerated `app.js` / `app.css`.** Netlify does not build — it serves the
  committed bundle. Forgetting this ships stale UI.
- `build.mjs --dev` produces an unminified bundle for debugging.

### Smoke test (headless)

Playwright + the pre-installed Chromium are available in this environment:

```bash
node smoke.mjs   # see scratchpad examples; launch chromium with
                 # executablePath /opt/pw-browsers/chromium-1194/chrome-linux/chrome
                 # and open file:///…/variant-2/index.html (absolute path — cwd
                 # resets to the repo root between shell calls, which otherwise
                 # loads variant 1 at the repo root instead of variant 2)
```

Navigation is driven by the on-screen Continue button (and `nav()`), **not** by
setting `location.hash` — the store only reads the hash once, on boot. To walk the
app in a test, click `.spine .continue:not([disabled])` scene by scene.

---

## 2. Stack

- **React 18.3.1** + **Framer Motion 11.3.19**, bundled by **esbuild 0.23.1**
  (`build.mjs`, IIFE, `jsx: automatic`).
- State: React Context + `useReducer` in `src/store.jsx`, mirrored to
  `localStorage` under `day1craft.v1`. The current scene is also written to the
  URL hash (`#/scene/<id>`); the hash is authoritative **on boot only**.
- Reviewers are never locked out: `unlockedStages` is forced to all stages.
- Boot is gated once per tab via `sessionStorage['day1.booted']`.

---

## 3. File map

```
src/
  main.jsx            entry: imports styles.css, mounts <App/>
  App.jsx             shell wiring: nav, drawers, map, boot, ReviewDock, keyboard
  store.jsx           reducer + persistence (scenes, notes, scq, branch, comments)
  data.js             STAGES, SCENES registry, DOCS, ROLES, CHECKLISTS (real, from PDF)
  motion.js           spring / ease / dur presets
  coach.js            deterministic faked-coach heuristics (no real model)
  styles.css          the whole design system (tokens at :root)

  components/
    ui.jsx            Icon set, Reveal, Stagger, BeatHead, FenSlot, ArtefactFrame…
    frame.jsx         <Scene> wrapper + UI context + WIDTHS per variant
    shell.jsx         TopRail, SceneHeader, Spine, NotchWipe, MapOverlay, RightRail
    boot.jsx          cinematic boot sequence
    heroes.jsx        HypTree (the real hypothesis tree), HeroA (tree→workplan→toc),
                      HeroB (problem→hypothesis→tree), Fork/VFork connectors
    exercise.jsx      SCQExercise + BranchExercise + CoachChat (floating chatbot)
    templates.jsx     StageOverview, Checklist(+Strip), ZoomOut
    comments.jsx      CommentLayer (per-scene pins) + ReviewDock (reviewer tooling)

  scenes/
    index.jsx         id → component map
    welcome.jsx       W1 cold open, W2 objectives, W3 five stages
    day0.jsx          D1 overview, D2 reading room, D3 SCQ, D4 SCQ exercise, D5 close
    kickoff.jsx       F1..F6 (hypothesis tree, branch exercise, real Day-1 tree)
    coreteam.jsx      C1..C5 (kick-off deck, tree→workplan→toc, norms, close)
    close.jsx         X1
```

Scenes are grouped into five stages (`welcome / day0 / kickoff / coreteam /
close`) with three screen registers, marked by the scene `chip`:

- **Read** — clinical information, tight reading column.
- **Watch** — a hero film that plays itself once on view.
- **Hands-on / Recap** — an exercise or a stage-closing checklist.

---

## 4. Design rules (do not drift)

These come from repeated, explicit direction. Breaking them is what earlier
rounds got sent back for.

1. **No invented FEN content.** The proposal text, problem statement, SCQ bullets,
   hypothesis labels, checklists-of-facts — none of it is real. Use placeholders:
   `FenSlot` / `ScaffoldSlot`, or generic method text (about *how* the work is
   done, never *what* FEN concluded). The **checklists and learning objectives in
   `data.js` are the exception** — those are transcribed from the real Day 1
   codification material and are allowed verbatim.
2. **Voice is a calm tour guide, not punchy SaaS.** Full sentences, flowing lead
   lines, no imperative "Now you do it" / "Watch this". **No em dashes.**
3. **Reviewers are the audience for the exercises.** They auto-play a demo once on
   view, marked by a small "Exercise demo" sticker. No fourth-wall ("watch
   someone", "now you try"), no foreign cursor.
4. **One fill per screen, pyramid typography.** Big objectives, bold key phrases,
   ruthless hierarchy, minimal negative space. Two parallel type scales that never
   overlap (content > shell), all tokenised at `:root`.
5. **Maroon is a content pigment.** Its only kinetic use is the stage notch-wipe.
6. **Everything is commentable**, and comments carry structured metadata so they
   can be queried later.

The Dalberg register: maroon `#881946`, deep `#41021E`, pink `#D3618F`, soft
`#F6DFE9`, grey `#414244`; Aptos font fallback; the stepped "notch" mark.

---

## 5. The hypothesis tree (`HypTree`)

`components/heroes.jsx`. A left-to-right issue tree: one root claim forks to three
sub-hypotheses, each forks to two testable claims, with elbow connectors that draw
themselves (`Fork` = horizontal 1→n SVG bracket, animated via `pathLength`).
`highlight` marks one branch as "your branch"; `animate={false}` renders it static
(used inside the branch exercise). It is the shared visual across F3 (grows out of
the problem statement), F4 (the branch you drill), and F5 / the ZoomOut frame.

`HeroA` is the C3 film: the tree tips into a **workplan** (columns: Workstream /
Owner / Source of insight) and then the deliverable **table of contents**, with the
three branch labels keeping identity across the morph via shared `layoutId`.

---

## 6. The coach (`CoachChat`)

`components/exercise.jsx`. A floating chat panel, fixed bottom-right, above the
Spine so it never covers Continue. It shows a running conversation of coach turns
(verdict pill + lines) and a typing bubble while it "reads". It minimises to a
pill. The verdicts are deterministic heuristics from `coach.js` — there is no real
model, and the header says "faked for the mockup". Both exercises write their
drafts to real state so the work carries to the stage close.

---

## 7. Reviewer tooling — comments + shared text edits

Kept deliberately separate from Docs and Notes (which simulate what a real learner
sees). The **ReviewDock** is a dashed, **top-right** control marked "Reviewer
tools". It holds the reviewer's name, two mutually exclusive modes (Comment /
Edit text), the edited-strings list, and the export buttons.

**Shared board (Firestore).** Both comments and text edits live on the same
Firestore project variant 1 uses (`day1-wireframe`), on board **`variant2`** (a
separate board from variant 1's `main`, so the two storylines never mix). Anonymous
auth gives each browser a stable identity; the security rules
(`firestore.rules` at the repo root) accept any board id, require comment `type` in
`[concept|flow|screen|copy]` (mapped from the four display categories in
`comments-store.jsx`), and only let comment updates touch `resolved`/`replies` — so
**moving a pin is delete+recreate**, not an update. If Firebase can't load
(offline, blocked), everything falls back to this browser's `localStorage` and the
JSON/CSV export still carries the work out. The panel shows a **Shared / This
device only** status pill, and reminds reviewers to **download JSON at the end of
every session** while cloud fidelity is still being hardened.

- `src/live.js` — the Firestore adapter (comments + edits collections, dynamic
  `import()` of the Firebase SDK from gstatic, so it stays external to the bundle).
- `src/comments-store.jsx` — `CommentsProvider`: subscribes to both collections,
  merges local + remote (remote wins), exposes comments, edits, mutators, reviewer
  name, `source`, and `editMode`.
- `src/components/comments.jsx` — `CommentLayer` (per-scene pins, drag, threads,
  resolve/delete) + `ReviewDock`.
- Comment metadata: stage, scene, nearest heading, category, who, position,
  timestamp, replies.

**Shared text editing** (`src/components/edits.jsx`, `TextEditLayer`). Edit mode
makes the narration text on a scene editable in place; a change is stored against a
**hash of the authored text** (`sceneId::<hash>`, stable across re-renders and
reordering — not a fragile positional index) and applied over the built-in wording
on every render, so one person's change is what everyone sees. It observes a stable
container (`.scene`, not the per-scene `.scene__inner`, which is swapped on every
nav) and re-applies overrides after React re-renders. Dynamic/animated regions
(hero films, exercises, checklists, the tree) are excluded via the `SKIP` selector.
`Escape` exits; the edited-strings list in the panel offers per-edit **reset**.

**Visibility.** `node variant-2/tools/live-dump.mjs` signs in anonymously and
prints the current comments and edits on the board — use it to see review state
(and any live text edits) from outside the app. It honours `HTTPS_PROXY` +
`NODE_EXTRA_CA_CERTS` in a proxied sandbox, and works directly on a normal machine.

---

## 8. State of the last feedback round

All of the following were requested together and are done in this branch:

- Boot elevated (power-on, breathing field, drifting orbs, draw-on wipe, light
  sweep, ring reveal).
- W1 reframed as a matter-of-fact "guided simulation of a Dalberg project"; the
  project (FEN) is **not** named until D2, where you are "staffed onto" it.
- Density pass: smaller type scale, wider content columns, tighter spacing, less
  scrolling (tokens in `styles.css :root`, `WIDTHS` in `frame.jsx`).
- Real `HypTree` replaces the old three-floating-boxes diagram everywhere.
- C3 workplan gained the third column (Source of insight); "one object, three
  ways" phrasing removed entirely.
- SCQ demo enters multiple bullets per S/C/Q and states that the problem statement
  is written straight from the SCQ.
- Coach is now a floating chatbot.
- PD note reworded ("the PDs also send you a note in which they outline how each of
  them will distribute their responsibilities") and moved upfront into the D2
  documents; removed from the D5 close.
- Comment tool moved to the reviewer-only ReviewDock, made draggable, with a clear
  on/off banner and threads.

### Follow-up round (also in this branch)

- Opening film no longer falls to a dead static grid under reduced motion: it plays
  the same tree → workplan → contents sequence with gentle cross-fades, and the
  "drawn three ways" phrase is gone.
- Comments moved onto the shared Firestore board (see §7), with local fallback,
  reviewer name, live/local status, and a session-end JSON export reminder.
- Review control moved to the top-right.
- In-place shared text editing added (see §7), with the `live-dump` visibility tool.
- `index.html` assets carry a `?v=` cache-buster so a normal refresh always picks up
  a new deploy (bump the token when you ship). Netlify serves the repo root; the app
  lives at **`/variant-2/`** (the bare domain is variant 1).

### Known follow-ups / ideas (not yet done)

- The hero films are timer-driven; on very slow machines the phase timings could be
  tuned or made scroll-driven.
- `HypTree` scrolls horizontally under ~640px; a stacked small-screen layout would
  be nicer than a scroll.
- Real FEN artefacts (highlighted PDFs, the actual Day 1 tree, filled checklists)
  are still placeholders awaiting cleared content.
- Comment export is client-side download only; there is no shared backend.

---

## 9. Gotchas

- **Rebuild + commit the bundle** after any `src/` change (see §1).
- Absolute `file://` path in headless tests, or you load variant 1 by mistake.
- The store reads the hash only on boot; drive navigation through the UI.
- `node_modules` is gitignored; run `npm install` in a fresh clone before building.

# Day 1 Craft — storyline mockup (Variant 2)

A **clickable, mostly-visual** prototype of Dalberg's "Day 1 Craft" training,
built to the uploaded `PROMPT.md` + `README.md` spec. A reviewer can click
through all 33 screens end to end and understand what each one does — from
layout and structure, not paragraphs.

This is a sibling to the existing wireframe in the repo root ("variant 1").
Variant 1 is a **non-clickable storyboard** where everything plays as a loop.
Variant 2 is the **clickable storyline** the new spec asks for: you actually do
the two exercises, open docs, take notes, and trigger the animations.

```
python3 -m http.server 8899   # then open http://localhost:8899/variant-2/
```
Static site — no build, no dependencies, no backend. Also opens straight from
disk (plain script tags).

---

## Files

```
variant-2/
  index.html         shell — four classic scripts, one stylesheet
  assets/
    app.css          design system (palette + type carried over from variant 1)
    data.js          the 33 screens, stages, docs, checklists, icons
    coach.js         the FAKED AI coach for the two exercises
    comments.js      reviewer comments (localStorage) + JSON/CSV/MD export
    app.js           render, navigate, journey rail, drawers, animations, pins
```

---

## Screens built — all 33, in order

- **Stage 0 · Welcome** (0.1–0.3): three-panel welcome; why Day 1 matters with
  staff-quote placeholders; the five-stage intro (reuses the journey tracker).
- **Stage 1 · Day 0** (1.1–1.10): splash; overview two-panel; document list;
  **PDF reader** for the proposal and context brief (highlighted passages +
  notes panel); SCQ intro; **AI EXERCISE — draft your SCQ**; SCQ conclusion vs.
  the real FEN one; role-split checklist; PD-split note.
- **Stage 2 · Full-team kick-off** (2.1–2.9): splash; why-it-matters; SCQs side
  by side (yours pulled in); shared problem statement; **ANIMATION — problem
  statement morphs into the L1 hypothesis** with branch stubs; **AI EXERCISE —
  build an L2 branch**; **ZOOM-OUT — the real Day 1 tree** in a PowerPoint frame;
  conclusion with your tree + coach read; checklist.
- **Stage 3 · Core-team kick-off** (3.1–3.8): splash; overview; the IKO deck in
  a flippable PowerPoint frame; **ANIMATION — tree tips over into an owned
  workplan**; **ANIMATION — workplan converts into a deliverable TOC** (with the
  "one object, three views" line and the folded-in Week-1 note); norms example;
  conclusion; checklist.
- **Stage 4 · Close** (6.1–6.3): the trail of everything you made (skipped items
  shown as skipped); the vault of templates/checklists; the close on the two
  published FEN reports.

## Recurring shell — built once, reused everywhere

- **Journey rail** — five stages, current active, done ones checked, future ones
  locked; jump-to-stage by clicking any unlocked stage. Reappears on every screen.
- **Docs tab** — persistent; holds the proposal, context brief, IKO deck and the
  PD-split note; opening one jumps to its reader.
- **Notes panel** — persistent; notes taken while reading the proposal/brief are
  kept and are one click away (the same panel) inside the SCQ exercise.
- **Comments** — the feature carried over from variant 1, available on **every**
  screen: turn on Comment mode, click anywhere to drop a pin, choose a type,
  reply, resolve, and export to JSON / CSV / Markdown.
- **Overview** screens (what you'll do / what you'll have) and **checklist**
  screens (role-split, filterable, with a "simulated here" tag on items a screen
  actually covered) follow one template each.

## What I reused from the existing mockup (variant 1)

- **The commenting concept and its vocabulary** — pin-in-place, comment types
  ("Underlying Day 1 step / Training app design / Actual text I see / Other"),
  reply, resolve, and the round-trippable JSON/CSV/MD export. Variant 1 shares
  comments live through Firestore; this self-contained variant keeps them in
  `localStorage` so it runs with zero setup — see the judgment call below.
- **The design system** — the exact palette (soft-pink focal, maroon = live,
  pink = comments, greys = structure), the Aptos type stack, the notch mark, the
  one-focal-element-per-screen discipline, and the "one yellow, used once" rule
  (it appears only on the real Day 1 slide).
- **The no-build, classic-script-tags stack** — no framework, no bundler.

## What I faked, and how

- **The AI coach** (`coach.js`) — no model is wired in, per the prompt. It reads
  the user's draft with cheap heuristics (is each of S/C/Q filled? is the
  question phrased as a question? are the tree's sub-claims statements rather than
  questions, and is at least one testable?), references what they actually typed,
  and lets them pass once it's "good enough" — usually the second Check, or the
  first if the draft is already substantial. Phrasing is lightly randomised. Each
  coach panel is stamped "faked for mockup". The interaction *shape* — type →
  Check → specific feedback → pass — is the point.
- **Every artefact** — proposals, briefs, decks, slides, the workplan, the tree
  are placeholder frames (PDF-reader chrome, PowerPoint frames, tables) filled
  with short labels and captioned as placeholders. No real FEN content is sourced.

## Animations (deliberate and sparing)

Only the transitions that carry teaching weight are animated; everything else is
static or a simple fade.
- **2.5** problem statement morphs into the L1 hypothesis, then branch stubs fade in.
- **3.4** the hypothesis tree tips over into a workplan (each branch lands as a
  row) and the owner column fills in.
- **3.5** the workplan converts into a deliverable TOC (each workstream → a
  section). The tree, workplan and TOC share one data model (`STREAMS` in
  `app.js`) so it genuinely reads as one object drawn three ways.
All three are replayable (Play / Replay) and auto-play once on arrival.

## Judgment calls

- **Comments are local, not live.** Variant 1's Firestore board needs project
  config and network the sandbox can't reach. For a self-contained folder that
  runs from disk, I backed comments with `localStorage` + file export instead.
  The pin/type/reply/resolve/export UX matches variant 1; only the transport
  differs. If this variant is adopted, the Firestore layer from `../assets/live.js`
  can be dropped in behind the same `Comments` API.
- **A stage unlocks in the rail once you navigate to it** (tracked by `maxStage`),
  so a first-time reviewer walks the five stages in order but can jump back freely.
- **The SCQ exercise pre-fills one bullet in each of S/C/Q** (per the spec's
  "one or two pre-filled to give a headstart"); the tree exercise starts empty
  and the user is assigned the "economics" branch.
- **State persists in `localStorage`.** The SCQ, tree branch and notes carry
  across stages and resurface in the side-by-side (2.3), the conclusions (1.8,
  2.8) and the closing trail (6.1). Clear site data to start fresh.
- **Durations read `XX min`** throughout — nothing here has been timed, matching
  variant 1's rule that a number on screen would read as a commitment.

## Open questions surfaced on-screen (from the spec, not resolved here)

One SCQ or several (1.7) · whether the checklist lives on the Hub (1.9) · where
the vault actually lives (6.2). Each is shown as a small on-screen note rather
than silently decided.

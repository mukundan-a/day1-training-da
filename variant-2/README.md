# Day 1 Craft — storyline mockup (Variant 2)

A clickable walk through the Day 1 Craft training storyline, for internal
alignment. Dalberg **Stage** register. Built to the uploaded `PROMPT.md` +
storyline sheet.

```
python3 -m http.server 8899   # http://localhost:8899/variant-2/
```
Static site. No build, no dependencies. Opens from disk too.

## How it reads

- A **cover** orients anyone cold: what this is, who you are, the five stages.
- Then each stage is **3 to 5 screens** of two kinds:
  - **Info screens** club several beats into one scannable scroll.
  - **Activity screens** hold the two exercises.
- **Learning objectives** open the training; each stage ends on its **checklist**.
  The real-project **zoom-out folds into that checklist screen**.
- **Motion plays itself** on arrival. Scrolling carries you through; clicks are few.

## Principles held

- **Placeholders only.** No content is invented. Every problem statement, SCQ
  bullet, L1 hypothesis, branch, workplan row, norm and checklist item is a
  bracketed placeholder. The mockup shows the shape.
- **Sparse copy.** Terse labels, no em dashes, signposts in the gutter, never
  inside the mock.
- **Comments anywhere.** Turn on Comment, click any screen, pin a note. Reply,
  resolve, export to JSON / CSV / Markdown. Persisted locally.
- **Stage register.** Soft-pink fills, rounded cards, quiet shadows, pill
  buttons, the notch, Aptos. Palette and tokens from the Dalberg brand system.

## Files

```
index.html      shell
assets/
  app.css       Stage design system, chaptered scroll, auto-play reveals
  data.js       stages, scenes, docs, checklists (structure only)
  coach.js      faked coach (reacts to your own words, no model)
  comments.js   local comments + JSON/CSV/MD export
  app.js        render, navigate, drawers, comments, animations
```

## Faked, on purpose

- **The coach** reads what you typed and passes you once the draft is good
  enough. No model, stamped "faked".
- **Every artefact** is a captioned placeholder frame (PDF, deck, tables).

## Judgment calls

- Comments are local, not the Firestore board from variant 1; same UX, the live
  layer can drop in behind the same `Comments` API.
- State (SCQ, tree branch, notes) persists in `localStorage` and resurfaces in
  later scenes. Clear site data to reset.
- Durations read `XX min`. Nothing is timed.

## Open questions (shown in the gutter, not decided)

One SCQ or several · whether the checklist lives on the Hub · where the vault
lives.

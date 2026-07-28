# Day 1 — interactive wireframe

A click-through of the Day 1 Craft training, built from the storyboard deck so the team can
respond to **the concept**, not to prose or pixels. 55 screens across six groups.

Static site. No build step, no dependencies, no backend.

---

## Reviewing

Three views, in the top bar:

| | |
|---|---|
| **Walk** | One screen at a time. `←` `→` to move. |
| **Map** | All 55 screens as a contact sheet, grouped by stage, with comment counts. |
| **Notes** | Every comment, filterable by type, exportable. |

Turn on **Comment**, then click anywhere on a screen to drop a pin. Comments are typed:

- **Concept** *(default)* — is this the right thing to teach here? Is this how Day 1 should work?
- **Flow & state** — wrong order, wrong thing persisting, missing screen
- **Screen mechanics** — layout, affordance, what is on screen
- **Copy** — the words

The default is Concept because that is the level this is for.

Notes live in your browser only. Nothing is sent anywhere and there is no login. **Export** gives
CSV, Markdown or JSON. Drop several reviewers' JSON exports into the same panel to merge them into
one CSV, sorted by screen.

Every screen has its own URL (`#s2f4c`), so a comment can always name a screen.

---

## Conventions

**Colour carries meaning, not decoration.**

- Maroon `#881946` — the one live affordance on a screen, and the notch. If a screen shows more
  than one maroon mark, the screen is doing too much.
- Pink `#D3618F` — reviewer comments. Nothing else.
- One yellow, once, on the real Day 1 slide, because the highlight *is* the artefact.
- Everything else is grey.

**No copy.** Every message, email, definition and annotation is a spec of what the copy must do,
in twelve words or fewer, in the column beside the screen. Structural lists — checklist items,
agenda lines, folder names, learning objectives — are kept, compressed to their shortest correct
form. Replacing those with placeholders would have left those screens empty and un-reviewable.

**One product frame.** Every screen, including the simulated Outlook and Teams ones, sits inside
the same shell: stage name and progress at the top, single primary action bottom-right, state rail
bottom-left. Microsoft surfaces render *inside* that well as windows — the learner is never dropped
into a simulation; the app always holds the frame.

**Five interactions**, and no others: `READ` · `WATCH` · `EXPLORE` · `DO` · `DECIDE`.
`DO` produces something the app carries forward. `DECIDE` does not.

**Chrome recognises by arrangement**, not by text. Correct proportions, a handful of 1px glyphs,
no labels inside the mocks.

---

## State is real

Three threads persist, so nothing about persistence has to be explained in words:

| Thread | Written | Returns |
|---|---|---|
| Your SCQ | Day 0, frame 5 | Full-team kick-off, frame 2 — as your own card |
| Hypothesis tree | Full-team kick-off, frame 5 | Storyline scrub, and the Week 1 branch that turns red |
| Preferences | Core team kick-off, frame 2 | Core team kick-off, frame 7 — beside the team's |

The rail at the bottom-left of every screen shows what the app is holding. It turns maroon on the
screen that consumes it.

---

## Running it

Any static server:

```
python3 -m http.server 8899     # then open http://localhost:8899
```

It also opens directly from disk — scripts are plain `<script>` tags, nothing is fetched.

### Netlify

Connect the repo. No configuration needed; `netlify.toml` publishes the root with no build command.

---

## Files

```
index.html          shell
netlify.toml        publish root, no build
assets/
  app.css           design system and every component
  chrome.js         simulated Outlook / Teams / SharePoint / PowerPoint / Excel / Forms
  content.js        the 55 screens — intent lines, copy specs, structure
  comments.js       comment layer, export, multi-reviewer merge
  app.js            render, navigate, state threads, per-screen behaviour
```

To change what a screen says or does, `content.js` is almost always the only file to touch.

---

## Open decisions

Five, carried over from the deck's build notes and content notes. The **Open decisions** panel in
the Map view lists them and links to each screen. Nothing is resolved.

## Content issues found in the deck

Flagged in the wireframe rather than silently fixed:

- Four stage-transition screens all read *"Now onto the second stage!"*
- The stage map gives Core team KO, PD alignment and Week 1 the same description
- The core team kick-off shows the morning's agenda, contradicting the three outcomes the PM names
  on the same screen. Rendered as the PM states them, with the conflict noted.
- "Six stages" in the intro against five boxes on the map
- Every duration reads `X mins`. The map here uses the numbers given in each stage intro
  (6 / 10 / 10 / 3 / 2), which total about half an hour.
- Every per-stage intro screen is titled "Stage 0 screen", whatever the stage

## Not yet built

- Question set and norms categories for the core team kick-off — the deck is still to be uploaded
- The real Day 1 slide is shown in the previous template; whether to re-render it is an open decision

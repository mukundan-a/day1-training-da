# Day 1 — interactive wireframe

A click-through of the Day 1 Craft training, built from the storyboard deck so the team can respond
to **the concept** rather than to prose or pixels. 55 screens across seven parts.

Static site. No build step, no dependencies, no backend.

---

## Views

| | |
|---|---|
| **Home** | What this is and the four ways in. |
| **Recap** | The agreed "codified Day 1" table, kept as written, with small flags where the walkthrough differs. |
| **Storyboard** | The seven stages laid left to right as a journey. Open one for what happens in it, what the user puts in, what comes out, and each screen in order with a real scaled-down render of it. |
| **Walkthrough** | One screen at a time. Arrow keys, the two buttons, or click either faded edge of the screen. |
| **Notes** | Every comment, filterable, exportable, importable. |

Nothing inside the panel is clickable. Anything that would be interactive plays as a loop, so you
see the whole thing without having to work it.

---

## Commenting

Switch on **Comment**, then click anywhere to drop a pin — on a screen, on the line above it, on
the notes beside it, on a home card, a recap row or a stage card. A comment can optionally say what
it is about: **Underlying Day 1 step**, **Training app design**, **Actual text I see**, **Other**.

Every comment records the place it was left in plain words, so the Notes list and the exports read
"Full-team kick-off · Your SCQ against theirs — lead line above the screen", never an internal key.
**Go** takes you back to exactly that place, whichever view it was in.

Comments are **shared live** through Firestore — everyone sees everyone else's as they arrive, and
replies appear without anyone refreshing. There is still no login: anonymous sign-in happens
silently so the rules can stop one reviewer editing another's comment, and reviewers just type
their name once a session.

Comments can be **replied to** and **resolved**. Resolved ones stay visible, greyed. Every counter
in the app — storyboard, stage rows, screen dots — tracks *open* comments.

If the shared board is unreachable, everything falls back to this browser's local storage and the
export still carries the work out. The badge in the top bar says which mode you are in.

### Getting them back

**JSON is the round-trip format.** Every note carries the screen id it is pinned to plus its
position as a percentage of the screen box, so dropping the file back into the import panel puts
every pin exactly where it was — on any machine, at any window size. Round-trip is exact to two
decimal places.

Drop several reviewers' files in at once. Their pins appear in maroon alongside your own,
duplicates are ignored by note id, and notes pointing at screens that no longer exist are reported
rather than silently dropped.

CSV and Markdown are for reading. CSV carries reviewer, screen number, stage, screen id, the short
screen name, what the screen does, interaction type, comment type, the comment, coordinates,
timestamp and a deep link.

---

## Direct edit

The unlabelled pencil in the top bar turns on direct edit. Anything dotted can be rewritten in
place, and the change is what everyone else sees. Turning it on warns that a comment is preferred,
because nothing here tracks who changed what.

While it is on, nothing navigates by accident: cards, rows and thumbnails place a caret instead of
opening, and the keyboard shortcuts are off. Back, Next, the dots and the stage tracker still work.

Bullet lists can grow and shrink, not just be reworded. The two headings that repeat across every
stage — "What the user puts in" and "What comes out" — are edited once and change everywhere.

**History** in the edit bar keeps the twelve previous versions of every string, named by whoever
changed it, plus the original wording. Anything can be put back.

Edits share through the same Firestore project, at `boards/main/edits`. The rules for that
collection are in `firestore.rules` and need pasting into the Firebase console; until then edits
stay in the editor's own browser and the comments are unaffected.

---

## Writing rules

**The bold line above each screen says what the user gets out of it.** Not what animates.
"User sees the SCQ they wrote in Day 0 side by side with their colleagues', clocks that all three
differ, and the team works from there towards one shared problem statement" — never "the card loads
first, then two others animate in beside it".

Choreography still gets recorded, but in the quiet side tags marked `Beat`, where it cannot compete
for attention.

**No written copy anywhere.** Every email, message, definition and annotation is replaced by a
description of what that copy will need to say. Structural lists — checklist items, agenda lines,
folder names, learning objectives — are kept, compressed to their shortest correct form.

---

## Design rules

**One focal element per screen.** It gets the soft-pink fill and the largest type. Everything else
is grey and smaller. If two things compete, the screen is doing too much.

| | |
|---|---|
| Soft pink `#F6DFE9` | The focal element — one per screen |
| Maroon `#881946` | Whatever is live or moving right now, and the notch |
| Pink `#D3618F` | Reviewer comments, and nothing else |
| Greys | Structure, context, everything else |

One yellow, used once, on the real Day 1 slide, because the highlight is part of the artefact.

**Chrome reads by structure.** Outlook, Teams, SharePoint, PowerPoint, Excel and Forms are built
from the furniture people actually navigate by — ribbons, folder trees, breadcrumbs, column headers,
composers, sheet tabs, thumbnail rails. No product names, no logos, no labels inside the mocks.
Each one also has its own thumbnail, so the storyboard reads at a glance.

**Five interactions**, and no others: `READ` · `WATCH` · `EXPLORE` · `DO` · `DECIDE`. They sit under
a "What the user does" column heading in the storyboard, and the chip in the walkthrough opens the
legend that defines them.

**Hypothesis trees are built, not chosen from.** The learner types every sub-claim; there is no
bank of candidates and nothing is dragged. Branches can be added, edited, removed or drilled a
level down, and the AI coach names the branch that is not yet a testable claim.

---

## State

Three threads carry across, so persistence never has to be explained:

| Thread | Made in | Comes back in |
|---|---|---|
| Your SCQ | Day 0 | The kick-off, as your own card next to two colleagues' |
| Hypothesis tree | The kick-off | The storyline scrub, and the Week 1 branch that fails |
| Preferences | Core team kick-off | Later the same stage, beside the team's |

The row at the bottom-left of every screen shows what the app is holding. It turns maroon on the
screen that uses it.

---

## Running it

```
python3 -m http.server 8899     # then open http://localhost:8899
```

Also opens from disk — plain script tags, nothing is fetched.

### Netlify

Connect the repo. No configuration; `netlify.toml` publishes the root with no build command.

---

## Files

```
index.html          shell
netlify.toml        publish root, no build
assets/
  app.css           design system and every component
  live.js           Firestore board + anonymous sign-in (ES module)
  chrome.js         simulated Outlook / Teams / SharePoint / PowerPoint / Excel / Forms
  content.js        the 55 screens, the stage write-ups, and the recap table
  comments.js       comment layer, replies, resolve, export, round-trip import
  edits.js          direct edits to the wording, shared, with version history
  app.js            render, navigate, animate, all five views
```

### Two things worth knowing before editing app.js

**Storyboard thumbnails are the real screen**, rendered and scaled to a quarter. Two consequences:
a storyboard row cannot be a `<button>`, because a screen may contain controls of its own and the
parser will not nest them; and each screen's own `<style>` block is rewritten at render time to
apply only to that screen, because fourteen of them share one page. Both are handled in `app.js` —
`scoped()` and the `role="button"` row — and both fail loudly and visibly if undone.

**Thumbnails also settle their animation.** A screen that fills itself in over a few seconds would
otherwise thumbnail as an empty frame, so `anim().settle()` puts the mini straight into the state
the loop reaches just before it clears down.

### Firebase

Project `day1-wireframe`. Firestore path `boards/main/comments`. Anonymous auth is on. The web
apiKey in `live.js` is a public project identifier, not a secret — the security rules are what
protect the data. Free tier covers this many times over.

To change what a screen says or does, `content.js` is almost always the only file to touch.

---

## Content issues found in the deck

Flagged in the wireframe rather than silently fixed:

- Four stage-transition screens all read *"Now onto the second stage!"*
- The stage map gives Core team KO, PD alignment and Week 1 the same description
- The core team kick-off shows the morning's agenda, contradicting the three outcomes the PM names
  on the same screen
- "Six stages" in the intro against five boxes on the map
- Every duration reads `X mins`; the map here uses the numbers from each stage intro (6 / 10 / 10 / 3 / 2)
- Every per-stage intro screen is titled "Stage 0 screen", whatever the stage

## Not yet built

- Question set and norms categories for the core team kick-off — that deck is still to be uploaded
- The real Day 1 slide is shown in the previous Dalberg template rather than the current one

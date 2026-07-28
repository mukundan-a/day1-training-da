# Day 1 — interactive wireframe

A click-through of the Day 1 Craft training, built from the storyboard deck so the team can respond
to **the concept** rather than to prose or pixels. 55 screens across seven parts.

Static site. No build step, no dependencies, no backend.

---

## Three views

| | |
|---|---|
| **Walk** | One screen at a time. Arrow keys, the two buttons, or click either faded edge of the screen. |
| **Storyboard** | Every stage as a card. Open one to get what actually happens in it, what the user puts in, what comes out, and each screen in order. |
| **Notes** | Every comment, filterable, exportable, importable. |

Nothing inside the panel is clickable. Anything that would be interactive plays as a loop, so you
see the whole thing without having to work it.

---

## Commenting

Switch on **Comment**, then click anywhere on a screen to drop a pin. Comments are typed —
**Concept** (default), **Flow & state**, **Screen**, **Copy** — so concept feedback separates
cleanly from UX feedback.

Notes live in your browser. No login, no backend.

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

**Five interactions**, and no others: `READ` · `WATCH` · `EXPLORE` · `DO` · `DECIDE`.

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
  chrome.js         simulated Outlook / Teams / SharePoint / PowerPoint / Excel / Forms
  content.js        the 55 screens — summaries, beats, copy specs, animation loops
  comments.js       comment layer, export, round-trip import
  app.js            render, navigate, animate, storyboard views
```

To change what a screen says or does, `content.js` is almost always the only file to touch.

---

## Open decisions

Five, from the deck's build notes and content notes, listed in the Storyboard view and linked to
their screens. None are resolved.

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
- The real Day 1 slide is shown in the previous template; whether to re-render it is an open decision

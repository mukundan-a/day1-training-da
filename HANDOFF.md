# Handoff

Where things stand, and what a fresh session needs to know.

**Live:** https://day-1-training-da.netlify.app/ — deploys from `main` automatically, no build step.
**Repo:** `mukundan-a/day1-training-da`. Work branch `claude/interactive-wireframe-comments-nq632z`,
merged to `main` after each round.

---

## Verified working

Firebase was tested against the real project via the Firestore REST API (Chromium cannot reach the
internet from the build sandbox, so a browser test was not possible here):

| | |
|---|---|
| Anonymous sign-in | works |
| Write with correct uid | allowed |
| Reply + resolve | allowed, one reply stored |
| Read the board | allowed |
| Read while unauthenticated | `PERMISSION_DENIED` — rules are doing their job |
| Delete own comment | works |

The test comment was deleted; the board is empty.

All 56 screens and 7 storyboard views have been driven headless with the animation loops running:
no JavaScript errors, nothing clipped outside intended scroll regions.

**Not yet checked in a real browser:** the live Firestore listener updating one person's screen when
another person comments. The REST calls prove auth, rules and storage; the `onSnapshot` path is the
only piece that has not been exercised. Worth two people opening the URL and confirming.

---

## Architecture

Static site, no build, no dependencies. Classic script tags in order, plus one ES module for Firebase.

```
index.html          shell
netlify.toml        publish root, no build command
firestore.rules     to be pasted into the Firebase console — comments and edits
assets/
  app.css           the whole design system
  live.js           ES module — Firestore + anonymous auth. Config is inline.
  chrome.js         simulated Outlook / Teams / SharePoint / PowerPoint / Excel / Forms
  content.js        56 screens, 7 stage write-ups, the recap table. Almost all edits go here.
  comments.js       comments, replies, resolve, export, round-trip import
  edits.js          direct edits to the wording, shared, with version history
  app.js            render, navigate, animate, all five views
```

### Three traps in app.js

The storyboard thumbnails are the **real screen**, rendered and scaled to a quarter. That makes
three things load-bearing, each of which broke visibly once already:

1. **A storyboard row must not be a `<button>`.** A screen can contain controls of its own, and the
   parser closes the outer button when it meets a nested one — the page then falls apart from that
   row down. The row is a `div` with `role="button"`.
2. **Each screen's own `<style>` block is rewritten** by `App.scoped()` to apply only to that
   screen. Fourteen screens share one storyboard page, and one screen's `.card{opacity:0}` was
   blanking another's.
3. **Thumbnails settle their animation** via `anim().settle()`. Without it, any screen that fills
   itself in over a few seconds thumbnails as an empty frame.

`struct.mjs` and `scope.mjs` in the scratchpad check all three across every stage.

**Firestore:** project `day1-wireframe`, paths `boards/main/comments` and `boards/main/edits`. The
`apiKey` in `live.js` is a public identifier, not a secret. Security rules are in the Firebase
console under Firestore → Rules; they validate field types, cap text length, require
`uid == request.auth.uid` on create, allow anyone to reply or resolve, and allow delete only by the
author.

**Still to do by hand:** paste `firestore.rules` into the console. The comments block is already
live; the `edits` block is not, so direct edits currently stay in the editor's own browser.

To start a fresh round of review with a clean board, change `BOARD` in `live.js` to `'round-2'`.
Nothing else needs to change and the old comments stay retrievable.

---

## Rules the work follows

These came from the client and have been applied repeatedly. Breaking them is the main way to
regress.

**Lead lines describe the experience, not the choreography.** "User sees the SCQ they wrote in Day 0
side by side with their colleagues'" — never "the card loads first, then two others animate in".
No tacked-on morals: "…so iterating feels normal rather than like failing" was explicitly rejected.
Choreography goes in the side column under a `Beat` tag, where it does not compete.

**Lead lines carry the transition from the previous screen** so the walkthrough does not jump.
"After agreeing on the hypothesis tree, user sees how that tree turns into a dot-dash storyline."

**No written copy anywhere.** Emails, messages, definitions and annotations are replaced by a
description of what that copy must say. Structural lists — checklists, agendas, folder names,
learning objectives — are kept, compressed.

**Nothing inside the panel is clickable.** Anything interactive plays as a loop. Navigation is the
two buttons, the arrow keys, or the faded edges of the screen. The one exception is comment mode.

**On-screen copy is written out, not clipped.** "Five stages, about half an hour" and "Day 0 done.
The kick-off is where the thinking starts" were both rejected as product-marketing shorthand. Every
heading and caption is a full sentence in the same descriptive register as the lead lines: "Welcome
to the Day 1 training. You will go through five stages, and together they should take you about XX
minutes." This applies to the stage-transition screens, the stage intros and the close.

**Durations on screen are `XX`, never a number.** Nobody has timed the real training, and a figure
on screen would be read as a commitment. `MAP5` in `content.js` is the one place that sets them.

**Never tell someone their change is shared unless it is.** The edit bar used to say "change it
for everyone" whether or not the shared board could be reached, and the failure was silent — one
person wrote 156 edits over several sessions believing the team could see them, and nobody could.
Anything that writes to the shared board states its actual state in the UI, and a write that
cannot be shared says so at the moment it happens.

**An edit is written to localStorage first, every time.** Sharing can fail; the words must not be
lost either way. `Edits.local` is the browser's own copy and is always saved, `Edits.remote` is
the board as last seen, and `Edits.map` is the two merged with the board winning. Local-only
paths are pushed up the first time the board answers, and only paths the board does not already
hold, so migration can never overwrite someone else's newer wording.

**Editing must not mark up the page.** Browser spellcheck is off inside editable text, and an edited
string carries no underline. Both drew red lines under house wording and read as the wireframe
flagging an error. What changed is findable in the edits list, which holds the original and every
previous version.

**One focal element per screen**, carrying the soft-pink fill. Maroon marks only what is live or
moving. Pink is comments and nothing else. Negative space has been a recurring complaint — content
should fill the frame.

**Comments work everywhere**, not only on a screen. Anything with `data-anchor` accepts a pin, and
`meta()` in `comments.js` is the one place that turns an anchor into a name a human reads. A new
anchor with no entry there shows up as a raw key in the Notes list and in every export.

**Activities announce themselves**: a "Your turn" chip and the primary action promoted to the top of
the screen. Exercise feedback is an AI coach naming the weak line and asking the question that would
fix it — never a bare percentage.

---

## Open threads

- **The food-energy project files** were mentioned as added to the repo but never arrived. Only the
  three pasted images were available: the real exec summary (used on screen 24), and two philosophy
  slides used as background. If they land, the likeliest wins are the real project folder structure
  and the actual context brief, both currently generic.
- **Core team kick-off deck** is still to be uploaded. The preferences question set and the norms
  categories are placeholders until it arrives.
- **The real Day 1 slide** is rendered in the previous Dalberg template because that is how it
  exists. Whether to re-render it in the current one is unresolved.
- **The `impeccable` plugin** is enabled on the account but its files have never synced into the
  container. Its constraints have been written out by hand in the README instead.

## Content issues in the source deck

Flagged in the Recap view rather than silently fixed: SharePoint against OneDrive, the day 1 bot and
AI literature review that appear nowhere, individual hypo trees against individual SCQs, IKO against
full-team kick-off, personal development goals, the extra step before the PD call, and Week 1 as a
preview rather than a stage. Six more are listed at the bottom of the README.

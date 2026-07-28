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

All 55 screens and 7 storyboard views have been driven headless with the animation loops running:
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
assets/
  app.css           the whole design system
  live.js           ES module — Firestore + anonymous auth. Config is inline.
  chrome.js         simulated Outlook / Teams / SharePoint / PowerPoint / Excel / Forms
  content.js        55 screens, 7 stage write-ups, the recap table. Almost all edits go here.
  comments.js       comments, replies, resolve, export, round-trip import
  app.js            render, navigate, animate, all five views
```

**Firestore:** project `day1-wireframe`, path `boards/main/comments`. The `apiKey` in `live.js` is a
public identifier, not a secret. Security rules are in the Firebase console under Firestore → Rules;
they validate field types, cap text length, require `uid == request.auth.uid` on create, allow
anyone to reply or resolve, and allow delete only by the author.

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

**One focal element per screen**, carrying the soft-pink fill. Maroon marks only what is live or
moving. Pink is comments and nothing else. Negative space has been a recurring complaint — content
should fill the frame.

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

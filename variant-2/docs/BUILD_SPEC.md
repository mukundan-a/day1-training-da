Storyline absorbed. Below is the final, authoritative build spec. It is the single source of truth. Every valid critique from all four rounds is applied and the resolutions are stated inline. No em dashes appear in any user-facing copy.

---

# DAY 1 CRAFT — DEFINITIVE BUILD SPEC (v1, buildable)

## 0 · RESOLUTIONS THAT OVERRIDE THE MERGED SPEC

These settle every P0 across the four critiques. Where this section conflicts with anything below, this section wins.

- **R1 — Both heroes auto-play. No scroll-hijack anywhere.** Hero A (tree→workplan→TOC) and Hero B (problem→L1) both auto-play once on view as short films, each with a Replay control and an optional draggable scrubber handle (opt-in, not required to progress). This kills the 340vh pin, the scroll-context plumbing, and the "owners must be time-driven to survive fast scroll" contradiction. (Client P0-3, Motion P2-9, BuildEng P0-3.)
- **R2 — One hero-object architecture, decided.** Within a hero scene the object is ONE component that never unmounts, animated with Framer `layout` (FLIP) plus explicit transform timelines (`useAnimate`). Cross-scene object travel (branch F4→C3, artefacts→X1, notes→D4) is done only via `layoutId` FLIP between a **persistent, always-mounted anchor** (a Map-node token or the collapsed Notes strip) and a per-scene element. The `lid` registry's hero entries are dropped from cross-scene use. This removes the layoutId-vs-persistent-layer contradiction. (BuildEng P0-1, P0-2, Motion P0-3.)
- **R3 — The signature morph is taught literally, and early.** The tip-over is a real rotational pivot, not a flex reflow (§2.6). Hero B's morph is a shared-word transform, not a cross-fade (§2.7). A silent 4-second preview of the object flipping through its three forms plays inside the cold-open scene `W1`, so the user knows in the first 90 seconds that this is a film about one shape-shifting object. (Client P0-2, Motion P0-1, P0-2.)
- **R4 — Open cold, not on an LMS splash.** Scene 1 is the Analyst's desk with documents physically landing and the real food-energy question posed, giving FEN narrative stakes. The "welcome + objectives" reading is merged into `W2`. One front-of-house overview scene is cut. (Client P0-1, P2-15.)
- **R5 — Content is physically bigger.** Learning-objective text is 26px+ display maroon (not 19px). Checklist item text is 21px. No "hero" is ever a dashed empty box: text-pending FEN facts render as **structured scaffold slots** (real headers, correct counts, greeked lines at true length); only genuinely-unknowable artefacts get a flat captioned frame. (Client P1-4, P1-5.)
- **R6 — One substantial checklist, not four identical closes.** `D5` carries the full-scene checklist (teaches the "nothing dropped" promise once, in full). `F6` and `C5` fold their checklist into a quiet expandable strip under a distinct recap device. The four stage-closes use four different recap devices. (Client P1-6.)
- **R7 — Shell is quieter than the merged draft.** The "scene N of M" counter is killed (the Map carries position). Type chips become four human words only: `Watch` `Read` `Hands-on` `Recap`. The stage-transition wipe is the notch mark drawing across as a stepped clipPath, not a full-bleed maroon rectangle sweep; it is the one sanctioned kinetic use of maroon. (Client P2-9, P2-10, Motion P2-12.)
- **R8 — Store and nav are concretely defined.** localStorage, versioned schema, hash-based scene id, defined resume and keyboard rules (§7, §4). (BuildEng P0-4, P0-5, P1-13.)
- **R9 — The coach is buildable and never exposes the fake.** Shallow deterministic triggers with inline wordlists, fixed priority, a safe fallback nudge, a specific reflect-back, and a defined pass rule (§5 D4/F4, §7). (Client P2-11, BuildEng P0-6.)
- **R10 — Nothing is promised that cannot be handed over.** Download buttons render in an honest "lives on the Hub, link coming" state until real files exist; no dead download. (Client P2-14.)

---

## 1 · DEFINITIVE ORDERED SCREEN LIST

20 content scenes across five stages, plus one recurring `Map`. Human chip set: **Watch** (auto-play films), **Read** (reading, definitions, stage overviews), **Hands-on** (the two exercises), **Recap** (stage closes). No chip on the Map.

**STAGE 0 · WELCOME**
| id | title | chip | storyline |
|---|---|---|---|
| `W1` | Your first day on FEN (cold open) | Watch | Welcome[1] reframed + narrative + signature tease |
| `W2` | Why Day 1, and what you'll get | Read | Welcome[1]+[2] merged |
| `W3` | The five stages (Map, first view) | Read | Welcome[3] |

**STAGE 1 · DAY 0**
| id | title | chip | storyline |
|---|---|---|---|
| `D1` | Day 0 overview | Read | Day0[1]+[2] |
| `D2` | Reading room: proposal + context brief | Read | Day0[3]+[4]+[5] |
| `D3` | What an SCQ is | Read | Day0[6] |
| `D4` | Draft your SCQ | Hands-on | Day0[7] |
| `D5` | Day 0 close (your SCQ vs real · PD split · full checklist) | Recap | Day0[8]+[10]+[9] |

**STAGE 2 · FULL-TEAM KICK-OFF**
| id | title | chip | storyline |
|---|---|---|---|
| `F1` | Why the kick-off matters | Read | FTK[1]+[2] |
| `F2` | The team's SCQs converge (film) | Watch | FTK[3]+[4] |
| `F3` | Problem statement becomes the L1 hypothesis (Hero B) | Watch | FTK[5] |
| `F4` | Build out an L2 branch | Hands-on | FTK[6] |
| `F5` | A real Day 1 tree (zoom-out) | Watch | FTK[7] |
| `F6` | Kick-off close (your branch · checklist strip) | Recap | FTK[8]+[9] |

**STAGE 3 · CORE-TEAM KICK-OFF**
| id | title | chip | storyline |
|---|---|---|---|
| `C1` | Core-team overview | Read | CTK[1]+[2] |
| `C2` | The core-team kick-off deck | Read | CTK[3] |
| `C3` | One object, three ways: tree → workplan → TOC (Hero A) | Watch | CTK[4]+[5] |
| `C4` | How the team sets its norms | Read | CTK[6] |
| `C5` | Core-team close (three artefacts · checklist strip) | Recap | CTK[7]+[8] |

**STAGE 4 · CLOSE**
| id | title | chip | storyline |
|---|---|---|---|
| `X1` | Close (what you made · your vault · where FEN landed) | Recap | Close[1]+[2]+[3] |

**Recurring:** `Map` — full scene at `W3`; afterward a 56px top-rail tracker on every scene; opens as an opt-in overlay via `M` or the stage overline. The Map node is the persistent anchor for cross-scene object travel (R2).

---

## 2 · MOTION SYSTEM

The whole system sells one claim: **the tree, the workplan and the TOC are one object drawn three ways.** Motion is built on object permanence and on films (auto-play on view). Clicks are reserved for the two exercises, Continue/Back, and opt-in controls (Map, Docs/Notes, Replay, scrubber).

### 2.1 `motion.ts` tokens (single source; never inline a duration or spring)

```ts
export const dur = { xfast:0.18, fast:0.32, base:0.55, slow:0.9, epic:1.6 }

// bezier carries TYPOGRAPHY and CAMERA (text, dividers, captions, stage push-in)
export const ease = {
  standard:  [0.22, 1, 0.36, 1],
  entrance:  [0.16, 1, 0.30, 1],
  exit:      [0.40, 0, 1, 1],
  editorial: [0.33, 1, 0.68, 1],
}

// springs carry PHYSICAL landings only (rows/owners dropping, stubs sprouting, UI)
export const spring = {
  hero:   { type:"spring", stiffness:120, damping:20, mass:1   }, // settles clean, no visible bounce
  land:   { type:"spring", stiffness:260, damping:24, mass:0.9 }, // single tasteful overshoot
  sprout: { type:"spring", stiffness:340, damping:22 },
  ui:     { type:"spring", stiffness:420, damping:34 },
}

export const stagger = { tight:0.04, normal:0.08, loose:0.14 }
```

**Discipline rules.**
- At most **one** springy element per composition may visibly overshoot. Hero pivots and camera pushes run on bezier (`ease` / `useTransform`), not springs. Springs are reserved for the *landing* of rows, owners, stubs, chips. This keeps concurrent springs ≤3 on the busiest frame (the tip-over). (Motion P2-13.)
- **Word/character-level motion is spent in exactly two places and nowhere else:** the Hero B claim assembly (§2.7) and the F2 convergence (§2.6b). It never touches body copy. State this once; do not sprinkle. (Motion P2-11.)
- Objective and checklist containers: `staggerChildren:normal`, `delayChildren:0.15`. The heading **must be the first variant child of the stagger parent** (not a sibling) or the delay silently fails. (BuildEng P2-22.)

### 2.2 Trigger model (three types only)
- **[A] Auto-on-view (default, ~everything, both heroes):** `useInView(ref,{once:true, amount:0.45})` drives a parent variant `animate={inView?"show":"hidden"}`. Hero films are driven by `useAnimate` timelines that start on `inView`.
- **[U] User-triggered:** the two exercises' Check, Replay, scrubber drag, Continue/Back, rail toggles.
- **[C] Continuous ambient (tiny, shell only):** breathing caret on the active input; soft pulse on the active Map node. Low amplitude, `repeat:Infinity, repeatType:"mirror"`.

There is **no [S] scroll-scrubbed trigger.** (R1.)

### 2.3 Object permanence engine (decided per R2)

```ts
export const lid = {
  branchToken: (i:number)=>`tok-branch-${i}`,   // Map-node token ⇄ scene branch card
  scqToken:    "tok-scq",                        // Map-node token ⇄ SCQ card
  noteChip:    (id:string)=>`note-${id}`,        // collapsed Notes strip ⇄ D4 sources rail
  artefact:    (k:string)=>`art-${k}`,           // X1 recall from Map nodes
}
```

- **Within a hero scene:** the object is one persistent component; morphs use `layout` + explicit transforms. No `layoutId`.
- **Across scenes:** the always-mounted anchor (Map-node token in the top rail, or the collapsed Notes strip) holds a small element with a `lid` id. The receiving scene mounts an element with the same `lid` id inside the app-root `<LayoutGroup>`; Framer FLIPs the token from the anchor to the scene element. Because the anchor never unmounts, the FLIP always has a live source. This is how the user's branch "flies in from the Map node" to open `C3` (Motion P0-3), how notes resurface in `D4` (BuildEng P1-9: origin is the collapsed strip's computed on-screen position), and how artefacts recall into `X1`.
- **Persistent ghost (Client P1-7):** between `F4` and `C3` the active object survives as a minimized tree glyph inside the Full-team Map node (visible in the 56px rail). It is the literal thing that flies back in to open `C3`.

### 2.4 Scene and stage transitions (mode defined per boundary — BuildEng P0-2)
- **Ordinary info-scene boundary:** `AnimatePresence mode="wait"`. Outgoing fades and lifts (`opacity 1→0, y 0→-12`, 220ms, `ease.exit`); incoming (`y 12→0, opacity 0→1`, 260ms, `ease.entrance`). No slide-wipes.
- **Object-handoff boundary** (`F4→...→C3`, any scene receiving a `lid` token, `X1`): `AnimatePresence mode="popLayout"` inside the shared `<LayoutGroup>`, so the token can FLIP during the brief overlap. The Map-node anchor sits **outside** every per-scene `AnimatePresence`.
- **Stage boundary (the notch-wipe, Motion P2-12, Client P2-10):** a maroon `#881946` panel whose **leading edge is the stepped notch profile** (`clipPath` polygon) sweeps `x:'-100%'→'0%'→'100%'` (520ms, `ease.standard`); the second half reveals the new stage. This is the only kinetic use of maroon in the app. The new stage's Map node fills 200ms *after* incoming content settles, so content reads first.
- **Map nodes:** active node low pulse [C] (soft-pink `#F6DFE9` halo, scale `1→1.06→1`, 2.4s mirror); completed nodes fill maroon once with a `land`-spring check; locked nodes never animate.
- **Hover:** cards lift `y:-2`, shadow up over `xfast`; the notch corner-mark nudges 2px inward on parent-card hover. Buttons: background→`#881946`, `spring.ui`.
- **Focus (focus-visible only):** 2px `#D3618F` ring scaled in on a pseudo-element.

### 2.5 Reduced motion (ship day one; must still teach — Client P1-8, Motion P2-10, BuildEng P2-24)
`useReducedMotion()` branches every variant set. When true:
- Springs and camera collapse to `fast` opacity fades.
- **Both heroes keep object identity by persistence, not dissolve.** The *same* DOM nodes stay mounted; only their arrangement and labels swap, cut hard between three labelled states. No cross-dissolve to a new image.
- **The "one object" lesson is proven structurally:** in reduced-motion `C3`, the tree, workplan and TOC render **stacked and simultaneously visible**, with connector lines drawn from each branch to its row to its section, so identity is shown by layout, not asserted by caption. `C3` becomes a normal-height scene with three labelled panels; there is no scroll dependence (there was none anyway per R1).
- Coach streaming appears at once; the 700–1100ms typing delay is skipped. Notch-wipes become 160ms crossfades.

### 2.6 Hero A — "one object, three ways" (scene `C3`, auto-play film)

One normal-height scene (~140vh of content, no pin). A single caption below the object is the section divider, swapping `Hypothesis tree` → `Week-1 workplan` → `Deliverable contents`. Everything except the object dims to 25% while a morph runs and returns after. Entry corner is always **top-left**; fill flows down-right. A stage-level camera push (`scale 1.0→1.06` on the *stage*, not the object; `useTransform` off the timeline clock, `ease`) runs during each morph and settles to 1.0 on each hold (Motion P1-4). Replay ghost-button and an opt-in scrubber handle are present.

The object is a grid of N=3 branch items. **v1 hard-codes N=3 and a 1:1:1 branch→row→section mapping** (BuildEng P2-23). Owner/dates/analyses cells are FEN scaffold slots; when the user's own branch is used it supplies **only slot-2's row label and its sub-claims as the TOC sub-bullets** (BuildEng P1-11). The film runs on a `useAnimate` timeline started on `useInView(once)`:

0. **Recall shot (0.0–0.8s):** the three branch cards FLIP in from the Full-team Map node via `lid.branchToken(i)` (`spring.land`, stagger `loose`); slot 2 is the user's branch, tagged "your branch" in `#D3618F`. This reassembles the exact object `F4` left (Motion P0-3).
1. **Tree stands (0.8–2.0s):** L1 card top-center in `#F6DFE9` + notch; SVG connectors draw downward from the parent (`pathLength 0→1`, origin top, `ease.standard`, stagger `loose`).
2. **The tip-over (2.0–3.2s) — the signature move, literal (Motion P0-1):** the whole tree composition is wrapped in a `motion.div` with `transformPerspective:1200`, `transformOrigin` pinned to the L1 card's bottom-left (the hinge). The armature animates `rotateZ:0→90deg` on `ease.standard` while each card **counter-rotates** `rotateZ:0→-90deg` so its text stays upright. The connectors, being children of the armature, visibly swing from vertical to horizontal. Only after the swing lands does `layout` snap the now-horizontal cards into the table grid (`spring.hero`, staggered `delay:i*0.06`). A column scaffold (`workstream | analyses | owner | dates`) fades in behind, header rising `y:8→0` (`ease.entrance`). The demoted L1 claim shrinks to a caption above the table via `layout`.
3. **Owners fill in (3.2–4.6s) — the emotional peak, choreographed (Motion P1-7):** owner cells (avatar chip + name) land **out of order** with per-row jittered `spring.land` (stiffness ±20, seeded) so it reads as a person deciding, not a loop. The **two workstreams the PM takes herself land last** and carry a brief `#D3618F` pulse (a human tell). One pop-note blooms and **points**: a short `#D3618F` connector draws (`pathLength`) from the note to the relevant owner cell, then retracts.
4. **Workplan → TOC (4.6–5.8s):** owner/dates columns slide out (`x:0→24` + fade, `ease.exit`, staggered). Each row persists via `layout` as it retargets to a document outline: the workstream label scales to a section heading; the analyses cell unfolds downward into sub-bullets (`height:auto` layout + `staggerChildren:normal`); a numbering gutter's numerals `spring.land` in one at a time, synced to each section settling (not a smooth counter). **Closing the loop (Motion P1-8):** the L1 claim caption (still on stage from phase 2) flies down and docks as the report title above the TOC, completing "one object."
5. **Settle (5.8–6.4s):** clean TOC; caption rises (`ease.entrance`, `slow`); a muted foldable Week-1 note appears.

### 2.7 Hero B — problem statement becomes the L1 hypothesis (scene `F3`, auto-play once)

One object, one persistent container. Both strings are rendered as word-level `motion.span`s with stable keys (the scaffold slot exposes word spans, §8). The morph is a **shared-word transform, not a cross-fade** (Motion P0-2):
1. **Hold** on the problem statement, centred, calm.
2. **Morph (`dur.slow`):** words shared between the problem statement and the L1 claim keep their spans and **travel to their new positions** via `layout`; dropped words exit (`y:-6, opacity→0`, `ease.exit`); genuinely new claim words get the word-by-word rise (`y:8→0`, `staggerChildren:tight`, `ease.entrance`). The reader watches the problem statement rearrange and sharpen into the hypothesis with real lexical continuity. Container settles `scale 1→0.97→1` (`spring.hero`). A 2% stage push-in (`ease`) runs under the assembly (Motion P1-4).
3. **Definition rail** slides in from the left (`x:-16→0`, `ease.editorial`, `base`, Stage register) ~0.5s after the claim finishes.
4. **Branch stubs sprout once:** connectors draw (`pathLength 0→1`, `ease.standard`) with a slight `pathOffset` lag so each line snaps taut (Motion P1-6); a scaffold card at each stub end scales from `scale:0.6, opacity:0` (`spring.sprout`, stagger `loose`), landing dimmed to 60% versus the bright claim. Stubs seed the three-branch object that `F4` edits.

### 2.8 F2 convergence (physical, not a dissolve — Motion P1-5)
The 2–3 SCQ draft cards do not dissolve. Each card's text **collapses toward the centroid** (`layout` + `scale:1→0.4`, `x/y` toward center). The words the copy calls out as disagreements **fall away** (`y:+10, opacity→0`), while the agreed core words survive and land as the shared statement's words (the lighter lexical-continuity trick). The surviving container becomes the object Hero B carries.

### 2.9 Faked coach motion (both exercises)
On Check: input panels shrink and dock left (`layout`, `spring.hero`); the coach column slides in from the right (`AnimatePresence`); a typing indicator pulses 700–1100ms; the coach message streams token-by-token (`setInterval` over the prewritten string, `tight` per token). Bubbles rise `y:10→0` (`spring.ui`). Pass: a `#881946` check blooms (`spring.land`, the single overshoot) and a soft `#F6DFE9` wash passes across the panels (`clipPath`, `slow`). No confetti.

### 2.10 Performance
Animate only `transform`, `opacity`, `clipPath`, `pathLength`, `pathOffset`. Use FLIP `layout` for size/position deltas. Scaffold slots animate identically to real content, so real FEN artefacts drop in with zero re-choreography.

---

## 3 · HIERARCHY, TYPE, DIVIDERS, SHELL-MUTING

### 3.1 The core rule — two parallel type scales that never overlap
The smallest content element (18px body) is larger than the largest shell element (13px tab). If a nav label ever matches a content heading in size, the design is broken.

### 3.2 Type tokens (Aptos Display for content headings + hero objects; Aptos for body). Font note per BuildEng P1-15: Aptos is not web-licensed by default. Every token ships with a fallback stack now: `"Aptos Display", "Aptos", "Segoe UI", -apple-system, system-ui, sans-serif`. If licensed `.woff2` is not bundled, the fallback stack is authoritative and the design must be checked against it.

| token | px/rem | weight | color | use |
|---|---|---|---|---|
| `--t-hero` | 52/3.25 | Regular | Maroon | cold-open line, the one hero object per stage (SCQ, L1 claim) |
| `--t-content-display` | 40/2.5 | Regular | Maroon | activity prompt, animated headline |
| `--t-objective` | 28/1.75 | Regular | Maroon | **learning-objective lines (was 19px — now unmistakably the biggest list on W2)** |
| `--t-content-h1` | 32/2.0 | Regular | Maroon | scene title |
| `--t-content-h2` | 24/1.5 | Regular | Maroon | beat/section head |
| `--t-content-h3` | 19/1.19 | Bold | Dark grey | card titles, group heads |
| `--t-content-body` | 18/1.125 | Regular | Dark grey | reading copy, line-height 1.55 |
| `--t-content-body-lg` | 20/1.25 | Regular | Dark grey | why-it-matters, quotes, conclusions |
| `--t-checklist` | 21/1.31 | Regular | Dark grey | **checklist item text (was 18px)** |
| `--t-content-tag` | 14/0.875 | Bold, UPPER, ls .06em | Maroon | beat eyebrows |
| `--t-shell-tab` | 13/0.81 | Medium | Grey `#6E6F71` | Docs/Notes labels |
| `--t-shell-rail` | 12/0.75 | Medium, UPPER, ls .04em | Grey `#8A8B8D` | stage-rail labels |
| `--t-shell-meta` | 12/0.75 | Regular | Grey `#8A8B8D` | timings |
| `--t-placeholder` | 14–18 | Regular italic | Maroon 60% on pink | FEN slot text |

### 3.3 Color roles (single deep maroon identity)
- **Maroon `#881946`** — content headings, hero objects, the notch, in-text emphasis (≤25% of a paragraph), primary buttons, and the one kinetic exception (the notch-wipe).
- **Dark grey `#414244`** — all body reading.
- **White** — default content ground.
- **Soft pink `#F6DFE9`** — Stage-register container fills, callouts, alternating beat bands, scaffold-slot ground.
- **Pink `#D3618F`** — accents only: comment markers, active-branch highlight, owner-fill tell, "yours" tags, pointer connectors. Never body text.
- **Grey `#8A8B8D` / hairline `#E7E3E5`** — the entire shell.

**Muting rule:** maroon is a content-only pigment except the notch and the notch-wipe. Shell ink sums to under ~8% of any scene. If a screen feels app-like rather than document-like, the shell is too loud.

### 3.4 Spacing & grid (8px base)
Reading column 680px max. Object stage 960px. Hero stage up to 1120px but the moving object stays inside 960. Margins 72/32/20 (desktop/tablet/mobile). 16px paragraph gap, 32px within a card, 112px between beats (96 tablet), 24px card-to-card. No beat exceeds ~60% ink; when crowded, cut, never shrink.

### 3.5 The divider system (four devices used together)
1. **Beat header stamp** — 40px maroon-outline number chip at the left margin, eyebrow (`--t-content-tag`), beat title (`h1`/`h2`), 1px `#E7E3E5` hairline under the title. A cold viewer knows the screen instantly.
2. **112px gap** between beats.
3. **Alternating ground bands** — beats alternate white and full-bleed soft-pink `#FBF1F6`; the band edge is a hard divider.
4. **Scroll-snap** — each beat `scroll-snap-align:start`; suspended on hero scenes (which use the object + swapping caption as divider).

### 3.6 Recurring shell (quiet)
- **Top rail (56px, only persistent chrome):** five-segment stepped tracker (`Welcome · Day 0 · Full-team · Core-team · Close`); current = maroon dot, done = filled grey, locked = hollow; labels `--t-shell-rail`; `scaleX` on Continue. **No "scene N of M" counter.** The stage overline is the Map trigger. The active stage's Map node also holds the persistent object token (§2.3).
- **Notch:** 32×16px maroon, top-right of content, 24px clearance. Static, flat, never animated (its kinetic cousin is the transition wipe only).
- **Docs strip:** slim right-edge `DOCS`; opens a 360px drawer over content (content dims 8%, no reflow): Proposal, Context brief, IKO deck, PD-split note, each a captioned `<ArtefactFrame>`.
- **Notes strip:** twin `NOTES`; same drawer; notes carry scene tags; the collapsed strip is the persistent FLIP origin for the D4 resurfacing (§2.3).
- **Comments:** pink `#D3618F` dot in the right gutter on block hover; anchored to a **block element id** (+ optional offset), never raw x/y (BuildEng P1-14). Commentable elements: beat headers, artefact frames, objective rows, hero captions. Off by default.
- Only one right-rail mode open at a time.

### 3.7 Recurring content templates
- **T1 · Stage Overview (two-panel):** stage name `--t-hero` + one-line why-it-matters `--t-content-body-lg`; two soft-pink cards, left **What you'll do**, right **What you'll have by the end** (`h2` heads, three items each at `h3` weight, left numbered, right pink check-outline). Eye: name → why → panels L-to-R. Panels animate left-then-right (`x:∓20→0`, `ease.standard`; items `staggerChildren:normal`).
- **T2 · Reading Room:** document renders as a captioned `<ArtefactFrame>` at ~62% on white; Notes rail 34% in a soft-pink column; quiet segmented doc-switcher at shell scale. Pre-highlighted passages are **authored decorative overlay rectangles at fixed coordinates on the frame** (BuildEng P1-16), each with a one-tap "note this" affordance (Client P2-12); highlight glow wipes in via `clipPath` on `useInView`.
- **T3 · Activity Scene:** focal input object dead-center on white (≤960px); slim collapsed sources rail at right; single maroon **Check** bottom-center; coach docks in on demand.
- **T4 · Full Checklist Scene (D5 only):** title `--t-content-h1`; role segmented control top-right (`Everyone · AN · Consultant · PM · AP/P`); grouped **Process** / **Content**, each `h2` + hairline; rows full-width, **56px** tall, **21px** body, 22px maroon-outline checkbox left, small right role tag; simulated items show a filled maroon check + faint `Covered` tag; long-tail items show open boxes (the "nothing dropped" promise made visible); alternating rows get a `#FBF1F6` wash; download control per group in the honest Hub state (R10).
- **T4-strip · Checklist strip (F6, C5):** a single quiet full-width expandable bar reading **See everything this stage covers (by role)**; expands inline to the same grouped rows; collapsed by default so the close doesn't repeat the full-scene checklist (R6).
- **T5 · Zoom-out frame:** centered captioned `<ArtefactFrame>` with a `PRELIMINARY` / `AS LEFT ON DAY 1` flag pinned top-left; one short framing line above; artefact scales up from `0.96` with a soft shadow bloom.

### 3.8 Hero-stage hierarchy rules
One object on the stage at a time (everything else → 25% while a morph runs, returns after). Swapping caption as divider. Entry corner top-left. A single ghost Replay control; an opt-in scrubber handle.

---

## 4 · NAV & INTERACTION MODEL

### 4.1 The spine
One forward sequence; always at exactly one scene. One primary **Continue** (bottom-right pill; names its destination, e.g. `Continue · Read next` or, at a stage crossing, `Continue · Day 0`), one **Back** (bottom-left, chevron-only, label on hover). Scenes auto-play their reveal, then rest; the user advances when ready.

### 4.2 Scene Header Contract
```
STAGE NAME                                        [ chip: Read ]
Scene title
```
Overline (stage name only, shell grey), scene title (Stage register, maroon), human chip (right). **No scene counter** (R7). Within-scene beats carry the numbered header stamp (§3.5).

### 4.3 The Map
Five stage cards (title, one-line purpose, expected time, state done/current/locked); the current stage lists its scene titles with ticks. Opens via `M` or the overline as an overlay (never loses place). **Gating chain on a stage-crossing Continue (BuildEng P0-4, P1-17):** `Continue → notch-wipe → land on the next stage overview (D1/F1/C1/X1) → Map node fills 200ms after content settles`. The Map overlay does **not** auto-open; it is opt-in. Jump backward to anything seen; forward only within unlocked stages. No percentages; completion = reaching `X1`.

**Resume behavior (BuildEng P2-20):** after a backward jump, Continue re-walks linearly from the jumped-to scene. The "frontier" (furthest unlocked scene) is stored separately so nothing re-locks.

### 4.4 The right rail — Docs / Notes / Comments (one open at a time)
Collapsed default: thin strip, three icons + count badges. Open via click or `D`/`N`/`C`: a `motion.aside` slides in (`0→360px`, `spring.ui`); opening a second mode crossfades the panel content. `Esc`/click-out collapses.
- **Docs:** Proposal, Context brief, IKO deck, PD-split note as `<ArtefactFrame>`s. On `D2`/`C2`/`C4` the doc takes center stage as a full reader and can minimize back to the strip (the collapsed strip is guaranteed-mounted chrome and is the `layout` shrink target — BuildEng P2-25).
- **Notes:** running notebook, each note scene-tagged; in `D4` the rail opens to a **Sources** view where notes are click-to-insert chips.
- **Comments:** reviewer mode; toggling `C` dims the scene slightly, shows pink pins anchored to element ids; off by default, never blocks Continue.

### 4.5 Activity contract (both exercises)
State machine: `EDITING → [Check] → CHECKING → FEEDBACK → (iterate → EDITING) | (pass → PASSED → Continue unlocks)`. Continue is disabled until pass or explicit **Skip for now** (recorded, surfaced honestly in `X1`). The primary button while editing is **Check**, not Continue. **checkCount increments on every Check action regardless of edits; pass fires at checkCount ≥ 2, or at checkCount 1 if zero nudges fired** (BuildEng P2-26). The coach never traps: the second Check always passes.

### 4.6 Keyboard / touch / a11y
`→`/`Space`/`Enter` Continue · `←` Back · `M` Map · `D`/`N`/`C` rail · `R` replay · `Esc` close overlay · `?` help. **All single-key spine shortcuts are suppressed when a text input or textarea has focus** (BuildEng P1-13); inside an exercise, Check fires on `Cmd/Ctrl+Enter` or the button only. Touch: Continue → full-width bottom bar; rail → bottom sheet; swipe advances except on locked activity scenes. On scene change, focus moves to the scene title; an `aria-live` region announces `Stage · Scene title · chip`. `prefers-reduced-motion` per §2.5.

### 4.7 Multi-beat Continue-gating (BuildEng P2-21)
On `D5`/`F6`/`C5`/`X1`, Continue is available immediately (no forced scroll-through). Backward re-reading is always allowed. `X1` has no next scene: its terminal control is a quiet **Back to start** plus a line confirming everything stays; there is no Continue (BuildEng P1-19).

---

## 5 · PER-SCREEN SPEC

Legend: **[A]** auto-on-view · **[U]** user-triggered · **[C]** continuous. Plain text under a copy heading is **final on-screen copy** (ship as-is; no em dashes; second person). `⟦FEN · …⟧` = FEN slot. `⟦SCAFFOLD · …⟧` = structured scaffold slot (real headers/counts/greeked lines). `⟦EXAMPLE · …⟧` = realistic-not-FEN illustration. Coach lines are a FAKED, pattern-keyed bank.

---

### STAGE 0 — WELCOME

#### `W1` · Your first day on FEN — Watch (cold open)
**Layout / focal / eye order.** Full-bleed, dark-quiet ground stepping to white. A desk surface with three document cards. Focal = the documents landing, then the question line. Eye: 1 the docs dropping onto the desk → 2 the situation line → 3 the question → 4 the silent 4-second object tease. This is a film, not a splash; it moves from frame one (Client P0-1).

**Copy.**
- Situation line (`--t-hero`, assembles as docs settle): **It's your first day on the Food-Energy Nexus project.**
- Sub: This is what's on your desk. A proposal, a brief, and a question the client is paying to answer.
- The question (large, maroon): The question on the table is: `⟦FEN · the core question the FEN project had to answer⟧`
- Framing under the tease: Over the next 25 minutes you'll take that question and turn it into a claim, a plan, and a deliverable. It's all one piece of work. Watch.
- Tease caption (under the silent morph): One shape, three forms. You'll build it yourself.

**Animation [A].** Three `<ArtefactFrame>` cards drop `y:-40→0` with `spring.land`, out of order, staggered `loose`, small settle rotation (≤3°). Situation line assembles word-rise. The **silent 4-second signature tease** (Client P0-2, R3): a compact instance of `<HeroA compact silent>` auto-plays once (tree → tips over → workplan → TOC), no labels, no owners phase, ~4s, then holds on the TOC and dims. Framer: `useAnimate` timeline on `useInView(once)`; reuses the exact HeroA component at 0.5 scale.

#### `W2` · Why Day 1, and what you'll get — Read (merged overview)
**Layout / focal / eye order.** Column 760px, three beats. Focal = the objectives list in beat 3, rendered at `--t-objective` (28px) so it is the biggest list in the scene regardless of position (Client P1-16, resolved by size not order). Eye: 1 scene title → 2 the three reasons → 3 the objectives. Dividers: eyebrows `WHY DAY 1 MATTERS` / `WHAT THIS IS, AND ISN'T` / `WHAT YOU'LL BE ABLE TO DO`, 96px gaps.

**Copy.**
- Scene title (`H1`): **A good first day pays for itself for the rest of the project.** *(Copy P3-7 applied.)*
- Beat 1 lead: Three reasons teams treat Day 1 as its own piece of craft.
  - **Get your expertise into the room.** The people who know the most walk in on Day 1. If your thinking isn't in the room then, it's harder to get in later.
    Quote: `⟦FEN · staff quote on expertise in the room, from call notes⟧` `⟦FEN · attribution⟧`
  - **Be faster, and more deliberate, in the research.** A sharp hypothesis on Day 1 tells you what to look for and what to ignore. You spend the weeks that follow testing a claim, not wandering.
    Quote: `⟦FEN · staff quote on sharper research, from call notes⟧` `⟦FEN · attribution⟧`
  - **Set the team up to work well, and to grow.** Owners, norms and development goals get set on Day 1 or they drift. The team you name on the first day is the team you actually run in week four.
    Quote: `⟦FEN · staff quote on team and development, from call notes⟧` `⟦FEN · attribution⟧`
  *(Copy P1-3 rewrite of reason 3 applied; the "point to in week four / nobody named" line is reserved for C4. Copy P2-4: all three attributions placeheld.)*
- Beat 2 **What this is, and isn't** (two short columns):
  What this is: A guided walk through the first day of a real Dalberg project. / Two hands-on exercises where you do the thinking and get feedback. / Templates and checklists you keep and use on your own projects.
  What it isn't: A simulation of every meeting and message. We cut the staffing back-and-forth down to what matters. / A test. No score, no badge, no pass mark. / The polished final version. You'll see the real Day 1 output with its rough edges left in.
- Beat 3 **What you'll be able to do** (objectives, 28px, rendered in the **working-draft register** per Copy P2-6, tagged `WORKING DRAFT`):
  Draft a rough SCQ and problem statement from a proposal, before the kick-off. / Take a top-level hypothesis and break it into claims that evidence could prove wrong. / Read a hypothesis tree as a workplan and a deliverable, and see they're the same object. / Walk into a core-team kick-off knowing what to set: owners, a table of contents, and team norms.
  Under it: `⟦FEN · final objectives, signed off by the Craft group⟧`

**Animation [A].** Reasons: each claim rises first, its quote fades beneath with a `#D3618F` quote-bar drawing down (`scaleY:0→1`, origin top). Objectives: heading is the first stagger child, `delayChildren:0.15`, then lines rise `y:10→0` staggered `normal`; the draft-register tint holds so they read provisional.

#### `W3` · The five stages (Map, first view) — Read
**Layout / focal / eye order.** Full-width horizontal map; five cards on a thin stepped line. Focal = the five-step spine as one object. Eye: 1 spine → 2 stage names → 3 times + directions.

**Copy.**
- `H1`: **Five stages. About 25 minutes, at your pace.** *(Copy P1-1 / P3-10: numerals, single runtime.)*
- Directions: You can stop and come back to any of this. If you're running it live with your team, slow down on the two exercises. That's where most of the value is.
- Cards: Welcome · ~3 min · Where you are now. What this is and what you'll get. / Day 0 · ~8 min · Getting set up before the project starts. You draft your first SCQ. / Full-team kick-off · ~7 min · Where the thinking starts. You build out a branch of the hypothesis tree. / Core-team kick-off · ~5 min · Turning Day 1 into a plan you can start on tomorrow. / Close · ~2 min · Everything you made, and where the real project ended up.

**Animation [A + C].** Cards deal in from left, stagger `normal`, `spring.land`; active node begins its pulse [C]; directions fade in last, muted.

---

### STAGE 1 — DAY 0

#### `D1` · Day 0 overview — Read (Template T1)
Day 0 node unlocks (lock cross-dissolves to pulse; card lifts `y:-3`, `#F6DFE9` fill via `clipPath`). Focal = stage name `Day 0` (`--t-hero`), then the two panels.
**Copy.** Why-it-matters: **Show up to the kick-off already up to speed, not getting up to speed in the room.** Day 0 is where you read in and form a first view. Do it well and you walk in ready to brainstorm with the PDs, instead of being briefed while everyone waits.
What you'll do: Read into the project: the proposal, then the PD's context brief. / Keep notes as you go. They come back to you later. / Draft your own SCQ and problem statement.
What you'll have by the end: A rough SCQ, in your own words. / A working grip on the proposal and the context brief. / A short list of questions to bring to the kick-off.
**Animation [A].** Why-it-matters types in first to frame the panels; panels slide in from their own edges; items stagger `normal`.

#### `D2` · Reading room: proposal + context brief — Read (Template T2)
**Layout / focal / eye order.** One intro beat (documents as a short list on white), then the reader fills the scene with a two-doc switcher. Focal = the document frame; highlighted passages glow soft-pink. Eye: 1 document → 2 highlights → 3 notes rail.

**Copy.**
- Intro: **This is what lands in your lap before a project starts.** At minimum: the proposal, and a couple of days later, the PD's context brief. Open each one. Highlighting is already done for you, so your eye goes to what matters. Anything you note here comes back when you draft your SCQ.
- Doc rows: `Proposal` · The pitch the client signed off on. What we said we'd do. · `⟦FEN · real proposal PDF, key passages highlighted⟧`
  `Context brief` · The PD's read on the topic, the client, and the people. Arrives a couple of days later. · `⟦FEN · context brief, to be created; take format inspiration from Audrey's share⟧`
- Highlight tooltip: **Worth noticing** · one-tap action on each highlight: **Note this** *(Client P2-12: seeds the D4 resurfacing so it fires on something).*
- Notes nudge (proposal): Seeing something that could be a Situation, a Complication, or a Question? Note it now.
- Notes rail head: **Your notes** · empty state: Jot anything that might shape the question. It'll be waiting in the exercise.
- Footer: We've cut the staffing emails and calendar invites. This is the part that matters: getting these in front of you.

**Animation [A/U].** Intro rows drop `y:-16` `spring.land` staggered `normal`; the Docs strip gives a quiet nudge as docs register. Highlights (fixed-coordinate overlay rects, §3.7 T2) wipe in via `clipPath` L→R on per-highlight `useInView`. Tapping **Note this** or adding a manual note animates a chip in (`spring.ui`) carrying `lid.noteChip`. **Note model (BuildEng P1-8):** notes are captured untyped; the D4 chip inserts into the currently-focused S/C/Q field on click (append as a new bullet). A one-tap highlight note stores the highlighted passage text.

#### `D3` · What an SCQ is — Read
**Layout / focal / eye order.** Column 760px; definition hero, then why-it-matters, then S/C/Q as three labelled rows. Focal = the plain-language definition (`--t-content-display`; S/C/Q letters as 32px maroon initials). Eye: 1 title → 2 definition → 3 breakdown. Eyebrows `DEFINITION` / `WHY IT MATTERS` / `THE THREE PARTS`.

**Copy.**
- `H1`: **Before the kick-off, everyone drafts their own SCQ.**
- Body: On a real project, each person writes a rough SCQ and problem statement on their own, before anyone meets. Not to get it right. To do the thinking, and to arrive with questions.
- **What's an SCQ?** A three-part frame for stating a problem so everyone agrees what it is before anyone tries to solve it.
  **Situation.** What's true and not in dispute. The stable backdrop.
  **Complication.** What changed, or what's now at stake, that makes this worth solving.
  **Question.** The one question the client needs answered, that follows from the two above.
  Together they resolve into a problem statement: one or two sentences naming the problem the work exists to solve.
- Footer: This is about generating thinking, not polish. Rough is the point. Want more? `⟦FEN · links to past SCQ trainings; check Audrey's issue-tree bot⟧`

**Animation [A].** S/C/Q reveal as labelled blocks, stagger `loose`; each letter scales up first (`spring.sprout`), then its line rises. Links fade in muted.

#### `D4` · Draft your SCQ — Hands-on (Template T3)
**Layout / focal / eye order.** Three top panels **S / C / Q** (equal columns, 960px, soft-pink input cards, maroon letter headers) + a full-width **Problem statement** panel below; Sources rail (Proposal / Context brief / Your notes) parked right; single maroon **Check** bottom-center. Focal = the S/C/Q grid. Eye: 1 the three empty panels → 2 seed bullets → 3 Check.

**Copy.**
- `H1`: **Your turn. Draft it.**
- Instruction: Put bullets under each heading. A couple are filled in to get you moving. Add, change, or delete anything. When it feels close enough to talk about, check it. Pull from your notes on the right if you want.
- Field placeholders: Situation — *What's true and not in dispute?* · Complication — *What changed, or what's at stake now?* · Question — *What's the one question the client needs answered?* · Problem statement — *In a sentence or two, what problem does this work solve?*
- Seed bullets: `⟦FEN · 1-2 seeded bullets each for S, C, Q, drawn from the proposal⟧`
- Sources header: **Everything you need** · Proposal · Context brief · Your notes
- Primary: **Check my draft** · Secondary: Show the instructions again · Skip: **Skip for now** (hover: You can skip this. We'll show you a real one instead and mark it as skipped.)

**Coach (FAKED, deterministic; see §7 for exact triggers, wordlists, priority, field-substitution).**
- Open (always): Read it. Here's what I've got.
- Reflect-back (always, quotes the user's actual Question, first non-empty Q bullet): Your question, as written, is: "{Q}". Everything else has to earn its place around that.
- Nudges (≤2, by priority): as authored below, plus a **safe fallback** that fires when no trigger classifies the input, so the coach never says something obviously wrong (Client P2-11, BuildEng P0-6):
  Fallback: There's a real draft here. The one thing I'd push on: does your Question fall out of your Situation and Complication, or is it arriving from somewhere else? Read it top to bottom once and check again.
- Named nudges: *Q not a question* → That's a topic, not a question. What does the client actually need decided? Try starting with "Should", "How much", or "Which". · *two asks in Q* → You've got two questions in there. Pick the one the client would pay to answer. · *Complication thin/restates Situation* → Your Complication reads like more Situation. What changed, or what's now at risk, that makes this urgent? · *Situation ≤1 bullet* → Thin on Situation. Give me one more thing that's true and nobody would argue with. · *problem statement empty* → You've drafted S, C and Q but not the problem statement. Say the problem in one sentence, as if telling a colleague in the hallway. · *problem statement 3+ sentences* → The problem statement's doing too much. Cut it to one sentence.
- Pass: Good enough to argue about, which is exactly what a draft is for. Your Situation sets the ground, the Complication names the tension, and "{Q}" is a real question. Bring it to the kick-off. (Reveals Continue.)
- Iterate: Closer. Fix that one thing and check it again.

**Animation [U + faked coach].** On mount, note chips saved in `D2` FLIP from the **collapsed Notes strip's computed position** into the sources rail via `lid.noteChip`, `spring.hero`, staggered (BuildEng P1-9). If no notes exist, the rail shows the two docs only; nothing broken fires. `#D3618F` caret slow-blinks [C] on the focused panel. Coach dock + token-stream per §2.9. Pass wash per §2.9.

#### `D5` · Day 0 close — Recap (three beats; the one full-scene checklist)
**Layout / focal / eye order.** Beat A your SCQ beside the real FEN SCQ + coach read; Beat B PD-split note; Beat C the full Day 0 checklist (Template T4). Focal on entry = Beat A side-by-side (both render at equal content scale; yours is not diminished). Eye: 1 "Here's the real one, next to yours" → 2 the two SCQs → 3 the feedback line. Dividers: A white (`CONCLUSION`), B pink band (`HOW THE PDs SPLIT THE PROJECT`), C white (`WHAT DAY 0 COVERS`).

**Copy.**
- Beat A `H1`: **Here's yours, next to the real one.**
  What you wrote: `⟦FEN · user's stored SCQ draft⟧` · **Skipped state (BuildEng P1-10):** if D4 was skipped, this reads *Skipped. Here's a real teammate's draft in its place,* and shows a real SCQ; the coach-read line is hidden.
  What the FEN team landed on: `⟦FEN · real SCQ and problem statement⟧`
  On your draft: `⟦FEN · coach's stored read⟧`
  Closing: You're not looking at a right answer and a wrong one. You're looking at two drafts that framed the same problem. That's what Day 0 buys you: a point of view to walk in with, instead of a blank one to fill in the room.
- Beat B `H1`: **Two PDs, one project. Here's who does what.**
  Most of the time you're not in the room when the two Project Directors carve up the work. You should still know the split, so you know who to go to.
  Content lead: `⟦FEN · who leads content review⟧` · Client lead: `⟦FEN · who leads the client⟧` · Coaching and team development: `⟦FEN · how the PDs split coaching⟧`
  Footer: Every project splits this differently. Find out early who owns what on yours. *(Copy P1-2: internal Craft-group line removed from screen; moved to §8 open items.)*
- Beat C `H1`: **Everything a real Day 0 involves.**
  You did the part that teaches best. This is the whole of it, including the pieces we didn't walk through, so nothing important gets dropped quietly. Filter to your role.
  Process: `⟦FEN · Day 0 process items, by role, from codification deck⟧` · Content: `⟦FEN · Day 0 content items, by role⟧`
  Download this checklist: rendered in the honest Hub state (R10).

**Animation [A/U].** Beat A: your SCQ slides from left, the real one from right, meeting at center with a hairline divider drawing down (`scaleY`); shared/differing points highlight with `#F6DFE9` marks wiping in (stagger `normal`); closing line rises last. Beat B: two PD columns fade in, a splitting line draws down the middle. Beat C: role filter reflow via `layout` + `spring.hero` (non-matching rows collapse `height→0` under `AnimatePresence`).

---

### STAGE 2 — FULL-TEAM KICK-OFF

#### `F1` · Why the kick-off matters — Read (Template T1 extended)
Day 0 node fills maroon with completion check; kick-off unlocks and pulses. T1 two-panel plus a third beat **"The one thing to get right"** as a full-width maroon-outline callout. Focal = stage name, then the "one thing" callout (`--t-content-display`, outweighs the panels). Dividers: overview (white) → "one thing" (pink band, `THE ONE THING TO GET RIGHT`).

**Copy.**
- `H1`: **This is the meeting where a pile of reading becomes a shared claim.**
- Why it matters: Everyone read on their own. Here the team turns that into one hypothesis it's willing to test. Get this right and the next four weeks have a spine. Get it wrong and the team researches in four directions.
- What to expect: PDs run this differently. Some come in with a hypothesis already drawn; some build it live with you. The meeting might be in person, hybrid, or fully virtual. Walk in with `⟦FEN · what the AN should have ready⟧`, walk out with `⟦FEN · what the AN should leave with⟧`. Whatever the style, it's fair to hold the AP and Partners to that. If you leave without it, the meeting isn't finished. `⟦FEN · reference existing deck on PD styles/formats⟧`
- The one thing: **Build the hypothesis tree out. Everything else in this stage serves that.**
- Why hypothesis-led: A hypothesis is a claim you can be wrong about. Stating one up front means the research has a target: you're testing something, not collecting everything. It's faster, and it's honest, because you've said in advance what would change your mind.

**Animation [A].** The "one thing" line arrives largest and first; other parts build around it `loose`; format variants deal in as three icon chips `normal`.

#### `F2` · The team's SCQs converge — Watch (two beats, film)
**Layout / focal / eye order.** Beat A: 2–3 SCQ cards in a row (the user's marked "yours" in `#D3618F`), differences highlighted. Beat B: they converge into one shared problem statement, shown large and alone (`--t-hero`, centered). Focal: A = the row; B = the single statement (the object Hero B carries). Dividers: A white (`THE TEAM'S DRAFTS`), B pink band (`THE SHARED PROBLEM`).

**Copy.**
- Beat A `H1`: **Everyone drafted one. Here they are together.** Same proposal, same brief, different framings. The interesting part is where they disagree. Those gaps are what the meeting resolves.
  Cards: `Yours` `⟦FEN · user's stored SCQ; if skipped, a real one⟧` + `⟦FEN · 2-3 real FEN SCQs⟧`
  Skipped-state line: You skipped the draft, so we've put a real teammate's SCQ in your spot.
- Beat B `H1`: **The team lands on one problem statement.** The differences get talked out, and the team commits to a single framing. This is it.
  `⟦FEN · final shared problem statement⟧` (rendered as a `⟦SCAFFOLD⟧` slot with word-level spans, so §2.8 convergence has real targets).

**Animation [A].** Beat A cards tile in `loose` `spring.land`; `#F6DFE9` difference marks wipe in after settle. Beat B: the **physical convergence** of §2.8 (cards collapse toward the centroid; disagreement words fall away; agreed core words survive and land). The surviving container is handed to `F3`.

#### `F3` · Problem statement becomes the L1 hypothesis — Watch (Hero B, auto-play once)
**Layout / focal / eye order.** Full-width stage, object pinned center, short hypothesis definition entering after the morph. Focal = the single morphing object; rail/tabs dim to 25% during motion. Eye: 1 object mid-morph → 2 settled L1 claim (`--t-hero`) → 3 definition + three stubs. Divider: the caption (`Shared problem` → `Top-level hypothesis`).

**Copy.**
- `H1`: **The PD turns the problem into a claim.**
- Body: Watch the problem statement become the top-level hypothesis. Notice there's no hedging in it. It's stated flat, as a thing that's either true or not.
- **What's a hypothesis?** Your best answer to the client's question, written before the research, stated as a plain claim, and specific enough that evidence could prove it wrong. If nothing could disprove it, it's not a hypothesis. It's an opinion.
- L1 target: `⟦SCAFFOLD · real L1 hypothesis from the Day 1 exec summary; word-level spans⟧`
- Stubs caption: For this to be true, a few things underneath it have to hold. Those are the branches. You're about to build one. `⟦FEN · three L1 branch labels⟧`

**Animation [A].** Full Hero B choreography (§2.7). Stubs seed the three-branch object edited in `F4`.

#### `F4` · Build out an L2 branch — Hands-on (Template T3)
**Layout / focal / eye order.** L1 claim pinned top (`--t-content-h1`, the given, not dominant); three branch stubs beneath; the **assigned branch is fixed to index 1 (slot 2)** deterministically (BuildEng P2-12), highlighted in `#D3618F`, expanded into an input column for free-text sub-claims (add as many as they like); Sources rail right; **Check** bottom-center. The two non-active branches dim to grey. Eye: 1 L1 claim → 2 highlighted branch + growing sub-claims → 3 Check.

**Copy.**
- `H1`: **Your branch. Break it down.**
- Instruction: This branch is yours. Ask one question of it: for the branch to be true, what would have to be true underneath? Write each answer as a sub-claim. Add as many as you need. When you've got a set that holds together, check it.
- Assigned branch: `Your branch:` `⟦FEN · L1 branch at index 1, assigned to the user⟧`
- Sub-claim field placeholder: *For the branch above to be true, what has to be true? One claim per line.*
- Reminder: Test each one: could evidence prove it wrong? If not, sharpen it.
- Sources header: **Everything you need** · Proposal · Context brief · Your notes · Primary: **Check my branch**

**Coach (FAKED; §7 for triggers/wordlists).**
- Open: I'm not checking whether these are right. I'm checking whether they're claims we could test, and whether together they'd make the branch true.
- Reflect-back (quotes the first sub-claim): You've said, for a start: "{subclaim[0]}". Let's see if the set holds.
- Nudges (≤2, by priority) plus **safe fallback** (fires when nothing classifies): There's a real branch taking shape. The push: if every one of these were true, would the branch above have to be true? If there's a gap, name the missing piece and check again.
- Named nudges: *not falsifiable* → "{subclaim}" can't be proven wrong as written. What would we measure or find that would make it false? · *only one* → One sub-claim rarely carries a branch. What's the second thing that would have to be true? · *two overlap* → "{a}" and "{b}" are the same claim twice. Merge them and use the space for a new one. *(Copy P3-8 applied.)* · *is a task* → "{subclaim}" is a thing to do, not a claim to test. Rewrite it as something that's either true or false. · *restates the branch* → That one just says the branch again. Go one level down: why would the branch be true?
- Pass: These hold together. Each one could be proven wrong, and if they all held, the branch would too. That's a testable branch. Nice work. (Reveals Continue.)
- Iterate: Better. Tighten that and check again.

**Animation [U + faked coach].** Each added sub-claim rises `spring.land` and draws a connector down from the branch (`pathLength` with `pathOffset` whip, §2.7 physics variant). Coach dock + stream per §2.9. Pass: `#F6DFE9` wash; the branch is stored and a chip flies to the Full-team Map node via `lid.branchToken(1)`, seeding the persistent ghost and the `C3` recall.

#### `F5` · A real Day 1 tree — Watch (zoom-out, Template T5)
**Layout / focal / eye order.** The actual FEN Day 1 exec-summary tree rendered full-size and scrollable, flagged `AS LEFT ON DAY 1`. Focal = the real tree; framing short so the artefact dominates.
**Copy.** `H1`: **This is what the real team had at the end of Day 1.** Not the clean version that circulates weeks later. This is the tree as they left it that first day: preliminary, rough in places, and that's fine. That's what a real Day 1 output looks like. *(Copy P2-5 applied: invented "uneven / thicker branches" removed.)* `⟦FEN · Day 1 exec-summary tree slide, unedited⟧` · `⟦FEN · secure sign-off to show the real deliverable with rough edges⟧`
**Animation [A].** Frame scales up from `0.96` + soft shadow bloom; the `PRELIMINARY` tag fades in.

#### `F6` · Kick-off close — Recap (two beats; checklist as strip)
**Layout / focal / eye order.** Beat A: conclusion + the user's stored branch + coach feedback (recap device = your-tree). Beat B: the checklist **strip** (T4-strip), collapsed by default. Eye: 1 title → 2 recap + your tree → 3 the strip. Dividers: A white (`CONCLUSION`), B: the quiet strip bar.
**Copy.**
- Beat A `H1`: **You built a branch of the thing the whole project hangs on.** The kick-off took a stack of reading and turned it into one claim the team can test. The tree you helped build is the target for everything that follows.
  Your branch: `⟦FEN · user's stored L2 branch⟧` · **Skipped state:** if F4 was skipped, *Skipped. You can go back any time and build it.* (BuildEng P1-10.)
  What you did: `⟦FEN · coach's stored feedback, describing not scoring⟧`
  Takeaway: One thing to carry out of this room: be clear on what the deliverable is, not just the tree. Some people anchor on the argument, some on the document. You want both.
- Beat B strip bar: **See everything the full-team kick-off covers (by role).** Expands to Process `⟦FEN · internal kick-off process items, by role⟧` · Content `⟦FEN · internal kick-off content items, by role⟧`. Download in the honest Hub state.
**Animation [A/U].** The branch chip flies back from the Full-team Map node via `lid.branchToken(1)`; coach feedback types beneath; takeaway rises last. Strip expands via `height:auto` `layout`.

---

### STAGE 3 — CORE-TEAM KICK-OFF

#### `C1` · Core-team overview — Read (Template T1)
Kick-off node completes; core-team unlocks. "Run by the PM without the PDs" note fades in muted below the stage name.
**Copy.** `H1`: **Same thinking, now turned into a plan with names on it.** This session is run by the PM, without the PDs. It's where the hypothesis tree becomes work someone owns.
What you'll do: Watch the hypothesis tree become a workplan, then a deliverable table of contents. / See how the team sets its norms.
What you'll have by the end: A workplan with a named owner on every line. / A table of contents for the deliverable. / A shared set of working norms and work-life-balance commitments.

#### `C2` · The core-team kick-off deck — Read (Template T2, deck mode)
**Layout / focal / eye order.** The standard IKO norms deck as a flippable `<ArtefactFrame>`; minimizes to the Docs strip afterward. Focal = the deck.
**Copy.** `H1`: **This is the deck the team runs the session from.** Flip through it. This is the standard core-team kick-off deck, where the team sets its rules and works out how to work with each other. We've kept it simple: no live fill-in, just the format so you know it when you see it. `⟦FEN · Dalberg IKO norms deck⟧` · `⟦FEN · a filled-in example so it reads real, not blank⟧`
**Animation [U].** Page-flip `x`-slide + slight `rotateY` (≤6°), `spring.ui`; minimizes to the Docs strip via a `layout` shrink to the guaranteed-mounted strip (BuildEng P2-25).

#### `C3` · One object, three ways: tree → workplan → TOC — Watch (Hero A, auto-play film)
**Layout / focal / eye order.** Full-width scene, one object, single caption below as divider. Focal = the transforming object (everything else → 25% during morphs). Eye enters top-left; fill flows down-right; caption tells the form. Full choreography per §2.6 (recall shot → tree → tip-over → owners → TOC → settle). Replay + opt-in scrubber present.

**Copy.**
- Intro `H1`: **Tip the tree on its side and it's a workplan.**
- Body: Watch it happen. Each branch of the hypothesis tree lands as a row. Then an owner column fills in as the PM assigns who does what, taking two workstreams herself alongside running the team. *(Copy P3-9: "a couple of" → "two".)*
- Owner pop-note: Where the project allows it, the PM matches workstreams to what people want to get better at. The plan does double duty: it gets the work done and it grows the team.
- Second `H1` (TOC phase): **Now read the same object as a document.** *(Copy P2 / Client P2-13: "stand it up" metaphor replaced.)*
- Body: Each workstream becomes a section. The analyses under it become what that section has to show. Same object, drawn a third way.
- Closing line: **The tree, the workplan and the table of contents are one object drawn three ways. The claim you argued about in the kick-off is now a section heading in the report.**
- Folded Week-1 note: What's week one? Turning this workplan into an executive summary, and then into slides. That's the shape of the first week. Same object again, one more time.
- Slots: `⟦SCAFFOLD · L1+L2 tree, 3 branches⟧` · `⟦SCAFFOLD · week-1 workplan with owner split⟧` · `⟦SCAFFOLD · deliverable contents / report structure⟧`. **User-branch use (BuildEng P1-11):** slot-2's row label and its TOC sub-bullets are user-sourced; owner/dates/analyses remain FEN scaffold. v1 is N=3, 1:1:1 (BuildEng P2-23).

**Animation [A].** Full Hero A choreography (§2.6), auto-play, camera push-in, one visible overshoot budget respected. Reduced-motion collapses to the stacked three-panel connector layout (§2.5).

#### `C4` · How the team sets its norms — Read
**Layout / focal / eye order.** Four labelled soft-pink cards (meeting cadence · review and feedback · response times · WLB); one argument line closes. Focal = the four-card set. Eye: 1 title → 2 four groups → 3 closing argument (`--t-content-body-lg`, maroon). `WORKED EXAMPLE` eyebrow so it reads illustrative.
**Copy.** `H1`: **The norms the team agrees to, out loud, on Day 1.** Not a personality exercise. A short, concrete set of agreements about how you'll work together, so nobody's guessing in week three. Here's the kind of thing a team lands on.
**Meeting cadence** How often you meet, when, and what each meeting is for. `⟦EXAMPLE⟧` · **Review and feedback** How work gets reviewed, and how feedback gets given and taken. `⟦EXAMPLE⟧` · **Response times** What's a reasonable time to reply, and what counts as urgent. `⟦EXAMPLE⟧` · **Work-life balance** Protected time, no-go hours, and how you cover for each other. `⟦EXAMPLE⟧`
Argument: **Norms you name on Day 1 are norms you can point to in week four. Norms nobody named don't exist.** *(Copy P1-3: this is the one home for the line.)*
**Animation [A].** Category cards deal in `loose`; within each, example lines stagger `normal`; the argument line arrives last and largest, editorial register.

#### `C5` · Core-team close — Recap (two beats; checklist as strip)
**Layout / focal / eye order.** Beat A recap (three mini-artefacts: workplan, TOC, norms, each with a one-line why) as the recap device; Beat B the checklist **strip** (T4-strip), collapsed. Dividers: A white (`CONCLUSION`), B: the strip bar.
**Copy.** Beat A `H1`: **Day 1 is now a plan you could start tomorrow.** In one session, the tree turned into a workplan with owners, the workplan turned into a table of contents, and the team agreed how it would work. Nobody leaves wondering what they own, what the deliverable is, or how the team runs. Each one came from the same tree.
Beat B strip bar: **See everything the core-team kick-off covers (by role).** Expands to Process `⟦FEN · core-team process items, by role⟧` · Content `⟦FEN · core-team content items, by role⟧`. Download in the honest Hub state.
**Animation [A].** Mini-artefact icons land `normal`, each "why it mattered" rising beneath; strip expands via `layout`.

---

### STAGE 4 — CLOSE

#### `X1` · Close — Recap (three beats, the finale)
**Layout / focal / eye order.** Beat A the trail of what you made (notes, SCQ, hypothesis branch) as artefact cards pulled from state, skipped items shown as skipped not blank. Beat B your vault (every template and checklist by stage and role) as a tidy grid. Beat C FEN zoom-out (two published reports as captioned cover frames + links) and the completion line. Focal on entry = Beat A's trail. Dividers: A white (`EVERYTHING YOU MADE ON DAY 1`), B pink band (`YOUR VAULT`), C white (`WHERE THE PROJECT LANDED`). The journey rail shows all five stages complete; the notch echoes bottom-left as a book-end. **Terminal control:** a quiet **Back to start**; no Continue (BuildEng P1-19).

**Copy.**
- Beat A `H1`: **Here's what you made.** Your notes, your SCQ, and the branch you built. Anything you skipped is marked, not hidden.
  Trail: `Your notes` `⟦FEN · stored notes; if none, "You didn't take notes this time."⟧` · `Your SCQ` `⟦FEN · stored SCQ; if skipped, "Skipped."⟧` · `Your hypothesis branch` `⟦FEN · stored L2 branch; if skipped, "Skipped."⟧`
  Skipped-state (reused): Skipped. You can go back any time and do it.
- Beat B `H1`: **This part stays. Take it to a real project.** Every template, format and checklist you saw is here, sorted by stage and by role. Download what's useful. It's built for the actual first day of an actual project, not just for today.
  Vault groups: Day 0 (SCQ template · Day 0 checklist) · Full-team kick-off (Hypothesis tree template · Kick-off checklist) · Core-team kick-off (Workplan template · Deliverable TOC template · Norms template · Checklist) · `⟦FEN · all templates and checklists, downloadable⟧`
  Downloads render in the honest Hub state until files exist (R10).
- Beat C `H1`: **The thinking you just walked through became this.** Everything in this training came from one real project. The SCQ, the hypothesis, the tree you built a branch of: they turned into published work. Here's where it landed.
  `⟦FEN · first published report: cover + link⟧` · `⟦FEN · second published report: cover + link⟧`
  Closing: That's it. You're done. No score, no badge, none of that, because we didn't promise any. Everything you made and everything in your vault stays here. Come back to it whenever a project's first day is coming up.

**Animation [A].** Each stored artefact FLIPs in from its Map node via `lid.artefact(k)` (`spring.hero`, stagger `loose`); skipped items appear greyed with a "skipped" tag, no animation (honest). Vault cards tile `normal`; report covers scale up from `0.96`. The Map fills its last node maroon and goes still. Deliberately no reward animation. The film ends quiet.

---

## 6 · COMPONENT INVENTORY

**Shell / chrome**
- `<TopRail>` — five-segment tracker + Map trigger + persistent object-token anchors; `scaleX` on Continue. No scene counter.
- `<Notch>` / `<NotchWipe>` — static mark; the wipe is a stepped-clipPath maroon panel keyed to stage change.
- `<SceneHeader>` — overline (stage name) + title + human chip + `aria-live` announcer.
- `<Map>` — unlock-state parameterized; front-door scene (`W3`) + opt-in overlay + jump index; node states done/current/locked; holds the persistent object token.
- `<RightRail>` — one `motion.aside`, mutually-exclusive modes `<DocsPanel>` / `<NotesPanel>` / `<CommentsLayer>`; `<SourcesView>` for exercises.
- `<Continue>` / `<Back>` — spine controls; Continue names its destination; disabled state on locked activity scenes; `<Back to start>` variant on `X1`.

**Content templates**
- `<StageOverview>` (T1), `<ReadingRoom>` (T2, doc + deck modes), `<ActivityScene>` (T3), `<Checklist>` (T4 full + T4-strip), `<ZoomOutFrame>` (T5).

**Content atoms**
- `<BeatHeader>` (number chip + eyebrow + title + hairline), `<GroundBand>` (white/pink alternating, `scroll-snap-align`), `<ObjectiveList>` (28px numbered), `<ReasonBlock>` (claim + quote + `#D3618F` bar), `<QuoteCard>`, `<DocRow>`, `<NoteChip>` (carries `lid.noteChip`, click-to-insert), `<RoleFilter>`, `<CommentPin>` (element-id anchored), `<DownloadButton>` (honest Hub state).

**Placeholder classes (three, distinct — §8)**
- `<ScaffoldSlot>` — real structure, correct counts, greeked lines at true length, word-level spans for morph targets. Used for text-pending FEN facts with known structure (SCQ, L1 claim, branches, workplan, TOC).
- `<ArtefactFrame>` — flat captioned frame for genuinely-unknowable artefacts (proposal, brief, decks, tree slide, report covers), optional `PRELIMINARY` / `AS LEFT ON DAY 1` flag.
- `<InlineSlot>` — short inline fact (a name, an attribution, one line); small dashed pink chip.

**Hero-film components**
- `<HeroA>` — one persistent object; recall shot → tree → rotational tip-over → owners → TOC; `layout` + `useAnimate` timeline; `compact silent` variant reused for the W1 tease.
- `<HeroB>` — problem→L1 shared-word transform + sprouting stubs.
- `<Caption>` — swapping section-divider line.
- `<Replay>` / `<Scrubber>` — opt-in film controls.

**Activity / coach**
- `<Coach>` — docking panel + typing indicator + `<TokenStream>`; consumes the deterministic bank (§7); swappable for a real Anthropic call behind the same interface, no motion change.
- `<SCQGrid>`, `<BranchWorkspace>`.

**System modules**
- `motion.ts` (§2.1), `registry.ts` (`lid`, §2.3), `store.ts` (§7), `coach.ts` (heuristics, §7), `useReducedMotion` guard wired into every variant set.

---

## 7 · STATE, PERSISTENCE, NAV PLUMBING, COACH HEURISTICS

### 7.1 Store (localStorage; cross-session, since X1 promises persistence — BuildEng P0-4)
Mechanism: React Context + `useReducer`, mirrored to `localStorage` on every change. Key: `day1craft.v1`. Schema:
```ts
{
  v: 1,
  currentSceneId: string,        // e.g. "D4"
  frontierSceneId: string,       // furthest reached; nothing re-locks
  unlockedStages: string[],      // ["welcome","day0",...]
  visited: { [sceneId: string]: true },
  notes: [{ id, sceneTag, text, ts }],   // untyped; inserts into focused field
  scq: { S: string[], C: string[], Q: string[], problem: string,
         coachRead: string, skipped: boolean, checkCount: number },
  branch: { assignedIndex: 1, subclaims: string[],
            coachRead: string, skipped: boolean, checkCount: number },
  comments: [{ id, sceneId, anchorId, offset, text, thread: [] }]
}
```
No score field (none promised). `checkCount` increments on every Check regardless of edits; pass at `checkCount ≥ 2` or at 1 if zero nudges fired (§4.5).

### 7.2 Nav plumbing (no router library — BuildEng P0-5)
Hash-based scene id: `#/scene/<id>` written on every navigation, read on boot to restore `currentSceneId` from the store. Browser Back is intercepted and mapped to spine-Back (does not exit the app). Reduced-motion and font-fallback are decided at boot.

### 7.3 Coach heuristics (deterministic, buildable — BuildEng P0-6, Client P2-11)

**Field substitution (BuildEng P1-7):** `{Q}` = first non-empty Q bullet, trimmed. `{subclaim}` = the first sub-claim that triggered the firing nudge. `{a}`,`{b}` = the two overlapping sub-claims. `{subclaim[0]}` = first sub-claim.

**Shared wordlists.**
```
QUESTION_STARTERS = [should, how, which, what, why, when, does, do, can, will, is, are]
IMPERATIVE_VERBS  = [build, do, run, gather, interview, collect, analyse, analyze,
                     map, review, draft, write, call, schedule, set, create, make]
HEDGE_WORDS       = [might, could, may, possibly, generally, often, tends, some, maybe]
COMPARATORS       = [more, less, greater, higher, lower, than, %, percent, x, increase, decrease]
```

**D4 triggers (evaluate on Check 1; fixed priority order; take the first ≤2 that fire):**
1. `problem.trim() === ""` → *problem statement empty*.
2. Q ends without `?` AND first token of Q ∉ QUESTION_STARTERS → *Q not a question*.
3. `(Q.match(/\?/g)||[]).length > 1` OR ` and ` appears before the first `?` → *two asks in Q*.
4. `bulletCount(S) ≤ 1` → *Situation thin*.
5. token-Jaccard(C_all, S_all) ≥ 0.6 OR `bulletCount(C) ≤ 1` → *Complication thin/restates Situation*.
6. `sentenceCount(problem) ≥ 3` → *problem too long*.
- If none fire → **pass immediately** (checkCount 1). If any fire → show ≤2 by priority + reflect-back, and on Check 2 → **pass unconditionally**. If input is unclassifiable but non-trivial (all fields have text, nothing above fires) → the pass path is taken; the safe fallback is only used if exactly zero named triggers fire yet the input is too thin to pass (e.g. every field one word), guaranteeing the coach never says something wrong.

**F4 triggers (same structure):**
1. `subclaims.length ≤ 1` → *only one*.
2. any subclaim: first token ∈ IMPERATIVE_VERBS → *is a task* (`{subclaim}` = that one).
3. any subclaim: contains a HEDGE_WORD AND contains no number/COMPARATOR → *not falsifiable*.
4. any pair: token-Jaccard ≥ 0.6 → *two overlap* (`{a}`,`{b}`).
5. any subclaim: token-Jaccard with the branch label ≥ 0.6 → *restates branch*.
- None fire → pass at Check 1. Else ≤2 by priority + reflect-back; Check 2 passes. Safe fallback per §5 F4 when nothing classifies but the set is too thin to pass.

**Reflect-back is always specific** (quotes the user's own `{Q}` or `{subclaim[0]}`) so the pass reads as earned even though guaranteed (Client P2-11).

---

## 8 · REAL-COPY vs PLACEHOLDER BOUNDARY

Three visually distinct placeholder classes, none confusable with final copy or with each other.

**A. Final on-screen copy (ship as written).** All structural and instructional text: the merged W1 cold-open framing, the three Day-1 reasons, the what-is/isn't lists, the objective lines (rendered in draft register but authored), the SCQ definition, the hypothesis definition, every why-it-matters line, activity instructions, the four norms labels + descriptions, the norms argument line, checklist framing + group headings, nav labels, the "one object drawn three ways" and "resolves into a problem statement" anchor phrases, both coach banks (FAKED but authored, including the reflect-back and safe-fallback lines), and all closing lines. Content type scale; second person; no em dashes; none of the banned words (embark/journey/dive in/unlock/elevate). "journey"/"unlock" remain confined to internal code names, never a visible label.

**B. `⟦SCAFFOLD · …⟧` — structured scaffold slots.** Text-pending FEN facts with known structure: the FEN SCQ, the L1 claim, the shared problem statement, the three branches, the assigned branch, workplan rows/owners, deliverable TOC sections. Render with **real column headers, the true count (3 branches), greeked lines at realistic length, and word-level spans** where a morph targets them. Reads as a finished product awaiting copy, never an empty form. This is what makes the "hero" screens (`F2`, `F3`, `C3`) read finished, not wireframe (Client P1-5).

**C. `⟦FEN · …⟧` / `⟦EXAMPLE · …⟧` — flat frames and inline slots.** Genuinely-unknowable artefacts via `<ArtefactFrame>` (proposal PDF, context brief, IKO deck, Day 1 tree slide, two report covers, Craft-doc anchor) with caption and optional flag; short inline facts via `<InlineSlot>` (staff quotes, attributions, PD-split details, links). `⟦EXAMPLE⟧` marks the realistic-not-FEN norms illustrations.

**Placeholder styling.** Classes B and C: soft-pink `#F6DFE9` ground, 1px dashed maroon border, 11px uppercase maroon corner tag (`FEN CONTENT`, `SCAFFOLD`, or `EXAMPLE`), italic maroon-60% body. A reviewer must never mistake a slot for finished content, and a stand-in must never read as authored. **Motion note:** all three classes animate identically to real content, so dropping real FEN artefacts in later swaps the slot's children with zero re-choreography.

**Stored-state slots** (user's SCQ, branch, notes, coach reads) are pulled from the store and shown in their own frames alongside FEN slots; each has an authored **skipped-state** string (defined for `D5` Beat A, `F6` Beat A, and `X1`).

**Open items carried as placeholder text or production notes, never silently assumed (moved off-screen per Copy P1-2):** single vs multiple SCQs (v1 = one); context-brief format (inspiration from Audrey's share); sign-off to show the real Day 1 slide with rough edges; whether the vault/checklists live on the Hub before any download is promised (until then, downloads render in the honest "link coming" state); whether FEN has a written PD split or the standard one is used; links to past SCQ trainings and Audrey's issue-tree bot; final Craft-signed objectives; Aptos web-font licensing (fallback stack is authoritative until bundled).
# Odora — Future Discovery Experience (architecture notes)

Status: **architecture only — NOT implemented yet.** This document reserves
the structure so the premium "fragrance identity" journey can be added later
**without redesigning the product**. Nothing here is wired up; it is a map.

## Design principles (already guiding the UI)

Odora is an **AI fragrance-discovery platform**, not a shop. Every screen
should move the user through: **Curiosity → Discovery → Understanding →
Trust → Recommendation.** Copy talks about understanding the user
("we understand your fragrance personality"), never "we sell/recommend
perfumes" first. Visual language: neutral premium (white / light-gray /
dark type / a single gold accent in day mode; dark-gold in night mode),
minimal line icons, soft shadows, generous whitespace, subtle fade/slide
animations only.

## The long-term journey

```
Landing → Quiz → Analyzing → Quick Result → [Deep Discovery — optional]
                                                    ↓
   Fragrance DNA → Fragrance Identity → Signature Identity → Archetype
                                                    ↓
                                     Detailed Recommendation Report
```

- **Quick Result** (fast path): right after the quiz, a simple summary
  ("You lean toward Fresh, Woody and Citrus") + a few perfume cards.
  Users who only want recommendations can stop here.
- **Optional Deep Discovery**: below the quick result, a premium teaser —
  *"Want to know WHY these fragrances fit you?"* → button *Discover My
  Fragrance DNA*. Feels like unlocking a deeper experience, not a longer quiz.
- **Deep Discovery** reveals step by step (never all at once):
  1. **Analyzing** — animated progress with rotating messages.
  2. **Fragrance DNA** — visual scent profile across axes (Fresh, Woody,
     Amber, Floral, Green, Marine, Leather, Sweet, Gourmand). Becomes the
     foundation of every recommendation.
  3. **Fragrance Identity** — describe the *person* before any perfume.
  4. **Signature Identity** — a memorable name (e.g. "Quiet Confidence").
  5. **Archetype** — one of a fixed set (The Explorer, The Minimalist, …)
     with name, description, traits, preferred styles.
  6. **Recommendation Report** — only now explain each match: compatibility
     score, matching notes, strengths, occasion, season, time of day, reason.

## How it maps onto the existing (vanilla-JS) architecture

Reserved, not yet created — proposed names so it slots in cleanly:

- **Routes** (hash router in `src/js/router.js`, registered in `app.js`):
  - `#/results` — stays the **Quick Result** (existing results page).
  - `#/discovery` — the guided Deep Discovery flow (a small step machine,
    same pattern as `pages/quiz.js`).
- **Pages**: `src/js/pages/discovery.js` (the step host) rendering sub-views
  for analyzing / dna / identity / archetype / report.
- **Logic**: `src/js/discovery/` — pure functions, no UI:
  - `dna.js` — turn the quiz profile (already built by
    `matching/profile.js`) into the DNA axis vector.
  - `identity.js` — DNA → descriptive identity sentences.
  - `archetype.js` — DNA → archetype (data table of archetypes).
  - `report.js` — per-perfume justification (reuses `matching/` breakdown,
    which already returns note/season/occasion/strength sub-scores).
- **Data**: `src/js/data/archetypes.js` (the fixed archetype set) — same
  shape as `data/families.js`.
- **i18n**: all copy under a new `discovery.*` block in **both**
  `locales/fa.json` and `locales/en.json` (identity/archetype text is
  templated from keys, values filled from the computed profile).
- **State** (`state/store.js`): the quiz `answers` already persist; the
  computed DNA/identity can be derived on demand (no new storage needed) or
  cached under `state.discovery` if we want to avoid recompute.

## Why this is low-risk

The matcher already produces a per-factor breakdown and a family profile,
so the DNA, archetype and report are **presentation layers over existing
numbers** — no change to the quiz, the matching algorithm, routing or the
backend is required to add them later.

# Odora — Scent Signature Experience (architecture notes)

The premium "understand yourself first" journey that reveals a user's
**Scent Signature**. It is built entirely as **presentation layers over the
existing profile/matcher** — no change to the quiz, the matching algorithm,
routing rules or the backend.

## Design principles

Odora is an **AI fragrance-discovery platform**, not a shop. Every screen
moves the user through: **Curiosity → Discovery → Understanding → Trust →
Recommendation.** Copy talks about understanding the user ("we understand
your fragrance personality"), never "we sell/recommend perfumes" first.
Visual language: neutral premium (white / light-gray / dark type / a single
gold accent in day mode; dark-gold in night mode), minimal line icons, soft
shadows, generous whitespace, subtle fade/slide animations only.

## The journey

```
Landing → Quiz → Quick Result → [Scent Signature journey — optional]
                                          ↓
   Scent Signature → Identity → Signature Name → Archetype → Report
```

- **Quick Result** (`#/results`): right after the quiz, a simple summary
  ("You seem to lean toward Woody, Leather and Amber fragrances") + the top
  perfume cards. Users who only want recommendations can stop here.
- **Optional journey**: below the quick result, a premium teaser —
  *"Want to know WHY these fragrances fit you?"* → *Discover My Scent
  Signature*. Feels like unlocking a deeper experience, not a longer quiz.
- **The `#/signature` flow** reveals one idea at a time:
  1. **Analyzing** — animated progress with rotating messages.
  2. **Scent Signature** — visual profile across 9 axes (Fresh, Woody,
     Amber, Floral, Green, Marine, Leather, Sweet, Gourmand). The foundation
     of every recommendation.
  3. **Identity** — describe the *person* before any perfume.
  4. **Signature Name** — a memorable name (e.g. "Quiet Confidence").
  5. **Archetype** — one of a fixed set (The Explorer, The Minimalist, …)
     with name, description, traits, preferred styles.
  6. **Recommendation Report** — only now explain each match: compatibility
     score, matching notes, strengths, occasion, season, time of day, reason.

## How it maps onto the (vanilla-JS) architecture

- **Routes** (hash router in `src/js/router.js`, registered in `app.js`):
  - `#/results` — the **Quick Result** (existing results page, now with the
    signature summary line + the teaser into the flow).
  - `#/signature` — the guided Scent Signature flow (a step machine, same
    pattern as `pages/quiz.js`), gender-scoped theme.
- **Page**: `src/js/pages/signature.js` — the step host rendering the
  analyzing / profile / identity / name / archetype / report sub-views.
- **Logic**: `src/js/signature/` — pure functions, no UI:
  - `scentSignature.js` — turns the quiz profile (from `matching/profile.js`)
    into the 9-axis Scent Signature (`buildScentSignature`, `SIGNATURE_AXES`).
  - `identity.js` — Scent Signature → identity statements + a signature-name key.
  - `archetype.js` — Scent Signature → archetype (cosine match).
  - `report.js` — per-perfume justification (reuses the `matching/` breakdown,
    which already returns note/season/occasion/strength sub-scores).
- **Data**: `src/js/data/archetypes.js` — the fixed archetype set (id + icon +
  axis-weight vector), same shape idea as `data/families.js`.
- **i18n**: all copy under the `signature.*` block in **both**
  `locales/fa.json` and `locales/en.json`; the landing preview uses
  `home.signature.*`. Identity/archetype text is templated from keys, values
  filled from the computed signature.
- **State** (`state/store.js`): the quiz `answers` already persist; the Scent
  Signature / identity are derived on demand — no new storage needed.

## Why this is low-risk

The matcher already produces a per-factor breakdown and a family profile, so
the Scent Signature, archetype and report are **presentation layers over
existing numbers** — no change to the quiz, the matching algorithm, routing
or the backend.

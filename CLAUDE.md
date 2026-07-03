# Odora — رایحه‌ات رو با ما کشف کن

Perfume recommendation web app: users answer scent-preference questions and get real-perfume suggestions with match percentages.

## Current status

**v1 is COMPLETE and working** (8 phases + revisions + English + phase 9 features — full changelog in README.md).
Do NOT rebuild anything from scratch; the site works. Only apply the specific changes the
user asks for. Run it with `python serve.py` → http://localhost:5500 to see the current state.

## Working rules (important)

- **The user communicates in Persian.** Reply in Persian.
- **Step-by-step delivery:** build one step at a time, show the result with a short explanation, and WAIT for the user's approval before moving to the next step.
- When the user requests changes, change ONLY what was asked — do not touch other parts.

## Stack & run

- Vanilla HTML/CSS/JS, ES Modules loaded natively — **no build step, no Node.js**.
- Dev server: `python serve.py` (port 5500, sends `Cache-Control: no-store` so module edits show up). Configured in `.claude/launch.json` as `odora`.

## Structure

```
index.html                  entry; <html data-theme="default" data-mode="dark">
serve.py                    no-cache Python dev server
assets/css/themes.css       4 palettes × 2 modes via [data-theme][data-mode]
assets/css/styles.css       all component styles
src/js/app.js               bootstrap: shell (header/footer), routes, per-route theme scope
src/js/router.js            hash router (#/perfume/:id, query ?s=...)
src/js/state/store.js       pub/sub store → localStorage key "odora:state"
src/js/i18n/                loader + locales/fa.json + locales/en.json (ALL UI text lives here)
src/js/ui/                  theme.js (applyTheme/toggleMode), icons.js, toast.js, perfumeCard.js (shared card + heart)
src/js/data/                perfumes.js (100 real perfumes, Persian desc), perfumesEn.js (English descs by id), families.js (7 scent families)
src/js/quiz/questions.js    6-step quiz definition
src/js/matching/            profile.js, localMatcher.js (cosine), aiMatcher.js (stub), index.js (facade)
src/js/utils/               share.js (base64 result links), format.js (Persian digits)
src/js/pages/               home, gender, quiz, results, perfume, catalog, favorites, account, gift, about, contact
```

## Conventions

- **i18n:** never hardcode UI text — add keys to BOTH `locales/fa.json` and `locales/en.json` (same structure), read with `t("dotted.key")`. The header has a language toggle (EN/فا); switching reloads the locale, flips `dir`/`lang` on `<html>` and re-renders in place (no page reload). `toFaDigits()` is locale-aware (Persian digits only when lang=fa). Perfume descriptions: Persian on the record in perfumes.js, English in perfumesEn.js keyed by id. Latin names get class `latin`.
- **Theming:** palettes `default` (gold), `feminine` (rose-gold), `masculine` (navy/steel-blue), each with `dark` + `light` mode. Rules:
  - General nav pages (home, catalog/گنجینه, about, contact) → always `default` palette.
  - Test flow (gender, quiz, results) → the chosen gender's palette.
  - Perfume detail → the palette of that perfume's own gender.
  - Always change theme via `applyTheme()` / `toggleMode()` in `src/js/ui/theme.js` (route scoping is in `app.js` `page()`).
- **Gender filtering is strict:** each section shows only its own gender's perfumes (`genderEligible` in localMatcher; tab filter in catalog).
- **Matching:** strategy pattern — `matching/index.js` facade, `setMatcher("ai")` to swap the local cosine matcher for a future AI API. `similarTo(pf)` powers the "similar perfumes" strip (same gender only).
- **Favorites:** perfume ids in `state.favorites` (store.js `toggleFavorite`/`isFavorite`); hearts render via the shared `ui/perfumeCard.js`. Favorites page at #/favorites, heart icon in the header.
- **Account is LOCAL-ONLY for now:** `state.user = { name, email, since }`, page at #/account (user icon in header). When the backend phase arrives, replace only the account page logic — the rest of the app reads `getState().user`.
- **Gift links:** `#/gift?g=<url-safe base64 of {p,n,m}>` (perfume id, sender name, message) — same no-backend trick as shared results. Created from the detail page, rendered by pages/gift.js in the perfume's own palette.
- **Surprise gift test (pages/giftTest.js):** sender builds `#/gtest?d=<{n,e,m}>` from #/gift-test (home hero button); opening it arms `state.giftMode` + resets progress; quiz then ends on #/gift-done (thank-you, NO results shown) which builds the sender-only result link (buildShareLink → existing shared-results view), offers mailto/copy, then wipes giftMode+answers so the recipient can't peek. FREE version — payment + automatic e-mail land with the backend phase.
- Fonts: Vazirmatn (Persian) + Poppins (Latin). No login/signup in this phase. Mobile-friendly.

## Roadmap (future phases, keep code modular for these)

Payment gateway (incl. crypto), gift links, price comparison, user accounts, AI-based analysis, multi-language (i18n files are ready for it).

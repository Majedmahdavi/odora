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
- Dev server: `python serve.py` (port 5500, sends `Cache-Control: no-store` so module edits show up; also proxies `/api/*` to the production API so server-backed features work locally). Configured in `.claude/launch.json` as `odora`.

## Production / backend

- **Live site:** http://84.32.10.66/ (own VPS, Ubuntu 22.04, nginx serving `/var/www/odora`) + mirror on GitHub Pages (majedmahdavi.github.io/odora — no API there).
- **Deploy frontend:** `git push`, then `git pull` in `/var/www/odora` on the VPS.
- **API:** stdlib-Python + sqlite at `/opt/odora-api/api.py` (systemd unit `odora-api`), behind nginx `location /api/`. Auth: POST `/api/auth/enter` (login-OR-register: 401 bad-password, 404 needs-name), POST `/api/auth/logout`, GET `/api/me`, PUT `/api/me/favorites`, GET `/api/me/gifts` — all token-based (`Authorization: Bearer`). Gifts: POST `/api/gifts` (token ties it to the account), GET `/api/gifts/:id`, POST `/api/gifts/:id/result` (single-use, 409 after), POST `/api/gifts/mine` (legacy secret-checked). Passwords: PBKDF2-SHA256. SMTP email hook reads `/opt/odora-api/config.json` — inactive until the smtp fields are filled.
- SSH/connection details live in the private session memory, NOT here (public repo).

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
- **Olfactory pyramid:** each perfume record has `notes: { top[], heart[], base[] }` holding note SLUGS (e.g. "bergamot"); display names live in the `notes` section of BOTH fa.json and en.json (add new slugs to both). Rendered on the detail page (pd-structure); empty tiers are skipped.
- **Matching:** strategy pattern — `matching/index.js` facade, `setMatcher("ai")` to swap the local cosine matcher for a future AI API. `similarTo(pf)` powers the "similar perfumes" strip (same gender only).
- **Favorites REQUIRE a signed-in account:** heart clicks without `state.user.token` toast + redirect to #/account (gates in ui/perfumeCard.js wireFavButtons, pages/perfume.js, and the #/favorites page itself). Ids in `state.favorites` (store.js `toggleFavorite`/`isFavorite`), synced to the server on every toggle.
- **Auth UI is two separate tabs** (ورود | ثبت‌نام) in pages/account.js; the frontend sends `mode: "login" | "register"` to /api/auth/enter — 404 no-account (login for unknown email), 409 email-exists (register for a taken email), 401 bad-password.
- **Accounts are SERVER-BACKED:** `state.user = { token, name, email, since }` set by pages/account.js (one form = login OR register via /api/auth/enter; password min 6). Favorites live locally AND sync to the account (`syncFavorites()` in store.js fires on every toggle when signed in; merged union on login). Gift history in the panel = account gifts (/api/me/gifts) merged with legacy device gifts (state.myGifts → /api/gifts/mine). Users without a token (old local profiles) just see the login form again.
- **Gift links:** `#/gift?g=<url-safe base64 of {p,n,m}>` (perfume id, sender name, message) — same no-backend trick as shared results. Created from the detail page, rendered by pages/gift.js in the perfume's own palette.
- **Surprise gift test (pages/giftTest.js) is SERVER-BACKED:** creating a link REQUIRES `state.user` (account). POST /api/gifts → `{id, secret}`; secret is stored in `state.myGifts`, the recipient link is `#/gtest?g=<id>` (no data in the URL). Landing GETs the gift (used → "already used" page), arms `state.giftMode={id,n}`; quiz ends on #/gift-done which POSTs the result to the server (single-use burn) and shows a thank-you with ZERO result access, then wipes giftMode+answers. The sender reads results in the account panel ("gift history" section, `/api/gifts/mine`). Payment + e-mail activation are future steps.
- Fonts: Vazirmatn (Persian) + Poppins (Latin). No login/signup in this phase. Mobile-friendly.

## Roadmap (future phases, keep code modular for these)

Payment gateway (incl. crypto), gift links, price comparison, user accounts, AI-based analysis, multi-language (i18n files are ready for it).

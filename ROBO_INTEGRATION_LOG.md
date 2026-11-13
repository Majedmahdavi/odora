# ROBO → Odora Integration — Work Log (Stage 1)

**Purpose of this file:** a step-by-step record of how the ROBO "Scent-Matrix"
research engine is being connected to the Odora app, written so a reviewer who
has never seen either project can understand *what was done, why, and where*.

**Branch/scope:** everything here is on the **`test`** branch, in the
`test fork` working copy only. The live site (`odoraperfume.ir` / the VPS) and
the `master` branch are **not touched**. Nothing is deployed.

**Date started:** 2026-11-13

---

## Background (one paragraph)

Odora today recommends from **100 curated perfumes** scored over **7 scent
families** (woody, citrus, floral, sweet, spicy, oud, aquatic) using a cosine
matcher (`src/js/matching/localMatcher.js`). ROBO ("Scent-Matrix Synthesis",
a separate Python research project) models perfume perception as linear algebra
and, crucially, has a **real temperature/evaporation physics layer** derived
from PubChem boiling-point & vapor-pressure data (Clausius–Clapeyron), plus
**score interpretability** (decomposing a match into per-feature contributions).

## Stage 1 goal (what the user approved)

Make Odora's "brain" smarter **without changing the UX**: use ROBO's temperature
physics + interpretability to re-rank the *same 100 perfumes* and show *why* each
match fits. Chosen approach: **port ROBO's validated physics into Odora as a new
JS matcher** (no heavy Python service, no deploy — fits Odora's vanilla-JS,
dependency-free architecture and its existing `setMatcher()` swap hook). A full
ROBO-engine-as-a-service is a later stage (needs server deployment).

What is explicitly **out of Stage 1** (future, needs data): trauma/hormone
(E=fᵀMh) layer, cross-modal psychophysics inference, the 40k catalog, Lean/CQL.

---

## Provenance — ROBO data/code read before building

- `data/ds_a5_volatility_classes.csv` — note-class per molecule by PubChem BP
  heuristic (<160°C top, 160–250 heart, >250 base).
- `data/ds_b2_temperature.csv` — real BP + vapor pressure (e.g. linalool 21 Pa
  @25°C; limonene 207 Pa; vanillin/coumarin heavy/base).
- `data/ds_b7_weartime_anchors.csv` — top 2h / heart 6h / base 12h.
- `src/scent_matrix/temperature.py` — the operator model: `A'(T)=A·diag(c(T))`,
  `c_j(T)=c_ref·exp(k·(T−T_ref))` (ln c linear in T); reference worked example
  `C_HOT=[1.5, 0.5]`, `C_COLD=[0.4, 1.2]` (sillage/longevity at 40°C / 5°C).

---

## Steps

### Step 1 — Port the physics → `src/js/matching/notePhysics.js`
Dependency-free JS port of ROBO's temperature model. Maps Odora's 7 families to
ROBO's note classes (citrus/aquatic = top; floral/spicy = heart; woody/sweet/oud
= base) and implements `c_j(T) = c_cold·exp(k·(T−T_cold))` (ln c linear in T)
with cold/hot anchors generalized from ROBO's reference `C_HOT/C_COLD`. Also
`tempFromSeason()` (warm→30°C, cold→8°C, all→20°C — the Stage-1 bridge from the
quiz season to a temperature; a later stage can use live weather).
Verified coefficients: cold boosts base (×1.21) / damps top (×0.50); warm boosts
top (×1.06) / damps base (×0.70) — physically correct direction.

### Step 2 — New brain → `src/js/matching/scentMatrixMatcher.js`
Same interface as `localMatcher`. Score = **taste** (cosine, unchanged, 70%) +
**temperature fit** (12%) + occasion (10%) + strength (8%). The temperature-fit
term is the mean evaporation coefficient of the perfume's own notes, c̄(T) — high
for fresh perfumes in heat and heavy perfumes in cold. It is kept SEPARATE from
the taste cosine (an earlier attempt folded it into the cosine and produced
counter-intuitive flips, because cosine is scale-invariant — documented in-file).
The old flat 15% "season" weight is replaced by this physics term. Also emits
`breakdown.contributions` (the families that drive the taste match) for the "why"
line, plus `temp`/`avgC`/`tempC`.

### Step 3 — Wire it in
`matching/index.js`: registered `scentmatrix` in the matcher facade.
`app.js` boot: `setMatcher("scentmatrix")` so the whole test build uses the new
brain. (The old `localMatcher` stays available — `setMatcher("local")` reverts.)

### Step 4 — Surface the "why" (interpretability)
`results.js`: a small `whyLine()` under the top result shows the two families
driving the match + a weather clause when the perfume genuinely suits the season
("— تقویت‌شده در هوای خنک" / "— متناسب با هوای گرم"). New i18n keys
`results.whyLabel/tempCold/tempWarm` in BOTH locales. One scoped CSS rule
(`.match-why`). UX is otherwise unchanged.

### Step 5 — Verification (no live browser this session — preview MCP was down)
- **JSON** valid (fa + en). **i18n:** 200 literal `t()` keys all resolve in both
  locales; the 3 new keys present.
- **Wiring** confirmed (facade + app default).
- **Math — Python mirror** of the exact scoring on 3 representative perfumes +
  a balanced taste need, proving intuitive, season-dependent re-ranking:

  | Perfume | taste | tempFit COLD(8°C) | tempFit WARM(30°C) |
  |---|---|---|---|
  | Acqua di Gio (fresh) | 0.86 | **0.17** (low) | **0.63** (high) |
  | Tobacco Vanille (base/sweet) | 0.69 | **0.84** (high) | **0.32** (low) |
  | Aventus (woody, strong taste) | 0.92 | 0.55 | 0.45 |

  Result: taste stays primary (Aventus #1 both seasons), but the fresh perfume
  pulls far ahead of the heavy one in summer and the gap narrows in winter —
  the intuitive "right scent for the weather" behavior, grounded in ROBO physics.
- **Pending:** live browser screenshot (preview tool was unavailable this
  session); the logic is verified by the mirror + static checks.

### Files added/changed (all in `test fork`, branch `test`)
- added: `src/js/matching/notePhysics.js`, `src/js/matching/scentMatrixMatcher.js`
- changed: `src/js/matching/index.js` (register), `src/js/app.js` (default),
  `src/js/pages/results.js` (why line), `src/js/i18n/locales/{fa,en}.json` (3 keys),
  `assets/css/styles.css` (one `.match-why` rule)

### How to review / revert
- See it: run `python serve.py` in the test fork → quiz with season=warm vs
  season=cold → the ranking and the "why" line shift.
- Revert the brain without deleting anything: in `app.js` change
  `setMatcher("scentmatrix")` → `setMatcher("local")`.

---

## Stage 1.5 — Live weather (done)

Replaces the season→temperature bridge with the **real current temperature**, so
recommendations react to today's weather, not just the quiz season.

- `src/js/utils/weather.js`: Open-Meteo (free, keyless, CORS-friendly — the same
  source ROBO used) `current.temperature_2m`; 10 Iranian cities with coords +
  bilingual labels; `fetchTempByCity()` resolves to `null` on any failure.
- `state/store.js`: `weatherCity` + `weatherTempC` (persisted).
- `matching/index.js`: `recommend(state, { tempC })` injects `profile.tempC`;
  `scentMatrixMatcher` uses it when present, else falls back to the season.
- `results.js`: a compact weather control — pick a city → fetch live temp →
  re-rank; "By season" clears it back to the season default; network failure
  keeps the season ranking and toasts. fa/en keys `results.weather*`, one
  `.weather-bar` CSS rule. Shown only on the user's own results (not shared links).

**Verified (live API + mirror):** real temps fetched now — Tehran 11.5°C,
Bandar Abbas 27.0°C. At cool Tehran the heavy perfume's tempFit (0.73) beats the
fresh one (0.21); at warm Bandar Abbas the fresh perfume (0.53) beats the heavy
(0.37). Live weather re-ranks sensibly. JSON valid; 205 i18n keys resolve in both
locales. (Live browser screenshot still pending — preview tool unavailable.)

Files: added `src/js/utils/weather.js`; changed `state/store.js`,
`matching/index.js`, `matching/scentMatrixMatcher.js`, `pages/results.js`,
`i18n/locales/{fa,en}.json`, `assets/css/styles.css`.

---

---

## Stage 1.6 — Geolocation + freshness cache (done)

Makes the live-weather ranking effortless and self-maintaining.

- `utils/weather.js`: `getGeoCoords()` (browser geolocation, resolves `null` on
  deny/timeout/unsupported — never throws), `nearestCity(lat, lon)` for a
  friendly label, `WEATHER_TTL_MS = 30 min` + `isFreshWeather(ts)`.
- `state/store.js`: `weatherSource` ("city" | "geo"), `weatherCoords`, `weatherAt`.
- `results.js`:
  - the picker gained a **📍 My location** option; choosing it asks the browser
    for coordinates, fetches the temperature for those exact coordinates (more
    accurate than a city centroid) and labels it "📍 near {nearest city} · N°C";
  - `maybeRefreshWeather()` — on render, if a location is set but its cached
    temperature is older than the TTL, it refreshes in the background by
    coordinates and re-renders **only if the value actually changed** (no render
    loop: the refreshed timestamp makes the next pass fresh);
  - every failure path is safe: denied location → toast + stay on season;
    failed fetch → keep the previous value silently.
- fa/en keys `results.weatherGeo / weatherGeoError / weatherNear`.

**Verified:** JSON valid; 208 i18n keys resolve in both locales; all
`weather.js` exports present; `nearestCity` correct on 5 coordinate spot-checks
(downtown Tehran→tehran, Shiraz airport→shiraz, Karaj→karaj, Qeshm→bandar-abbas,
Gilan coast→rasht); TTL boundary correct (29 min fresh, 31 min stale).
(Geolocation itself needs a real browser prompt — not exercisable this session.)

---

---

## Stage 2 — Catalog expansion: **investigated and rejected** (with data)

The plan was to import perfumes from ROBO's 39,987-row matrix A. Before writing
any import code the source data was audited — and it does not meet Odora's
requirements:

| Field Odora needs | Availability in ROBO's catalog (58,825 rows) |
|---|---|
| **gender** (strict filter is a core product rule) | **0.0 % filled** — absent from `ds_a1_catalog.csv` *and* from the original Parfumo scrape (`raw/parfumo_data_clean.csv` has no gender-like column at all) |
| Persian name / description | 0.0 % |
| price / commercial | 0.0 % |
| rating | 50.5 % |
| note pyramid (top/middle/base) | present in the raw scrape ✅ |
| 24-accord vector | 100 % of 39,987 rows, avg 4.8 of 24 accords each ✅ |

**Could gender be inferred from the accords?** Tested properly instead of
assumed: Odora's own 100 perfumes have known genders, so they are a labelled
validation set. 39 of them were matched into ROBO's catalog by name, an
accord-based heuristic (floral/powdery/creamy → feminine, woody/leathery/
smoky/fougère → masculine) was tuned over four thresholds, and the best result
was **44 % accuracy — barely above the 33 % random baseline for three classes**.
The confusion matrix was disqualifying: 5 masculine perfumes labelled feminine,
5 unisex labelled feminine, 4 unisex labelled masculine.

**Decision: do not import.** Injecting guessed genders would silently break the
"each section shows only its own gender" promise, and the imported records would
have no Persian text — both at odds with the product and the ODL. The 40k
catalog stays available for a future stage if a real gender source appears
(e.g. Fragrantica/brand data), which is now recorded as the blocking dependency.

## Stage 2 (delivered) — Estimated wear time + richer "why"

The valuable, zero-risk half of Stage 2, grounded in ROBO data:

- `notePhysics.js` gains `WEAR_ANCHORS` (top 2 h / heart 6 h / base 12 h — ROBO
  `ds_b7_weartime_anchors.csv`, which ROBO itself marks confidence 0.3), plus
  `longevityFactor(T)` (ROBO's reference longevity axis, 1.2 at 5 °C → 0.5 at
  40 °C, log-linear) and `estimateWearHours(families, tempC)`.
- `results.js`: the "why" line now ends with "· lasts about N h", computed at the
  same temperature used for ranking.
- `perfume.js`: an "Est. longevity" meta chip on the detail page, using the
  user's current weather temperature when known (else 20 °C).
- fa/en keys `results.wearAbout`, `results.wearHours`, `perfume.wear`.

**Verified (mirror):** fresh scents 3–5 h, woody ~5–9 h, heavy bases 6.5–11 h;
heat shortens and cold extends — matching real perfumery expectations.
JSON valid, 211 i18n keys resolve in both locales, structure intact
(the locale files were reformatted to 2-space JSON by the key-insertion script —
content unchanged).

---

## Next stages (not done — future)
- Catalog expansion — blocked on a gender data source (see above).
- Stage 3 (needs human-study data): cross-modal inference, trauma/hormone layer.

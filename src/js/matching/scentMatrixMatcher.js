import { FAMILIES } from "../data/families.js";
import { cosine } from "./localMatcher.js";
import { familyCoefficient, tempFromSeason } from "./notePhysics.js";

/**
 * Scent-Matrix matcher (ROBO Stage 1) — taste match + temperature fit + why.
 * ------------------------------------------------------------------------
 * Same interface as localMatcher: match(profile, perfumes) → ranked
 * [{ perfume, score, percent, breakdown }]. Enabled via setMatcher("scentmatrix").
 *
 * Score = taste(cosine) + temperature-fit + occasion + strength.
 *
 *  - TASTE (cosine, unchanged): how close the perfume's family vector is to the
 *    user's need — scale-invariant direction match.
 *  - TEMPERATURE FIT (ROBO §7 physics): the average evaporation coefficient of
 *    the perfume's own notes at the current temperature, c̄ = Σ A_f·c_f(T) / Σ A_f
 *    (notePhysics.js). In heat, volatile/fresh perfumes have high c̄ (they project
 *    and suit the heat); in cold, base-heavy perfumes have high c̄ (they bloom and
 *    last). This is a clean, intuitive "right scent for the weather" term — kept
 *    SEPARATE from the taste cosine so it doesn't distort direction (the earlier
 *    attempt folded it into the cosine and produced counter-intuitive flips).
 *    Temperature comes from the quiz season; a later stage can use live weather.
 *  - Flat 15% season weight is replaced by this physics-based term.
 *
 * INTERPRETABILITY (ROBO interpret.py): the taste match is decomposed into the
 * families that drive it, and the perfume is flagged as weather-suited or not, so
 * the UI can explain *why* (results.js whyLine).
 */

const WEIGHTS = { note: 0.7, temp: 0.12, occasion: 0.1, strength: 0.08 };
const STRENGTH_RANK = { light: 1, medium: 2, strong: 3 };

function genderEligible(userGender, perfumeGender) {
  return perfumeGender === userGender; // strict, per Odora convention
}
function occasionScore(user, perfumeList) {
  if (!user) return 1;
  return perfumeList.includes(user) ? 1 : 0.4;
}
function strengthScore(user, perfume) {
  const d = Math.abs((STRENGTH_RANK[user] ?? 2) - (STRENGTH_RANK[perfume] ?? 2));
  return 1 - d * 0.3;
}

/** Mean temperature coefficient of a perfume's own notes → 0..1 fit score. */
function tempFit(pf, tempC) {
  let num = 0;
  let den = 0;
  for (const f of FAMILIES) {
    const a = pf.families[f] ?? 0;
    num += a * familyCoefficient(f, tempC);
    den += a;
  }
  if (den === 0) return { fit: 0.5, avgC: 1 };
  const avgC = num / den; // ~0.5 (wrong-season) .. ~1.4 (right-season)
  const fit = Math.max(0, Math.min(1, (avgC - 0.6) / 0.6)); // 0.6→0, 1.2→1
  return { fit, avgC };
}

/** Families that drive the taste match (ROBO score decomposition). */
function contributions(need, pf) {
  const terms = FAMILIES.map((f) => ({ family: f, v: (need[f] ?? 0) * (pf.families[f] ?? 0) }));
  const total = terms.reduce((s, t) => s + t.v, 0) || 1;
  return terms
    .filter((t) => t.v > 0)
    .sort((a, b) => b.v - a.v)
    .map((t) => ({ family: t.family, share: t.v / total }));
}

export const scentMatrixMatcher = {
  id: "scentmatrix",

  match(profile, perfumes) {
    const tempC = tempFromSeason(profile.season);

    const scored = perfumes
      .filter((pf) => genderEligible(profile.gender, pf.gender))
      .map((pf) => {
        const { fit, avgC } = tempFit(pf, tempC);
        const breakdown = {
          note: cosine(profile.families, pf.families),
          temp: fit,
          avgC,
          occasion: occasionScore(profile.occasion, pf.occasion),
          strength: strengthScore(profile.strength, pf.strength),
          tempC,
          contributions: contributions(profile.families, pf),
        };
        const score =
          WEIGHTS.note * breakdown.note +
          WEIGHTS.temp * breakdown.temp +
          WEIGHTS.occasion * breakdown.occasion +
          WEIGHTS.strength * breakdown.strength;
        return { perfume: pf, score, percent: Math.round(score * 100), breakdown };
      });

    scored.sort((a, b) => b.score - a.score);
    return scored;
  },
};

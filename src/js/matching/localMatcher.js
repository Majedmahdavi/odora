import { FAMILIES } from "../data/families.js";

/**
 * Local matching algorithm — transparent and dependency-free.
 * Implements the shared matcher interface:
 *   match(profile, perfumes) → ranked [{ perfume, score, percent, breakdown }]
 * so it is interchangeable with an AI-backed matcher of the same signature.
 */

/** Cosine similarity between two family vectors → 0..1. */
export function cosine(a, b) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (const f of FAMILIES) {
    const x = a[f] ?? 0;
    const y = b[f] ?? 0;
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/** Gender eligibility (hard filter): each section only shows its own gender. */
function genderEligible(userGender, perfumeGender) {
  return perfumeGender === userGender;
}

/** Soft factors → 0..1. */
function seasonScore(user, perfume) {
  if (user === "all" || perfume === "all") return 1;
  return user === perfume ? 1 : 0.35;
}

function occasionScore(user, perfumeList) {
  if (!user) return 1;
  return perfumeList.includes(user) ? 1 : 0.4;
}

const STRENGTH_RANK = { light: 1, medium: 2, strong: 3 };
function strengthScore(user, perfume) {
  const d = Math.abs((STRENGTH_RANK[user] ?? 2) - (STRENGTH_RANK[perfume] ?? 2));
  return 1 - d * 0.3; // 1.0, 0.7, 0.4
}

/** Contribution of each factor to the final match score (sums to 1). */
export const WEIGHTS = { note: 0.65, season: 0.15, occasion: 0.12, strength: 0.08 };

export const localMatcher = {
  id: "local",

  match(profile, perfumes) {
    const scored = perfumes
      .filter((pf) => genderEligible(profile.gender, pf.gender))
      .map((pf) => {
        const breakdown = {
          note: cosine(profile.families, pf.families),
          season: seasonScore(profile.season, pf.season),
          occasion: occasionScore(profile.occasion, pf.occasion),
          strength: strengthScore(profile.strength, pf.strength),
        };

        const score =
          WEIGHTS.note * breakdown.note +
          WEIGHTS.season * breakdown.season +
          WEIGHTS.occasion * breakdown.occasion +
          WEIGHTS.strength * breakdown.strength;

        return { perfume: pf, score, percent: Math.round(score * 100), breakdown };
      });

    scored.sort((a, b) => b.score - a.score);
    return scored;
  },
};

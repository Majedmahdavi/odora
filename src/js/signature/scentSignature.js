/**
 * Scent Signature — a presentation layer over the existing family profile.
 * Turns the 7-family preference vector (from matching/profile.js) into the
 * 9 Scent Signature axes the experience visualizes. No new data, no change
 * to the quiz or matcher — just a deterministic re-projection to 0..100.
 */

export const SIGNATURE_AXES = [
  "fresh", "woody", "amber", "floral", "green", "marine", "leather", "sweet", "gourmand",
];

// how each Scent Signature axis is built from the seven scent families
const WEIGHTS = {
  fresh:    { citrus: 1.0, aquatic: 0.5 },
  woody:    { woody: 1.0 },
  amber:    { oud: 0.8, spicy: 0.5, sweet: 0.3 },
  floral:   { floral: 1.0 },
  green:    { citrus: 0.6, aquatic: 0.4, woody: 0.2 },
  marine:   { aquatic: 1.0 },
  leather:  { spicy: 0.7, oud: 0.6, woody: 0.2 },
  sweet:    { sweet: 1.0 },
  gourmand: { sweet: 0.7, spicy: 0.4, oud: 0.2 },
};

const FAM_MAX = 5; // family ratings are 1..5 (sensory deltas may nudge higher)

/** profile.families → Scent Signature { axis: 0..100 }. */
export function buildScentSignature(profile = {}) {
  const fam = profile.families || {};
  const signature = {};
  SIGNATURE_AXES.forEach((axis) => {
    const w = WEIGHTS[axis];
    let raw = 0;
    let wsum = 0;
    for (const f in w) {
      raw += (fam[f] || 0) * w[f];
      wsum += w[f];
    }
    const norm = wsum ? raw / (wsum * FAM_MAX) : 0;
    signature[axis] = Math.max(6, Math.min(96, Math.round(norm * 100)));
  });
  return signature;
}

/** Signature axes sorted strongest-first (for summaries / names). */
export function topAxes(signature, n = 3) {
  return SIGNATURE_AXES.slice()
    .sort((a, b) => signature[b] - signature[a])
    .slice(0, n);
}

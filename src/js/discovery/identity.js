/**
 * Fragrance Identity — describe the *person* from their DNA before showing
 * any perfume. Produces i18n statement keys (discovery.identity.statements.*)
 * and a memorable signature-name key (discovery.identity.signatures.*).
 * Pure, deterministic.
 */
import { topAxes } from "./dna.js";

const avg = (dna, keys) => keys.reduce((s, k) => s + (dna[k] ?? 0), 0) / keys.length;

// candidate identity statements, each scored by how strongly it applies
const STATEMENTS = [
  { key: "freshOverSweet", score: (d) => (d.fresh - d.sweet) },
  { key: "subtleLuxury",   score: (d) => avg(d, ["amber", "leather", "woody"]) - 52 },
  { key: "floralSoul",     score: (d) => d.floral - 55 },
  { key: "cleanAiry",      score: (d) => avg(d, ["marine", "green", "fresh"]) - 52 },
  { key: "warmDepth",      score: (d) => avg(d, ["amber", "gourmand", "sweet"]) - 52 },
  { key: "grounded",       score: (d) => d.woody - 58 },
];

const SIGNATURE_BY_AXIS = {
  fresh: "freshElegance",
  marine: "oceanBreeze",
  woody: "quietConfidence",
  leather: "modernGentleman",
  amber: "goldenSunset",
  green: "urbanExplorer",
  floral: "bloomingGrace",
  sweet: "sweetIndulgence",
  gourmand: "velvetWarmth",
};

/** dna → { statements: [key,...], signatureKey }. */
export function buildIdentity(dna) {
  const ranked = STATEMENTS.map((s) => ({ key: s.key, v: s.score(dna) }))
    .filter((s) => s.v > 0)
    .sort((a, b) => b.v - a.v)
    .map((s) => s.key);

  // always give the user at least two things that feel true about them
  const statements = ranked.slice(0, 3);
  if (statements.length < 2) statements.push("balanced");

  const dominant = topAxes(dna, 1)[0];
  return { statements, signatureKey: SIGNATURE_BY_AXIS[dominant] || "quietConfidence" };
}

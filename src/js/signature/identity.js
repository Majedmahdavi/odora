/**
 * Signature Identity — describe the *person* from their Scent Signature before
 * showing any perfume. Produces i18n statement keys (signature.identity.statements.*)
 * and a memorable signature-name key (signature.identity.names.*).
 * Pure, deterministic.
 */
import { topAxes } from "./scentSignature.js";

const avg = (sig, keys) => keys.reduce((s, k) => s + (sig[k] ?? 0), 0) / keys.length;

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

/** signature → { statements: [key,...], nameKey }. */
export function buildIdentity(signature) {
  const ranked = STATEMENTS.map((s) => ({ key: s.key, v: s.score(signature) }))
    .filter((s) => s.v > 0)
    .sort((a, b) => b.v - a.v)
    .map((s) => s.key);

  // always give the user at least two things that feel true about them
  const statements = ranked.slice(0, 3);
  if (statements.length < 2) statements.push("balanced");

  const dominant = topAxes(signature, 1)[0];
  return { statements, nameKey: SIGNATURE_BY_AXIS[dominant] || "quietConfidence" };
}

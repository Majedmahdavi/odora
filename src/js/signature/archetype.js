/**
 * Archetype picker — chooses the archetype whose axis-weight vector best
 * matches the user's Scent Signature (cosine similarity over the 9 axes).
 * Deterministic; pure function.
 */
import { ARCHETYPES } from "../data/archetypes.js";
import { SIGNATURE_AXES } from "./scentSignature.js";

function cosine(a, b) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  SIGNATURE_AXES.forEach((ax) => {
    const x = a[ax] ?? 0;
    const y = b[ax] ?? 0;
    dot += x * y;
    na += x * x;
    nb += y * y;
  });
  if (!na || !nb) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/** signature ({axis:0..100}) → the best-matching archetype record. */
export function pickArchetype(signature) {
  const v = {};
  SIGNATURE_AXES.forEach((ax) => (v[ax] = (signature[ax] ?? 0) / 100)); // 0..1
  let best = ARCHETYPES[0];
  let bestScore = -Infinity;
  ARCHETYPES.forEach((arch) => {
    const score = cosine(v, arch.axes);
    if (score > bestScore) {
      bestScore = score;
      best = arch;
    }
  });
  return best;
}

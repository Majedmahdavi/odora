import { buildProfile } from "./profile.js";
import { localMatcher, cosine } from "./localMatcher.js";
import { aiMatcher } from "./aiMatcher.js";
import { PERFUMES } from "../data/perfumes.js";

/**
 * Matching facade (strategy pattern).
 * The rest of the app only ever calls recommend(); swapping to the AI engine
 * later is a one-liner: setMatcher("ai").
 */

const MATCHERS = { local: localMatcher, ai: aiMatcher };
let activeId = "local";

export function setMatcher(id) {
  if (MATCHERS[id]) activeId = id;
  return activeId;
}

export function getMatcherId() {
  return activeId;
}

/**
 * Build the user profile and return ranked recommendations.
 * @param {object} state  app state ({ gender, answers })
 * @param {object} [opts] { limit = 5, perfumes = PERFUMES }
 * @returns {Promise<{ profile, matcherId, top, all }>}
 */
export async function recommend(state, { limit = 5, perfumes = PERFUMES } = {}) {
  const profile = buildProfile(state);
  const matcher = MATCHERS[activeId];
  const results = await matcher.match(profile, perfumes);
  return {
    profile,
    matcherId: matcher.id,
    top: results.slice(0, limit),
    all: results,
  };
}

/**
 * Perfumes most similar to a given one (same gender, by note profile).
 * Used by the "similar perfumes" strip on the detail page.
 */
export function similarTo(pf, limit = 4) {
  return PERFUMES.filter((p) => p.id !== pf.id && p.gender === pf.gender)
    .map((p) => ({ perfume: p, score: cosine(pf.families, p.families) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

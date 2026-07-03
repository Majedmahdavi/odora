import { FAMILIES } from "../data/families.js";
import { QUIZ } from "../quiz/questions.js";

const DEFAULT_RATING = 3;

/**
 * Build the user's numeric profile from raw quiz answers + chosen gender.
 *
 * The core is `families`: a 7-dimensional preference vector built from the
 * family ratings (1..5) plus weighted contributions from the sensory answers
 * (each sensory option nudges certain families — see questions.js). The
 * practical answers become filters used by the matcher.
 *
 * This is deliberately separate from any specific algorithm so both the local
 * matcher and a future AI matcher consume the exact same profile.
 */
export function buildProfile(state = {}) {
  const gender = state.gender ?? "unisex";
  const answers = state.answers ?? {};

  // base vector from the family ratings
  const families = {};
  FAMILIES.forEach((f) => {
    families[f] = answers.families?.[f] ?? DEFAULT_RATING;
  });

  // fold in sensory answers (space, moment, …)
  QUIZ.filter((q) => q.group === "sensory").forEach((q) => {
    const chosen = answers[q.id];
    const opt = q.options.find((o) => o.id === chosen);
    if (opt?.scores) {
      Object.entries(opt.scores).forEach(([family, delta]) => {
        if (family in families) families[family] += delta;
      });
    }
  });

  return {
    gender,
    families,
    season: answers.season ?? "all",
    occasion: answers.occasion ?? null,
    strength: answers.strength ?? "medium",
  };
}

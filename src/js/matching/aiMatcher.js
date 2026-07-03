import { localMatcher } from "./localMatcher.js";

/**
 * AI matcher — placeholder for a future paid AI service.
 *
 * Contract (identical to localMatcher):
 *   async match(profile, perfumes) → ranked [{ perfume, score, percent, ... }]
 *
 * To implement later: POST `profile` (+ a compact perfume list) to your AI
 * endpoint, let the model rank and optionally explain the matches, then map
 * the response back into this shape. Because the signature matches, switching
 * engines is a single call: setMatcher("ai").
 *
 * Until it's configured, it transparently falls back to the local algorithm so
 * the app never breaks if this engine is selected.
 */
export const aiMatcher = {
  id: "ai",

  async match(profile, perfumes) {
    // Example of the intended integration:
    // const res = await fetch(AI_ENDPOINT, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
    //   body: JSON.stringify({ profile, perfumes }),
    // });
    // return mapAiResponse(await res.json());

    console.warn("[odora] AI matcher not configured — falling back to local algorithm.");
    return localMatcher.match(profile, perfumes);
  },
};

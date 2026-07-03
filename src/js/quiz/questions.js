import { FAMILIES } from "../data/families.js";

/**
 * Quiz definition (structure only — all text lives in fa.json → "quiz").
 *
 * Each step has a stable `id`. Types:
 *   - "choice": single-select. Each option carries `scores`: family → delta,
 *      which the matching algorithm (Step 5) folds into the user's profile so
 *      the sensory answers actually influence recommendations.
 *   - "rating": user rates every family 1..5 directly.
 *
 * `group` classifies the answer for the profile builder:
 *   sensory   → adds to the family vector via option.scores
 *   families  → sets the family vector directly (1..5)
 *   practical → used as filters (gender already comes from Step 2)
 */
export const QUIZ = [
  {
    id: "space",
    type: "choice",
    group: "sensory",
    options: [
      { id: "forest", scores: { woody: 2, aquatic: 1, oud: 1 } },
      { id: "cafe", scores: { sweet: 2, spicy: 1, woody: 1 } },
      { id: "beach", scores: { aquatic: 2, citrus: 2 } },
      { id: "library", scores: { woody: 2, oud: 2, spicy: 1 } },
    ],
  },
  {
    id: "moment",
    type: "choice",
    group: "sensory",
    options: [
      { id: "morning", scores: { citrus: 2, aquatic: 1, floral: 1 } },
      { id: "sunset", scores: { floral: 1, sweet: 2, woody: 1 } },
      { id: "midnight", scores: { oud: 2, spicy: 1, woody: 1 } },
    ],
  },
  {
    id: "families",
    type: "rating",
    group: "families",
    families: FAMILIES,
  },
  {
    id: "occasion",
    type: "choice",
    group: "practical",
    options: [{ id: "daily" }, { id: "work" }, { id: "party" }],
  },
  {
    id: "season",
    type: "choice",
    group: "practical",
    options: [{ id: "warm" }, { id: "cold" }, { id: "all" }],
  },
  {
    id: "strength",
    type: "choice",
    group: "practical",
    options: [{ id: "light" }, { id: "medium" }, { id: "strong" }],
  },
];

/**
 * Fragrance archetypes — a fixed set the Scent Signature flow assigns to a
 * user based on their Scent Signature. Pure DATA (no logic): each archetype
 * has an id (icon + all copy live in the locale files under signature.arch.*)
 * and a weight vector over the 9 Scent Signature axes. The picker
 * (signature/archetype.js) chooses the archetype whose vector best matches
 * the user's Scent Signature.
 */
export const ARCHETYPES = [
  { id: "minimalist", icon: "leaf",     axes: { fresh: 0.9, green: 0.7, marine: 0.4, sweet: -0.4, gourmand: -0.5 } },
  { id: "explorer",   icon: "compass",  axes: { marine: 0.9, fresh: 0.6, green: 0.6, woody: 0.4 } },
  { id: "gentleman",  icon: "crown",    axes: { woody: 0.8, leather: 0.8, amber: 0.6 } },
  { id: "dreamer",    icon: "moon",     axes: { floral: 0.9, sweet: 0.6, gourmand: 0.4 } },
  { id: "adventurer", icon: "target",   axes: { marine: 0.8, fresh: 0.7, woody: 0.5, leather: 0.3 } },
  { id: "creator",    icon: "helix",    axes: { amber: 0.6, woody: 0.5, floral: 0.4, gourmand: 0.4 } },
  { id: "collector",  icon: "gift",     axes: { amber: 0.9, leather: 0.7, gourmand: 0.6, woody: 0.4 } },
  { id: "freeSpirit", icon: "sparkle",  axes: { floral: 0.7, fresh: 0.7, green: 0.5, sweet: 0.3 } },
];

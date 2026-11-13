/**
 * Note physics — ROBO "Scent-Matrix" temperature model, ported to Odora.
 * ------------------------------------------------------------------------
 * Dependency-free JS port of the validated physics from the ROBO research
 * engine (`src/scent_matrix/temperature.py`, §7). It lets the matcher re-rank
 * perfumes by temperature: in heat, volatile/fresh notes project more and are
 * favored; in cold, heavy base notes bloom and last, so they rise.
 *
 * Model (ROBO §7.4): temperature is an OPERATOR on the catalog, not a matrix
 * per temperature. Each note class j scales by c_j(T) with ln c linear in T
 * (log-linear interpolation between a cold and a hot anchor — exactly ROBO's
 * ExponentialEvaporation between vapor-pressure anchors):
 *     c_j(T) = c_cold_j * exp( k_j * (T - T_cold) ),  k_j = ln(c_hot/c_cold)/(T_hot-T_cold)
 *
 * The class-level anchors generalize ROBO's reference worked example
 * (C_HOT=[1.5,0.5], C_COLD=[0.4,1.2] for sillage/longevity at 40°C/5°C) to the
 * three classic perfumery note classes. They are perceptual class anchors, not
 * raw single-molecule Clausius–Clapeyron slopes (those are steeper); this keeps
 * the re-ranking effect realistic at the accord level. Provenance: ROBO
 * ds_a5_volatility_classes.csv + temperature.py.
 */

import { FAMILIES } from "../data/families.js";

/** Odora's 7 families → ROBO note class (volatility tier). */
export const FAMILY_NOTE_CLASS = {
  citrus: "top",     // most volatile — flashes off, projects in heat
  aquatic: "top",
  floral: "heart",
  spicy: "heart",
  woody: "base",     // low volatility — long-lasting, blooms in cold
  sweet: "base",
  oud: "base",
};

/** Cold/hot anchors per note class (T in °C). ln-linear between them. */
const ANCHORS = {
  top:   { tCold: 5, cCold: 0.45, tHot: 40, cHot: 1.50 },
  heart: { tCold: 5, cCold: 0.85, tHot: 40, cHot: 1.05 },
  base:  { tCold: 5, cCold: 1.30, tHot: 40, cHot: 0.55 },
};

/** c_j(T): the temperature scaling for a note class (ROBO §7.4). */
export function classCoefficient(noteClass, tempC) {
  const a = ANCHORS[noteClass] || ANCHORS.heart;
  const T = Math.max(-5, Math.min(45, tempC)); // guard
  const k = Math.log(a.cHot / a.cCold) / (a.tHot - a.tCold);
  return a.cCold * Math.exp(k * (T - a.tCold));
}

/** Temperature scaling for one family at temperature T. */
export function familyCoefficient(family, tempC) {
  return classCoefficient(FAMILY_NOTE_CLASS[family] || "heart", tempC);
}

/**
 * Representative temperature from the quiz's season answer. Stage 1 bridge:
 * Odora asks season (warm/cold/all), ROBO wants a temperature. A later stage
 * can pass a real measured temperature (live weather) instead.
 */
export function tempFromSeason(season) {
  if (season === "warm") return 30;
  if (season === "cold") return 8;
  return 20; // "all" / unknown → neutral
}

/** Whether temperature boosts (>1), damps (<1) or leaves a family ~unchanged. */
export function tempEffect(family, tempC) {
  const c = familyCoefficient(family, tempC);
  if (c >= 1.08) return "boost";
  if (c <= 0.92) return "damp";
  return "neutral";
}

/** Sanity helper: all families map to a known class. */
export function _familiesCovered() {
  return FAMILIES.every((f) => FAMILY_NOTE_CLASS[f]);
}

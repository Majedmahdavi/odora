/**
 * Recommendation Report — turns the matcher's ranked results into a justified
 * report: for each perfume, matching notes, strengths, occasion, season, time
 * of day and a reason. Reuses the perfume record + the matcher breakdown; no
 * new matching logic. Returns plain data; the page localizes it.
 */
import { FAMILIES } from "../data/families.js";

function strongestFamilies(fam, min = 3, max = 3) {
  return FAMILIES.filter((f) => (fam[f] ?? 0) >= min)
    .sort((a, b) => (fam[b] ?? 0) - (fam[a] ?? 0))
    .slice(0, max);
}

function timeOfDay(pf) {
  const fam = pf.families || {};
  const night = pf.strength === "strong" || (fam.oud + fam.spicy + fam.sweet) >= 9;
  const day = pf.strength === "light" || (fam.citrus + fam.aquatic) >= 6;
  if (night && !day) return "evening";
  if (day && !night) return "day";
  return "versatile";
}

/** matcher top items ([{perfume, percent, breakdown}]) → report rows. */
export function buildReport(top, limit = 3) {
  return top.slice(0, limit).map((item) => {
    const pf = item.perfume;
    const notes = [...(pf.notes?.top || []), ...(pf.notes?.heart || []), ...(pf.notes?.base || [])];
    const uniqueNotes = [...new Set(notes)].slice(0, 5);
    const strengths = strongestFamilies(pf.families || {});
    const dominant = strengths[0] || FAMILIES.slice().sort((a, b) => (pf.families[b] ?? 0) - (pf.families[a] ?? 0))[0];
    return {
      id: pf.id,
      name: pf.name,
      brand: pf.brand,
      percent: item.percent,
      notes: uniqueNotes,        // note slugs → notes.<slug>
      strengths,                 // family ids → families.<id>.name
      occasion: pf.occasion || [],
      season: pf.season,         // → quiz.questions.season.options.<v> (or "all")
      timeOfDay: timeOfDay(pf),  // day | evening | versatile → discovery.report.time.<v>
      reasonFamily: dominant,    // family id → templated into the reason line
    };
  });
}

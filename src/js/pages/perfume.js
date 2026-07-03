import { t, getLang } from "../i18n/index.js";
import { getPerfumeById } from "../data/perfumes.js";
import { DESC_EN } from "../data/perfumesEn.js";
import { FAMILIES } from "../data/families.js";
import { bottleIcon } from "../ui/icons.js";
import { toFaDigits } from "../utils/format.js";
import { navigate } from "../router.js";
import { applyTheme } from "../ui/theme.js";

/**
 * جزئیات عطر (Step 7)
 * Larger art, description, the scent profile (7-family chart = "main notes"),
 * meta (season/occasion/strength) and a placeholder "buy" button for a later
 * phase. Everything is read from the perfume DB by :id.
 */
export function renderPerfume(view, params) {
  const pf = getPerfumeById(params.id);
  if (!pf) return navigate("/catalog");

  applyTheme(pf.gender); // the detail page reflects the perfume's own section

  const occasion = pf.occasion
    .map((o) => t(`quiz.questions.occasion.options.${o}`))
    .join(getLang() === "fa" ? "، " : ", ");
  const desc = getLang() === "fa" ? pf.desc : DESC_EN[pf.id] ?? pf.desc;
  const season = t(`quiz.questions.season.options.${pf.season}`);
  const strength = t(`quiz.questions.strength.options.${pf.strength}`);

  // "main notes" = the family profile, strongest first
  const notes = FAMILIES.map((f) => ({ f, score: pf.families[f] }))
    .filter((n) => n.score > 0)
    .sort((a, b) => b.score - a.score);

  view.innerHTML = `
    <section class="container perfume-detail">
      <button class="pd-back" id="pdBack" type="button">‹ ${t("perfume.back")}</button>

      <div class="pd-hero">
        <div class="pd-art">${bottleIcon()}</div>
        <div class="pd-head">
          <span class="badge badge-${pf.gender}">${t(`gender.options.${pf.gender}.label`)}</span>
          <h1 class="pd-name latin">${pf.name}</h1>
          <p class="pd-brand latin">${pf.brand}</p>
          <p class="pd-desc">${desc}</p>

          <div class="pd-meta">
            <span class="meta-chip"><b>${t("perfume.season")}:</b> ${season}</span>
            <span class="meta-chip"><b>${t("perfume.occasion")}:</b> ${occasion}</span>
            <span class="meta-chip"><b>${t("perfume.strength")}:</b> ${strength}</span>
          </div>

          <div class="pd-actions">
            <button class="btn btn-ghost" id="buyBtn" type="button" disabled>
              ${t("perfume.buy")} · ${t("perfume.buySoon")}
            </button>
          </div>
        </div>
      </div>

      <div class="pd-notes">
        <h2>${t("perfume.notesTitle")}</h2>
        <div class="note-bars">
          ${notes
            .map(
              (n) => `
            <div class="note-bar">
              <span class="note-label">${t(`families.${n.f}.name`)}</span>
              <span class="note-track"><span style="width:${(n.score / 5) * 100}%"></span></span>
              <span class="note-val">${toFaDigits(n.score)} ${t("perfume.outOf5")}</span>
            </div>`
            )
            .join("")}
        </div>
      </div>
    </section>
  `;

  view.querySelector("#pdBack")?.addEventListener("click", () => {
    if (history.length > 1) history.back();
    else navigate("/catalog");
  });
}

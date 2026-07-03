import { t, getLang } from "../i18n/index.js";
import { getPerfumeById } from "../data/perfumes.js";
import { DESC_EN } from "../data/perfumesEn.js";
import { FAMILIES } from "../data/families.js";
import { bottleIcon, heartIcon, giftIcon } from "../ui/icons.js";
import { perfumeCard, wireFavButtons } from "../ui/perfumeCard.js";
import { similarTo } from "../matching/index.js";
import { getState, isFavorite, toggleFavorite } from "../state/store.js";
import { toFaDigits } from "../utils/format.js";
import { navigate } from "../router.js";
import { applyTheme } from "../ui/theme.js";
import { toast } from "../ui/toast.js";

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
            <button class="btn btn-ghost pd-fav ${isFavorite(pf.id) ? "is-fav" : ""}" id="favBtn" type="button">
              ${heartIcon("icon-heart", isFavorite(pf.id))}
              <span id="favLabel">${isFavorite(pf.id) ? t("perfume.unfav") : t("perfume.fav")}</span>
            </button>
            <button class="btn btn-ghost" id="giftBtn" type="button">
              ${giftIcon("icon-heart")} ${t("perfume.gift")}
            </button>
            <button class="btn btn-ghost" id="buyBtn" type="button" disabled>
              ${t("perfume.buy")} · ${t("perfume.buySoon")}
            </button>
          </div>

          <form class="gift-form" id="giftForm" hidden>
            <div class="field">
              <label for="giftName">${t("perfume.giftName")}</label>
              <input id="giftName" type="text" autocomplete="name" />
            </div>
            <div class="field">
              <label for="giftMsg">${t("perfume.giftMessage")}</label>
              <input id="giftMsg" type="text" />
            </div>
            <button class="btn btn-primary" type="submit">${t("perfume.giftCopy")}</button>
          </form>
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

      <div class="pd-similar">
        <h2>${t("perfume.similar")}</h2>
        <div class="perfume-grid" id="similarGrid">
          ${similarTo(pf).map((s) => perfumeCard(s.perfume)).join("")}
        </div>
      </div>
    </section>
  `;

  view.querySelector("#pdBack")?.addEventListener("click", () => {
    if (history.length > 1) history.back();
    else navigate("/catalog");
  });

  // favorite toggle
  const favBtn = view.querySelector("#favBtn");
  favBtn.addEventListener("click", () => {
    toggleFavorite(pf.id);
    const on = isFavorite(pf.id);
    favBtn.classList.toggle("is-fav", on);
    favBtn.innerHTML = `${heartIcon("icon-heart", on)}
      <span id="favLabel">${on ? t("perfume.unfav") : t("perfume.fav")}</span>`;
  });

  // gift link: open the mini form, then copy a link that reproduces this page
  const giftForm = view.querySelector("#giftForm");
  view.querySelector("#giftBtn").addEventListener("click", () => {
    giftForm.hidden = !giftForm.hidden;
    if (!giftForm.hidden) {
      const user = getState().user;
      if (user && !giftForm.querySelector("#giftName").value)
        giftForm.querySelector("#giftName").value = user.name;
    }
  });
  giftForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
      p: pf.id,
      n: giftForm.querySelector("#giftName").value.trim(),
      m: giftForm.querySelector("#giftMsg").value.trim(),
    };
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const link = `${location.origin}${location.pathname}#/gift?g=${encoded}`;
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      window.prompt(t("perfume.giftCopy"), link); // clipboard blocked → manual copy
    }
    toast(t("perfume.giftCopied"));
  });

  wireFavButtons(view.querySelector("#similarGrid"));
}

import { t } from "../i18n/index.js";
import { PERFUMES } from "../data/perfumes.js";
import { FAMILIES } from "../data/families.js";
import { getState } from "../state/store.js";
import { perfumeCard, wireFavButtons } from "../ui/perfumeCard.js";
import { toFaDigits } from "../utils/format.js";

/**
 * گنجینه‌ی عطرها (top-nav section)
 * Browse the whole DB: gender tabs (همه/زنانه/مردانه/یونیسکس) + text search
 * (name/brand) + season/family/strength filters. All filters combine.
 * This page keeps the general palette (it's a nav page).
 */
const FILTERS = ["all", "feminine", "masculine", "unisex"];
const SEASONS = ["warm", "cold"];
const STRENGTHS = ["light", "medium", "strong"];

export function renderCatalog(view) {
  const { gender } = getState();
  const state = {
    tab: gender && FILTERS.includes(gender) ? gender : "all",
    q: "",
    season: "any",
    family: "any",
    strength: "any",
  };

  view.innerHTML = `
    <section class="container catalog">
      <div class="section-head">
        <h1 class="section-title">${t("catalog.title")}</h1>
        <p id="catalogCount"></p>
      </div>

      <div class="catalog-tabs" id="catalogTabs" role="tablist">
        ${FILTERS.map(
          (f) => `<button class="cat-tab ${f === state.tab ? "is-active" : ""}"
                    type="button" data-filter="${f}" role="tab"
                    aria-selected="${f === state.tab}">${tabLabel(f)}</button>`
        ).join("")}
      </div>

      <div class="catalog-controls">
        <input class="catalog-search" id="catalogSearch" type="search"
               placeholder="${t("catalog.search")}" autocomplete="off" />
        <select class="filter-select" id="filterSeason" aria-label="${t("catalog.filterSeason")}">
          <option value="any">${t("catalog.filterSeason")}: ${t("catalog.any")}</option>
          ${SEASONS.map((s) => `<option value="${s}">${t(`quiz.questions.season.options.${s}`)}</option>`).join("")}
        </select>
        <select class="filter-select" id="filterFamily" aria-label="${t("catalog.filterFamily")}">
          <option value="any">${t("catalog.filterFamily")}: ${t("catalog.any")}</option>
          ${FAMILIES.map((f) => `<option value="${f}">${t(`families.${f}.name`)}</option>`).join("")}
        </select>
        <select class="filter-select" id="filterStrength" aria-label="${t("catalog.filterStrength")}">
          <option value="any">${t("catalog.filterStrength")}: ${t("catalog.any")}</option>
          ${STRENGTHS.map((s) => `<option value="${s}">${t(`quiz.questions.strength.options.${s}`)}</option>`).join("")}
        </select>
      </div>

      <div class="perfume-grid" id="perfumeGrid"></div>
      <p class="no-results" id="noResults" hidden>${t("catalog.noResults")}</p>
    </section>
  `;

  const grid = view.querySelector("#perfumeGrid");
  const count = view.querySelector("#catalogCount");
  const empty = view.querySelector("#noResults");
  const tabs = view.querySelector("#catalogTabs");

  function filtered() {
    let list = PERFUMES;
    if (state.tab !== "all") list = list.filter((p) => p.gender === state.tab);
    const q = state.q.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
      );
    }
    // a season pick also allows all-season perfumes
    if (state.season !== "any")
      list = list.filter((p) => p.season === state.season || p.season === "all");
    if (state.family !== "any")
      list = list.filter((p) => (p.families[state.family] ?? 0) >= 3);
    if (state.strength !== "any")
      list = list.filter((p) => p.strength === state.strength);
    return list;
  }

  function paint() {
    const list = filtered();
    grid.innerHTML = list.map((p) => perfumeCard(p)).join("");
    empty.hidden = list.length > 0;
    count.textContent = t("catalog.subtitle").replace("{count}", toFaDigits(list.length));
  }

  tabs.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-filter]");
    if (!btn) return;
    state.tab = btn.dataset.filter;
    tabs.querySelectorAll(".cat-tab").forEach((b) => {
      const on = b === btn;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", String(on));
    });
    paint();
  });

  view.querySelector("#catalogSearch").addEventListener("input", (e) => {
    state.q = e.target.value;
    paint();
  });
  [["filterSeason", "season"], ["filterFamily", "family"], ["filterStrength", "strength"]].forEach(
    ([id, key]) => {
      view.querySelector(`#${id}`).addEventListener("change", (e) => {
        state[key] = e.target.value;
        paint();
      });
    }
  );

  wireFavButtons(grid);
  paint();
}

function tabLabel(f) {
  return f === "all" ? t("catalog.all") : t(`gender.options.${f}.label`);
}

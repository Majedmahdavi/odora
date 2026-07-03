import { t } from "../i18n/index.js";
import { PERFUMES } from "../data/perfumes.js";
import { getState } from "../state/store.js";
import { bottleIcon } from "../ui/icons.js";
import { toFaDigits } from "../utils/format.js";

/**
 * گنجینه‌ی عطرها (top-nav section)
 * Browse the whole DB with gender filter tabs (همه/زنانه/مردانه/یونیسکس).
 * If a gender is already chosen, the tab defaults to that gender.
 * This page keeps the general palette (it's a nav page).
 */
const FILTERS = ["all", "feminine", "masculine", "unisex"];

export function renderCatalog(view) {
  const { gender } = getState();
  let active = gender && FILTERS.includes(gender) ? gender : "all";

  view.innerHTML = `
    <section class="container catalog">
      <div class="section-head">
        <h1 class="section-title">${t("catalog.title")}</h1>
        <p id="catalogCount"></p>
      </div>

      <div class="catalog-tabs" id="catalogTabs" role="tablist">
        ${FILTERS.map(
          (f) => `<button class="cat-tab ${f === active ? "is-active" : ""}"
                    type="button" data-filter="${f}" role="tab"
                    aria-selected="${f === active}">${tabLabel(f)}</button>`
        ).join("")}
      </div>

      <div class="perfume-grid" id="perfumeGrid"></div>
    </section>
  `;

  const grid = view.querySelector("#perfumeGrid");
  const count = view.querySelector("#catalogCount");
  const tabs = view.querySelector("#catalogTabs");

  function paint(filter) {
    const list = filter === "all" ? PERFUMES : PERFUMES.filter((p) => p.gender === filter);
    grid.innerHTML = list.map(perfumeCard).join("");
    count.textContent = t("catalog.subtitle").replace("{count}", toFaDigits(list.length));
  }

  tabs.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-filter]");
    if (!btn) return;
    active = btn.dataset.filter;
    tabs.querySelectorAll(".cat-tab").forEach((b) => {
      const on = b === btn;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", String(on));
    });
    paint(active);
  });

  paint(active);
}

function tabLabel(f) {
  return f === "all" ? t("catalog.all") : t(`gender.options.${f}.label`);
}

function perfumeCard(pf) {
  return `
    <a class="perfume-card" href="#/perfume/${pf.id}">
      <div class="perfume-art">${bottleIcon("bottle-sm")}</div>
      <div class="perfume-info">
        <h3 class="perfume-name latin">${pf.name}</h3>
        <p class="perfume-brand latin">${pf.brand}</p>
        <span class="badge badge-${pf.gender}">${t(`gender.options.${pf.gender}.label`)}</span>
      </div>
    </a>
  `;
}

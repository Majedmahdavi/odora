import { t } from "../i18n/index.js";
import { getState } from "../state/store.js";
import { getPerfumeById } from "../data/perfumes.js";
import { perfumeCard, wireFavButtons } from "../ui/perfumeCard.js";
import { toFaDigits } from "../utils/format.js";

/** علاقه‌مندی‌ها — hearted perfumes, stored locally (no login required). */
export function renderFavorites(view) {
  view.innerHTML = `
    <section class="container catalog">
      <div class="section-head">
        <h1 class="section-title">${t("favorites.title")}</h1>
        <p id="favCount"></p>
      </div>
      <div class="perfume-grid" id="favGrid"></div>
      <div class="empty-state" id="favEmpty" hidden>
        <p>${t("favorites.empty")}</p>
        <a class="btn btn-primary" href="#/catalog">${t("favorites.goCatalog")}</a>
      </div>
    </section>
  `;

  const grid = view.querySelector("#favGrid");
  const empty = view.querySelector("#favEmpty");
  const count = view.querySelector("#favCount");

  function paint() {
    const list = getState().favorites.map(getPerfumeById).filter(Boolean);
    grid.innerHTML = list.map((p) => perfumeCard(p)).join("");
    empty.hidden = list.length > 0;
    count.textContent = list.length
      ? t("account.favCount").replace("{count}", toFaDigits(list.length))
      : "";
  }

  wireFavButtons(grid, paint); // un-hearting removes the card immediately
  paint();
}

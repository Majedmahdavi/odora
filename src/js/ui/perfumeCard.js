import { t } from "../i18n/index.js";
import { bottleIcon, heartIcon } from "./icons.js";
import { isFavorite, toggleFavorite } from "../state/store.js";

/**
 * Shared perfume card (catalog, favorites, "similar" strip).
 * Renders as a link to the detail page with an optional heart button that
 * toggles the favorite without following the link.
 */
export function perfumeCard(pf, { fav = true } = {}) {
  const on = isFavorite(pf.id);
  const heart = fav
    ? `<button class="fav-btn ${on ? "is-fav" : ""}" type="button" data-fav-id="${pf.id}"
         aria-label="${on ? t("perfume.unfav") : t("perfume.fav")}">${heartIcon("icon-heart", on)}</button>`
    : "";

  return `
    <a class="perfume-card" href="#/perfume/${pf.id}">
      ${heart}
      <div class="perfume-art">${bottleIcon("bottle-sm")}</div>
      <div class="perfume-info">
        <h3 class="perfume-name latin">${pf.name}</h3>
        <p class="perfume-brand latin">${pf.brand}</p>
        <span class="badge badge-${pf.gender}">${t(`gender.options.${pf.gender}.label`)}</span>
      </div>
    </a>`;
}

/**
 * Wire heart clicks inside a card grid (event delegation).
 * onToggle(id) runs after the state flips — e.g. favorites page re-paints.
 */
export function wireFavButtons(gridEl, onToggle) {
  gridEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-fav-id]");
    if (!btn) return;
    e.preventDefault();
    const id = btn.dataset.favId;
    toggleFavorite(id);
    const on = isFavorite(id);
    btn.classList.toggle("is-fav", on);
    btn.setAttribute("aria-label", on ? t("perfume.unfav") : t("perfume.fav"));
    btn.innerHTML = heartIcon("icon-heart", on);
    if (onToggle) onToggle(id);
  });
}

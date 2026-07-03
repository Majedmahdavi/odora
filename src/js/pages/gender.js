import { t } from "../i18n/index.js";
import { getState, setState } from "../state/store.js";
import { bottleIcon } from "../ui/icons.js";
import { applyTheme } from "../ui/theme.js";

/**
 * انتخاب جنسیت (Step 2)
 * Selecting an option re-themes the WHOLE site: we set <html data-theme>,
 * which swaps the CSS custom properties in themes.css (with a smooth
 * transition), and persist the choice in the store so it sticks across pages.
 * The gender value maps 1:1 to a theme name (feminine|masculine|unisex).
 */

const OPTIONS = ["feminine", "masculine", "unisex"];

export function renderGender(view) {
  const { gender } = getState();

  const cards = OPTIONS.map(
    (key) => `
    <button class="gender-card ${gender === key ? "is-selected" : ""}"
            type="button" data-gender="${key}" aria-pressed="${gender === key}">
      <span class="g-swatch swatch-${key}" aria-hidden="true"></span>
      <span class="g-icon icon-${key}" aria-hidden="true">${bottleIcon()}</span>
      <span class="g-label">${t(`gender.options.${key}.label`)}</span>
      <span class="g-desc">${t(`gender.options.${key}.desc`)}</span>
      <span class="g-check" aria-hidden="true">✓</span>
    </button>`
  ).join("");

  view.innerHTML = `
    <section class="container gender-page">
      <h1 class="section-title">${t("gender.title")}</h1>
      <p class="muted gender-sub">${t("gender.subtitle")}</p>

      <div class="gender-grid">${cards}</div>

      <div class="gender-actions">
        <a class="btn btn-primary btn-lg ${gender ? "" : "is-disabled"}"
           id="genderContinue" href="#/quiz"
           aria-disabled="${gender ? "false" : "true"}">${t("gender.continue")}</a>
        <p class="muted gender-hint" ${gender ? "" : 'style="visibility:hidden"'} id="genderHint">
          ${t("gender.changeHint")}
        </p>
      </div>
    </section>
  `;

  const continueBtn = view.querySelector("#genderContinue");
  const hint = view.querySelector("#genderHint");

  view.querySelectorAll("[data-gender]").forEach((card) => {
    card.addEventListener("click", () => {
      const choice = card.dataset.gender;

      setState({ gender: choice });
      applyTheme(choice);

      view.querySelectorAll(".gender-card").forEach((c) => {
        const selected = c === card;
        c.classList.toggle("is-selected", selected);
        c.setAttribute("aria-pressed", String(selected));
      });

      continueBtn.classList.remove("is-disabled");
      continueBtn.setAttribute("aria-disabled", "false");
      hint.style.visibility = "visible";
    });
  });
}

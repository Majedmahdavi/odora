import { t } from "../i18n/index.js";
import { toFaDigits } from "../utils/format.js";
import { bottleIcon } from "../ui/icons.js";

/** Home / landing page (Step 1). */
export function renderHome(view) {
  const steps = t("home.steps") || [];

  view.innerHTML = `
    <section class="hero">
      <div class="hero-bottle">${bottleIcon()}</div>
      <div class="container hero-inner">
        <span class="hero-eyebrow">${t("home.eyebrow")}</span>
        <h1 class="hero-title">
          ${t("home.titleLead")} <span class="accent">${t("home.titleAccent")}</span>
        </h1>
        <p class="hero-subtitle">${t("home.subtitle")}</p>
        <div class="hero-actions">
          <a class="btn btn-primary btn-lg" href="#/gender">${t("home.startTest")}</a>
          <a class="btn btn-ghost btn-lg" href="#/gift-test">${t("home.giftTest")}</a>
        </div>
        <p class="hero-note">${t("home.note")}</p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <h2 class="section-title">${t("home.howTitle")}</h2>
          <p>${t("home.howSubtitle")}</p>
        </div>
        <div class="steps">
          ${steps
            .map(
              (s, i) => `
            <article class="step-card">
              <span class="step-num latin">${toFaDigits(i + 1)}</span>
              <h3>${s.title}</h3>
              <p>${s.text}</p>
            </article>`
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}

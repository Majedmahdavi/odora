import { t } from "../i18n/index.js";

/** درباره ما (Step 8) */
export function renderAbout(view) {
  const values = Array.isArray(t("about.values")) ? t("about.values") : [];

  view.innerHTML = `
    <section class="container info-page info-center">
      <h1 class="section-title">${t("about.title")}</h1>
      <p class="info-lead">${t("about.lead")}</p>
      <p>${t("about.p1")}</p>
      <p>${t("about.p2")}</p>

      <div class="about-values">
        ${values
          .map(
            (v) => `
          <div class="value-card">
            <h3>${v.title}</h3>
            <p>${v.text}</p>
          </div>`
          )
          .join("")}
      </div>
    </section>
  `;
}

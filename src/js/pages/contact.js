import { t } from "../i18n/index.js";
import { toast } from "../ui/toast.js";

/** تماس با ما (Step 8) — simple form (no backend yet: shows a demo success). */
export function renderContact(view) {
  view.innerHTML = `
    <section class="container info-page">
      <div class="info-center">
        <h1 class="section-title">${t("contact.title")}</h1>
        <p class="info-lead">${t("contact.lead")}</p>
        <div class="contact-info">
          <a class="meta-chip" href="mailto:${t("contact.email")}">
            <b>${t("contact.emailLabel")}:</b> <span class="latin">${t("contact.email")}</span>
          </a>
        </div>
      </div>

      <form class="contact-form" id="contactForm" novalidate>
        <div class="field">
          <label for="cName">${t("contact.form.name")}</label>
          <input id="cName" name="name" type="text" required />
        </div>
        <div class="field">
          <label for="cEmail">${t("contact.form.email")}</label>
          <input id="cEmail" name="email" type="email" required />
        </div>
        <div class="field">
          <label for="cMsg">${t("contact.form.message")}</label>
          <textarea id="cMsg" name="message" rows="4" required></textarea>
        </div>
        <button class="btn btn-primary" type="submit">${t("contact.form.send")}</button>
      </form>
    </section>
  `;

  view.querySelector("#contactForm").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!e.target.checkValidity()) {
      e.target.reportValidity();
      return;
    }
    toast(t("contact.form.success"));
    e.target.reset();
  });
}

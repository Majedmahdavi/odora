import { t, getLang } from "../i18n/index.js";
import { getPerfumeById } from "../data/perfumes.js";
import { DESC_EN } from "../data/perfumesEn.js";
import { bottleIcon } from "../ui/icons.js";
import { navigate } from "../router.js";
import { applyTheme } from "../ui/theme.js";

/**
 * صفحه‌ی هدیه 🎁 — opened from a gift link.
 * The link carries { p: perfumeId, n: sender name, m: message } encoded in
 * the ?g= query (url-safe base64), same trick as shared results — no backend.
 */
export function renderGift(view, params) {
  const payload = decode(params.query?.g);
  const pf = payload && getPerfumeById(payload.p);
  if (!pf) return navigate("/");

  applyTheme(pf.gender); // the gift wears the perfume's own colors

  const sender = payload.n || t("gift.someone");
  const desc = getLang() === "fa" ? pf.desc : DESC_EN[pf.id] ?? pf.desc;

  view.innerHTML = `
    <section class="container gift-page">
      <div class="gift-card">
        <h1 class="gift-title">${t("gift.title")}</h1>
        <p class="gift-lead">${t("gift.lead").replace("{name}", sender)}</p>
        ${payload.m ? `<p class="gift-message">«${payload.m}»</p>` : ""}

        <div class="gift-perfume">
          <div class="gift-art">${bottleIcon()}</div>
          <h2 class="perfume-name latin">${pf.name}</h2>
          <p class="perfume-brand latin">${pf.brand}</p>
          <p class="gift-desc">${desc}</p>
        </div>

        <div class="gift-actions">
          <a class="btn btn-primary" href="#/perfume/${pf.id}">${t("gift.view")}</a>
          <a class="btn btn-ghost" href="#/gender">${t("gift.tryTest")}</a>
        </div>
      </div>
    </section>
  `;
}

function decode(str) {
  if (!str) return null;
  try {
    const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
    const obj = JSON.parse(decodeURIComponent(escape(atob(b64))));
    return obj && typeof obj === "object" ? obj : null;
  } catch {
    return null;
  }
}

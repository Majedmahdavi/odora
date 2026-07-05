import { t } from "../i18n/index.js";
import { toFaDigits } from "../utils/format.js";
import {
  sparkleIcon,
  fingerprintIcon,
  targetIcon,
  chatIcon,
  dnaIcon,
  giftIcon,
  arrowDownIcon,
} from "../ui/icons.js";

/**
 * Landing page (redesigned).
 * A premium "AI fragrance discovery" story — hero → features → how it works
 * → Fragrance DNA preview → sample recommendation → gift → final CTA.
 * Pure presentation: every link points at EXISTING routes (#/gender,
 * #/gift-test); no routing / business logic is touched. All copy comes from
 * the i18n locale files (home.* keys).
 */

const FEATURE_ICONS = [fingerprintIcon, sparkleIcon, giftIcon];
const STEP_ICONS = [chatIcon, dnaIcon, targetIcon];

export function renderHome(view) {
  const features = t("home.features.cards") || [];
  const steps = t("home.how.steps") || [];
  const dnaAxes = t("home.dna.axes") || [];
  const reasons = t("home.sample.reasons") || [];

  view.innerHTML = `
    <div class="landing">

      <!-- 1. HERO -->
      <section class="lx-hero">
        <div class="lx-hero-aura" aria-hidden="true">${heroAura()}</div>
        <div class="container lx-hero-inner">
          <span class="lx-badge reveal">${sparkleIcon("lx-badge-ic")} ${t("home.hero.badge")}</span>
          <h1 class="lx-hero-title reveal">${t("home.hero.title")}</h1>
          <p class="lx-hero-sub reveal">${t("home.hero.subtitle")}</p>
          <div class="lx-hero-actions reveal">
            <a class="btn btn-primary btn-lg" href="#/gender">${t("home.hero.ctaPrimary")}</a>
            <button class="btn btn-ghost btn-lg" type="button" data-scroll="lxHow">${t("home.hero.ctaSecondary")}</button>
          </div>
        </div>
      </section>

      <!-- 2. FEATURES -->
      <section class="lx-section container">
        <div class="lx-head reveal">
          <span class="lx-eyebrow">${t("home.features.eyebrow")}</span>
          <h2 class="lx-title">${t("home.features.title")}</h2>
        </div>
        <div class="lx-cards">
          ${features
            .map(
              (c, i) => `
            <article class="lx-card reveal" style="--d:${i * 90}ms">
              <span class="lx-card-ic">${(FEATURE_ICONS[i] || sparkleIcon)("")}</span>
              <h3>${c.title}</h3>
              <p>${c.text}</p>
            </article>`
            )
            .join("")}
        </div>
      </section>

      <!-- 3. HOW IT WORKS -->
      <section class="lx-section container" id="lxHow">
        <div class="lx-head reveal">
          <span class="lx-eyebrow">${t("home.how.eyebrow")}</span>
          <h2 class="lx-title">${t("home.how.title")}</h2>
        </div>
        <ol class="lx-steps">
          ${steps
            .map(
              (s, i) => `
            <li class="lx-step reveal" style="--d:${i * 90}ms">
              <span class="lx-step-ic">${(STEP_ICONS[i] || chatIcon)("")}</span>
              <span class="lx-step-n latin">${toFaDigits(i + 1)}</span>
              <h3>${s.title}</h3>
              <p>${s.text}</p>
            </li>
            ${i < steps.length - 1 ? `<li class="lx-step-arrow" aria-hidden="true">${arrowDownIcon("")}</li>` : ""}`
            )
            .join("")}
        </ol>
      </section>

      <!-- 4. FRAGRANCE DNA PREVIEW -->
      <section class="lx-section container">
        <div class="lx-head reveal">
          <span class="lx-eyebrow">${t("home.dna.eyebrow")}</span>
          <h2 class="lx-title">${t("home.dna.title")}</h2>
        </div>
        <div class="lx-dna-card reveal">
          <div class="lx-dna-bars">
            ${dnaAxes
              .map(
                (a) => `
              <div class="lx-dna-row">
                <span class="lx-dna-label">${a.label}</span>
                <span class="lx-dna-track"><span class="lx-dna-fill" data-v="${a.value}"></span></span>
                <span class="lx-dna-val latin">${toFaDigits(Math.round(a.value / 10))}<span class="lx-dna-max">/${toFaDigits(10)}</span></span>
              </div>`
              )
              .join("")}
          </div>
          <p class="lx-dna-caption">${t("home.dna.caption")}</p>
          <a class="btn btn-primary" href="#/gender">${t("home.dna.cta")}</a>
        </div>
      </section>

      <!-- 5. SAMPLE RECOMMENDATION -->
      <section class="lx-section container">
        <div class="lx-head reveal">
          <span class="lx-eyebrow">${t("home.sample.eyebrow")}</span>
          <h2 class="lx-title">${t("home.sample.title")}</h2>
        </div>
        <div class="lx-rec reveal">
          <div class="lx-rec-main">
            <span class="lx-rec-tag">${t("home.sample.pick")}</span>
            <h3 class="lx-rec-name latin">${t("home.sample.name")}</h3>
            <div class="lx-rec-why">
              <span class="lx-rec-why-title">${t("home.sample.whyTitle")}</span>
              <div class="lx-rec-chips">
                ${reasons.map((r) => `<span class="lx-chip">✓ ${r}</span>`).join("")}
              </div>
            </div>
          </div>
          <div class="lx-rec-score">
            <div class="lx-rec-ring" style="--p:95">
              <span class="lx-rec-pct latin">${toFaDigits(95)}<small>%</small></span>
            </div>
            <span class="lx-rec-compat">${t("home.sample.compatLabel")}</span>
          </div>
        </div>
        <p class="lx-note reveal">${t("home.sample.note")}</p>
      </section>

      <!-- 6. GIFT DISCOVERY -->
      <section class="lx-section container">
        <div class="lx-gift reveal">
          <span class="lx-gift-ic">${giftIcon("")}</span>
          <h2 class="lx-title">${t("home.gift.title")}</h2>
          <p class="lx-gift-text">${t("home.gift.text")}</p>
          <a class="btn btn-primary btn-lg" href="#/gift-test">${t("home.gift.cta")}</a>
        </div>
      </section>

      <!-- 7. FINAL CTA -->
      <section class="lx-final">
        <div class="lx-final-glow" aria-hidden="true"></div>
        <div class="container lx-final-inner reveal">
          <h2 class="lx-final-title">${t("home.finalCta.title")}</h2>
          <a class="btn btn-primary btn-lg" href="#/gender">${t("home.finalCta.cta")}</a>
        </div>
      </section>

    </div>
  `;

  wireScroll(view);
  wireReveal(view);
}

/* --- abstract hero illustration (discovery / identity / AI / aura) -------- */
function heroAura() {
  const nodes = [
    [200, 60], [316, 118], [332, 250], [236, 336],
    [104, 330], [58, 210], [96, 96], [268, 190],
  ];
  const dots = nodes
    .map(([x, y], i) => `<circle class="lx-node" style="--i:${i}" cx="${x}" cy="${y}" r="4"/>`)
    .join("");
  const links = nodes
    .map(([x, y]) => `<line class="lx-link" x1="200" y1="200" x2="${x}" y2="${y}"/>`)
    .join("");
  return `
  <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <radialGradient id="lxCore" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="var(--primary-soft)" stop-opacity="0.9"/>
        <stop offset="60%" stop-color="var(--primary)" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="var(--primary)" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <circle class="lx-ring lx-ring-1" cx="200" cy="200" r="150"/>
    <circle class="lx-ring lx-ring-2" cx="200" cy="200" r="110"/>
    <circle class="lx-ring lx-ring-3" cx="200" cy="200" r="70"/>
    <g class="lx-orbit">${links}${dots}</g>
    <circle cx="200" cy="200" r="150" fill="url(#lxCore)"/>
    <circle class="lx-core" cx="200" cy="200" r="18"/>
  </svg>`;
}

/* --- smooth in-page scroll for the "How It Works" button ----------------- */
function wireScroll(view) {
  view.querySelectorAll("[data-scroll]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = view.querySelector(`#${btn.dataset.scroll}`);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

/* --- reveal-on-scroll + animated DNA bars (IntersectionObserver) ---------- */
function wireReveal(view) {
  const items = view.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    view.querySelectorAll(".lx-dna-fill").forEach((f) => (f.style.width = `${f.dataset.v}%`));
    return;
  }
  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-visible");
        e.target.querySelectorAll?.(".lx-dna-fill").forEach((f) => (f.style.width = `${f.dataset.v}%`));
        obs.unobserve(e.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  items.forEach((el) => io.observe(el));
}

import { t, getLang } from "../i18n/index.js";
import { getState } from "../state/store.js";
import { navigate } from "../router.js";
import { buildProfile } from "../matching/profile.js";
import { recommend } from "../matching/index.js";
import { buildScentSignature, SIGNATURE_AXES } from "../signature/scentSignature.js";
import { buildIdentity } from "../signature/identity.js";
import { pickArchetype } from "../signature/archetype.js";
import { buildReport } from "../signature/report.js";
import { toFaDigits } from "../utils/format.js";
import {
  sparkleIcon, targetIcon, helixIcon, giftIcon, moonIcon,
  leafIcon, compassIcon, crownIcon,
} from "../ui/icons.js";

/**
 * کشف امضای رایحه (Scent Signature journey) — the premium "understand yourself
 * first" experience. A step machine over the user's own quiz result:
 * Analyzing → Scent Signature → Identity → Signature Name → Archetype →
 * Recommendation Report. Reveals one idea at a time. Everything is derived
 * from the existing profile/matcher (see src/js/signature/*), so no
 * quiz/matching/backend change is needed.
 */

const ICONS = {
  leaf: leafIcon, compass: compassIcon, crown: crownIcon, moon: moonIcon,
  target: targetIcon, helix: helixIcon, gift: giftIcon, sparkle: sparkleIcon,
};

const STEPS = ["analyzing", "profile", "identity", "name", "archetype", "report"];

export async function renderSignature(view) {
  const state = getState();
  if (!state.gender) return navigate("/gender");
  if (!state.answers || !state.answers.families) return navigate("/quiz");

  // compute everything once (presentation layers over the existing profile)
  const profile = buildProfile(state);
  const signature = buildScentSignature(profile);
  const identity = buildIdentity(signature);
  const archetype = pickArchetype(signature);
  const { top } = await recommend(state);
  const report = buildReport(top);

  const ctx = { view, signature, identity, archetype, report, step: 0, timers: [] };
  paint(ctx);
}

/* --- step host ----------------------------------------------------------- */
function clearTimers(ctx) {
  ctx.timers.forEach((id) => clearTimeout(id));
  ctx.timers = [];
}

function paint(ctx) {
  clearTimers(ctx);
  const name = STEPS[ctx.step];
  const body = STEP_RENDERERS[name](ctx);
  const showDots = name !== "analyzing";

  ctx.view.innerHTML = `
    <section class="container discovery">
      ${showDots ? dots(ctx.step) : ""}
      <div class="dsc-step">${body}</div>
    </section>`;
  window.scrollTo({ top: 0, behavior: "auto" });

  // wire "continue" / navigation
  ctx.view.querySelector("[data-next]")?.addEventListener("click", () => {
    if (ctx.step < STEPS.length - 1) { ctx.step++; paint(ctx); }
  });
  ctx.view.querySelector("[data-back]")?.addEventListener("click", () => {
    if (ctx.step > 0) { ctx.step--; paint(ctx); }
  });
  STEP_WIRERS[name]?.(ctx);
}

function dots(step) {
  // step 0 is analyzing (no dot); dots track the 5 content steps
  const total = STEPS.length - 1;
  const active = step; // 1..5
  return `<div class="dsc-dots">${Array.from({ length: total }, (_, i) =>
    `<span class="dsc-dot ${i + 1 <= active ? "is-on" : ""}"></span>`).join("")}</div>`;
}

function continueBtn(labelKey, back = true) {
  return `
    <div class="dsc-actions">
      ${back ? `<button class="btn btn-ghost" type="button" data-back>${t("signature.back")}</button>` : ""}
      <button class="btn btn-primary" type="button" data-next>${t(labelKey)}</button>
    </div>`;
}

/* --- steps --------------------------------------------------------------- */
const STEP_RENDERERS = {
  analyzing() {
    return `
      <div class="dsc-analyzing">
        <div class="dsc-orb" aria-hidden="true"><span></span><span></span><span></span></div>
        <p class="dsc-analyzing-msg" id="dscMsg"></p>
        <div class="dsc-progress"><span id="dscBar"></span></div>
      </div>`;
  },

  profile(ctx) {
    const bars = SIGNATURE_AXES.map((ax) => `
      <div class="dsc-dna-row">
        <span class="dsc-dna-label">${t(`signature.axes.${ax}`)}</span>
        <span class="dsc-dna-track"><span class="dsc-dna-fill" data-v="${ctx.signature[ax]}"></span></span>
        <span class="dsc-dna-val latin">${toFaDigits(ctx.signature[ax])}</span>
      </div>`).join("");
    return `
      <span class="dsc-eyebrow">${t("signature.profile.eyebrow")}</span>
      <h1 class="dsc-title">${t("signature.profile.title")}</h1>
      <p class="dsc-lead">${t("signature.profile.lead")}</p>
      <div class="dsc-card dsc-dna">${bars}</div>
      ${continueBtn("signature.profile.cta", false)}`;
  },

  identity(ctx) {
    const lines = ctx.identity.statements
      .map((k) => `<li>${t(`signature.identity.statements.${k}`)}</li>`)
      .join("");
    return `
      <span class="dsc-eyebrow">${t("signature.identity.eyebrow")}</span>
      <h1 class="dsc-title">${t("signature.identity.title")}</h1>
      <ul class="dsc-card dsc-identity">${lines}</ul>
      ${continueBtn("signature.identity.cta")}`;
  },

  name(ctx) {
    const name = t(`signature.identity.names.${ctx.identity.nameKey}`);
    return `
      <span class="dsc-eyebrow">${t("signature.name.eyebrow")}</span>
      <div class="dsc-card dsc-signature">
        <span class="dsc-signature-kicker">${t("signature.name.kicker")}</span>
        <h1 class="dsc-signature-name">${name}</h1>
        <p class="dsc-lead">${t("signature.name.lead")}</p>
      </div>
      ${continueBtn("signature.name.cta")}`;
  },

  archetype(ctx) {
    const a = ctx.archetype;
    const icon = (ICONS[a.icon] || sparkleIcon)("dsc-arch-ic");
    const traits = (t(`signature.arch.${a.id}.traits`) || [])
      .map((tr) => `<span class="dsc-chip">${tr}</span>`).join("");
    return `
      <span class="dsc-eyebrow">${t("signature.archetype.eyebrow")}</span>
      <div class="dsc-card dsc-arch">
        <div class="dsc-arch-badge">${icon}</div>
        <h1 class="dsc-arch-name">${t(`signature.arch.${a.id}.name`)}</h1>
        <p class="dsc-arch-desc">${t(`signature.arch.${a.id}.desc`)}</p>
        <div class="dsc-chips">${traits}</div>
        <p class="dsc-arch-styles"><b>${t("signature.archetype.stylesLabel")}:</b> ${t(`signature.arch.${a.id}.styles`)}</p>
      </div>
      ${continueBtn("signature.archetype.cta")}`;
  },

  report(ctx) {
    const cards = ctx.report.map((r) => reportCard(r)).join("");
    return `
      <span class="dsc-eyebrow">${t("signature.report.eyebrow")}</span>
      <h1 class="dsc-title">${t("signature.report.title")}</h1>
      <p class="dsc-lead">${t("signature.report.lead")}</p>
      <div class="dsc-report">${cards}</div>
      <div class="dsc-actions dsc-actions-end">
        <button class="btn btn-ghost" type="button" data-back>${t("signature.back")}</button>
        <a class="btn btn-primary" href="#/results">${t("signature.report.quickResults")}</a>
      </div>`;
  },
};

function reportCard(r) {
  const fa = getLang() === "fa";
  const sep = fa ? "، " : ", ";
  const notes = r.notes.map((n) => t(`notes.${n}`, n)).join(sep);
  const strengths = r.strengths.map((f) => t(`families.${f}.name`)).join(sep);
  const occasion = r.occasion.map((o) => t(`quiz.questions.occasion.options.${o}`)).join(sep);
  const season = t(`quiz.questions.season.options.${r.season}`);
  const time = t(`signature.report.time.${r.timeOfDay}`);
  const reason = t("signature.report.reason").replace("{family}", t(`families.${r.reasonFamily}.name`));
  return `
    <article class="dsc-rep-card">
      <div class="dsc-rep-head">
        <div class="dsc-rep-titles">
          <h3 class="dsc-rep-name latin">${r.name}</h3>
          <p class="dsc-rep-brand latin">${r.brand}</p>
        </div>
        <div class="dsc-rep-score">
          <span class="dsc-rep-pct latin">${toFaDigits(r.percent)}<small>%</small></span>
          <span class="dsc-rep-compat">${t("signature.report.compat")}</span>
        </div>
      </div>
      <p class="dsc-rep-reason">${reason}</p>
      <div class="dsc-rep-meta">
        <span><b>${t("signature.report.notes")}:</b> ${notes}</span>
        <span><b>${t("signature.report.strengths")}:</b> ${strengths}</span>
        <span><b>${t("perfume.occasion")}:</b> ${occasion}</span>
        <span><b>${t("perfume.season")}:</b> ${season}</span>
        <span><b>${t("signature.report.timeLabel")}:</b> ${time}</span>
      </div>
      <a class="btn btn-ghost dsc-rep-link" href="#/perfume/${r.id}">${t("results.viewDetails")}</a>
    </article>`;
}

/* --- per-step wiring ----------------------------------------------------- */
const STEP_WIRERS = {
  analyzing(ctx) {
    const msgs = t("signature.analyzing.messages") || [];
    const msgEl = ctx.view.querySelector("#dscMsg");
    const bar = ctx.view.querySelector("#dscBar");
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const total = reduce ? 400 : 3600;

    if (msgEl && msgs.length) msgEl.textContent = msgs[0];
    requestAnimationFrame(() => { if (bar) bar.style.width = "100%"; });

    if (!reduce && msgs.length > 1) {
      const per = total / msgs.length;
      for (let k = 1; k < msgs.length; k++) {
        ctx.timers.push(setTimeout(() => { if (msgEl) msgEl.textContent = msgs[k]; }, per * k));
      }
    }
    ctx.timers.push(setTimeout(() => { ctx.step = 1; paint(ctx); }, total + 250));
  },

  profile(ctx) {
    // animate the signature bars once painted
    requestAnimationFrame(() => {
      ctx.view.querySelectorAll(".dsc-dna-fill").forEach((f) => (f.style.width = `${f.dataset.v}%`));
    });
  },
};

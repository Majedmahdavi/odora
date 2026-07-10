import { t, getLang } from "../i18n/index.js";
import { getState, setState } from "../state/store.js";
import { navigate } from "../router.js";
import { recommend } from "../matching/index.js";
import { bottleIcon } from "../ui/icons.js";
import { toFaDigits } from "../utils/format.js";
import { buildShareLink, decodeState } from "../utils/share.js";
import { toast } from "../ui/toast.js";
import { applyTheme } from "../ui/theme.js";
import { buildScentSignature, topAxes } from "../signature/scentSignature.js";

/**
 * صفحه‌ی نتایج (Step 6)
 * Shows the top-5 matches with match percentages, a share button (encodes the
 * answers into the URL so the link reproduces the result), and "test again".
 * If opened via a shared link (?s=...), it renders that person's result and
 * themes the page to their chosen gender.
 */
export async function renderResults(view, params = {}) {
  const shared = Boolean(params.query?.s);
  let sourceState = null;

  if (shared) {
    sourceState = decodeState(params.query.s);
    if (sourceState) applyTheme(sourceState.gender);
  }

  if (!sourceState) {
    const st = getState();
    if (!st.gender) return navigate("/gender");
    if (!st.answers || !st.answers.families) return navigate("/quiz");
    sourceState = st;
  }

  view.innerHTML = `<section class="container results"><div class="results-loading">${t("results.loading")}</div></section>`;

  const { top, profile } = await recommend(sourceState);
  const signature = buildScentSignature(profile);
  view.innerHTML = buildHtml(top, shared, signature);
  wireActions(view, sourceState, shared);
}

/* ---------- markup ---------- */
function quickSummary(signature) {
  const sep = getLang() === "fa" ? "، " : ", ";
  const axes = topAxes(signature, 3).map((ax) => t(`signature.axes.${ax}`)).join(sep);
  return `<p class="results-quick">${t("signature.quick.summary").replace("{axes}", axes)}</p>`;
}

function signatureTeaser() {
  return `
    <section class="dsc-teaser">
      <span class="dsc-eyebrow">${t("signature.teaser.eyebrow")}</span>
      <h2 class="dsc-teaser-title">${t("signature.teaser.title")}</h2>
      <p class="dsc-teaser-text">${t("signature.teaser.text")}</p>
      <a class="btn btn-primary btn-lg" href="#/signature">${t("signature.teaser.cta")}</a>
    </section>`;
}

function buildHtml(top, shared, signature) {
  if (!top.length) {
    return `
      <section class="container page">
        <h1 class="section-title">${t("results.title")}</h1>
        <p class="muted">${t("results.empty")}</p>
        <div style="margin-top:1.6rem"><a class="btn btn-primary" href="#/gender">${t("home.startTest")}</a></div>
      </section>`;
  }

  const rows = top.slice(1).map((item, i) => resultRow(item, i + 2)).join("");

  return `
    <section class="container results">
      <div class="section-head">
        <h1 class="section-title">${t("results.title")}</h1>
        <p>${t("results.subtitle")}</p>
        ${quickSummary(signature)}
      </div>

      ${heroCard(top[0])}

      <div class="results-list">${rows}</div>

      ${shared ? "" : signatureTeaser()}

      <div class="results-actions">
        <button class="btn btn-primary" id="shareBtn" type="button">${t("results.share")}</button>
        <button class="btn btn-ghost" id="retakeBtn" type="button">${shared ? t("results.retakeShared") : t("results.retake")}</button>
      </div>

      ${shared ? `<p class="results-shared-note muted">${t("results.sharedNote")}</p>` : ""}
    </section>`;
}

function heroCard(item) {
  const p = item.perfume;
  return `
    <article class="result-hero">
      <span class="result-top-badge">${t("results.topBadge")}</span>
      <div class="result-hero-art">${bottleIcon("bottle-hero")}</div>
      <div class="result-hero-info">
        <div class="match-ring" style="--p:${item.percent}">
          <span class="ring-num latin">${toFaDigits(item.percent)}٪</span>
        </div>
        <h2 class="result-hero-name latin">${p.name}</h2>
        <p class="result-hero-brand latin">${p.brand}</p>
        <p class="match-text">${t("results.matchSuffix")}</p>
        <a class="btn btn-ghost" href="#/perfume/${p.id}">${t("results.viewDetails")}</a>
      </div>
    </article>`;
}

function resultRow(item, rank) {
  const p = item.perfume;
  return `
    <a class="result-row" href="#/perfume/${p.id}">
      <span class="result-rank latin">${toFaDigits(rank)}</span>
      <span class="result-row-art">${bottleIcon("bottle-row")}</span>
      <span class="result-row-info">
        <span class="result-row-name latin">${p.name}</span>
        <span class="result-row-brand latin">${p.brand}</span>
      </span>
      <span class="result-row-pct">
        <span class="pct-num latin">${toFaDigits(item.percent)}٪</span>
        <span class="pct-bar"><span style="width:${item.percent}%"></span></span>
      </span>
    </a>`;
}

/* ---------- interaction ---------- */
function wireActions(view, sourceState, shared) {
  view.querySelector("#shareBtn")?.addEventListener("click", async () => {
    const url = buildShareLink(sourceState);
    const data = { title: "Odora", text: t("results.shareText"), url };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(url);
      toast(t("results.shareCopied"));
    } catch {
      // user cancelled share, or clipboard blocked — show the link as fallback
      toast(url);
    }
  });

  view.querySelector("#retakeBtn")?.addEventListener("click", () => {
    if (shared) {
      navigate("/gender"); // a visitor starts their own test
    } else {
      setState({ answers: {} }); // keep gender/theme, retake the quiz
      navigate("/quiz");
    }
  });
}


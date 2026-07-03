import { t } from "../i18n/index.js";
import { getState, setState, resetProgress } from "../state/store.js";
import { buildShareLink } from "../utils/share.js";
import { navigate } from "../router.js";
import { toast } from "../ui/toast.js";
import { giftIcon } from "../ui/icons.js";

/**
 * تست هدیه (surprise gift test) — FREE version, no backend.
 * Flow:
 *   1. Sender (#/gift-test) creates a link carrying { n: name, e: email, m: message }.
 *   2. Recipient opens #/gtest?d=... → giftMode is armed → gender + quiz as usual.
 *   3. On finish, quiz routes to #/gift-done instead of results: the recipient
 *      only sees a thank-you (the result stays a surprise) and sends the
 *      encoded result link back to the sender (mailto / copy).
 * The paid tier + automatic e-mail delivery arrive with the backend phase.
 */

/* --- url-safe base64 (same trick as share.js / gift.js) ----------------- */
function encode(obj) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(obj))))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function decode(str) {
  if (!str) return null;
  try {
    const json = decodeURIComponent(escape(atob(str.replace(/-/g, "+").replace(/_/g, "/"))));
    const obj = JSON.parse(json);
    return obj && typeof obj === "object" ? obj : null;
  } catch {
    return null;
  }
}

/* ======================= sender: create the link ======================== */
export function renderGiftTestCreate(view) {
  const user = getState().user;

  view.innerHTML = `
    <section class="container gift-page">
      <div class="gift-card">
        <div class="gift-art">${giftIcon("icon-gift-lg")}</div>
        <h1 class="gift-title">${t("giftTest.createTitle")}</h1>
        <p class="gift-lead">${t("giftTest.createLead")}</p>

        <form class="contact-form gift-create-form" id="gtForm" novalidate>
          <div class="field">
            <label for="gtName">${t("giftTest.yourName")}</label>
            <input id="gtName" type="text" autocomplete="name" required value="${user?.name ?? ""}" />
          </div>
          <div class="field">
            <label for="gtEmail">${t("giftTest.yourEmail")}</label>
            <input id="gtEmail" type="email" autocomplete="email" value="${user?.email ?? ""}" />
          </div>
          <div class="field">
            <label for="gtMsg">${t("giftTest.message")}</label>
            <input id="gtMsg" type="text" />
          </div>
          <button class="btn btn-primary" type="submit">${t("giftTest.create")}</button>
        </form>

        <p class="muted account-note">${t("giftTest.freeNote")}</p>
      </div>
    </section>
  `;

  view.querySelector("#gtForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!e.target.checkValidity()) {
      e.target.reportValidity();
      return;
    }
    const payload = {
      n: view.querySelector("#gtName").value.trim(),
      e: view.querySelector("#gtEmail").value.trim(),
      m: view.querySelector("#gtMsg").value.trim(),
    };
    const link = `${location.origin}${location.pathname}#/gtest?d=${encode(payload)}`;
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      window.prompt(t("giftTest.create"), link); // clipboard blocked → manual copy
    }
    toast(t("giftTest.copied"));
  });
}

/* ==================== recipient: landing (arms the mode) ================ */
export function renderGiftTestLanding(view, params) {
  const payload = decode(params.query?.d);
  if (!payload) return navigate("/");

  const sender = payload.n || t("gift.someone");
  // arm gift mode + fresh answers, so the quiz ends on the thank-you page
  resetProgress();
  setState({ giftMode: { n: sender, e: payload.e || "" } });

  view.innerHTML = `
    <section class="container gift-page">
      <div class="gift-card">
        <div class="gift-art">${giftIcon("icon-gift-lg")}</div>
        <h1 class="gift-title">${t("giftTest.landTitle")}</h1>
        <p class="gift-lead">${t("giftTest.landLead").replace("{name}", sender)}</p>
        ${payload.m ? `<p class="gift-message">«${payload.m}»</p>` : ""}
        <p class="muted account-note">${t("giftTest.landNote")}</p>
        <div class="gift-actions">
          <a class="btn btn-primary btn-lg" href="#/gender">${t("giftTest.start")}</a>
        </div>
      </div>
    </section>
  `;
}

/* =============== recipient: thank-you (result stays hidden) ============= */
export function renderGiftTestDone(view) {
  const state = getState();
  const gift = state.giftMode;
  if (!gift || !state.gender || !Object.keys(state.answers).length) return navigate("/");

  // build the sender-only result link BEFORE wiping the local state
  const resultLink = buildShareLink(state);
  const sender = gift.n || t("gift.someone");
  const email = gift.e;

  // wipe: the recipient can no longer open #/results and spoil the surprise
  setState({ giftMode: null });
  resetProgress();

  const mailHref = email
    ? `mailto:${email}?subject=${encodeURIComponent(t("giftTest.emailSubject"))}&body=${encodeURIComponent(`${t("giftTest.emailBody")}\n\n${resultLink}`)}`
    : null;

  view.innerHTML = `
    <section class="container gift-page">
      <div class="gift-card">
        <h1 class="gift-title">${t("giftTest.doneTitle")}</h1>
        <p class="gift-lead">${t("giftTest.doneLead").replace("{name}", sender)}</p>
        <p class="gift-quote">${t("giftTest.doneQuote")}</p>

        <div class="gift-actions">
          ${mailHref ? `<a class="btn btn-primary" href="${mailHref}">${t("giftTest.doneSend").replace("{name}", sender)}</a>` : ""}
          <button class="btn ${mailHref ? "btn-ghost" : "btn-primary"}" id="gtCopyResult" type="button">
            ${t("giftTest.doneCopy").replace("{name}", sender)}
          </button>
        </div>

        <a class="gift-site latin" href="#/">Odora</a>
        <p class="muted">${t("brand.slogan")}</p>
      </div>
    </section>
  `;

  view.querySelector("#gtCopyResult").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(resultLink);
    } catch {
      window.prompt(t("giftTest.doneCopy").replace("{name}", sender), resultLink);
    }
    toast(t("giftTest.doneCopied").replace("{name}", sender));
  });
}

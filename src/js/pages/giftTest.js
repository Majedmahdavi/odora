import { t } from "../i18n/index.js";
import { getState, setState, resetProgress, addMyGift } from "../state/store.js";
import { navigate } from "../router.js";
import { toast } from "../ui/toast.js";
import { giftIcon } from "../ui/icons.js";

/**
 * تست هدیه (surprise gift test) — SERVER-backed version.
 * The gift lives on the Odora API (nginx-proxied /api on the VPS):
 *   sender (must have an account) → POST /api/gifts → one-time link #/gtest?g=<id>
 *   recipient → answers the quiz → result is POSTed to the server and the
 *   link burns (single use). The recipient NEVER sees the result — the
 *   sender reads it in their account panel (and by e-mail once SMTP is on).
 */

const API = "/api";

async function api(path, options) {
  const res = await fetch(API + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, body };
}

/* ======================= sender: create the link ======================== */
export function renderGiftTestCreate(view) {
  const user = getState().user;

  // the whole feature requires an account: results are tied to your panel
  if (!user) {
    view.innerHTML = `
      <section class="container gift-page">
        <div class="gift-card">
          <div class="gift-art">${giftIcon("icon-gift-lg")}</div>
          <h1 class="gift-title">${t("giftTest.needAccountTitle")}</h1>
          <p class="gift-lead">${t("giftTest.needAccountText")}</p>
          <div class="gift-actions">
            <a class="btn btn-primary" href="#/account">${t("giftTest.goAccount")}</a>
          </div>
        </div>
      </section>`;
    return;
  }

  view.innerHTML = `
    <section class="container gift-page">
      <div class="gift-card">
        <div class="gift-art">${giftIcon("icon-gift-lg")}</div>
        <h1 class="gift-title">${t("giftTest.createTitle")}</h1>
        <p class="gift-lead">${t("giftTest.createLead")}</p>

        <form class="contact-form gift-create-form" id="gtForm" novalidate>
          <div class="field">
            <label for="gtName">${t("giftTest.yourName")}</label>
            <input id="gtName" type="text" autocomplete="name" required value="${user.name ?? ""}" />
          </div>
          <div class="field">
            <label for="gtEmail">${t("giftTest.yourEmail")}</label>
            <input id="gtEmail" type="email" autocomplete="email" required value="${user.email ?? ""}" />
          </div>
          <div class="field">
            <label for="gtMsg">${t("giftTest.message")}</label>
            <input id="gtMsg" type="text" maxlength="280" />
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
    const btn = e.target.querySelector("button");
    btn.disabled = true;
    try {
      const { ok, body } = await api("/gifts", {
        method: "POST",
        body: JSON.stringify({
          senderName: view.querySelector("#gtName").value.trim(),
          senderEmail: view.querySelector("#gtEmail").value.trim(),
          message: view.querySelector("#gtMsg").value.trim(),
        }),
      });
      if (!ok) throw new Error("create-failed");

      addMyGift({ id: body.id, secret: body.secret, createdAt: Date.now() });
      const link = `${location.origin}${location.pathname}#/gtest?g=${body.id}`;
      try {
        await navigator.clipboard.writeText(link);
      } catch {
        window.prompt(t("giftTest.create"), link); // clipboard blocked → manual copy
      }
      toast(t("giftTest.copied"));
      e.target.reset();
    } catch {
      toast(t("giftTest.serverError"));
    } finally {
      btn.disabled = false;
    }
  });
}

/* ==================== recipient: landing (arms the mode) ================ */
export function renderGiftTestLanding(view, params) {
  const id = params.query?.g;
  if (!id) return navigate("/");

  view.innerHTML = `<section class="container gift-page"><div class="gift-card">
    <p class="gift-lead">${t("results.loading")}</p></div></section>`;

  api(`/gifts/${encodeURIComponent(id)}`)
    .then(({ status, body }) => {
      if (status === 404) return navigate("/");
      if (body.used) return usedView(view);

      const sender = body.senderName || t("gift.someone");
      // arm gift mode + fresh answers, so the quiz ends on the thank-you page
      resetProgress();
      setState({ giftMode: { id, n: sender } });

      view.innerHTML = `
        <section class="container gift-page">
          <div class="gift-card">
            <div class="gift-art">${giftIcon("icon-gift-lg")}</div>
            <h1 class="gift-title">${t("giftTest.landTitle")}</h1>
            <p class="gift-lead">${t("giftTest.landLead").replace("{name}", sender)}</p>
            ${body.message ? `<p class="gift-message">«${body.message}»</p>` : ""}
            <p class="muted account-note">${t("giftTest.landNote")}</p>
            <div class="gift-actions">
              <a class="btn btn-primary btn-lg" href="#/gender">${t("giftTest.start")}</a>
            </div>
          </div>
        </section>`;
    })
    .catch(() => errorView(view, () => renderGiftTestLanding(view, params)));
}

/* =============== recipient: submit + thank-you (result hidden) ========== */
export function renderGiftTestDone(view) {
  const state = getState();
  const gift = state.giftMode;
  if (!gift || !state.gender || !Object.keys(state.answers).length) return navigate("/");

  const payload = { gender: state.gender, answers: state.answers };

  view.innerHTML = `<section class="container gift-page"><div class="gift-card">
    <p class="gift-lead">${t("giftTest.sending")}</p></div></section>`;

  api(`/gifts/${encodeURIComponent(gift.id)}/result`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
    .then(({ status, ok }) => {
      if (ok || status === 409) {
        // answers leave this device for good — the surprise stays safe
        setState({ giftMode: null });
        resetProgress();
        if (status === 409) return usedView(view);
        thanksView(view, gift.n);
      } else {
        errorView(view, () => renderGiftTestDone(view)); // answers kept for retry
      }
    })
    .catch(() => errorView(view, () => renderGiftTestDone(view)));
}

/* --- small views --------------------------------------------------------- */
function thanksView(view, senderName) {
  view.innerHTML = `
    <section class="container gift-page">
      <div class="gift-card">
        <h1 class="gift-title">${t("giftTest.doneTitle")}</h1>
        <p class="gift-lead">${t("giftTest.doneLead").replace("{name}", senderName || t("gift.someone"))}</p>
        <p class="gift-quote">${t("giftTest.doneQuote")}</p>
        <a class="gift-site latin" href="#/">Odora</a>
        <p class="muted">${t("brand.slogan")}</p>
      </div>
    </section>`;
}

function usedView(view) {
  view.innerHTML = `
    <section class="container gift-page">
      <div class="gift-card">
        <div class="gift-art">${giftIcon("icon-gift-lg")}</div>
        <h1 class="gift-title">${t("giftTest.usedTitle")}</h1>
        <p class="gift-lead">${t("giftTest.usedText")}</p>
        <div class="gift-actions">
          <a class="btn btn-primary" href="#/">${t("common.backHome")}</a>
        </div>
      </div>
    </section>`;
}

function errorView(view, retry) {
  view.innerHTML = `
    <section class="container gift-page">
      <div class="gift-card">
        <h1 class="gift-title">${t("giftTest.serverErrorTitle")}</h1>
        <p class="gift-lead">${t("giftTest.serverError")}</p>
        <div class="gift-actions">
          <button class="btn btn-primary" id="gtRetry" type="button">${t("giftTest.retry")}</button>
        </div>
      </div>
    </section>`;
  view.querySelector("#gtRetry").addEventListener("click", retry);
}

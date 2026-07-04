import { t, getLang } from "../i18n/index.js";
import { getState, setState, syncFavorites } from "../state/store.js";
import { userIcon } from "../ui/icons.js";
import { toFaDigits } from "../utils/format.js";
import { toast } from "../ui/toast.js";

/**
 * حساب کاربری — REAL server accounts.
 * POST /api/auth/enter is login-OR-register in one step: existing email →
 * password check; new email → needs a name to register. The token is kept
 * in state.user and unlocks favorites sync + the gift history.
 */
export function renderAccount(view) {
  const { user } = getState();
  if (!user?.token) loginForm(view); // pre-backend local profiles sign in again
  else profile(view, user);
}

/* --- sign in | sign up (separate tabs) ------------------------------------ */
function loginForm(view, mode = "login") {
  const isLogin = mode === "login";

  view.innerHTML = `
    <section class="container info-page info-center account-page">
      <div class="account-avatar">${userIcon("icon-avatar")}</div>
      <h1 class="section-title">${isLogin ? t("account.loginTitle") : t("account.registerTitle")}</h1>
      <p class="muted account-note">${t("account.localNote")}</p>

      <div class="catalog-tabs auth-tabs" role="tablist">
        <button class="cat-tab ${isLogin ? "is-active" : ""}" type="button" data-mode="login"
          role="tab" aria-selected="${isLogin}">${t("account.tabLogin")}</button>
        <button class="cat-tab ${isLogin ? "" : "is-active"}" type="button" data-mode="register"
          role="tab" aria-selected="${!isLogin}">${t("account.tabRegister")}</button>
      </div>

      <form class="contact-form account-form" id="accountForm" novalidate>
        ${isLogin ? "" : `
        <div class="field">
          <label for="accName">${t("account.name")}</label>
          <input id="accName" type="text" autocomplete="name" required />
        </div>`}
        <div class="field">
          <label for="accEmail">${t("account.email")}</label>
          <input id="accEmail" type="email" autocomplete="email" required />
        </div>
        <div class="field">
          <label for="accPass">${t("account.password")}</label>
          <input id="accPass" type="password" autocomplete="${isLogin ? "current-password" : "new-password"}" required minlength="6" placeholder="${t("account.passwordHint")}" />
        </div>
        <button class="btn btn-primary" type="submit">${isLogin ? t("account.submitLogin") : t("account.submitRegister")}</button>
      </form>
    </section>
  `;

  view.querySelector(".auth-tabs").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-mode]");
    if (btn && btn.dataset.mode !== mode) loginForm(view, btn.dataset.mode);
  });

  view.querySelector("#accountForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!e.target.checkValidity()) {
      e.target.reportValidity();
      return;
    }
    const btn = e.target.querySelector("button[type=submit]");
    btn.disabled = true;
    try {
      const res = await fetch("/api/auth/enter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          name: view.querySelector("#accName")?.value.trim() ?? "",
          email: view.querySelector("#accEmail").value.trim(),
          password: view.querySelector("#accPass").value,
        }),
      });
      const body = await res.json().catch(() => ({}));

      if (res.status === 404) {
        toast(t("account.errNoAccount"));
      } else if (res.status === 409) {
        toast(t("account.errEmailExists"));
      } else if (res.status === 401) {
        toast(t("account.errBadPassword"));
      } else if (res.ok) {
        // merge device favorites with the account's ones, then sync back
        const local = getState().favorites;
        const merged = [...new Set([...(body.favorites || []), ...local])];
        setState({
          user: { token: body.token, name: body.name, email: body.email, since: body.since },
          favorites: merged,
        });
        if (merged.length !== (body.favorites || []).length) syncFavorites();
        renderAccount(view);
      } else {
        toast(t("account.errServer"));
      }
    } catch {
      toast(t("account.errServer"));
    } finally {
      btn.disabled = false;
    }
  });
}

/* --- profile ------------------------------------------------------------ */
function profile(view, user) {
  const { favorites, gender, answers } = getState();
  const hasResult = gender && Object.keys(answers).length > 0;
  const sinceDate = new Date(user.since).toLocaleDateString(
    getLang() === "fa" ? "fa-IR" : "en-US"
  );

  view.innerHTML = `
    <section class="container info-page info-center account-page">
      <div class="account-avatar">${userIcon("icon-avatar")}</div>
      <h1 class="section-title">${t("account.welcome").replace("{name}", user.name)}</h1>
      <p class="muted"><span class="latin">${user.email}</span></p>
      <p class="muted">${t("account.memberSince")} ${sinceDate}</p>

      <div class="account-links">
        <a class="btn btn-ghost" href="#/favorites">
          ${t("account.favCount").replace("{count}", toFaDigits(favorites.length))} — ${t("account.viewFavorites")}
        </a>
        ${
          hasResult
            ? `<a class="btn btn-ghost" href="#/results">${t("account.lastResult")}</a>`
            : `<span class="btn btn-ghost is-disabled">${t("account.noResult")}</span>`
        }
      </div>

      <div class="gift-history">
        <h2>${t("giftTest.historyTitle")} 🎁</h2>
        <div id="giftHistory"><p class="muted">${t("results.loading")}</p></div>
        <a class="btn btn-ghost" href="#/gift-test">${t("giftTest.historyCreate")}</a>
      </div>

      <p class="muted account-note">${t("account.localNote")}</p>
      <button class="btn btn-ghost account-logout" id="logoutBtn" type="button">${t("account.logout")}</button>
    </section>
  `;

  view.querySelector("#logoutBtn").addEventListener("click", () => {
    fetch("/api/auth/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${user.token}` },
    }).catch(() => {});
    setState({ user: null }); // favorites stay on the device
    renderAccount(view);
  });

  paintGiftHistory(view.querySelector("#giftHistory"), user);
}

/* --- gift-test history (account + legacy device links) ------------------- */
async function paintGiftHistory(box, user) {
  try {
    const collected = new Map();

    // gifts tied to the account (any device)
    const accRes = await fetch("/api/me/gifts", {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    if (accRes.ok) {
      (await accRes.json()).gifts.forEach((g) => collected.set(g.id, g));
    }

    // pre-account gifts created on this device
    const mine = getState().myGifts || [];
    if (mine.length) {
      const legRes = await fetch("/api/gifts/mine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: mine.map(({ id, secret }) => ({ id, secret })) }),
      });
      if (legRes.ok) {
        (await legRes.json()).gifts.forEach((g) => collected.set(g.id, g));
      }
    }

    const gifts = [...collected.values()].sort((a, b) => b.createdAt - a.createdAt);
    if (!gifts.length) {
      box.innerHTML = `<p class="muted">${t("giftTest.historyEmpty")}</p>`;
      return;
    }
    const locale = getLang() === "fa" ? "fa-IR" : "en-US";
    box.innerHTML = gifts
      .map((g) => {
        const date = new Date(g.createdAt * 1000).toLocaleDateString(locale);
        const done = g.usedAt != null;
        return `
          <div class="gift-row">
            <span class="gift-row-date">${date}</span>
            <span class="gift-row-status ${done ? "is-done" : ""}">
              ${done ? t("giftTest.historyDone") : t("giftTest.historyPending")}
            </span>
            ${done
              ? `<a class="btn btn-primary gift-row-view" href="${g.resultLink}">${t("giftTest.historyView")}</a>`
              : `<span class="muted gift-row-view">—</span>`}
          </div>`;
      })
      .join("");
  } catch {
    box.innerHTML = `<p class="muted">${t("giftTest.historyOffline")}</p>`;
  }
}

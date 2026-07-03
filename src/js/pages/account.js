import { t, getLang } from "../i18n/index.js";
import { getState, setState } from "../state/store.js";
import { userIcon } from "../ui/icons.js";
import { toFaDigits } from "../utils/format.js";

/**
 * حساب کاربری — LOCAL version.
 * The profile lives in the app store (localStorage) so it works with no
 * backend; swapping in a real auth API later only touches this page.
 */
export function renderAccount(view) {
  const { user } = getState();
  if (!user) loginForm(view);
  else profile(view, user);
}

/* --- sign in / sign up (one step, local) -------------------------------- */
function loginForm(view) {
  view.innerHTML = `
    <section class="container info-page info-center account-page">
      <div class="account-avatar">${userIcon("icon-avatar")}</div>
      <h1 class="section-title">${t("account.loginTitle")}</h1>
      <p class="muted account-note">${t("account.localNote")}</p>

      <form class="contact-form account-form" id="accountForm" novalidate>
        <div class="field">
          <label for="accName">${t("account.name")}</label>
          <input id="accName" type="text" autocomplete="name" required />
        </div>
        <div class="field">
          <label for="accEmail">${t("account.email")}</label>
          <input id="accEmail" type="email" autocomplete="email" required />
        </div>
        <button class="btn btn-primary" type="submit">${t("account.submit")}</button>
      </form>
    </section>
  `;

  view.querySelector("#accountForm").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!e.target.checkValidity()) {
      e.target.reportValidity();
      return;
    }
    setState({
      user: {
        name: view.querySelector("#accName").value.trim(),
        email: view.querySelector("#accEmail").value.trim(),
        since: Date.now(),
      },
    });
    renderAccount(view);
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

      <p class="muted account-note">${t("account.localNote")}</p>
      <button class="btn btn-ghost account-logout" id="logoutBtn" type="button">${t("account.logout")}</button>
    </section>
  `;

  view.querySelector("#logoutBtn").addEventListener("click", () => {
    setState({ user: null }); // favorites stay on the device
    renderAccount(view);
  });
}
